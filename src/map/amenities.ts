import { circleMarker, divIcon, layerGroup, marker, type Map as LeafletMap } from 'leaflet';
import { pickLocale, type Locale } from '../catalog';
import { icon } from '../ui/icons';
import { cssToken } from '../ui/motion';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
/** How far off the walking line a tap or toilet still counts, in meters. */
export const AMENITY_RADIUS_M = 150;

export type AmenityKind = 'water' | 'toilet';
export type Amenity = { id: number; kind: AmenityKind; lat: number; lng: number; tags: Record<string, string> };
type Line = readonly (readonly [number, number])[];

/** [south, west, north, east] around every walking line, padded by the radius. */
export function linesBounds(lines: readonly Line[], padM = AMENITY_RADIUS_M): [number, number, number, number] | null {
  let s = 90, w = 180, n = -90, e = -180;
  for (const line of lines) for (const [lat, lng] of line) {
    s = Math.min(s, lat); n = Math.max(n, lat); w = Math.min(w, lng); e = Math.max(e, lng);
  }
  if (s > n) return null;
  const dLat = padM / 111_320;
  const dLng = dLat / Math.cos(((s + n) / 2) * (Math.PI / 180));
  return [s - dLat, w - dLng, n + dLat, e + dLng];
}

export function amenityQuery([s, w, n, e]: readonly number[]): string {
  const box = [s, w, n, e].map((v) => v.toFixed(5)).join(',');
  return `[out:json][timeout:25];(node["amenity"="drinking_water"](${box});node["amenity"="toilets"](${box}););out;`;
}

/** Meters from a point to a segment, flat projection (fine at walking scale). */
function toSegment(p: readonly [number, number], a: readonly [number, number], b: readonly [number, number]): number {
  const k = Math.cos(p[0] * (Math.PI / 180)) * 111_320;
  const ax = a[1] * k, ay = a[0] * 111_320, bx = b[1] * k, by = b[0] * 111_320;
  const px = p[1] * k, py = p[0] * 111_320;
  const dx = bx - ax, dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// ponytail: O(points × vertices); a day's walk is a few thousand vertices, fine.
export function nearLines(points: readonly Amenity[], lines: readonly Line[], radiusM = AMENITY_RADIUS_M): Amenity[] {
  return points.filter((point) => {
    const p = [point.lat, point.lng] as const;
    return lines.some((line) => {
      if (line.length === 1) return toSegment(p, line[0], line[0]) <= radiusM;
      for (let i = 1; i < line.length; i++) if (toSegment(p, line[i - 1], line[i]) <= radiusM) return true;
      return false;
    });
  });
}

const cache = new Map<string, Promise<Amenity[]>>();

/** The public Overpass answers 429/504 under load; two retries, 4 s and 8 s apart. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function overpass(query: string, tries = 3): Promise<any> {
  for (let i = 0; ; i++) {
    const r = await fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (r.ok) return r.json();
    if (i + 1 >= tries || (r.status !== 429 && r.status !== 504)) throw new Error(String(r.status));
    await new Promise((done) => setTimeout(done, 4000 * 2 ** i));
  }
}

async function fetchAmenities(bounds: [number, number, number, number]): Promise<Amenity[]> {
  const query = amenityQuery(bounds);
  let hit = cache.get(query);
  if (!hit) {
    hit = overpass(query)
      .then((data: { elements?: { id: number; lat: number; lon: number; tags?: Record<string, string> }[] }) =>
        (data.elements ?? []).map((el) => ({
          id: el.id,
          kind: el.tags?.amenity === 'toilets' ? ('toilet' as const) : ('water' as const),
          lat: el.lat,
          lng: el.lon,
          tags: el.tags ?? {},
        })),
      );
    cache.set(query, hit);
    hit.catch(() => cache.delete(query));
  }
  return hit;
}

function label(point: Amenity, locale: Locale): string {
  const base =
    point.kind === 'toilet'
      ? pickLocale(locale, { en: 'Restroom', 'pt-BR': 'Banheiro' })
      : pickLocale(locale, { en: 'Drinking water', 'pt-BR': 'Água potável' });
  const fee =
    point.tags.fee === 'yes'
      ? pickLocale(locale, { en: ' · paid', 'pt-BR': ' · pago' })
      : point.tags.fee === 'no'
        ? pickLocale(locale, { en: ' · free', 'pt-BR': ' · grátis' })
        : '';
  return `${base}${fee}`;
}

/** Tiles of `TILE`° covering [s, w, n, e], so a pan refetches only new ground. */
export const TILE = 0.1;
export function tilesFor([s, w, n, e]: readonly number[]): [number, number, number, number][] {
  const out: [number, number, number, number][] = [];
  for (let y = Math.floor(s / TILE); y * TILE < n; y++)
    for (let x = Math.floor(w / TILE); x * TILE < e; x++)
      out.push([y * TILE, x * TILE, (y + 1) * TILE, (x + 1) * TILE]);
  return out;
}

/** Below this zoom the city view is too wide to ask Overpass for every tap. */
const MIN_ZOOM = 13;

/**
 * Every water tap or toilet in view, each kind toggled on its own. The ones near a
 * walking line get the badge; the rest stay small dots. Never part of the trip.
 */
export function mountAmenities(map: LeafletMap): {
  setWalks(lines: Line[]): void;
  setOn(kind: AmenityKind, on: boolean): void;
} {
  const group = layerGroup().addTo(map);
  const on: Record<AmenityKind, boolean> = { water: false, toilet: false };
  let walks: Line[] = [];
  let run = 0;

  const paint = async () => {
    const id = ++run;
    if ((!on.water && !on.toilet) || map.getZoom() < MIN_ZOOM) {
      group.clearLayers();
      return;
    }
    const view = map.getBounds();
    // One tile at a time: Overpass answers 429/504 to a burst. A failed tile is retried next move.
    const all: Amenity[] = [];
    for (const tile of tilesFor([view.getSouth(), view.getWest(), view.getNorth(), view.getEast()])) {
      try {
        all.push(...(await fetchAmenities(tile)));
      } catch {
        // keep the tiles that answered
      }
      if (id !== run) return;
    }
    if (id !== run) return;
    group.clearLayers();
    const shown = all.filter((point) => on[point.kind]);
    const near = new Set(nearLines(shown, walks).map((point) => point.id));
    const locale: Locale = document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
    const color = {
      water: cssToken('--color-water', '#0891b2'),
      toilet: cssToken('--color-restroom', '#7c3aed'),
    };
    for (const point of shown) {
      const text = label(point, locale);
      if (!near.has(point.id)) {
        circleMarker([point.lat, point.lng], {
          radius: 5,
          color: cssToken('--color-paper', '#ffffff'),
          weight: 1,
          fillColor: color[point.kind],
          fillOpacity: 0.7,
        })
          .bindTooltip(text, { direction: 'top', offset: [0, -4] })
          .addTo(group);
        continue;
      }
      const glyph = icon(point.kind === 'toilet' ? 'wc' : 'water_drop', { fill: true, size: 16 });
      marker([point.lat, point.lng], {
        icon: divIcon({
          className: 'tb-amenity-wrap',
          html: `<span class="tb-amenity is-${point.kind}">${glyph.outerHTML}</span>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
        keyboard: false,
        zIndexOffset: 500,
      })
        .bindTooltip(text, { direction: 'top', offset: [0, -10] })
        .addTo(group);
    }
  };

  map.on('moveend', () => void paint());
  return {
    setWalks(lines) {
      walks = lines;
      void paint();
    },
    setOn(kind, next) {
      on[kind] = next;
      void paint();
    },
  };
}

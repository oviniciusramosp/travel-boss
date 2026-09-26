import { divIcon, layerGroup, marker, type Map as LeafletMap } from 'leaflet';
import { pickLocale, type Locale } from '../catalog';
import { icon } from '../ui/icons';

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

async function fetchAmenities(bounds: [number, number, number, number]): Promise<Amenity[]> {
  const query = amenityQuery(bounds);
  let hit = cache.get(query);
  if (!hit) {
    hit = fetch(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
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

/** Water taps and toilets near the walking lines. Off by default; never part of the trip. */
export function mountAmenities(map: LeafletMap): { setWalks(lines: Line[]): void; setOn(on: boolean): void } {
  const group = layerGroup();
  let walks: Line[] = [];
  let on = false;
  let run = 0;

  const paint = async () => {
    const id = ++run;
    group.clearLayers();
    const bounds = on ? linesBounds(walks) : null;
    if (!bounds) return;
    let all: Amenity[];
    try {
      all = await fetchAmenities(bounds);
    } catch {
      return;
    }
    if (id !== run) return;
    const locale: Locale = document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
    for (const point of nearLines(all, walks)) {
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
        .bindTooltip(label(point, locale), { direction: 'top', offset: [0, -10] })
        .addTo(group);
    }
  };

  return {
    setWalks(lines) {
      walks = lines;
      if (on) void paint();
    },
    setOn(next) {
      on = next;
      if (on) group.addTo(map);
      else group.remove();
      void paint();
    },
  };
}

import { divIcon, layerGroup, marker, type Map as LeafletMap } from 'leaflet';
import { pickLocale, type Locale } from '../catalog';
import { icon } from '../ui/icons';
import { cameraMotion } from '../ui/motion';
import type { PackedAmenity } from './amenity-cells';
import { AMENITY_EVENT, AMENITY_ICON, amenityOn, type AmenityKind } from './amenity-state';

/** How far off the walking line a tap or toilet still counts, in meters. */
export const AMENITY_RADIUS_M = 150;

export type { AmenityKind };
export type Amenity = { id: number; kind: AmenityKind; lat: number; lng: number; tags: Record<string, string> };
type Line = readonly (readonly [number, number])[];

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

type Box = readonly [number, number, number, number];

export function boxesOverlap(a: Box, b: Box): boolean {
  return a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];
}

export function unpackAmenities(rows: readonly PackedAmenity[]): Amenity[] {
  return rows.map(([lat, lng, kind, fee], id): Amenity => ({
    id,
    kind: kind === 1 ? 'toilet' : 'water',
    lat,
    lng,
    tags: fee === 1 ? { fee: 'yes' } : fee === 2 ? { fee: 'no' } : ({} as Record<string, string>),
  }));
}

// Written by `npm run travel:amenities`; a city's file loads once, on first need.
let index: Promise<Record<string, Box>> | null = null;
const cities = new Map<string, Promise<Amenity[]>>();

function loadJson<T>(path: string): Promise<T> {
  return fetch(`${import.meta.env.BASE_URL}amenities/${path}`).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
  );
}

async function amenitiesIn(view: Box): Promise<Amenity[]> {
  index ??= loadJson<Record<string, Box>>('index.json').catch((error) => {
    index = null;
    throw error;
  });
  const slugs = Object.entries(await index)
    .filter(([, box]) => boxesOverlap(box, view))
    .map(([slug]) => slug);
  const lists = await Promise.all(
    slugs.map((slug) => {
      let hit = cities.get(slug);
      if (!hit) {
        hit = loadJson<PackedAmenity[]>(`${slug}.json`).then(unpackAmenities);
        cities.set(slug, hit);
        hit.catch(() => cities.delete(slug));
      }
      return hit;
    }),
  );
  return lists.flat();
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

/** Below this zoom the view holds too many taps for one DOM pin each. */
const MIN_ZOOM = 14;

/** Google Maps pin on the exact point, the reference for the tap or toilet. */
export function amenityMapsUrl(point: { lat: number; lng: number }): string {
  return `https://www.google.com/maps/search/?api=1&query=${point.lat},${point.lng}`;
}

/** The glyph is the pin, the way the tourist star replaces the circle. */
function amenityPin(point: Amenity, near: boolean, text: string) {
  const size = 28;
  const glyph = icon(AMENITY_ICON[point.kind], { fill: true }).outerHTML;
  const pin = marker([point.lat, point.lng], {
    icon: divIcon({
      className: 'tb-amenity-wrap',
      html: `<span class="tb-amenity is-${point.kind}${near ? ' is-near' : ''}">${glyph}</span>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      tooltipAnchor: [0, -8],
    }),
    keyboard: false,
    riseOnHover: true,
    zIndexOffset: near ? 400 : -400,
  });
  // Same tooltip as the place pins.
  pin.bindTooltip(text, { direction: 'top', opacity: 1, className: 'tb-pin-tip' });
  // Click opens the point in Google Maps; the camera stays put.
  pin.on('click', () => window.open(amenityMapsUrl(point), '_blank', 'noopener'));
  return pin;
}

/**
 * Every water tap or toilet in view, each kind switched on its own, drawn as their own glyph.
 * The ones near a walking line are bigger. Never part of the trip.
 */
export function mountAmenities(map: LeafletMap): { setWalks(lines: Line[]): void } {
  const group = layerGroup().addTo(map);
  let walks: Line[] = [];
  let run = 0;
  let debounce = 0;

  const paint = async () => {
    const id = ++run;
    if ((!amenityOn('water') && !amenityOn('toilet')) || Math.round(map.getZoom()) < MIN_ZOOM) {
      group.clearLayers();
      return;
    }
    const view = map.getBounds();
    let all: Amenity[];
    try {
      all = await amenitiesIn([view.getSouth(), view.getWest(), view.getNorth(), view.getEast()]);
    } catch {
      return;
    }
    if (id !== run) return;
    group.clearLayers();
    const shown = all.filter((point) => amenityOn(point.kind) && view.contains([point.lat, point.lng]));
    const near = new Set(nearLines(shown, walks).map((point) => point.id));
    const locale: Locale = document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
    for (const point of shown) {
      amenityPin(point, near.has(point.id), label(point, locale)).addTo(group);
    }
  };

  map.on('moveend', () => {
    window.clearTimeout(debounce);
    debounce = window.setTimeout(() => void paint(), 150);
  });
  let wasOn = 0;
  document.addEventListener(AMENITY_EVENT, () => {
    const count = Number(amenityOn('water')) + Number(amenityOn('toilet'));
    const switchedOn = count > wasOn;
    wasOn = count;
    // Switching on from the city view would show nothing: step in to where the pins draw.
    if (switchedOn && Math.round(map.getZoom()) < MIN_ZOOM) map.setZoom(MIN_ZOOM, cameraMotion());
    else void paint();
  });
  return {
    setWalks(lines) {
      walks = lines;
      void paint();
    },
  };
}

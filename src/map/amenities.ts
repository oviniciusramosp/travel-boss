import { divIcon, layerGroup, marker, type Map as LeafletMap, type Marker } from 'leaflet';
import { pickLocale, type Locale } from '../catalog';
import { icon } from '../ui/icons';
import { cameraMotion } from '../ui/motion';
import type { PackedAmenity } from './amenity-cells';
import { AMENITY_EVENT, AMENITY_ICON, amenityOn, type AmenityKind } from './amenity-state';
import { indexWalks, nearbyAmenities, neededAmenityCells, toSegment, type Box, type Line, type Point } from './amenity-proximity';
import { amenityCellBox } from './amenity-cells';
export { AMENITY_RADIUS_M, boxesOverlap, nearLines } from './amenity-proximity';

export type { AmenityKind };
export type Amenity = { id: number; kind: AmenityKind; lat: number; lng: number; tags: Record<string, string> };

export function unpackAmenities(rows: readonly PackedAmenity[]): Amenity[] {
  return rows.map(([lat, lng, kind, fee], id): Amenity => ({
    id,
    kind: kind === 1 ? 'toilet' : 'water',
    lat,
    lng,
    tags: fee === 1 ? { fee: 'yes' } : fee === 2 ? { fee: 'no' } : ({} as Record<string, string>),
  }));
}

// Written by `npm run travel:amenities`; bounded cache shared across route/city changes.
let index: Promise<Record<string, Box>> | null = null;
const cells = new Map<string, Promise<Amenity[]>>();
const MAX_CACHED_CELLS = 64;

function loadJson<T>(path: string): Promise<T> {
  return fetch(`${import.meta.env.BASE_URL}amenities/${path}`).then((r) =>
    r.ok ? r.json() : Promise.reject(new Error(String(r.status))),
  );
}

async function amenitiesIn(keys: string[]): Promise<Amenity[]> {
  const lists = await Promise.allSettled(
    keys.map((key) => {
      let hit = cells.get(key);
      if (!hit) {
        hit = loadJson<PackedAmenity[]>(`cells/${key}.json`).then(unpackAmenities);
        hit.catch(() => { if (cells.get(key) === hit) cells.delete(key); });
      }
      cells.delete(key);
      cells.set(key, hit);
      if (cells.size > MAX_CACHED_CELLS) cells.delete(cells.keys().next().value!);
      return hit;
    }),
  );
  return lists.flatMap(list => list.status === 'fulfilled' ? list.value : []);
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
 * Only nearby services in view, capped per kind. Existing pins survive GPS/route updates.
 */
export function mountAmenities(map: LeafletMap): { setWalks(lines: Line[]): void; setLocation(point: Point | null): void } {
  const group = layerGroup().addTo(map);
  const pins = new Map<string, { pin: Marker; signature: string }>();
  let walks = indexWalks([]);
  let location: Point | null = null;
  let run = 0;
  let debounce = 0;
  let disposed = false;
  const clear = () => { group.clearLayers(); pins.clear(); };

  const paint = async () => {
    const id = run;
    if ((!amenityOn('water') && !amenityOn('toilet')) || Math.round(map.getZoom()) < MIN_ZOOM) {
      clear();
      return;
    }
    const view = map.getBounds();
    const center: Point = [map.getCenter().lat, map.getCenter().lng];
    const focus = location ?? (walks.size ? null : center);
    let all: Amenity[];
    try {
      index ??= loadJson<Record<string, Box>>('cells.json').catch((error) => { index = null; throw error; });
      const catalog = await index;
      if (id !== run || disposed) return;
      const keys = neededAmenityCells(catalog, [view.getSouth(), view.getWest(), view.getNorth(), view.getEast()], walks, focus)
        .sort((a, b) => {
          const distance = (key: string) => { const [s, w, n, e] = amenityCellBox(key); return toSegment([(s + n) / 2, (w + e) / 2], center, center); };
          return distance(a) - distance(b);
        }).slice(0, 24);
      all = await amenitiesIn(keys);
    } catch {
      return;
    }
    if (id !== run || disposed) return;
    const shown = nearbyAmenities(all.filter(point => amenityOn(point.kind) && view.contains([point.lat, point.lng])), walks, focus, center);
    const locale: Locale = document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
    const keep = new Set<string>();
    for (const { point, near } of shown) {
      const key = `${point.lat},${point.lng},${point.kind}`, text = label(point, locale), signature = `${near}|${text}`;
      keep.add(key);
      if (pins.get(key)?.signature === signature) continue;
      const previous = pins.get(key);
      if (previous) group.removeLayer(previous.pin);
      pins.set(key, { pin: amenityPin(point, near, text).addTo(group), signature });
    }
    for (const [key, { pin }] of pins) if (!keep.has(key)) {
      group.removeLayer(pin);
      pins.delete(key);
    }
  };

  const schedule = () => {
    if (disposed) return;
    run += 1;
    window.clearTimeout(debounce);
    if (!amenityOn('water') && !amenityOn('toilet')) { clear(); return; }
    debounce = window.setTimeout(() => void paint(), 150);
  };
  map.on('moveend', schedule);
  let wasOn = Number(amenityOn('water')) + Number(amenityOn('toilet'));
  const onToggle = () => {
    const count = Number(amenityOn('water')) + Number(amenityOn('toilet'));
    const switchedOn = count > wasOn;
    wasOn = count;
    schedule();
    // Switching on from the city view would show nothing: step in to where the pins draw.
    if (switchedOn && Math.round(map.getZoom()) < MIN_ZOOM) map.setZoom(MIN_ZOOM, cameraMotion());
  };
  document.addEventListener(AMENITY_EVENT, onToggle);
  const lang = new MutationObserver(schedule);
  lang.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  map.on('unload', () => {
    disposed = true; run += 1;
    window.clearTimeout(debounce);
    document.removeEventListener(AMENITY_EVENT, onToggle);
    map.off('moveend', schedule);
    lang.disconnect();
    clear();
  });
  schedule();
  return {
    setWalks(lines) {
      walks = indexWalks(lines);
      schedule();
    },
    setLocation(point) {
      if (location && point && toSegment(point, location, location) < 25) return;
      location = point;
      schedule();
    },
  };
}

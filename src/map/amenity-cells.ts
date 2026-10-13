/** ~2 km cells: each place's cell and its 8 neighbours are fetched, so walks between places are covered. */
export const CELL = 0.02;

export type Cell = [number, number, number, number];

export function amenityCells(places: readonly { lat?: number; lng?: number }[]): Cell[] {
  const keys = new Set<string>();
  for (const place of places) {
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) continue;
    const y = Math.floor(place.lat! / CELL);
    const x = Math.floor(place.lng! / CELL);
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keys.add(`${y + dy},${x + dx}`);
  }
  return [...keys].map((key) => {
    const [y, x] = key.split(',').map(Number);
    return [y * CELL, x * CELL, (y + 1) * CELL, (x + 1) * CELL];
  });
}

/** [lat, lng, kind (0 water · 1 toilet), fee (0 unknown · 1 paid · 2 free)] */
export type PackedAmenity = [number, number, 0 | 1, 0 | 1 | 2];

export function amenityCellKey(lat: number, lng: number): string {
  return `${Math.floor(lat / CELL)}_${Math.floor(lng / CELL)}`;
}

export function amenityCellBox(key: string): Cell {
  const [y, x] = key.split('_').map(Number);
  return [y * CELL, x * CELL, (y + 1) * CELL, (x + 1) * CELL];
}

export function packAmenities(
  elements: readonly { lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[],
): PackedAmenity[] {
  return elements.flatMap((el): PackedAmenity[] => {
    const tags = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || /^(private|no|customers|permit)$/.test(tags.access ?? '') ||
      ['disused', 'abandoned', 'demolished'].some(key => tags[key] === 'yes')) return [];
    const toilet = tags.amenity === 'toilets';
    if (!toilet && (tags.drinking_water === 'no' || (tags.amenity !== 'drinking_water' && tags.drinking_water !== 'yes') ||
      (tags.fee != null && tags.fee !== 'no'))) return [];
    return [[Number(lat!.toFixed(5)), Number(lng!.toFixed(5)), toilet ? 1 : 0,
      tags.fee === 'yes' ? 1 : tags.fee === 'no' || !toilet ? 2 : 0]];
  });
}

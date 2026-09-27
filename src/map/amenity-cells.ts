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

export function packAmenities(
  elements: readonly { lat: number; lon: number; tags?: Record<string, string> }[],
): PackedAmenity[] {
  return elements.map((el) => [
    Number(el.lat.toFixed(5)),
    Number(el.lon.toFixed(5)),
    el.tags?.amenity === 'toilets' ? 1 : 0,
    el.tags?.fee === 'yes' ? 1 : el.tags?.fee === 'no' ? 2 : 0,
  ]);
}

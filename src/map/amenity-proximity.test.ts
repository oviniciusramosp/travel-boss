import { describe, expect, it } from 'vitest';
import { amenityCellBox, amenityCellKey } from './amenity-cells';
import { indexWalks, nearLines, nearbyAmenities, neededAmenityCells, MAX_AMENITIES_PER_KIND } from './amenity-proximity';
import type { Amenity } from './amenities';

const at = (id: number, lat: number, lng: number, kind: Amenity['kind'] = 'water'): Amenity => ({ id, lat, lng, kind, tags: {} });

describe('amenity proximity', () => {
  it('finds a segment middle and nearby points across tile boundaries', () => {
    const points = [at(1, 45.4405, 10.981), at(2, 45.4395, 10.982), at(3, 45.445, 10.982)];
    expect(nearLines(points, [[[45.44, 10.96], [45.44, 11.02]]]).map(p => p.id)).toEqual([1, 2]);
    expect(nearLines(points, [[], [[45.44, 10.981]]]).map(p => p.id)).toEqual([1, 2]);
  });

  it('shows the union of route and GPS, excludes far and paid water', () => {
    const walks = indexWalks([[[41.9, 12.49], [41.9, 12.5]]]);
    const points = [at(1, 41.9, 12.495), at(2, 41.92, 12.51), at(3, 41.94, 12.51),
      { ...at(4, 41.92, 12.51), tags: { fee: 'yes' } }];
    const shown = nearbyAmenities(points, walks, [41.92, 12.51], [41.92, 12.51]);
    expect(shown.map(p => p.point.id)).toEqual([2, 1]);
    expect(shown.map(p => p.near)).toEqual([false, true]);
    expect(nearbyAmenities(points, walks, null, [41.92, 12.51]).map(p => p.point.id)).toEqual([1]);
  });

  it('caps each kind independently and prioritizes the closest points', () => {
    const points = Array.from({ length: 200 }, (_, i) => at(i, 38.715 + i * 0.00001, -9.14, i % 2 ? 'toilet' : 'water')).reverse();
    const shown = nearbyAmenities(points, indexWalks([]), [38.715, -9.14], [38.715, -9.14]);
    expect(shown).toHaveLength(2 * MAX_AMENITIES_PER_KIND);
    expect(shown[0].point.id).toBe(0);
    expect(shown.filter(p => p.point.kind === 'toilet')).toHaveLength(MAX_AMENITIES_PER_KIND);
  });

  it('loads only visible tiles of the corridor or GPS vicinity', () => {
    const keys = [[45.44, 10.98], [45.44, 11.3], [38.715, -9.14]].map(([lat, lng]) => amenityCellKey(lat, lng));
    const index = Object.fromEntries(keys.map(key => [key, amenityCellBox(key)]));
    const view = [38, -10, 46, 12] as const;
    expect(neededAmenityCells(index, view, indexWalks([[[45.44, 10.98]]]), [38.715, -9.14])).toEqual([keys[0], keys[2]]);
    expect(neededAmenityCells(index, [38, -10, 39, -8], indexWalks([[[45.44, 10.98]]]), null)).toEqual([]);
  });
});

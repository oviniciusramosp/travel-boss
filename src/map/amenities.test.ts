import { describe, expect, it, vi } from 'vitest';
import { amenityCells, packAmenities } from './amenity-cells';
import { boxesOverlap, nearLines, unpackAmenities, type Amenity } from './amenities';

vi.mock('leaflet', () => ({}));

const at = (id: number, lat: number, lng: number): Amenity => ({ id, kind: 'water', lat, lng, tags: {} });

describe('amenities', () => {
  const walk = [[48.8584, 2.2945], [48.8584, 2.3045]] as const; // ~730 m east-west

  it('keeps points within the radius of any segment, drops the rest', () => {
    const near = at(1, 48.8594, 2.2995); // ~110 m north of the middle
    const far = at(2, 48.8614, 2.2995); // ~330 m north
    const past = at(3, 48.8584, 2.3085); // ~290 m beyond the end
    expect(nearLines([near, far, past], [walk]).map((p) => p.id)).toEqual([1]);
  });

  it('fetches the 3×3 cells around each place, once per cell', () => {
    const cells = amenityCells([{ lat: 48.861, lng: 2.335 }, { lat: 48.862, lng: 2.336 }, {}]);
    expect(cells).toHaveLength(9);
    expect(cells.some(([s, w, n, e]) => s <= 48.861 && n > 48.861 && w <= 2.335 && e > 2.335)).toBe(true);
  });

  it('packs and unpacks kind and fee', () => {
    const rows = packAmenities([
      { lat: 48.1234567, lon: 2.1, tags: { amenity: 'toilets', fee: 'no' } },
      { lat: 48.2, lon: 2.2, tags: { amenity: 'drinking_water' } },
    ]);
    expect(rows[0]).toEqual([48.12346, 2.1, 1, 2]);
    const [toilet, water] = unpackAmenities(rows);
    expect(toilet.kind).toBe('toilet');
    expect(toilet.tags.fee).toBe('no');
    expect(water.kind).toBe('water');
  });

  it('matches a city to the view by overlap', () => {
    expect(boxesOverlap([48.7, 1.96, 49.04, 2.82], [48.85, 2.3, 48.87, 2.34])).toBe(true);
    expect(boxesOverlap([48.7, 1.96, 49.04, 2.82], [41.8, 12.4, 41.9, 12.5])).toBe(false);
  });
});

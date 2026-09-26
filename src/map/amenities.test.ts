import { describe, expect, it, vi } from 'vitest';
import { amenityQuery, linesBounds, nearLines, type Amenity } from './amenities';

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

  it('pads the bounds and builds the query', () => {
    const box = linesBounds([walk])!;
    expect(box[0]).toBeLessThan(48.8584);
    expect(box[3]).toBeGreaterThan(2.3045);
    expect(linesBounds([])).toBeNull();
    expect(amenityQuery(box)).toContain('node["amenity"="toilets"]');
  });
});

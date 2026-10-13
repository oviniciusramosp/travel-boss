import { describe, expect, it } from 'vitest';
import { amenityCellBox, amenityCellKey, type PackedAmenity } from './amenity-cells';

const files = import.meta.glob('../../public/amenities/**/*.json', { eager: true, import: 'default' });
const read = <T>(name: string): T => files[`../../public/amenities/${name}.json`] as T;

describe('published amenity coverage', () => {
  it.each(['milao', 'veneza', 'verona', 'la-spezia', 'roma', 'lisboa', 'porto'])('%s has potable free water and toilets in the lazy tiles', slug => {
    const rows = read<PackedAmenity[]>(slug);
    expect(rows.some(row => row[2] === 0)).toBe(true);
    expect(rows.some(row => row[2] === 1)).toBe(true);
    expect(rows.filter(row => row[2] === 0).every(row => row[3] === 2)).toBe(true);
    const index = read<Record<string, number[]>>('cells');
    const keys = new Set(rows.map(row => amenityCellKey(row[0], row[1])));
    for (const key of keys) {
      expect(index[key]).toEqual(amenityCellBox(key));
      const tile = read<PackedAmenity[]>(`cells/${key}`);
      expect(tile.every(row => amenityCellKey(row[0], row[1]) === key)).toBe(true);
      expect(tile.length).toBe(new Set(tile.map(row => `${row[0]},${row[1]},${row[2]}`)).size);
      for (const row of rows.filter(row => amenityCellKey(row[0], row[1]) === key)) {
        const found = tile.find(point => point[0] === row[0] && point[1] === row[1] && point[2] === row[2]);
        expect(found).toBeDefined();
        if (row[3] !== 0) expect(found![3]).not.toBe(0);
        if (row[3] === 1) expect(found![3]).toBe(1);
      }
    }
  });
});

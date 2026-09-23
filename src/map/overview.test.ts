import { describe, expect, it } from 'vitest';
import { greatCircle, overviewArcs } from './overview';

describe('greatCircle', () => {
  it('keeps the ends and bends toward the pole', () => {
    const paris: [number, number] = [48.8566, 2.3522];
    const rome: [number, number] = [41.9028, 12.4964];
    const path = greatCircle(paris, rome, 16);
    expect(path[0]).toEqual(paris);
    expect(path[path.length - 1]).toEqual(rome);
    expect(path).toHaveLength(17);
    const mid = path[8]!;
    expect(mid[0]).toBeGreaterThan((paris[0] + rome[0]) / 2);
    expect(mid[1]).toBeGreaterThan(paris[1]);
    expect(mid[1]).toBeLessThan(rome[1]);
  });

  it('collapses a repeated point to the two ends', () => {
    expect(greatCircle([10, 20], [10, 20])).toEqual([
      [10, 20],
      [10, 20],
    ]);
  });
});

describe('overviewArcs', () => {
  it('connects cities in order and keeps the departure via on the arc', () => {
    const arcs = overviewArcs([
      { id: 'paris', label: 'Paris', lat: 48.86, lng: 2.35, via: 'trem · 7h' },
      { id: 'milao', label: 'Milão', lat: 45.48, lng: 9.19 },
      { id: 'roma', label: 'Roma', lat: 41.89, lng: 12.49, via: 'não entra' },
    ]);
    expect(arcs.map((arc) => [arc.fromId, arc.toId])).toEqual([
      ['paris', 'milao'],
      ['milao', 'roma'],
    ]);
    expect(arcs[0]?.label).toBe('Paris → Milão · trem · 7h');
    expect(arcs[1]?.label).toBe('Milão → Roma');
    expect(arcs[0]?.latlngs[0]).toEqual([48.86, 2.35]);
    expect(arcs[0]?.latlngs.at(-1)).toEqual([45.48, 9.19]);
  });
});

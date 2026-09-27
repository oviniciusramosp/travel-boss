import { describe, expect, it } from 'vitest';
import { formatWalk, polylineMeters, walkedMeters } from './walk-distance';

describe('polylineMeters', () => {
  it('measures one degree of latitude as ~111 km', () => {
    expect(polylineMeters([[48, 2], [49, 2]])).toBeCloseTo(111_195, -3);
  });
  it('adds every leg and ignores a lone point', () => {
    const one = polylineMeters([[48.8584, 2.2945], [48.8616, 2.2876]]);
    const two = polylineMeters([[48.8584, 2.2945], [48.8616, 2.2876], [48.8584, 2.2945]]);
    expect(two).toBeCloseTo(one * 2, 6);
    expect(polylineMeters([[48.8584, 2.2945]])).toBe(0);
  });
});

describe('walkedMeters', () => {
  it('counts walk segments only', () => {
    const walk = { mode: 'walk', latlngs: [[48, 2], [48.01, 2]] as [number, number][] };
    const ride = { mode: 'transit', latlngs: [[48, 2], [49, 2]] as [number, number][] };
    expect(walkedMeters([walk, ride, walk])).toBeCloseTo(polylineMeters(walk.latlngs) * 2, 6);
    expect(walkedMeters([])).toBe(0);
  });
});

describe('formatWalk', () => {
  it('rounds metres to 50 under a kilometre', () => {
    expect(formatWalk(0, 'pt-BR')).toBe('50 m');
    expect(formatWalk(812, 'en')).toBe('800 m');
    expect(formatWalk(940, 'en')).toBe('950 m');
  });
  it('shows one decimal up to ten kilometres, in the locale', () => {
    expect(formatWalk(4_240, 'pt-BR')).toBe('4,2 km');
    expect(formatWalk(4_240, 'en')).toBe('4.2 km');
    expect(formatWalk(9_960, 'en')).toBe('10 km');
    expect(formatWalk(12_400, 'pt-BR')).toBe('12 km');
  });
});

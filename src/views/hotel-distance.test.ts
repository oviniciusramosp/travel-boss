import { describe, expect, it } from 'vitest';
import { directionHref, formatMetres, walkStops } from './hotel-distance';

describe('hotel distances', () => {
  it('formats metres, then kilometres', () => {
    expect(formatMetres('pt-BR', 850)).toBe('850 m');
    expect(formatMetres('en', 1500)).toBe('1.5 km');
  });

  it('drops incomplete walks and sorts by minutes', () => {
    expect(
      walkStops([
        { id: 'b', name: { en: 'B', 'pt-BR': 'B' }, lat: 1, lng: 2, minutes: 12, distanceM: 900 },
        { id: 'bad', name: { en: 'X' }, minutes: 1 },
        { id: 'a', name: { en: 'A', 'pt-BR': 'A' }, lat: 1, lng: 2, minutes: 4, distanceM: 300 },
      ]).map((stop) => stop.id),
    ).toEqual(['a', 'b']);
  });

  it('builds walking and transit links from the hotel', () => {
    const href = directionHref({ lat: 48.85, lng: 2.35 }, { lat: 48.86, lng: 2.34 }, 'walk');
    expect(href).toContain('travelmode=walking');
    expect(decodeURIComponent(href ?? '')).toContain('48.85,2.35');
    expect(directionHref({ lat: 1, lng: 2 }, { lat: 3, lng: 4 }, 'transit')).toContain('travelmode=transit');
  });
});
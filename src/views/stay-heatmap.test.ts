import { describe, expect, it } from 'vitest';
import { travelCities } from '../catalog';
import { hasStayHeat } from '../data/travel-stay-heatmap';
import { cityHasStayHeat, usableStayDates } from './stay-heatmap';

describe('stay heat cities', () => {
  it('matches the cities that actually have zones', () => {
    for (const city of travelCities) {
      expect(cityHasStayHeat(city.slug)).toBe(hasStayHeat(city.slug));
    }
    expect(cityHasStayHeat('paris')).toBe(false);
  });

  it('keeps a real stay range and drops an inverted one', () => {
    expect(usableStayDates({ checkin: '2026-04-02', checkout: '2026-04-06' })).toEqual({
      checkin: '2026-04-02',
      checkout: '2026-04-06',
    });
    expect(usableStayDates({ checkin: '2026-04-06', checkout: '2026-04-02' })).toBeNull();
    expect(usableStayDates(null)).toBeNull();
  });
});

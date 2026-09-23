import { describe, expect, it } from 'vitest';
import { travelCities } from '../catalog';
import { hasStayHeat } from '../data/travel-stay-heatmap';
import { cityHasStayHeat } from './stay-heatmap';

describe('stay heat cities', () => {
  it('matches the cities that actually have zones', () => {
    for (const city of travelCities) {
      expect(cityHasStayHeat(city.slug)).toBe(hasStayHeat(city.slug));
    }
    expect(cityHasStayHeat('paris')).toBe(false);
  });
});

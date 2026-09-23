import { describe, expect, it } from 'vitest';
import { cityHash } from './links';

describe('cityHash', () => {
  it('builds the city, the itinerary day and the hotel dates', () => {
    expect(cityHash('paris', 'places')).toBe('#/city/paris/places');
    expect(cityHash('paris', 'itinerary', { day: 2 })).toBe('#/city/paris/itinerary?day=2');
    expect(cityHash('paris', 'hotels', { in: '2026-04-02', out: '2026-04-06' })).toBe(
      '#/city/paris/hotels?in=2026-04-02&out=2026-04-06',
    );
  });

  it('encodes the slug and drops a day that is not positive', () => {
    expect(cityHash('são paulo', 'places')).toBe(`#/city/${encodeURIComponent('são paulo')}/places`);
    expect(cityHash('paris', 'itinerary', { day: 0 })).toBe('#/city/paris/itinerary');
  });
});

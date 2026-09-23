import { describe, expect, it } from 'vitest';
import {
  formatHash,
  navigationMode,
  parseHash,
  sameRoute,
  type Route,
} from './router';

const paris: Route = { kind: 'city', slug: 'paris', tab: 'places' };

describe('parseHash', () => {
  it('reads a trip and a city with place and day', () => {
    expect(parseHash('#/trip/europa')).toEqual({ kind: 'trip', id: 'europa' });
    expect(parseHash('#/city/paris/itinerary?place=par-eiffel&day=2')).toEqual({
      kind: 'city',
      slug: 'paris',
      tab: 'itinerary',
      place: 'par-eiffel',
      day: 2,
    });
  });

  it('drops an empty place and a day that is not a positive integer', () => {
    expect(parseHash('#/city/paris/hotels?place=&day=0')).toEqual({
      kind: 'city',
      slug: 'paris',
      tab: 'hotels',
    });
    expect(parseHash('#/city/paris/places?day=foo')).toEqual(paris);
  });

  it('rejects a hash that is not a trip or a city tab', () => {
    expect(parseHash('')).toBeNull();
    expect(parseHash('#/city/paris')).toBeNull();
    expect(parseHash('#/city/paris/map')).toBeNull();
    expect(parseHash('#/trip')).toBeNull();
    expect(parseHash('#/nope')).toBeNull();
  });
});

describe('formatHash', () => {
  it('round-trips a route and keeps the query stable', () => {
    const route: Route = {
      kind: 'city',
      slug: 'são paulo',
      tab: 'places',
      place: 'par-eiffel',
      day: 3,
    };
    expect(parseHash(formatHash(route))).toEqual(route);
    expect(formatHash(route)).toBe(
      `#/city/${encodeURIComponent('são paulo')}/places?place=par-eiffel&day=3`,
    );
    expect(formatHash({ kind: 'trip', id: 'europa' })).toBe('#/trip/europa');
  });
});

describe('navigationMode', () => {
  it('pushes a new view and replaces tab, place or day', () => {
    expect(navigationMode(null, paris)).toBe('push');
    expect(navigationMode(paris, { kind: 'city', slug: 'roma', tab: 'places' })).toBe('push');
    expect(navigationMode(paris, { kind: 'trip', id: 'europa' })).toBe('push');
    expect(navigationMode({ kind: 'trip', id: 'a' }, { kind: 'trip', id: 'b' })).toBe('push');
    expect(navigationMode(paris, { ...paris, tab: 'hotels' })).toBe('replace');
    expect(navigationMode(paris, { ...paris, place: 'par-eiffel' })).toBe('replace');
    expect(navigationMode(paris, { ...paris, day: 2 })).toBe('replace');
    expect(navigationMode({ kind: 'trip', id: 'europa' }, { kind: 'trip', id: 'europa' })).toBe(
      'replace',
    );
  });

  it('treats the same canonical hash as the same route', () => {
    expect(sameRoute(paris, { kind: 'city', slug: 'paris', tab: 'places' })).toBe(true);
    expect(sameRoute(paris, { ...paris, day: 2 })).toBe(false);
    expect(sameRoute(null, null)).toBe(true);
  });
});

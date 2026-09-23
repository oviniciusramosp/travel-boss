import { describe, expect, it } from 'vitest';
import type { ItineraryDay, ItineraryStop } from '../catalog';
import { primaryDayRoute, searchLeavesView } from './places';

const day: ItineraryDay = {
  id: 'd',
  day: 1,
  title: { en: 'Day', 'pt-BR': 'Dia' },
  stops: [],
};

function stop(placeId: string, optional?: boolean): ItineraryStop {
  return optional ? { placeId, optional: true } : { placeId };
}

describe('searchLeavesView', () => {
  const inside = () => true;
  const outside = (lat: number) => lat === 1;

  it('does not refit when every result is already in view', () => {
    expect(searchLeavesView([{ lat: 1, lng: 2 }], inside)).toBe(false);
    expect(searchLeavesView([], inside)).toBe(false);
  });

  it('refits when any result leaves the view', () => {
    expect(
      searchLeavesView(
        [
          { lat: 1, lng: 2 },
          { lat: 3, lng: 4 },
        ],
        outside,
      ),
    ).toBe(true);
  });
});

describe('primaryDayRoute', () => {
  it('keeps optional stops out of the ids and the fallback legs', () => {
    const stops = [stop('a'), stop('opt', true), stop('b'), stop('gone')];
    const route = primaryDayRoute(day, stops, new Set(['a', 'opt', 'b']));
    expect(route.ids).toEqual(['a', 'b']);
    expect(route.fallback).toEqual([{ from: 'a', to: 'b', mode: 'walk' }]);
  });

  it('uses the active stop list, not the day default', () => {
    const stored: ItineraryStop[] = [stop('old')];
    const active = [stop('a'), stop('opt', true), stop('c')];
    const route = primaryDayRoute({ ...day, stops: stored }, active, new Set(['old', 'a', 'opt', 'c']));
    expect(route.ids).toEqual(['a', 'c']);
    expect(route.fallback.map((leg) => `${leg.from}>${leg.to}`)).toEqual(['a>c']);
  });
});

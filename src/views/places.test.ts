import { describe, expect, it } from 'vitest';
import type { ItineraryDay, ItineraryStop } from '../catalog';
import { primaryDayRoute } from './places';

const day: ItineraryDay = {
  id: 'd',
  day: 1,
  title: { en: 'Day', 'pt-BR': 'Dia' },
  stops: [],
};

function stop(placeId: string, optional?: boolean): ItineraryStop {
  return optional ? { placeId, optional: true } : { placeId };
}

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

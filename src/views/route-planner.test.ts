import { afterEach, describe, expect, it } from 'vitest';
import {
  MAX_ROUTE_STOPS,
  normalizeStoredRoute,
  placeStopIds,
  readStoredRoute,
  removeRouteStop,
  formatRouteDistance,
  formatRouteDuration,
  googleDirectionsUrl,
  routeBarHint,
  routeStopBadges,
  routeStorageKey,
  walkPreviewLabel,
  togglePlaceStop,
  USER_LOCATION_ID,
  writeStoredRoute,
  type RouteStop,
} from './route-planner';

function stop(id: string, user = false): RouteStop {
  return { id, lat: 48.8, lng: 2.3, label: id, labelPt: id, ...(user ? { user: true } : {}) };
}

describe('route stops', () => {
  it('adds, removes and refuses a ninth place', () => {
    let stops: RouteStop[] = [];
    stops = togglePlaceStop(stops, stop('a')).stops;
    stops = togglePlaceStop(stops, stop('a')).stops;
    expect(stops).toEqual([]);
    for (let index = 0; index < MAX_ROUTE_STOPS; index += 1) {
      stops = togglePlaceStop(stops, stop(String(index))).stops;
    }
    const full = togglePlaceStop(stops, stop('extra'));
    expect(full.full).toBe(true);
    expect(full.stops).toHaveLength(MAX_ROUTE_STOPS);
    expect(removeRouteStop(full.stops, '0').map((item) => item.id)).not.toContain('0');
  });

  it('keeps a user origin out of the saved place ids', () => {
    const stops = [stop(USER_LOCATION_ID, true), stop('louvre')];
    expect(placeStopIds(stops)).toEqual(['louvre']);
    expect(togglePlaceStop(stops, stop(USER_LOCATION_ID, true)).stops).toHaveLength(2);
  });

  it('persists place ids and mode per city', () => {
    const data = new Map<string, string>();
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => data.get(key) ?? null,
        setItem: (key: string, value: string) => data.set(key, value),
        removeItem: (key: string) => data.delete(key),
      },
    });
    expect(normalizeStoredRoute({ ids: ['a', 'a', USER_LOCATION_ID, 3], mode: 'transit' })).toEqual({
      ids: ['a'],
      mode: 'transit',
    });
    writeStoredRoute('paris', { ids: ['louvre', 'louvre'], mode: 'transit' });
    expect(data.has(`tb:${routeStorageKey('paris')}`)).toBe(true);
    expect(readStoredRoute('paris')).toEqual({ ids: ['louvre'], mode: 'transit' });
    expect(readStoredRoute('roma')).toEqual({ ids: [], mode: 'walk' });
  });

  it('asks for two stops and keeps transit as a hint', () => {
    expect(routeBarHint(0, 'walk', 'pt-BR')).toBeNull();
    expect(routeBarHint(1, 'walk', 'pt-BR')?.text).toBe('Adicione pelo menos 2 lugares');
    expect(routeBarHint(2, 'transit', 'en')).toEqual({
      text: 'Transit times open in Google Maps',
      kind: 'hint',
    });
    expect(routeBarHint(2, 'walk', 'pt-BR')).toBeNull();
  });

  it('numbers places, skipping a user origin, and formats the walk preview', () => {
    const numbers = routeStopBadges([stop(USER_LOCATION_ID, true), stop('louvre'), stop('orsay')]);
    expect(numbers.get('louvre')).toBe(2);
    expect(numbers.has(USER_LOCATION_ID)).toBe(false);
    expect(formatRouteDuration(25 * 60, 'pt-BR')).toBe('25 min');
    expect(formatRouteDuration(90 * 60, 'en')).toBe('1 h 30 min');
    expect(formatRouteDistance(1900, 'pt-BR')).toBe('1,9 km');
    expect(walkPreviewLabel(25 * 60, 1900, 'pt-BR')).toBe('Prévia a pé · 25 min · 1,9 km');
    const url = googleDirectionsUrl(
      [
        { lat: 1, lng: 2 },
        { lat: 3, lng: 4 },
        { lat: 5, lng: 6 },
      ],
      'transit',
    );
    expect(url).toContain('travelmode=transit');
    expect(url).toContain('origin=1%2C2');
    expect(url).toContain('waypoints=3%2C4');
    expect(googleDirectionsUrl([{ lat: 1, lng: 2 }], 'walk')).toBeNull();
  });

  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'localStorage');
  });
});

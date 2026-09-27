import { describe, expect, it } from 'vitest';
import { routeEmphasis, routeLayerKind, stationsFor } from './route-model';
import type { MapRouteSegment } from './types';

const spine: MapRouteSegment = {
  mode: 'transit',
  color: '#ffbe00',
  fromId: 'a',
  toId: 'b',
  hopIndex: 0,
  latlngs: [
    [48.85, 2.35],
    [48.86, 2.36],
    [48.87, 2.37],
  ],
  transfers: [{ lat: 48.87, lng: 2.37, fromColor: '#ffbe00', toColor: '#003ca6' }],
};

describe('route layers', () => {
  it('keeps a neutral chord dashed and without stations', () => {
    const dash: MapRouteSegment = {
      mode: 'transit',
      dash: true,
      color: '#666666',
      latlngs: [
        [1, 2],
        [3, 4],
      ],
    };
    expect(routeLayerKind(dash)).toBe('dash');
    expect(stationsFor(dash)).toEqual([]);
    expect(routeLayerKind({ mode: 'walk', latlngs: [[0, 0], [1, 1]] })).toBe('walk');
  });

  it('drops the station that sits on a two-color transfer', () => {
    expect(routeLayerKind(spine)).toBe('transit');
    expect(stationsFor(spine)).toEqual([
      { lat: 48.85, lng: 2.35, end: true },
      { lat: 48.86, lng: 2.36, end: false },
    ]);
  });
});

describe('route emphasis', () => {
  it('heats the place pair, or every leg that touches a stop', () => {
    expect(routeEmphasis(null, spine)).toBe('normal');
    expect(routeEmphasis({ kind: 'leg', from: 'a', to: 'b' }, spine)).toBe('hot');
    expect(routeEmphasis({ kind: 'leg', from: 'a', to: 'b', hop: 0 }, spine)).toBe('hot');
    expect(routeEmphasis({ kind: 'leg', from: 'a', to: 'b', hop: 1 }, spine)).toBe('dim');
    expect(routeEmphasis({ kind: 'leg', from: 'a', to: 'b', mode: 'walk' }, spine)).toBe('dim');
    expect(routeEmphasis({ kind: 'leg', from: 'b', to: 'c' }, spine)).toBe('dim');
    expect(routeEmphasis({ kind: 'place', id: 'b' }, spine)).toBe('hot');
    expect(routeEmphasis({ kind: 'place', id: 'z' }, { fromId: 'a', toId: 'b' })).toBe('dim');
  });

  it('lights one walk of a train leg, not every walk of it', () => {
    const toStation = { mode: 'walk' as const, fromId: 'a', toId: 'b', walkIndex: 0 };
    const toStop = { mode: 'walk' as const, fromId: 'a', toId: 'b', walkIndex: 2 };
    const focus = { kind: 'leg' as const, from: 'a', to: 'b', walk: 2 };
    expect(routeEmphasis(focus, toStop)).toBe('hot');
    expect(routeEmphasis(focus, toStation)).toBe('dim');
    expect(routeEmphasis(focus, spine)).toBe('dim');
  });
});

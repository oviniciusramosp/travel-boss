import { describe, expect, it, vi } from 'vitest';
import type { ItineraryLegDef } from '../data/travel-itinerary-legs';
import { milanDayLegsById } from '../data/travel-itinerary-legs';
import { buildItineraryRoute } from './itinerary-route';
import { fetchWalkingRoute } from './walk-route';

vi.mock('./walk-route', () => ({ fetchWalkingRoute: vi.fn(async () => null) }));

describe('authored station access', () => {
  it.each(['osrm', 'straight'] as const)('never invents a railway spine for an unknown line in %s mode', async (walkMode) => {
    const leg: ItineraryLegDef = { from: 'a', to: 'b', mode: 'transit', line: 'unknown' };
    const places = new Map([
      ['a', { id: 'a', lat: 45.49, lng: 9.20 }],
      ['b', { id: 'b', lat: 45.46, lng: 9.19 }],
    ]);
    expect((await buildItineraryRoute(['a', 'b'], [leg], places, { walkMode })).segments).toEqual([]);
  });
  it.each(['osrm', 'straight'] as const)('connects every M3 station and preserves the Duomo alighting in %s mode', async (walkMode) => {
    const leg = milanDayLegsById['milao-d1']!.find(leg => leg.from === 'mil-sondrio')!;
    const places = new Map([
      [leg.from, { id: leg.from, lat: 45.48983, lng: 9.2008456 }],
      [leg.to, { id: leg.to, lat: 45.464408, lng: 9.1935032 }],
    ]);
    const route = await buildItineraryRoute([leg.from, leg.to], [leg], places, { walkMode });
    const spine = route.segments.find(segment => segment.lineId === 'mil-m3')!;
    expect(spine.latlngs).toHaveLength(6);
    expect(spine.latlngs).toEqual(leg.hops![0]!.path);
    expect(leg.hops![0]).toMatchObject({ board: 'Sondrio', exit: 'Duomo' });
    if (walkMode === 'straight') expect(route.segments.find(segment => segment.mode === 'walk' && segment.walkIndex === 1)?.latlngs[0])
      .toEqual(spine.latlngs.at(-1));
    const back = milanDayLegsById['milao-d1']!.find(leg => leg.from === 'mil-galleria')!;
    expect(back.hops![0]!.path).toEqual([...spine.latlngs].reverse());
  });
  it.each(['osrm', 'straight'] as const)('keeps the M1 access visible and individually selectable in %s mode', async (walkMode) => {
    const leg: ItineraryLegDef = {
      from: 'cafe', to: 'arc', mode: 'transit',
      hops: [{ line: 'm1', path: [[48.8625, 2.3364], [48.8738, 2.295]] }],
      walkInPath: [[48.8655, 2.335], [48.864, 2.3355], [48.8625, 2.3364]],
    };
    const places = new Map([
      [leg.from, { id: leg.from, lat: 48.8655, lng: 2.335 }],
      [leg.to, { id: leg.to, lat: 48.8738, lng: 2.295 }],
    ]);
    vi.mocked(fetchWalkingRoute).mockClear();
    const route = await buildItineraryRoute([leg.from, leg.to], [leg], places, { walkMode });
    const access = route.segments.find((segment) => segment.mode === 'walk' && segment.walkIndex === 0);
    expect(access).toMatchObject({ fromId: leg.from, toId: leg.to, latlngs: leg.walkInPath });
    expect(access!.latlngs.length).toBeGreaterThan(2);
    expect(route.segments.some((segment) => segment.mode === 'transit' && segment.lineId === 'm1')).toBe(true);
    expect(fetchWalkingRoute).not.toHaveBeenCalled();
  });
});

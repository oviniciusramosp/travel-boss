import { describe, expect, it, vi } from 'vitest';
import type { ItineraryLegDef } from '../data/travel-itinerary-legs';
import { buildItineraryRoute } from './itinerary-route';
import { fetchWalkingRoute } from './walk-route';

vi.mock('./walk-route', () => ({ fetchWalkingRoute: vi.fn(async () => null) }));

describe('authored station access', () => {
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

import { describe, expect, it } from 'vitest';
import { flightCurve } from './flight-curve';
import { resolveHopSegments, previewHop } from '../trip/route';
import { routeLayerKind, stationsFor } from './route-model';
import { parseTrip } from '../trip/parse';
import { tripToMarkdown } from '../trip/export';

describe('illustrative flights', () => {
  it('curves between exact airports and crosses the date line without circling the globe', () => {
    const path = flightCurve({ lat: 41.8, lng: 12.2 }, { lat: 38.7, lng: -9.1 });
    expect(path[0]![0]).toBeCloseTo(41.8);
    expect(path.at(-1)![1]).toBeCloseTo(-9.1);
    expect(path[32]![0]).not.toBeCloseTo((41.8 + 38.7) / 2, 1);
    const pacific = flightCurve({ lat: 35, lng: 170 }, { lat: 30, lng: -170 });
    expect(pacific.at(-1)![1]).toBeCloseTo(190);
    expect(Math.max(...pacific.map((p) => p[1])) - Math.min(...pacific.map((p) => p[1]))).toBeLessThan(30);
  });

  it('renders flights immediately with no road request or station dots', async () => {
    const hop = { from: { id: 'rom-fco', lat: 41.8, lng: 12.2 }, to: { id: 'lis-lis', lat: 38.7, lng: -9.1 }, via: { detail: 'voo FCO → LIS', mode: 'flight' as const } };
    const unexpected = async (): Promise<never> => { throw new Error('Flight must not request a ground route'); };
    const segments = await resolveHopSegments([hop], { neutralColor: '#666666', walk: unexpected, drive: unexpected, catalog: unexpected });
    expect(segments).toEqual(previewHop(hop, '#666666'));
    expect(segments).toHaveLength(1);
    expect(routeLayerKind(segments[0]!)).toBe('flight');
    expect(stationsFor(segments[0]!)).toEqual([]);
  });

  it('preserves a flight without inventing duration through parsing and export', () => {
    const raw = '# Europa\n\n## Lisboa\ncity: lisboa\n\n### Dia 1 — Volta\n\n- 09:35 [LIS](place:lis-lis)\n  - via: voo LIS → GRU\n- [GRU](place:sp-gru)\n';
    const trip = parseTrip('europa', 'europa.md', raw);
    expect(trip.errors).toEqual([]);
    expect(trip.cities[0]!.days[0]!.stops[0]!.leg?.durationMin).toBeUndefined();
    expect(tripToMarkdown(trip, (_city, id) => `place:${id}`)).toContain('  - via: voo LIS → GRU');
  });
});

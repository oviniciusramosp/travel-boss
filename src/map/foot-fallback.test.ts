import { afterEach, describe, expect, it, vi } from 'vitest';
import { decodeFootShape, footFallback } from './foot-fallback';

afterEach(() => vi.unstubAllGlobals());
describe('pedestrian fallback', () => {
  it('decodes polyline6 including negative deltas and rejects truncation', () => {
    expect(decodeFootShape('_p~iF~ps|U_ulLnnqC_mqNvxq`@')).toEqual([[3.85, -12.02], [4.07, -12.095], [4.3252, -12.6453]]);
    expect(() => decodeFootShape('_p')).toThrow();
  });
  it('requests walking routes and converts kilometers to meters', async () => {
    const request = vi.fn(async () => ({ ok: true, json: async () => ({ trip: { status: 0, summary: { length: 1.25, time: 900 }, legs: [{ shape: '??_ibE_ibE' }] } }) }));
    vi.stubGlobal('fetch', request);
    const result = await footFallback([{ lat: 0, lng: 0 }, { lat: 0.1, lng: 0.1 }], new AbortController().signal);
    expect(result).toEqual({ latlngs: [[0, 0], [0.1, 0.1]], distanceM: 1250, durationSec: 900 });
    expect(decodeURIComponent(String(request.mock.calls[0]))).toContain('pedestrian');
  });
  it('falls back after OSRM network failure and caches the result', async () => {
    vi.resetModules();
    vi.stubGlobal('localStorage', { getItem: () => null, setItem: () => {} });
    const request = vi.fn().mockRejectedValueOnce(new TypeError('offline')).mockResolvedValue({ ok: true, json: async () => ({ trip: { status: 0, summary: { length: 1, time: 600 }, legs: [{ shape: '??_ibE_ibE' }] } }) });
    vi.stubGlobal('fetch', request);
    const { fetchWalkingRoute } = await import('./walk-route');
    const points = [{ lat: 0, lng: 0 }, { lat: 0.1, lng: 0.1 }];
    expect((await fetchWalkingRoute(points))?.distanceM).toBe(1000);
    expect((await fetchWalkingRoute(points))?.distanceM).toBe(1000);
    expect(request).toHaveBeenCalledTimes(2);
  });
});

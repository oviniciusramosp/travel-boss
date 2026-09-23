import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { WALKING_ROUTE_CACHE_LIMIT } from './walk-route';

function installStorage() {
  const data = new Map<string, string>();
  const storage = {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => {
      data.delete(key);
    },
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: storage });
  return data;
}

function okRoute() {
  return {
    ok: true,
    json: async () => ({
      code: 'Ok',
      routes: [
        {
          distance: 12,
          duration: 34,
          geometry: { coordinates: [[2, 1], [4, 3]] as [number, number][] },
        },
      ],
    }),
  };
}

function pair(lat: number, lng = 0): { lat: number; lng: number }[] {
  return [
    { lat, lng },
    { lat, lng: lng + 1 },
  ];
}

async function loadRoute() {
  vi.resetModules();
  return import('./walk-route');
}

describe('fetchWalkingRoute', () => {
  beforeEach(() => {
    installStorage();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(globalThis, 'localStorage');
  });

  it('rounds the cache key and skips a second request', async () => {
    const fetchMock = vi.fn(async (url: string) => {
      expect(String(url)).toContain('https://routing.openstreetmap.de/routed-foot/');
      return okRoute();
    });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchWalkingRoute, walkRouteKey } = await loadRoute();
    const first = [
      { lat: 1.111111, lng: 2.222222 },
      { lat: 3, lng: 4 },
    ];
    const second = [
      { lat: 1.111114, lng: 2.222224 },
      { lat: 3.000001, lng: 4.000004 },
    ];
    expect(walkRouteKey(first)).toBe(walkRouteKey(second));
    const route = await fetchWalkingRoute(first);
    expect(route?.latlngs).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(await fetchWalkingRoute(second)).toEqual(route);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reloads a route from localStorage', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okRoute()));
    const first = await loadRoute();
    await first.fetchWalkingRoute(pair(8));
    expect(localStorage.getItem('tb:walks')).toContain('8.00000,0.00000;8.00000,1.00000');
    const fetchMock = vi.fn(async () => okRoute());
    vi.stubGlobal('fetch', fetchMock);
    const second = await loadRoute();
    const route = await second.fetchWalkingRoute(pair(8));
    expect(fetchMock).not.toHaveBeenCalled();
    expect(route).toMatchObject({ distanceM: 12, durationSec: 34 });
  });

  it('keeps about 300 routes and evicts the least recently used', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => okRoute()));
    const { fetchWalkingRoute } = await loadRoute();
    for (let index = 0; index < WALKING_ROUTE_CACHE_LIMIT; index += 1) {
      await fetchWalkingRoute(pair(index));
    }
    await fetchWalkingRoute(pair(0));
    await fetchWalkingRoute(pair(WALKING_ROUTE_CACHE_LIMIT));
    const fetchMock = vi.fn(async () => okRoute());
    vi.stubGlobal('fetch', fetchMock);
    vi.resetModules();
    const again = await import('./walk-route');
    await again.fetchWalkingRoute(pair(0));
    await again.fetchWalkingRoute(pair(1));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('runs at most two requests at once', async () => {
    const pending: Array<{ finish: () => void }> = [];
    const fetchMock = vi.fn((_url: string, _init?: RequestInit) => {
      return new Promise((resolve) => {
        pending.push({ finish: () => resolve(okRoute()) });
      });
    });
    vi.stubGlobal('fetch', fetchMock);
    const { fetchWalkingRoute } = await loadRoute();
    const first = fetchWalkingRoute(pair(1));
    const second = fetchWalkingRoute(pair(2));
    const third = fetchWalkingRoute(pair(3));
    await Promise.resolve();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    pending[0]?.finish();
    await first;
    expect(fetchMock).toHaveBeenCalledTimes(3);
    pending[1]?.finish();
    pending[2]?.finish();
    await Promise.all([second, third]);
  });

  it('drops a queued request when its caller aborts', async () => {
    const pending: Array<{ finish: () => void }> = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            pending.push({ finish: () => resolve(okRoute()) });
          }),
      ),
    );
    const { fetchWalkingRoute } = await loadRoute();
    const first = fetchWalkingRoute(pair(1));
    const second = fetchWalkingRoute(pair(2));
    const controller = new AbortController();
    const third = fetchWalkingRoute(pair(3), controller.signal);
    await Promise.resolve();
    controller.abort();
    await expect(third).rejects.toMatchObject({ name: 'AbortError' });
    pending[0]?.finish();
    pending[1]?.finish();
    await Promise.all([first, second]);
    expect(vi.mocked(fetch).mock.calls.length).toBe(2);
  });

  it('does not cancel a shared request when only one caller aborts', async () => {
    const gate: { finish: () => void } = { finish: () => {} };
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            gate.finish = () => resolve(okRoute());
          }),
      ),
    );
    const { fetchWalkingRoute } = await loadRoute();
    const controller = new AbortController();
    const points = pair(4);
    const kept = fetchWalkingRoute(points);
    const cancelled = fetchWalkingRoute(points, controller.signal);
    await Promise.resolve();
    controller.abort();
    await expect(cancelled).rejects.toMatchObject({ name: 'AbortError' });
    gate.finish();
    await expect(kept).resolves.toMatchObject({ distanceM: 12 });
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });
});

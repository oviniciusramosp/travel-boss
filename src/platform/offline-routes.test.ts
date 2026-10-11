import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { collectOfflineRoutes, offlineRoutesReady, removeOfflineRoutes, retainOfflineRoute, storedOfflineRoute } from './offline-routes';

const route = { latlngs: [[1, 2], [3, 4]] as [number, number][], durationSec: 30, distanceM: 40 };
let entries: Map<string, Response>;

beforeEach(() => {
  entries = new Map();
  vi.stubGlobal('location', { origin: 'https://travel.example' });
  vi.stubGlobal('caches', { open: async () => ({
    match: async (key: string) => entries.get(key)?.clone(),
    put: async (key: string, response: Response) => { entries.set(key, response.clone()); },
    delete: async (key: string) => entries.delete(key),
  }) });
});
afterEach(() => vi.unstubAllGlobals());

describe('downloaded route storage', () => {
  it('stores downloaded routes outside the bounded opportunistic cache and reads them after collection', async () => {
    const result = await collectOfflineRoutes(async () => { await retainOfflineRoute('walk:one', route); });
    expect(result).toEqual({ keys: ['walk:one'], failed: 0, bytes: new TextEncoder().encode(JSON.stringify(route)).byteLength });
    expect(await storedOfflineRoute('walk:one')).toEqual(route);
    expect(await offlineRoutesReady(result.keys)).toBe(true);
    entries.clear();
    expect(await offlineRoutesReady(result.keys)).toBe(false);
  });

  it('does not claim success when a route is missing or storage quota fails', async () => {
    vi.stubGlobal('caches', { open: async () => ({ put: async () => { throw new Error('quota'); } }) });
    const result = await collectOfflineRoutes(async () => {
      await retainOfflineRoute('missing', null);
      await retainOfflineRoute('quota', route);
    });
    expect(result.failed).toBe(2);
  });

  it('keeps shared legs when removing one downloaded trip', async () => {
    await collectOfflineRoutes(async () => {
      await retainOfflineRoute('shared', route);
      await retainOfflineRoute('private', route);
    });
    await removeOfflineRoutes(['shared', 'private'], new Set(['shared']));
    expect(await storedOfflineRoute('shared')).toEqual(route);
    expect(await storedOfflineRoute('private')).toBeNull();
  });

  it('does not pin ordinary browsing and rejects invalid persisted geometry', async () => {
    await retainOfflineRoute('normal', route);
    expect(entries.size).toBe(0);
    const key = new URL('/__offline_route__/bad', location.origin).href;
    entries.set(key, new Response(JSON.stringify({ ...route, latlngs: [[1, 2], ['bad', 4]] })));
    expect(await storedOfflineRoute('bad')).toBeNull();
  });

  it('releases collection after cancellation so later browsing is not retained', async () => {
    await expect(collectOfflineRoutes(async () => {
      throw new DOMException('Cancelled', 'AbortError');
    })).rejects.toMatchObject({ name: 'AbortError' });
    await retainOfflineRoute('after-cancel', route);
    expect(entries.size).toBe(0);
  });
});

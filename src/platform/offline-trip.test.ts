import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadedPhotoUrls, offlineManifestReady, offlineTripPhotos, type OfflineManifest } from './offline-trip';
import { offlineFingerprint } from './offline-control';
import { parseTrip } from '../trip/parse';

vi.mock('../catalog', async importOriginal => {
  const original = await importOriginal<typeof import('../catalog')>();
  return { ...original, travelCities: [{ places: [
    { id: 'paris-louvre', photos: [{ url: 'cover' }], subPoints: [{ photo: 'internal' }, { placeId: 'child' }] },
    { id: 'child', photos: [{ url: 'child-cover' }] },
    { id: 'not-visited', photos: [{ url: 'excluded' }] },
  ] }], resolvePlacePhotos: (_id: string, photos: unknown) => photos };
});

function trip() {
  return parseTrip('test', 'test.md', '# Test\n## Paris\ncity: paris\n### Dia 1 — Paris\n- [Louvre](place:paris-louvre)\n- [Louvre](place:paris-louvre)');
}
afterEach(() => vi.unstubAllGlobals());

describe('offline trip manifest', () => {
  it('removes only pinned photos, skipping unavailable files from a partial download', async () => {
    const open = vi.fn().mockResolvedValue({ match: async (url: string) => url === 'saved' ? new Response('photo') : undefined });
    vi.stubGlobal('caches', { open });
    expect(await downloadedPhotoUrls(['saved', 'unsupported-provider', 'failed-download'])).toEqual(['saved']);
    expect(open).toHaveBeenCalledWith('tb-trip-v1');
  });
  it('selects one cover and internal photos only for visited places without duplicates', () => {
    expect(offlineTripPhotos(trip())).toEqual(['cover', 'internal', 'child-cover']);
  });
  it('invalidates a download after the trip changes while keeping its ID', () => {
    const before = trip();
    const after = structuredClone(before);
    after.cities[0]!.days[0]!.stops[0]!.note = 'different order';
    expect(offlineFingerprint(after)).not.toBe(offlineFingerprint(before));
  });
  it('requires current essentials, optional files and durable routes after reloading', async () => {
    const available = new Set(['photo', 'optional', 'current-optional']);
    vi.stubGlobal('caches', {
      match: async (url: string) => available.has(url) ? new Response('saved') : undefined,
      open: async () => ({ match: async () => undefined }),
    });
    vi.stubGlobal('location', { origin: 'https://travel.example' });
    const saved: OfflineManifest = { fingerprint: 'content', photos: ['photo'], assets: ['optional'], routes: [], bytes: 1, complete: true };
    const shell = { essentialReady: true, optionalUrls: ['current-optional'] };
    expect(await offlineManifestReady(saved, 'content', shell)).toBe(true);
    expect(await offlineManifestReady(saved, 'edited', shell)).toBe(false);
    expect(await offlineManifestReady(saved, 'content', { ...shell, essentialReady: false })).toBe(false);
    expect(await offlineManifestReady({ ...saved, routes: ['missing-route'] }, 'content', shell)).toBe(false);
    available.delete('current-optional');
    expect(await offlineManifestReady(saved, 'content', shell)).toBe(false);
  });
  it('keeps availability false when storage is denied or download is partial', async () => {
    vi.stubGlobal('caches', { match: async () => { throw new Error('denied'); } });
    const saved: OfflineManifest = { fingerprint: 'same', photos: ['photo'], assets: [], routes: [], bytes: 0, complete: true };
    const shell = { essentialReady: true, optionalUrls: [] };
    expect(await offlineManifestReady(saved, 'same', shell)).toBe(false);
    expect(await offlineManifestReady({ ...saved, complete: false }, 'same', shell)).toBe(false);
  });
});

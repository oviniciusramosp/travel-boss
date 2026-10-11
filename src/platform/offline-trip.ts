import { resolvePlacePhotos, travelCities } from '../catalog';
import type { Trip } from '../trip/parse';
import { offlineRoutesReady } from './offline-routes';

/** One cover per visited place, plus the pictures of its internal stops. */
export function offlineTripPhotos(trip: Trip): string[] {
  const ids = new Set(trip.cities.flatMap(city => city.days.flatMap(day => day.stops.flatMap(stop => stop.placeId ? [stop.placeId] : []))));
  const photos = new Set<string>();
  for (const city of travelCities) for (const place of city.places) {
    if (!ids.has(place.id)) continue;
    const cover = resolvePlacePhotos(place.id, place.photos)?.[0]?.url;
    if (cover) photos.add(cover);
    for (const sub of place.subPoints ?? []) {
      if (sub.photo) photos.add(sub.photo);
      if (sub.placeId) {
        const child = city.places.find(candidate => candidate.id === sub.placeId);
        const photo = child && resolvePlacePhotos(child.id, child.photos)?.[0]?.url;
        if (photo) photos.add(photo);
      }
    }
  }
  return [...photos];
}

export type OfflineProgress = { total: number; completed: number; failed: number; bytes: number };

/** Failed downloads have no pinned file to remove, even if their provider is unsupported. */
export async function downloadedPhotoUrls(urls: readonly string[]): Promise<string[]> {
  const cache = await caches.open('tb-trip-v1');
  const saved = await Promise.all(urls.map(async url => await cache.match(url) ? url : null));
  return saved.filter((url): url is string => url !== null);
}

/** Worker messages complete even if the network stalls; stalled work stays partial. */
export async function cacheMessage<T>(message: object, progress?: (value: OfflineProgress) => void): Promise<T> {
  if (!('serviceWorker' in navigator)) throw new Error('serviceWorker');
  const registration = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error('worker timeout')), 20_000)),
  ]);
  const worker = navigator.serviceWorker.controller ?? registration.active;
  if (!worker) throw new Error('worker');
  return new Promise<T>((resolve, reject) => {
    const channel = new MessageChannel();
    let timer: ReturnType<typeof setTimeout>;
    const close = () => { clearTimeout(timer); channel.port1.close(); };
    const touch = () => {
      clearTimeout(timer);
      timer = setTimeout(() => { close(); reject(new Error('cache timeout')); }, 60_000);
    };
    channel.port1.onmessage = ({ data }) => {
      touch();
      if (data.type === 'CACHE_PROGRESS') { progress?.(data); return; }
      close();
      resolve(data as T);
    };
    touch();
    worker.postMessage(message, [channel.port2]);
  });
}

/** Verify persisted photos without a network request; do not trust a saved success label. */
export async function cachedPhotos(urls: readonly string[]): Promise<boolean> {
  if (!('caches' in globalThis)) return false;
  for (const url of urls) if (!(await caches.match(url))) return false;
  return true;
}

export type OfflineManifest = { fingerprint: string; photos: string[]; assets: string[]; routes: string[]; bytes: number; complete: boolean };
export type OfflineCacheStatus = { essentialReady: boolean; optionalUrls: string[] };

/** A persisted label is insufficient: verify current files, content, and route geometry. */
export async function offlineManifestReady(manifest: OfflineManifest, fingerprint: string, shell: OfflineCacheStatus): Promise<boolean> {
  if (!shell.essentialReady || !manifest.complete || manifest.fingerprint !== fingerprint) return false;
  try {
    return await cachedPhotos([...manifest.photos, ...(manifest.assets ?? []), ...shell.optionalUrls]) &&
      await offlineRoutesReady(manifest.routes);
  } catch { return false; }
}

/** Downloaded routes live separately from the bounded opportunistic walk cache. */
const CACHE = 'tb-offline-routes-v1';
type Route = { latlngs: [number, number][]; durationSec: number; distanceM: number };
type Collection = Map<string, boolean>;
const collections = new Set<Collection>();

function url(key: string): string {
  return new URL(`${import.meta.env.BASE_URL}__offline_route__/${encodeURIComponent(key)}`, location.origin).href;
}

export async function storedOfflineRoute(key: string): Promise<Route | null> {
  try {
    if (!('caches' in globalThis)) return null;
    const response = await (await caches.open(CACHE)).match(url(key));
    if (!response) return null;
    const route = await response.json() as Route;
    if (!Array.isArray(route.latlngs) || route.latlngs.length < 2 ||
      !route.latlngs.every(pair => Array.isArray(pair) && pair.length === 2 && pair.every(Number.isFinite)) ||
      !Number.isFinite(route.durationSec) || !Number.isFinite(route.distanceM)) return null;
    return route;
  } catch { return null; }
}

export async function retainOfflineRoute(key: string, route: Route | null): Promise<void> {
  if (!collections.size) return;
  // Capture the active download before yielding; other views may fetch in parallel.
  const current = [...collections];
  let saved = false;
  try {
    if (route && 'caches' in globalThis) {
      await (await caches.open(CACHE)).put(url(key), new Response(JSON.stringify(route), {
        headers: { 'Content-Type': 'application/json' },
      }));
      saved = Boolean(await storedOfflineRoute(key));
    }
  } catch { /* Quota or denied storage must result in partial availability. */ }
  for (const collection of current) collection.set(key, saved);
}

export async function collectOfflineRoutes(work: () => Promise<void>): Promise<{ keys: string[]; failed: number; bytes: number }> {
  const collection: Collection = new Map();
  collections.add(collection);
  try { await work(); }
  finally { collections.delete(collection); }
  let bytes = 0;
  for (const [key, saved] of collection) {
    if (!saved) continue;
    const route = await storedOfflineRoute(key);
    if (route) bytes += new TextEncoder().encode(JSON.stringify(route)).byteLength;
  }
  return { keys: [...collection.keys()], failed: [...collection.values()].filter(saved => !saved).length, bytes };
}

export async function offlineRoutesReady(keys: readonly string[]): Promise<boolean> {
  for (const key of keys) if (!(await storedOfflineRoute(key))) return false;
  return true;
}

/** Other downloaded trips may share the same walking leg. */
export async function removeOfflineRoutes(keys: readonly string[], retained: ReadonlySet<string>): Promise<void> {
  const cache = await caches.open(CACHE);
  for (const key of keys) if (!retained.has(key)) await cache.delete(url(key));
}

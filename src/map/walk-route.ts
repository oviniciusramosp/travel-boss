/** FOSSGIS public OSRM foot profile. No API key. At most two requests in flight. */
const OSRM_FOOT = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';

/** Five decimals, same rounding as the session walk memory (~1 m). */
const COORD_DIGITS = 5;

/** Oldest entry is evicted after this many stored routes. */
export const WALKING_ROUTE_CACHE_LIMIT = 300;

const STORAGE_KEY = 'tb:walks';
const MAX_IN_FLIGHT = 2;

export type WalkingRoute = {
  latlngs: [number, number][];
  durationSec: number;
  distanceM: number;
};

type StoredRoute = WalkingRoute & { key: string };

const memory = new Map<string, WalkingRoute>();
const order: string[] = [];
let hydrated = false;

type Job = {
  controller: AbortController;
  promise: Promise<WalkingRoute | null>;
  users: number;
};

const inflight = new Map<string, Job>();
let active = 0;
const queue: Array<() => void> = [];

export function walkRouteKey(points: { lat: number; lng: number }[]): string {
  return points.map((point) => `${point.lat.toFixed(COORD_DIGITS)},${point.lng.toFixed(COORD_DIGITS)}`).join(';');
}

function storage(): Storage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

function isRoute(value: unknown): value is StoredRoute {
  if (!value || typeof value !== 'object') return false;
  const row = value as StoredRoute;
  if (typeof row.key !== 'string' || !row.key) return false;
  if (typeof row.durationSec !== 'number' || typeof row.distanceM !== 'number') return false;
  if (!Array.isArray(row.latlngs) || row.latlngs.length < 2) return false;
  return row.latlngs.every(
    (pair) =>
      Array.isArray(pair) &&
      pair.length >= 2 &&
      typeof pair[0] === 'number' &&
      typeof pair[1] === 'number',
  );
}

function hydrate(): void {
  if (hydrated) return;
  hydrated = true;
  const store = storage();
  if (!store) return;
  let raw: unknown;
  try {
    const text = store.getItem(STORAGE_KEY);
    raw = text == null ? null : JSON.parse(text);
  } catch {
    return;
  }
  if (!Array.isArray(raw)) return;
  for (const item of raw) {
    if (!isRoute(item) || memory.has(item.key)) continue;
    memory.set(item.key, {
      latlngs: item.latlngs,
      durationSec: item.durationSec,
      distanceM: item.distanceM,
    });
    order.push(item.key);
  }
  trim();
}

function payload(): StoredRoute[] {
  const rows: StoredRoute[] = [];
  for (const key of order) {
    const route = memory.get(key);
    if (!route) continue;
    rows.push({ key, ...route });
  }
  return rows;
}

function persist(): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(STORAGE_KEY, JSON.stringify(payload()));
  } catch {
    const drop = Math.max(1, Math.ceil(order.length / 2));
    for (let index = 0; index < drop && order.length > 0; index += 1) {
      const oldest = order.shift();
      if (oldest) memory.delete(oldest);
    }
    try {
      store.setItem(STORAGE_KEY, JSON.stringify(payload()));
    } catch {
      /* quota still full */
    }
  }
}

function trim(): void {
  while (order.length > WALKING_ROUTE_CACHE_LIMIT) {
    const oldest = order.shift();
    if (oldest) memory.delete(oldest);
  }
}

let persistQueued = false;

function schedulePersist(): void {
  if (persistQueued) return;
  persistQueued = true;
  queueMicrotask(() => {
    persistQueued = false;
    persist();
  });
}

function touch(key: string): void {
  const index = order.indexOf(key);
  if (index >= 0) order.splice(index, 1);
  order.push(key);
  trim();
  schedulePersist();
}

function remember(key: string, route: WalkingRoute): void {
  memory.set(key, route);
  touch(key);
}

function cached(key: string): WalkingRoute | null {
  hydrate();
  const hit = memory.get(key);
  if (!hit) return null;
  touch(key);
  return hit;
}

/** Synchronous hit. Does not ask the network. */
export function peekWalkingRoute(
  points: { lat: number; lng: number }[],
): WalkingRoute | null {
  if (points.length < 2) return null;
  return cached(walkRouteKey(points));
}

function abortError(): DOMException {
  return new DOMException('Aborted', 'AbortError');
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

function acquire(signal: AbortSignal): Promise<void> {
  if (signal.aborted) return Promise.reject(abortError());
  if (active < MAX_IN_FLIGHT) {
    active += 1;
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    const grant = () => {
      if (settled) return;
      settled = true;
      signal.removeEventListener('abort', onAbort);
      if (signal.aborted) {
        reject(abortError());
        const next = queue.shift();
        if (next) next();
        return;
      }
      active += 1;
      resolve();
    };
    const onAbort = () => {
      if (settled) return;
      settled = true;
      const index = queue.indexOf(grant);
      if (index >= 0) queue.splice(index, 1);
      reject(abortError());
    };
    queue.push(grant);
    signal.addEventListener('abort', onAbort);
  });
}

function release(): void {
  active = Math.max(0, active - 1);
  const next = queue.shift();
  if (next) next();
}

function bindUser(job: Job, signal?: AbortSignal): () => void {
  job.users += 1;
  if (!signal) return () => {};
  let dropped = false;
  const onAbort = () => {
    if (dropped) return;
    dropped = true;
    signal.removeEventListener('abort', onAbort);
    job.users -= 1;
    if (job.users <= 0) job.controller.abort();
  };
  if (signal.aborted) {
    onAbort();
    return () => {};
  }
  signal.addEventListener('abort', onAbort);
  return () => {
    if (dropped) return;
    dropped = true;
    signal.removeEventListener('abort', onAbort);
  };
}

function watch<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
  if (!signal) return promise;
  if (signal.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      signal.removeEventListener('abort', onAbort);
      reject(abortError());
    };
    signal.addEventListener('abort', onAbort);
    promise.then(
      (value) => {
        signal.removeEventListener('abort', onAbort);
        resolve(value);
      },
      (error: unknown) => {
        signal.removeEventListener('abort', onAbort);
        reject(error);
      },
    );
  });
}

async function execute(
  key: string,
  points: { lat: number; lng: number }[],
  job: Job,
): Promise<WalkingRoute | null> {
  let held = false;
  try {
    await acquire(job.controller.signal);
    held = true;
    if (job.controller.signal.aborted) throw abortError();
    const coords = points.map((point) => `${point.lng},${point.lat}`).join(';');
    const res = await fetch(
      `${OSRM_FOOT}/${coords}?overview=full&geometries=geojson&steps=false`,
      { signal: job.controller.signal },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      code?: string;
      routes?: Array<{
        distance: number;
        duration: number;
        geometry?: { coordinates?: [number, number][] };
      }>;
    };
    const route = data.code === 'Ok' ? data.routes?.[0] : undefined;
    const raw = route?.geometry?.coordinates;
    if (!route || !raw?.length) return null;
    const built: WalkingRoute = {
      latlngs: raw.map(([lng, lat]) => [lat, lng]),
      durationSec: route.duration,
      distanceM: route.distance,
    };
    remember(key, built);
    return built;
  } catch (error) {
    if (isAbort(error) || job.controller.signal.aborted) throw abortError();
    return null;
  } finally {
    if (held) release();
    inflight.delete(key);
  }
}

export async function fetchWalkingRoute(
  points: { lat: number; lng: number; id?: string; label?: string }[],
  signal?: AbortSignal,
): Promise<WalkingRoute | null> {
  if (points.length < 2) return null;
  const key = walkRouteKey(points);
  const hit = cached(key);
  if (hit) return hit;
  if (signal?.aborted) throw abortError();

  const existing = inflight.get(key);
  if (existing) {
    bindUser(existing, signal);
    return watch(existing.promise, signal);
  }

  const job: Job = {
    controller: new AbortController(),
    users: 0,
    promise: Promise.resolve(null),
  };
  const unlisten = bindUser(job, signal);
  job.promise = execute(key, points, job);
  inflight.set(key, job);
  try {
    return await watch(job.promise, signal);
  } finally {
    unlisten();
  }
}

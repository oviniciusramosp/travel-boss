/** FOSSGIS public OSRM foot profile. No API key. */
const OSRM_FOOT = 'https://routing.openstreetmap.de/routed-foot/route/v1/foot';

export type WalkingRoute = {
  latlngs: [number, number][];
  durationSec: number;
  distanceM: number;
};

const cache = new Map<string, WalkingRoute>();
const inflight = new Map<string, Promise<WalkingRoute | null>>();

function keyOf(points: { lat: number; lng: number }[]): string {
  return points.map((p) => `${p.lat.toFixed(5)},${p.lng.toFixed(5)}`).join(';');
}

export async function fetchWalkingRoute(
  points: { lat: number; lng: number; id?: string; label?: string }[],
  signal?: AbortSignal,
): Promise<WalkingRoute | null> {
  if (points.length < 2) return null;
  const key = keyOf(points);
  const cached = cache.get(key);
  if (cached) return cached;
  const pending = inflight.get(key);
  if (pending) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    return pending;
  }

  const coords = points.map((p) => `${p.lng},${p.lat}`).join(';');
  const request = (async (): Promise<WalkingRoute | null> => {
    try {
      const res = await fetch(
        `${OSRM_FOOT}/${coords}?overview=full&geometries=geojson&steps=false`,
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
      cache.set(key, built);
      return built;
    } catch {
      return null;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, request);
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
  return request;
}

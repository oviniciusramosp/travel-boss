import type { WalkingRoute } from './walk-route';

let nextRequestAt = 0;

/** Space requests to the public routing service by at least one second. */
async function waitForSlot(signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  const wait = Math.max(0, nextRequestAt - Date.now());
  nextRequestAt = Date.now() + wait + 1000;
  if (!wait) return;
  await new Promise<void>((resolve, reject) => {
    const onAbort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal.removeEventListener('abort', onAbort); resolve(); }, wait);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

/** Valhalla encodes latitude/longitude deltas at six decimal places. */
export function decodeFootShape(shape: string): [number, number][] {
  const points: [number, number][] = [];
  let at = 0, lat = 0, lng = 0;
  const delta = () => {
    let value = 0, shift = 0, byte: number;
    do {
      if (at >= shape.length || shift > 30) throw new Error('Invalid route shape');
      byte = shape.charCodeAt(at++) - 63;
      if (byte < 0 || byte > 63) throw new Error('Invalid route shape');
      value |= (byte & 31) << shift;
      shift += 5;
    } while (byte >= 32);
    return value & 1 ? ~(value >>> 1) : value >>> 1;
  };
  while (at < shape.length) {
    lat += delta(); lng += delta();
    points.push([lat / 1e6, lng / 1e6]);
  }
  return points;
}

export async function footFallback(points: { lat: number; lng: number }[], signal: AbortSignal): Promise<WalkingRoute | null> {
  await waitForSlot(signal);
  const json = JSON.stringify({ locations: points.map(p => ({ lat: p.lat, lon: p.lng })), costing: 'pedestrian', units: 'kilometers', directions_options: { directions_type: 'none' } });
  const response = await fetch(`https://valhalla1.openstreetmap.de/route?json=${encodeURIComponent(json)}`, { signal });
  if (!response.ok) return null;
  const { trip } = await response.json();
  if (trip?.status !== 0 || !Array.isArray(trip.legs) || !Number.isFinite(trip.summary?.length) || !Number.isFinite(trip.summary?.time)) return null;
  const latlngs = trip.legs.flatMap((leg: { shape: string }) => decodeFootShape(leg.shape));
  return latlngs.length < 2 ? null : { latlngs, distanceM: trip.summary.length * 1000, durationSec: trip.summary.time };
}

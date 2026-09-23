/** Google Maps multi-stop directions. Ported from the portfolio route helper. */
export type DirectionsPoint = { lat: number; lng: number };

export type DirectionsMode = 'walk' | 'transit';

/** Same hop the map treats as a walk when nothing else is known. */
const WALK_LINK_M = 1500;

function haversineM(a: DirectionsPoint, b: DirectionsPoint): number {
  const earthM = 6371000;
  const toRad = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * earthM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * `https://www.google.com/maps/dir/?api=1&…`
 * At most 9 intermediate waypoints. `null` when there is no route.
 */
export function googleDirectionsUrl(
  points: DirectionsPoint[],
  mode: DirectionsMode,
): string | null {
  if (points.length < 2) return null;

  const origin = `${points[0]?.lat},${points[0]?.lng}`;
  const destination = `${points[points.length - 1]?.lat},${points[points.length - 1]?.lng}`;
  const travelmode = mode === 'transit' ? 'transit' : 'walking';
  const params = new URLSearchParams({
    api: '1',
    origin,
    destination,
    travelmode,
  });

  const mid = points.slice(1, -1);
  if (mid.length > 0) {
    params.set(
      'waypoints',
      mid
        .slice(0, 9)
        .map((point) => `${point.lat},${point.lng}`)
        .join('|'),
    );
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

/** Walking for a short hop. Transit otherwise, so a long hop is not a walk link. */
export function directionsMode(from: DirectionsPoint, to: DirectionsPoint): DirectionsMode {
  return haversineM(from, to) <= WALK_LINK_M ? 'walk' : 'transit';
}

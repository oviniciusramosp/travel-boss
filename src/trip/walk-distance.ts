/** Metres walked on a date: the length of the walk segments the map draws for it. */
import type { Locale } from '../catalog';

const EARTH_M = 6_371_000;

/** Great-circle length of a `[lat, lng]` polyline, in metres. */
export function polylineMeters(latlngs: readonly (readonly [number, number])[]): number {
  let total = 0;
  for (let index = 1; index < latlngs.length; index += 1) {
    const [lat1, lng1] = latlngs[index - 1]!;
    const [lat2, lng2] = latlngs[index]!;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    total += 2 * EARTH_M * Math.asin(Math.sqrt(a));
  }
  return total;
}

/** Only the walk segments count: a train ride is not walked, its station walks are. */
export function walkedMeters(
  segments: readonly { mode: string; latlngs: readonly (readonly [number, number])[] }[],
): number {
  return segments.reduce((sum, segment) => (segment.mode === 'walk' ? sum + polylineMeters(segment.latlngs) : sum), 0);
}

/** `800 m`, `4,2 km`, `12 km`. Under 1 km in metres (to 50 m), under 10 km with one decimal. */
export function formatWalk(meters: number, locale: Locale): string {
  if (meters < 950) return `${Math.max(50, Math.round(meters / 50) * 50)} m`;
  const km = meters / 1000;
  const text = km < 9.95 ? km.toFixed(1) : String(Math.round(km));
  return `${locale === 'pt-BR' ? text.replace('.', ',') : text} km`;
}

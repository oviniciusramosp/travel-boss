/** Desktop selection zoom from the portfolio map: stay put at detail zoom, otherwise 14. */
export function selectionZoom(current: number): number {
  return current >= 13 ? current : Math.max(current, 14);
}

/** Pan when zoom barely changes; fly when the level actually changes. */
export function selectionEases(zoomDelta: number): 'pan' | 'fly' {
  return Math.abs(zoomDelta) < 0.4 ? 'pan' : 'fly';
}

/**
 * Point when the zoom barely changes, even if the place has an area.
 * Otherwise frame the area on the short flight.
 */
export function selectionFrame(
  currentZoom: number,
  hasArea: boolean,
): { zoom: number; ease: 'pan' | 'fly'; frame: 'point' | 'area' } {
  const zoom = selectionZoom(currentZoom);
  const ease = selectionEases(zoom - currentZoom);
  return { zoom, ease, frame: hasArea && ease === 'fly' ? 'area' : 'point' };
}

export function medianOf(nums: readonly number[]): number {
  if (nums.length === 0) return 0;
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1
    ? sorted[mid]!
    : (sorted[mid - 1]! + sorted[mid]!) / 2;
}

/** Great-circle distance in km. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const earthKm = 6371;
  const toRad = Math.PI / 180;
  const dLat = (lat2 - lat1) * toRad;
  const dLng = (lng2 - lng1) * toRad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLng / 2) ** 2;
  return 2 * earthKm * Math.asin(Math.sqrt(Math.min(1, a)));
}

export type FitPoint = { lat: number; lng: number; category?: string };

/**
 * Median center plus p75 × 1.45, at least 5.5 km.
 * Airports stay out of the sample so CDG/ORY do not inflate the core.
 */
export function centralFitRadiusKm(
  pins: readonly FitPoint[],
): { medLat: number; medLng: number; maxKm: number } | null {
  const nonAirport = pins.filter((pin) => pin.category !== 'airport');
  const sample = nonAirport.length > 0 ? nonAirport : pins;
  if (sample.length === 0) return null;
  const medLat = medianOf(sample.map((pin) => pin.lat));
  const medLng = medianOf(sample.map((pin) => pin.lng));
  if (sample.length < 4) return { medLat, medLng, maxKm: Number.POSITIVE_INFINITY };
  const distances = sample
    .map((pin) => haversineKm(pin.lat, pin.lng, medLat, medLng))
    .sort((a, b) => a - b);
  const p75 = distances[Math.floor((distances.length - 1) * 0.75)] ?? distances[distances.length - 1]!;
  return { medLat, medLng, maxKm: Math.max(p75 * 1.45, 5.5) };
}

export function pinIncludedInCityFit(
  pin: FitPoint,
  radius: { medLat: number; medLng: number; maxKm: number } | null,
): boolean {
  if (pin.category === 'airport') return false;
  if (!radius || !Number.isFinite(radius.maxKm)) return true;
  return haversineKm(pin.lat, pin.lng, radius.medLat, radius.medLng) <= radius.maxKm;
}

/** Core pins for `fit`. Falls back to whatever is left if the filter drops all of them. */
export function pointsForFit<T extends FitPoint>(points: readonly T[]): T[] {
  if (points.length === 0) return [];
  const radius = centralFitRadiusKm(points);
  const kept = points.filter((point) => pinIncludedInCityFit(point, radius));
  if (kept.length > 0) return kept;
  const grounded = points.filter((point) => point.category !== 'airport');
  return grounded.length > 0 ? grounded : [...points];
}

/** Tightest city zoom among the fitted places. Unknown places keep the fallback. */
export function fitMaxZoom(zooms: readonly number[], fallback = 16): number {
  let min = Number.POSITIVE_INFINITY;
  for (const zoom of zooms) {
    if (Number.isFinite(zoom)) min = Math.min(min, zoom);
  }
  return Number.isFinite(min) ? min : fallback;
}

export function paddedCenterOffset(padding: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}): { x: number; y: number } {
  return {
    x: (padding.right - padding.left) / 2,
    y: (padding.bottom - padding.top) / 2,
  };
}

export function diffPinIds(
  prev: readonly string[],
  next: readonly string[],
): { create: string[]; keep: string[]; remove: string[] } {
  const prevSet = new Set(prev);
  const seen = new Set<string>();
  const create: string[] = [];
  const keep: string[] = [];
  for (const id of next) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (prevSet.has(id)) keep.push(id);
    else create.push(id);
  }
  return { create, keep, remove: prev.filter((id) => !seen.has(id)) };
}

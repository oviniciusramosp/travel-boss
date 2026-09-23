/**
 * Session copy of walking geometry already fetched.
 * `fetchWalkingRoute` keeps the same paths, but its cache is private.
 * A repaint reads this first so the map does not flash a straight line.
 */

export type WalkPoint = { lat: number; lng: number };

const memory = new Map<string, [number, number][]>();

export function walkMemoryKey(from: WalkPoint, to: WalkPoint): string {
  return `${from.lat.toFixed(5)},${from.lng.toFixed(5)};${to.lat.toFixed(5)},${to.lng.toFixed(5)}`;
}

export function rememberedWalk(from: WalkPoint, to: WalkPoint): [number, number][] | undefined {
  return memory.get(walkMemoryKey(from, to));
}

export function rememberWalk(from: WalkPoint, to: WalkPoint, path: [number, number][]): void {
  if (path.length < 2) return;
  memory.set(walkMemoryKey(from, to), path);
}

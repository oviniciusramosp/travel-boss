/**
 * Session copy of walking geometry already fetched.
 * `fetchWalkingRoute` keeps the same paths, but its cache is private.
 * A repaint reads this first so the map does not flash a straight line.
 */

export type WalkPoint = { lat: number; lng: number };

const memory = new Map<string, [number, number][]>();

/** The ends and every point the walk must pass: a park walked in another order is another walk. */
export function walkMemoryKey(from: WalkPoint, to: WalkPoint, through: readonly (readonly [number, number])[] = []): string {
  const point = (lat: number, lng: number) => `${lat.toFixed(5)},${lng.toFixed(5)}`;
  return [point(from.lat, from.lng), ...through.map(([lat, lng]) => point(lat, lng)), point(to.lat, to.lng)].join(';');
}

export function rememberedWalk(
  from: WalkPoint,
  to: WalkPoint,
  through: readonly (readonly [number, number])[] = [],
): [number, number][] | undefined {
  return memory.get(walkMemoryKey(from, to, through));
}

export function rememberWalk(
  from: WalkPoint,
  to: WalkPoint,
  path: [number, number][],
  through: readonly (readonly [number, number])[] = [],
): void {
  if (path.length < 2) return;
  memory.set(walkMemoryKey(from, to, through), path);
}

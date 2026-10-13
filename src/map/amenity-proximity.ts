import { amenityCellBox, amenityCellKey, CELL } from './amenity-cells';
import type { Amenity } from './amenities';

export type Point = readonly [number, number];
export type Line = readonly Point[];
export type Box = readonly [number, number, number, number];
export const AMENITY_RADIUS_M = 150;
export const LOCATION_RADIUS_M = 500;
export const MAX_AMENITIES_PER_KIND = 24;
type Segment = readonly [Point, Point];
export type WalkIndex = Map<string, Segment[]>;

/** Local flat projection, in meters. */
export function toSegment(p: Point, a: Point, b: Point): number {
  const k = Math.cos(p[0] * (Math.PI / 180)) * 111_320;
  const ax = a[1] * k, ay = a[0] * 111_320, bx = b[1] * k, by = b[0] * 111_320;
  const px = p[1] * k, py = p[0] * 111_320;
  const dx = bx - ax, dy = by - ay, len = dx * dx + dy * dy;
  const t = len ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len)) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

export function aroundPoint(point: Point, meters = LOCATION_RADIUS_M): Box {
  const dy = meters / 111_320, dx = dy / Math.cos(point[0] * Math.PI / 180);
  return [point[0] - dy, point[1] - dx, point[0] + dy, point[1] + dx];
}

/** Built once per route. Each point checks only segments in its own tile. */
export function indexWalks(lines: readonly Line[], radius = AMENITY_RADIUS_M): WalkIndex {
  const cells: WalkIndex = new Map();
  for (const line of lines) for (let i = 0; i < (line.length === 1 ? 1 : line.length - 1); i++) {
    const a = line[i], b = line[i + 1] ?? a;
    const pad = radius / 111_320, dx = pad / Math.cos(Math.max(Math.abs(a[0]), Math.abs(b[0])) * Math.PI / 180);
    for (let y = Math.floor((Math.min(a[0], b[0]) - pad) / CELL); y <= Math.floor((Math.max(a[0], b[0]) + pad) / CELL); y++) {
      for (let x = Math.floor((Math.min(a[1], b[1]) - dx) / CELL); x <= Math.floor((Math.max(a[1], b[1]) + dx) / CELL); x++) {
        const key = `${y}_${x}`;
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key)!.push([a, b]);
      }
    }
  }
  return cells;
}

function walkDistance(point: Point, walks: WalkIndex): number {
  let best = Infinity;
  for (const [a, b] of walks.get(amenityCellKey(...point)) ?? []) best = Math.min(best, toSegment(point, a, b));
  return best;
}

export function nearLines(points: readonly Amenity[], lines: readonly Line[], radius = AMENITY_RADIUS_M): Amenity[] {
  const walks = indexWalks(lines, radius);
  return points.filter(point => walkDistance([point.lat, point.lng], walks) <= radius);
}

/** GPS vicinity and walking corridor are a union; no GPS/route falls back to the map center. */
export function nearbyAmenities(points: readonly Amenity[], walks: WalkIndex, focus: Point | null, center: Point) {
  const counts = { water: 0, toilet: 0 };
  return points.flatMap(point => {
    if (point.kind === 'water' && point.tags.fee === 'yes') return [];
    const p: Point = [point.lat, point.lng], route = walkDistance(p, walks);
    const location = focus ? toSegment(p, focus, focus) : Infinity;
    if (route > AMENITY_RADIUS_M && location > LOCATION_RADIUS_M) return [];
    return [{ point, near: route <= AMENITY_RADIUS_M, priority: location <= LOCATION_RADIUS_M ? 0 : 1,
      distance: location <= LOCATION_RADIUS_M ? location : toSegment(p, center, center) }];
  }).sort((a, b) => a.priority - b.priority || a.distance - b.distance)
    .filter(({ point }) => counts[point.kind]++ < MAX_AMENITIES_PER_KIND);
}

export function boxesOverlap(a: Box, b: Box): boolean {
  return a[0] <= b[2] && b[0] <= a[2] && a[1] <= b[3] && b[1] <= a[3];
}

export function neededAmenityCells(index: Record<string, Box>, view: Box, walks: WalkIndex, focus: Point | null): string[] {
  const nearby = focus ? aroundPoint(focus) : null;
  return Object.keys(index).filter(key => boxesOverlap(index[key], view) &&
    (walks.has(key) || (nearby && boxesOverlap(amenityCellBox(key), nearby))));
}

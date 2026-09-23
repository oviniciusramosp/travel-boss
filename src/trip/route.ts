import { expandTimelineTransferParts, type ItineraryLegDef } from '../catalog';
import type { MapRouteSegment } from '../map/types';
import type { TransferLeg } from '../views/transfer-row';
import { resolveTripLeg, type CatalogLegStroke, type TripLegPoint } from './legs';
import type { TripLeg } from './parse';
import { rememberedWalk } from './walk-memory';

export type RouteHop = {
  from: TripLegPoint;
  to: TripLegPoint;
  via?: TripLeg;
};

/** Catalog parts win over `via:`. No row when nothing was authored and nothing is in the catalog. */
export function transferLegs(hop: RouteHop): TransferLeg[] {
  const decision = resolveTripLeg(hop.from, hop.to, hop.via);
  if (decision.kind === 'catalog') {
    return expandTimelineTransferParts(decision.leg, hop.from, hop.to);
  }
  return hop.via ? [hop.via] : [];
}

function geometrySegments(strokes: CatalogLegStroke[]): MapRouteSegment[] {
  return strokes.map((stroke) => ({
    mode: 'transit' as const,
    latlngs: stroke.path,
    ...(stroke.color ? { color: stroke.color } : {}),
  }));
}

/** Neutral chord: dashed, not the blue walk stroke. */
export function neutralStraight(
  from: TripLegPoint,
  to: TripLegPoint,
  color: string,
): MapRouteSegment {
  return {
    mode: 'transit',
    dash: true,
    latlngs: [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ],
    color,
  };
}

export type HopDraw =
  | { kind: 'geometry'; segments: MapRouteSegment[] }
  | { kind: 'catalog'; leg: ItineraryLegDef }
  | { kind: 'walk' }
  | { kind: 'straight' };

/** Switches on `resolveTripLeg` and does not reapply its precedence. */
export function planHop(hop: RouteHop): HopDraw {
  const decision = resolveTripLeg(hop.from, hop.to, hop.via);
  if (decision.kind === 'catalog' && decision.geometry) {
    return { kind: 'geometry', segments: geometrySegments(decision.geometry) };
  }
  if (decision.kind === 'catalog' && decision.leg.mode === 'walk') return { kind: 'walk' };
  if (decision.kind === 'catalog') return { kind: 'catalog', leg: decision.leg };
  if (decision.kind === 'osrm') return { kind: 'walk' };
  return { kind: 'straight' };
}

/**
 * Cached walk geometry, catalog strokes, or a neutral straight line.
 * `null` when the hop still needs a fetch — no straight stand-in.
 */
export function previewHop(hop: RouteHop, neutralColor: string): MapRouteSegment[] | null {
  const plan = planHop(hop);
  if (plan.kind === 'geometry') return plan.segments;
  if (plan.kind === 'straight') return [neutralStraight(hop.from, hop.to, neutralColor)];
  if (plan.kind === 'walk') {
    const cached = rememberedWalk(hop.from, hop.to);
    return cached ? [{ mode: 'walk', latlngs: cached }] : null;
  }
  return null;
}

export type RouteDeps = {
  neutralColor: string;
  walk: (from: TripLegPoint, to: TripLegPoint) => Promise<[number, number][] | null>;
  catalog: (
    leg: ItineraryLegDef,
    from: TripLegPoint,
    to: TripLegPoint,
  ) => Promise<MapRouteSegment[]>;
};

/** `straight` never calls `walk` or `catalog`. `geometry` does not either. */
export async function resolveHopSegments(
  hops: readonly RouteHop[],
  deps: RouteDeps,
): Promise<MapRouteSegment[]> {
  const segments: MapRouteSegment[] = [];
  for (const hop of hops) {
    const plan = planHop(hop);
    if (plan.kind === 'geometry') {
      segments.push(...plan.segments);
      continue;
    }
    if (plan.kind === 'straight') {
      segments.push(neutralStraight(hop.from, hop.to, deps.neutralColor));
      continue;
    }
    if (plan.kind === 'walk') {
      const path = await deps.walk(hop.from, hop.to);
      segments.push(
        path && path.length >= 2
          ? { mode: 'walk', latlngs: path }
          : {
              mode: 'walk',
              latlngs: [
                [hop.from.lat, hop.from.lng],
                [hop.to.lat, hop.to.lng],
              ],
            },
      );
      continue;
    }
    segments.push(...(await deps.catalog(plan.leg, hop.from, hop.to)));
  }
  return segments;
}

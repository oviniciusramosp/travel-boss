import {
  lineBrandColor,
  milanDayLegsById,
  parisDayLegsById,
  type ItineraryLegDef,
} from '../catalog';
import type { TripLeg } from './parse';

/** At or under this haversine, a hop with no catalog leg and no via is a walk. */
const WALK_FALLBACK_M = 1500;

export type TripLegPoint = {
  id?: string;
  lat: number;
  lng: number;
};

/** Authored spine. `path` is catalog order, [lat, lng]. */
export type CatalogLegStroke = {
  path: [number, number][];
  /** Line brand color, or null when the catalog has none. */
  color: string | null;
  lineId?: string;
  label?: string;
};

/**
 * Draw instruction for one from→to hop. No network.
 * Mount switches on `kind` and does not reapply this precedence.
 *
 * `catalog` — authored leg. `geometry` is set only when that leg already
 * has coordinates (one stroke per hop, with its color). A catalog walk,
 * or transit without a surveyed path, has no geometry: draw `leg`, not the via.
 * `osrm` — fetch a walking route between the two stops.
 * `straight` — neutral dashed line between the stops. Do not call OSRM.
 */
export type TripLegDecision =
  | {
      kind: 'catalog';
      leg: ItineraryLegDef;
      geometry?: CatalogLegStroke[];
    }
  | { kind: 'osrm' }
  | { kind: 'drive' }
  | { kind: 'flight' }
  | { kind: 'none' };

function pairKey(from: string, to: string): string {
  return `${from}\0${to}`;
}

/** First from→to wins. Repeated pairs in the catalog are the same walk. */
const catalogLegByPair = new Map<string, ItineraryLegDef>();
for (const days of [parisDayLegsById, milanDayLegsById]) {
  for (const legs of Object.values(days)) {
    for (const leg of legs) {
      const key = pairKey(leg.from, leg.to);
      if (!catalogLegByPair.has(key)) catalogLegByPair.set(key, leg);
    }
  }
}

function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
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

/** Spine already stored on the leg. Hops win over a single `path`. */
function catalogGeometry(leg: ItineraryLegDef): CatalogLegStroke[] | undefined {
  const strokes: CatalogLegStroke[] = [];
  if (leg.hops && leg.hops.length > 0) {
    for (const hop of leg.hops) {
      if (hop.path.length < 2) continue;
      strokes.push({
        path: hop.path,
        color: lineBrandColor(hop.line) ?? null,
        lineId: hop.line,
        ...(hop.label ? { label: hop.label } : {}),
      });
    }
  } else if (leg.path && leg.path.length >= 2) {
    strokes.push({
      path: leg.path,
      color: lineBrandColor(leg.line) ?? null,
      ...(leg.line ? { lineId: leg.line } : {}),
      ...(leg.label ? { label: leg.label } : {}),
    });
  }
  return strokes.length > 0 ? strokes : undefined;
}

/**
 * Precedence: catalog pair, then the authored mode.
 * Walk and an unnamed hop follow streets. Taxi follows the road.
 * Flights use an illustrative curve; transit needs a catalog spine.
 */
export function resolveTripLeg(
  from: TripLegPoint,
  to: TripLegPoint,
  via?: TripLeg,
): TripLegDecision {
  if (from.id && to.id) {
    const leg = catalogLegByPair.get(pairKey(from.id, to.id));
    if (leg) {
      const geometry = catalogGeometry(leg);
      return geometry ? { kind: 'catalog', leg, geometry } : { kind: 'catalog', leg };
    }
  }

  if (via?.mode === 'taxi') return { kind: 'drive' };
  if (via?.mode === 'flight') return { kind: 'flight' };
  if (via?.mode === 'transit') return { kind: 'none' };
  if (via?.mode === 'walk' || haversineM(from, to) <= WALK_FALLBACK_M) return { kind: 'osrm' };
  return { kind: 'osrm' };
}

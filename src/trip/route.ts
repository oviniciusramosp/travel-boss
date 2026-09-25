import { expandTimelineTransferParts, type ItineraryLegDef } from '../catalog';
import type { MapRouteSegment } from '../map/types';
import type { TransferLeg } from '../views/transfer-row';
import type { DatedDay } from './calendar';
import { resolveTripLeg, type TripLegPoint } from './legs';
import type { TripDay, TripLeg } from './parse';
import { rememberedWalk } from './walk-memory';

export type DateStop = {
  dated: DatedDay;
  stopIndex: number;
  /** Leg drawn after this stop. A city's `via:` leaves on the last stop of its last day. */
  depart?: TripLeg;
};

function lastPlaceIndex(day: TripDay): number {
  for (let index = day.stops.length - 1; index >= 0; index -= 1) {
    if (!day.stops[index]?.listNote) return index;
  }
  return -1;
}

/**
 * Stops of one calendar date, in authored order.
 * The city `via:` is the hop off the last stop of that city's last day,
 * including when the next city shares the date.
 */
export function dateStops(days: readonly DatedDay[]): DateStop[] {
  const rows: DateStop[] = [];
  for (const dated of days) {
    dated.day.stops.forEach((_, stopIndex) => {
      rows.push({ dated, stopIndex });
    });
  }
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    if (!row) continue;
    const stop = row.dated.day.stops[row.stopIndex];
    if (!stop || stop.listNote) continue;
    if (stop.leg) {
      row.depart = stop.leg;
      continue;
    }
    const city = row.dated.city;
    if (!city.leg || row.dated.dayIndex !== city.days.length - 1) continue;
    if (row.stopIndex !== lastPlaceIndex(row.dated.day)) continue;
    const next = rows.slice(index + 1).find((item) => {
      const candidate = item.dated.day.stops[item.stopIndex];
      return Boolean(candidate && !candidate.listNote);
    });
    if (next && next.dated.city === city) continue;
    row.depart = city.leg;
  }
  return rows;
}

export type RouteHop = {
  from: TripLegPoint;
  to: TripLegPoint;
  via?: TripLeg;
};

function endpoints(hop: RouteHop): Pick<MapRouteSegment, 'fromId' | 'toId'> {
  return {
    ...(hop.from.id ? { fromId: hop.from.id } : {}),
    ...(hop.to.id ? { toId: hop.to.id } : {}),
  };
}

/** Catalog parts win over `via:`. No row when nothing was authored and nothing is in the catalog. */
export function transferLegs(hop: RouteHop): TransferLeg[] {
  const decision = resolveTripLeg(hop.from, hop.to, hop.via);
  if (decision.kind === 'catalog') {
    return expandTimelineTransferParts(decision.leg, hop.from, hop.to);
  }
  return hop.via ? [hop.via] : [];
}

export type HopDraw =
  | { kind: 'catalog'; leg: ItineraryLegDef }
  | { kind: 'walk' }
  | { kind: 'drive' }
  | { kind: 'none' };

/** Switches on `resolveTripLeg` and does not reapply its precedence. */
export function planHop(hop: RouteHop): HopDraw {
  const decision = resolveTripLeg(hop.from, hop.to, hop.via);
  if (decision.kind === 'catalog' && decision.leg.mode === 'walk') return { kind: 'walk' };
  if (decision.kind === 'catalog') return { kind: 'catalog', leg: decision.leg };
  if (decision.kind === 'drive') return { kind: 'drive' };
  if (decision.kind === 'osrm') return { kind: 'walk' };
  return { kind: 'none' };
}

/**
 * Cached walk geometry, catalog strokes, or a neutral straight line.
 * `null` when the hop still needs a fetch — no straight stand-in.
 */
export function previewHop(hop: RouteHop, _neutralColor: string): MapRouteSegment[] | null {
  const plan = planHop(hop);
  if (plan.kind === 'none') return [];
  if (plan.kind === 'walk') {
    const cached = rememberedWalk(hop.from, hop.to);
    return cached ? [{ mode: 'walk', latlngs: cached, ...endpoints(hop) }] : null;
  }
  return null;
}

export type RouteDeps = {
  neutralColor: string;
  walk: (from: TripLegPoint, to: TripLegPoint) => Promise<[number, number][] | null>;
  drive: (from: TripLegPoint, to: TripLegPoint) => Promise<[number, number][] | null>;
  catalog: (
    leg: ItineraryLegDef,
    from: TripLegPoint,
    to: TripLegPoint,
  ) => Promise<MapRouteSegment[]>;
  /** Called after each hop so a slow leg does not hide the routes already found. */
  onUpdate?: (segments: readonly MapRouteSegment[]) => void;
};

/** A missing path is left out. Nothing here becomes a two-point chord. */
export async function resolveHopSegments(
  hops: readonly RouteHop[],
  deps: RouteDeps,
): Promise<MapRouteSegment[]> {
  const segments: MapRouteSegment[] = [];
  for (const hop of hops) {
    try {
      const plan = planHop(hop);
      if (plan.kind === 'none') continue;
      if (plan.kind === 'walk' || plan.kind === 'drive') {
        const path = plan.kind === 'walk' ? await deps.walk(hop.from, hop.to) : await deps.drive(hop.from, hop.to);
        if (!path || path.length < 2) continue;
        segments.push(
          plan.kind === 'walk'
            ? { mode: 'walk', latlngs: path, ...endpoints(hop) }
            : { mode: 'transit', latlngs: path, color: deps.neutralColor, ...endpoints(hop) },
        );
        continue;
      }
      const drawn = await deps.catalog(plan.leg, hop.from, hop.to);
      for (const segment of drawn) {
        if (segment.latlngs.length >= 2) segments.push(segment);
      }
    } catch {
      /* This hop stays off the map. The others still draw. */
    }
    deps.onUpdate?.(segments);
  }
  return segments;
}

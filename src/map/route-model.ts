import type { MapRouteSegment, MapRouteTransfer } from './types';

export type RouteFocus =
  | null
  | { kind: 'place'; id: string }
  | { kind: 'leg'; from: string; to: string; hop?: number; walk?: number; mode?: 'walk' | 'transit' };

export type RouteStation = { lat: number; lng: number; end: boolean };

/** Walk dash, neutral chord, or a transit spine. A chord stays a chord. */
export function routeLayerKind(segment: MapRouteSegment): 'walk' | 'dash' | 'transit' {
  if (segment.mode === 'walk') return 'walk';
  if (segment.dash === true) return 'dash';
  return 'transit';
}

function nearTransfer(
  pair: readonly [number, number],
  transfers: readonly MapRouteTransfer[],
): boolean {
  return transfers.some(
    (point) => Math.abs(point.lat - pair[0]) < 0.0004 && Math.abs(point.lng - pair[1]) < 0.0004,
  );
}

/** Station dots along a transit spine. A road route and a walk have none. */
export function stationsFor(segment: MapRouteSegment): RouteStation[] {
  if (routeLayerKind(segment) !== 'transit' || segment.latlngs.length < 2) return [];
  // A road route has no line id and far more vertices than a station spine.
  if (!segment.lineId && segment.latlngs.length > 12) return [];
  const transfers = segment.transfers ?? [];
  const last = segment.latlngs.length - 1;
  const stations: RouteStation[] = [];
  segment.latlngs.forEach((pair, index) => {
    if (nearTransfer(pair, transfers)) return;
    stations.push({ lat: pair[0], lng: pair[1], end: index === 0 || index === last });
  });
  return stations;
}

export function routeEmphasis(
  focus: RouteFocus,
  segment: { fromId?: string; toId?: string; hopIndex?: number; walkIndex?: number; mode?: 'walk' | 'transit' },
): 'normal' | 'hot' | 'dim' {
  if (!focus) return 'normal';
  const { fromId, toId } = segment;
  if (!fromId || !toId) return 'dim';
  if (focus.kind === 'place') return fromId === focus.id || toId === focus.id ? 'hot' : 'dim';
  if (fromId !== focus.from || toId !== focus.to) return 'dim';
  if (focus.hop != null) return segment.hopIndex === focus.hop ? 'hot' : 'dim';
  if (focus.walk != null) return segment.mode === 'walk' && segment.walkIndex === focus.walk ? 'hot' : 'dim';
  if (focus.mode) return segment.mode === focus.mode ? 'hot' : 'dim';
  return 'hot';
}

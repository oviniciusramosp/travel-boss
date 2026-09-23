import type { MapRouteSegment, MapRouteTransfer } from './types';

export type RouteFocus =
  | null
  | { kind: 'place'; id: string }
  | { kind: 'leg'; from: string; to: string };

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

/** Station dots along a transit spine. A neutral dash and a walk have none. */
export function stationsFor(segment: MapRouteSegment): RouteStation[] {
  if (routeLayerKind(segment) !== 'transit' || segment.latlngs.length < 2) return [];
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
  segment: { fromId?: string; toId?: string },
): 'normal' | 'hot' | 'dim' {
  if (!focus) return 'normal';
  const { fromId, toId } = segment;
  if (!fromId || !toId) return 'dim';
  if (focus.kind === 'place') return fromId === focus.id || toId === focus.id ? 'hot' : 'dim';
  return fromId === focus.from && toId === focus.to ? 'hot' : 'dim';
}

type RouteSource = {
  segments: readonly {
    mode: 'walk' | 'transit';
    latlngs: [number, number][];
    color?: string;
    fromId?: string;
    toId?: string;
    hopIndex?: number;
  }[];
  transfers?: readonly {
    lat: number;
    lng: number;
    fromColor: string;
    toColor: string;
    fromLabel?: string;
    toLabel?: string;
    fromId?: string;
    toId?: string;
    hopIndex?: number;
  }[];
};

/** Copy builder output onto `MapRouteSegment`, including two-color transfers. */
export function toMapRoute(route: RouteSource): MapRouteSegment[] {
  const transfers = route.transfers ?? [];
  return route.segments.map((segment) => {
    const mine =
      segment.mode === 'transit'
        ? transfers.filter(
            (point) =>
              point.fromId === segment.fromId &&
              point.toId === segment.toId &&
              point.hopIndex === segment.hopIndex,
          )
        : [];
    return {
      mode: segment.mode,
      latlngs: segment.latlngs,
      ...(segment.color ? { color: segment.color } : {}),
      ...(segment.fromId ? { fromId: segment.fromId } : {}),
      ...(segment.toId ? { toId: segment.toId } : {}),
      ...(segment.hopIndex != null ? { hopIndex: segment.hopIndex } : {}),
      ...(mine.length
        ? {
            transfers: mine.map((point) => {
              const label = [point.fromLabel, point.toLabel].filter(Boolean).join(' → ');
              return {
                lat: point.lat,
                lng: point.lng,
                fromColor: point.fromColor,
                toColor: point.toColor,
                ...(label ? { label } : {}),
              };
            }),
          }
        : {}),
    };
  });
}

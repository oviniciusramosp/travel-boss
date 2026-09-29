import {
  divIcon,
  marker,
  polyline,
  type LayerGroup,
  type Marker,
  type Polyline,
  type Renderer,
} from 'leaflet';
import { cssToken } from '../ui/motion';
import { routeEmphasis, routeLayerKind, stationsFor, type RouteFocus } from './route-model';
import type { MapRouteSegment } from './types';

const WALK_FALLBACK = '#008fff';

function walkColor(): string {
  return cssToken('--color-walk', WALK_FALLBACK);
}

export type RouteEntry = {
  fromId?: string;
  toId?: string;
  hopIndex?: number;
  walkIndex?: number;
  mode: 'walk' | 'transit';
  line: Polyline;
  flow?: Polyline;
  marks: Marker[];
};

export type RoutePointer = {
  from: string;
  to: string;
  hop?: number;
  walk?: number;
  mode?: 'walk' | 'transit';
} | null;

function safeColor(value: string | undefined, fallback: string): string {
  const color = (value ?? '').trim();
  return /^#[0-9a-fA-F]{3,8}$/.test(color) ? color : fallback;
}

/**
 * `raise` brings the hot line to the front. Only for a hover from the list: moving the
 * SVG path under the cursor makes Chrome drop its `mouseout`, and the hover sticks.
 */
export function paintRouteFocus(entries: readonly RouteEntry[], focus: RouteFocus, raise = true): void {
  for (const entry of entries) {
    const emphasis = routeEmphasis(focus, entry);
    const hot = emphasis === 'hot';
    const dim = emphasis === 'dim';
    for (const path of [entry.line, entry.flow]) {
      const node = path?.getElement();
      if (!node) continue;
      node.classList.toggle('is-hot', hot);
      node.classList.toggle('is-dim', dim);
    }
    for (const mark of entry.marks) {
      const node = mark.getElement();
      if (!node) continue;
      node.classList.toggle('is-hot', hot);
      node.classList.toggle('is-dim', dim);
      mark.setZIndexOffset(hot ? 900 : 600);
    }
    if (hot && raise) {
      entry.line.bringToFront();
      entry.flow?.bringToFront();
    }
  }
}

/** SVG strokes so the transit dash can animate. A neutral `dash` stays a static chord. */
export function drawRouteSegments(
  group: LayerGroup,
  renderer: Renderer,
  segments: readonly MapRouteSegment[],
  onPointer: (leg: RoutePointer) => void,
  onSubPoint?: (parentId: string, index: number) => void,
): { entries: RouteEntry[]; points: [number, number][] } {
  const entries: RouteEntry[] = [];
  const points: [number, number][] = [];
  for (const segment of segments) {
    if (segment.latlngs.length < 2) continue;
    const kind = routeLayerKind(segment);
    const color = kind === 'walk' ? walkColor() : safeColor(segment.color, walkColor());
    const dashed = kind !== 'transit';
    const mode: 'walk' | 'transit' = kind === 'walk' ? 'walk' : 'transit';
    const line = polyline(segment.latlngs, {
      renderer,
      color,
      weight: dashed ? 3 : 4,
      opacity: 0.9,
      dashArray: kind === 'flight' ? '18 10' : dashed ? '2 10' : undefined,
      lineCap: 'round',
      lineJoin: 'round',
      interactive: true,
      bubblingMouseEvents: false,
      className: `tb-route tb-route-${kind}`,
    });
    const leg: RoutePointer =
      segment.fromId && segment.toId
        ? {
            from: segment.fromId,
            to: segment.toId,
            mode,
            ...(segment.hopIndex != null ? { hop: segment.hopIndex } : {}),
            ...(segment.walkIndex != null ? { walk: segment.walkIndex } : {}),
          }
        : null;
    if (leg) {
      line.on('mouseover', () => onPointer(leg));
      line.on('mouseout', () => onPointer(null));
    }
    line.addTo(group);
    let flow: Polyline | undefined;
    if (kind === 'transit') {
      flow = polyline(segment.latlngs, {
        renderer,
        color: cssToken('--color-paper', '#ffffff'),
        weight: 2.5,
        opacity: 1,
        dashArray: '6 22',
        lineCap: 'round',
        lineJoin: 'round',
        interactive: false,
        bubblingMouseEvents: false,
        className: 'tb-route-flow',
      });
      flow.addTo(group);
    }
    const marks: Marker[] = [];
    if (kind === 'transit') {
      for (const station of stationsFor(segment)) {
        const dot = marker([station.lat, station.lng], {
          icon: divIcon({
            className: station.end ? 'tb-station-wrap is-end' : 'tb-station-wrap',
            html: `<span class="tb-station-dot" style="--station-color:${color}"></span>`,
            iconSize: [16, 16],
            iconAnchor: [8, 8],
          }),
          interactive: false,
          keyboard: false,
          zIndexOffset: station.end ? 640 : 600,
        });
        dot.addTo(group);
        marks.push(dot);
      }
      for (const transfer of segment.transfers ?? []) {
        if (!Number.isFinite(transfer.lat) || !Number.isFinite(transfer.lng)) continue;
        const fromColor = safeColor(transfer.fromColor, color);
        const toColor = safeColor(transfer.toColor, walkColor());
        const dot = marker([transfer.lat, transfer.lng], {
          icon: divIcon({
            className: 'tb-transfer-wrap',
            html:
              `<span class="tb-transfer-dot">` +
              `<span class="tb-transfer-dot__half" style="background:${fromColor}"></span>` +
              `<span class="tb-transfer-dot__half" style="background:${toColor}"></span>` +
              `</span>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          }),
          interactive: true,
          keyboard: false,
          bubblingMouseEvents: false,
          title: transfer.label,
          zIndexOffset: 720,
        });
        if (transfer.label) {
          dot.bindTooltip(transfer.label, {
            direction: 'top',
            opacity: 1,
            className: 'tb-pin-tip',
          });
        }
        if (leg) {
          dot.on('mouseover', () => onPointer(leg));
          dot.on('mouseout', () => onPointer(null));
        }
        dot.addTo(group);
        marks.push(dot);
        points.push([transfer.lat, transfer.lng]);
      }
    }
    for (const sub of segment.subPoints ?? []) {
      if (!Number.isFinite(sub.lat) || !Number.isFinite(sub.lng)) continue;
      const dot = marker([sub.lat, sub.lng], {
        icon: divIcon({
          className: 'tb-subpoint-wrap',
          html: `<span class="tb-subpoint-dot" style="--subpoint-color:${safeColor(sub.color, walkColor())}"></span>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        }),
        interactive: true,
        keyboard: false,
        bubblingMouseEvents: false,
        title: sub.label,
        zIndexOffset: 700,
      });
      dot.bindTooltip(sub.label, { direction: 'top', opacity: 1, className: 'tb-pin-tip' });
      if (leg) {
        dot.on('mouseover', () => onPointer(leg));
        dot.on('mouseout', () => onPointer(null));
      }
      // The dot stands for the point (and for the place it may be): a click opens the parent's card there.
      if (sub.parentId != null && sub.index != null && onSubPoint) {
        const parentId = sub.parentId;
        const index = sub.index;
        dot.on('click', () => onSubPoint(parentId, index));
      }
      dot.addTo(group);
      marks.push(dot);
      points.push([sub.lat, sub.lng]);
    }
    entries.push({
      fromId: segment.fromId,
      toId: segment.toId,
      ...(segment.hopIndex != null ? { hopIndex: segment.hopIndex } : {}),
      ...(segment.walkIndex != null ? { walkIndex: segment.walkIndex } : {}),
      mode,
      line,
      flow,
      marks,
    });
    for (const pair of segment.latlngs) points.push(pair);
  }
  return { entries, points };
}

import {
  circleMarker,
  layerGroup,
  polygon,
  polyline,
  svg,
  type Layer,
  type LayerGroup,
  type Map as LeafletMap,
  type Path,
  type PathOptions,
} from 'leaflet';
import { placeCategoryMeta } from '../catalog';
import { drawableRings } from './area-shape';
import { resolvedPlace } from './place-index';
import { transitLineForPlace } from './transit';

function fadeMs(): number {
  if (typeof document === 'undefined') return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--dur-slow').trim();
  const ms = Number.parseFloat(raw);
  return Number.isFinite(ms) ? ms : 0;
}

function paint(layer: Layer, visible: boolean) {
  const mark = (path: Path) => path.getElement()?.classList.toggle('is-visible', visible);
  if ('eachLayer' in layer && typeof layer.eachLayer === 'function') {
    (layer as LayerGroup).eachLayer((child) => {
      if ('getElement' in child && typeof child.getElement === 'function') mark(child as Path);
    });
    return;
  }
  if ('getElement' in layer && typeof layer.getElement === 'function') mark(layer as Path);
}

/**
 * Area shapes on an SVG pane. `preferCanvas` would ignore a CSS opacity fade.
 * Hover and selection pass ids; leaving an id fades the shape out.
 */
export function mountPlaceOverlays(map: LeafletMap): { sync(ids: readonly string[]): void } {
  map.createPane('tb-area');
  const renderer = svg({ pane: 'tb-area' });
  const active = new Map<string, { layer: Layer; timer: number; on: boolean }>();

  const polyOptions = (color: string): PathOptions => ({
    renderer,
    interactive: false,
    bubblingMouseEvents: false,
    stroke: false,
    color,
    fillColor: color,
    fillOpacity: 0.52,
    className: 'tb-area tb-area--poly',
  });

  const build = (id: string): Layer | null => {
    const line = transitLineForPlace(id);
    if (line && line.stations.length >= 2) {
      const group = layerGroup();
      group.addLayer(
        polyline(
          line.stations.map((station) => [station.lat, station.lng] as [number, number]),
          {
            renderer,
            interactive: false,
            bubblingMouseEvents: false,
            className: 'tb-area tb-area--line',
            color: line.color,
            weight: 6,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round',
          },
        ),
      );
      for (const station of line.stations) {
        const dot = circleMarker([station.lat, station.lng], {
          renderer,
          radius: 5,
          weight: 2,
          color: line.color,
          fillColor: line.color,
          fillOpacity: 1,
          opacity: 1,
          className: 'tb-area tb-station',
          interactive: true,
          bubblingMouseEvents: false,
        });
        dot.bindTooltip(station.name, {
          direction: 'top',
          opacity: 1,
          offset: [0, -6],
          className: 'tb-pin-tip',
        });
        group.addLayer(dot);
      }
      return group;
    }
    const place = resolvedPlace(id);
    const area = place?.area;
    if (!area) return null;
    const drawn = drawableRings(area);
    if (!drawn.paths.length) return null;
    const color = placeCategoryMeta[place.category]?.color ?? '#0a0a0a';
    if (drawn.line) {
      return polyline(drawn.paths[0]!, {
        renderer,
        interactive: false,
        bubblingMouseEvents: false,
        className: 'tb-area tb-area--line',
        color,
        weight: 6,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round',
      });
    }
    const group = layerGroup();
    for (const ring of drawn.paths) group.addLayer(polygon(ring, polyOptions(color)));
    return group;
  };

  const reveal = (id: string) => {
    const entry = active.get(id);
    if (!entry) return;
    if (!map.hasLayer(entry.layer)) entry.layer.addTo(map);
    paint(entry.layer, false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const current = active.get(id);
        if (current?.on) paint(current.layer, true);
      });
    });
  };

  const show = (id: string) => {
    const existing = active.get(id);
    if (existing) {
      window.clearTimeout(existing.timer);
      existing.timer = 0;
      existing.on = true;
      reveal(id);
      return;
    }
    const layer = build(id);
    if (!layer) return;
    active.set(id, { layer, timer: 0, on: true });
    reveal(id);
  };

  const hide = (id: string) => {
    const entry = active.get(id);
    if (!entry) return;
    entry.on = false;
    paint(entry.layer, false);
    window.clearTimeout(entry.timer);
    entry.timer = window.setTimeout(() => {
      if (entry.on) return;
      entry.layer.remove();
      active.delete(id);
    }, fadeMs());
  };

  return {
    sync(ids) {
      const next = new Set(ids);
      for (const id of active.keys()) {
        if (!next.has(id)) hide(id);
      }
      for (const id of next) {
        const entry = active.get(id);
        if (!entry || !map.hasLayer(entry.layer)) {
          show(id);
          continue;
        }
        if (!entry.on || entry.timer) {
          window.clearTimeout(entry.timer);
          entry.timer = 0;
          entry.on = true;
          paint(entry.layer, true);
        }
      }
    },
  };
}

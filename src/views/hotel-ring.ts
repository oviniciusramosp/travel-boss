import type { Circle, Layer, Map as LeafletMap } from 'leaflet';
import { cssToken } from '../ui/motion';

export type SearchRing = { lat: number; lng: number; km: number };

type LeafletNs = typeof import('leaflet');

let liveMap: LeafletMap | null = null;
let ring: Circle | null = null;
let leafletNs: Promise<LeafletNs> | null = null;
let generation = 0;
let latest: SearchRing | null = null;

function loadLeaflet(): Promise<LeafletNs> {
  leafletNs ??= import('leaflet');
  return leafletNs;
}

function ink(): string {
  return cssToken('--color-ink', '#0a0a0a');
}

function paint(layer: Circle, km: number): void {
  const color = ink();
  layer.setRadius(km * 1000);
  layer.setStyle({
    color,
    fillColor: color,
    fillOpacity: 0.04,
    weight: 1,
    dashArray: '4 6',
  });
  layer.getElement()?.classList.add('tb-hotel-ring');
}

function capture(L: LeafletNs, draw: () => void, spec: SearchRing): void {
  if (!ring) {
    const proto = L.Map.prototype as unknown as {
      addLayer: (this: LeafletMap, layer: Layer) => LeafletMap;
    };
    const original = proto.addLayer;
    proto.addLayer = function (this: LeafletMap, layer: Layer) {
      liveMap = this;
      if (layer instanceof L.Circle) ring = layer;
      return original.call(this, layer);
    };
    try {
      draw();
    } finally {
      proto.addLayer = original;
    }
  }
  if (!ring) return;
  ring.setLatLng([spec.lat, spec.lng]);
  paint(ring, spec.km);
}

/**
 * Keeps one dashed circle and resizes it. The first draw goes through
 * `MapHandle.setRadius` so the map still owns removal.
 */
export function syncSearchRing(draw: () => void, spec: SearchRing): void {
  const mine = generation;
  latest = spec;
  void loadLeaflet().then((L) => {
    if (mine !== generation || !latest) return;
    capture(L, draw, latest);
  });
}

export function clearSearchRing(clear: () => void): void {
  generation += 1;
  latest = null;
  ring = null;
  clear();
}

export function leafletMap(): LeafletMap | null {
  return liveMap;
}

/** Place pins stay on the hotels map, dimmed by `.is-context` in CSS. */
export function markContextMarkers(root: ParentNode, placeLabels: ReadonlySet<string>): void {
  root.querySelectorAll<HTMLElement>('.leaflet-marker-icon').forEach((node) => {
    const title = node.getAttribute('title') ?? '';
    node.classList.toggle('is-context', title.length > 0 && placeLabels.has(title));
  });
}

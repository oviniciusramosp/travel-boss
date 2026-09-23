import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import {
  circle,
  divIcon,
  latLngBounds,
  layerGroup,
  map as createMap,
  marker,
  polyline,
  type Circle,
  type LatLng,
  type LayerGroup,
  type Map as LeafletMap,
  type Marker,
} from 'leaflet';
import { bindBrightBasemap } from './basemap-style';
import type { MapHandle, MapPinKind, MapRadius, MapRouteSegment } from './types';

const KINDS: readonly MapPinKind[] = ['place', 'hotel', 'stop'];

const PIN_FALLBACK = '#0a0a0a';

function zoomBucket(zoom: number): 'far' | 'mid' | 'near' {
  if (zoom < 11) return 'far';
  if (zoom < 13) return 'mid';
  return 'near';
}

function pinIcon(color: string, active: boolean) {
  return divIcon({
    className: 'tb-pin-wrap',
    html: `<span class="tb-pin${active ? ' is-active' : ''}" style="--pin-color:${color}"><span class="tb-pin__core"></span></span>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    tooltipAnchor: [0, -12],
  });
}

/**
 * One Leaflet map for the session. Pin kinds are replaced independently.
 * `fit` caps zoom so a single pin does not jump to the tile max.
 */
export function mountMap(host: HTMLElement): MapHandle {
  const frame = document.createElement('div');
  frame.className = 'tb-map-frame';
  host.replaceChildren(frame);

  const leafletMap: LeafletMap = createMap(frame, {
    preferCanvas: true,
    zoomControl: true,
    scrollWheelZoom: true,
  });

  const basemap = maplibreGL({
    style: 'https://tiles.openfreemap.org/styles/bright',
    interactive: false,
    pane: 'tilePane',
  } as Parameters<typeof maplibreGL>[0]).addTo(leafletMap);

  leafletMap.setView([50, 10], 4);
  // Leaflet runs the GL layer's onAdd on the first view, not on addTo.
  const glMap = basemap.getMaplibreMap();
  if (glMap) bindBrightBasemap(glMap);

  const resize = new ResizeObserver(() => {
    leafletMap.invalidateSize(false);
  });
  resize.observe(frame);

  const groups = {
    place: layerGroup().addTo(leafletMap),
    hotel: layerGroup().addTo(leafletMap),
    stop: layerGroup().addTo(leafletMap),
  };
  const markers: Record<MapPinKind, Map<string, Marker>> = {
    place: new Map(),
    hotel: new Map(),
    stop: new Map(),
  };
  const selectFns = new Set<(id: string) => void>();
  let highlightedId: string | null = null;
  let radiusLayer: Circle | null = null;
  let routeLayer: LayerGroup | null = null;

  const applyZoom = () => {
    const bucket = zoomBucket(leafletMap.getZoom());
    const root = leafletMap.getContainer();
    root.classList.toggle('tb-zoom-far', bucket === 'far');
    root.classList.toggle('tb-zoom-mid', bucket === 'mid');
    root.classList.toggle('tb-zoom-near', bucket === 'near');
  };
  leafletMap.on('zoom zoomend', applyZoom);
  applyZoom();

  const paintMarker = (pin: Marker, on: boolean) => {
    pin.getElement()?.querySelector('.tb-pin')?.classList.toggle('is-active', on);
    if (on) pin.setZIndexOffset(1000);
    else pin.setZIndexOffset(0);
  };

  return {
    setPins(kind, pins) {
      groups[kind].clearLayers();
      const index = new Map<string, Marker>();
      markers[kind] = index;
      for (const pin of pins) {
        if (index.has(pin.id)) continue;
        if (!Number.isFinite(pin.lat) || !Number.isFinite(pin.lng)) continue;
        const color = pin.color || PIN_FALLBACK;
        const on = pin.id === highlightedId;
        const dot = marker([pin.lat, pin.lng], {
          icon: pinIcon(color, on),
          keyboard: true,
          riseOnHover: true,
          zIndexOffset: on ? 1000 : 0,
        });
        dot.bindTooltip(pin.label, {
          direction: 'top',
          opacity: 1,
          className: 'tb-pin-tip',
        });
        dot.on('click', () => {
          for (const fn of selectFns) fn(pin.id);
        });
        dot.addTo(groups[kind]);
        index.set(pin.id, dot);
      }
    },

    setRoute(segments: MapRouteSegment[], opts?: { fit?: boolean }) {
      if (routeLayer) {
        routeLayer.remove();
        routeLayer = null;
      }
      leafletMap.getContainer().dataset.route = String(segments.length);
      if (!segments.length) return;
      const group = layerGroup();
      const points: LatLng[] = [];
      for (const segment of segments) {
        if (segment.latlngs.length < 2) continue;
        const walk = segment.mode === 'walk';
        const color = walk ? '#008fff' : segment.color || '#008fff';
        polyline(segment.latlngs, {
          color,
          weight: walk ? 3 : 4,
          opacity: 0.9,
          dashArray: walk ? '1 8' : undefined,
          lineCap: 'round',
          lineJoin: 'round',
          interactive: false,
        }).addTo(group);
        for (const pair of segment.latlngs) points.push(pair as unknown as LatLng);
      }
      group.addTo(leafletMap);
      routeLayer = group;
      if (opts?.fit && points.length > 1) {
        leafletMap.fitBounds(latLngBounds(points), { padding: [40, 40], maxZoom: 16 });
      }
    },

    flyTo(lat, lng, zoom = 16) {
      const target = Math.max(leafletMap.getZoom(), zoom);
      leafletMap.setView([lat, lng], target, { animate: false });
      applyZoom();
    },

    setRadius(ring: MapRadius) {
      if (radiusLayer) {
        radiusLayer.remove();
        radiusLayer = null;
      }
      if (!ring) return;
      radiusLayer = circle([ring.lat, ring.lng], {
        radius: ring.km * 1000,
        color: PIN_FALLBACK,
        weight: 1,
        fillColor: PIN_FALLBACK,
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(leafletMap);
    },

    fit() {
      const points: LatLng[] = [];
      for (const kind of KINDS) {
        for (const marker of markers[kind].values()) points.push(marker.getLatLng());
      }
      if (points.length === 0) return;
      leafletMap.fitBounds(latLngBounds(points), {
        padding: [32, 32],
        maxZoom: 16,
      });
    },

    highlight(id) {
      highlightedId = id;
      let target: Marker | null = null;
      for (const kind of KINDS) {
        for (const [pinId, marker] of markers[kind]) {
          const on = id != null && pinId === id;
          paintMarker(marker, on);
          if (on && !target) target = marker;
        }
      }
      if (target) {
        leafletMap.panTo(target.getLatLng(), { animate: true, duration: 0.25 });
      }
    },

    onSelect(fn) {
      selectFns.add(fn);
      return () => {
        selectFns.delete(fn);
      };
    },
  };
}

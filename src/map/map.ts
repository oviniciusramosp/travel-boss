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
import { cameraMotion, labelFadeDuration, prefersReducedMotion } from '../ui/motion';
import { bindBrightBasemap } from './basemap-style';
import { diffPinIds, paddedCenterOffset, selectionEases, selectionZoom } from './camera';
import type { MapHandle, MapPadding, MapPin, MapPinKind, MapRadius, MapRouteSegment } from './types';

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

  const reducedAtStart = prefersReducedMotion();
  const leafletMap: LeafletMap = createMap(frame, {
    preferCanvas: true,
    zoomControl: true,
    scrollWheelZoom: true,
    zoomAnimation: !reducedAtStart,
    fadeAnimation: !reducedAtStart,
    markerZoomAnimation: !reducedAtStart,
  });

  const basemap = maplibreGL({
    style: 'https://tiles.openfreemap.org/styles/bright',
    interactive: false,
    pane: 'tilePane',
    fadeDuration: labelFadeDuration(reducedAtStart),
  } as Parameters<typeof maplibreGL>[0]).addTo(leafletMap);

  leafletMap.setView([50, 10], 4);
  // Leaflet runs the GL layer's onAdd on the first view, not on addTo.
  const glMap = basemap.getMaplibreMap();
  if (glMap) {
    glMap._fadeDuration = labelFadeDuration(reducedAtStart);
    bindBrightBasemap(glMap);
  }

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion = () => {
    const reduced = motionQuery.matches;
    leafletMap.options.zoomAnimation = !reduced;
    leafletMap.options.fadeAnimation = !reduced;
    leafletMap.options.markerZoomAnimation = !reduced;
    const gl = basemap.getMaplibreMap();
    if (gl) gl._fadeDuration = labelFadeDuration(reduced);
  };
  motionQuery.addEventListener('change', syncMotion);

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
  const hoverFns = new Set<(id: string | null) => void>();
  let selectedId: string | null = null;
  let hoveredId: string | null = null;
  const padding = { top: 0, right: 0, bottom: 0, left: 0 };
  let radiusLayer: Circle | null = null;
  let routeLayer: LayerGroup | null = null;

  type PinMeta = { color: string; label: string; icon: string; featured: boolean; number: string };
  const pinMeta: Record<MapPinKind, Map<string, PinMeta>> = {
    place: new Map(),
    hotel: new Map(),
    stop: new Map(),
  };

  const metaOf = (pin: MapPin): PinMeta => ({
    color: pin.color || PIN_FALLBACK,
    label: pin.label,
    icon: pin.icon ?? '',
    featured: Boolean(pin.featured),
    number: pin.number == null ? '' : String(pin.number),
  });

  const sameMeta = (a: PinMeta | undefined, b: PinMeta) =>
    a != null &&
    a.color === b.color &&
    a.label === b.label &&
    a.icon === b.icon &&
    a.featured === b.featured &&
    a.number === b.number;

  const rememberPin = (dot: Marker, meta: PinMeta) => {
    const node = dot.getElement();
    if (!node) return;
    if (meta.icon) node.dataset.pinIcon = meta.icon;
    else delete node.dataset.pinIcon;
    if (meta.featured) node.dataset.featured = 'true';
    else delete node.dataset.featured;
    if (meta.number) node.dataset.pinNumber = meta.number;
    else delete node.dataset.pinNumber;
  };

  const applyZoom = () => {
    const bucket = zoomBucket(leafletMap.getZoom());
    const root = leafletMap.getContainer();
    root.classList.toggle('tb-zoom-far', bucket === 'far');
    root.classList.toggle('tb-zoom-mid', bucket === 'mid');
    root.classList.toggle('tb-zoom-near', bucket === 'near');
  };
  leafletMap.on('zoom zoomend', applyZoom);
  applyZoom();

  const paintMarker = (pin: Marker, selected: boolean, hovered: boolean) => {
    const node = pin.getElement()?.querySelector('.tb-pin');
    node?.classList.toggle('is-active', selected);
    node?.classList.toggle('is-hover', hovered);
    pin.setZIndexOffset(selected || hovered ? 1000 : 0);
  };

  const paintAll = () => {
    for (const kind of KINDS) {
      for (const [id, marker] of markers[kind]) {
        paintMarker(marker, id === selectedId, id === hoveredId);
      }
    }
  };

  const findMarker = (id: string): Marker | null => {
    for (const kind of KINDS) {
      const found = markers[kind].get(id);
      if (found) return found;
    }
    return null;
  };

  const fitPad = (gutter: number) => ({
    paddingTopLeft: [gutter + padding.left, gutter + padding.top] as [number, number],
    paddingBottomRight: [gutter + padding.right, gutter + padding.bottom] as [number, number],
  });

  const moveCamera = (lat: number, lng: number, zoom: number) => {
    const offset = paddedCenterOffset(padding);
    const projected = leafletMap.project([lat, lng], zoom);
    const center = leafletMap.unproject(projected.add([offset.x, offset.y]), zoom);
    const motion = cameraMotion();
    leafletMap.stop();
    if (!motion.animate) {
      leafletMap.setView(center, zoom, { animate: false });
    } else if (selectionEases(zoom - leafletMap.getZoom()) === 'pan') {
      leafletMap.panTo(center, motion);
    } else {
      leafletMap.flyTo(center, zoom, { duration: motion.duration, easeLinearity: 0.25 });
    }
    applyZoom();
  };

  const bindMarker = (dot: Marker, id: string) => {
    dot.on('click', () => {
      for (const fn of selectFns) fn(id);
    });
    dot.on('mouseover', () => {
      for (const fn of hoverFns) fn(id);
    });
    dot.on('mouseout', () => {
      for (const fn of hoverFns) fn(null);
    });
  };

  return {
    setPins(kind, pins) {
      const index = markers[kind];
      const metas = pinMeta[kind];
      const incoming = new Map<string, MapPin>();
      for (const pin of pins) {
        if (incoming.has(pin.id)) continue;
        if (!Number.isFinite(pin.lat) || !Number.isFinite(pin.lng)) continue;
        incoming.set(pin.id, pin);
      }
      const diff = diffPinIds([...index.keys()], [...incoming.keys()]);
      for (const id of diff.remove) {
        index.get(id)?.remove();
        index.delete(id);
        metas.delete(id);
      }
      for (const id of diff.keep) {
        const pin = incoming.get(id);
        const dot = index.get(id);
        if (!pin || !dot) continue;
        const next = metaOf(pin);
        const ll = dot.getLatLng();
        if (ll.lat !== pin.lat || ll.lng !== pin.lng) dot.setLatLng([pin.lat, pin.lng]);
        if (!sameMeta(metas.get(id), next)) {
          dot.setIcon(pinIcon(next.color, id === selectedId));
          dot.setTooltipContent(pin.label);
          metas.set(id, next);
          rememberPin(dot, next);
        }
        paintMarker(dot, id === selectedId, id === hoveredId);
      }
      for (const id of diff.create) {
        const pin = incoming.get(id);
        if (!pin) continue;
        const next = metaOf(pin);
        const selected = id === selectedId;
        const dot = marker([pin.lat, pin.lng], {
          icon: pinIcon(next.color, selected),
          keyboard: true,
          riseOnHover: true,
          zIndexOffset: selected ? 1000 : 0,
        });
        dot.bindTooltip(pin.label, {
          direction: 'top',
          opacity: 1,
          className: 'tb-pin-tip',
        });
        bindMarker(dot, id);
        dot.addTo(groups[kind]);
        rememberPin(dot, next);
        paintMarker(dot, selected, id === hoveredId);
        index.set(id, dot);
        metas.set(id, next);
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
        leafletMap.fitBounds(latLngBounds(points), {
          ...fitPad(40),
          maxZoom: 16,
          ...cameraMotion(),
        });
      }
    },

    flyTo(lat, lng, zoom = 16) {
      moveCamera(lat, lng, Math.max(leafletMap.getZoom(), zoom));
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
        ...fitPad(32),
        maxZoom: 16,
        ...cameraMotion(),
      });
    },

    inView(lat, lng) {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) return true;
      const size = leafletMap.getSize();
      if (size.x < 1 || size.y < 1) return true;
      const bounds = leafletMap.getBounds();
      if (!bounds.isValid()) return true;
      return bounds.contains([lat, lng]);
    },

    hover(id) {
      hoveredId = id;
      paintAll();
    },

    select(id) {
      selectedId = id;
      paintAll();
      const target = findMarker(id);
      if (!target) return;
      const ll = target.getLatLng();
      moveCamera(ll.lat, ll.lng, selectionZoom(leafletMap.getZoom()));
    },

    highlight(id) {
      if (id == null) {
        selectedId = null;
        hoveredId = null;
        paintAll();
        return;
      }
      this.select(id);
    },

    onHover(fn) {
      hoverFns.add(fn);
      return () => {
        hoverFns.delete(fn);
      };
    },

    setPadding(next: MapPadding) {
      if (next.top != null) padding.top = next.top;
      if (next.right != null) padding.right = next.right;
      if (next.bottom != null) padding.bottom = next.bottom;
      if (next.left != null) padding.left = next.left;
    },

    onSelect(fn) {
      selectFns.add(fn);
      return () => {
        selectFns.delete(fn);
      };
    },
  };
}

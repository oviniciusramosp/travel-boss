import { maplibreGL } from '@maplibre/maplibre-gl-leaflet';
import {
  circle,
  divIcon,
  latLngBounds,
  layerGroup,
  map as createMap,
  marker,
  polyline,
  svg,
  type Circle,
  type LayerGroup,
  type Map as LeafletMap,
  type Marker,
} from 'leaflet';
import { placeCategoryMeta } from '../catalog';
import {
  CHROME_MOTION_EVENT,
  CHROME_SETTLED_EVENT,
  cameraMotion,
  cssToken,
  prefersReducedMotion,
} from '../ui/motion';
import { bindBrightBasemap } from './basemap-style';
import {
  diffPinIds,
  fitMaxZoom,
  paddedCenterOffset,
  pointsForFit,
  selectionEases,
  selectionZoom,
} from './camera';
import { coveredInsets, mergeInsets, type Insets } from './chrome';
import { mountAmenities } from './amenities';
import { attachMapControls } from './controls';
import { mountPlaceOverlays } from './overlays';
import { pinBox, pinHtml, pinModel, samePinModel, zoomPinBucket, type PinModel } from './pin-visual';
import { placeZoom, resolvedPlace } from './place-index';
import { MAPLIBRE_PERF, maplibreFade } from './maplibre-perf';
import { attachTrackpadGestures } from './trackpad';
import { overviewArcs } from './overview';
import { drawRouteSegments, paintRouteFocus, type RouteEntry } from './route-draw';
import { routeEmphasis, routeLayerKind, type RouteFocus } from './route-model';
import type {
  MapCityPin,
  MapHandle,
  MapOverviewCity,
  MapPadding,
  MapPin,
  MapPinKind,
  MapRadius,
  MapRouteSegment,
} from './types';

const KINDS: readonly MapPinKind[] = ['place', 'hotel', 'stop'];

const PIN_FALLBACK = '#0a0a0a';

function modelFor(pin: MapPin): PinModel {
  const place = resolvedPlace(pin.id);
  const category = place?.category;
  const fromCategory = category ? placeCategoryMeta[category]?.color : undefined;
  return pinModel({
    label: pin.label,
    color: pin.color || fromCategory || cssToken('--color-ink', PIN_FALLBACK),
    featured: Boolean(pin.featured || place?.featured),
    number: pin.number,
    category,
    subcategories: place?.subcategories,
  });
}

function pinIcon(model: PinModel, state?: { active?: boolean; hover?: boolean }) {
  const box = pinBox(model.featured);
  return divIcon({
    className: 'tb-pin-wrap',
    html: pinHtml(model, state),
    iconSize: [box.size, box.size],
    iconAnchor: [box.anchor, box.anchor],
    tooltipAnchor: [0, model.featured ? -18 : -12],
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
    zoomControl: false,
    scrollWheelZoom: false,
    zoomAnimation: !reducedAtStart,
    fadeAnimation: !reducedAtStart,
    markerZoomAnimation: !reducedAtStart,
  });

  const basemap = maplibreGL({
    style: 'https://tiles.openfreemap.org/styles/bright',
    interactive: false,
    pane: 'tilePane',
    ...MAPLIBRE_PERF,
    fadeDuration: maplibreFade(reducedAtStart),
  } as Parameters<typeof maplibreGL>[0]).addTo(leafletMap);

  leafletMap.setView([50, 10], 4);
  attachTrackpadGestures(leafletMap);
  // Leaflet runs the GL layer's onAdd on the first view, not on addTo.
  const glMap = basemap.getMaplibreMap();
  if (glMap) {
    glMap._fadeDuration = maplibreFade(reducedAtStart);
    bindBrightBasemap(glMap);
  }

  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const syncMotion = () => {
    const reduced = motionQuery.matches;
    leafletMap.options.zoomAnimation = !reduced;
    leafletMap.options.fadeAnimation = !reduced;
    leafletMap.options.markerZoomAnimation = !reduced;
    const gl = basemap.getMaplibreMap();
    if (gl) gl._fadeDuration = maplibreFade(reduced);
  };
  motionQuery.addEventListener('change', syncMotion);

  let chromeMoving = false;
  const settleMap = () => {
    leafletMap.invalidateSize(false);
  };
  window.addEventListener(CHROME_MOTION_EVENT, () => {
    chromeMoving = true;
  });
  window.addEventListener(CHROME_SETTLED_EVENT, () => {
    chromeMoving = false;
    settleMap();
  });
  const resize = new ResizeObserver(() => {
    if (chromeMoving) return;
    settleMap();
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
  const subPointLayer = layerGroup().addTo(leafletMap);
  let subPointMarks: Marker[] = [];
  let routeLayer: LayerGroup | null = null;
  let routeEntries: RouteEntry[] = [];
  let routeFocus: RouteFocus = null;
  let pinnedLeg: RouteFocus = null;
  let routeSource: 'map' | 'ui' | null = null;
  let routeClearTimer = 0;
  const legFns = new Set<
    (leg: { from: string; to: string; hop?: number; walk?: number; mode?: 'walk' | 'transit' } | null) => void
  >();
  let cityLayer: LayerGroup | null = null;
  let overviewLayer: LayerGroup | null = null;
  let overviewHoverId: string | null = null;
  const overviewMarkers = new Map<string, Marker>();
  const overviewFns = new Set<(id: string) => void>();

  const paintOverview = () => {
    for (const [id, marker] of overviewMarkers) {
      marker.getElement()?.classList.toggle('is-hover', id === overviewHoverId);
      marker.setZIndexOffset(id === overviewHoverId ? 1600 : 1300);
    }
  };

  const fitPoints = (points: [number, number][], maxZoom: number) => {
    if (points.length === 0) return;
    let tries = 0;
    const run = () => {
      const size = leafletMap.getSize();
      if (size.x < 2 || size.y < 2) {
        tries += 1;
        if (tries < 45) requestAnimationFrame(run);
        return;
      }
      const bounds = latLngBounds(points);
      if (!bounds.isValid()) return;
      leafletMap.fitBounds(bounds, { ...fitPad(48), maxZoom, ...cameraMotion() });
    };
    run();
  };

  const pinMeta: Record<MapPinKind, Map<string, PinModel>> = {
    place: new Map(),
    hotel: new Map(),
    stop: new Map(),
  };

  const rememberPin = (dot: Marker, meta: PinModel) => {
    const node = dot.getElement();
    if (!node) return;
    if (meta.glyph) node.dataset.pinIcon = meta.glyph;
    else delete node.dataset.pinIcon;
    if (meta.featured) node.dataset.featured = 'true';
    else delete node.dataset.featured;
    if (meta.number) node.dataset.pinNumber = meta.number;
    else delete node.dataset.pinNumber;
  };

  const root = leafletMap.getContainer();
  let zooming = false;
  const applyZoom = () => {
    if (zooming) return;
    const bucket = zoomPinBucket(leafletMap.getZoom());
    root.classList.toggle('tb-zoom-far', bucket === 'far');
    root.classList.toggle('tb-zoom-mid', bucket === 'mid');
    root.classList.toggle('tb-zoom-near', bucket === 'near');
  };
  // Freeze `--pin-scale` while the zoom animates; apply the bucket at zoomend.
  leafletMap.on('zoomstart', () => {
    zooming = true;
    root.classList.add('is-zooming');
  });
  leafletMap.on('zoomend', () => {
    zooming = false;
    root.classList.remove('is-zooming');
    applyZoom();
  });
  applyZoom();

  const paintMarker = (pin: Marker, selected: boolean, hovered: boolean) => {
    const icon = pin.getElement();
    const node = icon?.querySelector('.tb-pin');
    node?.classList.toggle('is-active', selected);
    node?.classList.toggle('is-hover', hovered);
    const featured = icon?.dataset.featured === 'true';
    pin.setZIndexOffset(selected || hovered ? 1000 : featured ? 200 : 0);
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

  const boxOf = (node: Element | null): { left: number; top: number; right: number; bottom: number } | null => {
    if (!(node instanceof HTMLElement) || node.hidden) return null;
    const box = node.getBoundingClientRect();
    if (box.width < 1 || box.height < 1) return null;
    return box;
  };

  const effectivePadding = (): Insets => {
    const mapBox = frame.getBoundingClientRect();
    let extra: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
    const side = boxOf(document.querySelector('.tb-side'));
    const panel = boxOf(document.querySelector('.tb-place-panel'));
    if (side) extra = mergeInsets(extra, coveredInsets(mapBox, side));
    if (panel) extra = mergeInsets(extra, coveredInsets(mapBox, panel));
    return mergeInsets(padding, extra);
  };

  const fitPad = (gutter: number) => {
    const pad = effectivePadding();
    return {
      paddingTopLeft: [gutter + pad.left, gutter + pad.top] as [number, number],
      paddingBottomRight: [gutter + pad.right, gutter + pad.bottom] as [number, number],
    };
  };

  const moveCamera = (lat: number, lng: number, zoom: number) => {
    const offset = paddedCenterOffset(effectivePadding());
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

  // Canvas (`preferCanvas`) has no DOM stroke, so arcs and the transit flow use an SVG pane.
  leafletMap.createPane('tb-route');
  const routePane = leafletMap.getPane('tb-route');
  if (routePane) routePane.style.zIndex = cssToken('--z-map-route', '460');
  const routeRenderer = svg({ pane: 'tb-route' });
  const amenities = mountAmenities(leafletMap);

  const overlays = mountPlaceOverlays(leafletMap);
  const applyRouteFocus = () => paintRouteFocus(routeEntries, routeFocus, routeSource !== 'map');
  const framePinnedLeg = () => {
    if (pinnedLeg?.kind !== 'leg') return;
    const points: [number, number][] = [];
    for (const entry of routeEntries) {
      if (routeEmphasis(pinnedLeg, entry) !== 'hot') continue;
      const raw = entry.line.getLatLngs();
      const list = Array.isArray(raw[0]) ? raw.flat(1) : raw;
      for (const point of list) {
        if (point && 'lat' in point) points.push([point.lat, point.lng]);
      }
    }
    if (points.length < 2) return;
    const motion = cameraMotion();
    const opts = { ...fitPad(20), maxZoom: 15, duration: motion.duration, easeLinearity: 0.25 };
    leafletMap.stop();
    if (motion.animate) leafletMap.flyToBounds(latLngBounds(points), opts);
    else leafletMap.fitBounds(latLngBounds(points), { ...opts, animate: false });
  };
  const syncOverlays = () => {
    const ids: string[] = [];
    if (selectedId && findMarker(selectedId)) ids.push(selectedId);
    if (hoveredId && hoveredId !== selectedId && findMarker(hoveredId)) ids.push(hoveredId);
    overlays.sync(ids);
  };

  const bindMarker = (dot: Marker, id: string) => {
    dot.on('click', () => {
      for (const fn of selectFns) fn(id);
    });
    dot.on('mouseover', () => {
      hoveredId = id;
      paintAll();
      syncOverlays();
      for (const fn of hoverFns) fn(id);
    });
    dot.on('mouseout', () => {
      if (hoveredId === id) {
        hoveredId = null;
        paintAll();
        syncOverlays();
      }
      for (const fn of hoverFns) fn(null);
    });
  };

  const handle: MapHandle = {
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
        const next = modelFor(pin);
        const ll = dot.getLatLng();
        if (ll.lat !== pin.lat || ll.lng !== pin.lng) dot.setLatLng([pin.lat, pin.lng]);
        if (!samePinModel(metas.get(id), next)) {
          dot.options.title = pin.label;
          dot.setIcon(pinIcon(next, { active: id === selectedId, hover: id === hoveredId }));
          dot.setTooltipContent(pin.label);
          metas.set(id, next);
          rememberPin(dot, next);
        }
        paintMarker(dot, id === selectedId, id === hoveredId);
        const keptNode = dot.getElement();
        if (keptNode) keptNode.dataset.pinKind = kind;
      }
      for (const id of diff.create) {
        const pin = incoming.get(id);
        if (!pin) continue;
        const next = modelFor(pin);
        const selected = id === selectedId;
        const dot = marker([pin.lat, pin.lng], {
          icon: pinIcon(next, { active: selected, hover: id === hoveredId }),
          keyboard: false,
          title: pin.label,
          riseOnHover: true,
          zIndexOffset: selected || next.featured ? 1000 : 0,
        });
        dot.bindTooltip(pin.label, {
          direction: 'top',
          opacity: 1,
          className: 'tb-pin-tip',
        });
        bindMarker(dot, id);
        dot.addTo(groups[kind]);
        rememberPin(dot, next);
        const created = dot.getElement();
        if (created) created.dataset.pinKind = kind;
        paintMarker(dot, selected, id === hoveredId);
        index.set(id, dot);
        metas.set(id, next);
      }
      syncOverlays();
    },

    setRoute(segments: MapRouteSegment[], opts?: { fit?: boolean }) {
      window.clearTimeout(routeClearTimer);
      if (routeLayer) {
        routeLayer.remove();
        routeLayer = null;
      }
      routeEntries = [];
      leafletMap.getContainer().dataset.route = String(segments.length);
      amenities.setWalks(segments.filter((s) => routeLayerKind(s) === 'walk').map((s) => s.latlngs));
      if (!segments.length) {
        routeFocus = null;
        pinnedLeg = null;
        routeSource = null;
        return;
      }
      const group = layerGroup();
      const drawn = drawRouteSegments(group, routeRenderer, segments, (leg) => {
        if (!leg) {
          window.clearTimeout(routeClearTimer);
          routeClearTimer = window.setTimeout(() => {
            if (routeSource !== 'map') return;
            hoveredId = pinnedLeg?.kind === 'leg' ? pinnedLeg.to : null;
            routeFocus = pinnedLeg;
            routeSource = pinnedLeg ? 'ui' : null;
            paintAll();
            applyRouteFocus();
            syncOverlays();
            for (const fn of legFns) fn(pinnedLeg?.kind === 'leg' ? pinnedLeg : null);
          }, 40);
          return;
        }
        window.clearTimeout(routeClearTimer);
        hoveredId = leg.to;
        routeFocus = {
          kind: 'leg',
          from: leg.from,
          to: leg.to,
          ...(leg.hop != null ? { hop: leg.hop } : {}),
          ...(leg.walk != null ? { walk: leg.walk } : {}),
          ...(leg.mode ? { mode: leg.mode } : {}),
        };
        routeSource = 'map';
        paintAll();
        applyRouteFocus();
        syncOverlays();
        for (const fn of legFns) fn(leg);
      });
      routeEntries = drawn.entries;
      group.addTo(leafletMap);
      routeLayer = group;
      applyRouteFocus();
      if (opts?.fit && drawn.points.length > 1) {
        leafletMap.fitBounds(latLngBounds(drawn.points), {
          ...fitPad(40),
          maxZoom: 16,
          ...cameraMotion(),
        });
      }
    },

    setOverview(cities: readonly MapOverviewCity[] | null, opts?: { fit?: boolean; fade?: boolean }) {
      const list = (cities ?? []).filter(
        (city) => city.id && Number.isFinite(city.lat) && Number.isFinite(city.lng),
      );
      const fade = list.length > 0 && opts?.fade !== false;
      host.classList.toggle('is-overview', fade);
      if (list.length) host.dataset.overview = String(list.length);
      else delete host.dataset.overview;
      overviewLayer?.remove();
      overviewLayer = null;
      overviewMarkers.clear();
      if (!list.length) return;

      const arcColor = cssToken('--color-mid-gray', '#666666');
      const group = layerGroup();
      const fit: [number, number][] = [];
      for (const arc of overviewArcs(list)) {
        const line = polyline(arc.latlngs, {
          renderer: routeRenderer,
          color: arcColor,
          weight: 2,
          opacity: 0.85,
          dashArray: '1 8',
          lineCap: 'round',
          interactive: true,
          bubblingMouseEvents: false,
          className: 'tb-overview-arc',
        });
        line.bindTooltip(arc.label, {
          sticky: true,
          opacity: 1,
          className: 'tb-pin-tip',
        });
        line.addTo(group);
        for (const pair of arc.latlngs) fit.push(pair);
      }
      for (const city of list) {
        const number = Number.isFinite(city.number) && city.number > 0 ? Math.round(city.number) : 0;
        const dot = marker([city.lat, city.lng], {
          icon: divIcon({
            className: 'tb-overview-wrap',
            html: `<span class="tb-overview-node">${number || ''}</span>`,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
          keyboard: false,
          title: city.label,
          zIndexOffset: city.id === overviewHoverId ? 1600 : 1300,
          bubblingMouseEvents: false,
        });
        dot.bindTooltip(city.label, {
          direction: 'top',
          opacity: 1,
          className: 'tb-pin-tip',
        });
        dot.on('click', () => {
          for (const fn of overviewFns) fn(city.id);
        });
        dot.addTo(group);
        overviewMarkers.set(city.id, dot);
        fit.push([city.lat, city.lng]);
      }
      group.addTo(leafletMap);
      overviewLayer = group;
      paintOverview();
      if (opts?.fit) fitPoints(fit, 7);
    },

    hoverOverview(id) {
      overviewHoverId = id;
      paintOverview();
    },

    onOverview(fn) {
      overviewFns.add(fn);
      return () => {
        overviewFns.delete(fn);
      };
    },

    setCities(pins: readonly MapCityPin[], opts?: { fit?: boolean }) {
      cityLayer?.remove();
      cityLayer = null;
      const list = pins.filter(
        (pin) => pin.id && Number.isFinite(pin.lat) && Number.isFinite(pin.lng),
      );
      if (!list.length) {
        delete host.dataset.cities;
        return;
      }
      host.dataset.cities = String(list.length);
      const group = layerGroup();
      const fit: [number, number][] = [];
      for (const pin of list) {
        const dot = marker([pin.lat, pin.lng], {
          icon: divIcon({
            className: 'tb-city-pin-wrap',
            html: '<span class="tb-city-pin"></span>',
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          }),
          keyboard: false,
          title: pin.label,
          zIndexOffset: 800,
          bubblingMouseEvents: false,
        });
        dot.bindTooltip(pin.label, {
          direction: 'top',
          opacity: 1,
          className: 'tb-pin-tip',
        });
        dot.on('click', () => {
          for (const fn of selectFns) fn(pin.id);
        });
        dot.addTo(group);
        fit.push([pin.lat, pin.lng]);
      }
      group.addTo(leafletMap);
      cityLayer = group;
      if (opts?.fit) fitPoints(fit, 5);
    },

    flyTo(lat, lng, zoom = 16) {
      moveCamera(lat, lng, Math.max(leafletMap.getZoom(), zoom));
    },

    setSubPoints(points) {
      subPointLayer.clearLayers();
      subPointMarks = points
        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
        .map((point, index) => {
          const color = point.color && /^#[0-9a-f]{3,8}$/i.test(point.color) ? point.color : '';
          const dot = marker([point.lat, point.lng], {
            icon: divIcon({
              className: 'tb-subpoint-wrap',
              html: `<span class="tb-subpoint-dot tb-subpoint-dot--n"${color ? ` style="--subpoint-color:${color}"` : ''}>${index + 1}</span>`,
              iconSize: [20, 20],
              iconAnchor: [10, 10],
            }),
            keyboard: false,
            bubblingMouseEvents: false,
            zIndexOffset: 800,
          });
          dot.bindTooltip(point.label, { direction: 'top', opacity: 1, className: 'tb-pin-tip' });
          return dot.addTo(subPointLayer);
        });
    },

    hoverSubPoint(index) {
      subPointMarks.forEach((dot, at) => {
        dot.getElement()?.classList.toggle('is-hover', at === index);
        dot.setZIndexOffset(at === index ? 900 : 800);
      });
    },

    selectSubPoint(index) {
      subPointMarks.forEach((dot, at) => dot.getElement()?.classList.toggle('is-active', at === index));
      const dot = index == null ? undefined : subPointMarks[index];
      if (!dot) return;
      dot.setZIndexOffset(1000);
      const { lat, lng } = dot.getLatLng();
      if (!this.inView(lat, lng)) moveCamera(lat, lng, leafletMap.getZoom());
    },

    setRadius(ring: MapRadius) {
      if (radiusLayer) {
        radiusLayer.remove();
        radiusLayer = null;
      }
      if (!ring) return;
      const ink = cssToken('--color-ink', PIN_FALLBACK);
      radiusLayer = circle([ring.lat, ring.lng], {
        radius: ring.km * 1000,
        color: ink,
        weight: 1,
        fillColor: ink,
        fillOpacity: 0.04,
        interactive: false,
      }).addTo(leafletMap);
    },

    frame(points, maxZoom = 13) {
      const coords = points
        .filter((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
        .map((point) => [point.lat, point.lng] as [number, number]);
      if (coords.length === 0) return;
      if (coords.length === 1) {
        const [lat, lng] = coords[0] ?? [0, 0];
        moveCamera(lat, lng, maxZoom);
        return;
      }
      fitPoints(coords, maxZoom);
    },

    fit() {
      const samples: { id: string; lat: number; lng: number; category?: string }[] = [];
      for (const kind of KINDS) {
        for (const [id, dot] of markers[kind]) {
          const ll = dot.getLatLng();
          samples.push({ id, lat: ll.lat, lng: ll.lng, category: resolvedPlace(id)?.category });
        }
      }
      const kept = pointsForFit(samples);
      if (kept.length === 0) return;
      const maxZoom = fitMaxZoom(
        kept.flatMap((pin) => {
          const zoom = placeZoom(pin.id);
          return zoom == null ? [] : [zoom];
        }),
      );
      leafletMap.fitBounds(
        latLngBounds(kept.map((pin) => [pin.lat, pin.lng] as [number, number])),
        { ...fitPad(32), maxZoom, ...cameraMotion() },
      );
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
      window.clearTimeout(routeClearTimer);
      hoveredId = id ?? (pinnedLeg?.kind === 'leg' ? pinnedLeg.to : null);
      routeFocus = id ? { kind: 'place', id } : pinnedLeg;
      routeSource = routeFocus ? 'ui' : null;
      paintAll();
      applyRouteFocus();
      syncOverlays();
    },

    hoverLeg(from, to, opts) {
      window.clearTimeout(routeClearTimer);
      if (!from || !to) {
        pinnedLeg = null;
        hoveredId = null;
        routeFocus = null;
        routeSource = null;
      } else {
        const hop = typeof opts === 'number' ? opts : opts?.hop;
        const walk = typeof opts === 'number' ? undefined : opts?.walk;
        const mode = typeof opts === 'number' ? undefined : opts?.mode;
        hoveredId = to;
        pinnedLeg = {
          kind: 'leg',
          from,
          to,
          ...(hop != null && Number.isFinite(hop) ? { hop } : {}),
          ...(walk != null && Number.isFinite(walk) ? { walk } : {}),
          ...(mode ? { mode } : {}),
        };
        routeFocus = pinnedLeg;
        routeSource = 'ui';
      }
      paintAll();
      applyRouteFocus();
      syncOverlays();
      if (typeof opts === 'object' && opts?.frame) framePinnedLeg();
    },

    onHoverLeg(fn) {
      legFns.add(fn);
      return () => {
        legFns.delete(fn);
      };
    },

    select(id) {
      selectedId = id;
      paintAll();
      syncOverlays();
      const target = findMarker(id);
      if (!target) return;
      const ll = target.getLatLng();
      moveCamera(ll.lat, ll.lng, selectionZoom(leafletMap.getZoom()));
    },

    highlight(id) {
      if (id == null) {
        window.clearTimeout(routeClearTimer);
        selectedId = null;
        hoveredId = pinnedLeg?.kind === 'leg' ? pinnedLeg.to : null;
        routeFocus = pinnedLeg;
        routeSource = pinnedLeg ? 'ui' : null;
        paintAll();
        applyRouteFocus();
        syncOverlays();
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
  attachMapControls(leafletMap, host, () => handle.fit());
  return handle;
}

import type { LatLng, Map as LeafletMap, Point } from 'leaflet';

type PinchMap = LeafletMap & {
  _moveStart(zoomChanged: boolean, noMoveStart?: boolean): LeafletMap;
  _move(center: LatLng, zoom: number, data?: { pinch?: boolean; round?: boolean }): LeafletMap;
  _moveEnd(zoomChanged: boolean): LeafletMap;
};

/** Trackpad deltas are pixels. Lines and pages are scaled to pixels. */
export function wheelPixels(
  dx: number,
  dy: number,
  mode: number,
  width: number,
  height: number,
): { dx: number; dy: number } {
  if (mode === 1) return { dx: dx * 16, dy: dy * 16 };
  if (mode === 2) return { dx: dx * width, dy: dy * height };
  return { dx, dy };
}

/** About 60px of pinch delta is one zoom level, clamped to the map. */
export function pinchZoom(current: number, deltaY: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, current + -deltaY / 60));
}

/**
 * Two-finger scroll pans. Pinch (ctrl or meta + wheel) zooms on the cursor.
 * A plain wheel pans too — zoom with the buttons or a pinch.
 */
export function attachTrackpadGestures(map: LeafletMap): () => void {
  const el = map.getContainer();
  const pinchMap = map as PinchMap;
  el.style.touchAction = 'none';
  map.options.zoomSnap = 0;
  map.options.zoomDelta = 0.25;
  map.options.wheelDebounceTime = 0;
  map.options.wheelPxPerZoomLevel = 60;
  map.scrollWheelZoom.disable();

  let zoomFrame = 0;
  let pendingZoom: number | null = null;
  let zoomFocus: Point | null = null;
  let pinchActive = false;
  let settleTimer = 0;

  const centerKeepingFocus = (focus: Point, targetZoom: number): LatLng => {
    const scale = map.getZoomScale(targetZoom);
    const viewHalf = map.getSize().divideBy(2);
    const centerOffset = focus.subtract(viewHalf).multiplyBy(1 - 1 / scale);
    return map.containerPointToLatLng(viewHalf.add(centerOffset));
  };

  const endPinch = () => {
    if (!pinchActive) return;
    pinchActive = false;
    pendingZoom = null;
    zoomFocus = null;
    map.fire('zoom');
    map.fire('move');
    pinchMap._moveEnd(true);
  };

  const scheduleSettle = () => {
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(endPinch, 150);
  };

  const flushZoom = () => {
    zoomFrame = 0;
    if (pendingZoom == null || !zoomFocus) return;
    const zoom = pendingZoom;
    const focus = zoomFocus;
    pendingZoom = null;
    if (Math.abs(zoom - map.getZoom()) < 1e-9) {
      if (pinchActive) scheduleSettle();
      return;
    }
    if (!pinchActive) {
      map.stop();
      pinchMap._moveStart(true, false);
      pinchActive = true;
    }
    pinchMap._move(centerKeepingFocus(focus, zoom), zoom, { pinch: true, round: false });
    scheduleSettle();
  };

  const onWheel = (event: WheelEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const pinch = event.ctrlKey || event.metaKey;
    if (pinch) {
      const { dy } = wheelPixels(event.deltaX, event.deltaY, event.deltaMode, el.clientWidth, el.clientHeight);
      const base = pendingZoom ?? map.getZoom();
      pendingZoom = pinchZoom(base, dy, map.getMinZoom(), map.getMaxZoom());
      zoomFocus = map.mouseEventToContainerPoint(event);
      if (!zoomFrame) zoomFrame = requestAnimationFrame(flushZoom);
      return;
    }
    if (pinchActive) {
      window.clearTimeout(settleTimer);
      endPinch();
    }
    const { dx, dy } = wheelPixels(event.deltaX, event.deltaY, event.deltaMode, el.clientWidth, el.clientHeight);
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return;
    map.panBy([dx, dy], { animate: false });
  };

  el.addEventListener('wheel', onWheel, { passive: false, capture: true });

  return () => {
    el.removeEventListener('wheel', onWheel, true);
    if (zoomFrame) cancelAnimationFrame(zoomFrame);
    window.clearTimeout(settleTimer);
    if (pinchActive) {
      pinchActive = false;
      pinchMap._moveEnd(true);
    }
    pendingZoom = null;
    zoomFocus = null;
  };
}

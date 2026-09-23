import { read, write } from '../app/store';
import { pickLocale, travelUi, type Locale } from '../catalog';
import { haversineKm } from '../map/camera';
import { fetchWalkingRoute } from '../map/walk-route';
import type { MapHandle, MapPin } from '../map/types';
import { iconButton, segmented } from '../ui/controls';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';

export const MAX_ROUTE_STOPS = 8;
export const USER_LOCATION_ID = 'user-location';
export const CITY_FAR_KM = 80;

export type GeoPermission = 'granted' | 'denied' | 'prompt' | 'unknown';
export type LocateFailure = 'unsupported' | 'denied' | 'unavailable' | 'timeout';

export function locateFailure(error: { code?: number; message?: string } | null): LocateFailure {
  const code = error?.code;
  const message = error?.message;
  if (message === 'unsupported') return 'unsupported';
  if (code === 1 || message === 'denied') return 'denied';
  if (code === 3 || message === 'timeout') return 'timeout';
  return 'unavailable';
}

export function isFarFromCity(
  user: { lat: number; lng: number },
  city: { lat: number; lng: number },
  km = CITY_FAR_KM,
): boolean {
  return haversineKm(user.lat, user.lng, city.lat, city.lng) > km;
}

export function withUserOrigin(stops: readonly RouteStop[], user: RouteStop): RouteStop[] {
  const rest = stops.filter((stop) => stop.id !== USER_LOCATION_ID && !stop.user);
  return [{ ...user, id: USER_LOCATION_ID, user: true }, ...rest].slice(0, MAX_ROUTE_STOPS);
}

export function locateFailureLabel(failure: LocateFailure, locale: Locale): string {
  if (failure === 'denied') return pickLocale(locale, travelUi.locateDenied);
  if (failure === 'timeout') {
    return pickLocale(locale, {
      en: 'Location request timed out',
      'pt-BR': 'A localização demorou demais',
    });
  }
  return pickLocale(locale, travelUi.locateUnavailable);
}

export type RouteMode = 'walk' | 'transit';

export type RouteStop = {
  id: string;
  lat: number;
  lng: number;
  label: string;
  labelPt?: string;
  user?: boolean;
};

export type StoredRoute = {
  ids: string[];
  mode: RouteMode;
};

export type RoutePlace = {
  id: string;
  lat: number;
  lng: number;
  name: { en: string; 'pt-BR': string };
};

export function routeStorageKey(slug: string): string {
  return `route:${slug}`;
}

export function normalizeStoredRoute(value: unknown): StoredRoute {
  const raw = value && typeof value === 'object' ? (value as { ids?: unknown; mode?: unknown }) : {};
  const ids: string[] = [];
  if (Array.isArray(raw.ids)) {
    for (const id of raw.ids) {
      if (typeof id !== 'string' || !id || id === USER_LOCATION_ID || ids.includes(id)) continue;
      ids.push(id);
      if (ids.length >= MAX_ROUTE_STOPS) break;
    }
  }
  return { ids, mode: raw.mode === 'transit' ? 'transit' : 'walk' };
}

export function readStoredRoute(slug: string): StoredRoute {
  return normalizeStoredRoute(read(routeStorageKey(slug), null));
}

export function writeStoredRoute(slug: string, route: StoredRoute): void {
  write(routeStorageKey(slug), normalizeStoredRoute(route));
}

export function placeStopIds(stops: readonly RouteStop[]): string[] {
  return stops.filter((stop) => stop.id !== USER_LOCATION_ID && !stop.user).map((stop) => stop.id);
}

/** Add, or remove when the place is already a stop. A full route does not grow. */
export function togglePlaceStop(
  stops: readonly RouteStop[],
  place: RouteStop,
): { stops: RouteStop[]; full: boolean } {
  if (place.user || place.id === USER_LOCATION_ID) return { stops: [...stops], full: false };
  if (stops.some((stop) => stop.id === place.id)) {
    return { stops: stops.filter((stop) => stop.id !== place.id), full: false };
  }
  if (stops.length >= MAX_ROUTE_STOPS) return { stops: [...stops], full: true };
  return { stops: [...stops, { ...place, user: false }], full: false };
}

export function removeRouteStop(stops: readonly RouteStop[], id: string): RouteStop[] {
  return stops.filter((stop) => stop.id !== id);
}

export function routeActionLabel(on: boolean, locale: Locale): string {
  return pickLocale(locale, on ? travelUi.removeFromRoute : travelUi.addToRoute);
}

export function routeFullLabel(locale: Locale): string {
  return pickLocale(locale, {
    en: 'Route is full (8 stops)',
    'pt-BR': 'A rota está cheia (8 paradas)',
  });
}

export type RouteNoteKind = 'idle' | 'loading' | 'ok' | 'error' | 'hint';

/** Tip line before a walk preview replaces it: need two stops, or transit stays a hint. */
export function routeBarHint(
  count: number,
  mode: RouteMode,
  locale: Locale,
): { text: string; kind: RouteNoteKind } | null {
  if (count < 1) return null;
  if (count < 2) return { text: pickLocale(locale, travelUi.routeNeedStops), kind: 'idle' };
  if (mode === 'transit') return { text: pickLocale(locale, travelUi.routeTransitHint), kind: 'hint' };
  return null;
}

export function routeStopBadges(stops: readonly RouteStop[]): Map<string, number> {
  const numbers = new Map<string, number>();
  stops.forEach((stop, index) => {
    if (stop.user || stop.id === USER_LOCATION_ID) return;
    numbers.set(stop.id, index + 1);
  });
  return numbers;
}

export function formatRouteDuration(seconds: number, locale: Locale): string {
  const total = Math.max(1, Math.round(seconds / 60));
  if (total < 60) return `${total} min`;
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const unit = locale === 'pt-BR' ? 'h' : 'h';
  return minutes > 0 ? `${hours} ${unit} ${minutes} min` : `${hours} ${unit}`;
}

export function formatRouteDistance(meters: number, locale: Locale): string {
  if (!Number.isFinite(meters) || meters < 1000) return `${Math.max(0, Math.round(meters || 0))} m`;
  const km = meters / 1000;
  const rounded = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
  const text = locale === 'pt-BR' ? String(rounded).replace('.', ',') : String(rounded);
  return `${text} km`;
}

export function walkPreviewLabel(seconds: number, meters: number, locale: Locale): string {
  return `${pickLocale(locale, travelUi.routePreviewLabel)} · ${formatRouteDuration(seconds, locale)} · ${formatRouteDistance(meters, locale)}`;
}

export function googleDirectionsUrl(
  stops: readonly { lat: number; lng: number }[],
  mode: RouteMode,
): string | null {
  if (stops.length < 2) return null;
  const origin = stops[0];
  const destination = stops[stops.length - 1];
  if (!origin || !destination) return null;
  const params = new URLSearchParams({
    api: '1',
    origin: `${origin.lat},${origin.lng}`,
    destination: `${destination.lat},${destination.lng}`,
    travelmode: mode === 'transit' ? 'transit' : 'walking',
  });
  const mid = stops.slice(1, -1).slice(0, 9);
  if (mid.length) params.set('waypoints', mid.map((stop) => `${stop.lat},${stop.lng}`).join('|'));
  return `https://www.google.com/maps/dir/?${params.toString()}`;
}

export function paintRouteAction(
  button: HTMLButtonElement,
  on: boolean,
  locale: Locale,
  full: boolean,
): void {
  const label = !on && full ? routeFullLabel(locale) : routeActionLabel(on, locale);
  button.setAttribute('aria-pressed', on ? 'true' : 'false');
  button.setAttribute('aria-label', label);
  button.setAttribute('data-tip', label);
  button.disabled = full && !on;
  button.classList.toggle('is-on-route', on);
  const text = button.querySelector('.tb-route-add__label');
  if (text) text.textContent = routeActionLabel(on, locale);
  button.querySelector('.material-symbols-rounded')?.classList.toggle('is-fill', on);
}

type Session = {
  slug: string;
  stops: RouteStop[];
  mode: RouteMode;
  city: { lat: number; lng: number };
  byId: Map<string, RoutePlace>;
  locale: () => Locale;
  onChange?: () => void;
};

type UserFix = { lat: number; lng: number; accuracyM?: number };

let session: Session | null = null;

function toStop(place: RoutePlace): RouteStop {
  return {
    id: place.id,
    lat: place.lat,
    lng: place.lng,
    label: place.name.en,
    labelPt: place.name['pt-BR'],
  };
}

function persist(current: Session): void {
  writeStoredRoute(current.slug, { ids: placeStopIds(current.stops), mode: current.mode });
}

function sameStops(a: readonly RouteStop[], b: readonly RouteStop[]): boolean {
  return a.length === b.length && a.every((stop, index) => stop.id === b[index]?.id && stop.lat === b[index]?.lat);
}

type RouteBar = {
  root: HTMLElement;
  title: HTMLElement;
  clearBtn: HTMLButtonElement;
  fromMe: HTMLButtonElement;
  stopsEl: HTMLOListElement;
  meta: HTMLElement;
  google: HTMLAnchorElement;
  modes: HTMLButtonElement[];
};

let bar: RouteBar | null = null;
let barActive: () => boolean = () => true;
let note: { text: string; kind: RouteNoteKind } | null = null;
let mapHandle: MapHandle | null = null;
let drawSeq = 0;
let locateSeq = 0;
let userFix: UserFix | null = null;
let originFar = false;
let locating = false;
let permission: GeoPermission = 'unknown';
let locateButton: HTMLButtonElement | null = null;
let locateToast: HTMLElement | null = null;

function syncActions(): void {
  if (!session || typeof document === 'undefined') return;
  const locale = session.locale();
  const full = session.stops.length >= MAX_ROUTE_STOPS;
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-route]')) {
    const id = button.dataset.route;
    if (!id) continue;
    paintRouteAction(button, session.stops.some((stop) => stop.id === id), locale, full);
  }
}

function refresh(): void {
  syncActions();
  if (!bar || !session) return;
  const locale = session.locale();
  const stops = session.stops;
  const user = (stop: RouteStop) => Boolean(stop.user) || stop.id === USER_LOCATION_ID;
  bar.root.hidden = stops.length === 0 || !barActive();
  if (!bar.root.hidden && locateToast) locateToast.hidden = true;
  bar.title.textContent = pickLocale(locale, travelUi.routeTitle);
  bar.root.setAttribute('aria-label', bar.title.textContent);
  const clear = pickLocale(locale, travelUi.routeClear);
  bar.clearBtn.setAttribute('aria-label', clear);
  bar.clearBtn.setAttribute('data-tip', clear);
  const from = pickLocale(locale, travelUi.startFromMyLocation);
  bar.fromMe.setAttribute('aria-label', from);
  bar.fromMe.setAttribute('data-tip', from);
  const fromText = bar.fromMe.querySelector('span:last-child');
  if (fromText) fromText.textContent = from;
  bar.fromMe.hidden = stops.length === 0 || stops.some(user);
  bar.fromMe.disabled = locating;
  bar.stopsEl.replaceChildren();
  stops.forEach((stop, index) => {
    const li = el('li', user(stop) ? 'tb-route__stop is-user' : 'tb-route__stop');
    const n = el('span', 'tb-route__n', user(stop) ? '' : String(index + 1));
    if (user(stop)) n.append(icon('my_location', { size: 16, fill: true }));
    const rm = iconButton({ icon: 'close', label: routeActionLabel(true, locale), size: 'sm' });
    rm.dataset.routeRm = stop.id;
    li.append(n, el('span', 'tb-route__name', pickLocale(locale, { en: stop.label, 'pt-BR': stop.labelPt || stop.label })), rm);
    bar?.stopsEl.append(li);
  });
  for (const button of bar.modes) {
    const on = button.dataset.routeMode === session.mode;
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    const label = pickLocale(locale, button.dataset.routeMode === 'transit' ? travelUi.routeTransit : travelUi.routeWalk);
    const text = button.querySelector('span:last-child');
    if (text) text.textContent = label;
    button.setAttribute('aria-label', label);
  }
  const group = bar.modes[0]?.parentElement;
  if (group) segmented(group);
  const hint = (stops.length >= 2 ? note : null) ?? routeBarHint(stops.length, session.mode, locale);
  bar.meta.hidden = !hint?.text;
  bar.meta.textContent = hint?.text ?? '';
  if (hint) bar.meta.dataset.kind = hint.kind;
  else delete bar.meta.dataset.kind;
  const href = googleDirectionsUrl(stops, session.mode);
  const open = pickLocale(locale, travelUi.routeOpenGoogle);
  bar.google.setAttribute('aria-label', open);
  const googleText = bar.google.querySelector('span:last-child');
  if (googleText) googleText.textContent = open;
  if (href && !bar.root.hidden) {
    bar.google.href = href;
    bar.google.hidden = false;
  } else {
    bar.google.hidden = true;
    bar.google.removeAttribute('href');
  }
}

function drawRoutePreview(fit: boolean): void {
  if (!session || !mapHandle || !barActive()) return;
  const stops = session.stops.filter((stop) => Number.isFinite(stop.lat) && Number.isFinite(stop.lng));
  const seq = ++drawSeq;
  const handle = mapHandle;
  const mode = session.mode;
  if (stops.length < 2) {
    handle.setRoute([]);
    return;
  }
  const userOrigin = stops.some((stop) => stop.user || stop.id === USER_LOCATION_ID);
  if (originFar && userOrigin) {
    handle.setRoute([]);
    setRouteNote({ text: pickLocale(session.locale(), travelUi.locateFar), kind: 'hint' });
    return;
  }
  if (mode === 'transit') {
    handle.setRoute(
      [{ mode: 'transit', dash: true, latlngs: stops.map((stop) => [stop.lat, stop.lng]) }],
      { fit },
    );
    return;
  }
  setRouteNote({ text: pickLocale(session.locale(), travelUi.routeLoading), kind: 'loading' });
  void fetchWalkingRoute(stops)
    .then((result) => {
      if (seq !== drawSeq || !session || !mapHandle || !barActive()) return;
      if (!result) {
        mapHandle.setRoute([]);
        setRouteNote({ text: pickLocale(session.locale(), travelUi.routeError), kind: 'error' });
        return;
      }
      mapHandle.setRoute([{ mode: 'walk', latlngs: result.latlngs }], { fit });
      setRouteNote({ text: walkPreviewLabel(result.durationSec, result.distanceM, session.locale()), kind: 'ok' });
    })
    .catch(() => {
      if (seq !== drawSeq || !session || !barActive()) return;
      mapHandle?.setRoute([]);
      setRouteNote({ text: pickLocale(session.locale(), travelUi.routeError), kind: 'error' });
    });
}

function apply(next: RouteStop[], mode: RouteMode): void {
  if (!session) return;
  if (session.mode === mode && sameStops(session.stops, next)) return;
  session.stops = next;
  session.mode = mode;
  if (!next.some((stop) => stop.user || stop.id === USER_LOCATION_ID)) originFar = false;
  note = null;
  persist(session);
  refresh();
  session.onChange?.();
}

function toggle(id: string): void {
  const place = session?.byId.get(id);
  if (!session || !place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;
  apply(togglePlaceStop(session.stops, toStop(place)).stops, session.mode);
}

/** Walk preview and locate fill this. Clearing the route drops it. */
export function setRouteNote(next: { text: string; kind: RouteNoteKind } | null): void {
  note = next;
  refresh();
}

function userPins(): MapPin[] {
  if (!userFix || !session) return [];
  return [{
    id: USER_LOCATION_ID,
    lat: userFix.lat,
    lng: userFix.lng,
    label: pickLocale(session.locale(), travelUi.myLocation),
    kind: 'stop',
    number: 0,
  }];
}

function syncAccuracy(): void {
  if (!mapHandle || !barActive()) return;
  const fix = userFix;
  if (!fix) return;
  if (fix.accuracyM && fix.accuracyM > 0 && fix.accuracyM < 2000) {
    mapHandle.setRadius({ lat: fix.lat, lng: fix.lng, km: fix.accuracyM / 1000 });
    return;
  }
  mapHandle.setRadius(null);
}

function paintLocate(): void {
  if (!locateButton || !session) return;
  const locale = session.locale();
  const label = locating
    ? pickLocale(locale, travelUi.locating)
    : permission === 'denied'
      ? pickLocale(locale, travelUi.locateDenied)
      : pickLocale(locale, travelUi.locateMe);
  locateButton.setAttribute('aria-label', label);
  locateButton.setAttribute('data-tip', label);
  locateButton.dataset.permission = permission;
  locateButton.setAttribute('aria-busy', locating ? 'true' : 'false');
  locateButton.setAttribute('aria-pressed', userFix ? 'true' : 'false');
  locateButton.disabled = locating;
}

function showStatus(text: string, kind: RouteNoteKind, asStop: boolean): void {
  const routeOpen = Boolean(session && (session.stops.length > 0 || asStop) && bar && !bar.root.hidden);
  if (routeOpen) {
    setRouteNote({ text, kind });
    if (locateToast) locateToast.hidden = true;
    return;
  }
  if (!locateToast) return;
  locateToast.hidden = false;
  locateToast.dataset.kind = kind;
  locateToast.textContent = text;
}

function readUserPosition(): Promise<UserFix> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracyM:
            Number.isFinite(pos.coords.accuracy) && pos.coords.accuracy > 0 ? pos.coords.accuracy : undefined,
        });
      },
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 30000 },
    );
  });
}

async function watchPermission(): Promise<void> {
  try {
    const status = await navigator.permissions?.query({ name: 'geolocation' });
    if (!status) return;
    const applyState = () => {
      const state = status.state;
      permission = state === 'granted' || state === 'denied' || state === 'prompt' ? state : 'unknown';
      paintLocate();
    };
    applyState();
    status.onchange = applyState;
  } catch {
    permission = 'unknown';
  }
}

function mountLocate(column: HTMLElement): void {
  const controls = column.querySelector('.tb-map-controls');
  if (controls && !locateButton) {
    locateButton = iconButton({ icon: 'my_location', label: travelUi.locateMe.en });
    locateButton.dataset.locate = 'true';
    locateButton.addEventListener('click', () => {
      void beginLocate(false);
    });
    controls.append(locateButton);
  }
  if (!locateToast) {
    locateToast = el('p', 'tb-locate-toast');
    locateToast.hidden = true;
    locateToast.setAttribute('role', 'status');
    locateToast.setAttribute('aria-live', 'polite');
    column.append(locateToast);
  }
  paintLocate();
  void watchPermission();
}

async function beginLocate(asStop: boolean): Promise<void> {
  if (!session || locating) return;
  const seq = ++locateSeq;
  locating = true;
  paintLocate();
  refresh();
  const locale = session.locale();
  showStatus(pickLocale(locale, travelUi.locating), 'loading', asStop);
  try {
    const fix = await readUserPosition();
    if (seq !== locateSeq || !session) return;
    userFix = fix;
    permission = 'granted';
    originFar = isFarFromCity(fix, session.city);
    const pin = userPins();
    if (pin.length && mapHandle) {
      mapHandle.setPins('stop', pin);
      if (barActive()) syncAccuracy();
      mapHandle.flyTo(fix.lat, fix.lng, 15);
    }
    if (asStop) {
      apply(
        withUserOrigin(session.stops, {
          id: USER_LOCATION_ID,
          lat: fix.lat,
          lng: fix.lng,
          label: travelUi.myLocation.en,
          labelPt: travelUi.myLocation['pt-BR'],
          user: true,
        }),
        session.mode,
      );
      if (originFar && session) {
        setRouteNote({ text: pickLocale(session.locale(), travelUi.locateFar), kind: 'hint' });
      }
      return;
    }
    if (originFar) showStatus(pickLocale(locale, travelUi.locateFar), 'hint', false);
    else if (locateToast) locateToast.hidden = true;
  } catch (error) {
    if (seq !== locateSeq || !session) return;
    const failure = locateFailure(error as { code?: number; message?: string });
    if (failure === 'denied') permission = 'denied';
    showStatus(locateFailureLabel(failure, session.locale()), 'error', asStop);
  } finally {
    if (seq === locateSeq) {
      locating = false;
      paintLocate();
      refresh();
    }
  }
}

export function routePlannerOn(): boolean {
  return session != null;
}

export function createRouteButton(placeId: string, locale: Locale, labeled = false): HTMLButtonElement {
  const on = session?.stops.some((stop) => stop.id === placeId) ?? false;
  const full = (session?.stops.length ?? 0) >= MAX_ROUTE_STOPS;
  const button = labeled
    ? el('button', 'tb-btn-outline tb-route-add')
    : iconButton({ icon: 'route', label: routeActionLabel(on, locale) });
  if (labeled) {
    button.type = 'button';
    button.append(icon('route', { size: 18 }), el('span', 'tb-route-add__label'));
  }
  button.dataset.route = placeId;
  paintRouteAction(button, on, locale, full);
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    toggle(placeId);
  });
  return button;
}

function modeButton(mode: RouteMode, glyph: 'directions_walk' | 'directions_transit'): HTMLButtonElement {
  const button = el('button');
  button.type = 'button';
  button.dataset.routeMode = mode;
  button.append(icon(glyph, { size: 18 }), el('span'));
  button.addEventListener('click', () => {
    if (!session) return;
    apply(session.stops, mode);
  });
  return button;
}

function mountBar(column: HTMLElement): void {
  const root = el('section', 'tb-route');
  root.hidden = true;
  const head = el('div', 'tb-route__head');
  const title = el('span', 'tb-route__title');
  const clearBtn = iconButton({ icon: 'close', label: 'Clear route', size: 'sm' });
  clearBtn.addEventListener('click', () => {
    if (!session) return;
    apply([], session.mode);
    clearBtn.focus();
  });
  head.append(title, clearBtn);
  const fromMe = el('button', 'tb-btn-outline tb-route__from');
  fromMe.type = 'button';
  fromMe.hidden = true;
  fromMe.append(icon('my_location', { size: 18, fill: true }), el('span'));
  fromMe.addEventListener('click', () => {
    void beginLocate(true);
  });
  const stopsEl = el('ol', 'tb-route__stops');
  stopsEl.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest<HTMLButtonElement>('[data-route-rm]');
    const id = button?.dataset.routeRm;
    if (!id || !session) return;
    event.preventDefault();
    event.stopPropagation();
    const focused = document.activeElement === button;
    apply(removeRouteStop(session.stops, id), session.mode);
    if (focused) clearBtn.focus();
  });
  const modes = el('div', 'tb-route__modes');
  modes.setAttribute('role', 'group');
  const walk = modeButton('walk', 'directions_walk');
  const transit = modeButton('transit', 'directions_transit');
  modes.append(walk, transit);
  segmented(modes);
  const meta = el('p', 'tb-route__meta');
  meta.setAttribute('role', 'status');
  meta.setAttribute('aria-live', 'polite');
  const google = el('a', 'tb-btn tb-route__google');
  google.hidden = true;
  google.target = '_blank';
  google.rel = 'noopener noreferrer';
  google.append(icon('map', { size: 18 }), el('span'));
  root.append(head, fromMe, stopsEl, modes, meta, google);
  column.append(root);
  bar = { root, title, clearBtn, fromMe, stopsEl, meta, google, modes: [walk, transit] };
}

export function mountRoutePlanner(opts: {
  slug: string;
  places: readonly RoutePlace[];
  locale: () => Locale;
  column?: HTMLElement | null;
  map?: MapHandle | null;
  city?: { lat: number; lng: number };
  active?: () => boolean;
  onChange?: () => void;
}): {
  ids(): string[];
  stopCount(): number;
  badges(): Map<string, number>;
  userPins(): MapPin[];
  syncAccuracy(): void;
  draw(fit: boolean): void;
  sync(): void;
  dispose(): void;
} {
  const byId = new Map<string, RoutePlace>();
  for (const place of opts.places) byId.set(place.id, place);
  const stored = readStoredRoute(opts.slug);
  const stops: RouteStop[] = [];
  for (const id of stored.ids) {
    const place = byId.get(id);
    if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) continue;
    stops.push(toStop(place));
  }
  bar?.root.remove();
  bar = null;
  note = null;
  drawSeq += 1;
  locateSeq += 1;
  userFix = null;
  originFar = false;
  locating = false;
  mapHandle = opts.map ?? null;
  barActive = opts.active ?? (() => true);
  session = {
    slug: opts.slug,
    stops,
    mode: stored.mode,
    city: opts.city ?? { lat: 0, lng: 0 },
    byId,
    locale: opts.locale,
    onChange: opts.onChange,
  };
  if (opts.column) {
    mountBar(opts.column);
    mountLocate(opts.column);
  }
  refresh();
  const slug = opts.slug;
  return {
    ids: () => (session?.slug === slug ? placeStopIds(session.stops) : []),
    stopCount: () => (session?.slug === slug ? session.stops.length : 0),
    badges: () => routeStopBadges(session?.slug === slug ? session.stops : []),
    userPins: () => (session?.slug === slug ? userPins() : []),
    syncAccuracy() {
      if (session?.slug === slug) syncAccuracy();
    },
    draw(fit: boolean) {
      if (session?.slug === slug) drawRoutePreview(fit);
    },
    sync: () => {
      if (session?.slug === slug) refresh();
    },
    dispose() {
      if (session?.slug !== slug) return;
      drawSeq += 1;
      locateSeq += 1;
      locating = false;
      userFix = null;
      originFar = false;
      mapHandle = null;
      session = null;
      note = null;
      bar?.root.remove();
      bar = null;
      locateButton?.remove();
      locateButton = null;
      locateToast?.remove();
      locateToast = null;
    },
  };
}

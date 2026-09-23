import { read, write } from '../app/store';
import { pickLocale, travelUi, type Locale } from '../catalog';
import { iconButton, segmented } from '../ui/controls';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';

export const MAX_ROUTE_STOPS = 8;
export const USER_LOCATION_ID = 'user-location';

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
  byId: Map<string, RoutePlace>;
  locale: () => Locale;
  onChange?: () => void;
};

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
  modes: HTMLButtonElement[];
};

let bar: RouteBar | null = null;
let barActive: () => boolean = () => true;
let note: { text: string; kind: RouteNoteKind } | null = null;

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
}

function apply(next: RouteStop[], mode: RouteMode): void {
  if (!session) return;
  if (session.mode === mode && sameStops(session.stops, next)) return;
  session.stops = next;
  session.mode = mode;
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

async function beginLocate(asStop: boolean): Promise<void> {
  void asStop;
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
  root.append(head, fromMe, stopsEl, modes, meta);
  column.append(root);
  bar = { root, title, clearBtn, fromMe, stopsEl, meta, modes: [walk, transit] };
}

export function mountRoutePlanner(opts: {
  slug: string;
  places: readonly RoutePlace[];
  locale: () => Locale;
  column?: HTMLElement | null;
  active?: () => boolean;
  onChange?: () => void;
}): { ids(): string[]; sync(): void; dispose(): void } {
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
  barActive = opts.active ?? (() => true);
  session = {
    slug: opts.slug,
    stops,
    mode: stored.mode,
    byId,
    locale: opts.locale,
    onChange: opts.onChange,
  };
  if (opts.column) mountBar(opts.column);
  refresh();
  const slug = opts.slug;
  return {
    ids: () => (session?.slug === slug ? placeStopIds(session.stops) : []),
    sync: () => {
      if (session?.slug === slug) refresh();
    },
    dispose() {
      if (session?.slug !== slug) return;
      session = null;
      note = null;
      bar?.root.remove();
      bar = null;
    },
  };
}

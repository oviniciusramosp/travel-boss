import { read, write } from '../app/store';
import { pickLocale, travelUi, type Locale } from '../catalog';
import { iconButton } from '../ui/controls';
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

function toggle(id: string): void {
  const current = session;
  const place = current?.byId.get(id);
  if (!current || !place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) return;
  current.stops = togglePlaceStop(current.stops, toStop(place)).stops;
  persist(current);
  syncActions();
  current.onChange?.();
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

export function mountRoutePlanner(opts: {
  slug: string;
  places: readonly RoutePlace[];
  locale: () => Locale;
  onChange?: () => void;
}): { ids(): string[]; dispose(): void } {
  const byId = new Map<string, RoutePlace>();
  for (const place of opts.places) byId.set(place.id, place);
  const stored = readStoredRoute(opts.slug);
  const stops: RouteStop[] = [];
  for (const id of stored.ids) {
    const place = byId.get(id);
    if (!place || !Number.isFinite(place.lat) || !Number.isFinite(place.lng)) continue;
    stops.push(toStop(place));
  }
  session = {
    slug: opts.slug,
    stops,
    mode: stored.mode,
    byId,
    locale: opts.locale,
    onChange: opts.onChange,
  };
  const slug = opts.slug;
  return {
    ids: () => (session?.slug === slug ? placeStopIds(session.stops) : []),
    dispose() {
      if (session?.slug === slug) session = null;
    },
  };
}

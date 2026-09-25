export type CityTab = 'places' | 'market' | 'food' | 'hotels';

export type Route =
  | { kind: 'home' }
  | { kind: 'trip'; id: string }
  | { kind: 'city'; slug: string; tab: CityTab; place?: string; day?: number };

/** Tab order in the city header. */
export const TABS: readonly CityTab[] = ['places', 'market', 'food', 'hotels'];

function isTab(value: string | undefined): value is CityTab {
  if (value === 'itinerary') return false;
  return TABS.includes(value as CityTab);
}

function parseDay(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const day = Number(value);
  if (!Number.isSafeInteger(day) || day < 1) return undefined;
  return day;
}

/** `#/`, `#/trip/<id>`, or `#/city/<slug>/<tab>?place=<id>&day=<n>` (day is 1-based). */
export function parseHash(hash: string): Route | null {
  const text = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!text.startsWith('/')) return null;
  const queryAt = text.indexOf('?');
  const path = queryAt === -1 ? text : text.slice(0, queryAt);
  const query = queryAt === -1 ? '' : text.slice(queryAt + 1);
  const parts = path.split('/').filter((part) => part.length > 0);
  if (parts.length === 0) return { kind: 'home' };

  if (parts[0] === 'trip' && parts.length === 2) {
    const id = decodeURIComponent(parts[1] ?? '');
    return id ? { kind: 'trip', id } : null;
  }

  if (parts[0] === 'city' && parts.length === 3 && (parts[2] === 'itinerary' || isTab(parts[2]))) {
    const slug = decodeURIComponent(parts[1] ?? '');
    if (!slug) return null;
    const params = new URLSearchParams(query);
    const place = params.get('place')?.trim() || undefined;
    const day = parseDay(params.get('day'));
    return {
      kind: 'city',
      slug,
      tab: parts[2] === 'itinerary' ? 'places' : parts[2],
      ...(place ? { place } : {}),
      ...(day !== undefined ? { day } : {}),
    };
  }

  return null;
}

export function formatHash(route: Route): string {
  if (route.kind === 'home') return '#/';
  if (route.kind === 'trip') return `#/trip/${encodeURIComponent(route.id)}`;
  const params = new URLSearchParams();
  if (route.place) params.set('place', route.place);
  if (route.day != null && route.day > 0) params.set('day', String(route.day));
  const query = params.toString();
  return `#/city/${encodeURIComponent(route.slug)}/${route.tab}${query ? `?${query}` : ''}`;
}

export function sameRoute(a: Route | null, b: Route | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return formatHash(a) === formatHash(b);
}

/**
 * Another trip or city is a new view (push). Tab, place and day stay on the
 * same entry (replace). The first load uses replace on purpose, not this.
 */
export function navigationMode(from: Route | null, to: Route): 'push' | 'replace' {
  if (!from || from.kind !== to.kind) return 'push';
  if (from.kind === 'home') return 'replace';
  if (from.kind === 'trip' && to.kind === 'trip') return from.id === to.id ? 'replace' : 'push';
  if (from.kind === 'city' && to.kind === 'city') {
    return from.slug === to.slug ? 'replace' : 'push';
  }
  return 'push';
}

export function setDocumentTitle(title: string): void {
  const clean = title.trim();
  document.title = clean ? `${clean} · Travel Boss` : 'Travel Boss';
}

export function commitRoute(route: Route, mode: 'push' | 'replace'): void {
  const current = parseHash(location.hash);
  if (current && sameRoute(current, route)) return;
  const url = `${location.pathname}${location.search}${formatHash(route)}`;
  if (mode === 'push') history.pushState(null, '', url);
  else history.replaceState(null, '', url);
}

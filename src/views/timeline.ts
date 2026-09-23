/**
 * City itinerary tab (not the `#/trip/` document).
 * Day header, budgets and the route action. Later phases add periods,
 * hops and editing on top of these helpers.
 */
import {
  computeDayBudget,
  computeTripBudget,
  dayPrimaryRoutePlaceIds,
  pickLocale,
  resolveVisit,
  travelUi,
} from '../catalog';
import type {
  DayBudget,
  ItineraryDay,
  ItineraryStop,
  Locale,
  TravelItinerary,
  TravelPlace,
} from '../catalog';
import { googleDirectionsUrl } from '../trip/directions';
import { iconButton } from '../ui/controls';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';

export type RoutePhase = 'idle' | 'drawing' | 'on';

type Money = { currency?: string; free?: boolean; min?: number; max?: number };

/** Same typical-euro rule as the catalog budget. Catalog does not re-export it. */
export function typicalEur(money: Money | undefined): number {
  if (!money || money.free) return 0;
  if (money.currency && money.currency !== 'EUR') return 0;
  if (money.min != null && Number.isFinite(money.min)) return money.min;
  if (money.max != null && Number.isFinite(money.max)) return money.max;
  return 0;
}

export function formatEur(amount: number, locale: Locale): string {
  const cents = Math.round(amount * 100);
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100);
}

export function primaryStopCount(stops: readonly ItineraryStop[]): number {
  return dayPrimaryRoutePlaceIds({
    id: '',
    day: 1,
    title: { en: '', 'pt-BR': '' },
    stops: [...stops],
  }).length;
}

export function stopCountLabel(count: number, locale: Locale): string {
  return pickLocale(locale, {
    en: count === 1 ? '1 stop' : `${count} stops`,
    'pt-BR': count === 1 ? '1 parada' : `${count} paradas`,
  });
}

export function routeActionLabel(phase: RoutePhase, locale: Locale): string {
  if (phase === 'drawing') {
    return pickLocale(locale, { en: 'Drawing…', 'pt-BR': 'Traçando…' });
  }
  if (phase === 'on') return pickLocale(locale, travelUi.itineraryOnMap);
  return pickLocale(locale, travelUi.itineraryShowRoute);
}

/** Drop missing coordinates and a repeated pin so Maps does not get an empty hop. */
export function directionPoints(
  ids: readonly string[],
  coords: ReadonlyMap<string, { lat: number; lng: number }>,
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  for (const id of ids) {
    const point = coords.get(id);
    if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) continue;
    const prev = points[points.length - 1];
    if (prev && prev.lat === point.lat && prev.lng === point.lng) continue;
    points.push({ lat: point.lat, lng: point.lng });
  }
  return points;
}

export function dayDirectionsUrl(
  ids: readonly string[],
  coords: ReadonlyMap<string, { lat: number; lng: number }>,
): string | null {
  return googleDirectionsUrl(directionPoints(ids, coords), 'transit');
}

/** Default arrival, matching `computeTripBudget`. */
export function budgetDay(day: ItineraryDay): ItineraryDay {
  if (!day.arrivals?.length) return day;
  const chosen = day.arrivals.find((item) => item.default) ?? day.arrivals[0];
  return chosen ? { ...day, stops: chosen.stops } : day;
}

export function moneyTip(
  ids: readonly string[],
  places: Map<string, TravelPlace>,
  locale: Locale,
  kind: 'food' | 'ticket',
): string {
  const parts: string[] = [];
  for (const id of ids) {
    const place = places.get(id);
    if (!place) continue;
    const visit = resolveVisit(id, place.visit);
    const amount =
      kind === 'food' ? typicalEur(visit?.avgPricePerPerson) : typicalEur(visit?.ticket);
    if (amount <= 0) continue;
    parts.push(`${pickLocale(locale, place.name)} ${formatEur(amount, locale)}`);
  }
  return parts.join(' · ');
}

export function paintRouteButton(button: HTMLButtonElement, phase: RoutePhase, locale: Locale): void {
  const label = routeActionLabel(phase, locale);
  button.setAttribute('aria-label', label);
  button.setAttribute('data-tip', label);
  button.setAttribute('aria-pressed', phase === 'on' ? 'true' : 'false');
  button.disabled = phase === 'drawing';
  button.classList.toggle('is-drawing', phase === 'drawing');
}

function budgetChip(
  glyph: 'restaurant' | 'local_activity',
  amount: number,
  label: string,
  unit: string,
  tip: string,
  locale: Locale,
): HTMLElement {
  const chip = el('span', 'tb-budget-chip');
  chip.tabIndex = 0;
  const figure = formatEur(amount, locale);
  const detail = tip || label;
  chip.setAttribute('aria-label', `${label} ${figure}. ${detail}`);
  chip.setAttribute('data-tip', detail);
  chip.append(icon(glyph, { size: 16 }));
  chip.append(el('strong', undefined, figure));
  chip.append(el('span', 'tb-budget-chip__unit', unit));
  return chip;
}

function budgetGroup(
  budget: Pick<DayBudget, 'foodEur' | 'ticketsEur' | 'foodPlaceIds' | 'ticketPlaceIds'>,
  places: Map<string, TravelPlace>,
  locale: Locale,
  groupLabel: string,
): HTMLElement | null {
  if (budget.foodEur <= 0 && budget.ticketsEur <= 0) return null;
  const group = el('div', 'tb-budgets');
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', groupLabel);
  const unit = pickLocale(locale, travelUi.itineraryPerPerson);
  group.append(
    budgetChip(
      'restaurant',
      budget.foodEur,
      pickLocale(locale, travelUi.itineraryFood),
      unit,
      moneyTip(budget.foodPlaceIds, places, locale, 'food'),
      locale,
    ),
    budgetChip(
      'local_activity',
      budget.ticketsEur,
      pickLocale(locale, travelUi.itineraryParks),
      unit,
      moneyTip(budget.ticketPlaceIds, places, locale, 'ticket'),
      locale,
    ),
  );
  return group;
}

function tripBudgetParts(
  itinerary: TravelItinerary,
  places: Map<string, TravelPlace>,
): DayBudget {
  const foodPlaceIds: string[] = [];
  const ticketPlaceIds: string[] = [];
  for (const day of itinerary.days) {
    const budget = computeDayBudget(budgetDay(day), places);
    foodPlaceIds.push(...budget.foodPlaceIds);
    ticketPlaceIds.push(...budget.ticketPlaceIds);
  }
  const totals = computeTripBudget(itinerary, places);
  return { ...totals, foodPlaceIds, ticketPlaceIds };
}

/** Title plus the catalog total. The figure is `computeTripBudget`. */
export function itineraryIntro(
  itinerary: TravelItinerary,
  places: Map<string, TravelPlace>,
  locale: Locale,
): HTMLElement {
  const head = el('header', 'tb-itin-head');
  head.append(el('h2', 'tb-itin-title', pickLocale(locale, itinerary.title)));
  const group = budgetGroup(
    tripBudgetParts(itinerary, places),
    places,
    locale,
    pickLocale(locale, travelUi.itineraryTripBudgetGroup),
  );
  if (group) head.append(group);
  return head;
}

export function dayBudgetEl(
  day: ItineraryDay,
  stops: readonly ItineraryStop[],
  places: Map<string, TravelPlace>,
  locale: Locale,
): HTMLElement | null {
  const budget = computeDayBudget({ ...day, stops: [...stops] }, places);
  return budgetGroup(budget, places, locale, pickLocale(locale, travelUi.itineraryBudgetGroup));
}

function mapsLink(url: string | null, label: string): HTMLAnchorElement {
  const link = el('a', 'tb-icon-btn tb-icon-btn--ghost tb-icon-btn--md');
  link.target = '_blank';
  link.rel = 'noopener';
  link.dataset.maps = 'true';
  link.dataset.dayGmaps = 'true';
  link.setAttribute('aria-label', label);
  link.setAttribute('data-tip', label);
  link.append(icon('map', { size: 18 }));
  if (url) link.href = url;
  else {
    link.setAttribute('aria-disabled', 'true');
    link.tabIndex = -1;
  }
  link.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!url) event.preventDefault();
  });
  return link;
}

/** Badge, stop count for the chosen arrival, and the hover actions. */
export function daySummary(opts: {
  dayNumber: number;
  stops: readonly ItineraryStop[];
  phase: RoutePhase;
  mapsUrl: string | null;
  locale: Locale;
  onRoute: () => void;
}): HTMLElement {
  const summary = el('summary', 'tb-day__summary');
  const count = primaryStopCount(opts.stops);
  summary.append(
    el('span', 'tb-badge', `${pickLocale(opts.locale, travelUi.itineraryDay)} ${opts.dayNumber}`),
    el('span', 'tb-day__count', stopCountLabel(count, opts.locale)),
  );
  const actions = el('span', 'tb-day__actions');
  const mapsLabel = pickLocale(opts.locale, travelUi.itineraryOpenGoogleMaps);
  const route = iconButton({
    icon: 'route',
    label: routeActionLabel(opts.phase, opts.locale),
    pressed: opts.phase === 'on',
  });
  route.classList.add('tb-day__route');
  paintRouteButton(route, opts.phase, opts.locale);
  route.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    opts.onRoute();
  });
  actions.append(mapsLink(opts.mapsUrl, mapsLabel), route);
  summary.append(actions);
  return summary;
}

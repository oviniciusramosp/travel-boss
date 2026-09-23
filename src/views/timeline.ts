/**
 * City itinerary tab (not the `#/trip/` document).
 * Day header, budgets and the route action. Later phases add periods,
 * hops and editing on top of these helpers.
 */
import {
  computeDayBudget,
  computeTripBudget,
  dayPrimaryRoutePlaceIds,
  expandTimelineTransferParts,
  pickLocale,
  resolveVisit,
  travelUi,
} from '../catalog';
import type {
  DayBudget,
  ItineraryDay,
  ItineraryLegDef,
  ItineraryStop,
  Locale,
  TimelineTransferPart,
  TravelItinerary,
  TravelPlace,
} from '../catalog';
import { googleDirectionsUrl } from '../trip/directions';
import { iconButton } from '../ui/controls';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';
import { transferRow } from './transfer-row';

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

export function stopCost(
  stop: ItineraryStop,
  place: TravelPlace | undefined,
): { food: number; ticket: number } {
  const visit = resolveVisit(stop.placeId, place?.visit);
  if (!visit) return { food: 0, ticket: 0 };
  return {
    food: stop.countFood === false ? 0 : typicalEur(visit.avgPricePerPerson),
    ticket: stop.countTicket === false ? 0 : typicalEur(visit.ticket),
  };
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

const PERIODS = ['morning', 'afternoon', 'evening'] as const;
export type Period = (typeof PERIODS)[number];

export function periodOf(stop: ItineraryStop): Period | 'other' {
  if (stop.slot === 'morning' || stop.slot === 'afternoon' || stop.slot === 'evening') return stop.slot;
  return 'other';
}

export type ResolvedStop = ItineraryStop & { index: number };

/** Morning, afternoon, evening, then anything without a slot. Order inside a period stays. */
export function sectionsOf(
  stops: readonly ItineraryStop[],
): { key: Period | 'other'; stops: ResolvedStop[] }[] {
  const buckets = new Map<Period | 'other', ResolvedStop[]>();
  stops.forEach((stop, index) => {
    const key = periodOf(stop);
    const list = buckets.get(key) ?? [];
    list.push({ ...stop, index });
    buckets.set(key, list);
  });
  const sections: { key: Period | 'other'; stops: ResolvedStop[] }[] = [];
  for (const key of PERIODS) {
    const list = buckets.get(key);
    if (list?.length) sections.push({ key, stops: list });
  }
  const other = buckets.get('other');
  if (other?.length) sections.push({ key: 'other', stops: other });
  return sections;
}

export function periodLabel(period: Period, locale: Locale): string {
  const table = {
    morning: travelUi.itineraryMorning,
    afternoon: travelUi.itineraryAfternoon,
    evening: travelUi.itineraryEvening,
  } as const;
  return pickLocale(locale, table[period]);
}

/**
 * Primary stops whose period is on, and only the legs between two enabled
 * neighbors. A hidden period leaves a gap — it does not bridge morning to evening.
 */
export function routeForSlots(
  stops: readonly ItineraryStop[],
  legs: readonly ItineraryLegDef[],
  enabled: ReadonlySet<string>,
): { ids: string[]; legs: ItineraryLegDef[] } {
  const ids: string[] = [];
  const kept: ItineraryLegDef[] = [];
  let previous: ItineraryStop | null = null;
  for (const stop of stops) {
    if (stop.optional) continue;
    const slot = periodOf(stop);
    if (slot !== 'other' && !enabled.has(slot)) {
      previous = null;
      continue;
    }
    if (previous) {
      const from = previous.placeId;
      const to = stop.placeId;
      kept.push(legs.find((leg) => leg.from === from && leg.to === to) ?? { from, to, mode: 'walk' });
    }
    ids.push(stop.placeId);
    previous = stop;
  }
  return { ids, legs: kept };
}

export type RailKind = 'none' | 'walk' | 'transit';

export type TimelineEntry =
  | { kind: 'hop'; part: TimelineTransferPart }
  | {
      kind: 'stop';
      stop: ResolvedStop;
      railAbove: RailKind;
      railBelow: RailKind;
      aboveColor: string | null;
      belowColor: string | null;
    };

function legBetween(
  from: string,
  to: string,
  legs: readonly ItineraryLegDef[],
): ItineraryLegDef {
  return legs.find((leg) => leg.from === from && leg.to === to) ?? { from, to, mode: 'walk' };
}

function neighborPrimary(
  stop: ResolvedStop,
  allStops: readonly ItineraryStop[],
  dir: -1 | 1,
): ItineraryStop | null {
  for (let index = stop.index + dir; index >= 0 && index < allStops.length; index += dir) {
    const item = allStops[index];
    if (item && !item.optional) return item;
  }
  return null;
}

/** One row per hop. An optional stop never owns a leg, so it stays off the rail. */
export function sectionEntries(
  sectionStops: readonly ResolvedStop[],
  allStops: readonly ItineraryStop[],
  legs: readonly ItineraryLegDef[],
  coords: ReadonlyMap<string, { lat: number; lng: number }>,
): TimelineEntry[] {
  const entries: TimelineEntry[] = [];
  let opened = false;
  for (const stop of sectionStops) {
    if (!opened && !stop.optional) {
      const prev = neighborPrimary(stop, allStops, -1);
      if (prev && periodOf(prev) !== periodOf(stop)) {
        const leg = legBetween(prev.placeId, stop.placeId, legs);
        for (const part of expandTimelineTransferParts(leg, coords.get(leg.from), coords.get(leg.to))) {
          entries.push({ kind: 'hop', part });
        }
      }
      opened = true;
    }
    const stopEntry: TimelineEntry = {
      kind: 'stop',
      stop,
      railAbove: 'none',
      railBelow: 'none',
      aboveColor: null,
      belowColor: null,
    };
    entries.push(stopEntry);
    if (stop.optional) continue;
    const next = neighborPrimary(stop, allStops, 1);
    if (!next || periodOf(next) !== periodOf(stop)) continue;
    const leg = legBetween(stop.placeId, next.placeId, legs);
    for (const part of expandTimelineTransferParts(leg, coords.get(leg.from), coords.get(leg.to))) {
      entries.push({ kind: 'hop', part });
    }
  }
  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index];
    if (!entry || entry.kind !== 'stop' || entry.stop.optional) continue;
    const prev = entries[index - 1];
    const next = entries[index + 1];
    if (prev?.kind === 'hop') {
      entry.railAbove = prev.part.mode === 'walk' ? 'walk' : 'transit';
      entry.aboveColor = prev.part.mode === 'transit' ? prev.part.color : null;
    }
    if (next?.kind === 'hop') {
      entry.railBelow = next.part.mode === 'walk' ? 'walk' : 'transit';
      entry.belowColor = next.part.mode === 'transit' ? next.part.color : null;
    }
  }
  return entries;
}

export function paintStopRail(row: HTMLElement, entry: Extract<TimelineEntry, { kind: 'stop' }>): void {
  row.dataset.railAbove = entry.railAbove;
  row.dataset.railBelow = entry.railBelow;
  if (entry.aboveColor) row.style.setProperty('--rail-above', entry.aboveColor);
  else row.style.removeProperty('--rail-above');
  if (entry.belowColor) row.style.setProperty('--rail-below', entry.belowColor);
  else row.style.removeProperty('--rail-below');
  row.classList.toggle('is-off-rail', Boolean(entry.stop.optional));
}

function hopRow(part: TimelineTransferPart, locale: Locale): HTMLLIElement {
  const item = transferRow(part, locale);
  item.classList.add('tb-timeline__hop');
  const rail = el('span', 'tb-timeline__rail');
  rail.dataset.rail = part.mode === 'walk' ? 'walk' : 'transit';
  if (part.mode === 'transit' && part.color) rail.style.setProperty('--line-color', part.color);
  item.prepend(rail);
  return item;
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
    if (!link.getAttribute('href')) event.preventDefault();
  });
  return link;
}

function slotSwitch(on: boolean, slot: string, locale: Locale, onToggle: (on: boolean) => void): HTMLButtonElement {
  const button = el('button', 'tb-slot__switch');
  button.type = 'button';
  button.setAttribute('role', 'switch');
  button.dataset.timelineAction = 'slot';
  button.dataset.slot = slot;
  const paint = (checked: boolean) => {
    button.setAttribute('aria-checked', checked ? 'true' : 'false');
    const label = pickLocale(locale, checked ? travelUi.itinerarySlotOnMap : travelUi.itinerarySlotOffMap);
    button.setAttribute('aria-label', label);
    button.setAttribute('data-tip', label);
  };
  paint(on);
  button.append(el('span', 'tb-slot__switch-track'));
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = button.getAttribute('aria-checked') !== 'true';
    paint(next);
    onToggle(next);
  });
  return button;
}

/** Collapsible morning / afternoon / evening. `other` has no header and stays on the map. */
export function renderPeriods(opts: {
  stops: readonly ItineraryStop[];
  legs: readonly ItineraryLegDef[];
  locale: Locale;
  enabled: ReadonlySet<string>;
  coords: ReadonlyMap<string, { lat: number; lng: number }>;
  isOpen: (slot: string) => boolean;
  onOpen: (slot: string, open: boolean) => void;
  onToggleSlot: (slot: string, on: boolean) => void;
  renderStop: (stop: ItineraryStop, index: number) => HTMLElement | null;
}): HTMLElement {
  const wrap = el('div', 'tb-slots');
  for (const section of sectionsOf(opts.stops)) {
    const details = el('details', 'tb-slot');
    details.dataset.slot = section.key;
    details.open = opts.isOpen(section.key);
    details.addEventListener('toggle', () => opts.onOpen(section.key, details.open));
    if (section.key !== 'other') {
      const onMap = opts.enabled.has(section.key);
      details.classList.toggle('is-off-map', !onMap);
      const summary = el('summary', 'tb-slot__summary');
      const ids = section.stops.filter((stop) => !stop.optional).map((stop) => stop.placeId);
      const link = mapsLink(
        dayDirectionsUrl(ids, opts.coords),
        pickLocale(opts.locale, travelUi.itineraryOpenGoogleMapsPeriod),
      );
      delete link.dataset.dayGmaps;
      link.dataset.slotGmaps = section.key;
      const count = el('span', 'tb-slot__count', String(section.stops.length));
      summary.append(
        link,
        el('span', 'tb-slot__label', periodLabel(section.key, opts.locale)),
        count,
        slotSwitch(onMap, section.key, opts.locale, (on) => {
          details.classList.toggle('is-off-map', !on);
          opts.onToggleSlot(section.key, on);
        }),
        icon('expand_more', { size: 18 }),
      );
      details.append(summary);
    }
    const list = el('ol', 'tb-list tb-timeline');
    for (const entry of sectionEntries(section.stops, opts.stops, opts.legs, opts.coords)) {
      if (entry.kind === 'hop') {
        list.append(hopRow(entry.part, opts.locale));
        continue;
      }
      const row = opts.renderStop(entry.stop, entry.stop.index);
      if (!row) continue;
      paintStopRail(row, entry);
      list.append(row);
    }
    details.append(list);
    wrap.append(details);
  }
  return wrap;
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

import type { Shell } from '../app/shell';
import {
  readArrival,
  readCategoryFilter,
  readGroups,
  writeArrival,
  writeCategoryFilter,
  writeGroups,
} from '../app/store';
import {
  categoryMaterialName,
  dayPrimaryRoutePlaceIds,
  favoritePlaces,
  getTravelCity,
  googleMapsUrl,
  itineraryForCity,
  legsForDay,
  pickLocale,
  placeCategoriesOffByDefault,
  placeCategoryMeta,
  placeCategoryOrder,
  resolveVisit,
  subcategoryLabel,
  travelCities,
  travelUi,
  visitFieldsForDisplay,
  withResolvedArea,
} from '../catalog';
import type {
  ItineraryArrivalOption,
  ItineraryDay,
  ItineraryStop,
  Locale,
  LString,
  PlaceCategory,
  TravelCity,
  TravelPlace,
} from '../catalog';
import { buildItineraryRoute, buildItineraryRoutePreview } from '../map/itinerary-route';
import type { MapHandle, MapPin } from '../map/types';
import { iconLink, segmented } from '../ui/controls';
import {
  dayBudgetEl,
  dayDirectionsUrl,
  itineraryIntro,
  paintRouteButton,
  daySummary,
  renderPeriods,
  routeForSlots,
  type RoutePhase,
} from './timeline';
import { el } from '../ui/dom';
import { icon, ICONS, type IconName } from '../ui/icons';
import { prefersReducedMotion } from '../ui/motion';
import { priceLevel, priceLevelOf } from '../ui/price';
import { formatRating, ratingSummary } from '../ui/rating';
import { row } from '../ui/row';
import {
  closePlace,
  onPlaceClose,
  openPlace,
  openPlaceId,
  repaintPlace,
  setPlaceOrigin,
} from './place-panel';

type Tab = 'places' | 'itinerary' | 'hotels';

export type CityRouteState = {
  tab: Tab;
  place?: string;
  day?: number;
};

function dayIndexFrom(day: number | undefined, count: number): number {
  if (day == null || day < 1 || count < 1) return 0;
  return Math.min(count - 1, day - 1);
}

const CATEGORY_LABEL = travelUi.categories;

function fold(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase();
}

function isCategory(value: string): value is PlaceCategory {
  return (placeCategoryOrder as readonly string[]).includes(value);
}

/** Categories that exist in this city, in catalog order. Empty ones stay hidden. */
export function categoriesPresent(
  order: readonly PlaceCategory[],
  places: readonly { category: PlaceCategory }[],
): PlaceCategory[] {
  const present = new Set(places.map((place) => place.category));
  return order.filter((category) => present.has(category));
}

/** True when the enabled set is still the catalog default (commons and markets off). */
export function isDefaultCategoryFilter(
  enabled: Iterable<string>,
  order: readonly PlaceCategory[],
  offByDefault: ReadonlySet<PlaceCategory>,
): boolean {
  const on = new Set(enabled);
  const expected = order.filter((category) => !offByDefault.has(category));
  if (on.size !== expected.length) return false;
  return expected.every((category) => on.has(category));
}

/** Toggle one category, or replace the set with just that one (⌥ / "só esta"). */
export function applyCategoryClick(
  enabled: Iterable<PlaceCategory>,
  category: PlaceCategory,
  only: boolean,
): PlaceCategory[] {
  if (only) return [category];
  const next = new Set(enabled);
  if (next.has(category)) next.delete(category);
  else next.add(category);
  return [...next];
}

/** Missing storage starts collapsed, same as the portfolio's first visit. */
export function groupOpenState(
  categories: readonly string[],
  saved: Readonly<Record<string, boolean>> | null,
): Record<string, boolean> {
  const state: Record<string, boolean> = {};
  for (const category of categories) state[category] = saved?.[category] ?? false;
  return state;
}

export function groupsToggleLabel(allOpen: boolean, locale: Locale): string {
  return pickLocale(locale, allOpen ? travelUi.collapseAll : travelUi.expandAll);
}

function placeThumb(place: TravelPlace): HTMLElement {
  const frame = el('span', 'tb-thumb');
  const glyph = () => categoryGlyph(place.category, 18);
  const cover = place.photos?.[0];
  if (!cover?.url) {
    frame.append(glyph());
    return frame;
  }
  const img = el('img');
  img.alt = '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = cover.url;
  img.addEventListener('error', () => {
    img.replaceWith(glyph());
  });
  frame.append(img);
  return frame;
}

function scoreNode(place: TravelPlace, locale: Locale): HTMLElement {
  const node = el('span', 'tb-score');
  const value = place.rating ?? place.googleRating;
  const known = value != null && Number.isFinite(value);
  node.append(icon('star', { size: 16, fill: known }));
  node.append(document.createTextNode(formatRating(known ? value : null, locale)));
  node.setAttribute('data-tip', ratingSummary(place.rating, place.googleRating, locale));
  return node;
}

function placeMeta(place: TravelPlace, locale: Locale): HTMLElement {
  const meta = el('span', 'tb-place-meta');
  meta.append(scoreNode(place, locale));
  const nightly = !place.visit?.avgPricePerPerson && place.visit?.pricePerNight;
  const money = place.visit?.avgPricePerPerson ?? place.visit?.pricePerNight;
  const level = priceLevelOf(money);
  if (level != null && money) {
    const label = pickLocale(locale, nightly ? travelUi.visit.pricePerNight : travelUi.visit.avgPrice);
    meta.append(priceLevel(level, label, locale));
  }
  return meta;
}

function mountPlacePreview(localeOf: () => Locale) {
  const pop = el('div', 'tb-preview');
  pop.hidden = true;
  pop.setAttribute('aria-hidden', 'true');
  const media = el('div', 'tb-preview__media');
  const img = el('img');
  img.alt = '';
  const fallback = el('div', 'tb-preview__fallback');
  fallback.hidden = true;
  const copyEl = el('p', 'tb-preview__copy');
  media.append(img, fallback);
  pop.append(media, copyEl);
  document.body.append(pop);
  let timer = 0;

  const hide = () => {
    window.clearTimeout(timer);
    timer = 0;
    pop.hidden = true;
  };

  const show = (place: TravelPlace, anchor: HTMLElement) => {
    const locale = localeOf();
    const cover = place.photos?.[0];
    fallback.replaceChildren(categoryGlyph(place.category, 20));
    if (cover?.url) {
      img.hidden = false;
      fallback.hidden = true;
      if (img.getAttribute('src') !== cover.url) img.src = cover.url;
    } else {
      img.hidden = true;
      img.removeAttribute('src');
      fallback.hidden = false;
    }
    copyEl.textContent = pickLocale(locale, place.description);
    pop.hidden = false;
    const gap = 8;
    const rect = anchor.getBoundingClientRect();
    const box = pop.getBoundingClientRect();
    let left = rect.right + gap;
    if (left + box.width > window.innerWidth - gap) left = Math.max(gap, rect.left);
    let top = rect.top;
    if (top + box.height > window.innerHeight - gap) {
      top = Math.max(gap, window.innerHeight - box.height - gap);
    }
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
  };

  img.addEventListener('error', () => {
    img.hidden = true;
    fallback.hidden = false;
  });

  return {
    arm(place: TravelPlace, anchor: HTMLElement) {
      window.clearTimeout(timer);
      const wait = prefersReducedMotion() ? 0 : PLACE_PREVIEW_MS;
      timer = window.setTimeout(() => {
        timer = 0;
        show(place, anchor);
      }, wait);
    },
    hide,
    dispose() {
      hide();
      pop.remove();
    },
  };
}

function categoryGlyph(category: PlaceCategory, size: 16 | 18 | 20 = 16): HTMLElement {
  const name = categoryMaterialName(category);
  if (!(ICONS as readonly string[]).includes(name)) {
    const dot = el('span', 'tb-cat-dot tb-cat-glyph');
    dot.style.background = placeCategoryMeta[category].color;
    return dot;
  }
  const node = icon(name as IconName, { size });
  node.classList.add('tb-cat-glyph');
  node.style.color = placeCategoryMeta[category].color;
  return node;
}

function countLabel(count: number, locale: Locale): string {
  if (locale === 'en') return count === 1 ? '1 place' : `${count} places`;
  return count === 1 ? '1 lugar' : `${count} lugares`;
}

function emptyState(title: string, body: string): HTMLDivElement {
  const wrap = el('div', 'tb-empty');
  wrap.append(el('strong', undefined, title), document.createTextNode(body));
  return wrap;
}

function copy(locale: Locale) {
  const en = locale === 'en';
  return {
    places: en ? 'Places' : 'Lugares',
    itinerary: en ? 'Itinerary' : 'Roteiro',
    hotels: en ? 'Hotels' : 'Hotéis',
    sections: en ? 'City sections' : 'Seções da cidade',
    categories: en ? 'Categories' : 'Categorias',
    emptyPlacesTitle: en ? 'No places' : 'Nenhum lugar',
    emptyPlaces: en
      ? 'Nothing matches this search and these categories.'
      : 'Nada combina com esta busca e estas categorias.',
    emptyItineraryTitle: en ? 'No day-by-day yet' : 'Sem roteiro dia a dia',
    emptyItinerary: en
      ? 'There is no day-by-day for this city yet. Multi-city trips live in the sidebar.'
      : 'Ainda não há um dia a dia para esta cidade. Viagens com várias cidades ficam na barra lateral.',
    missingTitle: en ? 'City not found' : 'Cidade não encontrada',
    missing: en ? 'This slug is not in the catalog.' : 'Este slug não está no catálogo.',
    loadingHotels: en ? 'Loading hotels…' : 'Carregando hotéis…',
    hotelsFailTitle: en ? 'Hotels unavailable' : 'Hotéis indisponíveis',
    hotelsFail: en
      ? 'The hotels view could not be loaded.'
      : 'Não foi possível carregar a vista de hotéis.',
  };
}

export function citySearchPlaceholder(count: number, locale: Locale): string {
  return pickLocale(locale, {
    en: `Search among ${count} places…`,
    'pt-BR': `Buscar entre ${count} lugares…`,
  });
}

export function searchBlob(place: TravelPlace): string {
  const visit = resolveVisit(place.id, place.visit);
  const subs = (place.subcategories ?? []).flatMap((id) => [
    subcategoryLabel(id, 'en'),
    subcategoryLabel(id, 'pt-BR'),
  ]);
  const fields = visit
    ? [...visitFieldsForDisplay(visit, 'en'), ...visitFieldsForDisplay(visit, 'pt-BR')].map(
        (field) => field.value,
      )
    : [];
  const notes = [place.rating, place.googleRating].flatMap((value) => {
    if (value == null || !Number.isFinite(value)) return [];
    return [`nota ${formatRating(value, 'en')}`, `nota ${formatRating(value, 'pt-BR')}`];
  });
  return fold(
    [
      place.name.en,
      place.name['pt-BR'],
      place.description.en,
      place.description['pt-BR'],
      place.category,
      CATEGORY_LABEL[place.category].en,
      CATEGORY_LABEL[place.category]['pt-BR'],
      place.address ?? '',
      place.mapsQuery ?? '',
      ...subs,
      ...fields,
      place.favorite ? 'favorite favorito' : '',
      ...notes,
    ].join('\n'),
  );
}

function toPins(places: TravelPlace[], kind: MapPin['kind'], locale: Locale): MapPin[] {
  const seen = new Set<string>();
  const pins: MapPin[] = [];
  for (const place of places) {
    if (seen.has(place.id)) continue;
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) continue;
    seen.add(place.id);
    pins.push({
      id: place.id,
      lat: place.lat,
      lng: place.lng,
      label: pickLocale(locale, place.name),
      color: placeCategoryMeta[place.category].color,
      kind,
    });
  }
  return pins;
}

export const SEARCH_REFIT_MS = 400;
/** Same wait as the tooltip: long enough to skip a passing pointer. */
export const PLACE_PREVIEW_MS = 350;

/** Refit only when a result sits outside the current view. */
export function searchLeavesView(
  points: ReadonlyArray<{ lat: number; lng: number }>,
  inView: (lat: number, lng: number) => boolean,
): boolean {
  return points.some(
    (point) => Number.isFinite(point.lat) && Number.isFinite(point.lng) && !inView(point.lat, point.lng),
  );
}

/** Required stops only. Fallback legs connect those ids, never an optional stop. */
export function primaryDayRoute(
  day: ItineraryDay,
  stops: ItineraryStop[],
  known: ReadonlySet<string>,
): { ids: string[]; fallback: { from: string; to: string; mode: 'walk' }[] } {
  const ids = dayPrimaryRoutePlaceIds({ ...day, stops }).filter((id) => known.has(id));
  const fallback: { from: string; to: string; mode: 'walk' }[] = [];
  for (let index = 1; index < ids.length; index += 1) {
    const from = ids[index - 1];
    const to = ids[index];
    if (!from || !to) continue;
    fallback.push({ from, to, mode: 'walk' });
  }
  return { ids, fallback };
}

function priorityPlaceIds(city: TravelCity): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();
  const push = (id: string) => {
    if (seen.has(id)) return;
    seen.add(id);
    ids.push(id);
  };
  for (const place of favoritePlaces(city)) push(place.id);
  const itinerary = itineraryForCity(city.slug);
  if (!itinerary) return ids;
  for (const day of itinerary.days) {
    for (const id of dayPrimaryRoutePlaceIds(day)) push(id);
  }
  return ids;
}

function setRowCurrent(scope: ParentNode, id: string | null, scroll: boolean) {
  for (const row of scope.querySelectorAll<HTMLElement>(
    '[data-place-id][aria-current="true"]',
  )) {
    row.removeAttribute('aria-current');
  }
  if (!id) return;
  const row = scope.querySelector<HTMLElement>(
    `[data-place-id="${CSS.escape(id)}"]`,
  );
  if (!row) return;
  row.setAttribute('aria-current', 'true');
  if (scroll) row.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

export function mountCityNav(
  elNav: HTMLElement,
  shell: Shell,
  onPick: (slug: string) => void,
): { setActive(slug: string | null): void } {
  const buttons = new Map<string, HTMLButtonElement>();

  const paintLabels = () => {
    const locale = shell.locale();
    for (const city of travelCities) {
      const label = buttons.get(city.slug)?.querySelector('.tb-nav-label');
      if (label) label.textContent = pickLocale(locale, city.name);
    }
  };

  for (const city of travelCities) {
    const button = el('button', 'tb-nav tb-city-nav');
    button.type = 'button';
    button.append(
      el('span', 'tb-nav-label', pickLocale(shell.locale(), city.name)),
      el('small', undefined, String(city.places.length)),
    );
    button.addEventListener('click', () => onPick(city.slug));
    buttons.set(city.slug, button);
    elNav.append(button);
  }

  shell.onLocale(paintLabels);

  return {
    setActive(slug) {
      for (const [id, button] of buttons) {
        if (id === slug) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      }
    },
  };
}

export function mountCity(
  main: HTMLElement,
  map: MapHandle,
  slug: string,
  shell: Shell,
  initial?: CityRouteState,
  onChange?: (state: CityRouteState) => void,
): { dispose(): void; sync(state: CityRouteState): void } {
  main.scrollTop = 0;
  const city = getTravelCity(slug);
  main.replaceChildren();
  if (!city) {
    const text = copy(shell.locale());
    main.append(emptyState(text.missingTitle, text.missing));
    const unsub = shell.onLocale(() => {
      const next = copy(shell.locale());
      main.replaceChildren(emptyState(next.missingTitle, next.missing));
    });
    return {
      sync() {},
      dispose() {
        unsub();
        map.highlight(null);
        map.setRoute([]);
        map.setPins('place', []);
        map.setPins('stop', []);
        map.setRadius(null);
        closePlace({ focus: false });
      },
    };
  }

  const catalogPlaces = city.places.map((place) => withResolvedArea(place));
  const byId = new Map(catalogPlaces.map((place) => [place.id, place]));
  const blob = new Map(catalogPlaces.map((place) => [place.id, searchBlob(place)]));
  const itinerary = itineraryForCity(city.slug);
  const hotelPriority = priorityPlaceIds(city);

  const storedCategories = readCategoryFilter();
  const enabled = new Set<PlaceCategory>(
    storedCategories
      ? storedCategories.filter(isCategory)
      : placeCategoryOrder.filter((category) => !placeCategoriesOffByDefault.has(category)),
  );
  const present = categoriesPresent(placeCategoryOrder, catalogPlaces);
  let groupState = groupOpenState(present, readGroups(city.slug));
  let filterBadge: HTMLElement | null = null;
  let expandBtn: HTMLButtonElement | null = null;
  const arrivalByDay = new Map<string, string>();
  if (itinerary) {
    for (const day of itinerary.days) {
      const saved = readArrival(city.slug, day.id);
      if (saved && day.arrivals?.some((item) => item.id === saved)) arrivalByDay.set(day.id, saved);
    }
  }

  let tab: Tab = initial?.tab ?? 'places';
  let query = shell.query();
  let currentPlaceId: string | null = null;
  let currentStopId: string | null = null;
  let selectedDayIndex = dayIndexFrom(initial?.day, itinerary?.days.length ?? 0);
  let disposed = false;
  let silence = 0;
  let hotelsEpoch = 0;
  let hotelsDispose: (() => void) | null = null;
  let routeEpoch = 0;
  let routeWanted = true;
  let routePhase: RoutePhase = 'idle';
  const slotsOff = new Map<string, Set<string>>();
  const slotOpen = new Map<string, boolean>();
  let searchFitTimer = 0;

  const head = el('header', 'tb-city-head');
  const metaEl = el('p', 'tb-meta');
  const titleEl = el('h1', 'tb-city-title');
  const tabs = el('div', 'tb-locale tb-city-tabs');
  const tabPanelId = 'tb-city-panel';
  const tabIds: Record<Tab, string> = {
    places: 'tb-tab-places',
    itinerary: 'tb-tab-itinerary',
    hotels: 'tb-tab-hotels',
  };
  tabs.id = 'tb-city-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-orientation', 'horizontal');
  const tabButtons: Record<Tab, HTMLButtonElement> = {
    places: el('button'),
    itinerary: el('button'),
    hotels: el('button'),
  };
  for (const id of ['places', 'itinerary', 'hotels'] as const) {
    tabButtons[id].type = 'button';
    tabButtons[id].id = tabIds[id];
    tabButtons[id].setAttribute('role', 'tab');
    tabButtons[id].setAttribute('aria-controls', tabPanelId);
    tabButtons[id].addEventListener('click', () => setTab(id));
    tabs.append(tabButtons[id]);
  }
  head.append(metaEl, titleEl, tabs);

  const body = el('div', 'tb-city-body');
  body.id = tabPanelId;
  body.setAttribute('role', 'tabpanel');
  main.append(head, body);
  const preview = mountPlacePreview(() => shell.locale());
  const onListScroll = () => preview.hide();
  main.addEventListener('scroll', onListScroll, { passive: true });

  const visiblePlaces = (): TravelPlace[] => {
    const needle = fold(query.trim());
    return catalogPlaces.filter((place) => {
      if (!enabled.has(place.category)) return false;
      if (!needle) return true;
      return blob.get(place.id)?.includes(needle) ?? false;
    });
  };

  const selectedArrival = (day: ItineraryDay): ItineraryArrivalOption | null => {
    const options = day.arrivals;
    if (!options?.length) return null;
    const chosen = arrivalByDay.get(day.id);
    if (chosen) {
      const match = options.find((option) => option.id === chosen);
      if (match) return match;
    }
    return options.find((option) => option.default) ?? options[0] ?? null;
  };

  const activeStops = (day: ItineraryDay): ItineraryStop[] =>
    selectedArrival(day)?.stops ?? day.stops;

  const dayHeading = (day: ItineraryDay): { title: LString; summary?: LString } => {
    const option = selectedArrival(day);
    if (!option) return { title: day.title, summary: day.summary };
    return { title: option.title, summary: option.summary };
  };

  const slotsOn = (dayId: string): Set<string> => {
    const on = new Set(['morning', 'afternoon', 'evening']);
    const off = slotsOff.get(dayId);
    if (off) for (const slot of off) on.delete(slot);
    return on;
  };

  const routedDay = (day: ItineraryDay) =>
    routeForSlots(activeStops(day), legsForDay(day.id, selectedArrival(day)?.id), slotsOn(day.id));

  const syncDayLink = (day: ItineraryDay) => {
    const link = body.querySelector<HTMLAnchorElement>(
      `[data-day-id="${CSS.escape(day.id)}"] [data-day-gmaps]`,
    );
    if (!link) return;
    const url = dayDirectionsUrl(routedDay(day).ids, placeCoords());
    if (url) {
      link.href = url;
      link.removeAttribute('aria-disabled');
      link.tabIndex = 0;
    } else {
      link.removeAttribute('href');
      link.setAttribute('aria-disabled', 'true');
      link.tabIndex = -1;
    }
  };

  const toggleSlot = (day: ItineraryDay, slot: string, on: boolean) => {
    const off = slotsOff.get(day.id) ?? new Set<string>();
    if (on) off.delete(slot);
    else off.add(slot);
    slotsOff.set(day.id, off);
    if (selectedDayIndex === itinerary?.days.findIndex((item) => item.id === day.id) && routeWanted) {
      drawDayRoute(selectedDayIndex, false);
    }
    syncDayLink(day);
  };

  const placeCoords = () => {
    const coords = new Map<string, { id: string; lat: number; lng: number }>();
    for (const place of city.places) {
      coords.set(place.id, { id: place.id, lat: place.lat, lng: place.lng });
    }
    return coords;
  };

  const syncRouteChrome = () => {
    body.querySelectorAll<HTMLButtonElement>('.tb-day__route').forEach((button) => {
      const index = Number(button.closest<HTMLElement>('[data-day-index]')?.dataset.dayIndex);
      const phase: RoutePhase =
        routeWanted && index === selectedDayIndex ? routePhase : 'idle';
      paintRouteButton(button, phase, shell.locale());
    });
  };

  const toggleRoute = (index: number) => {
    const section = body.querySelector<HTMLDetailsElement>(`[data-day-index="${index}"]`);
    const showing = routeWanted && selectedDayIndex === index && routePhase !== 'idle';
    if (showing) {
      routeWanted = false;
      routePhase = 'idle';
      routeEpoch += 1;
      map.setRoute([]);
      syncRouteChrome();
      return;
    }
    routeWanted = true;
    const changed = selectedDayIndex !== index;
    selectedDayIndex = index;
    if (section && !section.open) {
      section.open = true;
      return;
    }
    markSelectedDay();
    showItineraryMap({ fit: true });
    if (changed) publish();
  };

  const paintChrome = () => {
    const locale = shell.locale();
    const text = copy(locale);
    const count = tab === 'places' ? visiblePlaces().length : city.places.length;
    metaEl.textContent = `${pickLocale(locale, city.country)} · ${countLabel(count, locale)}`;
    titleEl.textContent = pickLocale(locale, city.name);
    tabs.setAttribute('aria-label', text.sections);
    tabButtons.places.textContent = text.places;
    tabButtons.itinerary.textContent = text.itinerary;
    tabButtons.hotels.textContent = text.hotels;
    body.setAttribute('aria-labelledby', tabIds[tab]);
    for (const id of ['places', 'itinerary', 'hotels'] as const) {
      const on = tab === id;
      tabButtons[id].setAttribute('aria-selected', on ? 'true' : 'false');
      tabButtons[id].removeAttribute('aria-pressed');
    }
    segmented(tabs);
    const input = shell.root.querySelector<HTMLInputElement>('.tb-search input');
    if (input) input.placeholder = citySearchPlaceholder(city.places.length, locale);
  };

  const showPlacePins = (opts: { fit: boolean; pan: boolean }) => {
    routeEpoch += 1;
    map.setRoute([]);
    map.setPins('stop', []);
    if (!currentPlaceId) map.highlight(null);
    map.setPins('place', toPins(visiblePlaces(), 'place', shell.locale()));
    if (opts.fit) map.fit();
    if (opts.pan && currentPlaceId) map.highlight(currentPlaceId);
  };

  const snapshot = (): CityRouteState => ({
    tab,
    ...(currentPlaceId ? { place: currentPlaceId } : {}),
    ...(selectedDayIndex > 0 ? { day: selectedDayIndex + 1 } : {}),
  });

  const publish = () => {
    if (disposed || silence > 0) return;
    onChange?.(snapshot());
  };

  const rowButton = (id: string): HTMLElement | null => {
    const row = body.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`);
    return row?.querySelector<HTMLElement>('.tb-place-main, .tb-row__main') ?? null;
  };

  const focusPlace = (id: string, origin?: HTMLElement | null) => {
    const place = byId.get(id);
    if (!place) return;
    const changed = currentPlaceId !== id;
    currentPlaceId = id;
    if (tab === 'itinerary') currentStopId = id;
    openPlace(place, city, shell.locale(), origin);
    if (changed) publish();
  };

  const clearPlaceSelection = () => {
    const hadPlace = currentPlaceId != null;
    currentPlaceId = null;
    currentStopId = null;
    main.querySelectorAll('[data-place-id][aria-current]').forEach((node) => {
      node.removeAttribute('aria-current');
    });
    map.highlight(null);
    if (hadPlace) publish();
  };

  const offClose = onPlaceClose(clearPlaceSelection);

  const drawDayRoute = (index: number, fit: boolean) => {
    const epoch = ++routeEpoch;
    const day = itinerary?.days[index];
    if (!day || !routeWanted) {
      routePhase = 'idle';
      map.setRoute([]);
      syncRouteChrome();
      return;
    }
    routePhase = 'drawing';
    syncRouteChrome();
    const coords = placeCoords();
    const routed = routedDay(day);
    const legs = routed.legs;
    const ids = routed.ids;
    const preview = buildItineraryRoutePreview(ids, legs, coords);
    map.setRoute(preview.segments, { fit });
    void buildItineraryRoute(ids, legs, coords)
      .then((built) => {
        if (disposed || epoch !== routeEpoch || tab !== 'itinerary') return;
        map.setRoute(built.segments);
        routePhase = 'on';
        syncRouteChrome();
      })
      .catch(() => {
        if (disposed || epoch !== routeEpoch) return;
        routePhase = 'on';
        syncRouteChrome();
      });
  };

  const showItineraryMap = (opts: { fit: boolean }) => {
    map.setPins('stop', []);
    map.setPins('place', toPins(city.places, 'place', shell.locale()));
    if (currentStopId) map.highlight(currentStopId);
    drawDayRoute(selectedDayIndex, opts.fit);
  };

  const showHotelPins = () => {
    routeEpoch += 1;
    map.setRoute([]);
    map.setPins('place', []);
    map.setPins('stop', []);
    map.highlight(null);
  };

  const visibleGroupNodes = () =>
    [...body.querySelectorAll<HTMLDetailsElement>('details.tb-group')].filter((section) => !section.hidden);

  const syncExpand = () => {
    if (!expandBtn) return;
    const groups = visibleGroupNodes();
    const allOpen = groups.length > 0 && groups.every((section) => section.open);
    expandBtn.textContent = groupsToggleLabel(allOpen, shell.locale());
    expandBtn.setAttribute('aria-expanded', allOpen ? 'true' : 'false');
  };

  const syncFilters = () => {
    body.querySelectorAll<HTMLButtonElement>('button[data-category]').forEach((button) => {
      const category = button.dataset.category;
      if (!category || !isCategory(category)) return;
      button.setAttribute('aria-pressed', enabled.has(category) ? 'true' : 'false');
    });
    if (!filterBadge) return;
    const custom = !isDefaultCategoryFilter(enabled, placeCategoryOrder, placeCategoriesOffByDefault);
    filterBadge.hidden = !custom;
    if (!custom) {
      filterBadge.textContent = '';
      filterBadge.removeAttribute('aria-label');
      return;
    }
    const count = enabled.size;
    filterBadge.textContent = String(count);
    filterBadge.setAttribute(
      'aria-label',
      pickLocale(shell.locale(), {
        en: count === 1 ? '1 category on' : `${count} categories on`,
        'pt-BR': count === 1 ? '1 categoria ativa' : `${count} categorias ativas`,
      }),
    );
  };

  const setEveryGroup = (open: boolean) => {
    for (const category of present) groupState[category] = open;
    writeGroups(city.slug, groupState);
    for (const section of body.querySelectorAll<HTMLDetailsElement>('details.tb-group')) {
      section.open = open;
    }
    syncExpand();
  };

  const appendPlaceGroups = () => {
    preview.hide();
    map.hover(null);
    const locale = shell.locale();
    const text = copy(locale);
    const places = visiblePlaces();
    if (places.length === 0) {
      body.append(emptyState(text.emptyPlacesTitle, text.emptyPlaces));
      syncExpand();
      return;
    }
    for (const category of present) {
      const group = places.filter((place) => place.category === category);
      if (!group.length) continue;
      const section = el('details', 'tb-group');
      section.dataset.group = category;
      section.addEventListener('toggle', () => {
        groupState[category] = section.open;
        writeGroups(city.slug, groupState);
        syncExpand();
      });
      section.open = groupState[category] ?? false;
      const summary = el('summary', 'tb-group__summary');
      const count = el('span', 'tb-group__count', String(group.length));
      count.dataset.groupCount = category;
      summary.append(
        categoryGlyph(category),
        el('span', 'tb-group__label', pickLocale(locale, CATEGORY_LABEL[category])),
        count,
        icon('expand_more', { size: 18 }),
      );
      summary.lastElementChild?.classList.add('tb-group__chevron');
      const list = el('ul', 'tb-list tb-list--places tb-place-list');
      for (const place of group) {
        const maps = iconLink({
          icon: 'location_on',
          label: pickLocale(locale, travelUi.openInMaps),
          href: googleMapsUrl(place, city),
        });
        maps.dataset.maps = 'true';
        const subs = (place.subcategories ?? []).map((id) => subcategoryLabel(id, locale)).join(' · ');
        const item = row({
          lead: placeThumb(place),
          title: pickLocale(locale, place.name),
          sub: subs || undefined,
          meta: placeMeta(place, locale),
          actions: maps,
          current: place.id === currentPlaceId,
          data: { placeId: place.id },
          onSelect: () => {
            setRowCurrent(body, place.id, false);
            focusPlace(place.id, item.querySelector<HTMLElement>('.tb-row__main'));
          },
        });
        if (place.favorite) {
          const title = item.querySelector('.tb-row__title');
          if (title) {
            const name = el('span', 'tb-name', title.textContent ?? '');
            const heart = icon('favorite', { fill: true, size: 16 });
            heart.classList.add('tb-fav');
            title.replaceChildren(name, heart);
          }
        }
        const blurb = pickLocale(locale, place.description).trim();
        if (blurb) item.querySelector('.tb-row__main')?.append(el('span', 'tb-row__more', blurb));
        item.addEventListener('pointerenter', () => {
          map.hover(place.id);
          preview.arm(place, item);
        });
        item.addEventListener('pointerleave', () => {
          map.hover(null);
          preview.hide();
        });
        item.addEventListener('focusin', () => preview.arm(place, item));
        item.addEventListener('focusout', (event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && item.contains(next)) return;
          preview.hide();
        });
        list.append(item);
      }
      section.append(summary, list);
      body.append(section);
    }
    syncExpand();
  };

  const renderPlaceResults = () => {
    body.querySelectorAll('.tb-group, .tb-cat-head, .tb-place-list, .tb-empty').forEach((node) => node.remove());
    appendPlaceGroups();
    keepOrigin();
  };

  const renderPlaces = () => {
    const locale = shell.locale();
    const text = copy(locale);
    body.replaceChildren();
    const tools = el('div', 'tb-place-tools');
    const filters = el('div', 'tb-filters tb-place-filters');
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', text.categories);
    for (const category of present) {
      const button = el('button', 'tb-chip');
      button.type = 'button';
      button.dataset.category = category;
      const only = el(
        'span',
        'tb-chip__only',
        pickLocale(locale, { en: 'only this', 'pt-BR': 'só esta' }),
      );
      only.dataset.only = 'true';
      only.setAttribute('aria-hidden', 'true');
      button.append(
        categoryGlyph(category),
        el('span', 'tb-chip__label', pickLocale(locale, CATEGORY_LABEL[category])),
        only,
      );
      button.setAttribute('aria-pressed', enabled.has(category) ? 'true' : 'false');
      filters.append(button);
    }
    const badge = el('span', 'tb-filter-badge');
    badge.hidden = true;
    filterBadge = badge;
    filters.append(badge);
    const expand = el('button', 'tb-expand');
    expand.type = 'button';
    expandBtn = expand;
    expand.addEventListener('click', () => {
      const groups = visibleGroupNodes();
      const allOpen = groups.length > 0 && groups.every((section) => section.open);
      setEveryGroup(!allOpen);
    });
    tools.append(filters, expand);
    body.append(tools);
    syncFilters();
    appendPlaceGroups();
  };

  const keepOrigin = () => {
    if (!currentPlaceId) return;
    const opener = rowButton(currentPlaceId);
    if (opener) setPlaceOrigin(opener);
  };

  const renderItinerary = () => {
    const locale = shell.locale();
    const text = copy(locale);
    body.replaceChildren();
    if (!itinerary || itinerary.days.length === 0) {
      body.append(emptyState(text.emptyItineraryTitle, text.emptyItinerary));
      return;
    }

    body.append(itineraryIntro(itinerary, byId, locale));

    itinerary.days.forEach((day, index) => {
      const section = el('details', 'tb-day');
      section.dataset.dayIndex = String(index);
      section.dataset.dayId = day.id;
      section.open = index === selectedDayIndex;
      if (index === selectedDayIndex) section.setAttribute('aria-current', 'true');
      section.addEventListener('toggle', () => {
        if (!section.open) {
          if (selectedDayIndex === index) {
            routeWanted = false;
            routePhase = 'idle';
            routeEpoch += 1;
            map.setRoute([]);
            syncRouteChrome();
          }
          return;
        }
        routeWanted = true;
        const changed = selectedDayIndex !== index;
        selectedDayIndex = index;
        markSelectedDay();
        showItineraryMap({ fit: true });
        if (changed) publish();
      });

      const stops = activeStops(day);
      const phase: RoutePhase = routeWanted && index === selectedDayIndex ? routePhase : 'idle';
      section.append(
        daySummary({
          dayNumber: day.day,
          stops,
          phase,
          mapsUrl: dayDirectionsUrl(routedDay(day).ids, placeCoords()),
          locale,
          onRoute: () => toggleRoute(index),
        }),
      );

      const heading = dayHeading(day);
      if (heading.summary) {
        section.append(el('p', 'tb-meta tb-day-summary', pickLocale(locale, heading.summary)));
      }

      const option = selectedArrival(day);
      if (day.arrivals?.length) {
        const control = el('div', 'tb-locale');
        control.setAttribute('role', 'group');
        control.setAttribute('aria-label', pickLocale(locale, travelUi.itineraryArrivalAirport));
        for (const item of day.arrivals) {
          const button = el('button', undefined, pickLocale(locale, item.label));
          button.type = 'button';
          button.dataset.arrivalDay = day.id;
          button.dataset.arrivalId = item.id;
          button.setAttribute('aria-pressed', option?.id === item.id ? 'true' : 'false');
          control.append(button);
        }
        segmented(control);
        section.append(control);
      }

      const budget = dayBudgetEl(day, stops, byId, locale);
      if (budget) section.append(budget);

      section.append(
        renderPeriods({
          stops,
          locale,
          enabled: slotsOn(day.id),
          coords: placeCoords(),
          isOpen: (slot) => slotOpen.get(`${day.id}:${slot}`) ?? true,
          onOpen: (slot, open) => slotOpen.set(`${day.id}:${slot}`, open),
          onToggleSlot: (slot, on) => toggleSlot(day, slot, on),
          legs: legsForDay(day.id, selectedArrival(day)?.id),
          renderStop: (stop) => stopRow(stop, index, locale),
        }),
      );
      body.append(section);
    });
    syncRouteChrome();
  };

  const stopRow = (stop: ItineraryStop, index: number, locale: Locale): HTMLElement | null => {
    const place = byId.get(stop.placeId);
    if (!place) return null;
    const pin = el('span', 'tb-timeline__pin');
    pin.style.setProperty('--pin-color', placeCategoryMeta[place.category].color);
    pin.append(categoryGlyph(place.category, 16));
    const maps = iconLink({
      icon: 'location_on',
      label: pickLocale(locale, travelUi.openInMaps),
      href: googleMapsUrl(place, city),
    });
    maps.dataset.maps = 'true';
    const note = stop.note ? pickLocale(locale, stop.note) : undefined;
    const item = row({
      time: stop.time,
      lead: pin,
      title: pickLocale(locale, place.name),
      sub: note,
      actions: maps,
      current: index === selectedDayIndex && place.id === currentStopId,
      data: { placeId: place.id },
      onSelect: () => {
        selectedDayIndex = index;
        currentStopId = place.id;
        markSelectedDay();
        const origin = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        setRowCurrent(body, place.id, false);
        focusPlace(place.id, origin);
      },
    });
    if (stop.optional) item.classList.add('is-optional');
    return item;
  };

  const closeHotels = () => {
    hotelsEpoch += 1;
    const close = hotelsDispose;
    hotelsDispose = null;
    try {
      close?.();
    } catch {
      /* The hotels view owns its teardown; the city view still has to leave. */
    }
    map.setRadius(null);
  };

  const renderHotels = () => {
    const text = copy(shell.locale());
    body.replaceChildren();
    const status = el('p', 'tb-meta', text.loadingHotels);
    status.dataset.hotelsLoading = 'true';
    const host = el('div', 'tb-hotels-mount');
    host.setAttribute('aria-busy', 'true');
    body.append(status, host);

    const epoch = ++hotelsEpoch;
    void import('./hotels')
      .then((mod) => {
        if (disposed || epoch !== hotelsEpoch || tab !== 'hotels') return null;
        return mod.mountHotels(
          host,
          {
            slug: city.slug,
            name: city.name['pt-BR'],
            lat: city.lat,
            lng: city.lng,
          },
          map,
          shell,
          hotelPriority,
        );
      })
      .then((handle) => {
        if (!handle) return;
        if (disposed || epoch !== hotelsEpoch || tab !== 'hotels') {
          handle.dispose();
          return;
        }
        status.remove();
        host.removeAttribute('aria-busy');
        hotelsDispose = () => handle.dispose();
      })
      .catch(() => {
        if (disposed || epoch !== hotelsEpoch || tab !== 'hotels') return;
        map.setPins('hotel', []);
        map.setRadius(null);
        const fail = copy(shell.locale());
        body.replaceChildren(emptyState(fail.hotelsFailTitle, fail.hotelsFail));
      });
  };

  const renderBody = () => {
    if (tab === 'places') renderPlaces();
    else if (tab === 'itinerary') renderItinerary();
    else renderHotels();
    keepOrigin();
  };

  const markSelectedDay = () => {
    for (const section of body.querySelectorAll<HTMLElement>('.tb-day')) {
      if (Number(section.dataset.dayIndex) === selectedDayIndex) {
        section.setAttribute('aria-current', 'true');
      } else section.removeAttribute('aria-current');
    }
  };

  body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.tb-hotels-mount')) return;

    const categoryBtn = target.closest<HTMLButtonElement>('button[data-category]');
    if (categoryBtn?.dataset.category && isCategory(categoryBtn.dataset.category)) {
      const category = categoryBtn.dataset.category;
      const only = event.altKey || Boolean(target.closest('[data-only]'));
      const next = applyCategoryClick(enabled, category, only);
      enabled.clear();
      for (const id of next) enabled.add(id);
      writeCategoryFilter([...enabled]);
      if (currentPlaceId && !visiblePlaces().some((place) => place.id === currentPlaceId)) {
        closePlace({ focus: false });
      }
      syncFilters();
      paintChrome();
      renderPlaceResults();
      showPlacePins({ fit: true, pan: false });
      return;
    }

    const arrivalBtn = target.closest<HTMLButtonElement>('[data-arrival-id]');
    if (arrivalBtn?.dataset.arrivalDay && arrivalBtn.dataset.arrivalId && itinerary) {
      const dayIndex = itinerary.days.findIndex((day) => day.id === arrivalBtn.dataset.arrivalDay);
      const day = itinerary.days[dayIndex];
      if (!day) return;
      arrivalByDay.set(day.id, arrivalBtn.dataset.arrivalId);
      writeArrival(city.slug, day.id, arrivalBtn.dataset.arrivalId);
      selectedDayIndex = dayIndex;
      const stops = activeStops(day);
      const stillThere = (id: string | null) =>
        Boolean(id) && stops.some((stop) => stop.placeId === id && byId.has(stop.placeId));
      if (!stillThere(currentStopId)) currentStopId = null;
      if (currentPlaceId && !stillThere(currentPlaceId)) closePlace({ focus: false });
      const top = main.scrollTop;
      const arrivalId = arrivalBtn.dataset.arrivalId;
      renderItinerary();
      main.scrollTop = top;
      body
        .querySelector<HTMLButtonElement>(
          `[data-arrival-day="${CSS.escape(day.id)}"][data-arrival-id="${CSS.escape(arrivalId)}"]`,
        )
        ?.focus();
      showItineraryMap({ fit: true });
      return;
    }

    if (target.closest('[data-maps]')) return;
    if (target.closest('.tb-row__main')) return;
    const row = target.closest<HTMLElement>('[data-place-id]');
    if (!row?.dataset.placeId) return;
    const id = row.dataset.placeId;
    const opener = row.querySelector<HTMLElement>('.tb-place-main, .tb-row__main');
    if (tab === 'itinerary') {
      const section = row.closest<HTMLElement>('[data-day-index]');
      const index = Number(section?.dataset.dayIndex);
      if (Number.isInteger(index)) selectedDayIndex = index;
      currentStopId = id;
      markSelectedDay();
    }
    setRowCurrent(body, id, false);
    focusPlace(id, opener);
  });

  const unsubLocale = shell.onLocale(() => {
    paintChrome();
    repaintPlace(shell.locale());
    if (tab === 'hotels') {
      const loading = body.querySelector<HTMLElement>('[data-hotels-loading]');
      if (loading) loading.textContent = copy(shell.locale()).loadingHotels;
      return;
    }
    const top = main.scrollTop;
    renderBody();
    main.scrollTop = top;
    if (tab === 'places') showPlacePins({ fit: false, pan: false });
    else showItineraryMap({ fit: false });
  });

  const unsubQuery = shell.onQuery((value) => {
    query = value;
    if (tab !== 'places') return;
    if (currentPlaceId && !visiblePlaces().some((place) => place.id === currentPlaceId)) {
      closePlace({ focus: false });
    }
    paintChrome();
    renderPlaceResults();
    showPlacePins({ fit: false, pan: false });
    window.clearTimeout(searchFitTimer);
    searchFitTimer = window.setTimeout(() => {
      searchFitTimer = 0;
      if (disposed || tab !== 'places') return;
      const places = visiblePlaces();
      if (!searchLeavesView(places, (lat, lng) => map.inView(lat, lng))) return;
      map.fit();
    }, SEARCH_REFIT_MS);
  });

  const unsubSelect = map.onSelect((id) => {
    if (disposed) return;
    if (!byId.has(id)) return;
    if (tab === 'places' && !visiblePlaces().some((place) => place.id === id)) return;
    if (tab === 'itinerary') currentStopId = id;
    setRowCurrent(body, id, true);
    focusPlace(id, rowButton(id));
  });

  function setTab(next: Tab) {
    if (next === tab) return;
    window.clearTimeout(searchFitTimer);
    searchFitTimer = 0;
    const leavingHotels = tab === 'hotels';
    const hadPlace = currentPlaceId != null;
    tab = next;
    if (leavingHotels) closeHotels();
    closePlace({ focus: false });
    paintChrome();
    renderBody();
    if (next === 'places') showPlacePins({ fit: true, pan: currentPlaceId != null });
    else if (next === 'itinerary') showItineraryMap({ fit: true });
    else showHotelPins();
    main.scrollTop = 0;
    if (!hadPlace) publish();
  }

  function revealSelectedDay() {
    for (const section of body.querySelectorAll<HTMLDetailsElement>('.tb-day')) {
      if (Number(section.dataset.dayIndex) === selectedDayIndex) section.open = true;
    }
    markSelectedDay();
  }

  function sync(state: CityRouteState) {
    if (disposed) return;
    silence += 1;
    try {
      const nextDay = dayIndexFrom(state.day, itinerary?.days.length ?? 0);
      const dayChanged = nextDay !== selectedDayIndex;
      selectedDayIndex = nextDay;
      if (state.tab !== tab) setTab(state.tab);
      else if (dayChanged && tab === 'itinerary') {
        revealSelectedDay();
        showItineraryMap({ fit: true });
      }
      const place = state.place && byId.has(state.place) ? state.place : null;
      if (place && place === currentPlaceId && openPlaceId() === place) return;
      if (!place) {
        if (currentPlaceId || openPlaceId()) closePlace({ focus: false });
        return;
      }
      setRowCurrent(body, place, true);
      focusPlace(place, rowButton(place));
    } finally {
      silence -= 1;
    }
  }

  const initialPlace = initial?.place && byId.has(initial.place) ? initial.place : null;
  paintChrome();
  renderBody();
  if (tab === 'places') showPlacePins({ fit: !initialPlace, pan: false });
  else if (tab === 'itinerary') showItineraryMap({ fit: !initialPlace });
  else showHotelPins();
  if (initialPlace) {
    silence += 1;
    setRowCurrent(body, initialPlace, true);
    focusPlace(initialPlace, rowButton(initialPlace));
    silence -= 1;
  }

  return {
    sync,
    dispose() {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(searchFitTimer);
      main.removeEventListener('scroll', onListScroll);
      preview.dispose();
      const input = shell.root.querySelector<HTMLInputElement>('.tb-search input');
      if (input) {
        input.placeholder = pickLocale(shell.locale(), {
          en: 'Search a place or trip',
          'pt-BR': 'Buscar lugar ou roteiro',
        });
      }
      hotelsEpoch += 1;
      unsubLocale();
      unsubQuery();
      unsubSelect();
      offClose();
      const close = hotelsDispose;
      hotelsDispose = null;
      try {
        close?.();
      } finally {
        routeEpoch += 1;
        map.highlight(null);
        map.setRoute([]);
        map.setPins('place', []);
        map.setPins('stop', []);
        map.setRadius(null);
        closePlace({ focus: false });
      }
    },
  };
}

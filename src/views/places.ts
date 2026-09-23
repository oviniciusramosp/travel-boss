import type { Shell } from '../app/shell';
import { readArrival, readCategoryFilter, writeArrival, writeCategoryFilter } from '../app/store';
import {
  computeDayBudget,
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
  travelCities,
  travelUi,
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
import {
  buildItineraryRoute,
  buildItineraryRoutePreview,
  type PlaceCoord,
} from '../map/itinerary-route';
import type { MapHandle, MapPin } from '../map/types';
import { el } from '../ui/dom';
import { closePlace, onPlaceClose, openPlace, openPlaceId, repaintPlace } from './place-panel';

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

function formatScore(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function countLabel(count: number, locale: Locale): string {
  if (locale === 'en') return count === 1 ? '1 place' : `${count} places`;
  return count === 1 ? '1 lugar' : `${count} lugares`;
}

function formatEur(amount: number, locale: Locale): string {
  const cents = Math.round(amount * 100);
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100);
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
    budget: (amount: string) =>
      en ? `Typical total ${amount}` : `Total típico ${amount}`,
  };
}

function detailLine(place: TravelPlace, locale: Locale): string {
  const parts = [pickLocale(locale, CATEGORY_LABEL[place.category])];
  if (place.rating != null && Number.isFinite(place.rating)) {
    parts.push(formatScore(place.rating));
  }
  if (place.googleRating != null && Number.isFinite(place.googleRating)) {
    parts.push(`Google ${formatScore(place.googleRating)}`);
  }
  return parts.join(' · ');
}

function searchBlob(place: TravelPlace): string {
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

  const byId = new Map(city.places.map((place) => [place.id, place]));
  const blob = new Map(city.places.map((place) => [place.id, searchBlob(place)]));
  const itinerary = itineraryForCity(city.slug);
  const hotelPriority = priorityPlaceIds(city);

  const storedCategories = readCategoryFilter();
  const enabled = new Set<PlaceCategory>(
    storedCategories
      ? storedCategories.filter(isCategory)
      : placeCategoryOrder.filter((category) => !placeCategoriesOffByDefault.has(category)),
  );
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
  let searchFitTimer = 0;

  const head = el('header', 'tb-city-head');
  const metaEl = el('p', 'tb-meta');
  const titleEl = el('h1', 'tb-city-title');
  const tabs = el('div', 'tb-locale tb-city-tabs');
  tabs.setAttribute('role', 'group');
  const tabButtons: Record<Tab, HTMLButtonElement> = {
    places: el('button'),
    itinerary: el('button'),
    hotels: el('button'),
  };
  for (const id of ['places', 'itinerary', 'hotels'] as const) {
    tabButtons[id].type = 'button';
    tabButtons[id].addEventListener('click', () => setTab(id));
    tabs.append(tabButtons[id]);
  }
  head.append(metaEl, titleEl, tabs);

  const body = el('div', 'tb-city-body');
  main.append(head, body);

  const visiblePlaces = (): TravelPlace[] => {
    const needle = fold(query.trim());
    return city.places.filter((place) => {
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

  const budgetText = (day: ItineraryDay, locale: Locale): string | null => {
    try {
      const budget = computeDayBudget({ ...day, stops: activeStops(day) }, byId);
      const total = budget.foodEur + budget.ticketsEur;
      if (!Number.isFinite(total) || total <= 0) return null;
      return copy(locale).budget(formatEur(total, locale));
    } catch {
      return null;
    }
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
    for (const id of ['places', 'itinerary', 'hotels'] as const) {
      tabButtons[id].setAttribute('aria-pressed', tab === id ? 'true' : 'false');
    }
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
    if (!day) {
      map.setRoute([]);
      return;
    }
    const route = primaryDayRoute(day, activeStops(day), new Set(byId.keys()));
    const coords = new Map<string, PlaceCoord>();
    for (const place of city.places) {
      coords.set(place.id, { id: place.id, lat: place.lat, lng: place.lng });
    }
    const arrival = selectedArrival(day)?.id;
    let legs = legsForDay(day.id, arrival);
    if (!legs.length) legs = route.fallback;
    const ids = route.ids;
    const preview = buildItineraryRoutePreview(ids, legs, coords);
    map.setRoute(preview.segments, { fit });
    void buildItineraryRoute(ids, legs, coords)
      .then((built) => {
        if (disposed || epoch !== routeEpoch || tab !== 'itinerary') return;
        map.setRoute(built.segments);
      })
      .catch(() => undefined);
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

  const syncCategoryPressed = () => {
    body.querySelectorAll<HTMLButtonElement>('[data-category]').forEach((button) => {
      const category = button.dataset.category;
      if (!category || !isCategory(category)) return;
      button.setAttribute('aria-pressed', enabled.has(category) ? 'true' : 'false');
    });
  };

  const appendPlaceGroups = () => {
    const locale = shell.locale();
    const text = copy(locale);
    const places = visiblePlaces();
    if (places.length === 0) {
      body.append(emptyState(text.emptyPlacesTitle, text.emptyPlaces));
      return;
    }
    for (const category of placeCategoryOrder) {
      const group = places.filter((place) => place.category === category);
      if (!group.length) continue;
      const heading = el('h2', 'tb-cat-head');
      const dot = el('span', 'tb-cat-dot');
      dot.style.background = placeCategoryMeta[category].color;
      heading.append(dot, document.createTextNode(pickLocale(locale, CATEGORY_LABEL[category])));
      body.append(heading);
      const list = el('div', 'tb-place-list');
      for (const place of group) {
        const row = el('div', 'tb-place');
        row.dataset.placeId = place.id;
        if (place.id === currentPlaceId) row.setAttribute('aria-current', 'true');
        const mainBtn = el('button', 'tb-place-main');
        mainBtn.type = 'button';
        const name = el('span', 'tb-place-name');
        if (place.favorite) name.append(el('span', 'tb-badge-soft', '★'));
        name.append(document.createTextNode(pickLocale(locale, place.name)));
        mainBtn.append(name, el('span', 'tb-place-line', detailLine(place, locale)));
        const maps = el('a', 'tb-btn-outline tb-maps', locale === 'pt-BR' ? 'Mapa' : 'Map');
        maps.href = googleMapsUrl(place, city);
        maps.target = '_blank';
        maps.rel = 'noopener';
        maps.dataset.maps = 'true';
        row.append(mainBtn, maps);
        list.append(row);
      }
      body.append(list);
    }
  };

  const renderPlaceResults = () => {
    body.querySelectorAll('.tb-cat-head, .tb-place-list, .tb-empty').forEach((node) => node.remove());
    appendPlaceGroups();
  };

  const renderPlaces = () => {
    const locale = shell.locale();
    const text = copy(locale);
    body.replaceChildren();
    const filters = el('div', 'tb-filters');
    filters.setAttribute('role', 'group');
    filters.setAttribute('aria-label', text.categories);
    for (const category of placeCategoryOrder) {
      const button = el('button', 'tb-btn-outline');
      button.type = 'button';
      button.dataset.category = category;
      const dot = el('span', 'tb-cat-dot');
      dot.style.background = placeCategoryMeta[category].color;
      button.append(dot, document.createTextNode(pickLocale(locale, CATEGORY_LABEL[category])));
      button.setAttribute('aria-pressed', enabled.has(category) ? 'true' : 'false');
      filters.append(button);
    }
    body.append(filters);
    appendPlaceGroups();
  };

  const renderItinerary = () => {
    const locale = shell.locale();
    const text = copy(locale);
    body.replaceChildren();
    if (!itinerary || itinerary.days.length === 0) {
      body.append(emptyState(text.emptyItineraryTitle, text.emptyItinerary));
      return;
    }

    itinerary.days.forEach((day, index) => {
      const section = el('details', 'tb-day');
      section.dataset.dayIndex = String(index);
      section.open = index === selectedDayIndex;
      if (index === selectedDayIndex) section.setAttribute('aria-current', 'true');
      section.addEventListener('toggle', () => {
        if (!section.open) {
          if (selectedDayIndex === index) {
            routeEpoch += 1;
            map.setRoute([]);
          }
          return;
        }
        const changed = selectedDayIndex !== index;
        selectedDayIndex = index;
        markSelectedDay();
        showItineraryMap({ fit: true });
        if (changed) publish();
      });

      const heading = dayHeading(day);
      const title = el('summary', 'tb-day-title');
      title.textContent = pickLocale(locale, heading.title);
      section.append(title);

      if (heading.summary) {
        section.append(el('p', 'tb-meta tb-day-summary', pickLocale(locale, heading.summary)));
      }

      const option = selectedArrival(day);
      if (day.arrivals?.length) {
        const control = el('div', 'tb-locale');
        control.setAttribute('role', 'group');
        control.setAttribute(
          'aria-label',
          locale === 'en' ? 'Arrival' : 'Chegada',
        );
        for (const item of day.arrivals) {
          const button = el('button', undefined, pickLocale(locale, item.label));
          button.type = 'button';
          button.dataset.arrivalDay = day.id;
          button.dataset.arrivalId = item.id;
          button.setAttribute(
            'aria-pressed',
            option?.id === item.id ? 'true' : 'false',
          );
          control.append(button);
        }
        section.append(control);
      }

      const budget = budgetText(day, locale);
      if (budget) section.append(el('p', 'tb-meta tb-budget', budget));

      section.append(stopList(day, index, locale));
      body.append(section);
    });
  };

  const stopList = (day: ItineraryDay, index: number, locale: Locale) => {
    const list = el('div', 'tb-stop-list');
    for (const stop of activeStops(day)) {
      const place = byId.get(stop.placeId);
      if (!place) continue;
      const row = el('div', stop.optional ? 'tb-stop is-optional' : 'tb-stop');
      row.dataset.placeId = place.id;
      if (index === selectedDayIndex && place.id === currentStopId) {
        row.setAttribute('aria-current', 'true');
      }
      const open = el('button', 'tb-place-main');
      open.type = 'button';
      const time = el('time', 'tb-stop-time', stop.time ?? '');
      if (stop.time) time.dateTime = stop.time;
      open.append(time);
      const info = el('span');
      info.append(el('span', 'tb-stop-name', pickLocale(locale, place.name)));
      if (stop.note) {
        info.append(el('span', 'tb-stop-note', pickLocale(locale, stop.note)));
      }
      open.append(info);
      const maps = el('a', 'tb-btn-outline tb-maps', locale === 'pt-BR' ? 'Mapa' : 'Map');
      maps.href = googleMapsUrl(place, city);
      maps.target = '_blank';
      maps.rel = 'noopener';
      maps.dataset.maps = 'true';
      row.append(open, maps);
      list.append(row);
    }
    return list;
  };

  const patchDay = (section: HTMLElement, day: ItineraryDay, index: number) => {
    const locale = shell.locale();
    const heading = dayHeading(day);
    const title = section.querySelector('.tb-day-title');
    if (title) title.textContent = pickLocale(locale, heading.title);
    const summaryText = heading.summary ? pickLocale(locale, heading.summary) : '';
    let summary = section.querySelector<HTMLElement>('.tb-day-summary');
    if (summaryText) {
      if (!summary) {
        summary = el('p', 'tb-meta tb-day-summary', summaryText);
        title?.after(summary);
      } else summary.textContent = summaryText;
    } else summary?.remove();
    const chosen = selectedArrival(day)?.id;
    section.querySelectorAll<HTMLButtonElement>('[data-arrival-id]').forEach((button) => {
      button.setAttribute('aria-pressed', button.dataset.arrivalId === chosen ? 'true' : 'false');
    });
    const budget = budgetText(day, locale);
    let budgetEl = section.querySelector<HTMLElement>('.tb-budget');
    if (budget) {
      if (!budgetEl) {
        budgetEl = el('p', 'tb-meta tb-budget', budget);
        const anchor = section.querySelector('.tb-locale') ?? summary ?? title;
        anchor?.after(budgetEl);
      } else budgetEl.textContent = budget;
    } else budgetEl?.remove();
    section.querySelector('.tb-stop-list')?.replaceWith(stopList(day, index, locale));
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

    const categoryBtn = target.closest<HTMLButtonElement>('[data-category]');
    if (categoryBtn?.dataset.category && isCategory(categoryBtn.dataset.category)) {
      const category = categoryBtn.dataset.category;
      if (enabled.has(category)) enabled.delete(category);
      else enabled.add(category);
      writeCategoryFilter([...enabled]);
      if (currentPlaceId && !visiblePlaces().some((place) => place.id === currentPlaceId)) {
        closePlace({ focus: false });
      }
      syncCategoryPressed();
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
      const section = body.querySelector<HTMLElement>(`[data-day-index="${dayIndex}"]`);
      if (section) {
        markSelectedDay();
        patchDay(section, day, dayIndex);
      } else renderItinerary();
      showItineraryMap({ fit: true });
      return;
    }

    if (target.closest('[data-maps]')) return;
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
    renderPlaces();
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

import { TABS, type CityTab } from '../app/router';
import type { Shell } from '../app/shell';
import { readCategoryFilter, readGroups, writeCategoryFilter, writeGroups } from '../app/store';
import {
  categoryMaterialName,
  cityGuide,
  dayPrimaryRoutePlaceIds,
  favoritePlaces,
  getTravelCity,
  googleMapsUrl,
  itineraryForCity,
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
import type { ItineraryDay, ItineraryStop, Locale, PlaceCategory, TravelCity, TravelPlace } from '../catalog';
import type { MapHandle, MapPin } from '../map/types';
import { aiBadge, aiSuggestionTip } from '../ui/ai-badge';
import { segmented } from '../ui/controls';
import { mapsIconLink } from '../ui/maps-icon';
import { el } from '../ui/dom';
import { icon, ICONS, type IconName } from '../ui/icons';
import { runViewTransition } from '../ui/motion';
import { priceLevel, priceLevelOf } from '../ui/price';
import { formatRating, ratingSummary } from '../ui/rating';
import {
  closePlace,
  onPlaceClose,
  openPlace,
  openPlaceId,
  repaintPlace,
  setPlaceOrigin,
} from './place-panel';
import { guidePlaceIds, renderGuide, type GuideTab } from './guide';
import { createRouteButton, mountRoutePlanner } from './route-planner';

type Tab = CityTab;

export type CityRouteState = {
  tab: Tab;
  place?: string;
  day?: number;
};

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

function placeCard(
  place: TravelPlace,
  city: TravelCity,
  locale: Locale,
  current: boolean,
): HTMLLIElement {
  const item = el('li', 'tb-place-card');
  item.dataset.placeId = place.id;
  if (current) item.setAttribute('aria-current', 'true');
  const open = el('button', 'tb-place-card__open');
  open.type = 'button';
  const media = placeThumb(place);
  media.classList.remove('tb-thumb');
  media.classList.add('tb-place-card__media');
  const body = el('span', 'tb-place-card__body');
  const title = el('span', 'tb-place-card__title');
  title.append(el('span', 'tb-name', pickLocale(locale, place.name)));
  if (place.aiSuggested) title.append(aiBadge(aiSuggestionTip(city.slug, place.id, locale)));
  body.append(title);
  const subs = (place.subcategories ?? []).map((id) => subcategoryLabel(id, locale)).join(' · ');
  if (subs) body.append(el('span', 'tb-place-card__sub', subs));
  body.append(placeMeta(place, locale));
  open.append(media, body);
  const actions = el('div', 'tb-place-card__actions');
  const maps = mapsIconLink({
    label: pickLocale(locale, travelUi.openInMaps),
    href: googleMapsUrl(place, city),
  });
  maps.dataset.maps = 'true';
  actions.append(createRouteButton(place.id, locale), maps);
  item.append(open, actions);
  if (place.favorite) {
    const heart = icon('favorite', { fill: true, size: 16 });
    heart.classList.add('tb-fav');
    heart.setAttribute('aria-hidden', 'true');
    item.append(heart);
  }
  return item;
}

function categoryGlyph(category: PlaceCategory, size: 16 | 18 | 20 = 16): HTMLElement {
  const name = categoryMaterialName(category);
  if (!(ICONS as readonly string[]).includes(name)) {
    const dot = el('span', 'tb-cat-dot tb-cat-glyph');
    dot.style.background = placeCategoryMeta[category].color;
    return dot;
  }
  const node = icon(name as IconName, { size, fill: true });
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
    market: en ? 'Market' : 'Mercado',
    food: en ? 'Food' : 'Comidas',
    hotels: en ? 'Hotels' : 'Hotéis',
    sections: en ? 'City sections' : 'Seções da cidade',
    categories: en ? 'Categories' : 'Categorias',
    emptyPlacesTitle: en ? 'No places' : 'Nenhum lugar',
    emptyPlaces: en
      ? 'Nothing matches this search and these categories.'
      : 'Nada combina com esta busca e estas categorias.',
    emptyGuideTitle: en ? 'Nothing here yet' : 'Ainda sem itens',
    emptyGuide: en
      ? 'This city has no market or food guide yet.'
      : 'Esta cidade ainda não tem guia de mercado e comidas.',
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

function toPins(
  places: TravelPlace[],
  kind: MapPin['kind'],
  locale: Locale,
  numbers?: ReadonlyMap<string, number>,
): MapPin[] {
  const seen = new Set<string>();
  const pins: MapPin[] = [];
  for (const place of places) {
    if (seen.has(place.id)) continue;
    if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) continue;
    seen.add(place.id);
    const number = numbers?.get(place.id);
    pins.push({
      id: place.id,
      lat: place.lat,
      lng: place.lng,
      label: pickLocale(locale, place.name),
      color: placeCategoryMeta[place.category].color,
      kind,
      ...(number ? { number } : {}),
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
  const rows = scope.querySelectorAll<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`);
  for (const row of rows) row.setAttribute('aria-current', 'true');
  if (scroll) rows[0]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
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
      icon('location_on', { fill: true, size: 16 }),
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
  const hotelPriority = priorityPlaceIds(city);
  const guide = cityGuide(city.slug);

  const storedCategories = readCategoryFilter();
  const enabled = new Set<PlaceCategory>(
    storedCategories
      ? storedCategories.filter(isCategory)
      : placeCategoryOrder.filter((category) => !placeCategoriesOffByDefault.has(category)),
  );
  const present = categoriesPresent(placeCategoryOrder, catalogPlaces);
  let groupState = groupOpenState(present, readGroups(city.slug));
  let expandBtn: HTMLButtonElement | null = null;

  let tab: Tab = initial?.tab ?? 'places';
  const planner = mountRoutePlanner({
    slug: city.slug,
    places: catalogPlaces,
    locale: () => shell.locale(),
    column: shell.mapHost.parentElement,
    map,
    city: { lat: city.lat, lng: city.lng },
    active: () => tab === 'places',
    onChange: () => {
      if (tab === 'places') showPlacePins({ fit: true, pan: false });
    },
  });
  let query = shell.query();
  let currentPlaceId: string | null = null;
  let disposed = false;
  let silence = 0;
  let hotelsEpoch = 0;
  let hotelsDispose: (() => void) | null = null;
  let searchFitTimer = 0;

  const head = el('header', 'tb-city-head');
  const metaEl = el('p', 'tb-meta');
  const titleEl = el('h1', 'tb-city-title');
  const tabs = el('div', 'tb-locale tb-city-tabs');
  const tabPanelId = 'tb-city-panel';
  tabs.id = 'tb-city-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-orientation', 'horizontal');
  const tabButtons = {} as Record<Tab, HTMLButtonElement>;
  for (const id of TABS) {
    const button = el('button');
    button.type = 'button';
    button.id = `tb-tab-${id}`;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', tabPanelId);
    button.addEventListener('click', () => setTab(id));
    tabButtons[id] = button;
    tabs.append(button);
  }
  head.append(metaEl, titleEl, tabs);

  const body = el('div', 'tb-city-body');
  body.id = tabPanelId;
  body.setAttribute('role', 'tabpanel');
  main.append(head, body);

  const visiblePlaces = (): TravelPlace[] => {
    const needle = fold(query.trim());
    return catalogPlaces.filter((place) => {
      if (!needle) return true;
      return blob.get(place.id)?.includes(needle) ?? false;
    });
  };

  const paintChrome = () => {
    const locale = shell.locale();
    const text = copy(locale);
    const count = tab === 'places' ? visiblePlaces().length : city.places.length;
    metaEl.textContent = `${pickLocale(locale, city.country)} · ${countLabel(count, locale)}`;
    titleEl.textContent = pickLocale(locale, city.name);
    tabs.setAttribute('aria-label', text.sections);
    body.setAttribute('aria-labelledby', `tb-tab-${tab}`);
    for (const id of TABS) {
      tabButtons[id].textContent = text[id];
      const on = tab === id;
      tabButtons[id].setAttribute('aria-selected', on ? 'true' : 'false');
      tabButtons[id].removeAttribute('aria-pressed');
    }
    segmented(tabs);
    const input = shell.root.querySelector<HTMLInputElement>('.tb-search input');
    if (input) input.placeholder = citySearchPlaceholder(city.places.length, locale);
  };

  const setDayLayer = (on: boolean) => {
    document.querySelector('.tb-map')?.classList.toggle('is-day-layer', on);
  };


  const showPlacePins = (opts: { fit: boolean; pan: boolean }) => {
    const badges = planner.badges();
    setDayLayer(badges.size > 0);
    map.setRoute([]);
    map.setPins('stop', planner.userPins());
    planner.syncAccuracy();
    if (!currentPlaceId) map.highlight(null);
    const mapped = catalogPlaces.filter((place) => enabled.has(place.category));
    map.setPins('place', toPins(mapped, 'place', shell.locale(), badges));
    const framing = opts.fit && planner.stopCount() >= 2;
    if (opts.fit && !framing) map.fit();
    if (opts.pan && currentPlaceId) map.highlight(currentPlaceId);
    planner.draw(framing);
  };

  const snapshot = (): CityRouteState => ({
    tab,
    ...(currentPlaceId ? { place: currentPlaceId } : {}),
  });

  const publish = () => {
    if (disposed || silence > 0) return;
    onChange?.(snapshot());
  };

  const rowButton = (id: string): HTMLElement | null => {
    const row = body.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`);
    if (row instanceof HTMLButtonElement) return row;
    return row?.querySelector<HTMLElement>('.tb-place-card__open, .tb-place-main, .tb-row__main') ?? null;
  };

  const focusPlace = (id: string, origin?: HTMLElement | null) => {
    const place = byId.get(id);
    if (!place) return;
    const changed = currentPlaceId !== id;
    currentPlaceId = id;
    openPlace(place, city, shell.locale(), origin);
    if (changed) publish();
  };

  const clearPlaceSelection = () => {
    const hadPlace = currentPlaceId != null;
    currentPlaceId = null;
    main.querySelectorAll('[data-place-id][aria-current]').forEach((node) => {
      node.removeAttribute('aria-current');
    });
    map.highlight(null);
    if (hadPlace) publish();
  };

  const offClose = onPlaceClose(clearPlaceSelection);


  const showHotelPins = () => {
    setDayLayer(false);
    map.setRoute([]);
    map.setPins('place', []);
    map.setPins('stop', planner.userPins());
    map.highlight(null);
  };

  const guideItems = (which: GuideTab) => guide?.[which] ?? [];

  /** The shops or restaurants the tab suggests, and nothing else. */
  const showGuidePins = (which: GuideTab, fit: boolean) => {
    setDayLayer(false);
    map.setRoute([]);
    map.setPins('stop', planner.userPins());
    const spots = guidePlaceIds(guideItems(which)).flatMap((id) => byId.get(id) ?? []);
    map.setPins('place', toPins(spots, 'place', shell.locale()));
    if (!currentPlaceId) map.highlight(null);
    if (fit && spots.length) map.fit();
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

  const syncSwitches = () => {
    body.querySelectorAll<HTMLButtonElement>('button.tb-switch[data-category]').forEach((button) => {
      const category = button.dataset.category;
      if (!category || !isCategory(category)) return;
      const on = enabled.has(category);
      const name = button.dataset.switchLabel ?? category;
      button.setAttribute('aria-checked', on ? 'true' : 'false');
      button.setAttribute(
        'aria-label',
        pickLocale(shell.locale(), {
          en: on ? `Hide ${name} on the map` : `Show ${name} on the map`,
          'pt-BR': on ? `Esconder ${name} no mapa` : `Mostrar ${name} no mapa`,
        }),
      );
    });
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
      const categoryName = pickLocale(locale, CATEGORY_LABEL[category]);
      const summary = el('summary', 'tb-group__summary');
      const count = el('span', 'tb-group__count', String(group.length));
      count.dataset.groupCount = category;
      const toggle = el('button', 'tb-switch');
      toggle.type = 'button';
      toggle.dataset.category = category;
      toggle.dataset.switchLabel = categoryName;
      toggle.setAttribute('role', 'switch');
      toggle.append(el('span', 'tb-switch__thumb'));
      const stopSummary = (event: Event) => {
        event.stopPropagation();
      };
      toggle.addEventListener('pointerdown', stopSummary);
      toggle.addEventListener('click', (event) => {
        event.preventDefault();
        stopSummary(event);
        if (enabled.has(category)) enabled.delete(category);
        else enabled.add(category);
        writeCategoryFilter([...enabled]);
        syncSwitches();
        showPlacePins({ fit: false, pan: false });
      });
      summary.append(
        categoryGlyph(category),
        el('span', 'tb-group__label', categoryName),
        count,
        toggle,
        icon('expand_more', { size: 18 }),
      );
      summary.lastElementChild?.classList.add('tb-group__chevron');
      const list = el('ul', 'tb-place-list');
      for (const place of group) {
        const item = placeCard(place, city, locale, place.id === currentPlaceId);
        item.querySelector('.tb-place-card__open')?.addEventListener('click', () => {
          setRowCurrent(body, place.id, false);
          focusPlace(place.id, item.querySelector<HTMLElement>('.tb-place-card__open'));
        });
        list.append(item);
      }
      section.append(summary, list);
      body.append(section);
    }
    syncSwitches();
    syncExpand();
  };

  const renderPlaceResults = () => {
    body.querySelectorAll('.tb-group, .tb-cat-head, .tb-place-list, .tb-empty').forEach((node) => node.remove());
    appendPlaceGroups();
    keepOrigin();
  };

  const renderPlaces = () => {
    body.replaceChildren();
    const tools = el('div', 'tb-place-tools');
    const expand = el('button', 'tb-expand');
    expand.type = 'button';
    expandBtn = expand;
    expand.addEventListener('click', () => {
      const groups = visibleGroupNodes();
      const allOpen = groups.length > 0 && groups.every((section) => section.open);
      setEveryGroup(!allOpen);
    });
    tools.append(expand);
    body.append(tools);
    appendPlaceGroups();
  };

  const keepOrigin = () => {
    if (!currentPlaceId) return;
    const opener = rowButton(currentPlaceId);
    if (opener) setPlaceOrigin(opener);
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

  const renderGuideTab = (which: GuideTab) => {
    body.replaceChildren();
    const items = guideItems(which);
    if (!items.length) {
      const text = copy(shell.locale());
      body.append(emptyState(text.emptyGuideTitle, text.emptyGuide));
      return;
    }
    renderGuide(body, {
      tab: which,
      items,
      places: byId,
      locale: shell.locale(),
      current: currentPlaceId,
      onSpot: (id, origin) => {
        setRowCurrent(body, id, false);
        focusPlace(id, origin);
      },
      onHover: (id) => map.hover(id),
    });
  };

  const renderBody = () => {
    if (tab === 'places') renderPlaces();
    else if (tab === 'hotels') renderHotels();
    else renderGuideTab(tab);
    keepOrigin();
  };

  body.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('.tb-hotels-mount, .tb-guide')) return;

    if (target.closest('.tb-switch')) return;
    if (target.closest('[data-route], [data-maps]')) return;
    if (target.closest('.tb-place-card__open, .tb-row__main')) return;
    const row = target.closest<HTMLElement>('[data-place-id]');
    if (!row?.dataset.placeId) return;
    const id = row.dataset.placeId;
    const opener = row.querySelector<HTMLElement>('.tb-place-card__open, .tb-place-main, .tb-row__main');
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
    else showGuidePins(tab, false);
    planner.sync();
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
    setRowCurrent(body, id, true);
    focusPlace(id, rowButton(id));
  });

  function setTab(next: Tab) {
    if (next === tab) return;
    window.clearTimeout(searchFitTimer);
    searchFitTimer = 0;
    const leavingHotels = tab === 'hotels';
    const hadPlace = currentPlaceId != null;
    runViewTransition(() => {
      tab = next;
      if (leavingHotels) closeHotels();
      closePlace({ focus: false });
      paintChrome();
      renderBody();
      if (next === 'places') showPlacePins({ fit: true, pan: currentPlaceId != null });
      else if (next === 'hotels') showHotelPins();
      else showGuidePins(next, true);
      planner.sync();
      main.scrollTop = 0;
      // The transition runs this later. Publishing outside it wrote the old tab to the URL.
      if (!hadPlace) publish();
    });
  }

  function sync(state: CityRouteState) {
    if (disposed) return;
    silence += 1;
    try {
      if (state.tab !== tab) setTab(state.tab);
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
  else if (tab === 'hotels') showHotelPins();
  else showGuidePins(tab, !initialPlace);
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
      const input = shell.root.querySelector<HTMLInputElement>('.tb-search input');
      if (input) {
        input.placeholder = pickLocale(shell.locale(), {
          en: 'Search a place or trip',
          'pt-BR': 'Buscar lugar ou roteiro',
        });
      }
      hotelsEpoch += 1;
      planner.dispose();
      unsubLocale();
      unsubQuery();
      unsubSelect();
      offClose();
      const close = hotelsDispose;
      hotelsDispose = null;
      try {
        close?.();
      } finally {
        setDayLayer(false);
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

/**
 * Catalog day timeline for a trip: periods, budgets, and the rail of
 * walks and transit between stops. The city page does not host this.
 */
import type { Shell } from '../app/shell';
import { readArrival, writeArrival } from '../app/store';
import {
  categoryMaterialName,
  getTravelCity,
  googleMapsUrl,
  itineraryForCity,
  legsForDay,
  pickLocale,
  placeCategoryMeta,
  travelUi,
} from '../catalog';
import type {
  ItineraryArrivalOption,
  ItineraryDay,
  ItineraryStop,
  Locale,
  LString,
  TravelCity,
  TravelItinerary,
  TravelPlace,
} from '../catalog';
import { buildItineraryRoute, buildItineraryRoutePreview } from '../map/itinerary-route';
import { toMapRoute } from '../map/route-model';
import type { MapHandle, MapPin } from '../map/types';
import { segmented } from '../ui/controls';
import { mapsIconLink } from '../ui/maps-icon';
import { el } from '../ui/dom';
import { icon, ICONS, type IconName } from '../ui/icons';
import { row } from '../ui/row';
import {
  dayBudgetEl,
  dayDirectionsUrl,
  daySummary,
  formatEur,
  itineraryIntro,
  paintRouteButton,
  renderPeriods,
  routeForSlots,
  routeNumbers,
  stopCost,
  type RoutePhase,
} from './timeline';
import { openPlace } from './place-panel';

type Selection = { slug: string; index: number };

function categoryGlyph(
  category: TravelPlace['category'],
  size: 16 | 18 | 20 = 16,
  colored = true,
): HTMLElement {
  const name = categoryMaterialName(category);
  if (!(ICONS as readonly string[]).includes(name)) {
    const dot = el('span', 'tb-cat-dot tb-cat-glyph');
    dot.style.background = placeCategoryMeta[category].color;
    return dot;
  }
  const node = icon(name as IconName, { size, fill: true });
  node.classList.add('tb-cat-glyph');
  if (colored) node.style.color = placeCategoryMeta[category].color;
  return node;
}

function toPins(
  places: readonly TravelPlace[],
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
      kind: 'place',
      ...(number ? { number } : {}),
    });
  }
  return pins;
}

function emptyCopy(locale: Locale): string {
  return pickLocale(locale, {
    en: 'No day-by-day in the catalog yet.',
    'pt-BR': 'Ainda não há um dia a dia no catálogo.',
  });
}

export function mountItineraryBoard(
  host: HTMLElement,
  opts: { slugs: readonly string[]; map: MapHandle; shell: Shell },
): { dispose(): void } {
  const { map, shell } = opts;
  const cities = opts.slugs
    .map((slug) => getTravelCity(slug))
    .filter((city): city is TravelCity => Boolean(city));
  const boards = cities.map((city) => ({
    city,
    places: new Map(city.places.map((place) => [place.id, place])),
    itinerary: itineraryForCity(city.slug),
  }));

  let disposed = false;
  let routeEpoch = 0;
  let routeWanted = true;
  let routePhase: RoutePhase = 'idle';
  let ignoreToggle = false;
  let currentStopId: string | null = null;
  const slotsOff = new Map<string, Set<string>>();
  const slotOpen = new Map<string, boolean>();
  const arrivalByDay = new Map<string, string>();
  const first = boards.find((board) => board.itinerary && board.itinerary.days.length > 0);
  let selected: Selection | null = first ? { slug: first.city.slug, index: 0 } : null;

  for (const board of boards) {
    if (!board.itinerary) continue;
    for (const day of board.itinerary.days) {
      const saved = readArrival(board.city.slug, day.id);
      if (saved && day.arrivals?.some((item) => item.id === saved)) {
        arrivalByDay.set(`${board.city.slug}:${day.id}`, saved);
      }
    }
  }

  const dayKey = (slug: string, dayId: string) => `${slug}:${dayId}`;

  const selectedArrival = (slug: string, day: ItineraryDay): ItineraryArrivalOption | null => {
    const options = day.arrivals;
    if (!options?.length) return null;
    const chosen = arrivalByDay.get(dayKey(slug, day.id));
    if (chosen) {
      const match = options.find((option) => option.id === chosen);
      if (match) return match;
    }
    return options.find((option) => option.default) ?? options[0] ?? null;
  };

  const activeStops = (slug: string, day: ItineraryDay): ItineraryStop[] =>
    selectedArrival(slug, day)?.stops ?? day.stops;

  const dayHeading = (slug: string, day: ItineraryDay): { title: LString; summary?: LString } => {
    const option = selectedArrival(slug, day);
    if (!option) return { title: day.title, summary: day.summary };
    return { title: option.title, summary: option.summary };
  };

  const slotsOn = (id: string): Set<string> => {
    const on = new Set(['morning', 'afternoon', 'evening']);
    const off = slotsOff.get(id);
    if (off) for (const slot of off) on.delete(slot);
    return on;
  };

  const findBoard = (slug: string) => boards.find((board) => board.city.slug === slug);

  const routedDay = (slug: string, day: ItineraryDay) =>
    routeForSlots(activeStops(slug, day), legsForDay(day.id, selectedArrival(slug, day)?.id), slotsOn(dayKey(slug, day.id)));

  const placeCoords = (city: TravelCity) => {
    const coords = new Map<string, { id: string; lat: number; lng: number }>();
    for (const place of city.places) coords.set(place.id, { id: place.id, lat: place.lat, lng: place.lng });
    return coords;
  };

  const allPlaces = () => boards.flatMap((board) => board.city.places);

  const setDayLayer = (on: boolean) => {
    document.querySelector('.tb-map')?.classList.toggle('is-day-layer', on);
  };

  const currentDay = (): { slug: string; city: TravelCity; day: ItineraryDay; itinerary: TravelItinerary } | null => {
    if (!selected) return null;
    const board = findBoard(selected.slug);
    const day = board?.itinerary?.days[selected.index];
    if (!board?.itinerary || !day) return null;
    return { slug: selected.slug, city: board.city, day, itinerary: board.itinerary };
  };

  const syncRouteChrome = () => {
    host.querySelectorAll<HTMLButtonElement>('.tb-day__route').forEach((button) => {
      const section = button.closest<HTMLElement>('[data-day-key]');
      const key = section?.dataset.dayKey;
      const phase: RoutePhase =
        routeWanted && key && selected && key === `${selected.slug}:${selected.index}` ? routePhase : 'idle';
      paintRouteButton(button, phase, shell.locale());
    });
  };

  const paintPins = () => {
    const current = currentDay();
    const numbers =
      current && routeWanted ? routeNumbers(routedDay(current.slug, current.day).ids) : undefined;
    map.setPins('place', toPins(allPlaces(), shell.locale(), numbers));
    map.setPins('stop', []);
    map.setPins('hotel', []);
    map.setOverview(null);
    setDayLayer(Boolean(current) && routeWanted);
  };

  const drawRoute = (fit: boolean) => {
    const epoch = ++routeEpoch;
    const current = currentDay();
    if (!current || !routeWanted) {
      routePhase = 'idle';
      map.setRoute([]);
      paintPins();
      syncRouteChrome();
      return;
    }
    paintPins();
    routePhase = 'drawing';
    syncRouteChrome();
    const coords = placeCoords(current.city);
    const routed = routedDay(current.slug, current.day);
    map.setRoute(toMapRoute(buildItineraryRoutePreview(routed.ids, routed.legs, coords)), { fit });
    void buildItineraryRoute(routed.ids, routed.legs, coords)
      .then((built) => {
        if (disposed || epoch !== routeEpoch) return;
        map.setRoute(toMapRoute(built));
        routePhase = 'on';
        syncRouteChrome();
      })
      .catch(() => {
        if (disposed || epoch !== routeEpoch) return;
        routePhase = 'on';
        syncRouteChrome();
      });
  };

  const markSelected = () => {
    for (const section of host.querySelectorAll<HTMLElement>('.tb-day')) {
      const on = Boolean(selected) && section.dataset.dayKey === `${selected?.slug}:${selected?.index}`;
      section.toggleAttribute('aria-current', on);
    }
  };

  const closeOthers = (open: HTMLDetailsElement) => {
    ignoreToggle = true;
    host.querySelectorAll<HTMLDetailsElement>('details.tb-day').forEach((section) => {
      if (section !== open) section.open = false;
    });
    ignoreToggle = false;
  };

  const focusStop = (city: TravelCity, id: string, origin: HTMLElement | null) => {
    const place = city.places.find((item) => item.id === id);
    if (!place) return;
    currentStopId = id;
    host.querySelectorAll('[data-place-id][aria-current]').forEach((node) => {
      node.removeAttribute('aria-current');
    });
    host.querySelector(`[data-place-id="${CSS.escape(id)}"]`)?.setAttribute('aria-current', 'true');
    openPlace(place, city, shell.locale(), origin);
  };

  const costMeta = (stop: ItineraryStop, place: TravelPlace | undefined, locale: Locale) => {
    const cost = stopCost(stop, place);
    const meta = el('span', 'tb-stop-costs');
    const add = (glyph: 'restaurant' | 'local_activity', amount: number, label: string) => {
      if (amount <= 0) return;
      const chip = el('span', 'tb-stop-cost');
      chip.append(icon(glyph, { size: 16, fill: true }));
      chip.append(document.createTextNode(formatEur(amount, locale)));
      chip.setAttribute('data-tip', label);
      meta.append(chip);
    };
    add('restaurant', cost.food, pickLocale(locale, travelUi.itineraryFood));
    add('local_activity', cost.ticket, pickLocale(locale, travelUi.itineraryParks));
    if (stop.optional) meta.prepend(el('span', 'tb-badge-soft', pickLocale(locale, travelUi.itineraryOptional)));
    return meta.childElementCount ? meta : undefined;
  };

  const render = () => {
    const locale = shell.locale();
    host.replaceChildren();
    if (boards.length === 0) {
      host.append(el('p', 'tb-meta', emptyCopy(locale)));
      return;
    }
    for (const board of boards) {
      const section = el('section', 'tb-itin-city');
      section.dataset.city = board.city.slug;
      section.append(el('h2', 'tb-itin-city__title', pickLocale(locale, board.city.name)));
      const itinerary = board.itinerary;
      if (!itinerary || itinerary.days.length === 0) {
        section.append(el('p', 'tb-meta', emptyCopy(locale)));
        host.append(section);
        continue;
      }
      section.append(itineraryIntro(itinerary, board.places, locale));
      itinerary.days.forEach((day, index) => {
        const details = el('details', 'tb-day');
        const key = `${board.city.slug}:${index}`;
        details.dataset.dayKey = key;
        details.dataset.dayId = day.id;
        details.dataset.city = board.city.slug;
        const open = selected?.slug === board.city.slug && selected.index === index;
        details.open = open;
        if (open) details.setAttribute('aria-current', 'true');
        details.addEventListener('toggle', () => {
          if (ignoreToggle) return;
          if (!details.open) {
            if (selected?.slug === board.city.slug && selected.index === index) {
              routeWanted = false;
              routePhase = 'idle';
              routeEpoch += 1;
              map.setRoute([]);
              paintPins();
              syncRouteChrome();
            }
            return;
          }
          closeOthers(details);
          routeWanted = true;
          selected = { slug: board.city.slug, index };
          markSelected();
          drawRoute(true);
        });
        const stops = activeStops(board.city.slug, day);
        const phase: RoutePhase = routeWanted && open ? routePhase : 'idle';
        details.append(
          daySummary({
            dayNumber: day.day,
            stops,
            phase,
            mapsUrl: dayDirectionsUrl(routedDay(board.city.slug, day).ids, placeCoords(board.city)),
            locale,
            onRoute: () => {
              const showing = routeWanted && selected?.slug === board.city.slug && selected.index === index && routePhase !== 'idle';
              if (showing) {
                routeWanted = false;
                routePhase = 'idle';
                routeEpoch += 1;
                map.setRoute([]);
                paintPins();
                syncRouteChrome();
                return;
              }
              routeWanted = true;
              selected = { slug: board.city.slug, index };
              if (!details.open) {
                details.open = true;
                return;
              }
              markSelected();
              drawRoute(true);
            },
          }),
        );
        const heading = dayHeading(board.city.slug, day);
        if (heading.summary) {
          details.append(el('p', 'tb-meta tb-day-summary', pickLocale(locale, heading.summary)));
        }
        const option = selectedArrival(board.city.slug, day);
        if (day.arrivals?.length) {
          const control = el('div', 'tb-locale tb-arrival');
          control.setAttribute('role', 'tablist');
          control.setAttribute('aria-label', pickLocale(locale, travelUi.itineraryArrivalAirport));
          for (const item of day.arrivals) {
            const button = el('button');
            button.type = 'button';
            button.setAttribute('role', 'tab');
            button.dataset.arrivalDay = dayKey(board.city.slug, day.id);
            button.dataset.arrivalId = item.id;
            button.setAttribute('aria-selected', option?.id === item.id ? 'true' : 'false');
            button.append(icon('flight', { size: 16, fill: true }), el('span', undefined, pickLocale(locale, item.label)));
            button.addEventListener('click', () => {
              arrivalByDay.set(dayKey(board.city.slug, day.id), item.id);
              writeArrival(board.city.slug, day.id, item.id);
              selected = { slug: board.city.slug, index };
              routeWanted = true;
              if (currentStopId && !activeStops(board.city.slug, day).some((stop) => stop.placeId === currentStopId)) {
                currentStopId = null;
              }
              render();
              drawRoute(true);
            });
            control.append(button);
          }
          segmented(control);
          details.append(control);
        }
        const budget = dayBudgetEl(day, stops, board.places, locale);
        if (budget) details.append(budget);
        const slotId = dayKey(board.city.slug, day.id);
        details.append(
          renderPeriods({
            stops,
            locale,
            enabled: slotsOn(slotId),
            coords: placeCoords(board.city),
            isOpen: (slot) => slotOpen.get(`${slotId}:${slot}`) ?? true,
            onOpen: (slot, next) => slotOpen.set(`${slotId}:${slot}`, next),
            onToggleSlot: (slot, on) => {
              const off = slotsOff.get(slotId) ?? new Set<string>();
              if (on) off.delete(slot);
              else off.add(slot);
              slotsOff.set(slotId, off);
              if (selected?.slug === board.city.slug && selected.index === index && routeWanted) drawRoute(false);
            },
            legs: legsForDay(day.id, selectedArrival(board.city.slug, day)?.id),
            onHoverHop: (hop) => {
              if (!hop) {
                host.querySelectorAll('.tb-timeline .is-hot').forEach((node) => node.classList.remove('is-hot'));
                map.hoverLeg(null, null);
                return;
              }
              host.querySelectorAll('.tb-timeline .is-hot').forEach((node) => node.classList.remove('is-hot'));
              host
                .querySelectorAll(
                  `.tb-timeline [data-leg-from="${CSS.escape(hop.from)}"][data-leg-to="${CSS.escape(hop.to)}"]`,
                )
                .forEach((node) => node.classList.add('is-hot'));
              map.hoverLeg(hop.from, hop.to);
            },
            renderStop: (stop) => {
              const place = board.places.get(stop.placeId);
              const meta = costMeta(stop, place, locale);
              if (!place) {
                const missing = row({
                  time: stop.time,
                  title: stop.placeId,
                  sub: pickLocale(locale, { en: 'Place unavailable', 'pt-BR': 'Lugar indisponível' }),
                  meta,
                  data: { placeId: stop.placeId },
                });
                missing.classList.add('is-disabled');
                if (stop.optional) missing.classList.add('is-optional');
                return missing;
              }
              const pin = el('span', 'tb-timeline__pin');
              pin.style.setProperty('--pin-color', placeCategoryMeta[place.category].color);
              pin.append(categoryGlyph(place.category, 16, false));
              const maps = mapsIconLink({
                label: pickLocale(locale, travelUi.openInMaps),
                href: googleMapsUrl(place, board.city),
              });
              maps.dataset.maps = 'true';
              const item = row({
                time: stop.time,
                lead: pin,
                title: pickLocale(locale, place.name),
                sub: stop.note ? pickLocale(locale, stop.note) : undefined,
                meta,
                actions: maps,
                current: open && place.id === currentStopId,
                data: { placeId: place.id },
                onSelect: () => {
                  selected = { slug: board.city.slug, index };
                  markSelected();
                  const origin = item.querySelector<HTMLElement>('.tb-row__main');
                  focusStop(board.city, place.id, origin);
                },
              });
              if (stop.optional) item.classList.add('is-optional');
              item.addEventListener('pointerenter', () => {
                item.classList.add('is-hot');
                map.hover(place.id);
              });
              item.addEventListener('pointerleave', () => {
                item.classList.remove('is-hot');
                map.hover(null);
              });
              return item;
            },
          }),
        );
        section.append(details);
      });
      host.append(section);
    }
    syncRouteChrome();
  };

  render();
  drawRoute(true);

  const offHover = map.onHover((id) => {
    if (disposed || !id) return;
    host.querySelectorAll('.tb-timeline .is-hot').forEach((node) => node.classList.remove('is-hot'));
    host.querySelectorAll(`.tb-timeline [data-place-id="${CSS.escape(id)}"]`).forEach((node) => {
      node.classList.add('is-hot');
    });
  });
  const offSelect = map.onSelect((id) => {
    if (disposed) return;
    for (const board of boards) {
      if (!board.places.has(id)) continue;
      const row = host.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"] .tb-row__main`);
      focusStop(board.city, id, row);
      row?.scrollIntoView({ block: 'nearest' });
      return;
    }
  });

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      routeEpoch += 1;
      offHover();
      offSelect();
      setDayLayer(false);
      map.setRoute([]);
      map.hover(null);
      map.hoverLeg(null, null);
    },
  };
}

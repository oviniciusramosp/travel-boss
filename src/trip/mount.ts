import type { Shell } from '../app/shell';
import { readCategoryFilter, writeCategoryFilter } from '../app/store';
import {
  getTravelCity,
  googleMapsUrl,
  pickLocale,
  placeCategoryMeta,
  placeCategoryOrder,
  placePinIconHtml,
  travelUi,
} from '../catalog';
import type { PlaceCategory, TravelPlace } from '../catalog';
import type { MapHandle, MapPin, MapRouteSegment } from '../map/types';
import { fetchWalkingRoute } from '../map/walk-route';
import { setDocumentTitle } from '../app/router';
import { directionsMode, googleDirectionsUrl } from './directions';
import { tripErrorText } from './errors';
import { copyTrip, downloadTrip, tripToHtml, tripToMarkdown } from './export';
import { dayKey, dayOpen, shouldRefit, stopKey, type FocusMark } from './view-state';
import { rememberWalk, rememberedWalk } from './walk-memory';
import { iconLink } from '../ui/controls';
import { row } from '../ui/row';
import {
  closePlace,
  onPlaceClose,
  openPlace,
  openPlaceId,
  repaintPlace,
  setPlaceOrigin,
} from '../views/place-panel';
import { parseTrip, type Trip } from './parse';

type TripFile = { id: string; file: string; raw: string };

const tripFileListeners = new Set<() => void>();
let tripHotBound = false;

function onTripFiles(fn: () => void): () => void {
  tripFileListeners.add(fn);
  if (!tripHotBound && import.meta.hot) {
    tripHotBound = true;
    import.meta.hot.on('tb:trip', () => {
      for (const listener of tripFileListeners) listener();
    });
  }
  return () => {
    tripFileListeners.delete(fn);
  };
}

export async function loadTripFiles(): Promise<TripFile[]> {
  const response = await fetch('/api/trips');
  if (!response.ok) throw new Error(`trip api ${response.status}`);
  const data = (await response.json()) as TripFile[];
  if (!Array.isArray(data)) throw new Error('trip api');
  return data;
}

function resolveHref(citySlug: string, placeId: string): string | null {
  const city = getTravelCity(citySlug);
  const place = city?.places.find((item) => item.id === placeId);
  if (!city || !place) return null;
  return googleMapsUrl(place, city);
}

function placeById(citySlug: string, placeId: string): TravelPlace | undefined {
  return getTravelCity(citySlug)?.places.find((item) => item.id === placeId);
}

/** Category glyph, in the category color. The catalog helper returns markup. */
function stopPin(place: TravelPlace): HTMLSpanElement {
  const lead = document.createElement('span');
  lead.className = 'tb-stop-pin';
  lead.style.color = placeCategoryMeta[place.category].color;
  const markup = document.createElement('template');
  markup.innerHTML = placePinIconHtml(place.category, place.subcategories);
  lead.append(markup.content);
  lead.querySelector('.material-symbols-rounded')?.classList.add('is-16');
  return lead;
}

function emptyNotice(title: string, detail?: string, error = false): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = 'tb-empty';
  const strong = document.createElement('strong');
  if (error) strong.className = 'tb-error';
  strong.textContent = title;
  wrap.append(strong);
  if (detail) wrap.append(document.createTextNode(detail));
  return wrap;
}

function clearStopCurrent(): void {
  document.querySelectorAll('[data-stop][aria-current]').forEach((node) => {
    node.removeAttribute('aria-current');
  });
}

function stopPins(
  trip: Trip,
  cityFilter: string | null,
  enabled: ReadonlySet<PlaceCategory>,
): MapPin[] {
  const pins: MapPin[] = [];
  const seen = new Set<string>();
  for (const city of trip.cities) {
    if (cityFilter && city.slug !== cityFilter) continue;
    const record = getTravelCity(city.slug);
    if (!record) continue;
    for (const day of city.days) {
      for (const stop of day.stops) {
        if (!stop.placeId || seen.has(stop.placeId)) continue;
        const place = record.places.find((item) => item.id === stop.placeId);
        if (!place || !enabled.has(place.category)) continue;
        seen.add(stop.placeId);
        pins.push({
          id: place.id,
          lat: place.lat,
          lng: place.lng,
          label: stop.time ? `${stop.time} ${stop.label}` : stop.label,
          color: placeCategoryMeta[place.category].color,
          kind: 'stop',
        });
      }
    }
  }
  return pins;
}

export function mountTripNav(
  el: HTMLElement,
  _shell: Shell,
  onPick: (id: string) => void,
): { setActive(id: string | null): void } {
  let active: string | null = null;
  let alive = true;
  const buttons = new Map<string, HTMLButtonElement>();

  const paint = (files: TripFile[]) => {
    el.replaceChildren();
    buttons.clear();
    for (const file of files) {
      const trip = parseTrip(file.id, file.file, file.raw);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tb-nav';
      button.textContent = trip.title;
      button.dataset.tripId = file.id;
      if (file.id === active) button.setAttribute('aria-current', 'true');
      button.addEventListener('click', () => onPick(file.id));
      buttons.set(file.id, button);
      el.append(button);
    }
  };

  const refresh = () => {
    loadTripFiles()
      .then((files) => {
        if (alive) paint(files);
      })
      .catch(() => {
        if (!alive) return;
        el.replaceChildren();
      });
  };

  refresh();
  onTripFiles(refresh);

  return {
    setActive(id) {
      active = id;
      for (const [key, button] of buttons) {
        if (id && key === id) button.setAttribute('aria-current', 'true');
        else button.removeAttribute('aria-current');
      }
    },
  };
}

export function mountTrip(
  main: HTMLElement,
  map: MapHandle,
  id: string,
  shell: Shell,
): { dispose(): void } {
  main.scrollTop = 0;
  let alive = true;
  let failure: 'missing' | 'read' | null = null;
  const stopsUnsub = { fn: () => {} };

  const showFailure = (kind: 'missing' | 'read') => {
    failure = kind;
    const locale = shell.locale();
    main.replaceChildren(
      kind === 'missing'
        ? emptyNotice(
            pickLocale(locale, { en: 'Trip removed', 'pt-BR': 'Roteiro removido' }),
            pickLocale(locale, {
              en: 'The file is no longer in content/trips.',
              'pt-BR': 'O arquivo não está mais em content/trips.',
            }),
          )
        : emptyNotice(
            pickLocale(locale, { en: 'Could not read the trip', 'pt-BR': 'Falha ao ler o roteiro' }),
            undefined,
            true,
          ),
    );
    main.scrollTop = 0;
    shell.setExportEnabled(false);
    map.setPins('stop', []);
  };

  const offLocale = shell.onLocale(() => {
    if (!alive) return;
    if (failure) {
      showFailure(failure);
      return;
    }
    if (!current) return;
    paint(current);
    repaintPlace(shell.locale());
  });
  const offQuery = shell.onQuery(() => applyQuery());
  const offExport = shell.onExport(() => {
    void exportCurrent();
  });

  let current: Trip | null = null;
  let lastRaw = '';
  let statusTimer = 0;
  const toast = document.createElement('p');
  toast.className = 'tb-toast';
  toast.setAttribute('role', 'status');
  toast.hidden = true;
  document.body.append(toast);

  const showToast = (message: string, error = false) => {
    window.clearTimeout(statusTimer);
    toast.hidden = false;
    toast.textContent = message;
    toast.classList.toggle('tb-error', error);
    if (error) return;
    statusTimer = window.setTimeout(() => {
      toast.hidden = true;
      toast.textContent = '';
    }, 2000);
  };
  let cityFilter: string | null = null;
  let tripRouteEpoch = 0;
  let hasPainted = false;
  let openKeys = new Set<string>();
  let focusMark: FocusMark | null = null;
  let currentStopKey: string | null = null;
  let scrollTop = 0;
  let seenPinIds = new Set<string>();
  const storedCategories = readCategoryFilter();
  const enabledCategories = new Set<PlaceCategory>(
    storedCategories
      ? storedCategories.filter((id): id is PlaceCategory =>
          (placeCategoryOrder as readonly string[]).includes(id),
        )
      : placeCategoryOrder,
  );

  function drawTripRoutes() {
    const epoch = ++tripRouteEpoch;
    const coords = new Map<string, { lat: number; lng: number }>();
    const pairs: { from: { lat: number; lng: number }; to: { lat: number; lng: number } }[] = [];
    for (const section of main.querySelectorAll<HTMLElement>('.tb-city-section')) {
      if (section.hidden) continue;
      const record = getTravelCity(section.dataset.city ?? '');
      if (!record) continue;
      for (const place of record.places) {
        coords.set(place.id, { lat: place.lat, lng: place.lng });
      }
      for (const day of section.querySelectorAll<HTMLDetailsElement>('details.tb-day')) {
        if (!day.open) continue;
        const stopIds = [...day.querySelectorAll<HTMLElement>('[data-place-id]')]
          .map((node) => node.dataset.placeId)
          .filter((value): value is string => Boolean(value));
        for (let index = 1; index < stopIds.length; index += 1) {
          const fromId = stopIds[index - 1];
          const toId = stopIds[index];
          const from = fromId ? coords.get(fromId) : undefined;
          const to = toId ? coords.get(toId) : undefined;
          if (from && to) pairs.push({ from, to });
        }
      }
    }

    const slots: (MapRouteSegment | null)[] = pairs.map((pair) => {
      const cached = rememberedWalk(pair.from, pair.to);
      return cached ? { mode: 'walk', latlngs: cached } : null;
    });
    const ready = () => slots.filter((slot): slot is MapRouteSegment => slot !== null);
    if (ready().length === pairs.length) {
      map.setRoute(ready());
      return;
    }
    if (ready().length) map.setRoute(ready());

    void Promise.all(
      pairs.map(async (pair, index) => {
        if (slots[index]) return;
        const route = await fetchWalkingRoute([
          { lat: pair.from.lat, lng: pair.from.lng },
          { lat: pair.to.lat, lng: pair.to.lng },
        ]);
        if (route && route.latlngs.length >= 2) {
          rememberWalk(pair.from, pair.to, route.latlngs);
          slots[index] = { mode: 'walk', latlngs: route.latlngs };
          return;
        }
        slots[index] = {
          mode: 'walk',
          latlngs: [
            [pair.from.lat, pair.from.lng],
            [pair.to.lat, pair.to.lng],
          ],
        };
      }),
    )
      .then(() => {
        if (!alive || epoch !== tripRouteEpoch) return;
        map.setRoute(ready());
      })
      .catch(() => undefined);
  }

  function syncView(fit: boolean) {
    const trip = current;
    main.querySelectorAll<HTMLButtonElement>('[data-city-filter]').forEach((button) => {
      button.setAttribute(
        'aria-pressed',
        button.dataset.cityFilter === cityFilter ? 'true' : 'false',
      );
    });
    main.querySelectorAll<HTMLButtonElement>('.tb-filters [data-category]').forEach((button) => {
      const category = button.dataset.category as PlaceCategory | undefined;
      button.setAttribute(
        'aria-pressed',
        category && enabledCategories.has(category) ? 'true' : 'false',
      );
    });
    main.querySelectorAll<HTMLElement>('.tb-city-section').forEach((section) => {
      const cityOn = !cityFilter || section.dataset.city === cityFilter;
      section.hidden = !cityOn;
      if (!cityOn) return;
      section.querySelectorAll<HTMLElement>('li[data-stop]').forEach((item) => {
        const category = item.dataset.category as PlaceCategory | undefined;
        item.hidden = Boolean(category) && !enabledCategories.has(category as PlaceCategory);
      });
      section.querySelectorAll<HTMLElement>('ul.tb-stops').forEach((list) => {
        const any = [...list.querySelectorAll<HTMLElement>('li')].some((item) => !item.hidden);
        list.hidden = !any;
      });
    });
    if (!trip) return;
    const pins = stopPins(trip, cityFilter, enabledCategories);
    map.setPins('stop', pins);
    map.setPins('place', []);
    map.setPins('hotel', []);
    if (fit && pins.length) map.fit();
    seenPinIds = new Set(pins.map((pin) => pin.id));
    drawTripRoutes();
    const openId = openPlaceId();
    if (!openId || !trip) return;
    const visible = trip.cities.some((city) => {
      if (cityFilter && city.slug !== cityFilter) return false;
      const record = getTravelCity(city.slug);
      const place = record?.places.find((item) => item.id === openId);
      if (!place || !enabledCategories.has(place.category)) return false;
      return city.days.some((day) => day.stops.some((stop) => stop.placeId === openId));
    });
    if (!visible) closePlace({ focus: false });
  }

  const offFiles = onTripFiles(() => {
    if (alive) void render();
  });

  const offClose = onPlaceClose(() => {
    clearStopCurrent();
    map.highlight(null);
  });

  function applyQuery() {
    const query = shell.query();
    main.querySelectorAll<HTMLElement>('[data-stop]').forEach((node) => {
      const hay = node.dataset.hay ?? '';
      const hit = !query.trim() || hay.includes(query.trim().toLowerCase());
      node.classList.toggle('is-dim', !hit);
    });
  }

  async function exportCurrent() {
    if (!current) return;
    const locale = shell.locale();
    const markdown = tripToMarkdown(current, resolveHref);
    const html = tripToHtml(markdown);
    try {
      await copyTrip(markdown, html);
      downloadTrip(`${current.id}.md`, markdown);
      showToast(
        locale === 'pt-BR'
          ? 'Copiado para colar no Notes ou no Notion.'
          : 'Copied for Notes or Notion.',
      );
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : pickLocale(locale, { en: 'Could not copy', 'pt-BR': 'Falha ao copiar' }),
        true,
      );
    }
  }

  function rememberView() {
    if (!main.querySelector('.tb-doc')) return;
    const keys = new Set<string>();
    main.querySelectorAll<HTMLDetailsElement>('details.tb-day').forEach((details) => {
      if (details.open && details.dataset.dayKey) keys.add(details.dataset.dayKey);
    });
    openKeys = keys;
    currentStopKey =
      main.querySelector<HTMLElement>('[data-stop-key][aria-current]')?.dataset.stopKey ?? null;
    scrollTop = main.scrollTop;
    const active = document.activeElement;
    focusMark = null;
    if (!(active instanceof HTMLElement) || !main.contains(active)) return;
    const stop = active.closest<HTMLElement>('[data-stop-key]');
    if (stop?.dataset.stopKey) {
      const action = active.closest<HTMLElement>('[data-action]')?.dataset.action;
      focusMark = action
        ? { kind: 'stop', key: stop.dataset.stopKey, action }
        : { kind: 'stop', key: stop.dataset.stopKey };
      return;
    }
    const day = active.closest<HTMLDetailsElement>('details.tb-day');
    if (day?.dataset.dayKey && active.closest('summary')) {
      focusMark = { kind: 'day', key: day.dataset.dayKey };
      return;
    }
    const category = active.closest<HTMLElement>('[data-category]');
    if (category?.dataset.category) {
      focusMark = { kind: 'category', id: category.dataset.category };
      return;
    }
    const city = active.closest<HTMLElement>('[data-city-filter]');
    if (city?.dataset.cityFilter) focusMark = { kind: 'city', id: city.dataset.cityFilter };
  }

  function restoreFocus() {
    const mark = focusMark;
    if (!mark) return;
    let target: HTMLElement | null = null;
    if (mark.kind === 'day') {
      target = main.querySelector(`details[data-day-key="${CSS.escape(mark.key)}"] > summary`);
    } else if (mark.kind === 'stop') {
      const row = main.querySelector<HTMLElement>(`[data-stop-key="${CSS.escape(mark.key)}"]`);
      target = mark.action
        ? (row?.querySelector<HTMLElement>(`[data-action="${CSS.escape(mark.action)}"]`) ?? null)
        : (row?.querySelector<HTMLElement>('.tb-row__main') ?? null);
    } else if (mark.kind === 'category') {
      target = main.querySelector(`[data-category="${CSS.escape(mark.id)}"]`);
    } else {
      target = main.querySelector(`[data-city-filter="${CSS.escape(mark.id)}"]`);
    }
    target?.focus({ preventScroll: true });
  }

  function paint(trip: Trip) {
    const firstPaint = !hasPainted;
    if (!firstPaint) rememberView();
    current = trip;
    const locale = shell.locale();
    main.replaceChildren();

    const article = document.createElement('article');
    article.className = 'tb-doc';
    article.dataset.tripId = trip.id;

    const title = document.createElement('h1');
    title.className = 'tb-doc-title';
    title.textContent = trip.title;
    article.append(title);

    if (trip.errors.length) {
      const problems = document.createElement('p');
      problems.className = 'tb-meta';
      problems.textContent = trip.errors
        .slice(0, 4)
        .map((error) => tripErrorText(error, locale))
        .join(' · ');
      article.append(problems);
    }

    if (trip.cities.length > 1) {
      const rail = document.createElement('div');
      rail.className = 'tb-rail';
      rail.setAttribute(
        'aria-label',
        locale === 'pt-BR' ? 'Cidades do roteiro' : 'Trip cities',
      );
      for (const city of trip.cities) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tb-nav';
        button.dataset.cityFilter = city.slug;
        button.textContent = city.name;
        button.setAttribute('aria-pressed', cityFilter === city.slug ? 'true' : 'false');
        button.addEventListener('click', () => {
          cityFilter = cityFilter === city.slug ? null : city.slug;
          syncView(true);
          if (!cityFilter) return;
          article
            .querySelector<HTMLElement>(`[data-city="${CSS.escape(city.slug || city.name)}"]`)
            ?.scrollIntoView({ block: 'start' });
        });
        rail.append(button);
      }
      article.append(rail);
    }

    const present = new Set<PlaceCategory>();
    for (const city of trip.cities) {
      const record = getTravelCity(city.slug);
      if (!record) continue;
      for (const day of city.days) {
        for (const stop of day.stops) {
          const place = stop.placeId
            ? record.places.find((item) => item.id === stop.placeId)
            : undefined;
          if (place) present.add(place.category);
        }
      }
    }
    const categories = placeCategoryOrder.filter((category) => present.has(category));
    if (categories.length > 1) {
      const filters = document.createElement('div');
      filters.className = 'tb-filters';
      filters.setAttribute(
        'role', 'group',
      );
      filters.setAttribute(
        'aria-label',
        locale === 'pt-BR' ? 'Categorias' : 'Categories',
      );
      for (const category of categories) {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tb-btn-outline';
        button.dataset.category = category;
        button.setAttribute('aria-pressed', enabledCategories.has(category) ? 'true' : 'false');
        const dot = document.createElement('span');
        dot.className = 'tb-cat-dot';
        dot.style.background = placeCategoryMeta[category].color;
        const label = document.createElement('span');
        label.className = 'tb-cat-label';
        label.textContent = pickLocale(locale, travelUi.categories[category]);
        button.append(dot, label);
        button.addEventListener('click', () => {
          if (enabledCategories.has(category)) enabledCategories.delete(category);
          else enabledCategories.add(category);
          writeCategoryFilter([...enabledCategories]);
          syncView(true);
        });
        filters.append(button);
      }
      article.append(filters);
    }

    for (const city of trip.cities) {
      const section = document.createElement('section');
      section.className = 'tb-city-section';
      section.dataset.city = city.slug || city.name;
      const heading = document.createElement('h2');
      heading.textContent = city.name;
      section.append(heading);
      if (city.dates) {
        const dates = document.createElement('p');
        dates.className = 'tb-meta';
        dates.textContent = `${city.dates.start} → ${city.dates.end}`;
        section.append(dates);
      }
      const record = getTravelCity(city.slug);
      city.days.forEach((day, dayIndex) => {
        const details = document.createElement('details');
        details.className = 'tb-day';
        const openedKey = dayKey(city.slug || city.name, dayIndex, day.title);
        details.dataset.dayKey = openedKey;
        details.open = dayOpen(firstPaint, openedKey, openKeys, dayIndex);
        const dayTitle = document.createElement('summary');
        dayTitle.textContent = day.title;
        details.append(dayTitle);
        const list = document.createElement('ul');
        list.className = 'tb-list tb-list--stops tb-stops';
        let previousPoint: { lat: number; lng: number } | null = null;
        day.stops.forEach((stop, stopIndex) => {
          const place = stop.placeId ? placeById(city.slug, stop.placeId) : undefined;
          const missingPlace = Boolean(stop.placeId && !place);
          const href = stop.href
            ? stop.href
            : place
              ? resolveHref(city.slug, place.id)
              : null;
          const point = place ? { lat: place.lat, lng: place.lng } : null;
          const directions =
            previousPoint && point
              ? googleDirectionsUrl(
                  [previousPoint, point],
                  directionsMode(previousPoint, point),
                )
              : null;
          previousPoint = point;
          const actions = document.createDocumentFragment();
          if (directions) {
            const link = iconLink({
              icon: 'directions',
              label: pickLocale(locale, {
                en: 'Directions from the previous stop',
                'pt-BR': 'Como chegar desde a parada anterior',
              }),
              href: directions,
            });
            link.dataset.action = 'directions';
            actions.append(link);
          }
          if (href) {
            const link = iconLink({
              icon: 'location_on',
              label: pickLocale(locale, { en: 'Google Maps', 'pt-BR': 'Google Maps' }),
              href,
            });
            link.dataset.action = 'maps';
            actions.append(link);
          }
          const authored = [stop.label, stop.note].filter(Boolean).join(' — ');
          const placeId = stop.placeId;
          const item = row({
            time: stop.time,
            lead: place ? stopPin(place) : undefined,
            title: missingPlace ? (placeId ?? stop.label) : stop.label,
            sub: missingPlace ? authored || undefined : stop.note,
            actions: actions.childNodes.length ? actions : undefined,
            data: {
              stop: '',
              stopKey: stopKey(
                city.slug || city.name,
                dayIndex,
                day.title,
                stopIndex,
                stop.placeId,
                stop.label,
              ),
              hay: `${city.name} ${stop.label} ${stop.note ?? ''} ${stop.placeId ?? ''} ${stop.time ?? ''}`.toLowerCase(),
              ...(stop.placeId ? { placeId: stop.placeId } : {}),
              ...(stop.time ? { stopTime: stop.time } : {}),
              ...(place ? { category: place.category } : {}),
            },
            onSelect:
              place && record
                ? () => {
                    clearStopCurrent();
                    item.setAttribute('aria-current', 'true');
                    const origin = item.querySelector<HTMLElement>('.tb-row__main');
                    openPlace(place, record, locale, origin);
                  }
                : undefined,
          });
          if (missingPlace) {
            item.classList.add('is-disabled');
            item.setAttribute('aria-disabled', 'true');
          }
          list.append(item);
        });
        if (day.stops.length) details.append(list);
        for (const note of day.notes) {
          const paragraph = document.createElement('p');
          paragraph.className = 'tb-doc-note';
          paragraph.textContent = note;
          details.append(paragraph);
        }
        details.addEventListener('toggle', () => drawTripRoutes());
        section.append(details);
      });
      if (record) {
        const count = document.createElement('p');
        count.className = 'tb-meta';
        const label = pickLocale(locale, record.name);
        count.textContent =
          locale === 'pt-BR'
            ? `${label} · ${record.places.length} lugares no catálogo`
            : `${label} · ${record.places.length} places in the catalog`;
        section.append(count);
      }
      article.append(section);
    }

    main.append(article);
    if (currentStopKey) {
      main
        .querySelector<HTMLElement>(`[data-stop-key="${CSS.escape(currentStopKey)}"]`)
        ?.setAttribute('aria-current', 'true');
    }
    restoreFocus();
    main.scrollTop = firstPaint ? 0 : scrollTop;
    applyQuery();
    hasPainted = true;
    syncView(
      shouldRefit(firstPaint, stopPins(trip, cityFilter, enabledCategories), seenPinIds, (lat, lng) =>
        map.inView(lat, lng),
      ),
    );
    shell.setSource(trip.file);
    shell.setExportEnabled(true);
    setDocumentTitle(trip.title);
    const openId = openPlaceId();
    if (openId) {
      const opener = main.querySelector<HTMLElement>(
        `[data-place-id="${CSS.escape(openId)}"] .tb-row__main`,
      );
      if (opener) setPlaceOrigin(opener);
    }
  }

  async function render() {
    try {
      const files = await loadTripFiles();
      if (!alive) return;
      const file = files.find((item) => item.id === id);
      if (file && file.raw === lastRaw && current && !failure) return;
      if (!file) {
        showFailure('missing');
        return;
      }
      failure = null;
      lastRaw = file.raw;
      const trip = parseTrip(file.id, file.file, file.raw);
      paint(trip);
    } catch {
      if (!alive) return;
      showFailure('read');
    }
  }

  stopsUnsub.fn = map.onSelect((pinId) => {
    const item = main.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(pinId)}"]`);
    if (!item) return;
    item.scrollIntoView({ block: 'center' });
    clearStopCurrent();
    item.setAttribute('aria-current', 'true');
  });

  void render();
  const poll = window.setInterval(() => {
    if (alive) void render();
  }, 800);

  return {
    dispose() {
      alive = false;
      window.clearInterval(poll);
      window.clearTimeout(statusTimer);
      toast.remove();
      offLocale();
      offQuery();
      offExport();
      offFiles();
      offClose();
      stopsUnsub.fn();
      tripRouteEpoch += 1;
      map.setRoute([]);
      map.setPins('stop', []);
      closePlace({ focus: false });
      shell.setExportEnabled(false);
    },
  };
}

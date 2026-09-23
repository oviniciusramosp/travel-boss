import type { Shell } from '../app/shell';
import {
  getTravelCity,
  googleMapsUrl,
  pickLocale,
  placeCategoryMeta,
  placeCategoryOrder,
  travelUi,
} from '../catalog';
import type { PlaceCategory } from '../catalog';
import type { MapHandle, MapPin } from '../map/types';
import {
  buildItineraryRoute,
  buildItineraryRoutePreview,
  type PlaceCoord,
} from '../map/itinerary-route';
import { copyTrip, downloadTrip, tripToHtml, tripToMarkdown } from './export';
import { iconLink } from '../ui/controls';
import { row } from '../ui/row';
import { closePlace, onPlaceClose, openPlace, openPlaceId, repaintPlace } from '../views/place-panel';
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

async function loadFiles(): Promise<TripFile[]> {
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
    loadFiles()
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

  queueMicrotask(() => {
    loadFiles()
      .then((files) => {
        if (!alive) return;
        const preferred = files.find((file) => file.id === 'europa') ?? files[0];
        if (preferred) onPick(preferred.id);
      })
      .catch(() => undefined);
  });

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
  const stopsUnsub = { fn: () => {} };
  const offLocale = shell.onLocale(() => {
    if (!alive || !current) return;
    paint(current, main.scrollTop);
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
  const enabledCategories = new Set<PlaceCategory>(placeCategoryOrder);

  function drawTripRoutes() {
    const epoch = ++tripRouteEpoch;
    const coords = new Map<string, PlaceCoord>();
    const ids: string[] = [];
    const legs: { from: string; to: string; mode: 'walk' }[] = [];
    for (const section of main.querySelectorAll<HTMLElement>('.tb-city-section')) {
      if (section.hidden) continue;
      const record = getTravelCity(section.dataset.city ?? '');
      if (!record) continue;
      for (const place of record.places) {
        coords.set(place.id, { id: place.id, lat: place.lat, lng: place.lng });
      }
      for (const day of section.querySelectorAll<HTMLDetailsElement>('details.tb-day')) {
        if (!day.open) continue;
        const stopIds = [...day.querySelectorAll<HTMLElement>('[data-place-id]')]
          .map((node) => node.dataset.placeId)
          .filter((value): value is string => Boolean(value));
        ids.push(...stopIds);
        for (let index = 1; index < stopIds.length; index += 1) {
          const from = stopIds[index - 1];
          const to = stopIds[index];
          if (from && to) legs.push({ from, to, mode: 'walk' });
        }
      }
    }
    map.setRoute(buildItineraryRoutePreview(ids, legs, coords).segments);
    void buildItineraryRoute(ids, legs, coords)
      .then((built) => {
        if (!alive || epoch !== tripRouteEpoch) return;
        map.setRoute(built.segments);
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
    if (alive) void render(true);
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
      showToast(error instanceof Error ? error.message : 'Falha ao copiar', true);
    }
  }

  function paint(trip: Trip, restoreScroll: number | null = null) {
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
        .map((error) => error.message)
        .slice(0, 4)
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
        details.open = dayIndex === 0;
        const dayTitle = document.createElement('summary');
        dayTitle.textContent = day.title;
        details.append(dayTitle);
        const list = document.createElement('ul');
        list.className = 'tb-list tb-list--stops tb-stops';
        for (const stop of day.stops) {
          const place = stop.placeId
            ? record?.places.find((item) => item.id === stop.placeId)
            : undefined;
          const href = stop.href
            ? stop.href
            : stop.placeId
              ? resolveHref(city.slug, stop.placeId)
              : null;
          const missing =
            !href && stop.placeId
              ? pickLocale(locale, {
                  en: `${stop.placeId} not found`,
                  'pt-BR': `${stop.placeId} não encontrado`,
                })
              : '';
          const sub = [stop.note, missing].filter(Boolean).join(' — ');
          const lead = place ? document.createElement('span') : undefined;
          if (lead && place) {
            lead.className = 'tb-cat-dot';
            lead.style.background = placeCategoryMeta[place.category].color;
          }
          const placeId = stop.placeId;
          const item = row({
            time: stop.time,
            lead,
            title: stop.label,
            sub: sub || undefined,
            actions: href
              ? iconLink({
                  icon: 'location_on',
                  label: pickLocale(locale, { en: 'Google Maps', 'pt-BR': 'Google Maps' }),
                  href,
                })
              : undefined,
            data: {
              stop: '',
              hay: `${city.name} ${stop.label} ${stop.note ?? ''} ${stop.placeId ?? ''} ${stop.time ?? ''}`.toLowerCase(),
              ...(stop.placeId ? { placeId: stop.placeId } : {}),
              ...(stop.time ? { stopTime: stop.time } : {}),
              ...(place ? { category: place.category } : {}),
            },
            onSelect:
              placeId && record
                ? () => {
                    const found = record.places.find((entry) => entry.id === placeId);
                    if (!found) return;
                    clearStopCurrent();
                    item.setAttribute('aria-current', 'true');
                    const origin =
                      document.activeElement instanceof HTMLElement ? document.activeElement : null;
                    openPlace(found, record, locale, origin);
                  }
                : undefined,
          });
          list.append(item);
        }
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
    main.scrollTop = restoreScroll ?? 0;
    applyQuery();
    syncView(true);
    shell.setSource(trip.file);
    shell.setExportEnabled(true);
  }

  async function render(keepScroll = false) {
    const scroll = keepScroll ? main.scrollTop : 0;
    try {
      const files = await loadFiles();
      if (!alive) return;
      const file = files.find((item) => item.id === id);
      if (file && file.raw === lastRaw && current) return;
      if (!file) {
        main.replaceChildren(
          emptyNotice('Roteiro removido', 'O arquivo não está mais em content/trips.'),
        );
        main.scrollTop = 0;
        shell.setExportEnabled(false);
        map.setPins('stop', []);
        return;
      }
      lastRaw = file.raw;
      const trip = parseTrip(file.id, file.file, file.raw);
      paint(trip, scroll);
    } catch (error) {
      if (!alive) return;
      const message = error instanceof Error ? error.message : 'Falha ao ler o roteiro';
      main.replaceChildren(emptyNotice(message, undefined, true));
      main.scrollTop = 0;
      shell.setExportEnabled(false);
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
    if (alive) void render(true);
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

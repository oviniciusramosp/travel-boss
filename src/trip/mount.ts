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
import type { Locale, PlaceCategory, TravelPlace } from '../catalog';
import { buildItineraryRoute } from '../map/itinerary-route';
import type { MapHandle, MapPin } from '../map/types';
import { fetchWalkingRoute } from '../map/walk-route';
import { setDocumentTitle } from '../app/router';
import type { TripPush } from './api';
import { changedStopKeys } from './diff';
import { googleDirectionsUrl } from './directions';
import { tripErrorText, warningCopyText, warningCountLabel } from './errors';
import { copyTrip, dayToMarkdown, downloadTrip, tripToHtml, tripToMarkdown } from './export';
import { inlineNodes } from './inline';
import { planHop, previewHop, resolveHopSegments, transferLegs, type RouteHop } from './route';
import { dayKey, dayOpen, shouldRefit, stopKey, type FocusMark } from './view-state';
import { rememberWalk, rememberedWalk } from './walk-memory';
import { iconButton, iconLink } from '../ui/controls';
import { icon } from '../ui/icons';
import { prefersReducedMotion } from '../ui/motion';
import { row } from '../ui/row';
import {
  closePlace,
  onPlaceClose,
  openPlace,
  openPlaceId,
  repaintPlace,
  setPlaceOrigin,
} from '../views/place-panel';
import { parseTrip, type Trip, type TripLeg } from './parse';
import { cityBands, formatTripSummary } from './summary';
import { transferRow } from '../views/transfer-row';

type TripFile = { id: string; file: string; raw: string };

const tripFileListeners = new Set<(event: TripPush) => void>();
let tripHotBound = false;

function onTripFiles(fn: (event: TripPush) => void): () => void {
  tripFileListeners.add(fn);
  if (!tripHotBound && import.meta.hot) {
    tripHotBound = true;
    import.meta.hot.on('tb:trip', (data) => {
      const event = data as TripPush;
      if (!event?.id) return;
      for (const listener of tripFileListeners) listener(event);
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

export async function loadTripFile(id: string): Promise<TripFile | null> {
  const response = await fetch(`/api/trips/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`trip api ${response.status}`);
  const data = (await response.json()) as TripFile;
  if (!data || typeof data.raw !== 'string' || typeof data.id !== 'string') {
    throw new Error('trip api');
  }
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

function appendCityBar(article: HTMLElement, trip: Trip, locale: Locale): void {
  const bands = cityBands(trip, locale);
  if (!bands.length) return;
  const bar = document.createElement('div');
  bar.className = 'tb-span';
  bar.setAttribute('role', 'group');
  bar.setAttribute(
    'aria-label',
    pickLocale(locale, { en: 'Nights by city', 'pt-BR': 'Noites por cidade' }),
  );
  for (const band of bands) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tb-span__city';
    button.dataset.spanCity = band.key;
    button.style.flexGrow = String(band.grow);
    button.setAttribute('aria-label', band.tip);
    button.setAttribute('data-tip', band.tip);
    const name = document.createElement('span');
    name.className = 'tb-span__name';
    name.textContent = band.name;
    button.append(name);
    if (band.dates) {
      const dates = document.createElement('small');
      dates.textContent = band.dates;
      button.append(dates);
    }
    const section = () =>
      article.querySelector<HTMLElement>(`[data-city="${CSS.escape(band.key)}"]`);
    const hot = (on: boolean) => section()?.classList.toggle('is-hot', on);
    button.addEventListener('pointerenter', () => hot(true));
    button.addEventListener('pointerleave', () => hot(false));
    button.addEventListener('focus', () => hot(true));
    button.addEventListener('blur', () => hot(false));
    button.addEventListener('click', () => {
      section()?.scrollIntoView({
        block: 'start',
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    });
    bar.append(button);
  }
  article.append(bar);
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
  onTripFiles((event) => {
    if (event.reason === 'add' || event.reason === 'unlink') refresh();
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
  let previousTrip: Trip | null = null;
  let lastRaw = '';
  let statusTimer = 0;
  let sourceTimer = 0;
  let unmountWarnings = () => {};
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

  function routeHops(): RouteHop[] {
    const trip = current;
    if (!trip) return [];
    const hops: RouteHop[] = [];
    for (const section of main.querySelectorAll<HTMLElement>('.tb-city-section')) {
      if (section.hidden) continue;
      const slug = section.dataset.city ?? '';
      const city = trip.cities.find((item) => (item.slug || item.name) === slug);
      const record = getTravelCity(slug);
      if (!city || !record) continue;
      for (const dayEl of section.querySelectorAll<HTMLDetailsElement>('details.tb-day')) {
        if (!dayEl.open) continue;
        const day = city.days.find(
          (item, index) =>
            dayKey(city.slug || city.name, index, item.title) === dayEl.dataset.dayKey,
        );
        if (!day) continue;
        const stops = day.stops.filter((stop) => !stop.listNote);
        for (let index = 1; index < stops.length; index += 1) {
          const fromStop = stops[index - 1];
          const toStop = stops[index];
          if (!fromStop?.placeId || !toStop?.placeId) continue;
          const from = record.places.find((place) => place.id === fromStop.placeId);
          const to = record.places.find((place) => place.id === toStop.placeId);
          if (!from || !to) continue;
          hops.push({
            from: { id: from.id, lat: from.lat, lng: from.lng },
            to: { id: to.id, lat: to.lat, lng: to.lng },
            ...(fromStop.leg ? { via: fromStop.leg } : {}),
          });
        }
      }
    }
    return hops;
  }

  function neutralColor(): string {
    return (
      getComputedStyle(document.documentElement).getPropertyValue('--color-mid-gray').trim() ||
      '#666666'
    );
  }

  function drawTripRoutes() {
    const epoch = ++tripRouteEpoch;
    const hops = routeHops();
    const color = neutralColor();
    const preview = hops.map((hop) => previewHop(hop, color));
    const known = preview.flatMap((part) => part ?? []);
    if (preview.every((part) => part !== null)) {
      map.setRoute(known);
      return;
    }
    if (known.length) map.setRoute(known);
    void resolveHopSegments(hops, {
      neutralColor: color,
      walk: async (from, to) => {
        const cached = rememberedWalk(from, to);
        if (cached) return cached;
        const route = await fetchWalkingRoute([
          { lat: from.lat, lng: from.lng },
          { lat: to.lat, lng: to.lng },
        ]);
        if (!route || route.latlngs.length < 2) return null;
        rememberWalk(from, to, route.latlngs);
        return route.latlngs;
      },
      catalog: async (leg, from, to) => {
        const fromId = from.id ?? leg.from;
        const toId = to.id ?? leg.to;
        const places = new Map([
          [fromId, { id: fromId, lat: from.lat, lng: from.lng }],
          [toId, { id: toId, lat: to.lat, lng: to.lng }],
        ]);
        const built = await buildItineraryRoute([fromId, toId], [leg], places);
        return built.segments.map((segment) => ({
          mode: segment.mode,
          latlngs: segment.latlngs,
          ...(segment.color ? { color: segment.color } : {}),
        }));
      },
    })
      .then((segments) => {
        if (!alive || epoch !== tripRouteEpoch) return;
        map.setRoute(segments);
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
        const items = [...list.children].filter(
          (node): node is HTMLElement => node instanceof HTMLElement,
        );
        const neighbor = (item: HTMLElement, step: 'prev' | 'next') => {
          let cursor = step === 'prev' ? item.previousElementSibling : item.nextElementSibling;
          while (cursor) {
            if (
              cursor instanceof HTMLElement &&
              cursor.dataset.stop !== undefined &&
              !cursor.classList.contains('tb-transfer')
            ) {
              return cursor;
            }
            cursor = step === 'prev' ? cursor.previousElementSibling : cursor.nextElementSibling;
          }
          return null;
        };
        for (const item of items) {
          if (!item.classList.contains('tb-transfer')) continue;
          const prev = neighbor(item, 'prev');
          const next = neighbor(item, 'next');
          item.hidden = !prev || !next || prev.hidden || next.hidden;
        }
        list.hidden = !items.some((item) => item.dataset.stop !== undefined && !item.hidden);
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

  const offFiles = onTripFiles((event) => {
    if (!alive || event.id !== id) return;
    void render();
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
    const html = tripToHtml(markdown, (placeId) => {
      for (const city of current?.cities ?? []) {
        const href = resolveHref(city.slug, placeId);
        if (href) return href;
      }
      return null;
    });
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
    const dayAction = active.closest<HTMLElement>('[data-day-action]');
    if (dayAction?.dataset.dayAction) {
      const details = dayAction.closest<HTMLDetailsElement>('details.tb-day');
      if (details?.dataset.dayKey) {
        focusMark = {
          kind: 'day-action',
          key: details.dataset.dayKey,
          action: dayAction.dataset.dayAction,
        };
        return;
      }
    }
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
    const span = active.closest<HTMLElement>('[data-span-city]');
    if (span?.dataset.spanCity) {
      focusMark = { kind: 'span', id: span.dataset.spanCity };
      return;
    }
    const city = active.closest<HTMLElement>('[data-city-filter]');
    if (city?.dataset.cityFilter) {
      focusMark = { kind: 'city', id: city.dataset.cityFilter };
      return;
    }
    if (active.closest('[data-warn-copy]')) {
      focusMark = { kind: 'warn-copy' };
      return;
    }
    if (active.closest('[data-warnings]')) focusMark = { kind: 'warn' };
  }

  function restoreFocus() {
    const mark = focusMark;
    if (!mark) return;
    let target: HTMLElement | null = null;
    if (mark.kind === 'day') {
      target = main.querySelector(`details[data-day-key="${CSS.escape(mark.key)}"] > summary`);
    } else if (mark.kind === 'day-action') {
      target = main.querySelector(
        `details[data-day-key="${CSS.escape(mark.key)}"] [data-day-action="${CSS.escape(mark.action)}"]`,
      );
    } else if (mark.kind === 'stop') {
      const row = main.querySelector<HTMLElement>(`[data-stop-key="${CSS.escape(mark.key)}"]`);
      target = mark.action
        ? (row?.querySelector<HTMLElement>(`[data-action="${CSS.escape(mark.action)}"]`) ?? null)
        : (row?.querySelector<HTMLElement>('.tb-row__main') ?? null);
    } else if (mark.kind === 'category') {
      target = main.querySelector(`[data-category="${CSS.escape(mark.id)}"]`);
    } else if (mark.kind === 'city') {
      target = main.querySelector(`[data-city-filter="${CSS.escape(mark.id)}"]`);
    } else if (mark.kind === 'span') {
      target = main.querySelector(`[data-span-city="${CSS.escape(mark.id)}"]`);
    } else if (mark.kind === 'warn') {
      target = main.querySelector('[data-warnings] > button');
    } else {
      target = main.querySelector('[data-warn-copy]');
    }
    target?.focus({ preventScroll: true });
  }

  function flashMs(): number {
    if (prefersReducedMotion()) return 0;
    const raw = getComputedStyle(document.documentElement).getPropertyValue('--dur-slow').trim();
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) return 0;
    return parsed * 4;
  }

  function flashSource(path: string) {
    const source = document.querySelector('.tb-source');
    if (!(source instanceof HTMLElement)) return;
    const ms = flashMs();
    if (ms === 0) return;
    const word = pickLocale(shell.locale(), { en: 'updated', 'pt-BR': 'atualizado' });
    const shown = `${path} · ${word}`;
    source.textContent = shown;
    source.classList.remove('is-updated');
    void source.offsetWidth;
    source.classList.add('is-updated');
    window.clearTimeout(sourceTimer);
    sourceTimer = window.setTimeout(() => {
      source.classList.remove('is-updated');
      if (source.textContent === shown) source.textContent = path;
    }, ms);
  }

  function warningBadge(trip: Trip, locale: ReturnType<Shell['locale']>): HTMLDivElement {
    const wrap = document.createElement('div');
    wrap.className = 'tb-warn';
    wrap.dataset.warnings = '';
    const badge = document.createElement('button');
    badge.type = 'button';
    badge.className = 'tb-warn__badge';
    badge.append(
      icon('warning', { size: 16 }),
      document.createTextNode(warningCountLabel(trip.errors.length, locale)),
    );
    badge.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('div');
    panel.className = 'tb-popover';
    panel.dataset.popover = '';
    panel.hidden = true;
    const list = document.createElement('ul');
    list.className = 'tb-warn-list';
    for (const error of trip.errors) {
      const item = document.createElement('li');
      item.textContent = `${error.line}: ${tripErrorText(error, locale)}`;
      list.append(item);
    }
    const copy = document.createElement('button');
    copy.type = 'button';
    copy.className = 'tb-btn-outline';
    copy.dataset.warnCopy = '';
    copy.append(
      icon('content_copy', { size: 16 }),
      document.createTextNode(
        pickLocale(locale, { en: 'Copy for the LLM', 'pt-BR': 'Copiar para o LLM' }),
      ),
    );
    copy.addEventListener('click', (event) => {
      event.stopPropagation();
      const text = warningCopyText(trip.file, trip.errors, locale);
      void navigator.clipboard.writeText(text).then(
        () => showToast(pickLocale(locale, { en: 'Warnings copied', 'pt-BR': 'Avisos copiados' })),
        () => showToast(pickLocale(locale, { en: 'Could not copy', 'pt-BR': 'Falha ao copiar' }), true),
      );
    });
    panel.append(list, copy);
    wrap.append(badge, panel);

    let hold = false;
    let timer = 0;
    const place = () => {
      const rect = badge.getBoundingClientRect();
      panel.style.left = `${rect.left}px`;
      panel.style.top = `${rect.bottom}px`;
    };
    const show = () => {
      window.clearTimeout(timer);
      panel.hidden = false;
      badge.setAttribute('aria-expanded', 'true');
      place();
    };
    const hide = () => {
      hold = false;
      panel.hidden = true;
      badge.setAttribute('aria-expanded', 'false');
    };
    const hideSoon = () => {
      window.clearTimeout(timer);
      const raw = getComputedStyle(document.documentElement).getPropertyValue('--dur-fast').trim();
      const delay = Number.parseFloat(raw);
      timer = window.setTimeout(() => {
        if (!hold) hide();
      }, Number.isFinite(delay) ? delay : 0);
    };
    badge.addEventListener('click', () => {
      if (panel.hidden) {
        hold = true;
        show();
      } else hide();
    });
    wrap.addEventListener('pointerenter', show);
    wrap.addEventListener('pointerleave', hideSoon);
    const onDoc = (event: PointerEvent) => {
      if (event.target instanceof Node && wrap.contains(event.target)) return;
      hide();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') hold = false;
    };
    document.addEventListener('pointerdown', onDoc);
    window.addEventListener('keydown', onKey);
    unmountWarnings = () => {
      window.clearTimeout(timer);
      document.removeEventListener('pointerdown', onDoc);
      window.removeEventListener('keydown', onKey);
    };
    return wrap;
  }

  function paint(trip: Trip, updated = false) {
    const changed = changedStopKeys(previousTrip, trip);
    const firstPaint = !hasPainted;
    if (!firstPaint) rememberView();
    current = trip;
    const locale = shell.locale();
    main.replaceChildren();

    const openLinkedPlace = (citySlug: string, placeId: string, origin: HTMLElement) => {
      const cityRecord = getTravelCity(citySlug);
      const found = cityRecord?.places.find((entry) => entry.id === placeId);
      if (!cityRecord || !found) return;
      clearStopCurrent();
      const rowEl = main.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(placeId)}"]`);
      rowEl?.setAttribute('aria-current', 'true');
      openPlace(found, cityRecord, locale, origin);
    };

    const article = document.createElement('article');
    article.className = 'tb-doc';
    article.dataset.tripId = trip.id;

    const head = document.createElement('header');
    head.className = 'tb-doc-head';
    const heading = document.createElement('div');
    heading.className = 'tb-doc-heading';
    const title = document.createElement('h1');
    title.className = 'tb-doc-title';
    title.textContent = trip.title;
    heading.append(title);
    const summaryText = formatTripSummary(trip, locale);
    if (summaryText) {
      const summary = document.createElement('p');
      summary.className = 'tb-doc-summary';
      summary.textContent = summaryText;
      heading.append(summary);
    }
    head.append(heading);
    unmountWarnings();
    unmountWarnings = () => {};
    if (trip.errors.length) head.append(warningBadge(trip, locale));
    article.append(head);
    appendCityBar(article, trip, locale);

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
        const dayLabel = document.createElement('span');
        dayLabel.className = 'tb-day-label';
        dayLabel.textContent = day.title;
        const dayActions = document.createElement('span');
        dayActions.className = 'tb-day-actions';
        const dayPoints: MapPin[] = [];
        for (const stop of day.stops) {
          if (stop.listNote || !stop.placeId) continue;
          const found = placeById(city.slug, stop.placeId);
          if (!found) continue;
          dayPoints.push({
            id: found.id,
            lat: found.lat,
            lng: found.lng,
            label: stop.time ? `${stop.time} ${stop.label}` : stop.label,
            color: placeCategoryMeta[found.category].color,
            kind: 'stop',
          });
        }
        const mapsUrl = googleDirectionsUrl(dayPoints, 'transit');
        if (mapsUrl) {
          const link = iconLink({
            icon: 'route',
            label: pickLocale(locale, {
              en: 'Day routes in Google Maps',
              'pt-BR': 'Rotas do dia no Google Maps',
            }),
            href: mapsUrl,
          });
          link.dataset.dayAction = 'route';
          link.addEventListener('click', (event) => event.stopPropagation());
          dayActions.append(link);
        }
        const fitDay = iconButton({
          icon: 'fit_screen',
          label: pickLocale(locale, { en: 'Frame on the map', 'pt-BR': 'Enquadrar no mapa' }),
          size: 'sm',
        });
        fitDay.dataset.dayAction = 'fit';
        fitDay.disabled = dayPoints.length === 0;
        fitDay.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!current || !dayPoints.length) return;
          const restore = stopPins(current, cityFilter, enabledCategories);
          map.setPins('stop', dayPoints);
          map.fit();
          map.setPins('stop', restore);
        });
        const copyDay = iconButton({
          icon: 'content_copy',
          label: pickLocale(locale, { en: 'Copy day (Markdown)', 'pt-BR': 'Copiar dia (Markdown)' }),
          size: 'sm',
        });
        copyDay.dataset.dayAction = 'copy';
        copyDay.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const markdown = dayToMarkdown(day, (placeId) => resolveHref(city.slug, placeId));
          void navigator.clipboard.writeText(markdown).then(
            () =>
              showToast(
                pickLocale(locale, { en: 'Day copied', 'pt-BR': 'Dia copiado' }),
              ),
            () =>
              showToast(
                pickLocale(locale, { en: 'Could not copy', 'pt-BR': 'Falha ao copiar' }),
                true,
              ),
          );
        });
        dayActions.append(fitDay, copyDay);
        dayActions.addEventListener('mousedown', (event) => event.stopPropagation());
        dayActions.addEventListener('click', (event) => event.stopPropagation());
        dayTitle.append(dayLabel, dayActions);
        details.append(dayTitle);
        const list = document.createElement('ul');
        list.className = 'tb-list tb-list--stops tb-stops';
        let previousEnd: { id: string; lat: number; lng: number; leg?: TripLeg } | null = null;
        day.stops.forEach((stop, stopIndex) => {
          const key = stopKey(
            city.slug || city.name,
            dayIndex,
            day.title,
            stopIndex,
            stop.placeId,
            stop.label,
          );
          const markChanged = (node: HTMLElement) => {
            if (!changed.has(key) || prefersReducedMotion()) return;
            node.classList.add('is-changed');
            node.addEventListener('animationend', () => node.classList.remove('is-changed'), {
              once: true,
            });
          };
          if (stop.listNote) {
            const noteItem = document.createElement('li');
            noteItem.className = 'tb-list-note';
            noteItem.dataset.stop = '';
            noteItem.dataset.stopKey = key;
            noteItem.dataset.hay = `${city.name} ${stop.label}`.toLowerCase();
            if (stop.time) {
              const time = document.createElement('span');
              time.className = 'tb-list-note__time';
              time.textContent = stop.time;
              noteItem.append(time);
            }
            noteItem.append(
              ...inlineNodes(stop.label, {
                onPlace: (placeId, origin) => openLinkedPlace(city.slug, placeId, origin),
              }),
            );
            markChanged(noteItem);
            list.append(noteItem);
            return;
          }
          const place = stop.placeId ? placeById(city.slug, stop.placeId) : undefined;
          const missingPlace = Boolean(stop.placeId && !place);
          const href = stop.href
            ? stop.href
            : place
              ? resolveHref(city.slug, place.id)
              : null;
          const point = place ? { id: place.id, lat: place.lat, lng: place.lng } : null;
          const directions =
            previousEnd && point
              ? googleDirectionsUrl(
                  [previousEnd, point],
                  planHop({
                    from: previousEnd,
                    to: point,
                    ...(previousEnd.leg ? { via: previousEnd.leg } : {}),
                  }).kind === 'walk'
                    ? 'walk'
                    : 'transit',
                )
              : null;
          previousEnd = point ? { ...point, ...(stop.leg ? { leg: stop.leg } : {}) } : null;
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
              stopKey: key,
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
          if (stop.note && !missingPlace) {
            item.querySelector('.tb-row__sub')?.replaceChildren(
              ...inlineNodes(stop.note, {
                onPlace: (placeId, origin) => openLinkedPlace(city.slug, placeId, origin),
              }),
            );
          }
          markChanged(item);
          list.append(item);
          const next = day.stops.slice(stopIndex + 1).find((item) => !item.listNote);
          const nextPlace = next?.placeId ? placeById(city.slug, next.placeId) : undefined;
          const legs =
            place && nextPlace
              ? transferLegs({
                  from: { id: place.id, lat: place.lat, lng: place.lng },
                  to: { id: nextPlace.id, lat: nextPlace.lat, lng: nextPlace.lng },
                  ...(stop.leg ? { via: stop.leg } : {}),
                })
              : stop.leg
                ? [stop.leg]
                : [];
          for (const leg of legs) {
            const transfer = transferRow(leg, locale);
            markChanged(transfer);
            list.append(transfer);
          }
        });
        if (day.stops.length) details.append(list);
        for (const note of day.notes) {
          const paragraph = document.createElement('p');
          paragraph.className = 'tb-doc-note';
          paragraph.append(
            ...inlineNodes(note, {
              onPlace: (placeId, origin) => openLinkedPlace(city.slug, placeId, origin),
            }),
          );
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
    if (updated) flashSource(trip.file);
    previousTrip = trip;
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
      const file = await loadTripFile(id);
      if (!alive) return;
      if (file && file.raw === lastRaw && current && !failure) return;
      if (!file) {
        showFailure('missing');
        return;
      }
      failure = null;
      const updated = Boolean(current) && file.raw !== lastRaw;
      lastRaw = file.raw;
      const trip = parseTrip(file.id, file.file, file.raw);
      paint(trip, updated);
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
  const onVisible = () => {
    if (!alive || document.visibilityState === 'hidden') return;
    void render();
  };
  document.addEventListener('visibilitychange', onVisible);
  window.addEventListener('focus', onVisible);

  return {
    dispose() {
      alive = false;
      unmountWarnings();
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
      window.clearTimeout(statusTimer);
      window.clearTimeout(sourceTimer);
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

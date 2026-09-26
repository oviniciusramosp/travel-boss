import type { Shell } from '../app/shell';
import {
  estimateLegDurationMin,
  getTravelCity,
  googleMapsUrl,
  pickLocale,
  placeCategoryMeta,
  placePinIconHtml,
  travelUi,
} from '../catalog';
import type { ItineraryLegDef, Locale, TravelPlace } from '../catalog';
import { buildItineraryRoute } from '../map/itinerary-route';
import type { MapHandle, MapPin } from '../map/types';
import { fetchDrivingRoute, fetchWalkingRoute, peekWalkingRoute } from '../map/walk-route';
import { setDocumentTitle } from '../app/router';
import { readPeriods, writePeriods } from '../app/store';
import type { TripPush } from './api';
import { changedStopKeys } from './diff';
import { googleDirectionsUrl, MAPS_MAX_POINTS } from './directions';
import { tripErrorText, warningCopyText, warningCountLabel } from './errors';
import { copyTrip, dayToMarkdown, downloadTrip, tripToHtml, tripToMarkdown } from './export';
import { daysOnDate, nearestTripDate, todayIso, tripDates, type DatedDay } from './calendar';
import { formatDayTitle } from './dates';
import {
  dateBudget,
  dayPeriods,
  hopRails,
  pastPeriods,
  periodSections,
  zonedStamp,
  type Period,
  type Rail,
} from './day-plan';
import { inlineNodes } from './inline';
import { editableNote, sendPatch, type NoteEditorOptions, type NoteKind, type SeenLine } from './note-edit';
import {
  dateStops,
  planHop,
  previewHop,
  resolveHopSegments,
  transferLegs,
  type DateStop,
  type RouteHop,
} from './route';
import { shouldRefit, stopKey, type FocusMark } from './view-state';
import { rememberWalk, rememberedWalk } from './walk-memory';
import { chipTone, circleInk } from '../ui/contrast';
import { iconButton } from '../ui/controls';
import { el } from '../ui/dom';
import { mapsIconLink } from '../ui/maps-icon';
import { icon } from '../ui/icons';
import { cssToken, prefersReducedMotion } from '../ui/motion';
import { row } from '../ui/row';
import {
  closePlace,
  onPlaceClose,
  openPlace,
  openPlaceId,
  repaintPlace,
  setPlaceOrigin,
} from '../views/place-panel';
import { parseTrip, type Trip, type TripCity, type TripLeg, type TripStop } from './parse';
import { formatTripNavLabel, formatTripPanelTitle, formatTripSummary } from './summary';
import { dateBudgetCards, periodLabel, slotSwitch, stopCountLabel } from '../views/timeline';
import { timeZoneForCity } from '../views/open-now';
import { loadForecast, mergeWeather, peekForecast, weatherBetween, weatherLook, type Weather } from './weather';
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

/** Filled category dot. The glyph stays solid, same as a map pin. */
function stopPin(place: TravelPlace): HTMLSpanElement {
  const lead = document.createElement('span');
  lead.className = 'tb-stop-pin';
  lead.style.setProperty('--pin-color', placeCategoryMeta[place.category].color);
  if (circleInk(placeCategoryMeta[place.category].color) === 'on-ink') lead.classList.add('is-on-ink');
  const markup = document.createElement('template');
  markup.innerHTML = placePinIconHtml(place.category, place.subcategories);
  lead.append(markup.content);
  lead.querySelector('.material-symbols-rounded')?.classList.add('is-16');
  return lead;
}

function walkColor(): string {
  return cssToken('--color-walk', '#008fff');
}

/** Empty until a forecast reaches the date. */
function weatherSlot(key: string): HTMLSpanElement {
  const slot = el('span', 'tb-weather');
  slot.dataset.weather = key;
  slot.setAttribute('role', 'img');
  slot.hidden = true;
  return slot;
}

/** Glyph and temperature; rain when it is likely. The tip has the rest. */
function fillWeather(slot: HTMLElement, weather: Weather | null, night: boolean, range: boolean, locale: Locale): void {
  slot.hidden = !weather;
  if (!weather) {
    slot.replaceChildren();
    return;
  }
  const look = weatherLook(weather.code, night);
  slot.dataset.tone = look.tone;
  const low = Math.round(weather.min);
  const high = Math.round(weather.max);
  const temp = range && low !== high ? `${low}–${high}°` : `${Math.round((weather.min + weather.max) / 2)}°`;
  const rain = Math.round(weather.rain);
  slot.replaceChildren(icon(look.icon, { size: 16, fill: true }), document.createTextNode(rain >= 30 ? `${temp} · ${rain}%` : temp));
  const words = pickLocale(locale, { en: 'rain', 'pt-BR': 'chuva' });
  const tip = `${pickLocale(locale, look.label)} · ${low}–${high}° · ${words} ${rain}% · Open-Meteo`;
  slot.setAttribute('data-tip', tip);
  slot.setAttribute('aria-label', tip);
}

/** Half of a leg's rail: `is-above` runs into its icon, `is-below` leaves it. */
function railHalf(side: 'is-above' | 'is-below', rail: Rail): HTMLSpanElement {
  const half = el('span', `tb-timeline__rail ${side}`);
  half.dataset.rail = rail.mode;
  half.style.setProperty('--line-color', rail.color);
  return half;
}

/** Period of each row. The lunch and dinner stops split the day; see `dayPeriods`. */
function datePeriods(rows: readonly DateStop[]): (Period | null)[] {
  return dayPeriods(
    rows.map((row) => {
      const stop = row.dated.day.stops[row.stopIndex];
      return { time: stop?.time, text: `${stop?.label ?? ''} ${stop?.note ?? ''}`, listNote: stop?.listNote };
    }),
  );
}

/** Stops of the periods on the map. Past the Maps limit the label says how many go. */
function paintDayMaps(link: HTMLAnchorElement, points: { lat: number; lng: number }[], locale: Locale): void {
  const url = googleDirectionsUrl(points, 'transit');
  const base = pickLocale(locale, { en: 'Open route in Google Maps', 'pt-BR': 'Abrir rota no Google Maps' });
  const cut = pickLocale(locale, {
    en: `${MAPS_MAX_POINTS} of ${points.length} stops`,
    'pt-BR': `${MAPS_MAX_POINTS} de ${points.length} paradas`,
  });
  const label = points.length > MAPS_MAX_POINTS ? `${base} · ${cut}` : base;
  link.setAttribute('aria-label', label);
  link.setAttribute('data-tip', label);
  if (url) {
    link.href = url;
    link.removeAttribute('aria-disabled');
    link.removeAttribute('tabindex');
  } else {
    link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    link.tabIndex = -1;
  }
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

function cityDisplayName(city: TripCity, locale: Locale): string {
  const record = getTravelCity(city.slug);
  return record ? pickLocale(locale, record.name) : city.name;
}

function clearStopCurrent(): void {
  document.querySelectorAll('[data-stop][aria-current]').forEach((node) => {
    node.removeAttribute('aria-current');
  });
}

export function mountTripNav(
  el: HTMLElement,
  shell: Shell,
  onPick: (id: string) => void,
): { setActive(id: string | null): void } {
  let active: string | null = null;
  let alive = true;
  let shown: TripFile[] = [];
  const buttons = new Map<string, HTMLButtonElement>();

  const paint = (files: TripFile[]) => {
    shown = files;
    el.replaceChildren();
    buttons.clear();
    for (const file of files) {
      const trip = parseTrip(file.id, file.file, file.raw);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'tb-nav';
      const label = document.createElement('span');
      label.className = 'tb-nav-label';
      label.textContent = formatTripNavLabel(trip, shell.locale());
      button.append(icon('route', { fill: true, size: 16 }), label);
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
  shell.onLocale(() => paint(shown));

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
    map.setOverview(null);
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
    toast.textContent = message;
    toast.classList.toggle('tb-error', error);
    toast.hidden = false;
    if (error) return;
    statusTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2000);
  };
  /** A note editor is open. The document repaints when it closes, not under it. */
  let editing = false;
  const onEditing = (open: boolean) => {
    editing = open;
    if (!open) void render();
  };
  /** The file keeps its text. The user's text goes to the clipboard, or into the toast. */
  const noteFailed = (reason: 'conflict' | 'error', text: string) => {
    const locale = shell.locale();
    const why =
      reason === 'conflict'
        ? pickLocale(locale, {
            en: 'Not saved: that line changed in the file.',
            'pt-BR': 'Não salvou: essa linha mudou no arquivo.',
          })
        : pickLocale(locale, { en: 'Could not save.', 'pt-BR': 'Falha ao salvar.' });
    // A failed delete has no text to keep, and must not wipe the clipboard.
    if (!text) {
      showToast(why, true);
      return;
    }
    void navigator.clipboard.writeText(text).then(
      () =>
        showToast(`${why} ${pickLocale(locale, { en: 'Your text is on the clipboard.', 'pt-BR': 'Seu texto está na área de transferência.' })}`, true),
      () => showToast(`${why} ${pickLocale(locale, { en: 'Your text:', 'pt-BR': 'Seu texto:' })} ${text}`, true),
    );
  };
  let tripRouteEpoch = 0;
  let ignoreDateToggle = false;
  let pinPick = false;
  let routeAbort: AbortController | null = null;
  let hasPainted = false;
  let openKeys = new Set<string>();
  let focusMark: FocusMark | null = null;
  let currentStopKey: string | null = null;
  let scrollTop = 0;
  let seenPinIds = new Set<string>();
  /** Dates whose card button hid the route. Opening the card shows it again. */
  const routeHidden = new Set<string>();
  /** Folded and switched periods, `date:period`. Only what the user touched; saved per trip. */
  const periodPrefs = readPeriods(id);

  /** Rows of a date, their periods, and the periods already over on the city's clock. */
  function datePlan(days: readonly DatedDay[], date: string) {
    const rows = dateStops(days);
    const periods = datePeriods(rows);
    // ponytail: the clock of the date's first city. A date across time zones uses where it starts.
    const now = zonedStamp(new Date(), timeZoneForCity(days[0]?.city.slug ?? ''));
    const times = rows.map((row) => row.dated.day.stops[row.stopIndex]?.time);
    return { rows, periods, past: pastPeriods(date, times, periods, now) };
  }

  /** On the map unless switched off. A period already over starts off. */
  function periodOn(date: string, period: Period, past: ReadonlySet<Period>): boolean {
    return periodPrefs[`${date}:${period}`]?.on ?? !past.has(period);
  }

  function savePeriod(date: string, period: Period, change: { open?: boolean; on?: boolean }): void {
    const key = `${date}:${period}`;
    periodPrefs[key] = { ...periodPrefs[key], ...change };
    writePeriods(id, periodPrefs);
  }

  function openDate(): string | null {
    return main.querySelector<HTMLDetailsElement>('details.tb-date[open]')?.dataset.date ?? null;
  }

  /** The open date, unless its card hid the route. */
  function routedDate(): string | null {
    const date = openDate();
    return date && !routeHidden.has(date) ? date : null;
  }

  /** Catalog stops of a date in order. `on` is false while their period is off the map. */
  function datePlaces(trip: Trip, date: string): { row: DateStop; place: TravelPlace; on: boolean }[] {
    const { rows, periods, past } = datePlan(daysOnDate(trip, date), date);
    return rows.flatMap((row, index) => {
      const stop = row.dated.day.stops[row.stopIndex];
      if (!stop || stop.listNote || !stop.placeId) return [];
      const place = placeById(row.dated.city.slug, stop.placeId);
      const period = periods[index];
      return place ? [{ row, place, on: !period || periodOn(date, period, past) }] : [];
    });
  }

  /** Stops of the routed date, including the train that leaves one city for the next. */
  function routeHops(): RouteHop[] {
    const trip = current;
    const date = routedDate();
    if (!trip || !date) return [];
    const hops: RouteHop[] = [];
    let previous: { id: string; lat: number; lng: number; leg?: TripLeg } | null = null;
    for (const { row, place, on } of datePlaces(trip, date)) {
      // An off period breaks the chain, so the route never bridges it.
      if (!on) {
        previous = null;
        continue;
      }
      const point = { id: place.id, lat: place.lat, lng: place.lng };
      if (previous) {
        hops.push({
          from: { id: previous.id, lat: previous.lat, lng: previous.lng },
          to: point,
          ...(previous.leg ? { via: previous.leg } : {}),
        });
      }
      previous = { ...point, ...(row.depart ? { leg: row.depart } : {}) };
    }
    return hops;
  }

  /** Stops whose period is on the map. */
  function datedPoints(trip: Trip, date: string): { lat: number; lng: number }[] {
    return datePlaces(trip, date).flatMap(({ place, on }) => (on ? [{ lat: place.lat, lng: place.lng }] : []));
  }

  function catalogPins(trip: Trip): MapPin[] {
    const locale = shell.locale();
    const date = routedDate();
    const numbers = new Map<string, number>();
    if (date) {
      for (const { place, on } of datePlaces(trip, date)) {
        if (on && !numbers.has(place.id)) numbers.set(place.id, numbers.size + 1);
      }
    }
    const pins: MapPin[] = [];
    const seen = new Set<string>();
    for (const city of trip.cities) {
      const record = getTravelCity(city.slug);
      if (!record) continue;
      for (const place of record.places) {
        if (seen.has(place.id)) continue;
        if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) continue;
        seen.add(place.id);
        const number = numbers.get(place.id);
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
    }
    return pins;
  }

  function setDayLayer(on: boolean) {
    const host = document.querySelector('.tb-map');
    if (!(host instanceof HTMLElement)) return;
    host.classList.toggle('is-day-layer', on);
    host.classList.remove('is-trip');
  }

  function frameNearest(trip: Trip) {
    const date = nearestTripDate(
      tripDates(trip).map((section) => section.date),
      todayIso(),
    );
    if (!date) return;
    const points: { lat: number; lng: number }[] = [];
    const seen = new Set<string>();
    for (const dated of daysOnDate(trip, date)) {
      const slug = dated.city.slug;
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const record = getTravelCity(slug);
      if (!record || !Number.isFinite(record.lat) || !Number.isFinite(record.lng)) continue;
      points.push({ lat: record.lat, lng: record.lng });
    }
    if (points.length) map.frame(points, 12);
  }

  function neutralColor(): string {
    return cssToken('--color-mid-gray', '#666666');
  }

  /** Stop, the points a catalog walk must pass, stop. */
  function walkPoints(
    from: { lat: number; lng: number },
    to: { lat: number; lng: number },
    through: readonly [number, number][] = [],
  ): { lat: number; lng: number }[] {
    return [{ lat: from.lat, lng: from.lng }, ...through.map(([lat, lng]) => ({ lat, lng })), { lat: to.lat, lng: to.lng }];
  }

  function drawTripRoutes() {
    const epoch = ++tripRouteEpoch;
    routeAbort?.abort();
    const controller = new AbortController();
    routeAbort = controller;
    const signal = controller.signal;
    const hops = routeHops();
    for (const hop of hops) {
      const plan = planHop(hop);
      if (plan.kind !== 'walk') continue;
      if (rememberedWalk(hop.from, hop.to)) continue;
      const cached = peekWalkingRoute(walkPoints(hop.from, hop.to, plan.through));
      if (cached && cached.latlngs.length >= 2) rememberWalk(hop.from, hop.to, cached.latlngs);
    }
    const color = neutralColor();
    const preview = hops.map((hop) => previewHop(hop, color));
    const known = preview.flatMap((part) => part ?? []);
    if (preview.every((part) => part !== null)) {
      map.setRoute(known);
      return;
    }
    void resolveHopSegments(hops, {
      neutralColor: color,
      onUpdate: (segments) => {
        if (!alive || epoch !== tripRouteEpoch) return;
        map.setRoute([...segments]);
      },
      walk: async (from, to, through) => {
        const cached = rememberedWalk(from, to);
        if (cached) return cached;
        const route = await fetchWalkingRoute(walkPoints(from, to, through), signal);
        if (!route || route.latlngs.length < 2) return null;
        rememberWalk(from, to, route.latlngs);
        return route.latlngs;
      },
      drive: async (from, to) => {
        const route = await fetchDrivingRoute(
          [
            { lat: from.lat, lng: from.lng },
            { lat: to.lat, lng: to.lng },
          ],
          signal,
        );
        if (!route || route.latlngs.length < 2) return null;
        return route.latlngs;
      },
      catalog: async (leg, from, to) => {
        const fromId = from.id ?? leg.from;
        const toId = to.id ?? leg.to;
        const places = new Map([
          [fromId, { id: fromId, lat: from.lat, lng: from.lng }],
          [toId, { id: toId, lat: to.lat, lng: to.lng }],
        ]);
        const built = await buildItineraryRoute([fromId, toId], [leg], places, {
          signal,
          walkMode: 'osrm',
        });
        return built.segments.map((segment) => ({
          mode: segment.mode,
          latlngs: segment.latlngs,
          ...(segment.color ? { color: segment.color } : {}),
          ...(segment.lineId ? { lineId: segment.lineId } : {}),
          ...(segment.fromId ? { fromId: segment.fromId } : {}),
          ...(segment.toId ? { toId: segment.toId } : {}),
          ...(segment.hopIndex != null ? { hopIndex: segment.hopIndex } : {}),
          ...(segment.walkIndex != null ? { walkIndex: segment.walkIndex } : {}),
        }));
      },
    })
      .then((segments) => {
        if (!alive || epoch !== tripRouteEpoch) return;
        map.setRoute(segments);
      })
      .catch(() => undefined);
  }

  /** Route toggle and day Maps link, updated in place. */
  function syncDayChrome(trip: Trip) {
    const locale = shell.locale();
    const routed = routedDate();
    main.querySelectorAll<HTMLDetailsElement>('details.tb-date').forEach((card) => {
      const date = card.dataset.date;
      if (!date) return;
      card.querySelector('[data-day-action="route"]')?.setAttribute('aria-pressed', String(date === routed));
      const link = card.querySelector<HTMLAnchorElement>('[data-day-action="maps"]');
      if (link) paintDayMaps(link, datedPoints(trip, date), locale);
    });
  }

  function syncView(fit: boolean) {
    const trip = current;
    if (!trip) return;
    const date = routedDate();
    const pins = catalogPins(trip);
    map.setCities([]);
    map.setOverview(null);
    map.hoverOverview(null);
    map.setPins('place', pins);
    map.setPins('stop', []);
    map.setPins('hotel', []);
    setDayLayer(Boolean(date));
    syncDayChrome(trip);
    seenPinIds = new Set(pins.map((pin) => pin.id));
    if (date) {
      drawTripRoutes();
      if (fit) {
        const points = datedPoints(trip, date);
        if (points.length) map.frame(points, 13);
      }
    } else {
      tripRouteEpoch += 1;
      routeAbort?.abort();
      map.setRoute([]);
      if (fit) frameNearest(trip);
    }
    const openId = openPlaceId();
    if (!openId || !trip) return;
    const visible = trip.cities.some((city) => {
      const record = getTravelCity(city.slug);
      const place = record?.places.find((item) => item.id === openId);
      if (!place) return false;
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
    main.querySelectorAll<HTMLDetailsElement>('details.tb-date').forEach((details) => {
      if (details.open && details.dataset.date) keys.add(details.dataset.date);
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
      const host = dayAction.closest<HTMLElement>('[data-day-key]');
      if (host?.dataset.dayKey) {
        focusMark = {
          kind: 'day-action',
          key: host.dataset.dayKey,
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
    const day = active.closest<HTMLDetailsElement>('details.tb-date');
    if (day?.dataset.date && active.closest('summary')) {
      focusMark = { kind: 'day', key: day.dataset.date };
      return;
    }
    const category = active.closest<HTMLElement>('[data-category]');
    if (category?.dataset.category) {
      focusMark = { kind: 'category', id: category.dataset.category };
      return;
    }
    const cityLink = active.closest<HTMLElement>('[data-city-link]');
    if (cityLink?.dataset.cityLink && cityLink.dataset.cityAction) {
      focusMark = {
        kind: 'city-link',
        city: cityLink.dataset.cityLink,
        action: cityLink.dataset.cityAction,
      };
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
      target = main.querySelector(`details[data-date="${CSS.escape(mark.key)}"] > summary`);
    } else if (mark.kind === 'day-action') {
      target = main.querySelector(
        `[data-day-key="${CSS.escape(mark.key)}"] [data-day-action="${CSS.escape(mark.action)}"]`,
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
    } else if (mark.kind === 'city-link') {
      target = main.querySelector(
        `[data-city-link="${CSS.escape(mark.city)}"][data-city-action="${CSS.escape(mark.action)}"]`,
      );
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

  function releaseLeg(): void {
    main.querySelectorAll<HTMLElement>('.tb-transfer[aria-pressed="true"]').forEach((node) => {
      node.setAttribute('aria-pressed', 'false');
      node.classList.remove('is-hot');
    });
    map.hoverLeg(null);
  }

  /** After a hover, the map goes back to the pressed leg, or to none. */
  function restorePressedLeg(): void {
    const pressed = main.querySelector<HTMLElement>('.tb-transfer[aria-pressed="true"]');
    const from = pressed?.dataset.legFrom;
    const to = pressed?.dataset.legTo;
    if (!pressed || !from || !to) {
      map.hoverLeg(null);
      return;
    }
    const hop = pressed.dataset.legHop;
    const walk = pressed.dataset.legWalk;
    map.hoverLeg(from, to, {
      mode: pressed.dataset.legMode === 'walk' ? 'walk' : 'transit',
      ...(hop ? { hop: Number(hop) } : {}),
      ...(walk ? { walk: Number(walk) } : {}),
    });
  }

  function armTransfer(transfer: HTMLElement, fromId: string, toId: string, hop?: number): void {
    const mode = transfer.dataset.legMode === 'walk' ? 'walk' : 'transit';
    transfer.dataset.legFrom = fromId;
    transfer.dataset.legTo = toId;
    transfer.dataset.legMode = mode;
    if (hop != null) transfer.dataset.legHop = String(hop);
    // One walk of a train leg lights on its own: to the station, between lines, or to the stop.
    const walkRaw = transfer.dataset.legWalk;
    const target: { mode: 'walk' | 'transit'; hop?: number; walk?: number } = {
      mode,
      ...(hop != null ? { hop } : {}),
      ...(walkRaw ? { walk: Number(walkRaw) } : {}),
    };
    transfer.role = 'button';
    transfer.tabIndex = 0;
    transfer.setAttribute('aria-pressed', 'false');
    const activate = () => {
      const on = transfer.getAttribute('aria-pressed') === 'true';
      releaseLeg();
      closePlace({ focus: false });
      if (on) return;
      transfer.setAttribute('aria-pressed', 'true');
      transfer.classList.add('is-hot');
      map.hoverLeg(fromId, toId, { ...target, frame: true });
    };
    // Hover lights the leg the way hovering the line on the map does. No camera move.
    const preview = (on: boolean) => {
      transfer.classList.toggle('is-hot', on || transfer.getAttribute('aria-pressed') === 'true');
      if (on) map.hoverLeg(fromId, toId, target);
      else restorePressedLeg();
    };
    transfer.addEventListener('pointerenter', () => preview(true));
    transfer.addEventListener('pointerleave', () => preview(false));
    transfer.addEventListener('focus', () => preview(true));
    transfer.addEventListener('blur', () => preview(false));
    transfer.addEventListener('click', (event) => {
      event.stopPropagation();
      activate();
    });
    transfer.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      activate();
    });
  }

  /** Forecast per period, on the hours of its stops, and the day as their sum. */
  function paintWeather(trip: Trip) {
    const locale = shell.locale();
    for (const section of tripDates(trip)) {
      const card = main.querySelector<HTMLElement>(`details.tb-date[data-date="${CSS.escape(section.date)}"]`);
      if (!card) continue;
      const { rows, periods } = datePlan(section.cities.flatMap((group) => group.days), section.date);
      const parts = periodSections(periods).map(({ period, rows: indexes }) => {
        const first = rows[indexes[0] ?? -1];
        const record = first ? getTravelCity(first.dated.city.slug) : undefined;
        const hours = record ? peekForecast(record.lat, record.lng) : null;
        const times = indexes.flatMap((index) => {
          const row = rows[index];
          const time = row?.dated.day.stops[row.stopIndex]?.time;
          return time ? [time] : [];
        });
        // A day without times reads the daylight hours.
        const weather = hours ? weatherBetween(hours, section.date, times[0] ?? '08:00', times.at(-1) ?? '20:00') : null;
        return { period, weather };
      });
      for (const { period, weather } of parts) {
        if (!period) continue;
        const slot = card.querySelector<HTMLElement>(`.tb-period[data-period="${period}"] [data-weather]`);
        if (slot) fillWeather(slot, weather, period === 'evening', false, locale);
      }
      const slot = card.querySelector<HTMLElement>('[data-weather="day"]');
      if (slot) fillWeather(slot, mergeWeather(parts.map((part) => part.weather)), false, true, locale);
    }
  }

  /** One request per city; each answer repaints the forecast in place. */
  function refreshWeather(trip: Trip) {
    const seen = new Set<string>();
    for (const city of trip.cities) {
      const record = getTravelCity(city.slug);
      if (!record || seen.has(city.slug)) continue;
      seen.add(city.slug);
      void loadForecast(record.lat, record.lng, timeZoneForCity(city.slug)).then(() => {
        if (alive && current) paintWeather(current);
      });
    }
  }

  /**
   * Morning, afternoon or evening: Maps link, label, count and map switch over its rows.
   * Folded until the user opens it. What they fold or switch is saved.
   */
  function periodBlock(
    date: string,
    period: Period,
    rows: DateStop[],
    list: HTMLOListElement,
    past: ReadonlySet<Period>,
    locale: Locale,
  ): HTMLDetailsElement {
    const block = el('details', 'tb-period');
    block.dataset.period = period;
    block.open = periodPrefs[`${date}:${period}`]?.open ?? false;
    block.addEventListener('toggle', () => savePeriod(date, period, { open: block.open }));
    const on = periodOn(date, period, past);
    block.classList.toggle('is-off-map', !on);
    const stops = rows.flatMap((row) => {
      const stop = row.dated.day.stops[row.stopIndex];
      return stop && !stop.listNote ? [{ slug: row.dated.city.slug, stop }] : [];
    });
    const points = stops.flatMap(({ slug, stop }) => {
      const place = stop.placeId ? placeById(slug, stop.placeId) : undefined;
      return place ? [{ lat: place.lat, lng: place.lng }] : [];
    });
    const maps = mapsIconLink({
      size: 'sm',
      href: googleDirectionsUrl(points, 'transit'),
      label: pickLocale(locale, travelUi.itineraryOpenGoogleMapsPeriod),
    });
    maps.dataset.dayAction = `maps-${period}`;
    const toggle = slotSwitch(on, period, locale, (next) => {
      savePeriod(date, period, { on: next });
      block.classList.toggle('is-off-map', !next);
      if (openDate() === date) syncView(false);
    });
    toggle.dataset.dayAction = `period-${period}`;
    const chevron = icon('expand_more', { size: 18 });
    chevron.classList.add('tb-period__chevron');
    const head = el('summary', 'tb-period__head');
    head.append(
      maps,
      el('span', 'tb-period__label', periodLabel(period, locale)),
      el('span', 'tb-period__count', String(stops.length)),
      weatherSlot(period),
      toggle,
      chevron,
    );
    block.append(head, list);
    return block;
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
      openPlace(found, cityRecord, locale, origin, {
        maps: googleMapsUrl(found, cityRecord),
      });
    };

    const rawLines = lastRaw.split(/\r?\n/);
    const lineAt = (line: number): SeenLine => ({ line, raw: rawLines[line - 1] ?? '' });
    const editNote = (
      node: HTMLElement,
      kind: NoteKind,
      text: string,
      at: SeenLine | null,
      slug: string,
      more: Partial<NoteEditorOptions> = {},
    ) =>
      editableNote(node, {
        kind,
        text,
        at,
        label: pickLocale(locale, { en: 'Note', 'pt-BR': 'Anotação' }),
        render: (value) =>
          inlineNodes(value, { onPlace: (placeId, origin) => openLinkedPlace(slug, placeId, origin) }),
        save: (patch) => sendPatch(id, patch),
        onEditing,
        onFail: noteFailed,
        ...more,
      });

    /** The stop's comments go in `host`. Returns the button that adds one. */
    const comments = (host: HTMLElement, stop: TripStop, slug: string): HTMLButtonElement => {
      const list = el('ul', 'tb-comments');
      const entry = (line: SeenLine | null, text: string) => {
        const item = el('li', 'tb-comment');
        const body = el('span', 'tb-comment__text');
        const remove = iconButton({
          icon: 'delete',
          label: pickLocale(locale, { en: 'Delete comment', 'pt-BR': 'Apagar comentário' }),
          size: 'sm',
        });
        item.append(icon('chat_bubble', { size: 16 }), body, remove);
        list.append(item);
        const editor = editNote(body, 'comment', text, line, slug, {
          parent: lineAt(stop.line),
          label: pickLocale(locale, { en: 'Comment for Claude', 'pt-BR': 'Comentário para o Claude' }),
          placeholder: pickLocale(locale, { en: 'Comment for Claude…', 'pt-BR': 'Comentário para o Claude…' }),
          onClose: (saved) => {
            if (!saved) item.remove();
          },
        });
        remove.addEventListener('click', () => editor.remove());
        return editor;
      };
      for (const comment of stop.comments ?? []) entry(lineAt(comment.line), comment.text);
      // Before the actions, so Tab reaches the comments first.
      const actions = host.querySelector(':scope > .tb-row__actions');
      if (actions) actions.before(list);
      else host.append(list);
      const add = iconButton({
        icon: 'add_comment',
        label: pickLocale(locale, { en: 'Add comment', 'pt-BR': 'Adicionar comentário' }),
        size: 'sm',
      });
      add.dataset.action = 'comment';
      add.addEventListener('click', (event) => {
        event.stopPropagation();
        entry(null, '').edit();
      });
      return add;
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
    title.textContent = formatTripPanelTitle(trip, locale);
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

    for (const section of tripDates(trip)) {
      const date = section.date;
      const details = document.createElement('details');
      details.className = 'tb-date';
      details.dataset.date = date;
      details.dataset.dayKey = date;
      details.open = !firstPaint && openKeys.has(date);
      const daysHere = section.cities.flatMap((group) => group.days);
      const { rows, periods, past } = datePlan(daysHere, date);
      const placesHere = datePlaces(trip, date).map(({ place }) => place);
      const names: string[] = [];
      for (const group of section.cities) {
        const name = cityDisplayName(group.city, locale);
        if (name && !names.includes(name)) names.push(name);
      }
      const stopCount = rows.filter((entry) => {
        const stop = entry.dated.day.stops[entry.stopIndex];
        return Boolean(stop && !stop.listNote);
      }).length;
      const summary = el('summary', 'tb-date__head');
      const heading = el('span', 'tb-date__heading');
      const meta = el(
        'span',
        'tb-date__meta',
        [names.join(' → '), stopCountLabel(stopCount, locale)].filter(Boolean).join(' · '),
      );
      meta.append(weatherSlot('day'));
      heading.append(el('span', 'tb-date__title', formatDayTitle(date, locale)), meta);
      const routeToggle = iconButton({
        icon: 'route',
        label: pickLocale(locale, { en: 'Show route on map', 'pt-BR': 'Mostrar rota no mapa' }),
        pressed: false,
        size: 'sm',
      });
      routeToggle.dataset.dayAction = 'route';
      routeToggle.disabled = placesHere.length === 0;
      routeToggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        // A closed card opens with its route on. The toggle listener draws it.
        if (!details.open) {
          details.open = true;
          return;
        }
        if (routeHidden.delete(date)) {
          syncView(true);
          return;
        }
        routeHidden.add(date);
        syncView(false);
      });
      const dayMaps = mapsIconLink({ badge: true, size: 'sm', label: '' });
      dayMaps.dataset.dayAction = 'maps';
      paintDayMaps(dayMaps, datedPoints(trip, date), locale);
      const copyDay = iconButton({
        icon: 'content_copy',
        label: pickLocale(locale, { en: 'Copy day (Markdown)', 'pt-BR': 'Copiar dia (Markdown)' }),
        size: 'sm',
      });
      copyDay.classList.add('tb-date__copy');
      copyDay.dataset.dayAction = 'copy';
      copyDay.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const markdown = daysHere
          .map((dated) => dayToMarkdown(dated.day, (placeId) => resolveHref(dated.city.slug, placeId)))
          .filter(Boolean)
          .join('\n\n');
        void navigator.clipboard.writeText(markdown).then(
          () => showToast(pickLocale(locale, { en: 'Day copied', 'pt-BR': 'Dia copiado' })),
          () => showToast(pickLocale(locale, { en: 'Could not copy', 'pt-BR': 'Falha ao copiar' }), true),
        );
      });
      const actions = el('span', 'tb-date__actions');
      actions.append(copyDay, routeToggle, dayMaps);
      const chevron = icon('expand_more', { size: 18 });
      chevron.classList.add('tb-date__chevron');
      summary.append(heading, actions, chevron);
      details.append(summary);
      const body = el('div', 'tb-date__body');
      const cards = dateBudgetCards(
        dateBudget(placesHere),
        (placeId) => {
          const found = placesHere.find((place) => place.id === placeId);
          return found ? pickLocale(locale, found.name) : placeId;
        },
        locale,
      );
      if (cards) body.append(cards);
      // One list per period. A row's list is lists[rowIndex].
      const lists: HTMLOListElement[] = [];
      const timeline = el('div', 'tb-periods');
      for (const part of periodSections(periods)) {
        const list = el('ol', 'tb-list tb-timeline');
        for (const index of part.rows) lists[index] = list;
        timeline.append(
          part.period
            ? periodBlock(date, part.period, part.rows.map((index) => rows[index]!), list, past, locale)
            : list,
        );
      }
      body.append(timeline);
      let previousEnd: { id: string; lat: number; lng: number; leg?: TripLeg } | null = null;
      let railAbove: { mode: 'none' | 'walk' | 'transit'; color: string | null } = {
        mode: 'none',
        color: null,
      };
      rows.forEach((entry, rowIndex) => {
        const city = entry.dated.city;
        const day = entry.dated.day;
        const dayIndex = entry.dated.dayIndex;
        const stop = day.stops[entry.stopIndex];
        if (!stop) return;
        const stopIndex = entry.stopIndex;
        const record = getTravelCity(city.slug);
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
          const noteBody = el('span', 'tb-list-note__body');
          if (stop.time) noteBody.append(el('span', 'tb-list-note__time', stop.time));
          const text = el('span', 'tb-list-note__text');
          editNote(text, 'item', stop.label, lineAt(stop.line), city.slug);
          noteBody.append(text);
          noteItem.append(noteBody);
          const noteActions = el('div', 'tb-row__actions');
          noteActions.append(comments(noteItem, stop, city.slug));
          noteItem.append(noteActions);
          markChanged(noteItem);
          lists[rowIndex]!.append(noteItem);
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
        const hopKind =
          previousEnd && point
            ? planHop({
                from: previousEnd,
                to: point,
                ...(previousEnd.leg ? { via: previousEnd.leg } : {}),
              }).kind
            : null;
        const directions =
          previousEnd && point
            ? googleDirectionsUrl(
                [previousEnd, point],
                hopKind === 'walk' ? 'walk' : hopKind === 'drive' ? 'drive' : 'transit',
              )
            : null;
        previousEnd = point ? { ...point, ...(entry.depart ? { leg: entry.depart } : {}) } : null;
        const authored = [stop.label, stop.note].filter(Boolean).join(' — ');
        const placeId = stop.placeId;
        const item = row({
          time: stop.time,
          lead: place ? stopPin(place) : undefined,
          title: missingPlace ? (placeId ?? stop.label) : stop.label,
          sub: missingPlace ? authored || undefined : undefined,
          tip: false,
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
                  releaseLeg();
                  clearStopCurrent();
                  item.setAttribute('aria-current', 'true');
                  const origin = item.querySelector<HTMLElement>('.tb-row__main');
                  openPlace(place, record, locale, origin, {
                    ...(href ? { maps: href } : {}),
                    ...(directions ? { route: directions } : {}),
                  });
                }
              : undefined,
        });
        if (missingPlace) {
          item.classList.add('is-disabled');
          item.setAttribute('aria-disabled', 'true');
        }
        if (stop.note && !missingPlace) {
          // Beside the title button, not in it: a click on the note edits it.
          const note = el('span', 'tb-row__sub');
          editNote(note, 'stop', stop.note, lineAt(stop.line), city.slug);
          item.querySelector('.tb-row__main')?.after(note);
        }
        item.querySelector('.tb-row__actions')?.append(comments(item, stop, city.slug));
        markChanged(item);
        if (place) {
          // Row hover and focus light the pin the way hovering the dot does.
          const hot = (on: boolean) => {
            item.classList.toggle('is-hot', on);
            map.hover(on ? place.id : null);
          };
          item.addEventListener('pointerenter', () => hot(true));
          item.addEventListener('pointerleave', () => hot(false));
          item.addEventListener('focusin', () => hot(true));
          item.addEventListener('focusout', (event) => {
            if (!(event.relatedTarget instanceof Node && item.contains(event.relatedTarget))) hot(false);
          });
        }
        const nextIndex = rows.findIndex((candidate, index) => {
          const next = candidate.dated.day.stops[candidate.stopIndex];
          return index > rowIndex && Boolean(next && !next.listNote);
        });
        const nextRow = nextIndex >= 0 ? rows[nextIndex] : undefined;
        const nextStop = nextRow ? nextRow.dated.day.stops[nextRow.stopIndex] : undefined;
        const nextPlace =
          nextRow && nextStop?.placeId ? placeById(nextRow.dated.city.slug, nextStop.placeId) : undefined;
        const routeHop =
          place && nextPlace
            ? {
                from: { id: place.id, lat: place.lat, lng: place.lng },
                to: { id: nextPlace.id, lat: nextPlace.lat, lng: nextPlace.lng },
                ...(entry.depart ? { via: entry.depart } : {}),
              }
            : null;
        const drawn = routeHop != null && planHop(routeHop).kind !== 'none';
        // Arriving and leaving the same place (the rest at home) is no walk.
        const samePlace = place != null && nextPlace != null && place.id === nextPlace.id;
        let legs = routeHop ? transferLegs(routeHop) : entry.depart ? [entry.depart] : [];
        if (legs.length === 0 && drawn && place && nextPlace && !samePlace) {
          const walk: ItineraryLegDef = { from: place.id, to: nextPlace.id, mode: 'walk' };
          legs = [{ ...walk, durationMin: estimateLegDurationMin(walk, place, nextPlace) }];
        }
        const rails = legs.map((leg) => {
          const mode = leg.mode === 'walk' ? 'walk' : 'transit';
          const branded = 'color' in leg && typeof leg.color === 'string' ? leg.color : null;
          const color = branded ?? (mode === 'walk' ? walkColor() : neutralColor());
          return { mode, color } as const;
        });
        const walk = { mode: 'walk' as const, color: walkColor() };
        const hopPlan =
          hopRails(rails, walk, legs[0]?.mode === 'taxi') ??
          (nextPlace && !samePlace ? { depart: walk, parts: [], arrive: walk } : null);
        // A hop into the next period opens that period's list, like the portfolio.
        // The rail still runs down to that period, so the two read as one line.
        const crosses = nextIndex >= 0 && lists[nextIndex] !== lists[rowIndex];
        const hopList = crosses ? lists[nextIndex]! : lists[rowIndex]!;
        item.dataset.railAbove = railAbove.mode;
        item.dataset.railBelow = hopPlan?.depart.mode ?? 'none';
        item.classList.toggle('is-period-end', crosses && hopPlan != null);
        if (railAbove.color) item.style.setProperty('--rail-above', railAbove.color);
        if (hopPlan) item.style.setProperty('--rail-below', hopPlan.depart.color);
        lists[rowIndex]!.append(item);
        rails.forEach((rail, index) => {
          const transfer = transferRow(legs[index]!, locale);
          transfer.classList.add('tb-timeline__hop');
          transfer.style.setProperty('--line-color', rail.color);
          if (chipTone(rail.color) === 'ink') transfer.classList.add('is-ink');
          const halves = hopPlan?.parts[index] ?? { above: rail, below: rail };
          transfer.prepend(railHalf('is-above', halves.above), railHalf('is-below', halves.below));
          if (drawn && place && nextPlace) {
            const hopRaw = transfer.dataset.legHop;
            const hop = hopRaw != null && hopRaw !== '' ? Number(hopRaw) : undefined;
            armTransfer(transfer, place.id, nextPlace.id, hop);
          }
          markChanged(transfer);
          hopList.append(transfer);
        });
        railAbove = hopPlan?.arrive ?? { mode: 'none', color: null };
      });
      const bridged = new Set(
        rows.flatMap((row) => (row.depart && row.depart === row.dated.city.leg ? [row.dated.city] : [])),
      );
      for (const dated of daysHere) {
        for (const note of dated.day.notes) {
          const paragraph = el('p', 'tb-doc-note');
          editNote(paragraph, 'paragraph', note.text, lineAt(note.line), dated.city.slug);
          body.append(paragraph);
        }
        if (
          dated.city.leg &&
          dated.dayIndex === dated.city.days.length - 1 &&
          !bridged.has(dated.city)
        ) {
          const via = document.createElement('ul');
          via.className = 'tb-list tb-list--stops tb-city-via';
          via.append(transferRow(dated.city.leg, locale));
          body.append(via);
        }
      }
      details.append(body);
      // Reopening the card on a repaint fires `toggle` too, even detached. That is
      // not the user: paint() syncs the map itself and keeps the camera still.
      let restoring = details.open;
      details.addEventListener('toggle', () => {
        if (restoring) {
          restoring = false;
          return;
        }
        if (ignoreDateToggle) return;
        if (details.open) {
          routeHidden.delete(date);
          ignoreDateToggle = true;
          for (const other of main.querySelectorAll<HTMLDetailsElement>('details.tb-date')) {
            if (other !== details) other.open = false;
          }
          ignoreDateToggle = false;
        }
        const fitDay = details.open && !pinPick;
        pinPick = false;
        syncView(fitDay);
      });
      article.append(details);
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
      shouldRefit(firstPaint, catalogPins(trip), seenPinIds, (lat, lng) => map.inView(lat, lng)),
    );
    paintWeather(trip);
    refreshWeather(trip);
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
    if (editing) return;
    try {
      const file = await loadTripFile(id);
      if (!alive || editing) return;
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

  const offLeg = map.onHoverLeg((leg) => {
    if (!alive) return;
    main.querySelectorAll<HTMLElement>('.tb-transfer.is-hot').forEach((node) => {
      if (node.getAttribute('aria-pressed') !== 'true') node.classList.remove('is-hot');
    });
    if (!leg) return;
    for (const row of main.querySelectorAll<HTMLElement>('.tb-transfer[data-leg-from]')) {
      if (row.dataset.legFrom !== leg.from || row.dataset.legTo !== leg.to) continue;
      if (leg.hop != null) {
        if (row.dataset.legHop === String(leg.hop)) row.classList.add('is-hot');
        continue;
      }
      if (leg.walk != null) {
        if (row.dataset.legWalk === String(leg.walk)) row.classList.add('is-hot');
        continue;
      }
      if (leg.mode) {
        const rowMode = row.dataset.legMode === 'walk' ? 'walk' : 'transit';
        if (rowMode === leg.mode && row.dataset.legHop == null) row.classList.add('is-hot');
        continue;
      }
      row.classList.add('is-hot');
    }
  });

  stopsUnsub.fn = map.onSelect((pinId) => {
    if (!alive || !current) return;
    const selector = `[data-place-id="${CSS.escape(pinId)}"]`;
    // Home shows up on most dates. The open card's row wins.
    const item =
      main.querySelector<HTMLElement>(`details.tb-date[open] ${selector}`) ??
      main.querySelector<HTMLElement>(selector);
    if (item) {
      const date = item.closest('details.tb-date');
      if (date instanceof HTMLDetailsElement && !date.open) {
        pinPick = true;
        date.open = true;
      }
      const period = item.closest('details.tb-period');
      if (period instanceof HTMLDetailsElement) period.open = true;
      item.scrollIntoView({ block: 'center' });
      clearStopCurrent();
      item.setAttribute('aria-current', 'true');
    }
    for (const city of current.cities) {
      const record = getTravelCity(city.slug);
      const place = record?.places.find((entry) => entry.id === pinId);
      if (!record || !place) continue;
      const origin = item?.querySelector<HTMLElement>('.tb-row__main') ?? null;
      openPlace(place, record, shell.locale(), origin);
      return;
    }
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
      offLeg();
      tripRouteEpoch += 1;
      routeAbort?.abort();
      routeAbort = null;
      setDayLayer(false);
      map.setRoute([]);
      map.setOverview(null);
      map.hoverOverview(null);
      map.setPins('place', []);
      map.setPins('stop', []);
      closePlace({ focus: false });
      shell.setExportEnabled(false);
    },
  };
}

import { appRequest } from '../platform/request';
import { intercityHops } from './overview';
import { getTripCity, placeCity } from './catalog';
import { departureTimes } from './departures';
import { placePin as stopPin } from '../ui/place-pin';
import type { Shell } from '../app/shell';
import {
  estimateLegDurationMin,
  subPointParents,
  googleMapsUrl,
  pickLocale,
  placeCategoryMeta,
  resolveVisit,
  travelUi,
} from '../catalog';
import type { ItineraryLegDef, Locale, TravelPlace } from '../catalog';
import { buildItineraryRoute } from '../map/itinerary-route';
import type { MapHandle, MapPin } from '../map/types';
import { fetchDrivingRoute, fetchWalkingRoute, peekWalkingRoute } from '../map/walk-route';
import { setDocumentTitle } from '../app/router';
import { readPeriods, writePeriods } from '../app/store';
import type { TripPush } from './api';
import { tripChecklist, tripTabs } from './checklist';
import { changedStopKeys } from './diff';
import { closedPeriods, isDayClosed, isTentative, periodStatusPatch, statusPatch } from './status';
import { googleDirectionsUrl } from './directions';
import { tripErrorText, warningCopyText, warningCountLabel } from './errors';
import { copyTrip, dayToMarkdown, downloadTrip, tripToHtml, tripToMarkdown } from './export';
import { daysOnDate, nearestTripDate, todayIso, tripDates, type DatedDay } from './calendar';
import { formatDayTitle } from './dates';
import {
  dateBudget,
  dayPeriods,
  hopRails,
  isOpenSlot,
  pastPeriods,
  periodSections,
  periodWindows,
  noPurchase,
  seenFromOutside,
  withSubPointPlaces,
  zonedStamp,
  type Period,
  type Rail,
} from './day-plan';
import { inlineNodes } from './inline';
import {
  editableNote,
  noteBlock,
  sendPatch,
  type NoteEditorOptions,
  type NoteKind,
  type SeenLine,
} from './note-edit';
import {
  dateStops,
  planHop,
  previewHop,
  resolveHopSegments,
  timelineLegs,
  transferLegs,
  type DateStop,
  type RouteHop,
} from './route';
import { shouldRefit, stopKey, type FocusMark } from './view-state';
import { rememberWalk, rememberedWalk } from './walk-memory';
import { extraWalkMeters, formatWalk, isExtraWalkNote, walkedMeters } from './walk-distance';
import { attachSubPointNotes, stripNoteTitle, walkOrder, type SubPointNote } from './subpoints';
import { aiBadge } from '../ui/ai-badge';
import type { RouteDeps } from './route';
import type { MapRouteSegment } from '../map/types';
import { chipTone } from '../ui/contrast';
import { iconButton } from '../ui/controls';
import { el } from '../ui/dom';
import { mapsIconLink } from '../ui/maps-icon';
import { icon } from '../ui/icons';
import { cssToken, prefersReducedMotion } from '../ui/motion';
import { row } from '../ui/row';
import {
  closePlace,
  onPlaceClose,
  openPlaceId,
  repaintPlace,
  setPlaceOrigin,
} from '../views/place-panel';
import { activatePlace, resetPlaceSelection } from '../views/place-activation';
import { legLabel, parseTrip, type Trip, type TripCity, type TripLeg, type TripStop } from './parse';
import { formatTripNavLabel, formatTripPanelTitle, formatTripSummary } from './summary';
import { averageBudgetCards, dateBudgetCards, periodLabel, slotSwitch, stopCostEl, stopCountLabel, sunsetTip } from '../views/timeline';
import { timeZoneForCity } from '../views/open-now';
import {
  dayWeather,
  forecastState,
  loadForecast,
  weatherIn,
  weatherLook,
  weatherTip,
  WINDOWS,
  type ForecastState,
  type Weather,
} from './weather';
import { weatherIcon } from '../ui/weather-icons';
import { luggageStops } from './luggage';
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
  const response = await appRequest('/api/trips');
  if (!response.ok) throw new Error(`trip api ${response.status}`);
  const data = (await response.json()) as TripFile[];
  if (!Array.isArray(data)) throw new Error('trip api');
  return data;
}

export async function loadTripFile(id: string): Promise<TripFile | null> {
  const response = await appRequest(`/api/trips/${encodeURIComponent(id)}`);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`trip api ${response.status}`);
  const data = (await response.json()) as TripFile;
  if (!data || typeof data.raw !== 'string' || typeof data.id !== 'string') {
    throw new Error('trip api');
  }
  return data;
}

function resolveHref(citySlug: string, placeId: string): string | null {
  const city = getTripCity(citySlug);
  const place = city?.places.find((item) => item.id === placeId);
  if (!city || !place) return null;
  return googleMapsUrl(place, placeCity(place.id, city));
}

function placeById(citySlug: string, placeId: string): TravelPlace | undefined {
  return getTripCity(citySlug)?.places.find((item) => item.id === placeId);
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

/** Empty until the date's walks are measured. */
function walkSlot(date: string): HTMLSpanElement {
  const slot = el('span', 'tb-walk');
  slot.dataset.walk = date;
  slot.setAttribute('role', 'img');
  slot.hidden = true;
  return slot;
}

/**
 * Glyph only; the reading slides out on hover (`.tb-reveal`) and the tip has the rest, one
 * fact per line. With `placeholder`, an empty slot still shows while the forecast loads or
 * after it failed, so the card says why there is nothing.
 */
function fillWeather(
  slot: HTMLElement,
  weather: Weather | null,
  night: boolean,
  locale: Locale,
  window: readonly [number, number] | undefined,
  state: ForecastState,
  placeholder = false,
): void {
  const empty = !weather && placeholder && (state.loading || state.failed);
  slot.classList.toggle('is-loading', empty && state.loading);
  slot.classList.toggle('is-off', empty && !state.loading);
  slot.classList.toggle('is-stale', Boolean(weather) && state.failed);
  slot.hidden = !weather && !empty;
  if (!weather) {
    if (!empty) {
      slot.replaceChildren();
      return;
    }
    const text = state.loading
      ? pickLocale(locale, { en: 'Loading the forecast…', 'pt-BR': 'Carregando a previsão…' })
      : pickLocale(locale, {
          en: 'No forecast right now.\nRefresh to try again.',
          'pt-BR': 'Sem previsão agora.\nAtualize para tentar de novo.',
        });
    slot.replaceChildren(weatherIcon(state.loading ? 'cloud-sun' : 'clouds'));
    slot.setAttribute('data-tip', text);
    slot.setAttribute('aria-label', text.replace('\n', ' '));
    return;
  }
  const look = weatherLook(weather, night);
  const low = Math.round(weather.min);
  const high = Math.round(weather.max);
  const temp = low === high ? `${low}°` : `${low}–${high}°`;
  const rain = Math.round(weather.rain);
  // An ensemble gives a chance; a single model gives an amount, or nothing to add.
  const reading =
    weather.runs > 1
      ? `${temp} · ${rain}%`
      : weather.rain >= 50
        ? `${temp} · ${weather.mm.toFixed(1).replace('.', locale === 'pt-BR' ? ',' : '.')} mm`
        : temp;
  slot.replaceChildren(weatherIcon(look.icon), el('span', 'tb-weather__text tb-reveal', reading));
  const tip = weatherTip(weather, look.label, locale, window, state.fetchedAt, state.failed, new Date(), state.source);
  slot.setAttribute('data-tip', tip);
  slot.setAttribute('aria-label', tip.replaceAll('\n', '. '));
}

/** Half of a leg's rail: `is-above` runs into its icon, `is-below` leaves it. */
/** "Roteiro em aberto": free time after a stop, for another place nearby. */
function openSlotRow(locale: Locale, rail: Rail | null): HTMLLIElement {
  const row = el('li', 'tb-open-slot');
  if (rail) row.append(railHalf('is-above', rail), railHalf('is-below', rail));
  const glyph = icon('schedule', { size: 16 });
  glyph.classList.add('tb-open-slot__icon');
  row.append(glyph, el('span', 'tb-open-slot__label', pickLocale(locale, { en: 'Open time', 'pt-BR': 'Roteiro em aberto' })));
  return row;
}

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
  const record = getTripCity(city.slug);
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
  resetPlaceSelection(map);
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
  let selectedTab = 0;
  let checklist: HTMLElement | null = null;
  let checklistLocale: Locale | null = null;
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
  /** Date cards in the order they opened. Several stay open; the last one open is on the map. */
  let openOrder: string[] = [];
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
  /** The trip's notes on a park's points and under the park, by place id, for a click on a map dot. */
  const subNotesByPlace = new Map<string, { sub: SubPointNote[]; park: { time?: string; text: string }[] }>();

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

  /** The card opened last among the open ones. */
  function openDate(): string | null {
    const open = new Set(
      [...main.querySelectorAll<HTMLDetailsElement>('details.tb-date[open]')].map((card) => card.dataset.date),
    );
    return openOrder.findLast((date) => open.has(date)) ?? null;
  }

  /** That date, unless its card hid the route. */
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

  /**
   * The list notes right under a stop, split into the ones that name a point of the place
   * (with its index) and the loose ones. `index` is the row of each note.
   */
  function notesUnderStop(
    rows: readonly DateStop[],
    rowIndex: number,
    place: TravelPlace,
  ): { attached: (SubPointNote & { index: number })[]; loose: { index: number; time?: string; text: string }[] } {
    const following: { index: number; label: string; time?: string; line: number }[] = [];
    for (let next = rowIndex + 1; next < rows.length; next += 1) {
      const candidate = rows[next]!.dated.day.stops[rows[next]!.stopIndex];
      if (!candidate?.listNote) break;
      following.push({ index: next, label: candidate.label, line: candidate.line, ...(candidate.time ? { time: candidate.time } : {}) });
    }
    const { attached, loose } = attachSubPointNotes(following, place.subPoints ?? []);
    return {
      attached: attached.map(({ note, sub }) => ({ sub, index: note.index, text: stripNoteTitle(note.label), line: note.line, ...(note.time ? { time: note.time } : {}) })),
      loose: loose.map((note) => ({ index: note.index, text: note.label, ...(note.time ? { time: note.time } : {}) })),
    };
  }

  /** Stops of the routed date, including the train that leaves one city for the next. */
  function routeHops(): RouteHop[] {
    const date = routedDate();
    if (!current) return [];
    if (date) return hopsForDate(current, date, false);
    return openDate() ? [] : intercityHops(tripDates(current).flatMap((section) => hopsForDate(current!, section.date, true)));
  }

  /** Hops between the places of a date. `all` keeps the periods switched off the map: the walked distance counts them. */
  function hopsForDate(trip: Trip, date: string, all: boolean): RouteHop[] {
    const hops: RouteHop[] = [];
    const { rows } = datePlan(daysOnDate(trip, date), date);
    let previous: { id: string; lat: number; lng: number; leg?: TripLeg } | null = null;
    for (const { row, place, on } of datePlaces(trip, date)) {
      // An off period breaks the chain, so the route never bridges it.
      if (!on && !all) {
        previous = null;
        continue;
      }
      // A place with sub-points is walked in the order of the day's timed notes (a revisit counts
      // again), else the catalog order: entered at the first point, left from the last.
      const catalog = place.subPoints ?? [];
      // `datePlaces` built its own rows: find this stop by city, day and index, not by identity.
      const rowAt = rows.findIndex(
        (candidate) =>
          candidate.dated.city.slug === row.dated.city.slug &&
          candidate.dated.dayIndex === row.dated.dayIndex &&
          candidate.stopIndex === row.stopIndex,
      );
      const order = catalog.length ? walkOrder(catalog.length, rowAt >= 0 ? notesUnderStop(rows, rowAt, place).attached : []) : [];
      const subs = order.map((index) => catalog[index]!);
      const first = subs[0];
      const last = subs.at(-1);
      const point = { id: place.id, lat: first?.lat ?? place.lat, lng: first?.lng ?? place.lng };
      if (previous) {
        hops.push({
          from: { id: previous.id, lat: previous.lat, lng: previous.lng },
          to: point,
          ...(previous.leg ? { via: previous.leg } : {}),
        });
      }
      if (first && last && subs.length > 1) {
        const locale = shell.locale();
        hops.push({
          from: point,
          to: { id: place.id, lat: last.lat, lng: last.lng },
          through: subs.slice(1, -1).map((sub) => [sub.lat, sub.lng] as [number, number]),
          subPoints: order.map((index) => ({
            lat: catalog[index]!.lat,
            lng: catalog[index]!.lng,
            label: pickLocale(locale, catalog[index]!.name),
            color: placeCategoryMeta[place.category].color,
            parentId: place.id,
            index,
          })),
        });
      }
      previous = {
        id: place.id,
        lat: last?.lat ?? place.lat,
        lng: last?.lng ?? place.lng,
        ...(row.depart ? { leg: row.depart } : {}),
      };
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
      const record = getTripCity(city.slug);
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
      const record = getTripCity(slug);
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

  function drawTripRoutes(fit = false) {
    const epoch = ++tripRouteEpoch;
    routeAbort?.abort();
    const controller = new AbortController();
    routeAbort = controller;
    const signal = controller.signal;
    const hops = routeHops();
    for (const hop of hops) {
      const plan = planHop(hop);
      if (plan.kind !== 'walk') continue;
      if (rememberedWalk(hop.from, hop.to, plan.through)) continue;
      const cached = peekWalkingRoute(walkPoints(hop.from, hop.to, plan.through));
      if (cached && cached.latlngs.length >= 2) rememberWalk(hop.from, hop.to, cached.latlngs, plan.through);
    }
    const color = neutralColor();
    const preview = hops.map((hop) => previewHop(hop, color));
    const known = preview.flatMap((part) => part ?? []);
    if (preview.every((part) => part !== null)) {
      map.setRoute(known, { fit });
      return;
    }
    void resolveHopSegments(
      hops,
      routeDeps(signal, color, (segments) => {
        if (!alive || epoch !== tripRouteEpoch) return;
        map.setRoute([...segments]);
      }),
    )
      .then((segments) => {
        if (!alive || epoch !== tripRouteEpoch) return;
        map.setRoute(segments, { fit });
      })
      .catch(() => undefined);
  }

  /** How a hop becomes segments: cached walks, OSRM, the catalog's train legs. The map and the walked distance share it. */
  function routeDeps(
    signal: AbortSignal,
    neutralColor: string,
    onUpdate?: (segments: readonly MapRouteSegment[]) => void,
  ): RouteDeps {
    return {
      neutralColor,
      ...(onUpdate ? { onUpdate } : {}),
      walk: async (from, to, through) => {
        const cached = rememberedWalk(from, to, through);
        if (cached) return cached;
        const route = await fetchWalkingRoute(walkPoints(from, to, through), signal);
        if (!route || route.latlngs.length < 2) return null;
        rememberWalk(from, to, route.latlngs, through);
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
    };
  }

  /** Metres walked per date: the route's walk segments, plus what `+N km` notes add. */
  const walkMeters = new Map<string, { route: number; extra: number }>();
  let walkEpoch = 0;
  let walkAbort: AbortController | null = null;

  function paintWalk(date: string, locale: Locale) {
    const meters = walkMeters.get(date);
    main.querySelectorAll<HTMLElement>(`[data-walk="${CSS.escape(date)}"]`).forEach((slot) => {
      slot.hidden = meters == null;
      if (meters == null) return;
      const value = formatWalk(meters.route + meters.extra, locale);
      const unit = pickLocale(locale, { en: ' on foot', 'pt-BR': ' a pé' });
      slot.replaceChildren(
        icon('directions_walk', { size: 16 }),
        el('span', 'tb-walk__text', value),
      );
      slot.setAttribute('aria-label', `${value}${unit}`);
      // Route and noted extras apart, and what is never counted.
      const parts = [
        pickLocale(locale, { en: `${formatWalk(meters.route, locale)} on the route`, 'pt-BR': `${formatWalk(meters.route, locale)} na rota` }),
        ...(meters.extra > 0
          ? [pickLocale(locale, { en: `+${formatWalk(meters.extra, locale)} noted`, 'pt-BR': `+${formatWalk(meters.extra, locale)} anotados` })]
          : []),
        pickLocale(locale, { en: 'queues not counted', 'pt-BR': 'filas fora da conta' }),
      ];
      slot.setAttribute('data-tip', parts.join('\n'));
    });
  }

  function paintWalks(trip: Trip) {
    const locale = shell.locale();
    for (const section of tripDates(trip)) paintWalk(section.date, locale);
  }

  /**
   * Measured again after every paint, so the number follows the file: known walks
   * resolve at once from memory, a new hop fetches its route once and is remembered.
   */
  function refreshWalks(trip: Trip) {
    const epoch = ++walkEpoch;
    walkAbort?.abort();
    const controller = new AbortController();
    walkAbort = controller;
    const color = neutralColor();
    void (async () => {
      for (const section of tripDates(trip)) {
        if (!alive || epoch !== walkEpoch) return;
        const hops = hopsForDate(trip, section.date, true);
        const { rows: dateRows } = datePlan(daysOnDate(trip, section.date), section.date);
        const extra = extraWalkMeters(
          dateRows.flatMap((row) => {
            const stop = row.dated.day.stops[row.stopIndex];
            return stop?.listNote ? [stop.label] : [];
          }),
        );
        if (!hops.length && !extra) {
          walkMeters.delete(section.date);
          paintWalk(section.date, shell.locale());
          continue;
        }
        try {
          const segments = hops.length ? await resolveHopSegments(hops, routeDeps(controller.signal, color)) : [];
          if (!alive || epoch !== walkEpoch) return;
          walkMeters.set(section.date, { route: walkedMeters(segments), extra });
          paintWalk(section.date, shell.locale());
        } catch {
          /* Aborted or offline: the slot keeps its last value. */
        }
      }
    })();
  }

  /** Route toggle of each card, updated in place. Maps opens per period: a whole day is too many stops. */
  function syncDayChrome() {
    const routed = routedDate();
    main.querySelectorAll<HTMLDetailsElement>('details.tb-date').forEach((card) => {
      card.querySelector('[data-day-action="route"]')?.setAttribute('aria-pressed', String(card.dataset.date === routed));
    });
  }

  function syncView(fit: boolean) {
    const trip = current;
    if (!trip) return;
    const date = routedDate();
    const inner = new Set(trip.cities.flatMap((city) => [...(getTripCity(city.slug) ? subPointParents(getTripCity(city.slug)!).keys() : [])]));
    const overview = !openDate();
    const hops = overview ? routeHops() : [];
    // Keep the city catalog mounted: zoom controls visibility, including in the overview.
    const pins = catalogPins(trip).filter((pin) => !inner.has(pin.id));
    map.setCities([]);
    map.setOverview(null);
    map.hoverOverview(null);
    map.setPins('place', pins);
    map.setPins('stop', []);
    map.setPins('hotel', []);
    setDayLayer(Boolean(date));
    syncDayChrome();
    seenPinIds = new Set(pins.map((pin) => pin.id));
    if (date) {
      drawTripRoutes();
      if (fit) {
        const points = datedPoints(trip, date);
        if (points.length) map.frame(points, 13);
      }
    } else if (overview && hops.length) {
      drawTripRoutes(fit);
    } else {
      tripRouteEpoch += 1;
      routeAbort?.abort();
      map.setRoute([]);
      if (fit) frameNearest(trip);
    }
    const openId = openPlaceId();
    if (!openId || !trip) return;
    const visible = trip.cities.some((city) => {
      const record = getTripCity(city.slug);
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
    // The `via:` note in the row is text to edit: its clicks and keys are not the row's.
    const inNote = (event: Event) => event.target instanceof Element && event.target.closest('[data-note-edit]') !== null;
    transfer.addEventListener('click', (event) => {
      if (inNote(event)) return;
      event.stopPropagation();
      activate();
    });
    transfer.addEventListener('keydown', (event) => {
      if (inNote(event) || (event.key !== 'Enter' && event.key !== ' ')) return;
      event.preventDefault();
      activate();
    });
  }

  /** Forecast per period on the window covering its own stops (see `periodWindows`), in the city of its first stop. The day card sums its periods. */
  function paintWeather(trip: Trip) {
    const locale = shell.locale();
    for (const section of tripDates(trip)) {
      const card = main.querySelector<HTMLElement>(`details.tb-date[data-date="${CSS.escape(section.date)}"]`);
      if (!card) continue;
      const { rows, periods } = datePlan(section.cities.flatMap((group) => group.days), section.date);
      const times = rows.map((row) => row.dated.day.stops[row.stopIndex]?.time);
      const windows = periodWindows(times, periods, WINDOWS);
      const stateOf = (index: number): ForecastState => {
        const record = getTripCity(rows[index]?.dated.city.slug ?? '');
        return record
          ? forecastState(record.lat, record.lng)
          : { hours: null, fetchedAt: null, loading: false, failed: false, error: null, source: null };
      };
      const cityOf = (index: number) => stateOf(index).hours;
      const parts: Weather[] = [];
      for (const { period, rows: indexes } of periodSections(periods)) {
        if (!period) continue;
        const state = stateOf(indexes[0] ?? -1);
        const weather = state.hours && weatherIn(state.hours, section.date, windows[period]);
        if (weather) parts.push(weather);
        const slot = card.querySelector<HTMLElement>(`.tb-period[data-period="${period}"] [data-weather]`);
        if (slot) fillWeather(slot, weather, period === 'evening', locale, windows[period], state);
      }
      // A date without times reads all three periods of its first city.
      const whole = periods.some(Boolean) ? null : cityOf(0);
      for (const window of whole ? Object.values(WINDOWS) : []) {
        const weather = whole && weatherIn(whole, section.date, window);
        if (weather) parts.push(weather);
      }
      const dayState = stateOf(0);
      const slot = card.querySelector<HTMLElement>('[data-weather="day"]');
      if (slot) fillWeather(slot, dayWeather(parts), false, locale, undefined, dayState, true);
      // The refresh button shows once a fetch failed, with or without an older forecast to show.
      const refresh = card.querySelector<HTMLButtonElement>('[data-day-action="weather"]');
      if (refresh) {
        refresh.hidden = !dayState.failed;
        refresh.disabled = dayState.loading;
      }
    }
  }

  /** One request per city; each answer repaints the forecast in place. `force` ignores the half-hour freshness. */
  function refreshWeather(trip: Trip, force = false): Promise<void> {
    const seen = new Set<string>();
    const loads: Promise<unknown>[] = [];
    for (const city of trip.cities) {
      const record = getTripCity(city.slug);
      if (!record || seen.has(city.slug)) continue;
      seen.add(city.slug);
      loads.push(
        loadForecast(record.lat, record.lng, timeZoneForCity(city.slug), force).then(() => {
          if (alive && current && !force) paintWeather(current);
        }),
      );
    }
    if (loads.length && alive && current) paintWeather(current);
    return Promise.all(loads).then(() => undefined);
  }

  /** The button's answer: the loading glyph for at least a moment, then the new forecast or why there is none. */
  async function refreshWeatherByHand(trip: Trip, slug: string | undefined) {
    const locale = shell.locale();
    // ponytail: 600 ms so a 429 that comes back in 200 ms still reads as "it tried".
    await Promise.all([refreshWeather(trip, true), new Promise((resolve) => setTimeout(resolve, 600))]);
    if (!alive || !current) return;
    paintWeather(current);
    const record = getTripCity(slug ?? '');
    const state = record ? forecastState(record.lat, record.lng) : null;
    if (!state?.failed) {
      showToast(pickLocale(locale, { en: 'Forecast updated', 'pt-BR': 'Previsão atualizada' }));
      return;
    }
    const why =
      state.error === 'limit'
        ? { en: 'Open-Meteo hit its daily request limit. The forecast comes back tomorrow.', 'pt-BR': 'O Open-Meteo chegou ao limite diário de consultas. A previsão volta amanhã.' }
        : state.error === 'network'
          ? { en: 'No connection to Open-Meteo.', 'pt-BR': 'Sem conexão com o Open-Meteo.' }
          : { en: 'Open-Meteo did not answer.', 'pt-BR': 'O Open-Meteo não respondeu.' };
    const kept = state.hours
      ? pickLocale(locale, { en: ' Showing the last forecast.', 'pt-BR': ' Mostrando a última previsão.' })
      : '';
    showToast(`${pickLocale(locale, why)}${kept}`, true);
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
    const carryingLuggage = luggageStops(trip);
    const changed = changedStopKeys(previousTrip, trip);
    const firstPaint = !hasPainted;
    if (!firstPaint) rememberView();
    current = trip;
    const locale = shell.locale();
    main.replaceChildren();

    const openLinkedPlace = (citySlug: string, placeId: string, origin: HTMLElement) => {
      const cityRecord = getTripCity(citySlug);
      const found = cityRecord?.places.find((entry) => entry.id === placeId);
      if (!cityRecord || !found) return;
      clearStopCurrent();
      const rowEl = main.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(placeId)}"]`);
      rowEl?.setAttribute('aria-current', 'true');
      activatePlace(map, found, placeCity(found.id, cityRecord), locale, origin, {
        maps: googleMapsUrl(found, placeCity(found.id, cityRecord)),
      });
    };

    const rawLines = lastRaw.split(/\r?\n/);
    const lineAt = (line: number): SeenLine => ({ line, lines: noteBlock(rawLines, line) });
    const statusSync: (() => void)[] = [];
    const statusBlocks = new Map<number, string[]>();
    const statusButton = (line: number, kind: Period | 'a confirmar', active: boolean, changed: (on: boolean) => void, endLine = line, headingCount = 1) => {
      const button = iconButton({ icon: 'help', label: '', size: 'sm' });
      button.classList.add('tb-review-status');
      if (kind === 'a confirmar') button.classList.add('tb-review-place');
      if (!statusBlocks.has(line)) {
        const end = endLine - 1 + statusPatch(lastRaw, endLine, kind, active).before.length;
        statusBlocks.set(line, rawLines.slice(line - 1, end));
      }
      let busy = false;
      const sync = () => {
        const label = kind !== 'a confirmar'
          ? pickLocale(locale, { en: `${periodLabel(kind as Period, locale)} · ${active ? 'Reopen period' : 'Finalize period'}`, 'pt-BR': `${periodLabel(kind as Period, locale)} · ${active ? 'Reabrir período' : 'Fechar período'}` })
          : pickLocale(locale, { en: active ? 'Tentative place · Confirm place' : 'Confirmed place · Mark as tentative', 'pt-BR': active ? 'Em dúvida · Confirmar lugar' : 'Com certeza · Marcar dúvida' });
        button.setAttribute('aria-label', label);
        button.dataset.tip = label;
        button.replaceChildren(icon(kind !== 'a confirmar' ? (active ? 'check' : 'check_circle') : 'help', { size: 16, fill: kind === 'a confirmar' && active }));
        if (kind === 'a confirmar' && active) {
          const confirm = icon('check', { size: 16 });
          confirm.classList.add('tb-review-confirm');
          button.append(confirm);
        }
        button.setAttribute('aria-pressed', String(active));
      };
      sync();
      button.addEventListener('focus', () => onEditing(true));
      button.addEventListener('blur', () => { if (!busy) onEditing(false); });
      button.addEventListener('click', async (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (busy) return;
        busy = true;
        onEditing(true);
        button.setAttribute('aria-busy', 'true');
        const source = statusBlocks.get(line)!.join('\n');
        const patch = kind === 'a confirmar' ? statusPatch(source, 1, kind, !active) : periodStatusPatch(source, kind, !active, headingCount);
        const result = await sendPatch(id, { ...patch, line });
        if (typeof result === 'number') {
          statusBlocks.set(line, patch.after!);
          active = !active;
          changed(active);
          sync();
          statusSync.forEach((update) => update());
        } else noteFailed(result, '');
        busy = false;
        button.removeAttribute('aria-busy');
        if (document.activeElement !== button) onEditing(false);
      });
      return button;
    };
    const stopStatus = (stop: TripStop) => statusButton(stop.line, 'a confirmar', isTentative(stop), (on) => {
      stop.status = on ? 'a confirmar' : 'confirmado';
    });
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

    /** The note of a trip `via:` in its transfer row, including a catalog-expanded ride. */
    const editLegNote = (row: HTMLElement, leg: TripLeg | undefined, slug: string) => {
      if (!leg?.note || !leg.line) return;
      let note = row.querySelector<HTMLElement>('.tb-transfer__note');
      if (!note) {
        note = el('span', 'tb-transfer__note', leg.note);
        row.append(note);
        row.setAttribute('aria-label', `${row.getAttribute('aria-label')}, ${leg.note}`);
      }
      editNote(note, 'via', leg.note, lineAt(leg.line), slug);
    };

    /** The stop's decisions and comments go in `host`. Returns the button that adds a comment. */
    const comments = (host: HTMLElement, stop: TripStop, slug: string): HTMLButtonElement => {
      // What the user settled: always shown, above the comments, with no delete button.
      const decided = el('ul', 'tb-decisions');
      for (const decision of stop.decisions ?? []) {
        const item = el('li', 'tb-decision');
        const body = el('span', 'tb-decision__text');
        item.append(icon('verified', { size: 16 }), body);
        decided.append(item);
        editNote(body, 'decision', decision.text, lineAt(decision.line), slug, {
          label: pickLocale(locale, { en: 'Decision', 'pt-BR': 'Decisão' }),
        });
      }
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
      // Before the actions, so Tab reaches the decisions and comments first.
      const actions = host.querySelector(':scope > .tb-row__actions');
      if (actions) actions.before(decided, list);
      else host.append(decided, list);
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

    const dailyBudgets: { title: string; budget: ReturnType<typeof dateBudget> }[] = [];
    for (const section of tripDates(trip)) {
      const date = section.date;
      const details = document.createElement('details');
      details.className = 'tb-date';
      details.dataset.date = date;
      details.dataset.dayKey = date;
      details.open = !firstPaint && openKeys.has(date);
      const daysHere = section.cities.flatMap((group) => group.days);
      const { rows, periods, past } = datePlan(daysHere, date);
      // A park's rides and restaurants (its sub-points) count as the park's own spend.
      const placesHere = withSubPointPlaces(
        datePlaces(trip, date).map(({ place }) => place),
        (id) => daysHere.map((dated) => placeById(dated.city.slug, id)).find(Boolean),
      );
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
      const meta = el('span', 'tb-date__meta');
      const location = el('span', 'tb-date__location');
      if (names.length) location.append(el('span', 'tb-date__names', names.join(' → ')));
      const countLabel = stopCountLabel(stopCount, locale);
      const count = el('span', 'tb-count');
      count.setAttribute('aria-label', countLabel);
      count.append(
        el('span', 'tb-count__n', String(stopCount)),
        el('span', 'tb-count__unit tb-reveal', ` ${countLabel.replace(/^\d+\s*/, '')}`),
      );
      // Sky: the forecast and, after a failed fetch, the button that asks again.
      const sky = el('span', 'tb-sky');
      const refresh = iconButton({
        icon: 'sync',
        label: pickLocale(locale, { en: 'Refresh the forecast', 'pt-BR': 'Atualizar a previsão' }),
        size: 'sm',
      });
      refresh.classList.add('tb-weather__refresh');
      refresh.dataset.dayAction = 'weather';
      refresh.hidden = true;
      refresh.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        void refreshWeatherByHand(trip, rows[0]?.dated.city.slug);
      });
      sky.append(weatherSlot('day'), refresh);
      location.append(count);
      meta.append(location, sky, walkSlot(date));
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
        if (routedDate() === date) {
          routeHidden.add(date);
          syncView(false);
          return;
        }
        // Its route was hidden, or another open card had the map: this one takes it.
        routeHidden.delete(date);
        openOrder = [...openOrder.filter((other) => other !== date), date];
        syncView(true);
      });
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
      const review = el('span', 'tb-day-closed');
      review.append(icon('check', { size: 16 }));
      review.setAttribute('aria-label', pickLocale(locale, { en: 'Day finalized', 'pt-BR': 'Dia fechado' }));
      review.dataset.tip = review.getAttribute('aria-label')!;
      const syncReview = () => { review.hidden = !daysHere.every(({ day }) => isDayClosed(day)); };
      statusSync.push(syncReview);
      syncReview();
      heading.querySelector('.tb-date__title')?.append(review);
      actions.append(copyDay, routeToggle);
      const chevron = icon('expand_more', { size: 18 });
      chevron.classList.add('tb-date__chevron');
      summary.append(heading, actions, chevron);
      details.append(summary);
      const body = el('div', 'tb-date__body');
      const fares = rows.flatMap((row) =>
        row.depart?.fareEur ? [{ label: legLabel(row.depart), eur: row.depart.fareEur }] : [],
      );
      // A place only seen from outside skips its ticket, unless another stop that date goes in.
      // A stop that only looks (a famous café, "sem comprar") skips its food the same way.
      const outside = new Set<string>();
      const noFood = new Set<string>();
      const buying = new Set<string>();
      const inside = new Set<string>();
      const foodOverrides = new Map<string, number>();
      for (const row of rows) {
        const stop = row.dated.day.stops[row.stopIndex];
        if (!stop?.placeId) continue;
        if (stop.foodEur !== undefined) foodOverrides.set(stop.placeId, stop.foodEur);
        const text = `${stop.label} ${stop.note ?? ''}`;
        (seenFromOutside(text) ? outside : inside).add(stop.placeId);
        (noPurchase(text) ? noFood : buying).add(stop.placeId);
      }
      for (const placeId of inside) outside.delete(placeId);
      for (const placeId of buying) noFood.delete(placeId);
      const budget = dateBudget(placesHere, fares, outside, noFood, foodOverrides);
      dailyBudgets.push({ title: formatDayTitle(date, locale), budget });
      // The date counts a place once, so its line sits on its first stop only.
      const stopCosts = new Map(budget.lines.map((line) => [line.id, line]));
      const receiptStops = new Map<string, { time?: string; select: () => void }>();
      // A date across two cities takes the food target of the city of its first stop.
      const firstStop = rows.find((row) => !row.dated.day.stops[row.stopIndex]?.listNote);
      body.append(
        dateBudgetCards(
          budget,
          (placeId) => {
            const found = placesHere.find((place) => place.id === placeId);
            return found ? pickLocale(locale, found.name) : placeId;
          },
          formatDayTitle(date, locale),
          locale,
          firstStop?.dated.city.budget?.food,
          (placeId) => receiptStops.get(placeId),
        ),
      );
      // One list per period. A row's list is lists[rowIndex].
      const lists: HTMLOListElement[] = [];
      const timeline = el('div', 'tb-periods');
      const sections = periodSections(periods);
      for (const period of ['morning', 'afternoon', 'evening'] as const) {
        if (sections.some((part) => part.period === period)) continue;
        const next = sections.findIndex((part) => part.period && ['morning', 'afternoon', 'evening'].indexOf(part.period) > ['morning', 'afternoon', 'evening'].indexOf(period));
        sections.splice(next < 0 ? sections.length : next, 0, { period, rows: [] });
      }
      for (const part of sections) {
        const list = el('ol', 'tb-list tb-timeline');
        for (const index of part.rows) lists[index] = list;
        const block = part.period
          ? periodBlock(date, part.period, part.rows.map((index) => rows[index]!), list, past, locale)
          : list;
        const reviewDays = daysHere.map(({ day }) => day).filter((day) => day.line).sort((a, b) => a.line! - b.line!);
        if (part.period && reviewDays.length) {
          const period = part.period;
          const review = statusButton(reviewDays[0]!.line!, period, reviewDays.every((day) => closedPeriods(day).includes(period)), (on) => {
            for (const day of reviewDays) day.closedPeriods = on ? [...new Set([...closedPeriods(day), period])] : closedPeriods(day).filter((saved) => saved !== period);
          }, reviewDays.at(-1)!.line!, reviewDays.length);
          review.dataset.dayAction = `review-${period}`;
          const syncPeriod = () => {
            review.disabled = rows.some((row, index) => periods[index] === period && isTentative(row.dated.day.stops[row.stopIndex]!));
            const closed = !review.disabled && reviewDays.every((day) => closedPeriods(day).includes(period));
            review.setAttribute('aria-pressed', String(closed));
            review.replaceChildren(icon(closed ? 'check' : 'check_circle', { size: 16 }));
            review.dataset.tip = review.disabled
              ? pickLocale(locale, { en: 'Confirm this period’s places first', 'pt-BR': 'Confirme os lugares deste período primeiro' })
              : review.getAttribute('aria-label')!;
          };
          statusSync.push(syncPeriod);
          syncPeriod();
          block.querySelector('.tb-period__label')?.after(review);
        }
        timeline.append(block);
      }
      body.append(timeline);
      let previousEnd: { id: string; lat: number; lng: number; leg?: TripLeg } | null = null;
      let railAbove: { mode: 'none' | 'walk' | 'transit'; color: string | null } = {
        mode: 'none',
        color: null,
      };
      // A stop's legs and its open slot wait for the next stop, so the notes after the stop
      // (a park's rides at their times) come first, in the order of the day.
      let pendingHop: (() => void) | null = null;
      const flushHop = () => {
        pendingHop?.();
        pendingHop = null;
      };
      // A park's rides: the timed notes right under a stop that name its sub-points hang on
      // those points (timeline list and place card), not on the timeline as paragraphs.
      const subNotesByRow = new Map<number, SubPointNote[]>();
      const parkNotesByRow = new Map<number, { time?: string; text: string }[]>();
      const attachedRows = new Set<number>();
      rows.forEach((entry, rowIndex) => {
        const stop = entry.dated.day.stops[entry.stopIndex];
        if (!stop || stop.listNote || !stop.placeId) return;
        const place = placeById(entry.dated.city.slug, stop.placeId);
        if (!place) return;
        const { attached, loose } = notesUnderStop(rows, rowIndex, place);
        // Under a park, every note goes to its card. Under any other place, only a `+N km` note does.
        const toCard = place.subPoints?.length ? loose : loose.filter((note) => isExtraWalkNote(note.text));
        if (attached.length) subNotesByRow.set(rowIndex, attached.map(({ index: _index, ...note }) => note));
        if (toCard.length) parkNotesByRow.set(rowIndex, toCard.map(({ index: _index, ...note }) => note));
        for (const note of [...attached, ...toCard]) attachedRows.add(note.index);
        if (attached.length || toCard.length) {
          subNotesByPlace.set(place.id, { sub: subNotesByRow.get(rowIndex) ?? [], park: parkNotesByRow.get(rowIndex) ?? [] });
        }
      });
      rows.forEach((entry, rowIndex) => {
        const city = entry.dated.city;
        const day = entry.dated.day;
        const dayIndex = entry.dated.dayIndex;
        const stop = day.stops[entry.stopIndex];
        if (!stop) return;
        const stopIndex = entry.stopIndex;
        const record = getTripCity(city.slug);
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
          // Attached to a sub-point above: the point's row and the place card show it.
          if (attachedRows.has(rowIndex)) return;
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
          if (carryingLuggage.has(stop)) noteItem.append(stopCostEl({ id: key, food: 0, ticket: 0 }, locale, null, true));
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
        const subNotes = subNotesByRow.get(rowIndex) ?? [];
        const parkNotes = parkNotesByRow.get(rowIndex) ?? [];
        const cardLinks = (focusSub?: number) => ({
          ...(href ? { maps: href } : {}),
          ...(directions ? { route: directions } : {}),
          ...(subNotes.length ? { subNotes } : {}),
          ...(parkNotes.length ? { parkNotes } : {}),
          ...(focusSub != null ? { focusSub } : {}),
        });
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
                  activatePlace(map, place, placeCity(place.id, record), locale, origin, cardLinks());
                }
              : undefined,
        });
        const revealReceiptStop = (control: HTMLElement | null) => {
          closePlace({ focus: false });
          details.open = true;
          const period = item.closest('details.tb-period');
          if (period instanceof HTMLDetailsElement) period.open = true;
          releaseLeg();
          clearStopCurrent();
          item.setAttribute('aria-current', 'true');
          requestAnimationFrame(() => {
            item.scrollIntoView({ block: 'center' });
            control?.focus({ preventScroll: true });
          });
        };
        if (place && !receiptStops.has(place.id)) {
          receiptStops.set(place.id, {
            time: stop.time,
            select: () => revealReceiptStop(item.querySelector<HTMLElement>('.tb-row__main')),
          });
        }
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
        // A park's chip adds what its sub-points cost (the restaurants inside it).
        const costs = (place ? [place.id, ...(place.subPoints ?? []).map((sub) => sub.placeId)] : []).flatMap((id) => {
          const line = id ? stopCosts.get(id) : undefined;
          if (line) stopCosts.delete(line.id);
          return line ? [line] : [];
        });
        const sunset = sunsetTip(authored, locale);
        if (costs.length || (place && sunset) || carryingLuggage.has(stop)) {
          const sum = (kind: 'food' | 'ticket') => costs.reduce((total, line) => total + line[kind], 0);
          item.append(stopCostEl({ id: place?.id ?? key, food: sum('food'), ticket: sum('ticket') }, locale, sunset, carryingLuggage.has(stop)));
        }
        if (place?.subPoints?.length && !missingPlace) {
          // The points in one line, and a toggle that lists them as small dots in the parent's color.
          const subs = place.subPoints;
          const points = el('ol', 'tb-substops');
          const color = placeCategoryMeta[place.category].color;
          // In the order the day walks them; a revisit shows again with its own time.
          const visits = walkOrder(subs.length, subNotes);
          const seenSub = new Map<number, number>();
          visits.forEach((index) => {
            const sub = subs[index]!;
            const nth = seenSub.get(index) ?? 0;
            seenSub.set(index, nth + 1);
            const timed = subNotes.filter((candidate) => candidate.sub === index && candidate.time).sort((a, b) => a.time!.localeCompare(b.time!));
            const note = timed[nth] ?? subNotes.find((candidate) => candidate.sub === index);
            const point = el('li', 'tb-substop');
            const dot = el('span', 'tb-substop__dot');
            dot.style.setProperty('--subpoint-color', color);
            const name = el('button', 'tb-substop__name', pickLocale(locale, sub.name));
            name.type = 'button';
            if (sub.aiSuggested) name.append(aiBadge(pickLocale(locale, { en: 'Suggested by AI', 'pt-BR': 'Sugerido pela IA' })));
            if (record) {
              // Opens the place card on this point: its photo and what the trip says about it.
              name.addEventListener('click', () => {
                releaseLeg();
                clearStopCurrent();
                item.setAttribute('aria-current', 'true');
                activatePlace(map, place, placeCity(place.id, record), locale, name, cardLinks(index));
              });
            }
            if (subNotes.some((candidate) => candidate.time)) point.append(el('span', 'tb-substop__time', note?.time ?? ''));
            if (sub.placeId && !receiptStops.has(sub.placeId)) {
              receiptStops.set(sub.placeId, {
                time: note?.time,
                select: () => revealReceiptStop(name),
              });
            }
            point.append(dot, name);
            points.append(point);
          });
          // Without a single time in the list, the time column goes too.
          if (!subNotes.some((note) => note.time)) points.classList.add('is-untimed');
          item.append(points);
        }
        item.querySelector('.tb-row__actions')?.append(stopStatus(stop), comments(item, stop, city.slug));
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
        // Like the map: leave a place from its last sub-point, reach the next at its first.
        const exit = place?.subPoints?.at(-1) ?? place;
        const entryPoint = nextPlace?.subPoints?.[0] ?? nextPlace;
        const routeHop =
          place && nextPlace && exit && entryPoint
            ? {
                from: { id: place.id, lat: exit.lat, lng: exit.lng },
                to: { id: nextPlace.id, lat: entryPoint.lat, lng: entryPoint.lng },
                ...(entry.depart ? { via: entry.depart } : {}),
              }
            : null;
        const drawn = routeHop != null && planHop(routeHop).kind !== 'none';
        // Arriving and leaving the same place (the rest at home) is no walk.
        const samePlace = place != null && nextPlace != null && place.id === nextPlace.id;
        let legs = routeHop ? transferLegs(routeHop) : entry.depart ? [entry.depart] : [];
        if (legs.length === 0 && drawn && routeHop && place && nextPlace && !samePlace) {
          const walk: ItineraryLegDef = { from: place.id, to: nextPlace.id, mode: 'walk' };
          legs = [{ ...walk, durationMin: estimateLegDurationMin(walk, routeHop.from, routeHop.to) }];
        }
        // An authored bus + walk without catalog geometry still has a separate final walk.
        if (legs.length === 1 && entry.depart?.mode === 'transit' && /caminhada/i.test(entry.depart.detail)) {
          const ride = departureTimes(legs, date, stop.time, nextStop?.time, stop.boardings)[0];
          const walkMin = (entry.depart.durationMin ?? 0) - (ride?.durationMin ?? 0);
          if (ride?.verified && walkMin > 1) legs.push({ mode: 'walk', detail: `a pé · ${walkMin} min`, durationMin: walkMin });
        }
        const allTimings = departureTimes(legs, date,
          subNotes.filter(note => note.time).at(-1)?.time ?? stop.time, nextStop?.time, stop.boardings, stop.departureTime);
        const timings = allTimings.filter((_, index) => timelineLegs([legs[index]!]).length > 0);
        legs = timelineLegs(legs);
        // A `via:` price is what the week pass does not cover. It sits on the leg's own row
        // or, when the leg is split into parts, on the first ride: where you pay.
        const fare = entry.depart?.fareEur ?? 0;
        const own = entry.depart ? legs.indexOf(entry.depart) : -1;
        const fareAt = fare > 0 ? (own >= 0 ? own : Math.max(0, legs.findIndex((leg) => leg.mode !== 'walk'))) : -1;
        const noteAt = entry.depart?.note
          ? (own >= 0 ? own : Math.max(0, legs.findIndex((leg) => leg.mode !== 'walk')))
          : -1;
        const rails = legs.map((leg) => {
          const mode = leg.mode === 'walk' ? 'walk' : 'transit';
          const branded = 'color' in leg && typeof leg.color === 'string' ? leg.color : null;
          const color = branded ?? (mode === 'walk' ? walkColor() : neutralColor());
          return { mode, color } as const;
        });
        const walk = { mode: 'walk' as const, color: walkColor() };
        // A ride comes to the door where you sleep. Elsewhere (an airport café) you walk to the pickup.
        const doorToDoor = legs[0]?.mode === 'taxi' && place?.category === 'lodging';
        const hopPlan =
          hopRails(rails, walk, doorToDoor) ??
          (nextPlace && !samePlace ? { depart: walk, parts: [], arrive: walk } : null);
        // A hop into the next period opens that period's list, like the portfolio.
        // The rail still runs down to that period, so the two read as one line.
        const crosses = nextIndex >= 0 && lists[nextIndex] !== lists[rowIndex];
        const hopList = crosses ? lists[nextIndex]! : lists[rowIndex]!;
        item.dataset.railAbove = railAbove.mode;
        item.dataset.railBelow = hopPlan?.depart.mode ?? 'none';
        const notesAfter = rows.some((_, index) => index > rowIndex && index < nextIndex && lists[index] === lists[rowIndex]);
        item.classList.toggle('is-period-end', crosses && hopPlan != null && !notesAfter);
        if (railAbove.color) item.style.setProperty('--rail-above', railAbove.color);
        if (hopPlan) item.style.setProperty('--rail-below', hopPlan.depart.color);
        flushHop();
        lists[rowIndex]!.append(item);
        const appendHop = () => rails.forEach((rail, index) => {
          const transfer = transferRow(legs[index]!, locale, timings[index]);
          if (index === noteAt) editLegNote(transfer, entry.depart, city.slug);
          if (index === fareAt) {
            const cost = stopCostEl({ id: '', food: 0, ticket: fare }, locale);
            transfer.append(cost);
            // The row is named by its aria-label, so the fare joins it.
            transfer.setAttribute(
              'aria-label',
              `${transfer.getAttribute('aria-label')}, ${cost.firstElementChild?.getAttribute('aria-label')}`,
            );
          }
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
        const open = isOpenSlot({
          time: stop.time,
          nextTime: nextStop?.time,
          stayMin: place ? resolveVisit(place.id, place.visit)?.durationMax : undefined,
          legMin: legs.reduce((sum, leg) => sum + (leg.durationMin ?? 0), 0),
          samePlace,
        });
        pendingHop = () => {
          appendHop();
          // At the end of the stop's period; inside a period, just before the next stop, on the rail.
          if (open) (crosses ? lists[rowIndex]! : hopList).append(openSlotRow(locale, crosses ? null : (hopPlan?.arrive ?? null)));
        };
        railAbove = hopPlan?.arrive ?? { mode: 'none', color: null };
      });
      flushHop();
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
          const leaving = transferRow(dated.city.leg, locale);
          editLegNote(leaving, dated.city.leg, dated.city.slug);
          via.append(leaving);
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
        // The other open cards stay open. This one goes on the map, or leaves it.
        // `toggle` fires after the change, so "was on the map" reads the order, not the DOM.
        const wasOnMap = openOrder.at(-1) === date && !routeHidden.has(date);
        openOrder = openOrder.filter((other) => other !== date);
        if (details.open) {
          routeHidden.delete(date);
          openOrder.push(date);
        }
        // Opening frames the day, unless a pin opened it. Closing the day on the map frames the one it hands the map to.
        const fitDay = details.open ? !pinPick : !openDate() || (wasOnMap && routedDate() !== null);
        pinPick = false;
        syncView(fitDay);
      });
      article.append(details);
    }

    if (dailyBudgets.length) article.prepend(averageBudgetCards(dailyBudgets, locale));
    if (!checklist || checklistLocale !== locale) {
      checklist = tripChecklist(id, locale, (open) => { editing = open || Boolean(checklist?.querySelector('[data-checklist-editor]')); });
      checklistLocale = locale;
    }
    main.append(head, tripTabs(article, checklist, selectedTab, (index) => { selectedTab = index; }, locale), article, checklist);
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
    paintWalks(trip);
    refreshWalks(trip);
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

  // A route dot of a park's point: the parent's card, open on that point.
  const offSubPoint = map.onSubPoint((parentId, index) => {
    const trip = current;
    if (!trip) return;
    for (const city of trip.cities) {
      const record = getTripCity(city.slug);
      const place = record ? placeById(city.slug, parentId) : undefined;
      if (!record || !place) continue;
      const notes = subNotesByPlace.get(parentId);
      activatePlace(map, place, placeCity(place.id, record), shell.locale(), null, {
        focusSub: index,
        ...(notes?.sub.length ? { subNotes: notes.sub } : {}),
        ...(notes?.park.length ? { parkNotes: notes.park } : {}),
      });
      return;
    }
  });
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
    // Home shows up on most dates. The row of the card on the map wins, then any open card's.
    const onMap = openDate();
    const item =
      (onMap ? main.querySelector<HTMLElement>(`details.tb-date[data-date="${CSS.escape(onMap)}"] ${selector}`) : null) ??
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
      const record = getTripCity(city.slug);
      const place = record?.places.find((entry) => entry.id === pinId);
      if (!record || !place) continue;
      const origin = item?.querySelector<HTMLElement>('.tb-row__main') ?? null;
      activatePlace(map, place, placeCity(place.id, record), shell.locale(), origin);
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
      offSubPoint();
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

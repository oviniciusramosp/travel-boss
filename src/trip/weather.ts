import { appRequest } from '../platform/request';
/**
 * Ensemble forecast from Open-Meteo: free, no key, 16 days ahead, with EC46 trends beyond. ECMWF (51 runs)
 * and NOAA GEFS (31 runs) side by side, so the chance of rain is the share of runs
 * that rain, and one run changing its mind moves it by about 1%, not from sun to rain.
 * Times come back on the city's own clock, the same one the trip is written in.
 */
import { pickLocale, type Locale, type LString } from '../catalog';
import type { Period } from './day-plan';
import { shiftIso } from './dates';
import { getTripCity, placeCity } from './catalog';
import type { WeatherIcon } from '../ui/weather-icons';

import { parseEnsemble, type Ensemble, type Member } from './weather-source';
export { parseEnsemble, type Ensemble, type Member };

/** Excursions use the place's own city; a day without places uses its trip heading. */
export function weatherCity(slug: string, placeId?: string) {
  const city = getTripCity(slug);
  return city && placeId ? placeCity(placeId, city) : city;
}

/**
 * The dev server (`/api/weather`, see vite.config.ts) fetches once per city per half hour for
 * every open tab and session, keeps the answer on disk, and falls back to MET Norway when
 * Open-Meteo is out of quota. The browser never calls the providers itself.
 */
const FORECAST_URL = '/api/weather';
// ponytail: one request per city per half hour; the ensembles run every 6 hours.
const FRESH_MS = 30 * 60 * 1000;

/** Median low and high, chance of rain in %, median rain of the runs that rain, median cloud. */
/** `runs` is how many members covered the window: with one (a single model) `rain` is 0 or 100 and not a chance. */
export type Weather = { min: number; max: number; rain: number; mm: number; cloud: number; hours: number; runs: number; extended?: boolean };

type Entry = {
  /** When the last request started; 0 for a forecast read from storage, so the next load refreshes it. */
  at: number;
  /** When the forecast in `hours` came from the API. */
  fetchedAt: number | null;
  hours: Ensemble | null;
  loading: boolean;
  /** The last request brought nothing; `hours` is what was already known. */
  failed: boolean;
  /** Why it failed, for the message: the API's daily limit, no network, or another HTTP status. */
  error: FailureKind | null;
  /** Who made the forecast in `hours`: `Open-Meteo` or `MET Norway`. */
  source: string | null;
  request: Promise<Ensemble | null>;
};

export type FailureKind = 'limit' | 'network' | 'http';

/** 429 is Open-Meteo's daily limit; no status at all is the network. */
export function failureKind(status: number | null): FailureKind {
  if (status == null) return 'network';
  return status === 429 ? 'limit' : 'http';
}
const cache = new Map<string, Entry>();

/** What the card needs beyond the hours: is it loading, did the last refresh fail, when is it from. */
export type ForecastState = {
  hours: Ensemble | null;
  fetchedAt: number | null;
  loading: boolean;
  failed: boolean;
  error: FailureKind | null;
  source: string | null;
};

/** The last forecast of each point survives a reload, so the card has something while the API is down. */
const STORAGE_KEY = 'tb:weather';

function storage(): Storage | null {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage;
  } catch {
    return null;
  }
}

/** One decimal is all the card reads; it keeps three cities under a megabyte of storage. */
export function packForecast(hours: Ensemble): string {
  const round = (list: (number | null)[]) => list.map((value) => (value == null ? null : Math.round(value * 10) / 10));
  return JSON.stringify({
    time: hours.time,
    ...(hours.extendedFrom ? { extendedFrom: hours.extendedFrom } : {}),
    members: hours.members.map((member) => ({ temp: round(member.temp), rain: round(member.rain), cloud: round(member.cloud) })),
  });
}

/** Null unless the text is a whole ensemble. */
export function unpackForecast(text: string | null): Ensemble | null {
  if (!text) return null;
  try {
    const data = JSON.parse(text) as { time?: unknown; members?: unknown; extendedFrom?: unknown };
    if (!Array.isArray(data.time) || !data.time.every((item) => typeof item === 'string')) return null;
    if (!Array.isArray(data.members) || !data.members.length) return null;
    const length = data.time.length;
    const column = (list: unknown) =>
      Array.isArray(list) && list.length === length && list.every((value) => value === null || typeof value === 'number');
    if (!data.members.every((member: Member) => column(member.temp) && column(member.rain) && column(member.cloud))) return null;
    return { time: data.time as string[], members: data.members as Member[], ...(typeof data.extendedFrom === 'string' ? { extendedFrom: data.extendedFrom } : {}) };
  } catch {
    return null;
  }
}

function readStored(key: string): Entry | null {
  const store = storage();
  if (!store) return null;
  const at = Number(store.getItem(`${STORAGE_KEY}:${key}:at`));
  const hours = unpackForecast(store.getItem(`${STORAGE_KEY}:${key}`));
  if (!hours || !Number.isFinite(at) || at <= 0) return null;
  const source = store.getItem(`${STORAGE_KEY}:${key}:source`);
  const entry: Entry = { at: 0, fetchedAt: at, hours, loading: false, failed: false, error: null, source, request: Promise.resolve(hours) };
  cache.set(key, entry);
  return entry;
}

function writeStored(key: string, at: number, hours: Ensemble, source: string | null): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(`${STORAGE_KEY}:${key}`, packForecast(hours));
    store.setItem(`${STORAGE_KEY}:${key}:at`, String(at));
    if (source) store.setItem(`${STORAGE_KEY}:${key}:source`, source);
  } catch {
    /* Quota: the session cache still has it. */
  }
}

const keyOf = (lat: number, lng: number) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

/**
 * Forecast of a point, fetched at most once per half hour unless `force`. A failure keeps
 * the last one, from this session or from storage, and marks the entry as failed.
 */
export function loadForecast(lat: number, lng: number, timeZone: string, force = false): Promise<Ensemble | null> {
  const key = keyOf(lat, lng);
  const hit = cache.get(key) ?? readStored(key);
  if (hit && (hit.loading || (!force && Date.now() - hit.at < FRESH_MS))) return hit.request;
  const params = new URLSearchParams({ lat: String(lat), lng: String(lng), tz: timeZone, ...(force ? { force: '1' } : {}) });
  const entry: Entry = {
    at: Date.now(),
    fetchedAt: hit?.fetchedAt ?? null,
    hours: hit?.hours ?? null,
    loading: true,
    failed: false,
    error: null,
    source: hit?.source ?? null,
    request: Promise.resolve(null),
  };
  let status: number | null = null;
  let kind: FailureKind | null = null;
  entry.request = appRequest(`${FORECAST_URL}?${params}`)
    .then((response) => {
      status = response.status;
      return response.json().catch(() => null);
    })
    .then((body: unknown) => {
      const answer = body as { hours?: unknown; at?: unknown; source?: unknown; stale?: unknown; error?: unknown } | null;
      // The server says why it could not refresh, with or without an older forecast to show.
      if (answer && typeof answer.error === 'string') kind = answer.error as FailureKind;
      const hours = answer && !answer.stale ? readEnsemble(answer.hours) : null;
      const at = typeof answer?.at === 'number' ? answer.at : Date.now();
      const source = typeof answer?.source === 'string' ? answer.source : null;
      return hours ? { hours, at, source } : null;
    })
    .catch(() => null)
    .then((fresh) => {
      entry.loading = false;
      if (fresh) {
        entry.hours = fresh.hours;
        entry.fetchedAt = fresh.at;
        entry.source = fresh.source;
        entry.error = null;
        writeStored(key, fresh.at, fresh.hours, fresh.source);
      } else {
        entry.failed = true;
        entry.error = kind ?? failureKind(status);
      }
      return entry.hours;
    });
  cache.set(key, entry);
  return entry.request;
}

/** The forecast already in hand, so a repaint draws it at once. */
export function peekForecast(lat: number, lng: number): Ensemble | null {
  return forecastState(lat, lng).hours;
}

export function forecastState(lat: number, lng: number): ForecastState {
  const key = keyOf(lat, lng);
  const hit = cache.get(key) ?? readStored(key);
  return {
    hours: hit?.hours ?? null,
    fetchedAt: hit?.fetchedAt ?? null,
    loading: hit?.loading ?? false,
    failed: hit?.failed ?? false,
    error: hit?.error ?? null,
    source: hit?.source ?? null,
  };
}

/** An ensemble the server sent, if it has the shape. */
function readEnsemble(value: unknown): Ensemble | null {
  return unpackForecast(typeof value === 'string' ? value : JSON.stringify(value ?? null));
}

/** `14:32` today, else `26/09 14:32` (en `09/26 14:32`), in the reader's clock. */
export function updatedLabel(fetchedAt: number, locale: Locale, now = new Date()): string {
  const date = new Date(fetchedAt);
  const clock = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  if (date.toDateString() === now.toDateString()) return clock;
  return `${date.toLocaleDateString(locale, { day: '2-digit', month: '2-digit' })} ${clock}`;
}

/** Condition, rain probability and update; extended data also states its lower confidence. */
export function weatherTip(
  weather: Weather,
  label: LString,
  locale: Locale,
  _window: readonly [number, number] | undefined,
  fetchedAt: number | null,
  _failed: boolean,
  now = new Date(),
  _source: string | null = null,
): string {
  const rain = weather.runs > 1
    ? pickLocale(locale, { en: `Rain chance ${Math.round(weather.rain)}%`, 'pt-BR': `Chance de chuva ${Math.round(weather.rain)}%` })
    : pickLocale(locale, { en: 'Rain chance unavailable', 'pt-BR': 'Chance de chuva indisponível' });
  const updated = fetchedAt == null
    ? pickLocale(locale, { en: 'Update time unavailable', 'pt-BR': 'Horário de atualização indisponível' })
    : pickLocale(locale, { en: `Updated ${updatedLabel(fetchedAt, locale, now)}`, 'pt-BR': `Atualizado às ${updatedLabel(fetchedAt, locale, now)}` });
  const trend = weather.extended ? pickLocale(locale, {
    en: '\nLong-range trend · lower confidence', 'pt-BR': '\nTendência de longo prazo · menor confiança',
  }) : '';
  return `${pickLocale(locale, label)} · ${rain}\n${updated}${trend}`;
}

/** Clock hours of each period, start in, end out. */
export const WINDOWS: Record<Period, [number, number]> = {
  morning: [7, 12],
  afternoon: [12, 18],
  evening: [18, 23],
};

// Met Office "rain day": 0.2 mm is the least a gauge counts as rain.
const WET_MM = 0.2;

function median(list: number[]): number {
  const sorted = [...list].sort((a, b) => a - b);
  const mid = sorted.length / 2;
  return sorted.length % 2 ? (sorted[Math.floor(mid)] ?? 0) : ((sorted[mid - 1] ?? 0) + (sorted[mid] ?? 0)) / 2;
}

/** One window of a date across every run. Null past the forecast. */
export function weatherIn(ensemble: Ensemble, date: string, window: readonly [number, number]): Weather | null {
  const [from, to] = window;
  const stamp = (hour: number) => `${shiftIso(date, Math.floor(hour / 24))}T${String(hour % 24).padStart(2, '0')}:00`;
  const hours = Array.from({ length: to - from }, (_, index) => from + index);
  const at = hours.map((hour) => ensemble.time.indexOf(stamp(hour)));
  // Rain is stamped at the end of its hour.
  const rainAt = hours.map((hour) => ensemble.time.indexOf(stamp(hour + 1)));
  const mins: number[] = [];
  const maxes: number[] = [];
  const clouds: number[] = [];
  const wet: number[] = [];
  let runs = 0;
  for (const member of ensemble.members) {
    const temps = at.flatMap((index) => member.temp[index] ?? []);
    if (temps.length < hours.length) continue;
    runs += 1;
    mins.push(Math.min(...temps));
    maxes.push(Math.max(...temps));
    clouds.push(at.reduce((sum, index) => sum + (member.cloud[index] ?? 0), 0) / hours.length);
    const mm = rainAt.reduce((sum, index) => sum + (member.rain[index] ?? 0), 0);
    if (mm >= WET_MM) wet.push(mm);
  }
  if (!runs) return null;
  return {
    min: median(mins),
    max: median(maxes),
    rain: (100 * wet.length) / runs,
    mm: wet.length ? median(wet) : 0,
    cloud: median(clouds),
    hours: hours.length,
    runs,
    ...(ensemble.extendedFrom && [...at, ...rainAt].some((index) => ensemble.time[index]! >= ensemble.extendedFrom!) ? { extended: true } : {}),
  };
}

// ponytail: calibration knobs. The NWS words: from 30% rain is a "chance", from 60%
// it is "likely". The rate is the median rain of the runs that rain, over the window.
const MAYBE_FROM = 30;
const LIKELY_FROM = 60;
const DRIZZLE_BELOW_MM_H = 0.2;
const HEAVY_FROM_MM_H = 1.5;

/** 0 dry, 1 may rain, 2 drizzle, 3 rain, 4 heavy rain. */
function rainTier(weather: Weather): number {
  if (weather.rain < MAYBE_FROM) return 0;
  if (weather.rain < LIKELY_FROM) return 1;
  const rate = weather.mm / weather.hours;
  if (rate < DRIZZLE_BELOW_MM_H) return 2;
  return rate < HEAVY_FROM_MM_H ? 3 : 4;
}

/**
 * The day as its periods: their whole range, and the sky and chance of the rainiest,
 * so the day never shows rain that no period shows. A dry day reads their mean cloud.
 */
export function dayWeather(parts: readonly Weather[]): Weather | null {
  const first = parts[0];
  if (!first) return null;
  const rank = (weather: Weather) => rainTier(weather) * 1000 + weather.rain;
  const wettest = parts.reduce((best, part) => (rank(part) > rank(best) ? part : best), first);
  return {
    ...wettest,
    ...(parts.some((part) => part.extended) ? { extended: true } : {}),
    min: Math.min(...parts.map((part) => part.min)),
    max: Math.max(...parts.map((part) => part.max)),
    cloud: rainTier(wettest) ? wettest.cloud : parts.reduce((sum, part) => sum + part.cloud, 0) / parts.length,
  };
}

/** A glyph from the pack and its word. Below a 30% chance only the sky shows. */
export function weatherLook(weather: Weather, night = false): { icon: WeatherIcon; label: LString } {
  switch (rainTier(weather)) {
    case 4:
      return { icon: 'cloud-showers-heavy', label: { en: 'Heavy rain', 'pt-BR': 'Chuva forte' } };
    case 3:
      return { icon: 'cloud-showers', label: { en: 'Rain', 'pt-BR': 'Chuva' } };
    case 2:
      return { icon: 'cloud-rain', label: { en: 'Drizzle', 'pt-BR': 'Garoa' } };
    case 1:
      return { icon: night ? 'cloud-moon-rain' : 'cloud-sun-rain', label: { en: 'Chance of rain', 'pt-BR': 'Pode chover' } };
  }
  // NWS sky cover: up to 2/8 is sunny, 3–5/8 partly, 6–7/8 mostly cloudy, 8/8 cloudy.
  if (weather.cloud >= 87.5) return { icon: 'clouds', label: { en: 'Cloudy', 'pt-BR': 'Nublado' } };
  if (weather.cloud >= 62.5) {
    return { icon: night ? 'clouds-moon' : 'clouds-sun', label: { en: 'Mostly cloudy', 'pt-BR': 'Muitas nuvens' } };
  }
  if (weather.cloud >= 25) {
    return { icon: night ? 'cloud-moon' : 'cloud-sun', label: { en: 'Partly cloudy', 'pt-BR': 'Parcialmente nublado' } };
  }
  return { icon: night ? 'moon-stars' : 'sun', label: { en: 'Clear', 'pt-BR': 'Céu limpo' } };
}

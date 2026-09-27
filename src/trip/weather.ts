/**
 * Ensemble forecast from Open-Meteo: free, no key, 16 days ahead. ECMWF (51 runs)
 * and NOAA GEFS (31 runs) side by side, so the chance of rain is the share of runs
 * that rain, and one run changing its mind moves it by about 1%, not from sun to rain.
 * Times come back on the city's own clock, the same one the trip is written in.
 */
import type { LString } from '../catalog';
import type { Period } from './day-plan';
import type { IconName } from '../ui/icons';

const FORECAST_URL = 'https://ensemble-api.open-meteo.com/v1/ensemble';
const MODELS = 'ecmwf_ifs025,gfs05';
// ponytail: one request per city per half hour; the ensembles run every 6 hours.
const FRESH_MS = 30 * 60 * 1000;

/** One run of the ensemble: hourly temperature, rain of the hour before, and cloud cover. */
export type Member = { temp: (number | null)[]; rain: (number | null)[]; cloud: (number | null)[] };
export type Ensemble = { time: string[]; members: Member[] };
/** Median low and high, chance of rain in %, median rain of the runs that rain, median cloud. */
export type Weather = { min: number; max: number; rain: number; mm: number; cloud: number; hours: number };

type Entry = { at: number; hours: Ensemble | null; request: Promise<Ensemble | null> };
const cache = new Map<string, Entry>();

const keyOf = (lat: number, lng: number) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

/** Every `temperature_2m…` column with its `precipitation…` and `cloud_cover…` twins. */
export function parseEnsemble(data: unknown): Ensemble | null {
  const hourly = (data as { hourly?: Record<string, unknown> } | null)?.hourly;
  const time = hourly?.time;
  if (!hourly || !Array.isArray(time)) return null;
  const members: Member[] = [];
  for (const key of Object.keys(hourly)) {
    if (!key.startsWith('temperature_2m')) continue;
    const suffix = key.slice('temperature_2m'.length);
    const columns = [hourly[key], hourly[`precipitation${suffix}`], hourly[`cloud_cover${suffix}`]];
    if (!columns.every((column) => Array.isArray(column) && column.length === time.length)) continue;
    const [temp, rain, cloud] = columns as (number | null)[][];
    members.push({ temp, rain, cloud });
  }
  return members.length ? { time, members } : null;
}

/** Forecast of a point, fetched at most once per half hour. A failure keeps the last one. */
export function loadForecast(lat: number, lng: number, timeZone: string): Promise<Ensemble | null> {
  const key = keyOf(lat, lng);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < FRESH_MS) return hit.request;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    hourly: 'temperature_2m,precipitation,cloud_cover',
    models: MODELS,
    timezone: timeZone,
    forecast_days: '16',
  });
  const entry: Entry = { at: Date.now(), hours: hit?.hours ?? null, request: Promise.resolve(null) };
  entry.request = fetch(`${FORECAST_URL}?${params}`)
    .then((response) => (response.ok ? response.json() : null))
    .then(parseEnsemble)
    .catch(() => null)
    .then((hours) => {
      entry.hours = hours ?? entry.hours;
      return entry.hours;
    });
  cache.set(key, entry);
  return entry.request;
}

/** The forecast already in hand, so a repaint draws it at once. */
export function peekForecast(lat: number, lng: number): Ensemble | null {
  return cache.get(keyOf(lat, lng))?.hours ?? null;
}

/** Clock hours of each period, start in, end out. The day card reads all of them. */
export const WINDOWS: Record<Period | 'day', [number, number]> = {
  morning: [7, 12],
  afternoon: [12, 18],
  evening: [18, 23],
  day: [7, 23],
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
  const stamp = (hour: number) => `${date}T${String(hour).padStart(2, '0')}:00`;
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
  };
}

export type WeatherTone = 'sun' | 'night' | 'cloud' | 'rain';

// ponytail: calibration knobs. Rain wins the glyph from half the runs up; the rate
// is the median rain of the runs that rain, spread over the window.
const RAIN_ICON_FROM = 50;
const DRIZZLE_BELOW_MM_H = 0.2;
const HEAVY_FROM_MM_H = 1.5;

/** A glyph, a word and the tone that colors the glyph. */
export function weatherLook(weather: Weather, night = false): { icon: IconName; label: LString; tone: WeatherTone } {
  if (weather.rain >= RAIN_ICON_FROM) {
    const rate = weather.mm / weather.hours;
    if (rate < DRIZZLE_BELOW_MM_H) return { icon: 'rainy_light', label: { en: 'Drizzle', 'pt-BR': 'Garoa' }, tone: 'rain' };
    if (rate >= HEAVY_FROM_MM_H) return { icon: 'rainy_heavy', label: { en: 'Heavy rain', 'pt-BR': 'Chuva forte' }, tone: 'rain' };
    return { icon: 'rainy', label: { en: 'Rain', 'pt-BR': 'Chuva' }, tone: 'rain' };
  }
  if (weather.cloud >= 70) return { icon: 'cloud', label: { en: 'Cloudy', 'pt-BR': 'Nublado' }, tone: 'cloud' };
  if (weather.cloud >= 30) {
    return {
      icon: night ? 'partly_cloudy_night' : 'partly_cloudy_day',
      label: { en: 'Partly cloudy', 'pt-BR': 'Parcialmente nublado' },
      tone: night ? 'night' : 'sun',
    };
  }
  return {
    icon: night ? 'clear_night' : 'clear_day',
    label: { en: 'Clear', 'pt-BR': 'Céu limpo' },
    tone: night ? 'night' : 'sun',
  };
}

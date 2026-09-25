/**
 * Hourly forecast from Open-Meteo: free, no key, refreshed every hour, 16 days ahead.
 * Times come back on the city's own clock, the same one the trip is written in.
 */
import type { LString } from '../catalog';
import type { IconName } from '../ui/icons';

const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
// ponytail: one request per city per half hour; Open-Meteo updates hourly.
const FRESH_MS = 30 * 60 * 1000;

export type Hourly = { time: string[]; temp: number[]; rain: number[]; code: number[] };
/** Temperature range, the highest chance of rain, and the worst WMO code of a span. */
export type Weather = { min: number; max: number; rain: number; code: number };

type Entry = { at: number; hours: Hourly | null; request: Promise<Hourly | null> };
const cache = new Map<string, Entry>();

const keyOf = (lat: number, lng: number) => `${lat.toFixed(3)},${lng.toFixed(3)}`;

/** Open-Meteo `hourly` with arrays of one length, or null. */
export function parseHourly(data: unknown): Hourly | null {
  const hourly = (data as { hourly?: Record<string, unknown> } | null)?.hourly;
  const time = hourly?.time;
  const temp = hourly?.temperature_2m;
  const rain = hourly?.precipitation_probability;
  const code = hourly?.weather_code;
  if (!Array.isArray(time) || !Array.isArray(temp) || !Array.isArray(rain) || !Array.isArray(code)) return null;
  if (temp.length !== time.length || rain.length !== time.length || code.length !== time.length) return null;
  return { time, temp, rain, code };
}

/** Forecast of a point, fetched at most once per half hour. A failure keeps the last one. */
export function loadForecast(lat: number, lng: number, timeZone: string): Promise<Hourly | null> {
  const key = keyOf(lat, lng);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < FRESH_MS) return hit.request;
  const params = new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    hourly: 'temperature_2m,precipitation_probability,weather_code',
    timezone: timeZone,
    forecast_days: '16',
  });
  const entry: Entry = { at: Date.now(), hours: hit?.hours ?? null, request: Promise.resolve(null) };
  entry.request = fetch(`${FORECAST_URL}?${params}`)
    .then((response) => (response.ok ? response.json() : null))
    .then(parseHourly)
    .catch(() => null)
    .then((hours) => {
      entry.hours = hours ?? entry.hours;
      return entry.hours;
    });
  cache.set(key, entry);
  return entry.request;
}

/** The forecast already in hand, so a repaint draws it at once. */
export function peekForecast(lat: number, lng: number): Hourly | null {
  return cache.get(keyOf(lat, lng))?.hours ?? null;
}

function widen(a: Weather | null, b: Weather): Weather {
  if (!a) return b;
  return {
    min: Math.min(a.min, b.min),
    max: Math.max(a.max, b.max),
    rain: Math.max(a.rain, b.rain),
    code: Math.max(a.code, b.code),
  };
}

/** Hours `from`–`to` of `date`, by the hour, both ends in. Null past the forecast. */
export function weatherBetween(hours: Hourly, date: string, from: string, to: string): Weather | null {
  const start = `${date}T${from.slice(0, 2)}:00`;
  const end = `${date}T${to.slice(0, 2)}:00`;
  let out: Weather | null = null;
  for (let index = 0; index < hours.time.length; index += 1) {
    const time = hours.time[index] ?? '';
    const temp = hours.temp[index];
    if (time < start || time > end || typeof temp !== 'number') continue;
    out = widen(out, { min: temp, max: temp, rain: hours.rain[index] ?? 0, code: hours.code[index] ?? 0 });
  }
  return out;
}

/** Several spans as one: lowest low, highest high, highest rain, worst sky. */
export function mergeWeather(list: readonly (Weather | null)[]): Weather | null {
  let out: Weather | null = null;
  for (const item of list) if (item) out = widen(out, item);
  return out;
}

export type WeatherTone = 'sun' | 'night' | 'cloud' | 'rain' | 'snow' | 'storm';

/**
 * WMO code to a glyph, a word and the tone that colors the glyph. Codes grow with
 * severity, so the worst hour is the highest code.
 */
export function weatherLook(code: number, night = false): { icon: IconName; label: LString; tone: WeatherTone } {
  if (code >= 95) return { icon: 'thunderstorm', label: { en: 'Thunderstorm', 'pt-BR': 'Tempestade' }, tone: 'storm' };
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { icon: 'weather_snowy', label: { en: 'Snow', 'pt-BR': 'Neve' }, tone: 'snow' };
  }
  if (code >= 51) {
    const label = code < 60 ? { en: 'Drizzle', 'pt-BR': 'Garoa' } : { en: 'Rain', 'pt-BR': 'Chuva' };
    return { icon: 'rainy', label, tone: 'rain' };
  }
  if (code >= 45) return { icon: 'foggy', label: { en: 'Fog', 'pt-BR': 'Neblina' }, tone: 'cloud' };
  if (code === 3) return { icon: 'cloud', label: { en: 'Cloudy', 'pt-BR': 'Nublado' }, tone: 'cloud' };
  if (code === 2) {
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

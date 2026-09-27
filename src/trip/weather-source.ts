/**
 * Forecast sources, shaped for the card: an ensemble of hourly runs (temperature, rain of
 * the hour before, cloud cover). Open-Meteo gives real runs; MET Norway gives one model,
 * so its hours become a single run. No DOM here: the dev server imports this file too.
 */

/** One run of the ensemble: hourly temperature, rain of the hour before, and cloud cover. */
export type Member = { temp: (number | null)[]; rain: (number | null)[]; cloud: (number | null)[] };
export type Ensemble = { time: string[]; members: Member[] };

export const OPEN_METEO_URL = 'https://ensemble-api.open-meteo.com/v1/ensemble';
export const OPEN_METEO_MODELS = 'ecmwf_ifs025,gfs05';
export const MET_URL = 'https://api.met.no/weatherapi/locationforecast/2.0/complete';
/** Open-Meteo's single-model forecast: its quota is separate from the ensemble API's. */
export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export function openMeteoForecastQuery(lat: number, lng: number, timeZone: string): string {
  return new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    hourly: 'temperature_2m,precipitation,cloud_cover,precipitation_probability',
    timezone: timeZone,
    forecast_days: '16',
  }).toString();
}

/** Stand-in runs that carry a probability: with ten, a 30% hour rains in three of them. */
export const STAND_IN_RUNS = 10;

/**
 * One model with a probability of rain, shaped as an ensemble: the same temperature and
 * cloud in every run, and the hour's rain in the first `round(p / 10)` runs. The card then
 * reads the chance as the share of wet runs, in steps of 10%, and the amount as the median
 * of the wet ones, which is the model's amount.
 */
export function forecastToEnsemble(data: unknown): Ensemble | null {
  const hourly = (data as { hourly?: Record<string, unknown> } | null)?.hourly;
  const time = hourly?.time;
  if (!hourly || !Array.isArray(time)) return null;
  const column = (key: string) => {
    const list = hourly[key];
    return Array.isArray(list) && list.length === time.length ? (list as (number | null)[]) : null;
  };
  const temp = column('temperature_2m');
  const rain = column('precipitation');
  const cloud = column('cloud_cover');
  const chance = column('precipitation_probability');
  if (!temp || !rain || !cloud) return null;
  const members: Member[] = Array.from({ length: STAND_IN_RUNS }, (_, run) => ({
    temp,
    cloud,
    rain: rain.map((mm, index) => {
      const p = chance?.[index];
      // Without a probability the model's own amount decides, in every run.
      if (p == null) return mm;
      return run < Math.round(p / (100 / STAND_IN_RUNS)) ? mm : 0;
    }),
  }));
  return { time: time as string[], members };
}

export function openMeteoQuery(lat: number, lng: number, timeZone: string): string {
  return new URLSearchParams({
    latitude: String(lat),
    longitude: String(lng),
    hourly: 'temperature_2m,precipitation,cloud_cover',
    models: OPEN_METEO_MODELS,
    timezone: timeZone,
    forecast_days: '16',
  }).toString();
}

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

type MetSeries = {
  time: string;
  data: {
    instant?: { details?: { air_temperature?: number; cloud_area_fraction?: number } };
    next_1_hours?: { details?: { precipitation_amount?: number } };
    next_6_hours?: { details?: { precipitation_amount?: number } };
  };
};

/** `YYYY-MM-DDTHH:00` on the city's clock, the stamp the card looks up. */
function localStamp(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(iso));
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '00';
  return `${part('year')}-${part('month')}-${part('day')}T${part('hour')}:00`;
}

/**
 * MET Norway's series as one run. The first days come hourly, the rest every six hours:
 * the hours in between take the temperature and cloud of the step before and a sixth of
 * its six-hour rain. Rain is stamped at the end of its hour, like Open-Meteo.
 */
export function metToEnsemble(data: unknown, timeZone: string): Ensemble | null {
  const series = (data as { properties?: { timeseries?: MetSeries[] } } | null)?.properties?.timeseries;
  if (!Array.isArray(series) || series.length < 2) return null;
  const steps = series
    .filter((item) => typeof item?.time === 'string' && item.data?.instant?.details)
    .sort((a, b) => a.time.localeCompare(b.time));
  if (steps.length < 2) return null;
  const time: string[] = [];
  const temp: (number | null)[] = [];
  const rain: (number | null)[] = [];
  const cloud: (number | null)[] = [];
  const hourMs = 3_600_000;
  const rainOfHour: (number | null)[] = [];
  for (let index = 0; index < steps.length; index += 1) {
    const step = steps[index]!;
    const details = step.data.instant?.details ?? {};
    const start = new Date(step.time).getTime();
    const oneHour = step.data.next_1_hours?.details?.precipitation_amount;
    const sixHours = step.data.next_6_hours?.details?.precipitation_amount;
    const next = steps[index + 1];
    const span = next ? Math.round((new Date(next.time).getTime() - start) / hourMs) : oneHour != null ? 1 : 6;
    const hours = Math.max(1, Math.min(6, span));
    const perHour = oneHour ?? (sixHours != null ? Math.round((sixHours / 6) * 1000) / 1000 : null);
    for (let offset = 0; offset < hours; offset += 1) {
      time.push(localStamp(new Date(start + offset * hourMs).toISOString(), timeZone));
      temp.push(details.air_temperature ?? null);
      cloud.push(details.cloud_area_fraction ?? null);
      rainOfHour.push(perHour);
    }
  }
  // Open-Meteo stamps the rain of an hour on the hour that ends it; the first stamp has no hour before.
  for (let index = 0; index < time.length; index += 1) rain.push(index === 0 ? 0 : rainOfHour[index - 1] ?? null);
  return { time, members: [{ temp, rain, cloud }] };
}

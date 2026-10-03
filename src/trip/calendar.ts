import { shiftIso } from './dates';
import { travelCities, pickLocale, type Locale } from '../catalog';
import type { Trip, TripCity, TripDay } from './parse';

export type DatedDay = {
  city: TripCity;
  day: TripDay;
  dayIndex: number;
  date: string;
};

export type DateCity = {
  city: TripCity;
  days: DatedDay[];
};

/** One calendar day. More than one city can share it. */
export type TripDate = {
  date: string;
  cities: DateCity[];
};

/** Display destinations without creating duplicate day groups or changing the city base. */
export function dateCityNames(section: TripDate, locale: Locale): string[] {
  const names = section.cities.flatMap(({ city, days }) => days.flatMap(({ day }) => {
    if (day.cityNames?.length) return day.cityNames;
    return [city.name, ...day.stops.flatMap(stop => {
      const destination = travelCities.find(candidate => candidate.places.some(place => place.id === stop.placeId));
      return destination ? [pickLocale(locale, destination.name)] : [];
    })];
  })).map(name => {
    const city = travelCities.find(candidate => candidate.slug === name || Object.values(candidate.name).includes(name));
    return city ? pickLocale(locale, city.name) : name;
  });
  return [...new Set(names)];
}

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

/** `Dom 4/10` or `11/10` inside a day title. The year comes from the trip. */
function titleDate(title: string, year: number): string | null {
  const match = title.match(/(\d{1,2})\/(\d{1,2})/);
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const iso = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const check = shiftIso(iso, 0);
  return check;
}

function mentionsCity(title: string, city: TripCity): boolean {
  const hay = fold(title);
  return hay.includes(fold(city.name)) || (city.slug.length > 0 && hay.includes(fold(city.slug)));
}

/**
 * Authored days in order. A date written in the title wins (`4/10`).
 * The first day of the next city shares that date when the previous day
 * names the city ("Partida para Milão"). Otherwise the day steps forward.
 */
export function scheduleDays(trip: Trip): DatedDay[] {
  const year = Number(trip.cities.find((city) => city.dates)?.dates?.start.slice(0, 4) ?? '2026');
  const out: DatedDay[] = [];
  let previous: DatedDay | null = null;
  for (const city of trip.cities) {
    city.days.forEach((day, dayIndex) => {
      const earlier = out.filter((item) => item.city === city).at(-1);
      let date = titleDate(day.title, year);
      if (!date && earlier) date = shiftIso(earlier.date, 1);
      if (!date && previous && mentionsCity(previous.day.title, city)) date = previous.date;
      if (!date && city.dates) {
        const start = shiftIso(city.dates.start, dayIndex);
        if (start && (!previous || start >= previous.date)) date = start;
      }
      if (!date && previous) date = shiftIso(previous.date, 1);
      if (!date) return;
      const item: DatedDay = { city, day, dayIndex, date };
      out.push(item);
      previous = item;
    });
  }
  return out;
}

/** One section per authored date. Cities share a section when they share the day. */
export function tripDates(trip: Trip): TripDate[] {
  const dated = scheduleDays(trip);
  const dates = [...new Set(dated.map((item) => item.date))].sort();
  return dates.map((date) => ({
    date,
    cities: trip.cities.flatMap((city) => {
      const days = dated.filter((item) => item.date === date && item.city === city);
      return days.length ? [{ city, days }] : [];
    }),
  }));
}

export function daysOnDate(trip: Trip, date: string): DatedDay[] {
  return tripDates(trip).find((section) => section.date === date)?.cities.flatMap((city) => city.days) ?? [];
}

/** Local calendar day, `YYYY-MM-DD`. */
export function todayIso(now = new Date()): string {
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

/**
 * Closest date to `today`. A tie prefers the later day, so the trip ahead wins
 * over the one already past.
 */
export function nearestTripDate(dates: readonly string[], today: string): string | null {
  if (!dates.length) return null;
  let best = dates[0] ?? null;
  if (!best) return null;
  let bestDiff = Math.abs(Date.parse(best) - Date.parse(today));
  for (const date of dates.slice(1)) {
    const diff = Math.abs(Date.parse(date) - Date.parse(today));
    if (diff < bestDiff || (diff === bestDiff && date > best)) {
      best = date;
      bestDiff = diff;
    }
  }
  return best;
}

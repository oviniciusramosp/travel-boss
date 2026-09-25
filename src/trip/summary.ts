import { pickLocale, type Locale } from '../catalog';
import { formatMonthYear, formatSpan, isoParts, nightsBetween } from './dates';
import type { Trip, TripCity, TripLegMode } from './parse';

export function nightPhrase(nights: number, locale: Locale): string {
  return pickLocale(locale, {
    en: nights === 1 ? '1 night' : `${nights} nights`,
    'pt-BR': nights === 1 ? '1 noite' : `${nights} noites`,
  });
}

/** Earliest check-in and latest check-out. Cities with a broken range are skipped. */
export function tripDateSpan(trip: Trip): { start: string; end: string } | null {
  let start: string | null = null;
  let end: string | null = null;
  for (const city of trip.cities) {
    const dates = city.dates;
    if (!dates) continue;
    const from = isoParts(dates.start);
    const to = isoParts(dates.end);
    if (!from || !to || to.time < from.time) continue;
    if (!start || from.time < (isoParts(start)?.time ?? from.time)) start = dates.start;
    if (!end || to.time > (isoParts(end)?.time ?? to.time)) end = dates.end;
  }
  if (!start || !end) return null;
  return { start, end };
}

/** `Europa Out 2026` in Portuguese, `Europa Oct 2026` in English. The trip list label. */
export function formatTripNavLabel(trip: Trip, locale: Locale): string {
  const span = tripDateSpan(trip);
  const when = span ? formatMonthYear(span.start, locale) : null;
  return when ? `${trip.title} ${when}` : trip.title;
}

/** `Europa Out 2026`, or `Europe Oct 2026` in English. The document heading. */
export function formatTripPanelTitle(trip: Trip, locale: Locale): string {
  const span = tripDateSpan(trip);
  const when = span ? formatMonthYear(span.start, locale) : null;
  const name = locale === 'en' && trip.title === 'Europa' ? 'Europe' : trip.title;
  return when ? `${name} ${when}` : name;
}

/** `Paris → Milão → Roma · 11 noites · 2–13 abr`. Empty when the trip has no cities. */
export function formatTripSummary(trip: Trip, locale: Locale): string {
  const names = trip.cities.map((city) => city.name.trim()).filter((name) => name.length > 0);
  if (!names.length) return '';
  const route = names.join(' → ');
  const span = tripDateSpan(trip);
  if (!span) return route;
  const nights = nightsBetween(span.start, span.end);
  const when = formatSpan(span.start, span.end, locale);
  const parts = [route];
  if (nights != null) parts.push(nightPhrase(nights, locale));
  if (when) parts.push(when);
  return parts.join(' · ');
}

export type CityBand = {
  key: string;
  name: string;
  /** Flex grow. One share when the city has no positive night count. */
  grow: number;
  dates: string | null;
  /** Departure `via:` text. Shown on the bar between this city and the next. */
  via: string | null;
  viaMode: TripLegMode | null;
  tip: string;
};

function cityStay(city: TripCity): number | null {
  if (!city.dates) return null;
  const nights = nightsBetween(city.dates.start, city.dates.end);
  if (nights == null || nights <= 0) return null;
  return nights;
}

/** One segment per city. Width follows that city's nights, not the whole trip. */
export function cityBands(trip: Trip, locale: Locale): CityBand[] {
  return trip.cities.map((city) => {
    const nights = cityStay(city);
    const dates =
      city.dates && nightsBetween(city.dates.start, city.dates.end) != null
        ? formatSpan(city.dates.start, city.dates.end, locale)
        : null;
    const via = city.leg?.detail ?? null;
    const parts = [
      city.name,
      dates,
      nights != null ? nightPhrase(nights, locale) : null,
      via,
    ].filter((part): part is string => Boolean(part));
    return {
      key: city.slug || city.name,
      name: city.name,
      grow: nights ?? 1,
      dates,
      via,
      viaMode: city.leg?.mode ?? null,
      tip: parts.join(' · '),
    };
  });
}

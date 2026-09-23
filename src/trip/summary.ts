import { pickLocale, type Locale } from '../catalog';
import { formatSpan, isoParts, nightsBetween } from './dates';
import type { Trip } from './parse';

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

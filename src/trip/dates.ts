import { pickLocale, type Locale } from '../catalog';

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86400000;

const MONTHS: { en: string; 'pt-BR': string }[] = [
  { en: 'Jan', 'pt-BR': 'jan' },
  { en: 'Feb', 'pt-BR': 'fev' },
  { en: 'Mar', 'pt-BR': 'mar' },
  { en: 'Apr', 'pt-BR': 'abr' },
  { en: 'May', 'pt-BR': 'mai' },
  { en: 'Jun', 'pt-BR': 'jun' },
  { en: 'Jul', 'pt-BR': 'jul' },
  { en: 'Aug', 'pt-BR': 'ago' },
  { en: 'Sep', 'pt-BR': 'set' },
  { en: 'Oct', 'pt-BR': 'out' },
  { en: 'Nov', 'pt-BR': 'nov' },
  { en: 'Dec', 'pt-BR': 'dez' },
];

export type IsoParts = { year: number; month: number; day: number; time: number };

/** Calendar date in UTC. Rejects impossible days such as 2026-02-31. */
export function isoParts(iso: string): IsoParts | null {
  const match = ISO_DAY.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const time = Date.UTC(year, month - 1, day);
  const date = new Date(time);
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return { year, month, day, time };
}

/** Nights from check-in to check-out. Null when the range is not a real forward span. */
export function nightsBetween(start: string, end: string): number | null {
  const from = isoParts(start);
  const to = isoParts(end);
  if (!from || !to || to.time < from.time) return null;
  return Math.round((to.time - from.time) / DAY_MS);
}

/** `days` after an ISO date, or null when the start is not a real day. */
export function shiftIso(iso: string, days: number): string | null {
  const from = isoParts(iso);
  if (!from || !Number.isInteger(days)) return null;
  const date = new Date(from.time + days * DAY_MS);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${date.getUTCFullYear()}-${month}-${day}`;
}

export function isoCompact(iso: string): string | null {
  return isoParts(iso) ? iso.replaceAll('-', '') : null;
}

function monthName(month: number, locale: Locale): string {
  const names = MONTHS[month - 1];
  return names ? pickLocale(locale, names) : '';
}

/**
 * Short range. Same month stays `2–13 abr`. A same-day range is just that day.
 * The dash is an en dash, the same one the trip summary uses.
 */
export function formatSpan(start: string, end: string, locale: Locale): string | null {
  const from = isoParts(start);
  const to = isoParts(end);
  if (!from || !to || to.time < from.time) return null;
  const startMonth = monthName(from.month, locale);
  const endMonth = monthName(to.month, locale);
  if (from.year === to.year && from.month === to.month && from.day === to.day) {
    return `${from.day} ${endMonth}`;
  }
  if (from.year === to.year && from.month === to.month) {
    return `${from.day}–${to.day} ${endMonth}`;
  }
  if (from.year === to.year) return `${from.day} ${startMonth}–${to.day} ${endMonth}`;
  return `${from.day} ${startMonth} ${from.year}–${to.day} ${endMonth} ${to.year}`;
}

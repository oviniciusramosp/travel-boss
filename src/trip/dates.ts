import { pickLocale, type Locale } from '../catalog';

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const DAY_MS = 86400000;

const WEEKDAYS: { en: string; 'pt-BR': string }[] = [
  { en: 'Sun', 'pt-BR': 'dom' },
  { en: 'Mon', 'pt-BR': 'seg' },
  { en: 'Tue', 'pt-BR': 'ter' },
  { en: 'Wed', 'pt-BR': 'qua' },
  { en: 'Thu', 'pt-BR': 'qui' },
  { en: 'Fri', 'pt-BR': 'sex' },
  { en: 'Sat', 'pt-BR': 'sáb' },
];

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

function capitalized(value: string, locale: Locale): string {
  if (!value) return value;
  return value.charAt(0).toLocaleUpperCase(locale) + value.slice(1);
}

/** `04 Out • Dom` / `04 Oct • Sun`. Headline of a trip date card. */
export function formatDayTitle(iso: string, locale: Locale): string {
  const parts = isoParts(iso);
  if (!parts) return iso;
  const day = String(parts.day).padStart(2, '0');
  const month = capitalized(monthName(parts.month, locale), locale);
  const names = WEEKDAYS[new Date(parts.time).getUTCDay()] ?? WEEKDAYS[0]!;
  return `${day} ${month} • ${capitalized(pickLocale(locale, names), locale)}`;
}

/** `Oct 2026` / `Out 2026`. The short month is capitalized for a label. */
export function formatMonthYear(iso: string, locale: Locale): string | null {
  const parts = isoParts(iso);
  if (!parts) return null;
  const month = monthName(parts.month, locale);
  if (!month) return null;
  const label = month.charAt(0).toLocaleUpperCase(locale) + month.slice(1);
  return `${label} ${parts.year}`;
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

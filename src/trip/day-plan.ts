/** Morning, afternoon and evening of a trip date, and its budget per person. */
import { resolveVisit } from '../catalog';
import type { MoneyInfo, VisitInfo } from '../catalog';

export const PERIODS = ['morning', 'afternoon', 'evening'] as const;
export type Period = (typeof PERIODS)[number];

/** `HH:mm`. Before 05:00 still belongs to the night. */
export function periodAt(time: string | undefined): Period | null {
  const hour = time ? Number(time.slice(0, 2)) : Number.NaN;
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return null;
  if (hour < 5 || hour >= 18) return 'evening';
  return hour < 12 ? 'morning' : 'afternoon';
}

/**
 * A row without a time stays in the period above it. Rows before the first
 * time take that first period. A date with no time at all has no periods.
 */
export function rowPeriods(times: readonly (string | undefined)[]): (Period | null)[] {
  const own = times.map(periodAt);
  let last = own.find((period) => period !== null) ?? null;
  return own.map((period) => {
    last = period ?? last;
    return last;
  });
}

export type PeriodRow = { time?: string; text: string; listNote?: boolean };

const LUNCH = /\b(almoco|lunch)\b/;
const DINNER = /\b(jantar|janta|dinner)\b/;
const PICNIC = /\b(piquenique|picnic)\b/;

/** The stop says it is lunch or dinner. A picnic is lunch before 16:00 and dinner from 18:00. */
function mealOf(row: PeriodRow): 'lunch' | 'dinner' | null {
  if (row.listNote) return null;
  const text = row.text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  if (DINNER.test(text)) return 'dinner';
  if (LUNCH.test(text)) return 'lunch';
  if (!PICNIC.test(text)) return null;
  const hour = row.time ? Number(row.time.slice(0, 2)) : Number.NaN;
  if (hour >= 18) return 'dinner';
  return hour < 16 ? 'lunch' : null;
}

/**
 * Morning runs from waking up through lunch, afternoon until dinner, evening from
 * dinner on. Lunch is the last stop before dinner that says so; dinner is the first
 * that says so. A list note never counts. Without lunch the morning ends at 12:00,
 * without dinner the evening starts at 18:00.
 */
export function dayPeriods(rows: readonly PeriodRow[]): (Period | null)[] {
  const clock = rowPeriods(rows.map((row) => row.time));
  const meals = rows.map(mealOf);
  const dinner = meals.indexOf('dinner');
  const lunch = meals.slice(0, dinner < 0 ? undefined : dinner).lastIndexOf('lunch');
  return clock.map((period, index) => {
    if (lunch >= 0 && index <= lunch) return 'morning';
    if (dinner >= 0 && index >= dinner) return 'evening';
    if (!period) return lunch >= 0 || dinner >= 0 ? 'afternoon' : null;
    if ((lunch >= 0 && period === 'morning') || (dinner >= 0 && period === 'evening')) return 'afternoon';
    return period;
  });
}

/** Consecutive rows of one period. Document order stays, so the route does too. */
export function periodSections(
  periods: readonly (Period | null)[],
): { period: Period | null; rows: number[] }[] {
  const sections: { period: Period | null; rows: number[] }[] = [];
  periods.forEach((period, index) => {
    const last = sections.at(-1);
    if (last && last.period === period) last.rows.push(index);
    else sections.push({ period, rows: [index] });
  });
  return sections;
}

/**
 * Clock window of each period from its own stops, not the fixed `fallback`: it runs from
 * the first timed stop of the period (morning never before 6) to the first timed stop of
 * the next period that has one. The last period with any time instead ends an hour past
 * its last stop, capped at 24; a stop before 05:00 there is still last night (see
 * `periodAt`), so it counts as 24 + hour first. A period with no timed stop keeps
 * `fallback`'s window; one under an hour wide grows to exactly one.
 */
export function periodWindows(
  times: readonly (string | undefined)[],
  periods: readonly (Period | null)[],
  fallback: Record<Period, [number, number]>,
): Record<Period, [number, number]> {
  const hourOf = (time: string) => Number(time.slice(0, 2));
  const nightHour = (hour: number) => (hour < 5 ? hour + 24 : hour);
  const hoursOf = (period: Period): number[] =>
    periods.flatMap((own, index) => {
      const time = times[index];
      return own === period && time ? [hourOf(time)] : [];
    });

  const windowOf = (period: Period): [number, number] => {
    const hours = hoursOf(period);
    if (!hours.length) return fallback[period];
    let from = period === 'morning' ? Math.max(6, hours[0]) : hours[0];
    const next = PERIODS.slice(PERIODS.indexOf(period) + 1)
      .map(hoursOf)
      .find((later) => later.length);
    let to = next ? next[0] : Math.min(24, nightHour(hours[hours.length - 1]) + 1);
    if (to - from < 1) {
      to = Math.min(24, from + 1);
      if (to - from < 1) from = to - 1;
    }
    return [from, to];
  };

  return { morning: windowOf('morning'), afternoon: windowOf('afternoon'), evening: windowOf('evening') };
}

export type Rail = { mode: 'walk' | 'transit'; color: string };

/**
 * Timeline rails of one hop. A leg starts at its icon: below the icon runs that
 * leg, above it the one before. Before the first icon you walk to it, unless a
 * taxi picks you up at the door. The stop at the end gets the last leg.
 */
export function hopRails(
  parts: readonly Rail[],
  walk: Rail,
  doorToDoor = false,
): { depart: Rail; parts: { above: Rail; below: Rail }[]; arrive: Rail } | null {
  const first = parts[0];
  const last = parts.at(-1);
  if (!first || !last) return null;
  const depart = doorToDoor ? first : walk;
  return {
    depart,
    parts: parts.map((below, index) => ({ above: parts[index - 1] ?? depart, below })),
    arrive: last,
  };
}

/** Wall clock in a time zone as `YYYY-MM-DD HH:mm`, the shape of a trip date plus a stop time. */
export function zonedStamp(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '00';
  return `${part('year')}-${part('month')}-${part('day')} ${part('hour')}:${part('minute')}`;
}

/**
 * Periods already over at `now` (see `zonedStamp`). A period ends when the next one
 * starts. The last one ends with the date, so it stays current until midnight.
 */
export function pastPeriods(
  date: string,
  times: readonly (string | undefined)[],
  periods: readonly (Period | null)[],
  now: string,
): Set<Period> {
  const today = now.slice(0, 10);
  const past = new Set<Period>();
  if (date > today) return past;
  const sections = periodSections(periods);
  sections.forEach((section, index) => {
    if (!section.period) return;
    if (date < today) {
      past.add(section.period);
      return;
    }
    const start = sections
      .slice(index + 1)
      .flatMap((later) => later.rows.map((row) => times[row]))
      .find(Boolean);
    if (start && `${date} ${start}` <= now) past.add(section.period);
  });
  return past;
}

/** Middle of the per-person range. One bound alone is the amount. Other currencies are 0. */
export function midEur(money: MoneyInfo | undefined): number {
  if (!money || money.free || money.currency !== 'EUR') return 0;
  const low = money.min ?? money.max;
  const high = money.max ?? money.min;
  if (low == null || high == null || !Number.isFinite(low) || !Number.isFinite(high)) return 0;
  return (low + high) / 2;
}

/** Free time at least this long after a stop gets a "Roteiro em aberto" block. */
const OPEN_SLOT_MIN = 120;
/** Stay when the catalog has no duration (a meal, a quick stop). */
const DEFAULT_STAY_MIN = 60;

export type SlotHop = {
  time?: string;
  nextTime?: string;
  /** Catalog stay at the stop; a meal or a quick stop counts DEFAULT_STAY_MIN. */
  stayMin?: number;
  legMin?: number;
  /** Arriving and leaving the same place is a planned rest, not open time. */
  samePlace?: boolean;
};

const clockMin = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

/** Minutes left after the stay and the way to the next stop. Null without both times or at a rest. */
export function freeMinutes(hop: SlotHop): number | null {
  if (!hop.time || !hop.nextTime || hop.samePlace) return null;
  let gap = clockMin(hop.nextTime) - clockMin(hop.time);
  if (gap < 0) gap += 24 * 60;
  return gap - (hop.stayMin ?? DEFAULT_STAY_MIN) - (hop.legMin ?? 0);
}

export function isOpenSlot(hop: SlotHop): boolean {
  const free = freeMinutes(hop);
  return free != null && free >= OPEN_SLOT_MIN;
}

const OUTSIDE =
  /\b(por fora|fachada|passar na frente|sem subir|sem entrar|nao vamos subir|nao vamos entrar|outside|facade)\b/;
const INSIDE = /\b(por dentro|inside)\b/;

/**
 * The stop is seen only from outside, so the place's ticket does not count.
 * "Por fora é grátis. Por dentro, €25" still counts: going in is in the plan.
 */
export function seenFromOutside(text: string): boolean {
  const folded = text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  return OUTSIDE.test(folded) && !INSIDE.test(folded);
}

/** The stops' places plus the catalog places their sub-points name, for the budget. */
export function withSubPointPlaces<T extends { subPoints?: readonly { placeId?: string }[] }>(
  places: readonly T[],
  byId: (id: string) => T | undefined,
): T[] {
  return places.flatMap((place) => [
    place,
    ...(place.subPoints ?? []).flatMap((sub) => {
      const found = sub.placeId ? byId(sub.placeId) : undefined;
      return found ? [found] : [];
    }),
  ]);
}

/** `label` names a leg fare; a place line is named by its id. */
export type BudgetLine = { id: string; food: number; ticket: number; label?: string };
export type DateBudget = { food: number; ticket: number; lines: BudgetLine[] };

/**
 * Food and tickets per person. A place visited twice on the date counts once.
 * Leg fares (`via: … · €2,55`) are tickets too, one per leg. `outside` places
 * (see `seenFromOutside`) keep their food but not their ticket.
 */
export function dateBudget(
  places: readonly { id: string; visit?: VisitInfo }[],
  fares: readonly { label: string; eur: number }[] = [],
  outside: ReadonlySet<string> = new Set(),
): DateBudget {
  const seen = new Set<string>();
  const budget: DateBudget = { food: 0, ticket: 0, lines: [] };
  for (const place of places) {
    if (seen.has(place.id)) continue;
    seen.add(place.id);
    const visit = resolveVisit(place.id, place.visit);
    const ticket = outside.has(place.id) ? 0 : midEur(visit?.ticket);
    const line = { id: place.id, food: midEur(visit?.avgPricePerPerson), ticket };
    if (line.food <= 0 && line.ticket <= 0) continue;
    budget.food += line.food;
    budget.ticket += line.ticket;
    budget.lines.push(line);
  }
  fares.forEach((fare, index) => {
    if (!(fare.eur > 0)) return;
    budget.ticket += fare.eur;
    budget.lines.push({ id: `fare:${index}`, food: 0, ticket: fare.eur, label: fare.label });
  });
  return budget;
}

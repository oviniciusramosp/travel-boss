import { applyTripPatch, type TripPatch } from './api';
import { PERIODS, type Period } from './day-plan';
import type { TripDay, TripStop } from './parse';

export function isTentative(stop: TripStop): boolean {
  return !stop.listNote && stop.status !== 'confirmado';
}

export const PERIOD_NAMES: Record<Period, string> = { morning: 'manhã', afternoon: 'tarde', evening: 'noite' };
export const closedPeriods = (day: TripDay): readonly Period[] => day.closedPeriods ?? (day.status ? PERIODS : []);
export const isDayClosed = (day: TripDay): boolean => PERIODS.every((period) => closedPeriods(day).includes(period)) && !day.stops.some(isTentative);

/** Compare the whole anchor block so concurrent status changes cannot overwrite one another. */
export function statusPatch(raw: string, line: number, status: 'fechado' | 'a confirmar' | Period, enabled: boolean): TripPatch {
  const lines = raw.split(/\r?\n/);
  let end = line;
  while (lines[end]?.trim() && /^[ \t]+/.test(lines[end]!)) end += 1;
  const before = lines.slice(line - 1, end);
  if (PERIODS.includes(status as Period)) {
    const saved = before.find((text) => text.trim().startsWith('- períodos fechados:'));
    const periods = saved ? PERIODS.filter((period) => saved.split(':')[1]!.split(',').map((name) => name.trim()).includes(PERIOD_NAMES[period]))
      : before.some((text) => text.trim() === '- status: fechado') ? [...PERIODS] : [];
    const next = PERIODS.filter((period) => period === status ? enabled : periods.includes(period));
    const after = before.filter((text) => !/^\s+- (status: fechado|períodos fechados:.*)\s*$/.test(text));
    after.push(`  - períodos fechados: ${next.map((period) => PERIOD_NAMES[period]).join(', ')}`);
    if (lines[end] !== undefined) { before.push(lines[end]!); after.push(lines[end]!); }
    return { line, before, after };
  }
  const marker = `  - status: ${status}`;
  const after = before.filter((text) => status === 'fechado'
    ? text.trim() !== marker.trim()
    : !/^\s+- status: (a confirmar|confirmado)\s*$/.test(text));
  if (enabled) after.push(marker);
  else if (status === 'a confirmar') after.push('  - status: confirmado');
  // Include the following line as a boundary: a concurrent appended status must conflict.
  if (lines[end] !== undefined) { before.push(lines[end]!); after.push(lines[end]!); }
  return { line, before, after };
}

/** One atomic review edit for a date spanning multiple city/day headings. */
export function periodStatusPatch(raw: string, period: Period, enabled: boolean, headingCount = Infinity): TripPatch {
  const before = raw.split(/\r?\n/);
  const anchors = before.flatMap((line, index) => line.startsWith('### ') ? [index + 1] : []).slice(0, headingCount);
  let updated = raw;
  for (const line of anchors.reverse()) updated = applyTripPatch(updated, statusPatch(updated, line, period, enabled))!.raw;
  return { line: 1, before, after: updated.split(/\r?\n/) };
}

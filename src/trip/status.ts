import type { TripPatch } from './api';
import type { TripStop } from './parse';

export function isTentative(stop: TripStop): boolean {
  return !stop.listNote && stop.status !== 'confirmado';
}

/** Compare the whole anchor block so concurrent status changes cannot overwrite one another. */
export function statusPatch(raw: string, line: number, status: 'fechado' | 'a confirmar', enabled: boolean): TripPatch {
  const lines = raw.split(/\r?\n/);
  let end = line;
  while (lines[end]?.trim() && /^[ \t]+/.test(lines[end]!)) end += 1;
  const before = lines.slice(line - 1, end);
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

import type { TripPatch } from './api';

/** Compare the whole anchor block so concurrent status changes cannot overwrite one another. */
export function statusPatch(raw: string, line: number, status: 'fechado' | 'a confirmar', enabled: boolean): TripPatch {
  const lines = raw.split(/\r?\n/);
  let end = line;
  while (lines[end]?.trim() && /^[ \t]+/.test(lines[end]!)) end += 1;
  const before = lines.slice(line - 1, end);
  const marker = `  - status: ${status}`;
  const after = before.filter((text) => text.trim() !== marker.trim());
  if (enabled) after.push(marker);
  // Include the following line as a boundary: a concurrent appended status must conflict.
  if (lines[end] !== undefined) { before.push(lines[end]!); after.push(lines[end]!); }
  return { line, before, after };
}

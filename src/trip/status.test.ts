import { expect, it } from 'vitest';
import { applyTripPatch } from './api';
import { parseTrip } from './parse';
import { dayToMarkdown } from './export';
import { isTentative, statusPatch } from './status';

const raw = '# Viagem\n## Paris\ncity: paris\n### Dia 1\n\n- [Café](https://example.com) — Nota\\\n  Mais texto\n  - via: a pé · 5 min\n  - comentário: revisar\n- **Ponto interno** — Passeio\n';

it('toggles statuses without changing notes, legs or comments, including moved anchors', () => {
  const patch = statusPatch(raw, 6, 'a confirmar', true);
  const updated = applyTripPatch(`\n${raw}`, patch)!.raw;
  expect(updated).toContain('  - comentário: revisar\n  - status: a confirmar');
  expect(applyTripPatch(updated, patch)).toBeNull();
  const confirmed = applyTripPatch(updated, statusPatch(updated, 7, 'a confirmar', false))!.raw;
  expect(confirmed).not.toContain('status: a confirmar');
  expect(confirmed).toContain('status: confirmado');
  expect(applyTripPatch(confirmed, statusPatch(confirmed, 7, 'a confirmar', true))!.raw).toBe(updated);
});

it('parses and exports day and point statuses without extra stops or narrative', () => {
  let marked = applyTripPatch(raw, statusPatch(raw, 4, 'fechado', true))!.raw;
  marked = applyTripPatch(marked, statusPatch(marked, 7, 'a confirmar', true))!.raw;
  const day = parseTrip('test', 'test.md', marked).cities[0]!.days[0]!;
  expect(day.status).toBe('fechado');
  expect(day.stops).toHaveLength(2);
  expect(day.notes).toEqual([]);
  expect(day.stops[0]!.status).toBe('a confirmar');
  expect(dayToMarkdown(day, () => null)).toContain('status: a confirmar');
  expect(dayToMarkdown(day, () => null)).not.toContain('Dia fechado');
  day.stops[0]!.status = 'confirmado';
  expect(dayToMarkdown(day, () => null)).toContain('Dia fechado');
  expect(parseTrip('test', 'test.md', raw).cities[0]!.days[0]!.status).toBeUndefined();
});

it('starts places tentative, requires explicit confirmation and excludes child notes', () => {
  const day = parseTrip('test', 'test.md', raw).cities[0]!.days[0]!;
  expect(day.stops.map(isTentative)).toEqual([true, false]);
  const confirmed = applyTripPatch(raw, statusPatch(raw, 6, 'a confirmar', false))!.raw;
  const parsed = parseTrip('test', 'test.md', confirmed).cities[0]!.days[0]!;
  expect(parsed.stops[0]!.status).toBe('confirmado');
  expect(parsed.stops.map(isTentative)).toEqual([false, false]);
  expect(dayToMarkdown(parsed, () => null)).toContain('status: confirmado');
  day.status = 'fechado';
  expect(dayToMarkdown(day, () => null)).not.toContain('Dia fechado');
});

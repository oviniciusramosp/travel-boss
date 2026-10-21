import { expect, it } from 'vitest';
import { planTripEdit, revisionOf } from './agent-service';
import { tripBlocks } from './agent-blocks';
import { parseTrip } from '../src/trip/parse';

const raw = '# Trip\n\n## Paris\ncity: paris\ndates: 2026-10-04 → 2026-10-05\n\n### Dia 1 — Paris\n- 10:00 [Louvre](place:par-louvre) — Visita\n  - comentário: Rever tempo\n  - comida: €10\n- 15:00 [Site](https://example.com) — Passeio\n\n### Dia 2 — Paris\n- 09:00 [Volta](https://example.net) — Outro dia\n';
function plan(operations: any[], source = raw) { return planTripEdit('test', source, { revision: revisionOf(source), operations }); }
const first = () => tripBlocks('test', raw).days[0]!;
it('edits note/time/cost and resolves a specific comment in one validated atomic batch', () => {
  const target = first().stops[0]!.anchor;
  const after = plan([
    { operation: 'update-stop', target, changes: { time: '11:00', note: 'Visita curta' } },
    { operation: 'set-cost', target, kind: 'food', amount: 0 },
    { operation: 'set-cost', target, kind: 'ticket', amount: 41.63 },
    { operation: 'resolve-comment', target, commentText: 'Rever tempo' },
  ]).after;
  const trip = parseTrip('test', '', after), stop = trip.cities[0]!.days[0]!.stops[0]!;
  expect(trip.errors).toEqual([]);
  expect(stop).toMatchObject({ time: '11:00', note: 'Visita curta', foodEur: 0, ticketEur: 41.63 });
  expect(stop.comments).toBeUndefined();
  expect(after).not.toContain('concluído');
  expect(after).toContain('- 15:00 [Site](https://example.com) — Passeio');
});
it('inserts an unconfirmed catalog stop at an exact position and preserves a final newline', () => {
  const day = first();
  const after = plan([{ operation: 'insert-stop', day: day.anchor, before: day.stops[1]!.anchor,
    stop: { placeId: 'par-louvre', label: 'Louvre de novo', time: '13:00', note: 'Retorno' } }]).after;
  const stops = parseTrip('test', '', after).cities[0]!.days[0]!.stops;
  expect(stops.map(stop => stop.time)).toEqual(['10:00', '13:00', '15:00']);
  expect(stops[1]!.status).toBeUndefined();
  expect(after.endsWith('\n')).toBe(true);
  expect(() => plan([{ operation: 'insert-stop', day: day.anchor, stop: { placeId: 'does-not-exist', label: 'Unknown' } }])).toThrow('Validation');
});
it('moves the full stop and its children between days without losing or duplicating them', () => {
  const days = tripBlocks('test', raw).days;
  const after = plan([{ operation: 'move-stop', target: days[0]!.stops[0]!.anchor, day: days[1]!.anchor, before: days[1]!.stops[0]!.anchor }]).after;
  const trip = parseTrip('test', '', after);
  expect(trip.cities[0]!.days.map(day => day.stops.length)).toEqual([1, 2]);
  expect(trip.cities[0]!.days[1]!.stops[0]!.comments?.[0]!.text).toBe('Rever tempo');
  expect(after.match(/comida: €10/g)).toHaveLength(1);
  expect(after.endsWith('\n')).toBe(true);
});
it('removes one full stop but retains the next stop and day heading', () => {
  const after = plan([{ operation: 'remove-stop', target: first().stops[0]!.anchor }]).after;
  expect(after).not.toContain('Rever tempo');
  expect(after).not.toContain('comida:');
  expect(after).toContain('[Site]'); expect(after).toContain('### Dia 2');
});
it('sets transfer, departure and researched service fields together, preserving unrelated metadata', () => {
  const target = first().stops[0]!.anchor;
  const after = plan([{ operation: 'set-transfer', target, detail: 'Metrô · 20 min — Fora do passe', departure: '10:30',
    access: 'A pé · 5 min', boardings: [{ date: '2026-10-04', service: 'M1', board: 'A', exit: 'B', departure: '10:40', arrival: '11:00' }] }]).after;
  const stop = parseTrip('test', '', after).cities[0]!.days[0]!.stops[0]!;
  expect(stop.leg).toMatchObject({ mode: 'transit', durationMin: 20, note: 'Fora do passe', access: { durationMin: 5 } });
  expect(stop.boardings?.[0]).toMatchObject({ service: 'M1', departure: '10:40' });
  expect(stop.comments?.[0]!.text).toBe('Rever tempo');
  expect(() => plan([{ operation: 'set-transfer', target, detail: 'Sem transporte' }])).toThrow('Validation');
});
it('rejects injections, imprecise costs, ambiguous comments and structural anchor shifts', () => {
  const target = first().stops[0]!.anchor;
  expect(() => plan([{ operation: 'set-cost', target, kind: 'food', amount: 1.001 }])).toThrow('amount');
  expect(() => plan([{ operation: 'update-stop', target, changes: { note: 'Text\n- stop' } }])).toThrow('note');
  expect(() => plan([{ operation: 'resolve-comment', target, commentText: 'Wrong' }])).toThrow('exact');
  expect(() => plan([{ operation: 'remove-stop', target }, { operation: 'update-stop', target, changes: { note: 'x' } }])).toThrow('separate');
});
it('keeps decisions immutable but allows exact multiline comment resolution', () => {
  const source = raw.replace('  - comentário: Rever tempo', '  - decisão: 2026-10-21 · Manter\n  - comentário: Rever \\\n    tempo');
  const target = tripBlocks('test', source).days[0]!.stops[0]!.anchor;
  const commentText = parseTrip('test', '', source).cities[0]!.days[0]!.stops[0]!.comments![0]!.text;
  const after = plan([{ operation: 'resolve-comment', target, commentText }], source).after;
  expect(after).toContain('decisão: 2026-10-21 · Manter'); expect(after).not.toContain('comentário:');
  expect(() => plan([{ operation: 'remove-stop', target }], source)).toThrow('Protected');
});
it('removes optional overrides and preserves CRLF byte boundaries', () => {
  const source = raw.replaceAll('\n', '\r\n'), target = tripBlocks('test', source).days[0]!.stops[0]!.anchor;
  const after = plan([{ operation: 'set-cost', target, kind: 'food', amount: null }], source).after;
  expect(after).toBe(source.replace('  - comida: €10\r\n', ''));
});
it('edits notes after the link rather than an em dash inside the place label', () => {
  const source = raw.replace('[Louvre]', '[Louvre — pausa]');
  const target = tripBlocks('test', source).days[0]!.stops[0]!.anchor;
  const after = plan([{ operation: 'update-stop', target, changes: { note: 'Nota nova' } }], source).after;
  expect(after).toContain('[Louvre — pausa](place:par-louvre) — Nota nova');
});

import { expect, it } from 'vitest';
import { tripBlocks } from './agent-blocks';

const raw = '# Trip\n\n## Paris\ncity: paris\ndates: 2026-10-04 → 2026-10-05\n\n### Dia 1 — Paris\n- 10:00 [Louvre](place:par-louvre) — Visita\n\n### Dia 2 — Paris\n- 15:00 [Site](https://example.com) — Passeio\n';
it('keeps semantic addresses across line shifts and note/time changes, hashing exact CRLF blocks', () => {
  const old = tripBlocks('test', raw).days;
  const changed = tripBlocks('test', raw.replace('# Trip', '# Trip\n').replace('10:00', '11:00').replace('Visita', 'Nova nota')).days;
  expect(changed[0]!.anchor).toBe(old[0]!.anchor);
  expect(changed[0]!.stops[0]!.anchor).toBe(old[0]!.stops[0]!.anchor);
  expect(changed[0]!.stops[0]!.revision).not.toBe(old[0]!.stops[0]!.revision);
  const crlf = tripBlocks('test', raw.replaceAll('\n', '\r\n')).days;
  expect(crlf[0]!.revision).not.toBe(old[0]!.revision);
  expect(crlf[0]!.raw).toContain('\r\n');
});
it('disambiguates repeated visits and days by occurrence', () => {
  const days = tripBlocks('test', raw.replace('\n\n### Dia 2', '\n- 17:00 [Louvre](place:par-louvre)\n\n### Dia 2')).days;
  expect(new Set(days[0]!.stops.map(stop => stop.anchor)).size).toBe(2);
  expect(new Set(days.map(day => day.anchor)).size).toBe(2);
});
it('couples all same-date headings but keeps unrelated day contents independent', () => {
  const before = tripBlocks('test', raw).days;
  const after = tripBlocks('test', raw.replace('Passeio', 'Fotografia')).days;
  expect(before[0]!.guards).toEqual(after[0]!.guards);
  const shared = tripBlocks('test', raw.replace('Dia 2 — Paris', 'Dia 2 — 4/10')).days;
  expect(shared[0]!.guards.filter(guard => guard.scope === 'date-content')).toHaveLength(2);
});

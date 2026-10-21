import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { editTrip, revisionOf, validateChange, planTripEdit, AgentError } from './agent-service';
import { tripBlocks } from './agent-blocks';
const raw = '# Trip\n\n## Paris\ncity: paris\n\n### Dia 1 — Paris\n- 10:00 [Louvre](place:par-louvre) — Visita\n';
const previous = process.cwd(); let dir = '';
afterEach(() => { process.chdir(previous); if (dir) rmSync(dir, { recursive: true, force: true }); dir = ''; });
function setup(value = raw) { dir = mkdtempSync(join(tmpdir(), 'tb-agent-')); mkdirSync(join(dir, 'content/trips'), { recursive: true }); writeFileSync(join(dir, 'content/trips/test.md'), value); process.chdir(dir); }
it('applies one atomic batch and rejects stale revisions without writing', () => {
  setup(); const edits = [{ before: ['- 10:00 [Louvre](place:par-louvre) — Visita'], after: ['- 11:00 [Louvre](place:par-louvre) — Visita'] }];
  expect(editTrip('test', { revision: revisionOf(raw), edits }).revision).not.toBe(revisionOf(raw));
  expect(() => editTrip('test', { revision: revisionOf(raw), edits })).toThrow('Revision');
});
it('validates the whole batch before saving and supports dry-run', () => {
  setup(); const payload = { revision: revisionOf(raw), operation: 'update-stop', dayLine: 6, stopLine: 7, changes: { time: '11:00' }, dryRun: true };
  expect(editTrip('test', payload).dryRun).toBe(true); expect(readFileSync('content/trips/test.md', 'utf8')).toBe(raw);
  expect(() => editTrip('test', { ...payload, changes: { time: '25:00' } })).toThrow('time');
  expect(() => validateChange('test', raw, raw.replace('par-louvre', 'invalid-place'))).toThrow('Validation');
});
it.each(['  - decisão: reservado', '  - decision: reserved'])('protects decisions and their owner: %s', metadata => {
  const before = raw + metadata + '\n';
  expect(() => validateChange('test', before, before.replace('10:00', '11:00'))).toThrow('Protected');
  expect(() => validateChange('test', before, raw)).toThrow('Protected');
});
it.each(['confirmado', 'a confirmar'])('retains %s while allowing note/time changes', status => {
  const before = raw + `  - status: ${status}\n`;
  expect(() => validateChange('test', before, before.replace('10:00', '11:00').replace('Visita', 'Outra nota'))).not.toThrow();
  expect(() => validateChange('test', before, raw)).toThrow('Protected');
  expect(() => validateChange('test', before, before.replace('par-louvre', 'par-louvre-other'))).toThrow('Protected');
});
it.each(['  - períodos fechados: manhã', '  - status: fechado'])('protects approval content at the correct day scope: %s', marker => {
  const before = raw.replace('### Dia 1 — Paris\n', `### Dia 1 — Paris\n${marker}\n`);
  expect(() => validateChange('test', before, before.replace('10:00', '11:00'))).toThrow('Protected');
  expect(() => validateChange('test', before, before.replace(`${marker}\n`, ''))).toThrow('Protected');
});
it('rejects creation of approvals, ambiguity, path traversal and active writer locks', () => {
  setup(); expect(() => validateChange('test', raw, raw + '  - status: confirmado\n')).toThrow('Protected');
  expect(() => editTrip('../test', {})).toThrow('Invalid trip');
  mkdirSync('content/trips/test.md.lock'); expect(() => editTrip('test', {})).toThrow('busy');
});

it('does not persist earlier edits when a later edit fails, and preserves CRLF', () => {
  setup(raw.replaceAll('\n', '\r\n'));
  const current = readFileSync('content/trips/test.md', 'utf8');
  const first = { before: ['- 10:00 [Louvre](place:par-louvre) — Visita'], after: ['- 11:00 [Louvre](place:par-louvre) — Visita'] };
  expect(() => editTrip('test', { revision: revisionOf(current), edits: [first, { before: ['missing'], after: [] }] })).toThrow('unique');
  expect(readFileSync('content/trips/test.md', 'utf8')).toBe(current);
  editTrip('test', { revision: revisionOf(current), edits: [first] });
  expect(readFileSync('content/trips/test.md', 'utf8')).toBe(current.replace('10:00', '11:00'));
});

const dated = raw.replace('city: paris', 'city: paris\ndates: 2026-10-04 → 2026-10-05')
  + '\n### Dia 2 — Paris\n- 15:00 [Site](https://example.com) — Outra visita\n';
it('accepts a stale whole-file revision when another day changed, retaining the other change', () => {
  const days = tripBlocks('test', dated).days, day = days[0]!;
  setup(dated.replace('Outra visita', 'Edição simultânea'));
  const result = editTrip('test', { revision: revisionOf(dated), preconditions: day.guards,
    operation: 'update-stop', target: day.stops[0]!.anchor, changes: { note: 'Nova nota' } });
  expect(result.revision).not.toBe(revisionOf(dated));
  expect(readFileSync('content/trips/test.md', 'utf8')).toContain('Edição simultânea');
  expect(readFileSync('content/trips/test.md', 'utf8')).toContain('Nova nota');
});
it('returns structured same-block conflicts without overwriting content', () => {
  const day = tripBlocks('test', dated).days[0]!;
  setup(dated.replace('Visita', 'Editado pelo usuário'));
  try { editTrip('test', { preconditions: day.guards, operation: 'update-stop', target: day.stops[0]!.anchor, changes: { time: '11:00' } }); throw new Error('Expected conflict'); }
  catch (error) { expect(error).toBeInstanceOf(AgentError); expect((error as AgentError).details).toMatchObject({ code: 'block-conflict', conflicts: [expect.objectContaining({ anchor: day.anchor })] }); }
  expect(readFileSync('content/trips/test.md', 'utf8')).toContain('Editado pelo usuário');
});
it('requires dependencies and conflicts on changed incoming luggage/calendar/budget context', () => {
  const baggage = dated.replace(' — Visita', ' — Saída com as malas');
  const day = tripBlocks('test', baggage).days[1]!;
  const payload = { preconditions: day.guards, operation: 'update-stop', target: day.stops[0]!.anchor, changes: { note: 'Nova nota' } };
  expect(() => planTripEdit('test', baggage.replace('Saída com as malas', 'Deixar as malas'), payload)).toThrow('dependency');
  expect(() => planTripEdit('test', baggage.replace('dates: 2026-10-04', 'budget: comida €20\ndates: 2026-10-04'), payload)).toThrow('dependency');
  expect(() => planTripEdit('test', baggage, { ...payload, preconditions: day.guards.filter(guard => guard.anchor === day.anchor) })).toThrow('dependency');
});
it('allows unapproved afternoon changes while protecting morning and its period assignment', () => {
  const before = raw.replace('### Dia 1 — Paris\n', '### Dia 1 — Paris\n  - períodos fechados: manhã\n')
    + '- 15:00 [Site](https://example.com) — Passeio\n';
  expect(() => validateChange('test', before, before.replace('Passeio', 'Fotografia'))).not.toThrow();
  expect(() => validateChange('test', before, before.replace('15:00', '11:00'))).toThrow('Protected');
  expect(() => validateChange('test', before, before.replace('Passeio', 'Almoço'))).toThrow('Protected');
});
it('protects approved periods across same-date city headings', () => {
  const before = dated.replace('### Dia 1 — Paris\n', '### Dia 1 — 4/10\n  - períodos fechados: manhã\n')
    .replace('### Dia 2 — Paris', '## Paris de novo\ncity: paris\n\n### Dia 2 — 4/10').replace('15:00', '11:00');
  expect(() => validateChange('test', before, before.replace('Outra visita', 'Alterado'))).toThrow('Protected');
});
it('returns preview differences without writing and never accepts self-asserted authorization', () => {
  setup(); const day = tripBlocks('test', raw).days[0]!;
  const preview = editTrip('test', { revision: revisionOf(raw), operation: 'update-stop', target: day.stops[0]!.anchor, changes: { note: 'Nova nota' }, dryRun: true });
  expect(preview.changes?.[0]).toMatchObject({ anchor: day.anchor, afterRevision: expect.any(String) });
  const compact = editTrip('test', { revision: revisionOf(raw), operation: 'update-stop', target: day.stops[0]!.anchor, changes: { note: 'Nova nota' }, dryRun: true });
  expect(compact.changes?.[0]).not.toHaveProperty('before'); expect(compact.changes?.[0]).not.toHaveProperty('after');
  expect(readFileSync('content/trips/test.md', 'utf8')).toBe(raw);
  const protectedRaw = raw + '  - decisão: manter visita\n';
  expect(() => planTripEdit('test', protectedRaw, { revision: revisionOf(protectedRaw), operation: 'update-stop',
    target: tripBlocks('test', protectedRaw).days[0]!.stops[0]!.anchor, changes: { note: 'Remover visita' }, force: true, authorizedByUser: true })).toThrow('Protected');
});
it('guards adjacent transport endpoints while allowing unrelated neighbor note edits', () => {
  const source = dated.replace(' — Visita', ' — Visita\n  - via: Metrô · 20 min\n  - saída: 10:30\n  - embarque: 2026-10-04 · M1 · A → B · 10:40 → 11:00');
  const day = tripBlocks('test', source).days[1]!;
  const payload = { preconditions: day.guards, operation: 'update-stop', target: day.stops[0]!.anchor, changes: { note: 'Nova nota' } };
  expect(() => planTripEdit('test', source.replace(' — Visita', ' — Nota irrelevante'), payload)).not.toThrow();
  expect(() => planTripEdit('test', source.replace('10:00', '10:05'), payload)).toThrow('dependency');
  expect(() => planTripEdit('test', source.replace('10:40', '10:45'), payload)).toThrow('dependency');
  expect(() => planTripEdit('test', source.replace('Metrô · 20 min', 'Metrô · 30 min'), payload)).toThrow('dependency');
  const first = tripBlocks('test', source).days[0]!;
  expect(() => planTripEdit('test', source.replace('15:00', '16:00'), { preconditions: first.guards,
    operation: 'update-stop', target: first.stops[0]!.anchor, changes: { note: 'Outra nota' } })).toThrow('dependency');
});
it('moves an unchanged confirmed stop between unapproved days without transferring its status', () => {
  const source = dated.replace(' — Visita\n', ' — Visita\n  - status: confirmado\n');
  const days = tripBlocks('test', source).days;
  setup(source);
  editTrip('test', { revision: revisionOf(source), operation: 'move-stop', target: days[0]!.stops[0]!.anchor, day: days[1]!.anchor, before: days[1]!.stops[0]!.anchor });
  const saved = readFileSync('content/trips/test.md', 'utf8');
  expect(saved).toContain('- 10:00 [Louvre](place:par-louvre) — Visita\n  - status: confirmado\n- 15:00 [Site]');
  expect(saved.match(/status: confirmado/g)).toHaveLength(1);
  expect(() => planTripEdit('test', source, { revision: revisionOf(source), operation: 'remove-stop', target: days[0]!.stops[0]!.anchor })).toThrow('Protected');
  expect(() => validateChange('test', source, source.replace('  - status: confirmado\n', '') + '  - status: confirmado\n')).toThrow('Protected');
});
it('still blocks moving a decision owner or approved stop even when confirmed', () => {
  for (const source of [dated.replace(' — Visita\n', ' — Visita\n  - status: confirmado\n  - decisão: Manter aqui\n'),
    dated.replace('### Dia 1 — Paris\n', '### Dia 1 — Paris\n  - períodos fechados: manhã\n').replace(' — Visita\n', ' — Visita\n  - status: confirmado\n')]) {
    const days = tripBlocks('test', source).days;
    expect(() => planTripEdit('test', source, { revision: revisionOf(source), operation: 'move-stop', target: days[0]!.stops[0]!.anchor, day: days[1]!.anchor })).toThrow('Protected');
  }
});
it('fails closed when a moved confirmed block is indistinguishable from a destination copy', () => {
  const source = dated.replace(' — Visita\n', ' — Visita\n  - status: confirmado\n')
    .replace('- 15:00 [Site](https://example.com) — Outra visita', '- 10:00 [Louvre](place:par-louvre) — Visita\n  - status: confirmado');
  const days = tripBlocks('test', source).days;
  expect(() => planTripEdit('test', source, { revision: revisionOf(source), operation: 'move-stop', target: days[0]!.stops[0]!.anchor, day: days[1]!.anchor })).toThrow('ambiguous');
});

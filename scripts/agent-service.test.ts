import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, it } from 'vitest';
import { editTrip, revisionOf, validateChange } from './agent-service';
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
it.each(['  - decisão: reservado', '  - decision: reserved', '  - períodos fechados: manhã', '  - status: fechado', '  - status: confirmado', '  - status: a confirmar'])('protects metadata and its context: %s', metadata => {
  const before = raw + metadata + '\n';
  expect(() => validateChange('test', before, before.replace('10:00', '11:00'))).toThrow('Protected');
  expect(() => validateChange('test', before, raw)).toThrow('Protected');
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

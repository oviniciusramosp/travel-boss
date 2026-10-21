import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { readTrip, editTrip, revisionOf } from './agent-service';
import { AgentIndex } from './agent-index';
import { readReference } from './agent-references';
import { agentDoctor, createAgentTools } from './agent-tools';

const cwd = process.cwd(); let temp = ''; let index: AgentIndex | undefined;
afterEach(() => { index?.close(); index = undefined; process.chdir(cwd); if (temp) rmSync(temp, { recursive: true, force: true }); temp = ''; });
function setup() {
  temp = mkdtempSync(join(tmpdir(), 'tb-boundary-'));
  const root = join(temp, 'checkout'); mkdirSync(join(root, 'content/trips'), { recursive: true });
  writeFileSync(join(temp, 'outside.md'), '# Private\nSENSITIVE_BOUNDARY_SENTINEL\n');
  process.chdir(root); return root;
}
it('rejects symlinked trip files escaping the checkout on both read and write', () => {
  setup(); symlinkSync(join(temp, 'outside.md'), 'content/trips/escape.md');
  expect(() => readTrip('escape')).toThrow('inside this checkout');
  expect(() => editTrip('escape', { revision: revisionOf('# Private\nSENSITIVE_BOUNDARY_SENTINEL\n'), edits: [{ before: ['# Private'], after: ['# Changed'] }] })).toThrow('inside this checkout');
  expect(readFileSync(join(temp, 'outside.md'), 'utf8')).toContain('# Private');
});
it('rejects a symlinked trip directory outside the project', () => {
  const root = setup(); rmSync(join(root, 'content/trips'), { recursive: true });
  mkdirSync(join(temp, 'external-trips')); writeFileSync(join(temp, 'external-trips/test.md'), '# Test');
  symlinkSync(join(temp, 'external-trips'), 'content/trips');
  expect(() => readTrip('test')).toThrow('inside this checkout');
});
it('keeps outside symlink content out of the search index', () => {
  setup(); symlinkSync(join(temp, 'outside.md'), 'content/trips/escape.md');
  index = new AgentIndex(':memory:');
  expect(index.search('SENSITIVE_BOUNDARY_SENTINEL', 10, 0, 'trip').matches).toEqual([]);
});
it('keeps sensitive descendant URLs out of reference provenance as well as excerpts', () => {
  setup(); mkdirSync('docs/references', { recursive: true });
  const file = 'docs/references/source.md';
  writeFileSync(file, '# Research\n- Reserva código: private\n  - https://www.louvre.fr/private-booking/SENSITIVE_BOUNDARY_SENTINEL\nPublic opening-hours research from official source.\n');
  const snippets = readReference(file);
  expect(snippets.some(snippet => snippet.excerpt.includes('Public opening'))).toBe(true);
  expect(JSON.stringify(snippets)).not.toContain('SENSITIVE_BOUNDARY_SENTINEL');
});
it('fails closed without a valid checkout build manifest even when writes were enabled', async () => {
  setup(); writeFileSync('content/trips/test.md', '# Test\n');
  const tools = createAgentTools({ allowWrites: true });
  try {
    expect(agentDoctor().catalogFresh).toBe(false);
    await expect(tools.call('travel_list')).rejects.toThrow('stale');
    await expect(tools.call('travel_apply', { trip: 'test', payload: { revision: revisionOf('# Test\n'), edits: [{ before: ['# Test'], after: ['# Changed'] }] } })).rejects.toThrow('stale');
    expect(readFileSync('content/trips/test.md', 'utf8')).toBe('# Test\n');
    expect(agentDoctor({ version: 2, projectRoot: process.cwd(), files: [{ path: 'src/../../outside.md', hash: 'a'.repeat(64) }] }).staleInputs).toEqual(['invalid-build-manifest']);
  } finally { tools.close(); }
});

import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { agentDoctor, createAgentTools } from './agent-tools';
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
let runtime: ReturnType<typeof createAgentTools> | undefined; let temp = ''; const cwd = process.cwd();
afterEach(() => { runtime?.close(); process.chdir(cwd); if (temp) rmSync(temp, { recursive: true, force: true }); temp = ''; });
it('discovers typed tools, rejects invalid arguments and keeps writes disabled by default', async () => {
  runtime = createAgentTools();
  expect(runtime.list().some(tool => tool.name === 'travel_apply')).toBe(false);
  expect(runtime.list().find(tool => tool.name === 'travel_context')?.inputSchema.required).toEqual(['trip', 'date']);
  expect(runtime.list().find(tool => tool.name === 'travel_preview')?.inputSchema.properties).toHaveProperty('payload.anyOf');
  await expect(runtime.call('travel_context', { trip: '../private', date: '2026-10-18' })).rejects.toThrow('format');
  await expect(runtime.call('travel_list', { surprise: true })).rejects.toThrow('unknown');
  await expect(runtime.call('travel_apply', { trip: 'test', payload: { revision: '0'.repeat(64), edits: [{ before: ['before'], after: ['after'] }] } })).rejects.toThrow('disabled');
  await expect(runtime.call('travel_preview', { trip: 'test', payload: { force: true } })).rejects.toThrow('does not match');
  expect(await runtime.call('travel_rules', { task: 'research' })).toHaveProperty('mandatory');
});
it('detects stale source/catalog and rejects using another checkout snapshot', async () => {
  temp = mkdtempSync(join(tmpdir(), 'tb-doctor-')); mkdirSync(join(temp, 'src'), { recursive: true });
  writeFileSync(join(temp, 'src/catalog.ts'), 'first'); process.chdir(temp);
  const { realpathSync } = await import('node:fs');
  const manifest = { version: 2, projectRoot: realpathSync(temp), files: [{ path: 'src/catalog.ts', hash: hash('first') }] };
  expect(agentDoctor(undefined).catalogFresh).toBe(false);
  expect(agentDoctor(manifest).catalogFresh).toBe(true);
  writeFileSync('src/catalog.ts', 'second');
  runtime = createAgentTools({ manifest });
  expect(agentDoctor(manifest).staleInputs).toEqual(['src/catalog.ts']);
  await expect(runtime.call('travel_list')).rejects.toThrow('stale');
  expect(agentDoctor({ ...manifest, projectRoot: '/another/checkout' }).catalogFresh).toBe(false);
});
it.each([[], {}, { version: 2 }, { version: 2, projectRoot: '', files: [] }, { version: 2, projectRoot: '   ', files: [] },
  { version: 2, projectRoot: cwd, files: [null] }, { version: 2, projectRoot: cwd, files: [[]] },
  { version: 2, projectRoot: cwd, files: [{ path: 'src/catalog.ts', hash: ['a'.repeat(64)] }] }])('reports malformed manifest %# as stale without crashing', manifest => {
  expect(agentDoctor(manifest)).toMatchObject({ catalogFresh: false, staleInputs: ['invalid-build-manifest'] });
});

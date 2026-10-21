import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, cpSync, symlinkSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
const repo = resolve(new URL('..', import.meta.url).pathname);
const cli = resolve(repo, 'scripts/travel-agent.mjs'), mcp = resolve(repo, 'scripts/travel-agent-mcp.mjs');
test('CLI and MCP discover tools, keep default write scope closed and stay on the selected checkout', () => {
  const inputs = [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'test', version: '1' } } },
    { jsonrpc: '2.0', method: 'notifications/initialized' }, { jsonrpc: '2.0', id: 2, method: 'tools/list' },
    { jsonrpc: '2.0', id: 3, method: 'tools/call', params: { name: 'travel_rules', arguments: { task: 'research' } } },
    { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'travel_apply', arguments: { trip: 'test', payload: {} } } }];
  const result = spawnSync(process.execPath, [mcp], { cwd: repo, input: inputs.map(value => JSON.stringify(value)).join('\n') + '\n', encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const messages = result.stdout.trim().split('\n').map(line => JSON.parse(line));
  assert.equal(messages.length, 4);
  assert.equal(messages[0].result.protocolVersion, '2025-06-18');
  assert.ok(messages[1].result.tools.some(tool => tool.name === 'travel_context'));
  assert.ok(!messages[1].result.tools.some(tool => tool.name === 'travel_apply'));
  assert.equal(messages[2].result.structuredContent.task, 'research');
  assert.equal(messages[3].result.isError, true);
  const dir = mkdtempSync(join(tmpdir(), 'tb-cli-root-'));
  try {
    mkdirSync(join(dir, 'content/trips'), { recursive: true });
    writeFileSync(join(dir, 'content/trips/test.md'), '# Test');
    const changedRoot = spawnSync(process.execPath, [cli, '--root', dir, 'list'], { cwd: repo, encoding: 'utf8' });
    assert.equal(changedRoot.status, 1); assert.match(changedRoot.stderr, /another checkout/);
    assert.equal(readFileSync(join(dir, 'content/trips/test.md'), 'utf8'), '# Test');
    const unknown = spawnSync(process.execPath, [cli, 'call', 'unknown', join(dir, 'missing.json')], { cwd: repo, encoding: 'utf8' });
    assert.equal(unknown.status, 1);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('local installer binds the target source, keeps private Markdown out of bundles and detects stale catalog', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-install-'));
  try {
    cpSync(resolve(repo, 'src'), join(dir, 'src'), { recursive: true });
    mkdirSync(join(dir, 'content/trips'), { recursive: true });
    const privateMarker = 'TRAVEL_PRIVATE_RESERVATION_FIXTURE_829134';
    const raw = '# Trip\n## Paris\ncity: paris\ndates: 2026-10-04 → 2026-10-04\n### Dia 1\n- 10:00 [Louvre](place:par-louvre) — Visita\n  **PIN:** ' + privateMarker + '\n';
    writeFileSync(join(dir, 'content/trips/test.md'), raw);
    writeFileSync(join(dir, 'package.json'), '{"private":true,"type":"module"}');
    mkdirSync(join(dir, 'node_modules'), { recursive: true });
    for (const dependency of ['vite', 'maplibre-gl', 'leaflet']) symlinkSync(resolve(repo, 'node_modules', dependency), join(dir, 'node_modules', dependency));
    const result = spawnSync(process.execPath, [resolve(repo, 'scripts/install-agent-tools.mjs'), dir], { cwd: repo, encoding: 'utf8', timeout: 60000 });
    assert.equal(result.status, 0, result.stderr);
    const installed = JSON.parse(result.stdout.trim()); assert.ok(installed.sourceFilesVerified > 0);
    const installedCli = join(installed.installed, 'scripts/travel-agent.mjs');
    const doctor = spawnSync(process.execPath, [installedCli, 'doctor'], { cwd: dir, encoding: 'utf8' });
    assert.equal(doctor.status, 0, doctor.stderr); assert.equal(JSON.parse(doctor.stdout).catalogFresh, true);
    const { readdirSync } = await import('node:fs');
    for (const name of readdirSync(join(installed.installed, 'build'))) if (name.endsWith('.mjs')) assert.ok(!readFileSync(join(installed.installed, 'build', name), 'utf8').includes(privateMarker));
    const source = join(dir, 'src/data/travel.ts'); writeFileSync(source, readFileSync(source, 'utf8') + '\n// changed target catalog\n');
    const stale = spawnSync(process.execPath, [installedCli, 'list'], { cwd: dir, encoding: 'utf8' });
    assert.equal(stale.status, 1); assert.match(stale.stderr, /stale/);
    assert.equal(readFileSync(join(dir, 'content/trips/test.md'), 'utf8'), raw);
    rmSync(installed.installed, { recursive: true, force: true });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('MCP survives malformed messages and validates initialization before serving tools', () => {
  const input = ['null', '[]', '{', JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {} }),
    JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'fixture', version: '1' } } }),
    JSON.stringify({ jsonrpc: '2.0', id: 4, method: 'tools/list' })];
  const result = spawnSync(process.execPath, [mcp], { cwd: repo, input: input.join('\n') + '\n', encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  const replies = result.stdout.trim().split('\n').map(JSON.parse);
  assert.deepEqual(replies.slice(0, 5).map(reply => reply.error.code), [-32600, -32600, -32700, -32602, -32000]);
  assert.equal(replies[5].result.protocolVersion, '2025-06-18');
  assert.ok(replies[6].result.tools.length > 0);
});

test('CLI and MCP remain available for diagnosis when build manifests contain malformed JSON shapes', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-bad-manifest-'));
  try {
    mkdirSync(join(dir, 'scripts')); mkdirSync(join(dir, 'build'));
    cpSync(cli, join(dir, 'scripts/travel-agent.mjs')); cpSync(mcp, join(dir, 'scripts/travel-agent-mcp.mjs'));
    cpSync(join(repo, 'build/agent-tools.mjs'), join(dir, 'build/agent-tools.mjs'));
    const inputs = [{ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'fixture', version: '1' } } },
      { jsonrpc: '2.0', id: 2, method: 'tools/call', params: { name: 'travel_capabilities', arguments: {} } },
      { jsonrpc: '2.0', id: 3, method: 'tools/list' },
      { jsonrpc: '2.0', id: 4, method: 'tools/call', params: { name: 'travel_list', arguments: {} } }];
    const env = { ...process.env, TB_STATE_DIR: '' };
    for (const manifest of ['{', '{}', '[]', '{"version":2}', '{"version":2,"projectRoot":" ","files":[]}',
      JSON.stringify({ version: 2, projectRoot: repo, files: [null] })]) {
      writeFileSync(join(dir, 'build/agent-build.json'), manifest);
      const doctor = spawnSync(process.execPath, [join(dir, 'scripts/travel-agent.mjs'), 'doctor'], { cwd: repo, env, encoding: 'utf8' });
      assert.equal(doctor.status, 0, doctor.stderr); assert.equal(JSON.parse(doctor.stdout).catalogFresh, false);
      const blocked = spawnSync(process.execPath, [join(dir, 'scripts/travel-agent.mjs'), 'list'], { cwd: repo, env, encoding: 'utf8' });
      assert.equal(blocked.status, 1); assert.match(blocked.stderr, /stale/);
      const server = spawnSync(process.execPath, [join(dir, 'scripts/travel-agent-mcp.mjs')], { cwd: repo, env, input: inputs.map(JSON.stringify).join('\n') + '\n', encoding: 'utf8' });
      assert.equal(server.status, 0, server.stderr);
      const replies = server.stdout.trim().split('\n').map(JSON.parse);
      assert.equal(replies[0].result.protocolVersion, '2025-06-18');
      assert.equal(replies[1].result.structuredContent.catalogFresh, false);
      assert.ok(replies[2].result.tools.length > 0); assert.equal(replies[3].result.isError, true);
    }
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

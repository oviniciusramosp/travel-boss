import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { once } from 'node:events';
import { get, request } from 'node:http';
test('production serves existing APIs and validates protected agent writes behind origin guards', async () => {
  const cwd = process.cwd(), dir = mkdtempSync(join(tmpdir(), 'tb-http-'));
  for (const path of ['content/trips', 'content/checklists', 'src/data', 'dist', 'build']) mkdirSync(join(dir, path), { recursive: true });
  const raw = '# Trip\n\n## Paris\ncity: paris\ndates: 2026-10-04 → 2026-10-04\n### Dia 1 — Paris 04/10\n- 10:00 [Louvre](place:par-louvre) — Visita\n';
  writeFileSync(join(dir, 'content/trips/test.md'), raw);
  writeFileSync(join(dir, 'src/data/travel-place-edits.json'), '{}');
  writeFileSync(join(dir, 'src/data/fixture.ts'), 'fixture');
  writeFileSync(join(dir, 'build/agent-build.json'), JSON.stringify({ version: 2, projectRoot: (await import('node:fs')).realpathSync(dir), files: [{ path: 'src/data/fixture.ts', hash: createHash('sha256').update('fixture').digest('hex') }] }));
  writeFileSync(join(dir, 'dist/index.html'), '<html>private shell</html>');
  const previousState = process.env.TB_STATE_DIR;
  process.env.TB_STATE_DIR = join(dir, '.state');
  writeFileSync(join(dir, 'dist/test.mp4'), '0123456789');
  process.chdir(dir); let server;
  try {
    const { createProductionServer } = await import('../build/server.mjs');
    server = await createProductionServer({ origin: 'https://travel.test', token: 'test-token' });
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = `http://127.0.0.1:${server.address().port}`;
    const call = (path, options = {}) => new Promise((resolve, reject) => {
      const req = request(base + path, { method: options.method || 'GET', headers: { Host: 'travel.test', ...options.headers } }, res => {
        const chunks = []; res.on('data', data => chunks.push(data));
        res.on('end', () => resolve(new Response(Buffer.concat(chunks), { status: res.statusCode, headers: res.headers })));
      }); req.on('error', reject); req.end(options.body);
    });
    assert.equal((await call('/')).status, 200);
    assert.equal((await call('/healthz')).status, 200);
    const video = await call('/test.mp4', { headers: { Range: 'bytes=2-4' } });
    assert.equal(video.status, 206); assert.equal(await video.text(), '234');
    assert.equal((await call('/test.mp4', { headers: { Range: 'bytes=90-99' } })).status, 416);
    assert.equal((await call('/api/trips/test', { headers: { Origin: 'https://evil.test' } })).status, 403);
    assert.equal(await new Promise(resolve => get(base + '/api/trips/test', { headers: { Host: 'evil.test' } }, res => { res.resume(); resolve(res.statusCode); })), 403);
    assert.equal((await call('/api/missing')).status, 404);
    const loaded = await (await call('/api/trips/test')).json(); assert.equal(loaded.raw, raw);
    const listed = await (await call('/api/agent/trips')).json(); const revision = listed.trips[0].revision;
    const headers = { 'Content-Type': 'application/json', Authorization: 'Bearer test-token' };
    const edit = { revision, operation: 'update-stop', dayLine: 6, stopLine: 7, changes: { time: '11:00' } };
    assert.equal((await call('/api/agent/trips/test/edit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(edit) })).status, 403);
    assert.equal((await call('/api/agent/trips/test/edit', { method: 'POST', headers, body: JSON.stringify(edit) })).status, 200);
    assert.equal((await call('/api/agent/trips/test/edit', { method: 'POST', headers, body: JSON.stringify(edit) })).status, 409);
    assert.match(readFileSync('content/trips/test.md', 'utf8'), /11:00/);
    assert.equal((await call('/api/agent/trips/test/days/6')).status, 200);
    assert.equal((await call('/api/agent/search?q=louvre')).status, 200);
    assert.equal((await call('/api/agent/places/par-louvre')).status, 200);
    const browser = { 'Content-Type': 'application/json', Origin: 'https://travel.test' };
    assert.equal((await call('/api/trips/test', { method: 'PATCH', headers: browser, body: JSON.stringify({ line: 7, before: ['- 11:00 [Louvre](place:par-louvre) — Visita'], after: ['- 12:00 [Louvre](place:par-louvre) — Visita'] }) })).status, 200);
    assert.equal((await call('/api/places/par-louvre', { method: 'PATCH', headers: browser, body: '{"rating":4}' })).status, 200);
    const context = await (await call('/api/agent/trips/test/context?date=2026-10-04')).json();
    assert.equal(context.date, '2026-10-04'); assert.equal(context.places[0].rating, 4);
    assert.equal(context.blocks[0].raw, undefined);
    const scoped = { preconditions: context.blocks.flatMap(block => block.guards), operations: [
      { operation: 'update-stop', target: context.rows[0].anchor, changes: { time: '13:00' } },
    ] };
    const preview = await call('/api/agent/trips/test/preview', { method: 'POST', headers, body: JSON.stringify(scoped) });
    assert.equal(preview.status, 200);
    const planned = await preview.json(); assert.equal(planned.dryRun, true);
    assert.deepEqual(planned.changedDates, ['2026-10-04']); assert.equal(planned.edits[0].before, undefined);
    assert.match(readFileSync('content/trips/test.md', 'utf8'), /12:00/);
    const tools = await (await call('/api/agent/tools')).json();
    assert.ok(tools.tools.find(tool => tool.name === 'travel_apply').inputSchema.properties.payload.anyOf);
    assert.equal((await call('/api/agent/tools/travel_preview', { method: 'POST', headers, body: JSON.stringify({ trip: 'test', payload: { ...scoped, force: true } }) })).status, 400);
    assert.equal((await call('/api/agent/trips/test/edit', { method: 'POST', headers, body: JSON.stringify(scoped) })).status, 200);
    const conflict = await call('/api/agent/trips/test/edit', { method: 'POST', headers, body: JSON.stringify(scoped) });
    assert.equal(conflict.status, 409); assert.equal((await conflict.json()).details.code, 'block-conflict');
    assert.match(readFileSync('content/trips/test.md', 'utf8'), /13:00/);
    assert.equal((await call('/api/agent/rules?task=transport')).status, 200);
    assert.equal((await call('/api/checklists/test')).status, 200);
    assert.equal((await call('/api/weather?lat=999&lng=2')).status, 400);
    assert.equal((await call('/api/weather?lat=1&lng=2&tz=invalid')).status, 400);
    assert.equal((await call('/api/place-edits')).status, 200);
  } finally {
    if (server) { server.close(); server.closeAllConnections(); await once(server, 'close'); }
    if (previousState === undefined) delete process.env.TB_STATE_DIR; else process.env.TB_STATE_DIR = previousState;
    process.chdir(cwd); rmSync(dir, { recursive: true, force: true });
  }
});

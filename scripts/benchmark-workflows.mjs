#!/usr/bin/env node
import { performance } from 'node:perf_hooks';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import assert from 'node:assert/strict';
import { createAgentTools } from '../build/agent-tools.mjs';
const cwd = process.cwd(), scratch = mkdtempSync(join(tmpdir(), 'tb-workflow-')), samples = 20;
const fixture = `# Workflow fixture\n## Paris\ncity: paris\ndates: 2026-10-04 → 2026-10-06\nbudget: comida €50\n### Dia 1 — 04/10\n- 09:00 [Louvre](place:par-louvre) — Visita\n  - status: confirmado\n  - comentário: Ajustar o plano\n- 12:00 [Orly](place:par-ory) — Almoço\n### Dia 2 — 05/10 · Partida para Milão\n- 08:00 [Orly](place:par-ory) — Saída com as malas\n## Milão\ncity: milao\ndates: 2026-10-05 → 2026-10-06\n### Dia 1 — 05/10\n- 11:00 [Centrale](place:mil-centrale)\n- 12:00 [Duomo](place:mil-duomo) — Almoço\n`;
const cases = {
  confirmed_note: context => [{ operation: 'update-stop', target: context.rows[0].anchor, changes: { note: 'Entrada pela lateral' } }],
  costs_and_comment: context => [{ operation: 'set-cost', target: context.rows[0].anchor, kind: 'ticket', amount: 0 }, { operation: 'resolve-comment', target: context.rows[0].anchor, commentText: 'Ajustar o plano' }],
  move_stop: context => [{ operation: 'move-stop', target: context.rows[1].anchor, day: context.blocks[0].anchor, before: context.rows[0].anchor }],
  insert_stop: context => [{ operation: 'insert-stop', day: context.blocks[0].anchor, stop: { placeId: 'par-louvre', label: 'Retorno', time: '16:00', note: 'Visita por fora' } }],
  transfer: context => [{ operation: 'set-transfer', target: context.rows[0].anchor, detail: 'Táxi · 30 min · €10', departure: '10:30' }],
};
let runtime;
try {
  mkdirSync(join(scratch, 'content/trips'), { recursive: true }); process.chdir(scratch);
  const metrics = {};
  for (const [name, operations] of Object.entries(cases)) {
    const times = []; let last;
    for (let i = 0; i < samples; i++) {
      writeFileSync('content/trips/test.md', fixture);
      runtime = createAgentTools({ allowWrites: true, allowUnbound: true });
      let calls = 0, inputBytes = 0, outputBytes = 0;
      const call = async (tool, args) => { calls++; inputBytes += Buffer.byteLength(JSON.stringify(args)); const out = await runtime.call(tool, args); outputBytes += Buffer.byteLength(JSON.stringify(out)); return out; };
      const started = performance.now();
      const context = await call('travel_context', { trip: 'test', date: '2026-10-04' });
      const preconditions = [...new Map(context.blocks.flatMap(block => block.guards).map(guard => [guard.anchor, guard])).values()];
      const payload = { revision: context.revision, preconditions, operations: operations(context) };
      const preview = await call('travel_preview', { trip: 'test', payload });
      assert.equal(readFileSync('content/trips/test.md', 'utf8'), fixture, 'Preview must not write');
      await call('travel_apply', { trip: 'test', payload });
      const after = await call('travel_context', { trip: 'test', date: '2026-10-04' });
      assert.notEqual(after.revision, context.revision); assert.deepEqual(after.errors, []);
      if (name === 'confirmed_note') assert.equal(after.rows[0].status, 'confirmado');
      if (name === 'costs_and_comment') assert.ok(!after.rows[0].comments?.length);
      times.push(performance.now() - started); last = { calls, inputBytes, outputBytes, changedDates: preview.changedDates.length };
      runtime.close(); runtime = undefined;
    }
    times.sort((a, b) => a - b);
    metrics[name] = { samples, p50Ms: +times[Math.floor(samples * .5)].toFixed(3), p95Ms: +times[Math.floor(samples * .95)].toFixed(3), ...last, failures: 0 };
  }
  writeFileSync('content/trips/test.md', fixture); runtime = createAgentTools({ allowWrites: true, allowUnbound: true });
  const multiCity = await runtime.call('travel_context', { trip: 'test', date: '2026-10-05' });
  assert.equal(multiCity.days.length, 2);
  const report = { date: new Date().toISOString(), node: process.version, platform: process.platform, tasks: metrics,
    multiCity: { cities: multiCity.cities, headings: multiCity.days.length, calls: 1 },
    measurement: 'Deterministic complete tool workflows: context → preview → apply → verify. No real itinerary changed.',
    llm: { measured: false, inputTokens: null, outputTokens: null, modelLatencyMs: null, explanation: 'Tool traces can be combined with actual client/model events using benchmark-llm-traces.mjs; no model speedup is claimed.' } };
  process.chdir(cwd); if (process.argv[2]) writeFileSync(resolve(process.argv[2]), JSON.stringify(report, null, 2) + '\n'); console.log(JSON.stringify(report, null, 2));
} finally { runtime?.close(); process.chdir(cwd); rmSync(scratch, { recursive: true, force: true }); }

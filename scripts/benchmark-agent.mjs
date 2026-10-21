#!/usr/bin/env node
import { performance } from 'node:perf_hooks';
import { mkdtempSync, readdirSync, readFileSync, rmSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { AgentIndex } from '../build/agent-index.mjs';
import { listTrips, readTrip, editTrip, revisionOf } from '../build/agent-service.mjs';
import { ResearchCache } from '../build/research-cache.mjs';
const samples = 30, metrics = {}, scratch = mkdtempSync(join(tmpdir(), 'tb-bench-'));
const bytes = value => Buffer.byteLength(JSON.stringify(value));
async function measure(name, fn) {
  const times = []; let result;
  for (let i = 0; i < samples; i++) { const t = performance.now(); result = await fn(); times.push(performance.now() - t); }
  times.sort((a, b) => a - b);
  metrics[name] = { samples, p50Ms: +times[Math.floor(samples * .5)].toFixed(3), p95Ms: +times[Math.floor(samples * .95)].toFixed(3), responseBytes: bytes(result) };
  return result;
}
let index; const cwd = process.cwd();
try {
  const start = performance.now(); index = new AgentIndex(join(scratch, 'agent.sqlite'));
  const firstSearch = index.search('Louvre'); const coldIndexMs = performance.now() - start;
  const tripId = listTrips()[0].id;
  const full = readTrip(tripId);
  await measure('wholeTrip', () => ({ id: tripId, file: `content/trips/${tripId}.md`, raw: readFileSync(join('content/trips', `${tripId}.md`), 'utf8') }));
  const day = full.trip.cities.flatMap(city => city.days)[0];
  await measure('scopedDay', () => { const trip = readTrip(tripId); return { revision: trip.revision, day: trip.trip.cities.flatMap(city => city.days).find(item => item.line === day.line) }; });
  await measure('scanMarkdown', () => readdirSync('content/trips').filter(name => name.endsWith('.md')).flatMap(name =>
    readFileSync(join('content/trips', name), 'utf8').split(/\r?\n/).flatMap((text, i) => text.toLowerCase().includes('louvre') ? [{ trip: name.slice(0, -3), line: i + 1, text }] : [])).slice(0, 30));
  await measure('sqliteSearch', () => index.search('Louvre', 30, 0, 'trip'));
  await measure('cliListWithStartup', () => { const result = spawnSync(process.execPath, ['scripts/travel-agent.mjs', 'list'], { encoding: 'utf8' }); if (result.status) throw Error(result.stderr); return JSON.parse(result.stdout); });
  mkdirSync(join(scratch, 'content/trips'), { recursive: true });
  const fixture = '# Benchmark\n\n## Paris\ncity: paris\n\n### Dia 1 — Paris\n' + Array.from({ length: 5 }, (_, i) => `- ${10 + i}:00 [Louvre](place:par-louvre) — Note ${i}`).join('\n') + '\n';
  writeFileSync(join(scratch, 'content/trips/test.md'), fixture); process.chdir(scratch);
  const edits = Array.from({ length: 5 }, (_, i) => ({ before: [`- ${10 + i}:00 [Louvre](place:par-louvre) — Note ${i}`], after: [`- ${10 + i}:30 [Louvre](place:par-louvre) — Note ${i}`] }));
  await measure('singleEditDryRun', () => editTrip('test', { revision: revisionOf(fixture), edits: edits.slice(0, 1), dryRun: true }));
  await measure('fiveEditsDryRun', () => editTrip('test', { revision: revisionOf(fixture), edits, dryRun: true }));
  let networkCalls = 0;
  const cache = new ResearchCache(join(scratch, 'research'), async () => { networkCalls++; await new Promise(resolve => setTimeout(resolve, 10)); return new Response('Synthetic official source fixture', { headers: { 'content-type': 'text/plain' } }); });
  await measure('externalFixtureUncached', () => cache.get('https://www.louvre.fr/en/visit', true));
  await measure('externalFixtureCached', () => cache.get('https://www.louvre.fr/en/visit'));
  process.chdir(cwd);
  const report = { date: new Date().toISOString(), node: process.version, platform: process.platform, engine: firstSearch.engine, samples,
    coldIndexMs: +coldIndexMs.toFixed(3), metrics, externalFixtureNetworkCalls: networkCalls,
    limits: ['Local measurements, not Mac mini results.', 'Scoped day measures parser + response; it still parses the Markdown source.',
      'SQLite search uses token matching; scan baseline uses substring matching. Small-corpus speed may regress.',
      'External lookup uses a synthetic 10ms provider, not internet or LLM latency.', 'Edit timings are dry runs on a five-stop fixture; no actual itinerary changed.',
      'No end-to-end LLM task speedup is claimed. Response bytes are not measured tokenizer counts.'] };
  console.log(JSON.stringify(report, null, 2));
  if (process.argv[2]) writeFileSync(resolve(process.argv[2]), JSON.stringify(report, null, 2) + '\n');
} finally { process.chdir(cwd); index?.close(); rmSync(scratch, { recursive: true, force: true }); }

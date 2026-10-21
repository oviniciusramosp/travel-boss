import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
test('aggregates only measured model tokens and distinguishes call totals from wall time', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-trace-report-')), file = join(dir, 'events.jsonl');
  try {
    const base = { taskId: 'change-note', variant: 'tools', runId: 'one' };
    const events = [{ ...base, phase: 'tool', durationMs: 5, success: false }, { ...base, phase: 'model', durationMs: 100, inputTokens: 20, outputTokens: 10 },
      { ...base, phase: 'workflow', durationMs: 110 }, { ...base, runId: 'two', phase: 'tool', durationMs: 3, success: true }];
    writeFileSync(file, events.map(event => JSON.stringify(event)).join('\n'));
    const run = spawnSync(process.execPath, ['scripts/benchmark-llm-traces.mjs', file], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr); const report = JSON.parse(run.stdout);
    assert.equal(report.runs[0].inputTokens, 20); assert.equal(report.runs[0].wallTimeMs, 110);
    assert.equal(report.runs[0].failedToolCalls, 1); assert.equal(report.runs[1].inputTokens, null); assert.equal(report.runs[1].wallTimeMs, null);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it, vi } from 'vitest';
import { createAgentTools } from './agent-tools';
it('writes opt-in metadata without private request or response content', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-trace-')), file = join(dir, 'trace.jsonl');
  vi.stubEnv('TB_AGENT_TRACE', file);
  const runtime = createAgentTools();
  try {
    await runtime.call('travel_rules', { task: 'research' });
    await expect(runtime.call('travel_context', { trip: '../PRIVATE_VALUE_MUST_NOT_LEAK', date: '2026-10-01' })).rejects.toThrow();
    const text = readFileSync(file, 'utf8'), events = text.trim().split('\n').map(line => JSON.parse(line));
    expect(events).toHaveLength(2); expect(text).not.toContain('PRIVATE_VALUE'); expect(text).not.toContain('guardrails');
    expect(events[0]).toMatchObject({ phase: 'tool', success: true, inputTokens: null, outputTokens: null });
    expect(events[1].success).toBe(false);
    expect(events[0].durationMs).toBeGreaterThanOrEqual(0);
  } finally { runtime.close(); vi.unstubAllEnvs(); rmSync(dir, { recursive: true, force: true }); }
});

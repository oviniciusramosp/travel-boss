import { appendFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
/** Opt-in metadata only: no prompts, source text, claims, tokens, URLs or credentials. */
export function traceAgentCall(event: { tool: string; durationMs: number; inputBytes: number; outputBytes: number; success: boolean; status?: number }) {
  if (!process.env.TB_AGENT_TRACE) return;
  try {
    const path = resolve(process.env.TB_AGENT_TRACE); mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    appendFileSync(path, JSON.stringify({ at: new Date().toISOString(), runId: process.env.TB_AGENT_RUN_ID?.slice(0, 100) || String(process.pid),
      taskId: process.env.TB_AGENT_TASK_ID?.slice(0, 100) || 'unspecified', variant: process.env.TB_AGENT_VARIANT === 'baseline' ? 'baseline' : 'tools',
      phase: 'tool', ...event, inputTokens: null, outputTokens: null }) + '\n', { mode: 0o600 });
  } catch { /* Trace failures must never fail or expose a user's edit. */ }
}

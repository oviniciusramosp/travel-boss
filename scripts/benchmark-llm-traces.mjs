#!/usr/bin/env node
// Aggregate real opt-in tool metadata and client-supplied model events. Never infer missing tokens.
import { readFileSync, writeFileSync } from 'node:fs';
const input = process.argv[2]; if (!input) throw Error('Usage: benchmark-llm-traces.mjs <events.jsonl> [report.json]');
const records = readFileSync(input, 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
const groups = new Map();
for (const event of records) {
  if (!event.taskId || !event.runId || !['baseline', 'tools'].includes(event.variant) || !['tool', 'model', 'workflow'].includes(event.phase) || !Number.isFinite(event.durationMs) || event.durationMs < 0) throw Error('Invalid event: taskId/runId/variant/phase/durationMs required');
  for (const key of ['inputTokens', 'outputTokens']) if (event[key] != null && (!Number.isInteger(event[key]) || event[key] < 0)) throw Error('Invalid measured token count');
  const key = JSON.stringify([event.taskId, event.runId, event.variant]);
  if (!groups.has(key)) groups.set(key, { taskId: event.taskId, runId: event.runId, variant: event.variant, events: [] });
  groups.get(key).events.push(event);
}
const runs = [...groups.values()].map(({ events, ...run }) => {
  const model = events.filter(event => event.phase === 'model'), tools = events.filter(event => event.phase === 'tool'), workflow = events.filter(event => event.phase === 'workflow');
  const sum = (items, field) => items.reduce((total, item) => total + (item[field] || 0), 0);
  const tokensMeasured = model.length > 0 && model.every(event => event.inputTokens != null && event.outputTokens != null);
  return { ...run, toolCalls: tools.length, failedToolCalls: tools.filter(event => event.success === false).length,
    toolDurationMs: sum(tools, 'durationMs'), modelCalls: model.length, modelDurationMs: model.length ? sum(model, 'durationMs') : null,
    wallTimeMs: workflow.length === 1 ? workflow[0].durationMs : null,
    inputTokens: tokensMeasured ? sum(model, 'inputTokens') : null, outputTokens: tokensMeasured ? sum(model, 'outputTokens') : null,
    source: model.length ? 'client-model-events-and-tool-traces' : 'tool-traces-only' };
});
const report = { runs, warning: 'Summed call times are not wall time when requests overlap. Only a measured workflow event supplies wallTimeMs; missing model/token data stays null.' };
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));

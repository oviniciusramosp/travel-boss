#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
const rootAt = args.indexOf('--root');
if (rootAt >= 0) { if (!args[rootAt + 1]) throw Error('--root requires a directory'); process.chdir(resolve(args[rootAt + 1])); args.splice(rootAt, 2); }
const [command, id, arg] = args;
let runtime;
try {
  const { createAgentTools } = await import('../build/agent-tools.mjs');
  let manifest;
  try { manifest = JSON.parse(readFileSync(fileURLToPath(new URL('../build/agent-build.json', import.meta.url)), 'utf8')); } catch { /* Older builds still report no manifest. */ }
  if (manifest && !process.env.TB_STATE_DIR) process.env.TB_STATE_DIR = resolve(manifest.projectRoot, 'node_modules/.cache/travel-boss-agent-state');
  runtime = createAgentTools({ allowWrites: true, manifest });
  const payload = path => JSON.parse(readFileSync(resolve(path), 'utf8'));
  let result;
  if (command === 'tools') result = { tools: runtime.list() };
  else if (command === 'doctor') result = await runtime.call('travel_capabilities');
  else if (command === 'list') result = await runtime.call('travel_list');
  else if (command === 'context') result = await runtime.call('travel_context', { trip: id, date: arg, ...(args[3] ? payload(args[3]) : {}) });
  else if (command === 'day') result = await runtime.call('travel_day', { trip: id, heading: arg });
  else if (command === 'batch' || command === 'apply' || command === 'preview') result = await runtime.call(command === 'preview' ? 'travel_preview' : 'travel_apply', { trip: id, payload: payload(arg) });
  else if (command === 'search' || command === 'references') result = await runtime.call('travel_search', { q: id, ...(command === 'references' ? { kind: 'reference' } : {}), ...(arg ? payload(arg) : {}) });
  else if (command === 'place') result = await runtime.call('travel_place', { id, ...(arg ? payload(arg) : {}) });
  else if (command === 'research') result = await runtime.call('travel_research', { url: id, ...(arg ? payload(arg) : {}) });
  else if (command === 'facts') result = await runtime.call('travel_facts', id ? payload(id) : {});
  else if (command === 'record-fact') result = await runtime.call('travel_fact_record', payload(id));
  else if (command === 'rules') result = await runtime.call('travel_rules', { task: id });
  else if (command === 'call') result = await runtime.call(id, payload(arg));
  else throw Error('Usage: travel-agent.mjs [--root <checkout>] doctor | tools | list | context <trip> <YYYY-MM-DD> | preview/apply <trip> <json-file> | search/references <query> [options-json] | place <id> | research <url> | rules <task> | call <tool> <json-file>');
  console.log(JSON.stringify(result));
} catch (error) { console.error(JSON.stringify({ error: error.message, status: error.status, details: error.details })); process.exitCode = 1; }
finally { runtime?.close(); }

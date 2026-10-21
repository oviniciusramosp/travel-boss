import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { AgentError } from './agent-service';
import { AgentIndex } from './agent-index';
import { createAgentTools } from './agent-tools';
export const json = (res: any, status: number, body: unknown) => {
  res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body));
};
export async function readJson(req: any) {
  let body = '';
  for await (const chunk of req) { body += chunk.toString(); if (Buffer.byteLength(body) > 131072) throw new AgentError('Body too large', 413); }
  try { return JSON.parse(body); } catch { throw new AgentError('Invalid JSON'); }
}
export function agentApi(index: AgentIndex) {
  let manifest;
  try { manifest = JSON.parse(readFileSync(resolve('build/agent-build.json'), 'utf8')); } catch { /* Fixtures can omit build metadata. */ }
  const runtime = createAgentTools({ index, allowWrites: true, manifest });
  return async (req: any, res: any) => {
    try {
      const url = new URL(req.url, 'http://localhost'), parts = url.pathname.split('/').filter(Boolean);
      const call = async (name: string, args = {}) => json(res, 200, await runtime.call(name, args));
      if (req.method === 'GET' && parts[0] === 'tools') return json(res, 200, { tools: runtime.list() });
      if (req.method === 'GET' && parts[0] === 'capabilities') return await call('travel_capabilities');
      if (req.method === 'GET' && parts[0] === 'rules') return await call('travel_rules', { task: url.searchParams.get('task') });
      if (req.method === 'POST' && parts[0] === 'tools' && parts.length === 2) return await call(parts[1]!, await readJson(req));
      if (req.method === 'POST' && parts[0] === 'facts') return await call('travel_fact_record', await readJson(req));
      if (req.method === 'GET' && parts[0] === 'facts') {
        const args: any = {};
        for (const key of ['subject', 'source', 'type', 'effectiveDate']) if (url.searchParams.has(key)) args[key] = url.searchParams.get(key);
        if (url.searchParams.has('includeStale')) args.includeStale = url.searchParams.get('includeStale') === 'true';
        if (url.searchParams.has('limit')) args.limit = Number(url.searchParams.get('limit'));
        return await call('travel_facts', args);
      }
      if (req.method === 'POST' && parts[0] === 'research') return await call('travel_research', await readJson(req));
      if (req.method === 'GET' && ['search', 'references'].includes(parts[0]!)) {
        const options: Record<string, unknown> = { q: url.searchParams.get('q') || '' };
        for (const key of ['kind', 'city', 'trip', 'place', 'date', 'locale']) if (url.searchParams.has(key)) options[key] = url.searchParams.get(key);
        for (const key of ['limit', 'offset']) if (url.searchParams.has(key)) options[key] = Number(url.searchParams.get(key));
        if (url.searchParams.has('fields')) options.fields = url.searchParams.get('fields')!.split(',');
        if (parts[0] === 'references') options.kind = 'reference';
        return await call('travel_search', options);
      }
      if (req.method === 'GET' && parts[0] === 'places' && parts.length === 2) {
        const args: any = { id: parts[1] };
        if (url.searchParams.has('fields')) args.fields = url.searchParams.get('fields')!.split(',');
        if (url.searchParams.has('locale')) args.locale = url.searchParams.get('locale');
        const result = await runtime.call('travel_place', args) as any;
        return json(res, 200, result.place);
      }
      if (parts[0] !== 'trips') return json(res, 404, { error: 'Unknown agent endpoint' });
      if (req.method === 'GET' && parts.length === 1) return await call('travel_list');
      const trip = parts[1]!;
      if (req.method === 'GET' && parts[2] === 'context' && parts.length === 3) return await call('travel_context', { trip, date: url.searchParams.get('date'), ...(url.searchParams.has('includeRaw') ? { includeRaw: url.searchParams.get('includeRaw') === 'true' } : {}) });
      if (req.method === 'GET' && parts[2] === 'days' && parts.length === 4) return await call('travel_day', { trip, heading: parts[3] });
      if (req.method === 'POST' && ['edit', 'preview'].includes(parts[2]!) && parts.length === 3) return await call(parts[2] === 'edit' ? 'travel_apply' : 'travel_preview', { trip, payload: await readJson(req) });
      return json(res, 404, { error: 'Unknown agent endpoint' });
    } catch (error) { json(res, error instanceof AgentError ? error.status : 400, { error: (error as Error).message, details: (error as AgentError).details }); }
  };
}

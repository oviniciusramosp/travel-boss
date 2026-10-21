import { editTrip, listTrips, readTrip, AgentError } from './agent-service';
import { ResearchCache } from './research-cache';
import { AgentIndex } from './agent-index';
export const json = (res: any, status: number, body: unknown) => {
  res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body));
};
export async function readJson(req: any) {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString();
    if (Buffer.byteLength(body) > 131072) throw new AgentError('Body too large', 413);
  }
  try { return JSON.parse(body); } catch { throw new AgentError('Invalid JSON'); }
}
export function agentApi(index: AgentIndex) {
  const research = new ResearchCache();
  return async (req: any, res: any) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const parts = url.pathname.split('/').filter(Boolean);
      if (req.method === 'POST' && url.pathname === '/research') {
        const body = await readJson(req);
        if (typeof body?.url !== 'string') throw new AgentError('URL required');
        return json(res, 200, await research.get(body.url, body.force === true));
      }
      if (req.method === 'GET' && parts[0] === 'search') return json(res, 200,
        index.search(url.searchParams.get('q') || '', Number(url.searchParams.get('limit') || 30), Number(url.searchParams.get('offset') || 0), url.searchParams.get('kind') || ''));
      if (req.method === 'GET' && parts[0] === 'places' && parts.length === 2) {
        const place = index.place(parts[1]!); return json(res, place ? 200 : 404, place || { error: 'Place not found' });
      }
      if (parts[0] !== 'trips') return json(res, 404, { error: 'Unknown agent endpoint' });
      if (req.method === 'GET' && parts.length === 1) return json(res, 200, { trips: listTrips() });
      const id = parts[1]!;
      if (req.method === 'GET' && parts[2] === 'days' && parts.length === 4) {
        const { revision, trip } = readTrip(id);
        const city = trip.cities.find(city => city.days.some(day => day.line === Number(parts[3])));
        const day = city?.days.find(day => day.line === Number(parts[3]));
        return json(res, day ? 200 : 404, day ? { id, revision, city: city?.slug, day, errors: trip.errors } : { error: 'Day not found; use its heading line from list' });
      }
      if (req.method === 'POST' && parts[2] === 'edit' && parts.length === 3) return json(res, 200, editTrip(id, await readJson(req)));
      return json(res, 404, { error: 'Unknown agent endpoint' });
    } catch (error) { json(res, error instanceof AgentError ? error.status : 400, { error: (error as Error).message }); }
  };
}

import { createServer } from 'node:http';
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { watch } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { pathToFileURL } from 'node:url';
import { tripApi, weatherApi } from './api-plugins';
import { checklistApi } from './vite-checklists';
import { placeEditsApi } from './vite-place-edits';
import { travelCities } from '../src/data/travel';
import { hotelRankingContext } from '../src/data/hotel-ranking-context';
import { AgentIndex } from './agent-index';
import { agentApi, json } from './agent-api';

type Handler = (req: any, res: any, next: () => void) => unknown;
const MIME: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4' };
export async function createProductionServer(options: { origin: string; token?: string; dist?: string } ) {
  const origin = new URL(options.origin);
  if (!['https:', 'http:'].includes(origin.protocol) || origin.pathname !== '/') throw Error('Invalid public origin');
  const dist = resolve(options.dist || 'dist');
  if (!existsSync(resolve(dist, 'index.html'))) throw Error('Build the private site first: npm run build:private');
  const index = new AgentIndex();
  const stack: { path: string; handler: Handler }[] = [];
  const watcher = new EventEmitter() as any; watcher.add = () => {};
  const clients = new Set<any>();
  const context = {
    middlewares: { use: (path: string, handler: Handler) => stack.push({ path, handler }) }, watcher,
    ws: { send: (event: unknown) => { for (const client of clients) client.write(`data: ${JSON.stringify(event)}\n\n`); } },
    ssrLoadModule: async (path: string) => {
      if (path === '/src/data/travel.ts') return { travelCities };
      if (path === '/src/data/hotel-ranking-context.ts') return { hotelRankingContext };
      throw Error('Module not allowed');
    },
  };
  const hotelModule = await import(/* @vite-ignore */ new URL('../scripts/hotel-search.mjs', import.meta.url).href);
  for (const factory of [tripApi, weatherApi, checklistApi, placeEditsApi, hotelModule.hotelSearchVite]) {
    const hook = factory().configureServer;
    await (typeof hook === 'function' ? hook : hook.handler).call({}, context);
  }
  context.middlewares.use('/api/agent', agentApi(index));
  context.middlewares.use('/api/events', (_req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive' });
    res.write(': connected\n\n'); clients.add(res); res.on('close', () => clients.delete(res));
  });
  context.middlewares.use('/api/place-edits', (_req, res) => json(res, 200, JSON.parse(readFileSync('src/data/travel-place-edits.json', 'utf8'))));
  const server = createServer((req, res) => {
    const fail = (status: number, error: string) => json(res, status, { error });
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    if (req.headers.host !== origin.host && req.headers.host !== `127.0.0.1:${server.address() && (server.address() as any).port}`) return fail(403, 'Host not allowed');
    let url: URL;
    try { url = new URL(req.url || '/', origin); } catch { return fail(400, 'Invalid URL'); }
    if (url.pathname === '/healthz' && req.method === 'GET') return json(res, 200, { ok: true, revision: process.env.TB_RELEASE_SHA || 'local' });
    if (req.headers.origin && req.headers.origin !== origin.origin || req.headers['sec-fetch-site'] === 'cross-site') return fail(403, 'Origin not allowed');
    if (!['GET', 'HEAD'].includes(req.method || '')) {
      if (process.env.TB_DEPLOY_LOCK && existsSync(process.env.TB_DEPLOY_LOCK)) return fail(503, 'Deployment in progress; retry shortly');
      const supplied = req.headers.authorization || '', expected = `Bearer ${options.token || ''}`;
      const authorized = !!options.token && Buffer.byteLength(supplied) === Buffer.byteLength(expected) && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
      if (req.headers.origin !== origin.origin && !authorized) return fail(403, 'Same-origin browser or bearer token required');
      if (!req.headers['content-type']?.startsWith('application/json')) return fail(415, 'JSON required');
    }
    if (url.pathname.startsWith('/api/')) {
      // The outer guard validated the configured origin; normalize Host for legacy APIs behind Tailscale's proxy.
      req.headers.host = origin.host;
      let at = 0;
      const next = () => {
        const route = stack.slice(at).find(route => url.pathname === route.path || url.pathname.startsWith(route.path + '/'));
        if (!route) return fail(404, 'Unknown API');
        at = stack.indexOf(route) + 1;
        req.url = url.pathname.slice(route.path.length) + url.search || '/';
        Promise.resolve().then(() => route.handler(req, res, next)).catch(() => { if (!res.headersSent) fail(500, 'API failed'); else res.end(); });
      };
      return next();
    }
    if (!['GET', 'HEAD'].includes(req.method || '')) return fail(405, 'Method not allowed');
    let path: string;
    try { path = resolve(dist, '.' + decodeURIComponent(url.pathname)); } catch { return fail(400, 'Invalid path'); }
    if (!path.startsWith(dist + sep) && path !== dist) return fail(403, 'Path not allowed');
    if (path === dist || !extname(path)) path = resolve(dist, 'index.html');
    // Private documents/source maps are never static files.
    if (!existsSync(path) || !statSync(path).isFile() || extname(path) === '.map') return fail(404, 'Not found');
    const size = statSync(path).size;
    let start = 0, end = size - 1;
    res.setHeader('Accept-Ranges', 'bytes');
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (match?.[1]) { start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1; }
      else if (match?.[2]) start = Math.max(0, size - Number(match[2]));
      if (!match || !match[1] && !match[2] || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
        res.setHeader('Content-Range', `bytes */${size}`); return fail(416, 'Invalid byte range');
      }
      res.statusCode = 206; res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`);
    }
    res.setHeader('Content-Length', size ? end - start + 1 : 0);
    res.setHeader('Content-Type', MIME[extname(path)] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method === 'HEAD') return res.end();
    const stream = createReadStream(path, size ? { start, end } : undefined); stream.on('error', () => res.destroy()); stream.pipe(res);
  });
  const tripWatcher = watch(resolve('content/trips'), (_event, file) => {
    if (file && /^[\w-]+\.md$/.test(String(file))) context.ws.send({ type: 'custom', event: 'tb:trip', data: { id: String(file).slice(0, -3), reason: existsSync(resolve('content/trips', String(file))) ? 'change' : 'unlink' } });
  });
  const placeWatcher = watch(resolve('src/data'), (_event, file) => {
    if (String(file) === 'travel-place-edits.json') {
      try { context.ws.send({ type: 'custom', event: 'tb:place-edits', data: JSON.parse(readFileSync('src/data/travel-place-edits.json', 'utf8')) }); } catch { /* Atomic rename may be in progress. */ }
    }
  });
  const heartbeat = setInterval(() => { for (const client of clients) client.write(': heartbeat\n\n'); }, 20000); heartbeat.unref();
  server.on('close', () => { clearInterval(heartbeat); tripWatcher.close(); placeWatcher.close(); index.close(); for (const client of clients) client.end(); });
  server.requestTimeout = 30000; server.headersTimeout = 15000;
  return server;
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const port = Number(process.env.PORT || 5173);
  if (!process.env.TB_PUBLIC_ORIGIN) throw Error('Set TB_PUBLIC_ORIGIN to the private HTTPS origin');
  const server = await createProductionServer({ origin: process.env.TB_PUBLIC_ORIGIN, token: process.env.TB_AGENT_TOKEN });
  server.listen(port, '127.0.0.1', () => console.log(`Travel Boss production listening on 127.0.0.1:${port}`));
  const stop = () => { server.close(); server.closeAllConnections(); };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
}

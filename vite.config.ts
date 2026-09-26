import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { basename, join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { hotelSearchVite } from './scripts/vite-hotel-plugin.mjs';
import {
  applyTripPatch,
  parseTripRequest,
  readTripPatch,
  tripIdFromPath,
  type TripPatch,
  type TripPushReason,
} from './src/trip/api';
import { ICON_FONT_HREF } from './src/ui/icons';

const tripsDir = resolve(process.cwd(), 'content/trips');

/**
 * `PATCH /api/trips/<id>` with one `TripPatch`. PATCH needs a CORS preflight,
 * and Vite only answers it for localhost, so another site cannot write here.
 */
function patchTrip(id: string, req: IncomingMessage, res: ServerResponse) {
  const send = (status: number, body: object) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  };
  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => {
    body += chunk;
    if (body.length > 65_536) req.destroy();
  });
  req.on('end', () => {
    let patch: TripPatch | null = null;
    try {
      patch = readTripPatch(JSON.parse(body));
    } catch {
      /* not JSON */
    }
    if (!patch) return send(400, { error: 'bad patch' });
    const full = join(tripsDir, `${id}.md`);
    try {
      if (!existsSync(full)) return send(404, { error: 'not found' });
      // ponytail: read and write in one tick, so two browser saves never interleave.
      // An editor that writes the file in that same instant can still lose; a lock file would close it.
      const result = applyTripPatch(readFileSync(full, 'utf8'), patch);
      if (!result) return send(409, { error: 'conflict' });
      writeFileSync(full, result.raw);
      send(200, { line: result.line });
    } catch (err) {
      send(500, { error: err instanceof Error ? err.message : 'trip write failed' });
    }
  });
}

/**
 * Dev-only trip feed. Reads Markdown from disk on every request and tells the
 * browser when an LLM (or the user) saves a file, so the open document updates
 * without a manual reload.
 */
function tripApi(): Plugin {
  return {
    name: 'trip-api',
    configureServer(server) {
      server.middlewares.use('/api/trips', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'PATCH') return next();
        const target = parseTripRequest(req.url);
        if (target === null) return next();
        if (req.method === 'PATCH') {
          if (target === 'list') return next();
          patchTrip(target, req, res);
          return;
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        try {
          if (target === 'list') {
            const files = readdirSync(tripsDir).filter(
              (name) => name.endsWith('.md') && !name.startsWith('.'),
            );
            const trips = files.map((name) => ({
              id: basename(name, '.md'),
              file: `content/trips/${name}`,
              raw: readFileSync(join(tripsDir, name), 'utf8'),
            }));
            res.end(JSON.stringify(trips));
            return;
          }
          const filename = `${target}.md`;
          const full = join(tripsDir, filename);
          if (!existsSync(full)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'not found' }));
            return;
          }
          res.end(
            JSON.stringify({
              id: target,
              file: `content/trips/${filename}`,
              raw: readFileSync(full, 'utf8'),
            }),
          );
        } catch (err) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'trip read failed',
            }),
          );
        }
      });

      server.watcher.add(tripsDir);
      const notify = (file: string, reason: TripPushReason) => {
        const id = tripIdFromPath(file);
        if (!id) return;
        server.ws.send({ type: 'custom', event: 'tb:trip', data: { id, reason } });
      };
      server.watcher.on('add', (file) => notify(file, 'add'));
      server.watcher.on('change', (file) => notify(file, 'change'));
      server.watcher.on('unlink', (file) => notify(file, 'unlink'));
    },
  };
}

/** One icon list: the href is built in src/ui/icons.ts and injected here. */
function iconFont(): Plugin {
  return {
    name: 'tb-icon-font',
    transformIndexHtml() {
      return [
        {
          tag: 'link',
          injectTo: 'head-prepend',
          attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        },
        {
          tag: 'link',
          injectTo: 'head-prepend',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: '',
          },
        },
        {
          tag: 'link',
          injectTo: 'head',
          attrs: { rel: 'stylesheet', href: ICON_FONT_HREF },
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [iconFont(), hotelSearchVite(), tripApi()],
  server: {
    port: 5173,
    strictPort: false,
  },
});

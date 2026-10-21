import { assertWritable } from './agent-service';
import { readFileSync, writeFileSync, renameSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { readPlaceEdits, type PlaceEditStore } from '../src/catalog/place-edit-model';

export function placeEditsApi(): Plugin {
  const file = resolve('src/data/travel-place-edits.json');
  return {
    name: 'place-edits',
    handleHotUpdate(ctx) {
      if (ctx.file !== file) return;
      for (const mod of ctx.modules) ctx.server.moduleGraph.invalidateModule(mod);
      ctx.server.ws.send({ type: 'custom', event: 'tb:place-edits', data: JSON.parse(readFileSync(file, 'utf8')) });
      return [];
    },
    configureServer(server) {
      server.middlewares.use('/api/places', async (req, res, next) => {
        if (req.method !== 'PATCH') return next();
        const send = (status: number, data: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
        };
        const id = req.url?.match(/^\/([a-z0-9-]+)$/)?.[1];
        if (!id) return send(404, { error: 'Unknown place' });
        // Resolve the live catalog, including imported and generated place ids.
        let catalog: typeof import('../src/data/travel');
        try { catalog = await server.ssrLoadModule('/src/data/travel.ts'); }
        catch { return send(500, { error: 'Could not load places' }); }
        if (!catalog.travelCities.some(city => city.places.some(place => place.id === id))) {
          return send(404, { error: 'Unknown place' });
        }
        // Only same-origin JSON writes; no cross-site form submissions.
        if (req.headers.origin && req.headers.origin !== `http://${req.headers.host}` && req.headers.origin !== `https://${req.headers.host}`) return send(403, {});
        if (!req.headers['content-type']?.startsWith('application/json')) return send(415, {});
        let body = '';
        req.setEncoding('utf8');
        req.on('data', (chunk: string) => { body += chunk; if (body.length > 4096) req.destroy(); });
        req.on('end', () => {
          let patch;
          try { patch = readPlaceEdits(JSON.parse(body)); } catch { return send(400, {}); }
          if (!patch) return send(400, {});
          try {
            assertWritable();
            // Read/merge/write synchronously: separate fields and tabs cannot overwrite each other.
            const store: PlaceEditStore = JSON.parse(readFileSync(file, 'utf8'));
            store[id] = { ...store[id], ...patch };
            writeFileSync(`${file}.tmp`, `${JSON.stringify(store, null, 2)}\n`);
            renameSync(`${file}.tmp`, file);
            send(200, store);
          } catch { send(500, { error: 'Could not save place' }); }
        });
      });
    },
  };
}

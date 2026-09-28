import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Plugin } from 'vite';
import { editChecklist, type ChecklistItem } from '../src/trip/checklist-state';

export function checklistApi(): Plugin {
  return { name: 'checklist-api', configureServer(server) {
    server.middlewares.use('/api/checklists', (req, res) => {
      const id = (req.url ?? '').split('?')[0]!.slice(1);
      const send = (status: number, data: unknown) => {
        res.statusCode = status;
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Cache-Control', 'no-store');
        res.end(JSON.stringify(data));
      };
      if (!/^[\w-]+$/.test(id) || !existsSync(resolve('content/trips', `${id}.md`))) return send(404, {});
      const file = resolve('content/checklists', `${id}.json`);
      const read = (): ChecklistItem[] => existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : [];
      if (req.method === 'GET') {
        try { return send(200, read()); } catch { return send(500, {}); }
      }
      if (req.method !== 'PATCH') return send(405, {});
      let body = '';
      req.setEncoding('utf8');
      req.on('data', (chunk: string) => { body += chunk; if (body.length > 8192) req.destroy(); });
      req.on('end', () => {
        let edit: unknown;
        try { edit = JSON.parse(body); } catch { return send(400, {}); }
        try {
          const result = editChecklist(read(), edit);
          if (!result) return send(409, {});
          mkdirSync(resolve('content/checklists'), { recursive: true });
          writeFileSync(file, JSON.stringify(result, null, 2) + '\n');
          send(200, result);
        } catch { send(500, {}); }
      });
    });
  } };
}

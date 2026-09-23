import { readdirSync, readFileSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { hotelSearchVite } from './scripts/vite-hotel-plugin.mjs';
import { ICON_FONT_HREF } from './src/ui/icons';

const tripsDir = resolve(process.cwd(), 'content/trips');

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
        const path = (req.url ?? '/').split('?')[0] ?? '/';
        if (req.method !== 'GET' || (path !== '/' && path !== '')) return next();
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        try {
          const files = readdirSync(tripsDir).filter(
            (name) => name.endsWith('.md') && !name.startsWith('.'),
          );
          const trips = files.map((name) => ({
            id: basename(name, '.md'),
            file: `content/trips/${name}`,
            raw: readFileSync(join(tripsDir, name), 'utf8'),
          }));
          res.end(JSON.stringify(trips));
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
      const notify = (file: string) => {
        const normalized = file.replaceAll('\\', '/');
        if (!normalized.includes('/content/trips/') || !normalized.endsWith('.md')) return;
        server.ws.send({ type: 'custom', event: 'tb:trip' });
      };
      server.watcher.on('add', notify);
      server.watcher.on('change', notify);
      server.watcher.on('unlink', notify);
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

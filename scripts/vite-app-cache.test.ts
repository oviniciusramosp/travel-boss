import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { cacheWorker } from './vite-app-cache';

function worker() {
  const handlers: Record<string, (event: any) => void> = {};
  const stored = new Map<string, Response>();
  const deleted: string[] = [];
  const fetched: string[] = [];
  runInNewContext(cacheWorker('v2', ['/travel-boss/index.html', '/travel-boss/assets/app.js']), {
    URL,
    self: {
      location: { href: 'https://example.com/travel-boss/sw.js' },
      addEventListener: (name: string, handler: (event: any) => void) => { handlers[name] = handler; },
      clients: { claim: async () => {} },
    },
    caches: {
      open: async () => ({
        addAll: async (files: string[]) => { files.forEach(file => stored.set(`https://example.com${file}`, new Response(file))); },
        match: async (key: string | Request) => stored.get(typeof key === 'string' ? key : key.url),
      }),
      keys: async () => ['tb-app-v1', 'tb-app-v2', 'other-app'],
      delete: async (key: string) => { deleted.push(key); },
    },
    fetch: async (request: Request) => { fetched.push(request.url); throw new Error('offline'); },
  });
  return { handlers, deleted, fetched };
}

describe('public app cache', () => {
  it('serves the shell and build assets offline under the GitHub Pages base', async () => {
    const { handlers, fetched } = worker();
    let job: Promise<any> = Promise.resolve();
    handlers.install({ waitUntil: (value: Promise<any>) => { job = value; } });
    await job;
    for (const file of ['', '?day=2', 'assets/app.js']) {
      const url = `https://example.com/travel-boss/${file}`;
      handlers.fetch({ request: { url, method: 'GET', mode: file.includes('assets/') ? 'cors' : 'navigate' },
        respondWith: (value: Promise<any>) => { job = value; } });
      expect((await job).ok).toBe(true);
    }
    expect(fetched).toEqual([]);
  });
  it('excludes APIs, writes, external resources and other apps; removes only old app caches', async () => {
    const { handlers, deleted } = worker();
    for (const [url, method] of [
      ['https://example.com/travel-boss/api/trips/x', 'GET'],
      ['https://example.com/travel-boss/index.html', 'PATCH'],
      ['https://tiles.example.com/1.png', 'GET'], ['https://example.com/other/', 'GET'],
    ]) {
      handlers.fetch({ request: { url, method }, respondWith: () => { throw new Error('must bypass cache'); } });
    }
    let job = Promise.resolve();
    handlers.activate({ waitUntil: (value: Promise<void>) => { job = value; } });
    await job;
    expect(deleted).toEqual(['tb-app-v1']);
  });
});

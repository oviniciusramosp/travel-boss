import { runInNewContext } from 'node:vm';
import { describe, expect, it } from 'vitest';
import { cacheWorker } from './vite-app-cache';

function worker(failInstall = false, search = '') {
  const handlers: Record<string, (event: any) => void> = {};
  const stored = new Map<string, Response>();
  const deleted: string[] = [];
  const fetched: string[] = [];
  const buckets = new Map<string, Map<string, Response>>();
  const requested: Request[] = [];
  let skipped = 0;
  runInNewContext(cacheWorker('v2', ['/travel-boss/index.html', '/travel-boss/assets/app.js'], ['/travel-boss/weather/sunset.svg'], ['https://lh3.googleusercontent.com/public-photo', '/travel-boss/photos/cover.webp']), {
    AbortSignal,
    Request,
    URL,
    self: {
      location: { href: `https://example.com/travel-boss/sw.js${search}` },
      addEventListener: (name: string, handler: (event: any) => void) => { handlers[name] = handler; },
      clients: { claim: async () => {} },
      skipWaiting: async () => { skipped++; },
    },
    caches: {
      open: async (name: string) => {
        if (!buckets.has(name)) buckets.set(name, name === 'tb-app-v2' ? stored : new Map());
        const entries = buckets.get(name)!;
        const key = (value: string | Request) => typeof value === 'string' ? value : value.url;
        return {
          addAll: async (files: Request[]) => {
            requested.push(...files);
            if (failInstall) throw Error('missing asset');
            files.forEach(file => entries.set(file.url, new Response(file.url)));
          },
          match: async (value: string | Request) => entries.get(key(value)),
          put: async (value: string | Request, response: Response) => { entries.set(key(value), response); },
          keys: async () => [...entries.keys()].map(url => new Request(url)),
          delete: async (value: string | Request) => entries.delete(key(value)),
        };
      },
      keys: async () => ['tb-app-v0', 'tb-app-v1', 'other-app', ...buckets.keys()],
      delete: async (key: string) => { deleted.push(key); },
    },
    fetch: async (request: Request | string) => {
      const url = typeof request === 'string' ? request : request.url;
      fetched.push(url);
      if (url.includes('missing')) return new Response('', { status: 404 });
      if (url.includes('photos/') || url.includes('weather/') || url.includes('upload.wikimedia.org') || url.includes('tiles.openfreemap.org') || url === 'https://lh3.googleusercontent.com/public-photo') return new Response('saved');
      throw new Error('offline');
    },
  });
  return { handlers, deleted, fetched, buckets, requested, skipped: () => skipped };
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
      ['https://example.com/travel-boss/private.md', 'GET'],
      ['https://upload.wikimedia.org/wikipedia/image.jpg?token=private', 'GET'],
    ]) {
      handlers.fetch({ request: { url, method }, respondWith: () => { throw new Error('must bypass cache'); } });
    }
    let job = Promise.resolve();
    handlers.activate({ waitUntil: (value: Promise<void>) => { job = value; } });
    await job;
    expect(deleted).toEqual(['tb-app-v0']);
  });
});


describe('offline download protocol', () => {
  it('retains older builds during forced takeover until tabs can upgrade naturally', async () => {
    const { handlers, deleted } = worker(false, '?refresh=123');
    let job = Promise.resolve();
    handlers.activate({ waitUntil: (value: Promise<void>) => { job = value; } });
    await job;
    expect(deleted).toEqual([]);
  });
  it('activates only on explicit request and fetches essentials bypassing HTTP cache', async () => {
    const { handlers, requested, skipped } = worker();
    let job = Promise.resolve();
    const event = { waitUntil: (value: Promise<void>) => { job = value; } };
    handlers.install(event);
    await job;
    expect(requested.every(request => request.cache === 'reload')).toBe(true);
    expect(skipped()).toBe(0);
    handlers.message({ ...event, data: { type: 'APPLY_UPDATE' } });
    await job;
    expect(skipped()).toBe(1);
  });
  it('preserves an existing build if reinstalling its essentials fails', async () => {
    const { handlers, buckets, deleted } = worker(true);
    buckets.set('tb-app-v2', new Map([['https://example.com/travel-boss/index.html', new Response('old')]]));
    let job = Promise.resolve();
    handlers.install({ waitUntil: (value: Promise<void>) => { job = value; } });
    await expect(job).rejects.toThrow();
    expect(deleted).toEqual([]);
  });
  it('serves old chunks for other open tabs but navigations use only the current shell', async () => {
    const { handlers, buckets } = worker();
    const old = 'https://example.com/travel-boss/assets/old.js';
    buckets.set('tb-app-v1', new Map([[old, new Response('previous chunk')]]));
    let response = Promise.resolve(new Response());
    handlers.fetch({ request: new Request(old), respondWith: (value: Promise<Response>) => { response = value; } });
    expect(await (await response).text()).toBe('previous chunk');
  });
  async function message(handlers: ReturnType<typeof worker>['handlers'], data: unknown) {
    const messages: any[] = [];
    let job = Promise.resolve();
    handlers.message({ data, ports: [{ postMessage: (value: any) => messages.push(value) }],
      waitUntil: (value: Promise<void>) => { job = value; } });
    await job;
    return messages;
  }
  it('reports essential readiness only after complete installation', async () => {
    const { handlers } = worker();
    expect((await message(handlers, { type: 'CACHE_STATUS' }))[0].essentialReady).toBe(false);
    let job = Promise.resolve();
    handlers.install({ waitUntil: (value: Promise<void>) => { job = value; } });
    await job;
    expect((await message(handlers, { type: 'CACHE_STATUS' }))[0].essentialReady).toBe(true);
  });
  it('keeps old caches after failed shell installation', async () => {
    const { handlers, deleted } = worker(true);
    let job = Promise.resolve();
    handlers.install({ waitUntil: (value: Promise<void>) => { job = value; } });
    await expect(job).rejects.toThrow('missing asset');
    expect(deleted).toEqual(['tb-app-v2']);
  });
  it('counts bytes and failures, includes optional files, rejects private resources and bulk tiles', async () => {
    const { handlers, fetched } = worker();
    const messages = await message(handlers, { type: 'CACHE_URLS', urls: [
      'https://upload.wikimedia.org/wikipedia/photo.jpg',
      'https://upload.wikimedia.org/wikipedia/missing.jpg',
      'https://example.com/travel-boss/api/trips/x',
      'https://tiles.openfreemap.org/planet/1/1/1.pbf',
    ] });
    expect(messages.at(-1)).toEqual({ type: 'CACHE_COMPLETE', total: 5, completed: 2, failed: 3, bytes: 10 });
    expect(fetched).toHaveLength(3);
    expect(fetched.some(url => url.includes('/api/') || url.includes('openfreemap'))).toBe(false);
    expect(messages.filter(value => value.type === 'CACHE_PROGRESS')).toHaveLength(5);
  });
  it('allows exact public catalog photo URLs without granting access to other provider paths', async () => {
    const { handlers, fetched } = worker();
    const url = 'https://lh3.googleusercontent.com/public-photo';
    const messages = await message(handlers, { type: 'CACHE_URLS', urls: [url,
      'https://lh3.googleusercontent.com/private-photo'] });
    expect(messages.at(-1)).toEqual({ type: 'CACHE_COMPLETE', total: 3, completed: 2, failed: 1, bytes: 10 });
    expect(fetched).toContain(url);
    expect(fetched).not.toContain('https://lh3.googleusercontent.com/private-photo');
    expect((await message(handlers, { type: 'CACHE_REMOVE_URLS', urls: [url] }))[0].removed).toBe(1);
  });
  it('pins selected local public photos without automatically downloading all photos', async () => {
    const { handlers, fetched, buckets } = worker();
    const url = 'https://example.com/travel-boss/photos/cover.webp';
    await message(handlers, { type: 'CACHE_URLS', urls: [] });
    expect(fetched).not.toContain(url);
    await message(handlers, { type: 'CACHE_URLS', urls: [url] });
    expect(buckets.get('tb-trip-v1')?.has(url)).toBe(true);
    let response = Promise.resolve(new Response());
    handlers.fetch({ request: new Request(url), respondWith: (value: Promise<Response>) => { response = value; } });
    expect(await (await response).text()).toBe('saved');
    expect((await message(handlers, { type: 'CACHE_REMOVE_URLS', urls: [url] }))[0].removed).toBe(1);
  });
  it('pins downloaded photos outside the evictable viewed-map cache', async () => {
    const { handlers, buckets } = worker();
    const url = 'https://upload.wikimedia.org/wikipedia/photo.jpg';
    await message(handlers, { type: 'CACHE_URLS', urls: [url] });
    expect(buckets.get('tb-trip-v1')?.has(url)).toBe(true);
    expect(buckets.get('tb-runtime-v1')?.has(url)).not.toBe(true);
  });
  it('removes only requested downloaded photos, preserving shared assets and the shell', async () => {
    const { handlers, buckets } = worker();
    const shared = 'https://upload.wikimedia.org/wikipedia/shared.jpg';
    const removed = 'https://upload.wikimedia.org/wikipedia/removed.jpg';
    await message(handlers, { type: 'CACHE_URLS', urls: [shared, removed] });
    expect((await message(handlers, { type: 'CACHE_REMOVE_URLS', urls: [removed,
      'https://example.com/travel-boss/index.html', 'https://example.com/travel-boss/weather/sunset.svg'] }))[0])
      .toEqual({ type: 'CACHE_REMOVED', removed: 1, failed: 2 });
    expect(buckets.get('tb-trip-v1')?.has(shared)).toBe(true);
    expect(buckets.get('tb-trip-v1')?.has(removed)).toBe(false);
    expect(buckets.get('tb-app-v2-optional')?.has('https://example.com/travel-boss/weather/sunset.svg')).toBe(true);
    await message(handlers, { type: 'CACHE_URLS', urls: [removed] });
    expect(buckets.get('tb-trip-v1')?.has(removed)).toBe(true);
  });
  it('serves previously viewed external resources immediately offline', async () => {
    const { handlers, buckets, fetched } = worker();
    const url = 'https://tiles.openfreemap.org/styles/bright';
    let response = Promise.resolve(new Response());
    const jobs: Promise<void>[] = [];
    const request = new Request(url);
    const event = { request, respondWith: (value: Promise<Response>) => { response = value; },
      waitUntil: (value: Promise<void>) => { jobs.push(value); } };
    handlers.fetch(event);
    expect(await (await response).text()).toBe('saved');
    await Promise.all(jobs);
    expect(buckets.get('tb-runtime-v1')?.has(url)).toBe(true);
    handlers.fetch(event);
    expect(await (await response).text()).toBe('saved');
    expect(fetched).toEqual([url]);
  });
});

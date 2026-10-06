import { createHash } from 'node:crypto';
import type { Plugin } from 'vite';

/** Cache only public build files; dev APIs and private local documents never enter it. */
export function cacheWorker(version: string, files: string[]): string {
  return `
const PREFIX = 'tb-app-';
const CACHE = PREFIX + ${JSON.stringify(version)};
const FILES = ${JSON.stringify(files)};
const ROOT = new URL('./', self.location.href);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== ROOT.origin ||
      !url.pathname.startsWith(ROOT.pathname) || url.pathname.includes('/api/')) return;
  const file = url.pathname.slice(ROOT.pathname.length);
  const navigation = request.mode === 'navigate' && (file === '' || file === 'index.html');
  if (!navigation && !FILES.includes(url.pathname)) return;
  event.respondWith(caches.open(CACHE).then(async cache => {
    const key = navigation ? new URL('index.html', ROOT).href : request;
    const stored = await cache.match(key);
    return stored || fetch(request);
  }));
});
`;
}

export function appCache(): Plugin {
  let base = '/';
  return {
    name: 'tb-app-cache',
    apply: 'build',
    enforce: 'post',
    configResolved(config) { base = config.base; },
    generateBundle(_options, bundle) {
      const names = Object.keys(bundle).sort();
      const hash = createHash('sha256');
      for (const name of names) {
        const item = bundle[name];
        hash.update(name).update(item.type === 'chunk' ? item.code : item.source);
      }
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: cacheWorker(
        hash.digest('hex').slice(0, 16), names.map(name => `${base}${name}`),
      ) });
    },
  };
}

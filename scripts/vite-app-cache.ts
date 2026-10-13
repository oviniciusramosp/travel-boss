import { createHash } from 'node:crypto';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import type { Plugin } from 'vite';
import { photosByPlaceId } from '../src/data/travel-photos';

/** Public build files only; APIs and private local documents never enter this cache. */
export function cacheWorker(version: string, files: string[], optional: string[] = [], photos: string[] = []): string {
  return `
const PREFIX = 'tb-app-';
const CACHE = PREFIX + ${JSON.stringify(version)} + (new URL(self.location.href).search || '');
const OPTIONAL = CACHE + '-optional';
const RUNTIME = 'tb-runtime-v1';
const TRIP = 'tb-trip-v1';
const TRIP_BUDGET = 134217728;
let tripBytes;
const FILES = ${JSON.stringify(files)};
const PUBLIC = ${JSON.stringify(optional)};
const PHOTO_URLS = ${JSON.stringify(photos)};
const ROOT = new URL('./', self.location.href);
const PHOTOS = new Set(PHOTO_URLS.map(url => new URL(url, ROOT).href));
const MAX_ENTRIES = 512;
const MAX_BYTES = 524288;
let writes = Promise.resolve();
function local(url) {
  return url.origin === ROOT.origin && !url.search && (FILES.includes(url.pathname) || PUBLIC.includes(url.pathname) || PHOTOS.has(url.href));
}
function external(url) {
  return url.protocol === 'https:' && !url.username && !url.password && (PHOTOS.has(url.href) ||
    (!url.search && (url.hostname === 'tiles.openfreemap.org' ||
    (url.hostname === 'upload.wikimedia.org' && url.pathname.startsWith('/wikipedia/'))))
  );
}
async function save(request, explicit = false) {
  const url = new URL(typeof request === 'string' ? request : request.url, ROOT);
  if (!local(url) && !external(url)) throw Error('Resource is not public');
  // Provider terms forbid bulk map downloads; retain only maps requested by the renderer.
  if (explicit && url.hostname === 'tiles.openfreemap.org') throw Error('Map prefetch is not permitted');
  const pinned = explicit && PHOTOS.has(url.href) || explicit && !local(url);
  const cache = await caches.open(pinned ? TRIP : FILES.includes(url.pathname) ? CACHE : local(url) && !PHOTOS.has(url.href) ? OPTIONAL : RUNTIME);
  const stored = await cache.match(url.href);
  if (stored) return (await stored.clone().arrayBuffer()).byteLength;
  const response = await fetch(url.href, { credentials: 'omit', signal: AbortSignal.timeout(15000) });
  if (!response.ok || response.type === 'opaque' || !local(new URL(response.url || url.href)) && !external(new URL(response.url || url.href))) throw Error('Resource download failed');
  const bytes = (await response.clone().arrayBuffer()).byteLength;
  if ((!local(url) || PHOTOS.has(url.href)) && bytes > (pinned ? 8388608 : MAX_BYTES)) throw Error('Resource exceeds offline cache limit');
  writes = writes.catch(() => {}).then(async () => {
    if (pinned) {
      if (tripBytes === undefined) {
        tripBytes = 0;
        for (const key of await cache.keys()) tripBytes += (await (await cache.match(key)).arrayBuffer()).byteLength;
      }
      if (tripBytes + bytes > TRIP_BUDGET) throw Error('Offline download storage limit reached');
    }
    await cache.put(url.href, response);
    if (pinned) tripBytes += bytes;
    if ((!local(url) || PHOTOS.has(url.href)) && !pinned) {
      const keys = await cache.keys();
      for (const key of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) await cache.delete(key);
    }
  });
  await writes;
  return bytes;
}
self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const existed = (await caches.keys()).includes(CACHE);
    try {
      await (await caches.open(CACHE)).addAll(FILES.map(file => new Request(new URL(file, ROOT), { cache: 'reload' })));
    } catch (error) {
      if (!existed) await caches.delete(CACHE);
      throw error;
    }
  })());
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => {
    // Forced takeover can leave several older tabs open. Natural activation cleans up later.
    if (new URL(self.location.href).searchParams.has('refresh')) return [];
    // Keep the preceding build's chunks for tabs still rendering that version.
    const previous = keys.filter(key => key.startsWith(PREFIX) && !key.endsWith('-optional') && key !== CACHE).at(-1);
    return Promise.all(keys.filter(key => key.startsWith(PREFIX) &&
      ![CACHE, OPTIONAL, previous, previous + '-optional'].includes(key)).map(key => caches.delete(key)));
  }).then(() => self.clients.claim()));
});
self.addEventListener('message', event => {
  if (event.data?.type === 'APPLY_UPDATE') { event.waitUntil(self.skipWaiting()); return; }
  const port = event.ports && event.ports[0];
  if (!port) return;
  event.waitUntil((async () => {
    if (event.data?.type === 'CACHE_STATUS') {
      const cache = await caches.open(CACHE);
      const essentialReady = (await Promise.all(FILES.map(file => cache.match(new URL(file, ROOT).href)))).every(Boolean);
      port.postMessage({ type: 'CACHE_STATUS', essentialReady, optionalUrls: PUBLIC });
    } else if (event.data?.type === 'CACHE_REMOVE_URLS') {
      const urls = Array.isArray(event.data.urls) ? [...new Set(event.data.urls)] : [];
      let removed = 0;
      let failed = 0;
      writes = writes.catch(() => {}).then(async () => {
        const cache = await caches.open(TRIP);
        for (const value of urls) {
          try {
            const url = new URL(value, ROOT);
            if (typeof value !== 'string' || !PHOTOS.has(url.href) && (!external(url) || url.hostname !== 'upload.wikimedia.org')) throw Error('Invalid photo');
            if (await cache.delete(url.href)) removed++;
          } catch { failed++; }
        }
        tripBytes = undefined;
      });
      await writes;
      port.postMessage({ type: 'CACHE_REMOVED', removed, failed });
    } else if (event.data?.type === 'CACHE_URLS') {
      const urls = Array.isArray(event.data.urls) ? [...new Set([...PUBLIC, ...event.data.urls])] : [];
      // Built-in public files do not consume the limit reserved for requested photos.
      if (urls.length > MAX_ENTRIES + PUBLIC.length || urls.some(url => typeof url !== 'string')) {
        port.postMessage({ type: 'CACHE_COMPLETE', total: urls.length, completed: 0, failed: urls.length, bytes: 0 });
        return;
      }
      const result = { total: urls.length, completed: 0, failed: 0, bytes: 0 };
      for (const url of urls) {
        try { result.bytes += await save(url, true); result.completed++; } catch { result.failed++; }
        port.postMessage({ type: 'CACHE_PROGRESS', ...result });
      }
      port.postMessage({ type: 'CACHE_COMPLETE', ...result });
    }
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  const navigation = request.mode === 'navigate' && url.origin === ROOT.origin &&
    (url.pathname === ROOT.pathname || url.pathname === new URL('index.html', ROOT).pathname);
  const oldAsset = url.origin === ROOT.origin && !url.search && url.pathname.startsWith(new URL('assets/', ROOT).pathname);
  if (!navigation && !local(url) && !external(url) && !oldAsset) return;
  event.respondWith((async () => {
    const key = navigation ? new URL('index.html', ROOT).href : url.href;
    const cache = await caches.open(navigation || FILES.includes(url.pathname) ? CACHE : local(url) && !PHOTOS.has(url.href) ? OPTIONAL : RUNTIME);
    const stored = await cache.match(key) || ((!local(url) || PHOTOS.has(url.href)) && await (await caches.open(TRIP)).match(key));
    if (navigation) {
      // Online navigation must not keep an old itinerary behind the offline shell.
      // Do not overwrite the installed build: its assets remain a coherent offline fallback.
      try {
        const current = await fetch(new Request(url.href, { cache: 'no-store', signal: AbortSignal.timeout(5000) }));
        return current.ok ? current : stored || current;
      } catch (error) {
        if (stored) return stored;
        throw error;
      }
    }
    if (stored) return stored;
    if (oldAsset) {
      for (const name of (await caches.keys()).filter(name => name.startsWith(PREFIX) && !name.endsWith('-optional'))) {
        const previous = await (await caches.open(name)).match(key);
        if (previous) return previous;
      }
    }
    const response = await fetch(request);
    if (response.ok && response.type !== 'opaque' && !navigation &&
        (local(new URL(response.url || url.href)) || external(new URL(response.url || url.href)))) {
      // Store the fetched response, avoiding a second network request.
      const copy = response.clone();
      event.waitUntil((async () => {
        const bytes = (await copy.clone().arrayBuffer()).byteLength;
        if ((!local(url) || PHOTOS.has(url.href)) && bytes > MAX_BYTES) return;
        writes = writes.catch(() => {}).then(async () => {
          await cache.put(key, copy);
          if (!local(url) || PHOTOS.has(url.href)) {
            const keys = await cache.keys();
            for (const key of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES))) await cache.delete(key);
          }
        });
        await writes;
      })().catch(() => {}));
    }
    return response;
  })());
});
`;
}

export function appCache(): Plugin {
  let base = '/';
  let publicDir = '';
  return {
    name: 'tb-app-cache',
    apply: 'build',
    enforce: 'post',
    configResolved(config) { base = config.base; publicDir = config.publicDir; },
    generateBundle(_options, bundle) {
      const names = Object.keys(bundle).sort();
      const publicNames: string[] = [];
      function scan(dir: string) {
        for (const entry of readdirSync(dir, { withFileTypes: true })) {
          const path = join(dir, entry.name);
          if (entry.isDirectory()) scan(path);
          else if ((/^(fonts|weather|amenities|maps|photos)\//.test(relative(publicDir, path)) || relative(publicDir, path) === 'google-map-icon.svg') && /\.(woff2|svg|json|webp|jpg|png)$/.test(path)) publicNames.push(relative(publicDir, path));
        }
      }
      if (publicDir) scan(publicDir);
      const hash = createHash('sha256').update(cacheWorker('policy', [], []));
      for (const name of names) {
        const item = bundle[name];
        hash.update(name).update(item.type === 'chunk' ? item.code : item.source);
      }
      for (const name of publicNames.sort()) hash.update(name).update(readFileSync(join(publicDir, name)));
      const essential = [...names, ...publicNames.filter(name => name.startsWith('fonts/') || name === 'google-map-icon.svg')];
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: cacheWorker(
        hash.digest('hex').slice(0, 16), essential.map(name => `${base}${name}`),
        publicNames.filter(name => !name.startsWith('fonts/') && !name.startsWith('photos/') && name !== 'google-map-icon.svg').map(name => `${base}${name}`),
        [...new Set([...Object.values(photosByPlaceId).flatMap(photos => photos.map(photo => photo.url)).filter(url => url.startsWith('https://')),
          ...publicNames.filter(name => name.startsWith('photos/')).map(name => `${base}${name}`)])],
      ) });
    },
  };
}

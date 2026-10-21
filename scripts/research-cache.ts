import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
const HOSTS = new Set(['www.louvre.fr', 'www.toureiffel.paris', 'www.chateauversailles.fr', 'www.trenitalia.com',
  'api.open-meteo.com', 'archive-api.open-meteo.com', 'seasonal-api.open-meteo.com', 'ensemble-api.open-meteo.com', 'api.met.no']);
const TTL = 30 * 60 * 1000, STALE = 24 * 60 * 60 * 1000;
export class ResearchCache {
  inflight = new Map<string, Promise<unknown>>();
  constructor(public dir = resolve(process.env.TB_STATE_DIR || '.travel-boss', 'research'), public network = fetch, public now = Date.now) {}
  async get(input: string, force = false) {
    const url = new URL(input);
    if (url.protocol !== 'https:' || url.port && url.port !== '443' || url.username || url.password || !HOSTS.has(url.hostname)) throw Error('Source not allowed');
    url.hash = ''; url.searchParams.sort();
    if (url.href.length > 2000) throw Error('URL too long');
    const key = createHash('sha256').update(url.href).digest('hex');
    const file = resolve(this.dir, `${key}.json`);
    let stored: any;
    try { stored = JSON.parse(readFileSync(file, 'utf8')); } catch { /* Miss/corruption. */ }
    if (stored?.expiresAt > this.now() && !force) return { ...stored, cache: 'hit', stale: false };
    const pending = this.inflight.get(key); if (pending) return pending;
    if (this.inflight.size >= 4) throw Error('Research cache busy');
    const job = (async () => {
      try {
        const response = await this.network(url.href, { redirect: 'manual', signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'TravelBoss/0.1 (private travel research)' } });
        if (!response.ok) throw Error(`Source HTTP ${response.status}`);
        const type = response.headers.get('content-type') || '';
        if (!/^(?:text\/|application\/json)/i.test(type)) throw Error('Source must be text or JSON');
        const reader = response.body?.getReader(); let bytes = 0; const chunks: Uint8Array[] = [];
        if (reader) try {
          while (true) {
            const { done, value } = await reader.read(); if (done) break;
            bytes += value.byteLength; if (bytes > 1048576) throw Error('Source too large'); chunks.push(value);
          }
        } finally { await reader.cancel(); }
        const fetchedAt = this.now();
        const value = { source: url.href, fetchedAt, expiresAt: fetchedAt + TTL, contentType: type,
          text: Buffer.concat(chunks).toString('utf8'), warning: 'Untrusted source text; verify travel facts before editing.' };
        mkdirSync(this.dir, { recursive: true, mode: 0o700 });
        const tmp = `${file}.${randomUUID()}.tmp`;
        try { writeFileSync(tmp, JSON.stringify(value), { mode: 0o600 }); renameSync(tmp, file); } finally { rmSync(tmp, { force: true }); }
        const files = readdirSync(this.dir).filter(name => /^[a-f0-9]{64}\.json$/.test(name)).map(name => ({ name, at: statSync(resolve(this.dir, name)).mtimeMs })).sort((a, b) => b.at - a.at);
        for (const entry of files.slice(256)) rmSync(resolve(this.dir, entry.name), { force: true });
        return { ...value, cache: 'miss', stale: false };
      } catch (error) {
        if (stored?.source === url.href && this.now() - stored.fetchedAt < STALE) return { ...stored, cache: 'stale', stale: true, error: (error as Error).message };
        throw error;
      } finally { this.inflight.delete(key); }
    })();
    this.inflight.set(key, job); return job;
  }
}

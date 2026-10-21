import { createHash, randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const HOSTS = new Set(['www.louvre.fr', 'www.toureiffel.paris', 'www.chateauversailles.fr', 'www.trenitalia.com', 'trenitalia.fr',
  'www.ratp.fr', 'www.transilien.com', 'www.sncf-connect.com', 'www.italotreno.com', 'www.cp.pt', 'www.metrolisboa.pt',
  'api.transitous.org', 'api.sunrise-sunset.org',
  'api.open-meteo.com', 'archive-api.open-meteo.com', 'seasonal-api.open-meteo.com', 'ensemble-api.open-meteo.com', 'api.met.no']);
export type ResearchType = 'general' | 'hours' | 'prices' | 'timetable' | 'weather' | 'sunset' | 'identity';
export interface ResearchOptions { type?: ResearchType; subject?: string; effectiveDate?: string }
const MINUTE = 60000, DAY = 86400000;
const TTL: Record<ResearchType, number> = { general: 30 * MINUTE, hours: 6 * 60 * MINUTE, prices: DAY,
  timetable: 30 * MINUTE, weather: 15 * MINUTE, sunset: 30 * DAY, identity: 30 * DAY };
export const sourceDocumentHash = (text: string) => createHash('sha256').update(text).digest('hex');
const RESEARCH_TIME_ZONE = 'America/Sao_Paulo';
const calendarDay = new Intl.DateTimeFormat('en-CA', { timeZone: RESEARCH_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });

export function researchSource(input: string): URL {
  const url = new URL(input);
  if (url.protocol !== 'https:' || url.port && url.port !== '443' || url.username || url.password || !HOSTS.has(url.hostname)) throw Error('Source not allowed');
  if ([...url.searchParams.keys()].some(key => /token|secret|password|email|api[_-]?key|authorization/i.test(key))) throw Error('Credential parameters not allowed');
  if (url.hostname === 'api.transitous.org' && !/^\/api\/v1\/(?:plan|stoptimes|stops|trip)(?:\/|$)/.test(url.pathname)) throw Error('Transport endpoint not allowed');
  if (url.hostname === 'api.sunrise-sunset.org') {
    const lat = Number(url.searchParams.get('lat')), lng = Number(url.searchParams.get('lng'));
    if (url.pathname !== '/json' || !url.searchParams.has('lat') || !url.searchParams.has('lng') || !Number.isFinite(lat) || Math.abs(lat) > 90 || !Number.isFinite(lng) || Math.abs(lng) > 180) throw Error('Invalid sunset coordinates/endpoint');
    const date = url.searchParams.get('date');
    if (date && date !== 'today' && (!/^20\d{2}-\d{2}-\d{2}$/.test(date) || new Date(date).toISOString().slice(0, 10) !== date)) throw Error('Invalid sunset date');
  }
  url.hash = ''; url.searchParams.sort();
  if (url.href.length > 2000) throw Error('URL too long');
  return url;
}

export function researchPolicy(url: URL, type?: ResearchType) {
  const weather = /(?:open-meteo\.com|api\.met\.no)$/.test(url.hostname);
  const timetable = /(?:transitous|trenitalia|ratp|transilien|sncf-connect|italotreno|metrolisboa|cp\.pt)/.test(url.hostname);
  const kind = type ?? (weather ? 'weather' : url.hostname === 'api.sunrise-sunset.org' ? 'sunset' : timetable ? 'timetable' : 'general');
  if (!Object.hasOwn(TTL, kind)) throw Error('Invalid research type');
  const relativeSunset = url.hostname === 'api.sunrise-sunset.org' && !/^20\d{2}-\d{2}-\d{2}$/.test(url.searchParams.get('date') ?? '');
  const ttlMs = Math.min(TTL[kind], weather ? TTL.weather : timetable || relativeSunset ? TTL.timetable : Number.MAX_SAFE_INTEGER);
  return { type: kind, ttlMs, staleMs: Math.max(DAY, ttlMs * 2),
    requiresSameDayCheck: kind === 'hours' || kind === 'prices', timeZone: RESEARCH_TIME_ZONE };
}

/** Hours/prices expire at local midnight even if their ordinary TTL is longer. */
export function researchExpiresAt(checkedAt: number, policy: ReturnType<typeof researchPolicy>): number {
  const expiresAt = checkedAt + policy.ttlMs;
  if (!policy.requiresSameDayCheck) return expiresAt;
  const day = calendarDay.format(checkedAt);
  if (calendarDay.format(expiresAt) === day) return expiresAt;
  // Use the timezone database, including offset changes; do not assume 24-hour days.
  let low = checkedAt, high = expiresAt;
  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    if (calendarDay.format(middle) === day) low = middle;
    else high = middle;
  }
  return high;
}

/** Deterministic text extraction only. It does not verify any claim from the page. */
export function readableSource(text: string, contentType: string): string {
  let value = text;
  if (/html/i.test(contentType)) value = value.replace(/<(script|style|noscript|template|svg)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<!--[^]*?-->/g, ' ').replace(/<\/?(?:p|div|li|br|h[1-6]|tr|section|article)\b[^>]*>/gi, '\n')
    .replace(/<[^>]*>/g, ' ').replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code: string) => {
      const point = code[0]?.toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
      return point > 0 && point <= 0x10ffff ? String.fromCodePoint(point) : ' ';
    }).replace(/&(amp|lt|gt|quot|apos|nbsp);/gi, (_, entity: string) => ({ amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' })[entity.toLowerCase()] ?? ' ');
  return value.replace(/[ \t]+/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

interface CachedSource {
  source: string; fetchedAt: number; revalidatedAt: number; expiresAt: number; contentType: string;
  text: string; sourceDocumentHash: string; textTruncated: boolean; etag?: string; lastModified?: string;
}
export interface ResearchResult extends CachedSource {
  cache: 'hit' | 'miss' | 'revalidated' | 'stale'; stale: boolean; error?: string;
  policy: ReturnType<typeof researchPolicy>; verification: 'unverified-source'; verifiedAt: null;
  subject?: string; effectiveDate?: string; warning: string;
}

export class ResearchCache {
  inflight = new Map<string, Promise<CachedSource & { cache: ResearchResult['cache']; stale: boolean; error?: string }>>();
  constructor(public dir = resolve(process.env.TB_STATE_DIR || '.travel-boss', 'research'), public network = fetch, public now = Date.now) {}
  /** Local provenance inspection does not initiate a network request. */
  peek(input: string, type?: ResearchType): (CachedSource & { stale: boolean }) | null {
    const url = researchSource(input), policy = researchPolicy(url, type);
    try {
      const value = JSON.parse(readFileSync(resolve(this.dir, `${sourceDocumentHash(url.href)}.json`), 'utf8')) as CachedSource;
      if (value.source !== url.href || typeof value.sourceDocumentHash !== 'string' || typeof value.revalidatedAt !== 'number') return null;
      const expiresAt = researchExpiresAt(value.revalidatedAt, policy);
      return { ...value, expiresAt, stale: expiresAt <= this.now() };
    } catch { return null; }
  }
  async get(input: string, force = false, options: ResearchOptions = {}): Promise<ResearchResult> {
    const url = researchSource(input), policy = researchPolicy(url, options.type);
    if (options.subject && !/^[\w-]{1,100}$/.test(options.subject)) throw Error('Invalid research subject');
    if (options.effectiveDate && (!/^20\d{2}-\d{2}-\d{2}$/.test(options.effectiveDate) || new Date(options.effectiveDate).toISOString().slice(0, 10) !== options.effectiveDate)) throw Error('Invalid effective date');
    const key = sourceDocumentHash(url.href), file = resolve(this.dir, `${key}.json`);
    let stored: CachedSource | undefined;
    try {
      const candidate = JSON.parse(readFileSync(file, 'utf8'));
      if (candidate.source === url.href && typeof candidate.sourceDocumentHash === 'string' && typeof candidate.revalidatedAt === 'number') stored = candidate;
    } catch { /* Cache miss or legacy entry. */ }
    const describe = (value: CachedSource & { cache: ResearchResult['cache']; stale: boolean; error?: string }): ResearchResult => ({ ...value,
      expiresAt: researchExpiresAt(value.revalidatedAt, policy), stale: value.stale || researchExpiresAt(value.revalidatedAt, policy) <= this.now(),
      policy, subject: options.subject, effectiveDate: options.effectiveDate,
      verification: 'unverified-source', verifiedAt: null,
      warning: 'Untrusted extracted source text. Parsing and HTTP revalidation do not verify travel facts; dates/subject are caller context.' });
    if (stored && researchExpiresAt(stored.revalidatedAt, policy) > this.now() && !force) return describe({ ...stored, cache: 'hit', stale: false });
    const pending = this.inflight.get(key);
    if (pending) return describe(await pending);
    if (this.inflight.size >= 4) throw Error('Research cache busy');
    const job = (async () => {
      try {
        const headers: Record<string, string> = { 'User-Agent': 'TravelBoss/0.1 (private travel research)' };
        if (stored?.etag) headers['If-None-Match'] = stored.etag;
        if (stored?.lastModified) headers['If-Modified-Since'] = stored.lastModified;
        const response = await this.network(url.href, { redirect: 'manual', signal: AbortSignal.timeout(15000), headers });
        if (response.status === 304 && stored) {
          const value = { ...stored, revalidatedAt: this.now(), expiresAt: researchExpiresAt(this.now(), policy) };
          this.save(file, value); return { ...value, cache: 'revalidated' as const, stale: false };
        }
        if (!response.ok) throw Error(`Source HTTP ${response.status}`);
        const type = response.headers.get('content-type') || '';
        if (!/^(?:text\/(?:html|plain)|application\/(?:json|[^;]+\+json))(?:;|$)/i.test(type)) throw Error('Source must be text or JSON');
        const reader = response.body?.getReader(); let bytes = 0; const chunks: Uint8Array[] = [];
        if (reader) try {
          while (true) {
            const { done, value } = await reader.read(); if (done) break;
            bytes += value.byteLength; if (bytes > 1048576) throw Error('Source too large'); chunks.push(value);
          }
        } finally { await reader.cancel(); }
        const raw = Buffer.concat(chunks).toString('utf8'), text = readableSource(raw, type), fetchedAt = this.now();
        const value: CachedSource = { source: url.href, fetchedAt, revalidatedAt: fetchedAt, expiresAt: researchExpiresAt(fetchedAt, policy), contentType: type,
          text: text.slice(0, 16000), textTruncated: text.length > 16000, sourceDocumentHash: sourceDocumentHash(raw),
          etag: response.headers.get('etag') ?? undefined, lastModified: response.headers.get('last-modified') ?? undefined };
        this.save(file, value); return { ...value, cache: 'miss' as const, stale: false };
      } catch (error) {
        if (stored && this.now() - stored.revalidatedAt < policy.staleMs) return { ...stored, cache: 'stale' as const, stale: true, error: (error as Error).message };
        throw error;
      } finally { this.inflight.delete(key); }
    })();
    this.inflight.set(key, job); return describe(await job);
  }
  private save(file: string, value: CachedSource) {
    mkdirSync(this.dir, { recursive: true, mode: 0o700 });
    const tmp = `${file}.${randomUUID()}.tmp`;
    try { writeFileSync(tmp, JSON.stringify(value), { mode: 0o600 }); renameSync(tmp, file); } finally { rmSync(tmp, { force: true }); }
    const files = readdirSync(this.dir).filter(name => /^[a-f0-9]{64}\.json$/.test(name)).map(name => ({ name, at: statSync(resolve(this.dir, name)).mtimeMs })).sort((a, b) => b.at - a.at);
    for (const entry of files.slice(256)) rmSync(resolve(this.dir, entry.name), { force: true });
  }
}

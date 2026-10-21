import { mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { ResearchCache, researchExpiresAt, researchPolicy, researchSource, sourceDocumentHash, type ResearchType } from './research-cache';

export interface EvidenceInput {
  subject: string;
  type: ResearchType;
  claim: string;
  source: string;
  sourceDocumentHash: string;
  excerpt: string;
  /** Timestamp asserted by caller; never treated as independent verification. */
  checkedAt: string;
  effectiveDate?: string;
}
export interface EvidenceRecord extends EvidenceInput {
  id: string;
  recordedAt: number;
  fetchedAt: number;
  expiresAt: number;
  verification: 'caller-assertion';
  evidenceStatus: 'exact-excerpt-matched';
  verifiedAt: null;
}
export interface EvidenceQuery { subject?: string; source?: string; type?: ResearchType; effectiveDate?: string; includeStale?: boolean; limit?: number }

/** Structured research notes with proof of quotation, never an automatic truth label. */
export class ResearchFacts {
  constructor(public cache = new ResearchCache(), public dir = resolve(cache.dir, 'facts')) {}
  async record(input: EvidenceInput): Promise<EvidenceRecord & { stale: false }> {
    if (!input || typeof input !== 'object' || !/^[\w-]{1,100}$/.test(input.subject)) throw Error('Invalid evidence subject');
    if (typeof input.type !== 'string') throw Error('Evidence type required');
    for (const [key, max] of [['claim', 600], ['excerpt', 1200]] as const) {
      if (typeof input[key] !== 'string' || !input[key].trim() || input[key].length > max) throw Error(`Invalid evidence ${key}`);
    }
    if (typeof input.sourceDocumentHash !== 'string' || !/^[a-f0-9]{64}$/.test(input.sourceDocumentHash)) throw Error('Invalid source document hash');
    const checkedAt = Date.parse(input.checkedAt);
    if (!Number.isFinite(checkedAt) || checkedAt > this.cache.now() + 60000) throw Error('Invalid evidence checkedAt');
    const source = await this.cache.get(input.source, false, { type: input.type, subject: input.subject, effectiveDate: input.effectiveDate });
    if (source.stale || researchExpiresAt(checkedAt, source.policy) <= this.cache.now()) throw Error('Evidence source/check is stale; recheck before recording');
    if (source.sourceDocumentHash !== input.sourceDocumentHash || !source.text.includes(input.excerpt)) throw Error('Evidence must match the current source hash and exact readable excerpt');
    const id = sourceDocumentHash(JSON.stringify([input.subject, input.type, source.source, input.effectiveDate ?? '']));
    const record: EvidenceRecord = { subject: input.subject, type: input.type, claim: input.claim, source: source.source,
      sourceDocumentHash: input.sourceDocumentHash, excerpt: input.excerpt, checkedAt: input.checkedAt, effectiveDate: input.effectiveDate,
      id, recordedAt: this.cache.now(), fetchedAt: source.fetchedAt, expiresAt: Math.min(researchExpiresAt(checkedAt, source.policy), source.expiresAt),
      verification: 'caller-assertion', evidenceStatus: 'exact-excerpt-matched', verifiedAt: null };
    mkdirSync(this.dir, { recursive: true, mode: 0o700 });
    const file = resolve(this.dir, `${id}.json`), temp = `${file}.${randomUUID()}.tmp`;
    try { writeFileSync(temp, JSON.stringify(record), { mode: 0o600 }); renameSync(temp, file); } finally { rmSync(temp, { force: true }); }
    const files = readdirSync(this.dir).filter(name => /^[a-f0-9]{64}\.json$/.test(name)).sort((a, b) => {
      try { return JSON.parse(readFileSync(resolve(this.dir, b), 'utf8')).recordedAt - JSON.parse(readFileSync(resolve(this.dir, a), 'utf8')).recordedAt; } catch { return 0; }
    });
    for (const file of files.slice(256)) rmSync(resolve(this.dir, file), { force: true });
    return { ...record, stale: false };
  }
  query(options: EvidenceQuery = {}) {
    const source = options.source ? researchSource(options.source).href : undefined;
    if (options.type) researchPolicy(new URL('https://www.louvre.fr/'), options.type);
    let names: string[];
    try { names = readdirSync(this.dir).filter(name => /^[a-f0-9]{64}\.json$/.test(name)).slice(0, 256); } catch { names = []; }
    const matches = names.flatMap(name => {
      let record: EvidenceRecord;
      try { record = JSON.parse(readFileSync(resolve(this.dir, name), 'utf8')); } catch { return []; }
      if (record.verification !== 'caller-assertion' || record.evidenceStatus !== 'exact-excerpt-matched') return [];
      if (options.subject && record.subject !== options.subject || options.type && record.type !== options.type || source && record.source !== source || options.effectiveDate && record.effectiveDate !== options.effectiveDate) return [];
      const cached = this.cache.peek(record.source, record.type);
      const policy = researchPolicy(new URL(record.source), record.type);
      const expiresAt = Math.min(record.expiresAt, researchExpiresAt(Date.parse(record.checkedAt), policy));
      const sourceChanged = cached ? cached.sourceDocumentHash !== record.sourceDocumentHash : null;
      const stale = expiresAt <= this.cache.now() || !cached || cached.stale || sourceChanged === true;
      if (stale && options.includeStale !== true) return [];
      return [{ ...record, expiresAt, policy, stale, sourceChanged, revalidatedAt: cached?.revalidatedAt ?? null }];
    }).sort((a, b) => b.recordedAt - a.recordedAt);
    const limit = Math.max(1, Math.min(100, Number.isFinite(options.limit) ? Math.trunc(options.limit!) : 20));
    return { matches: matches.slice(0, limit), hasMore: matches.length > limit,
      warning: 'Claims are caller assertions with matching excerpts, not independently verified facts. Fresh HTTP content does not establish accuracy or future service availability.' };
  }
}

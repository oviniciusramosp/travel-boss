import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it, vi } from 'vitest';
import { ResearchCache } from './research-cache';
import { ResearchFacts } from './agent-research';

it('records only exact current evidence and isolates subject/source/date without asserting truth', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-facts-')); let now = Date.parse('2026-10-21T10:00:00Z');
  const network = vi.fn(async () => new Response('<p>Open at 09:00 on 21 October.</p>', { headers: { 'content-type': 'text/html' } }));
  const cache = new ResearchCache(dir, network as typeof fetch, () => now), facts = new ResearchFacts(cache);
  try {
    const source = await cache.get('https://www.louvre.fr/visit', false, { type: 'hours' });
    const input = { subject: 'par-louvre', type: 'hours' as const, claim: 'Open at 09:00', source: source.source,
      sourceDocumentHash: source.sourceDocumentHash, excerpt: 'Open at 09:00 on 21 October.', checkedAt: new Date(now).toISOString(), effectiveDate: '2026-10-21' };
    await expect(facts.record({ ...input, sourceDocumentHash: 'a'.repeat(64) })).rejects.toThrow('hash');
    await expect(facts.record({ ...input, excerpt: 'Open at 10:00' })).rejects.toThrow('excerpt');
    const record = await facts.record(input);
    expect(record).toMatchObject({ verification: 'caller-assertion', evidenceStatus: 'exact-excerpt-matched', verifiedAt: null, stale: false });
    expect(facts.query({ subject: 'par-louvre', effectiveDate: '2026-10-21' }).matches).toHaveLength(1);
    expect(facts.query({ subject: 'par-louvre', effectiveDate: '2026-10-22' }).matches).toHaveLength(0);
    expect(facts.query({ subject: 'par-eiffel' }).matches).toHaveLength(0);
    network.mockImplementation(async () => new Response('Closed for exceptional works.', { headers: { 'content-type': 'text/plain' } }));
    await cache.get(source.source, true);
    expect(facts.query().matches).toHaveLength(0);
    expect(facts.query({ includeStale: true }).matches[0]).toMatchObject({ stale: true, sourceChanged: true });
    now += 7 * 3600000;
    await expect(facts.record({ ...input, checkedAt: new Date(now).toISOString() })).rejects.toThrow('hash');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

it('does not turn HTTP 304 into renewed fact verification', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-facts-')); let now = Date.parse('2026-10-21T10:00:00Z');
  const network = vi.fn(async () => new Response('Tickets cost €22.', { headers: { 'content-type': 'text/plain', etag: '"v1"' } }));
  const cache = new ResearchCache(dir, network as typeof fetch, () => now), facts = new ResearchFacts(cache);
  try {
    const source = await cache.get('https://www.louvre.fr/visit');
    await facts.record({ subject: 'par-louvre', type: 'general', claim: 'Tickets cost €22', source: source.source,
      sourceDocumentHash: source.sourceDocumentHash, excerpt: source.text, checkedAt: new Date(now).toISOString() });
    now += 31 * 60000; network.mockImplementation(async () => new Response(null, { status: 304 }));
    await cache.get(source.source);
    expect(facts.query().matches).toHaveLength(0);
    expect(facts.query({ includeStale: true }).matches[0]).toMatchObject({ stale: true, sourceChanged: false, verifiedAt: null });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

it('requires a same-day caller check after midnight even when HTTP 304 preserves the evidence hash', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-midnight-facts-')); let now = Date.parse('2026-10-22T02:59:00Z');
  const network = vi.fn(async () => new Response('Ticket €22.', { headers: { 'content-type': 'text/plain', etag: '"daily"' } }));
  const cache = new ResearchCache(dir, network as typeof fetch, () => now), facts = new ResearchFacts(cache);
  try {
    const source = await cache.get('https://www.louvre.fr/visit', false, { type: 'prices' });
    const input = { subject: 'par-louvre', type: 'prices' as const, claim: 'Ticket €22', source: source.source,
      sourceDocumentHash: source.sourceDocumentHash, excerpt: source.text, checkedAt: new Date(now).toISOString() };
    await facts.record(input);
    now += 60000; network.mockRejectedValue(new Error('offline'));
    expect(facts.query().matches).toHaveLength(0);
    await expect(facts.record({ ...input, checkedAt: new Date(now).toISOString() })).rejects.toThrow('stale');
    network.mockImplementation(async () => new Response(null, { status: 304 }));
    await cache.get(source.source, false, { type: 'prices' });
    await expect(facts.record(input)).rejects.toThrow('stale');
    expect(facts.query({ includeStale: true }).matches[0]).toMatchObject({ stale: true, sourceChanged: false,
      policy: { requiresSameDayCheck: true, timeZone: 'America/Sao_Paulo' }, verifiedAt: null });
    const updated = await facts.record({ ...input, checkedAt: new Date(now).toISOString() });
    expect(updated).toMatchObject({ stale: false, verification: 'caller-assertion', verifiedAt: null });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

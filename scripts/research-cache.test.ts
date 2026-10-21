import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { expect, it, vi } from 'vitest';
import { ResearchCache } from './research-cache';
it('coalesces external requests, expires entries, reports stale provenance and refuses SSRF', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-cache-')); let now = 100;
  const network = vi.fn(async () => new Response('official hours', { headers: { 'content-type': 'text/html' } }));
  const cache = new ResearchCache(dir, network as typeof fetch, () => now);
  try {
    const url = 'https://www.louvre.fr/en/visit';
    const [a, b] = await Promise.all([cache.get(url), cache.get(url)]);
    expect(a).toEqual(b); expect(network).toHaveBeenCalledTimes(1);
    expect(await cache.get(url)).toMatchObject({ cache: 'hit', source: url, stale: false });
    now += 31 * 60000; network.mockRejectedValue(new Error('offline'));
    expect(await cache.get(url)).toMatchObject({ cache: 'stale', stale: true, error: 'offline' });
    now += 25 * 3600000; await expect(cache.get(url)).rejects.toThrow('offline');
    for (const url of ['http://www.louvre.fr', 'https://localhost/', 'https://www.louvre.fr.evil.test/', 'https://u:p@www.louvre.fr', 'https://www.louvre.fr:444/']) await expect(cache.get(url)).rejects.toThrow('allowed');
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

it('extracts bounded readable evidence and conditionally revalidates without claiming verification', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-cache-')); let now = 100;
  const network = vi.fn(async (_url: unknown, _init?: RequestInit) => new Response('<script>secret code</script><h1>Visit</h1><p>Open 09:00 &amp; tickets €22.</p>', {
    headers: { 'content-type': 'text/html', etag: '"v1"', 'last-modified': 'Wed, 21 Oct 2026 00:00:00 GMT' },
  }));
  const cache = new ResearchCache(dir, network as typeof fetch, () => now);
  try {
    const source = await cache.get('https://www.louvre.fr/visit', false, { type: 'hours', subject: 'par-louvre', effectiveDate: '2026-10-21' });
    expect(source).toMatchObject({ verification: 'unverified-source', verifiedAt: null, policy: { type: 'hours', ttlMs: 21600000 } });
    expect(source.text).toMatch(/^Visit\s+Open 09:00 & tickets €22\.$/);
    expect(source.sourceDocumentHash).toMatch(/^[a-f0-9]{64}$/);
    now += 21600001; network.mockImplementation(async () => new Response(null, { status: 304 }));
    const revalidated = await cache.get(source.source, false, { type: 'hours' });
    expect(revalidated).toMatchObject({ cache: 'revalidated', fetchedAt: 100, revalidatedAt: now, sourceDocumentHash: source.sourceDocumentHash, verifiedAt: null });
    expect(network.mock.calls[1]![1]!.headers).toMatchObject({ 'If-None-Match': '"v1"', 'If-Modified-Since': 'Wed, 21 Oct 2026 00:00:00 GMT' });
    network.mockImplementation(async () => new Response('x'.repeat(18000), { headers: { 'content-type': 'text/plain' } }));
    const bounded = await cache.get(source.source, true);
    expect(bounded.text).toHaveLength(16000); expect(bounded.textTruncated).toBe(true);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

it('caps weather/transport freshness and validates newly allowed research endpoints', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-cache-'));
  const network = vi.fn(async () => new Response('{}', { headers: { 'content-type': 'application/json' } }));
  const cache = new ResearchCache(dir, network as typeof fetch);
  try {
    expect((await cache.get('https://api.open-meteo.com/v1/forecast', false, { type: 'identity' })).policy.ttlMs).toBe(900000);
    expect((await cache.get('https://api.transitous.org/api/v1/plan?fromPlace=48,2&toPlace=49,3', false, { type: 'identity' })).policy.ttlMs).toBe(1800000);
    expect((await cache.get('https://api.sunrise-sunset.org/json?lat=48.8&lng=2.3&date=2026-10-21')).policy.type).toBe('sunset');
    for (const url of ['https://api.transitous.org/proxy', 'https://api.sunrise-sunset.org/json?lat=300&lng=2', 'https://api.sunrise-sunset.org/json?lat=48&lng=2&date=2026-02-30', 'https://www.louvre.fr/?api_key=SECRET']) await expect(cache.get(url)).rejects.toThrow();
  } finally { rmSync(dir, { recursive: true, force: true }); }
});
it('does not follow redirects or cache HTTP errors', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-cache-'));
  try {
    const network = vi.fn(async () => new Response('', { status: 302, headers: { location: 'http://127.0.0.1/' } }));
    const cache = new ResearchCache(dir, network as typeof fetch);
    await expect(cache.get('https://www.louvre.fr/')).rejects.toThrow('HTTP 302');
    expect(network.mock.calls[0]?.[1]).toMatchObject({ redirect: 'manual' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

for (const type of ['hours', 'prices'] as const) it(`revalidates ${type} at São Paulo midnight while preserving HTTP validators`, async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-midnight-')); let now = Date.parse('2026-10-21T23:59:00Z');
  const network = vi.fn(async (_url: unknown, _init?: RequestInit) => new Response('Open at 09:00; ticket €22.', {
    headers: { 'content-type': 'text/plain', etag: '"daily"' },
  }));
  const cache = new ResearchCache(dir, network as typeof fetch, () => now);
  try {
    const source = await cache.get('https://www.louvre.fr/visit', false, { type });
    expect(source.policy).toMatchObject({ requiresSameDayCheck: true, timeZone: 'America/Sao_Paulo' });
    expect(source.expiresAt).toBe(Date.parse('2026-10-22T03:00:00Z'));
    now = Date.parse('2026-10-22T00:01:00Z'); // UTC rolled over; user calendar day has not.
    expect(await cache.get(source.source, false, { type })).toMatchObject({ cache: 'hit', stale: false });
    expect(network).toHaveBeenCalledTimes(1);
    now = Date.parse('2026-10-22T03:00:00Z');
    expect(cache.peek(source.source, type)?.stale).toBe(true);
    network.mockImplementation(async () => new Response(null, { status: 304 }));
    expect(await cache.get(source.source, false, { type })).toMatchObject({ cache: 'revalidated', stale: false,
      revalidatedAt: now, fetchedAt: source.fetchedAt, sourceDocumentHash: source.sourceDocumentHash, verifiedAt: null });
    expect(network.mock.calls[1]?.[1]?.headers).toMatchObject({ 'If-None-Match': '"daily"' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

it('marks yesterday prices stale on network failure before their ordinary 24-hour TTL', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-midnight-')); let now = Date.parse('2026-10-22T02:59:00Z');
  const network = vi.fn(async () => new Response('Ticket €22.', { headers: { 'content-type': 'text/plain' } }));
  const cache = new ResearchCache(dir, network as typeof fetch, () => now);
  try {
    const source = await cache.get('https://www.louvre.fr/visit', false, { type: 'prices' });
    now += 60000; network.mockRejectedValue(new Error('offline'));
    expect(await cache.get(source.source, false, { type: 'prices' })).toMatchObject({ cache: 'stale', stale: true, expiresAt: now, error: 'offline' });
    expect(cache.peek(source.source, 'prices')?.stale).toBe(true);
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

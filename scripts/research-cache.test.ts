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
it('does not follow redirects or cache HTTP errors', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'tb-cache-'));
  try {
    const network = vi.fn(async () => new Response('', { status: 302, headers: { location: 'http://127.0.0.1/' } }));
    const cache = new ResearchCache(dir, network as typeof fetch);
    await expect(cache.get('https://www.louvre.fr/')).rejects.toThrow('HTTP 302');
    expect(network.mock.calls[0]?.[1]).toMatchObject({ redirect: 'manual' });
  } finally { rmSync(dir, { recursive: true, force: true }); }
});

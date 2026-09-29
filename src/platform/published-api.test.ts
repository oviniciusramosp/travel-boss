import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { browserValue, publishedRequest } from './published-api';

beforeEach(() => {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) });
});
afterEach(() => vi.unstubAllGlobals());

describe('published app without a server', () => {
  it('loads bundled trips and persists a patch without a network request', async () => {
    const network = vi.fn(); vi.stubGlobal('fetch', network);
    const files = await (await publishedRequest('/api/trips')).json();
    expect(files.length).toBeGreaterThan(0);
    const original = files[0];
    const before = original.raw.split('\n')[0];
    const save = await publishedRequest(`/api/trips/${original.id}`, { method: 'PATCH', body: JSON.stringify({ line: 1, before: [before], after: ['# Published test'] }) });
    expect(save.ok).toBe(true);
    const loaded = await (await publishedRequest(`/api/trips/${original.id}`)).json();
    expect(loaded.raw.startsWith('# Published test')).toBe(true);
    expect(network).not.toHaveBeenCalled();
    expect((await publishedRequest(`/api/trips/${original.id}`, { method: 'PATCH', body: JSON.stringify({ line: 1, before: [before], after: ['# Conflict'] }) })).status).toBe(409);
  });
  it('keeps favorites across requests without mutating the published baseline', async () => {
    for (const id of ['static-test-a', 'static-test-b']) {
      const result = await publishedRequest(`/api/places/${id}`, { method: 'PATCH', body: JSON.stringify({ favorite: true }) });
      expect(result.ok).toBe(true);
      const edits = await result.json();
      expect(edits['static-test-a'].favorite).toBe(true);
    }
  });
  it('persists checklist changes and rejects stale edits', async () => {
    const files = await (await publishedRequest('/api/trips')).json();
    const url = `/api/checklists/${files[0].id}`;
    const item = { id: 'static-test', group: 'tasks', text: 'Test', done: false };
    expect((await publishedRequest(url, { method: 'PATCH', body: JSON.stringify({ before: null, after: item }) })).ok).toBe(true);
    expect(await (await publishedRequest(url)).json()).toContainEqual(item);
    expect((await publishedRequest(url, { method: 'PATCH', body: JSON.stringify({ before: null, after: item }) })).status).toBe(409);
  });
  it('refreshes drafts when their published source changes and surfaces storage failure', () => {
    browserValue('test', 'old source', 'draft');
    expect(browserValue('test', 'old source')).toBe('draft');
    expect(browserValue('test', 'new source')).toBe('new source');
    vi.stubGlobal('localStorage', { setItem() { throw new Error('full'); } });
    expect(() => browserValue('test', 'old source', 'draft')).toThrow('full');
  });
});

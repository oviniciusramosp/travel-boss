import { afterEach, describe, expect, it, vi } from 'vitest';
import { publishedPlaceEdits, publishedRequest } from './published-api';

afterEach(() => vi.unstubAllGlobals());

describe('read-only publication', () => {
  it('loads bundled trips and ignores browser drafts without a network request', async () => {
    const network = vi.fn();
    const read = vi.fn(() => JSON.stringify({ value: '# Old browser draft' }));
    vi.stubGlobal('fetch', network);
    vi.stubGlobal('localStorage', { getItem: read });
    const files = await (await publishedRequest('/api/trips')).json();
    expect(files.length).toBeGreaterThan(0);
    const loaded = await (await publishedRequest(`/api/trips/${files[0].id}`)).json();
    expect(loaded.raw).toBe(files[0].raw);
    expect(loaded.raw).not.toContain('# Old browser draft');
    publishedPlaceEdits();
    expect(read).not.toHaveBeenCalled();
    expect(network).not.toHaveBeenCalled();
  });
  it.each(['PATCH', 'POST', 'PUT', 'DELETE'])('rejects %s for all editable resources', async method => {
    const store = vi.fn();
    const network = vi.fn();
    vi.stubGlobal('localStorage', { setItem: store });
    vi.stubGlobal('fetch', network);
    for (const path of ['/api/trips/europa', '/api/checklists/europa', '/api/places/par-louvre']) {
      expect((await publishedRequest(path, { method, body: '{}' })).status).toBe(405);
    }
    expect(store).not.toHaveBeenCalled();
    expect(network).not.toHaveBeenCalled();
  });
  it('loads the published checklist and reports unknown trips', async () => {
    expect(Array.isArray(await (await publishedRequest('/api/checklists/europa')).json())).toBe(true);
    expect((await publishedRequest('/api/trips/unknown')).status).toBe(404);
    expect((await publishedRequest('/api/checklists/unknown')).status).toBe(404);
  });
});

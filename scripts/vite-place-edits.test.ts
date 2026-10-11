import { EventEmitter } from 'node:events';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Connect, ViteDevServer } from 'vite';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { travelCities } from '../src/data/travel';
import { placeEditsApi } from './vite-place-edits';

const storage = vi.hoisted(() => ({ value: '{}', writes: 0 }));
vi.mock('node:fs', async importOriginal => ({
  ...await importOriginal<typeof import('node:fs')>(),
  readFileSync: () => storage.value,
  writeFileSync: (_file: string, value: string) => { storage.value = value; storage.writes++; },
  renameSync: () => {},
}));

async function patch(id: string, value: unknown, origin = 'http://localhost:5173') {
  let handler!: Connect.NextHandleFunction;
  const server = {
    ssrLoadModule: vi.fn().mockResolvedValue({ travelCities }),
    middlewares: { use: (_path: string, callback: Connect.NextHandleFunction) => { handler = callback; } },
  } as unknown as ViteDevServer;
  const hook = placeEditsApi().configureServer!;
  await (typeof hook === 'function' ? hook : hook.handler).call({} as never, server);
  const req = Object.assign(new EventEmitter(), {
    method: 'PATCH', url: '/' + id,
    headers: { origin, host: 'localhost:5173', 'content-type': 'application/json' },
    setEncoding: () => {}, destroy: () => {},
  }) as unknown as IncomingMessage;
  let body = '';
  const res = { statusCode: 0, setHeader: () => {}, end: (value: string) => { body = value; } };
  await handler(req, res as unknown as ServerResponse, () => {});
  req.emit('data', JSON.stringify(value));
  req.emit('end');
  return { status: res.statusCode, body: JSON.parse(body) };
}

beforeEach(() => { storage.value = '{}'; storage.writes = 0; });

describe('local place edits API', () => {
  it('saves ratings for generated branch ids and preserves other saved fields', async () => {
    storage.value = JSON.stringify({ 'par-mangez-et-cassez-vous-taitbout': { favorite: true } });
    const result = await patch('par-mangez-et-cassez-vous-taitbout', { rating: 4.3 });
    expect(result.status).toBe(200);
    expect(result.body['par-mangez-et-cassez-vous-taitbout']).toEqual({ favorite: true, rating: 4.3 });
    expect(storage.writes).toBe(1);
  });
  it('rejects unknown ids without writing', async () => {
    expect((await patch('par-not-a-place', { rating: 4 })).status).toBe(404);
    expect(storage.writes).toBe(0);
  });
  it('keeps origin and rating validation for generated ids', async () => {
    expect((await patch('par-mangez-et-cassez-vous-taitbout', { rating: 4 }, 'https://other.example')).status).toBe(403);
    expect((await patch('par-mangez-et-cassez-vous-taitbout', { rating: 6 })).status).toBe(400);
    expect(storage.writes).toBe(0);
  });
});

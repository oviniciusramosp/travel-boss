import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { travelCities, resolveVisit } from '../src/catalog';
import { dateBudget, withSubPointPlaces } from '../src/trip/day-plan';
import { contextFromRaw, getDateContext } from './agent-context';

const raw = `# Europa
## Paris
city: paris
dates: 2026-10-04 → 2026-10-05
budget: comida €50
### Dia 1 — Dom 4/10
- 09:00 [Louvre](place:par-louvre) — Saída com as malas
### Dia 2 — Seg 5/10 · Partida para Milão
  - períodos fechados: manhã
- 08:00 [Orly](place:par-ory)
  - comentário: verificar embarque
  - decisão: 2026-10-01 · manter este trem
  - via: trem teste · 180 min · €12
  - embarque: 2026-10-05 · trem teste · Paris → Milão · 07:55 → 10:55
## Milão
city: milao
dates: 2026-10-05 → 2026-10-06
budget: comida €80
### Dia 1 — Chegada
- 11:00 [Milano Centrale](place:mil-centrale) — Check-in online do voo
- 12:00 [Duomo](place:mil-duomo) — Almoço
  - comida: €30
  - ingresso: €0
- 14:00 [Galleria](place:mil-galleria)
### Dia 2 — Ter 6/10
- 09:00 [Duomo](place:mil-duomo) — Deixar as malas
`;
const previous = process.cwd();
let dir: string | undefined;
afterEach(() => { process.chdir(previous); if (dir) rmSync(dir, { recursive: true, force: true }); dir = undefined; });

describe('complete date context', () => {
  it('joins all city headings and returns source anchors, decisions and review without raw duplication', () => {
    const context = contextFromRaw('test', raw, '2026-10-05');
    expect(context.days.map(day => day.city)).toEqual(['paris', 'milao']);
    expect(context.rows).toHaveLength(4);
    expect(context.rows[0]?.comments?.[0]?.text).toBe('verificar embarque');
    expect(context.rows[0]?.decisions?.[0]?.text).toContain('manter este trem');
    expect(context.days[0]?.closedPeriods).toEqual(['morning']);
    expect(context.blocks).toHaveLength(2);
    expect(context.rows[0]?.anchor).toBeTruthy();
    expect(context.blocks[0]?.guards.length).toBeGreaterThan(0);
    expect(context.blocks[0]).not.toHaveProperty('raw');
    expect(contextFromRaw('test', raw, '2026-10-05', { includeRaw: true }).blocks[0]).toHaveProperty('raw');
  });
  it('keeps all rows in authored order and computes meal boundaries and per-person overrides once', () => {
    const context = contextFromRaw('test', raw, '2026-10-05');
    expect(context.rows.map(row => row.period)).toEqual(['morning', 'morning', 'morning', 'afternoon']);
    expect(context.budget.food).toBe(30);
    expect(context.budget.foodTarget).toBe(50);
    expect(context.budget.ticket).toBeGreaterThanOrEqual(12);
    expect(context.budget.lines.find(line => line.id === 'mil-duomo')?.ticket).toBe(0);
    const louvre = contextFromRaw('test', raw, '2026-10-04').places.find(place => place.id === 'par-louvre')!;
    expect(louvre.visit).toEqual(resolveVisit('par-louvre', travelCities.flatMap(city => city.places).find(place => place.id === 'par-louvre')?.visit));
    expect(louvre).toHaveProperty('address');
    expect(louvre).not.toHaveProperty('area');
  });
  it('carries luggage across dates and cities and keeps airline check-in from clearing it', () => {
    const context = contextFromRaw('test', raw, '2026-10-05');
    expect(context.luggage.incoming).toBe(true);
    expect(context.luggage.outgoing).toBe(true);
    expect(context.rows.every(row => row.luggage)).toBe(true);
    expect(context.neighbors.previous?.placeId).toBe('par-louvre');
    expect(context.neighbors.next?.placeId).toBe('mil-duomo');
    const next = contextFromRaw('test', raw, '2026-10-06');
    expect(next.luggage.incoming).toBe(true);
    expect(next.rows[0]?.luggage).toBe(true);
    expect(next.luggage.outgoing).toBe(false);
  });
  it('uses published boarding times to flag a departure conflict without deriving train times', () => {
    const context = contextFromRaw('test', raw, '2026-10-05');
    const train = context.transfers.find(transfer => transfer.fromId === 'par-ory')!;
    expect(train.legs[0]?.timing?.time).toBe('07:55');
    expect(train.legs[0]?.timing?.verified).toBe(true);
    expect(train.legs[0]?.timing?.conflict).toBe(true);
    const unverified = contextFromRaw('test', raw.replace(/  - embarque:.*\n/, ''), '2026-10-05');
    expect(unverified.transfers.find(transfer => transfer.fromId === 'par-ory')?.legs[0]?.timing?.time).toBeUndefined();
    expect(unverified.transfers.find(transfer => transfer.fromId === 'par-ory')?.warnings).toContain('unverified-service');
  });
  it('includes subpoint place prices and resolves subpoint visit metadata', () => {
    const value = '# Test\n## Paris\ncity: paris\ndates: 2026-10-07 → 2026-10-07\n### Dia 1\n- 09:00 [Disney](place:par-disneyland)\n- 12:00 **Pizzeria Bella Notte** — Almoço\n';
    const context = contextFromRaw('test', value, '2026-10-07');
    const places = travelCities.flatMap(city => city.places), parent = places.find(place => place.id === 'par-disneyland')!;
    const expected = dateBudget(withSubPointPlaces([parent], id => places.find(place => place.id === id)));
    expect(context.budget.food).toBe(expected.food);
    expect(context.budget.ticket).toBe(expected.ticket);
    expect(context.places.find(place => place.id === 'par-bella-notte')?.visit).toBeTruthy();
    expect(context.rows[1]?.subPoint).toMatchObject({ parentId: 'par-disneyland', placeId: 'par-bella-notte' });
  });
  it('validates ISO dates and rejects an absent date without returning a different day', () => {
    expect(() => contextFromRaw('test', raw, '2026-02-31')).toThrow('ISO date');
    expect(() => contextFromRaw('test', raw, '2026-10-08')).toThrow('Date not found');
  });
  it('reads current browser favorite edits without changing the itinerary or module catalog', () => {
    dir = mkdtempSync(join(tmpdir(), 'tb-context-'));
    mkdirSync(join(dir, 'content/trips'), { recursive: true }); mkdirSync(join(dir, 'src/data'), { recursive: true });
    writeFileSync(join(dir, 'content/trips/test.md'), raw); process.chdir(dir);
    const file = join(dir, 'src/data/travel-place-edits.json');
    writeFileSync(file, JSON.stringify({ 'par-louvre': { favorite: false, rating: 0 } }));
    expect(getDateContext('test', '2026-10-04').places.find(place => place.id === 'par-louvre')).toMatchObject({ favorite: false, rating: 0 });
    writeFileSync(file, JSON.stringify({ 'par-louvre': { favorite: true, rating: 4 } }));
    expect(getDateContext('test', '2026-10-04').places.find(place => place.id === 'par-louvre')).toMatchObject({ favorite: true, rating: 4 });
    expect(readFileSync('content/trips/test.md', 'utf8')).toBe(raw);
  });
});

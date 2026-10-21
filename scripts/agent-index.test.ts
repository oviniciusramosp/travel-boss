import { mkdtempSync, mkdirSync, writeFileSync, rmSync, unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { AgentIndex } from './agent-index';
it('indexes accents, bounded pagination, changed/deleted files and persisted rebuilds', () => {
  const cwd = process.cwd(), dir = mkdtempSync(join(tmpdir(), 'tb-index-'));
  let index: AgentIndex | undefined;
  try {
    mkdirSync(join(dir, 'content/trips'), { recursive: true }); process.chdir(dir);
    writeFileSync('content/trips/test.md', '# Café\nCafé bonito\n');
    index = new AgentIndex(join(dir, 'test.sqlite'));
    expect(index.search('cafe', 1, 0, 'trip').nextOffset).toBe(1);
    expect(index.search('cafe', 1, 1, 'trip').matches).toHaveLength(1);
    expect(index.place('par-louvre')).toBeTruthy();
    expect(index.search('" OR *', 1)).toBeTruthy();
    writeFileSync('content/trips/test.md', '# Outra viagem\n');
    expect(index.search('cafe', 100, 0, 'trip').matches).toHaveLength(0);
    index.close(); index = new AgentIndex(join(dir, 'test.sqlite'));
    expect(index.search('outra', 100, 0, 'trip').matches).toHaveLength(1);
    unlinkSync('content/trips/test.md');
    expect(index.search('outra', 100, 0, 'trip').matches).toHaveLength(0);
  } finally { index?.close(); process.chdir(cwd); rmSync(dir, { recursive: true, force: true }); }
});

for (const forcePlain of [false, true]) it(`queries rich localized places, references and scoped dates (${forcePlain ? 'fallback' : 'FTS'})`, () => {
  const cwd = process.cwd(), dir = mkdtempSync(join(tmpdir(), 'tb-filter-'));
  let index: AgentIndex | undefined;
  try {
    mkdirSync(join(dir, 'content/trips'), { recursive: true });
    mkdirSync(join(dir, 'docs/references'), { recursive: true });
    mkdirSync(join(dir, 'src/data'), { recursive: true }); process.chdir(dir);
    writeFileSync('content/trips/test.md', '# Visita\n## Paris\ncity: paris\ndates: 2026-10-21 → 2026-10-22\n### Dia 1 — 21/10\n- 09:00 [Louvre](place:par-louvre) — Entrada pesquisada\n  - comentário: Conferir entrada\n### Dia 2 — 22/10\n- 10:00 [Louvre](place:par-louvre) — Entrada alternativa\n');
    writeFileSync('docs/references/entry.md', '# Entrada Louvre\nConsultado em 21/10/2026, par-louvre: entrada oficial abre às 09:00; https://www.louvre.fr/visit\nPIN: SECRET_REF\n');
    index = new AgentIndex(join(dir, 'test.sqlite'), { forcePlain });
    const place = index.place('par-louvre', { locale: 'en', fields: ['name', 'visit', 'address', 'favorite', 'rating'] });
    expect(typeof place.name).toBe('string'); expect(place.visit.ticket).toBeTruthy();
    expect(place.visit.durationMin).toBeGreaterThan(0); expect(place.visit.ticketUrl).toMatch(/^https:/);
    expect(place).not.toHaveProperty('description');
    expect(index.place('par-louvre', { fields: ['name'], locale: 'all' }).name).toHaveProperty('pt-BR');
    writeFileSync('src/data/travel-place-edits.json', JSON.stringify({ 'par-louvre': { favorite: true, rating: 4.2 } }));
    expect(index.place('par-louvre')).toMatchObject({ favorite: true, rating: 4.2 });
    writeFileSync('src/data/travel-place-edits.json', JSON.stringify({ 'par-louvre': { favorite: false, rating: null } }));
    expect(index.place('par-louvre')).toMatchObject({ favorite: false, rating: null });
    const day = index.search('entrada', 100, 0, 'trip', { city: 'paris', trip: 'test', date: '2026-10-21', place: 'par-louvre' });
    expect(day.matches).toHaveLength(2); expect(day.matches.map(row => row.line).sort()).toEqual([6, 7]);
    expect(index.search('entrada', 100, 0, 'trip', { date: '2026-10-22' }).matches).toHaveLength(1);
    const refs = index.search('entrada', 10, 0, 'reference', { place: 'par-louvre', date: '2026-10-21' });
    expect(refs.matches).toHaveLength(1); expect(refs.matches[0]!.data).toMatchObject({ file: 'docs/references/entry.md', section: 'Entrada Louvre', sources: ['https://www.louvre.fr/visit'] });
    expect(JSON.stringify(index.search('SECRET_REF', 100))).not.toContain('SECRET_REF');
    const result = index.search('Louvre', 1, 0, 'place', { fields: ['name'], locale: 'en', city: 'paris' }).matches[0]!;
    expect(result).not.toHaveProperty('text'); expect(result.data).not.toHaveProperty('visit');
    unlinkSync('docs/references/entry.md');
    expect(index.search('entrada', 100, 0, 'reference').matches).toHaveLength(0);
  } finally { index?.close(); process.chdir(cwd); rmSync(dir, { recursive: true, force: true }); }
});

import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { expect, it } from 'vitest';
import { readReference, referenceFiles, referenceText } from './agent-references';

it('indexes bounded reference evidence with exact file/line and dates without private fields', () => {
  const root = mkdtempSync(join(tmpdir(), 'tb-refs-'));
  try {
    const dir = join(root, 'docs/references'); mkdirSync(dir, { recursive: true });
    const file = join(dir, 'museum-2026-10-21.md');
    writeFileSync(file, '# Louvre — consultado 21/10/2026\n\n## Entrada\npar-louvre abre às 09:00. Fonte https://www.louvre.fr/visit\nPIN da reserva: SECRET_PIN\n  detalhe privado SECRET_CHILD\n  - https://www.louvre.fr/private-booking/SECRET_URL\nE-mail pessoa@example.test\nVisita pública sem reserva nominal.\n```json\n{"url":"https://www.louvre.fr/private/SECRET_FENCE"}\n```\n');
    symlinkSync(file, join(dir, 'linked.md'));
    expect(referenceFiles(dir, root)).toEqual([file]);
    const records = readReference(file, root);
    expect(records[0]).toMatchObject({ file: 'docs/references/museum-2026-10-21.md', line: 4,
      section: 'Entrada', placeIds: ['par-louvre'], dates: ['2026-10-21'], sources: ['https://www.louvre.fr/visit'] });
    expect(JSON.stringify(records)).not.toMatch(/SECRET|pessoa@example/);
    expect(referenceText('See https://www.louvre.fr/?token=SECRET_URL')).not.toContain('SECRET_URL');
    const outside = mkdtempSync(join(tmpdir(), 'tb-outside-'));
    try {
      writeFileSync(join(outside, 'outside.md'), '# Outside\nSECRET_OUTSIDE public-looking text');
      symlinkSync(outside, join(root, 'external'));
      expect(referenceFiles(join(root, 'external'), root)).toEqual([]);
      mkdirSync(join(root, 'nested')); symlinkSync(outside, join(root, 'nested/alias'));
      expect(referenceFiles(join(root, 'nested/alias'), root)).toEqual([]);
    } finally { rmSync(outside, { recursive: true, force: true }); }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('projects JSONL audit keys and excludes raw payloads, secrets and oversized files', () => {
  const root = mkdtempSync(join(tmpdir(), 'tb-jsonl-'));
  try {
    const file = join(root, 'audit.jsonl');
    writeFileSync(file, JSON.stringify({ id: 'par-louvre', mapsName: 'Louvre', checkedAt: '2026-10-20', city: 'paris', trip: 'europa',
      sourceUrl: 'https://www.louvre.fr/', raw: 'SECRET_RAW', confirmation: 'SECRET_CONFIRMATION', email: 'person@example.test' }));
    const snippets = readReference(file, root);
    expect(snippets[0]).toMatchObject({ placeIds: ['par-louvre'], city: 'paris', trip: 'europa', dates: ['2026-10-20'], line: 1 });
    expect(JSON.stringify(snippets)).not.toMatch(/SECRET|person@example/);
    writeFileSync(join(root, 'too-large.txt'), 'x'.repeat(262145));
    expect(referenceFiles(root, root)).toEqual([file]);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('applies privacy redaction to JSONL section and identifier metadata as well as excerpts', () => {
  const root = mkdtempSync(join(tmpdir(), 'tb-jsonl-meta-'));
  try {
    const file = join(root, 'audit.jsonl');
    writeFileSync(file, [
      { id: 'email: PRIVATE_ADDRESS@example.test', notes: 'Public official opening hours apply.', sourceUrl: 'https://www.louvre.fr/visit' },
      { id: 'pin-PRIVATE_ID', placeId: 'password-PRIVATE_PLACE', city: 'senha-PRIVATE_CITY', trip: 'localizador-PRIVATE_TRIP', notes: 'Public transport information remains readable.' },
      { id: 'x'.repeat(101), placeId: 'par-louvre', city: 'paris', trip: 'europa', notes: 'Public Louvre visit information remains readable.' },
    ].map(record => JSON.stringify(record)).join('\n'));
    const snippets = readReference(file, root);
    expect(snippets).toHaveLength(3);
    expect(snippets[0]).toMatchObject({ section: 'audit.jsonl', placeIds: [] });
    expect(snippets[1]).toMatchObject({ section: 'audit.jsonl', placeIds: [] });
    expect(snippets[1]).not.toHaveProperty('city'); expect(snippets[1]).not.toHaveProperty('trip');
    expect(snippets[2]).toMatchObject({ section: 'par-louvre', placeIds: ['par-louvre'], city: 'paris', trip: 'europa' });
    expect(JSON.stringify(snippets)).not.toContain('PRIVATE_');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

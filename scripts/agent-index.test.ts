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

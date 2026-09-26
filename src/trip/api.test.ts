import { describe, expect, it } from 'vitest';
import { applyTripPatch, parseTripRequest, readTripPatch, tripIdFromPath } from './api';

const day = [
  '### Dia 1',
  '',
  '- 09:00 [Louvre](place:par-louvre) — Ingresso',
  '  - via: metrô · 20 min',
  '  - comentário: trocar',
  '- 12:00 [Almoço](place:par-x)',
  '',
].join('\n');

describe('applyTripPatch', () => {
  const louvre = '- 09:00 [Louvre](place:par-louvre) — Ingresso';

  it('replaces the lines where the browser saw them', () => {
    const out = applyTripPatch(day, { line: 3, before: [louvre], after: [`${louvre} das 9h`] });
    expect(out?.line).toBe(3);
    expect(out?.raw.split('\n')[2]).toBe(`${louvre} das 9h`);
    expect(out?.raw.split('\n')[3]).toBe('  - via: metrô · 20 min');
  });

  it('follows the lines after an edit above them moved the file', () => {
    const moved = `# Europa\n\n${day}`;
    const out = applyTripPatch(moved, { line: 6, before: ['- 12:00 [Almoço](place:par-x)'], after: ['- 12:30 [Almoço](place:par-x)'] });
    expect(out?.line).toBe(8);
    expect(out?.raw).toContain('- 12:30 [Almoço](place:par-x)');
  });

  it('refuses lines that changed or repeat', () => {
    expect(applyTripPatch(day, { line: 3, before: ['- 09:00 [Louvre](place:par-louvre) — Outra'], after: [] })).toBeNull();
    const twice = `${day}- 12:00 [Almoço](place:par-x)\n`;
    expect(applyTripPatch(twice, { line: 2, before: ['- 12:00 [Almoço](place:par-x)'], after: [] })).toBeNull();
  });

  it('deletes a bullet with its indented lines, and one indented line alone', () => {
    const gone = applyTripPatch(day, { line: 3, before: [louvre], after: [] });
    expect(gone?.raw).toBe(['### Dia 1', '', '- 12:00 [Almoço](place:par-x)', ''].join('\n'));
    const comment = applyTripPatch(day, { line: 5, before: ['  - comentário: trocar'], after: [] });
    expect(comment?.raw).not.toContain('comentário');
    expect(comment?.raw).toContain('  - via: metrô · 20 min');
    const paragraph = applyTripPatch('### Dia 1\n\nNarrativa.\n\n- 09:00 [Louvre](place:par-louvre)\n', {
      line: 3,
      before: ['Narrativa.'],
      after: [],
    });
    expect(paragraph?.raw).toBe('### Dia 1\n\n- 09:00 [Louvre](place:par-louvre)\n');
  });

  it('adds a child after the indented lines and keeps CRLF', () => {
    const out = applyTripPatch(day.replaceAll('\n', '\r\n'), { line: 3, before: [louvre], child: ['  - comentário: mais cedo'] });
    expect(out?.line).toBe(6);
    expect(out?.raw.split('\r\n').slice(3, 7)).toEqual([
      '  - via: metrô · 20 min',
      '  - comentário: trocar',
      '  - comentário: mais cedo',
      '- 12:00 [Almoço](place:par-x)',
    ]);
  });

  it('swaps every line of a note with hard breaks and keeps what is under it', () => {
    const broken = day.replace(louvre, `${louvre}\\\n  das 9h`);
    const out = applyTripPatch(broken, { line: 3, before: [`${louvre}\\`, '  das 9h'], after: [louvre] });
    expect(out?.raw).toBe(day);
    const paragraph = 'Linha um\\\nlinha dois\n\n- 09:00 [Louvre](place:par-louvre)\n';
    expect(applyTripPatch(paragraph, { line: 1, before: ['Linha um\\', 'linha dois'], after: [] })?.raw).toBe(
      '- 09:00 [Louvre](place:par-louvre)\n',
    );
  });
});

describe('readTripPatch', () => {
  it('keeps one patch of single-line strings', () => {
    expect(readTripPatch({ line: 3, before: ['a'], after: ['b'] })).toEqual({ line: 3, before: ['a'], after: ['b'] });
    expect(readTripPatch({ line: 3, before: ['a', 'b'], child: ['c'] })).toEqual({ line: 3, before: ['a', 'b'], child: ['c'] });
  });

  it('rejects a new line, an empty anchor, a bad line or two operations', () => {
    expect(readTripPatch({ line: 3, before: ['a'], after: ['b\n## Roma'] })).toBeNull();
    expect(readTripPatch({ line: 3, before: ['  '], after: [] })).toBeNull();
    expect(readTripPatch({ line: 3, before: 'a', after: [] })).toBeNull();
    expect(readTripPatch({ line: 0, before: ['a'], after: [] })).toBeNull();
    expect(readTripPatch({ line: 3, before: ['a'], after: [], child: ['b'] })).toBeNull();
    expect(readTripPatch({ line: 3, before: ['a'], child: [] })).toBeNull();
    expect(readTripPatch('line=3')).toBeNull();
  });
});

describe('parseTripRequest', () => {
  it('reads the collection and one id, from either url shape', () => {
    expect(parseTripRequest('/')).toBe('list');
    expect(parseTripRequest('')).toBe('list');
    expect(parseTripRequest('/europa')).toBe('europa');
    expect(parseTripRequest('/api/trips/europa?t=1')).toBe('europa');
    expect(parseTripRequest('/api/trips')).toBe('list');
  });

  it('rejects paths that are not a single trip id', () => {
    expect(parseTripRequest('/../secret')).toBeNull();
    expect(parseTripRequest('/europa/extra')).toBeNull();
    expect(parseTripRequest('/europa.md')).toBeNull();
    expect(parseTripRequest('/%2e%2e')).toBeNull();
  });
});

describe('tripIdFromPath', () => {
  it('reads the id from a trips markdown path and ignores the rest', () => {
    expect(tripIdFromPath('/repo/content/trips/europa.md')).toBe('europa');
    expect(tripIdFromPath('C:\\repo\\content\\trips\\europa.md')).toBe('europa');
    expect(tripIdFromPath('/repo/content/trips/.draft.md')).toBeNull();
    expect(tripIdFromPath('/repo/src/main.ts')).toBeNull();
  });
});

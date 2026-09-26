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
  it('replaces the line where the browser saw it', () => {
    const out = applyTripPatch(day, {
      line: 3,
      before: '- 09:00 [Louvre](place:par-louvre) — Ingresso',
      after: ['- 09:00 [Louvre](place:par-louvre) — Ingresso das 9h'],
    });
    expect(out?.line).toBe(3);
    expect(out?.raw.split('\n')[2]).toBe('- 09:00 [Louvre](place:par-louvre) — Ingresso das 9h');
    expect(out?.raw.split('\n')[3]).toBe('  - via: metrô · 20 min');
  });

  it('follows the line after an edit above it moved the file', () => {
    const moved = `# Europa\n\n${day}`;
    const out = applyTripPatch(moved, { line: 6, before: '- 12:00 [Almoço](place:par-x)', after: ['- 12:30 [Almoço](place:par-x)'] });
    expect(out?.line).toBe(8);
    expect(out?.raw).toContain('- 12:30 [Almoço](place:par-x)');
  });

  it('refuses a line that changed or repeats', () => {
    expect(applyTripPatch(day, { line: 3, before: '- 09:00 [Louvre](place:par-louvre) — Outra', after: [] })).toBeNull();
    const twice = `${day}- 12:00 [Almoço](place:par-x)\n`;
    expect(applyTripPatch(twice, { line: 2, before: '- 12:00 [Almoço](place:par-x)', after: [] })).toBeNull();
  });

  it('deletes a bullet with its indented lines, and one indented line alone', () => {
    const gone = applyTripPatch(day, { line: 3, before: '- 09:00 [Louvre](place:par-louvre) — Ingresso', after: [] });
    expect(gone?.raw).toBe(['### Dia 1', '', '- 12:00 [Almoço](place:par-x)', ''].join('\n'));
    const comment = applyTripPatch(day, { line: 5, before: '  - comentário: trocar', after: [] });
    expect(comment?.raw).not.toContain('comentário');
    expect(comment?.raw).toContain('  - via: metrô · 20 min');
  });

  it('adds a child after the indented lines and keeps CRLF', () => {
    const out = applyTripPatch(day.replaceAll('\n', '\r\n'), {
      line: 3,
      before: '- 09:00 [Louvre](place:par-louvre) — Ingresso',
      child: '  - comentário: mais cedo',
    });
    expect(out?.line).toBe(6);
    expect(out?.raw.split('\r\n').slice(3, 7)).toEqual([
      '  - via: metrô · 20 min',
      '  - comentário: trocar',
      '  - comentário: mais cedo',
      '- 12:00 [Almoço](place:par-x)',
    ]);
  });
});

describe('readTripPatch', () => {
  it('keeps one patch of single-line strings', () => {
    expect(readTripPatch({ line: 3, before: 'a', after: ['b'] })).toEqual({ line: 3, before: 'a', after: ['b'] });
    expect(readTripPatch({ line: 3, before: 'a', child: 'b' })).toEqual({ line: 3, before: 'a', child: 'b' });
  });

  it('rejects a new line, an empty anchor, a bad line or two operations', () => {
    expect(readTripPatch({ line: 3, before: 'a', after: ['b\n## Roma'] })).toBeNull();
    expect(readTripPatch({ line: 3, before: '  ', after: [] })).toBeNull();
    expect(readTripPatch({ line: 0, before: 'a', after: [] })).toBeNull();
    expect(readTripPatch({ line: 3, before: 'a', after: [], child: 'b' })).toBeNull();
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

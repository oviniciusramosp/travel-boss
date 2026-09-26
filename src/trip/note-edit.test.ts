import { describe, expect, it } from 'vitest';
import { noteLine } from './note-edit';

describe('noteLine', () => {
  it('rewrites only the note of a stop and keeps bullet, time and link', () => {
    const stop = '- 11:55 [CDG](place:par-cdg) — Pouso no T2';
    expect(noteLine('stop', stop, 'Pouso no **2E**')).toEqual(['- 11:55 [CDG](place:par-cdg) — Pouso no **2E**']);
    expect(noteLine('stop', '- [Joy 124](place:mil-joy124) - Malas', 'Check-in')).toEqual([
      '- [Joy 124](place:mil-joy124) — Check-in',
    ]);
    expect(noteLine('stop', stop, '  ')).toEqual(['- 11:55 [CDG](place:par-cdg)']);
  });

  it('keeps the time of a list note and the indent of a comment', () => {
    expect(noteLine('item', '- 15:05 Lugar na Main Street', 'Lugar no castelo')).toEqual(['- 15:05 Lugar no castelo']);
    expect(noteLine('comment', '  - comentário: trocar', 'mais cedo')).toEqual(['  - comentário: mais cedo']);
    expect(noteLine('paragraph', 'Um dia a pé.', 'Dois dias a pé.')).toEqual(['Dois dias a pé.']);
  });

  it('turns line breaks into spaces, and an empty note into no line', () => {
    expect(noteLine('paragraph', 'Texto', 'linha um\n\nlinha dois\n')).toEqual(['linha um linha dois']);
    expect(noteLine('item', '- Opcional: Avengers', '')).toEqual([]);
    expect(noteLine('comment', '  - comentário: ok', ' \n ')).toEqual([]);
  });

  it('refuses a line that lost its shape', () => {
    expect(noteLine('stop', '- 11:55 CDG sem link', 'x')).toBeNull();
    expect(noteLine('comment', '- comentário: fora do item', 'x')).toBeNull();
  });
});

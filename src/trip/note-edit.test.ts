import { describe, expect, it } from 'vitest';
import { noteBlock, noteLines } from './note-edit';

describe('noteLines', () => {
  it('rewrites only the note of a stop and keeps bullet, time and link', () => {
    const stop = '- 11:55 [CDG](place:par-cdg) — Pouso no T2';
    expect(noteLines('stop', stop, 'Pouso no **2E**')).toEqual(['- 11:55 [CDG](place:par-cdg) — Pouso no **2E**']);
    expect(noteLines('stop', '- [Joy 124](place:mil-joy124) - Malas', 'Check-in')).toEqual([
      '- [Joy 124](place:mil-joy124) — Check-in',
    ]);
    expect(noteLines('stop', stop, '  ')).toEqual(['- 11:55 [CDG](place:par-cdg)']);
  });

  it('keeps the time of a list note and the indent of a comment', () => {
    expect(noteLines('item', '- 15:05 Lugar na Main Street', 'Lugar no castelo')).toEqual(['- 15:05 Lugar no castelo']);
    expect(noteLines('comment', '  - comentário: trocar', 'mais cedo')).toEqual(['  - comentário: mais cedo']);
    expect(noteLines('paragraph', 'Um dia a pé.', 'Dois dias a pé.')).toEqual(['Dois dias a pé.']);
  });

  it('writes a break as a hard break, indented under the bullet, without blank lines', () => {
    expect(noteLines('stop', '- 11:55 [CDG](place:par-cdg) — Pouso', 'Pouso no 2E.\n\n Malas: ~1h. \n')).toEqual([
      '- 11:55 [CDG](place:par-cdg) — Pouso no 2E.\\',
      '  Malas: ~1h.',
    ]);
    expect(noteLines('comment', '  - comentário: x', 'um\ndois')).toEqual(['  - comentário: um\\', '    dois']);
    expect(noteLines('paragraph', 'x', 'um\ndois\ntrês')).toEqual(['um\\', 'dois\\', 'três']);
  });

  it('turns an empty note into no line', () => {
    expect(noteLines('item', '- Opcional: Avengers', '')).toEqual([]);
    expect(noteLines('comment', '  - comentário: ok', ' \n ')).toEqual([]);
  });

  it('refuses a line that lost its shape', () => {
    expect(noteLines('stop', '- 11:55 CDG sem link', 'x')).toBeNull();
    expect(noteLines('comment', '- comentário: fora do item', 'x')).toBeNull();
  });
});

describe('noteBlock', () => {
  const lines = ['- 09:00 [Louvre](place:par-louvre) — um\\', '  dois\\', '  três', '  - via: a pé · 5 min', 'Fim.'];

  it('takes the lines a trailing backslash carries the note on to, and stops there', () => {
    expect(noteBlock(lines, 1)).toEqual(lines.slice(0, 3));
    expect(noteBlock(lines, 5)).toEqual(['Fim.']);
    expect(noteBlock(['Linha\\', ''], 1)).toEqual(['Linha\\']);
  });
});

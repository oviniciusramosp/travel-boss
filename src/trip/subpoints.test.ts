import { describe, expect, it } from 'vitest';
import { attachSubPointNotes, matchSubPoint, noteTitle, stripNoteTitle } from './subpoints';

const subs = [
  { name: { en: 'Spider-Man W.E.B. Adventure', 'pt-BR': 'Spider-Man W.E.B. Adventure' } },
  { name: { en: 'Ratatouille: The Adventure', 'pt-BR': 'Ratatouille: A Aventura' } },
  { name: { en: 'Frozen Ever After', 'pt-BR': 'Frozen Ever After' } },
  { name: { en: 'Pirates of the Caribbean', 'pt-BR': 'Piratas do Caribe' } },
  { name: { en: 'Phantom Manor', 'pt-BR': 'Phantom Manor' } },
];

describe('noteTitle', () => {
  it('reads the opening bold, else the text before the dash', () => {
    expect(noteTitle('**Ratatouille** — Simulador 3D sem trilho')).toBe('Ratatouille');
    expect(noteTitle('Frozen Ever After — Barco de ~5 min')).toBe('Frozen Ever After');
    expect(noteTitle('Opcional, ao lado: **Avengers Assemble**, a montanha-russa')).toBe('Opcional, ao lado: **Avengers Assemble**, a montanha-russa');
  });
});

describe('stripNoteTitle', () => {
  it('drops the opening bold name and its dash, keeping the rest of the marks', () => {
    expect(stripNoteTitle('**Ratatouille** — Simulador 3D **sem trilho**')).toBe('Simulador 3D **sem trilho**');
    expect(stripNoteTitle('**Casa de Coco** **Jantar**: burrito')).toBe('**Jantar**: burrito');
    expect(stripNoteTitle('Frozen Ever After — Barco')).toBe('Frozen Ever After — Barco');
  });
});

describe('matchSubPoint', () => {
  it('matches the bold name in either language, accents and case aside', () => {
    expect(matchSubPoint('**Spider-Man W.E.B. Adventure** — **Primeira atração**: simulador', subs)).toBe(0);
    expect(matchSubPoint('**Ratatouille** — Simulador 3D', subs)).toBe(1);
    expect(matchSubPoint('**ratatouille: a aventura** — fila', subs)).toBe(1);
    expect(matchSubPoint('**Piratas do Caribe** — ~20 min de fila', subs)).toBe(3);
    expect(matchSubPoint('Phantom Manor — ~15 min', subs)).toBe(4);
  });
  it('leaves notes that only mention a point, or name something else', () => {
    expect(matchSubPoint('Opcional, ao lado: **Avengers Assemble: Flight Force**, a montanha-russa', subs)).toBeNull();
    expect(matchSubPoint('Piratas e Phantom Manor de novo, com fila curta', subs)).toBeNull();
    expect(matchSubPoint('**Pizzeria Bella Notte** — **Almoço** depois do pico', subs)).toBeNull();
    expect(matchSubPoint('', subs)).toBeNull();
  });
});

describe('attachSubPointNotes', () => {
  it('splits the notes under a park into attached and loose, keeping the order', () => {
    const notes = [
      { label: '**Spider-Man W.E.B. Adventure** — primeira', line: 10 },
      { label: 'Opcional, ao lado: **Avengers Assemble**', line: 11 },
      { label: '**Ratatouille** — simulador', line: 12 },
    ];
    const { attached, loose } = attachSubPointNotes(notes, subs);
    expect(attached.map((item) => [item.sub, item.note.line])).toEqual([[0, 10], [1, 12]]);
    expect(loose.map((note) => note.line)).toEqual([11]);
  });
});

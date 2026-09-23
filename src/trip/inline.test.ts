import { describe, expect, it } from 'vitest';
import { inline, inlineWithLinks, parseInline } from './inline';

describe('inline markdown', () => {
  it('renders bold and italic and escapes html', () => {
    expect(inline('**b** e *i*')).toBe('<strong>b</strong> e <em>i</em>');
    expect(inline('**<b>**')).toBe('<strong>&lt;b&gt;</strong>');
    expect(inline('sem *fechar')).toBe('sem *fechar');
  });

  it('keeps links as text when only emphasis is asked', () => {
    expect(inline('[x](https://ex.test)')).toBe('[x](https://ex.test)');
  });

  it('links https and place ids, and leaves an unknown place as text', () => {
    expect(inlineWithLinks('veja [x](https://ex.test/a) e *i*')).toBe(
      'veja <a href="https://ex.test/a">x</a> e <em>i</em>',
    );
    expect(inlineWithLinks('[Louvre](place:par-louvre)')).toBe('Louvre');
    expect(
      inlineWithLinks('[Louvre](place:par-louvre)', (id) => `https://maps.example/${id}`),
    ).toBe('<a href="https://maps.example/par-louvre">Louvre</a>');
    expect(parseInline('[x](place:par-louvre)')).toEqual([
      { type: 'place', id: 'par-louvre', children: [{ type: 'text', text: 'x' }] },
    ]);
  });
});

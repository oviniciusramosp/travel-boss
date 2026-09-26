import { describe, expect, it } from 'vitest';
import { inline, inlineWithLinks, markSpans, parseInline } from './inline';

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

/** Each span as text with its look: `b` strong, `i` em, `m` mark. */
function looks(value: string): string[] {
  return markSpans(value).map(
    (span) => `${span.strong ? 'b' : ''}${span.em ? 'i' : ''}${span.mark ? 'm' : ''}:${span.text}`,
  );
}

describe('markSpans', () => {
  it('keeps every character, marks included', () => {
    for (const value of ['a **b *c* d** e', '**abc*', 'sem *fechar', '[**x**](place:par-louvre) e *y*', 'um\n**dois**']) {
      expect(markSpans(value).map((span) => span.text).join('')).toBe(value);
    }
  });

  it('shows bold and italic between their marks, nested the way they render', () => {
    expect(looks('a **b *c* d** e')).toEqual([':a ', 'm:**', 'b:b ', 'bm:*', 'bi:c', 'bm:*', 'b: d', 'm:**', ': e']);
    // Same as parseInline: an unclosed ** is text, and the * after it opens italic.
    expect(looks('**abc*')).toEqual([':*', 'm:*', 'i:abc', 'm:*']);
    expect(inline('**abc*')).toBe('*<em>abc</em>');
  });

  it('keeps the link syntax as marks, with emphasis in the label', () => {
    expect(looks('ver [**Louvre**](place:par-louvre)')).toEqual([
      ':ver ',
      'm:[',
      'm:**',
      'b:Louvre',
      'm:**',
      'm:](place:par-louvre)',
    ]);
  });
});

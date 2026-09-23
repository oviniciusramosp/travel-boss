import { describe, expect, it } from 'vitest';
import { formatRating, ratingAria, ratingSummary, starParts } from './rating';

describe('star rating', () => {
  it('uses a half star from .5 and keeps the rest empty', () => {
    expect(starParts(4.6)).toEqual({ full: 4, half: true, empty: 0 });
    expect(starParts(4.4)).toEqual({ full: 4, half: false, empty: 1 });
    expect(starParts(5)).toEqual({ full: 5, half: false, empty: 0 });
    expect(starParts(undefined)).toEqual({ full: 0, half: false, empty: 5 });
  });

  it('formats "-.-" without a score and "x de 5" with one', () => {
    expect(formatRating(undefined, 'pt-BR')).toBe('-.-');
    expect(formatRating(4.6, 'pt-BR')).toBe('4,6');
    expect(formatRating(4.6, 'en')).toBe('4.6');
    expect(ratingAria('Minha', undefined, 'pt-BR')).toBe('Minha: sem nota');
    expect(ratingAria('Minha', 4.6, 'pt-BR')).toBe('Minha: 4,6 de 5');
    expect(ratingSummary(4.6, 4.4, 'pt-BR')).toBe('Minha 4,6 · Google 4,4');
    expect(ratingSummary(undefined, 4.4, 'en')).toBe('Mine -.- · Google 4.4');
  });
});

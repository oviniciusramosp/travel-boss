import { describe, expect, it } from 'vitest';
import { priceAria, priceLevelOf } from './price';

describe('price level', () => {
  it('maps free and the euro bands onto 0–3 filled icons', () => {
    expect(priceLevelOf(null)).toBeNull();
    expect(priceLevelOf({ free: true, min: 40 })).toBe(0);
    expect(priceLevelOf({ min: 0 })).toBe(0);
    expect(priceLevelOf({ min: 15 })).toBe(1);
    expect(priceLevelOf({ min: 16 })).toBe(2);
    expect(priceLevelOf({ max: 39 })).toBe(2);
    expect(priceLevelOf({ min: 40 })).toBe(3);
  });

  it('names the band in the active language', () => {
    expect(priceAria(1, 'Preço / pessoa', 'pt-BR')).toBe('Preço / pessoa: econômico (€1–15)');
    expect(priceAria(3, 'Price / person', 'en')).toBe('Price / person: expensive (€40+)');
  });
});
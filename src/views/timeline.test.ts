import { describe, expect, it } from 'vitest';
import { foodTarget, formatEur, stopCountLabel, sunsetTip, typicalEur } from './timeline';

describe('sunset marker', () => {
  it('reads the planned sunset and its time from Portuguese and English notes', () => {
    expect(sunsetTip('**Pôr do sol às 19h21** no terraço', 'pt-BR')).toBe('Pôr do sol · 19:21');
    expect(sunsetTip('Subida ao topo para ver o pôr do sol às 19h13', 'pt-BR')).toBe('Pôr do sol · 19:13');
    expect(sunsetTip('Sunset at 19:21 on the terrace', 'en')).toBe('Sunset · 19:21');
    expect(sunsetTip('Ver o pôr do sol no gramado', 'pt-BR')).toBe('Pôr do sol');
    expect(sunsetTip('Piquenique no gramado: pôr do sol às 19h21 e brilho às 20h', 'pt-BR')).toBe('Pôr do sol · 19:21');
  });
  it('does not mark ordinary visits, negated plans, or visits before or after sunset', () => {
    for (const text of ['Piquenique às 19h', 'Depois do pôr do sol', 'Antes do pôr do sol', 'Não veremos o pôr do sol', 'After sunset', 'No sunset view']) {
      expect(sunsetTip(text, 'pt-BR')).toBeNull();
    }
  });
});

describe('day header helpers', () => {
  it('labels the stop count', () => {
    expect(stopCountLabel(1, 'pt-BR')).toBe('1 parada');
    expect(stopCountLabel(2, 'en')).toBe('2 stops');
  });

  it('uses the typical euro amount', () => {
    expect(typicalEur({ currency: 'EUR', min: 8, max: 20 })).toBe(8);
    expect(typicalEur({ currency: 'EUR', free: true, min: 8 })).toBe(0);
    expect(typicalEur({ currency: 'USD', min: 8 })).toBe(0);
  });

  it('formats whole euros without cents', () => {
    expect(formatEur(12, 'en')).toContain('12');
    expect(formatEur(12, 'en')).not.toContain('12.00');
  });
});

// The chip's `is-over` class and tip, and the receipt's target line, come from `foodTarget`.
describe('foodTarget', () => {
  // pt-BR writes a no-break space after €.
  const plain = (text: string | undefined) => text?.replace(/\s/g, ' ');

  it('marks the food chip over past the city target, with the tip and the receipt line', () => {
    expect(foodTarget(62, 50, 'en')).toEqual({
      over: true,
      tip: '€62 of €50 per person',
      line: 'Target: €50 · €12 over',
    });
    const pt = foodTarget(62, 50, 'pt-BR');
    expect(pt?.over).toBe(true);
    expect(plain(pt?.tip)).toBe('€ 62 de € 50 por pessoa');
    expect(plain(pt?.line)).toBe('Meta: € 50 · passou € 12');
  });

  it('keeps the chip without the class at or under the target, and says what is left', () => {
    expect(foodTarget(42, 50, 'en')).toEqual({
      over: false,
      tip: '€42 of €50 per person',
      line: 'Target: €50 · €8 left',
    });
    expect(plain(foodTarget(42, 50, 'pt-BR')?.line)).toBe('Meta: € 50 · sobram € 8');
    expect(foodTarget(50, 50, 'en')).toMatchObject({ over: false, line: 'Target: €50 · €0 left' });
  });

  it('leaves the chip and the receipt as they were without a target', () => {
    expect(foodTarget(62, undefined, 'en')).toBeNull();
  });
});

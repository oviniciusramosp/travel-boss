import { describe, expect, it } from 'vitest';
import { formatEur, stopCountLabel, typicalEur } from './timeline';

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

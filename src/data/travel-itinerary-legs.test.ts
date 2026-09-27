import { describe, expect, it } from 'vitest';
import { formatLegDuration } from './travel-itinerary-legs';

describe('formatLegDuration', () => {
  it.each([
    [12, '~12 min'],
    [59, '~59 min'],
    [59.6, '~1h'],
    [60, '~1h'],
    [65, '~1h05'],
    [95, '~1h35'],
    [397, '~6h37'],
  ])('reads %s min as %s in both locales', (min, text) => {
    expect(formatLegDuration(min)).toEqual({ en: text, 'pt-BR': text });
  });
});

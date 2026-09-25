import { describe, expect, it } from 'vitest';
import { aiSuggestionTip } from './ai-badge';

describe('aiSuggestionTip', () => {
  it('names the guide items behind the place, with their tab', () => {
    const tip = aiSuggestionTip('paris', 'par-angelina-rivoli', 'pt-BR');
    expect(tip.startsWith('Sugestão feita por IA com base em: ')).toBe(true);
    expect(tip).toContain('(Mercado)');
    expect(tip).toContain('(Comidas)');
    expect(aiSuggestionTip('paris', 'par-angelina-rivoli', 'en')).toContain('(Market)');
  });

  it('falls back to a plain label when no item points at the place', () => {
    expect(aiSuggestionTip('roma', 'nowhere', 'pt-BR')).toBe('Sugestão feita por IA');
  });
});

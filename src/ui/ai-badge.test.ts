import { describe, expect, it } from 'vitest';
import { aiSuggestionTip } from './ai-badge';

describe('aiSuggestionTip', () => {
  it('names the guide items behind the place, with their tab', () => {
    const tip = aiSuggestionTip('paris', { id: 'par-angelina-rivoli' }, 'pt-BR');
    expect(tip.startsWith('Sugestão feita por IA com base em: ')).toBe(true);
    expect(tip).toContain('(Mercado)');
    expect(tip).toContain('(Comidas)');
    expect(aiSuggestionTip('paris', { id: 'par-angelina-rivoli' }, 'en')).toContain('(Market)');
  });

  it('falls back to a plain label when no item points at the place', () => {
    expect(aiSuggestionTip('roma', { id: 'nowhere' }, 'pt-BR')).toBe('Sugestão feita por IA');
  });

  it('prefers the place’s own reason over the guide', () => {
    const place = { id: 'par-angelina-rivoli', aiReason: { en: 'near the BnF', 'pt-BR': 'perto da BnF' } };
    expect(aiSuggestionTip('paris', place, 'pt-BR')).toBe('Sugestão feita por IA: perto da BnF');
    expect(aiSuggestionTip('paris', place, 'en')).toBe('AI suggestion: near the BnF');
  });
});

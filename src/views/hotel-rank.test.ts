import { describe, expect, it } from 'vitest';
import { clampScore, safetyIsCaution, scoreCard, type ScoreHotel } from './hotel-rank';

const ranked = (patch: Partial<ScoreHotel> = {}): ScoreHotel => ({
  booking: {
    wifiAvailable: true,
    categoryScores: { cleanliness: 9, comfort: 8, facilities: 7, staff: 8.2 },
  },
  ranking: {
    position: 2,
    score: 81.4,
    provisional: false,
    evidenceCoverage: 1,
    missingComponents: [],
    eligibility: { status: 'eligible', failures: [], unknown: [], staffMinimum: 7 },
    region: { name: { en: 'Monti', 'pt-BR': 'Monti' }, safety: 88, coverage: 'polygon' },
    walkingMinutes: 18,
    walkingCoverage: 1,
    reachableWithin30: 4,
    beyond90: 0,
    pointCount: 4,
  },
  ...patch,
});

describe('score ring', () => {
  it('rounds into 0–100 and keeps a missing score empty', () => {
    expect(clampScore(81.4)).toBe(81);
    expect(clampScore(140)).toBe(100);
    expect(clampScore(null)).toBeNull();
  });

  it('headlines a final position, a provisional score, or an ineligible stay', () => {
    expect(scoreCard('pt-BR', ranked())?.title).toBe('#2 para nosso roteiro');
    expect(scoreCard('en', ranked())?.score).toBe(81);
    const provisional = ranked();
    provisional.ranking!.provisional = true;
    provisional.ranking!.evidenceCoverage = 0.5;
    provisional.ranking!.missingComponents = ['safety'];
    expect(scoreCard('pt-BR', provisional)?.title).toBe('Nota provisória');
    expect(scoreCard('pt-BR', provisional)?.coverage).toContain('Faltam: segurança do bairro');
    const excluded = ranked();
    excluded.ranking!.eligibility = {
      status: 'excluded',
      failures: ['wifi', 'staff'],
      unknown: [],
      staffMinimum: 7,
    };
    expect(scoreCard('en', excluded)?.title).toBe('Not eligible');
    expect(scoreCard('pt-BR', excluded)?.requirementNote).toContain('sem Wi-Fi');
    expect(scoreCard('pt-BR', { booking: {} })).toBeNull();
  });

  it('alerts when editorial safety is below 70 and skips category bars for Airbnb', () => {
    expect(safetyIsCaution(69)).toBe(true);
    expect(safetyIsCaution(70)).toBe(false);
    const low = ranked();
    low.ranking!.region = { name: { en: 'Termini', 'pt-BR': 'Termini' }, safety: 48, coverage: 'polygon' };
    expect(scoreCard('pt-BR', low)?.safety).toEqual({
      text: 'Termini · segurança editorial 48/100',
      caution: true,
    });
    const airbnb = ranked({ source: 'airbnb', locationApproximate: true });
    const card = scoreCard('en', airbnb);
    expect(card?.bars).toEqual([]);
    expect(card?.staff).toBe('Staff: not applicable');
    expect(card?.safety.caution).toBe(false);
    expect(card?.safety.text).toMatch(/not scored/);
  });
});

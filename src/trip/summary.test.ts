import { describe, expect, it } from 'vitest';
import { formatSpan, nightsBetween } from './dates';
import { parseTrip } from './parse';
import { formatTripSummary } from './summary';

const europa = `# Europa

## Paris
city: paris
dates: 2026-04-02 → 2026-04-06

### Dia 1 — Chegada

- 09:00 [Orly](place:par-ory)

## Milão
city: milao
dates: 2026-04-06 → 2026-04-09

### Dia 1 — Centro

- 17:00 [Duomo](place:mil-duomo)

## Roma
city: roma
dates: 2026-04-09 → 2026-04-13

### Dia 1 — Centro

- 09:30 [Coliseu](place:rom-colosseum)
`;

describe('formatTripSummary', () => {
  const trip = parseTrip('europa', 'content/trips/europa.md', europa);

  it('joins the cities with the span of nights and the short dates', () => {
    expect(formatTripSummary(trip, 'pt-BR')).toBe('Paris → Milão → Roma · 11 noites · 2–13 abr');
    expect(formatTripSummary(trip, 'en')).toBe('Paris → Milão → Roma · 11 nights · 2–13 Apr');
  });

  it('drops nights and dates when no city has a range', () => {
    const bare = parseTrip('europa', 'content/trips/europa.md', '# Europa\n\n## Paris\ncity: paris\n');
    expect(formatTripSummary(bare, 'pt-BR')).toBe('Paris');
  });

  it('counts one night and a single day on their own', () => {
    const one = parseTrip(
      'europa',
      'content/trips/europa.md',
      '# Europa\n\n## Paris\ncity: paris\ndates: 2026-04-02 → 2026-04-03\n',
    );
    expect(formatTripSummary(one, 'pt-BR')).toBe('Paris · 1 noite · 2–3 abr');
    expect(nightsBetween('2026-04-02', '2026-04-02')).toBe(0);
    expect(formatSpan('2026-04-02', '2026-04-02', 'pt-BR')).toBe('2 abr');
    expect(formatSpan('2026-04-28', '2026-05-02', 'pt-BR')).toBe('28 abr–2 mai');
    expect(formatSpan('2026-12-30', '2027-01-02', 'en')).toBe('30 Dec 2026–2 Jan 2027');
    expect(nightsBetween('2026-02-31', '2026-03-02')).toBeNull();
  });
});

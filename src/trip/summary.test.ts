import { describe, expect, it } from 'vitest';
import { formatSpan, nightsBetween } from './dates';
import { parseTrip } from './parse';
import { cityBands, formatTripNavLabel, formatTripPanelTitle, formatTripSummary } from './summary';

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

  it('puts nights and short dates on the line above the cities', () => {
    expect(formatTripSummary(trip, 'pt-BR')).toBe('11 noites · 2–13 abr\nParis → Milão → Roma');
    expect(formatTripSummary(trip, 'en')).toBe('11 nights · 2–13 Apr\nParis → Milão → Roma');
  });

  it('labels the trip list with the title and the start month', () => {
    expect(formatTripNavLabel(trip, 'en')).toBe('Europa Apr 2026');
    expect(formatTripNavLabel(trip, 'pt-BR')).toBe('Europa Abr 2026');
    expect(formatTripPanelTitle(trip, 'en')).toBe('Europe Apr 2026');
    expect(formatTripPanelTitle(trip, 'pt-BR')).toBe('Europa Abr 2026');
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
    expect(formatTripSummary(one, 'pt-BR')).toBe('1 noite · 2–3 abr\nParis');
    expect(nightsBetween('2026-04-02', '2026-04-02')).toBe(0);
    expect(formatSpan('2026-04-02', '2026-04-02', 'pt-BR')).toBe('2 abr');
    expect(formatSpan('2026-04-28', '2026-05-02', 'pt-BR')).toBe('28 abr–2 mai');
    expect(formatSpan('2026-12-30', '2027-01-02', 'en')).toBe('30 Dec 2026–2 Jan 2027');
    expect(nightsBetween('2026-02-31', '2026-03-02')).toBeNull();
  });
});

describe('cityBands', () => {
  const trip = parseTrip('europa', 'content/trips/europa.md', europa);

  it('gives each city a share equal to its nights', () => {
    const bands = cityBands(trip, 'pt-BR');
    expect(bands.map((band) => [band.name, band.grow, band.dates])).toEqual([
      ['Paris', 4, '2–6 abr'],
      ['Milão', 3, '6–9 abr'],
      ['Roma', 4, '9–13 abr'],
    ]);
    expect(bands[0]?.tip).toBe('Paris · 2–6 abr · 4 noites');
    expect(cityBands(trip, 'en')[2]?.dates).toBe('9–13 Apr');
  });

  it('keeps an undated city visible with one share', () => {
    const trip = parseTrip(
      'europa',
      'content/trips/europa.md',
      '# Europa\n\n## Paris\ncity: paris\ndates: 2026-04-02 → 2026-04-06\n\n## Roma\ncity: roma\n',
    );
    const bands = cityBands(trip, 'en');
    expect(bands.map((band) => band.grow)).toEqual([4, 1]);
    expect(bands[1]?.dates).toBeNull();
    expect(bands[1]?.tip).toBe('Roma');
    expect(bands[0]?.via).toBeNull();
  });

  it('adds the departure via to the city you leave', () => {
    const trip = parseTrip(
      'europa',
      'content/trips/europa.md',
      `# Europa

## Paris
city: paris
dates: 2026-04-02 → 2026-04-06
via: trem Frecciarossa · 3h10

## Milão
city: milao
dates: 2026-04-06 → 2026-04-09
`,
    );
    const [paris, milan] = cityBands(trip, 'pt-BR');
    expect(paris?.via).toBe('trem Frecciarossa · 3h10');
    expect(paris?.viaMode).toBe('transit');
    expect(paris?.tip).toBe('Paris · 2–6 abr · 4 noites · trem Frecciarossa · 3h10');
    expect(milan?.via).toBeNull();
  });
});

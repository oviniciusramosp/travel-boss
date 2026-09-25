import { describe, expect, it } from 'vitest';
import { daysOnDate, nearestTripDate, tripDates } from './calendar';
import { formatDayTitle } from './dates';
import { parseTrip } from './parse';

const europa = `# Europa

## Paris
city: paris
dates: 2026-10-02 → 2026-10-06

### Dia 1 — Dom 4/10 · Chegada
- 09:00 [Orly](place:par-ory)

### Dia 8 — Dom 11/10 · Partida para Milão
- 06:50 [Paris Gare de Lyon](place:par-gare-de-lyon)

## Milão
city: milao
dates: 2026-10-06 → 2026-10-09

### Dia 1 — Chegada, Duomo e Galleria
- 14:10 [Milano Centrale](place:mil-centrale)

## Roma
city: roma
dates: 2026-10-09 → 2026-10-13

### Dia 1 — Centro
- 09:30 [Coliseu](place:rom-colosseum)
`;

describe('trip dates', () => {
  const trip = parseTrip('europa', 'content/trips/europa.md', europa);

  it('puts Paris and Milan on the departure day named in the title', () => {
    expect(daysOnDate(trip, '2026-10-11').map((day) => day.city.slug)).toEqual(['paris', 'milao']);
    expect(daysOnDate(trip, '2026-10-04').map((day) => day.day.title)).toEqual(['Dia 1 — Dom 4/10 · Chegada']);
  });

  it('titles the day card as DD MMM • DOW', () => {
    expect(formatDayTitle('2026-10-04', 'en')).toBe('04 Oct • Sun');
    expect(formatDayTitle('2026-10-06', 'pt-BR')).toBe('06 Out • Ter');
    expect(formatDayTitle('2026-10-10', 'pt-BR')).toBe('10 Out • Sáb');
    expect(formatDayTitle('2026-02-31', 'en')).toBe('2026-02-31');
  });

  it('frames the nearest authored date, preferring the later day on a tie', () => {
    const dates = tripDates(trip).map((section) => section.date);
    expect(dates).toEqual(['2026-10-04', '2026-10-11', '2026-10-12']);
    expect(nearestTripDate(dates, '2026-09-23')).toBe('2026-10-04');
    expect(nearestTripDate(dates, '2026-12-01')).toBe('2026-10-12');
    expect(nearestTripDate(['2026-10-04', '2026-10-12'], '2026-10-08')).toBe('2026-10-12');
  });
});

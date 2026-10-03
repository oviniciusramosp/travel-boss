import { describe, expect, it } from 'vitest';
import { dateBudget } from './day-plan';
import { stopFingerprint } from './diff';
import { dayToMarkdown } from './export';
import { parseTrip } from './parse';

const parse = (body: string) => parseTrip('test', 'test.md', `# Test\n## Roma\ncity: roma\n### Dia 1\n${body}`);
const stop = '- [Coliseu](place:rom-colosseum)';

describe('admission paid in the itinerary', () => {
  it('round-trips a paid bundle and included entries independently from food', () => {
    const trip = parse(`${stop}\n  - ingresso: €41,63\n  - comida: €10\n- [Fórum](place:rom-forum)\n  - ingresso: €0`);
    const day = trip.cities[0]!.days[0]!;
    expect(trip.errors).toEqual([]);
    expect(day.stops).toHaveLength(2);
    expect(day.notes).toEqual([]);
    expect(day.stops.map(s => s.ticketEur)).toEqual([41.63, 0]);
    expect(day.stops[0]!.foodEur).toBe(10);
    const exported = dayToMarkdown(day, id => `place:${id}`);
    const restored = parse(exported.split('\n').slice(1).join('\n'));
    expect(restored.cities[0]!.days[0]!.stops.map(s => s.ticketEur)).toEqual([41.63, 0]);
    expect(stopFingerprint(day.stops[0]!)).not.toBe(stopFingerprint({ ...day.stops[0]!, ticketEur: 20 }));
  });

  it.each(['€-1', '€15–20', '€30,555', '30', ''])('rejects invalid admission amount %s', amount => {
    expect(parse(`${stop}\n  - ingresso: ${amount}`).errors.map(e => e.code)).toContain('ticket-invalid');
  });

  it('rejects admissions on notes and duplicate amounts without losing the first amount', () => {
    for (const body of ['  - ingresso: €10', '- Nota\n  - ingresso: €10', '- [Site](https://example.com)\n  - ingresso: €10']) {
      expect(parse(body).errors.map(e => e.code)).toContain('ticket-invalid');
    }
    const trip = parse(`${stop}\n  - ingresso: €0\n  - ingresso: €30`);
    expect(trip.errors.map(e => e.code)).toContain('ticket-invalid');
    expect(trip.cities[0]!.days[0]!.stops[0]!.ticketEur).toBe(0);
  });

  it('counts a bundle once, removes included admission and keeps food and catalog prices intact', () => {
    const places = [
      { id: 'colosseum', visit: { ticket: { currency: 'EUR' as const, min: 20 } } },
      { id: 'forum', visit: { ticket: { currency: 'EUR' as const, min: 17 }, avgPricePerPerson: { currency: 'EUR' as const, min: 12 } } },
      { id: 'locker' }, { id: 'locker' },
    ];
    const overrides = new Map([['colosseum', 41.63], ['forum', 0], ['locker', 10]]);
    const result = dateBudget(places, [], new Set(['colosseum']), new Set(), new Map(), overrides);
    expect(result.ticket).toBe(51.63);
    expect(result.food).toBe(12);
    expect(result.lines).toEqual([
      { id: 'colosseum', ticket: 41.63, food: 0 },
      { id: 'forum', ticket: 0, food: 12 },
      { id: 'locker', ticket: 10, food: 0 },
    ]);
    expect(dateBudget(places).ticket).toBe(37);
    expect(places[0]!.visit!.ticket.min).toBe(20);
  });
});

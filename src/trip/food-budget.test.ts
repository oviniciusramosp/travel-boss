import { describe, expect, it } from 'vitest';
import { dateBudget } from './day-plan';
import { stopFingerprint } from './diff';
import { dayToMarkdown } from './export';
import { parseTrip } from './parse';

const parse = (body: string) => parseTrip('test', 'test.md', `# Test\n## Paris\ncity: paris\n### Dia 1\n${body}`);
const stop = '- [Cédric](place:par-cedric-grolet-meurice)';

describe('planned food spending in the itinerary', () => {
  it('parses and exports cents without turning the amount into a stop or note', () => {
    const trip = parse(`${stop}\n  - comida: €30,50`);
    const day = trip.cities[0]!.days[0]!;
    expect(trip.errors).toEqual([]);
    expect(day.stops).toHaveLength(1);
    expect(day.notes).toEqual([]);
    expect(day.stops[0]!.foodEur).toBe(30.5);
    expect(dayToMarkdown(day, (id) => `place:${id}`)).toContain('  - comida: €30,50');
    expect(parse(dayToMarkdown(day, (id) => `place:${id}`).split('\n').slice(1).join('\n')).cities[0]!.days[0]!.stops[0]!.foodEur).toBe(30.5);
    expect(stopFingerprint(day.stops[0]!)).not.toBe(stopFingerprint({ ...day.stops[0]!, foodEur: 30 }));
  });

  it.each(['€-1', '€15–20', '€30,555', '30', ''])('rejects invalid amount %s', (amount) => {
    expect(parse(`${stop}\n  - comida: ${amount}`).errors.map((e) => e.code)).toContain('food-invalid');
  });

  it('rejects missing catalog stops and duplicates, preserving the first value', () => {
    for (const body of ['  - comida: €10', '- Nota\n  - comida: €10', '- [Site](https://example.com)\n  - comida: €10']) {
      expect(parse(body).errors.map((e) => e.code)).toContain('food-invalid');
    }
    const trip = parse(`${stop}\n  - comida: €0\n  - comida: €30`);
    expect(trip.errors.map((e) => e.code)).toContain('food-invalid');
    expect(trip.cities[0]!.days[0]!.stops[0]!.foodEur).toBe(0);
  });

  it('replaces food only, includes missing catalog prices and counts each place once', () => {
    const places = [
      { id: 'a', visit: { avgPricePerPerson: { currency: 'EUR' as const, min: 18 }, ticket: { currency: 'EUR' as const, min: 5 } } },
      { id: 'b' }, { id: 'a' },
    ];
    const result = dateBudget(places, [], new Set(), new Set(['a']), new Map([['a', 30], ['b', 15]]));
    expect(result).toEqual({ food: 45, ticket: 5, lines: [{ id: 'a', food: 30, ticket: 5 }, { id: 'b', food: 15, ticket: 0 }] });
    expect(dateBudget(places, [], new Set(), new Set(), new Map([['a', 0]])).food).toBe(0);
    expect(dateBudget(places).food).toBe(18);
    expect(places[0]!.visit!.avgPricePerPerson.min).toBe(18);
  });
});

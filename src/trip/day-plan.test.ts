import { describe, expect, it } from 'vitest';
import {
  dateBudget,
  dayPeriods,
  hopRails,
  midEur,
  pastPeriods,
  periodAt,
  periodSections,
  rowPeriods,
  seenFromOutside,
  zonedStamp,
} from './day-plan';

describe('periodAt', () => {
  it('splits the day at 12:00 and 18:00', () => {
    expect(periodAt('09:05')).toBe('morning');
    expect(periodAt('11:59')).toBe('morning');
    expect(periodAt('12:00')).toBe('afternoon');
    expect(periodAt('17:59')).toBe('afternoon');
    expect(periodAt('18:00')).toBe('evening');
  });

  it('keeps the small hours in the night', () => {
    expect(periodAt('00:30')).toBe('evening');
    expect(periodAt('04:59')).toBe('evening');
    expect(periodAt('05:00')).toBe('morning');
  });

  it('has no period without a valid time', () => {
    expect(periodAt(undefined)).toBeNull();
    expect(periodAt('25:00')).toBeNull();
  });
});

describe('rowPeriods', () => {
  it('fills a row without a time from the row above', () => {
    expect(rowPeriods(['11:00', undefined, '13:00', undefined, '19:00'])).toEqual([
      'morning',
      'morning',
      'afternoon',
      'afternoon',
      'evening',
    ]);
  });

  it('gives rows before the first time that first period', () => {
    expect(rowPeriods([undefined, '14:10'])).toEqual(['afternoon', 'afternoon']);
  });

  it('has no period when the date has no time', () => {
    expect(rowPeriods([undefined, undefined])).toEqual([null, null]);
  });
});

describe('dayPeriods', () => {
  const at = (time: string | undefined, text = '', listNote = false) => ({ time, text, listNote });

  it('ends the morning with lunch and starts the evening with dinner', () => {
    // Arrival day: lunch at the airport, the Tower before dinner is still afternoon.
    expect(
      dayPeriods([
        at('11:55', 'CDG — Pouso'),
        at('13:00', 'PAUL CDG — Almoço no terminal'),
        at('13:45', 'CDG 2 TGV'),
        at('18:25', 'Torre Eiffel — Subida ao topo'),
        at('20:50', 'Margaux — Jantar: cordon bleu'),
        at('23:00', 'Casa do Gui — Volta'),
      ]),
    ).toEqual(['morning', 'morning', 'afternoon', 'afternoon', 'evening', 'evening']);
  });

  it('takes the last lunch before dinner', () => {
    expect(
      dayPeriods([
        at('12:15', 'Place des Vosges — Almoço no gramado'),
        at('12:30', 'Chez Janou — Almoço'),
        at('14:15', 'Fachada'),
      ]),
    ).toEqual(['morning', 'morning', 'afternoon']);
  });

  it('falls back to 12:00 and 18:00 without a meal', () => {
    expect(dayPeriods([at('11:30'), at('12:30'), at('18:40'), at('20:15')])).toEqual([
      'morning',
      'afternoon',
      'evening',
      'evening',
    ]);
  });

  it('reads a picnic by its time and skips one in between', () => {
    expect(
      dayPeriods([
        at('10:00', 'Louvre'),
        at('14:30', 'Tulherias — Piquenique'),
        at('16:45', 'Le Nesle — sobremesa do piquenique'),
        at('18:40', 'Rua Cler — para o piquenique'),
        at('19:10', 'Champ de Mars'),
      ]),
    ).toEqual(['morning', 'morning', 'afternoon', 'evening', 'evening']);
  });

  it('ignores a list note that mentions lunch', () => {
    expect(dayPeriods([at('12:15', 'Au P’tit Grec — Almoço'), at('14:30'), at(undefined, 'Almoço alternativo', true)])).toEqual([
      'morning',
      'afternoon',
      'afternoon',
    ]);
  });

  it('has no period on a day with no time and no meal', () => {
    expect(dayPeriods([at(undefined, 'Joy 124'), at(undefined, 'Milano Centrale')])).toEqual([null, null]);
  });
});

describe('periodSections', () => {
  it('groups consecutive rows and keeps document order', () => {
    expect(periodSections(['morning', 'morning', 'afternoon', 'morning'])).toEqual([
      { period: 'morning', rows: [0, 1] },
      { period: 'afternoon', rows: [2] },
      { period: 'morning', rows: [3] },
    ]);
  });
});

describe('hopRails', () => {
  const walk = { mode: 'walk', color: 'walk' } as const;
  const rerB = { mode: 'transit', color: 'blue' } as const;
  const rerE = { mode: 'transit', color: 'pink' } as const;
  const m9 = { mode: 'transit', color: 'lime' } as const;
  // What runs between two icons: the leg below the first, the leg above the second.
  const between = (rails: NonNullable<ReturnType<typeof hopRails>>) =>
    rails.parts.slice(1).map((part, index) => [rails.parts[index]!.below.color, part.above.color]);

  it('keeps the RER B color all the way to the RER E icon', () => {
    const rails = hopRails([rerB, rerE], walk)!;
    expect(between(rails)).toEqual([['blue', 'blue']]);
    expect(rails.arrive.color).toBe('pink');
  });

  it('draws a walk as a walk from end to end', () => {
    const rails = hopRails([walk], walk)!;
    expect([rails.depart, rails.parts[0]!.above, rails.parts[0]!.below, rails.arrive]).toEqual([walk, walk, walk, walk]);
  });

  it('walks to the first train instead of riding it from the door', () => {
    const rails = hopRails([rerE], walk)!;
    expect(rails.depart).toEqual(walk);
    expect(rails.parts[0]).toEqual({ above: walk, below: rerE });
  });

  it('reads train, walk, train as solid, dotted, solid', () => {
    const rails = hopRails([rerE, walk, m9], walk)!;
    expect(rails.parts.map((part) => part.below.mode)).toEqual(['transit', 'walk', 'transit']);
    expect(between(rails)).toEqual([
      ['pink', 'pink'],
      ['walk', 'walk'],
    ]);
    expect(rails.arrive.color).toBe('lime');
  });

  it('starts a taxi at the door', () => {
    const taxi = { mode: 'transit', color: 'gray' } as const;
    expect(hopRails([taxi], walk, true)!.depart).toEqual(taxi);
    expect(hopRails([], walk)).toBeNull();
  });
});

describe('zonedStamp', () => {
  it('reads the wall clock of the city', () => {
    const noonUtc = new Date('2026-10-05T12:30:00Z');
    expect(zonedStamp(noonUtc, 'Europe/Paris')).toBe('2026-10-05 14:30');
    expect(zonedStamp(noonUtc, 'America/Sao_Paulo')).toBe('2026-10-05 09:30');
  });
});

describe('pastPeriods', () => {
  const times = ['08:15', '12:15', '13:45', '18:10', '20:50', '23:00'];
  const periods = ['morning', 'morning', 'afternoon', 'afternoon', 'evening', 'evening'] as const;

  it('turns a period off once the next one has started', () => {
    expect([...pastPeriods('2026-10-04', times, periods, '2026-10-04 13:44')]).toEqual([]);
    expect([...pastPeriods('2026-10-04', times, periods, '2026-10-04 13:45')]).toEqual(['morning']);
    expect([...pastPeriods('2026-10-04', times, periods, '2026-10-04 23:30')]).toEqual([
      'morning',
      'afternoon',
    ]);
  });

  it('turns every period of an earlier date off and none of a later one', () => {
    expect([...pastPeriods('2026-10-04', times, periods, '2026-10-05 07:00')]).toEqual([
      'morning',
      'afternoon',
      'evening',
    ]);
    expect(pastPeriods('2026-10-06', times, periods, '2026-10-05 23:59').size).toBe(0);
  });
});

describe('midEur', () => {
  it('takes the middle of the range', () => {
    expect(midEur({ currency: 'EUR', min: 20, max: 30 })).toBe(25);
  });

  it('uses a single bound as the amount', () => {
    expect(midEur({ currency: 'EUR', min: 5 })).toBe(5);
    expect(midEur({ currency: 'EUR', max: 8 })).toBe(8);
  });

  it('is zero for free, missing and non-euro prices', () => {
    expect(midEur({ currency: 'EUR', free: true, min: 10 })).toBe(0);
    expect(midEur(undefined)).toBe(0);
    expect(midEur({ currency: 'USD', min: 10, max: 20 })).toBe(0);
  });
});

describe('dateBudget', () => {
  it('sums food and tickets and counts a revisit once', () => {
    const budget = dateBudget([
      { id: 'home' },
      { id: 'lunch', visit: { avgPricePerPerson: { currency: 'EUR', min: 8, max: 10 } } },
      { id: 'museum', visit: { ticket: { currency: 'EUR', min: 32 } } },
      { id: 'lunch', visit: { avgPricePerPerson: { currency: 'EUR', min: 8, max: 10 } } },
      { id: 'home' },
    ]);
    expect(budget.food).toBe(9);
    expect(budget.ticket).toBe(32);
    expect(budget.lines.map((line) => line.id)).toEqual(['lunch', 'museum']);
  });

  it('skips the ticket of a place seen only from outside', () => {
    expect(seenFromOutside('Moulin Rouge Foto por fora; daqui, suba a Rue Lepic')).toBe(true);
    expect(seenFromOutside('Arco do Triunfo No fim da caminhada; por fora é grátis')).toBe(true);
    expect(seenFromOutside('La Favorite Fachada')).toBe(true);
    expect(seenFromOutside('Ópera Garnier Por fora é grátis. Por dentro, €25 e só online')).toBe(false);
    expect(seenFromOutside('Panteão €13, ~1h')).toBe(false);
    const budget = dateBudget(
      [
        { id: 'cabaret', visit: { ticket: { currency: 'EUR', min: 175 } } },
        { id: 'museum', visit: { ticket: { currency: 'EUR', min: 13 } } },
      ],
      [],
      new Set(['cabaret']),
    );
    expect(budget.ticket).toBe(13);
    expect(budget.lines.map((line) => line.id)).toEqual(['museum']);
  });

  it('adds each leg fare to tickets, even the same fare twice', () => {
    const budget = dateBudget(
      [{ id: 'museum', visit: { ticket: { currency: 'EUR', min: 10 } } }],
      [
        { label: 'RER E + metrô 9', eur: 2.55 },
        { label: 'metrô 9 de Iéna', eur: 2.55 },
      ],
    );
    expect(budget.ticket).toBeCloseTo(15.1);
    expect(budget.lines.map((line) => line.label ?? line.id)).toEqual(['museum', 'RER E + metrô 9', 'metrô 9 de Iéna']);
  });
});

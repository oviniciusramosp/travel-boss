import { describe, expect, it } from 'vitest';
import { tripErrorText, warningCopyText, warningCountLabel } from './errors';
import { legLabel, parseTrip } from './parse';

const sample = `# Europa

## Paris
city: paris
dates: 2026-04-02 → 2026-04-06

### Dia 1 — Chegada

- 09:00 [Orly](place:par-ory) — Desembarque
- 14:45 [Trocadéro](place:par-trocadero) — Primeira vista

Chegada tranquila.

## Milão
city: milao
dates: 2026-04-06 → 2026-04-09

### Dia 1 — Centro

- 17:00 [Duomo](place:mil-duomo)
- [Mapa](https://www.google.com/maps/search/?api=1&query=Duomo)

## Roma
city: roma

### Dia 1 — Centro

- [Sumido](place:rom-nao-existe)
- [Sem destino](nota)
`;

describe('parseTrip', () => {
  const trip = parseTrip('europa', 'content/trips/europa.md', sample);

  it('reads a multi-city document', () => {
    expect(trip.title).toBe('Europa');
    expect(trip.cities.map((city) => city.slug)).toEqual(['paris', 'milao', 'roma']);
    expect(trip.cities[0]?.dates).toEqual({
      start: '2026-04-02',
      end: '2026-04-06',
    });
    expect(trip.cities[0]?.days).toHaveLength(1);
    expect(trip.cities[1]?.days[0]?.stops).toHaveLength(2);
  });

  it('reads time, place links and https links', () => {
    const [ory, trocadero] = trip.cities[0]?.days[0]?.stops ?? [];
    expect(ory).toMatchObject({
      time: '09:00',
      label: 'Orly',
      placeId: 'par-ory',
      note: 'Desembarque',
    });
    expect(trocadero?.placeId).toBe('par-trocadero');
    const external = trip.cities[1]?.days[0]?.stops[1];
    expect(external?.href).toMatch(/^https:\/\//);
  });

  it('keeps day paragraphs as notes, with the line of each note and stop', () => {
    expect(trip.cities[0]?.days[0]?.notes).toEqual([{ text: 'Chegada tranquila.', line: 12 }]);
    expect(trip.cities[0]?.days[0]?.stops.map((stop) => stop.line)).toEqual([9, 10]);
  });

  it('records a missing place and a broken link', () => {
    expect(trip.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'place-missing', detail: 'rom-nao-existe' }),
        expect.objectContaining({ code: 'bad-link', detail: 'nota' }),
      ]),
    );
  });
});

function parisDay(body: string) {
  return `# Europa

## Paris
city: paris

### Dia 1 — Museu

${body}
`;
}

function firstLegs(body: string) {
  const trip = parseTrip('europa', 'content/trips/europa.md', parisDay(body));
  const stops = trip.cities[0]?.days[0]?.stops ?? [];
  return {
    stops,
    errors: trip.errors.map((error) => error.code),
  };
}

const modeCases = [
  ['a pé · 35 min', 'walk', 35],
  ['WALK · 35min', 'walk', 35],
  ['A PÉ · 8 min', 'walk', 8],
  ['metrô · 10 min', 'transit', 10],
  ['metro · 10 min', 'transit', 10],
  ['RER · 10 min', 'transit', 10],
  ['trem · 10 min', 'transit', 10],
  ['train · 10 min', 'transit', 10],
  ['ônibus · 10 min', 'transit', 10],
  ['onibus · 10 min', 'transit', 10],
  ['bus · 10 min', 'transit', 10],
  ['tram · 10 min', 'transit', 10],
  ['ferry · 10 min', 'transit', 10],
  ['táxi · 10 min', 'taxi', 10],
  ['taxi · 10 min', 'taxi', 10],
  ['uber · 10 min', 'taxi', 10],
  ['Pegar um Bolt · 10 min', 'taxi', 10],
  ['carro · 10 min', 'taxi', 10],
  ['car · 10 min', 'taxi', 10],
  ['voo · 1 h', 'flight', 60],
  ['flight · 1h', 'flight', 60],
] as const;

describe('via legs', () => {
  it('attaches the indented leg to the departure stop only', () => {
    const { stops, errors } = firstLegs(`- 09:00 [Louvre](place:par-louvre)
  - via: metrô M14 + RER E · 35 min
- 10:00 [Notre-Dame](place:par-notre-dame)
  - via: a pé · 12 min`);
    expect(stops).toHaveLength(2);
    expect(stops[0]?.leg).toEqual({
      detail: 'metrô M14 + RER E · 35 min',
      line: 9,
      mode: 'transit',
      durationMin: 35,
    });
    expect(stops[1]?.leg).toEqual({
      detail: 'a pé · 12 min',
      line: 11,
      mode: 'walk',
      durationMin: 12,
    });
    expect(errors).toEqual([]);
  });

  it.each(modeCases)('reads %s as %s / %i min', (detail, mode, durationMin) => {
    const { stops, errors } = firstLegs(
      `- 09:00 [Louvre](place:par-louvre)\n  - via: ${detail}`,
    );
    expect(stops[0]?.leg).toMatchObject({ mode, durationMin });
    expect(errors).toEqual([]);
  });

  it('reads NhMM and N h M min as one duration', () => {
    const hour = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 1 h');
    expect(hour.stops[0]?.leg).toMatchObject({ mode: 'transit', durationMin: 60 });
    expect(hour.errors).toEqual([]);

    const spacedHours = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 3 h');
    expect(spacedHours.stops[0]?.leg?.durationMin).toBe(180);
    const gluedHours = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 3h');
    expect(gluedHours.stops[0]?.leg?.durationMin).toBe(180);

    const compound = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 3h10');
    expect(compound.stops[0]?.leg).toMatchObject({
      detail: 'trem · 3h10',
      mode: 'transit',
      durationMin: 190,
    });
    expect(compound.errors).toEqual([]);

    const clock = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 1h30');
    expect(clock.stops[0]?.leg?.durationMin).toBe(90);
    const words = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 1 h 30 min');
    expect(words.stops[0]?.leg?.durationMin).toBe(90);
    expect(words.errors).toEqual([]);
    const spaced = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 3 h 10 min');
    expect(spaced.stops[0]?.leg?.durationMin).toBe(190);
    const gluedMin = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 1h30min');
    expect(gluedMin.stops[0]?.leg?.durationMin).toBe(90);

    const notAUnit = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: walk · 35 minutos');
    expect(notAUnit.stops[0]?.leg?.durationMin).toBeUndefined();
    expect(notAUnit.errors).toContain('via-no-duration');

    const both = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 20 min e 40 min');
    expect(both.stops[0]?.leg?.durationMin).toBeUndefined();
    expect(both.errors).toEqual(['via-many-durations']);
    const twoHours = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 1 h 2 h');
    expect(twoHours.errors).toEqual(['via-many-durations']);
  });

  it('keeps a note after " — " out of the mode and the duration', () => {
    const { stops, errors } = firstLegs(
      '- 09:00 [Louvre](place:par-louvre)\n  - via: Pegar um Bolt · 35 min — o carro chega em 5 min; o app mostra onde',
    );
    expect(stops[0]?.leg).toEqual({
      detail: 'Pegar um Bolt · 35 min — o carro chega em 5 min; o app mostra onde',
      line: 9,
      note: 'o carro chega em 5 min; o app mostra onde',
      mode: 'taxi',
      durationMin: 35,
    });
    expect(errors).toEqual([]);
  });

  it('reads the fare per person before the note', () => {
    const leg = (via: string) => firstLegs(`- 09:00 [Louvre](place:par-louvre)\n  - via: ${via}`).stops[0]?.leg;
    expect(leg('RER E + metrô 9 · 45 min · €2,55')?.fareEur).toBe(2.55);
    expect(leg('Pegar um Bolt · 35 min · €15–18')?.fareEur).toBe(16.5);
    expect(leg('Pegar um Bolt · 35 min — €29–35 na simulação')?.fareEur).toBeUndefined();
    expect(leg('metrô · 10 min')?.fareEur).toBeUndefined();
  });

  it('names a leg without its note, duration and fare', () => {
    expect(legLabel({ detail: 'Pegar um Bolt · 35 min — o app mostra onde' })).toBe('Pegar um Bolt');
    expect(legLabel({ detail: 'RER E + metrô 9 · 45 min · €2,55' })).toBe('RER E + metrô 9');
    expect(legLabel({ detail: 'RER E + metrô 9 · 45 min' })).toBe('RER E + metrô 9');
    expect(legLabel({ detail: 'Uber (25 min)' })).toBe('Uber');
    expect(legLabel({ detail: 'trem Frecciarossa 07:30 → Milano Centrale 14:07 · 6h37' })).toBe(
      'trem Frecciarossa 07:30 → Milano Centrale 14:07',
    );
    expect(legLabel({ detail: '35 min' })).toBe('35 min');
  });

  it('uses the earliest mode keyword', () => {
    const walkFirst = firstLegs(
      '- 09:00 [Louvre](place:par-louvre)\n  - via: a pé até o metrô · 12 min',
    );
    expect(walkFirst.stops[0]?.leg?.mode).toBe('walk');
    const metroFirst = firstLegs(
      '- 09:00 [Louvre](place:par-louvre)\n  - via: metrô e a pé · 12 min',
    );
    expect(metroFirst.stops[0]?.leg?.mode).toBe('transit');
  });

  it('does not take a keyword that is only a prefix', () => {
    const cart = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: carrinho · 10 min');
    expect(cart.stops[0]?.leg?.mode).toBeUndefined();
    expect(cart.errors).toContain('via-no-mode');
    const walking = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: walking · 10 min');
    expect(walking.stops[0]?.leg?.mode).toBeUndefined();
  });

  it('accepts a tab indent and a capital VIA label', () => {
    const tabbed = firstLegs('- 09:00 [Louvre](place:par-louvre)\n\t- via: bus · 4 min');
    expect(tabbed.stops[0]?.leg).toMatchObject({ mode: 'transit', durationMin: 4 });
    const upper = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - VIA: flight · 2 h');
    expect(upper.stops[0]?.leg).toMatchObject({
      detail: 'flight · 2 h',
      mode: 'flight',
      durationMin: 120,
    });
  });

  it('reports a via that is not an indented leg under a stop', () => {
    const before = firstLegs(`  - via: walk · 10 min
- 09:00 [Louvre](place:par-louvre)`);
    expect(before.stops[0]?.leg).toBeUndefined();
    expect(before.errors).toContain('via-no-stop');

    const topLevel = firstLegs('- via: walk · 10 min');
    expect(topLevel.stops).toHaveLength(1);
    expect(topLevel.stops[0]?.listNote).toBe(true);
    expect(topLevel.stops[0]?.label).toBe('via: walk · 10 min');
    expect(topLevel.stops[0]?.leg).toBeUndefined();
    expect(topLevel.errors).not.toContain('stop-no-link');

    const outside = parseTrip(
      'europa',
      'content/trips/europa.md',
      '# Europa\n\n## Paris\ncity: paris\n  - via: walk · 10 min\n',
    );
    expect(outside.errors.map((error) => error.code)).toContain('via-outside-day');

    const duplicate = firstLegs(`- 09:00 [Louvre](place:par-louvre)
  - via: walk · 5 min
  - via: metro · 15 min`);
    expect(duplicate.stops[0]?.leg).toMatchObject({ mode: 'walk', durationMin: 5 });
    expect(duplicate.errors).toEqual(['via-duplicate']);

    const empty = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via:   ');
    expect(empty.stops[0]?.leg).toBeUndefined();
    expect(empty.errors).toEqual(['via-empty']);
  });
});

describe('city via', () => {
  const between = `# Europa

## Paris
city: paris
dates: 2026-04-02 → 2026-04-06
via: trem Frecciarossa · 3h10

### Dia 1 — Saída

- 09:00 [Louvre](place:par-louvre)

## Milão
city: milao
dates: 2026-04-06 → 2026-04-09

### Dia 1 — Centro

- 17:00 [Duomo](place:mil-duomo)
`;

  it('keeps the departure via on the city you leave', () => {
    const trip = parseTrip('europa', 'content/trips/europa.md', between);
    expect(trip.errors).toEqual([]);
    expect(trip.cities[0]?.leg).toEqual({
      detail: 'trem Frecciarossa · 3h10',
      line: 6,
      mode: 'transit',
      durationMin: 190,
    });
    expect(trip.cities[1]?.leg).toBeUndefined();
    expect(trip.cities[0]?.days[0]?.stops[0]?.leg).toBeUndefined();
  });

  it('reports an empty or second header via and keeps the first', () => {
    const trip = parseTrip(
      'europa',
      'content/trips/europa.md',
      `# Europa

## Paris
city: paris
via:
via: trem · 3 h 10 min
via: voo · 1 h
`,
    );
    expect(trip.cities[0]?.leg).toMatchObject({ mode: 'transit', durationMin: 190 });
    expect(trip.errors.map((error) => error.code)).toEqual(['via-empty', 'via-duplicate']);
  });

  it('does not treat a paragraph via inside a day as the city leg', () => {
    const trip = parseTrip(
      'europa',
      'content/trips/europa.md',
      `# Europa

## Paris
city: paris

### Dia 1 — Notas

via: trem · 3h10
`,
    );
    expect(trip.cities[0]?.leg).toBeUndefined();
    expect(trip.cities[0]?.days[0]?.notes.map((note) => note.text)).toEqual(['via: trem · 3h10']);
    expect(trip.errors).toEqual([]);
  });
});

describe('list notes', () => {
  it('keeps a bullet without a link, in order, and does not report an error', () => {
    const { stops, errors } = firstLegs(`- 09:00 [Louvre](place:par-louvre)
- Lembrar **ingresso**
- 11:00 [Orsay](place:par-orsay)`);
    expect(errors).toEqual([]);
    expect(stops.map((stop) => stop.listNote ?? false)).toEqual([false, true, false]);
    expect(stops[1]).toMatchObject({ label: 'Lembrar **ingresso**', listNote: true });
    expect(stops[0]?.placeId).toBe('par-louvre');
    expect(stops[2]?.placeId).toBe('par-orsay');
  });
});

describe('comments', () => {
  it('hangs indented comentário lines on the stop above, with their lines, and keeps via', () => {
    const { stops, errors } = firstLegs(`- 09:00 [Louvre](place:par-louvre)
  - comentário: dá para entrar mais cedo?
  - via: metrô · 20 min
  - Comment: trocar por Orsay
- Lembrar **ingresso**
  - comentario: ainda vale?
- comentário: fora do item`);
    expect(errors).toEqual([]);
    expect(stops[0]?.comments?.map((comment) => comment.text)).toEqual([
      'dá para entrar mais cedo?',
      'trocar por Orsay',
    ]);
    expect(stops[0]?.leg?.durationMin).toBe(20);
    expect(stops[1]?.comments?.[0]).toEqual({ text: 'ainda vale?', line: (stops[1]?.line ?? 0) + 1 });
    expect(stops[2]).toMatchObject({ label: 'comentário: fora do item', listNote: true });
  });

  it('reports a comment before any stop', () => {
    const trip = parseTrip('europa', 'content/trips/europa.md', parisDay('  - comentário: sem parada'));
    expect(trip.errors.map((error) => error.code)).toEqual(['comment-no-stop']);
  });
});

describe('decisions', () => {
  it('hangs indented decisão lines on the stop or list note above, in order, apart from via and comments', () => {
    const { stops, errors } = firstLegs(`- 09:00 [Louvre](place:par-louvre) — Ingresso das 9h
  - via: metrô · 20 min
  - decisão: 2026-09-27 · manter o Louvre mesmo acima do orçamento do dia
  - comentário: dá para entrar mais cedo?
  - Decision: no Orsay swap
- Lembrar **ingresso**
  - DECISÃO: comprar na hora
  - decisao: sem fila rápida
- decisão: fora do item`);
    expect(errors).toEqual([]);
    expect(stops).toHaveLength(3);
    expect(stops[0]?.decisions).toEqual([
      { text: '2026-09-27 · manter o Louvre mesmo acima do orçamento do dia', line: 10 },
      { text: 'no Orsay swap', line: 12 },
    ]);
    expect(stops[0]?.comments?.map((comment) => comment.text)).toEqual(['dá para entrar mais cedo?']);
    expect(stops[0]?.leg?.durationMin).toBe(20);
    expect(stops[1]?.decisions?.map((decision) => decision.text)).toEqual(['comprar na hora', 'sem fila rápida']);
    expect(stops[2]).toMatchObject({ label: 'decisão: fora do item', listNote: true });
  });

  it('reports a decision before any stop and ignores an empty one', () => {
    const before = parseTrip(
      'europa',
      'content/trips/europa.md',
      parisDay('  - decisão: sem parada\n- 09:00 [Louvre](place:par-louvre)'),
    );
    expect(before.errors).toEqual([{ line: 8, code: 'decision-no-stop' }]);
    expect(before.cities[0]?.days[0]?.stops[0]?.decisions).toBeUndefined();

    const empty = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - decisão:   \n  - decision:');
    expect(empty.errors).toEqual([]);
    expect(empty.stops).toHaveLength(1);
    expect(empty.stops[0]?.decisions).toBeUndefined();
  });

  it('carries a decision on to the next line after a trailing backslash', () => {
    const { stops, errors } = firstLegs(`- 09:00 [Louvre](place:par-louvre)
  - decisão: 2026-09-27 · manter o Louvre\\
    mesmo acima do orçamento
  - comentário: e o Orsay?`);
    expect(errors).toEqual([]);
    expect(stops[0]?.decisions).toEqual([
      { text: '2026-09-27 · manter o Louvre\nmesmo acima do orçamento', line: 9 },
    ]);
    expect(stops[0]?.comments?.map((comment) => comment.text)).toEqual(['e o Orsay?']);
  });
});

describe('hard breaks', () => {
  it('carries a note on to the next line after a trailing backslash, and stops at the line without one', () => {
    const trip = parseTrip(
      'europa',
      'content/trips/europa.md',
      parisDay(`- 09:00 [Louvre](place:par-louvre) — Ingresso\\
  das 9h
  - via: metrô · 20 min
  - comentário: mais cedo?\\
    ou às 10h
- Lembrar\\
  do **ingresso**

Narrativa um\\
narrativa dois`),
    );
    const [louvre, reminder] = trip.cities[0]?.days[0]?.stops ?? [];
    expect(trip.errors).toEqual([]);
    expect(louvre?.note).toBe('Ingresso\ndas 9h');
    expect(louvre?.leg?.durationMin).toBe(20);
    expect(louvre?.comments?.map((comment) => comment.text)).toEqual(['mais cedo?\nou às 10h']);
    expect(reminder).toMatchObject({ label: 'Lembrar\ndo **ingresso**', listNote: true });
    expect(trip.cities[0]?.days[0]?.notes.map((note) => note.text)).toEqual(['Narrativa um\nnarrativa dois']);
  });

  it('drops a break that runs into a blank line or a heading', () => {
    const { stops } = firstLegs('- 09:00 [Louvre](place:par-louvre) — Ingresso\\\n\n- 11:00 [Orsay](place:par-orsay)');
    expect(stops.map((stop) => stop.note ?? null)).toEqual(['Ingresso', null]);
    const trip = parseTrip('europa', 'content/trips/europa.md', parisDay('- 09:00 [Louvre](place:par-louvre) — Ingresso\\\n### Dia 2 — Versalhes\n\n- 10:00 [Orsay](place:par-orsay)'));
    expect(trip.cities[0]?.days.map((day) => day.title)).toEqual(['Dia 1 — Museu', 'Dia 2 — Versalhes']);
    expect(trip.cities[0]?.days[0]?.stops[0]?.note).toBe('Ingresso');
  });
});

describe('tripErrorText', () => {
  it('builds the sentence in the active language', () => {
    expect(tripErrorText({ line: 1, code: 'via-no-mode' }, 'pt-BR')).toBe('via sem modo');
    expect(tripErrorText({ line: 1, code: 'via-no-mode' }, 'en')).toBe('via without a mode');
    expect(tripErrorText({ line: 4, code: 'bad-link', detail: 'nota' }, 'pt-BR')).toBe(
      'link inválido: nota',
    );
    expect(
      tripErrorText({ line: 4, code: 'place-missing', detail: 'rom-nao-existe' }, 'en'),
    ).toBe('place not found: rom-nao-existe');
  });

  it('labels the badge and copies file, line and message for the LLM', () => {
    expect(warningCountLabel(1, 'pt-BR')).toBe('1 aviso');
    expect(warningCountLabel(2, 'pt-BR')).toBe('2 avisos');
    expect(warningCountLabel(1, 'en')).toBe('1 warning');
    expect(
      warningCopyText(
        'content/trips/europa.md',
        [{ line: 12, code: 'via-no-mode' }],
        'pt-BR',
      ),
    ).toBe('content/trips/europa.md:12 — via sem modo');
  });
});

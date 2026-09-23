import { describe, expect, it } from 'vitest';
import { tripErrorText } from './errors';
import { parseTrip } from './parse';

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

  it('keeps day paragraphs as notes', () => {
    expect(trip.cities[0]?.days[0]?.notes).toEqual(['Chegada tranquila.']);
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
      mode: 'transit',
      durationMin: 35,
    });
    expect(stops[1]?.leg).toEqual({
      detail: 'a pé · 12 min',
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

  it('parses 1 h as 60 minutes and does not invent 3h10', () => {
    const hour = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 1 h');
    expect(hour.stops[0]?.leg).toMatchObject({ mode: 'transit', durationMin: 60 });
    expect(hour.errors).toEqual([]);

    const spacedHours = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 3 h');
    expect(spacedHours.stops[0]?.leg?.durationMin).toBe(180);
    const gluedHours = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 3h');
    expect(gluedHours.stops[0]?.leg?.durationMin).toBe(180);

    const compound = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 3h10');
    expect(compound.stops[0]?.leg).toEqual({ detail: 'trem · 3h10', mode: 'transit' });
    expect(compound.stops[0]?.leg?.durationMin).toBeUndefined();
    expect(compound.errors).toEqual(['via-no-duration']);

    const words = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: walk · 35 minutos');
    expect(words.stops[0]?.leg?.durationMin).toBeUndefined();
    expect(words.errors).toContain('via-no-duration');

    const both = firstLegs('- 09:00 [Louvre](place:par-louvre)\n  - via: trem · 1 h 30 min');
    expect(both.stops[0]?.leg?.durationMin).toBeUndefined();
    expect(both.errors).toEqual(['via-many-durations']);
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
});

import { describe, expect, it } from 'vitest';
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
    const messages = trip.errors.map((error) => error.message);
    expect(messages.some((message) => message.includes('rom-nao-existe'))).toBe(true);
    expect(messages.some((message) => message.includes('link inválido'))).toBe(true);
  });
});

import { describe, expect, it } from 'vitest';
import { parseTrip } from './parse';
import { luggageStops } from './luggage';

describe('luggage between stays', () => {
  it('does not end carrying at airline check-in, before the accommodation in the arrival city', () => {
    const trip = parseTrip('test', 'test.md', `# Trip
## Roma
city: roma
dates: 2026-10-18 → 2026-10-18
### Dia 1
- [Hotel](https://example.com) — Checkout às 10h
- [Airport](place:rom-fco) — Check-in no Terminal 3
- Conferir o balcão; check-in online já realizado
- Embarque
## Lisboa
city: lisboa
dates: 2026-10-18 → 2026-10-18
### Dia 1
- [Airport](place:lis-lis)
- Táxi
- [Hotel](place:lis-whome-bairro-alto) — Check-in previsto
- Passeio`);
    expect([...luggageStops(trip)].map(stop => stop.label)).toEqual(['Hotel', 'Airport', 'Conferir o balcão; check-in online já realizado', 'Embarque', 'Airport', 'Táxi', 'Hotel']);
  });
  it('handles arrival and departure at a friend’s home without a fictional hotel checkout', () => {
    const trip = parseTrip('test', 'test.md', `# Trip
## Paris
city: paris
dates: 2026-10-04 → 2026-10-11
### Dia 1 — 4/10
- [Airport](place:par-cdg) — Chegada com as malas; imigração
- [Home](place:par-casa-do-gui) — Deixar as malas; descansar
- Passeio
### Dia 8 — 11/10
- [Home](place:par-casa-do-gui) — Saída com as malas; Uber agendado
- [Train](place:par-gare-de-lyon)
## Milão
city: milao
dates: 2026-10-11 → 2026-10-11
### Dia 1
- [Station](place:mil-centrale)
- [Hotel](place:mil-joy124) — Check-in às 14h45
- Passeio`);
    expect([...luggageStops(trip)].map(stop => stop.label)).toEqual(['Airport', 'Home', 'Home', 'Train', 'Station', 'Hotel']);
  });
  it('marks checkout through check-in across cities, including notes and unpinned stops', () => {
    const trip = parseTrip('test', 'test.md', `# Test
## Milão
city: milao
dates: 2026-10-14 → 2026-10-14
### Dia 1 — 14/10
- [Hotel](place:mil-joy124) — Checkout até 12h
- [Estação](place:mil-centrale)
## La Spezia
city: la-spezia
dates: 2026-10-14 → 2026-10-15
### Dia 1 — 14/10
- Táxi
- [Hotel](https://example.com) — Check-in a partir das 15h
- Passeio
### Dia 2 — 15/10
- Passeio de manhã
`);
    expect([...luggageStops(trip)].map(s => s.label)).toEqual(['Hotel', 'Estação', 'Táxi', 'Hotel']);
  });

  it('ignores future checkout in booking details and handles a checkout note on the final day', () => {
    const trip = parseTrip('test', 'test.md', `# Test
## Lisboa
city: lisboa
dates: 2026-10-18 → 2026-10-20
### Dia 1 — 18/10
- **Hospedagem:** Hotel — Chegada após o táxi; check-in disponível desde 16h.\\
  **Estadia:** checkout até 11h em 20/10.
- Passeio
### Dia 2 — 20/10
- **Checkout:** Hotel — Antes de pegar o Uber
- [Aeroporto](place:lis-lis)
`);
    expect([...luggageStops(trip)].map(s => s.label)).toEqual(['**Checkout:** Hotel — Antes de pegar o Uber', 'Aeroporto']);
  });

  it('leaves bags at a deposit during visits, then carries them to the next stay', () => {
    const trip = parseTrip('test', 'test.md', `# Test
## La Spezia
city: la-spezia
dates: 2026-10-16 → 2026-10-16
### Dia 1
- [Hotel](https://example.com) — Checkout às 7h25
- [Estação](place:spe-centrale)
## Roma
city: roma
dates: 2026-10-16 → 2026-10-17
### Dia 1
- [Depósito](place:rom-stow-colosseo) — Deixar as malas até 13h05
- [Coliseu](place:rom-colosseum)
- [Fórum](place:rom-forum)
- [Depósito](place:rom-stow-colosseo) — Retirar as malas às 18h30
- Táxi
- [Hotel](https://example.com) — Check-in às 19h15
- Jantar
### Dia 2
- Passeio
`);
    expect([...luggageStops(trip)].map(s => s.label)).toEqual([
      'Hotel', 'Estação', 'Depósito', 'Depósito', 'Táxi', 'Hotel',
    ]);
  });
});

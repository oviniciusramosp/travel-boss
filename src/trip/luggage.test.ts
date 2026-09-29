import { describe, expect, it } from 'vitest';
import { parseTrip } from './parse';
import { luggageStops } from './luggage';

describe('luggage between stays', () => {
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
});

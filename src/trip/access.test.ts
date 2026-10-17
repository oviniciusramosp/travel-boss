import { describe, expect, it, vi } from 'vitest';
import { parseTrip } from './parse';
import { dayToMarkdown } from './export';
import { departureTimes } from './departures';
import { noteLines } from './note-edit';
import { planHop, resolveHopSegments, transferLegs, type RouteHop } from './route';
import { transferRowModel } from '../views/transfer-row';

const via = '  - via: Carro · 31 min — Aguardar motorista';
const access = '  - acesso: A pé · 10 min — Virar à direita após a recolha';
const parse = (metadata: string) => parseTrip('test', 'test.md', `# Viagem
## Lisboa
city: lisboa
### Dia 1
- 20:35 [Aeroporto](place:lis-lis)
${metadata}
- 22:10 [Hotel](place:lis-whome-bairro-alto)`);

describe('authored walking access', () => {
  it('round-trips access without creating a standalone stop or changing the ride', () => {
    const trip = parse(`${via}\n${access}\n  - saída: 21:25`);
    const day = trip.cities[0]!.days[0]!;
    expect(trip.errors).toEqual([]);
    expect(day.stops).toHaveLength(2);
    expect(day.stops[0]!.leg).toMatchObject({ mode: 'taxi', durationMin: 31,
      access: { mode: 'walk', durationMin: 10, note: 'Virar à direita após a recolha', line: 7 } });
    const exported = dayToMarkdown(day, id => `https://example.com/${id}`);
    expect(exported).toContain(`${via}\n${access}\n  - saída: 21:25`);
    expect(parse(exported.split('\n').filter(line => /^  - (via|acesso|saída):/.test(line)).join('\n')).errors).toEqual([]);
  });

  it.each([
    access,
    `${via}\n${access}\n${access}`,
    `${via}\n  - acesso: Carro · 10 min`,
    `${via}\n  - acesso: A pé`,
    `${via}\n  - acesso: A pé · 10 min · €1`,
  ])('rejects invalid access metadata: %s', metadata => {
    expect(parse(metadata).errors.some(error => error.code === 'access-invalid')).toBe(true);
  });

  it('shows a timed walking row before the car, preserving duration and road routing', async () => {
    const stop = parse(`${via}\n${access}\n  - saída: 21:25`).cities[0]!.days[0]!.stops[0]!;
    const hop: RouteHop = { from: { id: 'lis-lis', lat: 38.7756, lng: -9.1354 },
      to: { id: 'lis-whome-bairro-alto', lat: 38.711, lng: -9.144 }, via: stop.leg };
    const legs = transferLegs(hop);
    expect(legs.map(leg => transferRowModel(leg))).toMatchObject([
      { mode: 'walk', label: 'A pé', duration: '~10 min', note: 'Virar à direita após a recolha' },
      { mode: 'taxi', label: 'Carro', duration: '~31 min', note: 'Aguardar motorista' },
    ]);
    expect(departureTimes(legs, '2026-10-18', '20:35', '22:10', [], stop.departureTime)[0])
      .toMatchObject({ time: '21:25', conflict: false });
    expect(planHop(hop)).toEqual({ kind: 'drive' });
    const deps = { neutralColor: '#000', walk: vi.fn(), catalog: vi.fn(),
      drive: vi.fn(async () => [[38.7756, -9.1354], [38.711, -9.144]] as [number, number][]) };
    expect(await resolveHopSegments([hop], deps)).toHaveLength(1);
    expect(deps.walk).not.toHaveBeenCalled();
    expect(deps.drive).toHaveBeenCalledWith(hop.from, hop.to);
  });

  it('edits access instructions without replacing the walk or the car', () => {
    expect(noteLines('via', access, 'Seguir ao ponto informado')).toEqual([
      '  - acesso: A pé · 10 min — Seguir ao ponto informado',
    ]);
  });
});

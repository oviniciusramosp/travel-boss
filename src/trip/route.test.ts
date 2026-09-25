import { describe, expect, it, vi } from 'vitest';
import { getTravelCity } from '../catalog';
import { daysOnDate } from './calendar';
import { parseTrip, type TripLeg } from './parse';
import { dateStops, planHop, previewHop, resolveHopSegments, transferLegs, type RouteHop } from './route';

function place(city: string, id: string) {
  const found = getTravelCity(city)?.places.find((item) => item.id === id);
  if (!found) throw new Error(`lugar ausente: ${id}`);
  return { id: found.id, lat: found.lat, lng: found.lng };
}

const viaTransit: TripLeg = {
  detail: 'metrô M14 + RER E · 35 min',
  mode: 'transit',
  durationMin: 35,
};

function deps() {
  return {
    neutralColor: '#666666',
    walk: vi.fn(async () => [[0, 0] as [number, number], [1, 1] as [number, number]]),
    drive: vi.fn(async () => [[2, 2] as [number, number], [3, 3] as [number, number], [4, 4] as [number, number]]),
    catalog: vi.fn(async () => []),
  };
}

describe('planHop', () => {
  it('sends a catalog transit hop to the leg drawer and does not chord an unknown hop', () => {
    const tower = planHop({
      from: place('paris', 'par-casa-do-gui'),
      to: place('paris', 'par-trocadero'),
      via: viaTransit,
    });
    expect(tower.kind).toBe('catalog');

    expect(
      planHop({
        from: place('paris', 'par-louvre'),
        to: place('paris', 'par-notre-dame'),
        via: viaTransit,
      }).kind,
    ).toBe('none');
    expect(
      previewHop(
        {
          from: place('paris', 'par-louvre'),
          to: place('paris', 'par-notre-dame'),
          via: viaTransit,
        },
        '#666666',
      ),
    ).toEqual([]);

    expect(
      planHop({
        from: place('paris', 'par-orly-m14'),
        to: place('paris', 'par-auchan-noisy'),
      }).kind,
    ).toBe('walk');
    expect(
      previewHop(
        {
          from: place('paris', 'par-orly-m14'),
          to: place('paris', 'par-auchan-noisy'),
        },
        '#666666',
      ),
    ).toBeNull();
  });

  it('asks for a walk only when the decision is osrm or a catalog walk', () => {
    expect(
      planHop({
        from: place('paris', 'par-eiffel'),
        to: place('paris', 'par-orsay'),
        via: { detail: 'a pé · 12 min', mode: 'walk', durationMin: 12 },
      }).kind,
    ).toBe('walk');
    expect(
      planHop({
        from: place('paris', 'par-trocadero'),
        to: place('paris', 'par-eiffel'),
      }).kind,
    ).toBe('walk');
  });
});

describe('planHop through', () => {
  it('hands the walk fetch the points a catalog walk must pass', async () => {
    const hop = { from: place('paris', 'par-champ-mars'), to: place('paris', 'par-chapelle-saint-louis') };
    const plan = planHop(hop);
    expect(plan).toMatchObject({ kind: 'walk', through: expect.arrayContaining([[48.85361, 2.301304]]) });
    const calls = deps();
    await resolveHopSegments([hop], calls);
    expect(calls.walk).toHaveBeenCalledWith(hop.from, hop.to, plan.kind === 'walk' ? plan.through : undefined);
  });
});

describe('resolveHopSegments', () => {
  it('asks the catalog drawer for a transit spine and the road router for a taxi', async () => {
    const calls = deps();
    const hops: RouteHop[] = [
      {
        from: place('paris', 'par-casa-do-gui'),
        to: place('paris', 'par-trocadero'),
        via: viaTransit,
      },
      {
        from: place('paris', 'par-louvre'),
        to: place('paris', 'par-notre-dame'),
        via: { detail: 'Uber · 12 min', mode: 'taxi', durationMin: 12 },
      },
    ];
    const segments = await resolveHopSegments(hops, calls);
    expect(calls.catalog).toHaveBeenCalledOnce();
    expect(calls.drive).toHaveBeenCalledOnce();
    expect(calls.walk).not.toHaveBeenCalled();
    expect(segments.at(-1)?.latlngs.length).toBeGreaterThan(2);
  });

  it('calls the catalog drawer for a transit leg without surveyed geometry', async () => {
    const calls = deps();
    await resolveHopSegments(
      [{ from: place('milao', 'mil-sondrio'), to: place('milao', 'mil-cesarino') }],
      calls,
    );
    expect(calls.walk).not.toHaveBeenCalled();
    expect(calls.catalog).toHaveBeenCalledOnce();
  });

  it('calls the walk fetch for an osrm hop and not the catalog drawer', async () => {
    const calls = deps();
    const segments = await resolveHopSegments(
      [
        {
          from: place('paris', 'par-eiffel'),
          to: place('paris', 'par-orsay'),
          via: { detail: 'a pé · 12 min', mode: 'walk', durationMin: 12 },
        },
      ],
      calls,
    );
    expect(calls.walk).toHaveBeenCalledOnce();
    expect(calls.catalog).not.toHaveBeenCalled();
    expect(segments[0]).toMatchObject({ mode: 'walk', fromId: 'par-eiffel', toId: 'par-orsay' });
  });
});

describe('transferLegs', () => {
  it('expands the catalog leg and ignores the via on that pair', () => {
    const parts = transferLegs({
      from: place('paris', 'par-casa-do-gui'),
      to: place('paris', 'par-trocadero'),
      via: viaTransit,
    });
    expect(parts.length).toBeGreaterThan(1);
    expect(parts.some((part) => 'detail' in part)).toBe(false);
  });

  it('uses the markdown via when the pair is not in the catalog, and nothing when there is no leg', () => {
    const via = transferLegs({
      from: place('paris', 'par-louvre'),
      to: place('paris', 'par-notre-dame'),
      via: viaTransit,
    });
    expect(via).toEqual([viaTransit]);
    expect(
      transferLegs({
        from: place('paris', 'par-louvre'),
        to: place('paris', 'par-orsay'),
      }),
    ).toEqual([]);
  });
});

const sharedDay = `# Europa

## Paris
city: paris
via: trem Frecciarossa 07:30 → Milano Centrale 14:07 · 6h37

### Dia 7 — Sáb 10/10 · Véspera
- 20:00 [Casa do Gui](place:par-casa-do-gui)

### Dia 8 — Dom 11/10 · Partida para Milão
- 06:20 [Casa do Gui](place:par-casa-do-gui)
  - via: Uber · 25 min
- 06:50 [Paris Gare de Lyon](place:par-gare-de-lyon)

## Milão
city: milao

### Dia 1 — Chegada, Duomo e Galleria
- 14:10 [Milano Centrale](place:mil-centrale)
  - via: a pé · 25 min
- 14:45 [Joy 124](place:mil-joy124)
`;

describe('dateStops', () => {
  const trip = parseTrip('europa', 'content/trips/europa.md', sharedDay);

  it('keeps one date continuous and hangs the city train on the departure station', () => {
    const rows = dateStops(daysOnDate(trip, '2026-10-11'));
    expect(rows.map((row) => row.dated.day.stops[row.stopIndex]?.placeId)).toEqual([
      'par-casa-do-gui',
      'par-gare-de-lyon',
      'mil-centrale',
      'mil-joy124',
    ]);
    const casa = rows[0];
    const gare = rows[1];
    const centrale = rows[2];
    expect(casa?.depart?.mode).toBe('taxi');
    expect(gare?.depart?.detail).toContain('Frecciarossa');
    expect(gare?.depart?.mode).toBe('transit');
    expect(centrale?.depart?.mode).toBe('walk');
    expect(rows.some((row) => row.dated.day.title.startsWith('Dia 7'))).toBe(false);
  });

  it('does not put the city train on an earlier day', () => {
    const rows = dateStops(daysOnDate(trip, '2026-10-10'));
    expect(rows).toHaveLength(1);
    expect(rows[0]?.depart).toBeUndefined();
  });
});

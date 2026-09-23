import { describe, expect, it, vi } from 'vitest';
import { getTravelCity } from '../catalog';
import type { TripLeg } from './parse';
import { planHop, previewHop, resolveHopSegments, transferLegs, type RouteHop } from './route';

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
    catalog: vi.fn(async () => []),
  };
}

describe('planHop', () => {
  it('draws catalog geometry instead of a walk, and a straight line for a via that is not a walk', () => {
    const tower = planHop({
      from: place('paris', 'par-casa-do-gui'),
      to: place('paris', 'par-trocadero'),
      via: viaTransit,
    });
    expect(tower.kind).toBe('geometry');
    if (tower.kind !== 'geometry') return;
    expect(tower.segments.every((segment) => segment.mode === 'transit')).toBe(true);
    expect(tower.segments.some((segment) => segment.color)).toBe(true);

    const straight = planHop({
      from: place('paris', 'par-louvre'),
      to: place('paris', 'par-notre-dame'),
      via: viaTransit,
    });
    expect(straight.kind).toBe('straight');

    expect(
      planHop({
        from: place('paris', 'par-orly-m14'),
        to: place('paris', 'par-auchan-noisy'),
      }).kind,
    ).toBe('straight');
    const chord = previewHop(
      {
        from: place('paris', 'par-orly-m14'),
        to: place('paris', 'par-auchan-noisy'),
      },
      '#666666',
    );
    expect(chord?.[0]).toMatchObject({ mode: 'transit', dash: true, color: '#666666' });
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

describe('resolveHopSegments', () => {
  it('does not call OSRM for catalog geometry or a straight hop', async () => {
    const calls = deps();
    const hops: RouteHop[] = [
      {
        from: place('paris', 'par-casa-do-gui'),
        to: place('paris', 'par-trocadero'),
        via: viaTransit,
      },
      {
        from: place('paris', 'par-orly-m14'),
        to: place('paris', 'par-auchan-noisy'),
      },
    ];
    const segments = await resolveHopSegments(hops, calls);
    expect(calls.walk).not.toHaveBeenCalled();
    expect(calls.catalog).not.toHaveBeenCalled();
    expect(segments.some((segment) => segment.mode === 'walk')).toBe(false);
    expect(segments.at(-1)?.color).toBe('#666666');
    expect(segments.at(-1)?.latlngs).toHaveLength(2);
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
    expect(segments[0]?.mode).toBe('walk');
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

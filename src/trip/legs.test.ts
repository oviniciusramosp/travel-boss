import { describe, expect, it } from 'vitest';
import { getTravelCity, lineBrandColor } from '../catalog';
import { resolveTripLeg } from './legs';
import type { TripLeg } from './parse';

function paris(id: string) {
  const place = getTravelCity('paris')?.places.find((item) => item.id === id);
  if (!place) throw new Error(`lugar ausente no catálogo: ${id}`);
  return { id: place.id, lat: place.lat, lng: place.lng };
}

const viaWalk: TripLeg = { detail: 'a pé · 12 min', mode: 'walk', durationMin: 12 };

describe('resolveTripLeg', () => {
  it('lets an authored Paris pair beat a via walk', () => {
    const walk = resolveTripLeg(paris('par-trocadero'), paris('par-eiffel'), viaWalk);
    expect(walk).toMatchObject({
      kind: 'catalog',
      leg: { from: 'par-trocadero', to: 'par-eiffel', mode: 'walk' },
    });
    if (walk.kind === 'catalog') expect(walk.geometry).toBeUndefined();

    const transit = resolveTripLeg(paris('par-casa-do-gui'), paris('par-trocadero'), viaWalk);
    expect(transit.kind).toBe('catalog');
    if (transit.kind !== 'catalog') return;
    expect(transit.leg).toMatchObject({
      from: 'par-casa-do-gui',
      to: 'par-trocadero',
      mode: 'transit',
      label: 'RER E + M9',
    });
    expect(transit.geometry).toEqual([
      {
        path: transit.leg.hops?.[0]?.path,
        color: lineBrandColor('rer-e'),
        lineId: 'rer-e',
        label: 'RER E',
      },
      {
        path: transit.leg.hops?.[1]?.path,
        color: lineBrandColor('m9'),
        lineId: 'm9',
        label: 'M9',
      },
    ]);
    expect(transit.geometry?.[0]?.color).toBeTruthy();
    expect(transit.geometry?.[1]?.color).toBeTruthy();
    expect(transit.geometry?.[0]?.path[0]).toEqual([48.896765, 2.458672]);
  });

  it('draws via transit as a straight line when the pair is not in the catalog', () => {
    const decision = resolveTripLeg(paris('par-louvre'), paris('par-notre-dame'), {
      detail: 'metrô M14 + RER E · 35 min',
      mode: 'transit',
      durationMin: 35,
    });
    expect(decision).toEqual({ kind: 'straight' });
  });

  it('asks for OSRM when a via walk has no catalog leg', () => {
    const decision = resolveTripLeg(paris('par-eiffel'), paris('par-orsay'), viaWalk);
    expect(decision).toEqual({ kind: 'osrm' });
  });

  it('uses OSRM at or under 1.5 km and a straight line beyond it', () => {
    expect(resolveTripLeg(paris('par-louvre'), paris('par-orsay'))).toEqual({ kind: 'osrm' });
    expect(resolveTripLeg(paris('par-eiffel'), paris('par-orsay'))).toEqual({ kind: 'straight' });
  });
});

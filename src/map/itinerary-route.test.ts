import { describe, expect, it, vi } from 'vitest';
import type { ItineraryLegDef } from '../data/travel-itinerary-legs';
import { expandTimelineTransferParts, milanDayLegsById, parisDayLegsById } from '../data/travel-itinerary-legs';
import { italyRailLegs } from '../data/travel-italy-rail';
import { stationsFor } from './route-model';
import { buildItineraryRoute } from './itinerary-route';
import { fetchWalkingRoute } from './walk-route';
import { departureTimes } from '../trip/departures';

vi.mock('./walk-route', () => ({ fetchWalkingRoute: vi.fn(async () => null) }));

describe('authored station access', () => {
  it.each(['osrm', 'straight'] as const)('keeps the outward Rome A track and its two intermediate stations in %s mode', async (walkMode) => {
    const leg = parisDayLegsById['trip-europa-2026']!.find(leg => leg.from === 'rom-terrestre-vaticano' && leg.to === 'rom-castel-angelo')!;
    const places = new Map([[leg.from, { id: leg.from, ...leg.stations![0]! }],
      [leg.to, { id: leg.to, ...leg.stations!.at(-1)! }]]);
    const route = await buildItineraryRoute([leg.from, leg.to], [leg], places, { walkMode });
    const spine = route.segments.find(segment => segment.mode === 'transit')!;
    expect(spine.latlngs.length).toBeGreaterThan(30);
    expect(stationsFor(spine).map(station => station.name)).toEqual(['Valle Aurelia', 'Cipro', 'Ottaviano', 'Lepanto']);
    expect(stationsFor(spine).filter(station => !station.end)).toHaveLength(2);
    expect(expandTimelineTransferParts(leg, places.get(leg.from)!, places.get(leg.to)!)[0])
      .toMatchObject({ stationCount: 4, durationMin: 5, board: 'Valle Aurelia', exit: 'Lepanto' });
  });
  it.each((['osrm', 'straight'] as const).flatMap(walkMode => [
    { walkMode, from: 'rom-gallina-bianca', to: 'rom-spagna', durationMin: 4,
      names: ['Termini', 'Repubblica', 'Barberini', 'Spagna'], vertices: 28 },
    { walkMode, from: 'rom-popolo', to: 'rom-terrestre-vaticano', durationMin: 7,
      names: ['Flaminio', 'Lepanto', 'Ottaviano', 'Cipro', 'Valle Aurelia'], vertices: 76 },
  ]))('keeps the correct Rome A stretch from $from to $to in $walkMode mode', async ({ walkMode, from, to, durationMin, names, vertices }) => {
    const leg = parisDayLegsById['trip-europa-2026']!.find(leg => leg.from === from && leg.to === to)!;
    const places = new Map([[leg.from, { id: leg.from, ...leg.stations![0]! }],
      [leg.to, { id: leg.to, ...leg.stations!.at(-1)! }]]);
    const route = await buildItineraryRoute([leg.from, leg.to], [leg], places, { walkMode });
    const spine = route.segments.find(segment => segment.mode === 'transit')!;
    expect(spine.latlngs).toHaveLength(vertices);
    expect(spine.latlngs[0]).toEqual([leg.stations![0]!.lat, leg.stations![0]!.lng]);
    expect(spine.latlngs.at(-1)).toEqual([leg.stations!.at(-1)!.lat, leg.stations!.at(-1)!.lng]);
    expect(stationsFor(spine).map(station => station.name)).toEqual(names);
    expect(stationsFor(spine).filter(station => !station.end)).toHaveLength(names.length - 2);
    expect(expandTimelineTransferParts(leg, places.get(leg.from)!, places.get(leg.to)!)[0])
      .toMatchObject({ stationCount: names.length, durationMin, board: names[0], exit: names.at(-1) });
  });
  it.each([true, false])('avoids a phantom boarding conflict only when the origin is a station (%s)', station => {
    const leg = italyRailLegs.find(leg => leg.label === 'Frecciabianca 8619')!;
    const parts = expandTimelineTransferParts(leg,
      { lat: 45.4858786, lng: 9.2042617, station }, { lat: 44.111564, lng: 9.81358, station: true });
    const times = departureTimes(parts, '2026-10-14', '13:10', '16:14', [{
      date: '2026-10-14', service: 'Frecciabianca 8619', board: 'Milano Centrale', exit: 'La Spezia Centrale',
      departure: '13:10', arrival: '16:14',
    }]);
    expect(times.find(time => time.verified)).toMatchObject({ time: '13:10', conflict: !station });
    expect(parts[0]!.mode).toBe(station ? 'transit' : 'walk');
  });
  it.each(['osrm', 'straight'] as const)('keeps both walks of the Manarola–Corniglia train selectable in %s mode', async (walkMode) => {
    const leg = parisDayLegsById['trip-europa-2026']!.find(leg => leg.from === 'ct-san-lorenzo')!;
    const from = { id: leg.from, lat: 44.107613, lng: 9.7302145 };
    const to = { id: leg.to, lat: 44.1201473, lng: 9.7106212 };
    const parts = expandTimelineTransferParts(leg, from, to);
    expect(parts.map(part => [part.mode, part.walkIndex])).toEqual([['walk', 0], ['transit', undefined], ['walk', 1]]);
    expect(parts[0]!.label['pt-BR']).toBe('A pé até Manarola');
    const times = departureTimes(parts, '2026-10-15', '10:55', '11:55', [{
      date: '2026-10-15', service: 'Regionale 12224', board: 'Manarola', exit: 'Corniglia',
      departure: '11:24', arrival: '11:26',
    }], '11:10');
    expect(times.map(time => time.time)).toEqual(['11:10', '11:24', '11:26']);
    expect(times[1]).toMatchObject({ durationMin: 2, verified: true, conflict: false });
    vi.mocked(fetchWalkingRoute).mockImplementation(async points => ({
      latlngs: points.map(point => [point.lat, point.lng]), distanceM: 500, durationSec: 300,
    }));
    try {
      const route = await buildItineraryRoute([leg.from, leg.to], [leg], new Map([[leg.from, from], [leg.to, to]]), { walkMode });
      expect(route.segments.map(segment => [segment.mode, segment.walkIndex]))
        .toEqual([['walk', 0], ['transit', undefined], ['walk', 1]]);
      expect(route.segments[0]!.latlngs.at(-1)).toEqual(leg.path![0]);
      expect(route.segments[2]!.latlngs[0]).toEqual(leg.path!.at(-1));
    } finally {
      vi.mocked(fetchWalkingRoute).mockResolvedValue(null);
    }
  });
  it.each(['osrm', 'straight'] as const)('marks the five intermediate FB 8619 stops in %s mode', async (walkMode) => {
    const leg = italyRailLegs.find(leg => leg.label === 'Frecciabianca 8619')!;
    const stations = leg.stations!;
    const places = new Map([
      [leg.from, { id: leg.from, ...stations[0]! }],
      [leg.to, { id: leg.to, ...stations.at(-1)! }],
    ]);
    const route = await buildItineraryRoute([leg.from, leg.to], [leg], places, { walkMode });
    const spine = route.segments.find(segment => segment.mode === 'transit')!;
    expect(spine.latlngs.length).toBeGreaterThan(100);
    expect(stationsFor(spine).map(station => station.name)).toEqual([
      'Milano Centrale', 'Pavia', 'Genova Piazza Principe', 'Genova Brignole',
      'Rapallo', 'Chiavari', 'La Spezia Centrale',
    ]);
    expect(stationsFor(spine).filter(station => !station.end)).toHaveLength(5);
    expect(expandTimelineTransferParts(leg, places.get(leg.from)!, places.get(leg.to)!)[0])
      .toMatchObject({ stationCount: 7, durationMin: 184, board: 'Milano Centrale', exit: 'La Spezia Centrale' });
  });
  it.each(['osrm', 'straight'] as const)('does not mark track bends when service stops are unknown in %s mode', async (walkMode) => {
    const leg: ItineraryLegDef = { from: 'a', to: 'b', mode: 'transit', line: 'frecciabianca', stationCount: 0, path: [[44, 9], [43, 10], [42, 11]] };
    const places = new Map([['a', { id: 'a', lat: 44, lng: 9 }], ['b', { id: 'b', lat: 42, lng: 11 }]]);
    const route = await buildItineraryRoute(['a', 'b'], [leg], places, { walkMode });
    expect(stationsFor(route.segments.find(segment => segment.mode === 'transit')!)).toEqual([]);
  });
  it.each(['osrm', 'straight'] as const)('marks only the eight Frecciarossa service stops in %s mode', async (walkMode) => {
    const leg = parisDayLegsById['trip-europa-2026']!.find(leg => leg.from === 'par-gare-de-lyon' && leg.to === 'mil-centrale')!;
    const places = new Map(leg.stations!.filter((_, i) => i === 0 || i === 7).map((station, i) => {
      const id = i === 0 ? leg.from : leg.to;
      return [id, { id, lat: station.lat, lng: station.lng }] as const;
    }));
    const route = await buildItineraryRoute([leg.from, leg.to], [leg], places, { walkMode });
    const spine = route.segments.find(segment => segment.mode === 'transit')!;
    expect(spine.lineId).toBe('frecciarossa');
    expect(spine.latlngs.length).toBeGreaterThan(100);
    expect(stationsFor(spine).map(station => station.name)).toEqual([
      'Paris Gare de Lyon', 'Lyon Part-Dieu', 'Chambéry - Challes-les-Eaux',
      'Saint-Jean-de-Maurienne Arvan', 'Modane', 'Oulx - Cesana - Claviere - Sestriere',
      'Torino Porta Susa', 'Milano Centrale',
    ]);
    expect(stationsFor(spine).filter(station => station.end)).toHaveLength(2);
    expect(expandTimelineTransferParts(leg, places.get(leg.from)!, places.get(leg.to)!)[0]!.stationCount).toBe(8);
  });
  it.each(['osrm', 'straight'] as const)('never invents a railway spine for an unknown line in %s mode', async (walkMode) => {
    const leg: ItineraryLegDef = { from: 'a', to: 'b', mode: 'transit', line: 'unknown' };
    const places = new Map([
      ['a', { id: 'a', lat: 45.49, lng: 9.20 }],
      ['b', { id: 'b', lat: 45.46, lng: 9.19 }],
    ]);
    expect((await buildItineraryRoute(['a', 'b'], [leg], places, { walkMode })).segments).toEqual([]);
  });
  it.each(['osrm', 'straight'] as const)('connects every M3 station and preserves the Duomo alighting in %s mode', async (walkMode) => {
    const leg = milanDayLegsById['milao-d1']!.find(leg => leg.from === 'mil-sondrio')!;
    const places = new Map([
      [leg.from, { id: leg.from, lat: 45.48983, lng: 9.2008456 }],
      [leg.to, { id: leg.to, lat: 45.464408, lng: 9.1935032 }],
    ]);
    const route = await buildItineraryRoute([leg.from, leg.to], [leg], places, { walkMode });
    const spine = route.segments.find(segment => segment.lineId === 'mil-m3')!;
    expect(spine.latlngs).toHaveLength(6);
    expect(spine.latlngs).toEqual(leg.hops![0]!.path);
    expect(leg.hops![0]).toMatchObject({ board: 'Sondrio', exit: 'Duomo' });
    if (walkMode === 'straight') expect(route.segments.find(segment => segment.mode === 'walk' && segment.walkIndex === 1)?.latlngs[0])
      .toEqual(spine.latlngs.at(-1));
    const back = milanDayLegsById['milao-d1']!.find(leg => leg.from === 'mil-galleria')!;
    expect(back.hops![0]!.path).toEqual([...spine.latlngs].reverse());
  });
  it.each(['osrm', 'straight'] as const)('keeps the M1 access visible and individually selectable in %s mode', async (walkMode) => {
    const leg: ItineraryLegDef = {
      from: 'cafe', to: 'arc', mode: 'transit',
      hops: [{ line: 'm1', path: [[48.8625, 2.3364], [48.8738, 2.295]] }],
      walkInPath: [[48.8655, 2.335], [48.864, 2.3355], [48.8625, 2.3364]],
    };
    const places = new Map([
      [leg.from, { id: leg.from, lat: 48.8655, lng: 2.335 }],
      [leg.to, { id: leg.to, lat: 48.8738, lng: 2.295 }],
    ]);
    vi.mocked(fetchWalkingRoute).mockClear();
    const route = await buildItineraryRoute([leg.from, leg.to], [leg], places, { walkMode });
    const access = route.segments.find((segment) => segment.mode === 'walk' && segment.walkIndex === 0);
    expect(access).toMatchObject({ fromId: leg.from, toId: leg.to, latlngs: leg.walkInPath });
    expect(access!.latlngs.length).toBeGreaterThan(2);
    expect(route.segments.some((segment) => segment.mode === 'transit' && segment.lineId === 'm1')).toBe(true);
    expect(fetchWalkingRoute).not.toHaveBeenCalled();
  });
});

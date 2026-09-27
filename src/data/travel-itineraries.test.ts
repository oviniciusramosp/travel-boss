import { describe, expect, it } from 'vitest';
import {
  parisItinerary,
  dayPrimaryRoutePlaceIds,
  dayRoutePlaceIds,
  computeDayBudget,
  itineraryForCity,
} from './travel-itineraries';
import {
  expandTimelineTransferParts,
  legsForDay,
} from './travel-itinerary-legs';
import { getTransitLine, sliceLinePath } from './travel-transit-lines';
import { getTravelCity, withResolvedArea } from './travel';

describe('paris itinerary', () => {
  it('is registered for the paris city slug', () => {
    expect(itineraryForCity('paris')?.id).toBe('paris-7-days');
    expect(itineraryForCity('porto')).toBeUndefined();
  });

  it('has 7 days', () => {
    expect(parisItinerary.days).toHaveLength(7);
    expect(parisItinerary.days.map((d) => d.day)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('day 7 is Disneyland Paris: home → park day → home, ticket in budget', () => {
    const d7 = parisItinerary.days[6]!;
    expect(d7.id).toBe('paris-d7');
    const primary = dayPrimaryRoutePlaceIds(d7);
    // Day starts and ends at Casa do Gui
    expect(primary[0]).toBe('par-casa-do-gui');
    expect(primary[primary.length - 1]).toBe('par-casa-do-gui');
    expect(primary.filter((id) => id === 'par-casa-do-gui')).toHaveLength(2);
    expect(primary).toContain('par-bella-notte');
    expect(primary).toContain('par-mcdonalds-disney');
    // Park pin appears for rope drop, afternoon, and fireworks
    expect(primary.filter((id) => id === 'par-disneyland')).toHaveLength(3);
    const ticketStops = d7.stops.filter(
      (s) => s.placeId === 'par-disneyland' && s.countTicket !== false,
    );
    expect(ticketStops).toHaveLength(1);
    const fireworks = d7.stops.find(
      (s) => s.placeId === 'par-disneyland' && s.time === '22:20',
    );
    expect(fireworks?.countTicket).toBe(false);

    // The ticket the trip paid (€221 for 3) is in the day total once
    const city = getTravelCity('paris')!;
    const placesById = new Map(
      city.places.map((p) => [p.id, withResolvedArea(p)]),
    );
    const budget = computeDayBudget(d7, placesById);
    expect(budget.ticketPlaceIds).toContain('par-disneyland');
    expect(budget.ticketsEur).toBeCloseTo(221 / 3, 1);
    expect(budget.foodPlaceIds).toContain('par-bella-notte');
    expect(budget.foodPlaceIds).toContain('par-mcdonalds-disney');
  });

  it('every stop placeId exists on the Paris city', () => {
    const city = getTravelCity('paris');
    expect(city).toBeDefined();
    const ids = new Set(city!.places.map((p) => p.id));
    for (const day of parisItinerary.days) {
      const stopLists = day.arrivals?.length
        ? day.arrivals.map((a) => a.stops)
        : [day.stops];
      for (const stops of stopLists) {
        for (const stop of stops) {
          expect(
            ids.has(stop.placeId),
            `missing ${stop.placeId} on day ${day.day}`,
          ).toBe(true);
        }
      }
    }
  });

  it('day 1 is arrival: Orly → Casa → market → Casa → Tower area → home (default)', () => {
    const d1 = parisItinerary.days[0]!;
    const primary = dayPrimaryRoutePlaceIds(d1);
    expect(primary[0]).toBe('par-ory');
    expect(primary).toContain('par-orly-m14');
    expect(primary).toContain('par-casa-do-gui');
    expect(primary).toContain('par-auchan-noisy');
    expect(primary).toContain('par-eiffel');
    expect(primary).toContain('par-royal-cambronne');
    // Market right after first home stop, then back home before Tower
    const iCasaFirst = primary.indexOf('par-casa-do-gui');
    const iMarket = primary.indexOf('par-auchan-noisy');
    expect(iCasaFirst).toBeGreaterThan(-1);
    expect(iMarket).toBe(iCasaFirst + 1);
    expect(primary[iMarket + 1]).toBe('par-casa-do-gui');
    // Afternoon leaves from home toward Trocadéro → Tower → Bake → Champ
    const iCasaMid = iMarket + 1;
    const iTroc = primary.indexOf('par-trocadero');
    const iEiffel = primary.indexOf('par-eiffel');
    const iBake = primary.indexOf('par-bake-blend');
    const iChamp = primary.indexOf('par-champ-mars');
    expect(iTroc).toBe(iCasaMid + 1);
    expect(iTroc).toBeLessThan(iEiffel);
    expect(iEiffel).toBeLessThan(iBake);
    expect(iBake).toBeLessThan(iChamp);
    // Home three times: bags, after market, night return
    expect(primary[primary.length - 1]).toBe('par-casa-do-gui');
    expect(primary.filter((id) => id === 'par-casa-do-gui')).toHaveLength(3);
    const eiffel = d1.stops.find((s) => s.placeId === 'par-eiffel');
    expect(eiffel?.countTicket).toBe(false);
    // Market counts as food
    const market = d1.stops.find((s) => s.placeId === 'par-auchan-noisy');
    expect(market?.countFood).not.toBe(false);
  });

  it('day 1 multi-line legs expose hops for transfer dots', () => {
    const legs = legsForDay('paris-d1');
    const multi = legs.find((l) => l.label === 'M14 + RER E');
    expect(multi?.hops?.length).toBe(2);
    expect(multi?.hops?.[0]?.line).toBe('m14');
    expect(multi?.hops?.[1]?.line).toBe('rer-e');
    const towerLeg = legs.find((l) => l.label === 'RER E + M9');
    expect(towerLeg?.hops?.length).toBe(2);
    const homeLeg = legs.find((l) => l.label === 'M6 + M13 + RER E');
    expect(homeLeg?.hops?.length).toBe(3);
  });

  it('day 1 RER E → M9 inserts walk between Haussmann–Saint-Lazare and Havre–Caumartin', () => {
    const legs = legsForDay('paris-d1');
    const towerLeg = legs.find((l) => l.label === 'RER E + M9');
    expect(towerLeg).toBeTruthy();
    const parts = expandTimelineTransferParts(towerLeg!);
    expect(parts.map((p) => p.mode)).toEqual(['transit', 'walk', 'transit']);
    expect(parts[0]?.label.en).toBe('RER E → Haussmann–Saint-Lazare');
    expect(parts[1]?.label.en).toMatch(/Walk to M9/i);
    expect(parts[2]?.label.en).toBe('M9 → Trocadéro');
    // Same-station multi-hop (M14 + RER E) must not invent a walk
    const ory = legs.find((l) => l.label === 'M14 + RER E');
    const oryParts = expandTimelineTransferParts(ory!);
    expect(oryParts.every((p) => p.mode === 'transit')).toBe(true);
  });

  it('day 1 offers ORY and CDG arrival variants', () => {
    const d1 = parisItinerary.days[0]!;
    expect(d1.arrivals?.map((a) => a.id)).toEqual(['ory', 'cdg']);
    const cdg = d1.arrivals!.find((a) => a.id === 'cdg')!;
    const primary = dayPrimaryRoutePlaceIds({ ...d1, stops: cdg.stops });
    expect(primary[0]).toBe('par-cdg');
    expect(primary).toContain('par-cdg-paul');
    expect(primary).toContain('par-cdg-rer');
    expect(primary).toContain('par-casa-do-gui');
    expect(primary).toContain('par-eiffel');
    // Coffee before Navigo on the CDG branch
    expect(primary.indexOf('par-cdg-paul')).toBeLessThan(
      primary.indexOf('par-cdg-rer'),
    );
  });

  it('primary route excludes optional stops; intentional revisits stay', () => {
    const day2 = parisItinerary.days[1]!;
    const primary = dayPrimaryRoutePlaceIds(day2);
    const all = dayRoutePlaceIds(day2);
    expect(primary.length).toBeGreaterThan(2);
    expect(all.length).toBeGreaterThanOrEqual(primary.length);
    // Printemps is optional on west-axis day (day 2)
    expect(primary).not.toContain('par-printemps');
    expect(all).toContain('par-printemps');
    // Day 1 intentionally revisits home base (bags + after market + night)
    const d1Primary = dayPrimaryRoutePlaceIds(parisItinerary.days[0]!);
    expect(d1Primary.filter((id) => id === 'par-casa-do-gui')).toHaveLength(3);
  });

  it('primary routes stay within map planner capacity', () => {
    for (const day of parisItinerary.days) {
      expect(dayPrimaryRoutePlaceIds(day).length).toBeLessThanOrEqual(20);
      for (const arrival of day.arrivals ?? []) {
        expect(
          dayPrimaryRoutePlaceIds({ ...day, stops: arrival.stops }).length,
        ).toBeLessThanOrEqual(20);
      }
    }
  });

  it('each day has authored legs covering consecutive primary stops', () => {
    for (const day of parisItinerary.days) {
      const variants = day.arrivals?.length
        ? day.arrivals.map((a) => ({
            key: a.default || a.id === 'ory' ? day.id : `${day.id}:${a.id}`,
            arrivalId: a.default || a.id === 'ory' ? undefined : a.id,
            stops: a.stops,
          }))
        : [{ key: day.id, arrivalId: undefined as string | undefined, stops: day.stops }];

      for (const v of variants) {
        const ids = dayPrimaryRoutePlaceIds({ ...day, stops: v.stops });
        const legs = legsForDay(day.id, v.arrivalId);
        expect(legs.length, v.key).toBe(ids.length - 1);
        for (let i = 0; i < ids.length - 1; i++) {
          expect(legs[i]?.from, `${v.key} leg ${i}`).toBe(ids[i]);
          expect(legs[i]?.to, `${v.key} leg ${i}`).toBe(ids[i + 1]);
          expect(['walk', 'transit']).toContain(legs[i]?.mode);
          if (legs[i]?.mode === 'transit') {
            const hasGeometry =
              Boolean(legs[i]?.path?.length) ||
              Boolean(legs[i]?.hops?.length) ||
              Boolean(legs[i]?.line);
            expect(hasGeometry, `${v.key} transit geometry`).toBe(true);
          }
        }
      }
    }
  });

  it('trip train chips: rail rides faster than metro, exit station, corridor walk', () => {
    const rerE = getTransitLine('rer-e')!;
    const metro8 = getTransitLine('m8')!;
    const rail = sliceLinePath(rerE, 'noisy-le-sec', 'haussmann-saint-lazare');
    const metro = sliceLinePath(metro8, 'opera', 'creteil-prefecture');
    const [railChip] = expandTimelineTransferParts({
      from: 'a',
      to: 'b',
      mode: 'transit',
      hops: [{ line: 'rer-e', label: 'RER E', exit: 'Haussmann–Saint-Lazare', path: rail }],
    });
    const [metroChip] = expandTimelineTransferParts({
      from: 'a',
      to: 'b',
      mode: 'transit',
      hops: [{ line: 'm8', label: 'M8', path: metro }],
    });
    expect(railChip?.label.en).toBe('RER E → Haussmann–Saint-Lazare');
    // ~11 km of RER in under 20 min; ~13 km of metro takes over 35
    expect(railChip?.durationMin).toBeLessThan(20);
    expect(metroChip?.durationMin).toBeGreaterThan(35);

    // Stops 70 m apart, but the Gare du Nord → Magenta corridor takes minutes
    const parts = expandTimelineTransferParts({
      from: 'a',
      to: 'b',
      mode: 'transit',
      hops: [
        { line: 'm5', label: 'M5', path: sliceLinePath(getTransitLine('m5')!, 'republique', 'gare-nord') },
        { line: 'rer-e', label: 'RER E', path: sliceLinePath(rerE, 'magenta', 'noisy-le-sec'), transferMin: 6 },
      ],
    });
    expect(parts.map((part) => part.mode)).toEqual(['transit', 'walk', 'transit']);
    expect(parts[1]?.label.en).toBe('Walk to RER E');
    expect(parts[1]?.durationMin).toBe(6);
  });

  it('train leg rows: walk to the station, the rides, the walk between lines, the walk to the stop', () => {
    const city = getTravelCity('paris')!;
    const at = (id: string) => city.places.find((p) => p.id === id)!;
    const tower = legsForDay('paris-d1').find((l) => l.label === 'RER E + M9')!;
    const parts = expandTimelineTransferParts(tower, at('par-casa-do-gui'), at('par-trocadero'));
    expect(parts.map((p) => [p.mode, p.hopIndex ?? null, p.walkIndex ?? null])).toEqual([
      ['walk', null, 0],
      ['transit', 0, null],
      ['walk', null, 1],
      ['transit', 1, null],
      ['walk', null, 2],
    ]);
    expect(parts[0]?.label['pt-BR']).toBe('A pé até RER E');
    expect(parts[4]?.label['pt-BR']).toBe('A pé');
    // Casa do Gui → Noisy-le-Sec is ~540 m in a straight line, ~8 min on the streets
    expect(parts[0]?.durationMin).toBeGreaterThanOrEqual(8);
    expect(parts[0]?.durationMin).toBeLessThanOrEqual(10);
  });

  it('transit line slices return geometry', () => {
    const m1 = getTransitLine('m1')!;
    const path = sliceLinePath(m1, 'la-defense', 'palais-royal');
    expect(path.length).toBeGreaterThan(3);
    expect(path[0]?.[0]).toBeCloseTo(48.89, 1);
  });

  it('computes food + tickets; day 1 keeps food under €50 and transport tickets only', () => {
    const city = getTravelCity('paris')!;
    const placesById = new Map(
      city.places.map((p) => [p.id, withResolvedArea(p)]),
    );
    for (const day of parisItinerary.days) {
      const b = computeDayBudget(day, placesById);
      expect(b.foodEur).toBeGreaterThanOrEqual(0);
      expect(b.ticketsEur).toBeGreaterThanOrEqual(0);
    }

    const d1 = computeDayBudget(parisItinerary.days[0]!, placesById);
    expect(d1.foodEur).toBeLessThanOrEqual(50);
    // Transport Navigo Easy only — no Eiffel summit ticket
    expect(d1.ticketsEur).toBeLessThan(15);
    expect(d1.ticketPlaceIds).toContain('par-orly-m14');
    expect(d1.ticketPlaceIds).not.toContain('par-eiffel');

    // CDG arrival variant: same budget shape, Navigo at CDG RER
    const d1CdgStops = parisItinerary.days[0]!.arrivals!.find(
      (a) => a.id === 'cdg',
    )!.stops;
    const d1Cdg = computeDayBudget(
      { ...parisItinerary.days[0]!, stops: d1CdgStops },
      placesById,
    );
    expect(d1Cdg.foodEur).toBeLessThanOrEqual(50);
    expect(d1Cdg.ticketsEur).toBeLessThan(15);
    expect(d1Cdg.ticketPlaceIds).toContain('par-cdg-rer');
    expect(d1Cdg.ticketPlaceIds).not.toContain('par-eiffel');

    // Versailles day (day 4) is ticket-heavy for sights
    const d4 = computeDayBudget(parisItinerary.days[3]!, placesById);
    expect(d4.ticketsEur).toBeGreaterThan(30);

    // Disney day (day 7): the ticket paid (€221 for 3) + food, starts/ends at home (no lodging cost)
    const d7 = computeDayBudget(parisItinerary.days[6]!, placesById);
    expect(d7.ticketsEur).toBeCloseTo(221 / 3, 1);
    expect(d7.ticketPlaceIds).toEqual(['par-disneyland']);
    expect(d7.foodEur).toBeGreaterThan(0);
  });
});

describe('parentId', () => {
  it('points to another place of the same city that has no parent itself', async () => {
    const { travelCities } = await import('./travel');
    const fails: string[] = [];
    for (const city of travelCities) {
      const ids = new Map(city.places.map((place) => [place.id, place]));
      for (const place of city.places) {
        if (!place.parentId) continue;
        const parent = ids.get(place.parentId);
        if (!parent || parent.id === place.id || parent.parentId) fails.push(`${place.id} → ${place.parentId}`);
      }
    }
    expect(fails).toEqual([]);
    expect(travelCities.flatMap((city) => city.places).some((place) => place.parentId === 'par-disneyland')).toBe(true);
  });
});

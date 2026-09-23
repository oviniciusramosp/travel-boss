import { describe, expect, it } from 'vitest';
import { computeDayBudget, computeTripBudget, itineraryForCity, getTravelCity } from '../catalog';
import type { ItineraryStop, TravelPlace } from '../catalog';
import {
  budgetDay,
  dayDirectionsUrl,
  directionPoints,
  formatEur,
  moneyTip,
  periodOf,
  primaryStopCount,
  routeActionLabel,
  routeForSlots,
  sectionsOf,
  stopCountLabel,
  typicalEur,
} from './timeline';

function place(id: string, food: number, ticket: number): TravelPlace {
  return {
    id,
    name: { en: id, 'pt-BR': id },
    category: 'cafes',
    description: { en: '', 'pt-BR': '' },
    lat: food,
    lng: ticket,
    visit: {
      avgPricePerPerson: { currency: 'EUR', min: food },
      ticket: { currency: 'EUR', min: ticket },
    },
  };
}

describe('day header helpers', () => {
  const stops: ItineraryStop[] = [
    { placeId: 'a' },
    { placeId: 'opt', optional: true },
    { placeId: 'b' },
  ];

  it('counts required stops and follows the arrival list, not the optional one', () => {
    expect(primaryStopCount(stops)).toBe(2);
    expect(stopCountLabel(1, 'pt-BR')).toBe('1 parada');
    expect(stopCountLabel(2, 'en')).toBe('2 stops');
  });

  it('names the three route-button states', () => {
    expect(routeActionLabel('idle', 'pt-BR')).toBe('Ver dia no mapa');
    expect(routeActionLabel('drawing', 'en')).toBe('Drawing…');
    expect(routeActionLabel('on', 'pt-BR')).toBe('No mapa');
  });

  it('builds a transit directions url and skips a repeated coordinate', () => {
    const coords = new Map([
      ['a', { lat: 1, lng: 2 }],
      ['b', { lat: 1, lng: 2 }],
      ['c', { lat: 3, lng: 4 }],
    ]);
    expect(directionPoints(['a', 'missing', 'b', 'c'], coords)).toEqual([
      { lat: 1, lng: 2 },
      { lat: 3, lng: 4 },
    ]);
    expect(dayDirectionsUrl(['a', 'c'], coords)).toContain('travelmode=transit');
    expect(dayDirectionsUrl(['a'], coords)).toBeNull();
  });

  it('uses the typical euro amount and lists it in the budget tip', () => {
    expect(typicalEur({ currency: 'EUR', min: 8, max: 20 })).toBe(8);
    expect(typicalEur({ currency: 'EUR', free: true, min: 8 })).toBe(0);
    expect(typicalEur({ currency: 'USD', min: 8 })).toBe(0);
    const places = new Map([['a', place('a', 12, 0)]]);
    expect(moneyTip(['a', 'gone'], places, 'en', 'food')).toContain('12');
    expect(moneyTip(['a'], places, 'en', 'ticket')).toBe('');
  });

  it('formats whole euros without cents', () => {
    expect(formatEur(12, 'en')).toContain('12');
    expect(formatEur(12, 'en')).not.toContain('12.00');
  });
});

describe('routeForSlots', () => {
  const stops: ItineraryStop[] = [
    { placeId: 'a', slot: 'morning' },
    { placeId: 'b', slot: 'afternoon' },
    { placeId: 'opt', slot: 'afternoon', optional: true },
    { placeId: 'c', slot: 'evening' },
  ];
  const legs = [
    { from: 'a', to: 'b', mode: 'transit' as const, line: 'm1' },
    { from: 'b', to: 'c', mode: 'walk' as const },
  ];
  const all = new Set(['morning', 'afternoon', 'evening']);

  it('keeps authored legs and drops the optional stop', () => {
    const route = routeForSlots(stops, legs, all);
    expect(route.ids).toEqual(['a', 'b', 'c']);
    expect(route.legs.map((leg) => leg.mode)).toEqual(['transit', 'walk']);
    expect(periodOf(stops[1]!)).toBe('afternoon');
    expect(sectionsOf(stops).map((section) => section.key)).toEqual(['morning', 'afternoon', 'evening']);
  });

  it('does not bridge a period that is off the map', () => {
    const route = routeForSlots(stops, legs, new Set(['morning', 'evening']));
    expect(route.ids).toEqual(['a', 'c']);
    expect(route.legs).toEqual([]);
  });
});

describe('budgetDay', () => {
  it('uses the default arrival and matches computeTripBudget on Paris', () => {
    const city = getTravelCity('paris');
    const itinerary = itineraryForCity('paris');
    expect(city && itinerary).toBeTruthy();
    if (!city || !itinerary) return;
    const places = new Map(city.places.map((item) => [item.id, item]));
    const total = computeTripBudget(itinerary, places);
    let food = 0;
    let tickets = 0;
    for (const day of itinerary.days) {
      const budget = computeDayBudget(budgetDay(day), places);
      food += budget.foodEur;
      tickets += budget.ticketsEur;
    }
    expect(Math.round(food * 100) / 100).toBe(total.foodEur);
    expect(Math.round(tickets * 100) / 100).toBe(total.ticketsEur);
    expect(total.foodEur).toBeGreaterThan(0);
  });
});

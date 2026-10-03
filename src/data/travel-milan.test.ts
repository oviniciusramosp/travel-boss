import { describe, expect, it } from 'vitest';
import { getTravelCity } from './travel';
import { itineraryForCity, dayPrimaryRoutePlaceIds, computeDayBudget } from './travel-itineraries';
import { legsForDay } from './travel-itinerary-legs';

describe('Milan October 2026 trip', () => {
  it('has four days and preserves the confirmed arrival', () => {
    const trip = itineraryForCity('milao')!;
    expect(trip.days.map(d => d.day)).toEqual([1, 2, 3, 4]);
    expect(trip.days[0].stops[0]).toMatchObject({ placeId: 'mil-centrale', time: '14:10' });
    expect(trip.days[1].title['pt-BR']).toContain('Verona');
    expect(trip.days[2].title['pt-BR']).toContain('Veneza');
    expect(trip.days.slice(1).flatMap(d => d.stops).every(s => s.time === undefined)).toBe(true);
  });
  it('resolves every stop and every primary connection, with M3 for downtown travel', () => {
    const city = getTravelCity('milao')!;
    const ids = new Set(city.places.map(p => p.id));
    for (const day of itineraryForCity('milao')!.days) {
      for (const stop of day.stops) expect(ids.has(stop.placeId), stop.placeId).toBe(true);
      const primary = dayPrimaryRoutePlaceIds(day);
      expect(legsForDay(day.id).map(leg => [leg.from, leg.to])).toEqual(primary.slice(1).map((id, i) => [primary[i], id]));
    }
    const rides = legsForDay('milao-d1').filter(l => l.mode === 'transit').flatMap(l => l.hops ?? []);
    expect(rides.map(l => l.line)).toEqual(['mil-m3', 'mil-m3']);
    expect(rides.map(l => [l.board, l.exit, l.path.length])).toEqual([
      ['Sondrio', 'Duomo', 6], ['Duomo', 'Sondrio', 6],
    ]);
  });
  it('counts only the two main meals and keeps alternatives optional', () => {
    const city = getTravelCity('milao')!;
    const day = itineraryForCity('milao')!.days[0];
    const budget = computeDayBudget(day, new Map(city.places.map(p => [p.id, p])));
    expect(budget.foodPlaceIds.sort()).toEqual(['mil-cesarino', 'mil-san-giorgio']);
    expect(day.summary!['pt-BR']).toContain('Orçamento parcial');
  });
});

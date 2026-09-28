import { describe, it, expect } from 'vitest';
import { departureTimes } from './departures';
import type { TripLeg, TripBoarding } from './parse';
const walk: TripLeg = { mode: 'walk', detail: 'a pé · 10 min', durationMin: 10 };
const train: TripLeg = { mode: 'transit', detail: 'trem L · 30 min', durationMin: 30 };
const service: TripBoarding = { date: '2026-10-09', service: 'trem L', board: 'Paris', exit: 'Versailles', departure: '08:15', arrival: '08:48' };
describe('departure times', () => {
  it('anchors walking to the next stop, or a checked train with boarding margin', () => {
    expect(departureTimes([walk], service.date, '08:00', '08:30')[0]?.time).toBe('08:20');
    const result = departureTimes([walk, train, walk], service.date, '08:00', '09:00', [service]);
    expect(result.map(item => item.time)).toEqual(['08:02', '08:15', '08:48']);
    expect(result[1]?.durationMin).toBe(33);
  });
  it('does not fabricate train times or use a service on a different date', () => {
    expect(departureTimes([train], '2026-10-10', '08:00', '09:00', [service])[0]?.time).toBeUndefined();
    expect(departureTimes([walk, train], service.date, '08:00', '09:00')[1]?.time).toBeUndefined();
    expect(departureTimes([walk], service.date)[0]?.time).toBeUndefined();
  });
  it('flags impossible departures and accounts for midnight', () => {
    expect(departureTimes([walk], service.date, '08:25', '08:30')[0]?.conflict).toBe(true);
    expect(departureTimes([walk], service.date, '23:50', '00:12')[0]?.time).toBe('00:02');
    const result = departureTimes([train, walk], service.date, '23:00', '00:30', [{ ...service, departure: '23:55', arrival: '00:15' }]);
    expect(result.map(item => item.time)).toEqual(['23:55', '00:15']);
    expect(result[0]?.durationMin).toBe(20);
  });
});

it('respects an explicit exit and flags a missed train instead of moving it', () => {
  const result = departureTimes([walk, train], service.date, '08:00', '09:00', [service], '08:10');
  expect(result.map(item => item.time)).toEqual(['08:10', '08:15']);
  expect(result[0]?.conflict).toBe(true);
  expect(result[1]?.conflict).toBe(true);
});

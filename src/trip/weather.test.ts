import { describe, expect, it } from 'vitest';
import { mergeWeather, parseHourly, weatherBetween, weatherLook } from './weather';

const hours = parseHourly({
  hourly: {
    time: ['2026-10-04T08:00', '2026-10-04T09:00', '2026-10-04T12:00', '2026-10-04T13:00', '2026-10-04T20:00'],
    temperature_2m: [11.2, 12.8, 17.9, 19.3, 14.1],
    precipitation_probability: [0, 5, 10, 6, 40],
    weather_code: [0, 1, 2, 2, 61],
  },
})!;

describe('parseHourly', () => {
  it('rejects arrays of different lengths', () => {
    expect(parseHourly({ hourly: { time: ['a'], temperature_2m: [], precipitation_probability: [], weather_code: [] } })).toBeNull();
    expect(parseHourly(null)).toBeNull();
    expect(hours.time).toHaveLength(5);
  });
});

describe('weatherBetween', () => {
  it('keeps the range, the highest rain and the worst sky of those hours', () => {
    expect(weatherBetween(hours, '2026-10-04', '08:15', '12:40')).toEqual({ min: 11.2, max: 17.9, rain: 10, code: 2 });
    expect(weatherBetween(hours, '2026-10-04', '20:50', '23:00')).toEqual({ min: 14.1, max: 14.1, rain: 40, code: 61 });
  });

  it('is null past the forecast', () => {
    expect(weatherBetween(hours, '2026-10-12', '08:00', '20:00')).toBeNull();
  });
});

describe('mergeWeather', () => {
  it('spans the periods of a day', () => {
    const morning = { min: 11, max: 18, rain: 10, code: 2 };
    const evening = { min: 14, max: 15, rain: 40, code: 61 };
    expect(mergeWeather([morning, null, evening])).toEqual({ min: 11, max: 18, rain: 40, code: 61 });
    expect(mergeWeather([null])).toBeNull();
  });
});

describe('weatherLook', () => {
  it('maps WMO codes to a glyph, with the moon at night', () => {
    expect(weatherLook(0).icon).toBe('clear_day');
    expect(weatherLook(1, true).icon).toBe('clear_night');
    expect(weatherLook(2).icon).toBe('partly_cloudy_day');
    expect(weatherLook(3).icon).toBe('cloud');
    expect(weatherLook(45).icon).toBe('foggy');
    expect(weatherLook(53).label['pt-BR']).toBe('Garoa');
    expect(weatherLook(81).icon).toBe('rainy');
    expect(weatherLook(73).icon).toBe('weather_snowy');
    expect(weatherLook(96).icon).toBe('thunderstorm');
  });

  it('gives each sky the tone that colors its glyph', () => {
    expect([0, 2, 3, 45, 61, 73, 95].map((code) => weatherLook(code).tone)).toEqual([
      'sun',
      'sun',
      'cloud',
      'cloud',
      'rain',
      'snow',
      'storm',
    ]);
    expect(weatherLook(2, true).tone).toBe('night');
  });
});

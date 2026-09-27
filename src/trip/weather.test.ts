import { describe, expect, it } from 'vitest';
import { WEATHER_ICONS } from '../ui/weather-icons';
import { dayWeather, parseEnsemble, weatherIn, weatherLook, WINDOWS, type Weather } from './weather';

// 07:00–13:00 of one date; rain is stamped at the end of its hour.
const time = ['07', '08', '09', '10', '11', '12', '13'].map((hour) => `2026-10-04T${hour}:00`);
const run = (temp: number, rain: number) => ({ temp: time.map(() => temp), rain: time.map(() => rain), cloud: time.map(() => 50) });
const ensemble = parseEnsemble({
  hourly: {
    time,
    // Control and three members of one model, one member of another.
    temperature_2m_ecmwf_ifs025_ensemble: run(10, 0).temp,
    precipitation_ecmwf_ifs025_ensemble: run(10, 0).rain,
    cloud_cover_ecmwf_ifs025_ensemble: run(10, 0).cloud,
    ...Object.fromEntries(
      [
        ['member01_ecmwf_ifs025_ensemble', 12, 0],
        ['member02_ecmwf_ifs025_ensemble', 14, 0.1],
        ['member03_ecmwf_ifs025_ensemble', 16, 1],
        ['member01_ncep_gefs05', 18, 2],
      ].flatMap(([suffix, temp, rain]) => {
        const member = run(temp as number, rain as number);
        return [
          [`temperature_2m_${suffix}`, member.temp],
          [`precipitation_${suffix}`, member.rain],
          [`cloud_cover_${suffix}`, member.cloud],
        ];
      }),
    ),
    // A column without its twins is not a run.
    temperature_2m_member09_ncep_gefs05: run(30, 0).temp,
  },
})!;

describe('parseEnsemble', () => {
  it('reads every run that has temperature, rain and cloud', () => {
    expect(ensemble.members).toHaveLength(5);
    expect(parseEnsemble({ hourly: { time: ['a'], temperature_2m: [], precipitation: [], cloud_cover: [] } })).toBeNull();
    expect(parseEnsemble(null)).toBeNull();
  });
});

describe('weatherIn', () => {
  it('takes the median low and high and the share of runs that rain', () => {
    // Morning 07–12: rain of 08:00…12:00, five hours. 0.1 mm/h is 0.5 mm, wet.
    expect(weatherIn(ensemble, '2026-10-04', WINDOWS.morning)).toEqual({
      min: 14,
      max: 14,
      rain: 60,
      mm: 5,
      cloud: 50,
      hours: 5,
    });
  });

  it('is null past the forecast', () => {
    expect(weatherIn(ensemble, '2026-10-04', WINDOWS.afternoon)).toBeNull();
    expect(weatherIn(ensemble, '2026-10-12', WINDOWS.morning)).toBeNull();
  });
});

const sky = (rain: number, mm: number, cloud = 50): Weather => ({ min: 10, max: 15, rain, mm, cloud, hours: 5 });

describe('weatherLook', () => {
  it('keeps the sky under a 30% chance, may rain up to 60%, then says how much falls', () => {
    expect(weatherLook(sky(16, 3)).icon).toBe('cloud-sun');
    expect(weatherLook(sky(30, 3)).icon).toBe('cloud-sun-rain');
    expect(weatherLook(sky(59, 3), true).icon).toBe('cloud-moon-rain');
    // Five hours: under 1 mm is drizzle, from 7.5 mm heavy rain.
    expect(weatherLook(sky(60, 0.5)).icon).toBe('cloud-rain');
    expect(weatherLook(sky(60, 0.5)).label['pt-BR']).toBe('Garoa');
    expect(weatherLook(sky(80, 3)).icon).toBe('cloud-showers');
    expect(weatherLook(sky(80, 10)).icon).toBe('cloud-showers-heavy');
    expect(weatherLook(sky(80, 10)).label['pt-BR']).toBe('Chuva forte');
  });

  it('reads the sky from the median cloud, with the moon at night', () => {
    expect(weatherLook(sky(0, 0, 10)).icon).toBe('sun');
    expect(weatherLook(sky(0, 0, 10), true).icon).toBe('moon-stars');
    expect(weatherLook(sky(0, 0, 70)).icon).toBe('clouds-sun');
    expect(weatherLook(sky(0, 0, 70), true).icon).toBe('clouds-moon');
    expect(weatherLook(sky(0, 0, 90)).icon).toBe('clouds');
  });

  it('draws every glyph from a file of the pack', () => {
    const files = Object.keys(import.meta.glob('../../public/weather/*.svg'));
    expect(WEATHER_ICONS.filter((name) => !files.includes(`../../public/weather/${name}.svg`))).toEqual([]);
  });
});

describe('dayWeather', () => {
  it('never shows rain that no period shows', () => {
    // 4 Oct as the user saw it: 16% all day is no rain at all.
    const day = dayWeather([sky(16, 1, 60), sky(16, 1, 60), sky(16, 1, 80)])!;
    expect(weatherLook(day).icon).toBe('clouds-sun');
    expect(day.rain).toBe(16);
  });

  it('takes the whole range and the rainiest period', () => {
    const morning = { ...sky(20, 0, 10), min: 9, max: 14 };
    const evening = { ...sky(70, 3, 95), min: 12, max: 16 };
    expect(dayWeather([morning, evening])).toEqual({ ...evening, min: 9, max: 16 });
    expect(dayWeather([])).toBeNull();
  });
});

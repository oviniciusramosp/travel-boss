import { describe, expect, it } from 'vitest';
import { WEATHER_ICONS } from '../ui/weather-icons';
import {
  dayWeather,
  failureKind,
  packForecast,
  parseEnsemble,
  unpackForecast,
  updatedLabel,
  weatherIn,
  weatherCity,
  weatherLook,
  weatherTip,
  WINDOWS,
  type Weather,
} from './weather';

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

describe('weatherCity', () => {
  it.each([
    ['milao', 'ven-santa-lucia', 'veneza'],
    ['milao', 'ver-arena', 'verona'],
    ['lisboa', undefined, 'lisboa'],
    ['lisboa', 'sp-gru', 'sao-paulo'],
  ])('uses the actual city for %s / %s', (slug, placeId, expected) => {
    expect(weatherCity(slug, placeId)?.slug).toBe(expected);
  });
});

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
      runs: 5,
    });
  });

  it('is null past the forecast', () => {
    expect(weatherIn(ensemble, '2026-10-04', WINDOWS.afternoon)).toBeNull();
    expect(weatherIn(ensemble, '2026-10-12', WINDOWS.morning)).toBeNull();
  });

  it('counts rain in the final hour using the next date at midnight', () => {
    const hours = {
      time: ['2026-10-04T23:00', '2026-10-05T00:00'],
      extendedFrom: '2026-10-05T00:00',
      members: [{ temp: [15, 14], rain: [0, 2], cloud: [90, 90] }],
    };
    expect(weatherIn(hours, '2026-10-04', [23, 24])).toMatchObject({ mm: 2, rain: 100, extended: true });
  });

  it('identifies long-range readings, including after storage and in the daily summary', () => {
    const hours = unpackForecast(packForecast({ ...ensemble, extendedFrom: '2026-10-04T07:00' }))!;
    const part = weatherIn(hours, '2026-10-04', WINDOWS.morning)!;
    expect(part.extended).toBe(true);
    expect(dayWeather([part, { ...part, extended: false, rain: 100 }])!.extended).toBe(true);
    expect(weatherTip(part, weatherLook(part).label, 'pt-BR', undefined, null, false))
      .toContain('Tendência de longo prazo · menor confiança');
    expect(weatherIn({ ...hours, extendedFrom: '2026-10-05T00:00' }, '2026-10-04', WINDOWS.morning)?.extended).toBeUndefined();
  });
});

const sky = (rain: number, mm: number, cloud = 50): Weather => ({ min: 10, max: 15, rain, mm, cloud, hours: 5, runs: 10 });

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

describe('packForecast / unpackForecast', () => {
  it('keeps one decimal and comes back as the same ensemble', () => {
    const packed = packForecast({ time: ['2026-10-04T07:00'], members: [{ temp: [10.26], rain: [0.04], cloud: [null] }] });
    expect(unpackForecast(packed)).toEqual({ time: ['2026-10-04T07:00'], members: [{ temp: [10.3], rain: [0], cloud: [null] }] });
  });
  it('rejects what is not a whole ensemble', () => {
    expect(unpackForecast(null)).toBeNull();
    expect(unpackForecast('{')).toBeNull();
    expect(unpackForecast(JSON.stringify({ time: ['a'], members: [] }))).toBeNull();
    expect(unpackForecast(JSON.stringify({ time: ['a'], members: [{ temp: [1, 2], rain: [0], cloud: [0] }] }))).toBeNull();
  });
});

describe('weatherTip', () => {
  const weather: Weather = { min: 16.6, max: 21.2, rain: 26.4, mm: 0.3, cloud: 40, hours: 6, runs: 82 };
  const label = { en: 'Partly cloudy', 'pt-BR': 'Parcialmente nublado' };
  const now = new Date(2026, 8, 27, 15, 0);
  const at = new Date(2026, 8, 27, 14, 32).getTime();
  it('shows only condition, rain chance and update time in two lines', () => {
    expect(weatherTip(weather, label, 'pt-BR', [11, 17], at, false, now, 'MET Norway')).toBe(
      'Parcialmente nublado · Chance de chuva 26%\nAtualizado às 14:32',
    );
    expect(weatherTip(weather, label, 'en', undefined, at, true, now)).toBe(
      'Partly cloudy · Rain chance 26%\nUpdated 14:32',
    );
  });
  it('does not invent an update time or probability for a single model', () => {
    expect(weatherTip({ ...weather, runs: 1, rain: 100 }, label, 'pt-BR', undefined, null, false, now)).toBe(
      'Parcialmente nublado · Chance de chuva indisponível\nHorário de atualização indisponível',
    );
  });
  it('dates an update from another day', () => {
    expect(updatedLabel(new Date(2026, 8, 26, 9, 5).getTime(), 'pt-BR', now)).toBe('26/09 09:05');
    expect(updatedLabel(at, 'pt-BR', now)).toBe('14:32');
  });
});

describe('failureKind', () => {
  it('names the daily limit, the network and any other status', () => {
    expect(failureKind(429)).toBe('limit');
    expect(failureKind(null)).toBe('network');
    expect(failureKind(500)).toBe('http');
  });
});

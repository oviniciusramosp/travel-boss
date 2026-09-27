import { describe, expect, it } from 'vitest';
import { metToEnsemble, openMeteoQuery, parseEnsemble } from './weather-source';

describe('metToEnsemble', () => {
  const step = (time: string, temp: number, cloud: number, rain1?: number, rain6?: number) => ({
    time,
    data: {
      instant: { details: { air_temperature: temp, cloud_area_fraction: cloud } },
      ...(rain1 != null ? { next_1_hours: { details: { precipitation_amount: rain1 } } } : {}),
      ...(rain6 != null ? { next_6_hours: { details: { precipitation_amount: rain6 } } } : {}),
    },
  });
  it('makes one hourly run on the city clock, filling six-hour steps and shifting rain to the hour after', () => {
    const data = {
      properties: {
        timeseries: [
          step('2026-10-04T10:00:00Z', 15, 20, 0.3),
          step('2026-10-04T11:00:00Z', 16, 30, 0),
          step('2026-10-04T12:00:00Z', 17, 40, undefined, 1.2),
        ],
      },
    };
    const ensemble = metToEnsemble(data, 'Europe/Paris')!;
    expect(ensemble.members).toHaveLength(1);
    // 10:00Z is 12:00 in Paris in October; the six-hour step fills 14:00–19:00.
    expect(ensemble.time.slice(0, 3)).toEqual(['2026-10-04T12:00', '2026-10-04T13:00', '2026-10-04T14:00']);
    expect(ensemble.time).toHaveLength(8);
    expect(ensemble.members[0]!.temp.slice(0, 4)).toEqual([15, 16, 17, 17]);
    // Rain of 12:00–13:00 (0.3 mm) lands on the 13:00 stamp; the six-hour 1.2 mm spreads 0.2 mm per hour.
    expect(ensemble.members[0]!.rain.slice(0, 4)).toEqual([0, 0.3, 0, 0.2]);
    expect(ensemble.members[0]!.cloud[2]).toBe(40);
  });
  it('is null without two usable steps', () => {
    expect(metToEnsemble({ properties: { timeseries: [] } }, 'Europe/Paris')).toBeNull();
    expect(metToEnsemble(null, 'Europe/Paris')).toBeNull();
  });
});

describe('openMeteoQuery / parseEnsemble', () => {
  it('asks for both ensembles on the city clock', () => {
    const query = openMeteoQuery(48.8566, 2.3522, 'Europe/Paris');
    expect(query).toContain('models=ecmwf_ifs025%2Cgfs05');
    expect(query).toContain('timezone=Europe%2FParis');
  });
  it('keeps parseEnsemble as before', () => {
    expect(parseEnsemble({ hourly: { time: ['a'], temperature_2m_x: [1], precipitation_x: [0], cloud_cover_x: [2] } })).toEqual({
      time: ['a'],
      members: [{ temp: [1], rain: [0], cloud: [2] }],
    });
    expect(parseEnsemble({})).toBeNull();
  });
});

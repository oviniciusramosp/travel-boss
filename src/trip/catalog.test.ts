import { describe, expect, it } from 'vitest';
import { getTravelCity, googleMapsUrl, travelCities } from '../catalog';
import { getTripCity, placeCity } from './catalog';
import { parseTrip } from './parse';
import { tripToMarkdown } from './export';

describe('Versailles catalog and Paris excursions', () => {
  it('resolves Venice and Verona excursions from Milan without duplicating station ownership', () => {
    const milan = getTripCity('milao')!;
    for (const [id, slug] of [['ven-santa-lucia', 'veneza'], ['ver-porta-nuova', 'verona']]) {
      expect(milan.places.some((place) => place.id === id)).toBe(true);
      expect(travelCities.filter((city) => city.places.some((place) => place.id === id)).map(city => city.slug)).toEqual([slug]);
    }
  });

  it('assigns the seven places exclusively to Versailles', () => {
    const versailles = getTravelCity('versailles')!;
    expect(versailles.places.map((place) => place.id).sort()).toEqual([
      'par-la-flottille', 'par-ore-ducasse', 'par-point-alph', 'par-stray-bean',
      'par-trianon', 'par-versailles', 'par-versailles-jardins',
    ]);
    for (const place of versailles.places) {
      expect(travelCities.filter((city) => city.places.some((entry) => entry.id === place.id)))
        .toEqual([versailles]);
      expect(placeCity(place.id, getTripCity('paris')!).slug).toBe('versailles');
    }
    expect(getTravelCity('paris')!.places.some((place) => place.id === 'par-castellane')).toBe(true);
  });

  it('resolves and exports a mixed Paris/Versailles day without changing place IDs', () => {
    const raw = '# Test\n\n## Paris\ncity: paris\n\n### Dia 1 — Versalhes\n\n'
      + '- 09:00 [Palácio](place:par-versailles)\n- 19:00 [Torre](place:par-eiffel)\n';
    const trip = parseTrip('test', 'test.md', raw);
    expect(trip.errors).toEqual([]);
    const city = getTripCity('paris')!;
    expect(city.places.some((place) => place.id === 'par-versailles')).toBe(true);
    expect(city.places.some((place) => place.id === 'par-eiffel')).toBe(true);
    const palace = city.places.find((place) => place.id === 'par-versailles')!;
    const palaceUrl = googleMapsUrl(palace, getTravelCity('versailles')!);
    expect(tripToMarkdown(trip, (slug, id) => {
      const record = getTripCity(slug)!;
      const place = record.places.find((entry) => entry.id === id)!;
      return googleMapsUrl(place, placeCity(id, record));
    })).toContain(`[Palácio](${palaceUrl})`);
    expect(getTripCity('versailles')!.places.some((place) => place.id === 'par-eiffel')).toBe(false);
  });
});

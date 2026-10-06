import { describe, expect, it } from 'vitest';
import { mapsAppUrl } from './maps-app';
import { googleMapsAppTarget, googleMapsUrl, travelCities } from '../catalog';

describe('native Google Maps links', () => {
  const place = 'https://www.google.com/maps/search/?api=1&query=Paris&query_place_id=ChIJ123';
  it('keeps the exact place identity on iPhone', () => {
    expect(mapsAppUrl(place, 'iPhone')).toBe(place.replace('https:', 'comgooglemapsurl:'));
  });
  it('targets Google Maps on Android without a web fallback', () => {
    expect(mapsAppUrl(place, 'Android')).toBe(
      place.replace('https:', 'intent:') + '#Intent;scheme=https;package=com.google.android.apps.maps;end',
    );
  });
  it('preserves route waypoints and walking mode on iPad', () => {
    const route = 'https://www.google.com/maps/dir/?api=1&origin=A&destination=B&waypoints=C%7CD&travelmode=walking';
    expect(mapsAppUrl(route, 'iPad')).toBe(route.replace('https:', 'comgooglemapsurl:'));
  });
  it('leaves desktop, unrelated links and invalid URLs alone', () => {
    expect(mapsAppUrl(place, 'Macintosh')).toBeNull();
    for (const href of ['https://example.com/maps', 'https://www.google.com.evil.test/maps', 'javascript:alert(1)', 'bad']) {
      expect(mapsAppUrl(href, 'Android')).toBeNull();
    }
  });
  it('keeps every shared catalog link tied to its exact Maps entity on both mobile platforms', () => {
    const places = travelCities.flatMap(city => city.places)
      .filter(place => place.mapsUrl?.startsWith('https://maps.app.goo.gl/'));
    expect(places.length).toBeGreaterThan(0);
    for (const place of places) {
      const shared = place.mapsUrl!;
      const target = googleMapsAppTarget(shared);
      expect(target).toContain('/maps/place/');
      expect(target).toMatch(/!1s0x[\da-f]+:0x[\da-f]+/);
      expect(googleMapsUrl(place)).toBe(shared);
      expect(mapsAppUrl(shared, 'iPhone')).toBe(target.replace('https:', 'comgooglemapsurl:'));
      expect(mapsAppUrl(shared, 'Android')).toBe(
        target.replace('https:', 'intent:') + '#Intent;scheme=https;package=com.google.android.apps.maps;end',
      );
      expect(mapsAppUrl(shared, 'Macintosh')).toBeNull();
    }
  });
  it('opens the supplied L’Éclair Lafayette Gourmet entity rather than a name search', () => {
    const place = travelCities.flatMap(city => city.places).find(place => place.id === 'par-eclair-genie')!;
    expect(googleMapsUrl(place)).toBe('https://maps.app.goo.gl/F1H3h7pdTPS9URQ47');
    expect(mapsAppUrl(place.mapsUrl!, 'iPhone')).toContain('!1s0x47e66e369aea85ab:0x321fae32f9112cd9');
  });
});

import { describe, expect, it } from 'vitest';
import { mapsAppUrl } from './maps-app';

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
  it('resolves catalog short links to a place search before opening iOS Maps', () => {
    const href = mapsAppUrl('https://maps.app.goo.gl/ezkYGpjLCM1ZrFuC8', 'iPhone');
    expect(href).toMatch(/^comgooglemapsurl:\/\/www.google.com\/maps\/search\//);
  });
});

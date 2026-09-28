import { describe, expect, it } from 'vitest';
import { auditPin, destinationPin, distanceMeters } from '../../scripts/location-audit';
import { travelCities } from './travel';

describe('location audit', () => {
  it('keeps reviewed business pins synchronized with their exact Maps destinations', () => {
    const places = travelCities.flatMap(city => city.places);
    for (const id of ['par-bohemia', 'par-starbucks-opera', 'par-chez-janou',
      'par-bien-eleve', 'par-chez-elo', 'par-maison-isabelle']) {
      const place = places.find(p => p.id === id);
      expect(place, id).toBeDefined();
      expect(auditPin(place!).status, id).toBe('coordinate-match');
    }
  });
  it('ignores the camera and extracts the destination', () => {
    expect(destinationPin('https://google.com/maps/@0,0,17z/data=!3d48.8653703!4d2.3368988'))
      .toEqual({ lat: 48.8653703, lng: 2.3368988 });
    expect(destinationPin('https://google.com/maps/@48.8,2.3,17z')).toBeUndefined();
  });
  it('does not choose arbitrarily between multiple destinations', () => {
    expect(destinationPin('!3d48!4d2!3d49!4d3')).toBeUndefined();
    expect(destinationPin('!3d48!4d2!3d48!4d2')).toEqual({ lat: 48, lng: 2 });
  });
  it('flags the original Molière displacement', () => {
    expect(auditPin({ lat: 48.8655, lng: 2.335,
      mapsUrl: '!3d48.8653703!4d2.3368988' }).status).toBe('needs-review');
  });
  it('does not certify a place without a coordinate source', () => {
    expect(auditPin({ lat: 48, lng: 2 }).status).toBe('no-coordinate-source');
    expect(auditPin({ lat: NaN, lng: 2 }).status).toBe('invalid');
    expect(destinationPin('!3d91!4d2')).toBeUndefined();
  });
  it('measures a known arc and handles identical points', () => {
    expect(distanceMeters({ lat: 0, lng: 0 }, { lat: 0, lng: 1 })).toBeCloseTo(111194.927, 2);
    expect(distanceMeters({ lat: 48, lng: 2 }, { lat: 48, lng: 2 })).toBe(0);
  });
});

import { describe, expect, it } from 'vitest';
import { auditPin, destinationPin, distanceMeters } from '../../scripts/location-audit';
import { travelCities } from './travel';

const evidenceFiles = import.meta.glob<string>(
  '../../docs/references/paris-location-audit-2026-09-28/*.jsonl',
  { query: '?raw', import: 'default', eager: true },
);
const evidence = Object.values(evidenceFiles).flatMap(text =>
  text.trim().split('\n').filter(Boolean).map(line => JSON.parse(line)),
);

describe('location audit', () => {
  it('requires a dated audit record for every Paris place, without concealing pending findings', () => {
    const places = travelCities.find(city => city.slug === 'paris')!.places;
    expect(evidence.map(record => record.id).sort()).toEqual(places.map(place => place.id).sort());
    for (const record of evidence) {
      expect(record.checkedAt, record.id).toMatch(/^\d{4}-\d{2}-\d{2}/);
      expect(['verified', 'correction', 'ambiguous', 'blocked']).toContain(record.status);
      expect(record.evidence, record.id).toBeTruthy();
      if (record.status !== 'blocked') expect(record.sourceUrls.length, record.id).toBeGreaterThan(0);
    }
  });
  it('requires renewed evidence when audited Paris identities, coordinates or subpoints change', () => {
    for (const place of travelCities.find(city => city.slug === 'paris')!.places) {
      if (place.id === 'par-casa-do-gui') continue; // Private residence, explicitly not externally verified.
      const snapshot = {
        name: place.name, lat: place.lat, lng: place.lng, address: place.address,
        mapsQuery: place.mapsQuery, mapsUrl: place.mapsUrl,
        subPoints: place.subPoints?.map(point => ({
          name: point.name, lat: point.lat, lng: point.lng, placeId: point.placeId,
        })),
      };
      const record = evidence.find(record => record.id === place.id);
      expect(record?.catalogSnapshot, `${place.id}: recheck sources before updating the audit snapshot`)
        .toEqual(JSON.parse(JSON.stringify(snapshot)));
      expect(record?.subPointsAudit?.length ?? 0, place.id).toBe(place.subPoints?.length ?? 0);
    }
  });
  it('keeps reviewed business pins synchronized with their exact Maps destinations', () => {
    const places = travelCities.flatMap(city => city.places);
    for (const id of ['par-bohemia', 'par-starbucks-opera', 'par-chez-janou',
      'par-bien-eleve', 'par-chez-elo', 'par-maison-isabelle', 'par-felicita',
      'par-franklin-passy', 'par-francette', 'par-bakery-gaite', 'par-paul-defense',
      'par-rosa-bonheur', 'par-kfc-les-halles']) {
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

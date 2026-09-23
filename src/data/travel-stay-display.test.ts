import { describe, expect, it } from 'vitest';
import display from './travel-stay-display.json';
import boundaries from './rome-hotel-boundaries.json';
import { stayZonesForCity, stayZonePolygons, stayHeatBand } from './travel-stay-heatmap';
import { ROME_HOTEL_NEIGHBORHOODS } from './rome-hotel-neighborhoods';
import { hotelRankingContext } from './hotel-ranking-context';
import { hotelRegion } from '../../scripts/hotel-ranking.mjs';

describe('shared neighborhood geometry and contact transitions', () => {
  const zones = [
    ...['roma', 'lisboa'].flatMap(city => stayZonesForCity(city).map(z => ({id: z.id, band: stayHeatBand(z)}))),
    ...ROME_HOTEL_NEIGHBORHOODS.map(z => ({id: z.id, band: z.mapBand})),
  ];
  it('keeps generated display geometry aligned with every current region and classification', () => {
    expect(Object.keys(display.zones).sort()).toEqual(zones.map(z => z.id).sort());
    for (const zone of zones) {
      const rendered = display.zones[zone.id as keyof typeof display.zones];
      expect(rendered.band, zone.id).toBe(zone.band);
      expect(rendered.polygons.length, zone.id).toBeGreaterThan(0);
    }
  });
  it('includes old/new best–caution contacts in an independent mixed layer', () => {
    expect(display.halfWidthM).toBe(35);
    expect(display.transitions.some(t => t.between.includes('roma-monti') && t.between.includes('roma-esquilino'))).toBe(true);
    expect(display.transitions.some(t => t.between.some(id => id.includes('coverage-')))).toBe(true);
    for (const contact of display.transitions) {
      expect(contact.between.map(id => zones.find(z => z.id === id)?.band).sort()).toEqual(['best', 'caution']);
      expect(contact.polygons.length).toBeGreaterThan(0);
    }
  });
  it('uses canonical unscaled geometry, including holes, for neighborhood membership', () => {
    const {zones: context} = hotelRankingContext('roma');
    for (const id of ['roma-monti','roma-esquilino','roma-termini']) {
      expect(context.find(z => z.id === id)?.polygons).toEqual(stayZonePolygons(id));
      expect(stayZonePolygons(id)).toEqual(boundaries.editorialZones[id as keyof typeof boundaries.editorialZones].polygons);
    }
    // Termini east must not classify northern Castro Pretorio as its caution pocket.
    expect(hotelRegion({lat: 41.906, lng: 12.504}, context)?.id).not.toBe('roma-termini');
    expect(hotelRegion({lat: 41.8991, lng: 12.5019}, context)?.id).toBe('roma-termini');
  });
});

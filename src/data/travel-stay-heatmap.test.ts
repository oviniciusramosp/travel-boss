import { describe, expect, it } from 'vitest';
import {
  STAY_SAFETY_CAUTION,
  STAY_SAFETY_WEIGHT,
  STAY_VALUE_WEIGHT,
  hasStayHeat,
  stayAirbnbUrl,
  stayBookingUrl,
  stayHeatBand,
  staySafetyBand,
  stayZoneRings,
  stayHeatPaintScore,
  stayOverall,
  stayScoreRgb,
  stayZonesForCity,
  zoneBbox,
} from './travel-stay-heatmap';
import { travelCities } from './travel';

const CITY_BBOX: Record<string, { lat: [number, number]; lng: [number, number] }> = {
  roma: { lat: [41.84, 41.94], lng: [12.44, 12.54] },
  lisboa: { lat: [38.68, 38.76], lng: [-9.21, -9.11] },
};

describe('stayOverall', () => {
  it('weights safety above value', () => {
    expect(STAY_SAFETY_WEIGHT).toBeGreaterThan(STAY_VALUE_WEIGHT);
    expect(STAY_SAFETY_WEIGHT + STAY_VALUE_WEIGHT).toBeCloseTo(1, 8);
  });

  it('rounds 55/45 mix', () => {
    expect(stayOverall(100, 0)).toBe(55);
    expect(stayOverall(0, 100)).toBe(45);
    expect(stayOverall(88, 90)).toBe(89);
  });
});

describe('stay zones', () => {
  it('covers Rome and Lisbon only for now', () => {
    expect(hasStayHeat('roma')).toBe(true);
    expect(hasStayHeat('lisboa')).toBe(true);
    expect(hasStayHeat('paris')).toBe(false);
    expect(hasStayHeat('')).toBe(false);
  });

  it('city slugs exist on travelCities', () => {
    const slugs = new Set(travelCities.map((c) => c.slug));
    expect(slugs.has('roma')).toBe(true);
    expect(slugs.has('lisboa')).toBe(true);
  });

  for (const slug of ['roma', 'lisboa'] as const) {
    it(`${slug}: unique ids, scores, bbox`, () => {
      const zones = stayZonesForCity(slug);
      expect(zones.length).toBeGreaterThanOrEqual(10);
      const ids = zones.map((z) => z.id);
      expect(new Set(ids).size).toBe(ids.length);
      const box = CITY_BBOX[slug]!;
      for (const z of zones) {
        expect(z.citySlug).toBe(slug);
        expect(z.safety).toBeGreaterThanOrEqual(0);
        expect(z.safety).toBeLessThanOrEqual(100);
        expect(z.value).toBeGreaterThanOrEqual(0);
        expect(z.value).toBeLessThanOrEqual(100);
        expect(z.overall).toBe(stayOverall(z.safety, z.value));
        expect(z.radiusM).toBeGreaterThan(200);
        expect(z.radiusM).toBeLessThan(1200);
        expect(z.lat).toBeGreaterThan(box.lat[0]);
        expect(z.lat).toBeLessThan(box.lat[1]);
        expect(z.lng).toBeGreaterThan(box.lng[0]);
        expect(z.lng).toBeLessThan(box.lng[1]);
        expect(z.name.en.length).toBeGreaterThan(2);
        expect(z.name['pt-BR'].length).toBeGreaterThan(2);
        expect(z.note.en.length).toBeGreaterThan(20);
        expect(z.note['pt-BR'].length).toBeGreaterThan(20);
      }
    });
  }

  it('Rome ranks Monti / Testaccio / Prati above Termini', () => {
    const byId = Object.fromEntries(stayZonesForCity('roma').map((z) => [z.id, z]));
    expect(byId['roma-monti']!.overall).toBeGreaterThan(byId['roma-termini']!.overall);
    expect(byId['roma-prati']!.overall).toBeGreaterThan(byId['roma-termini']!.overall);
    expect(byId['roma-testaccio']!.overall).toBeGreaterThan(byId['roma-termini']!.overall);
    expect(byId['roma-termini']!.safety).toBeLessThan(60);
  });

  it('Lisbon ranks Campo de Ourique / Estrela above Martim Moniz and Bairro Alto', () => {
    const byId = Object.fromEntries(stayZonesForCity('lisboa').map((z) => [z.id, z]));
    expect(byId['lisboa-campo-de-ourique']!.overall).toBeGreaterThan(
      byId['lisboa-martim-moniz']!.overall,
    );
    expect(byId['lisboa-estrela']!.overall).toBeGreaterThan(
      byId['lisboa-bairro-alto']!.overall,
    );
    expect(byId['lisboa-martim-moniz']!.safety).toBeLessThan(65);
  });
});

describe('heatmap samples + color', () => {
  it('maps low scores to redder RGB than high scores', () => {
    const low = stayScoreRgb(50);
    const high = stayScoreRgb(90);
    expect(low[0]).toBeGreaterThan(high[0]);
    expect(high[1]).toBeGreaterThan(low[1]);
  });

  it('paints caution red when safety is below 70, even with high value', () => {
    const intendente = stayZonesForCity('lisboa').find(
      (z) => z.id === 'lisboa-intendente',
    )!;
    expect(intendente.safety).toBeLessThan(STAY_SAFETY_CAUTION);
    expect(intendente.overall).toBeGreaterThan(STAY_SAFETY_CAUTION);
    expect(stayHeatPaintScore(intendente)).toBe(48);
    expect(stayScoreRgb(stayHeatPaintScore(intendente))).toEqual(
      stayScoreRgb(48),
    );
    const monti = stayZonesForCity('roma').find((z) => z.id === 'roma-monti')!;
    expect(monti.safety).toBeGreaterThanOrEqual(STAY_SAFETY_CAUTION);
    expect(stayHeatPaintScore(monti)).toBe(monti.overall);
    expect(stayHeatBand(intendente)).toBe('caution');
    expect(stayHeatBand(monti)).toBe('best');
    const centro = stayZonesForCity('roma').find((z) => z.id === 'roma-centro')!;
    expect(stayHeatBand(centro)).toBe('mixed');
  });

  it('uses neighbourhood polygons, not circles', () => {
    for (const slug of ['roma', 'lisboa'] as const) {
      const zones = stayZonesForCity(slug);
      expect(zones.every((z) => stayZoneRings(z.id).length > 0)).toBe(true);
      const monti = stayZoneRings('roma-monti')[0]!;
      const lats = monti.map((p) => p[0]);
      const lngs = monti.map((p) => p[1]);
      expect(new Set(lats).size).toBeGreaterThan(4);
      expect(new Set(lngs).size).toBeGreaterThan(4);
    }
  });

  it('covers Colonna / Trevi and the Ghetto gaps in Rome', () => {
    expect(stayHeatBand(stayZonesForCity('roma').find((z) => z.id === 'roma-corso-trevi')!)).toBe(
      'mixed',
    );
    expect(stayHeatBand(stayZonesForCity('roma').find((z) => z.id === 'roma-ghetto')!)).toBe(
      'mixed',
    );
    expect(stayZoneRings('roma-corso-trevi').length).toBeGreaterThan(0);
    expect(stayZoneRings('roma-ghetto').length).toBe(1);
    const colonna: [number, number] = [41.90085, 12.48015];
    const tartarughe: [number, number] = [41.8938, 12.4776];
    const pip = (pt: [number, number], ring: [number, number][]) => {
      const x = pt[1];
      const y = pt[0];
      let inside = false;
      let j = ring.length - 1;
      for (let i = 0; i < ring.length; i++) {
        const xi = ring[i]![1];
        const yi = ring[i]![0];
        const xj = ring[j]![1];
        const yj = ring[j]![0];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-15) + xi) {
          inside = !inside;
        }
        j = i;
      }
      return inside;
    };
    expect(stayZoneRings('roma-corso-trevi').some((r) => pip(colonna, r))).toBe(true);
    expect(stayZoneRings('roma-ghetto').some((r) => pip(tartarughe, r))).toBe(true);
  });

  it('covers San Simeone, Mascherone and Palazzo Spada (Ponte / Parione / Regola)', () => {
    const zone = stayZonesForCity('roma').find((z) => z.id === 'roma-ponte-regola')!;
    expect(stayHeatBand(zone)).toBe('mixed');
    expect(stayZoneRings('roma-ponte-regola').length).toBeGreaterThan(0);
    const pip = (pt: [number, number], ring: [number, number][]) => {
      const x = pt[1];
      const y = pt[0];
      let inside = false;
      let j = ring.length - 1;
      for (let i = 0; i < ring.length; i++) {
        const xi = ring[i]![1];
        const yi = ring[i]![0];
        const xj = ring[j]![1];
        const yj = ring[j]![0];
        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-15) + xi) {
          inside = !inside;
        }
        j = i;
      }
      return inside;
    };
    const inPonteRegola = (pt: [number, number]) =>
      stayZoneRings('roma-ponte-regola').some((r) => pip(pt, r));
    expect(inPonteRegola([41.90047, 12.47078])).toBe(true); // San Simeone
    expect(inPonteRegola([41.89385, 12.46995])).toBe(true); // Mascherone
    expect(inPonteRegola([41.89417, 12.47195])).toBe(true); // Palazzo Spada
  });

  it('search bbox follows the neighbourhood polygon, not a circle', () => {
    const monti = stayZonesForCity('roma').find((z) => z.id === 'roma-monti')!;
    const ring = stayZoneRings('roma-monti')[0]!;
    const lats = ring.map((p) => p[0]);
    const lngs = ring.map((p) => p[1]);
    const box = zoneBbox(monti);
    expect(box.north).toBeGreaterThan(Math.max(...lats));
    expect(box.south).toBeLessThan(Math.min(...lats));
    expect(box.east).toBeGreaterThan(Math.max(...lngs));
    expect(box.west).toBeLessThan(Math.min(...lngs));
    const circleNorth = monti.lat + (monti.radiusM * 1.15) / 111_320;
    expect(box.north).not.toBeCloseTo(circleNorth, 4);
  });
});

describe('stay search deep links', () => {
  it('Airbnb: Superhost + guest favourite, map box, locale host', () => {
    const monti = stayZonesForCity('roma').find((z) => z.id === 'roma-monti')!;
    const en = stayAirbnbUrl(monti, 'en');
    const pt = stayAirbnbUrl(monti, 'pt-BR');
    expect(en.startsWith('https://www.airbnb.com/s/homes?')).toBe(true);
    expect(pt.startsWith('https://www.airbnb.com.br/s/homes?')).toBe(true);
    const params = new URL(en).searchParams;
    expect(params.get('superhost')).toBe('true');
    expect(params.get('guest_favorite')).toBe('true');
    expect(params.get('search_by_map')).toBe('true');
    expect(params.get('query')).toContain('Monti');
    expect(params.get('query')).toContain('Rome');
    expect(Number(params.get('ne_lat'))).toBeGreaterThan(monti.lat);
    expect(Number(params.get('sw_lat'))).toBeLessThan(monti.lat);
  });

  it('Booking: review 9+ and top-reviewed sort around the zone', () => {
    const chiado = stayZonesForCity('lisboa').find((z) => z.id === 'lisboa-chiado')!;
    const en = stayBookingUrl(chiado, 'en');
    const pt = stayBookingUrl(chiado, 'pt-BR');
    expect(en).toContain('searchresults.en-gb.html');
    expect(pt).toContain('searchresults.pt-br.html');
    const params = new URL(en).searchParams;
    expect(params.get('nflt')).toBe('review_score=90');
    expect(params.get('order')).toBe('bayesian_review_score');
    expect(params.get('ss')).toContain('Chiado');
    expect(params.get('latitude')).toBe(chiado.lat.toFixed(5));
    expect(params.get('longitude')).toBe(chiado.lng.toFixed(5));
  });

  it('appends check-in / check-out when dates are valid', () => {
    const monti = stayZonesForCity('roma').find((z) => z.id === 'roma-monti')!;
    const dates = { checkin: '2026-09-12', checkout: '2026-09-16' };
    const airbnb = new URL(stayAirbnbUrl(monti, 'en', dates)).searchParams;
    const booking = new URL(stayBookingUrl(monti, 'en', dates)).searchParams;
    expect(airbnb.get('checkin')).toBe('2026-09-12');
    expect(airbnb.get('checkout')).toBe('2026-09-16');
    expect(booking.get('checkin')).toBe('2026-09-12');
    expect(booking.get('checkout')).toBe('2026-09-16');
    const bare = new URL(stayAirbnbUrl(monti, 'en')).searchParams;
    expect(bare.get('checkin')).toBeNull();
  });
});


describe('shared stay colors for newly mapped regions', () => {
  it('uses the same thresholds without inventing a value or safety score', () => {
    expect(staySafetyBand(80)).toBe('best');
    expect(staySafetyBand(70)).toBe('mixed');
    expect(staySafetyBand(60)).toBe('caution');
    expect(staySafetyBand(null)).toBe('unknown');
  });
});

import { ROME_HOTEL_NEIGHBORHOODS, ROME_HOTEL_COVERAGE } from './rome-hotel-neighborhoods';
import { describe, it, expect } from 'vitest';
import { walkingDestinationScore, rankingTargets, hotelRegion, hotelEvidence, walkingMatrix, evaluateJev, rankHotels } from '../../scripts/hotel-ranking.mjs';
import { hotelRankingContext } from './hotel-ranking-context';
import { validateRankingHotels } from '../../scripts/hotel-search.mjs';

const name = { en: 'Place', 'pt-BR': 'Lugar' };
const point = { id: 'p', name, lat: 41.89, lng: 12.49, weight: 1 };
const categoryScores = { cleanliness: 9, comfort: 8, facilities: 7, staff: 7, wifi: 4, location: 5, value: 6 };
const hotel = { id: 'h', name: 'Hotel', lat: 41.89, lng: 12.49, priceTotal: 1000, currency: 'BRL', booking: { score: 9, reviews: 500, categoryScores, wifiAvailable: true } };
const targets = { points: [point], transport: [], totalPoints: 1 };
const zone = { id: 'z', name, note: name, lat: 41.89, lng: 12.49, safety: 85, radiusM: 300, rings: [] };
const walk = { ...point, minutes: 10, distanceM: 750 };
const pause = async () => {};
const unavailable = async () => { throw new Error('offline'); };
const response = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status });

describe('hotel evidence', () => {
  it('prioritizes selected route, itinerary and favorites, excluding transport and hotels', () => {
    const city = { lat: 41.89, lng: 12.49, places: [
      { ...point, id: 'ordinary', category: 'parks' },
      { ...point, id: 'favorite', favorite: true, category: 'parks' },
      { ...point, id: 'planned', category: 'parks' },
      { ...point, id: 'selected', category: 'parks' },
      { ...point, id: 'station', category: 'transport' },
      { ...point, id: 'stay', category: 'lodging' },
      { ...point, id: 'airport', category: 'airport' },
    ] };
    const result = rankingTargets(city, { days: [{ stops: [{ placeId: 'planned' }] }] }, ['selected']);
    expect(result.points.map((p: typeof point) => p.id)).toEqual(['selected', 'planned', 'favorite', 'ordinary']);
    expect(result.transport.map((p: typeof point) => p.id)).toEqual(['station']);
  });
  it('bounds the sample and reports the total', () => {
    const result = rankingTargets({ places: Array.from({ length: 50 }, (_, i) => ({ ...point, id: String(i) })) });
    expect(result.points).toHaveLength(24);
    expect(result.totalPoints).toBe(50);
  });
  it('uses polygons, never the nearest neighborhood outside its bounds', () => {
    const polygon = { ...zone, rings: [[[41.88, 12.48], [41.90, 12.48], [41.90, 12.50], [41.88, 12.50]]] };
    expect(hotelRegion(hotel, [polygon])?.coverage).toBe('polygon');
    expect(hotelRegion({ ...hotel, lat: 42 }, [polygon])).toBeNull();
    expect(hotelRegion(hotel, [zone, { ...zone, safety: 40 }])?.safety).toBe(40);
  });
  it('keeps missing safety and routes unknown without awarding a perfect score', () => {
    const evidence = hotelEvidence(hotel, targets, [null], [], 1000);
    expect(evidence.region).toBeNull();
    expect(evidence.components.safety).toBeNull();
    expect(evidence.components.walking).toBeNull();
    expect(evidence.walkingMinutes).toBeNull();
    expect(evidence.baseScore).toBe(evidence.components.quality);
    expect(evidence.evidenceCoverage).toBe(0.5);
    expect(evidence.provisional).toBe(true);
    expect(evidence.missingComponents).toContain('safety');
  });
  it('does not let one available nearby route represent a mostly missing matrix', () => {
    const evidence = hotelEvidence(hotel, { ...targets, points: [point, point, point] }, [walk, null, null], [], 1000);
    expect(evidence.walkingCoverage).toBeCloseTo(1 / 3);
    expect(evidence.components.walking).toBeNull();
  });
  it('rewards core quality, shorter walks and supported safety', () => {
    const good = hotelEvidence(hotel, targets, [walk], [zone], 1000);
    const worse = hotelEvidence({ ...hotel, priceTotal: 2000, booking: { ...hotel.booking, score: 9.8, categoryScores: { ...categoryScores, cleanliness: 6, comfort: 6, facilities: 6 } } }, targets, [{ ...walk, minutes: 45 }], [{ ...zone, safety: 40 }], 1000);
    expect(good.score).toBeGreaterThan(worse.score);
    expect(good.components.quality).toBeGreaterThan(worse.components.quality);
  });
  it('loads the real city dataset, favorites, itineraries and neighborhood polygons', () => {
    const context = hotelRankingContext('roma');
    expect(context.targets.points.length).toBeGreaterThan(0);
    expect(context.zones.length).toBeGreaterThan(0);
    expect(() => hotelRankingContext('missing-city')).toThrow();
  });
});

describe('routing and JEV resilience', () => {
  it('bounds reranking input, rejects duplicates and strips untrusted extra fields', () => {
    expect(() => validateRankingHotels([])).toThrow();
    expect(() => validateRankingHotels([hotel, hotel])).toThrow();
    expect(() => validateRankingHotels([{ ...hotel, lat: 200 }])).toThrow();
    expect(() => validateRankingHotels([{ ...hotel, booking: { score: 99 } }])).toThrow();
    expect(validateRankingHotels([{ ...hotel, ranking: { score: 100 }, apiKey: 'must-not-pass' }])[0]).toEqual({ ...hotel, booking: { score: 9, reviews: 500 } });
  });
  it('uses the foot profile, returns a real route and preserves unreachable destinations as null', async () => {
    const points = [point, { ...point, id: 'other', lat: 41.9 }];
    const result = await walkingMatrix([hotel], points, { pause, fetchImpl: async (url: string) => {
      expect(url).toContain('/routed-foot/table/v1/foot/');
      expect(url).toContain('sources=0');
      return response({ code: 'Ok', durations: [[600, null]], distances: [[750, null]], sources: [{ distance: 5 }], destinations: [{ distance: 2 }, { distance: 3 }] });
    } });
    expect(result[0][0].minutes).toBe(10);
    expect(result[0][1]).toBeNull();
  });
  it('does not turn a routing failure into fabricated walking times', async () => {
    const result = await walkingMatrix([{ ...hotel, lat: 41.89123 }], [point], { fetchImpl: unavailable, pause });
    expect(result).toEqual([[null]]);
  });
  it('recovers from a transient routing connection failure with one delayed retry', async () => {
    let calls = 0;
    const waits: number[] = [];
    const result = await walkingMatrix([{ ...hotel, lat: 41.89456 }], [point], {
      pause: async (ms: number) => { waits.push(ms); },
      fetchImpl: async () => {
        if (++calls === 1) throw new TypeError('connection timeout');
        return response({ code: 'Ok', durations: [[600]], distances: [[750]], sources: [{ distance: 0 }], destinations: [{ distance: 0 }] });
      },
    });
    expect(calls).toBe(2);
    expect(waits).toContain(1500);
    expect(result[0][0].minutes).toBe(10);
  });
  it('rejects snapping far from the actual location', async () => {
    const result = await walkingMatrix([{ ...hotel, lat: 41.89234 }], [point], { pause, fetchImpl: async () => response({ code: 'Ok', durations: [[60]], distances: [[50]], sources: [{ distance: 1000 }], destinations: [{ distance: 0 }] }) });
    expect(result).toEqual([[null]]);
  });
  it('validates JEV scores and retains confidence for bounded influence', async () => {
    const hotels = [hotel, { ...hotel, id: 'h2' }, { ...hotel, id: 'h3' }].map((h) => ({ ...h, ranking: hotelEvidence(h, targets, [walk], [zone], 1000) }));
    const result = await evaluateJev(hotels, { apiKey: 'test', pause, fetchImpl: async (_url: string, init: RequestInit) => {
      expect(JSON.parse(String(init.body)).questions['0'].type).toBe('score');
      return response({ model: 'jev-test', answers: { '0': { type: 'score', score: 3.5, confidence: 0.9 }, '1': { type: 'score', score: 4, confidence: 0.4 }, '2': { type: 'score', score: 90, confidence: 0.9 } } });
    } });
    expect(result.status).toBe('partial');
    expect(result.scores[0].score).toBe(87.5);
    expect(result.scores[1].confidence).toBe(0.4);
    expect(result.scores[2]).toBeNull();
  });
  it('retries transient overload once, without exposing provider errors', async () => {
    let calls = 0;
    const h = { ...hotel, name: 'Retry Hotel', ranking: hotelEvidence(hotel, targets, [walk], [], 1000) };
    const result = await evaluateJev([h], { apiKey: 'test', pause, fetchImpl: async () => { calls++; return response({ error: 'private upstream details' }, 529); } });
    expect(calls).toBe(2);
    expect(result).toEqual({ status: 'unavailable', scores: [] });
  });
  it('still ranks when both network services fail', async () => {
    const result = await rankHotels([{ ...hotel, lat: 41.89123 }, { ...hotel, id: 'expensive', lat: 41.89233, priceTotal: 3000 }], { targets, zones: [] }, { apiKey: 'test', fetchImpl: unavailable, pause });
    expect(result.hotels.map((h: typeof hotel) => h.id)).toEqual(['h', 'expensive']);
    expect(result.hotels[0].ranking.position).toBeNull();
    expect(result.hotels[0].ranking.provisional).toBe(true);
    expect(result.ranking.jevStatus).toBe('unavailable');
  });
  it('limits model influence according to confidence instead of replacing the evidence score', async () => {
    const h = { ...hotel, id: 'confidence-test', name: 'Confidence test hotel', lat: 41.89765 };
    const result = await rankHotels([h], { targets: { points: [], transport: [], totalPoints: 0 }, zones: [] }, {
      apiKey: 'test', pause,
      fetchImpl: async () => response({ model: 'jev-test', answers: { '0': { type: 'score', score: 4, confidence: 0.4 } } }),
    });
    const r = result.hotels[0].ranking;
    expect(r.jev.weight).toBeCloseTo(0.06);
    expect(r.score).toBe(Math.round(r.baseScore * 0.94 + 100 * 0.06));
  });
});


describe('walking priorities without price', () => {
  it('fully rewards up to 30 minutes and penalizes long walks continuously', () => {
    expect([0, 15, 30, 60, 90, 105, 120, 180].map(walkingDestinationScore)).toEqual([100, 100, 100, 62.5, 25, 12.5, 0, 0]);
  });
  it('penalizes more distant destinations even with the same average duration', () => {
    const targets = { points: [{ weight: 1 }, { weight: 1 }], totalPoints: 2 };
    const near = hotelEvidence(hotel, targets, [{ minutes: 30 }, { minutes: 30 }], []);
    const mixed = hotelEvidence(hotel, targets, [{ minutes: 0 }, { minutes: 60 }], []);
    const far = hotelEvidence(hotel, targets, [{ minutes: 30 }, { minutes: 120 }], []);
    const allFar = hotelEvidence(hotel, targets, [{ minutes: 120 }, { minutes: 120 }], []);
    expect(near.walkingMinutes).toBe(mixed.walkingMinutes);
    expect(near.components.walking).toBeGreaterThan(mixed.components.walking);
    expect(far.components.walking).toBeGreaterThan(allFar.components.walking);
    expect(far.beyond90).toBe(1);
    expect(allFar.beyond90).toBe(2);
    expect(near.reachableWithin30).toBe(2);
  });
  it('does not change scores when only price changes', () => {
    const targets = { points: [], totalPoints: 0 };
    const a = hotelEvidence(hotel, targets, [], []);
    const b = hotelEvidence({ ...hotel, priceTotal: 99999 }, targets, [], []);
    expect(b).toEqual(a);
    expect(a.components).not.toHaveProperty('price');
  });
});


describe('neighborhood evidence coverage', () => {
  it('identifies each previously uncovered hotel region without inventing unverified safety', () => {
    const { zones } = hotelRankingContext('roma');
    const hotels = [
      [41.93960,12.46951], [41.914775,12.554378], [41.943757,12.474686],
      [41.93160,12.52713], [41.915673,12.444498], [41.919452,12.517713],
      [41.912685,12.502254], [41.936966,12.533122], [41.912966,12.499044],
      [41.910040,12.497105], [41.894999,12.439190],
    ];
    for (const [lat, lng] of hotels) {
      const region = hotelRegion({ lat, lng }, zones);
      expect(region, `${lat},${lng}`).not.toBeNull();
      expect(region.sources.length).toBeGreaterThan(0);
      expect(region.period).toBe('2026-09-20');
    }
    // This hotel is in Tiburtino Nord (5C), not the reviewed Pietralata zone (5G).
    expect(hotelRegion({lat: 41.914775, lng: 12.554378}, zones).safety).toBeNull();
    expect(hotelRegion({lat: 0, lng: 0}, zones)).toBeNull();
  });
  it('never substitutes a missing criterion with 50 or assigns a final position', async () => {
    const result = await rankHotels([hotel], {targets: {points: [], transport: [], totalPoints: 0}, zones: []}, {});
    expect(result.hotels[0].ranking.baseScore).toBe(result.hotels[0].ranking.components.quality);
    expect(result.hotels[0].ranking.position).toBeNull();
    expect(result.hotels[0].ranking.provisional).toBe(true);
  });
});


describe('map and ranking shared study boundaries', () => {
  it('uses the same closed polygon for display and membership', () => {
    for (const zone of ROME_HOTEL_NEIGHBORHOODS) {
      expect(zone.rings[0][0]).toEqual(zone.rings[0].at(-1));
      expect(hotelRegion(zone, [zone])?.id).toBe(zone.id);
      expect(hotelRegion(zone, [zone])?.coverage).toBe('polygon');
      expect(hotelRegion({ lat: zone.lat + 1, lng: zone.lng }, [zone])).toBeNull();
    }
  });
  it('keeps precise neighborhood boundaries ahead of approximate study areas', () => {
    const approximate = {...ROME_HOTEL_NEIGHBORHOODS[0], lat: hotel.lat, lng: hotel.lng, safety: null, polygons: undefined, approximate: true, rings: [[[41.88,12.48],[41.90,12.48],[41.90,12.50],[41.88,12.50],[41.88,12.48]]]};
    const precise = {...approximate, id: 'precise', approximate: false, safety: 80};
    expect(hotelRegion(hotel, [approximate, precise])?.id).toBe('precise');
  });
});


it('does not assign a hotel inside a polygon hole to the surrounding neighborhood', () => {
  const outer = [[41,12],[43,12],[43,14],[41,14],[41,12]];
  const hole = [[41.8,12.8],[42.2,12.8],[42.2,13.2],[41.8,13.2],[41.8,12.8]];
  const z = {...zone, polygons: [[outer,hole]], rings: [outer]};
  expect(hotelRegion({lat:42,lng:13},[z])).toBeNull();
  expect(hotelRegion({lat:41.5,lng:12.5},[z])?.id).toBe(z.id);
});


it('covers the mapped five-kilometer footprint using individual urban zones', () => {
  expect(ROME_HOTEL_COVERAGE.radiusM).toBe(5000);
  expect(ROME_HOTEL_COVERAGE.uncoveredMappedAreaM2).toBeLessThan(1);
  expect(ROME_HOTEL_NEIGHBORHOODS.length).toBeGreaterThan(40);
  expect(ROME_HOTEL_NEIGHBORHOODS.every(z => z.boundaryCodes.length === 1)).toBe(true);
  expect(new Set(ROME_HOTEL_NEIGHBORHOODS.map(z => z.boundaryCodes[0])).size).toBe(ROME_HOTEL_NEIGHBORHOODS.length);
});

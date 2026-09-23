import { describe, expect, it } from 'vitest';
import research from './rome-neighborhood-safety.json';
import { ROME_HOTEL_NEIGHBORHOODS } from './rome-hotel-neighborhoods';
import { hotelRegion } from '../../scripts/hotel-ranking.mjs';

const previouslyUnrated = '20A 5C 5G 9A 9B 9E 11A 11B 11D 11E 11X 15A 15B 16X 17B 1X 20X 2X 2Y 3B 3X 3Y 4B 4G 4L 5A 5B 5H 6A 6B 6C 6D'.split(' ');
describe('Rome neighborhood safety review', () => {
  it('accounts for every previously unreviewed zone with traceable evidence', () => {
    expect(research.reviews.map(r => r.code).sort()).toEqual([...previouslyUnrated].sort());
    for (const review of research.reviews) {
      const zone = ROME_HOTEL_NEIGHBORHOODS.find(z => z.boundaryCodes.includes(review.code))!;
      expect(zone, review.code).toBeDefined();
      expect(zone.reviewStatus).toBe(review.status);
      expect(zone.note).toEqual(review.note);
      expect(review.sourceIds.length).toBeGreaterThan(0);
      for (const id of review.sourceIds) {
        const source = research.sources[id as keyof typeof research.sources];
        expect(source, `${review.code}: ${id}`).toBeDefined();
        expect(source.url).toMatch(/^https:\/\//);
        expect(['full-text', 'indexed-excerpt']).toContain(source.access);
        expect(zone.sources).toContainEqual(source);
      }
    }
    expect(ROME_HOTEL_NEIGHBORHOODS.some(z => z.reviewStatus === 'pending')).toBe(false);
  });
  it('keeps inconclusive and special-use areas unscored throughout map and ranking', () => {
    for (const review of research.reviews.filter(r => r.status !== 'editorial')) {
      const zone = ROME_HOTEL_NEIGHBORHOODS.find(z => z.boundaryCodes.includes(review.code))!;
      expect(zone.safety).toBeNull();
      expect(zone.mapBand).toBe('unknown');
      const region = hotelRegion(zone, [zone]);
      expect(region?.safety).toBeNull();
      expect(region?.reviewStatus).toBe(review.status);
      expect(region?.period).toBe(research.reviewedAt);
    }
  });
  it('exposes numeric judgments as limited-confidence editorial inference', () => {
    for (const review of research.reviews.filter(r => r.status === 'editorial')) {
      const zone = ROME_HOTEL_NEIGHBORHOODS.find(z => z.boundaryCodes.includes(review.code))!;
      expect([70, 80]).toContain(zone.safety);
      expect(zone.confidence).toBe('limited');
      expect(zone.assessment).toBe('editorial-inference');
    }
  });
});

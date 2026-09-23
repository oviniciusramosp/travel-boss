import { describe, it, expect } from 'vitest';
import { parseCategoryScores, bookingEligibility } from '../../scripts/hotel-booking-details.mjs';
import { bookingReference } from '../../scripts/hotel-search.mjs';
import { hotelEvidence, evaluateJev, rankHotels } from '../../scripts/hotel-ranking.mjs';

const categories = { cleanliness: 9, comfort: 8, facilities: 7, staff: 7, wifi: 3, location: 1, value: 1 };
const booking = { categoryScores: categories, wifiAvailable: true, score: 4, reviews: 100 };
const hotel = { id: 'categories', name: 'Category test', lat: 41.9, lng: 12.49, priceTotal: 1000, currency: 'BRL', booking };
const targets = { points: [], transport: [], totalPoints: 0 };
const context = { targets, zones: [] };

describe('Booking categories and prerequisites', () => {
  it('parses accessible labels, decimal comma, duplicates and unknown values', () => {
    const scores = parseCategoryScores([{ label: 'Cleanliness', value: '7,8' }, { label: 'Comfort', value: '8.0' }, { label: 'Cleanliness', value: '7.8' }, { label: 'Location', value: '11' }, { label: 'Staff', value: '' }, { label: 'Noise', value: '9' }]);
    expect(scores).toEqual({ cleanliness: 7.8, comfort: 8, facilities: null, staff: null, wifi: null, location: null, value: null });
  });
  it('treats Wi-Fi presence as mandatory independently of its score', () => {
    expect(bookingEligibility(booking).status).toBe('eligible');
    expect(bookingEligibility({ ...booking, wifiAvailable: false }).failures).toEqual(['wifi']);
    expect(bookingEligibility({ ...booking, wifiAvailable: null }).status).toBe('pending');
  });
  it('enforces staff 7.0 as a cutoff and does not mistake missing data for a pass', () => {
    expect(bookingEligibility({ ...booking, categoryScores: { ...categories, staff: 6.9 } }).status).toBe('excluded');
    expect(bookingEligibility({ ...booking, categoryScores: { ...categories, staff: null } }).status).toBe('pending');
    expect(bookingEligibility({ ...booking, categoryScores: { ...categories, comfort: null } }).unknown).toContain('comfort');
  });
  it('ignores overall, location, value, Wi-Fi score and higher staff scores in our model', () => {
    const first = hotelEvidence(hotel, targets, [], [], 1000);
    const next = hotelEvidence({ ...hotel, booking: { ...booking, score: 10, categoryScores: { ...categories, location: 10, value: 10, staff: 10, wifi: 10 } } }, targets, [], [], 1000);
    expect(first.components.quality).toBe(80);
    expect(next.score).toBe(first.score);
  });
  it('does not send ignored numerical scores to JEV', async () => {
    let request: any;
    const h = { ...hotel, ranking: hotelEvidence(hotel, targets, [], [], 1000) };
    await evaluateJev([h], { apiKey: 'test', fetchImpl: async (_url, options) => {
      request = JSON.parse(options.body);
      return new Response(JSON.stringify({ model: 'test', answers: { '0': { type: 'score', score: 3, confidence: 0.9 } } }));
    } });
    expect(request.state[0]).not.toHaveProperty('priceTotal');
    expect(request.state[0]).not.toHaveProperty('currency');
    expect(request.state[0].components).not.toHaveProperty('price');
    expect(request.state[0].booking).toEqual({ cleanliness: 9, comfort: 8, facilities: 7, reviews: 100 });
    expect(request.state[0].requirements).toEqual({ wifiPresent: true, staffMinimumPassed: true });
    expect(request.questions['0'].instructions).toContain('Ignore Booking overall, location and value-for-money');
  });
  it('never ranks or calls JEV for failed or unconfirmed prerequisites', async () => {
    let called = false;
    const result = await rankHotels([{ ...hotel, booking: { ...booking, wifiAvailable: false } }, { ...hotel, id: 'missing', booking: { ...booking, wifiAvailable: null } }], context, {
      apiKey: 'test', fetchImpl: async () => { called = true; throw new Error('unexpected'); },
    });
    expect(called).toBe(false);
    expect(result.hotels.every((h) => h.ranking.score === null && h.ranking.position === null)).toBe(true);
    expect(result.ranking.eligibilityCounts).toEqual({ eligible: 0, pending: 1, excluded: 1 });
  });
  it('only loads property details from validated Booking URLs', () => {
    expect(bookingReference({ url: 'https://www.booking.com/hotel/it/cola-vatican-rooms.html?checkin=2026-10-16' })).toEqual({ countryCode: 'it', pageName: 'cola-vatican-rooms' });
    expect(bookingReference({ url: 'https://evil.example/hotel/it/cola.html' })).toBeNull();
    expect(bookingReference({ url: 'file:///etc/passwd' })).toBeNull();
    expect(bookingReference({ url: 'https://www.booking.com/searchresults.html' })).toBeNull();
  });
});

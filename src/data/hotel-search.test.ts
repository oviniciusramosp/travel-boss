import { describe, expect, it } from 'vitest';
import {
  accommodationType,
  azulHotelUrl,
  bestBookingMatch,
  bookingPhotoUrl,
  bookingHotelUrl,
  bookingImageLarge,
  filterCandidates,
  haversineM,
  isMatch,
  nameOverlap,
  nightsBetween,
  normalizeHotelName,
  parseBookingScore,
  pickZone,
  simplifyHotelName,
} from '../../scripts/hotel-search-match.mjs';

describe('hotel-search matching', () => {
  it('normalizes names down to identity tokens', () => {
    expect(normalizeHotelName('Raeli Hotel Floridia', 'Roma')).toEqual(['raeli', 'floridia']);
    expect(normalizeHotelName('Hotel Floridia', 'Roma')).toEqual(['floridia']);
    expect(normalizeHotelName('Seven Hills Camping &amp; Village', 'Roma')).toEqual([
      'seven', 'hills', 'camping', 'village',
    ]);
    // Nothing left → keep the words instead of an empty set
    expect(normalizeHotelName('Hotel Roma', 'Roma')).toEqual(['hotel', 'roma']);
  });

  it('scores overlap by the shorter side, prefix tolerant', () => {
    const a = normalizeHotelName('Hotel Floridia', 'Roma');
    const b = normalizeHotelName('Raeli Hotel Floridia', 'Roma');
    expect(nameOverlap(a, b)).toBe(1);
    expect(nameOverlap(['diocleziano'], ['dioclezian', 'palace'])).toBe(1);
    expect(nameOverlap(['quirinale'], ['napoleon'])).toBe(0);
    expect(nameOverlap([], ['x'])).toBe(0);
  });

  it('measures distance in meters', () => {
    // Hotel Floridia: Azul vs Booking geocodes (~40m apart)
    const d = haversineM(41.9058, 12.5004, 41.90581743, 12.50044651);
    expect(d).toBeGreaterThan(0);
    expect(d).toBeLessThan(60);
    // Termini → Colosseum ≈ 1.6 km
    expect(Math.round(haversineM(41.9009, 12.5017, 41.8902, 12.4922) / 100)).toBe(14);
  });

  it('accepts same-name hotels nearby and rejects far or unrelated ones', () => {
    expect(isMatch({ overlap: 1, distanceM: 120 })).toBe(true);
    expect(isMatch({ overlap: 1, distanceM: 900 })).toBe(false);
    // A full match on a 3-word name survives a loose Azul geocode:
    // Domus Vatican Holiday's is 930 m from Booking's pin for the same name
    expect(isMatch({ overlap: 1, distanceM: 930, tokens: 3 })).toBe(true);
    expect(isMatch({ overlap: 1, distanceM: 1800, tokens: 3 })).toBe(false);
    // One-word names stay tight — "Hotel Paris" must not match across town
    expect(isMatch({ overlap: 1, distanceM: 930, tokens: 1 })).toBe(false);
    expect(isMatch({ overlap: 0.5, distanceM: 150 })).toBe(true);
    expect(isMatch({ overlap: 0.5, distanceM: 400 })).toBe(false);
    expect(isMatch({ overlap: 0, distanceM: 10 })).toBe(false);
    expect(isMatch({ overlap: 1, distanceM: NaN })).toBe(false);
  });

  it('parses Booking review-score text', () => {
    expect(parseBookingScore('Scored 8.2 8.2Very Good 1,690 reviews')).toEqual({
      score: 8.2, label: 'Very Good', reviews: 1690,
    });
    expect(parseBookingScore('Scored 7.8 7.8Good 2,944 reviews')).toEqual({
      score: 7.8, label: 'Good', reviews: 2944,
    });
    expect(parseBookingScore('Scored 9.0 9.0 Exceptional')).toEqual({
      score: 9, label: 'Exceptional', reviews: null,
    });
    expect(parseBookingScore('')).toEqual({ score: null, label: null, reviews: null });
  });

  it('filters Azul candidates by total stay price, cheapest first without a centre', () => {
    const hotels = [
      { id: 'a', price: 806.67, lat: 41.9, lng: 12.5 },
      { id: 'b', price: 333.26, lat: 41.9, lng: 12.5 },
      { id: 'c', price: 0, lat: 41.9, lng: 12.5 },
      { id: 'd', price: 500, lat: NaN, lng: 12.5 },
      { id: 'e', price: 2000, lat: 41.9, lng: 12.5 },
    ];
    expect(filterCandidates(hotels, { minTotal: 300, maxTotal: 1000 }).map((h) => h.id)).toEqual(['b', 'a']);
    expect(nightsBetween('2026-10-10', '2026-10-12')).toBe(2);
  });

  it('prefers central hotels over cheap outliers when a centre is given', () => {
    // Real Rome case: the cheapest rooms are campsites far from the centre,
    // so a price-ordered cut dropped Raeli Hotel Regio (1.76 km, R$2275).
    const centre = { lat: 41.8955, lng: 12.4823 };
    const hotels = [
      { id: 'campsite', price: 400, lat: 41.9926, lng: 12.4159 },
      { id: 'ringroad', price: 500, lat: 41.9455, lng: 12.6062 },
      { id: 'regio', price: 2275, lat: 41.9087, lng: 12.4972 },
      { id: 'colosseo', price: 2453, lat: 41.8901, lng: 12.4885 },
    ];
    const picked = filterCandidates(hotels, { maxTotal: 2500, centre, maxKm: 3, limit: 2 });
    expect(picked.map((h) => h.id)).toEqual(['colosseo', 'regio']);
    expect(picked[0].km).toBeLessThan(1);

    // maxKm keeps the far ones out entirely
    expect(
      filterCandidates(hotels, { maxTotal: 2500, centre, maxKm: 3 }).map((h) => h.id),
    ).toEqual(['colosseo', 'regio']);
    // No centre → price order, no km
    expect(filterCandidates(hotels, { maxTotal: 2500 })[0].id).toBe('campsite');
    expect(filterCandidates(hotels, { maxTotal: 2500 })[0].km).toBeNull();
  });

  it('picks the city zone over stations and areas', () => {
    const zones = [
      { name: 'La Romana, La Romana, República Dominicana', id: '1015', type: 'zone' },
      { name: 'Roma, Lácio, Itália', id: '14525', type: 'zone' },
      { name: 'Roma Area - Anticoli Corrado, Lácio, Itália', id: '32697', type: 'zone' },
      { name: 'Roma Ostiense railway station, Roma, Lácio, Itália', id: '131562', type: 'zone' },
    ];
    expect(pickZone(zones, 'roma')?.id).toBe('14525');
    expect(pickZone(zones, 'Rôma')?.id).toBe('14525');
    expect(pickZone([], 'roma')).toBeNull();
  });

  it('builds outbound links', () => {
    expect(azulHotelUrl('GHU@JP301422')).toBe(
      'https://www.azulviagens.com.br/hotels/details.aspx?UID=GHU@JP301422',
    );
    expect(
      bookingHotelUrl('https://www.booking.com/hotel/it/floridia.html?aid=1', {
        checkin: '2026-10-10', checkout: '2026-10-12', adults: 2,
      }),
    ).toBe(
      'https://www.booking.com/hotel/it/floridia.html?checkin=2026-10-10&checkout=2026-10-12&group_adults=2&no_rooms=1&selected_currency=BRL',
    );
    expect(bookingImageLarge('https://cf.bstatic.com/xdata/images/hotel/square240/1.webp?k=x&o=')).toBe(
      'https://cf.bstatic.com/xdata/images/hotel/max500/1.webp?k=x&o=',
    );
    expect(bookingImageLarge(null)).toBeNull();
  });

  it('picks the right card even when a sponsored hotel is listed first', () => {
    const azul = { name: 'Hotel degli Imperatori', lat: 41.8615, lng: 12.4392 };
    const cards = [
      { name: 'Hotel Sonya', lat: 41.90002, lng: 12.49557, scoreText: 'Scored 7.8 7.8Good 2,944 reviews' },
      { name: 'Hotel Imperatori', lat: 41.8612, lng: 12.4395, scoreText: 'Scored 8.4 8.4Very Good 900 reviews' },
      { name: 'Villa Imperatori Guest House', lat: 41.8630, lng: 12.4420, scoreText: 'Scored 9.1 9.1Wonderful 40 reviews' },
      { name: 'No coords', scoreText: 'Scored 9.9' },
    ];
    const { best, nearest } = bestBookingMatch(azul, cards, 'Roma');
    expect(best?.card.name).not.toBe('Hotel Sonya');
    // Sponsored first card is 7 km away → skipped; two cards share "imperatori" → the closer one wins
    expect(best?.card.name).toBe('Hotel Imperatori');
    expect(best?.distanceM).toBeLessThan(60);
    expect(nearest?.card.name).toBe('Hotel Imperatori');
    expect(bestBookingMatch(azul, [cards[0]], 'Roma').best).toBeNull();
    expect(bestBookingMatch(azul, [], 'Roma')).toEqual({ best: null, nearest: null });
  });

  it('simplifies names for the Booking retry query', () => {
    expect(simplifyHotelName('Seven Hills Camping &amp; Village', 'Roma')).toBe('seven hills camping village');
    expect(simplifyHotelName('Hotel Roma', 'Roma')).toBe('hotel roma');
  });

  it('maps Booking accommodation type ids', () => {
    expect(accommodationType(204).pt).toBe('Hotel');
    expect(accommodationType(203).pt).toBe('Albergue');
    expect(accommodationType(216).pt).toBe('Pousada');
    expect(accommodationType('201').pt).toBe('Apartamento');
    expect(accommodationType(999)).toEqual({ id: 999, en: 'Other', pt: 'Outro' });
    expect(accommodationType(undefined).id).toBeNull();
  });

  it('rewrites Booking photo URLs to a bigger size', () => {
    expect(bookingPhotoUrl('/xdata/images/hotel/square60/184300736.jpg?k=abc')).toBe(
      'https://cf.bstatic.com/xdata/images/hotel/max500/184300736.jpg?k=abc',
    );
    expect(
      bookingPhotoUrl('https://cf.bstatic.com/xdata/images/hotel/square240/1.webp?k=x&o=', 'max1024x768'),
    ).toBe('https://cf.bstatic.com/xdata/images/hotel/max1024x768/1.webp?k=x&o=');
    expect(bookingPhotoUrl(null)).toBeNull();
  });
});

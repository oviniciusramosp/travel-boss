import { describe, expect, it } from 'vitest';
import { cityStayFromTrips, defaultStayDates, hashStayDates } from './hotel-dates';

const markdown = `# Europa

## Paris
city: paris
dates: 2026-10-02 → 2026-10-06
`;

describe('hotel stay dates', () => {
  it('reads the trip header query and ignores a reversed range', () => {
    expect(hashStayDates('#/city/paris/hotels?in=2026-10-02&out=2026-10-06')).toEqual({
      checkin: '2026-10-02',
      checkout: '2026-10-06',
    });
    expect(hashStayDates('#/city/paris/hotels?in=2026-10-06&out=2026-10-02')).toBeNull();
  });

  it('prefers the url, then a future itinerary, then a month ahead', () => {
    const future = { checkin: '2026-10-02', checkout: '2026-10-06' };
    const url = { checkin: '2026-11-01', checkout: '2026-11-04' };
    expect(defaultStayDates('2026-09-23', future, url)).toEqual(url);
    expect(defaultStayDates('2026-09-23', future, null)).toEqual(future);
    expect(defaultStayDates('2026-12-01', future, null)).toEqual({
      checkin: '2026-12-31',
      checkout: '2027-01-02',
    });
  });

  it('reads dates from the trip markdown for that city', () => {
    expect(cityStayFromTrips('paris', [{ id: 'europa', raw: markdown }])).toEqual({
      checkin: '2026-10-02',
      checkout: '2026-10-06',
    });
    expect(cityStayFromTrips('roma', [{ id: 'europa', raw: markdown }])).toBeNull();
  });
});
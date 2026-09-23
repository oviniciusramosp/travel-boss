import { parseTrip } from '../trip/parse';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type StayRange = { checkin: string; checkout: string };

export function addIsoDays(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year || 0, (month || 1) - 1, day || 1);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function validStayRange(checkin: string | null | undefined, checkout: string | null | undefined): StayRange | null {
  if (!checkin || !checkout || !ISO_DATE.test(checkin) || !ISO_DATE.test(checkout)) return null;
  return checkout > checkin ? { checkin, checkout } : null;
}

/** `#/city/paris/hotels?in=…&out=…` from the trip header. */
export function hashStayDates(hash: string): StayRange | null {
  const query = hash.includes('?') ? hash.slice(hash.indexOf('?') + 1) : '';
  const params = new URLSearchParams(query);
  return validStayRange(params.get('in') ?? params.get('checkin'), params.get('out') ?? params.get('checkout'));
}

export function cityStayFromTrips(slug: string, files: { id: string; raw: string }[]): StayRange | null {
  for (const file of files) {
    if (!file || typeof file.raw !== 'string' || typeof file.id !== 'string') continue;
    const trip = parseTrip(file.id, `${file.id}.md`, file.raw);
    const city = trip.cities.find((item) => item.slug === slug && item.dates);
    const range = validStayRange(city?.dates?.start, city?.dates?.end);
    if (range) return range;
  }
  return null;
}

/**
 * URL wins, then a future itinerary, then a two-night stay a month out.
 * A past itinerary is not a usable default.
 */
export function defaultStayDates(
  today: string,
  itinerary: StayRange | null,
  url: StayRange | null,
): StayRange {
  if (url) return url;
  if (itinerary && itinerary.checkin >= today) return itinerary;
  return { checkin: addIsoDays(today, 30), checkout: addIsoDays(today, 32) };
}

/**
 * City itinerary tab (not the `#/trip/` document).
 * Counts, budget tips and the Google Maps link for one day.
 */
import { dayPrimaryRoutePlaceIds, pickLocale, resolveVisit, travelUi } from '../catalog';
import type { ItineraryDay, ItineraryStop, Locale, TravelPlace } from '../catalog';
import { googleDirectionsUrl } from '../trip/directions';

export type RoutePhase = 'idle' | 'drawing' | 'on';

type Money = { currency?: string; free?: boolean; min?: number; max?: number };

/** Same typical-euro rule as the catalog budget. Catalog does not re-export it. */
export function typicalEur(money: Money | undefined): number {
  if (!money || money.free) return 0;
  if (money.currency && money.currency !== 'EUR') return 0;
  if (money.min != null && Number.isFinite(money.min)) return money.min;
  if (money.max != null && Number.isFinite(money.max)) return money.max;
  return 0;
}

export function formatEur(amount: number, locale: Locale): string {
  const cents = Math.round(amount * 100);
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100);
}

export function primaryStopCount(stops: readonly ItineraryStop[]): number {
  return dayPrimaryRoutePlaceIds({
    id: '',
    day: 1,
    title: { en: '', 'pt-BR': '' },
    stops: [...stops],
  }).length;
}

export function stopCountLabel(count: number, locale: Locale): string {
  return pickLocale(locale, {
    en: count === 1 ? '1 stop' : `${count} stops`,
    'pt-BR': count === 1 ? '1 parada' : `${count} paradas`,
  });
}

export function routeActionLabel(phase: RoutePhase, locale: Locale): string {
  if (phase === 'drawing') {
    return pickLocale(locale, { en: 'Drawing…', 'pt-BR': 'Traçando…' });
  }
  if (phase === 'on') return pickLocale(locale, travelUi.itineraryOnMap);
  return pickLocale(locale, travelUi.itineraryShowRoute);
}

/** Drop missing coordinates and a repeated pin so Maps does not get an empty hop. */
export function directionPoints(
  ids: readonly string[],
  coords: ReadonlyMap<string, { lat: number; lng: number }>,
): { lat: number; lng: number }[] {
  const points: { lat: number; lng: number }[] = [];
  for (const id of ids) {
    const point = coords.get(id);
    if (!point || !Number.isFinite(point.lat) || !Number.isFinite(point.lng)) continue;
    const prev = points[points.length - 1];
    if (prev && prev.lat === point.lat && prev.lng === point.lng) continue;
    points.push({ lat: point.lat, lng: point.lng });
  }
  return points;
}

export function dayDirectionsUrl(
  ids: readonly string[],
  coords: ReadonlyMap<string, { lat: number; lng: number }>,
): string | null {
  return googleDirectionsUrl(directionPoints(ids, coords), 'transit');
}

/** Default arrival, matching `computeTripBudget`. */
export function budgetDay(day: ItineraryDay): ItineraryDay {
  if (!day.arrivals?.length) return day;
  const chosen = day.arrivals.find((item) => item.default) ?? day.arrivals[0];
  return chosen ? { ...day, stops: chosen.stops } : day;
}

export function moneyTip(
  ids: readonly string[],
  places: Map<string, TravelPlace>,
  locale: Locale,
  kind: 'food' | 'ticket',
): string {
  const parts: string[] = [];
  for (const id of ids) {
    const place = places.get(id);
    if (!place) continue;
    const visit = resolveVisit(id, place.visit);
    const amount =
      kind === 'food' ? typicalEur(visit?.avgPricePerPerson) : typicalEur(visit?.ticket);
    if (amount <= 0) continue;
    parts.push(`${pickLocale(locale, place.name)} ${formatEur(amount, locale)}`);
  }
  return parts.join(' · ');
}

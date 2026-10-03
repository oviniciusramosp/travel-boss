import { scheduleDays } from './calendar';
import { travelCities } from '../catalog';
import type { Trip, TripStop } from './parse';

/** Only the current action, before the reservation's multiline details. */
function luggageEvent(stop: TripStop): 'in' | 'out' | undefined {
  const text = [stop.label, stop.note].filter(Boolean).join(' — ').split('\n')[0]!
    .replace(/\*+/g, '').toLowerCase();
  if (/(?:^|[;—]\s*)(?:deixar|guardar|depositar)\s+(?:as\s+)?malas\b/.test(text)) return 'in';
  if (/(?:^|[;—]\s*)(?:retirar|recolher|buscar)\s+(?:as\s+)?malas\b/.test(text)) return 'out';
  if (/(?:^|[;—]\s*)(?:saída|partida|chegada|desembarque)\s+com\s+as\s+malas\b/.test(text)) return 'out';
  const match = /(?:^|[;—]\s*)check[\s-]?(in|out)\b/.exec(text);
  if (match?.[1] === 'in') {
    // Airline check-in does not mean bags have been left at the accommodation.
    if (/check[\s-]?in\s+(?:online|on-line|do voo|para o voo)\b/.test(text)) return undefined;
    const place = travelCities.flatMap(city => city.places).find(place => place.id === stop.placeId);
    if (place && place.category !== 'lodging') return undefined;
  }
  return match?.[1] as 'in' | 'out' | undefined;
}

/** Carry across cities/dates; a luggage deposit suspends carrying until collection. */
export function luggageStops(trip: Trip): Set<TripStop> {
  const marked = new Set<TripStop>();
  let carrying = false;
  for (const { day } of scheduleDays(trip)) {
    for (const stop of day.stops) {
      const event = luggageEvent(stop);
      if (event === 'out') carrying = true;
      if (carrying) marked.add(stop);
      if (event === 'in') carrying = false;
    }
  }
  return marked;
}

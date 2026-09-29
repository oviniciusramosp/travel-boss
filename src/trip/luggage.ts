import { scheduleDays } from './calendar';
import type { Trip, TripStop } from './parse';

/** Only the current action, before the reservation's multiline details. */
function luggageEvent(stop: TripStop): 'in' | 'out' | undefined {
  const text = [stop.label, stop.note].filter(Boolean).join(' — ').split('\n')[0]!
    .replace(/\*+/g, '').toLowerCase();
  const match = /(?:^|[;—]\s*)check[\s-]?(in|out)\b/.exec(text);
  return match?.[1] as 'in' | 'out' | undefined;
}

/** Carry across cities/dates. Checkout and arrival at check-in both involve luggage. */
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

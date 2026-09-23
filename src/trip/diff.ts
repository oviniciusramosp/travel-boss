import type { Trip, TripStop } from './parse';
import { stopKey } from './view-state';

/** City, day, index and place id or label. The text is compared apart from the key. */
export function stopFingerprint(stop: TripStop): string {
  return [
    stop.time ?? '',
    stop.label,
    stop.placeId ?? '',
    stop.href ?? '',
    stop.note ?? '',
    stop.leg?.detail ?? '',
    stop.listNote ? 'note' : '',
  ].join('\0');
}

function visitStops(trip: Trip, visit: (key: string, fingerprint: string) => void) {
  for (const city of trip.cities) {
    const cityId = city.slug || city.name;
    city.days.forEach((day, dayIndex) => {
      day.stops.forEach((stop, stopIndex) => {
        visit(
          stopKey(cityId, dayIndex, day.title, stopIndex, stop.placeId, stop.label),
          stopFingerprint(stop),
        );
      });
    });
  }
}

/** Empty on the first document. New keys and edited stops are included. */
export function changedStopKeys(previous: Trip | null, next: Trip): Set<string> {
  if (!previous) return new Set();
  const before = new Map<string, string>();
  visitStops(previous, (key, fingerprint) => before.set(key, fingerprint));
  const changed = new Set<string>();
  visitStops(next, (key, fingerprint) => {
    if (before.get(key) !== fingerprint) changed.add(key);
  });
  return changed;
}

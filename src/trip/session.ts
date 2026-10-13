import { read, write } from '../app/store';
import type { Trip } from './parse';

export type TripFile = { id: string; file: string; raw: string };
type SavedTrip = { version: string; source: TripFile; trip: Trip };
// A parsed document belongs to the code that interpreted it, including the public sanitizer.
const version = import.meta.url;

export function readTrip(id = read<string>('last-trip', '')): SavedTrip | null {
  const saved = read<SavedTrip | null>(`trip:${id}`, null);
  if (!saved || saved.version !== version || saved.source?.id !== id ||
      typeof saved.source.raw !== 'string' || saved.trip?.id !== id ||
      typeof saved.trip.title !== 'string' || !Array.isArray(saved.trip.cities) ||
      !Array.isArray(saved.trip.errors) || !saved.trip.cities.every(city =>
        typeof city.slug === 'string' && Array.isArray(city.days) &&
        city.days.every(day => Array.isArray(day.stops)))) return null;
  return saved;
}

export function writeTrip(source: TripFile, trip: Trip): void {
  write(`trip:${source.id}`, { version, source, trip });
  write('last-trip', source.id);
}

export function forgetTrip(id: string): void {
  write(`trip:${id}`, null);
  if (read('last-trip', '') === id) write('last-trip', '');
}

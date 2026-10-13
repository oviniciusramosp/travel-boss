import { read, write } from '../app/store';
import type { Trip } from './parse';
import type { MapHandle } from '../map/types';

export type TripFile = { id: string; file: string; raw: string };
type SavedTrip = { version: string; source: TripFile; trip: Trip };
// A parsed document belongs to the code that interpreted it, including the public sanitizer.
const version = import.meta.url;

export function readTrip(id = read<string>('last-trip', '')): SavedTrip | null {
  const saved = read<SavedTrip | null>(`trip:${id}`, null);
  if (typeof id !== 'string' || !saved || saved.version !== version || saved.source?.id !== id ||
      typeof saved.source.raw !== 'string' || saved.trip?.id !== id ||
      typeof saved.source.file !== 'string' || saved.trip.file !== saved.source.file ||
      typeof saved.trip.title !== 'string' || !Array.isArray(saved.trip.cities) ||
      !Array.isArray(saved.trip.errors) || !saved.trip.cities.every(city =>
        city && typeof city.slug === 'string' && Array.isArray(city.days) &&
        city.days.every(day => day && Array.isArray(day.stops)))) return null;
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

export type TripView = {
  open: string[]; order: string[]; hidden: string[]; scroll: number; tab: number;
  camera: ReturnType<MapHandle['camera']>;
};

export function readTripView(id: string): TripView | null {
  const value = read<TripView | null>(`trip-view:${id}`, null);
  if (!value || ![value.open, value.order, value.hidden].every(list =>
    Array.isArray(list) && list.every(key => typeof key === 'string')) ||
    !Number.isFinite(value.scroll) || value.scroll < 0 || ![0, 1].includes(value.tab)) return null;
  const camera = value.camera;
  if (!camera || ![camera.lat, camera.lng, camera.zoom].every(Number.isFinite) ||
    Math.abs(camera.lat) > 90 || Math.abs(camera.lng) > 180 || camera.zoom < 0 || camera.zoom > 22) return null;
  return value;
}

export function writeTripView(id: string, view: TripView): void {
  write(`trip-view:${id}`, view);
}

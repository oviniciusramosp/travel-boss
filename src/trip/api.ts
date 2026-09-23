export type TripPushReason = 'add' | 'change' | 'unlink';

export type TripPush = {
  id: string;
  reason: TripPushReason;
};

/** Trip id from a watcher path. Null when the file is not one markdown trip. */
export function tripIdFromPath(file: string): string | null {
  const normalized = file.replaceAll('\\', '/');
  const marker = '/content/trips/';
  const at = normalized.lastIndexOf(marker);
  if (at < 0 || !normalized.endsWith('.md')) return null;
  const name = normalized.slice(at + marker.length, -'.md'.length);
  if (!name || name.startsWith('.') || name.includes('/')) return null;
  return name;
}

/**
 * `list` for the collection, an id for one file, or null when the URL
 * is not a trip read (the dev server should pass it on).
 */
export function parseTripRequest(url: string | undefined): 'list' | string | null {
  const path = (url ?? '/').split('?')[0] ?? '/';
  const rest = path.startsWith('/api/trips') ? path.slice('/api/trips'.length) : path;
  let id = rest.replace(/^\/+/, '');
  if (!id) return 'list';
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }
  if (!/^[\w-]+$/.test(id)) return null;
  return id;
}

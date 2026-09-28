import saved from '../data/travel-place-edits.json';

export type PlaceEdits = { favorite?: boolean; rating?: number | null; googleRating?: number | null };
export type PlaceEditStore = Record<string, PlaceEdits>;
let edits: PlaceEditStore = saved;

export function readPlaceEdits(value: unknown): PlaceEdits | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (!entries.length) return null;
  for (const [key, v] of entries) {
    if (key === 'favorite') { if (typeof v !== 'boolean') return null; }
    else if (key === 'rating' || key === 'googleRating') {
      if (v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < 1 || v > 5)) return null;
    } else return null;
  }
  return value as PlaceEdits;
}

/** Getters keep resolved catalog copies in sync without recreating focused controls. */
export function withPlaceEdits<T extends { id: string; favorite?: boolean; rating?: number; googleRating?: number }>(place: T): T {
  return Object.defineProperties({ ...place }, Object.fromEntries(
    (['favorite', 'rating', 'googleRating'] as const).map((key) => [key, {
      enumerable: true,
      get: () => Object.hasOwn(edits[place.id] ?? {}, key) ? edits[place.id][key] ?? undefined : place[key],
    }]),
  ));
}

export function syncPlaceEdits(next: PlaceEditStore): void {
  edits = next;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tb:place-edits'));
}

if (import.meta.hot) import.meta.hot.on('tb:place-edits', syncPlaceEdits);

export async function savePlaceEdits(id: string, patch: PlaceEdits): Promise<void> {
  const response = await fetch(`/api/places/${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error('Place save failed');
  syncPlaceEdits(await response.json());
}

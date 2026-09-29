import { appRequest } from '../platform/request';
import saved from '../data/travel-place-edits.json';

import type { PlaceEdits, PlaceEditStore } from './place-edit-model';
export { readPlaceEdits } from './place-edit-model';
export type { PlaceEdits, PlaceEditStore } from './place-edit-model';
let edits: PlaceEditStore = saved;

/** Getters keep resolved catalog copies in sync without recreating focused controls. */
export function withPlaceEdits<T extends { id: string; favorite?: boolean; rating?: number; googleRating?: number }>(place: T, defaults: Pick<T, 'favorite' | 'rating' | 'googleRating'> = place): T {
  return Object.defineProperties({ ...place }, Object.fromEntries(
    (['favorite', 'rating', 'googleRating'] as const).map((key) => [key, {
      enumerable: true,
      get: () => Object.hasOwn(edits[place.id] ?? {}, key) ? edits[place.id][key] ?? undefined : defaults[key],
    }]),
  ));
}

export function syncPlaceEdits(next: PlaceEditStore): void {
  edits = next;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('tb:place-edits'));
}

if (import.meta.hot) import.meta.hot.on('tb:place-edits', syncPlaceEdits);

export async function savePlaceEdits(id: string, patch: PlaceEdits): Promise<void> {
  const response = await appRequest(`/api/places/${encodeURIComponent(id)}`, {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch),
  });
  if (!response.ok) throw new Error('Place save failed');
  syncPlaceEdits(await response.json());
}

if (import.meta.env.PROD) {
  void import('../platform/published-api').then(({ publishedPlaceEdits }) => syncPlaceEdits(publishedPlaceEdits()));
}

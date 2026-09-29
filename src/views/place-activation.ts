import { pickLocale } from '../catalog';
import { isMobile } from '../app/viewport';
import type { MapHandle } from '../map/types';
import { openPlace } from './place-panel';

export const isMobileLayout = isMobile;
const selection = new WeakMap<MapHandle, string>();
let searchPlace: string | null = null;

export function resetPlaceSelection(map: MapHandle): void {
  selection.delete(map);
}

/** Search navigates to a place without treating the result as a second tap. */
export function preparePlaceSearch(id: string): void {
  searchPlace = isMobileLayout() ? id : null;
}

export function consumePlaceSearch(id: string): boolean {
  const matches = searchPlace === id;
  searchPlace = null;
  return matches;
}

export function revealPlace(map: MapHandle, ...args: Parameters<typeof openPlace>): void {
  selection.set(map, args[0].id);
  openPlace(...args);
}

/** Selection is shared by map pins and list rows; taps need not be consecutive in time. */
export function activatePlace(map: MapHandle, ...args: Parameters<typeof openPlace>): void {
  const [place] = args;
  if (consumePlaceSearch(place.id)) resetPlaceSelection(map);
  if (!isMobileLayout()) {
    openPlace(...args);
    return;
  }
  if (selection.get(map) === place.id) {
    openPlace(...args);
    return;
  }
  selection.set(map, place.id);
  const row = args[3]?.closest<HTMLElement>('[data-place-id]');
  if (row) row.dataset.mobileHint = pickLocale(args[2], {
    en: 'Tap again for details', 'pt-BR': 'Toque novamente para ver detalhes',
  });
  // A linked place may not have a pin in the current filtered view.
  map.select(place.id, place);
}

import { loadOsmAreas, osmAreasReady, placeHasOsmArea } from '../catalog';
import { invalidateResolvedPlaces } from './place-index';

export { osmAreasReady, placeHasOsmArea };

let pending: Promise<void> | null = null;

/** One geometry load. Drops place resolutions taken before the outlines arrived. */
export function ensureOsmAreas(): Promise<void> {
  if (osmAreasReady()) return Promise.resolve();
  pending ??= loadOsmAreas()
    .then(() => {
      invalidateResolvedPlaces();
    })
    .catch((error: unknown) => {
      pending = null;
      throw error;
    });
  return pending;
}

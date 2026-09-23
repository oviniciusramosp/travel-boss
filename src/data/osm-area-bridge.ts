import { OSM_AREA_IDS } from './travel-area-ids';

export type OsmOutline =
  | { kind: 'polygon'; path: [number, number][] }
  | { kind: 'polyline'; path: [number, number][] }
  | { kind: 'multipolygon'; paths: [number, number][][] };

type Lookup = (placeId: string) => OsmOutline | undefined;

let lookup: Lookup | null = null;
let loading: Promise<void> | null = null;

export function installOsmAreas(next: Lookup): void {
  lookup = next;
}

export function osmAreasReady(): boolean {
  return lookup != null;
}

export function placeHasOsmArea(id: string): boolean {
  return OSM_AREA_IDS.has(id);
}

/** Authored geometry until `loadOsmAreas()` installs the outline table. */
export function osmAreaFor(placeId: string): OsmOutline | undefined {
  return lookup?.(placeId);
}

/** Fetches `travel-areas-osm.ts`. Call this when an area is about to be drawn. */
export function loadOsmAreas(): Promise<void> {
  if (lookup) return Promise.resolve();
  loading ??= import('./travel-areas-osm')
    .then((mod) => {
      lookup = mod.areaForPlace;
    })
    .catch((error: unknown) => {
      loading = null;
      throw error;
    });
  return loading;
}

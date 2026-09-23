import { travelCities, withResolvedArea, type TravelPlace } from '../catalog';

type Hit = { place: TravelPlace; zoom: number };

let index: Map<string, Hit> | null = null;
const resolved = new Map<string, TravelPlace>();

function all(): Map<string, Hit> {
  if (index) return index;
  index = new Map();
  for (const city of travelCities) {
    for (const place of city.places) {
      if (!index.has(place.id)) index.set(place.id, { place, zoom: city.zoom });
    }
  }
  return index;
}

export function placeRecord(id: string): Hit | undefined {
  return all().get(id);
}

/** Catalog place with OSM area, visit, and subcategories merged in. */
export function resolvedPlace(id: string): TravelPlace | undefined {
  const cached = resolved.get(id);
  if (cached) return cached;
  const hit = placeRecord(id);
  if (!hit) return undefined;
  const value = withResolvedArea(hit.place);
  resolved.set(id, value);
  return value;
}

/** Drop cached resolutions so a later read picks up OSM outlines. */
export function invalidateResolvedPlaces(): void {
  resolved.clear();
}

/** `TravelCity.zoom` for the city that owns this place. */
export function placeZoom(id: string): number | undefined {
  return placeRecord(id)?.zoom;
}

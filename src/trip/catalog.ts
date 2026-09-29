import { getTravelCity, travelCities, type TravelCity } from '../catalog';

/** Excursions remain in the departure city's trip section, but own their catalog city. */
export function getTripCity(slug: string): TravelCity | undefined {
  const city = getTravelCity(slug);
  if (!city || slug !== 'paris') return city;
  return { ...city, places: [...city.places, ...(getTravelCity('versailles')?.places ?? [])] };
}

/** Cards and external links use the actual catalog city, including on excursions. */
export function placeCity(placeId: string, fallback: TravelCity): TravelCity {
  return travelCities.find((city) => city.places.some((place) => place.id === placeId)) ?? fallback;
}

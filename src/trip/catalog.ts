import { getTravelCity, travelCities, type TravelCity } from '../catalog';

/** Excursions remain in the departure city's trip section, but own their catalog city. */
export function getTripCity(slug: string): TravelCity | undefined {
  const city = getTravelCity(slug);
  if (!city) return city;
  const excursions = slug === 'paris' ? ['versailles'] : slug === 'milao' ? ['veneza', 'verona'] : [];
  if (slug === 'lisboa') return { ...city, places: [...city.places, ...getTravelCity('sao-paulo')!.places.filter((place) => place.id === 'sp-gru')] };
  if (!excursions.length) return city;
  return { ...city, places: [...city.places, ...excursions.flatMap((destination) => getTravelCity(destination)?.places ?? [])] };
}

/** Cards and external links use the actual catalog city, including on excursions. */
export function placeCity(placeId: string, fallback: TravelCity): TravelCity {
  return travelCities.find((city) => city.places.some((place) => place.id === placeId)) ?? fallback;
}

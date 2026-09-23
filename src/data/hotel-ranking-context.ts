import { ROME_HOTEL_NEIGHBORHOODS } from './rome-hotel-neighborhoods';
import { getTravelCity, itineraryForCity } from './travel';
import { stayZonesForCity, stayZoneRings, stayZonePolygons } from './travel-stay-heatmap';
import { rankingTargets } from '../../scripts/hotel-ranking.mjs';

/** Loaded on the server: only canonical city data is used as ranking evidence. */
export function hotelRankingContext(slug: string, selectedIds: string[] = []) {
  const city = getTravelCity(slug);
  if (!city) throw new Error('Cidade sem dados de roteiro para classificar hotéis.');
  return {
    city,
    targets: rankingTargets(city, itineraryForCity(slug), selectedIds),
    zones: [...stayZonesForCity(slug).map((z) => ({ ...z, rings: stayZoneRings(z.id), polygons: stayZonePolygons(z.id) })), ...(slug === 'roma' ? ROME_HOTEL_NEIGHBORHOODS : [])],
  };
}

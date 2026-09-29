import { travelCities } from '../catalog';
import { planHop, type RouteHop } from './route';

const cityByPlace = new Map(travelCities.flatMap((city) => city.places.map((place) => [place.id, city.slug] as const)));

/** Only known travel between different catalog cities, including day trips. */
export function intercityHops(hops: readonly RouteHop[]): RouteHop[] {
  return hops.filter((hop) => {
    const from = hop.from.id && cityByPlace.get(hop.from.id);
    const to = hop.to.id && cityByPlace.get(hop.to.id);
    if (!from || !to || from === to) return false;
    const plan = planHop(hop);
    return plan.kind === 'flight' || plan.kind === 'drive' || (plan.kind === 'catalog' && plan.leg.mode === 'transit');
  });
}

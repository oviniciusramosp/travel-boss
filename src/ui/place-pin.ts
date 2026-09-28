import { placeCategoryMeta, placePinMaterialName, type TravelPlace } from '../catalog';
import { circleInk } from './contrast';
import { el } from './dom';
import { icon, type IconName } from './icons';

/** Shared category circle for itinerary rows and search suggestions. */
export function placePin(place: TravelPlace): HTMLSpanElement {
  const lead = el('span', 'tb-stop-pin');
  const color = placeCategoryMeta[place.category].color;
  lead.style.setProperty('--pin-color', color);
  lead.classList.toggle('is-on-ink', circleInk(color) === 'on-ink');
  lead.append(icon(placePinMaterialName(place.category, place.subcategories) as IconName, { size: 16, fill: true }));
  return lead;
}

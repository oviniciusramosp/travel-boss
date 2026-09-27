import { pickLocale, type Locale } from '../catalog';

/** Water and restroom switches, shared by the map buttons and the places card. No Leaflet here. */
export type AmenityKind = 'water' | 'toilet';

const state: Record<AmenityKind, boolean> = { water: false, toilet: false };
/** Fired on `document` when a kind is switched, so the map buttons and the places card agree. */
export const AMENITY_EVENT = 'tb:amenity';

export function amenityOn(kind: AmenityKind): boolean {
  return state[kind];
}

export function setAmenity(kind: AmenityKind, on: boolean): void {
  state[kind] = on;
  document.dispatchEvent(new CustomEvent(AMENITY_EVENT));
}

export function amenityName(kind: AmenityKind, locale: Locale): string {
  return kind === 'toilet'
    ? pickLocale(locale, { en: 'Restrooms', 'pt-BR': 'Banheiros' })
    : pickLocale(locale, { en: 'Drinking water', 'pt-BR': 'Água potável' });
}

export const AMENITY_ICON = { water: 'water_drop', toilet: 'wc' } as const;


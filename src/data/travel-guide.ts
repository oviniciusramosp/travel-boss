/**
 * City guide: what to buy (market) and what to eat (food) in each city.
 * Items point at catalog places (`where`), so every suggestion has a pin,
 * a card and can become a stop in a trip file.
 */

import type { LString } from './travel';
import type { TravelPhoto } from './travel-photos';

/** Shelves of the market tab, in display order. */
export const marketShelves = {
  sweets: { en: 'Sweets & chocolate', 'pt-BR': 'Doces e chocolates' },
  cheese: { en: 'Cheese, butter & deli', 'pt-BR': 'Queijos, manteiga e frios' },
  pantry: { en: 'Pantry & tea', 'pt-BR': 'Empório e chás' },
  drinks: { en: 'Wine & spirits', 'pt-BR': 'Vinhos e bebidas' },
} satisfies Record<string, LString>;

/** Meals of the food tab, in the order of a day. */
export const foodMeals = {
  breakfast: { en: 'Breakfast', 'pt-BR': 'Café da manhã' },
  lunch: { en: 'Lunch', 'pt-BR': 'Almoço' },
  afternoon: { en: 'Afternoon & pastries', 'pt-BR': 'Café da tarde' },
  dinner: { en: 'Dinner', 'pt-BR': 'Jantar' },
  drinks: { en: 'Drinks', 'pt-BR': 'Bebidas' },
} satisfies Record<string, LString>;

export type MarketShelf = keyof typeof marketShelves;
export type FoodMeal = keyof typeof foodMeals;

export type GuideItem<Group extends string = string> = {
  id: string;
  group: Group;
  name: LString;
  description: LString;
  photo?: TravelPhoto;
  /** Catalog place ids of the same city, best first. */
  where: string[];
};

export type CityGuide = {
  market: GuideItem<MarketShelf>[];
  food: GuideItem<FoodMeal>[];
};

const guides: Record<string, CityGuide> = {};

export function cityGuide(slug: string): CityGuide | undefined {
  return guides[slug];
}

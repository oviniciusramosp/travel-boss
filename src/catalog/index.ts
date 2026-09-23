/**
 * Browser-facing catalog. UI code imports only this module.
 * Do not import hotel-ranking-context or travel-stay-heatmap from the client:
 * those pull ranking polygons into the page.
 *
 * The catalog agent copies src/data from the portfolio so these exports resolve.
 */
export {
  travelCities,
  getTravelCity,
  pickLocale,
  googleMapsUrl,
  favoritePlaces,
  placeCategoryOrder,
  placeCategoryMeta,
  itineraryForCity,
  dayRoutePlaceIds,
  dayPrimaryRoutePlaceIds,
  computeDayBudget,
  computeTripBudget,
  withResolvedArea,
  travelUi,
  resolveVisit,
  visitFieldsForDisplay,
  resolvePlacePhotos,
} from '../data/travel';

export { legsForDay } from '../data/travel-itinerary-legs';
export type { ItineraryLegDef } from '../data/travel-itinerary-legs';

export { placeCategoriesOffByDefault } from '../data/travel-categories';

export type {
  Locale,
  LString,
  TravelCity,
  TravelPlace,
  TravelItinerary,
  ItineraryDay,
  ItineraryStop,
  PlaceCategory,
  DayBudget,
} from '../data/travel';

export type { ItineraryArrivalOption } from '../data/travel-itineraries';

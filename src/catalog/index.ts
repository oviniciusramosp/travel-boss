/**
 * Browser-facing catalog. UI code imports only this module.
 * Do not import hotel-ranking-context or travel-stay-heatmap from the client:
 * those pull ranking polygons into the page.
 *
 * The catalog agent copies src/data from the portfolio so these exports resolve.
 */
export { googleMapsAppTarget } from '../data/travel-maps-links';
export {
  travelCities,
  getTravelCity,
  pickLocale,
  googleMapsUrl,
  favoritePlaces,
  subPointParents,
  placeCategoryOrder,
  placeCategoryMeta,
  itineraryForCity,
  dayRoutePlaceIds,
  dayPrimaryRoutePlaceIds,
  withResolvedArea,
  travelUi,
  resolveVisit,
  visitFieldsForDisplay,
  resolvePlacePhotos,
} from '../data/travel';

export {
  estimateLegDurationMin,
  expandTimelineTransferParts,
  formatLegDuration,
  legDisplayLabel,
  legLineColor,
  legsForDay,
  lineBrandColor,
  milanDayLegsById,
  parisDayLegsById,
} from '../data/travel-itinerary-legs';
export type { ItineraryLegDef, TimelineTransferPart } from '../data/travel-itinerary-legs';

export { placeCategoriesOffByDefault } from '../data/travel-categories';
export { louvreRoute, louvreSources } from '../data/travel-indoor';
export type { LouvreFloor, IndoorStep } from '../data/travel-indoor';
export {
  MAPS_MATERIAL_ICON,
  categoryMaterialName,
  placePinIconHtml,
  placePinMaterialName,
} from '../data/travel-categories';
export { subcategoryLabel } from '../data/travel-subcategories';
export { cityGuide, foodMeals, marketShelves } from '../data/travel-guide';
export type { CityGuide, FoodMeal, GuideItem, MarketShelf } from '../data/travel-guide';
export { getTransitLine } from '../data/travel-transit-lines';
export type { TransitLine } from '../data/travel-transit-lines';

export type {
  Locale,
  LString,
  TravelCity,
  TravelPlace,
  ItineraryDay,
  ItineraryStop,
  PlaceCategory,
  MoneyInfo,
  VisitInfo,
} from '../data/travel';

export { loadOsmAreas, osmAreasReady, placeHasOsmArea } from '../data/osm-area-bridge';

export { louvrePaths } from '../data/travel-indoor-paths';
export type { IndoorPathPart } from '../data/travel-indoor-paths';

export { savePlaceEdits } from './place-edits';
export type { PlaceEdits } from './place-edits';

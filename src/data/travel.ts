/**
 * Travel section data: cities, places, and bilingual UI copy (en / pt-BR).
 * Locale is resolved on the client from navigator.language.
 */

import {
  placeCategoryOrder,
  type PlaceCategory,
} from './travel-categories';

export type { PlaceCategory, PlaceCategoryIcon, PlaceCategoryMeta } from './travel-categories';
export {
  placeCategoryMeta,
  placeCategoryOrder,
  categoryColor,
  categoryIcon,
  categoryIconHtml,
  placePinIconHtml,
  placePinMaterialName,
} from './travel-categories';

import { osmAreaFor } from './osm-area-bridge';
import {
  resolveVisit,
  type VisitInfo,
} from './travel-visit';
import {
  photosForPlaceId,
  type TravelPhoto,
} from './travel-photos';
import {
  resolvePlaceSubcategories,
  type PlaceSubcategory,
} from './travel-subcategories';
import { mergeNotionPlaces } from './travel-notion';
import { milanCity } from './travel-milan';

export type { TravelPhoto } from './travel-photos';
export type {
  PlaceSubcategory,
  PlaceSubcategoryMeta,
} from './travel-subcategories';
export {
  placeSubcategoryMeta,
  placeSubcategoryOrder,
  subcategoryLabel,
  normalizeSubcategories,
  resolvePlaceSubcategories,
} from './travel-subcategories';
export type {
  VisitInfo,
  MoneyInfo,
  CrowdProfile,
  PriceLevel,
  TicketPromo,
  TicketPromoKind,
  MonthIndex,
} from './travel-visit';
export {
  formatMoney,
  formatMoneyTypical,
  formatDuration,
  formatTicketPromo,
  priceLevelFromMoney,
  visitFieldsForDisplay,
  resolveVisit,
} from './travel-visit';
export type {
  TravelItinerary,
  ItineraryDay,
  ItineraryStop,
  ItinerarySlot,
} from './travel-itineraries';
export {
  itineraryForCity,
  dayRoutePlaceIds,
  dayPrimaryRoutePlaceIds,
  computeDayBudget,
  computeTripBudget,
  moneyTypicalEur,
  parisItinerary,
} from './travel-itineraries';
export type { DayBudget } from './travel-itineraries';

export type Locale = 'en' | 'pt-BR';

export type LString = Record<Locale, string>;

/**
 * Leaflet-order coordinate: [latitude, longitude].
 * Used for map areas (parks, neighborhoods, avenues).
 */
export type LatLngPoint = [number, number];

/**
 * Region drawn on the city map (hover highlights the whole shape).
 * - polygon: filled park / neighborhood / block
 * - polyline: avenue, bridge, waterfront walk
 */
export type TravelArea =
  | {
      kind: 'polygon';
      /** Outer ring in [lat, lng] order (need not be closed) */
      path: LatLngPoint[];
    }
  | {
      kind: 'polyline';
      path: LatLngPoint[];
    }
  | {
      kind: 'multipolygon';
      /** Multiple outer rings (e.g. Petit + Grand Palais) */
      paths: LatLngPoint[][];
    };

/** Station / waypoint along a route (e.g. metro line) — shown on hover with the line */
export type TravelRouteStop = {
  name: LString;
  lat: number;
  lng: number;
};

/**
 * Landmark map markers — always show a distinctive icon (not a category dot).
 * Mirrors how Google Maps treats major tourist monuments.
 */
export type TravelLandmark =
  | 'eiffel'
  | 'arc'
  | 'notre-dame'
  | 'sacre-coeur'
  | 'louvre'
  | 'opera'
  | 'pompidou'
  | 'montparnasse'
  | 'monument';

/**
 * Axis-aligned box around a center.
 * @deprecated Temporary scaffold only — tests fail if this ships without an
 * OSM override in travel-areas-osm.ts. Prefer `npm run travel:areas`.
 */
export function areaBox(
  lat: number,
  lng: number,
  dLat: number,
  dLng: number,
): TravelArea {
  return {
    kind: 'polygon',
    path: [
      [lat - dLat, lng - dLng],
      [lat - dLat, lng + dLng],
      [lat + dLat, lng + dLng],
      [lat + dLat, lng - dLng],
    ],
  };
}

export interface TravelPlace {
  id: string;
  name: LString;
  category: PlaceCategory;
  /**
   * Optional tags under the main category (multi).
   * e.g. restaurants → italian, meat; parks → church, museum.
   * When omitted, may resolve from curated parisSubcategoriesByPlaceId.
   */
  subcategories?: PlaceSubcategory[];
  description: LString;
  /**
   * Personal rating 1–5 (halves ok). Omit → empty outlined gray stars in UI.
   */
  rating?: number;
  /**
   * Google Maps rating 1–5 (halves ok). Omit → empty outlined gray stars.
   */
  googleRating?: number;
  /**
   * Personal pick — heart next to the name on the detail card.
   * Prefer these when an LLM / planner builds itineraries.
   */
  favorite?: boolean;
  /**
   * Already visited / known. Maps to Notion `Conhecido`.
   * Omit or true = known; false = still to visit (Lisbon “Conhecer” list).
   */
  conhecido?: boolean;
  /** Anchor point (pin). Prefer place centroid when `area` is set. */
  lat: number;
  lng: number;
  /**
   * Optional region. On hover (card or pin), the full shape is highlighted
   * instead of only the point — parks, neighborhoods, avenues, etc.
   */
  area?: TravelArea;
  /**
   * Stops along a route polyline (metro stations, etc.).
   * Rendered as small markers when the place is hovered — not as separate places.
   */
  routeStops?: TravelRouteStop[];
  /**
   * Famous landmark map icon (Google Maps style), always visible — not a plain dot.
   * e.g. eiffel, arc, notre-dame, sacre-coeur, louvre
   */
  landmark?: TravelLandmark;
  /** Emphasize on the map (larger pin / stronger glow) — e.g. ORY */
  featured?: boolean;
  /**
   * Human-readable street / area address (optional, shown + used in Maps search).
   * Example: "Rua da Cantareira, 306 - Centro Histórico, São Paulo"
   */
  address?: string;
  /**
   * Google Maps search query (place name + city). Prefer this when no placeId.
   * Example: "Mercado Municipal de São Paulo"
   */
  mapsQuery?: string;
  /**
   * Google Place ID when known (most precise deep link).
   * Find via Google Maps share URL or Places API.
   */
  placeId?: string;
  /** Full Google Maps URL override (wins over placeId / mapsQuery / coords) */
  mapsUrl?: string;
  /**
   * Gallery images (cover = first). Absolute https URLs.
   * Prefer curated list in travel-photos.ts; place-level overrides that list.
   * Note: official Google Place Photos need Places API key + billing.
   */
  photos?: TravelPhoto[];
  /**
   * Visit logistics: avg meal price, ticket, duration, best time/day, tips.
   * When omitted, may still resolve from curated `visitByPlaceId` data.
   */
  visit?: VisitInfo;
}

export interface TravelCity {
  slug: string;
  name: LString;
  /** State / region code when useful (SP, NY, FL) */
  region?: string;
  country: LString;
  /** Stable filter key (country), used by chips */
  countryKey: 'brasil' | 'usa' | 'franca' | 'portugal' | 'italia';
  lat: number;
  lng: number;
  /** Default map zoom for city page */
  zoom: number;
  places: TravelPlace[];
}

export const travelUi = {
  title: { en: 'Travel', 'pt-BR': 'Viagens' } satisfies LString,
  subtitle: {
    en: 'Cities I have been, and places worth knowing.',
    'pt-BR': 'Cidades que visitei e lugares que valem a pena.',
  } satisfies LString,
  searchPlaceholder: {
    en: 'Search cities…',
    'pt-BR': 'Buscar cidades…',
  } satisfies LString,
  filterAll: { en: 'All', 'pt-BR': 'Todas' } satisfies LString,
  empty: {
    en: 'No cities match your search.',
    'pt-BR': 'Nenhuma cidade encontrada.',
  } satisfies LString,
  emptyPlaces: {
    en: 'No places match your search.',
    'pt-BR': 'Nenhum lugar encontrado.',
  } satisfies LString,
  placesTitle: {
    en: 'Places to visit',
    'pt-BR': 'Lugares para conhecer',
  } satisfies LString,
  back: { en: 'Travel/', 'pt-BR': 'Travel/' } satisfies LString,
  ratingLabel: { en: 'Rating', 'pt-BR': 'Nota' } satisfies LString,
  ratingGoogle: { en: 'Google', 'pt-BR': 'Google' } satisfies LString,
  ratingMine: { en: 'Mine', 'pt-BR': 'Minha' } satisfies LString,
  favorite: { en: 'Favorite', 'pt-BR': 'Favorito' } satisfies LString,
  openInMaps: {
    en: 'Open in Google Maps',
    'pt-BR': 'Abrir no Google Maps',
  } satisfies LString,
  addToRoute: {
    en: 'Add to route',
    'pt-BR': 'Adicionar à rota',
  } satisfies LString,
  removeFromRoute: {
    en: 'Remove from route',
    'pt-BR': 'Remover da rota',
  } satisfies LString,
  routeTitle: {
    en: 'Route',
    'pt-BR': 'Rota',
  } satisfies LString,
  routeWalk: {
    en: 'Walk',
    'pt-BR': 'A pé',
  } satisfies LString,
  routeTransit: {
    en: 'Transit',
    'pt-BR': 'Transporte',
  } satisfies LString,
  routeOpenGoogle: {
    en: 'Open route in Google Maps',
    'pt-BR': 'Abrir rota no Google Maps',
  } satisfies LString,
  routeNeedStops: {
    en: 'Add at least 2 places',
    'pt-BR': 'Adicione pelo menos 2 lugares',
  } satisfies LString,
  routeLoading: {
    en: 'Calculating…',
    'pt-BR': 'Calculando…',
  } satisfies LString,
  routeError: {
    en: 'Could not preview walking route',
    'pt-BR': 'Não foi possível pré-visualizar a rota a pé',
  } satisfies LString,
  routeTransitHint: {
    en: 'Transit times open in Google Maps',
    'pt-BR': 'Horários de transporte abrem no Google Maps',
  } satisfies LString,
  routeClear: {
    en: 'Clear route',
    'pt-BR': 'Limpar rota',
  } satisfies LString,
  routePreviewLabel: {
    en: 'Walking preview',
    'pt-BR': 'Prévia a pé',
  } satisfies LString,
  myLocation: {
    en: 'My location',
    'pt-BR': 'Minha localização',
  } satisfies LString,
  locateMe: {
    en: 'Show my location',
    'pt-BR': 'Mostrar minha localização',
  } satisfies LString,
  startFromMyLocation: {
    en: 'Start from my location',
    'pt-BR': 'Começar da minha localização',
  } satisfies LString,
  locating: {
    en: 'Finding your location…',
    'pt-BR': 'Localizando…',
  } satisfies LString,
  locateDenied: {
    en: 'Location permission denied',
    'pt-BR': 'Permissão de localização negada',
  } satisfies LString,
  locateUnavailable: {
    en: 'Could not get your location',
    'pt-BR': 'Não foi possível obter sua localização',
  } satisfies LString,
  locateFar: {
    en: 'You seem far from this city. Walking routes may not make sense here.',
    'pt-BR':
      'Você parece estar longe desta cidade. Rotas a pé podem não fazer sentido aqui.',
  } satisfies LString,
  address: {
    en: 'Address',
    'pt-BR': 'Endereço',
  } satisfies LString,
  collapseAll: {
    en: 'Collapse all',
    'pt-BR': 'Recolher tudo',
  } satisfies LString,
  expandAll: {
    en: 'Expand all',
    'pt-BR': 'Expandir tudo',
  } satisfies LString,
  filterCategories: {
    en: 'Filter categories',
    'pt-BR': 'Filtrar categorias',
  } satisfies LString,
  viewModeGroup: {
    en: 'Place list layout',
    'pt-BR': 'Layout da lista de lugares',
  } satisfies LString,
  viewList: {
    en: 'List',
    'pt-BR': 'Lista',
  } satisfies LString,
  viewItinerary: {
    en: 'Itinerary',
    'pt-BR': 'Roteiro',
  } satisfies LString,
  viewHotels: {
    en: 'Hotels',
    'pt-BR': 'Hotéis',
  } satisfies LString,
  itineraryEmpty: {
    en: 'Day-by-day itinerary for this city is coming soon.',
    'pt-BR': 'Roteiro dia a dia desta cidade em breve.',
  } satisfies LString,
  itineraryShowRoute: {
    en: 'Show day on map',
    'pt-BR': 'Ver dia no mapa',
  } satisfies LString,
  itineraryOnMap: {
    en: 'On map',
    'pt-BR': 'No mapa',
  } satisfies LString,
  itineraryOpenGoogleMaps: {
    en: 'Open full day in Google Maps',
    'pt-BR': 'Abrir o dia inteiro no Google Maps',
  } satisfies LString,
  itineraryOpenGoogleMapsPeriod: {
    en: 'Open this period in Google Maps',
    'pt-BR': 'Abrir este período no Google Maps',
  } satisfies LString,
  itinerarySlotOnMap: {
    en: 'Show this period on the map',
    'pt-BR': 'Mostrar este período no mapa',
  } satisfies LString,
  itinerarySlotOffMap: {
    en: 'Hide this period from the map',
    'pt-BR': 'Ocultar este período do mapa',
  } satisfies LString,
  itineraryStops: {
    en: 'stops',
    'pt-BR': 'paradas',
  } satisfies LString,
  itineraryDay: {
    en: 'Day',
    'pt-BR': 'Dia',
  } satisfies LString,
  itineraryMorning: {
    en: 'Morning',
    'pt-BR': 'Manhã',
  } satisfies LString,
  itineraryAfternoon: {
    en: 'Afternoon',
    'pt-BR': 'Tarde',
  } satisfies LString,
  itineraryEvening: {
    en: 'Evening',
    'pt-BR': 'Noite',
  } satisfies LString,
  itineraryOptional: {
    en: 'Optional',
    'pt-BR': 'Opcional',
  } satisfies LString,
  itineraryFood: {
    en: 'Food / person',
    'pt-BR': 'Comida / pessoa',
  } satisfies LString,
  itineraryParks: {
    en: 'Tickets / person',
    'pt-BR': 'Ingressos / pessoa',
  } satisfies LString,
  /** Suffix after budget amount on day cards (e.g. "€42 / person") */
  itineraryPerPerson: {
    en: '/ person',
    'pt-BR': '/ pessoa',
  } satisfies LString,
  itineraryBudgetGroup: {
    en: 'Estimated budget per person',
    'pt-BR': 'Orçamento estimado por pessoa',
  } satisfies LString,
  itineraryTripBudgetGroup: {
    en: 'Total estimated budget for the trip (per person)',
    'pt-BR': 'Orçamento total estimado da viagem (por pessoa)',
  } satisfies LString,
  itineraryArrivalAirport: {
    en: 'Arrival airport',
    'pt-BR': 'Aeroporto de chegada',
  } satisfies LString,
  mapAria: {
    en: 'Interactive map of visited cities',
    'pt-BR': 'Mapa interativo das cidades visitadas',
  } satisfies LString,
  cityMapAria: {
    en: 'Map of places in this city',
    'pt-BR': 'Mapa de lugares nesta cidade',
  } satisfies LString,
  themeLight: {
    en: 'Switch to light mode',
    'pt-BR': 'Mudar para modo claro',
  } satisfies LString,
  themeDark: {
    en: 'Switch to dark mode',
    'pt-BR': 'Mudar para modo escuro',
  } satisfies LString,
  langGroup: {
    en: 'Language',
    'pt-BR': 'Idioma',
  } satisfies LString,
  langEn: {
    en: 'English',
    'pt-BR': 'Inglês',
  } satisfies LString,
  langPt: {
    en: 'Portuguese',
    'pt-BR': 'Português',
  } satisfies LString,
  closePanel: {
    en: 'Close place details',
    'pt-BR': 'Fechar detalhes do lugar',
  } satisfies LString,
  collapseSidebar: {
    en: 'Collapse sidebar',
    'pt-BR': 'Recolher painel',
  } satisfies LString,
  expandSidebar: {
    en: 'Expand sidebar',
    'pt-BR': 'Expandir painel',
  } satisfies LString,
  fullscreenEnter: {
    en: 'View map fullscreen',
    'pt-BR': 'Ver mapa em tela cheia',
  } satisfies LString,
  fullscreenExit: {
    en: 'Exit fullscreen',
    'pt-BR': 'Sair da tela cheia',
  } satisfies LString,
  countries: {
    brasil: { en: 'Brazil', 'pt-BR': 'Brasil' },
    usa: { en: 'USA', 'pt-BR': 'EUA' },
    franca: { en: 'France', 'pt-BR': 'França' },
    portugal: { en: 'Portugal', 'pt-BR': 'Portugal' },
    italia: { en: 'Italy', 'pt-BR': 'Itália' },
  } satisfies Record<TravelCity['countryKey'], LString>,
  categories: {
    airport: { en: 'Airport', 'pt-BR': 'Aeroporto' },
    transport: { en: 'Transport', 'pt-BR': 'Transporte' },
    parks: { en: 'Parks & walks', 'pt-BR': 'Parques e Passeios' },
    cafes: { en: 'Cafés', 'pt-BR': 'Cafés' },
    restaurants: { en: 'Restaurants', 'pt-BR': 'Restaurantes' },
    commons: { en: 'Chains', 'pt-BR': 'Comuns' },
    markets: { en: 'Markets', 'pt-BR': 'Mercados' },
    shopping: { en: 'Shopping', 'pt-BR': 'Compras' },
    photo: { en: 'Photo spot', 'pt-BR': 'Ponto para Foto' },
    tourist: { en: 'Tourist spots', 'pt-BR': 'Pontos Turísticos' },
    lodging: { en: 'Stay', 'pt-BR': 'Hospedagem' },
  } satisfies Record<PlaceCategory, LString>,
  visit: {
    avgPrice: {
      en: 'Price / person',
      'pt-BR': 'Preço / pessoa',
    },
    pricePerNight: {
      en: 'Price / night',
      'pt-BR': 'Preço / noite',
    },
    ticket: {
      en: 'Ticket',
      'pt-BR': 'Ingresso',
    },
    duration: {
      en: 'Duration',
      'pt-BR': 'Duração',
    },
    bestTime: {
      en: 'Best time',
      'pt-BR': 'Melhor horário',
    },
    bestDay: {
      en: 'Best day',
      'pt-BR': 'Melhor dia',
    },
    tips: {
      en: 'Tips',
      'pt-BR': 'Dicas',
    },
    liveOpen: {
      en: 'Open now',
      'pt-BR': 'Aberto agora',
    },
    liveClosed: {
      en: 'Closed now',
      'pt-BR': 'Fechado agora',
    },
    ticketLink: {
      en: 'Check tickets',
      'pt-BR': 'Ver ingressos',
    },
    ticketPromos: {
      en: 'Free / deals',
      'pt-BR': 'Grátis / promoções',
    },
    priceNote: {
      en: 'Approx. adult price — confirm on official site',
      'pt-BR': 'Preço adulto aprox. — confirme no site oficial',
    },
  },
} as const;

/** Country filter chip order on the index */
export const travelCountryKeys: TravelCity['countryKey'][] = [
  'brasil',
  'usa',
  'franca',
  'italia',
  'portugal',
];

/** Categories present in a city, sorted by placeCategoryOrder */
export function cityCategoryKeys(city: TravelCity): PlaceCategory[] {
  const present = new Set(city.places.map((p) => p.category));
  return placeCategoryOrder.filter((k) => present.has(k));
}

/**
 * Local city shells + places authored in-repo (pre-Notion merge).
 * Use this when seeding Notion so dump text is not already overwritten by an old pull.
 * Editorial place content prefers Notion after merge (see mergeNotionPlaces).
 */
export const localTravelCities: TravelCity[] = [
  milanCity,
  {
    slug: 'sao-paulo',
    name: { en: 'São Paulo', 'pt-BR': 'São Paulo' },
    region: 'SP',
    country: { en: 'Brazil', 'pt-BR': 'Brasil' },
    countryKey: 'brasil',
    lat: -23.5505,
    lng: -46.6333,
    zoom: 12,
    places: [
      {
        id: 'sp-gru',
        name: {
          en: 'Guarulhos Airport (GRU)',
          'pt-BR': 'Aeroporto de Guarulhos (GRU)',
        },
        category: 'airport',
        description: {
          en: 'Main international gateway to São Paulo.',
          'pt-BR': 'Principal porta de entrada internacional de São Paulo.',
        },
        googleRating: 4.3,
        lat: -23.4356,
        lng: -46.4731,
        address: 'Rod. Hélio Smidt, s/n - Cumbica, Guarulhos - SP',
        mapsQuery: 'Aeroporto Internacional de São Paulo Guarulhos GRU',
      },
      {
        id: 'sp-mercado-municipal',
        name: { en: 'Municipal Market', 'pt-BR': 'Mercado Municipal' },
        category: 'restaurants',
        description: {
          en: 'Iconic food hall. Try the mortadella sandwich and fresh juice upstairs.',
          'pt-BR': 'Templo da comida paulistana. Vale o sanduíche de mortadela e o suco no mezanino.',
        },
        googleRating: 4.5,
        lat: -23.5416,
        lng: -46.6295,
        address: 'Rua da Cantareira, 306 - Centro Histórico, São Paulo - SP',
        mapsQuery: 'Mercado Municipal de São Paulo',
      },
      {
        id: 'sp-pinacoteca',
        name: { en: 'Pinacoteca', 'pt-BR': 'Pinacoteca' },
        category: 'tourist',
        description: {
          en: 'One of the best Brazilian art museums, next to Luz station.',
          'pt-BR': 'Um dos melhores museus de arte do Brasil, ao lado da Estação da Luz.',
        },
        googleRating: 4.8,
        lat: -23.5346,
        lng: -46.6339,
        address: 'Praça da Luz, 2 - Luz, São Paulo - SP',
        mapsQuery: 'Pinacoteca do Estado de São Paulo',
      },
      {
        id: 'sp-ibirapuera',
        name: { en: 'Ibirapuera Park', 'pt-BR': 'Parque Ibirapuera' },
        category: 'parks',
        description: {
          en: 'The city lungs: museums, lakes, and long walks under the trees.',
          'pt-BR': 'O pulmão da cidade: museus, lagos e caminhadas longas sob as árvores.',
        },
        googleRating: 4.8,
        lat: -23.5874,
        lng: -46.6576,
        area: areaBox(-23.5874, -46.6576, 0.012, 0.014),
        address: 'Av. Pedro Álvares Cabral - Vila Mariana, São Paulo - SP',
        mapsQuery: 'Parque Ibirapuera São Paulo',
      },
      {
        id: 'sp-liberdade',
        name: { en: 'Liberdade', 'pt-BR': 'Liberdade' },
        category: 'tourist',
        description: {
          en: 'Asian neighborhood with street food, gates, and weekend markets.',
          'pt-BR': 'Bairro asiático com comida de rua, portões e feiras de fim de semana.',
        },
        lat: -23.5587,
        lng: -46.635,
        area: areaBox(-23.5587, -46.635, 0.006, 0.007),
        address: 'Praça da Liberdade - Liberdade, São Paulo - SP',
        mapsQuery: 'Bairro da Liberdade São Paulo',
      },

      // ── From the former Notion catalog (migrated Sep 2026) ──
      {
        id: 'sp-aeroporto-congonhas',
        name: { en: 'Aeroporto Congonhas', 'pt-BR': 'Aeroporto Congonhas' },
        category: 'airport',
        description: { en: 'Aeroporto Congonhas', 'pt-BR': 'Aeroporto Congonhas' },
        lat: -23.61971,
        lng: -46.66319,
        address: 'Aeroporto Congonhas, Rua Baronesa de Bela Vista, 228, Campo Belo, Sao Paulo - SP, 04612-001, Brazil',
      },
      {
        id: 'sp-airbnb-oscar-itaim',
        name: { en: 'Airbnb: Oscar Itaim', 'pt-BR': 'Airbnb: Oscar Itaim' },
        category: 'lodging',
        description: { en: 'Airbnb: Oscar Itaim', 'pt-BR': 'Airbnb: Oscar Itaim' },
        lat: -23.57867,
        lng: -46.67282,
        address: 'Rua Urimonduba, 144, Itaim Bibi, Sao Paulo - SP, 04530-080, Brazil',
      },
      {
        id: 'sp-being-coffee',
        name: { en: 'Being Coffee', 'pt-BR': 'Being Coffee' },
        category: 'cafes',
        description: { en: 'Being Coffee', 'pt-BR': 'Being Coffee' },
        lat: -23.56813,
        lng: -46.6651,
        address: 'Rua Barão de Capanema, 220, Jardim Paulista, Sao Paulo - SP, 01411-010, Brazil',
      },
      {
        id: 'sp-broca',
        name: { en: 'Broca', 'pt-BR': 'Broca' },
        category: 'restaurants',
        description: { en: 'Broca', 'pt-BR': 'Broca' },
        lat: -23.55757,
        lng: -46.6893,
        address: 'Rua Aspicuelta, 429, Pinheiros, Sao Paulo - SP, 05433-011, Brazil',
      },
      {
        id: 'sp-cafe-zinn',
        name: { en: 'Cafe Zinn', 'pt-BR': 'Cafe Zinn' },
        category: 'cafes',
        description: { en: 'Cafe Zinn', 'pt-BR': 'Cafe Zinn' },
        lat: -23.56418,
        lng: -46.66847,
        address: 'Rua Haddock Lobo, 1574, Jardim Paulista, Sao Paulo - SP, 01414-002, Brazil',
      },
      {
        id: 'sp-casa-cazetv',
        name: { en: 'Casa CazéTV', 'pt-BR': 'Casa CazéTV' },
        category: 'tourist',
        description: { en: 'Casa CazéTV', 'pt-BR': 'Casa CazéTV' },
        lat: -23.54439,
        lng: -46.72004,
        address: 'Avenida Professor Fonseca Rodrigues, 1983, Alto de Pinheiros, Sao Paulo - SP, 05461-010, Brazil',
      },
      {
        id: 'sp-compras-no-bras',
        name: { en: 'Compras no Brás', 'pt-BR': 'Compras no Brás' },
        category: 'shopping',
        description: { en: 'Compras no Brás', 'pt-BR': 'Compras no Brás' },
        lat: -23.53783,
        lng: -46.61836,
        address: 'Rua Oriente, 391, Brás, Sao Paulo - SP, 03016-001, Brazil',
      },
      {
        id: 'sp-futuro-refeitorio',
        name: { en: 'Futuro Refeitório', 'pt-BR': 'Futuro Refeitório' },
        category: 'cafes',
        description: { en: 'Futuro Refeitório', 'pt-BR': 'Futuro Refeitório' },
        lat: -23.56215,
        lng: -46.68179,
        address: 'Rua Cônego Eugênio Leite, 808, Pinheiros, Sao Paulo - SP, 05414-001, Brazil',
      },
      {
        id: 'sp-hello-kitty-eat-asia',
        name: { en: 'Hello Kitty Eat Asia', 'pt-BR': 'Hello Kitty Eat Asia' },
        category: 'cafes',
        description: { en: 'Hello Kitty Eat Asia', 'pt-BR': 'Hello Kitty Eat Asia' },
        lat: -23.55723,
        lng: -46.63478,
        address: 'Rua Américo de Campos, 118, Liberdade, Sao Paulo - SP, 01506-010, Brazil',
      },
      {
        id: 'sp-jardim-oriental-liberdade',
        name: { en: 'Jardim Oriental Liberdade', 'pt-BR': 'Jardim Oriental Liberdade' },
        category: 'tourist',
        description: { en: 'Jardim Oriental Liberdade', 'pt-BR': 'Jardim Oriental Liberdade' },
        lat: -23.55445,
        lng: -46.63524,
        address: 'Rua Galvão Bueno, 71, Sé, Sao Paulo - SP, 01506-000, Brazil',
      },
      {
        id: 'sp-korea-mart',
        name: { en: 'Korea Mart', 'pt-BR': 'Korea Mart' },
        category: 'tourist',
        description: { en: 'Korea Mart', 'pt-BR': 'Korea Mart' },
        lat: -23.5554,
        lng: -46.63476,
        address: 'Rua dos Estudantes, 41, Sé, Sao Paulo - SP, 01505-000, Brazil',
      },
      {
        id: 'sp-lamen-aska',
        name: { en: 'Lamen ASKA', 'pt-BR': 'Lamen ASKA' },
        category: 'restaurants',
        description: { en: 'Lamen ASKA', 'pt-BR': 'Lamen ASKA' },
        lat: -23.55837,
        lng: -46.63448,
        address: 'Rua Barão de Iguape, 260, Liberdade, Sao Paulo - SP, 01503-001, Brazil',
      },
      {
        id: 'sp-modern-mamma-osteria',
        name: { en: 'Modern Mamma Osteria', 'pt-BR': 'Modern Mamma Osteria' },
        category: 'restaurants',
        description: { en: 'Modern Mamma Osteria', 'pt-BR': 'Modern Mamma Osteria' },
        lat: -23.5819,
        lng: -46.67984,
        address: 'Rua Manuel Guedes, 160, Itaim Bibi, Sao Paulo - SP, 04536-070, Brazil',
      },
      {
        id: 'sp-mooi-mooi',
        name: { en: 'Mooi Mooi', 'pt-BR': 'Mooi Mooi' },
        category: 'cafes',
        description: { en: 'Mooi Mooi', 'pt-BR': 'Mooi Mooi' },
        lat: -23.58269,
        lng: -46.67938,
        address: 'Rua Manuel Guedes, 249, Itaim Bibi, Sao Paulo - SP, 04536-070, Brazil',
      },
      {
        id: 'sp-paul-s-boutique-pizza-itaim-bibi',
        name: { en: "Paul's Boutique Pizza - Itaim Bibi", 'pt-BR': "Paul's Boutique Pizza - Itaim Bibi" },
        category: 'restaurants',
        description: { en: "Paul's Boutique Pizza - Itaim Bibi", 'pt-BR': "Paul's Boutique Pizza - Itaim Bibi" },
        lat: -23.58008,
        lng: -46.6747,
        address: 'Rua Doutor Renato Paes de Barros, 167, Itaim Bibi, Sao Paulo - SP, 04530-000, Brazil',
      },
      {
        id: 'sp-rascal',
        name: { en: 'Ráscal', 'pt-BR': 'Ráscal' },
        category: 'restaurants',
        description: { en: 'Ráscal', 'pt-BR': 'Ráscal' },
        lat: -23.57659,
        lng: -46.68761,
        address: 'Shopping Iguatemi, Avenida Brigadeiro Faria Lima, 2232, Pinheiros, Sao Paulo - SP, 01452-001, Brazil',
      },
      {
        id: 'sp-shopping-iguatemi-sp',
        name: { en: 'Shopping Iguatemi SP', 'pt-BR': 'Shopping Iguatemi SP' },
        category: 'tourist',
        description: { en: 'Shopping Iguatemi SP', 'pt-BR': 'Shopping Iguatemi SP' },
        lat: -23.57659,
        lng: -46.68761,
        address: 'Shopping Iguatemi, Avenida Brigadeiro Faria Lima, 2232, Pinheiros, Sao Paulo - SP, 01452-001, Brazil',
      },
      {
        id: 'sp-sogo-plaza-shopping',
        name: { en: 'Sogo Plaza Shopping', 'pt-BR': 'Sogo Plaza Shopping' },
        category: 'tourist',
        description: { en: 'Sogo Plaza Shopping', 'pt-BR': 'Sogo Plaza Shopping' },
        lat: -23.556,
        lng: -46.63565,
        address: 'Avenida da Liberdade, 363, Sé, Sao Paulo - SP, 01502-000, Brazil',
      },
      {
        id: 'sp-tour-nubank-park',
        name: { en: 'Tour Nubank Park', 'pt-BR': 'Tour Nubank Park' },
        category: 'tourist',
        description: { en: 'Tour Nubank Park', 'pt-BR': 'Tour Nubank Park' },
        lat: -23.52735,
        lng: -46.67926,
        address: 'Avenida Francisco Matarazzo, 1705, Barra Funda, Sao Paulo - SP, 05001-200, Brazil',
      },
      {
        id: 'sp-we-coffee-faria-lima',
        name: { en: 'We Coffee Faria Lima', 'pt-BR': 'We Coffee Faria Lima' },
        category: 'cafes',
        description: { en: 'We Coffee Faria Lima', 'pt-BR': 'We Coffee Faria Lima' },
        lat: -23.57241,
        lng: -46.69021,
        address: 'Avenida Brigadeiro Faria Lima, 1690, Pinheiros, Sao Paulo - SP, 01451-001, Brazil',
      },
    ],
  },
  {
    slug: 'florianopolis',
    name: { en: 'Florianópolis', 'pt-BR': 'Florianópolis' },
    region: 'SC',
    country: { en: 'Brazil', 'pt-BR': 'Brasil' },
    countryKey: 'brasil',
    lat: -27.5954,
    lng: -48.548,
    zoom: 11,
    places: [
      {
        id: 'floripa-fln',
        name: {
          en: 'Hercílio Luz Airport (FLN)',
          'pt-BR': 'Aeroporto Hercílio Luz (FLN)',
        },
        category: 'airport',
        description: {
          en: 'Island arrival point, short hop to the lagoa and beaches.',
          'pt-BR': 'Chegada na ilha, a um pulo da lagoa e das praias.',
        },
        googleRating: 4.6,
        lat: -27.6703,
        lng: -48.5525,
        address: 'Av. Deputado Diomício Freitas, 3393 - Carianos, Florianópolis - SC',
        mapsQuery: 'Aeroporto Internacional de Florianópolis FLN',
      },
      {
        id: 'floripa-lagoa',
        name: {
          en: 'Lagoa da Conceição',
          'pt-BR': 'Lagoa da Conceição',
        },
        category: 'parks',
        description: {
          en: 'Lake life hub: bars, kitesurf, and sunset energy.',
          'pt-BR': 'Polo da vida na lagoa: bares, kitesurf e energia de fim de tarde.',
        },
        googleRating: 4.4,
        lat: -27.6035,
        lng: -48.463,
        area: areaBox(-27.6035, -48.463, 0.018, 0.022),
        address: 'Lagoa da Conceição, Florianópolis - SC',
        mapsQuery: 'Lagoa da Conceição Florianópolis',
      },
      {
        id: 'floripa-joaquina',
        name: { en: 'Joaquina Beach', 'pt-BR': 'Praia da Joaquina' },
        category: 'parks',
        description: {
          en: 'Surf beach with dunes and strong Atlantic waves.',
          'pt-BR': 'Praia de surf com dunas e ondas fortes do Atlântico.',
        },
        googleRating: 4.7,
        lat: -27.6286,
        lng: -48.4486,
        area: {
          kind: 'polyline',
          path: [
            [-27.622, -48.452],
            [-27.625, -48.45],
            [-27.6286, -48.4486],
            [-27.632, -48.447],
            [-27.636, -48.446],
          ],
        },
        address: 'Praia da Joaquina, Florianópolis - SC',
        mapsQuery: 'Praia da Joaquina Florianópolis',
      },
      {
        id: 'floripa-mercado-publico',
        name: { en: 'Public Market', 'pt-BR': 'Mercado Público' },
        category: 'restaurants',
        description: {
          en: 'Historic downtown market for oysters, craft, and local snacks.',
          'pt-BR': 'Mercado histórico do centro: ostras, artesanato e petiscos locais.',
        },
        googleRating: 4.5,
        lat: -27.5958,
        lng: -48.5534,
        address: 'Av. Paulo Fontes - Centro, Florianópolis - SC',
        mapsQuery: 'Mercado Público de Florianópolis',
      },
    ],
  },
  {
    slug: 'new-york',
    name: { en: 'New York', 'pt-BR': 'Nova York' },
    region: 'NY',
    country: { en: 'USA', 'pt-BR': 'EUA' },
    countryKey: 'usa',
    lat: 40.7128,
    lng: -74.006,
    zoom: 12,
    places: [
      {
        id: 'nyc-jfk',
        name: {
          en: 'JFK Airport',
          'pt-BR': 'Aeroporto JFK',
        },
        category: 'airport',
        description: {
          en: 'Primary long-haul airport for New York.',
          'pt-BR': 'Principal aeroporto de voos longos de Nova York.',
        },
        googleRating: 3.9,
        lat: 40.6413,
        lng: -73.7781,
        address: 'Queens, NY 11430, USA',
        mapsQuery: 'John F. Kennedy International Airport JFK',
      },
      {
        id: 'nyc-central-park',
        name: { en: 'Central Park', 'pt-BR': 'Central Park' },
        category: 'parks',
        description: {
          en: 'The classic green escape in the middle of Manhattan.',
          'pt-BR': 'O clássico refúgio verde no meio de Manhattan.',
        },
        googleRating: 4.8,
        lat: 40.7829,
        lng: -73.9654,
        // Rough rectangle of the park (N–S stretch)
        area: {
          kind: 'polygon',
          path: [
            [40.7681, -73.9819],
            [40.7681, -73.9491],
            [40.8006, -73.9491],
            [40.8006, -73.9582],
          ],
        },
        address: 'New York, NY 10024, USA',
        mapsQuery: 'Central Park New York',
      },
      {
        id: 'nyc-moma',
        name: { en: 'MoMA', 'pt-BR': 'MoMA' },
        category: 'tourist',
        description: {
          en: 'Modern art heavyweight. Go early and pick a floor.',
          'pt-BR': 'Peso-pesado da arte moderna. Chegue cedo e escolha um andar.',
        },
        googleRating: 4.6,
        lat: 40.7614,
        lng: -73.9776,
        address: '11 W 53rd St, New York, NY 10019, USA',
        mapsQuery: 'Museum of Modern Art MoMA New York',
      },
      {
        id: 'nyc-soho',
        name: { en: 'SoHo', 'pt-BR': 'SoHo' },
        category: 'tourist',
        description: {
          en: 'Cast-iron streets, boutiques, and gallery hopping.',
          'pt-BR': 'Ruas de ferro fundido, boutiques e galerias.',
        },
        googleRating: 4.6,
        lat: 40.7233,
        lng: -74.003,
        area: areaBox(40.7233, -74.003, 0.006, 0.008),
        address: 'SoHo, New York, NY, USA',
        mapsQuery: 'SoHo Manhattan New York',
      },
      {
        id: 'nyc-brooklyn-bridge',
        name: { en: 'Brooklyn Bridge', 'pt-BR': 'Ponte do Brooklyn' },
        category: 'tourist',
        description: {
          en: 'Walk the bridge at golden hour for the skyline payoff.',
          'pt-BR': 'Cruze a ponte no golden hour pela vista do skyline.',
        },
        googleRating: 4.8,
        lat: 40.7061,
        lng: -73.9969,
        area: {
          kind: 'polyline',
          path: [
            [40.7125, -74.005],
            [40.709, -74.001],
            [40.7061, -73.9969],
            [40.703, -73.993],
            [40.7005, -73.9895],
          ],
        },
        address: 'Brooklyn Bridge, New York, NY, USA',
        mapsQuery: 'Brooklyn Bridge New York',
      },
    ],
  },
  {
    slug: 'miami',
    name: { en: 'Miami', 'pt-BR': 'Miami' },
    region: 'FL',
    country: { en: 'USA', 'pt-BR': 'EUA' },
    countryKey: 'usa',
    lat: 25.7617,
    lng: -80.1918,
    zoom: 12,
    places: [
      {
        id: 'mia-mia',
        name: {
          en: 'Miami International Airport (MIA)',
          'pt-BR': 'Aeroporto Internacional de Miami (MIA)',
        },
        category: 'airport',
        description: {
          en: 'Hub for Latin America and the Caribbean.',
          'pt-BR': 'Hub para América Latina e Caribe.',
        },
        googleRating: 3.9,
        lat: 25.7959,
        lng: -80.287,
        address: '2100 NW 42nd Ave, Miami, FL 33126, USA',
        mapsQuery: 'Miami International Airport MIA',
      },
      {
        id: 'mia-south-beach',
        name: { en: 'South Beach', 'pt-BR': 'South Beach' },
        category: 'tourist',
        description: {
          en: 'Art Deco strip, beach days, and Ocean Drive energy.',
          'pt-BR': 'Faixa Art Déco, dias de praia e a energia da Ocean Drive.',
        },
        googleRating: 4.6,
        lat: 25.7826,
        lng: -80.1341,
        area: {
          kind: 'polyline',
          // Ocean Drive corridor (avenue-style highlight)
          path: [
            [25.7905, -80.1305],
            [25.7865, -80.1318],
            [25.7826, -80.1341],
            [25.778, -80.1365],
            [25.7735, -80.1388],
          ],
        },
        address: 'Ocean Drive, Miami Beach, FL, USA',
        mapsQuery: 'South Beach Miami Beach',
      },
      {
        id: 'mia-wynwood',
        name: { en: 'Wynwood Walls', 'pt-BR': 'Wynwood Walls' },
        category: 'tourist',
        description: {
          en: 'Open-air street art district with murals and coffee spots.',
          'pt-BR': 'Distrito a céu aberto de street art, murais e cafés.',
        },
        googleRating: 4.7,
        lat: 25.801,
        lng: -80.1994,
        area: areaBox(25.801, -80.1994, 0.004, 0.005),
        address: '2520 NW 2nd Ave, Miami, FL 33127, USA',
        mapsQuery: 'Wynwood Walls Miami',
      },
      {
        id: 'mia-little-havana',
        name: { en: 'Little Havana', 'pt-BR': 'Little Havana' },
        category: 'restaurants',
        description: {
          en: 'Cuban coffee, domino park, and Calle Ocho rhythm.',
          'pt-BR': 'Café cubano, parque de dominó e o ritmo da Calle Ocho.',
        },
        googleRating: 4.5,
        lat: 25.7655,
        lng: -80.2201,
        address: 'Calle Ocho, Little Havana, Miami, FL, USA',
        mapsQuery: 'Little Havana Miami Calle Ocho',
      },
    ],
  },
  {
    slug: 'paris',
    name: { en: 'Paris', 'pt-BR': 'Paris' },
    country: { en: 'France', 'pt-BR': 'França' },
    countryKey: 'franca',
    lat: 48.8566,
    lng: 2.3522,
    zoom: 14,
    places: [
      {
        id: 'par-ory',
        name: { en: 'Orly Airport (ORY)', 'pt-BR': 'Aeroporto de Orly (ORY)' },
        category: 'airport',
        featured: true,
        description: {
          en: 'Southern Paris gateway. Often smoother than CDG for shorter hops.',
          'pt-BR': 'Porta sul de Paris. Costuma ser mais tranquilo que o CDG em voos curtos.',
        },
        googleRating: 3.7,
        lat: 48.7233,
        lng: 2.3794,
        address: '94390 Orly, France',
        mapsQuery: 'Aéroport de Paris-Orly ORY',
      },
      {
        id: 'par-cdg',
        name: {
          en: 'Charles de Gaulle Airport (CDG)',
          'pt-BR': 'Aeroporto Charles de Gaulle (CDG)',
        },
        category: 'airport',
        featured: true,
        description: {
          en: 'Main long-haul hub north of Paris. RER B into the city (~45–60 min to the center).',
          'pt-BR':
            'Principal hub de longos voos ao norte de Paris. RER B até a cidade (~45–60 min ao centro).',
        },
        googleRating: 3.6,
        lat: 49.0097,
        lng: 2.5479,
        address: '95700 Roissy-en-France, France',
        mapsQuery: 'Aéroport de Paris-Charles de Gaulle CDG',
      },
      {
        id: 'par-cdg-paul',
        name: { en: 'PAUL CDG', 'pt-BR': 'PAUL CDG' },
        category: 'cafes',
        description: {
          en: 'Bakery-café in Terminal 2 — croissants and coffee on the way to the RER.',
          'pt-BR':
            'Padaria-café no Terminal 2 — croissants e café a caminho do RER.',
        },
        googleRating: 3.8,
        lat: 49.0046,
        lng: 2.5718,
        address: 'Aéroport Paris-Charles de Gaulle, Terminal 2, 95700 Roissy-en-France',
        mapsQuery: 'PAUL Aéroport Charles de Gaulle Terminal 2',
      },
      {
        id: 'par-cdg-rer',
        name: {
          en: 'CDG 2 TGV · Navigo',
          'pt-BR': 'CDG 2 TGV · Navigo',
        },
        category: 'transport',
        description: {
          en: 'RER B under Terminal 2 — buy Navigo Easy here, then ride into Paris (Magenta / Gare du Nord).',
          'pt-BR':
            'RER B sob o Terminal 2 — compre Navigo Easy aqui e siga para Paris (Magenta / Gare du Nord).',
        },
        googleRating: 3.6,
        lat: 49.0039,
        lng: 2.5708,
        address: 'Gare Aéroport Charles de Gaulle 2 TGV, 95700 Roissy-en-France',
        mapsQuery: 'Gare Aéroport Charles de Gaulle 2 TGV Navigo',
      },
      {
        id: 'par-orly-m14',
        name: {
          en: 'Orly Metro 14 · Navigo',
          'pt-BR': 'Metrô 14 Orly · Navigo',
        },
        category: 'transport',
        description: {
          en: 'Closest RATP point after landing — buy Navigo Easy cards for everyone, then ride M14 into Paris.',
          'pt-BR':
            'Ponto RATP mais perto após o desembarque — compre Navigo Easy para todos e pegue a M14 para Paris.',
        },
        googleRating: 4.0,
        lat: 48.7292,
        lng: 2.3698,
        address: 'Gare Orly 1-2-3 / Orly 4, Métro ligne 14',
        mapsQuery: 'Métro Orly ligne 14 Navigo',
      },
      {
        id: 'par-orly-paul',
        name: { en: 'PAUL Orly', 'pt-BR': 'PAUL Orly' },
        category: 'cafes',
        description: {
          en: 'Bakery-café at Orly — croissants and coffee right after Navigo setup.',
          'pt-BR':
            'Padaria-café em Orly — croissants e café logo após comprar o Navigo.',
        },
        googleRating: 3.9,
        lat: 48.7285,
        lng: 2.3685,
        address: 'Aéroport d’Orly, 94390 Orly',
        mapsQuery: 'PAUL Aéroport Orly',
      },
      {
        id: 'par-noisy-le-sec-rer',
        name: {
          en: 'Noisy-le-Sec station',
          'pt-BR': 'Gare de Noisy-le-Sec',
        },
        category: 'transport',
        description: {
          en: 'RER E stop for Casa do Gui — short walk to Rue des Bergeries.',
          'pt-BR':
            'Estação RER E da Casa do Gui — caminhada curta até a Rue des Bergeries.',
        },
        googleRating: 3.5,
        lat: 48.8907,
        lng: 2.4608,
        address: 'Place Jean-Jaurès, 93130 Noisy-le-Sec',
        mapsQuery: 'Gare de Noisy-le-Sec RER E',
      },
      {
        id: 'par-felicita',
        name: { en: 'La Felicità', 'pt-BR': 'La Felicità' },
        category: 'restaurants',
        description: {
          en: 'Huge food hall at Station F. Go hungry.',
          'pt-BR': 'Food hall enorme na Station F. Vá com fome.',
        },
        googleRating: 4.5,
        lat: 48.8339,
        lng: 2.371,
        address: '5 Parvis Alan Turing, 75013 Paris',
        mapsQuery: 'La Felicità Station F Paris',
        mapsUrl: 'https://maps.app.goo.gl/qhqK9AntK4mxKyWy7',
      },
      {
        id: 'par-bake-blend',
        name: {
          en: 'Le café by Maison Bergeron',
          'pt-BR': 'Le café by Maison Bergeron',
        },
        category: 'cafes',
        description: {
          en: 'Coffee and bakery stop near the Champ de Mars.',
          'pt-BR': 'Café e padaria perto do Champ de Mars.',
        },
        googleRating: 4.5,
        lat: 48.8584,
        lng: 2.3008,
        address: '1 Rue Amélie, 75007 Paris',
        mapsQuery: 'Le café by Maison Bergeron Paris',
        mapsUrl: 'https://maps.app.goo.gl/ezkYGpjLCM1ZrFuC8',
      },
      {
        id: 'par-champ-mars',
        name: { en: 'Champ de Mars', 'pt-BR': 'Champ de Mars' },
        category: 'parks',
        description: {
          en: 'The lawn under the Tower. Sunset picnic territory.',
          'pt-BR': 'O gramado sob a Torre. Território de piquenique no pôr do sol.',
        },
        rating: 5,
        googleRating: 4.6,
        favorite: true,
        lat: 48.8556,
        lng: 2.2986,
        // OSM park outline via travel-areas-osm.ts (par-champ-mars)
        address: 'Champ de Mars, 75007 Paris',
        mapsQuery: 'Champ de Mars Paris',
      },
      {
        id: 'par-eiffel',
        name: { en: 'Eiffel Tower', 'pt-BR': 'Torre Eiffel' },
        category: 'tourist',
        landmark: 'eiffel',
        description: {
          en: 'Still worth it. Go early or late for better light.',
          'pt-BR': 'Ainda vale. Vá cedo ou tarde pela luz.',
        },
        rating: 5,
        googleRating: 4.7,
        favorite: true,
        featured: true,
        lat: 48.8584,
        lng: 2.2945,
        address: 'Champ de Mars, 5 Av. Anatole France, 75007 Paris',
        mapsQuery: 'Tour Eiffel Paris',
        mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Tour%20Eiffel%20Paris&query_place_id=ChIJLU7jZClu5kcR4pc9BdEGZig',
        placeId: 'ChIJLU7jZClu5kcR4pc9BdEGZig',
      },
      {
        id: 'par-trocadero',
        name: { en: 'Trocadéro', 'pt-BR': 'Trocadéro' },
        category: 'photo',
        landmark: 'monument',
        description: {
          en: 'The classic postcard angle of the Tower.',
          'pt-BR': 'O ângulo clássico de cartão-postal da Torre.',
        },
        rating: 5,
        googleRating: 4.6,
        favorite: true,
        lat: 48.862,
        lng: 2.2877,
        // Place + esplanade facing the Tower
        area: {
          kind: 'polygon',
          path: [
            [48.8632, 2.2862],
            [48.8634, 2.2890],
            [48.8620, 2.2896],
            [48.8610, 2.2888],
            [48.8608, 2.2868],
            [48.8616, 2.2858],
          ],
        },
        address: 'Place du Trocadéro, 75016 Paris',
        mapsQuery: 'Trocadéro Paris',
      },
      {
        id: 'par-franklin-passy',
        name: { en: 'Le Franklin Passy', 'pt-BR': 'Le Franklin Passy' },
        category: 'restaurants',
        description: {
          en: 'Passy classic near Trocadéro.',
          'pt-BR': 'Clássico de Passy perto do Trocadéro.',
        },
        googleRating: 3.5,
        lat: 48.8596,
        lng: 2.2872,
        address: '1 Rue Benjamin Franklin, 75016 Paris',
        mapsQuery: 'LE FRANKLIN Passy Paris',
        mapsUrl: 'https://maps.app.goo.gl/nBDjajGsKQVvVZxq6',
      },
      {
        id: 'par-la-defense',
        name: { en: 'La Défense', 'pt-BR': 'La Défense' },
        category: 'parks',
        description: {
          en: 'Business skyline and the Grande Arche axis.',
          'pt-BR': 'Skyline corporativo e o eixo da Grande Arche.',
        },
        rating: 4.5,
        googleRating: 4.4,
        lat: 48.891,
        lng: 2.241,
        address: 'La Défense, 92800 Puteaux',
        mapsQuery: 'La Défense Paris',
      },
      {
        id: 'par-paul-defense',
        name: { en: 'PAUL La Défense', 'pt-BR': 'PAUL La Défense' },
        category: 'cafes',
        description: {
          en: 'Reliable bakery-café at La Défense — croissants, coffee, and a quick start before the Arche.',
          'pt-BR':
            'Padaria-café confiável em La Défense — croissants, café e largada rápida antes da Arche.',
        },
        googleRating: 4.2,
        lat: 48.8904,
        lng: 2.2378,
        address: 'Parvis de la Défense / Les Quatre Temps, 92800 Puteaux',
        mapsQuery: 'PAUL La Défense Parvis',
      },
      {
        id: 'par-grande-arche',
        name: {
          en: 'Grande Arche de la Défense',
          'pt-BR': 'Grande Arche de la Défense',
        },
        category: 'photo',
        landmark: 'monument',
        description: {
          en: 'The “Great Arch” — cube frame on the historic axis. Best photos from the parvis and steps.',
          'pt-BR':
            'O “Grande Arco” — cubo no eixo histórico. Melhores fotos no parvis e na escadaria.',
        },
        rating: 4.5,
        favorite: true,
        googleRating: 4.4,
        lat: 48.8927,
        lng: 2.2359,
        address: '1 Parvis de la Défense, 92040 Paris La Défense',
        mapsQuery: 'Grande Arche de la Défense',
      },
      {
        id: 'par-esplanade-de-gaulle',
        name: {
          en: 'Esplanade du Général de Gaulle',
          'pt-BR': 'Esplanade du Général de Gaulle',
        },
        category: 'photo',
        description: {
          en: 'Long open esplanade under the towers — skyline, fountains, and the axis toward Paris.',
          'pt-BR':
            'Esplanada longa sob as torres — skyline, fontes e o eixo em direção a Paris.',
        },
        rating: 4.5,
        googleRating: 4.3,
        lat: 48.8889,
        lng: 2.2468,
        address: 'Esplanade du Général de Gaulle, 92800 Puteaux',
        mapsQuery: 'Esplanade du Général de Gaulle La Défense',
      },
      {
        id: 'par-monoprix-rivoli',
        name: {
          en: 'Monoprix Opéra (picnic)',
          'pt-BR': 'Monoprix Opéra (piquenique)',
        },
        category: 'markets',
        description: {
          en: 'Monoprix on Av. de l’Opéra — sandwiches, fruit, drinks for a Tuileries picnic.',
          'pt-BR':
            'Monoprix na Av. de l’Opéra — sanduíches, fruta e bebidas pro piquenique nas Tuileries.',
        },
        googleRating: 4.0,
        lat: 48.8664526,
        lng: 2.333868,
        address: "23 Av. de l'Opéra, 75001 Paris",
        mapsQuery: "Monoprix 23 Avenue de l'Opéra Paris",
        mapsUrl:
          'https://www.google.com/maps/search/?api=1&query=Monoprix+23+Avenue+de+l%27Op%C3%A9ra+Paris',
      },
      {
        id: 'par-louvre',
        name: { en: 'Louvre', 'pt-BR': 'Louvre' },
        category: 'tourist',
        landmark: 'louvre',
        description: {
          en: 'Plan a route. The building is half the experience.',
          'pt-BR': 'Planeje um roteiro. O prédio é metade da experiência.',
        },
        rating: 5,
        googleRating: 4.7,
        favorite: true,
        featured: true,
        lat: 48.8606,
        lng: 2.3376,
        // Cour carrée + Denon/Sully footprint (simplified)
        area: {
          kind: 'polygon',
          path: [
            [48.8618, 2.3338],
            [48.8622, 2.3390],
            [48.8608, 2.3402],
            [48.8594, 2.3395],
            [48.8590, 2.3355],
            [48.8598, 2.3335],
          ],
        },
        address: 'Rue de Rivoli, 75001 Paris',
        mapsQuery: 'Musée du Louvre Paris',
      },
      {
        id: 'par-tuileries',
        name: { en: 'Tuileries Garden', 'pt-BR': 'Jardim das Tulherias' },
        category: 'parks',
        description: {
          en: 'Between Louvre and Concorde. Perfect walking spine.',
          'pt-BR': 'Entre o Louvre e a Concorde. Eixo perfeito para caminhar.',
        },
        rating: 5,
        googleRating: 4.6,
        favorite: true,
        lat: 48.8634,
        lng: 2.3275,
        // Long east–west garden between Louvre and Concorde
        area: {
          kind: 'polygon',
          path: [
            [48.8646, 2.3215],
            [48.8650, 2.3298],
            [48.8642, 2.3335],
            [48.8626, 2.3332],
            [48.8620, 2.3290],
            [48.8622, 2.3218],
          ],
        },
        address: 'Place de la Concorde, 75001 Paris',
        mapsQuery: 'Jardin des Tuileries Paris',
      },
      {
        id: 'par-champs-elysees',
        name: { en: 'Champs-Élysées', 'pt-BR': 'Champs-Élysées' },
        category: 'parks',
        description: {
          en: 'The avenue. Walk from Concorde up to the Arc.',
          'pt-BR': 'A avenida. Suba da Concorde até o Arco.',
        },
        rating: 4.5,
        googleRating: 4.7,
        favorite: true,
        lat: 48.8698,
        lng: 2.3078,
        // Fallback; precise full-avenue polyline is in travel-areas-osm.ts
        area: {
          kind: 'polyline',
          path: [
            [48.86555, 2.32105],
            [48.86745, 2.31494],
            [48.86977, 2.30767],
            [48.87183, 2.30116],
            [48.87355, 2.2955],
          ],
        },
        address: 'Av. des Champs-Élysées, 75008 Paris',
        mapsQuery: 'Champs-Élysées Paris',
      },
      {
        id: 'par-arc-triomphe',
        name: { en: 'Arc de Triomphe', 'pt-BR': 'Arco do Triunfo' },
        category: 'tourist',
        landmark: 'arc',
        description: {
          en: 'Climb for the axis view over the city.',
          'pt-BR': 'Suba pela vista do eixo sobre a cidade.',
        },
        rating: 5,
        favorite: true,
        googleRating: 4.7,
        lat: 48.8738,
        lng: 2.295,
        address: 'Place Charles de Gaulle, 75008 Paris',
        mapsQuery: 'Arc de Triomphe Paris',
      },
      {
        id: 'par-pierre-herme',
        name: { en: 'Pierre Hermé', 'pt-BR': 'Pierre Hermé' },
        category: 'cafes',
        description: {
          en: 'Macaron pilgrimage. Pick a signature box.',
          'pt-BR': 'Peregrinação de macaron. Pegue uma caixa assinatura.',
        },
        rating: 4,
        googleRating: 4.4,
        lat: 48.871363,
        lng: 2.3037531,
        address: '86 Av. des Champs-Élysées, 75008 Paris',
        mapsQuery: 'Pierre Hermé Paris',
        mapsUrl: 'https://www.google.fr/maps/place/Pierre+Herm%C3%A9/@48.871363,2.3015,18z',
      },
      {
        id: 'par-maison-balzac',
        name: { en: 'Maison de Balzac', 'pt-BR': 'Maison de Balzac' },
        category: 'parks',
        description: {
          en: 'Only if you are already nearby — tiny house-museum. Decent Tower view, but Paris has many better ones, and it sits in a quiet pocket with little around it.',
          'pt-BR': 'Só se estiver passando perto — é super pequeno. Tem boa vista da Torre, mas Paris tem dezenas melhores, e o ponto não tem muita coisa em volta.',
        },
        googleRating: 4.3,
        lat: 48.8554541,
        lng: 2.2809102,
        address: '47 Rue Raynouard, 75016 Paris',
        mapsQuery: 'Maison de Balzac Paris',
        mapsUrl: 'https://www.google.fr/maps/place/Maison+de+Balzac/@48.8520676,2.2646642,14z',
      },
      {
        id: 'par-invalides',
        name: { en: 'Invalides', 'pt-BR': 'Invalides' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Dome, museums, and a wide open esplanade.',
          'pt-BR': 'Cúpula, museus e esplanada aberta.',
        },
        googleRating: 4.7,
        lat: 48.8565,
        lng: 2.3125,
        // OSM complex outline via travel-areas-osm.ts (par-invalides)
        address: '129 Rue de Grenelle, 75007 Paris',
        mapsQuery: 'Invalides Paris',
      },
      {
        id: 'par-alexandre-iii',
        name: { en: 'Pont Alexandre III', 'pt-BR': 'Ponte Alexandre III' },
        category: 'photo',
        description: {
          en: 'Most ornate bridge in the city. Golden hour magic.',
          'pt-BR': 'A ponte mais ornamentada da cidade. Magia no golden hour.',
        },
        googleRating: 4.8,
        lat: 48.8638,
        lng: 2.3135,
        // Bridge span centerline via travel-areas-osm.ts (par-alexandre-iii)
        address: 'Pont Alexandre III, 75008 Paris',
        mapsQuery: 'Pont Alexandre III Paris',
      },
      {
        id: 'par-palais',
        name: { en: 'Petit & Grand Palais', 'pt-BR': 'Petit e Grand Palais' },
        category: 'tourist',
        description: {
          en: 'Twin exhibition palaces on the Champs-Élysées / Seine side. Petit Palais permanent collections are often free; Grand Palais depends on the show. Café inside the Petit is worth it for the room alone.',
          'pt-BR': 'Palácios de exposição na Champs-Élysées / Sena. Coleções permanentes do Petit costumam ser grátis; Grand depende da mostra. O café de dentro do Petit vale pelo ambiente.',
        },
        rating: 4.5,
        favorite: true,
        googleRating: 4.7,
        lat: 48.8661,
        lng: 2.3126,
        // OSM multipolygon: both buildings via travel-areas-osm.ts (par-palais)
        address: 'Av. Winston Churchill, 75008 Paris',
        mapsQuery: 'Grand Palais Petit Palais Paris',
      },
      {
        id: 'par-petit-palais-cafe',
        name: {
          en: 'Café du Petit Palais',
          'pt-BR': 'Café do Petit Palais',
        },
        category: 'cafes',
        description: {
          en: 'Café inside the Petit Palais — go for the room and garden courtyard more than for a destination pastry. On the Champs-Élysées side.',
          'pt-BR': 'Café dentro do Petit Palais — vale pelo ambiente e pátio, não tanto pela confeitaria em si. Fica na Champs-Élysées.',
        },
        googleRating: 4.4,
        lat: 48.86605,
        lng: 2.31455,
        address: 'Avenue Winston-Churchill, 75008 Paris',
        mapsQuery: 'Café du Petit Palais Paris',
      },
      {
        id: 'par-vendome',
        name: { en: 'Place Vendôme', 'pt-BR': 'Place Vendôme' },
        category: 'photo',
        description: {
          en: 'Luxury square and column. Clean geometry for photos.',
          'pt-BR': 'Praça de luxo e a coluna. Geometria limpa para fotos.',
        },
        googleRating: 4.7,
        lat: 48.8674,
        lng: 2.3295,
        // OSM plaza polygon via travel-areas-osm.ts
        address: 'Place Vendôme, 75001 Paris',
        mapsQuery: 'Place Vendôme Paris',
      },
      {
        id: 'par-cedric-grolet',
        name: { en: 'Cédric Grolet', 'pt-BR': 'Cédric Grolet' },
        category: 'cafes',
        description: {
          en: 'Pastry spectacle. Expect a line; worth the wait if you care.',
          'pt-BR': 'Espetáculo de confeitaria. Espere fila; vale se você curte.',
        },
        rating: 5,
        googleRating: 4.6,
        favorite: true,
        lat: 48.8678522,
        lng: 2.3332982,
        address: "35 Avenue de l'Opéra, 75002 Paris",
        mapsQuery: 'Cédric Grolet Paris',
        mapsUrl: 'https://www.google.fr/maps/place/C%C3%A9dric+Grolet/@48.8678522,2.3307233,17z',
      },
      {
        id: 'par-opera',
        name: { en: 'Opéra Garnier', 'pt-BR': 'Ópera Garnier' },
        category: 'tourist',
        landmark: 'opera',
        description: {
          en: 'Beaux-Arts overload. Interior if you can.',
          'pt-BR': 'Excesso Beaux-Arts. Interior se puder.',
        },
        rating: 4.5,
        googleRating: 4.7,
        lat: 48.8719,
        lng: 2.3317,
        // OSM building outline via travel-areas-osm.ts (par-opera)
        address: 'Pl. de l\'Opéra, 75009 Paris',
        mapsQuery: 'Opéra Garnier Paris',
      },
      {
        id: 'par-galeries-lafayette',
        name: { en: 'Galeries Lafayette', 'pt-BR': 'Galeries Lafayette' },
        category: 'shopping',
        description: {
          en: 'Dome, rooftop view, and department-store theater.',
          'pt-BR': 'Cúpula, terraço e teatro de loja de departamento.',
        },
        rating: 4.5,
        googleRating: 4.5,
        favorite: true,
        lat: 48.8738,
        lng: 2.332,
        // OSM multipolygon: both Haussmann buildings via travel-areas-osm.ts
        address: '40 Bd Haussmann, 75009 Paris',
        mapsQuery: 'Galeries Lafayette Haussmann',
      },
      {
        id: 'par-printemps',
        name: { en: 'Printemps', 'pt-BR': 'Printemps' },
        category: 'shopping',
        description: {
          en: 'Haussmann landmark with a strong rooftop stop.',
          'pt-BR': 'Marco de Haussmann com terraço forte.',
        },
        googleRating: 4.7,
        lat: 48.8737,
        lng: 2.328,
        address: '64 Bd Haussmann, 75009 Paris',
        mapsQuery: 'Printemps Haussmann Paris',
      },
      {
        id: 'par-eclair-genie',
        name: { en: 'L\'Éclair de Génie', 'pt-BR': 'L\'Éclair de Génie' },
        category: 'cafes',
        description: {
          en: 'Éclair specialists. Grab one and walk.',
          'pt-BR': 'Especialistas em éclair. Pegue um e caminhe.',
        },
        googleRating: 4.8,
        lat: 48.8731537,
        lng: 2.3304052,
        address: '32 Rue Notre-Dame-des-Victoires, 75002 Paris',
        mapsQuery: 'L\'Éclair de Génie Paris',
        mapsUrl: 'https://www.google.fr/maps/place/L\'Eclair+De+Genie/@48.8731535,2.325899,17z',
      },
      {
        id: 'par-francette',
        name: { en: 'Francette', 'pt-BR': 'Francette' },
        category: 'restaurants',
        description: {
          en: 'Port de Suffren terrace energy by the river.',
          'pt-BR': 'Energia de terraço no Port de Suffren, beira-rio.',
        },
        googleRating: 4.5,
        lat: 48.8558,
        lng: 2.2905,
        address: '1 Port de Suffren, 75007 Paris',
        mapsQuery: 'Francette Paris',
        mapsUrl: 'https://maps.app.goo.gl/saWLoSvCKrQWzaw79',
      },
      {
        id: 'par-maison-isabelle',
        name: { en: 'La Maison d\'Isabelle', 'pt-BR': 'La Maison d\'Isabelle' },
        category: 'cafes',
        description: {
          en: 'One of the most awarded croissants in Paris.',
          'pt-BR': 'Um dos croissants mais premiados de Paris.',
        },
        rating: 5,
        googleRating: 4.5,
        favorite: true,
        lat: 48.8498436,
        lng: 2.3482751,
        address: '47 Boulevard Saint-Germain, 75005 Paris',
        mapsQuery: 'La Maison d\'Isabelle Paris',
        mapsUrl: 'https://www.google.fr/maps/place/La+Maison+d\'Isabelle/@48.8498436,2.3457002,17z',
      },
      {
        id: 'par-luxembourg',
        name: { en: 'Luxembourg Garden', 'pt-BR': 'Jardim de Luxemburgo' },
        category: 'parks',
        description: {
          en: 'Paris park perfection. Chairs, trees, and slow hours.',
          'pt-BR': 'Parque parisiense perfeito. Cadeiras, árvores e horas lentas.',
        },
        googleRating: 4.7,
        lat: 48.8462,
        lng: 2.3372,
        area: {
          kind: 'polygon',
          path: [
            [48.8488, 2.3340],
            [48.8490, 2.3405],
            [48.8472, 2.3412],
            [48.8448, 2.3400],
            [48.8438, 2.3365],
            [48.8445, 2.3335],
            [48.8465, 2.3328],
          ],
        },
        address: 'Rue de Médicis / Pl. Edmond Rostand, 75006 Paris',
        mapsQuery: 'Jardin du Luxembourg Paris',
      },
      {
        id: 'par-pantheon',
        name: { en: 'Panthéon', 'pt-BR': 'Panteão' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Latin Quarter landmark. Dome views when open.',
          'pt-BR': 'Marco do Quartier Latin. Vista da cúpula quando aberta.',
        },
        googleRating: 4.6,
        lat: 48.8462,
        lng: 2.346,
        address: 'Pl. du Panthéon, 75005 Paris',
        mapsQuery: 'Panthéon Paris',
      },
      {
        id: 'par-mouffetard',
        name: {
          en: 'Rue Mouffetard walk',
          'pt-BR': 'Caminhada Rue Mouffetard',
        },
        category: 'parks',
        description: {
          en: 'One of the nicest Latin Quarter walks: start at Fontaine Guy Lartigue (bottom of the street / Place Saint-Médard) and stroll up Rue Mouffetard toward the Panthéon.',
          'pt-BR': 'Uma das caminhadas mais gostosas do Quartier Latin: comece na Fontaine Guy Lartigue (pé da rua / Place Saint-Médard) e suba a Rue Mouffetard até o Panteão.',
        },
        googleRating: 4.6,
        // Mid-street pin; polyline = fountain → Panthéon
        lat: 48.8438,
        lng: 2.3495,
        area: {
          kind: 'polyline',
          path: [
            [48.84155, 2.34975], // Fontaine Guy Lartigue / Place Saint-Médard
            [48.8424, 2.3496],
            [48.8435, 2.3494],
            [48.8446, 2.3491],
            [48.8455, 2.3484],
            [48.8462, 2.3469],
            [48.8462, 2.346], // Panthéon
          ],
        },
        address: 'Rue Mouffetard, 75005 Paris',
        mapsQuery: 'Rue Mouffetard Paris',
      },
      {
        id: 'par-jardin-plantes',
        name: {
          en: 'Jardin des Plantes',
          'pt-BR': 'Jardin des Plantes',
        },
        category: 'tourist',
        description: {
          en: 'Botanical garden + natural-history museums. Best entry via Fontaine Cuvier (Rue Cuvier side).',
          'pt-BR': 'Jardim botânico + museus de história natural. Entrada pela Fontaine Cuvier (lado da Rue Cuvier).',
        },
        googleRating: 4.6,
        // Pin on Fontaine Cuvier entrance
        lat: 48.84455,
        lng: 2.35595,
        address: '57 Rue Cuvier, 75005 Paris',
        mapsQuery: 'Fontaine Cuvier Jardin des Plantes Paris',
      },
      {
        id: 'par-carnavalet',
        name: {
          en: 'Musée Carnavalet',
          'pt-BR': 'Musée Carnavalet',
        },
        category: 'tourist',
        description: {
          en: 'Museum of the history of Paris — free permanent collections in a beautiful Marais mansion. Great rainy-day pick.',
          'pt-BR': 'Museu da história de Paris — coleções permanentes grátis num hôtel particulier lindo do Marais. Ótimo para dia de chuva.',
        },
        googleRating: 4.6,
        lat: 48.8574,
        lng: 2.3621,
        address: '23 Rue de Sévigné, 75003 Paris',
        mapsQuery: 'Musée Carnavalet Paris',
      },
      {
        id: 'par-bourse-commerce',
        name: {
          en: 'Bourse de Commerce',
          'pt-BR': 'Bourse de Commerce',
        },
        category: 'tourist',
        description: {
          en: 'Pinault Collection in the restored circular exchange — contemporary art under a dramatic glass dome near Les Halles.',
          'pt-BR': 'Coleção Pinault na bolsa circular restaurada — arte contemporânea sob cúpula de vidro perto de Les Halles.',
        },
        googleRating: 4.5,
        lat: 48.8627,
        lng: 2.3426,
        address: '2 Rue de Viarmes, 75001 Paris',
        mapsQuery: 'Bourse de Commerce Pinault Collection Paris',
      },
      {
        id: 'par-sorbonne',
        name: { en: 'Rue de la Sorbonne', 'pt-BR': 'Rue de la Sorbonne' },
        category: 'parks',
        description: {
          en: 'University street energy around the old colleges.',
          'pt-BR': 'Energia de rua universitária entre os colégios antigos.',
        },
        googleRating: 4.4,
        lat: 48.8493577,
        lng: 2.3432944,
        // Geometry: OSM LineString in travel-areas-osm.ts (par-sorbonne)
        address: 'Rue de la Sorbonne, 75005 Paris',
        mapsQuery: 'Rue de la Sorbonne Paris',
        mapsUrl: 'https://www.google.fr/maps/place/Rue+de+la+Sorbonne,+75005+Paris/@48.8492618,2.3395419,17z',
      },
      {
        id: 'par-creperie-arts',
        name: { en: 'Crêperie des Arts', 'pt-BR': 'Crêperie des Arts' },
        category: 'restaurants',
        description: {
          en: 'Crêpes on Rue Saint-André des Arts.',
          'pt-BR': 'Crêpes na Rue Saint-André des Arts.',
        },
        googleRating: 4.4,
        lat: 48.8532,
        lng: 2.3405,
        address: '27 Rue Saint-André des Arts, 75006 Paris',
        mapsQuery: 'Crêperie des Arts Paris',
        mapsUrl: 'https://www.google.com/maps?q=Cr%C3%AAperie+des+Arts,+27+Rue+Saint-Andr%C3%A9+des+Arts,+75006+Paris',
      },
      {
        id: 'par-auptitgrec',
        name: { en: 'Au P\'tit Grec', 'pt-BR': 'Au P\'tit Grec' },
        category: 'restaurants',
        description: {
          en: 'Late crêpes and Latin Quarter fuel.',
          'pt-BR': 'Crêpes até tarde e combustível do Quartier Latin.',
        },
        googleRating: 4.5,
        lat: 48.8476825,
        lng: 2.3424713,
        address: '126 Rue Mouffetard, 75005 Paris',
        mapsQuery: 'Au P\'tit Grec crêperie Paris',
        mapsUrl: 'https://maps.app.goo.gl/24XKWbRP9i2aLFjS6',
      },
      {
        id: 'par-cour-commerce',
        name: { en: 'Cour du Commerce Saint-André', 'pt-BR': 'Cour du Commerce Saint-André' },
        category: 'parks',
        description: {
          en: 'Only worth it if you are lunching or dining at a restaurant in the passage. Do not detour just to walk through.',
          'pt-BR': 'Só se for almoçar/jantar num restaurante da passagem. Não compensa só passar por passar.',
        },
        rating: 5,
        googleRating: 5.0,
        favorite: true,
        // Mid-passage — full path from OSM (travel-areas-osm.ts / par-cour-commerce)
        lat: 48.8530736,
        lng: 2.3390876,
        address: 'Cr du Commerce Saint-André, 75006 Paris',
        mapsQuery: 'Cour du Commerce Saint-André Paris',
        mapsUrl: 'https://www.google.fr/maps/place/Cr+du+Commerce+Saint-Andr%C3%A9,+75006+Paris/@48.853095,2.3383737,18.5z',
      },
      {
        id: 'par-procope',
        name: { en: 'Le Procope', 'pt-BR': 'Le Procope' },
        category: 'restaurants',
        description: {
          en: 'Historic café-restaurant. Old Paris atmosphere.',
          'pt-BR': 'Café-restaurante histórico. Atmosfera de Paris antiga.',
        },
        googleRating: 4.5,
        lat: 48.8529913,
        lng: 2.3387975,
        address: '13 Rue de l\'Ancienne Comédie, 75006 Paris',
        mapsQuery: 'Le Procope Paris',
        mapsUrl: 'https://www.google.fr/maps/place/Le+Procope/@48.853095,2.3383737,18.5z',
      },
      {
        id: 'par-brasserie-pres',
        name: { en: 'Brasserie des Prés', 'pt-BR': 'Brasserie des Prés' },
        category: 'restaurants',
        description: {
          en: 'Saint-Germain brasserie energy near the passage.',
          'pt-BR': 'Energia de brasserie em Saint-Germain perto da passagem.',
        },
        googleRating: 4.7,
        lat: 48.8529451,
        lng: 2.3391987,
        address: '6 Cour du Commerce Saint-André, 75006 Paris',
        mapsQuery: 'Brasserie des Prés Paris',
        mapsUrl: 'https://www.google.fr/maps/place/Brasserie+des+Pr%C3%A9s/@48.853095,2.3383737,18.5z',
      },
      {
        id: 'par-saint-michel',
        name: { en: 'Place Saint-Michel', 'pt-BR': 'Place Saint-Michel' },
        category: 'photo',
        description: {
          en: 'Fountain, students, and the river steps nearby.',
          'pt-BR': 'Fonte, estudantes e as escadas do rio por perto.',
        },
        googleRating: 4.4,
        lat: 48.8534,
        lng: 2.344,
        address: 'Pl. Saint-Michel, 75005 Paris',
        mapsQuery: 'Place Saint-Michel Paris',
      },
      {
        id: 'par-notre-dame',
        name: { en: 'Notre-Dame', 'pt-BR': 'Notre-Dame' },
        category: 'tourist',
        landmark: 'notre-dame',
        description: {
          en: 'Île de la Cité centerpiece. Walk the square and the bridges.',
          'pt-BR': 'Centro da Île de la Cité. Caminhe a praça e as pontes.',
        },
        rating: 5,
        googleRating: 4.7,
        favorite: true,
        lat: 48.853,
        lng: 2.3499,
        address: '6 Parvis Notre-Dame, 75004 Paris',
        mapsQuery: 'Cathédrale Notre-Dame de Paris',
      },
      {
        id: 'par-hotel-ville',
        name: { en: 'Hôtel de Ville', 'pt-BR': 'Hôtel de Ville' },
        category: 'photo',
        description: {
          en: 'City hall square. Often hosts outdoor installations.',
          'pt-BR': 'Praça da prefeitura. Costuma ter instalações ao ar livre.',
        },
        googleRating: 4.5,
        lat: 48.8566,
        lng: 2.3522,
        address: 'Pl. de l\'Hôtel de Ville, 75004 Paris',
        mapsQuery: 'Hôtel de Ville Paris',
      },
      {
        id: 'par-horloge',
        name: { en: 'Conciergerie Clock', 'pt-BR': 'Relógio da Conciergerie' },
        category: 'photo',
        description: {
          en: 'One of the oldest public clocks in Paris. Look up on the tower.',
          'pt-BR': 'Um dos relógios públicos mais antigos de Paris. Olhe a torre.',
        },
        googleRating: 4.6,
        // Tour Carrée de l'Horloge (OSM amenity=clock N2183872370)
        lat: 48.856193,
        lng: 2.346233,
        address: '2 Bd du Palais, 75001 Paris',
        mapsQuery: 'Horloge Conciergerie Paris',
      },
      {
        id: 'par-sainte-chapelle',
        name: { en: 'Sainte-Chapelle', 'pt-BR': 'Sainte-Chapelle' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Stained glass overload. Book ahead when you can.',
          'pt-BR': 'Excesso de vitrais. Reserve com antecedência se puder.',
        },
        googleRating: 4.6,
        lat: 48.8554,
        lng: 2.345,
        address: '10 Bd du Palais, 75001 Paris',
        mapsQuery: 'Sainte-Chapelle Paris',
      },
      {
        id: 'par-fric-frac',
        name: { en: 'Fric-Frac', 'pt-BR': 'Fric-Frac' },
        category: 'restaurants',
        description: {
          en: 'Croque-monsieur specialists up by Canal Saint-Martin energy.',
          'pt-BR': 'Especialistas em croque perto da energia do Canal Saint-Martin.',
        },
        googleRating: 4.9,
        lat: 48.8838194,
        lng: 2.3416479,
        address: '99 Quai de Valmy, 75010 Paris',
        mapsQuery: 'Fric-Frac Paris',
        mapsUrl: 'https://www.google.fr/maps/place/Fric-Frac/@48.8838194,2.339073,17z',
        photos: [
          { url: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmkqKIki4X_Tupd_EdtFlhAhtb7kY02aRD9vm7Nz9H8osxzdiT_dWvVx4Gr_cs8Yz2EnSIJGqVKn4JJxy3ocyEkbOZBWWxcnd5GAigMl0LGYDWiUwxvmnTXcDq4Y2ENEdBg6B15WJ68U79G=s680-k-no', alt: { en: 'Fric-Frac', 'pt-BR': 'Fric-Frac' } },
          { url: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlD4ghyPj5w5SLgYvVsM5lqO9eNyehTnyop-yiROxQqZugcU_T2ReuhcR1bCmDkhIFQqaRSecrOy9b67_e4Qrdz-RBqO52s7Bb-j1UzM9742e9VWbknRevRJe2aaHt8zL7QFTWbDQ=w203-h253-k-no', alt: { en: 'Fric-Frac', 'pt-BR': 'Fric-Frac' } },
          { url: 'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkk3eyHim9CynAO6lG7bgPJw5CThG1BHEiHj51pFtqTgqq0uAw-E3MRQORFe1I-8F5OQdUbPQ6hmQ8jXA_VYRX06Oy78RGzHQ5-NOJ-opNrKkEKW-nfcyF563i33Rf6LWd8z2wT7ej_RDFk=s736-k-no', alt: { en: 'Fric-Frac', 'pt-BR': 'Fric-Frac' } },
          { url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Canal_Saint-Martin_P1060441.JPG/3840px-Canal_Saint-Martin_P1060441.JPG', alt: { en: 'Fric-Frac', 'pt-BR': 'Fric-Frac' } },
        ],
      },
      {
        id: 'par-montmartre',
        name: { en: 'Montmartre', 'pt-BR': 'Montmartre' },
        category: 'parks',
        description: {
          en: 'Hill village vibe. Wander before the Sacré-Cœur crowds peak.',
          'pt-BR': 'Clima de vilarejo na colina. Vagueie antes do pico no Sacré-Cœur.',
        },
        rating: 5,
        googleRating: 4.7,
        favorite: true,
        // Place du Tertre — inside the Montmartre OSM polygon, ~170 m from Sacré-Cœur
        // so the two dots do not stack / fight for clicks.
        lat: 48.8864,
        lng: 2.3408,
        address: 'Place du Tertre, 75018 Paris',
        mapsQuery: 'Place du Tertre Montmartre Paris',
      },
      {
        id: 'par-sacre-coeur',
        name: { en: 'Sacré-Cœur', 'pt-BR': 'Sacré-Cœur' },
        category: 'tourist',
        landmark: 'sacre-coeur',
        description: {
          en: 'White dome over the city. Steps are half the point.',
          'pt-BR': 'Cúpula branca sobre a cidade. As escadas são metade da graça.',
        },
        rating: 5,
        googleRating: 4.7,
        favorite: true,
        lat: 48.8867,
        lng: 2.3431,
        address: '35 Rue du Chevalier de la Barre, 75018 Paris',
        mapsQuery: 'Basilique du Sacré-Cœur de Montmartre',
      },
      {
        id: 'par-moulin-rouge',
        name: { en: 'Moulin Rouge', 'pt-BR': 'Moulin Rouge' },
        category: 'tourist',
        description: {
          en: 'Pigalle icon. Worth the photo even if you skip the show.',
          'pt-BR': 'Ícone de Pigalle. Vale a foto mesmo sem o show.',
        },
        rating: 3.5,
        googleRating: 4.4,
        lat: 48.8841,
        lng: 2.3322,
        address: '82 Bd de Clichy, 75018 Paris',
        mapsQuery: 'Moulin Rouge Paris',
      },
      {
        id: 'par-arnaud-nicolas',
        name: { en: 'Charcuterie Arnaud Nicolas', 'pt-BR': 'Charcuterie Arnaud Nicolas' },
        category: 'restaurants',
        description: {
          en: 'Serious charcuterie near Lévis. Perfect for a picnic haul.',
          'pt-BR': 'Charcutaria séria perto de Lévis. Perfeita para montar piquenique.',
        },
        googleRating: 4.2,
        lat: 48.8818624,
        lng: 2.3161397,
        address: '46 Rue de Lévis, 75017 Paris',
        mapsQuery: 'Charcuterie Arnaud Nicolas Lévis Paris',
        mapsUrl: 'https://www.google.com/maps/place/Charcuterie+Arnaud+Nicolas+L%C3%A9vis/@48.8757052,2.3221345,13.75z',
      },
      {
        id: 'par-bateaux-mouches',
        name: { en: 'Bateaux-Mouches', 'pt-BR': 'Bateaux-Mouches' },
        category: 'tourist',
        description: {
          en: 'Seine cruise classic from the Alma side.',
          'pt-BR': 'Clássico de cruzeiro no Sena do lado de Alma.',
        },
        rating: 5,
        favorite: true,
        googleRating: 4.3,
        lat: 48.8640106,
        lng: 2.3059374,
        address: 'Port de la Conférence, 75008 Paris',
        mapsQuery: 'Bateaux-Mouches Paris',
        mapsUrl: 'https://www.google.fr/maps/place/Bateau-mouche/@48.8629662,2.306493,16.25z',
      },
      {
        id: 'par-michalak',
        name: { en: 'Pâtisserie Michalak', 'pt-BR': 'Pâtisserie Michalak' },
        category: 'cafes',
        description: {
          en: 'Christophe Michalak pastries in Neuilly.',
          'pt-BR': 'Doces do Christophe Michalak em Neuilly.',
        },
        googleRating: 4.1,
        lat: 48.8805647,
        lng: 2.268,
        address: '16 Avenue de la Motte-Picquet, 75007 Paris',
        mapsQuery: 'Pâtisserie Michalak Neuilly',
        mapsUrl: 'https://maps.app.goo.gl/xTaw91nG8tXmDimq8',
      },
      {
        id: 'par-bien-eleve',
        name: { en: 'Bien Élevé', 'pt-BR': 'Bien Élevé' },
        category: 'restaurants',
        description: {
          en: 'Butcher-table dining. Order meat-forward and share.',
          'pt-BR': 'Mesa de açougueiro. Peça carne e divida.',
        },
        googleRating: 4.6,
        lat: 48.8645,
        lng: 2.365,
        address: '47 Rue Richer, 75009 Paris',
        mapsQuery: 'Bien Élevé Paris',
      },
      {
        id: 'par-palais-royal',
        name: { en: 'Palais-Royal', 'pt-BR': 'Palais-Royal' },
        category: 'parks',
        description: {
          en: 'Colonades, garden, and the striped columns courtyard.',
          'pt-BR': 'Colunatas, jardim e o pátio das colunas listradas.',
        },
        rating: 5,
        favorite: true,
        googleRating: 4.6,
        lat: 48.8638,
        lng: 2.3371,
        address: '8 Rue de Montpensier, 75001 Paris',
        mapsQuery: 'Palais-Royal Paris',
      },
      {
        id: 'par-bohemia',
        name: {
          en: "Baguett's Café Molière",
          'pt-BR': "Baguett's Café Molière",
        },
        category: 'cafes',
        description: {
          en: 'Club sandwich and Club Loco de Blueberries.',
          'pt-BR': 'Club sandwich e Club Loco de Blueberries.',
        },
        rating: 5,
        googleRating: 4.7,
        favorite: true,
        lat: 48.8655,
        lng: 2.335,
        address: '30 Rue de Richelieu, 75001 Paris',
        mapsQuery: "Baguett's Café Molière Paris",
      },
      {
        id: 'par-bnf',
        name: { en: 'Bibliothèque nationale', 'pt-BR': 'Biblioteca Nacional' },
        category: 'parks',
        description: {
          en: 'Richelieu or François-Mitterrand depending on the day.',
          'pt-BR': 'Richelieu ou François-Mitterrand, conforme o dia.',
        },
        googleRating: 4.7,
        lat: 48.8338,
        lng: 2.376,
        address: 'Quai François Mauriac, 75013 Paris',
        mapsQuery: 'Bibliothèque nationale de France',
      },
      {
        id: 'par-chatelet',
        name: { en: 'Place du Châtelet', 'pt-BR': 'Place du Châtelet' },
        category: 'photo',
        description: {
          en: 'Central square and metro maze. Fountains, theaters, pure Paris chaos.',
          'pt-BR': 'Praça central e labirinto de metrô. Fontes, teatros, caos parisiense puro.',
        },
        rating: 4,
        googleRating: 4.2,
        lat: 48.8575,
        lng: 2.3472,
        address: 'Place du Châtelet, 75001 Paris',
        mapsQuery: 'Place du Châtelet Paris',
        mapsUrl: 'https://maps.app.goo.gl/5tQAPLnfS4xLxkYV6',
      },
      {
        id: 'par-saint-eustache',
        name: { en: 'Saint-Eustache', 'pt-BR': 'Saint-Eustache' },
        category: 'tourist',
        description: {
          en: 'Gothic giant by Les Halles. Free interior, huge organ, market-edge calm.',
          'pt-BR': 'Gigante gótico ao lado de Les Halles. Interior grátis, órgão enorme, calma na beira do mercado.',
        },
        googleRating: 4.7,
        lat: 48.8634,
        lng: 2.3451,
        address: '2 Imp. Saint-Eustache, 75001 Paris',
        mapsQuery: 'Église Saint-Eustache Paris',
      },
      {
        id: 'par-montorgueil',
        name: { en: 'Montorgueil', 'pt-BR': 'Montorgueil' },
        category: 'parks',
        description: {
          en: 'Pedestrian food street — bakeries, oysters, wine bars.',
          'pt-BR': 'Rua peatonizada de comida — padarias, ostras, wine bars.',
        },
        googleRating: 4.5,
        // Midpoint of full Rue Montorgueil polyline (OSM multi-way merge)
        lat: 48.864494,
        lng: 2.346697,
        address: 'Rue Montorgueil, 75001 Paris',
        mapsQuery: 'Rue Montorgueil Paris',
      },
      {
        id: 'par-michalak-etienne',
        name: {
          en: 'Pâtisserie Michalak | Etienne Marcel',
          'pt-BR': 'Pâtisserie Michalak | Etienne Marcel',
        },
        category: 'cafes',
        description: {
          en: 'Christophe Michalak counter on Rue Étienne Marcel — pastries near Les Halles / Montorgueil.',
          'pt-BR':
            'Balcão do Christophe Michalak na Rue Étienne Marcel — doces perto de Les Halles / Montorgueil.',
        },
        googleRating: 4.5,
        lat: 48.8644817,
        lng: 2.3460786,
        address: '37 Rue Étienne Marcel, 75002 Paris',
        mapsQuery: 'Pâtisserie Michalak Etienne Marcel Paris',
        mapsUrl: 'https://maps.app.goo.gl/hsYjfSBmJESa8o8S9',
      },
      {
        id: 'par-artizans',
        name: { en: 'Bistro les Artizans', 'pt-BR': 'Bistro les Artizans' },
        category: 'restaurants',
        description: {
          en: 'Bistro on Rue Montorgueil — solid French plates on the food street.',
          'pt-BR': 'Bistrô na Rue Montorgueil — pratos franceses sólidos na rua gastronômica.',
        },
        googleRating: 4.5,
        lat: 48.8637686,
        lng: 2.3465503,
        address: '30 Rue Montorgueil, 75001 Paris',
        mapsQuery: 'Bistro les Artizans Paris',
        mapsUrl: 'https://maps.app.goo.gl/dc8VjE69wviBaiJv6',
      },
      {
        id: 'par-pompidou',
        name: { en: 'Centre Pompidou', 'pt-BR': 'Centre Pompidou' },
        category: 'tourist',
        landmark: 'pompidou',
        description: {
          en: 'Inside-out museum. Plaza energy even from outside.',
          'pt-BR': 'Museu do avesso. Energia da praça mesmo por fora.',
        },
        rating: 4,
        googleRating: 4.4,
        lat: 48.8606,
        lng: 2.3522,
        address: 'Pl. Georges-Pompidou, 75004 Paris',
        mapsQuery: 'Centre Pompidou Paris',
      },
      {
        id: 'par-amorino',
        name: { en: 'Amorino', 'pt-BR': 'Amorino' },
        category: 'cafes',
        description: {
          en: 'Flower-shaped gelato. Easy win near the river islands.',
          'pt-BR': 'Gelato em forma de flor. Vitória fácil perto das ilhas.',
        },
        rating: 3.5,
        googleRating: 4.6,
        lat: 48.8607322,
        lng: 2.3510395,
        address: "47 Rue Saint-Louis en l'Île, 75004 Paris",
        mapsQuery: 'Amorino Paris Île',
        mapsUrl: 'https://maps.app.goo.gl/Lxk8rWHcsR3QveJW9',
      },
      {
        id: 'par-madeleine',
        name: { en: 'Église de la Madeleine', 'pt-BR': 'Église de la Madeleine' },
        category: 'tourist',
        description: {
          en: 'Temple-like church and the surrounding food streets.',
          'pt-BR': 'Igreja em forma de templo e as ruas de comida ao redor.',
        },
        googleRating: 4.7,
        lat: 48.87,
        lng: 2.3244,
        address: 'Pl. de la Madeleine, 75008 Paris',
        mapsQuery: 'Église de la Madeleine Paris',
        mapsUrl: 'https://www.foyerdelamadeleine.fr/restaurant',
      },
      {
        id: 'par-jeffrey-cagnes',
        name: { en: 'Jeffrey Cagnes', 'pt-BR': 'Jeffrey Cagnes' },
        category: 'cafes',
        description: {
          en: 'Pastry counter in the 1st. Sweet break between sights.',
          'pt-BR': 'Balcão de confeitaria no 1º. Pausa doce entre atrações.',
        },
        googleRating: 4.5,
        lat: 48.8697133,
        lng: 2.327773,
        address: '1 Boulevard de la Madeleine, 75009 Paris',
        mapsQuery: 'Jeffrey Cagnes Paris 1er',
        mapsUrl: 'https://maps.app.goo.gl/7ftDEDXvdHtxPYndA',
      },
      {
        id: 'par-metro-6',
        name: { en: 'Metro Line 6', 'pt-BR': 'Linha 6 do metrô' },
        category: 'photo',
        description: {
          en: 'Elevated stretches with Tower views. Ride it on purpose — hover to see the full line and stations.',
          'pt-BR': 'Trechos elevados com vista da Torre. Pegue de propósito — no hover você vê a linha inteira e as estações.',
        },
        // Anchor at Bir-Hakeim (best Tower view from the elevated viaduct)
        lat: 48.8539,
        lng: 2.2893,
        area: {
          kind: 'polyline',
          // Full line 6 path via station coordinates (Charles de Gaulle–Étoile → Nation)
          path: [
            [48.8738, 2.295], // Charles de Gaulle–Étoile
            [48.8712, 2.2928], // Kléber
            [48.8674, 2.29], // Boissière
            [48.863, 2.2875], // Trocadéro
            [48.8575, 2.2858], // Passy
            [48.8539, 2.2893], // Bir-Hakeim
            [48.8505, 2.2935], // Dupleix
            [48.8492, 2.2985], // La Motte-Picquet–Grenelle
            [48.8475, 2.3025], // Cambronne
            [48.8455, 2.31], // Sèvres–Lecourbe
            [48.8428, 2.3125], // Pasteur
            [48.8422, 2.3219], // Montparnasse–Bienvenüe
            [48.841, 2.325], // Edgar Quinet
            [48.8405, 2.3305], // Raspail
            [48.8339, 2.3325], // Denfert-Rochereau
            [48.833, 2.337], // Saint-Jacques
            [48.831, 2.3435], // Glacière
            [48.8298, 2.3505], // Corvisart
            [48.8312, 2.3558], // Place d'Italie
            [48.833, 2.3625], // Nationale
            [48.835, 2.369], // Chevaleret
            [48.837, 2.3735], // Quai de la Gare
            [48.84, 2.3795], // Bercy
            [48.839, 2.386], // Dugommier
            [48.8395, 2.3955], // Daumesnil
            [48.8415, 2.406], // Bel-Air
            [48.845, 2.401], // Picpus
            [48.8482, 2.3958], // Nation
          ],
        },
        routeStops: [
          { name: { en: 'Charles de Gaulle–Étoile', 'pt-BR': 'Charles de Gaulle–Étoile' }, lat: 48.8738, lng: 2.295 },
          { name: { en: 'Kléber', 'pt-BR': 'Kléber' }, lat: 48.8712, lng: 2.2928 },
          { name: { en: 'Boissière', 'pt-BR': 'Boissière' }, lat: 48.8674, lng: 2.29 },
          { name: { en: 'Trocadéro', 'pt-BR': 'Trocadéro' }, lat: 48.863, lng: 2.2875 },
          { name: { en: 'Passy', 'pt-BR': 'Passy' }, lat: 48.8575, lng: 2.2858 },
          { name: { en: 'Bir-Hakeim', 'pt-BR': 'Bir-Hakeim' }, lat: 48.8539, lng: 2.2893 },
          { name: { en: 'Dupleix', 'pt-BR': 'Dupleix' }, lat: 48.8505, lng: 2.2935 },
          { name: { en: 'La Motte-Picquet–Grenelle', 'pt-BR': 'La Motte-Picquet–Grenelle' }, lat: 48.8492, lng: 2.2985 },
          { name: { en: 'Cambronne', 'pt-BR': 'Cambronne' }, lat: 48.8475, lng: 2.3025 },
          { name: { en: 'Sèvres–Lecourbe', 'pt-BR': 'Sèvres–Lecourbe' }, lat: 48.8455, lng: 2.31 },
          { name: { en: 'Pasteur', 'pt-BR': 'Pasteur' }, lat: 48.8428, lng: 2.3125 },
          { name: { en: 'Montparnasse–Bienvenüe', 'pt-BR': 'Montparnasse–Bienvenüe' }, lat: 48.8422, lng: 2.3219 },
          { name: { en: 'Edgar Quinet', 'pt-BR': 'Edgar Quinet' }, lat: 48.841, lng: 2.325 },
          { name: { en: 'Raspail', 'pt-BR': 'Raspail' }, lat: 48.8405, lng: 2.3305 },
          { name: { en: 'Denfert-Rochereau', 'pt-BR': 'Denfert-Rochereau' }, lat: 48.8339, lng: 2.3325 },
          { name: { en: 'Saint-Jacques', 'pt-BR': 'Saint-Jacques' }, lat: 48.833, lng: 2.337 },
          { name: { en: 'Glacière', 'pt-BR': 'Glacière' }, lat: 48.831, lng: 2.3435 },
          { name: { en: 'Corvisart', 'pt-BR': 'Corvisart' }, lat: 48.8298, lng: 2.3505 },
          { name: { en: "Place d'Italie", 'pt-BR': "Place d'Italie" }, lat: 48.8312, lng: 2.3558 },
          { name: { en: 'Nationale', 'pt-BR': 'Nationale' }, lat: 48.833, lng: 2.3625 },
          { name: { en: 'Chevaleret', 'pt-BR': 'Chevaleret' }, lat: 48.835, lng: 2.369 },
          { name: { en: 'Quai de la Gare', 'pt-BR': 'Quai de la Gare' }, lat: 48.837, lng: 2.3735 },
          { name: { en: 'Bercy', 'pt-BR': 'Bercy' }, lat: 48.84, lng: 2.3795 },
          { name: { en: 'Dugommier', 'pt-BR': 'Dugommier' }, lat: 48.839, lng: 2.386 },
          { name: { en: 'Daumesnil', 'pt-BR': 'Daumesnil' }, lat: 48.8395, lng: 2.3955 },
          { name: { en: 'Bel-Air', 'pt-BR': 'Bel-Air' }, lat: 48.8415, lng: 2.406 },
          { name: { en: 'Picpus', 'pt-BR': 'Picpus' }, lat: 48.845, lng: 2.401 },
          { name: { en: 'Nation', 'pt-BR': 'Nation' }, lat: 48.8482, lng: 2.3958 },
        ],
        address: 'Métro ligne 6, Paris',
        mapsQuery: 'Métro ligne 6 Paris',
      },
      {
        id: 'par-bakery-gaite',
        name: { en: 'Paris Bakery & Co (flan pickup)', 'pt-BR': 'Paris Bakery & Co (retirada do flan)' },
        category: 'cafes',
        description: {
          en: 'Famous flan — buy online ahead of time. Two shops (Gaîté 14e + Convention 15e); pickup is usually at Convention, not the Gaîté pin people often share. Very worth it.',
          'pt-BR': 'Flan famoso — compre no site com antecedência. Tem dois pontos (Gaîté 14e + Convention 15e); a retirada costuma ser na Convention, não no pino da Gaîté que o mapa costuma mostrar. Vale muito a pena.',
        },
        googleRating: 4.5,
        // Pin on Convention pickup (4 Rue de la Convention, 15e) — not Gaîté shopfront
        lat: 48.84715,
        lng: 2.28895,
        address: '4 Rue de la Convention, 75015 Paris',
        mapsQuery: 'Paris Bakery and Co Convention Paris',
        mapsUrl: 'https://maps.app.goo.gl/D6J9toZBdG54v6bF8',
      },
      {
        id: 'par-montparnasse',
        name: { en: 'Tour Montparnasse', 'pt-BR': 'Tour Montparnasse' },
        category: 'tourist',
        landmark: 'montparnasse',
        description: {
          en: 'Best Tower view is from here. Timing matters.',
          'pt-BR': 'A melhor vista da Torre é daqui. Timing importa.',
        },
        googleRating: 4.5,
        lat: 48.8421,
        lng: 2.3219,
        address: '33 Av. du Maine, 75015 Paris',
        mapsQuery: 'Tour Montparnasse observation deck',
      },
      {
        id: 'par-entrecote',
        name: { en: 'Le Relais de l\'Entrecôte', 'pt-BR': 'Le Relais de l\'Entrecôte' },
        category: 'restaurants',
        description: {
          en: 'Steak-frites only — generous portions, great value. No menu stress.',
          'pt-BR': 'Opção de fritas com steak de carne — come-se bastante, ótimo custo/benefício.',
        },
        rating: 4.5,
        googleRating: 4.2,
        favorite: true,
        lat: 48.868142,
        lng: 2.3027971,
        address: '15 Rue Marbeuf, 75008 Paris',
        mapsQuery: 'Le Relais de l\'Entrecôte Paris',
        mapsUrl: 'https://maps.app.goo.gl/tU5yiW73wogbF68A9',
      },
      {
        id: 'par-monceau',
        name: { en: 'Parc Monceau', 'pt-BR': 'Parc Monceau' },
        category: 'parks',
        description: {
          en: 'Beautiful 8th-arrondissement park. Elegant green with follies and soft Paris atmosphere.',
          'pt-BR': 'Parque bonito no 8ème. Verde elegante, fabriques e clima parisiense suave.',
        },
        googleRating: 4.6,
        lat: 48.8797,
        lng: 2.309,
        address: '35 Bd de Courcelles, 75008 Paris',
        mapsQuery: 'Parc Monceau Paris',
      },
      {
        id: 'par-andre-citroen',
        name: { en: 'Parc André Citroën', 'pt-BR': 'Parc André Citroën' },
        category: 'parks',
        description: {
          en: 'Modern-architecture park — interesting on its own, but not classic Paris vibes. Balloon ride on site makes the detour more worth it.',
          'pt-BR': 'Parque de arquitetura moderna — bem interessante, mas foge um pouco da pegada Paris. Tem passeio de balão; vale mais a pena se for fazer isso.',
        },
        googleRating: 4.4,
        lat: 48.84119,
        lng: 2.27454,
        address: '2 Rue Cauchy, 75015 Paris',
        mapsQuery: 'Parc André Citroën Paris',
      },
      {
        id: 'par-clichy-batignolles',
        name: {
          en: 'Parc Clichy-Batignolles',
          'pt-BR': 'Parc Clichy-Batignolles',
        },
        category: 'parks',
        description: {
          en: 'Modern green space in the 17th (Martin Luther King) — lakes, lawns, and a calmer contemporary Paris park feel. Nice if you want something less touristy.',
          'pt-BR': 'Parque moderno no 17ème (Martin Luther King) — lagos, gramados e clima mais contemporâneo. Gostoso se quiser algo menos turístico.',
        },
        googleRating: 4.5,
        lat: 48.8911,
        lng: 2.3142,
        address: '147 Rue Cardinet, 75017 Paris',
        mapsQuery: 'Parc Clichy-Batignolles Martin Luther King Paris',
      },
      {
        id: 'par-buttes-chaumont',
        name: { en: 'Parc des Buttes-Chaumont', 'pt-BR': 'Parc des Buttes-Chaumont' },
        category: 'parks',
        description: {
          en: 'Beautiful dramatic park in the 19th. Cliffs, lake, temple belvedere — not the flat Paris green.',
          'pt-BR': 'Parque bonito e dramático no 19ème. Penhascos, lago, templo no mirante — nada de gramado plano.',
        },
        googleRating: 4.6,
        lat: 48.87956,
        lng: 2.3821,
        address: '1 Rue Botzaris, 75019 Paris',
        mapsQuery: 'Parc des Buttes-Chaumont Paris',
      },
      {
        id: 'par-boulogne',
        name: { en: 'Bois de Boulogne', 'pt-BR': 'Bois de Boulogne' },
        category: 'parks',
        description: {
          en: 'Huge beautiful “forest” of Paris in the 16th. Lakes, long walks, and excellent cafés and restaurants inside.',
          'pt-BR': 'Parque bonito e gigante — a “floresta” de Paris no 16ème. Lagos, caminhadas longas e ótimos restaurantes e cafés dentro.',
        },
        googleRating: 4.3,
        lat: 48.86409,
        lng: 2.24826,
        address: 'Bois de Boulogne, 75016 Paris',
        mapsQuery: 'Bois de Boulogne Paris',
      },
      {
        id: 'par-fondation-lv',
        name: { en: 'Fondation Louis Vuitton', 'pt-BR': 'Fondation Louis Vuitton' },
        category: 'photo',
        description: {
          en: 'Frank Gehry sails in the Bois de Boulogne — go for the building photos more than the blockbuster museum queue.',
          'pt-BR': 'Velas do Gehry no Bois de Boulogne — vale mais pela foto do prédio do que pela fila de museu.',
        },
        googleRating: 4.5,
        lat: 48.87665,
        lng: 2.26334,
        address: '8 Av. du Mahatma Gandhi, 75116 Paris',
        mapsQuery: 'Fondation Louis Vuitton Paris',
      },
      {
        id: 'par-serres-auteuil',
        name: {
          en: "Jardin des Serres d'Auteuil",
          'pt-BR': "Jardin des Serres d'Auteuil",
        },
        category: 'parks',
        description: {
          en: 'Large historic greenhouse garden on the edge of the Bois de Boulogne. Old glass, plants, and beauty.',
          'pt-BR': 'Estufa grande e antiga na beira do Bois de Boulogne. Vidro antigo, plantas e bem bonita.',
        },
        googleRating: 4.6,
        lat: 48.8467,
        lng: 2.2526,
        address: "3 Av. de la Porte d'Auteuil, 75016 Paris",
        mapsQuery: "Jardin des Serres d'Auteuil Paris",
      },
      {
        id: 'par-bastille',
        name: { en: 'Place de la Bastille', 'pt-BR': 'Place de la Bastille' },
        category: 'parks',
        description: {
          en: 'Column and crossroads. Night energy nearby.',
          'pt-BR': 'Coluna e cruzamento. Energia noturna por perto.',
        },
        googleRating: 4.3,
        lat: 48.8532,
        lng: 2.3691,
        address: 'Pl. de la Bastille, 75011 Paris',
        mapsQuery: 'Place de la Bastille Paris',
      },
      {
        id: 'par-vosges',
        name: { en: 'Place des Vosges', 'pt-BR': 'Place des Vosges' },
        category: 'parks',
        description: {
          en: 'Perfect arcades and the softest Marais square.',
          'pt-BR': 'Arcadas perfeitas e a praça mais suave do Marais.',
        },
        googleRating: 4.6,
        lat: 48.8556,
        lng: 2.3655,
        address: 'Place des Vosges, 75004 Paris',
        mapsQuery: 'Place des Vosges Paris',
      },
      {
        id: 'par-chez-janou',
        name: { en: 'Chez Janou', 'pt-BR': 'Chez Janou' },
        category: 'restaurants',
        description: {
          en: 'Provençal vibes and chocolate mousse legend.',
          'pt-BR': 'Clima provençal e a lenda da mousse de chocolate.',
        },
        googleRating: 4.3,
        lat: 48.856,
        lng: 2.3658,
        address: '2 Rue Roger Verlomme, 75003 Paris',
        mapsQuery: 'Chez Janou Paris',
        mapsUrl: 'https://maps.app.goo.gl/Zqpj2W2iLWngwcFC7',
      },
      {
        id: 'par-chez-elo',
        name: { en: 'Chez Elo', 'pt-BR': 'Chez Elo' },
        category: 'restaurants',
        description: {
          en: 'Neighborhood table. Keep it simple and local.',
          'pt-BR': 'Mesa de bairro. Simples e local.',
        },
        googleRating: 4.8,
        lat: 48.865,
        lng: 2.355,
        address: '61 Rue de Bretagne, 75003 Paris',
        mapsQuery: 'Chez Elo Paris',
      },
      {
        id: 'par-vincennes-town',
        name: { en: 'Vincennes', 'pt-BR': 'Vincennes' },
        category: 'parks',
        description: {
          en: 'Pretty little town on the edge of Paris — small, walkable, local shops and cafés. Pair with the Bois park and the medieval castle (we have never gone inside either, honestly). If you go, bring the family.',
          'pt-BR': 'Cidadezinha super bonitinha na beira de Paris — pequena, com calçadão e clima local. Tem o parque (dizem que é gostoso) e o castelo medieval (nunca entramos). Se forem, quero ir junto.',
        },
        googleRating: 4.5,
        lat: 48.84745,
        lng: 2.43967,
        address: 'Place du Général-Leclerc, 94300 Vincennes',
        mapsQuery: 'Vincennes centre-ville',
      },
      {
        id: 'par-chateau-vincennes',
        name: { en: 'Château de Vincennes', 'pt-BR': 'Castelo de Vincennes' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Medieval castle next to the Bois — keep and walls on the east side. Still on the “never been inside” list for us.',
          'pt-BR': 'Castelo medieval ao lado do bosque — torre e muralhas no leste de Paris. Ainda na lista do “nunca entramos”.',
        },
        googleRating: 4.5,
        lat: 48.84291,
        lng: 2.43581,
        address: 'Avenue de Paris, 94300 Vincennes',
        mapsQuery: 'Château de Vincennes',
      },
      {
        id: 'par-vincennes',
        name: { en: 'Bois de Vincennes', 'pt-BR': 'Bois de Vincennes' },
        category: 'parks',
        description: {
          en: 'Huge east-side park next to Vincennes town — lakes and long walks. People say it is lovely; good half-day with the town + castle.',
          'pt-BR': 'Parque grande a leste, ao lado da cidade de Vincennes — lagos e caminhadas. Dizem que é gostoso; bom meio dia com o centro e o castelo.',
        },
        googleRating: 4.5,
        lat: 48.828,
        lng: 2.433,
        address: 'Bois de Vincennes, Paris',
        mapsQuery: 'Bois de Vincennes Paris',
      },
      {
        id: 'par-canals',
        name: {
          en: 'Paris canals walk',
          'pt-BR': 'Canais de Paris',
        },
        category: 'parks',
        description: {
          en: 'Walk from Place de la République along the canals to Bassin de la Villette — a very Parisian outing. Stop by the water to eat (Jardin Villemin is a great spot). At the Bassin: bars and restaurants, including Paname Brewing Company. A bit further: Parc de la Villette. On the way back, Metro Line 2 has elevated panoramic views over the city.',
          'pt-BR': 'Andar da Place de la République pelos canais até o Bassin de la Villette — atividade bem gostosa e parisiense. Pare na beira para comer (em frente ao Jardin Villemin é um bom spot). No Bassin: vários bares e restaurantes; Paname Brewing Company tem cerveja própria. Um pouco mais: La Villette. Na volta, a linha 2 do metrô tem vista panorâmica — anda sobre a cidade.',
        },
        googleRating: 4.4,
        // Pin on canal waterline by Jardin Villemin (not garden centroid)
        lat: 48.87489,
        lng: 2.36335,
        area: {
          kind: 'polyline',
          /**
           * Walk spine: République → Canal Saint-Martin (OSM waterway) →
           * Bassin de la Villette → Parc de la Villette.
           * Canal segment decimated from Nominatim/OSM MultiLineString
           * (not a freehand chord through the garden).
           */
          path: [
            [48.86754, 2.36396], // Place de la République
            [48.868956, 2.367169], // Join Canal Saint-Martin (Quai de Valmy)
            [48.873018, 2.363995], // Locks / mid canal
            [48.873902, 2.363316],
            [48.874893, 2.363353], // Canal opposite Jardin Villemin
            [48.877483, 2.365585],
            [48.87834, 2.366324],
            [48.879692, 2.367485],
            [48.882273, 2.369705], // Toward Stalingrad / Jaurès
            [48.883074, 2.370404],
            [48.884489, 2.371615], // Bassin de la Villette (SW entry)
            [48.88644, 2.37553], // Bassin centerline
            [48.888392, 2.379452], // Bassin NE / Paname side
            [48.891441, 2.385573], // Toward Ourcq / Villette
            [48.89194, 2.386225],
            [48.89489, 2.38844], // Parc de la Villette
          ],
        },
        routeStops: [
          {
            name: {
              en: 'Place de la République',
              'pt-BR': 'Place de la République',
            },
            lat: 48.86754,
            lng: 2.36396,
          },
          {
            // Marker on the canal edge by the park (path passes here)
            name: { en: 'Jardin Villemin', 'pt-BR': 'Jardin Villemin' },
            lat: 48.87489,
            lng: 2.36335,
          },
          {
            name: {
              en: 'Bassin de la Villette',
              'pt-BR': 'Bassin de la Villette',
            },
            lat: 48.88644,
            lng: 2.37553,
          },
          {
            name: {
              en: 'Parc de la Villette',
              'pt-BR': 'Parc de la Villette',
            },
            lat: 48.89489,
            lng: 2.38844,
          },
        ],
        address: 'Canal Saint-Martin → Bassin de la Villette, Paris',
        mapsQuery: 'Canal Saint-Martin Paris',
      },
      {
        id: 'par-paname-brewing',
        name: { en: 'Paname Brewing Company', 'pt-BR': 'Paname Brewing Company' },
        category: 'restaurants',
        description: {
          en: 'Brewpub on the Bassin de la Villette. Their own beer, waterfront terrace — great stop on the canal walk.',
          'pt-BR': 'Bar com cerveja própria no Bassin de la Villette. Terraço na água — ótima parada no passeio pelos canais.',
        },
        googleRating: 4.3,
        lat: 48.88783,
        lng: 2.37876,
        address: '41 bis Quai de la Loire, 75019 Paris',
        mapsQuery: 'Paname Brewing Company Paris',
      },
      {
        id: 'par-la-villette',
        name: { en: 'Parc de la Villette', 'pt-BR': 'Parc de la Villette' },
        category: 'parks',
        description: {
          en: 'Large park at the end of the canal walk. Museums, theatre, Philharmonie, and open space to wander.',
          'pt-BR': 'Parque grande no fim do passeio dos canais. Museus, teatro, philharmonie e espaço aberto para explorar.',
        },
        googleRating: 4.4,
        lat: 48.89489,
        lng: 2.38844,
        address: '211 Av. Jean Jaurès, 75019 Paris',
        mapsQuery: 'Parc de la Villette Paris',
      },
      {
        id: 'par-metro-2',
        name: { en: 'Metro Line 2', 'pt-BR': 'Linha 2 do metrô' },
        category: 'photo',
        description: {
          en: 'Elevated stretches with panoramic city views — great return after the canals / La Villette. Ride it on purpose.',
          'pt-BR': 'Trechos elevados com vista panorâmica da cidade — ótimo na volta dos canais / La Villette. Pegue de propósito.',
        },
        // Anchor at elevated Pigalle (on the authored station spine)
        lat: 48.8828,
        lng: 2.3499,
        area: {
          kind: 'polyline',
          // Full line 2 via main stations (Porte Dauphine → Nation)
          path: [
            [48.8715, 2.276], // Porte Dauphine
            [48.8708, 2.2855], // Victor Hugo
            [48.8738, 2.295], // Charles de Gaulle–Étoile
            [48.8755, 2.305], // Ternes
            [48.878, 2.314], // Courcelles
            [48.8805, 2.322], // Monceau
            [48.882, 2.3275], // Villiers
            [48.8835, 2.333], // Rome
            [48.8838, 2.338], // Place de Clichy
            [48.8835, 2.3435], // Blanche
            [48.8828, 2.3499], // Pigalle
            [48.8825, 2.3545], // Anvers
            [48.8837, 2.3605], // Barbès–Rochechouart (elevated)
            [48.8842, 2.3655], // La Chapelle
            [48.8828, 2.3705], // Jaurès / Stalingrad
            [48.8785, 2.381], // Colonel Fabien
            [48.8755, 2.389], // Belleville
            [48.872, 2.397], // Couronnes
            [48.8695, 2.4015], // Ménilmontant
            [48.8655, 2.405], // Père Lachaise
            [48.8615, 2.401], // Philippe Auguste
            [48.8565, 2.398], // Alexandre Dumas
            [48.8525, 2.3985], // Avron
            [48.8482, 2.3958], // Nation
          ],
        },
        routeStops: [
          {
            name: { en: 'Porte Dauphine', 'pt-BR': 'Porte Dauphine' },
            lat: 48.8715,
            lng: 2.276,
          },
          {
            name: {
              en: 'Charles de Gaulle–Étoile',
              'pt-BR': 'Charles de Gaulle–Étoile',
            },
            lat: 48.8738,
            lng: 2.295,
          },
          {
            name: { en: 'Pigalle', 'pt-BR': 'Pigalle' },
            lat: 48.8828,
            lng: 2.3499,
          },
          {
            name: { en: 'Anvers', 'pt-BR': 'Anvers' },
            lat: 48.8825,
            lng: 2.3545,
          },
          {
            name: {
              en: 'Barbès–Rochechouart',
              'pt-BR': 'Barbès–Rochechouart',
            },
            lat: 48.8837,
            lng: 2.3605,
          },
          {
            name: { en: 'Jaurès', 'pt-BR': 'Jaurès' },
            lat: 48.8828,
            lng: 2.3705,
          },
          {
            name: { en: 'Belleville', 'pt-BR': 'Belleville' },
            lat: 48.8755,
            lng: 2.389,
          },
          {
            name: { en: 'Nation', 'pt-BR': 'Nation' },
            lat: 48.8482,
            lng: 2.3958,
          },
        ],
        address: 'Métro ligne 2, Paris',
        mapsQuery: 'Métro ligne 2 Paris',
      },
      {
        id: 'par-royal-cambronne',
        name: { en: 'Le Royal Cambronne', 'pt-BR': 'Le Royal Cambronne' },
        category: 'restaurants',
        description: {
          en: 'Nice enough to sit and have a beer on the square (Line 6 rolling by). Pleasant, nothing special.',
          'pt-BR': 'Gostoso pra sentar e tomar uma cerveja na praça (linha 6 passando). Mas não tem nada demais.',
        },
        googleRating: 3.9,
        lat: 48.84767,
        lng: 2.30097,
        address: '1 Place Cambronne, 75015 Paris',
        mapsQuery: 'Le Royal Cambronne Paris',
      },
      {
        id: 'par-bike',
        name: {
          en: 'Bike around Paris',
          'pt-BR': 'Alugar bike em Paris',
        },
        category: 'parks',
        description: {
          en: 'Rent a bike (Vélib’ or similar) and ride the city — parks, river quays, and long avenues. One of the best ways to feel Paris at street level.',
          'pt-BR': 'Alugar bike (Vélib’ ou similar) e dar uma volta por Paris — parques, margens do rio e avenidas. Uma das melhores formas de sentir a cidade na rua.',
        },
        googleRating: 4.9,
        // Station Vélib' Métropole 4017 — Place de l'Hôtel de Ville (open data)
        lat: 48.85733,
        lng: 2.35146,
        address: "Station Vélib' Place de l'Hôtel de Ville, 75004 Paris",
        mapsQuery: "Station Vélib Place de l'Hôtel de Ville Paris",
      },
      {
        id: 'par-orsay',
        name: { en: "Musée d'Orsay", 'pt-BR': "Musée d'Orsay" },
        category: 'tourist',
        description: {
          en: 'Major museum in a grand old station building — beautiful modern space inside. Across the river from the Louvre. Famous clock with views from the Louvre toward Sacré-Cœur; great photos. Paintings, sculpture, models — Monet, Van Gogh, and more. Restaurant inside.',
          'pt-BR': 'Museu grande num prédio antigo (como o Louvre), com espaço interno moderno e bonito. Do outro lado do rio, em frente ao Louvre. Famoso pelo relógio — dá para ver do Louvre até o Sacré-Cœur; ótimo para fotos. Quadros, esculturas e maquetes; Monet, Van Gogh e outros. Tem restaurante dentro.',
        },
        rating: 5,
        googleRating: 4.8,
        lat: 48.85992,
        lng: 2.32658,
        address: "1 Rue de la Légion d'Honneur, 75007 Paris",
        mapsQuery: "Musée d'Orsay Paris",
      },
      {
        id: 'par-orangerie',
        name: { en: "Musée de l'Orangerie", 'pt-BR': "Musée de l'Orangerie" },
        category: 'tourist',
        description: {
          en: 'Smaller museum inside the Tuileries. Famous for Monet’s Water Lilies — intimate and beautiful.',
          'pt-BR': 'Museu menor, dentro do Jardin des Tuileries. Famoso pelas obras do Monet (Nenúfares) — íntimo e bonito.',
        },
        googleRating: 4.6,
        lat: 48.86377,
        lng: 2.32266,
        address: 'Jardin des Tuileries, 75001 Paris',
        mapsQuery: "Musée de l'Orangerie Paris",
      },
      {
        id: 'par-luxor-obelisk',
        name: {
          en: 'Luxor Obelisk',
          'pt-BR': 'Obelisco de Luxor',
        },
        category: 'tourist',
        description: {
          en: 'Ancient Egyptian obelisk at Place de la Concorde — centerpiece of the historic axis.',
          'pt-BR': 'Obelisco egípcio antigo na Place de la Concorde — marco do eixo histórico.',
        },
        rating: 4,
        googleRating: 4.7,
        lat: 48.86548,
        lng: 2.32113,
        // OSM base outline via travel-areas-osm.ts (par-luxor-obelisk)
        address: 'Place de la Concorde, 75008 Paris',
        mapsQuery: 'Obélisque de Louxor Place de la Concorde Paris',
      },
      {
        id: 'par-bouillon',
        name: { en: 'Bouillon', 'pt-BR': 'Bouillon' },
        category: 'restaurants',
        description: {
          en: 'Classic French dining, affordable, famous, and very good. Several locations (3rd, 6th, 9th, 18th…). Book for a table inside, or takeaway in ~5 minutes — great idea: grab food and eat at a park or by the canal.',
          'pt-BR': 'Restaurante bem francês, preço acessível, famoso e gostoso. Várias unidades (3º, 6º, 9º, 18ème…). Reserve para comer dentro, ou peça para levar (~5 min). Ideia: pegar para viagem e comer em parque ou no canal.',
        },
        googleRating: 4.9,
        lat: 48.87194,
        lng: 2.34301,
        address: '7 Rue du Faubourg Montmartre, 75009 Paris',
        mapsQuery: 'Bouillon Chartier Paris',
      },
      {
        id: 'par-train-bleu',
        name: { en: 'Le Train Bleu', 'pt-BR': 'Le Train Bleu' },
        category: 'restaurants',
        description: {
          en: 'Gilded dining hall inside Gare de Lyon. Theatrical.',
          'pt-BR': 'Salão dourado dentro da Gare de Lyon. Teatral.',
        },
        googleRating: 4.4,
        lat: 48.8447,
        lng: 2.3735,
        address: 'Place Louis-Armand, 75012 Paris',
        mapsQuery: 'Le Train Bleu Gare de Lyon',
        mapsUrl: 'https://maps.app.goo.gl/uwXCi4aTvP2i5QXW6',
      },
      {
        id: 'par-marais',
        name: { en: 'Le Marais', 'pt-BR': 'Le Marais' },
        category: 'parks',
        description: {
          en: 'Cafés, vintage shops, and golden-hour streets.',
          'pt-BR': 'Cafés, brechós e ruas de luz dourada.',
        },
        lat: 48.8575,
        lng: 2.359,
        address: 'Le Marais, 75004 Paris',
        mapsQuery: 'Le Marais Paris',
      },
      {
        id: 'par-casa-do-gui',
        name: { en: 'Casa do Gui', 'pt-BR': 'Casa do Gui' },
        category: 'lodging',
        description: {
          en: 'Home base in Noisy-le-Sec — east of Paris, easy RER access into the city.',
          'pt-BR': 'Base em Noisy-le-Sec — leste de Paris, com bom acesso de RER ao centro.',
        },
        lat: 48.893017,
        lng: 2.454059,
        address: '30 Rue des Bergeries, 93130 Noisy-le-Sec',
        mapsQuery: '30 Rue des Bergeries, 93130 Noisy-le-Sec',
      },
      {
        id: 'par-auchan-noisy',
        name: {
          en: 'Auchan Supermarché (Noisy-le-Sec)',
          'pt-BR': 'Auchan Supermarché (Noisy-le-Sec)',
        },
        category: 'markets',
        description: {
          en: 'Full supermarket ~5 min walk from Casa do Gui — basics, produce, drinks, and household stock for the stay.',
          'pt-BR':
            'Supermercado completo a ~5 min a pé da Casa do Gui — básicos, hortifruti, bebidas e estoque da casa.',
        },
        googleRating: 3.8,
        lat: 48.8942003,
        lng: 2.4582537,
        address: '90 Rue Jean Jaurès, 93130 Noisy-le-Sec',
        mapsQuery: 'Auchan Supermarché 90 Rue Jean Jaurès Noisy-le-Sec',
        mapsUrl:
          'https://www.google.com/maps/search/?api=1&query=Auchan+Supermarch%C3%A9+90+Rue+Jean+Jaur%C3%A8s+Noisy-le-Sec',
      },
      {
        id: 'par-disneyland',
        name: { en: 'Disneyland Paris', 'pt-BR': 'Disneyland Paris' },
        category: 'parks',
        description: {
          en: 'Two theme parks in Marne-la-Vallée (Disneyland Park + Adventure World). RER A to Chessy (~40 min) + short walk; full day of rides and parades.',
          'pt-BR': 'Dois parques temáticos em Marne-la-Vallée (Disneyland Park + Adventure World). RER A até Chessy (~40 min) + caminhada curta; dia inteiro de brinquedos e paradas.',
        },
        googleRating: 4.5,
        // Pin inside Parc Disneyland ring (multipolygon with Adventure World)
        lat: 48.871,
        lng: 2.7765,
        address: 'Boulevard de Parc, 77700 Chessy',
        mapsQuery: 'Disneyland Paris',
      },
      {
        id: 'par-bella-notte',
        name: {
          en: 'Pizzeria Bella Notte',
          'pt-BR': 'Pizzeria Bella Notte',
        },
        category: 'restaurants',
        description: {
          en: 'Counter-service pizzeria in Disneyland Park Fantasyland — known for the Mickey-shaped individual pizza (~€11).',
          'pt-BR':
            'Pizzaria self-service no Fantasyland do Disneyland Park — famosa pela pizza individual em formato do Mickey (~€11).',
        },
        googleRating: 3.9,
        // Fantasyland, Disneyland Park (Chessy)
        lat: 48.8738,
        lng: 2.7755,
        address: 'Disneyland Park, Fantasyland, 77700 Chessy',
        mapsQuery: 'Pizzeria Bella Notte Disneyland Paris',
      },
      {
        id: 'par-mcdonalds-disney',
        name: {
          en: "McDonald's Disney Village",
          'pt-BR': "McDonald's Disney Village",
        },
        category: 'commons',
        description: {
          en: 'McDonald’s in Disney Village (outside the park gates) — easy cheap bite after rope drop or when the parks close. Five Guys and Starbucks are nearby on the Village strip.',
          'pt-BR':
            'McDonald’s na Disney Village (fora dos portões) — refeição barata e fácil depois do rope drop ou quando os parques fecham. Five Guys e Starbucks ficam na mesma faixa do Village.',
        },
        googleRating: 3.6,
        // OSM way/1466595233 — Disney Village, Chessy
        lat: 48.86813,
        lng: 2.78564,
        address: 'Disney Village, 77700 Chessy',
        mapsQuery: "McDonald's Disney Village Chessy",
      },

      // ── Chains (commons) ──
      {
        id: 'par-mcdonalds-champs',
        name: {
          en: "McDonald's Champs-Élysées",
          'pt-BR': "McDonald's Champs-Élysées",
        },
        category: 'commons',
        description: {
          en: 'The famous Champs-Élysées McDonald’s — touristy, open late, known quantity when you need something easy.',
          'pt-BR': 'O McDonald’s famoso da Champs-Élysées — turístico, abre tarde, opção fácil quando você quer algo previsível.',
        },
        googleRating: 3.7,
        lat: 48.87185,
        lng: 2.30155,
        address: '140 Av. des Champs-Élysées, 75008 Paris',
        mapsQuery: "McDonald's Champs-Élysées Paris",
      },
      {
        id: 'par-burger-king-opera',
        name: { en: 'Burger King Opéra', 'pt-BR': 'Burger King Opéra' },
        category: 'commons',
        description: {
          en: 'Central BK near Opéra — reliable chain stop between department stores and métro.',
          'pt-BR': 'BK no centro perto da Opéra — parada de rede entre grands magasins e metrô.',
        },
        googleRating: 3.5,
        lat: 48.8714,
        lng: 2.3312,
        address: '4 Bd des Capucines, 75009 Paris',
        mapsQuery: 'Burger King Opéra Paris',
      },
      {
        id: 'par-starbucks-opera',
        name: { en: 'Starbucks Opéra', 'pt-BR': 'Starbucks Opéra' },
        category: 'commons',
        description: {
          en: 'Starbucks on the Opéra corner — Wi‑Fi, AC, and a familiar order between museums.',
          'pt-BR': 'Starbucks na esquina da Opéra — Wi‑Fi, ar-condicionado e pedido familiar entre museus.',
        },
        googleRating: 3.8,
        lat: 48.8709,
        lng: 2.3321,
        address: '3 Bd des Capucines, 75002 Paris',
        mapsQuery: 'Starbucks Opéra Capucines Paris',
      },
      {
        id: 'par-five-guys-rivoli',
        name: { en: 'Five Guys Rivoli', 'pt-BR': 'Five Guys Rivoli' },
        category: 'commons',
        description: {
          en: 'US chain burgers near the Louvre corridor — messy, filling, no reservation drama.',
          'pt-BR': 'Burgers da rede americana perto do eixo do Louvre — bagunçado, enche, sem drama de reserva.',
        },
        googleRating: 4.2,
        lat: 48.8608,
        lng: 2.3365,
        address: '105 Rue de Rivoli, 75001 Paris',
        mapsQuery: 'Five Guys Rue de Rivoli Paris',
      },
      {
        id: 'par-kfc-les-halles',
        name: { en: 'KFC Les Halles', 'pt-BR': 'KFC Les Halles' },
        category: 'commons',
        description: {
          en: 'KFC in the Forum des Halles cluster — quick fried chicken when the city is loud.',
          'pt-BR': 'KFC no cluster do Forum des Halles — frango rápido quando a cidade está barulhenta.',
        },
        googleRating: 3.4,
        lat: 48.8615,
        lng: 2.3472,
        address: 'Forum des Halles, 75001 Paris',
        mapsQuery: 'KFC Forum des Halles Paris',
      },

      // ── Markets ──
      {
        id: 'par-marche-enfants-rouges',
        name: {
          en: 'Marché des Enfants Rouges',
          'pt-BR': 'Marché des Enfants Rouges',
        },
        category: 'markets',
        description: {
          en: 'Paris’s oldest covered market — solid lunch-stall option in the Marais. Pair with Chez Alain Miam Miam if you want the famous sandwich.',
          'pt-BR': 'Mercado coberto mais antigo de Paris — boa opção de feira/almoço no Marais. Combine com o Chez Alain Miam Miam se quiser o lanche famoso.',
        },
        googleRating: 4.4,
        lat: 48.86305,
        lng: 2.36185,
        address: '39 Rue de Bretagne, 75003 Paris',
        mapsQuery: 'Marché des Enfants Rouges Paris',
      },
      {
        id: 'par-alain-miam',
        name: {
          en: 'Chez Alain Miam Miam',
          'pt-BR': 'Chez Alain Miam Miam',
        },
        category: 'restaurants',
        description: {
          en: 'Famous sandwich stall at Marché des Enfants Rouges — long queues, generous fillings. Worth it if you are already at the market.',
          'pt-BR': 'Barraca famosa de lanche no Marché des Enfants Rouges — fila longa, recheio generoso. Vale se já estiver na feira.',
        },
        googleRating: 4.5,
        lat: 48.8631,
        lng: 2.3619,
        address: '39 Rue de Bretagne, 75003 Paris',
        mapsQuery: 'Chez Alain Miam Miam Paris',
      },
      {
        id: 'par-point-alph',
        name: {
          en: 'Point Alph (Versailles market)',
          'pt-BR': 'Point Alph (feira de Versalhes)',
        },
        category: 'markets',
        description: {
          en: 'Market stop in Versailles — handy if you are already at the château / Notre-Dame market area.',
          'pt-BR': 'Parada de feira em Versalhes — boa se já estiver no castelo / área do Marché Notre-Dame.',
        },
        googleRating: 4.3,
        lat: 48.80663,
        lng: 2.13201,
        address: 'Place du Marché Notre-Dame, 78000 Versailles',
        mapsQuery: 'Point Alph Marché Notre-Dame Versailles',
      },
      {
        id: 'par-marche-aligre',
        name: { en: "Marché d'Aligre", 'pt-BR': "Marché d'Aligre" },
        category: 'markets',
        description: {
          en: 'Lively outdoor + covered market — cheap produce and a very local 12e energy.',
          'pt-BR': 'Mercado de rua + coberto bem vivo — hortifruti barato e clima bem local do 12e.',
        },
        googleRating: 4.5,
        lat: 48.8492,
        lng: 2.3779,
        address: "Place d'Aligre, 75012 Paris",
        mapsQuery: "Marché d'Aligre Paris",
      },
      {
        id: 'par-marche-bastille',
        name: { en: 'Marché Bastille', 'pt-BR': 'Marché Bastille' },
        category: 'markets',
        description: {
          en: 'Big open-air market on Bd Richard-Lenoir — Thursday & Sunday mornings.',
          'pt-BR': 'Grande feira ao ar livre no Bd Richard-Lenoir — manhãs de quinta e domingo.',
        },
        googleRating: 4.5,
        lat: 48.8555,
        lng: 2.3705,
        address: 'Bd Richard-Lenoir, 75011 Paris',
        mapsQuery: 'Marché Bastille Paris',
      },
      {
        id: 'par-rue-cler',
        name: { en: 'Rue Cler market street', 'pt-BR': 'Rua Cler (mercado)' },
        category: 'markets',
        description: {
          en: 'Pedestrian food street near the Eiffel Tower — fromageries, bakers, and produce.',
          'pt-BR': 'Rua pedonal de comida perto da Torre — queijarias, padarias e hortifruti.',
        },
        googleRating: 4.5,
        lat: 48.8566,
        lng: 2.3067,
        address: 'Rue Cler, 75007 Paris',
        mapsQuery: 'Rue Cler Paris',
      },

      // ── Shopping ──
      {
        id: 'par-bon-marche',
        name: { en: 'Le Bon Marché', 'pt-BR': 'Le Bon Marché' },
        category: 'shopping',
        description: {
          en: 'Left-bank grand magasin — elegant floors and the legendary Grande Épicerie.',
          'pt-BR': 'Grand magasin da margem esquerda — andares elegantes e a lendária Grande Épicerie.',
        },
        googleRating: 4.5,
        lat: 48.8511,
        lng: 2.3244,
        address: '24 Rue de Sèvres, 75007 Paris',
        mapsQuery: 'Le Bon Marché Paris',
      },
      {
        id: 'par-forum-halles',
        name: { en: 'Forum des Halles', 'pt-BR': 'Forum des Halles' },
        category: 'shopping',
        description: {
          en: 'Central mall under the Canopée — chains, cinemas, and métro hub.',
          'pt-BR': 'Shopping central sob a Canopée — redes, cinema e hub de metrô.',
        },
        rating: 4.5,
        favorite: true,
        googleRating: 3.9,
        lat: 48.862,
        lng: 2.3465,
        address: 'Forum des Halles, 75001 Paris',
        mapsQuery: 'Forum des Halles Paris',
      },
      {
        id: 'par-bhv-marais',
        name: { en: 'BHV Marais', 'pt-BR': 'BHV Marais' },
        category: 'shopping',
        description: {
          en: 'Department store by Hôtel de Ville — DIY floors, fashion, and a solid rooftop café.',
          'pt-BR': 'Grand magasin ao lado do Hôtel de Ville — DIY, moda e terraço com café.',
        },
        googleRating: 4.2,
        lat: 48.8573,
        lng: 2.3535,
        address: '52 Rue de Rivoli, 75004 Paris',
        mapsQuery: 'BHV Marais Paris',
      },
      {
        id: 'par-shakespeare',
        name: {
          en: 'Shakespeare and Company',
          'pt-BR': 'Shakespeare and Company',
        },
        category: 'cafes',
        description: {
          en: 'Café by the Seine with the iconic English bookshop next door — coffee, queues, history, and first-edition energy.',
          'pt-BR':
            'Café à beira do Sena com a icônica livraria em inglês ao lado — café, fila, história e clima de primeira edição.',
        },
        googleRating: 4.5,
        lat: 48.8526,
        lng: 2.3471,
        address: '37 Rue de la Bûcherie, 75005 Paris',
        mapsQuery: 'Shakespeare and Company Paris',
      },

      // ── From roteiro (≤ €40 / person) not already in the list ──
      {
        id: 'par-place-dauphine',
        name: { en: 'Place Dauphine', 'pt-BR': 'Place Dauphine' },
        category: 'parks',
        description: {
          en: 'Quiet triangular square on Île de la Cité — charming, less obvious, good for a drink.',
          'pt-BR': 'Praça triangular calma na Île de la Cité — charmosa, menos óbvia, boa para um drink.',
        },
        googleRating: 4.5,
        lat: 48.8565,
        lng: 2.3423,
        address: 'Place Dauphine, 75001 Paris',
        mapsQuery: 'Place Dauphine Paris',
      },
      {
        id: 'par-cafe-flore',
        name: { en: 'Café de Flore', 'pt-BR': 'Café de Flore' },
        category: 'cafes',
        description: {
          en: 'Saint-Germain classic still loved by locals and writers — pricey but iconic.',
          'pt-BR': 'Clássico de Saint-Germain ainda frequentado por locais e escritores — caro, mas icônico.',
        },
        googleRating: 4.1,
        lat: 48.8541,
        lng: 2.3326,
        address: '172 Boulevard Saint-Germain, 75006 Paris',
        mapsQuery: 'Café de Flore Paris',
      },
      {
        id: 'par-rosa-bonheur',
        name: {
          en: 'Rosa Bonheur (Buttes-Chaumont)',
          'pt-BR': 'Rosa Bonheur (Buttes-Chaumont)',
        },
        category: 'restaurants',
        description: {
          en: 'Guinguette inside Buttes-Chaumont — very Parisian, relaxed drinks and food.',
          'pt-BR': 'Guinguette dentro do Buttes-Chaumont — bem parisiense, drinks e comida descontraídos.',
        },
        googleRating: 4.3,
        lat: 48.8797,
        lng: 2.3825,
        address: '2 Allée de la Cascade, 75019 Paris',
        mapsQuery: 'Rosa Bonheur Buttes Chaumont Paris',
      },
      {
        id: 'par-belleville',
        name: { en: 'Parc de Belleville', 'pt-BR': 'Parc de Belleville' },
        category: 'parks',
        description: {
          en: 'Panoramic city view + street art — still feels like a real neighborhood park.',
          'pt-BR': 'Vista panorâmica da cidade + street art — ainda parece parque de bairro de verdade.',
        },
        googleRating: 4.5,
        lat: 48.8715,
        lng: 2.3848,
        address: '47 Rue des Couronnes, 75020 Paris',
        mapsQuery: 'Parc de Belleville Paris',
      },
      {
        id: 'par-versailles',
        name: {
          en: 'Château de Versailles',
          'pt-BR': 'Château de Versailles',
        },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Louis XIV’s palace + gardens + Trianon — full day via RER C (Rive Gauche) + ~10 min walk. Passport ~€32–35; closed Mondays.',
          'pt-BR': 'Palácio de Luís XIV + jardins + Trianon — dia inteiro via RER C (Rive Gauche) + ~10 min a pé. Passport ~€32–35; fecha às segundas.',
        },
        rating: 5,
        favorite: true,
        googleRating: 4.6,
        lat: 48.8049,
        lng: 2.1204,
        address: "Place d'Armes, 78000 Versailles",
        mapsQuery: 'Château de Versailles',
      },
      {
        id: 'par-baron-rouge',
        name: { en: 'Le Baron Rouge', 'pt-BR': 'Le Baron Rouge' },
        category: 'restaurants',
        description: {
          en: 'Legendary wine bar by Marché d’Aligre — barrel wine + weekend oysters.',
          'pt-BR': 'Bar a vin lendário ao lado do Marché d’Aligre — vinho do barril + ostras no fim de semana.',
        },
        googleRating: 4.4,
        lat: 48.8494,
        lng: 2.3775,
        address: '1 Rue Théophile Roussel, 75012 Paris',
        mapsQuery: 'Le Baron Rouge Paris',
      },
      {
        id: 'par-promenade-plantee',
        name: {
          en: 'Promenade Plantée (Coulée Verte)',
          'pt-BR': 'Promenade Plantée (Coulée Verte)',
        },
        category: 'parks',
        description: {
          en: 'Elevated green walk from Bastille — local alternative to the central gardens.',
          'pt-BR': 'Caminhada elevada e verde a partir da Bastille — alternativa local aos jardins do centro.',
        },
        googleRating: 4.5,
        lat: 48.847,
        lng: 2.375,
        address: '1 Coulée verte René-Dumont, 75012 Paris',
        mapsQuery: 'Promenade Plantée Paris',
      },

      // ── Oct 2026 trip list: food ──
      {
        id: 'par-poilane',
        name: { en: 'Poilâne (Marais)', 'pt-BR': 'Poilâne (Marais)' },
        category: 'cafes',
        subcategories: ['bakery'],
        description: {
          en: 'Legendary sourdough bakery — the Marais shop, a few steps from the Enfants Rouges market.',
          'pt-BR': 'Padaria lendária de pão de fermentação natural — a loja do Marais, perto do Marché des Enfants Rouges.',
        },
        lat: 48.862425,
        lng: 2.364159,
        address: '38 Rue Debelleyme, 75003 Paris',
        mapsQuery: 'Poilâne 38 Rue Debelleyme Paris',
      },
      {
        id: 'par-deux-magots',
        name: { en: 'Les Deux Magots', 'pt-BR': 'Les Deux Magots' },
        category: 'cafes',
        subcategories: ['coffee-shop'],
        description: {
          en: 'Historic Saint-Germain café next to Café de Flore — go for the hot chocolate.',
          'pt-BR': 'Café histórico de Saint-Germain, vizinho do Café de Flore — vá pelo chocolate quente.',
        },
        lat: 48.854069,
        lng: 2.333063,
        address: '6 Place Saint-Germain des Prés, 75006 Paris',
        mapsQuery: 'Les Deux Magots Paris',
      },
      {
        id: 'par-as-du-fallafel',
        name: { en: "L'As du Fallafel", 'pt-BR': "L'As du Fallafel" },
        category: 'restaurants',
        description: {
          en: 'Rue des Rosiers falafel institution — the pita sandwich, ideally to go.',
          'pt-BR': 'Instituição do falafel na Rue des Rosiers — o sanduíche no pão pita, de preferência para viagem.',
        },
        lat: 48.85741,
        lng: 2.359049,
        address: '34 Rue des Rosiers, 75004 Paris',
        mapsQuery: "L'As du Fallafel Paris",
      },
      {
        id: 'par-du-pain-idees',
        name: { en: 'Du Pain et des Idées', 'pt-BR': 'Du Pain et des Idées' },
        category: 'cafes',
        subcategories: ['bakery'],
        description: {
          en: 'Famous bakery by Canal Saint-Martin — escargot pastries and pain des amis.',
          'pt-BR': 'Padaria famosa perto do Canal Saint-Martin — escargots folhados e pain des amis.',
        },
        lat: 48.871197,
        lng: 2.362886,
        address: '34 Rue Yves Toudic, 75010 Paris',
        mapsQuery: 'Du Pain et des Idées Paris',
      },
      {
        id: 'par-merveilleux-fred',
        name: { en: 'Aux Merveilleux de Fred', 'pt-BR': 'Aux Merveilleux de Fred' },
        category: 'cafes',
        subcategories: ['pastry'],
        description: {
          en: 'Merveilleux (meringue and whipped cream), chocolate-chip brioche, and a fig-cinnamon yogurt that eats like dessert.',
          'pt-BR': 'Merveilleux (suspiro com chantilly), pão com gotas de chocolate e iogurte com figo e canela que parece sobremesa.',
        },
        lat: 48.85568,
        lng: 2.356325,
        address: '24 Rue du Pont Louis-Philippe, 75004 Paris',
        mapsQuery: 'Aux Merveilleux de Fred Pont Louis-Philippe Paris',
      },
      {
        id: 'par-patate',
        name: { en: 'Patate', 'pt-BR': 'Patate' },
        category: 'restaurants',
        description: {
          en: 'Fries in a cone off Place Saint-Michel — a quick snack on the Saint-Germain walk.',
          'pt-BR': 'Batata frita no cone perto da Place Saint-Michel — lanche rápido no passeio por Saint-Germain.',
        },
        lat: 48.853389,
        lng: 2.341701,
        address: '36 Rue Saint-André des Arts, 75006 Paris',
        mapsQuery: 'Patate 36 Rue Saint-André des Arts Paris',
      },
      {
        id: 'par-bouillon-republique',
        name: { en: 'Bouillon République', 'pt-BR': 'Bouillon République' },
        category: 'restaurants',
        subcategories: ['bouillon', 'french'],
        description: {
          en: 'Classic French dishes at bouillon prices, on Boulevard du Temple by République.',
          'pt-BR': 'Pratos clássicos franceses a preço de bouillon, no Boulevard du Temple, ao lado da République.',
        },
        lat: 48.866009,
        lng: 2.364645,
        address: '39 Boulevard du Temple, 75003 Paris',
        mapsQuery: 'Bouillon République Paris',
      },
      {
        id: 'par-le-nesle',
        name: { en: 'Brasserie Le Nesle', 'pt-BR': 'Brasserie Le Nesle' },
        category: 'restaurants',
        subcategories: ['brasserie', 'french'],
        description: {
          en: 'Home of the “Matilda” chocolate cake — one giant slice feeds up to five, and leftovers go home with you. The burger with sauce and fries is good too.',
          'pt-BR': 'Casa do bolo de chocolate “da Matilda” — uma fatia gigante serve até cinco, e o que sobrar vai para viagem. O hambúrguer com molho e batatas também vale.',
        },
        lat: 48.855143,
        lng: 2.339561,
        address: '22 Rue Dauphine, 75006 Paris',
        mapsQuery: 'Brasserie Le Nesle Paris',
      },
      {
        id: 'par-specimen-burger',
        name: { en: 'Spécimen Burger Saint-Germain', 'pt-BR': 'Spécimen Burger Saint-Germain' },
        category: 'restaurants',
        subcategories: ['burgers'],
        description: {
          en: 'Burger spot by Saint-Sulpice.',
          'pt-BR': 'Hamburgueria ao lado de Saint-Sulpice.',
        },
        lat: 48.851896,
        lng: 2.33498,
        address: '3 Rue Guisarde, 75006 Paris',
        mapsQuery: 'Spécimen Burger Saint-Germain Paris',
      },
      {
        id: 'par-rocheman',
        name: { en: 'Rocheman', 'pt-BR': 'Rocheman' },
        category: 'restaurants',
        description: {
          en: 'Sandwich shop in the 11th (Saint-Ambroise).',
          'pt-BR': 'Sanduicheria no 11º (Saint-Ambroise).',
        },
        lat: 48.861347,
        lng: 2.380803,
        address: '37 Rue Saint-Maur, 75011 Paris',
        mapsQuery: 'Rocheman 37 Rue Saint-Maur Paris',
      },
      {
        id: 'par-margaux',
        name: { en: 'Margaux', 'pt-BR': 'Margaux' },
        category: 'restaurants',
        subcategories: ['french', 'bistro'],
        description: {
          en: 'Restaurant across the Seine from the Eiffel Tower, known for its award-winning cordon bleu.',
          'pt-BR': 'Restaurante do outro lado do Sena, em frente à Torre Eiffel, conhecido pelo cordon bleu premiado.',
        },
        lat: 48.86405,
        lng: 2.29906,
        address: '10 Avenue de New York, 75116 Paris',
        mapsQuery: 'Margaux 10 Avenue de New York Paris',
      },

      // ── Oct 2026 trip list: façades, museum, Eiffel photo spots ──
      {
        id: 'par-recrutement',
        name: { en: 'Le Recrutement Café', 'pt-BR': 'Le Recrutement Café' },
        category: 'cafes',
        subcategories: ['coffee-shop'],
        description: {
          en: 'Corner café on Rue Saint-Dominique with a view of the Eiffel Tower.',
          'pt-BR': 'Café de esquina com a Rue Saint-Dominique, com vista para a Torre Eiffel.',
        },
        lat: 48.860079,
        lng: 2.309963,
        address: '36 Boulevard de la Tour-Maubourg, 75007 Paris',
        mapsQuery: 'Le Recrutement Café Paris',
      },
      {
        id: 'par-villa-marquise',
        name: { en: 'La Marquise (Villa Marquise)', 'pt-BR': 'La Marquise (Villa Marquise)' },
        category: 'photo',
        subcategories: ['architecture'],
        description: {
          en: 'Café-brasserie with a beautiful façade on Rue de Vaugirard, toward Montparnasse.',
          'pt-BR': 'Café-brasserie de fachada linda na Rue de Vaugirard, a caminho de Montparnasse.',
        },
        lat: 48.845224,
        lng: 2.320775,
        address: '111 Rue de Vaugirard, 75006 Paris',
        mapsQuery: 'La Marquise 111 Rue de Vaugirard Paris',
      },
      {
        id: 'par-favorite-saint-paul',
        name: { en: 'La Favorite Saint-Paul', 'pt-BR': 'La Favorite Saint-Paul' },
        category: 'photo',
        subcategories: ['architecture'],
        description: {
          en: 'Café with a beautiful façade at the Saint-Paul end of Rue de Rivoli.',
          'pt-BR': 'Café de fachada linda na ponta Saint-Paul da Rue de Rivoli.',
        },
        lat: 48.855249,
        lng: 2.361388,
        address: '4 Rue de Rivoli, 75004 Paris',
        mapsQuery: 'La Favorite Saint-Paul Paris',
      },
      {
        id: 'par-bon-pecheur',
        name: { en: 'Le Bon Pêcheur', 'pt-BR': 'Le Bon Pêcheur' },
        category: 'photo',
        subcategories: ['architecture'],
        description: {
          en: 'Brasserie with a pretty façade by Les Halles.',
          'pt-BR': 'Brasserie de fachada bonita perto de Les Halles.',
        },
        lat: 48.861989,
        lng: 2.348435,
        address: '14 Rue Pierre Lescot, 75001 Paris',
        mapsQuery: 'Le Bon Pêcheur Paris',
      },
      {
        id: 'par-archives-nationales',
        name: {
          en: 'Archives nationales (Hôtel de Soubise)',
          'pt-BR': 'Archives nationales (Hôtel de Soubise)',
        },
        category: 'tourist',
        subcategories: ['museum', 'palace'],
        description: {
          en: 'Free museum in the Hôtel de Soubise, a Marais mansion. Closed Tuesdays; weekends from 14:00.',
          'pt-BR': 'Museu gratuito no Hôtel de Soubise, palacete do Marais. Fecha às terças; fim de semana só a partir das 14h.',
        },
        lat: 48.86045,
        lng: 2.357812,
        address: '60 Rue des Francs-Bourgeois, 75003 Paris',
        mapsQuery: 'Musée des Archives nationales Paris',
      },
      {
        id: 'par-pont-neuf',
        name: { en: 'Pont Neuf', 'pt-BR': 'Pont Neuf' },
        category: 'photo',
        subcategories: ['bridge'],
        description: {
          en: 'The oldest standing bridge in Paris, across the tip of Île de la Cité by Place Dauphine.',
          'pt-BR': 'A ponte mais antiga de Paris ainda de pé, na ponta da Île de la Cité, ao lado da Place Dauphine.',
        },
        lat: 48.857803,
        lng: 2.34192,
        address: 'Pont Neuf, 75001 Paris',
        mapsQuery: 'Pont Neuf Paris',
      },
      {
        id: 'par-avenue-camoens',
        name: { en: 'Avenue de Camoëns', 'pt-BR': 'Avenue de Camoëns' },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'Quiet street by Trocadéro with a straight view of the Eiffel Tower.',
          'pt-BR': 'Rua tranquila ao lado do Trocadéro, com vista direta da Torre Eiffel.',
        },
        lat: 48.859673,
        lng: 2.286183,
        address: 'Avenue de Camoëns, 75016 Paris',
        mapsQuery: 'Avenue de Camoëns Paris',
      },
      {
        id: 'par-rue-universite',
        name: { en: "Rue de l'Université", 'pt-BR': "Rue de l'Université" },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'The tower framed at the end of the street — shoot west from the corner with Avenue Rapp.',
          'pt-BR': 'A Torre enquadrada no fim da rua — fotografe olhando para oeste, da esquina com a Avenue Rapp.',
        },
        lat: 48.860986,
        lng: 2.301191,
        address: "Rue de l'Université × Avenue Rapp, 75007 Paris",
        mapsQuery: "Rue de l'Université Avenue Rapp Paris",
      },
      {
        id: 'par-passerelle-debilly',
        name: { en: 'Passerelle Debilly', 'pt-BR': 'Passerelle Debilly' },
        category: 'photo',
        subcategories: ['bridge', 'viewpoint'],
        description: {
          en: 'Footbridge over the Seine facing the tower — good for the hourly sparkle after dark.',
          'pt-BR': 'Passarela sobre o Sena de frente para a Torre — boa para o brilho de hora em hora depois que escurece.',
        },
        lat: 48.862561,
        lng: 2.29693,
        address: 'Passerelle Debilly, 75007 Paris',
        mapsQuery: 'Passerelle Debilly Paris',
      },
      {
        id: 'par-pont-iena',
        name: { en: "Pont d'Iéna", 'pt-BR': "Pont d'Iéna" },
        category: 'photo',
        subcategories: ['bridge', 'viewpoint'],
        description: {
          en: 'The bridge between Trocadéro and the tower — the tower straight ahead.',
          'pt-BR': 'A ponte entre o Trocadéro e a Torre — a Torre bem à frente.',
        },
        lat: 48.859833,
        lng: 2.292035,
        address: "Pont d'Iéna, 75007 Paris",
        mapsQuery: "Pont d'Iéna Paris",
      },
      {
        id: 'par-fontaines-trocadero',
        name: { en: 'Trocadéro fountains', 'pt-BR': 'Fontes do Trocadéro' },
        category: 'photo',
        subcategories: ['viewpoint', 'garden'],
        description: {
          en: 'Fontaine de Varsovie in the Trocadéro gardens, with the tower behind the water jets.',
          'pt-BR': 'Fontaine de Varsovie nos jardins do Trocadéro, com a Torre atrás dos jatos d’água.',
        },
        lat: 48.861093,
        lng: 2.29008,
        address: 'Jardins du Trocadéro, 75016 Paris',
        mapsQuery: 'Fontaine de Varsovie Trocadéro Paris',
      },

      // ── Oct 2026 trip list: shopping, pharmacies, levain, logistics ──
      {
        id: 'par-saint-georges-noisy',
        name: { en: 'Saint Georges (supérette)', 'pt-BR': 'Saint Georges (supérette)' },
        category: 'markets',
        subcategories: ['market'],
        description: {
          en: 'Neighborhood grocery on the walk from Noisy-le-Sec station to Casa do Gui, open every day, Sunday afternoon included.',
          'pt-BR': 'Mercadinho no caminho da estação de Noisy-le-Sec para a Casa do Gui, aberto todo dia, inclusive domingo à tarde.',
        },
        lat: 48.894975,
        lng: 2.458939,
        address: '97 Rue Jean Jaurès, 93130 Noisy-le-Sec',
        mapsQuery: 'Saint Georges supérette 97 Rue Jean Jaurès Noisy-le-Sec',
      },
      {
        id: 'par-uniqlo-opera',
        name: { en: 'Uniqlo Opéra', 'pt-BR': 'Uniqlo Opéra' },
        category: 'shopping',
        description: {
          en: 'Uniqlo beside the Palais Garnier, a few minutes from Galeries Lafayette — warm layers in the same walk as the grands magasins.',
          'pt-BR': 'Uniqlo ao lado do Palais Garnier, a poucos minutos da Galeries Lafayette — roupa de frio no mesmo passeio das grandes lojas.',
        },
        lat: 48.87278,
        lng: 2.330885,
        address: '17 Rue Scribe, 75009 Paris',
        mapsQuery: 'Uniqlo 17 Rue Scribe Paris',
      },
      {
        id: 'par-creteil-soleil',
        name: { en: 'Créteil Soleil (Primark, Normal)', 'pt-BR': 'Créteil Soleil (Primark, Normal)' },
        category: 'shopping',
        subcategories: ['mall'],
        description: {
          en: 'Big mall at the end of metro 8 — a large Primark with lots of choice, plus Normal, H&M, Sephora and Bershka. No Uniqlo here.',
          'pt-BR': 'Shopping grande no fim da linha 8 do metrô — Primark grande e com muita variedade, mais Normal, H&M, Sephora e Bershka. Não tem Uniqlo.',
        },
        lat: 48.779888,
        lng: 2.45614,
        address: 'Avenue de la France Libre, 94000 Créteil',
        mapsQuery: 'Primark Créteil Soleil',
      },
      {
        id: 'par-citypharma',
        name: { en: 'CityPharma', 'pt-BR': 'CityPharma' },
        category: 'shopping',
        description: {
          en: 'Saint-Germain pharmacy for French skincare, at the corner of Rue Bonaparte.',
          'pt-BR': 'Farmácia de dermocosméticos franceses em Saint-Germain, na esquina com a Rue Bonaparte.',
        },
        lat: 48.852716,
        lng: 2.333391,
        address: '26 Rue du Four, 75006 Paris',
        mapsQuery: 'CityPharma 26 Rue du Four Paris',
      },
      {
        id: 'par-carre-opera',
        name: { en: 'Pharmacie Carré Opéra', 'pt-BR': 'Farmácia Carré Opéra' },
        category: 'shopping',
        description: {
          en: 'Cosmetics pharmacy next to Galeries Lafayette, with a 10% voucher for Brazilian visitors.',
          'pt-BR': 'Farmácia de cosméticos ao lado da Galeries Lafayette, com voucher de 10% para brasileiros.',
        },
        lat: 48.874028,
        lng: 2.332925,
        address: "52–54 Rue de la Chaussée d'Antin, 75009 Paris",
        mapsQuery: "Pharmacie Carré Opéra 52 Rue de la Chaussée d'Antin Paris",
      },
      {
        id: 'par-one-nation',
        name: { en: 'One Nation Paris (outlet)', 'pt-BR': 'One Nation Paris (outlet)' },
        category: 'shopping',
        subcategories: ['mall'],
        description: {
          en: 'Outlet mall west of Versailles, about 15 minutes by car from the château.',
          'pt-BR': 'Outlet a oeste de Versalhes, a cerca de 15 minutos de carro do castelo.',
        },
        lat: 48.829506,
        lng: 1.9816,
        address: '1 Rue du Président J.F. Kennedy, 78340 Les Clayes-sous-Bois',
        mapsQuery: 'One Nation Paris outlet Les Clayes-sous-Bois',
      },
      {
        id: 'par-vallee-village',
        name: { en: 'La Vallée Village (outlet)', 'pt-BR': 'La Vallée Village (outlet)' },
        category: 'shopping',
        subcategories: ['mall'],
        description: {
          en: 'Premium and luxury outlet village by Val d’Europe (RER A), one stop before Disneyland. The Val d’Europe mall next door has Uniqlo and Primark.',
          'pt-BR': 'Outlet de marcas premium e de luxo ao lado do Val d’Europe (RER A), uma estação antes da Disney. O shopping Val d’Europe, vizinho, tem Uniqlo e Primark.',
        },
        lat: 48.853378,
        lng: 2.783453,
        address: '3 Cours de la Garonne, 77700 Serris',
        mapsQuery: 'La Vallée Village Serris',
      },
      {
        id: 'par-rue-rivoli',
        name: { en: 'Rue de Rivoli (shops)', 'pt-BR': 'Rue de Rivoli (lojas)' },
        category: 'shopping',
        subcategories: ['avenue'],
        description: {
          en: 'Long shopping street — Zara, H&M, a Uniqlo and the big chains between Hôtel de Ville and the Louvre. Good for a stroll.',
          'pt-BR': 'Rua comprida de lojas — Zara, H&M, uma Uniqlo e as grandes redes entre o Hôtel de Ville e o Louvre. Boa para passear.',
        },
        lat: 48.859397,
        lng: 2.345837,
        address: 'Rue de Rivoli, 75001 Paris',
        mapsQuery: 'Rue de Rivoli Paris',
      },
      {
        id: 'par-naturalia-verrerie',
        name: { en: 'Naturalia Verrerie (MyLevain)', 'pt-BR': 'Naturalia Verrerie (MyLevain)' },
        category: 'markets',
        subcategories: ['market'],
        description: {
          en: 'Organic grocery listed by MyLevain as a stockist of its 100% natural organic French sourdough starter (dehydrated, chilled section).',
          'pt-BR': 'Mercado orgânico que a MyLevain lista como revendedor do seu levain francês 100% natural e orgânico (desidratado, na geladeira).',
        },
        lat: 48.858644,
        lng: 2.351057,
        address: '87 Rue de la Verrerie, 75004 Paris',
        mapsQuery: 'Naturalia 87 Rue de la Verrerie Paris',
      },
      {
        id: 'par-arnaud-nicolas-caulaincourt',
        name: {
          en: 'Charcuterie Arnaud Nicolas (Caulaincourt)',
          'pt-BR': 'Charcuterie Arnaud Nicolas (Caulaincourt)',
        },
        category: 'restaurants',
        subcategories: ['charcuterie', 'french'],
        description: {
          en: 'Montmartre shop of charcutier Arnaud Nicolas — croque-monsieur and takeaway lunch.',
          'pt-BR': 'Loja de Montmartre do charcutier Arnaud Nicolas — croque-monsieur e almoço para viagem.',
        },
        lat: 48.889855,
        lng: 2.342016,
        address: '125 Rue Caulaincourt, 75018 Paris',
        mapsQuery: 'Charcuterie Arnaud Nicolas 125 Rue Caulaincourt Paris',
      },
      {
        id: 'par-gare-de-lyon',
        name: { en: 'Paris Gare de Lyon', 'pt-BR': 'Paris Gare de Lyon' },
        category: 'transport',
        subcategories: ['metro'],
        description: {
          en: 'Mainline station for the high-speed trains to Italy.',
          'pt-BR': 'Estação dos trens de alta velocidade para a Itália.',
        },
        lat: 48.844382,
        lng: 2.3748,
        address: 'Place Louis-Armand, 75012 Paris',
        mapsQuery: 'Paris Gare de Lyon',
      },

      // ── Oct 2026 trip list: Versailles ──
      {
        id: 'par-ore-ducasse',
        name: { en: 'Ore — Ducasse (Versailles)', 'pt-BR': 'Ore — Ducasse (Versalhes)' },
        category: 'restaurants',
        subcategories: ['french'],
        description: {
          en: 'Alain Ducasse’s restaurant in the Pavillon Dufour, open to everyone without a château ticket (entrance from the Cour des Princes). French classics at lunch.',
          'pt-BR': 'Restaurante do Alain Ducasse no Pavillon Dufour, aberto a quem não tem ingresso do castelo (entrada pela Cour des Princes). Clássicos franceses no almoço.',
        },
        lat: 48.804031,
        lng: 2.121751,
        address: "Pavillon Dufour, Château de Versailles, Place d'Armes, 78000 Versailles",
        mapsQuery: 'Ore Ducasse au château de Versailles',
      },
      {
        id: 'par-la-flottille',
        name: { en: 'La Flottille', 'pt-BR': 'La Flottille' },
        category: 'restaurants',
        subcategories: ['brasserie', 'french'],
        description: {
          en: '1900-style brasserie on the Grand Canal in the Versailles park, with a terrace on the water.',
          'pt-BR': 'Brasserie estilo 1900 à beira do Grand Canal, no parque de Versalhes, com terraço na água.',
        },
        lat: 48.811976,
        lng: 2.103127,
        address: 'Parc du Château de Versailles, 78000 Versailles',
        mapsQuery: 'La Flottille Versailles',
      },
      {
        id: 'par-trianon',
        name: { en: 'Domaine de Trianon', 'pt-BR': 'Domaine de Trianon' },
        category: 'tourist',
        subcategories: ['palace', 'garden'],
        description: {
          en: 'Grand Trianon, Petit Trianon and the Queen’s Hamlet, deep in the Versailles park. Included in the Passport.',
          'pt-BR': 'Grand Trianon, Petit Trianon e o Hameau da Rainha, no fundo do parque de Versalhes. Incluso no Passport.',
        },
        lat: 48.814914,
        lng: 2.109952,
        address: 'Domaine de Trianon, 78000 Versailles',
        mapsQuery: 'Domaine de Trianon Versailles',
      },
      {
        id: 'par-baguetts-cafe',
        name: { en: "Baguett's Café (Molière)", 'pt-BR': "Baguett's Café (Molière)" },
        category: 'cafes',
        subcategories: ['coffee-shop'],
        description: {
          en: 'Brunch café facing the Fontaine Molière, between the Louvre and Palais-Royal — pancakes, eggs Benedict, pain perdu, avocado toast.',
          'pt-BR': 'Café de brunch em frente à Fontaine Molière, entre o Louvre e o Palais-Royal — pancakes, ovos Benedict, pain perdu, avocado toast.',
        },
        lat: 48.865289,
        lng: 2.336585,
        address: '33 Rue de Richelieu, 75001 Paris',
        mapsQuery: "Baguett's Café 33 Rue de Richelieu Paris",
      },
    ],
  },
  {
    slug: 'roma',
    name: { en: 'Rome', 'pt-BR': 'Roma' },
    country: { en: 'Italy', 'pt-BR': 'Itália' },
    countryKey: 'italia',
    lat: 41.9028,
    lng: 12.4964,
    zoom: 13,
    places: [
      // —— Air / rail ——
      {
        id: 'rom-fco',
        name: {
          en: 'Fiumicino Airport (FCO)',
          'pt-BR': 'Aeroporto de Fiumicino (FCO)',
        },
        category: 'airport',
        featured: true,
        description: {
          en: 'Leonardo da Vinci — Rome’s main international hub. Leonardo Express train to Termini ~32 min.',
          'pt-BR':
            'Leonardo da Vinci — principal aeroporto internacional de Roma. Leonardo Express até a Termini ~32 min.',
        },
        googleRating: 3.9,
        lat: 41.8153911,
        lng: 12.2264848,
        address: 'Via Leonardo da Vinci, 00054 Fiumicino RM, Italy',
        mapsQuery: 'Aeroporto di Roma-Fiumicino FCO',
      },
      {
        id: 'rom-termini',
        name: {
          en: 'Roma Termini station',
          'pt-BR': 'Estação Roma Termini',
        },
        category: 'transport',
        featured: true,
        description: {
          en: 'Main train hub — high-speed, regional, and metro A/B/B1. Also the city end of the Leonardo Express from FCO.',
          'pt-BR':
            'Hub principal de trens — alta velocidade, regionais e metrô A/B/B1. Também o fim do Leonardo Express vindo de FCO.',
        },
        googleRating: 3.8,
        lat: 41.901195,
        lng: 12.5016713,
        address: 'Piazza dei Cinquecento, 00185 Roma',
        mapsQuery: 'Roma Termini stazione',
      },
      // —— Where to eat ——
      {
        id: 'rom-gallina-bianca',
        name: { en: 'La Gallina Bianca', 'pt-BR': 'La Gallina Bianca' },
        category: 'restaurants',
        description: {
          en: 'Best carbonara tip (Canal dos Caçadores). Typical plate ~€14; truffle carbonara was €18.',
          'pt-BR':
            'Melhor carbonara (Canal dos Caçadores). Média ~€14 o prato; pegaram a carbonara trufada a €18.',
        },
        googleRating: 4.3,
        lat: 41.8995729,
        lng: 12.4976136,
        address: 'Via Antonio Rosmini 8, 00185 Roma',
        mapsQuery: 'La Gallina Bianca Via Antonio Rosmini Roma',
      },
      {
        id: 'rom-alfredo-ada',
        name: { en: 'Alfredo e Ada', 'pt-BR': 'Alfredo e Ada' },
        category: 'restaurants',
        description: {
          en: 'Pastas, lasagna, classic Roman plates (Pedro & Juju). ~€10–13 per dish.',
          'pt-BR':
            'Massas, lasanha e pratos clássicos (Pedro e Juju). Média €10–13 o prato.',
        },
        googleRating: 4.5,
        lat: 41.8995579,
        lng: 12.4672366,
        address: 'Via dei Banchi Nuovi 14, 00186 Roma',
        mapsQuery: 'Alfredo e Ada Via dei Banchi Nuovi Roma',
      },
      {
        id: 'rom-antico-vinaio',
        name: {
          en: "All'Antico Vinaio",
          'pt-BR': "All'Antico Vinaio",
        },
        category: 'restaurants',
        description: {
          en: 'Famous stuffed schiacciata sandwiches — delivery too (Pedro & Juju). ~€12.',
          'pt-BR':
            'Sanduíche famoso e muito bom (tem até delivery) — indicação Pedro e Juju. Média ~€12.',
        },
        googleRating: 4.4,
        lat: 41.8999413,
        lng: 12.4763914,
        address: 'Piazza della Maddalena 3, 00186 Roma',
        mapsQuery: "All'Antico Vinaio Piazza della Maddalena Roma",
      },
      {
        id: 'rom-baffetto',
        name: {
          en: 'Pizzeria da Baffetto',
          'pt-BR': 'Pizzeria da Baffetto',
        },
        category: 'restaurants',
        description: {
          en: 'Classic individual Roman pizza (Pedro & Juju). ~€8–15.',
          'pt-BR':
            'Pizza individual clássica (Pedro e Juju). €8–15.',
        },
        googleRating: 4.2,
        lat: 41.8983047,
        lng: 12.4703507,
        address: 'Via del Governo Vecchio 114, 00186 Roma',
        mapsQuery: 'Pizzeria da Baffetto Via del Governo Vecchio Roma',
      },
      {
        id: 'rom-suppli',
        name: { en: 'I Supplì', 'pt-BR': 'I Supplì / Supplì Roma' },
        category: 'restaurants',
        description: {
          en: 'Rice balls ~€2 each — cacio e pepe, carbonara, cheese (Canal dos Caçadores).',
          'pt-BR':
            'Bolinhos ~€2 cada — cacio e pepe (pimenta e queijo), carbonara e queijo (Canal dos Caçadores).',
        },
        googleRating: 4.5,
        lat: 41.8882294,
        lng: 12.4709933,
        address: 'Via di San Francesco a Ripa 137, 00153 Roma',
        mapsQuery: 'I Supplì Via di San Francesco a Ripa Roma',
      },
      {
        id: 'rom-norcineria',
        name: {
          en: 'La Norcineria (Iacozzilli)',
          'pt-BR': 'La Norcineria (Iacozzilli)',
        },
        category: 'restaurants',
        description: {
          en: 'Porchetta sandwich stop in Trastevere (Canal dos Caçadores).',
          'pt-BR':
            'Sanduíche de porchetta em Trastevere (Canal dos Caçadores).',
        },
        googleRating: 4.6,
        lat: 41.8873725,
        lng: 12.4706429,
        address: 'Via Natale del Grande 15/16, 00153 Roma',
        mapsQuery: 'La Norcineria Iacozzilli Via Natale del Grande Roma',
      },
      {
        id: 'rom-said',
        name: { en: 'Said dal 1923', 'pt-BR': 'Said dal 1923' },
        category: 'cafes',
        description: {
          en: 'Historic chocolate shop & gelato (Canal dos Caçadores). Scoops ~€2.40–3.40.',
          'pt-BR':
            'Sorvete e chocolate histórico (Canal dos Caçadores). Média €2,40–3,40 a unidade.',
        },
        googleRating: 4.5,
        lat: 41.9046814,
        lng: 12.4778803,
        address: 'Via Tomacelli 13–14, 00186 Roma',
        mapsQuery: 'Said dal 1923 Via Tomacelli Roma',
      },
      {
        id: 'rom-forno-trevi',
        name: {
          en: "L'Antico Forno (Trevi)",
          'pt-BR': "L'Antico Forno (Trevi)",
        },
        category: 'cafes',
        description: {
          en: 'Croissants at the counter facing Trevi: plain €1.50, chocolate €2.30, pistachio €3. American coffee €1.60.',
          'pt-BR':
            'Croissant bem na frente da Fontana di Trevi, comer na bancada em pé: €1,50 sem recheio, €2,30 chocolate, €3,00 pistache. Café americano €1,60.',
        },
        googleRating: 4.1,
        lat: 41.9007946,
        lng: 12.4830539,
        address: 'Piazza di Trevi 100 / Via delle Muratte 11, 00187 Roma',
        mapsQuery: "L'Antico Forno Fontana di Trevi Roma",
      },
      // —— What to visit ——
      {
        id: 'rom-colosseum',
        name: { en: 'Colosseum', 'pt-BR': 'Coliseu' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Icon of Rome. Combo with Forum & Palatine ~€16–18; arena floor access ~€22–24.',
          'pt-BR':
            'Ícone de Roma. €16–18 com ingresso para Fórum e Palatino juntos; €22–24 para acessar a arena do Coliseu também.',
        },
        googleRating: 4.7,
        lat: 41.8909421,
        lng: 12.491903,
        address: 'Piazza del Colosseo, 1, 00184 Roma',
        mapsQuery: 'Colosseo Roma',
      },
      {
        id: 'rom-forum',
        name: { en: 'Roman Forum', 'pt-BR': 'Fórum Romano' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Heart of ancient Rome — usually on the same ticket as the Colosseum & Palatine.',
          'pt-BR':
            'Coração da Roma antiga — em geral no mesmo ingresso do Coliseu e do Palatino.',
        },
        googleRating: 4.7,
        lat: 41.8916414,
        lng: 12.4867296,
        address: 'Via della Salara Vecchia, 5/6, 00186 Roma',
        mapsQuery: 'Foro Romano Roma',
      },
      {
        id: 'rom-pantheon',
        name: { en: 'Pantheon', 'pt-BR': 'Panteão' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Perfect dome and oculus. Adult entry ~€5.',
          'pt-BR': 'Cúpula perfeita e óculo. Entrada ~€5.',
        },
        googleRating: 4.8,
        lat: 41.898616,
        lng: 12.4768334,
        address: 'Piazza della Rotonda, 00186 Roma',
        mapsQuery: 'Pantheon Roma',
      },
      {
        id: 'rom-piazza-venezia',
        name: { en: 'Piazza Venezia', 'pt-BR': 'Piazza Venezia' },
        category: 'photo',
        description: {
          en: 'Traffic hub at the foot of the Vittoriano — orientation point for the historic center.',
          'pt-BR':
            'Nó de trânsito aos pés do Vittoriano — ponto de orientação do centro histórico.',
        },
        googleRating: 4.5,
        lat: 41.8962446,
        lng: 12.4823704,
        address: 'Piazza Venezia, 00186 Roma',
        mapsQuery: 'Piazza Venezia Roma',
      },
      {
        id: 'rom-trevi',
        name: { en: 'Trevi Fountain', 'pt-BR': 'Fontana di Trevi' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Coin-toss classic. Viewing is free; ~€2 if you pay for a closer controlled access. Go early.',
          'pt-BR':
            'Clássico da moeda. Dá para ver sem pagar; ~€2 para chegar mais perto (acesso controlado). Chegue cedo.',
        },
        googleRating: 4.7,
        lat: 41.9009778,
        lng: 12.4832848,
        address: 'Piazza di Trevi, 00187 Roma',
        mapsQuery: 'Fontana di Trevi Roma',
      },
      {
        id: 'rom-vatican',
        name: {
          en: 'Vatican Museums',
          'pt-BR': 'Museus do Vaticano',
        },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Paid museums (Sistine path). St. Peter’s Square / city exterior is free. Arrive early.',
          'pt-BR':
            'Museus pagos (caminho da Capela Sistina). A praça / exterior do Vaticano é gratuito. Chegue cedo.',
        },
        googleRating: 4.6,
        lat: 41.904961,
        lng: 12.4546617,
        address: 'Viale Vaticano, 00165 Roma / Città del Vaticano',
        mapsQuery: 'Musei Vaticani',
      },
      {
        id: 'rom-sistine',
        name: { en: 'Sistine Chapel', 'pt-BR': 'Capela Sistina' },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Michelangelo’s ceiling — access is via the Vatican Museums ticket, not St. Peter’s alone.',
          'pt-BR':
            'Teto de Michelangelo — entrada pelo ingresso dos Museus do Vaticano, não só pela Basílica.',
        },
        googleRating: 4.8,
        lat: 41.9029338,
        lng: 12.4544043,
        address: 'Cappella Sistina, Città del Vaticano',
        mapsQuery: 'Cappella Sistina Vaticano',
      },
      {
        id: 'rom-st-peter',
        name: {
          en: "St. Peter's Basilica",
          'pt-BR': 'Basílica de São Pedro',
        },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Entry free; dome climb is paid. Security lines — go early.',
          'pt-BR':
            'Entrar é gratuito; subir na cúpula precisa pagar. Fila de segurança — chegue cedo.',
        },
        googleRating: 4.8,
        lat: 41.9021569,
        lng: 12.4537105,
        address: 'Piazza San Pietro, 00120 Città del Vaticano',
        mapsQuery: 'Basilica di San Pietro Vaticano',
      },
      {
        id: 'rom-vittoriano',
        name: {
          en: 'Victor Emmanuel II Monument',
          'pt-BR': 'Monumento a Vítor Emanuel II',
        },
        category: 'tourist',
        landmark: 'monument',
        description: {
          en: 'Altare della Patria / Vittoriano — free exterior and terraces (check lift fees if any).',
          'pt-BR':
            'Altare della Patria / Vittoriano — gratuito. Terraços e vistas do centro.',
        },
        googleRating: 4.7,
        lat: 41.8946867,
        lng: 12.4830664,
        address: 'Piazza Venezia, 00186 Roma',
        mapsQuery: 'Altare della Patria Vittoriano Roma',
      },
      // —— Stay ——
      {
        id: 'rom-window-on-rome',
        name: { en: 'Window on Rome', 'pt-BR': 'Window on Rome' },
        category: 'lodging',
        description: {
          en: 'Hotel tip from Canal dos Caçadores. In Trastevere — a good base for going out at night.',
          'pt-BR':
            'Hotel do Canal dos Caçadores. Fica em Trastevere, um local bom pra sair a noitinha.',
        },
        googleRating: 4.6,
        lat: 41.8888833,
        lng: 12.4742889,
        address: 'Piazza Sidney Sonnino 25, 00153 Roma',
        mapsQuery: 'Window on Rome Piazza Sidney Sonnino 25 Roma',
      },
    ],
  },
  {
    slug: 'lisboa',
    name: { en: 'Lisbon', 'pt-BR': 'Lisboa' },
    country: { en: 'Portugal', 'pt-BR': 'Portugal' },
    countryKey: 'portugal',
    lat: 38.7223,
    lng: -9.1393,
    zoom: 13,
    places: [
      {
        id: 'lis-lis',
        name: {
          en: 'Humberto Delgado Airport (LIS)',
          'pt-BR': 'Aeroporto Humberto Delgado (LIS)',
        },
        category: 'airport',
        description: {
          en: 'Main Lisbon airport, metro-linked to the center.',
          'pt-BR': 'Principal aeroporto de Lisboa, ligado ao centro por metro.',
        },
        googleRating: 3.6,
        lat: 38.7756,
        lng: -9.1354,
        address: 'Alameda das Comunidades Portuguesas, 1700-111 Lisboa, Portugal',
        mapsQuery: 'Aeroporto Humberto Delgado Lisboa LIS',
      },
      // —— Maps list: Lisboa (recomendado) ——
      {
        id: 'lis-ginjinha-sem-rival',
        name: { en: 'Ginjinha Sem Rival', 'pt-BR': 'Ginjinha Sem Rival' },
        category: 'cafes',
        subcategories: ['pastry'],
        description: {
          en: 'One of Lisbon’s classic ginjinhas: sour-cherry liqueur, optionally with a chocolate cup.',
          'pt-BR':
            'Uma das ginjinhas mais tradicionais de Lisboa (licor de cereja com copinho de chocolate).',
        },
        favorite: true,
        googleRating: 4.7,
        lat: 38.71508,
        lng: -9.139624,
        address: 'Ginjinha Sem Rival',
        mapsQuery: 'Ginjinha Sem Rival Lisboa',
      },
      {
        id: 'lis-restauradores',
        name: {
          en: 'Restauradores Monument',
          'pt-BR': 'Monumento dos Restauradores',
        },
        category: 'tourist',
        subcategories: ['monument', 'square'],
        description: {
          en: 'Obelisk at the top of Avenida da Liberdade, marking the 1640 restoration of independence.',
          'pt-BR':
            'Obelisco no topo da Avenida da Liberdade, marca da restauração de 1640.',
        },
        favorite: true,
        googleRating: 4.5,
        lat: 38.715705,
        lng: -9.141662,
        address: 'Restauradores Monument',
        mapsQuery: 'Monumento dos Restauradores Lisboa',
      },
      {
        id: 'lis-rossio-fonte-sul',
        name: {
          en: 'Rossio south fountain',
          'pt-BR': 'Fonte sul do Rossio',
        },
        category: 'photo',
        subcategories: ['square'],
        description: {
          en: 'Baroque fountain on Praça de D. Pedro IV. Easy meeting point in Baixa.',
          'pt-BR':
            'Fonte barroca na Praça de D. Pedro IV. Ponto fácil de encontro na Baixa.',
        },
        favorite: true,
        googleRating: 4.7,
        lat: 38.713377,
        lng: -9.13919,
        address: 'Rossio south fountain',
        mapsQuery: 'Fonte do Rossio Lisboa',
      },
      {
        id: 'lis-miradouro-recolhimento',
        name: {
          en: 'Miradouro do Recolhimento',
          'pt-BR': 'Miradouro do Recolhimento',
        },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'Quiet Alfama viewpoint, less crowded than Santa Luzia.',
          'pt-BR': 'Mirante quieto da Alfama, menos cheio que Santa Luzia.',
        },
        favorite: true,
        googleRating: 4.6,
        lat: 38.712826,
        lng: -9.131664,
        address: 'Miradouro do Recolhimento',
        mapsQuery: 'Miradouro do Recolhimento Lisboa',
      },
      {
        id: 'lis-amoreiras-360',
        name: {
          en: 'Amoreiras 360 Panoramic View',
          'pt-BR': 'Amoreiras 360º Panoramic View',
        },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'Rooftop over the Amoreiras towers. City and river in one spin.',
          'pt-BR':
            'Terraço nas torres das Amoreiras. Cidade e rio numa volta só.',
        },
        favorite: true,
        googleRating: 4.5,
        lat: 38.723757,
        lng: -9.161325,
        address: 'Amoreiras 360 Panoramic View',
        mapsQuery: 'Amoreiras 360 Panoramic View Lisboa',
      },
      {
        id: 'lis-chafariz-largo-mastro',
        name: {
          en: 'Chafariz do Largo do Mastro',
          'pt-BR': 'Chafariz do Largo do Mastro',
        },
        category: 'photo',
        subcategories: ['square'],
        description: {
          en: 'Old fountain in a small square above Intendente. Neighborhood Lisbon.',
          'pt-BR':
            'Chafariz antigo num largo acima do Intendente. Lisboa de bairro.',
        },
        favorite: true,
        googleRating: 2.8,
        lat: 38.721383,
        lng: -9.138843,
        address: 'Chafariz do Largo do Mastro',
        mapsQuery: 'Chafariz do Largo do Mastro Lisboa',
      },
      {
        id: 'lis-miradouro-penha-franca',
        name: {
          en: 'Miradouro da Penha de França',
          'pt-BR': 'Miradouro da Penha de França',
        },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'East-side view over the river and the castle, without the Alfama crowds.',
          'pt-BR':
            'Vista do lado leste sobre o rio e o castelo, sem a fila da Alfama.',
        },
        favorite: true,
        googleRating: 4.5,
        lat: 38.73088,
        lng: -9.131626,
        address: 'Miradouro da Penha de França',
        mapsQuery: 'Miradouro da Penha de França Lisboa',
      },
      {
        id: 'lis-jardim-principe-real',
        name: {
          en: 'Príncipe Real Garden',
          'pt-BR': 'Jardim do Príncipe Real',
        },
        category: 'parks',
        subcategories: ['garden', 'square'],
        description: {
          en: 'Pretty square under a cedar. Some days a little market sets up there.',
          'pt-BR':
            'Uma praça bem bonitinha em Lisboa. Dependendo do dia está rolando uma feirinha nela.',
        },
        favorite: true,
        googleRating: 4.5,
        lat: 38.7163,
        lng: -9.148717,
        address: 'Príncipe Real Garden',
        mapsQuery: 'Jardim do Príncipe Real Lisboa',
      },
      {
        id: 'lis-miradouro-sao-pedro-alcantara',
        name: {
          en: 'Miradouro de São Pedro de Alcântara',
          'pt-BR': 'Miradouro de São Pedro de Alcântara',
        },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'Classic Bairro Alto lookout. Tram parked on the street beside it.',
          'pt-BR':
            'Mirante bem bonito de Lisboa, com um bondinho estacionado na rua ao lado.',
        },
        favorite: true,
        googleRating: 4.6,
        lat: 38.715309,
        lng: -9.144176,
        address: 'Miradouro de São Pedro de Alcântara',
        mapsQuery: 'Miradouro de São Pedro de Alcântara Lisboa',
      },
      {
        id: 'lis-marrecreo',
        name: { en: "M'arrecreo Pizzeria", 'pt-BR': "M'arrecreo Pizzeria" },
        category: 'restaurants',
        subcategories: ['italian'],
        description: {
          en: 'Great Lisbon pizza. There is a folded slice you walk with in your hand. Do that.',
          'pt-BR':
            'Pizza deliciosa de Lisboa. Possui uma versão que a pizza vem dobrada e você sai andando com ela na mão. Super recomendo!',
        },
        favorite: true,
        googleRating: 4.7,
        lat: 38.71397,
        lng: -9.144023,
        address: "M'arrecreo Pizzeria",
        mapsQuery: "M'arrecreo Pizzeria Lisboa",
      },
      {
        id: 'lis-crush-doughnuts',
        name: { en: 'Crush Doughnuts', 'pt-BR': 'Crush Doughnuts' },
        category: 'cafes',
        subcategories: ['pastry', 'coffee-shop'],
        description: {
          en: 'Handmade doughnuts and coffee. Worth the detour to the north of the center.',
          'pt-BR': 'Donuts deliciosos em Lisboa.',
        },
        favorite: true,
        googleRating: 4.4,
        lat: 38.734844,
        lng: -9.154097,
        address: 'Crush Doughnuts',
        mapsQuery: 'Crush Doughnuts Lisboa',
      },
      {
        id: 'lis-queluz-palace',
        name: {
          en: 'Queluz National Palace',
          'pt-BR': 'Palácio Nacional de Queluz',
        },
        category: 'tourist',
        subcategories: ['palace', 'garden'],
        description: {
          en: 'A bit outside Lisbon, easy by car. Beautiful palace and a lovely garden.',
          'pt-BR':
            'Um pouco mais afastado de Lisboa mas dá para ir de carro. Um palácio bem bonito com um jardim lindo.',
        },
        favorite: true,
        googleRating: 4.6,
        lat: 38.75065,
        lng: -9.259252,
        address: 'Queluz National Palace',
        mapsQuery: 'Palácio Nacional de Queluz',
      },
      {
        id: 'lis-bread-friends',
        name: { en: 'Bread & Friends Marquês', 'pt-BR': 'Bread & Friends Marquês' },
        category: 'cafes',
        subcategories: ['bakery', 'pastry'],
        description: {
          en: 'Pretty café. Famous NY Roll croissant. Fine to try, though other things on the menu are better.',
          'pt-BR':
            'Café bem bonito de Lisboa. Tem o NY Roll (croissant em rolo) bem famoso, é uma opção para provar, apesar de ter coisas mais gostosas.',
        },
        favorite: true,
        googleRating: 4.3,
        lat: 38.727388,
        lng: -9.148447,
        address: 'Bread & Friends Marquês',
        mapsQuery: 'Bread & Friends Marquês Lisboa',
      },
      {
        id: 'lis-entrecote',
        name: {
          en: "La Brasserie de L'Entrecôte",
          'pt-BR': "La Brasserie de L'Entrecôte",
        },
        category: 'restaurants',
        subcategories: ['french', 'meat'],
        description: {
          en: 'Solid mall lunch: steak-frites, the sauce is the point.',
          'pt-BR':
            'Ótima opção para almoçar no shopping com um entrecôte delicioso!',
        },
        favorite: true,
        googleRating: 4.2,
        lat: 38.750019,
        lng: -9.180174,
        address: "La Brasserie de L'Entrecôte",
        mapsQuery: "La Brasserie de L'Entrecôte Colombo Lisboa",
      },
      {
        id: 'lis-colombo',
        name: { en: 'Colombo Shopping Centre', 'pt-BR': 'Centro Colombo' },
        category: 'shopping',
        subcategories: ['mall'],
        description: {
          en: 'Big mall next to Benfica stadium. Easy if you are already on that side of town.',
          'pt-BR':
            'Shopping muito bom de Lisboa, ao lado do estádio do Benfica.',
        },
        favorite: true,
        googleRating: 4.4,
        lat: 38.753681,
        lng: -9.188254,
        address: 'Colombo Shopping Centre',
        mapsQuery: 'Centro Colombo Lisboa',
      },
      {
        id: 'lis-portela-cafes',
        name: {
          en: 'Portela Cafés António A. Aguiar',
          'pt-BR': 'Portela Cafés | António A. Aguiar',
        },
        category: 'cafes',
        subcategories: ['coffee-shop'],
        description: {
          en: 'Good Lisbon café. Order the tostas, very buttery.',
          'pt-BR':
            'Bom café de Lisboa. Pedir as tostas que são bem amanteigadas e deliciosas.',
        },
        favorite: true,
        googleRating: 4.2,
        lat: 38.730705,
        lng: -9.150569,
        address: 'Portela Cafés António A. Aguiar',
        mapsQuery: 'Portela Cafés António A. Aguiar Lisboa',
      },
      {
        id: 'lis-don-costini',
        name: {
          en: 'Don Costini',
          'pt-BR': 'Don Costini Restaurante Italiano',
        },
        category: 'restaurants',
        subcategories: ['italian'],
        description: {
          en: 'Italian with an open back patio. Get the francesinha here.',
          'pt-BR':
            'Restaurante com parte aberta aos fundos. Comida boa, recomendo a francesinha daqui.',
        },
        favorite: true,
        googleRating: 4.1,
        lat: 38.707682,
        lng: -9.146581,
        address: 'Don Costini',
        mapsQuery: 'Don Costini Restaurante Italiano Lisboa',
      },
      {
        id: 'lis-time-out',
        name: { en: 'Time Out Market', 'pt-BR': 'Time Out Market' },
        category: 'markets',
        subcategories: ['market'],
        description: {
          en: 'Mercado da Ribeira food hall. Many counters, one ticket for a crash course in Lisbon food.',
          'pt-BR':
            'O Mercado da Ribeira, Time Out, com várias opções de restaurantes para pedir.',
        },
        googleRating: 4.4,
        favorite: true,
        featured: true,
        lat: 38.707061,
        lng: -9.145669,
        address: 'Av. 24 de Julho 49, 1200-479 Lisboa, Portugal',
        mapsQuery: 'Time Out Market Lisboa',
      },
      {
        id: 'lis-hygge-kaffe',
        name: { en: 'Hygge Kaffe', 'pt-BR': 'Hygge Kaffe' },
        category: 'cafes',
        subcategories: ['coffee-shop'],
        description: {
          en: 'Cozy brunch café. Tostas and pancakes.',
          'pt-BR':
            'Café aconchegante de Lisboa. Ótimo para um brunch, com opções deliciosas de tostas e panquecas.',
        },
        favorite: true,
        googleRating: 4.8,
        lat: 38.731551,
        lng: -9.149079,
        address: 'Hygge Kaffe',
        mapsQuery: 'Hygge Kaffe Lisboa',
      },
      {
        id: 'lis-panteao-nacional',
        name: { en: 'National Pantheon', 'pt-BR': 'Panteão Nacional' },
        category: 'tourist',
        subcategories: ['monument', 'church'],
        description: {
          en: 'Paid entry, worth it for the view from the dome.',
          'pt-BR':
            'Panteão de Lisboa. Tem que pagar para entrar, mas tem uma vista legal do topo dele.',
        },
        favorite: true,
        googleRating: 4.5,
        lat: 38.714994,
        lng: -9.124683,
        address: 'National Pantheon',
        mapsQuery: 'Panteão Nacional Lisboa',
      },
      {
        id: 'lis-palacio-sao-vicente',
        name: {
          en: 'Palácio de São Vicente',
          'pt-BR': 'Palácio de São Vicente',
        },
        category: 'tourist',
        subcategories: ['palace'],
        description: {
          en: 'Also called Palácio da Mitra. Baroque palace on the edge of Alfama.',
          'pt-BR':
            'Também chamado Palácio da Mitra. Palácio barroco na borda da Alfama.',
        },
        favorite: true,
        googleRating: 4.5,
        lat: 38.71511,
        lng: -9.128721,
        address: 'Palácio de São Vicente',
        mapsQuery: 'Palácio de São Vicente Lisboa',
      },
      {
        id: 'lis-castelo-sao-jorge',
        name: { en: 'São Jorge Castle', 'pt-BR': 'Castelo de São Jorge' },
        category: 'tourist',
        subcategories: ['castle', 'viewpoint'],
        description: {
          en: 'Moorish castle on the hill. Walls, peacocks, and the whole city below.',
          'pt-BR':
            'Castelo mouro no alto. Muralhas, pavões e a cidade inteira embaixo.',
        },
        favorite: true,
        featured: true,
        googleRating: 4.5,
        lat: 38.713909,
        lng: -9.133476,
        address: 'São Jorge Castle',
        mapsQuery: 'Castelo de São Jorge Lisboa',
      },
      {
        id: 'lis-miradouro-santa-luzia',
        name: {
          en: 'Miradouro de Santa Luzia',
          'pt-BR': 'Miradouro de Santa Luzia',
        },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'The postcard Alfama terrace. Tiles, bougainvillea, river.',
          'pt-BR': 'Mirante com vista linda de Lisboa.',
        },
        favorite: true,
        googleRating: 4.6,
        lat: 38.711696,
        lng: -9.130197,
        address: 'Miradouro de Santa Luzia',
        mapsQuery: 'Miradouro de Santa Luzia Lisboa',
      },
      {
        id: 'lis-jardim-julio-castilho',
        name: {
          en: 'Jardim Júlio de Castilho',
          'pt-BR': 'Jardim Júlio de Castilho',
        },
        category: 'parks',
        subcategories: ['garden', 'viewpoint'],
        description: {
          en: 'Small garden beside Santa Luzia, same river view, a bit more shade.',
          'pt-BR':
            'Jardim ao lado de Santa Luzia, mesma vista do rio, um pouco mais de sombra.',
        },
        favorite: true,
        googleRating: 4.8,
        lat: 38.711745,
        lng: -9.130285,
        address: 'Jardim Júlio de Castilho',
        mapsQuery: 'Jardim Júlio de Castilho Lisboa',
      },
      {
        id: 'lis-baan-saraivas',
        name: { en: "Baan Saraiva's", 'pt-BR': "Baan Saraiva's" },
        category: 'restaurants',
        description: {
          en: 'Very good Thai in Lisbon.',
          'pt-BR': 'Comida Thai bem gostosa.',
        },
        favorite: true,
        googleRating: 4.7,
        lat: 38.731696,
        lng: -9.152464,
        address: "Baan Saraiva's",
        mapsQuery: "Baan Saraiva's Lisboa",
      },
      {
        id: 'lis-simpli-coffee',
        name: { en: 'Simpli Coffee', 'pt-BR': 'Simpli Coffee' },
        category: 'cafes',
        subcategories: ['coffee-shop', 'bakery'],
        description: {
          en: 'Good café with croissants and savory snacks.',
          'pt-BR':
            'Café bom com opções de croissant e lanches bem saborosos.',
        },
        favorite: true,
        googleRating: 4.5,
        lat: 38.732199,
        lng: -9.146397,
        address: 'Simpli Coffee',
        mapsQuery: 'Simpli Coffee Lisboa',
      },
      {
        id: 'lis-vasco-da-gama',
        name: { en: 'Centro Vasco da Gama', 'pt-BR': 'Centro Vasco da Gama' },
        category: 'shopping',
        subcategories: ['mall'],
        description: {
          en: 'One of the better malls in Lisbon. Prices beat much of Europe. Ask about tax-free before flying back to Brazil.',
          'pt-BR':
            'Uma das melhores opções para fazer compras em Lisboa. Preços em Portugal são melhores do que no restante da Europa. Consultar o Taxfree para ganhar desconto no valor das compras na hora da volta para o Brasil.',
        },
        favorite: true,
        googleRating: 4.4,
        lat: 38.768511,
        lng: -9.097127,
        address: 'Centro Vasco da Gama',
        mapsQuery: 'Centro Vasco da Gama Lisboa',
      },
      {
        id: 'lis-av-liberdade',
        name: { en: 'Avenida da Liberdade', 'pt-BR': 'Avenida da Liberdade' },
        category: 'parks',
        subcategories: ['avenue'],
        description: {
          en: 'One of the most beautiful avenues in Lisbon. Restaurants and famous shops along the trees.',
          'pt-BR':
            'Uma das avenidas mais bonitas de Lisboa, com ótimos restaurantes e lojas famosas.',
        },
        favorite: true,
        googleRating: 4.7,
        lat: 38.720537,
        lng: -9.145902,
        address: 'Avenida da Liberdade',
        mapsQuery: 'Avenida da Liberdade Lisboa',
      },
      {
        id: 'lis-marques-pombal',
        name: { en: 'Marquês de Pombal', 'pt-BR': 'Marquês de Pombal' },
        category: 'tourist',
        subcategories: ['monument', 'square'],
        description: {
          en: 'The 18th-century rebuild starts here. Liberdade — the city’s postcard avenue — in front, Parque Eduardo VII behind.',
          'pt-BR':
            'Marquês de Pombal foi uma das principais pessoas nas reformas realizadas na cidade no séc. 18. Aqui começa a Avenida da Liberdade (cartão postal da cidade) e atrás fica o Jardim Eduardo VII.',
        },
        favorite: true,
        googleRating: 4.6,
        lat: 38.725255,
        lng: -9.150029,
        address: 'Marquês de Pombal',
        mapsQuery: 'Marquês de Pombal Lisboa',
      },
      {
        id: 'lis-el-corte-ingles',
        name: { en: 'El Corte Inglés Lisboa', 'pt-BR': 'El Corte Inglés Lisboa' },
        category: 'shopping',
        subcategories: ['department'],
        description: {
          en: 'Multi-floor department store with a strong food hall. Bring your passport for tax-free; they have a desk that walks you through it.',
          'pt-BR':
            'Como um shopping de muitos andares com bom mercado. Levar o passaporte para fazer compras e pedir o reembolso de taxas depois. Eles possuem um balcão para orientar e facilitar o processo.',
        },
        favorite: true,
        googleRating: 4.3,
        lat: 38.733281,
        lng: -9.153778,
        address: 'El Corte Inglés Lisboa',
        mapsQuery: 'El Corte Inglés Lisboa',
      },
      {
        id: 'lis-eduardo-vii-deck',
        name: {
          en: 'Parque Eduardo VII observation deck',
          'pt-BR': 'Miradouro do Parque Eduardo VII',
        },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'Top of the park looking down the lawn toward Marquês and the river.',
          'pt-BR':
            'Topo do parque, olhando o gramado até o Marquês e o rio.',
        },
        favorite: true,
        googleRating: 4.7,
        lat: 38.730299,
        lng: -9.15443,
        address: 'Parque Eduardo VII observation deck',
        mapsQuery: 'Miradouro Parque Eduardo VII Lisboa',
      },
      {
        id: 'lis-parque-eduardo-vii',
        name: { en: 'Parque Eduardo VII', 'pt-BR': 'Parque Eduardo VII' },
        category: 'parks',
        subcategories: ['park'],
        description: {
          en: 'The sloping lawn above Marquês de Pombal. Green break from the avenue.',
          'pt-BR':
            'O gramado inclinado acima do Marquês de Pombal. Pausa verde depois da avenida.',
        },
        favorite: true,
        googleRating: 4.6,
        lat: 38.7283,
        lng: -9.152683,
        address: 'Parque Eduardo VII',
        mapsQuery: 'Parque Eduardo VII Lisboa',
      },
      {
        id: 'lis-oriente',
        name: { en: 'Oriente Station', 'pt-BR': 'Estação do Oriente' },
        category: 'transport',
        subcategories: ['architecture'],
        description: {
          en: 'Calatrava station (same architect as Museu do Amanhã in Rio). Trains and buses under the glass and steel.',
          'pt-BR':
            'Feita pelo mesmo arquiteto do Museu do Amanhã no Rio. Estação de ônibus e de trem.',
        },
        favorite: true,
        lat: 38.767173,
        lng: -9.099085,
        address: 'Oriente Station',
        mapsQuery: 'Estação do Oriente Lisboa',
      },
      {
        id: 'lis-jeronimos',
        name: {
          en: 'Jerónimos Monastery',
          'pt-BR': 'Mosteiro dos Jerónimos',
        },
        category: 'tourist',
        subcategories: ['church', 'monument', 'architecture'],
        description: {
          en: 'One of the most beautiful buildings in the city. Manueline Gothic, once a monastery and an orphanage.',
          'pt-BR':
            'É uma construção lindíssima e antiga, uma das mais bonitas da cidade. Estilo gótico, arquitetura toda detalhada. Já foi mosteiro e orfanato, antes de virar patrimônio.',
        },
        favorite: true,
        featured: true,
        googleRating: 4.4,
        lat: 38.697891,
        lng: -9.206704,
        address: 'Jerónimos Monastery',
        mapsQuery: 'Mosteiro dos Jerónimos Lisboa',
      },
      {
        id: 'lis-rua-augusta',
        name: { en: 'Rua Augusta', 'pt-BR': 'Rua Augusta' },
        category: 'parks',
        subcategories: ['avenue'],
        description: {
          en: 'The street of the arch: brands, souvenirs, and a mix of restaurants.',
          'pt-BR':
            'Famosa rua por conta do arco, lojas de marcas, lojas de souvenir, além de vários tipos de restaurantes.',
        },
        favorite: true,
        googleRating: 4.6,
        lat: 38.710656,
        lng: -9.137672,
        address: 'Rua Augusta',
        mapsQuery: 'Rua Augusta Lisboa',
      },
      {
        id: 'lis-padrao-descobrimentos',
        name: {
          en: 'Monument to the Discoveries',
          'pt-BR': 'Padrão dos Descobrimentos',
        },
        category: 'tourist',
        subcategories: ['monument'],
        description: {
          en: 'Ship-prow monument on the Belém waterfront. Climb for the Tagus view.',
          'pt-BR':
            'Monumento em forma de proa na orla de Belém. Suba para a vista do Tejo.',
        },
        favorite: true,
        googleRating: 4.6,
        lat: 38.693597,
        lng: -9.205711,
        address: 'Monument to the Discoveries',
        mapsQuery: 'Padrão dos Descobrimentos Lisboa',
      },
      {
        id: 'lis-jardim-imperio',
        name: { en: 'Empire Square Garden', 'pt-BR': 'Jardim da Praça do Império' },
        category: 'parks',
        subcategories: ['garden', 'square'],
        description: {
          en: 'The tiled parterre between Jerónimos and the river.',
          'pt-BR':
            'O jardim de mosaicos entre os Jerónimos e o rio.',
        },
        favorite: true,
        lat: 38.695995,
        lng: -9.205993,
        address: 'Empire Square Garden',
        mapsQuery: 'Praça do Império Lisboa',
      },
      {
        id: 'lis-pasteis-belem',
        name: { en: 'Pastéis de Belém', 'pt-BR': 'Pastéis de Belém' },
        category: 'cafes',
        subcategories: ['pastry'],
        description: {
          en: 'The original pastel de nata factory. Line for takeaway, sit inside if you can.',
          'pt-BR':
            'A fábrica original do pastel de nata. Fila no balcão, sente se conseguir.',
        },
        favorite: true,
        featured: true,
        googleRating: 4.6,
        lat: 38.69751,
        lng: -9.203228,
        address: 'Pastéis de Belém',
        mapsQuery: 'Pastéis de Belém Lisboa',
      },
      {
        id: 'lis-torre-belem',
        name: { en: 'Belém Tower', 'pt-BR': 'Torre de Belém' },
        category: 'tourist',
        subcategories: ['tower', 'monument'],
        landmark: 'monument',
        description: {
          en: 'Manueline fortress in the river. Go early for the light and a shorter queue.',
          'pt-BR':
            'Fortaleza manuelina no rio. Vá cedo pela luz e pela fila menor.',
        },
        googleRating: 4.5,
        favorite: true,
        featured: true,
        lat: 38.691584,
        lng: -9.215977,
        address: 'Belém Tower',
        mapsQuery: 'Torre de Belém Lisboa',
      },
      {
        id: 'lis-maat',
        name: {
          en: 'MAAT',
          'pt-BR': 'MAAT, Museu de Arte, Arquitetura e Tecnologia',
        },
        category: 'tourist',
        subcategories: ['museum', 'architecture'],
        description: {
          en: 'Walk the riverfront in front of the museum even if you skip the ticket.',
          'pt-BR': 'Caminhar na orla em frente ao museu.',
        },
        favorite: true,
        googleRating: 4.3,
        lat: 38.695856,
        lng: -9.193312,
        address: 'MAAT',
        mapsQuery: 'MAAT Lisboa',
      },
      {
        id: 'lis-carmo',
        name: {
          en: 'Carmo Archaeological Museum',
          'pt-BR': 'Museu Arqueológico do Carmo',
        },
        category: 'tourist',
        subcategories: ['museum', 'church'],
        description: {
          en: 'Open-air Gothic nave, ruined by the 1755 earthquake. Still the sky for a roof.',
          'pt-BR':
            'Nave gótica a céu aberto, ruína do terremoto de 1755. O teto ainda é o céu.',
        },
        favorite: true,
        googleRating: 4.5,
        lat: 38.712038,
        lng: -9.140613,
        address: 'Carmo Archaeological Museum',
        mapsQuery: 'Museu Arqueológico do Carmo Lisboa',
      },
      {
        id: 'lis-se',
        name: { en: 'Lisbon Cathedral', 'pt-BR': 'Sé de Lisboa' },
        category: 'tourist',
        subcategories: ['church'],
        description: {
          en: 'Romanesque fortress-church at the foot of Alfama.',
          'pt-BR': 'Sé românica no pé da Alfama.',
        },
        favorite: true,
        googleRating: 4.4,
        lat: 38.709834,
        lng: -9.132953,
        address: 'Lisbon Cathedral',
        mapsQuery: 'Sé de Lisboa',
      },
      {
        id: 'lis-arco-rua-augusta',
        name: { en: 'Rua Augusta Arch', 'pt-BR': 'Arco da Rua Augusta' },
        category: 'photo',
        subcategories: ['monument', 'viewpoint'],
        description: {
          en: 'The triumphal arch onto Praça do Comércio. Elevator to the top for the axis view.',
          'pt-BR':
            'O arco triunfal para a Praça do Comércio. Elevador no topo para o eixo da rua.',
        },
        favorite: true,
        featured: true,
        googleRating: 4.7,
        lat: 38.708445,
        lng: -9.136824,
        address: 'Rua Augusta Arch',
        mapsQuery: 'Arco da Rua Augusta Lisboa',
      },
      {
        id: 'lis-praca-comercio',
        name: { en: 'Praça do Comércio', 'pt-BR': 'Praça do Comércio' },
        category: 'tourist',
        subcategories: ['square'],
        description: {
          en: 'One of the great squares in Europe, on the Tagus, where the royal palace stood before 1755. Yellow arcades, the Rua Augusta arch, José I in the middle, sunset on the river.',
          'pt-BR':
            'Uma das praças mais emblemáticas de Lisboa e uma das maiores da Europa. Localizada à beira do rio Tejo, ela ocupa o espaço do antigo Palácio Real, destruído pelo terremoto de 1755. Com seu impressionante arco da Rua Augusta, edifícios amarelos simétricos e a estátua equestre de D. José I no centro, a praça é um símbolo da reconstrução da cidade e do poderio marítimo português. É um local vibrante, ideal para passeios à beira-rio, cafés históricos e apreciar a vista do pôr do sol.',
        },
        favorite: true,
        featured: true,
        googleRating: 4.7,
        lat: 38.707283,
        lng: -9.136361,
        address: 'Praça do Comércio',
        mapsQuery: 'Praça do Comércio Lisboa',
      },
      {
        id: 'lis-belem',
        name: { en: 'Belém waterfront', 'pt-BR': 'Orla de Belém' },
        category: 'parks',
        subcategories: ['avenue'],
        description: {
          en: 'The river walk that ties Jerónimos, the nata line, the tower, and MAAT.',
          'pt-BR':
            'A orla que liga Jerónimos, a fila dos nata, a torre e o MAAT.',
        },
        googleRating: 4.5,
        favorite: true,
        lat: 38.6979,
        lng: -9.2065,
        address: 'Belém, 1400 Lisboa, Portugal',
        mapsQuery: 'Belém Lisboa orla',
      },
      // —— Maps list: Lisboa (Conhecer), still to visit ——
      {
        id: 'lis-adega-gravatas',
        name: { en: 'Adega das Gravatas', 'pt-BR': 'Adega das Gravatas' },
        category: 'restaurants',
        subcategories: ['seafood'],
        description: {
          en: 'Uber tip: one of the best octopuses in Lisbon.',
          'pt-BR': 'Segundo o Uber, um dos melhores polvos de Lisboa.',
        },
        conhecido: false,
        googleRating: 4.4,
        lat: 38.760493,
        lng: -9.18776,
        address: 'Adega das Gravatas',
        mapsQuery: 'Adega das Gravatas Lisboa',
      },
      {
        id: 'lis-ze-da-mouraria',
        name: { en: 'Zé da Mouraria', 'pt-BR': 'Zé da Mouraria' },
        category: 'restaurants',
        subcategories: ['seafood'],
        description: {
          en: 'Uber tip: the best bacalhau in Lisbon.',
          'pt-BR': 'Segundo o Uber, melhor bacalhau de Lisboa.',
        },
        conhecido: false,
        googleRating: 4.4,
        lat: 38.716111,
        lng: -9.134966,
        address: 'Zé da Mouraria',
        mapsQuery: 'Zé da Mouraria Lisboa',
      },
      {
        id: 'lis-maria-catita',
        name: { en: 'Maria Catita', 'pt-BR': 'Maria Catita' },
        category: 'restaurants',
        description: {
          en: 'Uber recommendation, Baixa side.',
          'pt-BR': 'Indicação do Uber.',
        },
        conhecido: false,
        googleRating: 4.7,
        lat: 38.709283,
        lng: -9.134343,
        address: 'Maria Catita',
        mapsQuery: 'Maria Catita Lisboa',
      },
      {
        id: 'lis-faz-frio',
        name: { en: 'Faz Frio', 'pt-BR': 'Faz Frio' },
        category: 'restaurants',
        description: {
          en: 'Uber recommendation, near Príncipe Real / Bairro Alto.',
          'pt-BR': 'Recomendação Uber.',
        },
        conhecido: false,
        googleRating: 4.3,
        lat: 38.716018,
        lng: -9.146924,
        address: 'Faz Frio',
        mapsQuery: 'Faz Frio Lisboa',
      },
      {
        id: 'lis-atira-te-ao-rio',
        name: { en: 'Atira-te ao Rio', 'pt-BR': 'Atira-te ao Rio' },
        category: 'restaurants',
        description: {
          en: 'Best sunset in Lisbon, Cacilhas side. Book.',
          'pt-BR': 'Melhor pôr do sol de Lisboa. Reservar.',
        },
        conhecido: false,
        googleRating: 4.3,
        lat: 38.685062,
        lng: -9.157351,
        address: 'Atira-te ao Rio',
        mapsQuery: 'Atira-te ao Rio Almada',
      },
      {
        id: 'lis-ponto-final',
        name: { en: 'Ponto Final', 'pt-BR': 'Ponto Final' },
        category: 'restaurants',
        description: {
          en: 'Best sunset in Lisbon, next door to Atira-te ao Rio. Book.',
          'pt-BR': 'Melhor pôr do sol de Lisboa. Fazer reserva.',
        },
        conhecido: false,
        googleRating: 4.3,
        lat: 38.685002,
        lng: -9.157564,
        address: 'Ponto Final',
        mapsQuery: 'Ponto Final Almada',
      },
      {
        id: 'lis-embaixada',
        name: { en: 'EmbaiXada', 'pt-BR': 'EmbaiXada' },
        category: 'shopping',
        subcategories: ['shopping'],
        description: {
          en: 'Concept store in a Príncipe Real palace. Design, clothes, gifts.',
          'pt-BR':
            'Concept store num palácio do Príncipe Real. Design, roupa, presentes.',
        },
        conhecido: false,
        googleRating: 4.4,
        lat: 38.716873,
        lng: -9.148468,
        address: 'EmbaiXada',
        mapsQuery: 'EmbaiXada Lisboa',
      },
      {
        id: 'lis-alfama',
        name: { en: 'Alfama', 'pt-BR': 'Alfama' },
        category: 'tourist',
        subcategories: ['neighborhood'],
        description: {
          en: 'Miradouros, tile walls, and wandering without a plan.',
          'pt-BR': 'Miradouros, azulejos e caminhar sem plano.',
        },
        conhecido: false,
        lat: 38.712498,
        lng: -9.130323,
        address: 'Alfama, 1100 Lisboa, Portugal',
        mapsQuery: 'Alfama Lisboa',
      },
      {
        id: 'lis-miradouro-senhora-monte',
        name: {
          en: 'Miradouro da Senhora do Monte',
          'pt-BR': 'Miradouro da Senhora do Monte',
        },
        category: 'photo',
        subcategories: ['viewpoint'],
        description: {
          en: 'Graça’s wide view over the castle and the river. Sunset magnet.',
          'pt-BR':
            'A vista larga da Graça sobre o castelo e o rio. Imã de pôr do sol.',
        },
        conhecido: false,
        googleRating: 4.8,
        lat: 38.719209,
        lng: -9.132777,
        address: 'Miradouro da Senhora do Monte',
        mapsQuery: 'Miradouro da Senhora do Monte Lisboa',
      },
      {
        id: 'lis-pastel-bacalhau',
        name: {
          en: 'Casa Portuguesa do Pastel de Bacalhau',
          'pt-BR': 'Casa Portuguesa do Pastel de Bacalhau',
        },
        category: 'restaurants',
        subcategories: ['seafood'],
        description: {
          en: 'The famous codfish cake with Serra cheese, on Rua Augusta.',
          'pt-BR':
            'O pastel de bacalhau com queijo da Serra, na Rua Augusta.',
        },
        conhecido: false,
        googleRating: 4.1,
        lat: 38.710248,
        lng: -9.137453,
        address: 'Casa Portuguesa do Pastel de Bacalhau',
        mapsQuery: 'Casa Portuguesa do Pastel de Bacalhau Lisboa',
      },
      {
        id: 'lis-laurentina',
        name: { en: 'Laurentina', 'pt-BR': 'Laurentina' },
        category: 'restaurants',
        subcategories: ['seafood'],
        description: {
          en: 'Octopus in cream and octopus salad.',
          'pt-BR': 'Polvo na nata e salada de polvo.',
        },
        conhecido: false,
        googleRating: 4.5,
        lat: 38.737155,
        lng: -9.151343,
        address: 'Laurentina',
        mapsQuery: 'Laurentina Lisboa',
      },
      {
        id: 'lis-tasquinha-lagarto',
        name: { en: 'Tasquinha do Lagarto', 'pt-BR': 'Tasquinha do Lagarto' },
        category: 'restaurants',
        description: {
          en: 'Old-school tasca. Still on the list to try.',
          'pt-BR': 'Tasca clássica. Ainda na lista para conhecer.',
        },
        conhecido: false,
        googleRating: 4.6,
        lat: 38.734505,
        lng: -9.16463,
        address: 'Tasquinha do Lagarto',
        mapsQuery: 'Tasquinha do Lagarto Lisboa',
      },
      {
        id: 'lis-as-colunas',
        name: { en: 'As Colunas', 'pt-BR': 'As Colunas' },
        category: 'restaurants',
        description: {
          en: 'Still to visit. West of the center.',
          'pt-BR': 'Ainda para conhecer. A oeste do centro.',
        },
        conhecido: false,
        googleRating: 4.4,
        lat: 38.756738,
        lng: -9.221972,
        address: 'As Colunas',
        mapsQuery: 'As Colunas Lisboa',
      },
      {
        id: 'lis-adega-saraiva',
        name: { en: 'Adega do Saraiva', 'pt-BR': 'Adega do Saraiva' },
        category: 'restaurants',
        subcategories: ['seafood'],
        description: {
          en: 'Further out (Sintra / Cascais side). Still to visit.',
          'pt-BR': 'Mais longe (lado Sintra / Cascais). Ainda para conhecer.',
        },
        conhecido: false,
        googleRating: 4.5,
        lat: 38.815104,
        lng: -9.42406,
        address: 'Adega do Saraiva',
        mapsQuery: 'Adega do Saraiva',
      },
      {
        id: 'lis-imperial-campo-ourique',
        name: {
          en: 'Imperial de Campo de Ourique',
          'pt-BR': 'Imperial de Campo de Ourique',
        },
        category: 'restaurants',
        description: {
          en: 'Neighborhood restaurant in Campo de Ourique. Still to visit.',
          'pt-BR':
            'Restaurante de bairro em Campo de Ourique. Ainda para conhecer.',
        },
        conhecido: false,
        googleRating: 4.7,
        lat: 38.719144,
        lng: -9.16826,
        address: 'Imperial de Campo de Ourique',
        mapsQuery: 'Imperial de Campo de Ourique Lisboa',
      },
      {
        id: 'lis-floresta-salitre',
        name: { en: 'Floresta do Salitre', 'pt-BR': 'Floresta do Salitre' },
        category: 'restaurants',
        description: {
          en: 'Still to visit, near Avenida da Liberdade.',
          'pt-BR': 'Ainda para conhecer, perto da Avenida da Liberdade.',
        },
        conhecido: false,
        googleRating: 4.4,
        lat: 38.719818,
        lng: -9.146519,
        address: 'Floresta do Salitre',
        mapsQuery: 'Floresta do Salitre Lisboa',
      },
      {
        id: 'lis-casa-bacalhau',
        name: {
          en: 'A Casa do Bacalhau',
          'pt-BR': 'A Casa do Bacalhau',
        },
        category: 'restaurants',
        subcategories: ['seafood'],
        description: {
          en: 'The Codfish House. Still to visit.',
          'pt-BR': 'A Casa do Bacalhau. Ainda para conhecer.',
        },
        conhecido: false,
        googleRating: 4.6,
        lat: 38.732208,
        lng: -9.106445,
        address: 'A Casa do Bacalhau',
        mapsQuery: 'A Casa do Bacalhau Lisboa',
      },
      {
        id: 'lis-velho-eurico',
        name: { en: 'O Velho Eurico', 'pt-BR': 'O Velho Eurico' },
        category: 'restaurants',
        description: {
          en: 'Mouraria tasca. Still to visit.',
          'pt-BR': 'Tasca na Mouraria. Ainda para conhecer.',
        },
        conhecido: false,
        googleRating: 4.4,
        lat: 38.712736,
        lng: -9.135378,
        address: 'O Velho Eurico',
        mapsQuery: 'O Velho Eurico Lisboa',
      },
      {
        id: 'lis-estadio-benfica',
        name: {
          en: 'Estádio da Luz',
          'pt-BR': 'Estádio do Sport Lisboa e Benfica',
        },
        category: 'tourist',
        description: {
          en: 'Benfica’s stadium. Match day or the museum if the pitch is empty.',
          'pt-BR':
            'Estádio do Benfica. Dia de jogo, ou o museu se o campo estiver vazio.',
        },
        conhecido: false,
        googleRating: 4.7,
        lat: 38.75269,
        lng: -9.184692,
        address: 'Estádio da Luz',
        mapsQuery: 'Estádio da Luz Benfica Lisboa',
      },
      {
        id: 'lis-terraco-editorial',
        name: { en: 'Terraço Editorial', 'pt-BR': 'Terraço Editorial' },
        category: 'restaurants',
        description: {
          en: 'Lunch. Still to visit.',
          'pt-BR': 'Almoço. Ainda para conhecer.',
        },
        conhecido: false,
        googleRating: 4.4,
        lat: 38.712754,
        lng: -9.136665,
        address: 'Terraço Editorial',
        mapsQuery: 'Terraço Editorial Lisboa',
      },
      {
        id: 'lis-baixa-chiado',
        name: { en: 'Baixa-Chiado', 'pt-BR': 'Baixa-Chiado' },
        category: 'tourist',
        subcategories: ['neighborhood'],
        description: {
          en: 'The downhill / uphill pair: grid of Baixa and the Chiado hill.',
          'pt-BR':
            'A dupla: a malha da Baixa e a colina do Chiado.',
        },
        conhecido: false,
        googleRating: 4.2,
        lat: 38.710539,
        lng: -9.142084,
        address: 'Baixa-Chiado',
        mapsQuery: 'Baixa-Chiado Lisboa',
      },
      // —— Stay ——
      {
        id: 'lis-whome-bairro-alto',
        name: {
          en: 'WHome Modern Retreat',
          'pt-BR': 'WHome Modern Retreat',
        },
        category: 'lodging',
        subcategories: ['hotel'],
        description: {
          en: '60 m² 1-bedroom apartment on Rua da Barroca, 2nd floor, no lift. Heart of Bairro Alto — walk to Chiado, Rossio and Cais do Sodré.',
          'pt-BR':
            'Apartamento de 60 m², 1 quarto, na Rua da Barroca, 2.º andar sem elevador. No meio do Bairro Alto — a pé para o Chiado, o Rossio e o Cais do Sodré.',
        },
        lat: 38.71113,
        lng: -9.14457,
        address: 'Rua da Barroca 11, 2.º E, 1200-047 Lisboa, Portugal',
        mapsQuery: 'Rua da Barroca 11 Lisboa',
      },
    ],
  },
  {
    slug: 'porto',
    name: { en: 'Porto', 'pt-BR': 'Porto' },
    country: { en: 'Portugal', 'pt-BR': 'Portugal' },
    countryKey: 'portugal',
    lat: 41.1579,
    lng: -8.6291,
    zoom: 13,
    places: [
      {
        id: 'porto-opo',
        name: {
          en: 'Francisco Sá Carneiro Airport (OPO)',
          'pt-BR': 'Aeroporto Francisco Sá Carneiro (OPO)',
        },
        category: 'airport',
        description: {
          en: 'Porto’s airport, metro ride into the city.',
          'pt-BR': 'Aeroporto do Porto, com metro até o centro.',
        },
        googleRating: 4.4,
        lat: 41.2421,
        lng: -8.6785,
        address: 'Pedras Rubras, 4470-558 Maia, Portugal',
        mapsQuery: 'Aeroporto Francisco Sá Carneiro Porto OPO',
      },
      {
        id: 'porto-ribeira',
        name: { en: 'Ribeira', 'pt-BR': 'Ribeira' },
        category: 'tourist',
        description: {
          en: 'Riverfront postcard: colorful façades and wine caves across the Douro.',
          'pt-BR': 'Postal do rio: fachadas coloridas e caves de vinho do outro lado do Douro.',
        },
        googleRating: 4.8,
        lat: 41.1406,
        lng: -8.611,
        area: {
          kind: 'polyline',
          path: [
            [41.1435, -8.616],
            [41.142, -8.6135],
            [41.1406, -8.611],
            [41.1395, -8.609],
            [41.1385, -8.607],
          ],
        },
        address: 'Ribeira, 4050 Porto, Portugal',
        mapsQuery: 'Cais da Ribeira Porto',
      },
      {
        id: 'porto-livraria',
        name: {
          en: 'Livraria Lello',
          'pt-BR': 'Livraria Lello',
        },
        category: 'tourist',
        description: {
          en: 'Theatrical bookstore. Buy tickets ahead if you can.',
          'pt-BR': 'Livraria teatral. Compre ingresso com antecedência se puder.',
        },
        googleRating: 4.0,
        lat: 41.1469,
        lng: -8.6148,
        address: 'R. das Carmelitas 144, 4050-161 Porto, Portugal',
        mapsQuery: 'Livraria Lello Porto',
      },
      {
        id: 'porto-francesinha',
        name: {
          en: 'Francesinha stop',
          'pt-BR': 'Parada da francesinha',
        },
        category: 'restaurants',
        description: {
          en: 'The city’s heavyweight sandwich. Share it. Trust me.',
          'pt-BR': 'O sanduíche pesado da cidade. Divida. Confia.',
        },
        googleRating: 4.4,
        lat: 41.1496,
        lng: -8.6109,
        address: 'R. de Passos Manuel 226, 4000-382 Porto, Portugal',
        mapsQuery: 'Café Santiago Francesinha Porto',
      },
    ],
  },
];

/** Cities with Notion editorial places merged in (Notion wins on same `id`). */
export const travelCities: TravelCity[] = mergeNotionPlaces(localTravelCities);

export function getTravelCity(slug: string): TravelCity | undefined {
  return travelCities.find((c) => c.slug === slug);
}

/**
 * Resolve map geometry for a place.
 *
 * Priority:
 * 1. OpenStreetMap outlines in `travel-areas-osm.ts` (always win, once that module is loaded)
 * 2. Authored `place.area` in this file (fallback / metro waypoint spines)
 *
 * Policy (enforced by `travel-areas.test.ts` + `npm run travel:areas`):
 * - Do NOT invent 2–3 point street polylines — fetch OSM LineStrings instead.
 * - Do NOT ship `areaBox()` scaffolds without an OSM override.
 * - Metro / multi-stop walks may keep dense authored polylines
 *   (see ROUTE_WAYPOINT_AREA_IDS in travel-areas-policy.ts).
 *
 * Regenerate OSM registry: `npm run travel:areas`
 */
export function resolvePlaceArea(place: TravelPlace): TravelArea | undefined {
  const osm = osmAreaFor(place.id);
  if (!osm) return place.area;
  // Normalize OSM multipolygon/polygon/polyline into TravelArea
  if (osm.kind === 'multipolygon') {
    return { kind: 'multipolygon', paths: osm.paths as LatLngPoint[][] };
  }
  return {
    kind: osm.kind,
    path: osm.path as LatLngPoint[],
  };
}

/**
 * Gallery for a place card / slider.
 *
 * Merge local registry (`travel-photos.ts`) with Notion/authored photos:
 * - Prefer the longer list’s order as base (registry preferred on tie)
 * - Always append unique URLs from the other source (never drop covers)
 * - Notion-only covers survive even when the registry is shorter
 */
export function resolvePlacePhotos(
  placeId: string,
  authored?: TravelPhoto[] | null,
): TravelPhoto[] | undefined {
  const registry = photosForPlaceId(placeId);
  const fromAuthored =
    authored && authored.length > 0 ? authored : undefined;
  const fromRegistry =
    registry && registry.length > 0 ? registry : undefined;

  if (fromRegistry && fromAuthored) {
    const preferRegistry = fromRegistry.length >= fromAuthored.length;
    const primary = preferRegistry ? fromRegistry : fromAuthored;
    const secondary = preferRegistry ? fromAuthored : fromRegistry;
    const seen = new Set(primary.map((p) => p.url));
    const merged = [...primary];
    for (const photo of secondary) {
      if (!seen.has(photo.url)) {
        merged.push(photo);
        seen.add(photo.url);
      }
    }
    return merged;
  }
  return fromRegistry ?? fromAuthored;
}

/** Place with OSM area + visit meta + gallery photos + subcategories merged in. */
export function withResolvedArea(place: TravelPlace): TravelPlace {
  const area = resolvePlaceArea(place);
  const visit = resolveVisit(place.id, place.visit);
  const photos = resolvePlacePhotos(place.id, place.photos);
  const subcategories = resolvePlaceSubcategories(
    place.id,
    place.subcategories,
  );
  return {
    ...place,
    ...(area ? { area } : {}),
    ...(visit ? { visit } : {}),
    ...(photos ? { photos } : {}),
    ...(subcategories.length > 0 ? { subcategories } : {}),
  };
}

/**
 * Personal favorites in a city — prefer these when building itineraries
 * (LLM prompts, curated routes, etc.).
 */
export function favoritePlaces(city: TravelCity): TravelPlace[] {
  return city.places.filter((p) => p.favorite);
}

/** Place ids marked favorite in a city (stable order as in `city.places`). */
export function favoritePlaceIds(city: TravelCity): string[] {
  return favoritePlaces(city).map((p) => p.id);
}

/** Display line: "São Paulo, SP · Brasil" */
export function formatCityMeta(city: TravelCity, locale: Locale = 'en'): string {
  const title = city.region
    ? `${city.name[locale]}, ${city.region}`
    : city.name[locale];
  return `${title} · ${city.country[locale]}`;
}

/** Search input placeholder with place total for the city page. */
export function searchPlacesPlaceholder(count: number): LString {
  return {
    en: `Search among ${count} places…`,
    'pt-BR': `Buscar entre ${count} lugares…`,
  };
}

/** Clamp to 0–5 with one decimal (Google Maps style). Halves still work for personal notes. */
export function clampRating(rating: number): number {
  return Math.min(5, Math.max(0, Math.round(rating * 10) / 10));
}

export function pickLocale(locale: Locale, value: LString): string {
  return value[locale] ?? value.en;
}

/**
 * Resolve a Google Maps deep link for a place.
 * Priority: mapsUrl → placeId → mapsQuery / address → name+city → lat,lng pin.
 */
export function googleMapsUrl(place: TravelPlace, city?: TravelCity): string {
  if (place.mapsUrl) return place.mapsUrl;

  if (place.placeId) {
    const q = place.mapsQuery || place.address || place.name.en;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}&query_place_id=${encodeURIComponent(place.placeId)}`;
  }

  const cityBit = city
    ? [city.name.en, city.region, city.country.en].filter(Boolean).join(', ')
    : '';

  const query =
    place.mapsQuery ||
    place.address ||
    (cityBit ? `${place.name.en}, ${cityBit}` : place.name.en);

  if (query) {
    // Search query keeps the place entity when Google knows it;
    // coords as secondary anchor via the @ form when useful.
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`;
}

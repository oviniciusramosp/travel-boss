/**
 * Editorial stay heatmap: neighborhoods scored for safety + value.
 *
 * Not live crime GIS. Scores synthesize 2025–2026 travel guides, local
 * reporting, and first-timer consensus. Safety is weighted above price.
 *
 * Rome: Monti/Prati/Testaccio consensus; Termini–Esquilino (Via Giolitti /
 * Turati) as the caution pocket; Centro Storico safe but expensive.
 * Lisbon: Chiado/Príncipe Real/Estrela as safe bases; Campo de Ourique for
 * value; Martim Moniz / Intendente / Bairro Alto as mixed-night pockets.
 */

import type { LString } from './travel';
import stayPolygonsJson from './travel-stay-polygons.json';
import romeBoundaries from './rome-hotel-boundaries.json';

/** Safety weight is higher than value (user brief: safety first, then deal). */
export const STAY_SAFETY_WEIGHT = 0.55;
export const STAY_VALUE_WEIGHT = 0.45;
/** Heatmap blobs use caution red when safety is below this. */
export const STAY_SAFETY_CAUTION = 70;
/** Overall at/above this (and safe enough) paints as “best”. */
export const STAY_HEAT_BEST_MIN = 78;

export type StayHeatBand = 'best' | 'mixed' | 'caution' | 'unknown';

/** New regions have safety evidence only: do not invent a value-for-money score. */
export function staySafetyBand(safety: number | null): StayHeatBand {
  if (safety == null) return 'unknown';
  if (safety < STAY_SAFETY_CAUTION) return 'caution';
  return safety >= STAY_HEAT_BEST_MIN ? 'best' : 'mixed';
}

export function stayHeatBand(z: StayZone): StayHeatBand {
  if (z.safety < STAY_SAFETY_CAUTION) return 'caution';
  if (z.overall >= STAY_HEAT_BEST_MIN) return 'best';
  return 'mixed';
}

export function stayOverall(safety: number, value: number): number {
  return Math.round(STAY_SAFETY_WEIGHT * safety + STAY_VALUE_WEIGHT * value);
}

export type StayZone = {
  id: string;
  citySlug: string;
  name: LString;
  note: LString;
  /** 0–100. Petty theft, night comfort, scam pressure. */
  safety: number;
  /** 0–100. Price vs location (not raw cheapness). */
  value: number;
  /** Derived: 55% safety + 45% value. */
  overall: number;
  lat: number;
  lng: number;
  /** Fallback search radius (meters) if the polygon is missing. */
  radiusM: number;
};

export type StayLatLng = [number, number];

export const STAY_HEAT_RGB: Record<StayHeatBand, [number, number, number]> = {
  best: [46, 196, 138],
  mixed: [232, 168, 56],
  caution: [214, 72, 64],
  unknown: [148, 163, 184],
};

type StayPolyJson = Record<string, StayLatLng[] | StayLatLng[][]>;

export function stayZonePolygons(id: string): StayLatLng[][][] {
  const editorial = (romeBoundaries as unknown as {editorialZones?: Record<string, {polygons: StayLatLng[][][]}>}).editorialZones?.[id];
  if (editorial) return editorial.polygons;
  const raw = (stayPolygonsJson as unknown as StayPolyJson)[id];
  if (!raw?.length) return [];
  const rings = typeof raw[0]?.[0] === 'number' ? [raw as StayLatLng[]] : raw as StayLatLng[][];
  return rings.filter(r => r.length >= 4).map(r => [r]);
}

export function stayZoneRings(id: string): StayLatLng[][] {
  return stayZonePolygons(id).map(p => p[0]);
}

export const stayHeatUi = {
  show: {
    en: 'Show where to stay',
    'pt-BR': 'Mostrar onde ficar',
  } satisfies LString,
  hide: {
    en: 'Hide stay heatmap',
    'pt-BR': 'Ocultar mapa de hospedagem',
  } satisfies LString,
  legendTitle: {
    en: 'Where to stay',
    'pt-BR': 'Onde ficar',
  } satisfies LString,
  best: { en: 'Best', 'pt-BR': 'Melhor' } satisfies LString,
  mixed: { en: 'Mixed', 'pt-BR': 'Misto' } satisfies LString,
  caution: { en: 'Caution', 'pt-BR': 'Cuidado' } satisfies LString,
  unknown: { en: 'No conclusive score', 'pt-BR': 'Sem nota conclusiva' } satisfies LString,
  hint: {
    en: 'Tap a color to show or hide',
    'pt-BR': 'Toque numa cor para mostrar ou ocultar',
  } satisfies LString,
  safety: { en: 'Safety', 'pt-BR': 'Segurança' } satisfies LString,
  value: { en: 'Value', 'pt-BR': 'Custo-benefício' } satisfies LString,
  airbnb: { en: 'Airbnb', 'pt-BR': 'Airbnb' } satisfies LString,
  booking: { en: 'Booking', 'pt-BR': 'Booking' } satisfies LString,
  datesAsk: {
    en: 'When are you going?',
    'pt-BR': 'Quais as datas da viagem?',
  } satisfies LString,
  checkin: { en: 'Check-in', 'pt-BR': 'Check-in' } satisfies LString,
  checkout: { en: 'Check-out', 'pt-BR': 'Check-out' } satisfies LString,
  datesSave: { en: 'Save dates', 'pt-BR': 'Guardar datas' } satisfies LString,
  datesContinue: { en: 'Continue', 'pt-BR': 'Continuar' } satisfies LString,
  datesEdit: { en: 'Edit dates', 'pt-BR': 'Alterar datas' } satisfies LString,
};

export type StayTripDates = { checkin: string; checkout: string };

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function validStayTripDates(
  d: StayTripDates | null | undefined,
): d is StayTripDates {
  if (!d || !ISO_DATE.test(d.checkin) || !ISO_DATE.test(d.checkout)) return false;
  return d.checkout > d.checkin;
}

const CITY_SEARCH: Record<string, LString> = {
  roma: { en: 'Rome', 'pt-BR': 'Roma' },
  lisboa: { en: 'Lisbon', 'pt-BR': 'Lisboa' },
};

function citySearchName(slug: string, locale: keyof LString): string {
  return CITY_SEARCH[slug]?.[locale] ?? slug;
}

export function zoneBbox(z: StayZone): {
  north: number;
  south: number;
  east: number;
  west: number;
} {
  const rings = stayZoneRings(z.id);
  if (rings.length) {
    let north = -Infinity;
    let south = Infinity;
    let east = -Infinity;
    let west = Infinity;
    for (const ring of rings) {
      for (const [lat, lng] of ring) {
        if (lat > north) north = lat;
        if (lat < south) south = lat;
        if (lng > east) east = lng;
        if (lng < west) west = lng;
      }
    }
    const padLat = 80 / 111_320;
    const padLng =
      80 / (111_320 * Math.max(Math.cos((z.lat * Math.PI) / 180), 0.2));
    return {
      north: north + padLat,
      south: south - padLat,
      east: east + padLng,
      west: west - padLng,
    };
  }
  const pad = z.radiusM * 1.15;
  const dLat = pad / 111_320;
  const dLng = pad / (111_320 * Math.max(Math.cos((z.lat * Math.PI) / 180), 0.2));
  return {
    north: z.lat + dLat,
    south: z.lat - dLat,
    east: z.lng + dLng,
    west: z.lng - dLng,
  };
}

function searchQuery(z: StayZone, locale: keyof LString): string {
  return `${z.name[locale]}, ${citySearchName(z.citySlug, locale)}`;
}

/** Airbnb search: this neighborhood, Superhost + Guest favourite. */
export function stayAirbnbUrl(
  z: StayZone,
  locale: keyof LString,
  dates?: StayTripDates | null,
): string {
  const box = zoneBbox(z);
  const host = locale === 'pt-BR' ? 'https://www.airbnb.com.br' : 'https://www.airbnb.com';
  const params = new URLSearchParams();
  params.set('query', searchQuery(z, locale));
  params.set('search_type', 'user_map_move');
  params.set('search_by_map', 'true');
  params.set('tab_id', 'home_tab');
  params.set('ne_lat', box.north.toFixed(5));
  params.set('ne_lng', box.east.toFixed(5));
  params.set('sw_lat', box.south.toFixed(5));
  params.set('sw_lng', box.west.toFixed(5));
  params.set('superhost', 'true');
  params.set('guest_favorite', 'true');
  params.append('refinement_paths[]', '/homes');
  if (validStayTripDates(dates)) {
    params.set('checkin', dates.checkin);
    params.set('checkout', dates.checkout);
  }
  return `${host}/s/homes?${params.toString()}`;
}

/** Booking.com search: this neighborhood, review score 9+ ("Wonderful"), top reviewed. */
export function stayBookingUrl(
  z: StayZone,
  locale: keyof LString,
  dates?: StayTripDates | null,
): string {
  const box = zoneBbox(z);
  const lang = locale === 'pt-BR' ? 'pt-br' : 'en-gb';
  const page =
    locale === 'pt-BR' ? 'searchresults.pt-br.html' : 'searchresults.en-gb.html';
  const params = new URLSearchParams({
    ss: searchQuery(z, locale),
    latitude: z.lat.toFixed(5),
    longitude: z.lng.toFixed(5),
    nflt: 'review_score=90',
    order: 'bayesian_review_score',
    selected_currency: 'EUR',
    lang,
    bounding_box_north: box.north.toFixed(5),
    bounding_box_south: box.south.toFixed(5),
    bounding_box_east: box.east.toFixed(5),
    bounding_box_west: box.west.toFixed(5),
  });
  if (validStayTripDates(dates)) {
    params.set('checkin', dates.checkin);
    params.set('checkout', dates.checkout);
  }
  return `https://www.booking.com/${page}?${params.toString()}`;
}

function zone(
  partial: Omit<StayZone, 'overall'>,
): StayZone {
  const anchor = (romeBoundaries as unknown as {editorialZones?: Record<string, {lat: number; lng: number}>}).editorialZones?.[partial.id];
  return { ...partial, ...(anchor ? {lat: anchor.lat, lng: anchor.lng} : {}), overall: stayOverall(partial.safety, partial.value) };
}

const ROME: StayZone[] = [
  zone({
    id: 'roma-monti',
    citySlug: 'roma',
    name: { en: 'Monti', 'pt-BR': 'Monti' },
    note: {
      en: 'Best all-rounder: local hill next to the Colosseum, quieter and better priced than the historic center.',
      'pt-BR':
        'Melhor equilíbrio: bairro local ao lado do Coliseu, mais calmo e barato que o centro histórico.',
    },
    safety: 88,
    value: 90,
    lat: 41.895,
    lng: 12.4915,
    radiusM: 550,
  }),
  zone({
    id: 'roma-prati',
    citySlug: 'roma',
    name: { en: 'Prati', 'pt-BR': 'Prati' },
    note: {
      en: 'Very safe, wide streets, metro to the center. Strong for the Vatican; a bit less walkable to ancient Rome.',
      'pt-BR':
        'Muito seguro, ruas largas, metrô até o centro. Ótimo para o Vaticano; um pouco menos a pé até a Roma antiga.',
    },
    safety: 92,
    value: 80,
    lat: 41.9086,
    lng: 12.466,
    radiusM: 850,
  }),
  zone({
    id: 'roma-testaccio',
    citySlug: 'roma',
    name: { en: 'Testaccio', 'pt-BR': 'Testaccio' },
    note: {
      en: 'Food neighborhood, residential, good prices. 15–20 min to the center; quieter nights than Trastevere.',
      'pt-BR':
        'Bairro de comida, residencial, bom preço. 15–20 min até o centro; noites mais calmas que Trastevere.',
    },
    safety: 86,
    value: 90,
    lat: 41.8765,
    lng: 12.4755,
    radiusM: 600,
  }),
  zone({
    id: 'roma-san-giovanni',
    citySlug: 'roma',
    name: { en: 'San Giovanni', 'pt-BR': 'San Giovanni' },
    note: {
      en: 'Residential, Metro A, near the basilica. Solid value without the Termini station chaos.',
      'pt-BR':
        'Residencial, Metro A, perto da basílica. Bom custo-benefício sem a bagunça da Termini.',
    },
    safety: 84,
    value: 86,
    lat: 41.8855,
    lng: 12.509,
    radiusM: 650,
  }),
  zone({
    id: 'roma-garbatella',
    citySlug: 'roma',
    name: { en: 'Garbatella', 'pt-BR': 'Garbatella' },
    note: {
      en: 'Garden-suburb streets, metro, better prices. Further out; best if you like a local base.',
      'pt-BR':
        'Ruas de subúrbio-jardim, metrô, preços melhores. Mais longe; bom se você quer uma base local.',
    },
    safety: 80,
    value: 88,
    lat: 41.863,
    lng: 12.4825,
    radiusM: 700,
  }),
  zone({
    id: 'roma-aventino',
    citySlug: 'roma',
    name: { en: 'Aventine', 'pt-BR': 'Aventino' },
    note: {
      en: 'Quiet, very safe, leafy. Fewer hotels and nightlife; a calm base next to the Circus Maximus.',
      'pt-BR':
        'Quieto, muito seguro, arborizado. Poucos hotéis e vida noturna; base calma ao lado do Circo Máximo.',
    },
    safety: 93,
    value: 68,
    lat: 41.8837,
    lng: 12.4794,
    radiusM: 500,
  }),
  zone({
    id: 'roma-celio',
    citySlug: 'roma',
    name: { en: 'Celio', 'pt-BR': 'Célio' },
    note: {
      en: 'Next to the Colosseum without Monti’s buzz. Safe, a bit fewer restaurants.',
      'pt-BR':
        'Ao lado do Coliseu, sem o movimento de Monti. Seguro, com um pouco menos de restaurantes.',
    },
    safety: 84,
    value: 78,
    lat: 41.8855,
    lng: 12.495,
    radiusM: 450,
  }),
  zone({
    id: 'roma-borgo',
    citySlug: 'roma',
    name: { en: 'Borgo / Vatican', 'pt-BR': 'Borgo / Vaticano' },
    note: {
      en: 'Handy for St Peter’s. Tourist-priced and quieter at night once the basilica closes.',
      'pt-BR':
        'Prático para São Pedro. Preço de turista e mais vazio à noite quando a basílica fecha.',
    },
    safety: 82,
    value: 62,
    lat: 41.9039,
    lng: 12.4605,
    radiusM: 500,
  }),
  zone({
    id: 'roma-trastevere',
    citySlug: 'roma',
    name: { en: 'Trastevere', 'pt-BR': 'Trastevere' },
    note: {
      en: 'Beautiful nights out, also noisy. Watch bags after midnight; not the cheapest sleep.',
      'pt-BR':
        'Noites bonitas para sair, e barulhentas. Cuidado com bolsas depois da meia-noite; não é o sono mais barato.',
    },
    safety: 72,
    value: 70,
    lat: 41.8895,
    lng: 12.4695,
    radiusM: 700,
  }),
  zone({
    id: 'roma-campo-marzio',
    citySlug: 'roma',
    name: { en: 'Spanish Steps', 'pt-BR': 'Piazza di Spagna' },
    note: {
      en: 'Safe and walkable to everything. Hotel prices are the penalty.',
      'pt-BR':
        'Seguro e a pé para quase tudo. O preço do hotel é a penalidade.',
    },
    safety: 82,
    value: 50,
    lat: 41.9056,
    lng: 12.4822,
    radiusM: 550,
  }),
  zone({
    id: 'roma-corso-trevi',
    citySlug: 'roma',
    name: { en: 'Colonna / Trevi', 'pt-BR': 'Colonna / Trevi' },
    note: {
      en: 'Via del Corso, Piazza Colonna and Trevi. Central and walkable; crowded, pricey, pickpockets on the fountain.',
      'pt-BR':
        'Via del Corso, Piazza Colonna e Fontana di Trevi. Central e a pé; cheio, caro, carteiristas na fonte.',
    },
    safety: 76,
    value: 48,
    lat: 41.9009,
    lng: 12.4833,
    radiusM: 550,
  }),
  zone({
    id: 'roma-ghetto',
    citySlug: 'roma',
    name: { en: 'Jewish Ghetto', 'pt-BR': 'Gueto' },
    note: {
      en: 'Sant’Angelo around the Turtle Fountain. Atmospheric, denser at night; better as dinner than a first-timer base.',
      'pt-BR':
        'Sant’Angelo, em volta da Fontana das Tartarugas. Com clima, mais fechado à noite; melhor para jantar do que como base na primeira visita.',
    },
    safety: 74,
    value: 68,
    lat: 41.8938,
    lng: 12.4776,
    radiusM: 350,
  }),
  zone({
    id: 'roma-ponte-regola',
    citySlug: 'roma',
    name: { en: 'Via Giulia / Campo de’ Fiori', 'pt-BR': 'Via Giulia / Campo de’ Fiori' },
    note: {
      en: 'Ponte, Parione and Regola: San Simeone, Via Giulia, Palazzo Spada. Central, pretty, tourist-priced.',
      'pt-BR':
        'Ponte, Parione e Regola: San Simeone, Via Giulia, Palazzo Spada. Central, bonito, preço de turista.',
    },
    safety: 76,
    value: 54,
    lat: 41.8972,
    lng: 12.4704,
    radiusM: 550,
  }),
  zone({
    id: 'roma-esquilino',
    citySlug: 'roma',
    name: { en: 'Esquilino', 'pt-BR': 'Esquilino' },
    note: {
      en: 'Cheap and central. Petty theft rises toward Termini and Piazza Vittorio at night.',
      'pt-BR':
        'Barato e central. Furto aumenta perto da Termini e da Piazza Vittorio à noite.',
    },
    safety: 58,
    value: 82,
    lat: 41.8955,
    lng: 12.5035,
    radiusM: 600,
  }),
  zone({
    id: 'roma-centro',
    citySlug: 'roma',
    name: { en: 'Historic center', 'pt-BR': 'Centro histórico' },
    note: {
      en: 'Pantheon / Navona: you walk everywhere. Expensive, crowded, pickpockets on the squares.',
      'pt-BR':
        'Panteão / Navona: você anda para tudo. Caro, cheio, carteiristas nas praças.',
    },
    safety: 78,
    value: 52,
    lat: 41.8986,
    lng: 12.4768,
    radiusM: 650,
  }),
  zone({
    id: 'roma-termini',
    citySlug: 'roma',
    name: { en: 'Termini east', 'pt-BR': 'Termini leste' },
    note: {
      en: 'Approximate Giolitti/Turati editorial corridor, not all Castro Pretorio. Cheapest beds cluster here. Via Giolitti / Turati is the pickpocket and scam pocket. Skip for a first stay.',
      'pt-BR':
        'Faixa editorial aproximada de Giolitti/Turati, não todo Castro Pretorio. As camas mais baratas ficam aqui. Via Giolitti / Turati é o foco de carteiristas e golpes. Evite na primeira estadia.',
    },
    safety: 48,
    value: 78,
    lat: 41.8992,
    lng: 12.5065,
    radiusM: 380,
  }),
];

const LISBON: StayZone[] = [
  zone({
    id: 'lisboa-campo-de-ourique',
    citySlug: 'lisboa',
    name: { en: 'Campo de Ourique', 'pt-BR': 'Campo de Ourique' },
    note: {
      en: 'Local grid, market, tram 28. Safe and fairly priced; not a postcard doorstep.',
      'pt-BR':
        'Malha local, mercado, elétrico 28. Seguro e com preço justo; não é a porta do postal.',
    },
    safety: 88,
    value: 86,
    lat: 38.7165,
    lng: -9.1665,
    radiusM: 650,
  }),
  zone({
    id: 'lisboa-estrela',
    citySlug: 'lisboa',
    name: { en: 'Estrela & Lapa', 'pt-BR': 'Estrela e Lapa' },
    note: {
      en: 'Quiet, embassy-side, very safe. 15 min downhill to the river; strong mid-range hotels.',
      'pt-BR':
        'Quieto, lado das embaixadas, muito seguro. 15 min descendo até o rio; bons hotéis intermediários.',
    },
    safety: 90,
    value: 82,
    lat: 38.712,
    lng: -9.16,
    radiusM: 700,
  }),
  zone({
    id: 'lisboa-avenidas-novas',
    citySlug: 'lisboa',
    name: { en: 'Saldanha / Avenidas Novas', 'pt-BR': 'Saldanha / Avenidas Novas' },
    note: {
      en: 'Metro, modern hotels, wide avenues. Safe business grid with better rates than Chiado.',
      'pt-BR':
        'Metrô, hotéis modernos, avenidas largas. Grade segura de negócios, mais barata que o Chiado.',
    },
    safety: 90,
    value: 82,
    lat: 38.7347,
    lng: -9.1452,
    radiusM: 800,
  }),
  zone({
    id: 'lisboa-santos',
    citySlug: 'lisboa',
    name: { en: 'Santos', 'pt-BR': 'Santos' },
    note: {
      en: 'Between the river and Estrela. Local, walkable, better value than Chiado.',
      'pt-BR':
        'Entre o rio e Estrela. Local, caminhável, melhor custo-benefício que o Chiado.',
    },
    safety: 86,
    value: 82,
    lat: 38.7075,
    lng: -9.1555,
    radiusM: 500,
  }),
  zone({
    id: 'lisboa-principe-real',
    citySlug: 'lisboa',
    name: { en: 'Príncipe Real', 'pt-BR': 'Príncipe Real' },
    note: {
      en: 'Very safe, gardens, good restaurants. A little pricier; still calmer than Bairro Alto.',
      'pt-BR':
        'Muito seguro, jardins, bons restaurantes. Um pouco mais caro; ainda mais calmo que o Bairro Alto.',
    },
    safety: 92,
    value: 72,
    lat: 38.7166,
    lng: -9.1481,
    radiusM: 420,
  }),
  zone({
    id: 'lisboa-baixa',
    citySlug: 'lisboa',
    name: { en: 'Baixa', 'pt-BR': 'Baixa' },
    note: {
      en: 'Flat, central, well-priced hotels. Touristy and pickpocket-aware on Rua Augusta.',
      'pt-BR':
        'Plana, central, hotéis com bom preço. Turística; carteiristas na Rua Augusta.',
    },
    safety: 85,
    value: 80,
    lat: 38.7115,
    lng: -9.1385,
    radiusM: 480,
  }),
  zone({
    id: 'lisboa-liberdade',
    citySlug: 'lisboa',
    name: { en: 'Avenida da Liberdade', 'pt-BR': 'Avenida da Liberdade' },
    note: {
      en: 'Safe boulevard hotels, metro, easy airport run. More formal than the hills.',
      'pt-BR':
        'Hotéis seguros na avenida, metrô, fácil para o aeroporto. Mais formal que as colinas.',
    },
    safety: 90,
    value: 70,
    lat: 38.7204,
    lng: -9.1457,
    radiusM: 550,
  }),
  zone({
    id: 'lisboa-graca',
    citySlug: 'lisboa',
    name: { en: 'Graça', 'pt-BR': 'Graça' },
    note: {
      en: 'Viewpoints, local cafés, better rates. Some streets feel mixed after dark toward Mouraria.',
      'pt-BR':
        'Miradouros, cafés locais, preços melhores. Algumas ruas ficam mistas à noite rumo à Mouraria.',
    },
    safety: 78,
    value: 85,
    lat: 38.7175,
    lng: -9.1305,
    radiusM: 500,
  }),
  zone({
    id: 'lisboa-alcantara',
    citySlug: 'lisboa',
    name: { en: 'Alcântara', 'pt-BR': 'Alcântara' },
    note: {
      en: 'LX Factory, river, more space for the money. Further west; tram or train back to Baixa.',
      'pt-BR':
        'LX Factory, rio, mais espaço pelo preço. Mais a oeste; elétrico ou comboio de volta à Baixa.',
    },
    safety: 78,
    value: 84,
    lat: 38.7035,
    lng: -9.177,
    radiusM: 650,
  }),
  zone({
    id: 'lisboa-chiado',
    citySlug: 'lisboa',
    name: { en: 'Chiado', 'pt-BR': 'Chiado' },
    note: {
      en: 'The convenient first-timer base. Very safe; you pay for the doorstep.',
      'pt-BR':
        'A base conveniente para a primeira visita. Muito seguro; você paga pela porta.',
    },
    safety: 90,
    value: 62,
    lat: 38.7103,
    lng: -9.1425,
    radiusM: 320,
  }),
  zone({
    id: 'lisboa-intendente',
    citySlug: 'lisboa',
    name: { en: 'Intendente / Anjos', 'pt-BR': 'Intendente / Anjos' },
    note: {
      en: 'Cheaper and more local. Fine by day; quieter side streets need more care at night.',
      'pt-BR':
        'Mais barato e mais local. Tranquilo de dia; ruas laterais pedem mais cuidado à noite.',
    },
    safety: 62,
    value: 88,
    lat: 38.7232,
    lng: -9.1352,
    radiusM: 500,
  }),
  zone({
    id: 'lisboa-alfama',
    citySlug: 'lisboa',
    name: { en: 'Alfama', 'pt-BR': 'Alfama' },
    note: {
      en: 'Lanes and views. Steep, touristy, pickpockets on tram 28; some alleys thin out at night.',
      'pt-BR':
        'Beco e vista. Íngreme, turística, carteiristas no 28; alguns becos esvaziam à noite.',
    },
    safety: 74,
    value: 70,
    lat: 38.712,
    lng: -9.13,
    radiusM: 480,
  }),
  zone({
    id: 'lisboa-cais-do-sodre',
    citySlug: 'lisboa',
    name: { en: 'Cais do Sodré', 'pt-BR': 'Cais do Sodré' },
    note: {
      en: 'Nightlife and trains. Pink Street is loud; watch bags when bars empty.',
      'pt-BR':
        'Noite e comboios. Pink Street é barulhenta; cuidado com bolsas na saída dos bares.',
    },
    safety: 68,
    value: 75,
    lat: 38.7068,
    lng: -9.1455,
    radiusM: 380,
  }),
  zone({
    id: 'lisboa-martim-moniz',
    citySlug: 'lisboa',
    name: { en: 'Martim Moniz', 'pt-BR': 'Martim Moniz' },
    note: {
      en: 'Cheapest center. Rough around the square at night; better value exists a few blocks away.',
      'pt-BR':
        'Centro mais barato. A praça fica áspera à noite; há melhor custo-benefício a poucas ruas.',
    },
    safety: 55,
    value: 85,
    lat: 38.7155,
    lng: -9.136,
    radiusM: 380,
  }),
  zone({
    id: 'lisboa-bairro-alto',
    citySlug: 'lisboa',
    name: { en: 'Bairro Alto', 'pt-BR': 'Bairro Alto' },
    note: {
      en: 'Party streets. Hard to sleep, easy to lose a phone. Stay next door in Príncipe Real or Chiado instead.',
      'pt-BR':
        'Ruas de festa. Difícil dormir, fácil perder o celular. Fique ao lado, em Príncipe Real ou Chiado.',
    },
    safety: 65,
    value: 72,
    lat: 38.7134,
    lng: -9.1456,
    radiusM: 320,
  }),
];

const BY_CITY: Record<string, StayZone[]> = {
  roma: ROME,
  lisboa: LISBON,
};

export function stayZonesForCity(slug: string | undefined | null): StayZone[] {
  if (!slug) return [];
  return BY_CITY[slug] ?? [];
}

export function hasStayHeat(slug: string | undefined | null): boolean {
  return stayZonesForCity(slug).length > 0;
}

/** Paint score for the heatmap: safety < 70 is always caution red. */
export function stayHeatPaintScore(z: StayZone): number {
  return z.safety < STAY_SAFETY_CAUTION ? 48 : z.overall;
}

/** RGB for a 0–100 stay score. Red = caution, gold = mixed, green = best. */
export function stayScoreRgb(score: number): [number, number, number] {
  const stops: [number, [number, number, number]][] = [
    [48, [214, 72, 64]],
    [66, [232, 168, 56]],
    [78, [120, 196, 96]],
    [90, [46, 196, 138]],
  ];
  const s = Math.max(stops[0]![0], Math.min(stops[stops.length - 1]![0], score));
  for (let i = 1; i < stops.length; i++) {
    const [t1, c1] = stops[i]!;
    const [t0, c0] = stops[i - 1]!;
    if (s <= t1) {
      const t = (s - t0) / (t1 - t0);
      return [
        Math.round(c0[0] + (c1[0] - c0[0]) * t),
        Math.round(c0[1] + (c1[1] - c0[1]) * t),
        Math.round(c0[2] + (c1[2] - c0[2]) * t),
      ];
    }
  }
  return stops[stops.length - 1]![1];
}

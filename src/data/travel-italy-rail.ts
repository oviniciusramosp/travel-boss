import type { TravelCity, TravelPlace } from './travel';
import type { ItineraryLegDef } from './travel-itinerary-legs';
import type { LatLng } from './travel-transit-lines';
import paths from './travel-italy-rail-paths.json';
import { veniceNotionPlaces, veronaNotionPlaces } from './travel-italy-notion';

// Exact OSM station objects; provenance and geometry limitations in docs/references/italy-trains-2026.md.
function station(id: string, name: string, lat: number, lng: number, osm: number): TravelPlace {
  return {
    id, name: { en: name, 'pt-BR': name }, category: 'transport', lat, lng,
    description: { en: `${name} railway station.`, 'pt-BR': `Estação ferroviária ${name}.` },
    mapsUrl: `https://www.openstreetmap.org/node/${osm}`,
  };
}
const venice = station('ven-santa-lucia', 'Venezia Santa Lucia', 45.4410753, 12.3210322, 6063641885);
const verona = station('ver-porta-nuova', 'Verona Porta Nuova', 45.429182, 10.9823706, 3738591149);
export const laSpeziaStation = station('spe-centrale', 'La Spezia Centrale', 44.111564, 9.81358, 1262114259);
export const italyRailCities: TravelCity[] = [
  { slug: 'veneza', name: { en: 'Venice', 'pt-BR': 'Veneza' }, country: { en: 'Italy', 'pt-BR': 'Itália' }, countryKey: 'italia', lat: venice.lat, lng: venice.lng, zoom: 13, places: [venice, ...veniceNotionPlaces] },
  { slug: 'verona', name: { en: 'Verona', 'pt-BR': 'Verona' }, country: { en: 'Italy', 'pt-BR': 'Itália' }, countryKey: 'italia', lat: verona.lat, lng: verona.lng, zoom: 13, places: [verona, ...veronaNotionPlaces] },
];

export const italyRailLegs: ItineraryLegDef[] = [
  { from: laSpeziaStation.id, to: 'rom-termini', mode: 'transit', line: 'frecciabianca', label: 'Frecciabianca 8605', board: laSpeziaStation.name.en, exit: 'Roma Termini', durationMin: 242, stationCount: 0, path: paths['spezia-rome'] as LatLng[] },
  { from: 'mil-centrale', to: venice.id, mode: 'transit', line: 'italo', label: 'Italo 8973', board: 'Milano Centrale', exit: venice.name.en, durationMin: 150, stationCount: 0, path: paths.venice as LatLng[] },
  { from: venice.id, to: 'mil-centrale', mode: 'transit', line: 'italo', label: 'Italo 8992', board: venice.name.en, exit: 'Milano Centrale', durationMin: 150, stationCount: 0, path: paths['venice-back'] as LatLng[] },
  { from: 'mil-centrale', to: verona.id, mode: 'transit', line: 'frecciarossa', label: 'Frecciarossa 9703', board: 'Milano Centrale', exit: verona.name.en, durationMin: 73, stationCount: 0, path: paths.verona as LatLng[] },
  { from: verona.id, to: 'mil-centrale', mode: 'transit', line: 'italo', label: 'Italo 8988', board: verona.name.en, exit: 'Milano Centrale', durationMin: 75, stationCount: 0, path: paths['verona-back'] as LatLng[] },
  { from: 'mil-centrale', to: laSpeziaStation.id, mode: 'transit', line: 'frecciabianca', label: 'Frecciabianca 8619', board: 'Milano Centrale', exit: laSpeziaStation.name.en, durationMin: 184, stationCount: 0, path: paths.spezia as LatLng[] },
];

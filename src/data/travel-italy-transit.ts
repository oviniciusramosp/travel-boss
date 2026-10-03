import type { TransitLine } from './travel-transit-lines';

// OSM station / ferry-terminal anchors, not surveyed track or canal geometry.
// Sources, selected direction and limitations: docs/references/italy-notion-sync-2026-10-02.md.
export const romeMetroB: TransitLine = {
  id: 'rome-b', name: 'Metrô B', color: '#0076BC', stations: [
    { id: 'termini', name: 'Termini', lat: 41.9013754, lng: 12.5004782 },
    { id: 'cavour', name: 'Cavour', lat: 41.8949682, lng: 12.4935305 },
    { id: 'colosseo', name: 'Colosseo', lat: 41.8916678, lng: 12.4917043 },
  ],
};

export const cinqueTerreRegional: TransitLine = {
  id: 'cinque-terre-regional', name: 'Regionale Cinque Terre', color: '#00814F', stations: [
    { id: 'spezia', name: 'La Spezia Centrale', lat: 44.111564, lng: 9.81358 },
    { id: 'riomaggiore', name: 'Riomaggiore', lat: 44.1006168, lng: 9.7361425 },
    { id: 'manarola', name: 'Manarola', lat: 44.1049216, lng: 9.7292049 },
    { id: 'corniglia', name: 'Corniglia', lat: 44.1185398, lng: 9.7163062 },
    { id: 'vernazza', name: 'Vernazza', lat: 44.1350299, lng: 9.6845448 },
    { id: 'monterosso', name: 'Monterosso', lat: 44.1458899, lng: 9.6489881 },
  ],
};

export const veniceVaporetto1: TransitLine = {
  id: 'venice-vaporetto-1', name: 'Vaporetto 1', color: '#00814F', stations: [
    { id: 'salute', name: 'Salute', lat: 45.4311792, lng: 12.3343738 },
    { id: 'giglio', name: 'Giglio', lat: 45.4314283, lng: 12.3326382 },
    { id: 'accademia', name: 'Accademia', lat: 45.4317404, lng: 12.3285289 },
    { id: 'ca-rezzonico', name: 'Ca’ Rezzonico', lat: 45.4332642, lng: 12.3271509 },
    { id: 'rialto', name: 'Rialto', lat: 45.4370586, lng: 12.3347553 },
    { id: 'san-marcuola', name: 'San Marcuola', lat: 45.4424277, lng: 12.3288131 },
    { id: 'riva-biasio', name: 'Riva di Biasio', lat: 45.441997, lng: 12.3256703 },
    { id: 'ferrovia', name: 'Ferrovia', lat: 45.4399353, lng: 12.3209625 },
  ],
};

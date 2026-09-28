import type { TravelPlace } from './travel';

// Selected branches near the Paris itinerary, surveyed 2026-09-28. Sources:
// docs/references/mcdonalds-paris-map-2026-09-28.md
// Champs-Élysées and Disney Village already have curated entries in travel.ts.
type Branch = [slug: string, label: string, lat: number, lng: number, address: string, osmRef: string];
const branches: Branch[] = [
  ["carrousel-du-louvre-autogrill", "Carrousel du Louvre", 48.8624513, 2.3347579, "99 Rue de Rivoli, 75001 Paris", "node/4246099576"],
  ["louvre-rivoli", "Louvre–Rivoli", 48.8634247, 2.3336977, "184 rue de Rivoli, 75001 Paris", "node/3980173944"],
  ["luxembourg-pantheon", "Luxembourg · Panthéon", 48.8471099, 2.3410048, "65 Boulevard Saint-Michel, Paris", "node/726579050"],
  ["opera-bld-des-italiens", "Opéra · Boulevard des Italiens", 48.8713129, 2.3350843, "34 boulevard des Italiens, 75009 Paris", "node/1342681649"],
  ["place-pigalle", "Place Pigalle", 48.8825599, 2.3377557, "20 Boulevard de Clichy, 75018 Paris", "node/1919225886"],
  ["rue-saint-lazare", "Rue Saint-Lazare", 48.8752761, 2.3255792, "119 rue Saint-Lazare, 75008 Paris", "node/546475298"],
];
export const parisMcDonalds: TravelPlace[] = branches.map(([slug, label, lat, lng, address, osmRef]) => ({
  id: 'par-mcdonalds-' + slug,
  name: { en: "McDonald's " + label, 'pt-BR': "McDonald's " + label },
  category: 'commons',
  subcategories: ['burgers'],
  description: {
    en: "McDonald's branch in Paris: " + label + '. The fast-food chain specialises in burgers, fries and desserts.',
    'pt-BR': "Unidade do McDonald's em Paris: " + label + '. A rede de alimentação rápida tem como especialidade hambúrgueres, batatas fritas e sobremesas.',
  },
  lat, lng,
  ...(address ? { address } : {}),
  mapsQuery: "McDonald's " + label + ', ' + (address || 'Paris'),
  visit: osmRef ? { osmRef } : undefined,
}));

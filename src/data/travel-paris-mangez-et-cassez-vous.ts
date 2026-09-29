import type { TravelPlace } from './travel';

// Active Paris branches surveyed 2026-09-29. Sources:
// docs/references/mangez-et-cassez-vous-paris-2026-09-29.md
type Branch = [
  slug: string,
  label: string,
  lat: number,
  lng: number,
  address: string,
  googleRating: number,
];

const branches: Branch[] = [
  ['taitbout', 'Taitbout', 48.8741307, 2.3352254, '39 Rue Taitbout, 75009 Paris', 4.6],
  ['alexandre-dumas', 'Alexandre Dumas', 48.8540214, 2.395007, '64 Rue Alexandre Dumas, 75011 Paris', 4.5],
  ['daumesnil-picpus', 'Daumesnil · Picpus', 48.8404059, 2.4002118, '5 Boulevard de Picpus, 75012 Paris', 4.6],
  ['faidherbe-chaligny', 'Faidherbe · Chaligny', 48.8505797, 2.381124, '179 Rue du Faubourg Saint-Antoine, 75011 Paris', 4.4],
  ['jean-jaures', 'Jean-Jaurès', 48.8882288, 2.3915851, '194 Avenue Jean Jaurès, 75019 Paris', 4.5],
];

export const parisMangezEtCassezVous: TravelPlace[] = branches.map(([
  slug,
  label,
  lat,
  lng,
  address,
  googleRating,
]) => ({
  id: `par-mangez-et-cassez-vous-${slug}`,
  name: {
    en: `Mangez et cassez-vous · ${label}`,
    'pt-BR': `Mangez et cassez-vous · ${label}`,
  },
  category: 'commons',
  subcategories: ['burgers'],
  description: {
    en: 'Paris fast-food counter known for inexpensive house-made burgers, fries and desserts. The basic burger currently starts at €3.60.',
    'pt-BR': 'Hamburgueria parisiense conhecida pelos hambúrgueres artesanais baratos, fritas e sobremesas. O hambúrguer básico custa atualmente a partir de €3,60.',
  },
  lat,
  lng,
  googleRating,
  address,
  mapsQuery: `Mangez et cassez-vous, ${address}`,
}));

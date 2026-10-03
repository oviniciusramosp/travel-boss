import type { TravelPlace } from './travel';

// Exact Google Maps listings cross-checked with the official branch directory.
// Sources and pin choice: docs/references/pouletos-paris-2026-10-02.md.
const branches: [string, string, number, number, string, number, string][] = [
  ['belleville', 'Belleville', 48.8711768, 2.3741927, '111 Rue du Faubourg du Temple, 75010 Paris', 4.8, '0x47e66daf59596b11:0xb7b0ff2f655b253f'],
  ['gare-de-l-est', 'Gare de l’Est', 48.8745763, 2.3589521, '132 Rue du Faubourg Saint-Martin, 75010 Paris', 4.7, '0x47e66f001fe5aa61:0x2e57180cf8b80885'],
  ['jaures', 'Jaurès', 48.8867324, 2.3862585, '140 Avenue Jean Jaurès, 75019 Paris', 4.7, '0x47e66d003a3892a9:0xb22b7b74d4bc5f98'],
];

export const parisPouletos: TravelPlace[] = branches.map(([slug, label, lat, lng, address, googleRating, mapsId]) => ({
  id: `par-pouletos-${slug}`,
  name: { en: `POULETOS · ${label}`, 'pt-BR': `POULETOS · ${label}` },
  category: 'commons',
  subcategories: ['chicken'],
  description: {
    en: 'French fast-food chain specializing in seasoned braised chicken, served with rice, potatoes and other sides. This Paris branch offers quick meals to eat in or take away.',
    'pt-BR': 'Rede francesa de comida rápida especializada em frango braisé temperado, servido com arroz, batatas e outros acompanhamentos. Esta unidade parisiense oferece refeições rápidas para comer no local ou levar.',
  },
  lat,
  lng,
  address,
  googleRating,
  mapsQuery: `POULETOS ${address}`,
  mapsUrl: `https://www.google.com/maps/place/POULETOS/data=!4m6!3m5!1s${mapsId}!8m2!3d${lat}!4d${lng}`,
}));

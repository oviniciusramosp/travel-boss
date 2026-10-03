/**
 * Curated Paris transit spines for itinerary map drawing.
 * Station order follows the line direction; slice with station ids.
 * Coordinates are station anchors, not full track geometry. Lines 2, 4, 5, 8, 9, 14,
 * RER A, B, E, Transilien L and the central RER C stations use OpenStreetMap stop
 * positions (route relations, 2026-09); the rest are approximate.
 */

import { cinqueTerreRegional, romeMetroB, veniceVaporetto1 } from './travel-italy-transit';
export { cinqueTerreRegional, romeMetroB, veniceVaporetto1 } from './travel-italy-transit';

export type LatLng = [number, number];

export type TransitStation = {
  id: string;
  name: string;
  lat: number;
  lng: number;
};

export type TransitLine = {
  id: string;
  name: string;
  /** Rough RATP/RER brand color */
  color: string;
  stations: TransitStation[];
};

function st(
  id: string,
  name: string,
  lat: number,
  lng: number,
): TransitStation {
  return { id, name, lat, lng };
}

/** Metro Line 1 — La Défense → Château de Vincennes (west → east) */
export const metro1: TransitLine = {
  id: 'm1',
  name: 'Métro 1',
  color: '#FFBE00',
  stations: [
    st('la-defense', 'La Défense', 48.891922, 2.238038),
    st('esplanade-defense', 'Esplanade de La Défense', 48.887843, 2.250442),
    st('pont-neuilly', 'Pont de Neuilly', 48.884509, 2.259503),
    st('les-sablons', 'Les Sablons', 48.880692, 2.272281),
    st('porte-maillot', 'Porte Maillot', 48.87803, 2.282547),
    st('argentine', 'Argentine', 48.87549, 2.29013),
    st('etoile', 'Charles de Gaulle–Étoile', 48.8738, 2.295),
    st('george-v', 'George V', 48.872, 2.3006),
    st('fdr', 'Franklin D. Roosevelt', 48.8691, 2.3098),
    st('clemenceau', 'Champs-Élysées–Clemenceau', 48.8676, 2.3135),
    st('concorde', 'Concorde', 48.8656, 2.3211),
    st('tuileries', 'Tuileries', 48.8636, 2.3303),
    st('palais-royal', 'Palais Royal–Musée du Louvre', 48.8625, 2.3364),
    st('louvre-rivoli', 'Louvre–Rivoli', 48.8609, 2.3408),
    st('chatelet', 'Châtelet', 48.8584, 2.347),
    st('hotel-ville', 'Hôtel de Ville', 48.8573, 2.3517),
    st('saint-paul', 'Saint-Paul', 48.8553, 2.3609),
    st('bastille', 'Bastille', 48.8532, 2.3691),
    st('gare-lyon', 'Gare de Lyon', 48.8448, 2.3735),
    st('nation', 'Nation', 48.8482, 2.3958),
    st('porte-vincennes', 'Porte de Vincennes', 48.8472, 2.4109),
    st('saint-mande', 'Saint-Mandé', 48.8462, 2.4189),
    st('berault', 'Bérault', 48.8453, 2.4285),
    st('chateau-vincennes', 'Château de Vincennes', 48.8444, 2.4405),
  ],
};

/** Metro Line 6 — Charles de Gaulle–Étoile → Nation (via south / elevated) */
export const metro6: TransitLine = {
  id: 'm6',
  name: 'Métro 6',
  color: '#6ECA97',
  stations: [
    st('etoile', 'Charles de Gaulle–Étoile', 48.8738, 2.295),
    st('kleber', 'Kléber', 48.8712, 2.2928),
    st('boissiere', 'Boissière', 48.8674, 2.29),
    st('trocadero', 'Trocadéro', 48.863, 2.2875),
    st('passy', 'Passy', 48.8575, 2.2858),
    st('bir-hakeim', 'Bir-Hakeim', 48.8539, 2.2893),
    st('dupleix', 'Dupleix', 48.8505, 2.2935),
    st('motte-picquet', 'La Motte-Picquet–Grenelle', 48.8492, 2.2985),
    st('cambronne', 'Cambronne', 48.8475, 2.3025),
    st('sevres-lecourbe', 'Sèvres–Lecourbe', 48.8455, 2.31),
    st('pasteur', 'Pasteur', 48.8428, 2.3125),
    st('montparnasse', 'Montparnasse–Bienvenüe', 48.8422, 2.3219),
    st('edgar-quinet', 'Edgar Quinet', 48.841, 2.325),
    st('raspail', 'Raspail', 48.8405, 2.3305),
    st('denfert', 'Denfert-Rochereau', 48.8339, 2.3325),
    st('place-italie', "Place d'Italie", 48.8312, 2.3558),
    st('bercy', 'Bercy', 48.84, 2.3795),
    st('nation', 'Nation', 48.8482, 2.3958),
  ],
};

/** Metro Line 2 — Porte Dauphine → Nation (north arc) */
export const metro2: TransitLine = {
  id: 'm2',
  name: 'Métro 2',
  color: '#003CA6',
  stations: [
    st('porte-dauphine', 'Porte Dauphine', 48.871418, 2.277336),
    st('victor-hugo', 'Victor Hugo', 48.870282, 2.286902),
    st('etoile', 'Charles de Gaulle–Étoile', 48.875082, 2.296007),
    st('ternes', 'Ternes', 48.878317, 2.299381),
    st('courcelles', 'Courcelles', 48.879413, 2.304588),
    st('monceau', 'Monceau', 48.880304, 2.308802),
    st('villiers', 'Villiers', 48.881124, 2.315236),
    st('rome', 'Rome', 48.882282, 2.321659),
    st('place-clichy', 'Place de Clichy', 48.884033, 2.328643),
    st('blanche', 'Blanche', 48.883438, 2.333699),
    st('pigalle', 'Pigalle', 48.882083, 2.33925),
    st('anvers', 'Anvers', 48.883002, 2.344886),
    st('barbès', 'Barbès–Rochechouart', 48.883833, 2.350996),
    st('la-chapelle', 'La Chapelle', 48.884397, 2.360814),
    st('stalingrad', 'Stalingrad', 48.884231, 2.366551),
    st('jaures', 'Jaurès', 48.881732, 2.370223),
    st('colonel-fabien', 'Colonel Fabien', 48.877407, 2.370983),
    st('belleville', 'Belleville', 48.872406, 2.376504),
    st('couronnes', 'Couronnes', 48.869041, 2.380439),
    st('menilmontant', 'Ménilmontant', 48.866697, 2.383317),
    st('pere-lachaise', 'Père Lachaise', 48.862331, 2.387684),
    st('philippe-auguste', 'Philippe Auguste', 48.858232, 2.390153),
    st('alexandre-dumas', 'Alexandre Dumas', 48.856295, 2.394457),
    st('avron', 'Avron', 48.851485, 2.398163),
    st('nation', 'Nation', 48.847983, 2.395917),
  ],
};

/** Metro Line 4 — Porte de Clignancourt → Bagneux (north–south spine) */
export const metro4: TransitLine = {
  id: 'm4',
  name: 'Métro 4',
  color: '#C04191',
  stations: [
    st('porte-clignancourt', 'Porte de Clignancourt', 48.897398, 2.344852),
    st('simplon', 'Simplon', 48.893848, 2.347841),
    st('marcadet', 'Marcadet–Poissonniers', 48.891139, 2.34974),
    st('chateau-rouge', 'Château Rouge', 48.886865, 2.349553),
    st('barbès', 'Barbès–Rochechouart', 48.883784, 2.349507),
    st('gare-nord', 'Gare du Nord', 48.8797, 2.356435),
    st('gare-est', "Gare de l'Est", 48.876053, 2.357722),
    st('chateau-deau', "Château d'Eau", 48.872892, 2.356306),
    st('strasbourg', 'Strasbourg–Saint-Denis', 48.869387, 2.354323),
    st('reaumur', 'Réaumur–Sébastopol', 48.866716, 2.352828),
    st('etienne-marcel', 'Étienne Marcel', 48.863953, 2.349393),
    st('les-halles', 'Les Halles', 48.862165, 2.34588),
    st('chatelet', 'Châtelet', 48.859788, 2.346667),
    st('cite', 'Cité', 48.855327, 2.347525),
    st('saint-michel', 'Saint-Michel', 48.8531, 2.343067),
    st('odeon', 'Odéon', 48.852372, 2.339406),
    st('saint-germain', 'Saint-Germain-des-Prés', 48.853647, 2.334484),
    st('saint-sulpice', 'Saint-Sulpice', 48.851117, 2.330667),
    st('saint-placide', 'Saint-Placide', 48.847109, 2.326999),
    st('montparnasse', 'Montparnasse–Bienvenüe', 48.843281, 2.325806),
    st('vavin', 'Vavin', 48.842254, 2.328922),
    st('raspail', 'Raspail', 48.838926, 2.330785),
    st('denfert', 'Denfert-Rochereau', 48.834308, 2.332313),
  ],
};

/** Metro Line 8 — Balard → Pointe du Lac (Invalides, Opéra, Bastille, Créteil) */
export const metro8: TransitLine = {
  id: 'm8',
  name: 'Métro 8',
  color: '#D282BE',
  stations: [
    st('balard', 'Balard', 48.836397, 2.278379),
    st('lourmel', 'Lourmel', 48.838736, 2.282148),
    st('boucicaut', 'Boucicaut', 48.841084, 2.287922),
    st('felix-faure', 'Félix Faure', 48.842678, 2.291779),
    st('commerce', 'Commerce', 48.844711, 2.293864),
    st('motte-picquet', 'La Motte-Picquet–Grenelle', 48.850034, 2.299237),
    st('ecole-militaire', 'École Militaire', 48.854665, 2.306073),
    st('la-tour-neuve', 'La Tour-Maubourg', 48.85756, 2.310323),
    st('invalides', 'Invalides', 48.860335, 2.31468),
    st('concorde', 'Concorde', 48.866484, 2.321752),
    st('madeleine', 'Madeleine', 48.869578, 2.326171),
    st('opera', 'Opéra', 48.870439, 2.331282),
    st('richelieu', 'Richelieu–Drouot', 48.871704, 2.33854),
    st('grands-boulevards', 'Grands Boulevards', 48.871392, 2.343558),
    st('bonne-nouvelle', 'Bonne Nouvelle', 48.870431, 2.348927),
    st('strasbourg', 'Strasbourg–Saint-Denis', 48.869375, 2.353724),
    st('republique', 'République', 48.867662, 2.362796),
    st('filles-calvaire', 'Filles du Calvaire', 48.863319, 2.366632),
    st('saint-sebastien', 'Saint-Sébastien–Froissart', 48.861182, 2.367234),
    st('chemin-vert', 'Chemin Vert', 48.857443, 2.368141),
    st('bastille', 'Bastille', 48.853679, 2.369187),
    st('ledru-rollin', 'Ledru-Rollin', 48.851295, 2.376027),
    st('faidherbe', 'Faidherbe–Chaligny', 48.850161, 2.384222),
    st('reuilly', 'Reuilly–Diderot', 48.847103, 2.387048),
    st('montgallet', 'Montgallet', 48.844304, 2.390196),
    st('daumesnil', 'Daumesnil', 48.839785, 2.395592),
    st('michel-bizot', 'Michel Bizot', 48.837069, 2.402459),
    st('porte-doree', 'Porte Dorée', 48.835276, 2.406178),
    st('porte-charenton', 'Porte de Charenton', 48.833061, 2.401187),
    st('liberte', 'Liberté', 48.826406, 2.406201),
    st('charenton-ecoles', 'Charenton–Écoles', 48.821561, 2.413783),
    st('ecole-veterinaire', 'École Vétérinaire de Maisons-Alfort', 48.81502, 2.421732),
    st('maisons-alfort-stade', 'Maisons-Alfort–Stade', 48.809037, 2.434721),
    st('maisons-alfort-juilliottes', 'Maisons-Alfort–Les Juilliottes', 48.803331, 2.445609),
    st('creteil-echat', "Créteil–L'Échat", 48.796332, 2.449248),
    st('creteil-universite', 'Créteil–Université', 48.789637, 2.450765),
    st('creteil-prefecture', 'Créteil–Préfecture', 48.779643, 2.459284),
    st('pointe-du-lac', 'Pointe du Lac', 48.76883, 2.464248),
  ],
};

/** Metro Line 12 — Front Populaire → Mairie d'Issy */
export const metro12: TransitLine = {
  id: 'm12',
  name: 'Métro 12',
  color: '#007852',
  stations: [
    st('pigalle', 'Pigalle', 48.8828, 2.3499),
    st('abbesses', 'Abbesses', 48.8845, 2.3385),
    st('lamarck', 'Lamarck–Caulaincourt', 48.8895, 2.3385),
    st('jules-joffrin', 'Jules Joffrin', 48.8925, 2.3445),
    st('marcadet', 'Marcadet–Poissonniers', 48.8902, 2.3495),
    st('poissonniers', 'Poissonniers', 48.8865, 2.3505),
    st('anvers-n', 'Anvers', 48.8825, 2.3445),
    st('pigalle-s', 'Pigalle', 48.882, 2.3375),
    st('saint-georges', 'Saint-Georges', 48.8785, 2.3375),
    st('notre-dame-de-lorette', 'Notre-Dame-de-Lorette', 48.876, 2.3385),
    st('trinite', 'Trinité–d’Estienne d’Orves', 48.8765, 2.333),
    st('saint-lazare', 'Saint-Lazare', 48.8755, 2.3255),
    st('madeleine', 'Madeleine', 48.87, 2.3244),
    st('concorde', 'Concorde', 48.8656, 2.3211),
    st('assemblee', 'Assemblée Nationale', 48.8605, 2.321),
    st('solferino', 'Solférino', 48.8585, 2.3235),
    st('rue-du-bac', 'Rue du Bac', 48.8555, 2.3255),
    st('sevres-babylone', 'Sèvres–Babylone', 48.8515, 2.3265),
    st('rennes', 'Rennes', 48.848, 2.3275),
    st('notre-dames-champs', 'Notre-Dame-des-Champs', 48.8445, 2.3285),
    st('montparnasse', 'Montparnasse–Bienvenüe', 48.8422, 2.3219),
  ],
};

/** Metro Line 13 — useful for Invalides / Saint-Lazare / north */
export const metro13: TransitLine = {
  id: 'm13',
  name: 'Métro 13',
  color: '#6EC4E8',
  stations: [
    st('chateau-de-vincennes-n', 'Châtillon–Montrouge', 48.8105, 2.302),
    st('porte-vanves', 'Porte de Vanves', 48.8275, 2.3055),
    st('plaisance', 'Plaisance', 48.8315, 2.3135),
    st('pernety', 'Pernety', 48.8335, 2.3185),
    st('gaite', 'Gaîté', 48.8385, 2.3225),
    st('montparnasse', 'Montparnasse–Bienvenüe', 48.8422, 2.3219),
    st('duroc', 'Duroc', 48.847, 2.3165),
    st('varenne', 'Varenne', 48.856, 2.315),
    st('invalides', 'Invalides', 48.861, 2.3145),
    st('champs-elysees', 'Champs-Élysées–Clemenceau', 48.8676, 2.3135),
    st('miromesnil', 'Miromesnil', 48.8735, 2.3145),
    st('saint-lazare', 'Saint-Lazare', 48.8755, 2.3255),
    st('liege', 'Liège', 48.8795, 2.327),
    st('place-clichy', 'Place de Clichy', 48.8838, 2.338),
    st('la-fourche', 'La Fourche', 48.8875, 2.326),
    st('guy-moquet', 'Guy Môquet', 48.892, 2.327),
    st('porte-clichy', 'Porte de Clichy', 48.8945, 2.314),
  ],
};

/**
 * RER C simplified spine — Versailles-Château ↔ eastern Paris.
 * Enough stations for Versailles day + Champ de Mars / Invalides.
 */
export const rerC: TransitLine = {
  id: 'rer-c',
  name: 'RER C',
  color: '#F4C300',
  stations: [
    st('versailles-chateau', 'Versailles-Château–Rive Gauche', 48.8003, 2.1293),
    st('versailles-chantiers', 'Versailles-Chantiers', 48.7955, 2.1355),
    st('viroflay-rg', 'Viroflay-Rive Gauche', 48.8005, 2.1675),
    st('chaville', 'Chaville–Vélizy', 48.8055, 2.1885),
    st('meudon', 'Meudon-Val-Fleury', 48.8125, 2.2215),
    st('issy', 'Issy', 48.8215, 2.2595),
    st('boulevard-victor', 'Boulevard Victor', 48.8385, 2.2735),
    st('javel', 'Javel', 48.8465, 2.2785),
    st('champ-mars', 'Champ de Mars–Tour Eiffel', 48.856079, 2.289465),
    st('pont-alma', "Pont de l'Alma", 48.862564, 2.299957),
    st('invalides', 'Invalides', 48.862779, 2.313655),
    st('musee-orsay', "Musée d'Orsay", 48.860553, 2.326091),
    st('saint-michel', 'Saint-Michel–Notre-Dame', 48.85341, 2.345623),
    st('gare-austerlitz', "Gare d'Austerlitz", 48.84064, 2.367037),
    st('bibliotheque', 'Bibliothèque François Mitterrand', 48.82892, 2.377886),
  ],
};

/** Metro Line 14 — useful for BNF ↔ Châtelet / Gare de Lyon */
export const metro14: TransitLine = {
  id: 'm14',
  name: 'Métro 14',
  color: '#62259D',
  stations: [
    st('saint-lazare', 'Saint-Lazare', 48.875605, 2.324136),
    st('madeleine', 'Madeleine', 48.870416, 2.326577),
    st('pyramides', 'Pyramides', 48.865699, 2.33454),
    st('chatelet', 'Châtelet', 48.859732, 2.345878),
    st('gare-lyon', 'Gare de Lyon', 48.843415, 2.373977),
    st('bercy', 'Bercy', 48.839992, 2.379601),
    st('cour-saint-emilion', 'Cour Saint-Émilion', 48.83354, 2.385978),
    st('bibliotheque', 'Bibliothèque François Mitterrand', 48.829913, 2.376731),
    st('olympiades', 'Olympiades', 48.827016, 2.366421),
  ],
};

/** Metro Line 7 — Censier–Daubenton → Chaussée d’Antin–La Fayette (trip stretches, OSM/Transitous 2026-09-29) */
export const metro7: TransitLine = {
  id: 'm7',
  name: 'Métro 7',
  color: '#F3A4BA',
  stations: [
    st('censier-daubenton', 'Censier–Daubenton', 48.840647, 2.351933),
    st('place-monge', 'Place Monge', 48.842905, 2.352277),
    st('jussieu', 'Jussieu', 48.845963, 2.354801),
    st('sully-morland', 'Sully–Morland', 48.85118, 2.36103),
    st('pont-marie', 'Pont Marie', 48.85373, 2.35758),
    st('chatelet', 'Châtelet', 48.85851, 2.34702),
    st('pont-neuf', 'Pont Neuf', 48.85875, 2.34245),
    st('palais-royal', 'Palais Royal–Musée du Louvre', 48.8625, 2.3364),
    st('pyramides', 'Pyramides', 48.86638, 2.33323),
    st('opera', 'Opéra', 48.8705, 2.33236),
    st('chaussee-antin', 'Chaussée d’Antin–La Fayette', 48.872879, 2.333872),
  ],
};

/** Metro Line 10 — Jussieu → Odéon (the trip's stretch, OSM 2026-09-27) */
export const metro10: TransitLine = {
  id: 'm10',
  name: 'Métro 10',
  color: '#C9910D',
  stations: [
    st('jussieu', 'Jussieu', 48.845963, 2.354801),
    st('maubert-mutualite', 'Maubert–Mutualité', 48.850065, 2.34843),
    st('cluny-la-sorbonne', 'Cluny–La Sorbonne', 48.851094, 2.344159),
    st('odeon', 'Odéon', 48.852304, 2.339371),
  ],
};

/** Metro Line 5 — République → Gare du Nord (the trip's stretch) */
export const metro5: TransitLine = {
  id: 'm5',
  name: 'Métro 5',
  color: '#FF7E2E',
  stations: [
    st('republique', 'République', 48.867887, 2.363883),
    st('jacques-bonsergent', 'Jacques Bonsergent', 48.871119, 2.360755),
    st('gare-est', "Gare de l'Est", 48.876364, 2.358128),
    st('gare-nord', 'Gare du Nord', 48.880495, 2.357721),
  ],
};

/** Metro Line 9 — Trocadéro → Chaussée d'Antin–La Fayette (the trip's stretch) */
export const metro9: TransitLine = {
  id: 'm9',
  name: 'Métro 9',
  color: '#B6BD00',
  stations: [
    st('trocadero', 'Trocadéro', 48.863136, 2.286232),
    st('iena', 'Iéna', 48.864613, 2.293734),
    st('alma-marceau', 'Alma–Marceau', 48.864868, 2.300292),
    st('fdr', 'Franklin D. Roosevelt', 48.868116, 2.308509),
    st('saint-philippe', 'Saint-Philippe du Roule', 48.872235, 2.310051),
    st('miromesnil', 'Miromesnil', 48.873798, 2.315215),
    st('saint-augustin', 'Saint-Augustin', 48.874471, 2.321792),
    st('havre-caumartin', 'Havre–Caumartin', 48.873632, 2.328312),
    st('chaussee-antin', "Chaussée d'Antin–La Fayette", 48.872879, 2.333872),
  ],
};

/** RER A — La Défense → Marne-la-Vallée–Chessy (A4 branch, Disneyland) */
export const rerA: TransitLine = {
  id: 'rer-a',
  name: 'RER A',
  color: '#E3051C',
  stations: [
    st('la-defense', 'La Défense–Grande Arche', 48.891908, 2.238513),
    st('etoile', 'Charles de Gaulle–Étoile', 48.874143, 2.296342),
    st('auber', 'Auber', 48.871592, 2.330958),
    st('chatelet', 'Châtelet–Les Halles', 48.860771, 2.347924),
    st('gare-lyon', 'Gare de Lyon', 48.843663, 2.374487),
    st('nation', 'Nation', 48.847999, 2.397219),
    st('vincennes', 'Vincennes', 48.847329, 2.433647),
    st('val-de-fontenay', 'Val de Fontenay', 48.854526, 2.489373),
    st('neuilly-plaisance', 'Neuilly-Plaisance', 48.853448, 2.513857),
    st('bry-sur-marne', 'Bry-sur-Marne', 48.844364, 2.526521),
    st('noisy-mont-est', "Noisy-le-Grand–Mont d'Est", 48.840859, 2.547756),
    st('noisy-champs', 'Noisy-Champs', 48.843004, 2.581185),
    st('noisiel', 'Noisiel', 48.843546, 2.617605),
    st('lognes', 'Lognes', 48.838958, 2.634578),
    st('torcy', 'Torcy', 48.839861, 2.656743),
    st('bussy-saint-georges', 'Bussy-Saint-Georges', 48.836668, 2.709886),
    st('val-europe', "Val d'Europe", 48.854911, 2.77255),
    st('chessy', 'Marne-la-Vallée–Chessy', 48.869926, 2.782099),
  ],
};

/** RER B — Aéroport CDG 2 → Saint-Michel–Notre-Dame */
export const rerB: TransitLine = {
  id: 'rer-b',
  name: 'RER B',
  color: '#5291CE',
  stations: [
    st('cdg-2', 'Aéroport CDG 2 TGV', 49.005291, 2.570594),
    st('cdg-1', 'Aéroport CDG 1', 49.009525, 2.559946),
    st('parc-expositions', 'Parc des Expositions', 48.973372, 2.514553),
    st('villepinte', 'Villepinte', 48.961733, 2.513289),
    st('sevran-beaudottes', 'Sevran–Beaudottes', 48.947567, 2.524751),
    st('aulnay', 'Aulnay-sous-Bois', 48.932154, 2.494066),
    st('blanc-mesnil', 'Le Blanc-Mesnil', 48.932344, 2.47406),
    st('drancy', 'Drancy', 48.932756, 2.453672),
    st('le-bourget', 'Le Bourget', 48.930713, 2.425311),
    st('la-courneuve', 'La Courneuve–Aubervilliers', 48.924136, 2.384924),
    st('stade-de-france', 'La Plaine–Stade de France', 48.918091, 2.362661),
    st('gare-nord', 'Gare du Nord', 48.881394, 2.357473),
    st('chatelet', 'Châtelet–Les Halles', 48.860748, 2.347658),
    st('saint-michel', 'Saint-Michel–Notre-Dame', 48.852708, 2.345239),
  ],
};

/** RER E — Neuilly–Porte Maillot → Val de Fontenay (Tournan branch, via Noisy-le-Sec) */
export const rerE: TransitLine = {
  id: 'rer-e',
  name: 'RER E',
  color: '#C04191',
  stations: [
    st('neuilly-porte-maillot', 'Neuilly–Porte Maillot', 48.878149, 2.282399),
    st('haussmann-saint-lazare', 'Haussmann–Saint-Lazare', 48.875016, 2.328696),
    st('magenta', 'Magenta', 48.880744, 2.35863),
    st('rosa-parks', 'Rosa Parks', 48.896571, 2.374021),
    st('pantin', 'Pantin', 48.898175, 2.402353),
    st('noisy-le-sec', 'Noisy-le-Sec', 48.896765, 2.458672),
    st('rosny-bois-perrier', 'Rosny–Bois-Perrier', 48.881639, 2.482178),
    st('rosny-sous-bois', 'Rosny-sous-Bois', 48.870331, 2.486012),
    st('val-de-fontenay', 'Val de Fontenay', 48.85423, 2.489346),
  ],
};

/** Transilien L — Paris Saint-Lazare → Versailles Rive Droite */
export const transilienL: TransitLine = {
  id: 'transilien-l',
  name: 'Transilien L',
  color: '#7584BC',
  stations: [
    st('saint-lazare', 'Paris Saint-Lazare', 48.876515, 2.323935),
    st('pont-cardinet', 'Pont Cardinet', 48.887834, 2.31339),
    st('clichy-levallois', 'Clichy–Levallois', 48.897623, 2.296887),
    st('asnieres', 'Asnières-sur-Seine', 48.906054, 2.281921),
    st('becon', 'Bécon-les-Bruyères', 48.90528, 2.268869),
    st('courbevoie', 'Courbevoie', 48.898221, 2.248269),
    st('la-defense', 'La Défense', 48.892639, 2.237309),
    st('puteaux', 'Puteaux', 48.882606, 2.232935),
    st('suresnes', 'Suresnes–Mont-Valérien', 48.870961, 2.220753),
    st('val-dor', "Le Val d'Or", 48.856391, 2.216596),
    st('saint-cloud', 'Saint-Cloud', 48.845224, 2.21738),
    st('sevres-ville-avray', "Sèvres–Ville-d'Avray", 48.827407, 2.200779),
    st('chaville-rd', 'Chaville–Rive Droite', 48.812337, 2.188089),
    st('viroflay-rd', 'Viroflay–Rive Droite', 48.80547, 2.168326),
    st('montreuil-versailles', 'Montreuil', 48.80661, 2.150842),
    st('versailles-rd', 'Versailles–Rive Droite', 48.809529, 2.135282),
  ],
};

/** OSM station nodes 3417692497 / 3417692499, checked 2026-09-27. */
export const funicularMontmartre: TransitLine = {
  id: 'funicular-montmartre',
  name: 'Funicular de Montmartre',
  color: '#622282',
  stations: [
    st('gare-basse', 'Estação inferior', 48.8846923, 2.3426644),
    st('gare-haute', 'Estação superior', 48.8856581, 2.3425549),
  ],
};

export const transitLinesById: Record<string, TransitLine> = {
  'rome-b': romeMetroB,
  'cinque-terre-regional': cinqueTerreRegional,
  'venice-vaporetto-1': veniceVaporetto1,
  'funicular-montmartre': funicularMontmartre,
  m1: metro1,
  m2: metro2,
  m4: metro4,
  m6: metro6,
  m8: metro8,
  m12: metro12,
  m13: metro13,
  m14: metro14,
  'rer-c': rerC,
  m5: metro5,
  m7: metro7,
  m9: metro9,
  m10: metro10,
  'rer-a': rerA,
  'rer-b': rerB,
  'rer-e': rerE,
  'transilien-l': transilienL,
};

export type TransitLineId = keyof typeof transitLinesById;

export function getTransitLine(id: string): TransitLine | undefined {
  return transitLinesById[id];
}

export function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function nearestStation(
  line: TransitLine,
  point: { lat: number; lng: number },
): TransitStation {
  let best = line.stations[0]!;
  let bestD = Infinity;
  for (const s of line.stations) {
    const d = haversineM(point, s);
    if (d < bestD) {
      bestD = d;
      best = s;
    }
  }
  return best;
}

export function stationById(
  line: TransitLine,
  id: string,
): TransitStation | undefined {
  return line.stations.find((s) => s.id === id);
}

/**
 * Inclusive slice of station path from A to B (either direction).
 */
export function sliceLinePath(
  line: TransitLine,
  fromStationId: string,
  toStationId: string,
): LatLng[] {
  const i = line.stations.findIndex((s) => s.id === fromStationId);
  const j = line.stations.findIndex((s) => s.id === toStationId);
  if (i < 0 || j < 0) return [];
  const lo = Math.min(i, j);
  const hi = Math.max(i, j);
  const slice = line.stations.slice(lo, hi + 1);
  const ordered = i <= j ? slice : [...slice].reverse();
  return ordered.map((s) => [s.lat, s.lng] as LatLng);
}

/** Full line path as LatLngs */
export function linePath(line: TransitLine): LatLng[] {
  return line.stations.map((s) => [s.lat, s.lng] as LatLng);
}

/**
 * Place gallery photos for /travel cards (cover + slider).
 *
 * Place-specific preferred — Wikimedia Commons / Wikipedia / Openverse CC.
 *
 * Cafés & pâtisseries: food/dishes only (macarons, croissants, gelato…),
 * never owner portraits or street façades. When a free photo of that exact
 * counter doesn’t exist, use a clear plate of what they sell.
 *
 * Google Place Photos are not used (API billing + ephemeral media URLs).
 *
 * Link health:
 *  - Structural tests: `src/data/travel-photos.test.ts` (hosts, banned 404s)
 *  - Live HTTP check:  `npm run travel:photos:check`
 *  - Runtime: broken images are hidden by travel-photo-slider (no dead covers)
 */

import type { LString } from './travel';

export type TravelPhoto = {
  url: string;
  alt?: LString;
  credit?: string;
};

function photo(
  url: string,
  en: string,
  pt: string,
  credit: string,
): TravelPhoto {
  return { url, alt: { en, 'pt-BR': pt }, credit };
}

export const photosByPlaceId: Record<string, TravelPhoto[]> = {
  'par-dlp-chalet-marionnette': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Roast_Chicken_Hot_Plate.jpg/500px-Roast_Chicken_Hot_Plate.jpg',
      'Roast chicken (illustrative photo, not the restaurant’s dish)',
      'Frango assado (foto ilustrativa, não é o prato do restaurante)',
      'safaritravelplus / Wikimedia Commons — CC0',
    ),
  ],
  'par-sweet-lab': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flan_p%C3%A2tissier_bron.jpg/960px-Flan_p%C3%A2tissier_bron.jpg',
      'A slice of flan pâtissier (illustrative photo)',
      'Uma fatia de flan pâtissier (foto ilustrativa)',
      'Gouglov / Wikimedia Commons (CC0)',
    ),
  ],
  'par-a-deux-mains': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flan_p%C3%A2tissier_bron.jpg/960px-Flan_p%C3%A2tissier_bron.jpg',
      'A slice of flan pâtissier (illustrative photo)',
      'Uma fatia de flan pâtissier (foto ilustrativa)',
      'Gouglov / Wikimedia Commons (CC0)',
    ),
  ],
  'par-la-pompadour': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flan_p%C3%A2tissier_bron.jpg/960px-Flan_p%C3%A2tissier_bron.jpg',
      'A slice of flan pâtissier (illustrative photo)',
      'Uma fatia de flan pâtissier (foto ilustrativa)',
      'Gouglov / Wikimedia Commons (CC0)',
    ),
  ],
  'par-des-racines-et-du-pain': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Croissants_dans_une_boulangerie.jpg/960px-Croissants_dans_une_boulangerie.jpg',
      'Butter croissants in a Paris bakery basket (illustrative photo)',
      'Croissants de manteiga numa cesta de padaria parisiense (foto ilustrativa)',
      'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-maison-doucet': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Croissants_dans_une_boulangerie.jpg/960px-Croissants_dans_une_boulangerie.jpg',
      'Butter croissants in a Paris bakery basket (illustrative photo)',
      'Croissants de manteiga numa cesta de padaria parisiense (foto ilustrativa)',
      'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-chez-meunier-crimee': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Croissants_dans_une_boulangerie.jpg/960px-Croissants_dans_une_boulangerie.jpg',
      'Butter croissants in a Paris bakery basket (illustrative photo)',
      'Croissants de manteiga numa cesta de padaria parisiense (foto ilustrativa)',
      'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-maison-carton': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Croissants_dans_une_boulangerie.jpg/960px-Croissants_dans_une_boulangerie.jpg',
      'Butter croissants in a Paris bakery basket (illustrative photo)',
      'Croissants de manteiga numa cesta de padaria parisiense (foto ilustrativa)',
      'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-patisserie-colbert': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Croissants_dans_une_boulangerie.jpg/960px-Croissants_dans_une_boulangerie.jpg',
      'Butter croissants in a Paris bakery basket (illustrative photo)',
      'Croissants de manteiga numa cesta de padaria parisiense (foto ilustrativa)',
      'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-carrousel': [photo('https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Arc_de_triomphe_du_carrousel_in_Paris_France.jpg/500px-Arc_de_triomphe_du_carrousel_in_Paris_France.jpg', 'Arc de Triomphe du Carrousel', 'Arco do Triunfo do Carrousel', 'Wikimedia Commons')],
  'par-maillol': [photo('https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/L%27Air_by_Aristide_Maillol%2C_Tuileries_garden%2C_Paris_11_August_2015.jpg/500px-L%27Air_by_Aristide_Maillol%2C_Tuileries_garden%2C_Paris_11_August_2015.jpg', 'Maillol statues', 'Estátuas de Maillol', 'Wikimedia Commons')],
  'par-passage-panoramas': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Passage_des_Panoramas%2C_Paris.jpg/500px-Passage_des_Panoramas%2C_Paris.jpg',
      'Passage des Panoramas glass roof and shopfronts',
      'Vidraça e fachadas do Passage des Panoramas',
      'Thomas Doussau · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-bouillon': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/%C5%92uf_mayonnaise.jpg/500px-%C5%92uf_mayonnaise.jpg',
      'Œuf mayonnaise, a bouillon classic (generic photo)',
      'Œuf mayonnaise, clássico dos bouillons (foto ilustrativa)',
      'Zheng Zhou · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chez_Chartier_1.JPG',
      'Bouillon Chartier',
      'Bouillon Chartier',
      'Wikimedia Commons',
    ),
  ],
  'par-cedric-grolet': [
    photo(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHUMAnnoa1qHK4CBkOUFhkT6bgEfPckQMSl9eauB91LSfFuLBNs-8_tq-m&s=10',
      'Cédric Grolet pastry',
      'Doce de Cédric Grolet',
      'Google',
    ),
  ],

  'par-alexandre-iii': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Pont_Alexandre_III_depuis_pont_de_la_Concorde_Paris.jpg/1280px-Pont_Alexandre_III_depuis_pont_de_la_Concorde_Paris.jpg',
      'Pont Alexandre III',
      'Pont Alexandre III',
      'Wikimedia Commons',
    ),
  ],
  'par-amorino': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Amorino_Gelato_Flowers.jpg/1280px-Amorino_Gelato_Flowers.jpg',
      'Amorino flower-shaped gelato',
      'Gelato em forma de flor da Amorino',
      'Wikimedia Commons',
    ),
  ],
  'par-andre-citroen': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/0/03/Serres_Parc-Andr%C3%A9-Citro%C3%ABn-Paris.jpg',
      'Parc André Citroën',
      'Parc André Citroën',
      'Wikimedia Commons',
    ),
  ],
  'par-alain-miam': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Grilled_Cheese_Sandwich_%2816938984390%29.jpg/1280px-Grilled_Cheese_Sandwich_%2816938984390%29.jpg',
      'Grilled cheese sandwich (generic photo)',
      'Sanduíche de queijo quente (foto ilustrativa)',
      'Willis Lam · CC BY-SA 2.0 · Wikimedia Commons',
    ),
  ],
  'par-bourse-commerce': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Bourse_Commerce_-_Paris_I_%28FR75%29_-_2021-06-05_-_1.jpg/1280px-Bourse_Commerce_-_Paris_I_%28FR75%29_-_2021-06-05_-_1.jpg',
      'Bourse de Commerce',
      'Bourse de Commerce',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Bourse_de_Commerce_P1060092.JPG/1280px-Bourse_de_Commerce_P1060092.JPG',
      'Bourse de Commerce dome',
      'Cúpula da Bourse de Commerce',
      'Wikimedia Commons',
    ),
  ],
  'par-carnavalet': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Carnavalet_Par%C3%ADs_10.JPG/1280px-Carnavalet_Par%C3%ADs_10.JPG',
      'Musée Carnavalet',
      'Musée Carnavalet',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Mus%C3%A9e_Carnavalet%2C_jardin%2C_3%C3%A8me_arrondissement%2C_Paris._PH10620.jpg/1280px-Mus%C3%A9e_Carnavalet%2C_jardin%2C_3%C3%A8me_arrondissement%2C_Paris._PH10620.jpg',
      'Musée Carnavalet garden',
      'Jardim do Musée Carnavalet',
      'Wikimedia Commons',
    ),
  ],
  'par-clichy-batignolles': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Parc_Clichy-Batignolles_-_Martin-Luther-King_%40_Paris_%2826959477591%29.jpg/1280px-Parc_Clichy-Batignolles_-_Martin-Luther-King_%40_Paris_%2826959477591%29.jpg',
      'Parc Clichy-Batignolles',
      'Parc Clichy-Batignolles',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Cerisiers_en_fleur_au_Parc_Martin_Luther_King_%28Clichy-Batignolles%29.jpg/1280px-Cerisiers_en_fleur_au_Parc_Martin_Luther_King_%28Clichy-Batignolles%29.jpg',
      'Cherry blossoms at Parc Clichy-Batignolles',
      'Cerejeiras no Parc Clichy-Batignolles',
      'Wikimedia Commons',
    ),
  ],
  'par-arc-triomphe': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Arc_de_Triomphe%2C_Paris_21_October_2010.jpg/1280px-Arc_de_Triomphe%2C_Paris_21_October_2010.jpg',
      'Arc de Triomphe',
      'Arc de Triomphe',
      'Wikimedia Commons',
    ),
  ],
  'par-arnaud-nicolas': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Paris_street_market_stall_-_charcuterie_counter_1.jpg/500px-Paris_street_market_stall_-_charcuterie_counter_1.jpg',
      'Charcuterie counter at a Paris market (generic photo)',
      'Balcão de charcutaria num mercado de Paris (foto ilustrativa)',
      'jimmyweee · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-auptitgrec': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Cr%C3%AApe_with_ham%2C_bacon%2C_cheese_%26_spinach_%40_Cr%C3%AAperie_Josselin_%40_Montparnasse_%40_Paris_%2833789534444%29.jpg/500px-Cr%C3%AApe_with_ham%2C_bacon%2C_cheese_%26_spinach_%40_Cr%C3%AAperie_Josselin_%40_Montparnasse_%40_Paris_%2833789534444%29.jpg',
      'Savory crêpe with ham, cheese and spinach (generic photo)',
      'Crepe salgado com presunto, queijo e espinafre (foto ilustrativa)',
      'Guilhem Vellut · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Paris-Rue_Mouffetard-160-nr_68-Au_p%27tit_Grec-2017-gje.jpg/1280px-Paris-Rue_Mouffetard-160-nr_68-Au_p%27tit_Grec-2017-gje.jpg',
      "Au P'tit Grec at 68 Rue Mouffetard",
      "Au P'tit Grec, 68 Rue Mouffetard",
      'Gerd Eichmann · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-bake-blend': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/%D9%83%D8%B1%D9%88%D8%A7%D8%B5%D9%86_%D8%A8%D9%8A%D8%B3%D8%AA%D8%A7%D8%B4_%D9%85%D8%B9_%D9%86%D8%B5-%D9%86%D8%B5.jpg/1280px-%D9%83%D8%B1%D9%88%D8%A7%D8%B5%D9%86_%D8%A8%D9%8A%D8%B3%D8%AA%D8%A7%D8%B4_%D9%85%D8%B9_%D9%86%D8%B5-%D9%86%D8%B5.jpg',
      'Pistachio croissant and coffee (generic photo)',
      'Croissant de pistache com café (foto ilustrativa)',
      'إيان · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-bakery-gaite': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Flan_p%C3%A2tissier_ou_flan_parisien.jpg/1280px-Flan_p%C3%A2tissier_ou_flan_parisien.jpg',
      'Flan pâtissier',
      'Flan pâtissier',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flan_p%C3%A2tissier_bron.jpg/1280px-Flan_p%C3%A2tissier_bron.jpg',
      'Flan pâtissier slice',
      'Fatia de flan pâtissier',
      'Wikimedia Commons',
    ),
  ],
  'par-bastille': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Place_de_la_Bastille%2C_avril_2021.jpg/3840px-Place_de_la_Bastille%2C_avril_2021.jpg',
      'Place de la Bastille',
      'Place de la Bastille',
      'Wikimedia Commons',
    ),
  ],
  'par-cafe-flore': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Caf%C3%A9_de_Flore_007.jpg/1280px-Caf%C3%A9_de_Flore_007.jpg',
      'Drink served on a Café de Flore saucer',
      'Bebida servida no pires do Café de Flore',
      'Arnaud 25 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-bateaux-mouches': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Bateaux_Mouches_Paris_2011.jpg/1280px-Bateaux_Mouches_Paris_2011.jpg',
      'Bateaux-Mouches boat on the Seine',
      'Barco Bateaux-Mouches no Sena',
      'Daniel Stockman · CC BY-SA 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Bateaux_Mouches%2C_Paris_%2815054976301%29.jpg/1280px-Bateaux_Mouches%2C_Paris_%2815054976301%29.jpg',
      'Bateaux-Mouches in Paris',
      'Bateaux-Mouches em Paris',
      'Joe deSousa · CC0 · Wikimedia Commons',
    ),
  ],
  'par-bhv-marais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/BHV_Le_Marais%2C_Paris_3_September_2016.jpg/1280px-BHV_Le_Marais%2C_Paris_3_September_2016.jpg',
      'BHV Marais',
      'BHV Marais',
      'Guilhem Vellut · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/BHV_-_Paris.jpg/1280px-BHV_-_Paris.jpg',
      'BHV Marais department store',
      'Loja de departamentos BHV Marais',
      'Marianne Casamance · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-bien-eleve': [
    photo(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSY4m17cZwr6AWZ3zvfmBP1u6cYz8BnFjijBliOyvTfFsI9W-qcFz9MSYwl&s=10',
      'Bien Élevé',
      'Bien Élevé',
      'Google',
    ),
    photo(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6r2hls0orPx9-kyg9ulL1N7Clk7PJ2L3_C1GqycCgTX2hB0FQ7trTjYU&s=10',
      'Bien Élevé dish',
      'Prato do Bien Élevé',
      'Google',
    ),
  ],
  'par-bike': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Station_V%C3%A9lib_-_Universit%C3%A9_Paris_Dauphine.jpg/1280px-Station_V%C3%A9lib_-_Universit%C3%A9_Paris_Dauphine.jpg',
      "Vélib' bike-share station",
      "Estação de bicicletas Vélib'",
      'Sukkoria · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-bnf': [
    photo(
      'https://images.adsttc.com/media/images/6166/a1ef/f91c/81b2/4700/01ba/newsletter/2017-06-01_15_19_21-bnf.jpg?1634116065',
      'Bibliothèque nationale de France — reading room',
      'Biblioteca Nacional da França — sala de leitura',
      'ArchDaily',
    ),
    photo(
      'https://arquitecturaviva.com/assets/uploads/obras/41197/av_medium__av_112727.webp?h=af96c42b',
      'Bibliothèque nationale de France — architecture',
      'Biblioteca Nacional da França — arquitetura',
      'Arquitectura Viva',
    ),
    photo(
      'https://fernandoeichenberg.files.wordpress.com/2017/02/labrouste3.jpg',
      'BnF Richelieu — Labrouste reading room',
      'BnF Richelieu — sala de leitura Labrouste',
      'Fernando Eichenberg',
    ),
  ],
  // Perto da BnF (IA, set/2026)
  'par-fuuki': [
    photo('/photos/paris/par-fuuki-3.webp', 'Gyoza on a plate at Fuuki', 'Gyoza no prato do Fuuki', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-fuuki-1.webp', 'Fuuki', 'Fuuki', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-fuuki-2.webp', 'Fuuki', 'Fuuki', 'Google Maps (foto de usuário, cópia local)'),
  ],
  'par-n-plus-un': [
    photo('/photos/paris/par-n-plus-un-3.webp', 'Gazpacho at N+1', 'Gaspacho no N+1', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-n-plus-un-1.webp', 'N+1', 'N+1', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-n-plus-un-2.webp', 'N+1', 'N+1', 'Google Maps (foto de usuário, cópia local)'),
  ],
  'par-le-quai-bnf': [
    photo('/photos/paris/par-le-quai-bnf-3.webp', 'Pizza at Le Quai', 'Pizza no Le Quai', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-le-quai-bnf-1.webp', 'Le Quai', 'Le Quai', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-le-quai-bnf-2.webp', 'Le Quai', 'Le Quai', 'Google Maps (foto de usuário, cópia local)'),
  ],
  'par-cajou': [
    photo('/photos/paris/par-cajou-3.webp', 'Pasta salad with tofu at Cajou', 'Salada de macarrão com tofu no Cajou', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-cajou-1.webp', 'Cajou', 'Cajou', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-cajou-2.webp', 'Cajou', 'Cajou', 'Google Maps (foto de usuário, cópia local)'),
  ],
  'par-kawaa-lumiere': [
    photo('/photos/paris/par-kawaa-lumiere-3.webp', 'Lemonade, coffee and a cookie at Kawaa Lumière', 'Limonada, café e cookie no Kawaa Lumière', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-kawaa-lumiere-1.webp', 'Kawaa Lumière', 'Kawaa Lumière', 'Google Maps (foto de usuário, cópia local)'),
    photo('/photos/paris/par-kawaa-lumiere-2.webp', 'Kawaa Lumière', 'Kawaa Lumière', 'Google Maps (foto de usuário, cópia local)'),
  ],
  'par-bercy-village': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Cour_Saint_%C3%89milion%2C_Bercy_Village_-_Paris_2012-04-08.jpg/960px-Cour_Saint_%C3%89milion%2C_Bercy_Village_-_Paris_2012-04-08.jpg',
      "Gate of the Cour Saint-Émilion, the pedestrian street of Bercy Village",
      "Portão da Cour Saint-Émilion, a rua de pedestres do Bercy Village",
      "Jim Linwood from London / Wikimedia Commons (CC BY 2.0)",
    ),
  ],
  'par-passerelle-simone-de-beauvoir': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Passerelle_Simone_Beauvoir_-_Paris_XII_%28FR75%29_-_2021-07-20_-_2.jpg/960px-Passerelle_Simone_Beauvoir_-_Paris_XII_%28FR75%29_-_2021-07-20_-_2.jpg',
      "Wooden lower deck of the Passerelle Simone-de-Beauvoir under its steel arch, with the Seine on both sides and the BnF towers behind",
      "Tabuleiro de madeira inferior da Passerelle Simone-de-Beauvoir sob o arco de aço, com o Sena dos dois lados e as torres da BnF ao fundo",
      "Chabe01 / Wikimedia Commons (CC BY-SA 4.0)",
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Passerelle_Simone-de-Beauvoir.jpg/960px-Passerelle_Simone-de-Beauvoir.jpg',
      "Side view of the lens-shaped Passerelle Simone-de-Beauvoir, its two curved decks crossing the Seine among trees",
      "Vista lateral da Passerelle Simone-de-Beauvoir em forma de lente, com os dois tabuleiros curvos cruzando o Sena entre árvores",
      "AHert / Wikimedia Commons (CC BY-SA 4.0)",
    ),
  ],
  'par-parc-de-bercy': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Pond_in_the_Parc_de_Bercy.jpg/960px-Pond_in_the_Parc_de_Bercy.jpg',
      "Pond and footbridge in the Parc de Bercy",
      "Lago e pontezinha no Parc de Bercy",
      "DiscoA340 / Wikimedia Commons (CC BY-SA 4.0)",
    ),
  ],
  'par-cinematheque-francaise': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Gehrys_American_Center_2011.jpg/960px-Gehrys_American_Center_2011.jpg',
      "The Frank Gehry building of the Cinémathèque française seen from the Parc de Bercy",
      "O prédio de Frank Gehry da Cinémathèque française visto do Parc de Bercy",
      "La Citta Vita / Wikimedia Commons (CC BY-SA 2.0)",
    ),
  ],
  'par-musee-arts-forains': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Man%C3%A8ge_du_Mus%C3%A9e_des_Arts_Forains_-_Bercy.JPG/960px-Man%C3%A8ge_du_Mus%C3%A9e_des_Arts_Forains_-_Bercy.JPG',
      "Painted canopy of an antique carousel at the Musée des Arts Forains",
      "Teto pintado de um carrossel antigo no Musée des Arts Forains",
      "Dinkum / Wikimedia Commons (CC0)",
    ),
  ],
  'par-les-frigos': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Paris_-_Les_Frigos_%289584023031%29.jpg/960px-Paris_-_Les_Frigos_%289584023031%29.jpg',
      "Graffiti-covered walls of Les Frigos",
      "Paredes cobertas de grafites no Les Frigos",
      "Anicius Olybrius / Wikimedia Commons (CC BY-SA 2.0)",
    ),
  ],
  'par-bohemia': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Blueberry_Pancakes_-_Nowhere_Man_2023-09-21.jpg/1280px-Blueberry_Pancakes_-_Nowhere_Man_2023-09-21.jpg',
      'Blueberry pancakes (generic photo)',
      'Panquecas de mirtilo (foto ilustrativa)',
      'Andy Li · CC0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/a/aa/Blueberry_pancakes_%281%29.jpg',
      'Blueberry pancakes (generic photo)',
      'Panquecas de mirtilo (foto ilustrativa)',
      'jeffreyw · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-bon-marche': [
    photo(
      'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/07/35/35/68/le-bon-marche.jpg?w=1200&h=-1&s=1',
      'Le Bon Marché, Paris',
      'Le Bon Marché, Paris',
      'TripAdvisor',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/b/b8/Le_Bon_March%C3%A9%2C_Paris_3_November_2008_-_panoramio.jpg',
      'Le Bon Marché façade, Paris',
      'Fachada do Le Bon Marché, Paris',
      'Wikimedia Commons',
    ),
  ],
  'par-boulogne': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Lac_Inf%C3%A9rieur_du_Bois_de_Boulogne%2C_Paris_26_August_2015.jpg/500px-Lac_Inf%C3%A9rieur_du_Bois_de_Boulogne%2C_Paris_26_August_2015.jpg',
      'The lower lake in the Bois de Boulogne',
      'O lago inferior do Bois de Boulogne',
      'BikerNormand · CC BY-SA 2.0 · Wikimedia Commons',
    ),
  ],
  'par-brasserie-pres': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Steak_frites_-paris_%2815126302149%29.jpg/500px-Steak_frites_-paris_%2815126302149%29.jpg',
      'Steak frites in Paris (generic photo)',
      'Steak frites em Paris (foto ilustrativa)',
      'Geoff Peters · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-burger-king-opera': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/9/91/Burger_King_Whopper_Combo.jpg',
      'Whopper meal (generic photo)',
      'Combo Whopper (foto ilustrativa)',
      'Siqbal · Public domain · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/BK_Whopper.JPG/1280px-BK_Whopper.JPG',
      'Whopper (generic photo)',
      'Whopper (foto ilustrativa)',
      'BrokenSphere · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-buttes-chaumont': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Passerelle_suspendue%2C_Buttes_Chaumont%2C_Paris_14_April_2014.jpg/3840px-Passerelle_suspendue%2C_Buttes_Chaumont%2C_Paris_14_April_2014.jpg',
      'Parc des Buttes-Chaumont',
      'Parc des Buttes-Chaumont',
      'Wikimedia Commons',
    ),
  ],
  'par-canals': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Canal_Saint-Martin_Passerelle_de_la_Grange-aux-Belles_001.JPG/1280px-Canal_Saint-Martin_Passerelle_de_la_Grange-aux-Belles_001.JPG',
      'Grange-aux-Belles footbridge, Canal Saint-Martin',
      'Passarela da Grange-aux-Belles, Canal Saint-Martin',
      'Moonik · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/2022-04-14-Passerelle_de_la_Grange-aux-Belles-8590.jpg/1280px-2022-04-14-Passerelle_de_la_Grange-aux-Belles-8590.jpg',
      'Canal Saint-Martin at the Grange-aux-Belles footbridge',
      'Canal Saint-Martin na passarela da Grange-aux-Belles',
      'Superbass · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-canals-republique': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Canal_Saint-Martin_Passerelle_de_la_Grange-aux-Belles_001.JPG/1280px-Canal_Saint-Martin_Passerelle_de_la_Grange-aux-Belles_001.JPG',
      'Grange-aux-Belles footbridge, Canal Saint-Martin',
      'Passarela da Grange-aux-Belles, Canal Saint-Martin',
      'Moonik · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-champ-mars': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Champ_de_Mars_from_the_Eiffel_Tower_-_July_2006_edit.jpg/1280px-Champ_de_Mars_from_the_Eiffel_Tower_-_July_2006_edit.jpg',
      'Champ de Mars',
      'Champ de Mars',
      'Wikimedia Commons',
    ),
  ],
  'par-chapelle-saint-louis': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/%C3%89cole_Militaire%2C_Paris_-_Main_facade_central_pavilion_roof_detailing_showing_clock_and_triangular_pediment.jpg/500px-%C3%89cole_Militaire%2C_Paris_-_Main_facade_central_pavilion_roof_detailing_showing_clock_and_triangular_pediment.jpg',
      "Close-up of the École Militaire's central pavilion, clock and pediment",
      'Pavilhão central da École Militaire de perto, com o relógio e o frontão',
      'iMahesh · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/%C3%89cole_Militaire_from_Champ-de-Mars%2C_May_2012.jpg/1280px-%C3%89cole_Militaire_from_Champ-de-Mars%2C_May_2012.jpg',
      'École Militaire from the Champ de Mars; the chapel is in its north wing',
      'École Militaire vista do Champ de Mars; a capela fica na ala norte',
      'Alexander Baranov · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-champs-elysees': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/6/6d/Avenue_des_Champs-%C3%89lys%C3%A9es_July_24%2C_2009_N1.jpg',
      'Champs-Élysées',
      'Champs-Élysées',
      'Wikimedia Commons',
    ),
  ],
  'par-chateau-vincennes': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Vincennes_-_Chateau_02.jpg/3840px-Vincennes_-_Chateau_02.jpg',
      'Château de Vincennes',
      'Château de Vincennes',
      'Wikimedia Commons',
    ),
  ],
  'par-chatelet': [
    photo(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7BGcefKa4C2d8TJ7eV4SrT4Rc5LH-La-EeaqFA90gMBKSK5DMoZA30b6n&s=10',
      'Place du Châtelet',
      'Place du Châtelet',
      'Google',
    ),
  ],
  'par-chez-elo': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Confit_de_canard_Licq-Atherey.jpg/1280px-Confit_de_canard_Licq-Atherey.jpg',
      'Duck confit (generic photo)',
      'Confit de pato (foto ilustrativa)',
      'Tangopaso · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Duck_Confit_%283375036024%29.jpg/1280px-Duck_Confit_%283375036024%29.jpg',
      'Duck confit (generic photo)',
      'Confit de pato (foto ilustrativa)',
      'Mack Male · CC BY-SA 2.0 · Wikimedia Commons',
    ),
  ],
  'par-chez-janou': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Mousse_au_Chocolat_2010_003.JPG/500px-Mousse_au_Chocolat_2010_003.JPG',
      'Chocolate mousse (generic photo)',
      'Mousse de chocolate (foto ilustrativa)',
      'Bin im Garten · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://live.staticflickr.com/55/143096731_7a3ef7ff8f_b.jpg',
      'Chez Janou',
      'Chez Janou',
      'Flickr (CC via Openverse)',
    ),
  ],
  'par-cour-commerce': [
    photo(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJfzCM8dK9-9DFYUJkH5aqh7oRnrpz1U4kQ61kjKb78oG1MrKrHVodKXFs&s=10',
      'Cour du Commerce Saint-André',
      'Cour du Commerce Saint-André',
      'Google',
    ),
    photo(
      'https://worldinparis.com/wp-content/uploads/2020/12/Cour-du-Commerce-Saint-Andre-Paris.jpg',
      'Cour du Commerce Saint-André passage',
      'Passagem Cour du Commerce Saint-André',
      'World in Paris',
    ),
    photo(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsrMuMijTCb1mS7bTN39gh_WRDGNfngQa76GaR4pNUmF3BdRElZG0cjk4&s=10',
      'Cour du Commerce Saint-André',
      'Cour du Commerce Saint-André',
      'Google',
    ),
  ],
  'par-creperie-arts': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SQQYs3a-EKG7K-KK1xQemI-V8axeDMrsR5iXBm2kDddLP4XNCho_ivInLO5DN9yxJ7qmOleJj5ZO_6b_RA5jaDFHOljiz9VXIBxN51qauBwC9a217iR1KYgifmwZrnJ1ImcE_LwSAAdWkI=s920-k-no',
      'Crêperie des Arts',
      'Crêperie des Arts',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9S-Co9vEUCGmQy0OnvdX3Z5A4szI7xSahAQkUjm8huq3cHSPF3TlVmrhMpZo-z92VNl3qrWLehDK6W3IL04ZtoiOlQ71VqoL-Kp0dOFd9lmMTPmxEN3L8gH7OIVFruBLssKeoV6PfwLKh3s=s731-k-no',
      'Crêperie des Arts',
      'Crêperie des Arts',
      'Google Maps',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/5/59/Cr%C3%AAperie_des_Arts%2C_27_Rue_Saint-Andr%C3%A9-des-Arts_%28Paris%29_2010-07-29.jpg',
      'Crêperie des Arts',
      'Crêperie des Arts',
      'Wikimedia Commons',
    ),
  ],
  'par-disneyland': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Sleeping_Beauty_Castle_DLP_Jan_2013.jpg/1280px-Sleeping_Beauty_Castle_DLP_Jan_2013.jpg',
      'Disneyland Paris — Sleeping Beauty Castle',
      'Disneyland Paris — Castelo da Bela Adormecida',
      'Wikimedia Commons',
    ),
  ],
  'par-cafe-lateral': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/d/dc/Croissants_au_beurre_%2818953292873%29.jpg',
      'Butter croissants (illustrative photo)',
      'Croissants na manteiga (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-eclair-genie': [
    photo(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhMAM7N2tcdxVfxVPeyk8nRURyi11fzq8FSMdaOG7zWqVZA8D7aGTgyKU&s=10',
      "L'Éclair de Génie",
      "L'Éclair de Génie",
      'Google',
    ),
    photo(
      'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjHHZ35fyr0Lg5UrmGl62D3tuvTSrvNlhEfVlDPl7F0tkh9XLOAErt5vUMFFu6BDRQK9Ojsj6gGjqRnOCiAI-3Al3PpfVseDA1VdoyBf1ZdGwyhkLatzlLcEkyoGe7RZVoab6T4hyphenhyphenjPuLYt/s1600/eclair+de+genie+011.JPG',
      "L'Éclair de Génie éclairs",
      "Éclairs L'Éclair de Génie",
      'Blogger',
    ),
  ],
  'par-eiffel': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg/1280px-Tour_Eiffel_Wikimedia_Commons_%28cropped%29.jpg',
      'Eiffel Tower',
      'Eiffel Tower',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Tour_Eiffel_vue_du_Champ-de-Mars.jpg/1280px-Tour_Eiffel_vue_du_Champ-de-Mars.jpg',
      'Eiffel Tower',
      'Eiffel Tower',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Eiffel_Tower_and_Pont_Alexandre_III_at_night.jpg/1280px-Eiffel_Tower_and_Pont_Alexandre_III_at_night.jpg',
      'Eiffel Tower',
      'Eiffel Tower',
      'Wikimedia Commons',
    ),
  ],
  'par-entrecote': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Steak-frites_%28steak-and-chips%29.jpg/1280px-Steak-frites_%28steak-and-chips%29.jpg',
      'Steak frites (generic photo)',
      'Steak frites (foto ilustrativa)',
      'Dcollard · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Steak_frites_-_yummy.jpg/1280px-Steak_frites_-_yummy.jpg',
      'Steak frites (generic photo)',
      'Steak frites (foto ilustrativa)',
      'LuvsMG481 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-esplanade-de-gaulle': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Grande_Arche_de_La_D%C3%A9fense_et_fontaine_FOPed_grey.jpg/1280px-Grande_Arche_de_La_D%C3%A9fense_et_fontaine_FOPed_grey.jpg',
      'Grande Arche and fountain at La Défense, by the esplanade',
      'Grande Arche e fonte em La Défense, na esplanada',
      'Atoma · CC BY 2.5 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Esplanade_G%C3%A9n%C3%A9ral_Gaulle_-_Courbevoie_%28FR92%29_-_2023-09-16_-_6.jpg/1280px-Esplanade_G%C3%A9n%C3%A9ral_Gaulle_-_Courbevoie_%28FR92%29_-_2023-09-16_-_6.jpg',
      'Esplanade du Général de Gaulle, La Défense',
      'Esplanade du Général de Gaulle, La Défense',
      'Chabe01 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-five-guys-rivoli': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Five_Guys%2C_Paris_%2820181003_211829%29.jpg/1280px-Five_Guys%2C_Paris_%2820181003_211829%29.jpg',
      'Five Guys in Paris',
      'Five Guys em Paris',
      'Matti Blume · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Int%C3%A9rieur_Restaurant_Five_Guys_Place_R%C3%A9publique_-_Paris_III_%28FR75%29_-_2024-12-08_-_2.jpg/1280px-Int%C3%A9rieur_Restaurant_Five_Guys_Place_R%C3%A9publique_-_Paris_III_%28FR75%29_-_2024-12-08_-_2.jpg',
      'Five Guys République dining room (another branch)',
      'Salão do Five Guys République (outra loja)',
      'Chabe01 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-felicita': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Pizza_%2840295714762%29.jpg/500px-Pizza_%2840295714762%29.jpg',
      'Pizza (generic photo)',
      'Pizza (foto ilustrativa)',
      'N i c o l a · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/1/17/Bar_et_restaurant_dans_La_Felicit%C3%A0%2C_Paris._02.jpg',
      'La Felicità',
      'La Felicità',
      'Wikimedia Commons',
    ),
  ],
  'par-fondation-lv': [
    photo(
      'https://upload.wikimedia.org/wikipedia/en/0/03/Fondation_Louis_Vuitton_-_Paris_%2850569906682%29.jpg',
      'Fondation Louis Vuitton',
      'Fondation Louis Vuitton',
      'Wikimedia Commons',
    ),
  ],
  'par-forum-halles': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Entree_Forum_des_Halles_et_Bourse_de_Commerce_P1060107.JPG/1280px-Entree_Forum_des_Halles_et_Bourse_de_Commerce_P1060107.JPG',
      'Forum des Halles entrance and the Bourse de Commerce',
      'Entrada do Forum des Halles e a Bourse de Commerce',
      'Pline · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Forum_des_Halles_%28Paris%29_%282%29.jpg/1280px-Forum_des_Halles_%28Paris%29_%282%29.jpg',
      'Forum des Halles',
      'Forum des Halles',
      'Gzen92 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-francette': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Moules-frites_bi%C3%A8re.jpg/500px-Moules-frites_bi%C3%A8re.jpg',
      'Mussels and fries with beer (generic photo)',
      'Moules-frites com cerveja (foto ilustrativa)',
      'Olga Rithme · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-franklin-passy': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Entrec%C3%B4te.JPG/500px-Entrec%C3%B4te.JPG',
      'Entrecôte steak (generic photo)',
      'Entrecôte (foto ilustrativa)',
      'Abracadabra2000 · Public domain · Wikimedia Commons',
    ),
  ],
  'par-fric-frac': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Cambodian_Croque_Monsieur.jpg/1280px-Cambodian_Croque_Monsieur.jpg',
      'Croque-monsieur and coffee (generic photo)',
      'Croque-monsieur com café (foto ilustrativa)',
      'Photogoddle · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Croque_Monsieur_and_Croque_Madame_-_Milfey_Patisserie_2026-01-03.jpg/1280px-Croque_Monsieur_and_Croque_Madame_-_Milfey_Patisserie_2026-01-03.jpg',
      'Croque-monsieur and croque-madame (generic photo)',
      'Croque-monsieur e croque-madame (foto ilustrativa)',
      'Andy Li · CC0 · Wikimedia Commons',
    ),
  ],
  'par-galeries-lafayette': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Paris%2C_Galeries_Lafayette_Haussmann%2C_Coupole.jpg/1280px-Paris%2C_Galeries_Lafayette_Haussmann%2C_Coupole.jpg',
      'Galeries Lafayette dome and balconies',
      'Cúpula e balcões das Galeries Lafayette',
      'Dr. Thomas Liptak · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Paris_-_Galeries_Lafayette_Haussmann_%E2%80%93_Cupola_%E2%80%93_20230425_PvE_%28Q113561459%29.jpg/1280px-Paris_-_Galeries_Lafayette_Haussmann_%E2%80%93_Cupola_%E2%80%93_20230425_PvE_%28Q113561459%29.jpg',
      'Galeries Lafayette dome',
      'Cúpula das Galeries Lafayette',
      'Pveverdingen · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/GaleriesLafayetteNuit.jpg/1280px-GaleriesLafayetteNuit.jpg',
      'Galeries Lafayette at night',
      'Galeries Lafayette à noite',
      'Wikimedia Commons',
    ),
  ],
  'par-grande-arche': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Grande_Arche_de_La_D%C3%A9fense_et_fontaine_FOPed_grey.jpg/1280px-Grande_Arche_de_La_D%C3%A9fense_et_fontaine_FOPed_grey.jpg',
      'Grande Arche de la Défense',
      'Grande Arche de La Défense',
      'Atoma · CC BY 2.5 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/North_facade_of_the_Grande_Arche_de_la_D%C3%A9fense_-_20050906.jpg/1280px-North_facade_of_the_Grande_Arche_de_la_D%C3%A9fense_-_20050906.jpg',
      'North face of the Grande Arche',
      'Fachada norte do Grande Arche',
      'Tognopop · CC0 · Wikimedia Commons',
    ),
  ],
  'par-horloge': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Q4xBpHgLw5zBXFO10Izad6wdbQnctb56aJaP9xn5l11Ruhz4ljOduMzmgFRjccldppn58FT2BmWhNi7mUbiB3kkcmH1aUl0RzOPJQy9HFSkIyST9abKxkEUaYBlZim7BlBb_eD40J8qS9M=s608-k-no',
      'Close-up of the ornate Conciergerie clock',
      'Relógio ornamentado da Conciergerie, de perto',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QBlML2ylD2p4TXk9FgMi90Nl1zRfJMigvQyI_80-haM7pDffTq7miNkDXt964Pbgt-yLES7P_-SdFRis4K-1TtIMIni1qvIMStdl2gDATgPI7yZ1QQD0bEXVLe0xiIXE0A4UI6aQ=s693-k-no',
      'Conciergerie Clock',
      'Relógio da Conciergerie',
      'Google Maps',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/5/5f/Paris_Conciergerie_265.jpg',
      'Conciergerie Clock',
      'Conciergerie Clock',
      'Wikimedia Commons',
    ),
  ],
  'par-hotel-ville': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/H%C3%B4tel_ville_fa%C3%A7ade_principale_Paris_11.jpg/3840px-H%C3%B4tel_ville_fa%C3%A7ade_principale_Paris_11.jpg',
      'Hôtel de Ville',
      'Hôtel de Ville',
      'Wikimedia Commons',
    ),
  ],
  'par-invalides': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/H%C3%B4tel_des_Invalides_from_the_Eiffel_Tower%2C_23_July_2009.jpg/3840px-H%C3%B4tel_des_Invalides_from_the_Eiffel_Tower%2C_23_July_2009.jpg',
      'Invalides',
      'Invalides',
      'Wikimedia Commons',
    ),
  ],
  'par-jeffrey-cagnes': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Paris-brest_1.jpg/1280px-Paris-brest_1.jpg',
      'Paris-Brest (generic photo)',
      'Paris-Brest (foto ilustrativa)',
      'lazy fri13th · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Paris_brest_-_Milfey_Patisserie_2025-12-08.jpg/1280px-Paris_brest_-_Milfey_Patisserie_2025-12-08.jpg',
      'Paris-Brest (generic photo)',
      'Paris-Brest (foto ilustrativa)',
      'Andy Li · CC0 · Wikimedia Commons',
    ),
  ],
  'par-la-defense': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/La_D%C3%A9fense_Juin_2025.jpg/3840px-La_D%C3%A9fense_Juin_2025.jpg',
      'La Défense',
      'La Défense',
      'Wikimedia Commons',
    ),
  ],
  'par-la-villette': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Rio_Samba_School_statue_%40_Parc_de_La_Villette_%40_Paris_%2828881779791%29.jpg/3840px-Rio_Samba_School_statue_%40_Parc_de_La_Villette_%40_Paris_%2828881779791%29.jpg',
      'Parc de la Villette',
      'Parc de la Villette',
      'Wikimedia Commons',
    ),
  ],
  'par-louvre': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Louvre_Museum_Wikimedia_Commons.jpg/1280px-Louvre_Museum_Wikimedia_Commons.jpg',
      'Louvre',
      'Louvre',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Cour_Napol%C3%A9on_at_night_-_Louvre.jpg/1280px-Cour_Napol%C3%A9on_at_night_-_Louvre.jpg',
      'Louvre',
      'Louvre',
      'Wikimedia Commons',
    ),
  ],
  'par-luxembourg': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/LuxembourgMontparnasse.JPG/1280px-LuxembourgMontparnasse.JPG',
      'Luxembourg Garden',
      'Luxembourg Garden',
      'Wikimedia Commons',
    ),
  ],
  'par-luxor-obelisk': [
    photo(
      'https://img.magnific.com/premium-photo/luxor-obelisk-place-de-la-concorde-paris-capital-france_261932-8224.jpg',
      'Luxor Obelisk at Place de la Concorde, Paris',
      'Obelisco de Luxor na Place de la Concorde, Paris',
      'Magnific',
    ),
    photo(
      'https://fotografias.lasexta.com/clipping/cmsimages01/2023/04/12/05082BFF-B01C-4A6B-B55D-B6511430A940/obelisco-luxor-que-fue-trasladado-tebas-paris_104.jpg?crop=853,853,x215,y0&width=1200&height=1200&optimize=low&format=webply',
      'Luxor Obelisk — close-up of hieroglyphs',
      'Obelisco de Luxor — detalhe dos hieróglifos',
      'laSexta',
    ),
  ],
  'par-madeleine': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/f/fc/Eglise_de_la_Madeleine_2024.jpg',
      'Église de la Madeleine',
      'Église de la Madeleine',
      'Wikimedia Commons',
    ),
  ],
  'par-maison-balzac': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Maison_de_Balzac%2C_Paris_16e_5.jpg/1280px-Maison_de_Balzac%2C_Paris_16e_5.jpg',
      'Maison de Balzac',
      'Maison de Balzac',
      'Wikimedia Commons',
    ),
  ],
  'par-maison-isabelle': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SYOrwUjKmbonqSVOTQ1GPSdxeSDTnEciQBFONz5IlpR4eK1TViRVM_Vh-fMGF_fDnSJGsiQjXfNyKh4HbJlRrGudtm1m3VlAveZ-sdzf4zat4qE5kxd6evpibpIwjmwAqQPSwjHOgmxOQh=s812-k-no',
      "Award-winning croissants at La Maison d'Isabelle",
      "Croissants premiados da La Maison d'Isabelle",
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SmqsLPSRsrnEAj0ghApbdgEZyyjRRTZ6KjKvGykjako-N7MmzNczx0ZrWLSOKYo43Bf2wO6YhaKFFogJh05LnEmAPo2o63DbXTywG5QB7KND55n7_sEF696OYwFRnXAGtCh7UBiddYxG0=s1016-k-no',
      "La Maison d'Isabelle",
      "La Maison d'Isabelle",
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SznvKsiXeuOvjo7K06S5V_SYa7yq0qULMkFhDf5Z4417WPzzpmVexQJsEQrVUFZfMDPitrHjt3QApCdu9GLgu-6c_MNQ_U_3TKDMtKWbpLJnBPVV-XRql4ryDNMc2neiIP2H6-DvqXI_4S=s773-k-no',
      "La Maison d'Isabelle",
      "La Maison d'Isabelle",
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9R7ioJtxYKis-SS65Ju_xYTuTt4eykD37V40ASx9T9iBO8twaMP0ah6Iu9jHNn6w1_C-6_vLhVzv9upj6SQqakrlSWwoNx8sqY5q5N_iAoxznV-ikXbXrWRlz8KULXzllyB5sli=s1354-k-no',
      "La Maison d'Isabelle",
      "La Maison d'Isabelle",
      'Google Maps',
    ),
  ],
  'par-marais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/d/d3/Paris_Hotel_de_Sens_dsc04028.jpg',
      'Le Marais',
      'Le Marais',
      'Wikimedia Commons',
    ),
  ],
  'par-marche-aligre': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/March%C3%A9_d%27Aligre_2.jpg/1280px-March%C3%A9_d%27Aligre_2.jpg',
      "Marché d'Aligre",
      "Marché d'Aligre",
      'Jesús Gorriti · CC BY-SA 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/March%C3%A9_dAligre_4.jpg/1280px-March%C3%A9_dAligre_4.jpg',
      "Stalls at the Marché d'Aligre",
      "Bancas do Marché d'Aligre",
      'Jesús Gorriti · CC BY-SA 2.0 · Wikimedia Commons',
    ),
  ],
  'par-marche-bastille': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/March%C3%A9_Bastille%2C_Paris_December_2006_007.jpg/1280px-March%C3%A9_Bastille%2C_Paris_December_2006_007.jpg',
      'Marché Bastille',
      'Marché Bastille',
      'ayustety · CC BY-SA 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/March%C3%A9_Bastille%2C_Paris_18_October_2012_001.jpg/1280px-March%C3%A9_Bastille%2C_Paris_18_October_2012_001.jpg',
      'Stalls at the Marché Bastille',
      'Bancas do Marché Bastille',
      'alans1948 · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-marche-enfants-rouges': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Paris_III-March%C3%A9_des_Enfants-Rouges.jpg/1280px-Paris_III-March%C3%A9_des_Enfants-Rouges.jpg',
      'Marché des Enfants Rouges',
      'Marché des Enfants Rouges',
      'Popolon · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Vegetables_at_the_March%C3%A9_des_Enfants_Rouges.jpg/1280px-Vegetables_at_the_March%C3%A9_des_Enfants_Rouges.jpg',
      'Vegetables at the Marché des Enfants Rouges',
      'Legumes no Marché des Enfants Rouges',
      'Mx. Granger · CC0 · Wikimedia Commons',
    ),
  ],
  'par-mcdonalds-champs': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Mc._Donald%27s_-_Champs_Elyses_%289658470570%29.jpg/1280px-Mc._Donald%27s_-_Champs_Elyses_%289658470570%29.jpg',
      "McDonald's on the Champs-Élysées",
      "McDonald's da Champs-Élysées",
      'flightlog · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/McDonald%27s%2C_140_Avenue_des_Champs-%C3%89lys%C3%A9es%2C_Paris_15_July_2006.jpg/1280px-McDonald%27s%2C_140_Avenue_des_Champs-%C3%89lys%C3%A9es%2C_Paris_15_July_2006.jpg',
      "McDonald's, 140 Avenue des Champs-Élysées",
      "McDonald's, 140 Avenue des Champs-Élysées",
      'Jon Kragh · CC BY-SA 2.0 · Wikimedia Commons',
    ),
  ],
  'par-metro-2': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Viaduc_Ligne_2_M%C3%A9tro_Boulevard_Chapelle_Paris_7.jpg/500px-Viaduc_Ligne_2_M%C3%A9tro_Boulevard_Chapelle_Paris_7.jpg',
      "Line 2's elevated viaduct over Boulevard de la Chapelle",
      'Viaduto elevado da Linha 2 sobre o Boulevard de la Chapelle',
      'Chabe01 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-metro-6': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/0/01/Pont_de_Bir-Hakeim%2C_may_2025.jpg',
      'Metro Line 6',
      'Metro Line 6',
      'Wikimedia Commons',
    ),
  ],
  'par-michalak': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Religieuses_au_chocolat.jpg/1280px-Religieuses_au_chocolat.jpg',
      'Chocolate religieuses pastry',
      'Religieuses de chocolate',
      'Wikimedia Commons',
    ),
  ],
  'par-michalak-printemps': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/d/dc/Croissants_au_beurre_%2818953292873%29.jpg',
      'Butter croissants (generic photo)',
      'Croissants na manteiga (foto ilustrativa)',
      'Herry Wibisono · CC0 · Wikimedia Commons',
    ),
  ],
  'par-michalak-etienne': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Tarte_aux_fraises_%28Nice%29.jpg/1280px-Tarte_aux_fraises_%28Nice%29.jpg',
      'Strawberry tart (generic photo)',
      'Torta de morango (foto ilustrativa)',
      'Tangopaso · Public domain · Wikimedia Commons',
    ),
  ],
  'par-artizans': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Steak-frites_%28steak-and-chips%29.jpg/500px-Steak-frites_%28steak-and-chips%29.jpg',
      'Steak frites (generic photo)',
      'Steak frites (foto ilustrativa)',
      'Dcollard · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-monceau': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Rotonde_Chartres_Paris_3.jpg/3840px-Rotonde_Chartres_Paris_3.jpg',
      'Parc Monceau',
      'Parc Monceau',
      'Wikimedia Commons',
    ),
  ],
  'par-monoprix-rivoli': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/MONOPRIX_-_%E3%83%A2%E3%83%8E%E3%83%97%E3%83%AA_-_panoramio.jpg/1280px-MONOPRIX_-_%E3%83%A2%E3%83%8E%E3%83%97%E3%83%AA_-_panoramio.jpg',
      'A Monoprix store in Paris',
      'Uma loja Monoprix em Paris',
      'mayatomo · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-montmartre': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Butte_Montmartre%2C_Place_du_Tertre%2C_Paris.jpg/500px-Butte_Montmartre%2C_Place_du_Tertre%2C_Paris.jpg',
      'Place du Tertre, at the top of Montmartre',
      'Place du Tertre, no alto de Montmartre',
      'Britchi Mirela · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-montorgueil': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Paris_-_Rue_Montorgueil.JPG/1280px-Paris_-_Rue_Montorgueil.JPG',
      'Rue Montorgueil',
      'Rue Montorgueil',
      'Jean-Christophe BENOIST · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/P1010070_Paris_Ier_Rue_Montorgueil_n%C2%B012_reductwk.JPG/1280px-P1010070_Paris_Ier_Rue_Montorgueil_n%C2%B012_reductwk.JPG',
      'Shopfront on Rue Montorgueil',
      'Fachada na Rue Montorgueil',
      'Mbzt · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-montparnasse': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9QlqkpGttf5QhZpqcRO4GgFVkgvoLx3X_ubDgqFF3OaVAKdwvkuz5lrptL81rQJVXdPs_Ckd6BzGPocQZ73HZuSsun2Xkes_OPrYz82W-QLmKxqw3FJxEvpQSeDLgCHxNcyenPG=s928-k-no',
      'Tour Montparnasse over the rooftops, Eiffel Tower in the distance',
      'Tour Montparnasse sobre os telhados, com a Torre Eiffel ao fundo',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9RL5PP2rYrfKBOi3lfiAAkQK0QW6232raeOELmTrQaFv3o7LFCzK_H9wIxhacRgIND3M44MjhX81a5iSKoCtkFjTQg1Ft8uHTOnmsgjRAC074ka71fjF3XKZPl0CMHvEvcP-MXkfZilcoU=s811-k-no',
      'Rooftop terrace with the PARIS letters',
      'Terraço do topo com as letras PARIS',
      'Google Maps',
    ),
  ],
  'par-moulin-rouge': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Moulin_Rouge%2C_17_April_2011.jpg/3840px-Moulin_Rouge%2C_17_April_2011.jpg',
      'Moulin Rouge',
      'Moulin Rouge',
      'Wikimedia Commons',
    ),
  ],
  'par-notre-dame': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Notre-Dame_de_Paris%2C_4_October_2017.jpg/1280px-Notre-Dame_de_Paris%2C_4_October_2017.jpg',
      'Notre-Dame west façade from the Seine',
      'Fachada oeste de Notre-Dame vista do Sena',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Notre-Dame_de_Paris%2C_across_the_Seine%2C_before_reopening.jpg/1280px-Notre-Dame_de_Paris%2C_across_the_Seine%2C_before_reopening.jpg',
      'Notre-Dame across the Seine',
      'Notre-Dame vista do outro lado do Sena',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Notre-Dame_de_Paris_from_the_Pont_de_l%27Archev%C3%AAch%C3%A9_by_Night.jpg/1280px-Notre-Dame_de_Paris_from_the_Pont_de_l%27Archev%C3%AAch%C3%A9_by_Night.jpg',
      'Notre-Dame at night from Pont de l’Archevêché',
      'Notre-Dame à noite a partir do Pont de l’Archevêché',
      'Wikimedia Commons',
    ),
  ],
  'par-opera': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Paris_Opera_full_frontal_architecture%2C_May_2009.jpg/1280px-Paris_Opera_full_frontal_architecture%2C_May_2009.jpg',
      'Opéra Garnier',
      'Opéra Garnier',
      'Wikimedia Commons',
    ),
  ],
  'par-orangerie': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/b/bb/Mus%C3%A9e_de_l%E2%80%99Orangerie_exterior.JPG',
      'Musée de l\'Orangerie',
      'Musée de l\'Orangerie',
      'Wikimedia Commons',
    ),
  ],
  'par-orsay': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/Mus%C3%A9e_d%27Orsay%2C_North-West_view%2C_Paris_7e_140402.jpg/1280px-Mus%C3%A9e_d%27Orsay%2C_North-West_view%2C_Paris_7e_140402.jpg',
      'Musée d\'Orsay',
      'Musée d\'Orsay',
      'Wikimedia Commons',
    ),
  ],
  'par-ory': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Paris-Orly_Aerial.jpg/1280px-Paris-Orly_Aerial.jpg',
      'Orly Airport (ORY)',
      'Orly Airport (ORY)',
      'Wikimedia Commons',
    ),
  ],
  'par-orly-paul': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/5/57/Pain_au_chocolat_from_French_Made_Baking.jpg',
      'Pain au chocolat (generic photo)',
      'Pain au chocolat (foto ilustrativa)',
      'Christine Rondeau · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Pain_au_Chocolat.jpg/1280px-Pain_au_Chocolat.jpg',
      'Pain au chocolat (generic photo)',
      'Pain au chocolat (foto ilustrativa)',
      'Andre lleo · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-cdg-paul': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Pain_au_chocolat_Luc_Viatour.jpg/1280px-Pain_au_chocolat_Luc_Viatour.jpg',
      'PAUL CDG — croissants & coffee',
      'PAUL CDG — croissants e café',
      'Wikimedia Commons',
    ),
  ],
  'par-cdg-brioche-doree': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/9/91/Croissant_hk_jp.jpg',
      'Croissant (generic photo)',
      'Croissant (foto ilustrativa)',
      'SUBARUsti2020hk · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-cdg': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Aerial_view_of_Paris-Charles_de_Gaulle_airport.jpg/1280px-Aerial_view_of_Paris-Charles_de_Gaulle_airport.jpg',
      'Charles de Gaulle Airport (CDG)',
      'Aeroporto Charles de Gaulle (CDG)',
      'Wikimedia Commons',
    ),
  ],
  'par-palais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/France-000296_-_Paris%27_Grand_Palais_%2814525102530%29.jpg/1280px-France-000296_-_Paris%27_Grand_Palais_%2814525102530%29.jpg',
      'Grand Palais',
      'Grand Palais',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Petit_Palais_%40_Paris_%2834081687993%29.jpg/1280px-Petit_Palais_%40_Paris_%2834081687993%29.jpg',
      'Petit Palais',
      'Petit Palais',
      'Wikimedia Commons',
    ),
  ],
  'par-petit-palais-cafe': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Lyon_2e_-_Hard_Rock_Cafe%2C_p%C3%A2tisseries_du_th%C3%A9_ou_caf%C3%A9_gourmand.jpg/500px-Lyon_2e_-_Hard_Rock_Cafe%2C_p%C3%A2tisseries_du_th%C3%A9_ou_caf%C3%A9_gourmand.jpg',
      'Café gourmand with mini desserts (generic photo)',
      'Café gourmand com mini sobremesas (foto ilustrativa)',
      'Romainbehar · CC0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Petit_Palais_%40_Paris_%2834081852943%29.jpg/1280px-Petit_Palais_%40_Paris_%2834081852943%29.jpg',
      'Petit Palais courtyard café',
      'Café no pátio do Petit Palais',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Petit_Palais_%40_Paris_%2834892238375%29.jpg/1280px-Petit_Palais_%40_Paris_%2834892238375%29.jpg',
      'Petit Palais interior',
      'Interior do Petit Palais',
      'Wikimedia Commons',
    ),
  ],
  'par-point-alph': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Place_du_march%C3%A9_Notre-Dame.jpg/1280px-Place_du_march%C3%A9_Notre-Dame.jpg',
      'Marché Notre-Dame, Versailles',
      'Marché Notre-Dame, Versalhes',
      'Wikimedia Commons',
    ),
  ],
  'par-mouffetard': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Rue_Mouffetard.JPG/1280px-Rue_Mouffetard.JPG',
      'Rue Mouffetard',
      'Rue Mouffetard',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Paris_-_Crepe_seller%2C_Rue_Mouffetard_-_2008.jpg/1280px-Paris_-_Crepe_seller%2C_Rue_Mouffetard_-_2008.jpg',
      'Crêpe seller on Rue Mouffetard',
      'Crepeiro na Rue Mouffetard',
      'Wikimedia Commons',
    ),
  ],
  'par-jardin-plantes': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Cuvierfountain.JPG/1280px-Cuvierfountain.JPG',
      'Fontaine Cuvier entrance to Jardin des Plantes',
      'Fontaine Cuvier — entrada do Jardin des Plantes',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paris_-_Jardin_des_plantes_-_AL_Jussieu.jpg/1280px-Paris_-_Jardin_des_plantes_-_AL_Jussieu.jpg',
      'Jardin des Plantes',
      'Jardin des Plantes',
      'Wikimedia Commons',
    ),
  ],
  'par-palais-royal': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/8/85/Conseil_d%27Etat_Paris_WA.jpg',
      'Palais-Royal',
      'Palais-Royal',
      'Wikimedia Commons',
    ),
  ],
  'par-paname-brewing': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Beer_Flight.jpg/500px-Beer_Flight.jpg',
      'Flight of craft beers (generic photo)',
      'Flight de cervejas artesanais (foto ilustrativa)',
      'Wanderstheworld · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Paname_Tap_House_%28Quartier_Crim%C3%A9e%29_01.jpg/1280px-Paname_Tap_House_%28Quartier_Crim%C3%A9e%29_01.jpg',
      'Paname Brewing Company tap house',
      'Bar da Paname Brewing Company',
      'DarkVador79-UA · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-pantheon': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Pantheon_of_Paris_007.JPG/1280px-Pantheon_of_Paris_007.JPG',
      'Panthéon',
      'Panthéon',
      'Wikimedia Commons',
    ),
  ],
  'par-paul-defense': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/d/dc/Croissants_au_beurre_%2818953292873%29.jpg',
      'Butter croissants (generic photo)',
      'Croissants na manteiga (foto ilustrativa)',
      'Herry Wibisono · CC0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/9/91/Croissant_hk_jp.jpg',
      'Croissant (generic photo)',
      'Croissant (foto ilustrativa)',
      'SUBARUsti2020hk · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-pompidou': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Place_Georges-Pompidou%2C_Paris_24_April_2011.jpg/1280px-Place_Georges-Pompidou%2C_Paris_24_April_2011.jpg',
      'Place Georges-Pompidou and the Centre',
      'Place Georges-Pompidou e o Centre',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Apud_la_Centro_Georges-Pompidou_5.jpg/1280px-Apud_la_Centro_Georges-Pompidou_5.jpg',
      'Centre Pompidou façade and escalator tubes',
      'Fachada do Centre Pompidou e tubos das escadas',
      'Wikimedia Commons',
    ),
  ],
  'par-printemps': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Printemps_Haussmann.jpg/1280px-Printemps_Haussmann.jpg',
      'Printemps',
      'Printemps',
      'Wikimedia Commons',
    ),
  ],
  'par-procope': [
    photo(
      'https://live.staticflickr.com/3597/3496995066_69ae2de882_b.jpg',
      'Le Procope',
      'Le Procope',
      'Flickr (CC via Openverse)',
    ),
  ],
  'par-promenade-plantee': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Promenade_plant%C3%A9e%2C_Paris_August_2009_%2810%29.jpg/1280px-Promenade_plant%C3%A9e%2C_Paris_August_2009_%2810%29.jpg',
      'Promenade Plantée',
      'Promenade Plantée',
      'jean-louis Zimmermann · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Promenade_plant%C3%A9e%2C_Paris_2_June_2015.jpg/1280px-Promenade_plant%C3%A9e%2C_Paris_2_June_2015.jpg',
      'Promenade Plantée walkway',
      'Caminho da Promenade Plantée',
      'Francisco Anzola · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-royal-cambronne': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Steak-frites_-_Le_Relais_de_l%27Entrec%C3%B4te_%28Geneva%29.jpg/500px-Steak-frites_-_Le_Relais_de_l%27Entrec%C3%B4te_%28Geneva%29.jpg',
      'Steak frites (generic photo)',
      'Steak frites (foto ilustrativa)',
      'Dcollard · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-rue-cler': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/March%C3%A9%2C_Rue_Cler%2C_75007_Paris%2C_France_2014.jpg/1280px-March%C3%A9%2C_Rue_Cler%2C_75007_Paris%2C_France_2014.jpg',
      'Market stalls on Rue Cler',
      'Bancas na Rue Cler',
      'besopha · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Rue_Cler_cobblestone%2C_Paris_24_May_2014.jpg/1280px-Rue_Cler_cobblestone%2C_Paris_24_May_2014.jpg',
      'Rue Cler cobblestones',
      'Paralelepípedos da Rue Cler',
      'David McSpadden · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-sacre-coeur': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Basilique_du_Sacr%C3%A9-C%C5%93ur_de_Montmartre_-_Paris_-_GT-01_-_2024.jpg/1280px-Basilique_du_Sacr%C3%A9-C%C5%93ur_de_Montmartre_-_Paris_-_GT-01_-_2024.jpg',
      'Sacré-Cœur',
      'Sacré-Cœur',
      'Wikimedia Commons',
    ),
  ],
  'par-saint-eustache': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Paris_-_Eglise_Saint-Eustache_-_Vue_g%C3%A9n%C3%A9rale.jpg/1280px-Paris_-_Eglise_Saint-Eustache_-_Vue_g%C3%A9n%C3%A9rale.jpg',
      'Église Saint-Eustache — general view',
      'Église Saint-Eustache — vista geral',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/%C3%89glise_Saint-Eustache_de_Paris_vue_des_Halles.jpg/1280px-%C3%89glise_Saint-Eustache_de_Paris_vue_des_Halles.jpg',
      'Saint-Eustache from Les Halles',
      'Saint-Eustache vista de Les Halles',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/South_facade_of_%C3%89glise_Saint-Eustache_de_Paris%2C_M.jpg/1280px-South_facade_of_%C3%89glise_Saint-Eustache_de_Paris%2C_M.jpg',
      'Saint-Eustache south façade',
      'Fachada sul de Saint-Eustache',
      'Wikimedia Commons',
    ),
  ],
  'par-saint-michel': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Photo_Place_Saint-Michel_Paris_France_2007-08-01.jpg/1280px-Photo_Place_Saint-Michel_Paris_France_2007-08-01.jpg',
      'Place Saint-Michel and its fountain',
      'Place Saint-Michel e a fonte',
      'Coyau · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-sainte-chapelle': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlPqtYYavw0lekCEptKtcyHbgJwSh3qFKSNXJZSZPclyvUwu1z40xs1Qb1VLv3iD2i42j0d6LTpKcyjfJVhvGkk3b9PZ2erOCtkdAriAt4D0iXto3ART7pLydyc2yN3n3Ks7cBv=s696-k-no',
      'Sainte-Chapelle',
      'Sainte-Chapelle',
      'Google Maps',
    ),
    photo(
      'https://i0.wp.com/www.citiestotravel.com/wp-content/uploads/2025/03/Sainte-Chapelle-in-Parijs-scaled.webp?fit=2560%2C1431&ssl=1',
      'Sainte-Chapelle — upper chapel stained glass',
      'Sainte-Chapelle — vitrais da capela superior',
      'Cities to Travel',
    ),
    photo(
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVqla-c2qJv_UwrXhkCLgabdR5YQMTcFQ5attcxFLZ_bArKTKo-zMBm-w&s=10',
      'Sainte-Chapelle',
      'Sainte-Chapelle',
      'Google',
    ),
    photo(
      'https://aws-tiqets-cdn.imgix.net/images/content/048dbd2ab26143b59a1648e8c0883c4b.jpg?auto=format%2Ccompress&fit=crop&q=70',
      'Sainte-Chapelle interior',
      'Interior da Sainte-Chapelle',
      'Tiqets',
    ),
  ],
  'par-serres-auteuil': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Serres_d%27Auteuil_Palmarium_and_french_garden_in_autumn_2015.jpg/500px-Serres_d%27Auteuil_Palmarium_and_french_garden_in_autumn_2015.jpg',
      "The Palmarium greenhouse and garden at the Serres d'Auteuil",
      "A estufa Palmarium e o jardim das Serres d'Auteuil",
      'Salix · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-shakespeare': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Shakespeare_and_Company%2C_Paris.jpg/1280px-Shakespeare_and_Company%2C_Paris.jpg',
      'Shakespeare and Company bookshop',
      'Livraria Shakespeare and Company',
      'Mike Peel · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Shakespeare_and_Company%2C_Paris%2C_2009.jpg/1280px-Shakespeare_and_Company%2C_Paris%2C_2009.jpg',
      'Shakespeare and Company shopfront',
      'Fachada da Shakespeare and Company',
      'Mike Peel · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-sorbonne': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/P1300734_Paris_V_place_de_la_Sorbonne_rwk.jpg/1280px-P1300734_Paris_V_place_de_la_Sorbonne_rwk.jpg',
      'Rue de la Sorbonne',
      'Rue de la Sorbonne',
      'Wikimedia Commons',
    ),
  ],
  'par-train-bleu': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Le_Train_Bleu_%28Paris%29_assiette_de_charcuterie_au_salon_%28f%C3%A9vrier_2023%29.jpg/500px-Le_Train_Bleu_%28Paris%29_assiette_de_charcuterie_au_salon_%28f%C3%A9vrier_2023%29.jpg',
      'Charcuterie plate in the Train Bleu dining room',
      'Prato de charcutaria no salão do Train Bleu',
      'Benoît Prieur · CC0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/c/cb/Le_Train_Bleu.jpg',
      'Le Train Bleu',
      'Le Train Bleu',
      'Wikimedia Commons',
    ),
  ],
  'par-trocadero': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Esplanade_du_Trocad%C3%A9ro%2C_Paris.jpg/500px-Esplanade_du_Trocad%C3%A9ro%2C_Paris.jpg',
      'Esplanade du Trocadéro, with the Eiffel Tower',
      'Esplanade do Trocadéro, com a Torre Eiffel',
      'Nicolas Vigier · CC0 · Wikimedia Commons',
    ),
  ],
  'par-tuileries': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/Grand_bassin_octogonal_Jardin_des_Tuileries_003.jpg/1280px-Grand_bassin_octogonal_Jardin_des_Tuileries_003.jpg',
      'Octagonal pond in the Tuileries Garden',
      'Lago octogonal do Jardim das Tulherias',
      'Moonik · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Tuileries_Garden%2C_Paris_%2836551467426%29.jpg/1280px-Tuileries_Garden%2C_Paris_%2836551467426%29.jpg',
      'Tuileries Garden',
      'Jardim das Tulherias',
      'xiquinhosilva · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-vendome': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Place_Vendome%2C_Paris_20_April_2011.jpg/3840px-Place_Vendome%2C_Paris_20_April_2011.jpg',
      'Place Vendôme',
      'Place Vendôme',
      'Wikimedia Commons',
    ),
  ],
  'par-versailles': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Vue_a%C3%A9rienne_du_domaine_de_Versailles_par_ToucanWings_-_Creative_Commons_By_Sa_3.0_-_081_%28cropped%29.jpg/1280px-Vue_a%C3%A9rienne_du_domaine_de_Versailles_par_ToucanWings_-_Creative_Commons_By_Sa_3.0_-_081_%28cropped%29.jpg',
      'Château de Versailles — aerial view of the palace and gardens',
      'Château de Versailles — vista aérea do palácio e jardins',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/Front_of_the_Palace_of_Versailles.jpg/1280px-Front_of_the_Palace_of_Versailles.jpg',
      'Palace of Versailles — entrance courtyard façade',
      'Palácio de Versalhes — fachada do pátio de entrada',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/27/Garden_facade_of_the_Palace_of_Versailles_1.jpg/1280px-Garden_facade_of_the_Palace_of_Versailles_1.jpg',
      'Palace of Versailles — garden façade',
      'Palácio de Versalhes — fachada dos jardins',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Chateau_Versailles_Galerie_des_Glaces.jpg/1280px-Chateau_Versailles_Galerie_des_Glaces.jpg',
      'Hall of Mirrors (Galerie des Glaces)',
      'Galeria dos Espelhos (Galerie des Glaces)',
      'Wikimedia Commons',
    ),
  ],
  'par-vincennes': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/d/d2/Bois_de_Vincennes_20060816_16.jpg',
      'Bois de Vincennes',
      'Bois de Vincennes',
      'Wikimedia Commons',
    ),
  ],
  'par-vincennes-town': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/4/44/Ch%C3%A2teau_de_Vincennes_Paris_FRA_002.jpg',
      'Vincennes',
      'Vincennes',
      'Wikimedia Commons',
    ),
  ],
  'par-vosges': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/3/3d/Place_des_Vosges_vue_a%C3%A9rienne.png',
      'Place des Vosges',
      'Place des Vosges',
      'Wikimedia Commons',
    ),
  ],

  // —— Rome ——
  'par-place-dauphine': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Paris_Place_Dauphine.jpg/1280px-Paris_Place_Dauphine.jpg',
      'Place Dauphine',
      'Place Dauphine',
      'Myrabella · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Paris_Place_Dauphine_r_P8040092.JPG/1280px-Paris_Place_Dauphine_r_P8040092.JPG',
      'Place Dauphine, Île de la Cité',
      'Place Dauphine, Île de la Cité',
      'Mbzt · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-belleville': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/1/16/Parc_de_Belleville_Paris_01.jpg',
      'Landscaped path in Parc de Belleville',
      'Caminho ajardinado do Parc de Belleville',
      'Pol · Public domain · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Belv%C3%A9d%C3%A8re_de_Belleville_%40_Parc_de_Belleville_%40_Paris_20_%2825137120823%29.jpg/1280px-Belv%C3%A9d%C3%A8re_de_Belleville_%40_Parc_de_Belleville_%40_Paris_20_%2825137120823%29.jpg',
      'Belleville lookout over Paris',
      'Mirante de Belleville sobre Paris',
      'Guilhem Vellut · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-villa-marquise': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/111_Rue_de_Vaugirard_Paris.jpg/1280px-111_Rue_de_Vaugirard_Paris.jpg',
      '111 Rue de Vaugirard',
      '111 Rue de Vaugirard',
      'Benreis · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/111_Rue_de_Vaugirard_Paris_2.jpg/1280px-111_Rue_de_Vaugirard_Paris_2.jpg',
      '111 Rue de Vaugirard',
      '111 Rue de Vaugirard',
      'Benreis · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-favorite-saint-paul': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/La_Favorite_Saint_Paul-2026-08-msu-23571-4139.jpg/1280px-La_Favorite_Saint_Paul-2026-08-msu-23571-4139.jpg',
      'La Favorite Saint-Paul',
      'La Favorite Saint-Paul',
      'Matthias Süßen · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/La_Favorite_Saint_Paul-2026-08-msu-23571-4166.jpg/1280px-La_Favorite_Saint_Paul-2026-08-msu-23571-4166.jpg',
      'La Favorite Saint-Paul, Marais',
      'La Favorite Saint-Paul, Marais',
      'Matthias Süßen · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-bon-pecheur': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Aux_Halles_-_Le_Bon_Pecheur%2C_Paris_2020.jpg/1280px-Aux_Halles_-_Le_Bon_Pecheur%2C_Paris_2020.jpg',
      'Le Bon Pêcheur, Les Halles',
      'Le Bon Pêcheur, Les Halles',
      'Francois R THOMAS · CC BY-SA 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/4/4f/Le_Bon_P%C3%AAcheur.jpg',
      'Le Bon Pêcheur',
      'Le Bon Pêcheur',
      'Thomon · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-archives-nationales': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/H%C3%B4tel_de_Soubise%2C_Paris_9_June_2017.jpg/500px-H%C3%B4tel_de_Soubise%2C_Paris_9_June_2017.jpg',
      'Hôtel de Soubise, home of the Archives nationales',
      'Hôtel de Soubise, sede dos Archives nationales',
      'Guilhem Vellut · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-pont-neuf': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Pont_Neuf%2C_Paris_1er_001.JPG/1280px-Pont_Neuf%2C_Paris_1er_001.JPG',
      'Pont Neuf',
      'Pont Neuf',
      'Moonik · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Pont_Neuf_-_Paris_-_France.jpg/1280px-Pont_Neuf_-_Paris_-_France.jpg',
      'Pont Neuf over the Seine',
      'Pont Neuf sobre o Sena',
      'Sumit Surai · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-avenue-camoens': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Avenue_de_Camoens.jpg/1280px-Avenue_de_Camoens.jpg',
      'Avenue de Camoëns',
      'Avenue de Camoëns',
      'Siren-Com · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Avenue_de_Camo%C3%ABns_%284252650368%29.jpg',
      'Avenue de Camoëns, 16th arrondissement',
      'Avenue de Camoëns, 16º arrondissement',
      'Metro Centric · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-rue-universite': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/Rue_de_l%27Universit%C3%A9_and_Eiffel_Tower%2C_Paris_May_2012_-_panoramio.jpg/1280px-Rue_de_l%27Universit%C3%A9_and_Eiffel_Tower%2C_Paris_May_2012_-_panoramio.jpg',
      "Eiffel Tower from Rue de l'Université",
      "Torre Eiffel vista da Rue de l'Université",
      'Vlad Shtelts · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-passerelle-debilly': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Passerelle_Debilly%2C_Paris_7e-16e.jpg/1280px-Passerelle_Debilly%2C_Paris_7e-16e.jpg',
      'Passerelle Debilly',
      'Passarela Debilly',
      'AHert · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Passerelle_Debilly%2C_Paris_9_July_2016.jpg/1280px-Passerelle_Debilly%2C_Paris_9_July_2016.jpg',
      'Passerelle Debilly over the Seine',
      'Passarela Debilly sobre o Sena',
      'Guilhem Vellut · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-port-louvre': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/P1050537_Paris_Ier_port_du_Louvre_rwk.jpg/500px-P1050537_Paris_Ier_port_du_Louvre_rwk.jpg',
      'Port du Louvre beside the Seine',
      'Port du Louvre à beira do Sena',
      'Mbzt · Wikimedia Commons · CC BY-SA 3.0',
    ),
  ],
  'par-port-debilly': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Port_Debilly%2C_tour_Eiffel%2C_Paris.jpg/960px-Port_Debilly%2C_tour_Eiffel%2C_Paris.jpg',
      'Eiffel Tower seen from Port Debilly',
      'Torre Eiffel vista do Port Debilly',
      'Polymagou · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/P1030759_Paris_XVI_port_Debilly-passerelle_Debilly_tour_Eiffel.JPG/960px-P1030759_Paris_XVI_port_Debilly-passerelle_Debilly_tour_Eiffel.JPG',
      'Port Debilly quay, Passerelle Debilly and the tower',
      'Cais do Port Debilly, Passarela Debilly e a Torre',
      'Mbzt · CC BY 3.0 · Wikimedia Commons',
    ),
  ],
  'par-pont-iena': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/View_of_Pont_d%27I%C3%A9na_from_Trocad%C3%A9ro%2C_Paris%2C_2008.jpg/1280px-View_of_Pont_d%27I%C3%A9na_from_Trocad%C3%A9ro%2C_Paris%2C_2008.jpg',
      "Pont d'Iéna from the Trocadéro",
      "Pont d'Iéna vista do Trocadéro",
      'DimiTalen · CC0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Pont_d%27I%C3%A9na_2447x742.jpg/1280px-Pont_d%27I%C3%A9na_2447x742.jpg',
      "Pont d'Iéna",
      "Pont d'Iéna",
      'wagner51 · CC BY-SA 2.0 fr · Wikimedia Commons',
    ),
  ],
  'par-fontaines-trocadero': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Fountains_of_Trocadero_in_Paris_002.JPG/1280px-Fountains_of_Trocadero_in_Paris_002.JPG',
      'Trocadéro fountains',
      'Fontes do Trocadéro',
      'Moonik · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Fontaines_du_Trocad%C3%A9ro_6_October_2009.jpg/1280px-Fontaines_du_Trocad%C3%A9ro_6_October_2009.jpg',
      'Trocadéro fountains',
      'Fontes do Trocadéro',
      'Mario Sánchez Prada · CC BY-SA 2.0 · Wikimedia Commons',
    ),
  ],
  'par-trianon': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/P%C3%A9ristyle_du_Grand_Trianon_001.JPG/1280px-P%C3%A9ristyle_du_Grand_Trianon_001.JPG',
      'Peristyle of the Grand Trianon',
      'Peristilo do Grand Trianon',
      'Moonik · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/P%C3%A9ristyle_du_Grand_Trianon_002.JPG/1280px-P%C3%A9ristyle_du_Grand_Trianon_002.JPG',
      'Peristyle of the Grand Trianon',
      'Peristilo do Grand Trianon',
      'Moonik · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-bella-notte': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Margherita_Originale.JPG/1280px-Margherita_Originale.JPG',
      'Pizza margherita (generic photo)',
      'Pizza margherita (foto ilustrativa)',
      'Mario56 · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Pizza-napoletana.jpg/1280px-Pizza-napoletana.jpg',
      'Neapolitan pizza (generic photo)',
      'Pizza napolitana (foto ilustrativa)',
      'Fabryx98 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-rosa-bonheur': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Moules_frites_wth_rose_and_pastis.JPG/500px-Moules_frites_wth_rose_and_pastis.JPG',
      'Mussels and fries with rosé and pastis (generic photo)',
      'Moules-frites com rosé e pastis (foto ilustrativa)',
      'LittleGun · Public domain · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Rosa_Bonheur%2C_Paris_5_June_2015.jpg/1280px-Rosa_Bonheur%2C_Paris_5_June_2015.jpg',
      'Rosa Bonheur in the Buttes-Chaumont',
      'Rosa Bonheur no Buttes-Chaumont',
      'Tom Hilton · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-baron-rouge': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Les_Hu%C3%AEtres_de_Trousse_Chemise_%2815%29.JPG/1280px-Les_Hu%C3%AEtres_de_Trousse_Chemise_%2815%29.JPG',
      'Oysters (generic photo)',
      'Ostras (foto ilustrativa)',
      'Jean-Pierre Bazard · CC BY 4.0 · Wikimedia Commons',
    ),
  ],
  'par-as-du-fallafel': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Falafel_in_a_pita.jpg/500px-Falafel_in_a_pita.jpg',
      'Falafel in pita bread (generic photo)',
      'Falafel no pão pita (foto ilustrativa)',
      'Israel_photo_gallery · CC BY-SA 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/LAs_Du_Fallafel%2C_34_Rue_des_Rosiers%2C_75004_Paris_2008.jpg/1280px-LAs_Du_Fallafel%2C_34_Rue_des_Rosiers%2C_75004_Paris_2008.jpg',
      "L'As du Fallafel on Rue des Rosiers",
      "L'As du Fallafel na Rue des Rosiers",
      'Jesús Gorriti · CC BY-SA 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Line_for_L%27As_Du_Fallafel.JPG/1280px-Line_for_L%27As_Du_Fallafel.JPG',
      "Queue outside L'As du Fallafel",
      "Fila na porta do L'As du Fallafel",
      'Plot Spoiler · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-patate': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWklLE1lPjJpcBF7fn3ialhedSsaaJ9pszzaN-Vmsg3qJaEewlNk-VghetbjUh5Ya-UsSTJKmGx6mcBqYI-VV5YFdy682yJ5DS3Xtc-uCBjEyCe03A3Ead3XBt0tPdTlk5ijfjdpNNNqxoqw=s608-k-no',
      'Patate',
      'Patate',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnsnTKUkRSf5EjwttdiZO4oGJAShzLwG64jlrOJUvhcYUILbBfZYRXQivU7mjfxWmj7xd2kQMfLDyVjZXA0it9DgGAxD57wlqN9VqfwdW-uGg9-Cmiz5r7D5NTqP-R5vpWfBroDFaRNmYvp=s811-k-no',
      'Patate',
      'Patate',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlxoHLHBUZ13EY2R701ozXDB8T41hmPAnlbIpm-xHyJR51GY6Muv3K601l_5ZSDIsVANP1okf8UT6x8f3kiG_891IHmDIwHb9DI6JVkc9ZNF3yVPWlspzoVXTe2zSm3_RoUcQJfB8juyfmV=s731-k-no',
      'Patate',
      'Patate',
      'Google Maps',
    ),
  ],
  'par-bouillon-republique': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Oeuf_Mayo_Le_Petit_Littr%C3%A9_Paris.jpg/500px-Oeuf_Mayo_Le_Petit_Littr%C3%A9_Paris.jpg',
      'Œuf mayonnaise at a Paris bouillon-style restaurant',
      'Œuf mayonnaise num restaurante estilo bouillon em Paris',
      'Benreis · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Paris_3e_Boulevard_du_Temple_Bouillon_R%C3%A9publique_679.jpg/1280px-Paris_3e_Boulevard_du_Temple_Bouillon_R%C3%A9publique_679.jpg',
      'Bouillon République on Boulevard du Temple',
      'Bouillon République no Boulevard du Temple',
      'GFreihalter · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-bouillon-pigalle': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Steak_Au_Poivre.jpg/500px-Steak_Au_Poivre.jpg',
      'Steak au poivre with pepper sauce (generic photo)',
      'Steak com molho de pimenta (foto ilustrativa)',
      'Mark Mitchell · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Bouillon_Pigalle.jpg/960px-Bouillon_Pigalle.jpg',
      'Bouillon Pigalle on Boulevard de Clichy',
      'Bouillon Pigalle no Boulevard de Clichy',
      'Thomon · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-segar': [
    photo(
      'https://cdn3.regie-agricole.com/ulf/CMS_Content/2/articles/873721/_4.CS_Segar_SandwichspouletrOti-1000x562.jpg',
      'Roast chicken sandwiches, mayo/curry and mayonnaise',
      'Sanduíches de frango assado, maionese/curry e maionese',
      'La Toque',
    ),
    photo(
      'https://cdn4.gustave-et-rosalie.com/media/cache/share_image/upload/article/c7a87b8a8e-385491011-17937065972733827-1575080690355667531-n.jpg',
      'Roast chicken baguette sandwich on Segar paper',
      'Baguete de frango assado no papel da Segar',
      'Gustave et Rosalie',
    ),
    photo(
      'https://www.finedininglovers.fr/sites/default/files/places/r%C3%B4tisserie-segar-chijmde7f5bx5kcr3gxzniz1xgw-2.png',
      'Pulled roast chicken sandwich',
      'Sanduíche de frango assado desfiado',
      'Fine Dining Lovers',
    ),
  ],
  'par-chez-pradel': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Steak-frites_as_served_at_Le_Relais_de_Venise_-_L%27Entrecote.jpg/500px-Steak-frites_as_served_at_Le_Relais_de_Venise_-_L%27Entrecote.jpg',
      'Steak frites (generic photo)',
      'Steak frites (foto ilustrativa)',
      'Dcollard · Public domain · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Chez_Pradel_%2830626190691%29.jpg/960px-Chez_Pradel_%2830626190691%29.jpg',
      'Chez Pradel on Rue Ordener',
      'Chez Pradel na Rue Ordener',
      'Jeanne Menjoulet · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-le-nesle': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmAHN9C_H81Amv8AkcgJlXfZyq0nVVDgprjDFqdUe4q1OjeDmp_8VnK2Ez4cwD3n-2z5ZT3dD9FQJO0q84ABUYao9esK_VzpW5kT8ELNGHCeDS8HI0FzuNAh1_RlKiOk_2uH0m5bDOZDDyc=w310-h403-p-k-no',
      'Brasserie Le Nesle',
      'Brasserie Le Nesle',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkRordXKIj9g1fTwGtjpPkm02c3GOND9yqHw-72bahGP7hXQBtw4e19JHd7oqnW79mM_5oKPLiBGnnu1aRsgb0JEGhke1mVLgTsPHUQN2yTShxYDXhn-b9lGhiaPVqy_saIAlKWRj5208I=w310-h403-p-k-no',
      'Brasserie Le Nesle',
      'Brasserie Le Nesle',
      'Google Maps',
    ),
  ],
  'par-specimen-burger': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Cheeseburger.jpg/1280px-Cheeseburger.jpg',
      'Cheeseburger (generic photo)',
      'Cheeseburger (foto ilustrativa)',
      'Renee Comet · Public domain · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Cheeseburger_with_onions_at_Hatfield_Heath_Festival_2017.jpg/1280px-Cheeseburger_with_onions_at_Hatfield_Heath_Festival_2017.jpg',
      'Cheeseburger (generic photo)',
      'Cheeseburger (foto ilustrativa)',
      'Acabashi · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-rocheman': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/81/Sandwich_jambon-beurre.jpg/1280px-Sandwich_jambon-beurre.jpg',
      'Jambon-beurre sandwich (generic photo)',
      'Sanduíche jambon-beurre (foto ilustrativa)',
      'Nat · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Sandwichs_classiques.jpg/1280px-Sandwichs_classiques.jpg',
      'French sandwiches (generic photo)',
      'Sanduíches franceses (foto ilustrativa)',
      'Nat · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-margaux': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Cordon_Bleu_01.jpg/1280px-Cordon_Bleu_01.jpg',
      'Cordon bleu (generic photo)',
      'Cordon bleu (foto ilustrativa)',
      'Marife.altabano · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/c/cd/Cordon-bleu-2.jpg',
      'Cordon bleu (generic photo)',
      'Cordon bleu (foto ilustrativa)',
      'Rainer Zenz · GPL · Wikimedia Commons',
    ),
  ],
  'par-arnaud-nicolas-caulaincourt': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/Modern_Charcuterie_display.jpg/500px-Modern_Charcuterie_display.jpg',
      'Charcuterie display (generic photo)',
      'Charcutaria em exposição (foto ilustrativa)',
      'Tanner-Christopher · Public domain · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Bonjour%2C_Croque_Monsieur_-_Lunch_in_Paris%2C_27_June_2023.jpg/1280px-Bonjour%2C_Croque_Monsieur_-_Lunch_in_Paris%2C_27_June_2023.jpg',
      'Croque-monsieur (generic photo)',
      'Croque-monsieur (foto ilustrativa)',
      'Sharon Hahn Darlin · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-ore-ducasse': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Pavillon_Dufour_at_the_Ch%C3%A2teau_de_Versailles.jpg/1280px-Pavillon_Dufour_at_the_Ch%C3%A2teau_de_Versailles.jpg',
      'Pavillon Dufour, home of Ore, at Versailles',
      'Pavillon Dufour, onde fica o Ore, em Versalhes',
      'DiscoA340 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Pavillon_Dufour%2C_Versailles..jpg/1280px-Pavillon_Dufour%2C_Versailles..jpg',
      'Pavillon Dufour, Versailles',
      'Pavillon Dufour, Versalhes',
      'Miguel Hermoso Cuesta · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-la-flottille': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Moules_et_Frites.jpg/500px-Moules_et_Frites.jpg',
      'Mussels and fries (generic photo)',
      'Moules-frites (foto ilustrativa)',
      'Barbara y Eugenio · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Grand_Canal_de_Versailles_near_Grand_Trianon%2C_24.07.13.jpg/1280px-Grand_Canal_de_Versailles_near_Grand_Trianon%2C_24.07.13.jpg',
      'Grand Canal at Versailles, where La Flottille sits',
      'Grand Canal de Versalhes, onde fica La Flottille',
      'Liberaler Humanist · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-mcdonalds-disney': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Big_Mac_hamburger.jpg/1280px-Big_Mac_hamburger.jpg',
      'Big Mac (generic photo)',
      'Big Mac (foto ilustrativa)',
      'Evan-Amos · CC0 · Wikimedia Commons',
    ),
  ],
  'par-starbucks-opera': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Starbucks_Frappuccino_%2824564745748%29.jpg/500px-Starbucks_Frappuccino_%2824564745748%29.jpg',
      'Starbucks Frappuccino (generic photo)',
      'Frappuccino da Starbucks (foto ilustrativa)',
      'Push Doctor · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-kfc-les-halles': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/KFC_restaurant_in_Paris_May_4%2C_2008.jpg/500px-KFC_restaurant_in_Paris_May_4%2C_2008.jpg',
      'KFC storefront in Paris',
      'Fachada de um KFC em Paris',
      'Betsy Weber · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Fried-Chicken-Set.jpg/1280px-Fried-Chicken-Set.jpg',
      'Fried chicken (generic photo)',
      'Frango frito (foto ilustrativa)',
      'Evan-Amos · CC0 · Wikimedia Commons',
    ),
  ],
  'par-poilane': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/4/4d/Pain_Po%C3%AElane-_Paris_15e.jpg',
      'Poilâne sourdough loaf',
      'Pão de fermentação natural da Poilâne',
      'Gilbert Bochenek · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-deux-magots': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWndVVnKF_hbLqufF_wcTIIkVNXxOcgT64_WAXOtESe-dQPFk2DyQdqtEZpi_yg2iWqCghN5_85ToToYho4QdjTO8GLn8Tqq0f6mqHPX9_6K2CHA_GGMkiepg35LvwuJ1zY1PdoQ4skEzIyy=s1219-k-no',
      'Hot chocolate with the Les Deux Magots logo on the cup',
      'Chocolate quente com a marca do Les Deux Magots na xícara',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9T3wep3rQsATfrH67N-tKgprdMHjPYxvG_XVbVSKs2wwB8lqNmSAVDEwU_Juuj2fOlaVxqYJdu62AkbU0FhhZwdbvp3OBUEygnDdSzSAqI8SmPwfyaM9lQpCUn3dvYM_Py5m81mlEoC--l9=s1219-k-no',
      'Hot chocolate at Les Deux Magots',
      'Chocolate quente do Les Deux Magots',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmv5cbeRbVMMYbd7Skk4Mt-nf7nmCZ1dB3oKn8L49JcgY36wEizfC5pLo3e6etEm8RIDt_kYFX3P0sJrpxoVIAPdkWCxQR5QvyyL6S9rQdYBi44vrd4qjt3WCIpzVekZbjN_SM=s928-k-no',
      'Les Deux Magots terrace',
      'Terraço do Les Deux Magots',
      'Google Maps',
    ),
  ],
  'par-du-pain-idees': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Pain_aux_raisins_02.jpg/1280px-Pain_aux_raisins_02.jpg',
      'Pain aux raisins (generic photo)',
      'Pain aux raisins (foto ilustrativa)',
      'Arnaud 25 · CC0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/a/a4/Pain_aux_raisins.jpg',
      'Pain aux raisins (generic photo)',
      'Pain aux raisins (foto ilustrativa)',
      'Tepeyac · Public domain · Wikimedia Commons',
    ),
  ],
  'par-merveilleux-fred': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Merveilleux.jpg/1280px-Merveilleux.jpg',
      'Merveilleux meringue cakes (generic photo)',
      'Merveilleux, doce de merengue (foto ilustrativa)',
      'Eeicing · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-recrutement': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Cappuccino_on_the_table.jpg/500px-Cappuccino_on_the_table.jpg',
      'Cappuccino (generic photo)',
      'Cappuccino (foto ilustrativa)',
      'Leontereyes · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Paris_75007_Rue_Saint-Dominique_x_Boulevard_de_La_Tour-Maubourg_20150607.jpg/1280px-Paris_75007_Rue_Saint-Dominique_x_Boulevard_de_La_Tour-Maubourg_20150607.jpg',
      "Eiffel Tower down Rue Saint-Dominique, at the café's corner",
      'Torre Eiffel no fim da Rue Saint-Dominique, na esquina do café',
      'Dancorona21 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-cdg-rer': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/The_TGV_station_in_Terminal_2%2C_CDG_Airport%2C_1_May_2014.jpg/1280px-The_TGV_station_in_Terminal_2%2C_CDG_Airport%2C_1_May_2014.jpg',
      'CDG 2 TGV station, Terminal 2',
      'Estação CDG 2 TGV, Terminal 2',
      'Connie Ma · CC BY-SA 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Hall_de_la_gare_de_l%27A%C3%A9roport_CDG_2.jpg/1280px-Hall_de_la_gare_de_l%27A%C3%A9roport_CDG_2.jpg',
      'Station hall at CDG 2',
      'Saguão da estação CDG 2',
      'Remontees · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-orly-m14': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Station_M%C3%A9tro_-_A%C3%A9roport_d%27Orly_-_%28RATP_-_Ligne_14%29_-_%28Paray-Vieille-Poste%2C_FR91%29_-_24-06-2024_5.jpg/1280px-Station_M%C3%A9tro_-_A%C3%A9roport_d%27Orly_-_%28RATP_-_Ligne_14%29_-_%28Paray-Vieille-Poste%2C_FR91%29_-_24-06-2024_5.jpg',
      'Orly Airport line 14 platform, with its characteristic wavy ceiling',
      'Plataforma da linha 14 em Orly, com o teto ondulado característico',
      'Manchesterunited1234 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Station_M%C3%A9tro_-_A%C3%A9roport_d%27Orly_-_%28RATP_-_Ligne_14%29_-_%28Paray-Vieille-Poste%2C_FR91%29_-_24-06-2024_3.jpg/1280px-Station_M%C3%A9tro_-_A%C3%A9roport_d%27Orly_-_%28RATP_-_Ligne_14%29_-_%28Paray-Vieille-Poste%2C_FR91%29_-_24-06-2024_3.jpg',
      'Line 14 station at Orly Airport',
      'Estação da linha 14 no aeroporto de Orly',
      'Manchesterunited1234 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-noisy-le-sec-rer': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/5/5d/Noisy_le_Sec_Gare.jpg',
      'Noisy-le-Sec station',
      'Estação de Noisy-le-Sec',
      'Maryanna · CC BY 2.5 · Wikimedia Commons',
    ),
  ],
  'par-casa-do-gui': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Mairie_-_Noisy-le-Sec_%28FR93%29_-_2021-01-07_-_2.jpg/1280px-Mairie_-_Noisy-le-Sec_%28FR93%29_-_2021-01-07_-_2.jpg',
      'Noisy-le-Sec town hall (the house itself is private)',
      'Prefeitura de Noisy-le-Sec (a casa é particular)',
      'Chabe01 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-auchan-noisy': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Auchan_Supermarch%C3%A9_%28Belley%29.jpg/1280px-Auchan_Supermarch%C3%A9_%28Belley%29.jpg',
      'Auchan Supermarché storefront (another branch)',
      'Fachada de um Auchan Supermarché (outra loja)',
      'Benoît Prieur · CC0 · Wikimedia Commons',
    ),
  ],
  'par-saint-georges-noisy': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Alimentation_g%C3%A9n%C3%A9rale%2C_53_boulevard_Arago%2C_75013_Paris%2C_2022.jpg/1280px-Alimentation_g%C3%A9n%C3%A9rale%2C_53_boulevard_Arago%2C_75013_Paris%2C_2022.jpg',
      'Paris corner grocery (generic photo)',
      'Mercadinho de bairro em Paris (foto ilustrativa)',
      'Adrian Scottow · CC BY-SA 2.0 · Wikimedia Commons',
    ),
  ],
  'par-uniqlo-opera': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/UNIQLO_PARIS_OPERA_-_%E3%83%A6%E3%83%8B%E3%82%AF%E3%83%AD_%E3%80%8C%E3%83%91%E3%83%AA_%E3%82%AA%E3%83%9A%E3%83%A9%E5%BA%97%E3%80%8D_-_panoramio.jpg/1280px-UNIQLO_PARIS_OPERA_-_%E3%83%A6%E3%83%8B%E3%82%AF%E3%83%AD_%E3%80%8C%E3%83%91%E3%83%AA_%E3%82%AA%E3%83%9A%E3%83%A9%E5%BA%97%E3%80%8D_-_panoramio.jpg',
      'Uniqlo Paris Opéra',
      'Uniqlo Paris Opéra',
      'mayatomo · CC BY-SA 3.0 · Wikimedia Commons',
    ),
  ],
  'par-creteil-soleil': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Centre_Commercial_Cr%C3%A9teil_Soleil_-_Cr%C3%A9teil_%28FR94%29_-_2022-01-02_-_2.jpg/1280px-Centre_Commercial_Cr%C3%A9teil_Soleil_-_Cr%C3%A9teil_%28FR94%29_-_2022-01-02_-_2.jpg',
      'Créteil Soleil shopping centre',
      'Shopping Créteil Soleil',
      'Chabe01 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Centrecommercial_CreteilSoleil.jpg/1280px-Centrecommercial_CreteilSoleil.jpg',
      'Créteil Soleil',
      'Créteil Soleil',
      'PARIS SUD · CC0 · Wikimedia Commons',
    ),
  ],
  'par-citypharma': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SZMnnLJVq7T6jPRxHul2XZIqPVoQ0zzSj70YHHrBKsmB1wvPWG1__bq9edhuTL4XPyVTkOfeavZXByPDrVz8NsYAPveEv7iREAJAUbfX4mB7lmESWjkpL70iAuTONwzx0xswXQ_ZEDbl9f=s927-k-no',
      'CityPharma',
      'CityPharma',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9Re_Lz_ym0C5uhaVbJ-QCij78OMl2qBO67mQbru-7VgyIM9qOcxzKrvCr1Eryv_FC129RLm8m2ps2SdBq1F6Gpd0Hvdhw1lGWVN2Uli9P4hFPYD7XTyh_YSsU9iOO4MQwQHQwdufD00pcw=s1219-k-no',
      'CityPharma',
      'CityPharma',
      'Google Maps',
    ),
  ],
  'par-carre-opera': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/0/01/Croix_lumineuse_d%27une_pharmacie.jpg',
      'Lit pharmacy cross (generic photo)',
      'Cruz de farmácia acesa (foto ilustrativa)',
      'Rome2 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-one-nation': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/One_Nation_Paris.JPG/1280px-One_Nation_Paris.JPG',
      'One Nation Paris outlet',
      'Outlet One Nation Paris',
      'PaulOneNationParis · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-vallee-village': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/La_Vall%C3%A9e_Village%2C_f%C3%A9vrier_2025_1.jpg/1280px-La_Vall%C3%A9e_Village%2C_f%C3%A9vrier_2025_1.jpg',
      'La Vallée Village outlet',
      'Outlet La Vallée Village',
      'Artvill · CC BY-SA 4.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Vall%C3%A9e_Village_%28Serris%29_%281%29.jpg/1280px-Vall%C3%A9e_Village_%28Serris%29_%281%29.jpg',
      'La Vallée Village, Serris',
      'La Vallée Village, Serris',
      'Gzen92 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-rue-rivoli': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Arcades%2C_Rue_de_Rivoli%2C_Paris_26_December_2016_001.jpg/1280px-Arcades%2C_Rue_de_Rivoli%2C_Paris_26_December_2016_001.jpg',
      'Arcades on Rue de Rivoli',
      'Arcadas da Rue de Rivoli',
      'Guilhem Vellut · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/0/09/Rue_de_Rivoli_Arcades_and_Urban_Life_Paris_2026.jpg',
      'Arcades on Rue de Rivoli',
      'Arcadas da Rue de Rivoli',
      'Tolga Bakı · CC BY 4.0 · Wikimedia Commons',
    ),
  ],
  'par-naturalia-verrerie': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Naturalia%2C_59_Rue_Saint-Antoine%2C_75004_Paris%2C_October_2010.jpg/500px-Naturalia%2C_59_Rue_Saint-Antoine%2C_75004_Paris%2C_October_2010.jpg',
      'Naturalia organic grocery storefront (another branch)',
      'Fachada de uma loja Naturalia (outra unidade)',
      'jean-louis Zimmermann · CC BY 2.0 · Wikimedia Commons',
    ),
  ],
  'par-gare-de-lyon': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/P1210896_Paris_XII_gare_de_Lyon_rwk.jpg/1280px-P1210896_Paris_XII_gare_de_Lyon_rwk.jpg',
      'Paris Gare de Lyon',
      'Paris Gare de Lyon',
      'Mbzt · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/79/Hall_de_la_gare_de_Lyon_%C3%A0_Paris_%28ao%C3%BBt_2019%29.JPG/1280px-Hall_de_la_gare_de_Lyon_%C3%A0_Paris_%28ao%C3%BBt_2019%29.JPG',
      'Gare de Lyon concourse',
      'Saguão da Gare de Lyon',
      'Florian Pépellin · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'rom-fco': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Rom_Fiumicino_2011-by-RaBoe-02.jpg/1280px-Rom_Fiumicino_2011-by-RaBoe-02.jpg',
      'Fiumicino Airport (FCO)',
      'Aeroporto de Fiumicino (FCO)',
      'Wikimedia Commons',
    ),
  ],
  'rom-termini': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Roma_termini_01.jpg/1280px-Roma_termini_01.jpg',
      'Roma Termini station',
      'Estação Roma Termini',
      'Wikimedia Commons',
    ),
  ],
  'rom-gallina-bianca': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Espaguetis_carbonara.jpg/1280px-Espaguetis_carbonara.jpg',
      'Spaghetti carbonara',
      'Espaguete à carbonara',
      'Wikimedia Commons',
    ),
  ],
  'rom-alfredo-ada': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Pasta_carbonara.jpg/1280px-Pasta_carbonara.jpg',
      'Roman-style pasta plate',
      'Prato de massa à romana',
      'Wikimedia Commons',
    ),
  ],
  'rom-antico-vinaio': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Panino_con_porchetta_01.jpg/1280px-Panino_con_porchetta_01.jpg',
      'Italian stuffed sandwich',
      'Sanduíche italiano recheado',
      'Wikimedia Commons',
    ),
  ],
  'rom-baffetto': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Pizza_romana_03.jpg/1280px-Pizza_romana_03.jpg',
      'Roman-style pizza',
      'Pizza à romana',
      'Wikimedia Commons',
    ),
  ],
  'rom-suppli': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/a/a9/Suppl%C3%AC.jpg',
      'Roman supplì rice balls',
      'Supplì — bolinhos de arroz romanos',
      'Wikimedia Commons',
    ),
  ],
  'rom-norcineria': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Panino_con_porchetta_02.jpg/1280px-Panino_con_porchetta_02.jpg',
      'Porchetta sandwich',
      'Sanduíche de porchetta',
      'Wikimedia Commons',
    ),
  ],
  'rom-said': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Coppette_gelato.jpg/1280px-Coppette_gelato.jpg',
      'Italian gelato cups',
      'Copos de gelato italiano',
      'Wikimedia Commons',
    ),
  ],
  'rom-forno-trevi': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Pistachio-filled_Croissant_-_Milfey_Patisserie_2026-05-30.jpg/1280px-Pistachio-filled_Croissant_-_Milfey_Patisserie_2026-05-30.jpg',
      'Pistachio-filled croissant',
      'Croissant de pistache',
      'Wikimedia Commons',
    ),
  ],
  'rom-colosseum': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Colosseum_in_Rome%2C_Italy_-_April_2007.jpg/1280px-Colosseum_in_Rome%2C_Italy_-_April_2007.jpg',
      'Colosseum, Rome',
      'Coliseu, Roma',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/1280px-Colosseo_2020.jpg',
      'Colosseum exterior',
      'Exterior do Coliseu',
      'Wikimedia Commons',
    ),
  ],
  'rom-forum': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Forum_Romanum_%2814%29.jpg/1280px-Forum_Romanum_%2814%29.jpg',
      'Roman Forum',
      'Fórum Romano',
      'Wikimedia Commons',
    ),
  ],
  'rom-pantheon': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Rome_%28IT%29%2C_Pantheon_--_2013_--_3572.jpg/1280px-Rome_%28IT%29%2C_Pantheon_--_2013_--_3572.jpg',
      'Pantheon, Rome',
      'Panteão, Roma',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Pantheon_%28Rome%29%2C_Dome_interior.jpg/1280px-Pantheon_%28Rome%29%2C_Dome_interior.jpg',
      'Pantheon dome interior and oculus',
      'Interior da cúpula do Panteão e óculo',
      'Wikimedia Commons',
    ),
  ],
  'rom-piazza-venezia': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Piazza_Venezia_-_Il_Vittoriano.jpg/1280px-Piazza_Venezia_-_Il_Vittoriano.jpg',
      'Piazza Venezia and the Vittoriano',
      'Piazza Venezia e o Vittoriano',
      'Wikimedia Commons',
    ),
  ],
  'rom-trevi': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Fontana_di_Trevi_by_TC.jpg/1280px-Fontana_di_Trevi_by_TC.jpg',
      'Trevi Fountain',
      'Fontana di Trevi',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/Fuente_de_Trevi%2C_Roma%2C_Italia%2C_2022-09-15%2C_DD_02.jpg/1280px-Fuente_de_Trevi%2C_Roma%2C_Italia%2C_2022-09-15%2C_DD_02.jpg',
      'Trevi Fountain façade',
      'Fachada da Fontana di Trevi',
      'Wikimedia Commons',
    ),
  ],
  'rom-vatican': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Vatican_Museums_Spiral_Staircase_2012.jpg/1280px-Vatican_Museums_Spiral_Staircase_2012.jpg',
      'Vatican Museums spiral staircase',
      'Escada em espiral dos Museus do Vaticano',
      'Wikimedia Commons',
    ),
  ],
  'rom-sistine': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Sistine_Chapel%2C_Vatican_City_%28_Ank_Kumar%2C_Infosys_Limited%29_01.jpg/1280px-Sistine_Chapel%2C_Vatican_City_%28_Ank_Kumar%2C_Infosys_Limited%29_01.jpg',
      'Sistine Chapel exterior / Vatican',
      'Capela Sistina / Vaticano',
      'Wikimedia Commons',
    ),
  ],
  'rom-st-peter': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg/1280px-Basilica_di_San_Pietro_in_Vaticano_September_2015-1a.jpg',
      "St. Peter's Basilica",
      'Basílica de São Pedro',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/92/Basilica_Sancti_Petri_blue_hour.jpg/1280px-Basilica_Sancti_Petri_blue_hour.jpg',
      "St. Peter's at blue hour",
      'São Pedro na blue hour',
      'Wikimedia Commons',
    ),
  ],
  'rom-vittoriano': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Monument_Victor_Emmanuel_II_right_profile%2C_Rome%2C_Italy.jpg/1280px-Monument_Victor_Emmanuel_II_right_profile%2C_Rome%2C_Italy.jpg',
      'Victor Emmanuel II Monument (Vittoriano)',
      'Monumento a Vítor Emanuel II (Vittoriano)',
      'Wikimedia Commons',
    ),
  ],
  'rom-window-on-rome': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Night_life_at_Trastevere%2C_Rome_-_3398.jpg/1280px-Night_life_at_Trastevere%2C_Rome_-_3398.jpg',
      'Trastevere at night — neighborhood vibe near Window on Rome',
      'Trastevere à noite — clima do bairro perto do Window on Rome',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Piazza_Sidney_Sonnino_-_Parrocchia_San_Crisogono_-_panoramio.jpg/1280px-Piazza_Sidney_Sonnino_-_Parrocchia_San_Crisogono_-_panoramio.jpg',
      'Piazza Sidney Sonnino, Trastevere',
      'Piazza Sidney Sonnino, Trastevere',
      'Wikimedia Commons',
    ),
  ],
  'lis-whome-bairro-alto': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Lisboa_-_Bairro_Alto_%285420829357%29.jpg/1280px-Lisboa_-_Bairro_Alto_%285420829357%29.jpg',
      'Rua da Barroca in Bairro Alto, near WHome Modern Retreat',
      'Rua da Barroca no Bairro Alto, perto do WHome Modern Retreat',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Lisbon_%2842931870092%29.jpg/1280px-Lisbon_%2842931870092%29.jpg',
      'Rua da Barroca, Bairro Alto',
      'Rua da Barroca, Bairro Alto',
      'Wikimedia Commons',
    ),
  ],
  // Guia da cidade (Mercado e Comidas)
  'par-grande-epicerie-rive-gauche': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/La_grande_%C3%A9picerie_Entr%C3%A9e.jpg/960px-La_grande_%C3%A9picerie_Entr%C3%A9e.jpg',
      'Entrance of La Grande Épicerie at 38 Rue de Sèvres, corner of Rue du Bac',
      'Entrada da Grande Épicerie no nº 38 da Rue de Sèvres, esquina com a Rue du Bac',
      'VVVCFFrance / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-lafayette-gourmet-haussmann': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Galeries_Lafayette_Gourmet.jpg/960px-Galeries_Lafayette_Gourmet.jpg',
      'Fruit displays inside Lafayette Gourmet',
      'Pirâmides de frutas dentro da Lafayette Gourmet',
      'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-laduree-royale': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Macarons_from_Ladur%C3%A9e_on_display.jpg/960px-Macarons_from_Ladur%C3%A9e_on_display.jpg',
      'Ladurée macarons and gift boxes on display',
      'Macarons e caixas de presente da Ladurée na vitrine',
      'Michal Osmenda / Wikimedia Commons (CC BY-SA 2.0)',
    ),
  ],
  'par-patrick-roger-madeleine': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Life_is_like_a_box_of_chocolates_%2830010653303%29.jpg/960px-Life_is_like_a_box_of_chocolates_%2830010653303%29.jpg',
      'A Patrick Roger box of chocolates',
      'Caixa de bombons Patrick Roger',
      'Sheila Sund from Salem, United States / Wikimedia Commons (CC BY 2.0)',
    ),
  ],
  'par-poilane-cherche-midi': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9R61KiGUY-puOhtGhB-I6D4n02xxgv-SzyDy16-b9XzypheGCEMSaHlXP_IHqF1Hpch_sQzZBrMokWt1nLi1UWN1GwACf80vZGKKvLxPjGgmJ8VhJNXt6AMRs6tsa7LitUysKQ9MWJSXQSm=s811-k-no',
      'Poilâne, Rue du Cherche-Midi',
      'Poilâne, Rue du Cherche-Midi',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9SH36SHVNrSTNOnhAmc80xM8v7D-TO3rQ71POKaJbHj8mK_zXTd65wfCa4Nj_VMg6Qj1nKpVT6wVz14qiI3XCLzHPO9N4grn4tzeHi8OGhRYVN4rGHlPY5cH1FlqaCd4b9M6qLB0bxkGQQ=s811-k-no',
      'Poilâne, Rue du Cherche-Midi',
      'Poilâne, Rue du Cherche-Midi',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TTE1-DMyE8bk6sbYXJ8Fq7P9qgsU_OefG8eOkyFE4jFqfAStMgcJPCmtS2FuR6wxzxzAM39yBGIk6jY9pg1N2cGwSsVZnj_1HJkDMebQ_LOmLeAhkBswvtG9ZC7yXgkfBtl78M2tyF4vln=s1219-k-no',
      'Poilâne, Rue du Cherche-Midi',
      'Poilâne, Rue du Cherche-Midi',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/ANWiy9TyfHZoqYPj4HDXE6hHj76iINU_ViSE_gG4defKV_Et5tF0W4OGhRIFsSSleEqX-xPGfpxJ6kPE56EmuBgQxc9haTRM6dmlF_MugWpeosnZXrhweBcwtoywhnzT9O737kN6nYA=s608-k-no',
      'Poilâne, Rue du Cherche-Midi',
      'Poilâne, Rue du Cherche-Midi',
      'Google Maps',
    ),
  ],
  'par-maille-madeleine': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Maille%2C_6_Place_de_la_Madeleine%2C_75008_Paris%2C_14_September_2019.jpg/960px-Maille%2C_6_Place_de_la_Madeleine%2C_75008_Paris%2C_14_September_2019.jpg',
      'Shopfront of the Maille boutique at 6 Place de la Madeleine',
      'Fachada da butique Maille no nº 6 da Place de la Madeleine',
      'Ricardalovesmonuments / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-laurent-dubois-maubert': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Paris_-_Fromagerie_Laurent_Dubois.jpg/960px-Paris_-_Fromagerie_Laurent_Dubois.jpg',
      'Cheese counter inside a Fromagerie Laurent Dubois shop',
      'Balcão de queijos numa loja da Fromagerie Laurent Dubois',
      'Radek Kucharski / Wikimedia Commons (CC BY 2.0)',
    ),
  ],
  'par-mariage-freres-marais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d7/Mariage_Freres_30_rue_du_Bourg_Tibourg_Interieur.jpg/500px-Mariage_Freres_30_rue_du_Bourg_Tibourg_Interieur.jpg',
      'Tea counter inside Mariage Frères',
      'Balcão de chás dentro da Mariage Frères',
      'Oliver H · CC BY-SA 3.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Mariage_Fr%C3%A8res%2C_30_rue_du_Bourg-Tibourg%2C_Paris_19_June_2008.jpg/960px-Mariage_Fr%C3%A8res%2C_30_rue_du_Bourg-Tibourg%2C_Paris_19_June_2008.jpg',
      'The Mariage Frères hanging sign at 30 Rue du Bourg-Tibourg (sepia photo)',
      'A placa suspensa da Mariage Frères no nº 30 da Rue du Bourg-Tibourg (foto em sépia)',
      'Tim Sackton from Somerville, MA / Wikimedia Commons (CC BY-SA 2.0)',
    ),
  ],
  'par-dammann-freres-vosges': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Damman_paris.jpg/960px-Damman_paris.jpg',
      'Shelves of tea tins inside the Dammann Frères shop on Place des Vosges',
      'Prateleiras de latas de chá na loja da Dammann Frères na Place des Vosges',
      'Léna / Wikimedia Commons (CC BY 4.0)',
    ),
  ],
  'par-angelina-rivoli': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/Angelina_cafe_Paris_4361.jpg/960px-Angelina_cafe_Paris_4361.jpg',
      "Angelina's Mont-Blanc pastry on a branded plate",
      'O Mont-Blanc do Angelina num prato com a marca da casa',
      'Gryffindor / Wikimedia Commons (CC BY-SA 3.0)',
    ),
  ],
  'par-legrand-galerie-vivienne': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c6/Paris_Galerie_Vivienne_2012_35.jpg/960px-Paris_Galerie_Vivienne_2012_35.jpg',
      'The Lucien Legrand shopfront inside the Galerie Vivienne',
      'A fachada da Lucien Legrand dentro da Galerie Vivienne',
      'Lionel Allorge / Wikimedia Commons (CC BY-SA 3.0)',
    ),
  ],
  'par-boulangerie-du-sentier': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Croissants_dans_une_boulangerie.jpg/960px-Croissants_dans_une_boulangerie.jpg',
      'Butter croissants in a Paris bakery basket (illustrative photo)',
      'Croissants de manteiga numa cesta de padaria parisiense (foto ilustrativa)',
      'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-maison-thevenin-buci': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/00_Croissant._Yum.jpg/960px-00_Croissant._Yum.jpg',
      'A butter croissant on a plate (illustrative photo)',
      'Um croissant de manteiga num prato (foto ilustrativa)',
      'Mark Mitchell / Wikimedia Commons (CC BY 2.0)',
    ),
  ],
  'par-fournil-didot': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/Baguettes_-_stonesoup.jpg/960px-Baguettes_-_stonesoup.jpg',
      'Three rustic baguettes on a wooden board (illustrative photo)',
      'Três baguetes rústicas numa tábua de madeira (foto ilustrativa)',
      'jules / stonesoup / Wikimedia Commons (CC BY 2.0)',
    ),
  ],
  'par-la-parisienne-poissonniere': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Baguettes%2C_Paris%2C_France_-_panoramio.jpg/960px-Baguettes%2C_Paris%2C_France_-_panoramio.jpg',
      'Baguettes in a basket at a Paris shop (illustrative photo)',
      'Baguetes numa cesta de uma loja em Paris (foto ilustrativa)',
      'Nick Thweatt / Wikimedia Commons (CC BY-SA 3.0)',
    ),
  ],
  'par-carl-marletti-censier': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Bon_mille-feuille.jpg/960px-Bon_mille-feuille.jpg',
      'A classic glazed mille-feuille (illustrative photo)',
      'Um mil-folhas clássico com cobertura (foto ilustrativa)',
      'Thomon / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-maison-delmontel-martyrs': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Flan_p%C3%A2tissier_bron.jpg/960px-Flan_p%C3%A2tissier_bron.jpg',
      'A slice of flan pâtissier on its bakery box (illustrative photo)',
      'Uma fatia de flan pâtissier sobre a caixa da padaria (foto ilustrativa)',
      'Gouglov / Wikimedia Commons (CC0)',
    ),
  ],
  'par-petit-vendome-capucines': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Sandwichs_classiques.jpg/960px-Sandwichs_classiques.jpg',
      'Classic baguette sandwiches: jambon-beurre, ham and cheese, saucisson (illustrative)',
      'Sanduíches clássicos de baguete: jambon-beurre, presunto e queijo, salame (ilustrativa)',
      'Boulanger: Nat / Photographer: Nat / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-caractere-de-cochon-charlot': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Jambon_beurre_classique.jpg/960px-Jambon_beurre_classique.jpg',
      'Jambon-beurre with thick slices of ham on a board (illustrative)',
      'Jambon-beurre com presunto em fatias grossas sobre tábua (ilustrativa)',
      'Al4az / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-breizh-cafe-marais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Galette_de_sarrasin.jpg/960px-Galette_de_sarrasin.jpg',
      'Buckwheat galette with a fried egg, cheese and creamy mushrooms (illustrative)',
      'Galette de trigo-sarraceno com ovo frito, queijo e cogumelos (ilustrativa)',
      'Melinda Legendre / Wikimedia Commons (CC BY-SA 4.0)',
    ),
  ],
  'par-arnaud-nicolas-bourdonnais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/P%C3%A2t%C3%A9_en_cro%C3%BBte_-_Le_Quai_%28Miribel%29_en_septembre_2021.jpg/960px-P%C3%A2t%C3%A9_en_cro%C3%BBte_-_Le_Quai_%28Miribel%29_en_septembre_2021.jpg',
      'Slice of pâté en croûte with cherries and parsley (illustrative)',
      'Fatia de pâté en croûte com cerejas e salsinha (ilustrativa)',
      'Benoît Prieur / Wikimedia Commons (CC0)',
    ),
  ],
  'par-bistrot-paul-bert-faidherbe': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/Steak_au_poivre.jpg/960px-Steak_au_poivre.jpg',
      'Steak au poivre with a peppercorn crust and potatoes (illustrative)',
      'Steak au poivre com crosta de pimenta e batatas (ilustrativa)',
      'Tim Pierce from Berlin, MA, USA / Wikimedia Commons (CC BY 2.0)',
    ),
  ],
  'par-au-pied-de-cochon-halles': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Mmm...onion_soup_%285344349906%29.jpg/960px-Mmm...onion_soup_%285344349906%29.jpg',
      'Onion soup gratinée in a crock (illustrative)',
      'Sopa de cebola gratinada na cumbuca (ilustrativa)',
      'jeffreyw / Wikimedia Commons (CC BY 2.0)',
    ),
  ],
  'par-escargot-montorgueil': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Escargot_%C3%A0_la_Bourguignonne_-_eatingeast.jpg/960px-Escargot_%C3%A0_la_Bourguignonne_-_eatingeast.jpg',
      'Six escargots with parsley butter in a cast-iron dish (illustrative)',
      'Seis escargots com manteiga de salsinha em travessa de ferro (ilustrativa)',
      'eatingeast / Wikimedia Commons (CC BY 2.0)',
    ),
  ],
  'par-au-reve-caulaincourt': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Oeufsmayo.JPG/960px-Oeufsmayo.JPG',
      'Halved eggs with mayonnaise on frisée and olives (illustrative)',
      'Ovos com maionese sobre frisée e azeitonas (ilustrativa)',
      'Eyone / Wikimedia Commons (Public domain)',
    ),
  ],
  'par-au-bourguignon-du-marais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/B%C5%93uf_bourguignon.JPG/960px-B%C5%93uf_bourguignon.JPG',
      'Bœuf bourguignon with potatoes in a cocotte (illustrative)',
      'Bœuf bourguignon com batatas na cocotte (ilustrativa)',
      'Arnaud 25 / Wikimedia Commons (CC BY-SA 3.0)',
    ),
  ],
  'par-fontaine-de-mars-saint-dominique': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Confit_de_canard_sur_lit_de_salade_des_Hautes-Pyr%C3%A9n%C3%A9es.jpg/960px-Confit_de_canard_sur_lit_de_salade_des_Hautes-Pyr%C3%A9n%C3%A9es.jpg',
      'Crispy duck confit leg on salad (illustrative)',
      'Coxa de pato confitada sobre salada (ilustrativa)',
      'Matt Ryall / Wikimedia Commons (CC BY 2.0)',
    ),
  ],

  'par-avant-comptoir-odeon': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/Paris_street_market_stall_-_charcuterie_counter_1.jpg/500px-Paris_street_market_stall_-_charcuterie_counter_1.jpg',
      'Charcuterie counter at a Paris market stall (generic photo)',
      'Balcão de charcutaria em uma banca de mercado parisiense (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-berthillon-ile-saint-louis': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/c/c0/Blood_Orange_Sorbet_by_Berthillon.jpg',
      'Blood orange sorbet by Berthillon',
      'Sorvete de laranja-sanguínea da Berthillon',
      'Wikimedia Commons',
    ),
  ],
  'par-chessy-rer': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Gare_de_Marne-la-Vall%C3%A9e_-_Chessy_%282026-08-02%29-1.jpg/500px-Gare_de_Marne-la-Vall%C3%A9e_-_Chessy_%282026-08-02%29-1.jpg',
      'Platform hall at Marne-la-Vallée–Chessy station',
      'Saguão de plataformas da estação Marne-la-Vallée–Chessy',
      'Wikimedia Commons',
    ),
  ],
  'par-daw-ratatouille': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Toon_Studio_Ratatouille_area.jpg/500px-Toon_Studio_Ratatouille_area.jpg',
      'Facade of Ratatouille: The Adventure, Disney Adventure World',
      'Fachada da atração Ratatouille: The Adventure, Disney Adventure World',
      'Wikimedia Commons',
    ),
  ],
  'par-disney-adventure-world': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Entrance_gate_of_Walt_Disney_Studios_Park%2C_Disneyland_Paris.jpg/500px-Entrance_gate_of_Walt_Disney_Studios_Park%2C_Disneyland_Paris.jpg',
      'Entrance gate of the park, formerly Walt Disney Studios Park',
      'Portão de entrada do parque, antigo Walt Disney Studios Park',
      'Wikimedia Commons',
    ),
  ],
  'par-dlp-phantom-manor': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Disneyland_Paris_-_4481390960.jpg/500px-Disneyland_Paris_-_4481390960.jpg',
      'Phantom Manor, Disneyland Park',
      'Phantom Manor, Disneyland Park',
      'Wikimedia Commons',
    ),
  ],
  'par-dlp-pirates': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Pirates_of_the_Caribbean_-_panoramio.jpg/500px-Pirates_of_the_Caribbean_-_panoramio.jpg',
      'Pirates of the Caribbean ride, Disneyland Park',
      'Atração Piratas do Caribe, Disneyland Park',
      'Wikimedia Commons',
    ),
  ],
  'par-dlp-tales-of-magic': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Parc_Disneyland_-_Chessy_%28FR77%29_-_2025-10-13_-_33.jpg/500px-Parc_Disneyland_-_Chessy_%28FR77%29_-_2025-10-13_-_33.jpg',
      'Sleeping Beauty Castle at Disneyland Park, the Disney Tales of Magic viewing spot',
      'Castelo da Bela Adormecida no Disneyland Park, o lugar para assistir ao Disney Tales of Magic',
      'Wikimedia Commons',
    ),
  ],
  'par-equilibre-blomet': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Len%C3%B4tre-Paris-Brest.jpg/500px-Len%C3%B4tre-Paris-Brest.jpg',
      'Paris-Brest pastry, choux ring filled with praline cream (generic photo)',
      'Paris-Brest, anel de massa choux recheado com creme de praliné (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-jacques-genin-marais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/85/Caramel_au_beurre_sal%C3%A9_02.jpg/500px-Caramel_au_beurre_sal%C3%A9_02.jpg',
      'Salted butter caramels (generic photo)',
      'Caramelos de manteiga salgada (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-la-chambre-marais': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Bocaux_de_confiture_de_l%27%C3%AEle_de_la_r%C3%A9union.jpg/500px-Bocaux_de_confiture_de_l%27%C3%AEle_de_la_r%C3%A9union.jpg',
      'Jars of jam (generic photo)',
      'Potes de geleia (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-le-roux-saint-germain': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/CARAMEL_CBS.jpeg/500px-CARAMEL_CBS.jpeg',
      'Salted-butter caramel (CBS), the style Henri Le Roux created in 1977 (generic photo)',
      'Caramelo de manteiga salgada (CBS), o estilo criado por Henri Le Roux em 1977 (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-marie-anne-cantin-champ-de-mars': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Comt%C3%A9_cheese_dice.jpg/500px-Comt%C3%A9_cheese_dice.jpg',
      'Comté cheese, diced (generic photo)',
      'Queijo Comté em cubos (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-matthieu-pauline-cler': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Paris_Brest_pastry_variation_by_Philippe_Conticini.JPG/500px-Paris_Brest_pastry_variation_by_Philippe_Conticini.JPG',
      'Paris-Brest pastry, a modern bakery variation (generic photo)',
      'Paris-Brest, uma variação moderna de padaria (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-mere-de-famille-faubourg-montmartre': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/P%C3%A2tes_de_fruits.JPG/500px-P%C3%A2tes_de_fruits.JPG',
      'Pâtes de fruits, French fruit jelly candies (generic photo)',
      'Pâtes de fruits, balas de fruta francesas (foto ilustrativa)',
      'Wikimedia Commons',
    ),
  ],
  'par-val-de-fontenay-rer': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d5/Gare_Val_Fontenay_RER_A_Fontenay_Bois_1.jpg/500px-Gare_Val_Fontenay_RER_A_Fontenay_Bois_1.jpg',
      'RER A platforms at Val de Fontenay station',
      'Plataformas do RER A na estação Val de Fontenay',
      'Wikimedia Commons',
    ),
  ],
};

export function photosForPlaceId(id: string): TravelPhoto[] | undefined {
  const list = photosByPlaceId[id];
  return list && list.length > 0 ? list : undefined;
}

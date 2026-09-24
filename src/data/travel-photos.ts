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
  'par-bouillon': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chez_Chartier_1.JPG',
      'Bouillon',
      'Bouillon',
      'Wikimedia Commons',
    ),
  ],
  'par-cedric-grolet': [
    photo(
      'https://cdn.sortiraparis.com/images/80/76511/340058-la-patisserie-de-cedric-grolet-au-meurice.jpg',
      'Pâtisserie Cédric Grolet at Le Meurice',
      'Pâtisserie Cédric Grolet no Le Meurice',
      'Sortir à Paris',
    ),
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
      'https://upload.wikimedia.org/wikipedia/commons/9/9e/P1160897_Paris_XVII_rue_de_L%C3%A9vis_rwk.jpg',
      'Charcuterie Arnaud Nicolas',
      'Charcuterie Arnaud Nicolas',
      'Wikimedia Commons',
    ),
  ],
  'par-auptitgrec': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Paris-Rue_Mouffetard-160-nr_68-Au_p%27tit_Grec-2017-gje.jpg/1280px-Paris-Rue_Mouffetard-160-nr_68-Au_p%27tit_Grec-2017-gje.jpg',
      "Au P'tit Grec at 68 Rue Mouffetard",
      "Au P'tit Grec, 68 Rue Mouffetard",
      'Gerd Eichmann · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-bake-blend': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWldBjMg13upIn99jRPyDfD4dh8tuB7AnKHDUd9No_zbcT2134mE43O_M6B6tzOIYeB9UCgTCHgEGek2iUPKLZB2hVjQbM1cxh0vmvbQKK2ha7r5XnvV-ydkGK_ZsIHejFQztzKN9siBV_4p=s392-k-no',
      'Le café by Maison Bergeron',
      'Le café by Maison Bergeron',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWn4Maj78YqyPGePWag5UDplYQrvU8s5Z31S9h0PFhextMeMh7xBefhDv3AsgmSfjTYbsaUiEsu94ajLpKiKulG52d0FUt3guL3-VOOHs_OEU-smShuSqqjXGyDdVSLT6uN8CZtfwy0CPWT9=s457-k-no',
      'Pastries at Le café by Maison Bergeron',
      'Doces no Le café by Maison Bergeron',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnT7AKRGTQTbTRcUttUVpK1BLrF1d78tFoN08989bk5-OrAxljHvsmxa2BIdFKuj9shVgiNFQfCeUf1DUaI8-rFmnux0LqF_MUF4PHL0LZOEv32jQJ73GMCwCAGiKWLnXKkXD18=s609-k-no',
      'Le café by Maison Bergeron interior',
      'Interior do Le café by Maison Bergeron',
      'Google Maps',
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlfGFQJNkrIfykELlKzkUwUxZ-mepdxjRa1sd_Uou20bQHozTUgfCRWhsJWIDIC8ItvmefamDbqINS9_lBy-YF9wdUQgMaKuq_GZ_woM2sM87GZn_jM7aQOekyeRoq3vZHUvxr6KCtYATg=s348-k-no',
      'Café de Flore',
      'Café de Flore',
      'Google',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmi4YtD6ALn5sDzxAIkBJSI9sJUoc6pbv1JVfz2nvH_BOZkyQjCnNqkcS0mvj3WeZEmDy6yl67-tg2q5Ii6PlYSI4bAeJG4K9LUu2B9bDZf6X--DsOt5r0JXXtnSZzCZVFmRfOK_73ZXMOy=s425-k-no',
      'Café de Flore',
      'Café de Flore',
      'Google',
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnEY8D0ehGDCxCzy0LMqSo4b8RK894HTeV4gyaZiAkpiT0oG819zWmpZYBzLqZyP0TeADzZZ1NLwfFDz7m2X5HJ4A6Xl4eVhlwu8d4-oxypqYypndljnn3Qlk8lXMTmjYTL7v-fJg=s811-k-no',
      'BHV Marais',
      'BHV Marais',
      'Google Maps',
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
  'par-bohemia': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkUZDpMSZqgtkyRxREKF0vm26-EhpWQCNaCQN2AiBG1RQK7pwDeTSsrr5n57c_kOhiFIE9Pv7_Y7EvVz4IWHOa4r2_2Hi6NhuS4Srco3_uvD8eDpkiHIU6ftoXXgi-r1HosNpp93w=s1219-k-no',
      "Baguett's Café Molière",
      "Baguett's Café Molière",
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnTwGN1CH81ziHiPdcK-UxvVd-ZWiUn86C4inc2ccG4wXglUwpEgpuBeIseJCk33NXFpC4MFBbdZecym65zx2t-YsBtlw8IT9tFZPJrHhQFz_5XQDWrn3V5eGgX0XnC7bwosP2BmPNRJZlD=s927-k-no',
      "Baguett's Café Molière — interior",
      "Baguett's Café Molière — interior",
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkM8UGnc0zCL78U-xyIPGBhkSkccxzOteDVjBwD7emxAfP11Qskpt0AOgn1yfrGau8pnmOVh6aqotjgdEn6ewYN_soQmvhCi9XT85s_m9Kx9DCbW6iUxjI9lG4dHgzLBrHrL7eTIOl2c8iD=s914-k-no',
      "Baguett's Café Molière — dishes",
      "Baguett's Café Molière — pratos",
      'Google Maps',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/La_D%C3%A9fense_and_Bois_de_Boulogne_from_the_Eiffel_Tower%2C_11_June_2017_001.jpg/3840px-La_D%C3%A9fense_and_Bois_de_Boulogne_from_the_Eiffel_Tower%2C_11_June_2017_001.jpg',
      'Bois de Boulogne',
      'Bois de Boulogne',
      'Wikimedia Commons',
    ),
  ],
  'par-brasserie-pres': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/0/0e/P1020083_Paris_VI_Cour_du_Commerce-Saint-Andr%C3%A9_reductwk.JPG',
      'Brasserie des Prés',
      'Brasserie des Prés',
      'Wikimedia Commons',
    ),
  ],
  'par-burger-king-opera': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl25elIupAOZi6Ix80qTzI64wQeX4a9k5rqXuAR9tlRjlowJHGCX6xcUvGs5_ymGdp54IdP3LSu2eKa4MLW-4tNcH0koI25LIjdeal2KNXTDe-pE643Lyde20Bpi2aQ1bvcF2bOJg=s696-k-no',
      'Burger King Opéra',
      'Burger King Opéra',
      'Google Maps',
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
  'par-champ-mars': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Champ_de_Mars_from_the_Eiffel_Tower_-_July_2006_edit.jpg/1280px-Champ_de_Mars_from_the_Eiffel_Tower_-_July_2006_edit.jpg',
      'Champ de Mars',
      'Champ de Mars',
      'Wikimedia Commons',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Esplanade_G%C3%A9n%C3%A9ral_Gaulle_-_Courbevoie_%28FR92%29_-_2023-09-16_-_6.jpg/1280px-Esplanade_G%C3%A9n%C3%A9ral_Gaulle_-_Courbevoie_%28FR92%29_-_2023-09-16_-_6.jpg',
      'Esplanade du Général de Gaulle, La Défense',
      'Esplanade du Général de Gaulle, La Défense',
      'Chabe01 · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-five-guys-rivoli': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlZHut6hJ7Om0V81zIPFT3TZ7Xb_5QXRfbIyVphCKmC2U4O7TadlESSFsyvq_VIapZQRb21UcM2sEZvB9JP7bc4n_sDjV2q6buyBxHHLpxPZxW9C2BhkrbqyVCcTpM16EBt_Wg5KirBmAzO=s811-k-no',
      'Five Guys Rivoli',
      'Five Guys Rivoli',
      'Google',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlgE1IykNGZpQnc9Rp8mcUVzU5VuMd-FataC9FYCX1-nqdNh3Mk7vKrW9f7b5kxfKJ1VAeaVv0zS7QPc3vjfWe9AwIaxSux0pLnIN9WyI-qdKpITDxoIicaivZqQ97ifHjZTeqKsM9PAMpN=s696-k-no',
      'Five Guys Rivoli',
      'Five Guys Rivoli',
      'Google',
    ),
  ],
  'par-felicita': [
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkIc4UdAVBkz5wAbJ8WviLm915QyPqJLdAlrF3iV3NIDAD-5GOWnA-_WxJ-roqa8y4oCY4tYMRwVmb9607O7hTeq1W6v6rBRasHAx2FT3sN32u5qcK1f-aV-8tcSJ21uaKSvkhrXQGDkZZ8=s696-k-no',
      'Forum des Halles',
      'Forum des Halles',
      'Google Maps',
    ),
  ],
  'par-francette': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/a/aa/P1080375_Paris_XV_Port_de_Suffren_rwk.JPG',
      'Francette',
      'Francette',
      'Wikimedia Commons',
    ),
  ],
  'par-franklin-passy': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/1/1c/Statue_de_Benjamin_Franklin%2C_square_de_Yorktown%2C_Paris_16e_9.jpg',
      'Le Franklin Passy',
      'Le Franklin Passy',
      'Wikimedia Commons',
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk2dTfnFwYmaCMI15pWCi6kWGlluB6psWrBDDRlD1aZEdYm74Y9uTQGYtn5VQc0A0LXB_arnw6kqZzojAw2Wwg5HiIm5HJQmIgabfmUmmtwSX-0G6HxFjaXr_Ky2qbobXWFRMTfQOnAbybS=s457-k-no',
      'Galeries Lafayette',
      'Galeries Lafayette',
      'Google',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmFA0m_Tq9gL2HBn69LmCAycdFhiOtIHOaCDXvHKucCySEHOMv3IVZUP37dgPQjJngZzUjKKF8MNQ0kCNdH6H9QbquzUE3444w79wl9HZk8ZLJeD4zgWWnosybHg_L5Ns0NWHiglJ4-e_Pd=s368-k-no',
      'Galeries Lafayette',
      'Galeries Lafayette',
      'Google',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnpDnIfK5asZ6qWUlPU3m3c58amXonxkkcAcmuZbeeOH4uL5wJuZiVpsYRFFShqeUfx1Zgp2KAN0O2ZR_wgDX6g-ch7xd1UO18lkx0ojFmtIIx35rJxWfkgU7KIhBqcrVbOmcv32y8HLOyL=s365-k-no',
      'Galeries Lafayette',
      'Galeries Lafayette',
      'Google',
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
      'https://cdn.sortiraparis.com/images/80/95310/680422-la-patisserie-de-jeffrey-cagnes-les-photos.jpg',
      'Pâtisserie Jeffrey Cagnes',
      'Pâtisserie Jeffrey Cagnes',
      'Sortir à Paris',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmIIAjo_lSaDowJ0Wj5kcqK7UmcBq2Ty8ABY58LpM6-LspvvbIF2MHLI0UNHwAhhxnA7DjqUy4JmE9_7vwNfz6CYw238S4dxboNJ8Jd3VhID638h7ZKcvamVlstKkH3FL1_2BSgAnhY3zE=s406-k-no',
      'Jeffrey Cagnes pastries',
      'Doces Jeffrey Cagnes',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWln4CTyblSguxcNY_GFhJyz6wzOKURhN-eFyPVRcFWRGIdFG97yuAtlxea-Z6OqqK44TylGzbgfSpMZPCWcv5cJq_cPq6tP62fyqGBK4HRebunN4jLKCqymjpWkw0A_UadyGbtz_mGAIMWo=s348-k-no',
      'Jeffrey Cagnes shop',
      'Loja Jeffrey Cagnes',
      'Google Maps',
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk0gzwLpcH_UdtOadluoLz-GOpOPH3CA9DYt3dHWZUGsU9pqbUhfgKRWFl2UVKFizBRq1bqr17yM81ewmNKy36Oenp3cMYqw9CW60z0AqIxzByyP7op0p3x0_FNUQmYXeFsn1eCjfnxhZPN=s773-k-no',
      'La Maison d\'Isabelle croissants',
      'Croissants da La Maison d\'Isabelle',
      'Google Maps',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Croissant%2C_whole.jpg/1280px-Croissant%2C_whole.jpg',
      'Butter croissant',
      'Croissant de manteiga',
      'Wikimedia Commons',
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlLr2ZyOyW0DW2yWYYo4kVh58E1iOPA0jVK6G7txkkVOQJseB8F1ZChnkX6l4TN1KKHtAA4flY9Q6_dpEM9HCo16N9IoKVCMLD3DYJS7AN3SFMTaZQGj8oZyjLIvT8o8vrukLfk-jDltn80=s1219-k-no',
      "Marché d'Aligre",
      "Marché d'Aligre",
      'Google Maps',
    ),
  ],
  'par-marche-bastille': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWmkLsVvYlhMCeproeoRDB-ytYLFBXS9T4j665o1mhUUPwScsShMUJK2J0vysxQDR1a9TRrrZNEsv1M1vYSaqnatPThdAV9rif1arvcZ3TUuk_7t_t8nwm1pWjsdNNIRkUCtOdHKu19SdaI=s696-k-no',
      'Marché Bastille',
      'Marché Bastille',
      'Google Maps',
    ),
  ],
  'par-marche-enfants-rouges': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkMAd6auG6O4KUWeuPpeXVLW8_l_lZzvf1YdAV0v2J8wA20ru7IzgGhMq6sX5ruThNNhEIWVJ1LSho8ANt_GEFbosLGS5k2YEYOEBZwnlZbYYUKt14y1U-dOxMFdF3VSQngxpYcJVDY6cKC=s608-k-no',
      'Marché des Enfants Rouges',
      'Marché des Enfants Rouges',
      'Google Maps',
    ),
  ],
  'par-mcdonalds-champs': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWn7b5zps0QDEwMsyLDpD9tMW2NFs39BvTaRgYil5dwc2jL38jTtM6X2GHg82SvTxwvExjxdApF7o8lJ_BGQsnhsgl7N9mcIDOf8KmludLUCkCjxyEkR1bh-3qyWG7Zt52441k9jIw=s348-k-no',
      "McDonald's Champs-Élysées",
      "McDonald's Champs-Élysées",
      'Google Maps',
    ),
  ],
  'par-metro-2': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/3/35/Musician_Mohamed_Lamouri_in_Paris_Metro_line_2.jpg',
      'Metro Line 2',
      'Metro Line 2',
      'Wikimedia Commons',
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
  'par-michalak-etienne': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWl_F5T32X9QyZREvawZVe0bOJ2aylxLUkh2inyD3ANQM5IkiiFHLAQFUaYpmYl8d5pHi_RCF7ALb3W0d8y60PiKLZZtI4BS_BFTYl0hBrkNcU-kxkcLAYMTu3Ve3GB-vtEmg2PbFg=w203-h360-k-no',
      'Pâtisserie Michalak · Étienne Marcel',
      'Pâtisserie Michalak · Étienne Marcel',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnKZrjDWPOFc35n60b2v1NHIlCFvobPPTMNw8XnDVe3CxYGTVn3Ync_GGMmoYJjbljCFZnkIUQUD5VqotgUNPWPT-MhJUUgTrhyZoKCJHbMwEq5zC0c1YuhDsibIawEprBwULjqlKHy0B9T=s609-k-no',
      'Michalak pastries',
      'Doces Michalak',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWle5pSQjLlqxWH4yh_cxEjs87ocuACipxxNIl8cR7mVT8avg_F12uEzB3cSfYTYcdjl5w0TAb4eHMuZQ3aLkX3s_ypX8ayvxxW2nSxkuJtsTxqSnbBTXEFgovE6DqmWxQ2iiaDMnF3ejm4=s406-k-no',
      'Michalak shop',
      'Loja Michalak',
      'Google Maps',
    ),
  ],
  'par-artizans': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/e/ef/Chez_Chartier_1.JPG',
      'Classic Paris bistro dining room',
      'Salão clássico de bistrô parisiense',
      'Wikimedia Commons',
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnF1uhrNplnaayle-0aAhogQhyHeKRYWNa74nWrt9O-96-pgRgEK-xzYnQKZyd8brJJilHYUF6zVPuR9dmAUF5gacQBWiqkg6Rgr81ufZRfYtFRlxGl_L4HTWWSjg2aeECSOaa8=s811-k-no',
      'Monoprix Opéra',
      'Monoprix Opéra',
      'Google Maps',
    ),
  ],
  'par-montmartre': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/View_from_Notre-Dame_de_Paris%2C_24_June_2014_004.jpg/3840px-View_from_Notre-Dame_de_Paris%2C_24_June_2014_004.jpg',
      'Montmartre',
      'Montmartre',
      'Wikimedia Commons',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/Parc_de_Saint-Cloud_avec_vue_sur_la_Tour_Montparnasse.jpg/1280px-Parc_de_Saint-Cloud_avec_vue_sur_la_Tour_Montparnasse.jpg',
      'Tour Montparnasse',
      'Tour Montparnasse',
      'Wikimedia Commons',
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkU4PmcTDXuC46zcsWSnJJ1SGYdjlg0cnm98pKosrcZu0dgXMSbQbaqXxhU4Du3UY5T-svxcrBe2KFVcRerynbAwaDLNlrynDFTkKXOvWZxYiskgRn6lnJRieX2VJjQ3IcCb-xT=s901-k-no',
      'PAUL Orly — bakery counter',
      'PAUL Orly — balcão da padaria',
      'Google Maps',
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
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWlIXnW00fy0Lc5DC9DmAB5cqZN9s3smQ5tdSvYGMp8fGNavpxIKCq8UZvVVVtrP-e5UhfD9YKGcYXYe83UFbHbdaNGetbAsmaubU2bmVW1kNh5g0Z79iz3UtPV1GiD9hEJtxrCrC0hiIV59=s928-k-no',
      'PAUL La Défense',
      'PAUL La Défense',
      'Google Maps',
    ),
  ],
  'par-pierre-herme': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/39/Various_Pierre_Herme_macarons.jpg/1280px-Various_Pierre_Herme_macarons.jpg',
      'Pierre Hermé macarons assortment',
      'Seleção de macarons Pierre Hermé',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/5/52/A_selection_of_Pierre_Herm%C3%A9_pastry_creations.jpg',
      'Pierre Hermé pastry creations',
      'Criações de confeitaria Pierre Hermé',
      'Wikimedia Commons',
    ),
  ],
  'par-pompidou': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Apud_la_Centro_Georges-Pompidou_5.jpg/1280px-Apud_la_Centro_Georges-Pompidou_5.jpg',
      'Centre Pompidou façade and escalator tubes',
      'Fachada do Centre Pompidou e tubos das escadas',
      'Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Place_Georges-Pompidou%2C_Paris_24_April_2011.jpg/1280px-Place_Georges-Pompidou%2C_Paris_24_April_2011.jpg',
      'Place Georges-Pompidou and the Centre',
      'Place Georges-Pompidou e o Centre',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Place_Cambronne_-_Paris_XV_%28FR75%29_-_2021-08-09_-_3.jpg/3840px-Place_Cambronne_-_Paris_XV_%28FR75%29_-_2021-08-09_-_3.jpg',
      'Le Royal Cambronne',
      'Le Royal Cambronne',
      'Wikimedia Commons',
    ),
  ],
  'par-rue-cler': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWkeiO7DDL5xXmFeahNjey_zHAtL_o11evVGW2uraioxRsfrTBaLC5A7yS_8KOKf-qwGrjIssjgWX6HmoZLcAB4AzhqTLLuL63BWO38QHOR0cdDYFB7bStui0mL_-tTGC5mdQfJ1eg=s696-k-no',
      'Rue Cler market street',
      'Rue Cler — rua de mercado',
      'Google Maps',
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
      'https://upload.wikimedia.org/wikipedia/commons/7/74/Serianthes_calycina_au_Jardin_des_Serres_d%27Auteuil_%28Paris%29.jpg',
      'Jardin des Serres d\'Auteuil',
      'Jardin des Serres d\'Auteuil',
      'Wikimedia Commons',
    ),
  ],
  'par-shakespeare': [
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWnYJiEHyO5MHM2kAbH2cbi1w2LBAeYS_xuFSqotP3no10MQuYiU_R32a-643KZ1sg01A_8XjyDCM3BcfCm2LQQBvlkm-madcx7ywnHRtIuGa5QHAazhqJavA6Bd0X9xsVb45ACfoeb5bHB5=w408-h544-k-no',
      'Shakespeare and Company bookshop',
      'Livraria Shakespeare and Company',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWk3CDv49kUl1PyWi8GAhIiMlga9dz2WwyRUt2om9v3q7EV_RLVP5w9gVGfthdxSMCvxOx6k46FS_lBngmkl3TSjiMzIJpH01iTtVBUFAc6CBJLZ_FUuZD1M8qPsi7kxtK2E04FLNB6Teaw=s696-k-no',
      'Shakespeare and Company interior',
      'Interior da Shakespeare and Company',
      'Google Maps',
    ),
    photo(
      'https://lh3.googleusercontent.com/gps-cs-s/AHRPTWletNv21VtmdV6MDwoYKjqJcq8L2XTs1maAYh-ou5Ih-eFfzNnpYLxBvCE8Evpy6OVrcyNpGiQ1uwt5DAEMt_3aLIeLdXFw7TD0O99UkekT3Bny9zwrwm8fv3q3MXO9AdrWu1L2hWXyDNo=s644-k-no',
      'Shakespeare and Company shelves',
      'Prateleiras da Shakespeare and Company',
      'Google Maps',
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
      'https://upload.wikimedia.org/wikipedia/commons/c/cb/Le_Train_Bleu.jpg',
      'Le Train Bleu',
      'Le Train Bleu',
      'Wikimedia Commons',
    ),
  ],
  'par-trocadero': [
    photo(
      'https://live.staticflickr.com/4010/4175210166_4b92dc7454_b.jpg',
      'Trocadéro',
      'Trocadéro',
      'Flickr (CC via Openverse)',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Belv%C3%A9d%C3%A8re_de_Belleville_%40_Parc_de_Belleville_%40_Paris_20_%2825137120823%29.jpg/1280px-Belv%C3%A9d%C3%A8re_de_Belleville_%40_Parc_de_Belleville_%40_Paris_20_%2825137120823%29.jpg',
      'Belleville lookout over Paris',
      'Mirante de Belleville sobre Paris',
      'Guilhem Vellut · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/1/16/Parc_de_Belleville_Paris_01.jpg',
      'Parc de Belleville',
      'Parc de Belleville',
      'Pol · Public domain · Wikimedia Commons',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Archives_nationales_%40_Le_Marais_%40_Paris_%2833693687914%29.jpg/1280px-Archives_nationales_%40_Le_Marais_%40_Paris_%2833693687914%29.jpg',
      'Hôtel de Soubise, Archives nationales',
      'Hôtel de Soubise, Archives nationales',
      'Guilhem Vellut · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Garden_%40_Archives_nationales_%40_Le_Marais_%40_Paris_%2834494938086%29.jpg/1280px-Garden_%40_Archives_nationales_%40_Le_Marais_%40_Paris_%2834494938086%29.jpg',
      'Archives nationales garden',
      'Jardim dos Archives nationales',
      'Guilhem Vellut · CC BY 2.0 · Wikimedia Commons',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/03/Rosa_Bonheur%2C_Paris_5_June_2015.jpg/1280px-Rosa_Bonheur%2C_Paris_5_June_2015.jpg',
      'Rosa Bonheur in the Buttes-Chaumont',
      'Rosa Bonheur no Buttes-Chaumont',
      'Tom Hilton · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Guinguette_Rosa_Bonheur_-_Parc_des_Buttes-Chaumont.jpg/1280px-Guinguette_Rosa_Bonheur_-_Parc_des_Buttes-Chaumont.jpg',
      'Rosa Bonheur guinguette',
      'Guinguette Rosa Bonheur',
      'W. of Landshire · CC BY-SA 4.0 · Wikimedia Commons',
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
      'https://upload.wikimedia.org/wikipedia/commons/c/cb/French_fries_with_mayonnaise_%283487440272%29.jpg',
      'Fries with mayonnaise (generic photo)',
      'Batata frita com maionese (foto ilustrativa)',
      'Kham Tran · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/20220602_puntzak_friet_schaftlokaal_ulft.jpg/1280px-20220602_puntzak_friet_schaftlokaal_ulft.jpg',
      'Fries in a paper cone (generic photo)',
      'Batata frita no cone (foto ilustrativa)',
      'Ziko van Dijk · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-bouillon-republique': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Paris_3e_Boulevard_du_Temple_Bouillon_R%C3%A9publique_679.jpg/1280px-Paris_3e_Boulevard_du_Temple_Bouillon_R%C3%A9publique_679.jpg',
      'Bouillon République on Boulevard du Temple',
      'Bouillon République no Boulevard du Temple',
      'GFreihalter · CC BY-SA 4.0 · Wikimedia Commons',
    ),
  ],
  'par-le-nesle': [
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Chocolate_Cake_Slice_in_bin_%2832180558890%29.jpg/1280px-Chocolate_Cake_Slice_in_bin_%2832180558890%29.jpg',
      'Chocolate cake slice (generic photo)',
      'Fatia de bolo de chocolate (foto ilustrativa)',
      'Willis Lam · CC BY-SA 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Slice_of_chocolate_cake.jpg/1280px-Slice_of_chocolate_cake.jpg',
      'Chocolate cake slice (generic photo)',
      'Fatia de bolo de chocolate (foto ilustrativa)',
      'Ruth Hartnup · CC BY 2.0 · Wikimedia Commons',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/Bonjour%2C_Croque_Monsieur_-_Lunch_in_Paris%2C_27_June_2023.jpg/1280px-Bonjour%2C_Croque_Monsieur_-_Lunch_in_Paris%2C_27_June_2023.jpg',
      'Croque-monsieur (generic photo)',
      'Croque-monsieur (foto ilustrativa)',
      'Sharon Hahn Darlin · CC BY 2.0 · Wikimedia Commons',
    ),
    photo(
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Croque_Monsieur_and_salad_at_Paris_Bakery.jpg/1280px-Croque_Monsieur_and_salad_at_Paris_Bakery.jpg',
      'Croque-monsieur with salad (generic photo)',
      'Croque-monsieur com salada (foto ilustrativa)',
      'Ruth Hartnup · CC BY 2.0 · Wikimedia Commons',
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
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Grand_Canal_de_Versailles_near_Grand_Trianon%2C_24.07.13.jpg/1280px-Grand_Canal_de_Versailles_near_Grand_Trianon%2C_24.07.13.jpg',
      'Grand Canal at Versailles, where La Flottille sits',
      'Grand Canal de Versalhes, onde fica La Flottille',
      'Liberaler Humanist · CC BY-SA 3.0 · Wikimedia Commons',
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
};

export function photosForPlaceId(id: string): TravelPhoto[] | undefined {
  const list = photosByPlaceId[id];
  return list && list.length > 0 ? list : undefined;
}

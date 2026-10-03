import type { LString, TravelPlace } from './travel';

const l = (pt: string, en: string): LString => ({ 'pt-BR': pt, en });
// Exact Google Maps entities and official sources checked 2026-10-03.
// See docs/references/italy-portugal-meals-2026-10-03.md.
export const laSpeziaFoodPlaces: TravelPlace[] = [
  {
    id: 'spe-la-pia', name: l('La Pia Centenaria · Via Magenta', 'La Pia Centenaria · Via Magenta'),
    category: 'restaurants', subcategories: ['italian'], lat: 44.1048542, lng: 9.820452,
    address: 'Via Magenta 12, La Spezia', googleRating: 4.4,
    mapsUrl: 'https://www.google.com/maps/place/La+Pia+Centenaria/data=!4m6!3m5!1s0x12d4fc997369d1b5:0xb8cecd1f769c62e9!8m2!3d44.1048542!4d9.820452!16s%2Fg%2F1tfd91d3',
    description: l('Casa histórica de La Spezia fundada em 1887, especializada em farinata de grão-de-bico, pizza em fatias e focaccia com queijo. A unidade da Via Magenta mantém a tradição de refeições simples da Ligúria.', 'Historic La Spezia eatery founded in 1887, specializing in chickpea farinata, pizza slices and cheese focaccia. The Via Magenta branch continues the tradition of simple Ligurian meals.'),
    aiSuggested: true, aiReason: l('Jantar de especialidades locais no centro, após a chegada de Milão.', 'A dinner of local specialties in the center after arriving from Milan.'),
    visit: { durationMin: 45, avgPricePerPerson: { currency: 'EUR', min: 10, max: 20 }, tips: l('Quarta e quinta: 11h–15h e 18h–23h, segundo a ficha Google Maps consultada em 3/10/2026. Menu oficial no site lapia.it.', 'Wednesday and Thursday: 11:00–15:00 and 18:00–23:00, per Google Maps checked on 3 October 2026. Official menu at lapia.it.') },
  },
  {
    id: 'spe-fiorini', name: l('Pasticceria Fiorini', 'Pasticceria Fiorini'),
    category: 'cafes', subcategories: ['pastry', 'coffee-shop'], lat: 44.1064196, lng: 9.8264945,
    address: 'Piazza Giuseppe Verdi 25, La Spezia', googleRating: 4.2,
    mapsUrl: 'https://www.google.com/maps/place/Pasticceria+Fiorini/data=!4m6!3m5!1s0x12d4fc97b31aa013:0x5765316b16e806a0!8m2!3d44.1064196!4d9.8264945!16s%2Fg%2F1vx70nfx',
    description: l('Confeitaria na Piazza Giuseppe Verdi, com brioches, doces e serviço de café. Oferece consumo no local e produtos para levar.', 'Pastry shop on Piazza Giuseppe Verdi serving brioches, pastries and coffee, with dine-in and takeaway service.'),
    aiSuggested: true, aiReason: l('Café da tarde depois do check-in, antes de comprar os alimentos e voltar à hospedagem.', 'Afternoon coffee after check-in, before buying groceries and returning to the accommodation.'),
    visit: { durationMin: 25, avgPricePerPerson: { currency: 'EUR', min: 1, max: 10 }, tips: l('Quarta e quinta: 7h30–20h. Fonte: ficha Google Maps consultada em 3/10/2026.', 'Wednesday and Thursday: 07:30–20:00. Source: Google Maps checked on 3 October 2026.') },
  },
  {
    id: 'spe-inferno', name: l('Osteria all’Inferno dal 1905', 'Osteria all’Inferno dal 1905'),
    category: 'restaurants', subcategories: ['italian'], lat: 44.104847, lng: 9.8180645,
    address: 'Via Lorenzo Costa 3, La Spezia', googleRating: 4.4,
    mapsUrl: 'https://www.google.com/maps/place/Osteria+all%27Inferno+dal+1905/data=!4m6!3m5!1s0x12d4e3b87945b933:0xb93141b0dd581b4b!8m2!3d44.104847!4d9.8180645!16s%2Fg%2F1thzxh64',
    description: l('Osteria do centro histórico dedicada à cozinha liguriana, com massas, peixes e pratos tradicionais. Entre as especialidades estão ravioli de mexilhões e anchovas.', 'Old-town osteria specializing in Ligurian cooking, with pasta, fish and traditional dishes, including mussel ravioli and anchovies.'),
    aiSuggested: true, aiReason: l('Jantar de cozinha liguriana após o bate-volta a Cinque Terre.', 'A Ligurian dinner after the Cinque Terre day trip.'),
    visit: { durationMin: 60, avgPricePerPerson: { currency: 'EUR', min: 20, max: 30 }, tips: l('Quinta: 12h15–14h30 e 19h30–22h. Reservar para jantar. Fonte: ficha Google Maps consultada em 3/10/2026.', 'Thursday: 12:15–14:30 and 19:30–22:00. Reserve for dinner. Source: Google Maps checked on 3 October 2026.') },
  },
  {
    id: 'spe-carrefour-saint-bon', name: l('Carrefour Express · Piazza Saint Bon', 'Carrefour Express · Piazza Saint Bon'),
    category: 'markets', lat: 44.1101731, lng: 9.8165616,
    address: 'Piazza Saint Bon 9, La Spezia', googleRating: 3.1,
    mapsUrl: 'https://www.google.com/maps/place/Carrefour+Express/data=!4m6!3m5!1s0x12d4fdceeb3e6235:0xb5fed9aca788a8e3!8m2!3d44.1101731!4d9.8165616!16s%2Fg%2F11l72ty31s',
    description: l('Supermercado de proximidade na Piazza Saint Bon, entre a estação e o centro, com alimentos, bebidas e snacks embalados.', 'Convenience supermarket on Piazza Saint Bon, between the station and the center, selling groceries, drinks and packaged snacks.'),
    aiSuggested: true, aiReason: l('Comprar alimentos para as saídas cedo e seguir direto à hospedagem, sem carregar sacolas durante o passeio.', 'Buy food for early departures and go straight to the accommodation without carrying groceries during sightseeing.'),
    visit: { durationMin: 15, tips: l('Segunda a sábado: 7h30–20h30; domingo: 9h–20h30. Fonte oficial Carrefour consultada em 3/10/2026.', 'Monday–Saturday: 07:30–20:30; Sunday: 09:00–20:30. Official Carrefour source checked on 3 October 2026.') },
  },
];

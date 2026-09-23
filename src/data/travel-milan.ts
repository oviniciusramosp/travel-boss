import type { LString, TravelCity, TravelPlace } from './travel';

const l = (pt: string, en: string): LString => ({ 'pt-BR': pt, en });
const place = (id: string, name: string, category: TravelPlace['category'], lat: number, lng: number, address: string, pt: string, en: string, extra: Partial<TravelPlace> = {}): TravelPlace => ({
  id, name: l(name, name), category, lat, lng, address,
  mapsQuery: `${name}, ${address}, Milano, Italia`, conhecido: false,
  description: l(pt, en), ...extra,
});

/** Sources and unresolved booking details: docs/milan-itinerary.md. */
export const milanCity: TravelCity = {
  slug: 'milao', name: l('Milão', 'Milan'), region: 'Lombardia',
  country: l('Itália', 'Italy'), countryKey: 'italia',
  lat: 45.478, lng: 9.197, zoom: 13,
  places: [
    place('mil-centrale', 'Milano Centrale', 'transport', 45.4858786, 9.2042617, "Piazza Duca d’Aosta",
      'Chegada em 11/10/2026 às 14h10. Base dos deslocamentos para Verona em 12/10 e Veneza em 13/10; trens ainda a definir.',
      'Arrival on 11 October 2026 at 14:10. Departure point for Verona on 12 October and Venice on 13 October; trains still to be chosen.'),
    place('mil-joy124', 'Joy 124 Hotel Milano', 'lodging', 45.49337, 9.20589, 'Via Melchiorre Gioia 124',
      'Nossa base de 11 a 14/10/2026. Cerca de 20 minutos a pé da Centrale e 10 minutos da estação Sondrio (M3), segundo o hotel. Confirmar check-in e check-out na reserva.',
      'Our base from 11 to 14 October 2026. The hotel estimates 20 minutes on foot from Centrale and 10 minutes from Sondrio (M3). Check booking for check-in and check-out times.',
      { subcategories: ['hotel'] }),
    place('mil-sondrio', 'Sondrio · M3', 'transport', 45.48983, 9.2008456, 'Viale Sondrio / Via Melchiorre Gioia',
      'Linha amarela M3: direção San Donato para o Duomo; direção Comasina na volta. Cada pessoa deve usar seu próprio cartão ou dispositivo no pagamento por aproximação.',
      'Yellow M3: toward San Donato for Duomo, toward Comasina on the way back. Each traveler needs a separate card or device for contactless payment.',
      { subcategories: ['metro'] }),
    place('mil-duomo', 'Duomo di Milano', 'tourist', 45.4641669, 9.1916121, 'Piazza del Duomo',
      'Catedral e terraços pagos. Priorizar os terraços no fim da tarde. Em 11/10/2026, pôr do sol por volta de 18h45; não contar com permanência no terraço até esse horário. A restrição de crisma das 15h às 17h foi informada por nós e ainda precisa de confirmação oficial, inclusive sobre quais áreas afeta.',
      'Cathedral and paid rooftop visit. Prioritize late-afternoon rooftop light. Sunset on 11 October 2026 is around 18:45; do not assume rooftop access until sunset. The reported 15:00–17:00 confirmation ceremony restriction and affected areas still need official confirmation.',
      { landmark: 'monument', subcategories: ['church', 'viewpoint'], visit: {
        ticketUrl: 'https://ticket.duomomilano.it/', durationMin: 60, durationMax: 90,
        tips: l('Ingresso e horário ainda não reservados. Confirmar tarifa, acesso e encerramento para 11/10. O folheto oficial de 2025 inicia o fechamento às 18h30; não é confirmação do calendário de outubro de 2026. Orçamento do roteiro ainda não inclui este ingresso.', 'Tickets and time slot not booked. Confirm price, access and closing time for 11 October. The official 2025 leaflet starts closing at 18:30; this does not confirm October 2026 hours. The itinerary budget does not yet include this ticket.'),
      } }),
    place('mil-galleria', 'Galleria Vittorio Emanuele II', 'tourist', 45.4656422, 9.1900059, 'Piazza del Duomo / Piazza della Scala',
      'Passagem gratuita entre o Duomo e a Piazza della Scala. Observar a fachada voltada ao Duomo, a cúpula central, os mosaicos, as lojas históricas e o mosaico do touro.',
      'Free passage between Duomo and Piazza della Scala. Look for the Duomo-facing façade, central dome, mosaics, historic shops and bull mosaic.',
      { subcategories: ['architecture'], visit: { ticket: { currency: 'EUR', free: true }, durationMin: 25, durationMax: 40 } }),
    place('mil-cesarino', 'Cesarino · Via Pattari', 'restaurants', 45.464408, 9.1935032, 'Via Pattari 2',
      'Sanduíches perto do Duomo. Referência enviada: €7–10 e nota 4,8, sem atualização ao vivo. Filial da Via Pattari escolhida para o percurso; alternativa à refeição no All’Antico Vinaio.',
      'Sandwiches near Duomo. Traveler-provided reference: €7–10 and 4.8 rating, not live data. Via Pattari branch selected for this route; an alternative to All’Antico Vinaio.',
      { subcategories: ['italian'], visit: { avgPricePerPerson: { currency: 'EUR', min: 7, max: 10 }, durationMin: 20, durationMax: 30 } }),
    place('mil-caffe-napoli', 'Caffè Napoli Giardino', 'cafes', 45.4626412, 9.1891509, 'Via Gaetano Giardino 1',
      'Pausa opcional para café perto do Duomo. Referência enviada: 4,5 e cerca de 900 avaliações; valores e avaliações não verificados ao vivo. Pular se houver fila ou pouco tempo para os terraços.',
      'Optional coffee stop near Duomo. Traveler-provided reference: 4.5 from roughly 900 reviews; prices and ratings not verified live. Skip if queues would jeopardize the rooftop visit.',
      { mapsUrl: 'https://share.google/4PKjAmH2vr4dLjZ2d', subcategories: ['coffee-shop'] }),
    place('mil-san-giorgio', 'San Giorgio Ristorante-Pizzeria dal 1999', 'restaurants', 45.4899564, 9.2040824, 'Via Giovanni Schiaparelli 9',
      'Jantar principal na região da Centrale, no retorno ao hotel. Referência enviada: €10–20, nota 4,8 e cerca de 5.800 avaliações, sem atualização ao vivo. Confirmar funcionamento e disponibilidade no dia.',
      'Main dinner option near Centrale on the way back to the hotel. Traveler-provided reference: €10–20, rating 4.8 and roughly 5,800 reviews, not live data. Check opening and availability on the day.',
      { mapsUrl: 'https://share.google/A1lMooTLFBaIxRMcp', subcategories: ['italian'], visit: { avgPricePerPerson: { currency: 'EUR', min: 10, max: 20 } } }),
    place('mil-napule', 'Napule è – Fratelli Coppola', 'restaurants', 45.4816765, 9.2023806, 'Via Alfredo Cappellini 23',
      'Pizza napolitana como alternativa de jantar perto da Centrale. Referência enviada: €10–20, nota 4,5 e cerca de 3.700 avaliações. Fica ao sul da estação; não é parada adicional depois do San Giorgio.',
      'Neapolitan pizza as an alternative dinner near Centrale. Traveler-provided reference: €10–20, rating 4.5 and roughly 3,700 reviews. South of the station; replaces San Giorgio rather than adding another dinner.',
      { mapsUrl: 'https://share.google/8GrKVwQa7BY1eNOhZ', subcategories: ['italian'], visit: { avgPricePerPerson: { currency: 'EUR', min: 10, max: 20 } } }),
    place('mil-antico-vinaio', 'All’Antico Vinaio · Via Lupetta', 'restaurants', 45.4613415, 9.1863974, 'Via Lupetta 12',
      'Schiacciata toscana indicada pelo Pedro e pela Juju. Filial da Via Lupetta cadastrada como alternativa no centro. Para delivery no Joy 124, conferir área de entrega, taxas e disponibilidade no aplicativo.',
      'Tuscan schiacciata recommended by Pedro and Juju. Via Lupetta branch saved as a downtown alternative. Check delivery coverage, fees and availability for Joy 124 in the ordering app.',
      { subcategories: ['italian'] }),
  ],
};

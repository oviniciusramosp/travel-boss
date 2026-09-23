import type { LString } from './travel';
import type { ItineraryDay, TravelItinerary } from './travel-itineraries';

const l = (pt: string, en: string): LString => ({ 'pt-BR': pt, en });
const excursion = (day: number, date: string, destination: string): ItineraryDay => ({
  id: `milao-d${day}`, day,
  title: l(`${date} · Bate-volta a ${destination}`, `${date} · ${destination === 'Veneza' ? 'Venice' : destination} day trip`),
  summary: l(`Dia reservado para ${destination}, com retorno ao Joy 124. Horários de ida e volta e roteiro na cidade ainda a definir. Estas paradas mostram apenas a logística em Milão; o trecho de trem e o passeio serão montados no roteiro do destino.`, `Day reserved for ${destination === 'Veneza' ? 'Venice' : destination}, returning to Joy 124. Train times and destination sightseeing are still to be planned. These stops show Milan logistics only; the train journey and sightseeing belong in the destination itinerary.`),
  stops: [
    { placeId: 'mil-joy124', slot: 'morning', note: l('Sair conforme o trem escolhido. Reservar cerca de 20–25 min de caminhada e chegar à estação com antecedência.', 'Leave according to the selected train. Allow around 20–25 minutes to walk and arrive at the station early.') },
    { placeId: 'mil-centrale', slot: 'morning', note: l(`Embarque para ${destination}. Horário e bilhetes pendentes; conferir também o trem de volta.`, `Train to ${destination === 'Veneza' ? 'Venice' : destination}. Departure time and tickets pending; also check the return train.`) },
    { placeId: 'mil-joy124', slot: 'evening', note: l('Retorno ao hotel depois do bate-volta. Jantar conforme horário de chegada e disposição.', 'Return to the hotel after the day trip. Dinner depends on arrival time and energy.') },
  ],
});

export const milanItinerary: TravelItinerary = {
  id: 'milao-11-14-outubro-2026', showEditorial: true,
  title: l('Milão · 11 a 14 de outubro', 'Milan · 11–14 October'),
  subtitle: l('2026 · Joy 124 Hotel Milano · Verona dia 12 e Veneza dia 13. Dia 11: horários sugeridos, exceto chegada confirmada às 14h10. Ingresso do Duomo e trens ainda pendentes; orçamento exibido é parcial.', '2026 · Joy 124 Hotel Milano · Verona on the 12th and Venice on the 13th. October 11 times are suggestions except the confirmed 14:10 arrival. Duomo tickets and trains are pending; the displayed budget is partial.'),
  days: [
    {
      id: 'milao-d1', day: 1,
      title: l('11/10 · Chegada, Duomo e Galleria', '11 October · Arrival, Duomo and Galleria'),
      summary: l('Domingo com passeio concentrado no centro e jantar perto do hotel. Terraços por volta de 17h15, sujeitos a ingresso e acesso. Pôr do sol previsto para 18h45; não depender de permanecer no terraço até lá. A crisma e a restrição das 15h às 17h informadas por vocês ainda precisam ser confirmadas. Orçamento parcial: refeições principais; não inclui Duomo, transporte, hotel ou extras.', 'Sunday sightseeing focused on the city center, with dinner near the hotel. Aim for the rooftop around 17:15, subject to tickets and access. Sunset is around 18:45; do not rely on staying on the rooftop until then. The reported confirmation ceremony and 15:00–17:00 restriction still need confirmation. Partial budget: main meals only; excludes Duomo, transport, hotel and extras.'),
      stops: [
        { placeId: 'mil-centrale', time: '14:10', slot: 'afternoon', note: l('Chegada confirmada. Reservar tempo para desembarcar, sair da estação e caminhar até o hotel.', 'Confirmed arrival. Allow time to leave the train and station, then walk to the hotel.') },
        { placeId: 'mil-joy124', time: '14:45', slot: 'afternoon', note: l('Deixar malas, fazer check-in se disponível e descansar um pouco. A liberação do quarto depende da reserva; saída sugerida às 15h30.', 'Drop bags, check in if available and take a short break. Room access depends on the booking; suggested departure at 15:30.') },
        { placeId: 'mil-sondrio', time: '15:40', slot: 'afternoon', note: l('M3 amarela, direção San Donato, até Duomo. Reservar 20–25 min com espera, saída e caminhada até o Cesarino.', 'Yellow M3 toward San Donato to Duomo. Allow 20–25 minutes including waiting, exiting and walking to Cesarino.') },
        { placeId: 'mil-cesarino', time: '16:05', slot: 'afternoon', note: l('Lanche/almoço tardio: cerca de 25–30 min, €7–10 por pessoa como referência. Se houver muita fila, trocar pelo All’Antico Vinaio ou um lanche rápido.', 'Late lunch: around 25–30 minutes, with €7–10 per person as a planning reference. If queues are long, switch to All’Antico Vinaio or a quick snack.') },
        { placeId: 'mil-caffe-napoli', slot: 'afternoon', optional: true, note: l('Café opcional antes dos terraços, somente se sobrar tempo. Não encaixar à força entre o lanche e o ingresso.', 'Optional coffee before the rooftop, only if there is spare time. Do not squeeze it between lunch and the ticket slot.') },
        { placeId: 'mil-duomo', time: '17:00', slot: 'afternoon', note: l('Chegar para orientação e controle de segurança. Buscar ingresso dos terraços para cerca de 17h15; planejar 60–75 min. Confirmar acesso após a crisma e horário de encerramento antes de comprar. Interior da catedral apenas se o ingresso e o acesso permitirem; não está garantido neste intervalo.', 'Arrive for orientation and security. Look for a rooftop ticket around 17:15 and allow 60–75 minutes. Confirm access after the ceremony and closing time before booking. Cathedral interior only if the ticket and access allow it; not guaranteed in this window.') },
        { placeId: 'mil-galleria', time: '18:30', slot: 'evening', note: l('Passeio gratuito de 30–40 min: fachada, cúpula, mosaicos, touro e lojas históricas, até a Piazza della Scala. Luz do entardecer na Piazza del Duomo por volta de 18h45; ajustar a ordem conforme a saída dos terraços.', 'Free 30–40 minute walk: façade, dome, mosaics, bull and historic shops, through to Piazza della Scala. Dusk around Piazza del Duomo near 18:45; adjust the order to rooftop exit time.') },
        { placeId: 'mil-sondrio', time: '19:30', slot: 'evening', note: l('Voltar à estação Duomo e pegar a M3, direção Comasina. Descer em Sondrio e caminhar até o jantar.', 'Return to Duomo station and take M3 toward Comasina. Get off at Sondrio and walk to dinner.') },
        { placeId: 'mil-san-giorgio', time: '19:45', slot: 'evening', note: l('Jantar principal, €10–20 por pessoa como referência. Confirmar funcionamento; Napule è é alternativa, não segunda refeição.', 'Main dinner, with €10–20 per person as a planning reference. Check opening; Napule è is an alternative, not a second meal.') },
        { placeId: 'mil-napule', slot: 'evening', optional: true, note: l('Se escolherem esta pizza em vez do San Giorgio, descer na Centrale na volta do Duomo. Fica na Via Alfredo Cappellini 23.', 'If choosing this pizza instead of San Giorgio, get off at Centrale on the way back from Duomo. Located at Via Alfredo Cappellini 23.') },
        { placeId: 'mil-antico-vinaio', slot: 'evening', optional: true, note: l('Alternativa ao Cesarino no centro ou delivery no hotel, se disponível. Não é uma parada extra obrigatória; verificar cobertura e taxas de entrega.', 'Alternative to Cesarino downtown or delivery at the hotel if available. Not an additional required stop; check delivery coverage and fees.') },
        { placeId: 'mil-joy124', time: '21:00', slot: 'evening', note: l('Volta tranquila ao hotel e preparação para Verona no dia seguinte.', 'Return to the hotel and get ready for Verona the following day.') },
      ],
    },
    excursion(2, '12/10', 'Verona'),
    excursion(3, '13/10', 'Veneza'),
    {
      id: 'milao-d4', day: 4,
      title: l('14/10 · Saída de Milão', '14 October · Leaving Milan'),
      summary: l('Horário e local de saída ainda não informados. Manhã livre de compromissos até definirmos a conexão; não presumir saída pela Centrale.', 'Departure time and location have not been provided. Keep the morning unscheduled until the onward connection is known; do not assume departure from Centrale.'),
      stops: [{ placeId: 'mil-joy124', slot: 'morning', note: l('Café, malas e check-out conforme a reserva. Se houver tempo, decidir um passeio próximo depois de confirmar a saída.', 'Breakfast, luggage and check-out according to the booking. Consider a nearby walk only after departure details are confirmed.') }],
    },
  ],
};

import type { LString } from './travel';

const L = (en: string, pt: string): LString => ({ en, 'pt-BR': pt });
export type LouvreFloor = -2 | -1 | 0 | 1;
export interface IndoorStep {
  name: LString;
  floor: LouvreFloor;
  room: string;
  /** Room/area centres in the official SVG viewBox, not artwork coordinates. */
  point: readonly [number, number];
  minutes: number;
  directions: LString;
}

export const louvreSources = {
  map: 'https://collections.louvre.fr/plan',
  pdf: 'https://api-www.louvre.fr/sites/default/files/2026-05/2026-05_Plan_Louvre_EN.pdf',
  closures: 'https://www.louvre.fr/en/visit/list-of-available-galleries',
  services: 'https://www.louvre.fr/visiter/services-sur-place',
};

// Rooms checked against the official plan and collection records on 2026-09-27.
// Mona Lisa: /en/explore/the-palace/from-the-mona-lisa-to-the-wedding-feast-at-cana
// Liberty: collections.louvre.fr/ark:/53355/cl010065872
// Sphinx: /decouvrir/le-palais/le-gardien-de-l-art-egyptien
// Courts: /en/explore/the-palace/shining-new-light-on-sculpture
// Durations include travel from the previous stop. Queue times are estimates.
export const louvreRoute: readonly IndoorStep[] = [
  { name: L('Entry · Pyramid lockers', 'Entrada · armários da Pirâmide'), floor: -2, room: 'Hall Napoléon', point: [530, 280], minutes: 15,
    directions: L('Enter through the Pyramid and descend to reception (−2). Leave bags in the lockers before entering Denon. Arrive at security at 13:00 for the planned 13:30 visit.', 'Entre pela Pirâmide e desça à recepção (−2). Guarde as bolsas antes de entrar na ala Denon. Chegue à segurança às 13h para a visita planejada às 13h30.') },
  { name: L('Mona Lisa', 'Mona Lisa'), floor: 1, room: 'Denon · 711', point: [533, 392], minutes: 45,
    directions: L('Go up from −2 via the Denon entrance (−1) to level 1; follow La Joconde / Salle des États. Room 709 is closed on 5 October: follow the signed alternative access. Allow for the queue.', 'Suba do −2 pela entrada Denon (−1) até o nível 1; siga La Joconde / Salle des États. A sala 709 estará fechada em 05/10: siga o acesso alternativo sinalizado. Inclui margem para fila.') },
  { name: L('Liberty Leading the People', 'A Liberdade Guiando o Povo'), floor: 1, room: 'Denon · 700', point: [481, 354], minutes: 20,
    directions: L('Stay on level 1. Follow French large-format paintings to room 700 (Salle Mollien).', 'Continue no nível 1. Siga as pinturas francesas de grande formato até a sala 700 (Salle Mollien).') },
  { name: L('Egyptian antiquities', 'Antiguidades egípcias'), floor: 0, room: 'Sully · 300–334', point: [906, 343], minutes: 50,
    directions: L('Head towards Sully and go down from 1 to 0, following Antiquités égyptiennes. Explore the thematic galleries; the pin marks room 334, not the entire collection. This plan does not include the chronological collection on level 1.', 'Siga para Sully e desça do 1 ao 0, pelas placas Antiquités égyptiennes. Explore as salas temáticas; o ponto marca a sala 334, não a coleção inteira. Este percurso não inclui a coleção cronológica do nível 1.') },
  { name: L('Great Sphinx of Tanis', 'Grande Esfinge de Tânis'), floor: -1, room: 'Sully · 338', point: [828, 349], minutes: 15,
    directions: L('Go down from 0 to −1 to the Sphinx crypt, room 338. Then follow the medieval Louvre towards the reception hall.', 'Desça do 0 ao −1 até a cripta da Esfinge, sala 338. Depois siga pelo Louvre medieval em direção ao hall de recepção.') },
  { name: L('Change wings · reception', 'Troca de ala · recepção'), floor: -2, room: 'Hall Napoléon', point: [570, 280], minutes: 10,
    directions: L('Go down to the hall (−2) and follow Richelieu. Keep your ticket for the wing checkpoint; do not take the final museum exit.', 'Desça ao hall (−2) e siga Richelieu. Mantenha o ingresso para o controle da ala; não siga a saída definitiva do museu.') },
  { name: L('Cour Puget · glass roof', 'Cour Puget · teto de vidro'), floor: -1, room: 'Richelieu · 105', point: [600, 119], minutes: 15,
    directions: L('Go up from −2 through the Richelieu entrance to −1. Follow the French sculpture courts to room 105. The courtyards have terraces on several levels.', 'Suba do −2 pela entrada Richelieu ao −1. Siga os pátios de escultura francesa até a sala 105. Os pátios têm terraços em vários níveis.') },
  { name: L('Cour Marly · glass roof', 'Cour Marly · teto de vidro'), floor: -1, room: 'Richelieu · 102', point: [466, 111], minutes: 20,
    directions: L('Continue to the neighbouring court, room 102, on the same lower level. Look up at the glass roof and see the Marly horses.', 'Continue até o pátio vizinho, sala 102, no mesmo nível inferior. Veja o teto de vidro e os Cavalos de Marly.') },
  { name: L('Collect bags · exit', 'Retirar bolsas · saída'), floor: -2, room: 'Hall Napoléon', point: [490, 280], minutes: 20,
    directions: L('Return through Richelieu and descend to −2. Collect your belongings under the Pyramid, then follow Sortie to ground level. Target: outside by 17:00.', 'Volte por Richelieu e desça ao −2. Retire os pertences sob a Pirâmide e siga Sortie até o nível da rua. Meta: estar fora às 17h.') },
];

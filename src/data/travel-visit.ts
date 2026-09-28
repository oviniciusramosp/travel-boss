/**
 * Visit metadata for travel places: prices, duration, best times, tips.
 * Static curated data + hooks for client-side live signals (crowd, hours).
 *
 * Ticket figures are approximate adult full-price (2025–2026) and can change —
 * `ticketUrl` points to official booking when available.
 *
 * Note: locale types are defined here (not imported from travel.ts) to avoid
 * a circular dependency — travel.ts re-exports this module.
 */

export type Locale = 'en' | 'pt-BR';
export type LString = Record<Locale, string>;

export type MoneyCurrency = 'EUR' | 'USD' | 'BRL';

/** Crowd profile used by client-side “busy now” heuristic (Paris local time). */
export type CrowdProfile =
  | 'tourist-heavy'
  | 'museum'
  | 'park'
  | 'restaurant'
  | 'cafe'
  | 'nightlife'
  | 'local'
  | 'transit'
  | 'shop'
  | 'airport';

export interface MoneyInfo {
  currency: MoneyCurrency;
  /** Lower bound (or fixed amount when max omitted) */
  min?: number;
  /** Upper bound for a range */
  max?: number;
  free?: boolean;
  note?: LString;
}

/**
 * Structured free / reduced ticket deals (not the full adult price).
 * Day budget still uses the full `ticket` amount; promos are card tips only.
 */
export type TicketPromoKind =
  | 'first-sunday'
  | 'first-friday-evening'
  | 'eu-under-26'
  | 'under-18'
  | 'other';

/** Calendar month 1–12 */
export type MonthIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface TicketPromo {
  kind: TicketPromoKind;
  /** Short line shown under Ticket on the place card */
  label: LString;
  /** Months when it applies (1–12). Omit = all year */
  months?: MonthIndex[];
  /** Months excluded (e.g. Jul/Aug for Louvre free Friday) */
  excludeMonths?: MonthIndex[];
  /** Optional time window note (e.g. after 18:00) */
  timeNote?: LString;
  /** Free timed slot often required even when €0 */
  bookRequired?: boolean;
}

export interface VisitInfo {
  /** Restaurants / cafés: typical spend per person (food + drink). */
  avgPricePerPerson?: MoneyInfo;
  /**
   * Hotels / lodging: approximate room rate per night (often a range).
   * Use min–max for low/high season or room types; confirm on booking sites.
   */
  pricePerNight?: MoneyInfo;
  /** Entrance / event ticket (adult full price when applicable). */
  ticket?: MoneyInfo;
  /**
   * Free / reduced ticket deals (1st Sunday, EU &lt;26, etc.).
   * Display-only — budgets keep using full `ticket` price.
   */
  ticketPromos?: TicketPromo[];
  /** Official ticket page for live prices */
  ticketUrl?: string;
  /** Suggested duration in minutes */
  durationMin?: number;
  durationMax?: number;
  /** Override display string when minutes are awkward (e.g. “half day”) */
  duration?: LString;
  /** Specific hour or period of day */
  bestTime?: LString;
  /** Quietest / cheapest day guidance */
  bestDay?: LString;
  tips?: LString;
  /**
   * OSM element for live opening hours via Overpass
   * e.g. "relation/7515426", "way/123", "node/456"
   */
  osmRef?: string;
  /** Drives dynamic “likely busy” estimate on the card */
  crowdProfile?: CrowdProfile;
}

/** LString helpers */
const L = (en: string, pt: string): LString => ({ en, 'pt-BR': pt });

function money(
  min: number,
  max?: number,
  note?: LString,
  currency: MoneyCurrency = 'EUR',
): MoneyInfo {
  return max != null && max !== min
    ? { currency, min, max, note }
    : { currency, min, note };
}

const free: MoneyInfo = {
  currency: 'EUR',
  free: true,
};

// —— Recurring ticket promos (Paris national museums / CMN) ——

/** Winter free Sundays for many CMN monuments (Nov–Mar). */
const MONTHS_WINTER_FREE_SUNDAY: MonthIndex[] = [11, 12, 1, 2, 3];

const PROMO_UNDER_18: TicketPromo = {
  kind: 'under-18',
  label: L('Free under 18', 'Grátis <18'),
};

const PROMO_EU_UNDER_26: TicketPromo = {
  kind: 'eu-under-26',
  label: L(
    'Free for EU/EEA 18–25 (ID; free timed slot often required)',
    'Grátis UE/EEE 18–25 (ID; horário grátis costuma ser obrigatório)',
  ),
  bookRequired: true,
};

const PROMO_FIRST_SUNDAY_YEAR: TicketPromo = {
  kind: 'first-sunday',
  label: L(
    'Free first Sunday of the month (book ahead — crowded)',
    'Grátis no 1º domingo do mês (reserve — lotado)',
  ),
  bookRequired: true,
};

const PROMO_FIRST_SUNDAY_WINTER: TicketPromo = {
  kind: 'first-sunday',
  label: L(
    'Free first Sunday Nov–Mar (book when required)',
    'Grátis no 1º domingo nov–mar (reserve se pedir)',
  ),
  months: MONTHS_WINTER_FREE_SUNDAY,
  bookRequired: true,
};

const PROMO_LOUVRE_FIRST_FRIDAY: TicketPromo = {
  kind: 'first-friday-evening',
  label: L(
    'Free first Friday after 18:00 (not Jul/Aug; book ahead)',
    'Grátis 1ª sexta após 18h (exceto jul/ago; reserve)',
  ),
  excludeMonths: [7, 8],
  timeNote: L('After 18:00', 'Após 18h'),
  bookRequired: true,
};

type MuseumVisitOpts = Partial<VisitInfo> & {
  /**
   * National museum / CMN-style site: auto-attach under-18 + EU under-26 promos.
   * Private attractions (Montparnasse, Fondation LV, …) leave this false.
   */
  national?: boolean;
};

// —— Category-ish builders ——

function parkVisit(partial: Partial<VisitInfo> = {}): VisitInfo {
  return {
    ticket: free,
    durationMin: 45,
    durationMax: 120,
    bestTime: L('Morning or late afternoon', 'Manhã ou fim da tarde'),
    bestDay: L('Weekday morning', 'Manhã de dia de semana'),
    crowdProfile: 'park',
    tips: L(
      'Bring water and a light layer — shade and wind change a lot.',
      'Leve água e um casaco leve — sombra e vento mudam bastante.',
    ),
    ...partial,
  };
}

/**
 * @param typical - average / typical spend per person (day budget uses this via min)
 * @param upper - upper bound — shown on place cards as part of the min–max range
 */
function restaurantVisit(
  typical: number,
  upper: number,
  partial: Partial<VisitInfo> = {},
): VisitInfo {
  // No duration / bestTime for restaurants — not meaningful for a meal stop.
  return {
    avgPricePerPerson: money(typical, upper),
    bestDay: L('Weekdays, lunch', 'Dias de semana, almoço'),
    tips: L(
      'Weekday lunch is easier for a table. Book ahead for dinner; walk-ins work better at lunch.',
      'Almoço de semana é mais fácil para conseguir mesa. Reserve para jantar; no almoço costuma rolar sem reserva.',
    ),
    ...partial,
  };
}

/**
 * @param typical - average / typical spend per person (day budget uses this via min)
 * @param upper - upper bound — shown on place cards as part of the min–max range
 */
function cafeVisit(
  typical: number,
  upper: number,
  partial: Partial<VisitInfo> = {},
): VisitInfo {
  // No duration — pastry / coffee stops are open-ended.
  return {
    avgPricePerPerson: money(typical, upper),
    bestDay: L('Any day — avoid peak brunch weekends', 'Qualquer dia — evite brunch de fim de semana'),
    tips: L(
      'Standing at the bar is often cheaper than sitting on the terrace.',
      'No balcão costuma ser mais barato que sentar na esplanada.',
    ),
    ...partial,
  };
}

function museumVisit(
  price: number | { min: number; max?: number; free?: boolean } | { free: true },
  partial: MuseumVisitOpts = {},
): VisitInfo {
  const { national = false, ticketPromos: extraPromos, ...rest } = partial;
  const ticket: MoneyInfo =
    typeof price === 'number'
      ? money(price)
      : price.free
        ? free
        : money(price.min, price.max);

  const basePromos: TicketPromo[] = national
    ? [PROMO_UNDER_18, PROMO_EU_UNDER_26]
    : [];
  const ticketPromos = [...basePromos, ...(extraPromos ?? [])];

  return {
    ticket,
    durationMin: 90,
    durationMax: 180,
    bestTime: L('Opening hour or late afternoon', 'Na abertura ou fim da tarde'),
    bestDay: L('Weekday (avoid free Sundays if you hate crowds)', 'Dia de semana (evite domingo grátis se odiar fila)'),
    crowdProfile: 'museum',
    tips: L(
      'Book a timed ticket online — same price, less queue.',
      'Reserve horário online — mesmo preço, menos fila.',
    ),
    ...rest,
    ...(ticketPromos.length ? { ticketPromos } : {}),
  };
}

function landmarkOutdoor(partial: Partial<VisitInfo> = {}): VisitInfo {
  return {
    ticket: free,
    durationMin: 30,
    durationMax: 90,
    bestTime: L('Golden hour / early morning', 'Golden hour / cedo de manhã'),
    bestDay: L('Weekday morning', 'Manhã de dia de semana'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Exterior views are free — pay only if you want the interior/top.',
      'Vista de fora é grátis — pague só se quiser o interior/topo.',
    ),
    ...partial,
  };
}

/**
 * Hotel / guest house stay.
 * @param minNight - lower bound per night (e.g. off-season double)
 * @param maxNight - upper bound per night (e.g. peak / larger room)
 */
function lodgingVisit(
  minNight: number,
  maxNight: number,
  partial: Partial<VisitInfo> = {},
): VisitInfo {
  return {
    pricePerNight: money(
      minNight,
      maxNight,
      L(
        'Approx. per night — varies by season & room',
        'Aprox. por noite — varia com temporada e quarto',
      ),
    ),
    crowdProfile: 'local',
    bestTime: L(
      'Check-in afternoon; book peak weekends early',
      'Check-in à tarde; em alta temporada reserve cedo',
    ),
    ...partial,
  };
}

/**
 * Curated visit info keyed by place id.
 * Paris and Rome are fully covered; other cities can be filled later.
 */
export const visitByPlaceId: Record<string, VisitInfo> = {
  // Flan winners: individual slice prices have not been verified.
  'par-sweet-lab': { crowdProfile: 'cafe' },
  'par-a-deux-mains': { crowdProfile: 'cafe' },
  'par-la-pompadour': { crowdProfile: 'cafe' },
  // Croissant winners: prices not verified; do not assume a per-person spend.
  'par-des-racines-et-du-pain': { crowdProfile: 'cafe' },
  'par-maison-doucet': { crowdProfile: 'cafe' },
  'par-chez-meunier-crimee': { crowdProfile: 'cafe' },
  'par-maison-carton': { crowdProfile: 'cafe' },
  'par-patisserie-colbert': { crowdProfile: 'cafe' },
  // —— Air / logistics ——
  'par-ory': {
    ticket: free,
    durationMin: 60,
    durationMax: 120,
    bestTime: L('Off-peak flights when possible', 'Voos fora de pico quando possível'),
    bestDay: L('Mid-week arrivals are calmer', 'Chegadas no meio da semana são mais calmas'),
    crowdProfile: 'airport',
    tips: L(
      'Allow extra time for RER/Orlyval + security. Orly is often smoother than CDG for short-haul.',
      'Deixe folga para RER/Orlyval + segurança. Orly costuma ser mais tranquilo que CDG em voos curtos.',
    ),
  },
  'par-cdg': {
    ticket: free,
    durationMin: 60,
    durationMax: 150,
    bestTime: L('Off-peak flights when possible', 'Voos fora de pico quando possível'),
    bestDay: L('Mid-week arrivals are calmer', 'Chegadas no meio da semana são mais calmas'),
    crowdProfile: 'airport',
    tips: L(
      'RER B from Aéroport Charles de Gaulle 1 / 2 TGV into Paris (~45–60 min). Allow buffer for security, Terminal Link CDGVAL, and long walks between terminals. Magenta/Gare du Nord are common city exits.',
      'RER B a partir de Aéroport Charles de Gaulle 1 / 2 TGV até Paris (~45–60 min). Deixe folga para segurança, CDGVAL entre terminais e longas caminhadas. Magenta / Gare du Nord são saídas comuns no centro.',
    ),
  },
  'par-cdg-paul': cafeVisit(6, 12, {
    tips: L(
      'Breakfast on the walk toward CDG 2 TGV — keep it light before the long RER ride east.',
      'Café da manhã a caminho do CDG 2 TGV — leve antes do longo trajeto de RER para o leste.',
    ),
  }),
  'par-cdg-brioche-doree': cafeVisit(4, 8, {
    bestDay: L('Daily 6:00–21:00', 'Todo dia 6h–21h'),
    tips: L(
      'Arrivals level, before the exit to the kerb: no escalator with the suitcases.',
      'Fica no próprio desembarque, antes da saída para a calçada: nada de escada rolante com as malas.',
    ),
  }),
  'par-cdg-rer': {
    ticket: money(
      14,
      16,
      L(
        'Airport ticket €14 (2 h, RER E included) on a phone, or +€2 for a Navigo Easy card.',
        'Bilhete aeroporto €14 (2h, inclui o RER E) no celular, ou +€2 do cartão Navigo Easy.',
      ),
    ),
    durationMin: 15,
    durationMax: 40,
    bestTime: L('Right after coffee / baggage claim', 'Logo após o café / bagagem'),
    crowdProfile: 'transit',
    tips: L(
      'Pink-header machines sell a Navigo Easy already loaded with the airport ticket; staffed counter on level 2, daily 6:00–22:30. On iPhone, buy it in the IDF Mobilités app or in Wallet. The €2.55 Métro-Train-RER ticket is not valid at CDG. RER B to Gare du Nord, then RER E at Magenta to Noisy-le-Sec.',
      'As máquinas de faixa rosa vendem o Navigo Easy já carregado com o bilhete aeroporto; guichê no nível 2, todo dia das 6h às 22h30. No iPhone, compre no app IDF Mobilités ou na Carteira. O ticket Métro-Train-RER de €2,55 não vale no CDG. RER B até Gare du Nord e RER E em Magenta até Noisy-le-Sec.',
    ),
  },
  'par-orly-m14': {
    ticket: money(
      2,
      2,
      L(
        'Navigo Easy blank card (~€2). Load rides or a day pass after.',
        'Cartão Navigo Easy em branco (~€2). Carregue viagens ou passe diário depois.',
      ),
    ),
    durationMin: 15,
    durationMax: 40,
    bestTime: L('Right after baggage claim', 'Logo após a bagagem'),
    crowdProfile: 'transit',
    tips: L(
      'Machines sell Navigo Easy for the whole group. Then board Métro 14 toward Saint-Lazare / Paris.',
      'Máquinas vendem Navigo Easy para o grupo. Em seguida pegue a linha 14 rumo a Saint-Lazare / Paris.',
    ),
  },
  'par-orly-paul': cafeVisit(6, 12, {
    tips: L(
      'Breakfast after Navigo — keep it light before the ride to Noisy-le-Sec.',
      'Café da manhã depois do Navigo — leve antes do trajeto até Noisy-le-Sec.',
    ),
  }),
  'par-noisy-le-sec-rer': {
    ticket: free,
    durationMin: 10,
    durationMax: 20,
    crowdProfile: 'transit',
    tips: L(
      'RER E stop — 5–10 min walk to Casa do Gui on Rue des Bergeries.',
      'Parada do RER E — 5–10 min a pé até a Casa do Gui na Rue des Bergeries.',
    ),
  },
  'par-casa-do-gui': {
    durationMin: 20,
    durationMax: 40,
    crowdProfile: 'local',
    tips: L(
      'Drop bags on arrival; end the day back here. Auchan is ~5 min walk for basics.',
      'Deixe as malas na chegada; termine o dia de volta aqui. Auchan fica a ~5 min a pé para os básicos.',
    ),
  },
  'par-auchan-noisy': {
    avgPricePerPerson: money(
      15,
      25,
      L(
        'Groceries / person share (basics + snacks)',
        'Compras / pessoa (básicos + lanches)',
      ),
    ),
    durationMin: 45,
    durationMax: 45,
    duration: L('~45 min', '~45 min'),
    bestTime: L('Right after drop-off at home base', 'Logo após deixar as malas na base'),
    crowdProfile: 'shop',
    tips: L(
      'Full supermarket on Rue Jean Jaurès (~€15/person share) — water, breakfast staples, snacks, basics. ~5 min walk from Casa do Gui; drop bags back home before the Tower afternoon.',
      'Supermercado completo na Rue Jean Jaurès (~€15/pessoa) — água, café da manhã, lanches, básicos. ~5 min a pé da Casa do Gui; deixe as compras em casa antes da tarde na Torre.',
    ),
  },

  // —— Parks & walks ——
  'par-champ-mars': parkVisit({
    durationMin: 60,
    durationMax: 120,
    bestTime: L('Late afternoon picnic under the Tower', 'Fim de tarde em piquenique sob a Torre'),
    bestDay: L('Weekday afternoon / early evening', 'Tarde / início de noite em dia de semana'),
    tips: L(
      'Long lawn pause — eat what you grabbed at Bake & Blend, photos, first real outdoor breath. Security checks on big event days.',
      'Parada longa no gramado — coma o que pegou no Bake & Blend, fotos, primeiro respiro ao ar livre. Controle de segurança em dias de evento.',
    ),
  }),
  'par-carrousel': { ticket: free, durationMin: 3, durationMax: 5 },
  'par-maillol': { ticket: free, durationMin: 2, durationMax: 5 },
  // Paris Région: passage open daily 6:00–00:00; checked 2026-09-27.
  'par-passage-panoramas': {
    ticket: free,
    durationMin: 15,
    durationMax: 20,
    bestDay: L('Daily, 6:00–midnight', 'Todos os dias, 6h–meia-noite'),
    tips: L('Shops and restaurants have their own opening hours.', 'Lojas e restaurantes têm horários próprios.'),
  },
  'par-tuileries': parkVisit({
    durationMin: 40,
    durationMax: 100,
    bestTime: L('Morning walk Louvre → Concorde', 'Caminhada de manhã Louvre → Concorde'),
    tips: L(
      'Free garden. Great connector between Louvre, Orangerie, and Concorde.',
      'Jardim gratuito. Conecta Louvre, Orangerie e Concorde.',
    ),
  }),
  'par-luxembourg': parkVisit({
    durationMin: 60,
    durationMax: 120,
    bestTime: L('Late morning for chairs and sun', 'Fim da manhã para cadeiras e sol'),
    tips: L(
      'Classic Paris chairs around the basin. Kids sail toy boats on weekends.',
      'Cadeiras clássicas em volta do lago. Fim de semana tem barquinhos de criança.',
    ),
  }),
  'par-monceau': parkVisit({
    durationMin: 40,
    durationMax: 90,
    tips: L(
      'Elegant 8th park with follies. Quieter than Luxembourg.',
      'Parque elegante do 8ème com fabriques. Mais calmo que o Luxembourg.',
    ),
  }),
  'par-andre-citroen': parkVisit({
    durationMin: 45,
    durationMax: 100,
    tips: L(
      'Modern park, not classic Paris. Worth more if you do the tethered balloon.',
      'Parque moderno, não a pegada clássica. Vale mais se for no balão captivo.',
    ),
  }),
  'par-clichy-batignolles': parkVisit({
    durationMin: 45,
    durationMax: 120,
    tips: L(
      'Contemporary 17th park — good lawns and a less touristy pace.',
      'Parque contemporâneo do 17ème — gramados bons e ritmo menos turístico.',
    ),
  }),
  'par-mouffetard': parkVisit({
    durationMin: 40,
    durationMax: 90,
    tips: L(
      'From the Panthéon, reach Rue Mouffetard via Rue Descartes and walk downhill through Place de la Contrescarpe. After lunch, continue down the same street to Fontaine Guy Lartigue.',
      'Do Panteão, entre na Rue Mouffetard pela Rue Descartes e desça pela Place de la Contrescarpe. Depois do almoço, continue pela mesma rua até a Fontaine Guy Lartigue.',
    ),
  }),
  'par-jardin-plantes': parkVisit({
    durationMin: 60,
    durationMax: 150,
    tips: L(
      'Enter via Fontaine Cuvier. Gardens free; museums/zoo are separate tickets.',
      'Entre pela Fontaine Cuvier. Jardins grátis; museus/zoo são bilhetes à parte.',
    ),
  }),
  'par-buttes-chaumont': parkVisit({
    durationMin: 60,
    durationMax: 150,
    bestTime: L('Late afternoon for the temple viewpoint', 'Fim da tarde no mirante do templo'),
    tips: L(
      'Hills and lake — wear decent shoes. Belvedere is the photo stop.',
      'Tem subida e lago — use sapato bom. O belvedere é o ponto de foto.',
    ),
  }),
  'par-boulogne': parkVisit({
    durationMin: 120,
    durationMax: 300,
    duration: L('Half day (or full day with LV + Serres)', 'Meio dia (ou dia inteiro com LV + Serres)'),
    bestTime: L('Morning start if combining Fondation LV', 'Comece de manhã se for à Fondation LV'),
    tips: L(
      'Paris “forest”. Rent bikes or plan two anchors (LV + lakes / Serres).',
      '“Floresta” de Paris. Alugue bike ou planeje 2 âncoras (LV + lagos / Serres).',
    ),
  }),
  'par-serres-auteuil': parkVisit({
    ticket: free,
    durationMin: 45,
    durationMax: 90,
    tips: L(
      'Historic greenhouses on the edge of Bois de Boulogne. Check seasonal hours.',
      'Estufas históricas na beira do Bois de Boulogne. Confira horário sazonal.',
    ),
    ticketUrl: 'https://www.paris.fr/lieux/jardin-des-serres-d-auteuil-1802',
  }),
  'par-vincennes': parkVisit({
    durationMin: 90,
    durationMax: 240,
    tips: L(
      'East-side green lung. Pair with Vincennes town + castle.',
      'Pulmão verde do leste. Combine com o centro de Vincennes e o castelo.',
    ),
  }),
  'par-vincennes-town': parkVisit({
    durationMin: 90,
    durationMax: 180,
    bestTime: L('Late morning into lunch', 'Fim da manhã + almoço'),
    bestDay: L('Saturday morning market energy, Sunday calmer', 'Sábado de manhã tem movimento; domingo mais calmo'),
    crowdProfile: 'local',
    tips: L(
      'Pretty small town — centre, then Bois park and/or medieval castle.',
      'Cidadezinha pequena e bonita — centro, depois parque e/ou castelo medieval.',
    ),
  }),
  'par-la-villette': parkVisit({
    durationMin: 90,
    durationMax: 240,
    tips: L(
      'Huge park with museums and Philharmonie. End of the canal walk.',
      'Parque enorme com museus e Philharmonie. Fim do passeio dos canais.',
    ),
  }),
  'par-canals': {
    ticket: free,
    durationMin: 90,
    durationMax: 180,
    duration: L('2–3 hours walk (République → Villette)', '2–3h a pé (République → Villette)'),
    bestTime: L('Late afternoon into golden hour', 'Fim da tarde / golden hour'),
    bestDay: L('Weekday afternoon or Sunday stroll', 'Tarde de semana ou domingo devagar'),
    crowdProfile: 'local',
    tips: L(
      'Stop by Jardin Villemin to eat. Paname Brewing at the Bassin. Return on Metro Line 2 for elevated views.',
      'Pare no Jardin Villemin para comer. Paname no Bassin. Volte na linha 2 (vista elevada).',
    ),
  },
  'par-bike': {
    ticket: money(5, 15, L('Vélib day / short pass (approx.)', 'Passe diário / curto Vélib (aprox.)')),
    durationMin: 90,
    durationMax: 240,
    bestTime: L('Morning or late afternoon (less traffic stress)', 'Manhã ou fim da tarde (menos estresse de trânsito)'),
    bestDay: L('Sunday (more open quays / lighter traffic)', 'Domingo (cais mais abertos / menos trânsito)'),
    crowdProfile: 'transit',
    tips: L(
      'Use dedicated bike lanes; Seine quays and parks are the fun stretches. Helmet optional but smart.',
      'Use ciclovias; cais do Sena e parques são os trechos bons. Capacete opcional, mas faz sentido.',
    ),
    ticketUrl: 'https://www.velib-metropole.fr/',
  },
  'par-vosges': parkVisit({
    durationMin: 30,
    durationMax: 60,
    tips: L(
      'Perfect Marais square — arcades for rain, lawn for sun.',
      'Praça perfeita do Marais — arcadas se chover, gramado se fizer sol.',
    ),
  }),
  'par-bastille': parkVisit({
    durationMin: 20,
    durationMax: 45,
    bestTime: L('Evening for nightlife energy', 'Noite para energia da região'),
    bestDay: L('Friday–Saturday night nearby', 'Sexta–sábado à noite nos arredores'),
    crowdProfile: 'nightlife',
    tips: L(
      'More crossroads than “sight” — good hub for Canal / Marais / 11th bars.',
      'Mais cruzamento que monumento — bom hub para Canal / Marais / bares do 11º.',
    ),
  }),
  'par-marais': parkVisit({
    durationMin: 120,
    durationMax: 240,
    bestTime: L('Afternoon into early evening', 'Tarde até início da noite'),
    bestDay: L('Sunday (shops open, lively streets)', 'Domingo (lojas abertas, ruas vivas)'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Wander without a rigid plan — vintage, falafel, Place des Vosges.',
      'Ande sem roteiro rígido — brechó, falafel, Place des Vosges.',
    ),
  }),
  'par-champs-elysees': parkVisit({
    durationMin: 45,
    durationMax: 90,
    bestTime: L('Evening lights, or early morning photos', 'Luzes à noite, ou foto cedo de manhã'),
    bestDay: L('Weekday morning (less retail crush)', 'Manhã de semana (menos multidão de lojas)'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Walk Concorde → Arc. The avenue is the experience; skip most chain shops.',
      'Ande Concorde → Arco. A avenida é a experiência; pule a maior parte das redes.',
    ),
  }),
  'par-montmartre': parkVisit({
    durationMin: 90,
    durationMax: 180,
    bestTime: L('Early morning or after 18:00', 'Cedo de manhã ou depois das 18h'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Climb from Abbesses, not only the funicular. Watch for pickpockets near Sacré-Cœur.',
      'Suba a pé de Abbesses, não só funicular. Cuidado com carteiristas perto do Sacré-Cœur.',
    ),
  }),
  'par-chatelet': landmarkOutdoor({
    durationMin: 15,
    durationMax: 40,
    bestTime: L('Daytime or evening lights', 'De dia ou à noite com as luzes'),
    crowdProfile: 'transit',
    tips: L(
      'Use it as a hub, not a long stop — metro links almost everywhere from here.',
      'Use como hub, não como parada longa — daqui o metrô liga quase tudo.',
    ),
  }),
  'par-saint-eustache': {
    ticket: free,
    durationMin: 20,
    durationMax: 45,
    bestTime: L('Daytime for the interior and organ', 'De dia para o interior e o órgão'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Free church next to Les Halles — quieter than Notre-Dame, still grand.',
      'Igreja grátis ao lado de Les Halles — mais quieta que Notre-Dame, ainda imponente.',
    ),
  },
  'par-montorgueil': parkVisit({
    durationMin: 45,
    durationMax: 90,
    bestTime: L('Morning food stroll or evening apéro', 'Manhã gastronômica ou apéro à noite'),
    crowdProfile: 'local',
    tips: L(
      'Pedestrian food street — bakeries, oysters, wine bars.',
      'Rua peatonizada de comida — padarias, ostras, wine bars.',
    ),
  }),
  'par-la-defense': parkVisit({
    durationMin: 45,
    durationMax: 90,
    bestTime: L('Weekday daytime for architecture energy', 'Dia de semana de dia (energia corporativa)'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'local',
    tips: L(
      'Grande Arche axis + modern skyline contrast with classic Paris.',
      'Eixo da Grande Arche + skyline moderno em contraste com o Paris clássico.',
    ),
  }),
  'par-paul-defense': cafeVisit(5, 12, {
    tips: L(
      'Solid croissant + coffee before the Arche. Open early for office traffic.',
      'Croissant + café sólido antes da Arche. Abre cedo pelo fluxo de escritórios.',
    ),
  }),
  'par-grande-arche': landmarkOutdoor({
    durationMin: 20,
    durationMax: 45,
    bestTime: L('Morning light on the parvis', 'Luz da manhã no parvis'),
    tips: L(
      'Photo stop from the steps and the axis — rooftop visit optional and timed.',
      'Parada de foto na escadaria e no eixo — terraço opcional e com horário.',
    ),
  }),
  'par-esplanade-de-gaulle': landmarkOutdoor({
    durationMin: 15,
    durationMax: 40,
    bestTime: L('Morning before office rush peaks', 'Manhã antes do pico corporativo'),
    tips: L(
      'Walk the esplanade toward the city — towers + open sky frames.',
      'Ande a esplanada em direção à cidade — torres + céu aberto no enquadramento.',
    ),
  }),
  'par-carrefour-express-saint-honore': {
    avgPricePerPerson: money(6, 12, L('Picnic supplies / person', 'Suprimentos de piquenique / pessoa')),
    durationMin: 15,
    durationMax: 25,
  },
  'par-monoprix-rivoli': {
    avgPricePerPerson: money(6, 12, L('Picnic supplies / person', 'Suprimentos de piquenique / pessoa')),
    durationMin: 15,
    durationMax: 30,
    bestTime: L('Late morning before picnic', 'Fim da manhã antes do piquenique'),
    crowdProfile: 'shop',
    tips: L(
      '23 Av. de l’Opéra (open store). Grab sandwiches, fruit, drinks for Tuileries — ~€6/person. Food is usually at the back.',
      '23 Av. de l’Opéra (loja aberta). Pegue sanduíches, fruta e bebidas para as Tuileries — ~€6/pessoa. Comida costuma ficar no fundo.',
    ),
  },
  'par-palais-royal': parkVisit({
    durationMin: 30,
    durationMax: 60,
    tips: L(
      'Columns courtyard + garden arcades. Quiet pocket next to the Louvre.',
      'Pátio das colunas + arcadas do jardim. Bolso calmo ao lado do Louvre.',
    ),
  }),
  'par-cour-commerce': parkVisit({
    durationMin: 15,
    durationMax: 45,
    bestTime: L('During a walk around Saint-Germain', 'Durante um passeio por Saint-Germain'),
    crowdProfile: 'local',
    tips: L(
      'Walk through the passage to see its cobblestones and old shopfronts; no restaurant stop is needed.',
      'Atravesse a passagem para conhecer o calçamento de pedras e as fachadas antigas; não é preciso parar em um restaurante.',
    ),
  }),
  'par-saint-michel': parkVisit({
    durationMin: 20,
    durationMax: 45,
    bestTime: L('Evening lights', 'Luzes à noite'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Fountain plaza hub — touristy but useful orientation point.',
      'Praça da fonte — turística, mas bom ponto de orientação.',
    ),
  }),
  'par-sorbonne': {
    ticket: free,
    durationMin: 20,
    durationMax: 40,
    bestTime: L('Weekday daytime', 'Dia de semana de dia'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'local',
    tips: L(
      'Student quarter atmosphere more than a single “ticketed” stop.',
      'Mais clima de bairro estudantil do que um monumento com ingresso.',
    ),
  },

  // —— Major paid sights ——
  'par-eiffel': {
    ticket: money(
      28,
      36.7,
      L('Summit: stairs to level 2 + lift €28; lift only €36.70', 'Topo: escada até o 2º andar + elevador €28; só elevador €36,70'),
    ),
    ticketUrl: 'https://www.toureiffel.paris/en/rates-opening-times',
    durationMin: 90,
    durationMax: 180,
    bestTime: L('First slot of the day or night lights', 'Primeiro horário do dia ou luzes noturnas'),
    bestDay: L('Weekday; book online always', 'Dia de semana; reserve online sempre'),
    crowdProfile: 'tourist-heavy',
    osmRef: 'way/5013364',
    tips: L(
      'Summit slots go on sale 90 days ahead and sell out. Outside summer the last summit lift is at 22:45; allow 15–20 min for security.',
      'O topo vende com horário até 90 dias antes e esgota. Fora do verão, a última subida ao topo é às 22h45; conte 15–20 min de segurança.',
    ),
  },
  'par-trocadero': landmarkOutdoor({
    durationMin: 45,
    durationMax: 75,
    bestTime: L('Afternoon light or dusk (tower lights)', 'Luz da tarde ou entardecer (luzes da torre)'),
    tips: L(
      'Long postcard stop — steps, fountains, and the full Tower axis. Watch for street scams and vendors.',
      'Parada longa de cartão-postal — escadaria, fontes e o eixo inteiro da Torre. Cuidado com golpes e ambulantes.',
    ),
  }),
  'par-louvre': museumVisit(32, {
    national: true,
    ticketUrl: 'https://ticket.louvre.fr/en/billetterie/3313',
    durationMin: 150,
    durationMax: 300,
    duration: L('3–5 hours (or two short visits)', '3–5 horas (ou duas visitas curtas)'),
    bestTime: L('Wed/Fri evening opening; otherwise right at 09:00', 'Noite de qua/sex; senão logo às 09h'),
    bestDay: L(
      'Wednesday or Friday evening; free first Friday after 18:00 (not Jul/Aug)',
      'Quarta ou sexta à noite; grátis 1ª sexta após 18h (exceto jul/ago)',
    ),
    ticketPromos: [PROMO_LOUVRE_FIRST_FRIDAY],
    tips: L(
      'Free self-service lockers under the Pyramid (level −2), subject to availability. Collect belongings the same day, before leaving. Bags larger than 55 × 35 × 20 cm are not allowed inside. Use the Pyramid lockers: the Lions hall closes at 15:00. Closed Tuesdays; book timed entry.',
      'Guarda-volumes gratuito e de autoatendimento sob a Pirâmide (nível −2), sujeito à disponibilidade. Retire tudo no mesmo dia, antes de sair. Malas maiores que 55 × 35 × 20 cm não entram no museu. Use os armários da Pirâmide: o hall dos Leões fecha às 15h. Fecha terça; reserve horário.',
    ),
    osmRef: 'relation/7515426',
  }),
  'par-orsay': museumVisit(16, {
    national: true,
    ticketUrl: 'https://www.musee-orsay.fr/en/visit',
    durationMin: 120,
    durationMax: 210,
    bestTime: L('Opening or Thursday late opening', 'Abertura ou quinta com horário estendido'),
    bestDay: L(
      'Tuesday–Thursday; free first Sunday all year (crowded) — book even if free',
      'Ter–qui; grátis 1º domingo o ano todo (lotado) — reserve mesmo se for grátis',
    ),
    ticketPromos: [PROMO_FIRST_SUNDAY_YEAR],
    osmRef: 'way/63178753',
    tips: L(
      'Closed Monday. Famous clock window for photos; Impressionists upstairs. Free Sunday requires online booking.',
      'Fecha segunda. Relógio famoso para fotos; impressionistas no andar de cima. Domingo grátis exige reserva online.',
    ),
  }),
  'par-orangerie': museumVisit(12.5, {
    national: true,
    ticketUrl: 'https://www.musee-orangerie.fr/en',
    durationMin: 60,
    durationMax: 100,
    bestTime: L('Opening hour', 'Horário de abertura'),
    bestDay: L(
      'Weekday; free first Sunday all year (book ahead)',
      'Dia de semana; grátis 1º domingo o ano todo (reserve)',
    ),
    ticketPromos: [PROMO_FIRST_SUNDAY_YEAR],
    osmRef: 'way/54188996',
    tips: L(
      'Monet Water Lilies oval rooms are the highlight. Pair with Tuileries walk. Free Sunday: online slot required.',
      'Salas ovais dos Nenúfares do Monet são o destaque. Combine com as Tuileries. Domingo grátis: horário online obrigatório.',
    ),
  }),
  'par-luxor-obelisk': {
    ticket: free,
    durationMin: 10,
    durationMax: 25,
    bestTime: L('Golden hour on the Concorde–Champs axis', 'Golden hour no eixo Concorde–Champs'),
    bestDay: L('Any day', 'Qualquer dia'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Best as a stop on the Tuileries → Concorde → Champs walk. Night lighting is strong.',
      'Melhor como parada no passeio Tuileries → Concorde → Champs. A iluminação noturna é forte.',
    ),
  },
  'par-fondation-lv': museumVisit(
    { min: 16, max: 20 },
    {
      // Private foundation — no national free-Sunday / EU-under-26 auto promos
      ticketUrl: 'https://www.fondationlouisvuitton.fr/en/tickets',
      durationMin: 90,
      durationMax: 150,
      bestTime: L('Morning slot after Bois walk', 'Horário de manhã após passeio no Bois'),
      bestDay: L('Weekday', 'Dia de semana'),
      tips: L(
        'Architecture is half the visit. Check shuttle from Étoile on some days.',
        'A arquitetura é metade da visita. Em alguns dias tem shuttle a partir da Étoile.',
      ),
    },
  ),
  'par-chateau-vincennes': museumVisit(13, {
    national: true,
    ticketUrl: 'https://www.chateau-de-vincennes.fr/en',
    durationMin: 75,
    durationMax: 120,
    bestTime: L('Morning after town stroll', 'Manhã depois de andar na cidade'),
    bestDay: L(
      'Weekday; free first Sundays Nov–Mar (check site)',
      'Dia de semana; grátis 1ºs domingos nov–mar (confira site)',
    ),
    ticketPromos: [PROMO_FIRST_SUNDAY_WINTER],
    tips: L(
      'Medieval keep + walls. CMN monument — free under 18 / EU under 26 with ID.',
      'Donjon medieval + muralhas. Monumento CMN — grátis <18 / UE <26 com ID.',
    ),
  }),
  'par-arc-triomphe': museumVisit(16, {
    national: true,
    ticketUrl: 'https://www.paris-arc-de-triomphe.fr/en/',
    durationMin: 45,
    durationMax: 75,
    bestTime: L('Sunset from the terrace', 'Pôr do sol no terraço'),
    bestDay: L(
      'Weekday late afternoon; free first Sunday Nov–Mar (crowded)',
      'Fim de tarde em dia de semana; grátis 1º domingo nov–mar (lotado)',
    ),
    ticketPromos: [PROMO_FIRST_SUNDAY_WINTER],
    osmRef: 'way/226413508',
    tips: L(
      'Use the underground passage — never cross the roundabout at street level. Tomb of the Unknown Soldier is free at street level.',
      'Use a passagem subterrânea — nunca atravesse a rotatória no nível da rua. Túmulo do Soldado Desconhecido é grátis no nível da rua.',
    ),
  }),
  // Non-EEA adult (EEA €16), official site Sep 2026. Oct–Mar 9:00–17:00, last entry 16:30.
  'par-sainte-chapelle': museumVisit(22, {
    national: true,
    ticketUrl: 'https://www.sainte-chapelle.fr/en/',
    durationMin: 45,
    durationMax: 75,
    bestTime: L('Bright daylight for the stained glass', 'Dia claro para os vitrais'),
    bestDay: L(
      'Weekday morning; free first Sunday Nov–Mar (security queue still long)',
      'Manhã de dia de semana; grátis 1º domingo nov–mar (fila de segurança ainda longa)',
    ),
    ticketPromos: [PROMO_FIRST_SUNDAY_WINTER],
    osmRef: 'relation/3344870',
    tips: L(
      'Upper chapel is the wow. A time slot is mandatory, even on free Sundays; the security queue can be long.',
      'A capela superior é o show. O horário marcado é obrigatório, mesmo no domingo grátis; a fila de segurança pode ser longa.',
    ),
  }),
  'par-pantheon': museumVisit(13, {
    national: true,
    ticketUrl: 'https://www.paris-pantheon.fr/en/',
    durationMin: 60,
    durationMax: 90,
    bestTime: L('Morning in the Latin Quarter loop', 'Manhã no circuito do Quartier Latin'),
    bestDay: L(
      'Weekday; free first Sunday Nov–Mar',
      'Dia de semana; grátis 1º domingo nov–mar',
    ),
    ticketPromos: [PROMO_FIRST_SUNDAY_WINTER],
    tips: L(
      'Dome climb when open is worth it for views. Crypt for great names of France.',
      'Subida à cúpula (quando aberta) vale pela vista. Cripta com nomes da França.',
    ),
  }),
  'par-invalides': museumVisit(16, {
    national: true,
    ticketUrl: 'https://www.musee-armee.fr/en/',
    durationMin: 90,
    durationMax: 150,
    bestDay: L('Weekday morning', 'Manhã de dia de semana'),
    tips: L(
      'Army museum + Napoleon’s tomb under the golden dome. EU under 26 free with ID.',
      'Museu do Exército + túmulo de Napoleão sob a cúpula dourada. UE <26 grátis com ID.',
    ),
  }),
  'par-pompidou': museumVisit(15, {
    national: true,
    ticketUrl: 'https://www.centrepompidou.fr/en/',
    durationMin: 90,
    durationMax: 150,
    bestTime: L('Late afternoon; roof views near closing', 'Fim da tarde; vista do topo perto de fechar'),
    tips: L(
      'Modern art + exterior escalators. Major renovation / long closure through ~2030 — confirm before you go.',
      'Arte moderna + escadas externas. Reforma grande / fechamento longo até ~2030 — confira antes de ir.',
    ),
  }),
  'par-montparnasse': museumVisit(22, {
    // Private tower — no national free days
    ticketUrl: 'https://www.tourmontparnasse.net/en/',
    durationMin: 45,
    durationMax: 75,
    bestTime: L('Sunset into early evening', 'Pôr do sol até o início da noite'),
    bestDay: L('Clear-sky days only', 'Só em dias de céu limpo'),
    tips: L(
      'Best classic view of the Eiffel Tower skyline. Go for weather, not just the clock. No free first-Sunday.',
      'Melhor vista clássica da Torre no skyline. Vá pelo clima, não só pelo horário. Sem 1º domingo grátis.',
    ),
  }),
  // Non-EEA adult (EEA €15), operadeparis.fr 2026. Online only; last entry 1 h before closing.
  'par-opera': museumVisit(25, {
    // Self-guided palace tour — not a standard CMN free-Sunday monument
    ticketUrl: 'https://www.operadeparis.fr/en/visits/palais-garnier',
    durationMin: 60,
    durationMax: 100,
    bestTime: L('Morning self-guided visit', 'Visita guiada por conta própria de manhã'),
    tips: L(
      'Self-guided tour of the palace (not a show). Book performance tickets separately.',
      'Visita ao palácio (não é espetáculo). Ingresso de ópera/ballet é separado.',
    ),
  }),
  'par-notre-dame': {
    ticket: free,
    ticketUrl: 'https://www.notredamedeparis.fr/en/',
    durationMin: 45,
    durationMax: 90,
    bestTime: L('Early morning entry slot', 'Horário de entrada cedo'),
    bestDay: L('Weekday; book free timed entry when required', 'Dia de semana; reserve entrada gratuita se pedir'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Exterior + Île always free. Interior access rules change — check official site for booking.',
      'Exterior + ilha sempre grátis. Regras do interior mudam — confira o site oficial.',
    ),
  },
  'par-sacre-coeur': {
    ticket: {
      currency: 'EUR',
      free: true,
      note: L(
        'Basilica free; dome climb ~€7 (approx.)',
        'Basílica grátis; cúpula ~€7 (aprox.)',
      ),
    },
    durationMin: 45,
    durationMax: 90,
    bestTime: L('Early morning or evening from the steps', 'Cedo de manhã ou noite nas escadarias'),
    bestDay: L('Weekday morning', 'Manhã de dia de semana'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Basilica free; dome has a fee and stairs. Pickpockets on the square.',
      'Basílica grátis; cúpula tem taxa e escadas. Carteiristas na praça.',
    ),
  },
  'par-moulin-rouge': {
    ticket: money(
      100,
      250,
      L('Show only vs dinner show (approx.)', 'Só show vs jantar + show (aprox.)'),
    ),
    ticketUrl: 'https://www.moulinrouge.fr/en/',
    durationMin: 120,
    durationMax: 210,
    bestTime: L('Evening show (dress smart-casual)', 'Show noturno (visual smart-casual)'),
    bestDay: L('Weeknight if available — slightly calmer', 'Noite de semana se houver — um pouco mais calmo'),
    crowdProfile: 'nightlife',
    tips: L(
      'Book official site only. Photo stop on the boulevard is free anytime.',
      'Reserve só no site oficial. Foto na avenida é grátis a qualquer hora.',
    ),
  },
  'par-bateaux-mouches': {
    ticket: money(15, 25, L('Cruise only, seasonal (approx.)', 'Só passeio de barco, sazonal (aprox.)')),
    ticketUrl: 'https://www.bateaux-mouches.fr/',
    durationMin: 60,
    durationMax: 80,
    bestTime: L('Sunset cruise', 'Passeio no pôr do sol'),
    bestDay: L('Clear evening', 'Noite de céu limpo'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Touristy but effective orientation of the river monuments.',
      'Turístico, mas ótimo para se orientar nos monumentos do rio.',
    ),
  },
  'par-alexandre-iii': landmarkOutdoor({
    durationMin: 15,
    durationMax: 30,
    bestTime: L('Dusk, when the bridge lights turn on', 'Entardecer, quando as luzes da ponte acendem'),
    tips: L(
      'Most ornate bridge — pair with Invalides / Grand Palais photos.',
      'Ponte mais ornamentada — combine com fotos dos Invalides / Grand Palais.',
    ),
  }),
  'par-palais': {
    ticket: money(0, 16, L('Exterior free; exhibitions vary', 'Exterior grátis; exposições variam')),
    durationMin: 30,
    durationMax: 90,
    bestTime: L('Daytime for architecture photos', 'De dia para fotos da arquitetura'),
    bestDay: L('Depends on exhibition', 'Depende da exposição'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Petit Palais permanent collections are often free. Grand Palais depends on show.',
      'Coleções permanentes do Petit Palais costumam ser grátis. Grand Palais depende da mostra.',
    ),
  },
  'par-vendome': landmarkOutdoor({
    durationMin: 15,
    durationMax: 30,
    tips: L(
      'Luxury square — architecture and window shopping more than a long stop.',
      'Praça de luxo — arquitetura e vitrines mais do que parada longa.',
    ),
  }),
  'par-madeleine': {
    ticket: free,
    durationMin: 20,
    durationMax: 40,
    bestTime: L('Daytime interior if open', 'Interior de dia, se aberto'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Neoclassical temple-church. Gourmet shops around the square.',
      'Igreja-templo neoclássica. Empórios gourmet em volta da praça.',
    ),
  },
  'par-hotel-ville': landmarkOutdoor({
    durationMin: 15,
    durationMax: 40,
    tips: L(
      'City hall plaza — free exhibitions sometimes; ice rink in winter.',
      'Praça da prefeitura — às vezes exposição grátis; pista de gelo no inverno.',
    ),
  }),
  'par-horloge': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    tips: L(
      'Look up on the Conciergerie tower — one of Paris’s oldest public clocks.',
      'Olhe a torre da Conciergerie — um dos relógios públicos mais antigos de Paris.',
    ),
  }),
  'par-maison-balzac': {
    ticket: free,
    durationMin: 30,
    durationMax: 60,
    bestTime: L('Only if already in Passy', 'Só se já estiver em Passy'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'museum',
    tips: L(
      'Tiny — skip unless you pass by. Tower view is fine, not unique.',
      'Minúsculo — pule a menos que passe perto. Vista da Torre ok, não única.',
    ),
  },
  'par-carnavalet': museumVisit(
    { free: true },
    {
      durationMin: 75,
      durationMax: 150,
      tips: L(
        'History of Paris museum — permanent rooms usually free. Book timed entry if busy.',
        'Museu da história de Paris — salas permanentes costumam ser grátis. Reserve horário se estiver lotado.',
      ),
      ticketUrl: 'https://www.carnavalet.paris.fr/en',
    },
  ),
  'par-bourse-commerce': museumVisit(15, {
    durationMin: 60,
    durationMax: 120,
    tips: L(
      'Pinault contemporary collection under the glass dome. Check current show hours.',
      'Coleção contemporânea Pinault sob a cúpula de vidro. Confira horário da mostra.',
    ),
    ticketUrl: 'https://www.pinaultcollection.com/boursedecommerce/en',
  }),
  'par-petit-palais-cafe': cafeVisit(8, 18, {
    tips: L(
      'Go for the room / courtyard, not a destination pastry run.',
      'Vá pelo ambiente / pátio, não por uma confeitaria de destino.',
    ),
  }),
  'par-bnf': {
    ticket: money(0, 10, L('Exterior / plaza free; exhibitions vary', 'Exterior grátis; exposições variam')),
    durationMin: 30,
    durationMax: 90,
    bestTime: L('Daytime for the riverside towers', 'De dia para as torres à beira do rio'),
    crowdProfile: 'local',
    tips: L(
      'François-Mitterrand site is an architecture stop; exhibitions are optional.',
      'Sítio François-Mitterrand é parada de arquitetura; exposição é opcional.',
    ),
  },

  // —— Perto da BnF (checked Sep 2026) ——
  'par-fuuki': restaurantVisit(16, 25, {
    bestDay: L(
      'Mon–Fri 11:10–14:50 and 18:10–22:50; weekends 11:10–22:50',
      'Seg–sex 11h10–14h50 e 18h10–22h50; fim de semana 11h10–22h50',
    ),
    tips: L(
      'Omurice €13.90, karaage donburi €15.90, ramen from €15.90; shiratama zenzai dessert €6.50.',
      'Omurice €13,90, donburi de karaage €15,90, ramen a partir de €15,90; de sobremesa, shiratama zenzai €6,50.',
    ),
  }),
  'par-n-plus-un': restaurantVisit(19, 29, {
    bestDay: L(
      'Lunch daily 11:45–14:30; dinner Tue–Sat 19:00–22:00',
      'Almoço todo dia 11h45–14h30; jantar ter–sáb 19h–22h',
    ),
    tips: L(
      'Burgers with fries €18–19. Weekday lunch menu: starter or dessert + main €23, three courses €29.',
      'Burgers com fritas €18–19. Menu de almoço de seg a sex: entrada ou sobremesa + prato €23, três tempos €29.',
    ),
  }),
  'par-le-quai-bnf': restaurantVisit(15, 20, {
    bestDay: L(
      'Mon–Fri from 8:00, kitchen 11:30–23:30; Sat–Sun from 16:00',
      'Seg–sex a partir das 8h, cozinha 11h30–23h30; sáb–dom a partir das 16h',
    ),
    tips: L(
      'Daily specials at lunch only. From 16:00 a pint is €3.50 and home-made fries with mayo €4.50.',
      'Prato do dia só no almoço. A partir das 16h, o chope de 50 cl sai a €3,50 e a porção de fritas caseiras com maionese a €4,50.',
    ),
  }),
  'par-cajou': cafeVisit(13, 19, {
    bestDay: L(
      'Mon–Fri 8:30–18:30; Sat 9:00–18:00; closed Sun. Lunch 12:00–14:00',
      'Seg–sex 8h30–18h30; sáb 9h–18h; fecha domingo. Almoço 12h–14h',
    ),
    tips: L(
      'Main €13, two courses €16, three €19; desserts €4 all day.',
      'Prato €13, dois tempos €16, três €19; sobremesa €4 o dia todo.',
    ),
  }),
  'par-kawaa-lumiere': {
    bestDay: L(
      'Mon–Fri 8:00–18:00 (Thu after-work until 20:00); Sat–Sun 12:00–19:00',
      'Seg–sex 8h–18h (quinta tem after-work até 20h); sáb–dom 12h–19h',
    ),
    crowdProfile: 'cafe',
  },
  'par-bercy-village': {
    ticket: free,
    durationMin: 30,
    durationMax: 90,
    bestDay: L(
      'Shops daily 10:00–20:00, Sundays too; restaurants until 02:00',
      'Lojas todo dia 10h–20h, domingo inclusive; restaurantes até 2h',
    ),
    crowdProfile: 'shop',
    tips: L(
      'Dammann Frères tea comes in sealed tins that travel well.',
      'Os chás da Dammann Frères vêm em latas lacradas, que viajam bem.',
    ),
  },
  'par-passerelle-simone-de-beauvoir': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    bestTime: L('Late afternoon light on the Seine', 'Luz de fim de tarde no Sena'),
    tips: L(
      'Pedestrians and bikes only. Cross from the BnF steps straight into the Parc de Bercy.',
      'Só pedestres e bicicletas. Da escadaria da BnF você sai direto no Parc de Bercy.',
    ),
  }),
  'par-parc-de-bercy': parkVisit({
    tips: L(
      'The big lawns are open around the clock; the vines and the rose garden are in the middle section, the pond by Bercy Village.',
      'Os gramados grandes ficam abertos direto; as parreiras e o roseiral estão na parte do meio, e o lago, perto do Bercy Village.',
    ),
  }),
  'par-cinematheque-francaise': museumVisit(
    { min: 10, max: 14 },
    {
      durationMin: 60,
      durationMax: 120,
      bestDay: L(
        'Mon and Wed–Fri 12:00–19:00; weekends 11:00–20:00; closed Tue. Last entry 45 min before closing',
        'Seg e qua–sex 12h–19h; fim de semana 11h–20h; fecha terça. Última entrada 45 min antes de fechar',
      ),
      tips: L(
        'Musée Méliès €10; Belmondo exhibition €14, no combined ticket.',
        'Musée Méliès €10; exposição do Belmondo €14, sem ingresso combinado.',
      ),
      ticketUrl: 'https://www.cinematheque.fr/informations-pratiques.html',
    },
  ),
  'par-musee-arts-forains': museumVisit(21, {
    durationMin: 90,
    durationMax: 90,
    // ponytail: guided tours only, so the museum default "opening hour" does not apply
    bestTime: undefined,
    bestDay: L(
      'Guided tours on Wednesdays, weekends, public holidays and school holidays',
      'Visitas guiadas às quartas, fins de semana, feriados e férias escolares',
    ),
    tips: L(
      'Tickets online only, released 2–3 weeks ahead; children 4–11 €14. No free wandering and no cloakroom.',
      'Ingresso só online, liberado 2–3 semanas antes; criança de 4 a 11 anos €14. Não dá para andar sozinho e não há guarda-volumes.',
    ),
    ticketUrl: 'https://arts-forains.tickeasy.com/fr-FR/accueil',
  }),
  'par-les-frigos': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    bestTime: L('Daylight', 'De dia'),
    tips: L('Outside only: the studios are a private workplace.', 'Só por fora: os ateliês são local de trabalho particular.'),
  }),

  // —— Photo / metro ——
  'par-metro-6': {
    ticket: money(2.5, 2.5, L('Single t+ ticket / Navigo (approx.)', 'Bilhete t+ / Navigo (aprox.)')),
    durationMin: 20,
    durationMax: 45,
    bestTime: L('Daylight for Tower views from Bir-Hakeim', 'Luz do dia para a Torre em Bir-Hakeim'),
    bestDay: L('Any day — windows on the elevated stretch', 'Qualquer dia — janela no trecho elevado'),
    crowdProfile: 'transit',
    tips: L(
      'Ride between Passy / Bir-Hakeim / Trocadéro for the views. Valid metro ticket required.',
      'Pegue entre Passy / Bir-Hakeim / Trocadéro pela vista. Precisa de bilhete válido.',
    ),
  },
  'par-metro-2': {
    ticket: money(2.5, 2.5, L('Single t+ ticket / Navigo (approx.)', 'Bilhete t+ / Navigo (aprox.)')),
    durationMin: 25,
    durationMax: 50,
    bestTime: L('Daylight on elevated east stretch', 'Luz do dia no trecho elevado leste'),
    bestDay: L('After canal / Villette walk as return', 'Na volta do passeio dos canais / Villette'),
    crowdProfile: 'transit',
    tips: L(
      'Elevated panoramic stretches toward Nation. Great after Bassin de la Villette.',
      'Trechos elevados panorâmicos rumo a Nation. Ótimo depois do Bassin de la Villette.',
    ),
  },

  // —— Restaurants ——
  'par-felicita': restaurantVisit(20, 40, {
    tips: L(
      'Huge food hall — share several counters. Go hungry.',
      'Food hall enorme — divida vários boxes. Vá com fome.',
    ),
  }),
  'par-franklin-passy': restaurantVisit(25, 45, {
    tips: L('Passy classic near Trocadéro — book for dinner.', 'Clássico de Passy perto do Trocadéro — reserve à noite.'),
  }),
  'par-francette': restaurantVisit(30, 55, {
    tips: L(
      'Seine barge vibe — check weather for the terrace; nice with river light.',
      'Clima de barcaça no Sena — confira o tempo para a esplanada; bonito com luz no rio.',
    ),
  }),
  'par-creperie-arts': restaurantVisit(12, 22, {
    tips: L('Solid crêpe stop in Saint-Germain.', 'Boa parada de crêpe em Saint-Germain.'),
  }),
  'par-auptitgrec': restaurantVisit(8, 16, {
    avgPricePerPerson: money(8, undefined, L(
      'Estimate: one savoury crêpe (€10) + one sweet crêpe (€6), shared by two; fillings to be chosen, drinks excluded',
      'Estimativa: 1 crepe salgado (€10) + 1 doce (€6), divididos por 2; recheios a escolher, sem bebidas',
    )),
    tips: L('Fast crêpe / street-food energy. Cash sometimes handy.', 'Crêpe rápido. Dinheiro às vezes ajuda.'),
  }),
  'par-procope': restaurantVisit(35, 60, {
    tips: L(
      'Historic café-restaurant — atmosphere is the product. Book.',
      'Café-restaurante histórico — o ambiente é o produto. Reserve.',
    ),
  }),
  'par-brasserie-pres': restaurantVisit(30, 50),
  'par-chez-janou': restaurantVisit(35, 55, {
    bestDay: L('Daily; lunch 12:00–15:00, dinner 19:00–00:00', 'Todo dia; almoço 12h–15h, jantar 19h–0h'),
    tips: L(
      'Provençal vibes; the chocolate mousse (€12) is the legend. Book on ZenChef or at 01 42 72 28 41.',
      'Clima provençal; a mousse de chocolate (€12) é a lenda. Reserve pela ZenChef ou no 01 42 72 28 41.',
    ),
  }),
  'par-chez-elo': restaurantVisit(25, 45),
  'par-entrecote': restaurantVisit(30, 45, {
    bestDay: L('Daily 12:00–15:00 and 18:30–23:00', 'Todo dia 12h–15h e 18h30–23h'),
    tips: L(
      'No reservations: join the queue ~30 min before opening. Steak-frites with the secret sauce, salad to start.',
      'Não aceita reserva: entre na fila ~30 min antes de abrir. Entrecôte com fritas e o molho secreto, salada de entrada.',
    ),
  }),
  'par-train-bleu': restaurantVisit(55, 90, {
    tips: L(
      'Book for the dining room — the gilded hall is the show.',
      'Reserve o salão — o ambiente dourado é o espetáculo.',
    ),
  }),
  'par-bouillon': restaurantVisit(15, 28, {
    bestDay: L('Daily 11:30–00:00, non-stop', 'Todo dia 11h30–0h, sem intervalo'),
    tips: L(
      'No reservations: join the queue. Metro Grands Boulevards (8, 9) is 70 m away.',
      'Não aceita reserva: entre na fila. O metrô Grands Boulevards (8, 9) fica a 70 m.',
    ),
  }),
  'par-royal-cambronne': restaurantVisit(18, 35, {
    durationMin: 45,
    durationMax: 90,
    bestDay: L('Any day, drink on the square', 'Qualquer dia, bebida na praça'),
    tips: L(
      'Fine for a beer on Place Cambronne — pleasant, nothing special. Line 6 in front.',
      'Serve para uma cerveja na Place Cambronne — gostoso, nada demais. Linha 6 na frente.',
    ),
  }),
  'par-alain-miam': restaurantVisit(14, 17, {
    durationMin: 20,
    durationMax: 45,
    bestDay: L('Wed–Sun 9:00–17:00; closed Mon–Tue', 'Qua–dom 9h–17h; fecha segunda e terça'),
    tips: L(
      'Now at 26 Rue Charlot, 20 m from the Enfants Rouges market. Sandwich €13.50–16.50 — expect a queue; share one if unsure.',
      'Agora na 26 Rue Charlot, a 20 m do Marché des Enfants Rouges. Sanduíche €13,50–16,50 — espere fila; divida um se estiver em dúvida.',
    ),
  }),
  'par-paname-brewing': restaurantVisit(15, 30, {
    avgPricePerPerson: money(15, 30, L('Beers + snack/meal', 'Cervejas + petisco/refeição')),
    bestDay: L('Weekdays, sunny terrace', 'Dias de semana, esplanada no sol'),
    tips: L(
      'House beer on the water — perfect canal-walk pause, especially late afternoon.',
      'Cerveja própria na água — pausa perfeita do passeio nos canais, sobretudo no fim da tarde.',
    ),
  }),
  'par-fric-frac': restaurantVisit(12, 22, {
    tips: L('Croque specialist — quick and filling.', 'Especialista em croque — rápido e enche.'),
  }),
  'par-bien-eleve': restaurantVisit(20, 40),
  'par-bohemia': restaurantVisit(18, 35, {
    bestDay: L(
      'Mon and Wed–Fri 8:30–16:00; Tue until 17:00; Sat–Sun 9:00–16:30',
      'Seg e qua–sex 8h30–16h; ter até 17h; sáb–dom 9h–16h30',
    ),
    tips: L(
      'No reservations. Order the club sandwich or Club Loco de Blueberries. Weekends fill up — weekday is easier for a table.',
      'Não aceita reserva. Peça o club sandwich ou o Club Loco de Blueberries. Fim de semana enche — dia de semana é mais fácil para mesa.',
    ),
  }),
  'par-arnaud-nicolas': restaurantVisit(25, 50, {
    tips: L('Charcuterie craft — good for a refined snack plate.', 'Charcutaria de ofício — bom para petiscos refinados.'),
  }),

  // —— Cafés / pastry ——
  'par-bake-blend': cafeVisit(6, 14, {
    durationMin: 20,
    durationMax: 30,
    bestDay: L('Sunday 08:00–19:00; busiest around 17:00', 'Domingo das 8h às 19h; mais cheio perto das 17h'),
    tips: L(
      'Maison Bergeron pastries (pain au chocolat) and barista coffee. Grab them to go and eat while walking to the Champ de Mars.',
      'Doces da Maison Bergeron (pain au chocolat) e café de barista. Pegue para levar e coma andando até o Champ de Mars.',
    ),
  }),
  'par-bakery-gaite': cafeVisit(6, 14, {
    tips: L(
      'Order flan online ahead. Pickup is usually Convention (15e), not the Gaîté shop.',
      'Peça o flan no site com antecedência. Retirada costuma ser na Convention (15e), não na Gaîté.',
    ),
  }),
  'par-cedric-grolet': cafeVisit(18, 25, {
    bestDay: L(
      'Wed–Sun; boutique 9:00–19:00, tea room 9:00–16:00 by online booking only; closed Mon–Tue',
      'Qua–dom; boutique 9h–19h, salão de chá 9h–16h só com reserva online; fecha seg e ter',
    ),
    tips: L(
      'Sculptural fruit pastries (€18) sell out. Click & Collect skips the 1–2 h queue: orders before 15:00 are ready in 24 h, pickup 9:00–19:00. The tea room announced a renovation from 21 September.',
      'Doces esculturais de fruta (€18) esgotam. O Click & Collect pula a fila de 1–2 h: pedido até 15h fica pronto em 24 h, retirada 9h–19h. O salão de chá anunciou reforma a partir de 21 de setembro.',
    ),
  }),
  // One éclair: €4–7 in 2026 (parisatoutprix.fr, tripadvisor, consulted 2026-09-27).
  'par-eclair-genie': cafeVisit(5, 8),
  // cafelateral.com/fr/services and Google Maps, checked 2026-09-27.
  'par-cafe-lateral': cafeVisit(7.1, 7.1, {
    bestDay: L('Daily from 7:00; breakfast until noon', 'Todos os dias a partir das 7h; café da manhã até meio-dia'),
    tips: L(
      'Planned order per person: one café allongé (€3.90) and one croissant (€3.20).',
      'Pedido previsto por pessoa: um café allongé (€3,90) e um croissant (€3,20).',
    ),
  }),
  'par-maison-isabelle': cafeVisit(4, 10, {
    tips: L(
      'Often a queue — go early if you can. Award-winning croissants.',
      'Costuma formar fila — vá cedo se puder. Croissants premiados.',
    ),
  }),
  'par-jeffrey-cagnes': cafeVisit(6, 14, {
    bestDay: L('Mon–Fri 9:00–18:30; Sat 9:30–19:00; closed Sun', 'Seg–sex 9h–18h30; sáb 9h30–19h; fecha domingo'),
    tips: L(
      'Pre-order pastries online (Click & Collect; changes up to 24 h before). Drinks are made on site.',
      'Encomende os doces online (Click & Collect; dá para mudar até 24 h antes). As bebidas são feitas na hora.',
    ),
  }),
  'par-michalak': cafeVisit(8, 20),
  'par-michalak-printemps': cafeVisit(8, 12, {
    bestDay: L(
      'Mon–Fri 8:30–20:00; Sat 10:00–20:00; Sun 11:00–20:00',
      'Seg–sex 8h30–20h; sáb 10h–20h; dom 11h–20h',
    ),
    tips: L(
      'Viennoiseries €4–5, coffee from €3.50. Seats inside and out if you want to wait for Printemps to open at 10:00.',
      'Viennoiseries de €4 a €5, café desde €3,50. Tem mesa dentro e fora, se quiser esperar o Printemps abrir às 10h.',
    ),
  }),
  'par-michalak-etienne': cafeVisit(6, 15, {
    tips: L(
      'Etienne Marcel counter near Montorgueil — go early for the best selection.',
      'Balcão na Etienne Marcel perto de Montorgueil — vá cedo para a melhor seleção.',
    ),
  }),
  'par-artizans': restaurantVisit(25, 45, {
    tips: L(
      'Montorgueil bistro — good stop while walking the food street.',
      'Bistrô em Montorgueil — boa parada no passeio da rua gastronômica.',
    ),
  }),
  'par-amorino': cafeVisit(5, 12, {
    tips: L('Gelato flower scoops — touristy but fun on a warm day.', 'Gelato em flor — turístico, mas legal no calor.'),
  }),

  // —— Shopping ——
  'par-galeries-lafayette': {
    ticket: free,
    durationMin: 45,
    durationMax: 120,
    bestTime: L('Opening hour for dome photos; evening lights', 'Abertura para foto da cúpula; luzes à noite'),
    bestDay: L('Weekday morning', 'Manhã de dia de semana'),
    crowdProfile: 'shop',
    tips: L(
      'Free rooftop viewpoint (check access). Dome interior is the wow.',
      'Terraço com vista grátis (confirme acesso). A cúpula por dentro é o show.',
    ),
  },
  'par-printemps': {
    ticket: free,
    durationMin: 40,
    durationMax: 100,
    bestTime: L('Daytime rooftop if open', 'Terraço de dia, se aberto'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'shop',
    tips: L(
      'Haussmann department store — rooftop café/views when available.',
      'Grand magasin Haussmann — terraço/café com vista quando aberto.',
    ),
  },
  'par-bon-marche': {
    ticket: free,
    durationMin: 40,
    durationMax: 120,
    bestTime: L('Morning for the Grande Épicerie', 'Manhã na Grande Épicerie'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'shop',
    tips: L(
      'Left-bank elegance — food hall downstairs is half the visit.',
      'Elegância da margem esquerda — a épicerie embaixo é metade da visita.',
    ),
  },
  'par-forum-halles': {
    ticket: free,
    durationMin: 30,
    durationMax: 90,
    bestTime: L('Daytime', 'De dia'),
    crowdProfile: 'shop',
    tips: L('Underground mall + Canopée park above — useful, not romantic.', 'Shopping subterrâneo + parque da Canopée em cima — útil, não romântico.'),
  },
  'par-bhv-marais': {
    ticket: free,
    durationMin: 40,
    durationMax: 100,
    bestTime: L('Weekday afternoon', 'Tarde de dia de semana'),
    crowdProfile: 'shop',
    tips: L('Rooftop café when open — good Hôtel de Ville views.', 'Café no terraço quando aberto — boa vista do Hôtel de Ville.'),
  },
  'par-shakespeare': {
    ticket: free,
    durationMin: 20,
    durationMax: 60,
    bestTime: L('Opening hour — queues grow fast', 'Abertura — a fila cresce rápido'),
    crowdProfile: 'cafe',
    tips: L(
      'Café + English bookshop by the Seine — browse shelves, then coffee; expect a line.',
      'Café + livraria em inglês no Sena — percorra as prateleiras e depois o café; espere fila.',
    ),
  },

  // —— Commons (chains) ——
  'par-mcdonalds-champs': {
    avgPricePerPerson: money(8, 16),
    durationMin: 20,
    durationMax: 45,
    bestTime: L('Late night when little else is open', 'Madrugada quando pouco está aberto'),
    crowdProfile: 'local',
    tips: L('Tourist McDo — useful, not a food destination.', 'McDo turístico — útil, não é destino gastronômico.'),
  },
  'par-mcdonalds-disney': {
    avgPricePerPerson: money(8, 16),
    durationMin: 20,
    durationMax: 45,
    bestTime: L('After park close / late evening', 'Depois do parque fechar / noite'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'In Disney Village — outside the paid park gates, next to the RER / hotels strip.\nNo park ticket needed. Open later than most in-park restaurants.\nNearby Village options: Five Guys, Starbucks. Park re-entry works for fireworks later.',
      'Na Disney Village — fora dos portões pagos, na faixa RER / hotéis.\nNão precisa de ingresso do parque. Abre mais tarde que a maioria dos restaurantes de dentro.\nOpções perto no Village: Five Guys, Starbucks. Dá para reentrar no parque para os fogos.',
    ),
  },
  // Official menu, 09/2026
  'par-bella-notte': {
    avgPricePerPerson: money(12, 17.5),
    durationMin: 30,
    durationMax: 60,
    bestTime: L('After 14:00, past the lunch peak', 'Depois das 14h, passado o pico do almoço'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Inside Disneyland Park (Fantasyland). Mickey pizza €12; meal €17.50 with garlic bread or side salad and a 50 cl drink. Free drinking water.\nCounter service without mobile order; queues peak 12:00–14:00.',
      'Dentro do Disneyland Park (Fantasyland). Pizza do Mickey €12; menu €17,50 com baguete de alho ou salada e refrigerante de 50 cl. Água grátis.\nSelf-service sem pedido pelo app; a fila é maior entre 12h e 14h.',
    ),
  },
  // Official September 2026 menus (media.disneylandparis.com PDFs)
  'par-daw-stark-factory': {
    avgPricePerPerson: money(11, 14),
    durationMin: 30,
    durationMax: 45,
    bestTime: L('11:00–11:30, before the lunch rush', '11h–11h30, antes do pico do almoço'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Pizza €14 (one feeds two), pasta €13, bowl €8.50. Free tap water.\nOpens 11:00; no mobile order. Big hall, usually has seats.',
      'Pizza €14 (uma dá para dois), massa €13, bowl €8,50. Água da torneira grátis.\nAbre às 11h; sem pedido pelo app. Salão grande, costuma ter lugar.',
    ),
  },
  'par-dlp-casa-de-coco': {
    avgPricePerPerson: money(12, 16),
    durationMin: 30,
    durationMax: 45,
    bestTime: L('Early dinner, 18:00–19:30', 'Jantar cedo, 18h–19h30'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Burrito €12 (beef, chicken or vegan), churros €4.30, Mariachi menu €22 with dessert. Free tap water.\nMobile order in the Disneyland Paris app and kiosks.',
      'Burrito €12 (carne, frango ou vegano), churros €4,30, menu Mariachi €22 com sobremesa. Água da torneira grátis.\nPedido pelo app da Disneyland Paris e totens.',
    ),
  },
  'par-burger-king-opera': {
    avgPricePerPerson: money(8, 15),
    durationMin: 15,
    durationMax: 40,
    crowdProfile: 'local',
  },
  'par-starbucks-opera': {
    avgPricePerPerson: money(5, 12),
    durationMin: 20,
    durationMax: 60,
    crowdProfile: 'cafe',
    tips: L('Wi‑Fi + AC between department stores.', 'Wi‑Fi + ar entre grands magasins.'),
  },
  'par-five-guys-rivoli': {
    avgPricePerPerson: money(12, 22),
    durationMin: 25,
    durationMax: 50,
    crowdProfile: 'restaurant',
  },
  'par-kfc-les-halles': {
    avgPricePerPerson: money(8, 16),
    durationMin: 15,
    durationMax: 40,
    crowdProfile: 'local',
  },

  // —— Markets ——
  'par-marche-enfants-rouges': {
    avgPricePerPerson: money(10, 25),
    durationMin: 45,
    durationMax: 90,
    bestTime: L('Lunch 11:00–14:00', 'Almoço 11h–14h'),
    bestDay: L('Tue–Sun (closed Monday)', 'Ter–dom (fecha segunda)'),
    crowdProfile: 'local',
    tips: L(
      'Oldest covered market option — stalls for lunch. Alain Miam Miam if you want the sandwich fame.',
      'Opção de feira coberta — barracas para almoço. Alain Miam Miam se quiser o lanche famoso.',
    ),
  },
  'par-point-alph': {
    avgPricePerPerson: money(5, 20),
    durationMin: 40,
    durationMax: 90,
    bestTime: L('Morning market hours', 'Horário de manhã da feira'),
    bestDay: L('Tue–Sun (check hall hours)', 'Ter–dom (confira horário das halles)'),
    crowdProfile: 'local',
    tips: L(
      'Versailles market stop near Notre-Dame square — easy add-on to the château day.',
      'Feira em Versalhes perto da praça Notre-Dame — fácil de encaixar no dia do castelo.',
    ),
  },
  'par-marche-aligre': {
    avgPricePerPerson: money(5, 15),
    durationMin: 40,
    durationMax: 90,
    bestTime: L('Morning until ~13:00–14:00', 'Manhã até ~13h–14h'),
    bestDay: L('Tue–Sun morning', 'Manhã de ter–dom'),
    crowdProfile: 'local',
    tips: L('Pair with Le Baron Rouge for wine after.', 'Combine com o Le Baron Rouge para vinho depois.'),
  },
  'par-marche-bastille': {
    avgPricePerPerson: money(5, 20),
    durationMin: 40,
    durationMax: 90,
    bestTime: L('Morning', 'Manhã'),
    bestDay: L('Thursday & Sunday mornings', 'Manhãs de quinta e domingo'),
    crowdProfile: 'local',
  },
  'par-rue-cler': {
    avgPricePerPerson: money(8, 25),
    durationMin: 30,
    durationMax: 75,
    bestTime: L('Morning market hours', 'Horário de manhã do mercado'),
    bestDay: L('Weekday morning', 'Manhã de dia de semana'),
    crowdProfile: 'local',
    tips: L('Near the Tower — great picnic shopping street.', 'Perto da Torre — ótima rua para montar piquenique.'),
  },

  // —— Roteiro CSV (≤ €40) additions ——
  'par-place-dauphine': parkVisit({
    durationMin: 30,
    durationMax: 90,
    bestTime: L('Late afternoon / early evening 17:00–20:00', 'Final de tarde / início da noite 17h–20h'),
    tips: L('Quiet square — wine bars around the edges.', 'Praça calma — bares de vinho nas bordas.'),
  }),
  'par-cafe-flore': cafeVisit(15, 40, {
    bestTime: L('Early morning 7:30–10:00 or late afternoon', 'Manhã cedo 7h30–10h ou final da tarde'),
    bestDay: L('Weekday', 'Dia de semana'),
    tips: L('Iconic and pricey — coffee/pastry is enough.', 'Icônico e caro — café/pâtisserie basta.'),
  }),
  'par-rosa-bonheur': {
    avgPricePerPerson: money(15, 30),
    durationMin: 60,
    durationMax: 150,
    bestTime: L('Late afternoon into evening', 'Final de tarde até a noite'),
    bestDay: L('Wed–Sun from noon; weekends arrive early', 'Qua–dom a partir do meio-dia; fim de semana chegue cedo'),
    crowdProfile: 'nightlife',
    tips: L(
      'Inside Buttes-Chaumont — guinguette vibe, very local.',
      'Dentro do Buttes-Chaumont — clima de guinguette, bem local.',
    ),
  },
  'par-belleville': parkVisit({
    durationMin: 45,
    durationMax: 120,
    bestTime: L('Sunset', 'Pôr do sol'),
    tips: L('Best free panoramic view of the city skyline.', 'Melhor vista panorâmica grátis do skyline.'),
  }),
  'par-disneyland': {
    // What the trip paid, so the day budget is real: €221 for 3 people.
    ticket: money(
      73.67,
      undefined,
      L(
        'Our tickets: €221 for 3, or €73.67 per person (2 at €55 with the resident promo and 1 at €111)',
        'Nossos ingressos: €221 para os 3, ou €73,67 por pessoa (2 a €55 com a promo de morador e 1 a €111)',
      ),
    ),
    ticketUrl: 'https://tickets.disneylandparis.com/',
    durationMin: 480,
    durationMax: 720,
    duration: L('Full day (plan 8–12 h)', 'Dia inteiro (planeje 8–12 h)'),
    bestTime: L('Rope drop / first entry', 'Abertura / primeiros horários'),
    bestDay: L('Weekday outside school holidays', 'Dia de semana fora de férias escolares'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'From Casa do Gui: RER E to Val de Fontenay + RER A to Marne-la-Vallée–Chessy (~40 min); the station is 2 min from the gates. Navigo Semaine covers it.\nOne bag check covers both parks.\nParks open 09:30; the 08:30 early hour is for Disney Hotel guests only.\nStart at Disney Adventure World (Spider-Man, Ratatouille), then Disneyland Park. Crush’s Coaster is closed until summer 2027.\nDisney Tales of Magic runs ~20 min at park close. From 5 to 14 Oct there is no RER E after 22:30: RER A to Val de Fontenay, then bus 145 or 301.\nDisney Village (McDonald’s, Five Guys, Earl of Sandwich) is outside the gates; re-entry works with each adult’s own ticket.',
      'Da Casa do Gui: RER E até Val de Fontenay + RER A até Marne-la-Vallée–Chessy (~40 min); a estação fica a 2 min dos portões. A Navigo Semaine cobre.\nUma revista de bolsas vale para os dois parques.\nOs parques abrem às 9h30; a hora extra das 8h30 é só para hóspedes dos hotéis Disney.\nComece no Disney Adventure World (Spider-Man, Ratatouille) e depois vá ao Disneyland Park. O Crush’s Coaster está fechado até o verão de 2027.\nO Disney Tales of Magic dura ~20 min, no fechamento do parque. De 5 a 14/10 não há RER E depois das 22h30: RER A até Val de Fontenay e ônibus 145 ou 301.\nO Disney Village (McDonald’s, Five Guys, Earl of Sandwich) fica fora dos portões; dá para sair e voltar, cada adulto com o próprio ingresso.',
    ),
  },
  // A planning estimate: the morning of the two-park day, 09:30 until the switch.
  'par-disney-adventure-world': {
    durationMin: 180,
    durationMax: 300,
    duration: L('Half a day (3–5 h)', 'Meio dia (3–5 h)'),
    crowdProfile: 'tourist-heavy',
  },
  'par-dlp-tales-of-magic': {
    durationMin: 20,
    durationMax: 25,
    bestTime: L(
      'At park close (22:00 on 7 Oct); claim the spot ~1h15 before',
      'No fechamento do parque (22h em 7/10); garanta o lugar ~1h15 antes',
    ),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'By Casey’s Corner it fills 30–45 min before; Central Plaza 1h–1h30; right in front of the castle 1h30–1h45.\nMain Street also gets Halloween projections several times a night.\nPaid reserved area (€24–29, in the app): arrive 10–30 min before, but you miss the Main Street projections.',
      'Junto ao Casey’s Corner enche 30–45 min antes; a Central Plaza, 1h–1h30; em frente ao castelo, 1h30–1h45.\nA Main Street também recebe projeções de Halloween várias vezes por noite.\nÁrea reservada paga (€24–29, no app): chegue 10–30 min antes, mas sem as projeções da Main Street.',
    ),
  },
  'par-versailles': {
    ticket: money(
      32,
      35,
      L(
        'Passport timed entry (estate); from 15:00 often cheaper',
        'Passport com horário (domínio); a partir das 15h costuma ser mais barato',
      ),
    ),
    ticketPromos: [
      PROMO_UNDER_18,
      PROMO_EU_UNDER_26,
      {
        kind: 'other',
        label: L(
          'Gardens free most days (fountain-show days may charge)',
          'Jardins grátis na maioria dos dias (dias de fontes podem cobrar)',
        ),
      },
    ],
    ticketUrl: 'https://en.chateauversailles.fr/plan-your-visit/tickets-and-prices',
    durationMin: 240,
    durationMax: 480,
    duration: L('Full day (Palace + gardens ± Trianon)', 'Dia inteiro (Palácio + jardins ± Trianon)'),
    bestTime: L('Arrive for opening (~9:00)', 'Chegue na abertura (~9h)'),
    bestDay: L('Tue–Fri; closed Monday', 'Ter–sex; fecha segunda'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Best: RER C → Versailles Château–Rive Gauche + ~10 min walk to Place d’Armes.\nAlternatives: SNCF N/U → Versailles Chantiers (~18 min walk) or L → Rive Droite (~17 min walk).\nBook Passport timed slot online (Palace + Trianon + gardens; shows on fountain days).\nGardens free most days; free under 18 / EU under 26 (still need a free timed slot).\nClosed Mon + 1 Jan / 1 May / 25 Dec.',
      'Melhor: RER C → Versailles Château–Rive Gauche + ~10 min a pé até a Place d’Armes.\nAlternativas: SNCF N/U → Versailles Chantiers (~18 min a pé) ou L → Rive Droite (~17 min a pé).\nReserve Passport com horário online (Palácio + Trianon + jardins; shows nos dias de fontes).\nJardins grátis na maioria dos dias; grátis <18 / UE <26 (ainda precisa de horário gratuito).\nFecha seg + 1 jan / 1 mai / 25 dez.',
    ),
  },
  'par-baron-rouge': {
    avgPricePerPerson: money(10, 25),
    durationMin: 30,
    durationMax: 90,
    bestTime: L('Sat–Sun morning for oysters; weekday evenings too', 'Sáb–dom de manhã para ostras; noites em dias de semana também'),
    crowdProfile: 'local',
    tips: L(
      'Wine from the barrel + market next door (Aligre).',
      'Vinho do barril + mercado ao lado (Aligre).',
    ),
  },
  'par-promenade-plantee': parkVisit({
    durationMin: 45,
    durationMax: 120,
    bestTime: L('Morning or late afternoon', 'Manhã ou final da tarde'),
    tips: L(
      'Elevated park walk from Bastille — cooler alternative to the Tuileries crowds.',
      'Passeio elevado a partir da Bastille — alternativa mais fresca à multidão das Tuileries.',
    ),
  }),

  // —— Paris: Oct 2026 trip list (hours checked Sep 2026) ——
  'par-poilane': cafeVisit(5, 13, {
    bestDay: L(
      'Wed–Sat 7:15–18:00; Tue and Sun 8:00–13:30 and 14:30–18:00; closed Mon',
      'Qua–sáb 7h15–18h; ter e dom 8h–13h30 e 14h30–18h; fecha segunda',
    ),
    tips: L(
      'Punitions butter biscuits: ~€5 a small box, €12.70 for 300 g.',
      'Biscoitos punitions: ~€5 a caixinha, €12,70 os 300 g.',
    ),
  }),
  'par-deux-magots': cafeVisit(10, 15, {
    avgPricePerPerson: money(6, undefined, L('One €12 pot of hot chocolate shared by two', 'Um bule de chocolate quente de €12 dividido por duas pessoas')),
    bestDay: L('Daily 7:30–01:00', 'Todo dia 7h30–1h'),
    tips: L(
      'Hot chocolate: €10 for a 125 ml cup or €12 for a pot; whipped cream +€3. Made with Valrhona Equatoriale 55% chocolate.',
      'Chocolate quente: €10 a xícara de 125 ml ou €12 o bule; chantilly +€3. Feito com chocolate Valrhona Equatoriale 55%.',
    ),
  }),
  'par-as-du-fallafel': restaurantVisit(8, 10, {
    bestDay: L(
      'Sun–Thu 11:00–23:30; Fri until 17:00; closed Sat',
      'Dom–qui 11h–23h30; sex até 17h; fecha sábado',
    ),
    tips: L(
      'Takeaway pita ~€7–9. The queue is long but moves fast; cards accepted.',
      'Pita para viagem ~€7–9. A fila é longa mas anda rápido; aceita cartão.',
    ),
  }),
  'par-du-pain-idees': cafeVisit(5, 8, {
    bestDay: L('Mon–Fri ~7:00–19:30; closed weekends', 'Seg–sex ~7h–19h30; fecha sábado e domingo'),
    tips: L('Escargot pastry ~€5–6.', 'Escargot ~€5–6.'),
  }),
  'par-merveilleux-fred': cafeVisit(4, 6, {
    bestDay: L('Daily 7:30–20:00', 'Todo dia 7h30–20h'),
    tips: L(
      'About €4–5 a merveilleux. It is a chain, with other shops across Paris.',
      'Cerca de €4–5 o merveilleux. É uma rede, com outras lojas em Paris.',
    ),
  }),
  'par-patate': restaurantVisit(4, 9, {
    // One €7 cone for two, so €3.50 each on the day card.
    avgPricePerPerson: money(3.5, 3.5, L('One €7 cone split by two', 'Um cone de €7 dividido por dois')),
    bestDay: L('Sun–Thu 11:30–22:30; Fri–Sat until 23:00', 'Dom–qui 11h30–22h30; sex–sáb até 23h'),
    tips: L('Cone €4 / €5.50 / €7.50, sauce +€1. Standing only.', 'Cone €4 / €5,50 / €7,50, molho +€1. Só em pé.'),
  }),
  'par-bouillon-republique': restaurantVisit(20, 30, {
    bestDay: L('Daily 11:30–00:00', 'Todo dia 11h30–0h'),
    tips: L('Book online to skip the queue.', 'Reserve online para fugir da fila.'),
  }),
  'par-bouillon-pigalle': restaurantVisit(18, 30, {
    bestDay: L('Daily 12:00–00:00; weekends and holidays from 11:30', 'Todo dia 12h–0h; fim de semana e feriado desde 11h30'),
    tips: L(
      'Book online at bouillonlesite.com or join the queue. Prices from the summer 2026 menu, service included. Metro Pigalle (2, 12).',
      'Reserve online em bouillonlesite.com ou entre na fila. Preços da carta do verão de 2026, serviço incluso. Metrô Pigalle (2, 12).',
    ),
  }),
  'par-chez-pradel': restaurantVisit(15, 25, {
    bestDay: L('Tue–Sat 8:00–22:30; closed Sunday and Monday', 'Ter–sáb 8h–22h30; fecha domingo e segunda'),
    tips: L(
      'Set-menu prices from the June 2026 video. At lunch arrive early, by 13:30; for dinner book at 01 42 64 24 97.',
      'Preços da fórmula no vídeo de junho de 2026. No almoço, chegue cedo, até 13h30; para jantar, reserve pelo 01 42 64 24 97.',
    ),
  }),
  'par-le-nesle': restaurantVisit(8, 15, {
    avgPricePerPerson: money(
      8,
      15,
      L('Matilda slice (~€21–30) split 2–5 ways', 'Fatia da Matilda (~€21–30) dividida entre 2 e 5'),
    ),
    bestDay: L('Daily 7:00–02:00', 'Todo dia 7h–2h'),
    tips: L('Leftover cake goes home in a box.', 'O bolo que sobrar vai para viagem.'),
  }),
  'par-specimen-burger': restaurantVisit(13, 20, {
    bestDay: L(
      'Mon–Fri 12:00–15:00 and 18:30–22:30; weekends 12:00–22:30',
      'Seg–sex 12h–15h e 18h30–22h30; fim de semana 12h–22h30',
    ),
    tips: L('Burger ~€13, fries €4.', 'Hambúrguer ~€13, fritas €4.'),
  }),
  'par-rocheman': restaurantVisit(12, 15, {
    bestDay: L(
      'Mon–Thu 11:30–21:30; Fri–Sat until 22:30; Sun 13:00–21:00',
      'Seg–qui 11h30–21h30; sex–sáb até 22h30; dom 13h–21h',
    ),
    tips: L('Halal. Cards accepted.', 'Halal. Aceita cartão.'),
  }),
  'par-margaux': restaurantVisit(30, 40, {
    bestDay: L(
      'Mon–Fri 12:00–14:30 and 19:00–23:30; Sat–Sun 12:00–17:00 and 19:00–00:30',
      'Seg–sex 12h–14h30 e 19h–23h30; sáb–dom 12h–17h e 19h–0h30',
    ),
    tips: L(
      'Cordon bleu €26 with one side; mains €19–32, desserts from €9. Per person: ~€28 main + dessert and ~€37 with a starter on the cheapest dishes; ~€35 and ~€44 with the cordon bleu. Book on ZenChef.',
      'Cordon bleu €26 com um acompanhamento; pratos de €19 a €32, sobremesas desde €9. Por pessoa: ~€28 prato + sobremesa e ~€37 com entrada nos mais baratos; ~€35 e ~€44 com o cordon bleu. Reserve pela ZenChef.',
    ),
  }),
  'par-arnaud-nicolas-caulaincourt': restaurantVisit(5, 17, {
    bestDay: L(
      'Tue–Sat 10:00–20:00; Sun 9:30–13:30; closed Mon',
      'Ter–sáb 10h–20h; dom 9h30–13h30; fecha segunda',
    ),
    tips: L(
      'Croque-monsieur (25 cm) ~€5; takeaway lunch €9–17. Ask whether this shop has the croque that day.',
      'Croque-monsieur (25 cm) ~€5; almoço para viagem €9–17. Confirme se esta loja tem o croque no dia.',
    ),
  }),
  'par-recrutement': cafeVisit(5, 40, {
    avgPricePerPerson: money(5, 40, L('Coffee ~€5; a full meal €25–40', 'Café ~€5; refeição €25–40')),
    bestDay: L('Daily ~7:00–02:00', 'Todo dia ~7h–2h'),
  }),
  'par-villa-marquise': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    crowdProfile: 'local',
    bestDay: L(
      'Sun–Wed 8:00–01:00; Thu–Sat until 02:00; brunch Sat–Sun 11:00–16:00',
      'Dom–qua 8h–1h; qui–sáb até 2h; brunch sáb–dom 11h–16h',
    ),
    tips: L('The façade is free; a meal runs €25–40 (book).', 'A fachada é de graça; comer lá sai €25–40 (reserve).'),
  }),
  'par-favorite-saint-paul': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    crowdProfile: 'local',
    bestDay: L('Daily 8:00–02:00', 'Todo dia 8h–2h'),
    tips: L('Façade photo; a meal inside is ~€25.', 'Foto da fachada; comer lá dentro sai ~€25.'),
  }),
  'par-bon-pecheur': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    crowdProfile: 'local',
    bestDay: L('Daily 8:00–00:00', 'Todo dia 8h–0h'),
    tips: L('Façade photo; a meal inside is €20–35.', 'Foto da fachada; comer lá dentro sai €20–35.'),
  }),
  'par-archives-nationales': museumVisit(
    { free: true },
    {
      durationMin: 45,
      durationMax: 90,
      bestDay: L(
        'Mon and Wed–Fri 10:00–17:30; Sat–Sun 14:00–17:30; closed Tue',
        'Seg e qua–sex 10h–17h30; sáb–dom 14h–17h30; fecha terça',
      ),
      tips: L(
        'Free. A short walk from Carnavalet and Place des Vosges.',
        'Grátis. Perto do Carnavalet e da Place des Vosges.',
      ),
      ticketUrl: 'https://www.archives-nationales.culture.gouv.fr/',
    },
  ),
  'par-pont-neuf': landmarkOutdoor({
    durationMin: 10,
    durationMax: 25,
    bestTime: L('Late afternoon', 'Fim de tarde'),
    tips: L('Cross it, then step into Place Dauphine.', 'Atravesse e entre na Place Dauphine.'),
  }),
  'par-avenue-camoens': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    bestTime: L('Golden hour', 'Golden hour'),
    tips: L('Short detour from Trocadéro.', 'Desvio curto a partir do Trocadéro.'),
  }),
  'par-rue-universite': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    bestTime: L('Blue hour, just after sunset', 'Hora azul, logo depois do pôr do sol'),
    tips: L('Stand at the Avenue Rapp corner and shoot west.', 'Fique na esquina com a Avenue Rapp e fotografe para oeste.'),
  }),
  'par-passerelle-debilly': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    bestTime: L('After dark — the tower sparkles 5 min on the hour', 'Depois que escurece — a Torre brilha 5 min em cada hora cheia'),
    tips: L('Footbridge: no cars in the frame.', 'Passarela: sem carro no enquadramento.'),
  }),
  'par-grande-epicerie-rive-gauche': {
    durationMin: 60,
    durationMax: 60,
    avgPricePerPerson: money(20, undefined, L(
      'Estimated picnic dinner budget per person: bread, cheese, accompaniments and shared wine; actual spend depends on the basket.',
      'Orçamento estimado do jantar por pessoa: pão, queijo, acompanhamentos e vinho compartilhado; o gasto depende das compras.',
    )),
  },
  'par-port-louvre': parkVisit({
    durationMin: 60,
    durationMax: 60,
    bestTime: L('Early evening', 'Início da noite'),
    tips: L('Picnic on the lower riverbank with food bought beforehand.', 'Piquenique na margem baixa com os alimentos comprados antes.'),
  }),
  'par-port-debilly': landmarkOutdoor({
    durationMin: 15,
    durationMax: 45,
    bestTime: L('After dark — the tower sparkles 5 min on the hour', 'Depois que escurece — a Torre brilha 5 min em cada hora cheia'),
    bestDay: L('Any evening', 'Qualquer noite'),
    tips: L(
      'Sit at the edge with your feet over the Seine; bring cheese and a baguette.',
      'Sente na beirada com os pés sobre o Sena; leve queijo e baguete.',
    ),
  }),
  'par-pont-iena': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    tips: L('Links Trocadéro to the foot of the tower.', 'Liga o Trocadéro ao pé da Torre.'),
  }),
  'par-fontaines-trocadero': landmarkOutdoor({
    durationMin: 10,
    durationMax: 20,
    tips: L(
      'Walk down the Trocadéro gardens to the Fontaine de Varsovie.',
      'Desça os jardins do Trocadéro até a Fontaine de Varsovie.',
    ),
  }),
  'par-saint-georges-noisy': {
    durationMin: 15,
    durationMax: 30,
    crowdProfile: 'shop',
    bestDay: L('Daily 9:30–23:00, Sunday included', 'Todo dia 9h30–23h, inclusive domingo'),
    tips: L(
      'For Sunday basics: the Auchan across the street closes at 12:30 on Sundays.',
      'Para os básicos de domingo: o Auchan em frente fecha às 12h30 aos domingos.',
    ),
  },
  'par-uniqlo-opera': {
    durationMin: 30,
    durationMax: 60,
    crowdProfile: 'shop',
    bestDay: L('Open Sunday 11:00–20:00', 'Abre domingo 11h–20h'),
    tips: L(
      'The Uniqlo closest to Haussmann–Saint-Lazare (RER E). Créteil Soleil has none.',
      'A Uniqlo mais perto de Haussmann–Saint-Lazare (RER E). O Créteil Soleil não tem.',
    ),
  },
  'par-creteil-soleil': {
    durationMin: 120,
    durationMax: 180,
    crowdProfile: 'shop',
    bestDay: L('Mon–Sat 10:00–20:30; Sun 11:00–19:00', 'Seg–sáb 10h–20h30; dom 11h–19h'),
    tips: L(
      'Metro 8 to Créteil–Préfecture. Normal, H&M and Bershka are on level 2, Sephora on level 0.',
      'Metrô 8 até Créteil–Préfecture. Normal, H&M e Bershka ficam no nível 2; Sephora no nível 0.',
    ),
  },
  'par-citypharma': {
    durationMin: 30,
    durationMax: 60,
    crowdProfile: 'shop',
    bestDay: L(
      'Mon–Fri 8:30–21:00; Sat 9:00–21:00; Sun 12:00–20:00',
      'Seg–sex 8h30–21h; sáb 9h–21h; dom 12h–20h',
    ),
  },
  'par-carre-opera': {
    durationMin: 20,
    durationMax: 45,
    crowdProfile: 'shop',
    bestDay: L('Mon–Fri 8:00–20:30; Sat 9:30–20:30', 'Seg–sex 8h–20h30; sáb 9h30–20h30'),
    tips: L(
      'Show the Conexão Paris voucher on your phone at the till: 10% off, not on medicines, promotions or baby formula. Tax refund from €100.',
      'Mostre o voucher do Conexão Paris no celular, no caixa: 10% de desconto, fora remédios, promoções e leite infantil. Tax free a partir de €100.',
    ),
  },
  'par-one-nation': {
    durationMin: 90,
    durationMax: 180,
    crowdProfile: 'shop',
    bestDay: L('Mon–Fri 11:00–20:00; Sat 10:00–20:00; Sun 11:00–20:00', 'Seg–sex 11h–20h; sáb 10h–20h; dom 11h–20h'),
    tips: L(
      'From the château: Uber ~16 min, or line N from Versailles-Chantiers to Villepreux–Les Clayes (12 min) and a 10-min walk. Back: line N to Montparnasse, ~30 min.',
      'Do castelo: Uber ~16 min, ou linha N de Versailles-Chantiers até Villepreux–Les Clayes (12 min) e 10 min a pé. Volta: linha N até Montparnasse, ~30 min.',
    ),
  },
  'par-vallee-village': {
    durationMin: 120,
    durationMax: 180,
    crowdProfile: 'shop',
    bestDay: L('Daily 10:00–20:00', 'Todo dia 10h–20h'),
    tips: L(
      'RER A to Val d’Europe, then walk through the mall. From Noisy-le-Sec: RER E to Val de Fontenay, then RER A.',
      'RER A até Val d’Europe e atravesse o shopping a pé. De Noisy-le-Sec: RER E até Val de Fontenay e RER A.',
    ),
  },
  'par-rue-rivoli': {
    ticket: free,
    durationMin: 60,
    durationMax: 120,
    crowdProfile: 'shop',
    tips: L(
      'Walk it east to west: Hôtel de Ville → Châtelet → Louvre.',
      'Ande de leste para oeste: Hôtel de Ville → Châtelet → Louvre.',
    ),
  },
  'par-naturalia-verrerie': {
    durationMin: 10,
    durationMax: 20,
    crowdProfile: 'shop',
    tips: L(
      'MyLevain: 50 g of dehydrated starter ~€15, about 400 ml of active starter in 24 h. Kept chilled — call ahead to check stock. The Saint-Michel Naturalia is not a stockist.',
      'MyLevain: 50 g de levain desidratado ~€15, rende ~400 ml de levain ativo em 24 h. Fica na geladeira — ligue antes para confirmar estoque. A Naturalia Saint-Michel não revende.',
    ),
  },
  'par-gare-de-lyon': {
    ticket: free,
    durationMin: 20,
    durationMax: 40,
    crowdProfile: 'transit',
    tips: L('Trains to Milan leave from here — arrive 30 min early.', 'Os trens para Milão saem daqui — chegue com 30 min de folga.'),
  },
  'par-ore-ducasse': restaurantVisit(44, 58, {
    avgPricePerPerson: money(
      44,
      58,
      L('Main ~€30 + dessert ~€14; three-course menu €58', 'Prato ~€30 + sobremesa ~€14; menu de três tempos €58'),
    ),
    bestDay: L('Tue–Sun; lunch menu 12:00–15:00', 'Ter–dom; carta de almoço 12h–15h'),
    tips: L(
      'No château ticket needed. Mains €30–50, desserts €10–16 (Le Louis XIV is the house one); tap water free on request. Spring–summer 2026 menu. Book: 01 30 84 12 96.',
      'Não precisa de ingresso do castelo. Pratos €30–50, sobremesas €10–16 (o Louis XIV é a da casa); água da casa grátis. Carta primavera–verão 2026. Reserve: 01 30 84 12 96.',
    ),
  }),
  'par-la-flottille': restaurantVisit(20, 35, {
    bestDay: L(
      'Tue–Sun 10:00–18:00 (Apr–Oct); lunch until 15:30; closed Mon',
      'Ter–dom 10h–18h (abr–out); almoço até 15h30; fecha segunda',
    ),
    tips: L('Dishes €16–20; set menus ~€35. Terrace on the Grand Canal.', 'Pratos €16–20; menus ~€35. Terraço no Grand Canal.'),
  }),
  'par-trianon': {
    durationMin: 90,
    durationMax: 150,
    crowdProfile: 'museum',
    bestDay: L(
      'Apr–Oct 12:00–18:30, last entry 17:45; closed Mon',
      'Abr–out 12h–18h30, última entrada 17h45; fecha segunda',
    ),
    tips: L(
      'Included in the Passport. Versailles Rive Droite, the nearest station, is ~2 km on foot.',
      'Incluso no Passport. A estação mais perto, Versailles Rive Droite, fica a ~2 km a pé.',
    ),
  },

  // —— Rome ——
  'rom-fco': {
    ticket: free,
    durationMin: 60,
    durationMax: 120,
    bestTime: L('Off-peak flights when possible', 'Voos fora de pico quando possível'),
    bestDay: L('Mid-week arrivals are calmer', 'Chegadas no meio da semana são mais calmas'),
    crowdProfile: 'airport',
    tips: L(
      'Leonardo Express to Roma Termini ~€14, ~32 min (non-stop). FL1 regional is cheaper but slower / more stops. Buy tickets before boarding — validate if paper. Taxis use fixed fares into the city center.',
      'Leonardo Express até Roma Termini ~€14, ~32 min (direto). FL1 regional é mais barato, mas mais lento / com paradas. Compre o bilhete antes de embarcar — valide se for papel. Táxi tem tarifa fixa para o centro.',
    ),
  },
  'rom-termini': {
    ticket: free,
    durationMin: 15,
    durationMax: 40,
    bestTime: L('Anytime — watch pickpockets in the hall', 'Qualquer hora — atenção a carteiristas no saguão'),
    crowdProfile: 'transit',
    tips: L(
      'Metro A (orange) and B/B1 (blue) under the station. High-speed (Frecciarossa/Italo) and Leonardo Express from FCO. Keep bags close — busy tourist station.',
      'Metrô A (laranja) e B/B1 (azul) sob a estação. Alta velocidade (Frecciarossa/Italo) e Leonardo Express de FCO. Cuide das malas — estação turística e movimentada.',
    ),
  },
  'rom-gallina-bianca': restaurantVisit(14, 22, {
    tips: L(
      'Go for the carbonara (~€14). Truffle carbonara was ~€18. Book or arrive early — tourist-heavy near Termini.',
      'Vá de carbonara (~€14). A trufada saiu ~€18. Reserve ou chegue cedo — zona turística perto da Termini.',
    ),
  }),
  'rom-alfredo-ada': restaurantVisit(12, 18, {
    tips: L(
      'Homey pastas and lasagna. Small room — lunch is easier than dinner without a booking.',
      'Massas e lasanha de casa. Sala pequena — almoço é mais fácil que jantar sem reserva.',
    ),
  }),
  'rom-antico-vinaio': restaurantVisit(12, 15, {
    tips: L(
      'Schiacciata sandwiches ~€12. Lines move; delivery exists. Near the Pantheon (Piazza della Maddalena).',
      'Sanduíches de schiacciata ~€12. Fila anda; tem delivery. Perto do Panteão (Piazza della Maddalena).',
    ),
  }),
  'rom-baffetto': restaurantVisit(12, 18, {
    tips: L(
      'Individual pizzas ~€8–15. Expect a queue at peak; thin Roman-style crust.',
      'Pizza individual ~€8–15. Espere fila no pico; massa fina à romana.',
    ),
  }),
  'rom-suppli': restaurantVisit(4, 8, {
    avgPricePerPerson: money(4, 8),
    tips: L(
      'Rice balls ~€2 each — try cacio e pepe, carbonara, or plain cheese. Perfect walk-and-eat stop in Trastevere.',
      'Bolinhos ~€2 cada — experimente cacio e pepe, carbonara ou queijo. Ótimo para comer andando em Trastevere.',
    ),
  }),
  'rom-norcineria': restaurantVisit(6, 12, {
    tips: L(
      'Porchetta sandwich is the move. Classic norcineria hours (often closed mid-afternoon).',
      'O sanduíche de porchetta é o pedido. Horário de norcineria (muitas vezes fecha no meio da tarde).',
    ),
  }),
  'rom-said': cafeVisit(4, 8, {
    tips: L(
      'Gelato / chocolate scoops ~€2.40–3.40. Historic brand since 1923 — also a full chocolate café concept.',
      'Sorvete / chocolate ~€2,40–3,40 a unidade. Marca histórica desde 1923 — também café de chocolate completo.',
    ),
  }),
  'rom-forno-trevi': cafeVisit(3, 6, {
    tips: L(
      'Stand at the counter facing Trevi: plain croissant €1.50, chocolate €2.30, pistachio €3; americano €1.60. Sitting costs more.',
      'Coma na bancada em pé de frente para a Trevi: croissant €1,50, chocolate €2,30, pistache €3; americano €1,60. Sentar custa mais.',
    ),
  }),
  'rom-colosseum': {
    ticket: money(
      16,
      24,
      L(
        '~€16–18 Colosseum + Forum + Palatine; ~€22–24 with arena floor',
        '~€16–18 Coliseu + Fórum + Palatino; ~€22–24 com acesso à arena',
      ),
    ),
    ticketUrl: 'https://colosseo.it/en/ticket/',
    durationMin: 90,
    durationMax: 180,
    bestTime: L('First entry slot of the day', 'Primeiro horário do dia'),
    bestDay: L('Weekday; book timed entry always', 'Dia de semana; reserve horário sempre'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Same ticket usually covers Forum & Palatine. Arena upgrade is the ~€22–24 band. Security is the time sink.',
      'O mesmo ingresso costuma incluir Fórum e Palatino. Upgrade da arena fica na faixa ~€22–24. A segurança come o tempo.',
    ),
  },
  'rom-forum': {
    ticket: money(
      16,
      18,
      L(
        'Usually included with Colosseum combo (~€16–18)',
        'Em geral no combo do Coliseu (~€16–18)',
      ),
    ),
    ticketUrl: 'https://colosseo.it/en/ticket/',
    durationMin: 75,
    durationMax: 150,
    bestTime: L('Morning with Colosseum loop', 'Manhã no circuito do Coliseu'),
    bestDay: L('Weekday', 'Dia de semana'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Wear shoes for uneven stones. Pair with Colosseum the same day — one timed ticket.',
      'Use sapato bom para pedras irregulares. Combine com o Coliseu no mesmo dia — um ingresso com horário.',
    ),
  },
  'rom-pantheon': museumVisit(5, {
    ticketUrl: 'https://www.pantheonroma.com/',
    durationMin: 30,
    durationMax: 60,
    bestTime: L('Opening hour or late afternoon', 'Na abertura ou fim da tarde'),
    bestDay: L('Weekday morning', 'Manhã de dia de semana'),
    tips: L(
      'Adult ~€5. Look up for the oculus — free rain on wet days. Modest dress not required like churches, but still a basilica.',
      'Adulto ~€5. Olhe o óculo no teto — chuva entra em dias molhados. Ainda é basílica; respeito no interior.',
    ),
  }),
  'rom-piazza-venezia': landmarkOutdoor({
    durationMin: 15,
    durationMax: 30,
    bestTime: L('Anytime as orientation hub', 'Qualquer hora como ponto de orientação'),
    tips: L(
      'Traffic square under the Vittoriano — good photo + metro orientation, not a long stay.',
      'Praça de trânsito sob o Vittoriano — boa foto e orientação de metrô, não é parada longa.',
    ),
  }),
  'rom-trevi': landmarkOutdoor({
    durationMin: 20,
    durationMax: 45,
    bestTime: L('Before 8:00 or late night', 'Antes das 8h ou de madrugada'),
    bestDay: L('Weekday early morning', 'Manhã cedo em dia de semana'),
    tips: L(
      'Viewing the fountain is free. A closer controlled access can cost ~€2 — optional. Pair with the Forno croissants across the square.',
      'Ver a fonte é grátis. Acesso controlado mais perto pode custar ~€2 — opcional. Combine com croissants do Forno na praça.',
    ),
  }),
  'rom-vatican': museumVisit(
    { min: 20, max: 30 },
    {
      ticketUrl: 'https://tickets.museivaticani.va/',
      durationMin: 150,
      durationMax: 300,
      duration: L('3–5 hours (museums + Sistine)', '3–5 horas (museus + Sistina)'),
      bestTime: L('First morning slot', 'Primeiro horário da manhã'),
      bestDay: L('Weekday; skip free last-Sunday if you hate crowds', 'Dia de semana; evite domingo grátis se odiar fila'),
      tips: L(
        'St. Peter’s Square is free; museums are paid and include the route to the Sistine Chapel. Book online, dress code (shoulders/knees).',
        'A praça de São Pedro é grátis; museus são pagos e incluem o caminho da Capela Sistina. Reserve online, dress code (ombros/joelhos).',
      ),
    },
  ),
  'rom-sistine': museumVisit(
    { min: 20, max: 30 },
    {
      ticketUrl: 'https://tickets.museivaticani.va/',
      durationMin: 30,
      durationMax: 60,
      bestTime: L('Right after museum opening (before the crush)', 'Logo na abertura do museu (antes da multidão)'),
      bestDay: L('Weekday morning', 'Manhã de dia de semana'),
      tips: L(
        'Not a separate ticket from the Vatican Museums. No photos inside. Exit may dump you near St. Peter’s — perfect order: museums → Sistine → Basilica.',
        'Não é ingresso separado dos Museus do Vaticano. Sem fotos no interior. A saída pode te deixar perto de São Pedro — ordem ideal: museus → Sistina → Basílica.',
      ),
    },
  ),
  'rom-st-peter': {
    ticket: {
      currency: 'EUR',
      free: true,
      note: L(
        'Basilica free; dome climb paid (stairs cheaper than lift)',
        'Basílica grátis; cúpula paga (escada mais barata que elevador)',
      ),
    },
    ticketUrl: 'https://www.basilicasanpietro.va/',
    durationMin: 45,
    durationMax: 120,
    bestTime: L('Early morning before security peaks', 'Cedo de manhã antes do pico da segurança'),
    bestDay: L('Weekday morning', 'Manhã de dia de semana'),
    crowdProfile: 'tourist-heavy',
    tips: L(
      'Entry free with security screening. Dome (cupola) is a separate fee. Strict dress code — cover shoulders and knees.',
      'Entrada grátis com segurança. Cúpula é taxa à parte. Dress code rígido — cubra ombros e joelhos.',
    ),
  },
  'rom-vittoriano': landmarkOutdoor({
    durationMin: 30,
    durationMax: 75,
    bestTime: L('Late afternoon light on the façade', 'Luz de fim de tarde na fachada'),
    tips: L(
      'Monument and terraces are free. Great panorama over the Forum side and Piazza Venezia. Elevator to higher terrace may have a small fee — check on site.',
      'Monumento e terraços são gratuitos. Ótima vista para o Fórum e a Piazza Venezia. Elevador do terraço alto pode ter taxa — confira no local.',
    ),
  }),
  'rom-window-on-rome': lodgingVisit(100, 180, {
    bestTime: L(
      'Check-in afternoon; evenings out in Trastevere',
      'Check-in à tarde; noites saindo em Trastevere',
    ),
    tips: L(
      'Guest house on Piazza Sonnino in Trastevere (Canal dos Caçadores tip). Strong nightlife / dinner neighborhood — walkable bars and restaurants after dark. Cross the Tiber for Centro Storico. Confirm nightly rate on booking sites.',
      'Hospedagem na Piazza Sonnino, em Trastevere (indicação do Canal dos Caçadores). Bairro bom pra sair a noitinha — bares e restaurantes a pé. Cruza o Tibre pro Centro Histórico. Confirme o valor da diária no site de reserva.',
    ),
  }),
  'lis-whome-bairro-alto': lodgingVisit(110, 200, {
    bestTime: L(
      'Check-in 16:00–21:00; checkout 11:00',
      'Check-in 16:00–21:00; check-out 11:00',
    ),
    crowdProfile: 'nightlife',
    ticketUrl:
      'https://www.booking.com/hotel/pt/modern-retreat-in-vibrant-bairro-alto.html?checkin=2026-10-18&checkout=2026-10-20',
    tips: L(
      'WHome 1-bed on Rua da Barroca (AL 113245). 2nd floor, no elevator. Mini Preço ~2 min; Baixa-Chiado metro ~5 min. Bairro Alto is loud after dark — pack earplugs. Confirm the nightly rate on Booking.',
      'WHome de 1 quarto na Rua da Barroca (AL 113245). 2.º andar, sem elevador. Mini Preço a ~2 min; metro Baixa-Chiado a ~5 min. Bairro Alto é barulhento à noite — leve tampões. Confirme a diária no Booking.',
    ),
  }),
};

/** Merge curated visit onto a place (place.visit wins). */
export function resolveVisit(placeId: string, inline?: VisitInfo): VisitInfo | undefined {
  if (inline) return inline;
  return visitByPlaceId[placeId];
}

export function formatMoney(m: MoneyInfo, locale: Locale = 'en'): string {
  if (m.free) return locale === 'pt-BR' ? 'Grátis' : 'Free';

  const sym =
    m.currency === 'EUR' ? '€' : m.currency === 'BRL' ? 'R$' : '$';

  const fmt = (n: number) =>
    Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '');

  if (m.min != null && m.max != null && m.min !== m.max) {
    return `${sym}${fmt(m.min)}–${fmt(m.max)}`;
  }
  if (m.min != null) return `${sym}${fmt(m.min)}`;
  if (m.max != null) return `${sym}${fmt(m.max)}`;
  return '—';
}

/**
 * Typical / average price only (single figure) — for day-budget math.
 * Place cards use `formatMoney` (full min–max range) instead.
 * Curated food ranges store min = typical, max = upper bound.
 */
export function formatMoneyTypical(
  m: MoneyInfo,
  locale: Locale = 'en',
): string {
  if (m.free) return locale === 'pt-BR' ? 'Grátis' : 'Free';

  const sym =
    m.currency === 'EUR' ? '€' : m.currency === 'BRL' ? 'R$' : '$';

  const n = m.min ?? m.max;
  if (n == null || !Number.isFinite(n)) return '—';

  const fmt = Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.00$/, '');
  return `${sym}${fmt}`;
}

/**
 * Price-per-person affordability level for the $ $ $ chip (0–3).
 * - 0 free (all icons light gray)
 * - 1 €1–15 green
 * - 2 €16–39 yellow
 * - 3 €40+ red
 * Uses typical spend (`min`, same as formatMoneyTypical).
 */
export type PriceLevel = 0 | 1 | 2 | 3;

export function priceLevelFromMoney(m: MoneyInfo): PriceLevel {
  if (m.free) return 0;
  const n = m.min ?? m.max;
  if (n == null || !Number.isFinite(n) || n <= 0) return 0;
  if (n <= 15) return 1;
  if (n <= 39) return 2;
  return 3;
}

export function formatDuration(
  visit: VisitInfo,
  locale: Locale = 'en',
): string | null {
  if (visit.duration) return visit.duration[locale] ?? visit.duration.en;

  const { durationMin: min, durationMax: max } = visit;
  if (min == null && max == null) return null;

  const h = (mins: number) => {
    if (mins < 60) {
      return locale === 'pt-BR' ? `${mins} min` : `${mins} min`;
    }
    const hours = mins / 60;
    if (Number.isInteger(hours)) {
      return locale === 'pt-BR'
        ? `${hours} h`
        : `${hours}h`;
    }
    const whole = Math.floor(hours);
    const rem = mins % 60;
    return locale === 'pt-BR'
      ? `${whole} h ${rem} min`
      : `${whole}h ${rem}m`;
  };

  if (min != null && max != null && min !== max) {
    // compact for common ranges
    if (min >= 60 && max >= 60) {
      const a = min / 60;
      const b = max / 60;
      const fa = Number.isInteger(a) ? String(a) : a.toFixed(1).replace(/\.0$/, '');
      const fb = Number.isInteger(b) ? String(b) : b.toFixed(1).replace(/\.0$/, '');
      return locale === 'pt-BR' ? `${fa}–${fb} h` : `${fa}–${fb}h`;
    }
    return `${h(min)} – ${h(max)}`;
  }
  return h(min ?? max!);
}

/** Fields shown on the place card (only non-empty). */
export type VisitFieldKey =
  | 'avgPrice'
  | 'pricePerNight'
  | 'ticket'
  | 'ticketPromo'
  | 'duration'
  | 'bestTime'
  | 'bestDay'
  | 'tips';

/** One display line for a structured ticket promo. */
export function formatTicketPromo(
  promo: TicketPromo,
  locale: Locale = 'en',
): string {
  return promo.label[locale] ?? promo.label.en;
}

export function visitFieldsForDisplay(
  visit: VisitInfo,
  locale: Locale = 'en',
): { key: VisitFieldKey; value: string; note?: string }[] {
  const out: { key: VisitFieldKey; value: string; note?: string }[] = [];

  if (visit.avgPricePerPerson) {
    out.push({
      key: 'avgPrice',
      // Place card: full range. Day budget uses moneyTypicalEur (min) separately.
      value: formatMoney(visit.avgPricePerPerson, locale),
      note: visit.avgPricePerPerson.note
        ? visit.avgPricePerPerson.note[locale] ?? visit.avgPricePerPerson.note.en
        : undefined,
    });
  }
  if (visit.pricePerNight) {
    out.push({
      key: 'pricePerNight',
      // Full min–max range (hotels show a band, not a single typical plate price)
      value: formatMoney(visit.pricePerNight, locale),
      note: visit.pricePerNight.note
        ? visit.pricePerNight.note[locale] ?? visit.pricePerNight.note.en
        : undefined,
    });
  }
  if (visit.ticket) {
    const promoNote =
      visit.ticketPromos && visit.ticketPromos.length > 0
        ? visit.ticketPromos.map((p) => formatTicketPromo(p, locale)).join(' · ')
        : undefined;
    const moneyNote = visit.ticket.note
      ? visit.ticket.note[locale] ?? visit.ticket.note.en
      : undefined;
    out.push({
      key: 'ticket',
      value: formatMoney(visit.ticket, locale),
      note: [moneyNote, promoNote].filter(Boolean).join(' · ') || undefined,
    });
  }
  const dur = formatDuration(visit, locale);
  if (dur) out.push({ key: 'duration', value: dur });
  if (visit.bestTime) {
    out.push({
      key: 'bestTime',
      value: visit.bestTime[locale] ?? visit.bestTime.en,
    });
  }
  if (visit.bestDay) {
    out.push({
      key: 'bestDay',
      value: visit.bestDay[locale] ?? visit.bestDay.en,
    });
  }
  if (visit.tips) {
    out.push({
      key: 'tips',
      value: visit.tips[locale] ?? visit.tips.en,
    });
  }
  return out;
}

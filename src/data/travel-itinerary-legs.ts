/**
 * Authored walk / transit legs between consecutive primary stops.
 * Geometry: walk → OSRM foot; transit → metro/RER spine (+ walk to stations).
 */

import type { LString } from './travel';
import parisMilanRail from './travel-paris-milan-rail.json';
import { italyRailLegs } from './travel-italy-rail';
import {
  cinqueTerreRegional,
  milanMetro3,
  romeMetroB,
  veniceVaporetto1,
  funicularMontmartre,
  getTransitLine,
  haversineM,
  metro10,
  metro1,
  metro12,
  metro4,
  metro7,
  metro9,
  rerA,
  rerB,
  rerC,
  rerE,
  sliceLinePath,
  transilienL,
  type LatLng,
  type TransitLine,
  type TransitLineId,
} from './travel-transit-lines';

export type ItineraryLegMode = 'walk' | 'transit';

/**
 * One hop on a multi-line transit leg (e.g. M14 then RER E).
 * Each hop keeps its own line color + spine; map draws a transfer dot between hops.
 */
export type ItineraryTransitHop = {
  /** Line id (m14, m13, rer-e, …) for official color when known */
  line: TransitLineId | string;
  /** Station/corridor polyline for this hop only [lat,lng] */
  path: LatLng[];
  /** Short label for this hop (e.g. "M14") */
  label?: string;
  /** Station where this ride starts, shown under its chip. */
  board?: string;
  /** Station where this ride ends, shown under the board station. */
  exit?: string;
  /** Walk from the previous ride, when the corridors run longer than the straight line. */
  transferMin?: number;
};

export type ItineraryLegDef = {
  from: string;
  to: string;
  mode: ItineraryLegMode;
  /** Transit line key when mode === 'transit' (single-line) */
  line?: TransitLineId | string;
  /** Explicit stations on that line (else nearest to place pins) */
  fromStation?: string;
  toStation?: string;
  /**
   * Pre-authored transit polyline [lat,lng] — station/corridor only.
   * Walk connectors place↔path ends are generated separately.
   * Prefer `hops` for multi-line rides ("RER E + M13").
   */
  path?: LatLng[];
  /** Override when path vertices describe track geometry rather than stations (0 = unknown). */
  stationCount?: number;
  /** Station names for matching a published departure on a single-line ride. */
  board?: string;
  exit?: string;
  /**
   * Multi-line transit: ordered hops with per-line geometry + color.
   * When set, overrides single `path` / `line` for map expansion.
   */
  hops?: ItineraryTransitHop[];
  /** Verified walking access to the first hop, available when live routing is offline. */
  walkInPath?: LatLng[];
  /** Walk only: points the walk must pass, such as the central avenue of a park. */
  through?: LatLng[];
  /** Short label for UI (e.g. "M1", "RER E + M13") */
  label?: string;
  /** Optional override for expected duration (minutes) */
  durationMin?: number;
};

/** Fallback brand colors for lines not in travel-transit-lines. */
export const TRANSIT_LINE_COLORS: Record<string, string> = {
  'mil-m3': '#F4CA16',
  'rer-d': '#00814F',
};

/** Resolve RATP/RER brand color for a line id */
export function lineBrandColor(lineId?: string): string | undefined {
  if (!lineId) return undefined;
  return getTransitLine(lineId)?.color ?? TRANSIT_LINE_COLORS[lineId];
}

/** Bilingual label for timeline transfer chips */
export function legDisplayLabel(leg: ItineraryLegDef): LString {
  if (leg.mode === 'walk') {
    return { en: 'Walk', 'pt-BR': 'A pé' };
  }
  if (leg.label) {
    return { en: leg.label, 'pt-BR': leg.label };
  }
  if (leg.line) {
    const line = getTransitLine(leg.line);
    const name = line?.name ?? String(leg.line).toUpperCase();
    return { en: name, 'pt-BR': name };
  }
  return { en: 'Transit', 'pt-BR': 'Transporte' };
}

/** Walk ≈ 4.8 km/h; metro effective ≈ 21 km/h; RER and Transilien ≈ 42 km/h */
const WALK_M_PER_MIN = 80;
const TRANSIT_M_PER_MIN = 350;
const RAIL_M_PER_MIN = 700;

/** Suburban rail stops far less often than the metro. */
export function transitMPerMin(line?: string): number {
  return line?.startsWith('rer-') || line?.startsWith('transilien-') ? RAIL_M_PER_MIN : TRANSIT_M_PER_MIN;
}

/** Boarding / wait buffer for transit legs */
const TRANSIT_BUFFER_MIN = 2;
/**
 * Min distance between consecutive hop ends/starts to show an inter-station walk
 * (same-station transfers use nearly identical coords and stay silent).
 */
const INTER_HOP_WALK_MIN_M = 40;
/** Walks to and from a station shorter than this are skipped: the stop is the station. The map uses the same cut. */
export const WALK_CONNECTOR_MIN_M = 25;
/** Streets are rarely a straight line. */
const WALK_DETOUR = 1.25;

function walkMinutes(meters: number): number {
  return Math.max(1, Math.round((meters * WALK_DETOUR) / WALK_M_PER_MIN));
}

/** Walk distance between end of hop A and start of hop B (0 if same station). */
export function interHopWalkM(
  fromHop: ItineraryTransitHop,
  toHop: ItineraryTransitHop,
): number {
  const a = fromHop.path[fromHop.path.length - 1];
  const b = toHop.path[0];
  if (!a || !b) return 0;
  return haversineM(
    { lat: a[0], lng: a[1] },
    { lat: b[0], lng: b[1] },
  );
}

function pathLengthM(path: LatLng[]): number {
  let d = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i]!;
    const b = path[i + 1]!;
    d += haversineM(
      { lat: a[0], lng: a[1] },
      { lat: b[0], lng: b[1] },
    );
  }
  return d;
}

/**
 * Expected travel time for a place→place leg (minutes).
 * Uses path geometry when available; otherwise haversine + mode speed.
 */
export function estimateLegDurationMin(
  leg: ItineraryLegDef,
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
): number {
  if (typeof leg.durationMin === 'number' && leg.durationMin > 0) {
    return Math.max(1, Math.round(leg.durationMin));
  }

  if (leg.mode === 'walk') {
    const points = [from, ...(leg.through ?? []).map(([lat, lng]) => ({ lat, lng })), to];
    let meters = 0;
    for (let i = 1; i < points.length; i++) meters += haversineM(points[i - 1]!, points[i]!);
    return walkMinutes(meters);
  }

  const spinePath =
    leg.hops && leg.hops.length > 0
      ? leg.hops.flatMap((h) => h.path)
      : leg.path;
  if (spinePath && spinePath.length >= 2) {
    const start = spinePath[0]!;
    const end = spinePath[spinePath.length - 1]!;
    const walkIn = haversineM(from, { lat: start[0], lng: start[1] });
    const walkOut = haversineM({ lat: end[0], lng: end[1] }, to);
    let interHopWalk = 0;
    if (leg.hops && leg.hops.length > 1) {
      for (let i = 0; i < leg.hops.length - 1; i++) {
        const d = interHopWalkM(leg.hops[i]!, leg.hops[i + 1]!);
        if (d >= INTER_HOP_WALK_MIN_M) interHopWalk += d;
      }
    }
    const rideMin = leg.hops?.length
      ? leg.hops.reduce((sum, hop) => sum + pathLengthM(hop.path) / transitMPerMin(hop.line), 0)
      : pathLengthM(spinePath) / transitMPerMin(leg.line);
    const hopBuffer = (leg.hops?.length ?? 1) * TRANSIT_BUFFER_MIN;
    const mins =
      walkIn / WALK_M_PER_MIN +
      rideMin +
      interHopWalk / WALK_M_PER_MIN +
      walkOut / WALK_M_PER_MIN +
      hopBuffer;
    return Math.max(3, Math.round(mins));
  }

  // Straight-line detour factor for unpathed transit
  const m = haversineM(from, to) * 1.3;
  return Math.max(
    3,
    Math.round(m / TRANSIT_M_PER_MIN) + TRANSIT_BUFFER_MIN,
  );
}

/** Always-visible duration chip next to transfer label. From 60 min it reads like the trip Markdown: `~6h37`, `~1h`. */
export function formatLegDuration(min: number): LString {
  const n = Math.max(1, Math.round(min));
  const rest = n % 60;
  const text = n < 60 ? `~${n} min` : `~${Math.floor(n / 60)}h${rest ? String(rest).padStart(2, '0') : ''}`;
  return { en: text, 'pt-BR': text };
}

/**
 * Official line color for timeline chips.
 * Multi-hop legs use the first hop’s brand color when available.
 */
export function legLineColor(leg: ItineraryLegDef): string | null {
  if (leg.mode !== 'transit') return null;
  if (leg.hops?.length) {
    return lineBrandColor(leg.hops[0]!.line) ?? '#008fff';
  }
  if (!leg.line) return null;
  if (leg.label?.includes('+') && !leg.hops) {
    return lineBrandColor(leg.line) ?? '#008fff';
  }
  return lineBrandColor(leg.line) ?? null;
}

/** Solid vs dotted rail style for stop segments / transfers */
export type TimelineRailKind = 'walk' | 'transit' | 'none';

export function legRailKind(
  leg: ItineraryLegDef | null | undefined,
): TimelineRailKind {
  if (!leg) return 'none';
  return leg.mode === 'walk' ? 'walk' : 'transit';
}

/**
 * One visual transfer row in the day timeline.
 * Multi-line legs (hops) expand to one row per line (e.g. RER E, then M13).
 */
export type TimelineTransferPart = {
  mode: ItineraryLegMode;
  /** Full place→place leg (for map hover / data attributes) */
  leg: ItineraryLegDef;
  label: LString;
  color: string | null;
  /** Per-segment expected duration (minutes) */
  durationMin: number;
  /**
   * Index of this hop within a multi-line transit leg (0-based).
   * Undefined for walk / single-line transit.
   */
  hopIndex?: number;
  /**
   * Walk of a multi-line leg: 0 to the first station, i + 1 after hop i, the last to
   * the stop. Same numbers as `walkIndex` on the map, so one walk lights on its own.
   */
  walkIndex?: number;
  /**
   * Station markers along this transit segment (from authored path points).
   * Walk has 0; transit uses hop/leg path length (min 2 when known).
   */
  stationCount: number;
  /** Where the ride starts and ends, when known. Walks have neither. */
  board?: string;
  exit?: string;
};

function walkTo(name: string): LString {
  return { en: `Walk to ${name}`, 'pt-BR': `A pé até ${name}` };
}

function hopName(hop: ItineraryTransitHop): string {
  return hop.label ?? getTransitLine(hop.line)?.name ?? String(hop.line).toUpperCase();
}

/** Count station dots for a transit path (coordinates = stations on spine). */
function stationCountFromPath(path?: LatLng[]): number {
  if (!path || path.length < 2) return 0;
  return path.length;
}

/** Transit spine duration for one hop/path (minutes). */
function transitPathDurationMin(path: LatLng[], line?: string): number {
  if (path.length < 2) return TRANSIT_BUFFER_MIN;
  const spine = pathLengthM(path);
  return Math.max(
    1,
    Math.round(spine / transitMPerMin(line)) + TRANSIT_BUFFER_MIN,
  );
}

/**
 * Expand a leg into one or more timeline transfer chips.
 * Multi-hop legs → one chip per line, each with its own duration + hopIndex.
 */
export function expandTimelineTransferParts(
  leg: ItineraryLegDef,
  from?: { lat: number; lng: number },
  to?: { lat: number; lng: number },
): TimelineTransferPart[] {
  if (leg.mode === 'walk') {
    const durationMin =
      from && to
        ? estimateLegDurationMin(leg, from, to)
        : Math.max(1, leg.durationMin ?? 5);
    return [
      {
        mode: 'walk',
        leg,
        label: legDisplayLabel(leg),
        color: null,
        durationMin,
        stationCount: 0,
      },
    ];
  }

  if (leg.hops && leg.hops.length > 0) {
    const hops = leg.hops;
    const parts: TimelineTransferPart[] = [];
    const walk = (label: LString, meters: number, walkIndex: number, minutes?: number): TimelineTransferPart => ({
      mode: 'walk',
      leg,
      label,
      color: null,
      durationMin: minutes ?? walkMinutes(meters),
      walkIndex,
      stationCount: 0,
    });
    // From the stop to the first station, when the place is not the station itself.
    const board = hops[0]!.path[0];
    if (from && board) {
      const meters = haversineM(from, { lat: board[0], lng: board[1] });
      if (meters >= WALK_CONNECTOR_MIN_M) parts.push(walk(walkTo(hopName(hops[0]!)), meters, 0));
    }
    for (let i = 0; i < hops.length; i++) {
      const hop = hops[i]!;
      const name = hopName(hop);
      parts.push({
        mode: 'transit',
        leg,
        label: { en: name, 'pt-BR': name },
        color: lineBrandColor(hop.line) ?? '#008fff',
        durationMin: transitPathDurationMin(hop.path, hop.line),
        hopIndex: i,
        stationCount: stationCountFromPath(hop.path),
        ...(hop.board ? { board: hop.board } : {}),
        ...(hop.exit ? { exit: hop.exit } : {}),
      });

      // Different stations (e.g. RER E St-Lazare → M9 St-Augustin): show walk
      const next = hops[i + 1];
      if (!next) continue;
      const walkM = interHopWalkM(hop, next);
      if (walkM < INTER_HOP_WALK_MIN_M && next.transferMin == null) continue;
      parts.push(walk(walkTo(hopName(next)), walkM, i + 1, next.transferMin));
    }
    // From the last station to the stop.
    const lastPath = hops[hops.length - 1]!.path;
    const alight = lastPath[lastPath.length - 1];
    if (to && alight) {
      const meters = haversineM({ lat: alight[0], lng: alight[1] }, to);
      if (meters >= WALK_CONNECTOR_MIN_M) parts.push(walk(legDisplayLabel({ from: '', to: '', mode: 'walk' }), meters, hops.length));
    }
    return parts;
  }

  // Single-line transit: path stations, or resolve corridor from line registry
  let count = leg.stationCount ?? stationCountFromPath(leg.path);
  if (count === 0 && leg.line && leg.fromStation && leg.toStation) {
    const line = getTransitLine(leg.line);
    if (line) {
      const i = line.stations.findIndex((s) => s.id === leg.fromStation);
      const j = line.stations.findIndex((s) => s.id === leg.toStation);
      if (i >= 0 && j >= 0) {
        count = Math.abs(j - i) + 1;
      }
    }
  }

  const durationMin = leg.durationMin ?? (
    leg.path && leg.path.length >= 2
      ? transitPathDurationMin(leg.path, leg.line)
      : from && to
        ? estimateLegDurationMin(leg, from, to)
        : 8);

  return [
    {
      mode: 'transit',
      leg,
      label: legDisplayLabel(leg),
      color: legLineColor(leg),
      durationMin,
      stationCount: count,
      ...(leg.board ? { board: leg.board } : {}),
      ...(leg.exit ? { exit: leg.exit } : {}),
    },
  ];
}

/**
 * Gare du Nord ↔ Magenta: the stops sit 70 m apart, but the corridor is 150–200 m
 * across levels; journey planners give 2–8 min.
 */
const GARE_DU_NORD_MAGENTA_MIN = 6;

/**
 * Shared Day 1 legs after first bags at Casa do Gui:
 * house → market → house → Tower loop → dinner → home.
 */
const day1AfterBase: ItineraryLegDef[] = [
  // Short walk house ↔ Auchan (~5 min each way)
  { from: 'par-casa-do-gui', to: 'par-auchan-noisy', mode: 'walk' },
  { from: 'par-auchan-noisy', to: 'par-casa-do-gui', mode: 'walk' },
  {
    from: 'par-casa-do-gui',
    to: 'par-trocadero',
    mode: 'transit',
    // Walk house → Noisy RER (auto), RER E west to Haussmann–Saint-Lazare,
    // corridor to M9 Havre–Caumartin, M9 to Trocadéro.
    // Inter-hop walk is auto-inserted in timeline + map (coords differ).
    hops: [ride(rerE, 'noisy-le-sec', 'haussmann-saint-lazare'), ride(metro9, 'havre-caumartin', 'trocadero')],
    label: 'RER E + M9',
    durationMin: 45,
  },
  // Trocadéro (high view) → Tower exterior → Bake & Blend → Champ de Mars → dinner → home
  { from: 'par-trocadero', to: 'par-eiffel', mode: 'walk' },
  { from: 'par-eiffel', to: 'par-bake-blend', mode: 'walk' },
  { from: 'par-bake-blend', to: 'par-champ-mars', mode: 'walk' },
  { from: 'par-champ-mars', to: 'par-royal-cambronne', mode: 'walk' },
  {
    from: 'par-royal-cambronne',
    to: 'par-casa-do-gui',
    mode: 'transit',
    // Cambronne M6 → Montparnasse, M13 → Saint-Lazare, RER E → Noisy, walk home.
    hops: [
      {
        line: 'm6',
        label: 'M6',
        path: [
          [48.8475, 2.3025], // Cambronne
          [48.8455, 2.31], // Sèvres–Lecourbe
          [48.8428, 2.3125], // Pasteur
          [48.8422, 2.3219], // Montparnasse–Bienvenüe
        ],
      },
      {
        line: 'm13',
        label: 'M13',
        path: [
          [48.8422, 2.3219], // Montparnasse
          [48.847, 2.3165], // Duroc
          [48.856, 2.315], // Varenne
          [48.861, 2.3145], // Invalides
          [48.8676, 2.3135], // Champs-Élysées–Clemenceau
          [48.8735, 2.3145], // Miromesnil
          [48.8755, 2.3255], // Saint-Lazare
        ],
      },
      {
        line: 'rer-e',
        label: 'RER E',
        path: [
          [48.8755, 2.3255], // Saint-Lazare
          [48.8785, 2.358], // Magenta
          [48.8855, 2.385], // Pantin
          [48.8907, 2.4608], // Noisy-le-Sec
        ],
      },
    ],
    label: 'M6 + M13 + RER E',
    durationMin: 55,
  },
];

/**
 * Day 1 — Friday arrival ORY: Orly → Navigo → PAUL → Casa do Gui → Tower.
 */
const day1: ItineraryLegDef[] = [
  { from: 'par-ory', to: 'par-orly-m14', mode: 'walk' },
  { from: 'par-orly-m14', to: 'par-orly-paul', mode: 'walk' },
  {
    from: 'par-orly-paul',
    to: 'par-noisy-le-sec-rer',
    mode: 'transit',
    // M14 Orly → Saint-Lazare, then RER E east to Noisy-le-Sec
    hops: [
      {
        line: 'm14',
        label: 'M14',
        path: [
          [48.7292, 2.3698], // Orly M14
          [48.827, 2.367], // Olympiades
          [48.8298, 2.3765], // Bibliothèque F. Mitterrand
          [48.84, 2.3795], // Bercy
          [48.8448, 2.3735], // Gare de Lyon
          [48.8584, 2.347], // Châtelet
          [48.8665, 2.3345], // Pyramides
          [48.87, 2.3244], // Madeleine
          [48.8755, 2.3255], // Saint-Lazare (transfer → RER E)
        ],
      },
      {
        line: 'rer-e',
        label: 'RER E',
        path: [
          [48.8755, 2.3255], // Saint-Lazare / Haussmann
          [48.8785, 2.358], // Magenta
          [48.8855, 2.385], // Pantin
          [48.8907, 2.4608], // Noisy-le-Sec
        ],
      },
    ],
    label: 'M14 + RER E',
  },
  { from: 'par-noisy-le-sec-rer', to: 'par-casa-do-gui', mode: 'walk' },
  ...day1AfterBase,
];

/**
 * Day 1 — Friday arrival CDG: CDG → PAUL → Navigo RER → Casa do Gui → Tower.
 */
const day1Cdg: ItineraryLegDef[] = [
  { from: 'par-cdg', to: 'par-cdg-paul', mode: 'walk' },
  { from: 'par-cdg-paul', to: 'par-cdg-rer', mode: 'walk' },
  {
    from: 'par-cdg-rer',
    to: 'par-noisy-le-sec-rer',
    mode: 'transit',
    // RER B to Gare du Nord, corridor to Magenta (slower with suitcases), RER E east to Noisy-le-Sec
    hops: [
      ride(rerB, 'cdg-2', 'gare-nord'),
      ride(rerE, 'magenta', 'noisy-le-sec', GARE_DU_NORD_MAGENTA_MIN + 2),
    ],
    label: 'RER B + RER E',
    durationMin: 65,
  },
  { from: 'par-noisy-le-sec-rer', to: 'par-casa-do-gui', mode: 'walk' },
  ...day1AfterBase,
];

/**
 * Day 2 — Optimized west axis (former Day 1).
 * Defense → Tuileries picnic → Champs / Arc → Invalides → Opéra / Bouillon.
 */
const day2: ItineraryLegDef[] = [
  { from: 'par-paul-defense', to: 'par-grande-arche', mode: 'walk' },
  { from: 'par-grande-arche', to: 'par-esplanade-de-gaulle', mode: 'walk' },
  { from: 'par-esplanade-de-gaulle', to: 'par-la-defense', mode: 'walk' },
  {
    from: 'par-la-defense',
    to: 'par-monoprix-rivoli',
    mode: 'transit',
    line: 'm1',
    fromStation: 'la-defense',
    toStation: 'tuileries',
    label: 'M1',
  },
  { from: 'par-monoprix-rivoli', to: 'par-tuileries', mode: 'walk' },
  { from: 'par-tuileries', to: 'par-louvre', mode: 'walk' },
  { from: 'par-louvre', to: 'par-vendome', mode: 'walk' },
  { from: 'par-vendome', to: 'par-champs-elysees', mode: 'walk' },
  { from: 'par-champs-elysees', to: 'par-arc-triomphe', mode: 'walk' },
  { from: 'par-arc-triomphe', to: 'par-palais', mode: 'walk' },
  { from: 'par-palais', to: 'par-alexandre-iii', mode: 'walk' },
  { from: 'par-alexandre-iii', to: 'par-invalides', mode: 'walk' },
  {
    from: 'par-invalides',
    to: 'par-opera',
    mode: 'transit',
    line: 'm8',
    fromStation: 'invalides',
    toStation: 'opera',
    label: 'M8',
  },
  { from: 'par-opera', to: 'par-galeries-lafayette', mode: 'walk' },
  { from: 'par-galeries-lafayette', to: 'par-bouillon', mode: 'walk' },
];

/**
 * Day 3 — Left bank cluster walk, then north to Montmartre.
 */
const day3: ItineraryLegDef[] = [
  { from: 'par-maison-isabelle', to: 'par-luxembourg', mode: 'walk' },
  { from: 'par-luxembourg', to: 'par-pantheon', mode: 'walk' },
  { from: 'par-pantheon', to: 'par-sorbonne', mode: 'walk' },
  { from: 'par-sorbonne', to: 'par-creperie-arts', mode: 'walk' },
  { from: 'par-creperie-arts', to: 'par-saint-michel', mode: 'walk' },
  { from: 'par-saint-michel', to: 'par-notre-dame', mode: 'walk' },
  { from: 'par-notre-dame', to: 'par-hotel-ville', mode: 'walk' },
  { from: 'par-hotel-ville', to: 'par-horloge', mode: 'walk' },
  { from: 'par-horloge', to: 'par-sainte-chapelle', mode: 'walk' },
  {
    from: 'par-sainte-chapelle',
    to: 'par-fric-frac',
    mode: 'transit',
    line: 'm4',
    fromStation: 'cite',
    toStation: 'barbès',
    label: 'M4',
  },
  { from: 'par-fric-frac', to: 'par-place-du-tertre', mode: 'walk' },
  { from: 'par-place-du-tertre', to: 'par-sacre-coeur', mode: 'walk' },
  { from: 'par-sacre-coeur', to: 'par-moulin-rouge', mode: 'walk' },
  { from: 'par-moulin-rouge', to: 'par-arnaud-nicolas', mode: 'walk' },
];

/**
 * Day 4 — Versailles day. RER C is the spine; Michalak is a western pastry stop.
 */
const day4: ItineraryLegDef[] = [
  {
    from: 'par-michalak',
    to: 'par-versailles',
    mode: 'transit',
    line: 'rer-c',
    // Transit spine only (stations). Walk place↔ends drawn separately.
    path: [
      [48.880692, 2.272281], // Les Sablons (M1 near Michalak)
      [48.87803, 2.282547], // Porte Maillot
      [48.8738, 2.295], // Étoile
      [48.8676, 2.3135], // Clemenceau
      [48.861, 2.3145], // Invalides RER C
      [48.8555, 2.2895], // Champ de Mars
      [48.8465, 2.2785], // Javel
      [48.8215, 2.2595], // Issy
      [48.8125, 2.2215], // Meudon
      [48.8003, 2.1293], // Versailles-Château
    ],
    label: 'RER C',
  },
  trainLeg('par-versailles', 'par-eiffel', 85, [ride(rerC, 'versailles-chateau', 'champ-mars')]),
  {
    from: 'par-eiffel',
    to: 'par-bien-eleve',
    mode: 'transit',
    line: 'm6',
    // Station spine only: M6 → Étoile → M2 east (walk ends to places)
    path: [
      [48.8539, 2.2893], // Bir-Hakeim
      [48.8575, 2.2858], // Passy
      [48.863, 2.2875], // Trocadéro
      [48.8712, 2.2928], // Kléber
      [48.8738, 2.295], // Étoile
      [48.8755, 2.305], // Ternes
      [48.878, 2.314], // Courcelles
      [48.882, 2.3275], // Villiers
      [48.8835, 2.333], // Rome
      [48.8838, 2.338], // Place de Clichy
      [48.8828, 2.3499], // Pigalle
    ],
    label: 'M6 + M2',
  },
];

/**
 * Day 5 — Right bank + Louvre + L6 scenic ride + Montparnasse.
 */
const day5: ItineraryLegDef[] = [
  { from: 'par-palais-royal', to: 'par-bohemia', mode: 'walk' },
  {
    from: 'par-bohemia',
    to: 'par-bnf',
    mode: 'transit',
    line: 'm14',
    fromStation: 'pyramides',
    toStation: 'bibliotheque',
    label: 'M14',
  },
  {
    from: 'par-bnf',
    to: 'par-chatelet',
    mode: 'transit',
    line: 'm14',
    fromStation: 'bibliotheque',
    toStation: 'chatelet',
    label: 'M14',
  },
  { from: 'par-chatelet', to: 'par-saint-eustache', mode: 'walk' },
  { from: 'par-saint-eustache', to: 'par-montorgueil', mode: 'walk' },
  { from: 'par-montorgueil', to: 'par-pompidou', mode: 'walk' },
  { from: 'par-pompidou', to: 'par-amorino', mode: 'walk' },
  {
    from: 'par-amorino',
    to: 'par-madeleine',
    mode: 'transit',
    line: 'm14',
    fromStation: 'chatelet',
    toStation: 'madeleine',
    label: 'M14',
  },
  { from: 'par-madeleine', to: 'par-jeffrey-cagnes', mode: 'walk' },
  { from: 'par-jeffrey-cagnes', to: 'par-louvre', mode: 'walk' },
  {
    from: 'par-louvre',
    to: 'par-metro-6',
    mode: 'transit',
    line: 'm1',
    fromStation: 'palais-royal',
    toStation: 'etoile',
    label: 'M1 → M6',
  },
  {
    // Ride Line 6 elevated toward Montparnasse / Gaîté
    from: 'par-metro-6',
    to: 'par-bakery-gaite',
    mode: 'transit',
    line: 'm6',
    fromStation: 'bir-hakeim',
    toStation: 'montparnasse',
    label: 'M6',
  },
  { from: 'par-bakery-gaite', to: 'par-montparnasse', mode: 'walk' },
  {
    from: 'par-montparnasse',
    to: 'par-entrecote',
    mode: 'transit',
    line: 'm6',
    fromStation: 'montparnasse',
    toStation: 'etoile',
    label: 'M6',
  },
];

/**
 * Day 6 — Monceau → Marais → Vincennes → Train Bleu (Gare de Lyon).
 */
const day6: ItineraryLegDef[] = [
  {
    from: 'par-monceau',
    to: 'par-bastille',
    mode: 'transit',
    line: 'm1',
    // Station spine only: M2 west to Étoile then M1 east to Bastille
    path: [
      [48.8805, 2.322], // Monceau (M2)
      [48.878, 2.314], // Courcelles
      [48.8755, 2.305], // Ternes
      [48.8738, 2.295], // Étoile
      [48.872, 2.3006], // George V
      [48.8691, 2.3098], // FDR
      [48.8676, 2.3135], // Clemenceau
      [48.8656, 2.3211], // Concorde
      [48.8636, 2.3303], // Tuileries
      [48.8625, 2.3364], // Palais Royal
      [48.8584, 2.347], // Châtelet
      [48.8573, 2.3517], // Hôtel de Ville
      [48.8553, 2.3609], // Saint-Paul
      [48.8532, 2.3691], // Bastille
    ],
    label: 'M2 + M1',
  },
  { from: 'par-bastille', to: 'par-vosges', mode: 'walk' },
  { from: 'par-vosges', to: 'par-chez-janou', mode: 'walk' },
  {
    from: 'par-chez-janou',
    to: 'par-vincennes-town',
    mode: 'transit',
    line: 'm1',
    fromStation: 'bastille',
    toStation: 'chateau-vincennes',
    label: 'M1',
  },
  {
    from: 'par-vincennes-town',
    to: 'par-train-bleu',
    mode: 'transit',
    line: 'm1',
    fromStation: 'chateau-vincennes',
    toStation: 'gare-lyon',
    label: 'M1',
  },
];

/**
 * Day 7 — Casa do Gui → Disneyland Paris full day → home.
 * Outbound: RER E west (Noisy) → Magenta → RER D to Châtelet → RER A east to Chessy.
 * On-site hops are walks; return is the reverse spine late night.
 */
const day7: ItineraryLegDef[] = [
  {
    from: 'par-casa-do-gui',
    to: 'par-disney-adventure-world',
    mode: 'transit',
    // Walk house → Noisy RER (auto), then multi-line into Marne-la-Vallée–Chessy.
    hops: [
      {
        line: 'rer-e',
        label: 'RER E',
        path: [
          [48.8907, 2.4608], // Noisy-le-Sec (board)
          [48.8855, 2.385], // Pantin
          [48.8785, 2.358], // Magenta (alight → walk to Gare du Nord RER D/B)
        ],
      },
      {
        line: 'rer-d',
        label: 'RER D',
        path: [
          [48.8809, 2.3553], // Gare du Nord
          [48.876, 2.35], // intermediate
          [48.861, 2.347], // Châtelet–Les Halles (transfer to RER A)
        ],
      },
      {
        line: 'rer-a',
        label: 'RER A',
        path: [
          [48.861, 2.347], // Châtelet–Les Halles
          [48.8448, 2.3735], // Gare de Lyon
          [48.8483, 2.3958], // Nation
          [48.8475, 2.4405], // Vincennes
          [48.8395, 2.495], // Fontenay / Val de Fontenay corridor
          [48.839, 2.58], // east suburbs
          [48.848, 2.68], // approach Marne-la-Vallée
          [48.869, 2.783], // Marne-la-Vallée–Chessy (park gates)
        ],
      },
    ],
    label: 'RER E + RER D + RER A',
    durationMin: 75,
  },
  { from: 'par-disney-adventure-world', to: 'par-bella-notte', mode: 'walk' },
  { from: 'par-bella-notte', to: 'par-disneyland', mode: 'walk' },
  { from: 'par-disneyland', to: 'par-mcdonalds-disney', mode: 'walk' },
  { from: 'par-mcdonalds-disney', to: 'par-disneyland', mode: 'walk' },
  {
    from: 'par-disneyland',
    to: 'par-casa-do-gui',
    mode: 'transit',
    hops: [
      {
        line: 'rer-a',
        label: 'RER A',
        path: [
          [48.869, 2.783], // Marne-la-Vallée–Chessy
          [48.848, 2.68],
          [48.839, 2.58],
          [48.8395, 2.495],
          [48.8475, 2.4405], // Vincennes
          [48.8483, 2.3958], // Nation
          [48.8448, 2.3735], // Gare de Lyon
          [48.861, 2.347], // Châtelet–Les Halles
        ],
      },
      {
        line: 'rer-d',
        label: 'RER D',
        path: [
          [48.861, 2.347], // Châtelet–Les Halles
          [48.876, 2.35],
          [48.8809, 2.3553], // Gare du Nord → walk to Magenta RER E
        ],
      },
      {
        line: 'rer-e',
        label: 'RER E',
        path: [
          [48.8785, 2.358], // Magenta
          [48.8855, 2.385], // Pantin
          [48.8907, 2.4608], // Noisy-le-Sec (walk home)
        ],
      },
    ],
    label: 'RER A + RER D + RER E',
    durationMin: 80,
  },
];

/** day.id → ordered legs between primary stops (default arrival when day has variants) */
/** One ride along a registry line, with where to get on and off. Throws on an unknown stretch. */
function ride(line: TransitLine, from: string, to: string, transferMin?: number): ItineraryTransitHop {
  const path = sliceLinePath(line, from, to);
  const board = line.stations.find((station) => station.id === from);
  const exit = line.stations.find((station) => station.id === to);
  if (path.length < 2 || !board || !exit) throw new Error(`${line.id}: no ride ${from} → ${to}`);
  return {
    line: line.id,
    label: line.name.replace('Métro ', 'M'),
    board: board.name,
    exit: exit.name,
    path,
    ...(transferMin ? { transferMin } : {}),
  };
}

function trainLeg(from: string, to: string, durationMin: number, hops: ItineraryTransitHop[]): ItineraryLegDef {
  return { from, to, mode: 'transit', hops, label: hops.map((hop) => hop.label).join(' + '), durationMin };
}

const palaisToChampsWalk: LatLng[] = [
  [48.865803, 2.313203],
  [48.865788, 2.313289],
  [48.865735, 2.313346],
  [48.865752, 2.313405],
  [48.865788, 2.313414],
  [48.86578, 2.313609],
  [48.865955, 2.31351],
  [48.866248, 2.313548],
  [48.866432, 2.3137],
  [48.866715, 2.313733],
  [48.866707, 2.313897],
  [48.867517, 2.31399],
  [48.867754, 2.313963],
  [48.868851, 2.310514],
  [48.868973, 2.310606],
  [48.869003, 2.310539],
  [48.86904, 2.310512],
  [48.869075, 2.310516],
  [48.8692, 2.31036],
  [48.869219, 2.310252],
  [48.869258, 2.310218],
  [48.869256, 2.31001],
  [48.869216, 2.309933],
  [48.869223, 2.309788],
  [48.869117, 2.30971],
  [48.870212, 2.306261],
  [48.870467, 2.306446],
  [48.870963, 2.304882],
];

/**
 * Train hops of content/trips/europa.md that no portfolio day covers.
 * Without a spine the trip view leaves a transit hop off the map.
 */
const tripEuropa2026: ItineraryLegDef[] = [
  trainLeg('rom-termini', 'rom-stow-colosseo', 30, [ride(romeMetroB, 'termini', 'colosseo')]),
  trainLeg('ven-salute', 'ven-santa-lucia', 60, [ride(veniceVaporetto1, 'salute', 'ferrovia')]),
  trainLeg('spe-centrale', 'ct-riomaggiore', 30, [ride(cinqueTerreRegional, 'spezia', 'riomaggiore')]),
  trainLeg('ct-manarola', 'ct-corniglia', 30, [ride(cinqueTerreRegional, 'manarola', 'corniglia')]),
  trainLeg('ct-corniglia', 'ct-vernazza', 30, [ride(cinqueTerreRegional, 'corniglia', 'vernazza')]),
  trainLeg('ct-vernazza', 'ct-monterosso', 50, [ride(cinqueTerreRegional, 'vernazza', 'monterosso')]),
  trainLeg('ct-monterosso', 'spe-centrale', 60, [ride(cinqueTerreRegional, 'monterosso', 'spezia')]),
  // 5/10: Tulheries → market → Maillol → Carrousel → Louvre.
  // Pedestrian geometry: Valhalla / OSM, 2026-09-27.
  {
    from: 'par-carrousel', to: 'par-louvre', mode: 'walk', durationMin: 5,
    path: [
      [48.86059, 2.337594],
      [48.860619, 2.337475],
      [48.860641, 2.337378],
      [48.860466, 2.337367],
      [48.860301, 2.337281],
      [48.860165, 2.337193],
      [48.860288, 2.336678],
      [48.860309, 2.336594],
      [48.860328, 2.336513],
      [48.86055, 2.335591],
      [48.860776, 2.334695],
      [48.860818, 2.334718],
      [48.860973, 2.33404],
      [48.860977, 2.334024],
      [48.860986, 2.333987],
      [48.860993, 2.333953],
      [48.861018, 2.333848],
      [48.861033, 2.333779],
      [48.861048, 2.333713],
      [48.861056, 2.333694],
      [48.86111, 2.333573],
      [48.861188, 2.333462],
      [48.861278, 2.333384],
      [48.861371, 2.333341],
      [48.861457, 2.333328],
      [48.861541, 2.333341],
      [48.861548, 2.333342],
      [48.861587, 2.33336],
      [48.861715, 2.332952],
      [48.861728, 2.33291],
    ].reverse() as LatLng[],
  },
  {
    from: 'par-maillol', to: 'par-carrousel', mode: 'walk', durationMin: 2,
    path: [
      [48.861728, 2.33291],
      [48.861741, 2.332866],
      [48.861872, 2.332463],
      [48.862064, 2.331849],
      [48.862271, 2.331191],
      [48.862462, 2.331335],
    ].reverse() as LatLng[],
  },
  {
    from: 'par-carrefour-express-saint-honore', to: 'par-maillol', mode: 'walk', durationMin: 5,
    path: [
      [48.862462, 2.331335],
      [48.863276, 2.331949],
      [48.863326, 2.331979],
      [48.863589, 2.332173],
      [48.863599, 2.33214],
      [48.86361, 2.332106],
      [48.863641, 2.332004],
      [48.863669, 2.331912],
      [48.863678, 2.331881],
      [48.863707, 2.331794],
      [48.863744, 2.331808],
      [48.863768, 2.331731],
      [48.863788, 2.331746],
      [48.863799, 2.331754],
      [48.863811, 2.331763],
      [48.863824, 2.331773],
      [48.86385, 2.331793],
      [48.863891, 2.331824],
      [48.863915, 2.331842],
      [48.863922, 2.331847],
      [48.864031, 2.331501],
      [48.864047, 2.331459],
      [48.864075, 2.331469],
      [48.86408, 2.331454],
      [48.864095, 2.331406],
      [48.864107, 2.331368],
      [48.864113, 2.331349],
      [48.864828, 2.331833],
      [48.86487, 2.331872],
      [48.86489, 2.33187],
      [48.864916, 2.331819],
      [48.865081, 2.3315],
    ].reverse() as LatLng[],
  },
  {
    from: 'par-tuileries', to: 'par-carrefour-express-saint-honore', mode: 'walk', durationMin: 6,
    path: [
      [48.865081, 2.3315],
      [48.864916, 2.331819],
      [48.86489, 2.33187],
      [48.86487, 2.331872],
      [48.864867, 2.331893],
      [48.864856, 2.331916],
      [48.864838, 2.331955],
      [48.864828, 2.331973],
      [48.864777, 2.331933],
      [48.864075, 2.331469],
      [48.864047, 2.331459],
      [48.864031, 2.331501],
      [48.863922, 2.331847],
      [48.863915, 2.331842],
      [48.863891, 2.331824],
      [48.86385, 2.331793],
      [48.863824, 2.331773],
      [48.863811, 2.331763],
      [48.863799, 2.331754],
      [48.863788, 2.331746],
      [48.863768, 2.331731],
      [48.863744, 2.331808],
      [48.863707, 2.331794],
      [48.863662, 2.331761],
      [48.863648, 2.331751],
      [48.863447, 2.331603],
      [48.863373, 2.331561],
      [48.862533, 2.330964],
      [48.862571, 2.33084],
      [48.862422, 2.33073],
      [48.862439, 2.330676],
      [48.862588, 2.33018],
      [48.862745, 2.329686],
      [48.862671, 2.329604],
      [48.862643, 2.329546],
    ].reverse() as LatLng[],
  },
  // 4/10: from the foot of the tower onto Avenue Pierre Loti (OSM ways 51259180, 1285858202)
  {
    from: 'par-eiffel',
    to: 'par-champ-mars',
    mode: 'walk',
    through: [
      [48.857625, 2.295043],
      [48.856457, 2.296889],
    ],
  },
  // 4/10: down the middle of the Champ de Mars on Avenue Pierre Loti (OSM ways 688246686, 1285858200)
  {
    from: 'par-champ-mars',
    to: 'par-chapelle-saint-louis',
    mode: 'walk',
    through: [
      [48.854475, 2.29998],
      [48.85361, 2.301304],
    ],
  },
  // 6/10: outside Sainte-Chapelle; Quai du Marché-Neuf then Boulevard du Palais.
  // OSM ways 123461253 / 865084962; avoid the foot router's detour via Dauphine.
  {
    from: 'par-notre-dame', to: 'par-sainte-chapelle', mode: 'walk',
    path: [
      [48.853, 2.3499],
      [48.853312, 2.350128],
      [48.853431, 2.349752],
      [48.853447, 2.349703],
      [48.853564, 2.349334],
      [48.853576, 2.349298],
      [48.85355, 2.349279],
      [48.853528, 2.349263],
      [48.853509, 2.349247],
      [48.853517, 2.349219],
      [48.853515, 2.349197],
      [48.853507, 2.349179],
      [48.853457, 2.349069],
      [48.853485, 2.34898],
      [48.853842, 2.347849],
      [48.853849, 2.347823],
      [48.85383, 2.34778],
      [48.853835, 2.347764],
      [48.853851, 2.347713],
      [48.853866, 2.347667],
      [48.85364, 2.347487],
      [48.853625, 2.347475],
      [48.853616, 2.347467],
      [48.853607, 2.347449],
      [48.853605, 2.34742],
      [48.853613, 2.347325],
      [48.853618, 2.347293],
      [48.853574, 2.347269],
      [48.853538, 2.347252],
      [48.853519, 2.347242],
      [48.853515, 2.347218],
      [48.853501, 2.3472],
      [48.853447, 2.347168],
      [48.853456, 2.34713],
      [48.853476, 2.347049],
      [48.853492, 2.346983],
      [48.853499, 2.346956],
      [48.853514, 2.346853],
      [48.853584, 2.346655],
      [48.853611, 2.346612],
      [48.853641, 2.346537],
      [48.853904, 2.345812],
      [48.854081, 2.345329],
      [48.854101, 2.34525],
      [48.854183, 2.345044],
      [48.854217, 2.344965],
      [48.854248, 2.344995],
      [48.854295, 2.34504],
      [48.854336, 2.34492],
      [48.8543358, 2.3449201],
      [48.8544187, 2.3449997],
      [48.8551379, 2.3457458],
    ],
  },
  {
    from: 'par-sainte-chapelle', to: 'par-horloge', mode: 'walk',
    path: [
      [48.8551379, 2.3457458],
      [48.8552427, 2.3458309],
      [48.8552653, 2.3458498],
      [48.8552901, 2.3458701],
      [48.8553295, 2.3459053],
      [48.8553295, 2.3459053],
      [48.8553552, 2.3459241],
      [48.8554715, 2.3460252],
      [48.8555692, 2.3460946],
      [48.8556661, 2.3461604],
      [48.8557739, 2.3462337],
      [48.8560819, 2.3464429],
      [48.8561106, 2.3464624],
      [48.8561977, 2.3464808],
      [48.856193, 2.346233],
    ],
  },
  // Last RER E at 22:59: the line closes from 22:45 on weekends (works 26/09–6/12)
  trainLeg('par-port-debilly', 'par-casa-do-gui', 60, [
    ride(metro9, 'iena', 'havre-caumartin'),
    ride(rerE, 'haussmann-saint-lazare', 'noisy-le-sec'),
  ]),
  // 5/10: breakfast, Arc, west-to-east walk, Louvre and Opéra shops.
  { from: 'par-champs-elysees', to: 'par-palais', mode: 'walk', path: [...palaisToChampsWalk].reverse() },
  { from: 'par-palais', to: 'par-alexandre-iii', mode: 'walk' },
  { from: 'par-alexandre-iii', to: 'par-luxor-obelisk', mode: 'walk', through: [[48.862723, 2.313436], [48.864541, 2.313651], [48.865803, 2.313203], [48.867754, 2.313963], [48.866301, 2.318531]] },
  trainLeg('par-casa-do-gui', 'par-arc-triomphe', 58, [
    ride(rerE, 'noisy-le-sec', 'haussmann-saint-lazare'),
    ride(rerA, 'auber', 'etoile'),
  ]),
  trainLeg('par-louvre', 'par-lafayette-gourmet-haussmann', 20, [
    ride(metro7, 'palais-royal', 'chaussee-antin'),
  ]),
  trainLeg('par-passage-panoramas', 'par-casa-do-gui', 50, [ride(rerE, 'haussmann-saint-lazare', 'noisy-le-sec')]),
  // 6/10
  // Return from breakfast on different streets from the RER approach (Galande / des Anglais).
  // OSM Rue Frédéric Sauton and Rue de la Bûcherie; checked with the foot router.
  {
    from: 'par-maison-isabelle', to: 'par-shakespeare', mode: 'walk',
    through: [[48.8508365, 2.3490314], [48.8520978, 2.3481998]],
  },
  trainLeg('par-casa-do-gui', 'par-maison-isabelle', 45, [
    ride(rerE, 'noisy-le-sec', 'magenta'),
    ride(rerB, 'gare-nord', 'saint-michel', GARE_DU_NORD_MAGENTA_MIN),
  ]),
  // From Rue Mouffetard to the passage near Odéon, before walking to Luxembourg.
  trainLeg('par-fontaine-guy-lartigue', 'par-cour-commerce', 25, [ride(metro7, 'censier-daubenton', 'jussieu'), ride(metro10, 'jussieu', 'odeon')]),
  trainLeg('par-port-louvre', 'par-casa-do-gui', 55, [
    ride(rerB, 'saint-michel', 'gare-nord'),
    ride(rerE, 'magenta', 'noisy-le-sec', GARE_DU_NORD_MAGENTA_MIN),
  ]),
  // 7/10: no RER E after 22:30 (works 5–14 Oct), so the way back ends at Val de Fontenay
  trainLeg('par-noisy-le-sec-rer', 'par-chessy-rer', 40, [
    ride(rerE, 'noisy-le-sec', 'val-de-fontenay'),
    ride(rerA, 'val-de-fontenay', 'chessy'),
  ]),
  trainLeg('par-chessy-rer', 'par-val-de-fontenay-rer', 26, [ride(rerA, 'chessy', 'val-de-fontenay')]),
  // 8/10: Richelieu / Palais-Royal, then Montmartre; 10/10: canal and Marais.
  trainLeg('par-casa-do-gui', 'par-vendome', 50, [ride(rerE, 'noisy-le-sec', 'haussmann-saint-lazare')]),
  trainLeg('par-palais-royal', 'par-place-du-tertre', 65, [
    ride(metro4, 'reaumur', 'chateau-rouge'),
    ride(funicularMontmartre, 'gare-basse', 'gare-haute'),
  ]),
  trainLeg('par-bouillon-pigalle', 'par-casa-do-gui', 45, [
    ride(metro12, 'pigalle-s', 'saint-lazare'),
    ride(rerE, 'haussmann-saint-lazare', 'noisy-le-sec'),
  ]),
  // 9/10
  trainLeg('par-casa-do-gui', 'par-point-alph', 80, [
    ride(rerE, 'noisy-le-sec', 'la-defense'),
    ride(transilienL, 'la-defense', 'versailles-rd'),
  ]),
  { from: 'par-point-alph', to: 'par-versailles-jardins', mode: 'walk', through: [[48.804027, 2.121208]] },
  { from: 'par-versailles-jardins', to: 'par-versailles', mode: 'walk', through: [[48.804027, 2.121208]] },
  // Actual return was not reported; suppress the walking fallback without inventing a service or route.
  { from: 'par-versailles', to: 'par-boulangerie-du-sentier', mode: 'transit', label: 'Transporte a confirmar', durationMin: 0 },
  trainLeg('par-entrecote', 'par-casa-do-gui', 45, [
    ride(metro9, 'fdr', 'chaussee-antin'),
    ride(rerE, 'haussmann-saint-lazare', 'noisy-le-sec'),
  ]),
  // FR 9281 on 11/10. Transitous rail geometry; provenance in docs/references/paris-milan-rail.md.
  {
    from: 'par-gare-de-lyon', to: 'mil-centrale', mode: 'transit',
    line: 'frecciarossa', label: 'Frecciarossa', durationMin: 397,
    board: 'Paris Gare de Lyon', exit: 'Milano Centrale',
    stationCount: 0,
    path: parisMilanRail as LatLng[],
  },
  // 8/10: Baguett’s and Richelieu; 10/10: Marais, Eiffel Tower and Seine cruise.
  trainLeg('par-casa-do-gui', 'par-bohemia', 50, [
    ride(rerE, 'noisy-le-sec', 'haussmann-saint-lazare'),
  ]),
  trainLeg('par-cedric-grolet-meurice', 'par-favorite-saint-paul', 20, [ride(metro1, 'tuileries', 'saint-paul')]),
  trainLeg('par-naturalia-verrerie', 'par-bateaux-mouches', 40, [
    ride(metro1, 'hotel-ville', 'fdr'),
    ride(metro9, 'fdr', 'alma-marceau'),
  ]),
  { from: 'par-bateaux-mouches', to: 'par-eiffel', mode: 'walk' },
  trainLeg('par-eiffel', 'par-monoprix-champs', 30, [ride(metro9, 'iena', 'saint-philippe')]),
  trainLeg('par-monoprix-champs', 'par-casa-do-gui', 45, [
    ride(metro9, 'saint-philippe', 'havre-caumartin'),
    ride(rerE, 'haussmann-saint-lazare', 'noisy-le-sec'),
  ]),
];

export const parisDayLegsById: Record<string, ItineraryLegDef[]> = {
  'paris-d1': day1,
  'paris-d1:cdg': day1Cdg,
  'paris-d2': day2,
  'paris-d3': day3,
  'paris-d4': day4,
  'paris-d5': day5,
  'paris-d6': day6,
  'paris-d7': day7,
  // Not a portfolio day: resolveTripLeg reads every list here by from → to pair.
  'trip-europa-2026': tripEuropa2026,
  'trip-italy-2026': italyRailLegs,
};

/** Milan transit durations include waiting and station access; no surveyed track geometry. */
export const milanDayLegsById: Record<string, ItineraryLegDef[]> = {
  'milao-d1': [
    { from: 'mil-centrale', to: 'mil-joy124', mode: 'walk', durationMin: 25 },
    { from: 'mil-joy124', to: 'mil-sondrio', mode: 'walk', durationMin: 10 },
    trainLeg('mil-sondrio', 'mil-cesarino', 25, [ride(milanMetro3, 'sondrio', 'duomo')]),
    { from: 'mil-cesarino', to: 'mil-duomo', mode: 'walk', durationMin: 5 },
    { from: 'mil-duomo', to: 'mil-galleria', mode: 'walk', durationMin: 5 },
    trainLeg('mil-galleria', 'mil-sondrio', 25, [ride(milanMetro3, 'duomo', 'sondrio')]),
    { from: 'mil-sondrio', to: 'mil-san-giorgio', mode: 'walk', durationMin: 8 },
    { from: 'mil-san-giorgio', to: 'mil-joy124', mode: 'walk', durationMin: 10 },
  ],
  ...Object.fromEntries(['milao-d2', 'milao-d3'].map(id => [id, [
    { from: 'mil-joy124', to: 'mil-centrale', mode: 'walk' as const, durationMin: 25 },
    { from: 'mil-centrale', to: 'mil-joy124', mode: 'walk' as const, durationMin: 25 },
  ]])),
};

/**
 * Legs for a day. When the day has arrival variants, pass `arrivalId`
 * (e.g. `'cdg'`) to load the alternate route; default / `'ory'` uses `dayId`.
 */
export function legsForDay(
  dayId: string,
  arrivalId?: string | null,
): ItineraryLegDef[] {
  if (arrivalId && arrivalId !== 'ory' && arrivalId !== 'default') {
    const keyed = parisDayLegsById[`${dayId}:${arrivalId}`];
    if (keyed) return keyed;
  }
  return parisDayLegsById[dayId] ?? milanDayLegsById[dayId] ?? [];
}

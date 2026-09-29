import { getTripCity } from './catalog';
import { isoParts } from './dates';
import type { Period } from './day-plan';
import { travelCities } from '../catalog';

export type TripLegMode = 'walk' | 'transit' | 'taxi' | 'flight';

export type TripLeg = {
  /** Author text after `via:`. Export writes it back unchanged. */
  detail: string;
  /** Text after ` — `. Mode and duration come only from the text before it. */
  note?: string;
  /** Price per person of the leg: the first `€` amount before the note. A range counts its middle. */
  fareEur?: number;
  mode?: TripLegMode;
  /**
   * Minutes. `N h` is N×60. `3h10` and `1 h 30 min` are one span (190 and 90).
   * Absent unless the line has exactly one duration.
   */
  durationMin?: number;
  /** 1-based line of the `via:`. The app edits the note there. */
  line?: number;
};

export type TripBoarding = {
  date: string;
  service: string;
  board: string;
  exit: string;
  departure: string;
  arrival: string;
};

export type TripStop = {
  /** Planned food spend per person for this date, replacing the catalog estimate. */
  foodEur?: number;
  /** Published services checked for this departure stop and date. */
  boardings?: TripBoarding[];
  /** Explicit planned exit, independent from the arrival time of the stop. */
  departureTime?: string;
  /** Missing status means tentative. Only parent stops participate in review. */
  status?: 'a confirmar' | 'confirmado';
  time?: string;
  /** A list note's text. It and `note` hold hard breaks as `\n`. */
  label: string;
  placeId?: string;
  href?: string;
  note?: string;
  /** Bullet without a link. Not a pin and not an error. */
  listNote?: boolean;
  /** Leg from this departure stop to the next stop. */
  leg?: TripLeg;
  /** 1-based line of the bullet. The UI edits the note on this line. */
  line: number;
  /** Indented `comentário:` lines: the user's requests to the LLM. Not exported. */
  comments?: TripLine[];
  /** Indented `decisão:` lines: what the user settled here. They stay, and the LLM never undoes them. Not exported. */
  decisions?: TripLine[];
};

/** One line of the file: its text and 1-based number. */
export type TripLine = { text: string; line: number };

export type TripDay = {
  line?: number;
  status?: 'fechado';
  closedPeriods?: Period[];
  title: string;
  stops: TripStop[];
  notes: TripLine[];
};

/** Target per person per day, from the city header `budget:`. Only food is checked by the day card. */
export type TripBudget = {
  food?: number;
  ticket?: number;
  /** Author text after `budget:`. Export writes it back unchanged. */
  detail: string;
};

export type TripCity = {
  slug: string;
  name: string;
  dates?: { start: string; end: string };
  budget?: TripBudget;
  /** Departure to the next city. The header line `via:`, not a stop leg. */
  leg?: TripLeg;
  days: TripDay[];
};

export type TripErrorCode =
  | 'boarding-invalid'
  | 'via-no-mode'
  | 'via-no-duration'
  | 'via-many-durations'
  | 'stop-no-link'
  | 'place-no-id'
  | 'bad-link'
  | 'place-missing'
  | 'city-no-slug'
  | 'city-unknown'
  | 'day-outside-city'
  | 'via-outside-day'
  | 'via-no-stop'
  | 'via-empty'
  | 'via-duplicate'
  | 'comment-no-stop'
  | 'decision-no-stop'
  | 'budget-empty'
  | 'budget-twice'
  | 'food-invalid'
  | 'stop-outside-day'
  | 'line-outside-day'
  | 'no-title';

export type TripError = { line: number; code: TripErrorCode; detail?: string };

function reject(errors: TripError[], line: number, code: TripErrorCode, detail?: string) {
  errors.push(detail === undefined ? { line, code } : { line, code, detail });
}

export type Trip = {
  id: string;
  file: string;
  title: string;
  cities: TripCity[];
  errors: TripError[];
};

const CITY_LINE = /^city:\s*(\S+)\s*$/;
const DATES_LINE = /^dates:\s*(\d{4}-\d{2}-\d{2})\s*→\s*(\d{4}-\d{2}-\d{2})\s*$/;
const TIME_PREFIX = /^(\d{2}:\d{2})\s+/;
const VIA_BULLET = /^[ \t]+-[ \t]+via:[ \t]*(.*)$/i;
const CITY_VIA = /^via:[ \t]*(.*)$/i;
const CITY_BUDGET = /^budget:[ \t]*(.*)$/i;
// `comida €50 · ingressos €30`: a keyword, then `€` and the amount (`€47,50` or `€47.50`).
const BUDGET_FOOD = /\b(?:comida|food)\s*€\s?(\d+(?:[.,]\d{1,2})?)/i;
const BUDGET_TICKET = /\b(?:ingressos|tickets)\s*€\s?(\d+(?:[.,]\d{1,2})?)/i;
const COMMENT_BULLET = /^[ \t]+-[ \t]+(?:comentário|comentario|comment):[ \t]*(.*)$/i;
const DECISION_BULLET = /^[ \t]+-[ \t]+(?:decisão|decisao|decision):[ \t]*(.*)$/i;
// `3h10` is glued. `1 h 30 min` needs the `min`. `1 h 2 h` stays two spans.
const DURATION_TOKEN =
  /(?<![a-z0-9])(?:(\d+)\s*h\s*(\d{1,2})\s*min|(\d+)h(\d{1,2})|(\d+)\s?(min|h))(?![a-z0-9])/gi;

const MODE_WORDS: { mode: TripLegMode; words: string[] }[] = [
  { mode: 'walk', words: ['a pe', 'walk'] },
  { mode: 'transit', words: ['metro', 'rer', 'trem', 'train', 'onibus', 'bus', 'tram', 'ferry', 'funicular'] },
  { mode: 'taxi', words: ['taxi', 'uber', 'bolt', 'carro', 'car'] },
  { mode: 'flight', words: ['voo', 'flight'] },
];

function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Earliest keyword wins. Accents folded, so táxi/taxi and metrô/metro are the same. */
function legMode(detail: string): TripLegMode | undefined {
  const folded = fold(detail);
  let bestAt = Number.POSITIVE_INFINITY;
  let best: TripLegMode | undefined;
  for (const entry of MODE_WORDS) {
    for (const word of entry.words) {
      const match = new RegExp(`(?<![a-z0-9])${word}(?![a-z0-9])`).exec(folded);
      if (match && match.index < bestAt) {
        bestAt = match.index;
        best = entry.mode;
      }
    }
  }
  return best;
}

function durationList(detail: string): number[] {
  const found: number[] = [];
  for (const match of detail.matchAll(new RegExp(DURATION_TOKEN.source, 'gi'))) {
    if (match[1] != null && match[2] != null) {
      found.push(Number(match[1]) * 60 + Number(match[2]));
    } else if (match[3] != null && match[4] != null) {
      found.push(Number(match[3]) * 60 + Number(match[4]));
    } else {
      const amount = Number(match[5]);
      found.push((match[6] ?? '').toLowerCase() === 'h' ? amount * 60 : amount);
    }
  }
  return found;
}

const LEG_NOTE = ' — ';
// `€2,55`, `€2.55` or a range `€29–35`.
const FARE_TOKEN = /€\s?(\d+(?:[.,]\d{1,2})?)(?:\s?[–-]\s?(\d+(?:[.,]\d{1,2})?))?/;

function euros(value: string): number {
  return Number(value.replace(',', '.'));
}

/** Targets per person per day in the text after `budget:`. Either one may be missing; null when both are. */
export function parseBudget(text: string): { food?: number; ticket?: number } | null {
  const food = BUDGET_FOOD.exec(text)?.[1];
  const ticket = BUDGET_TICKET.exec(text)?.[1];
  if (food === undefined && ticket === undefined) return null;
  return {
    ...(food !== undefined ? { food: euros(food) } : {}),
    ...(ticket !== undefined ? { ticket: euros(ticket) } : {}),
  };
}

function legFare(head: string): number | undefined {
  const match = FARE_TOKEN.exec(head);
  if (!match?.[1]) return undefined;
  const low = euros(match[1]);
  return match[2] ? (low + euros(match[2])) / 2 : low;
}

function readLeg(detail: string, line: number, errors: TripError[]): TripLeg {
  const cut = detail.indexOf(LEG_NOTE);
  const head = cut < 0 ? detail : detail.slice(0, cut);
  const note = cut < 0 ? '' : detail.slice(cut + LEG_NOTE.length).trim();
  const mode = legMode(head);
  if (!mode) reject(errors, line, 'via-no-mode');
  const matches = durationList(head);
  let durationMin: number | undefined;
  if (matches.length === 1) durationMin = matches[0];
  else if (matches.length > 0 || mode !== 'flight') reject(errors, line, matches.length === 0 ? 'via-no-duration' : 'via-many-durations');
  const fareEur = legFare(head);
  return {
    detail,
    line,
    ...(note ? { note } : {}),
    ...(mode ? { mode } : {}),
    ...(durationMin !== undefined ? { durationMin } : {}),
    ...(fareEur !== undefined ? { fareEur } : {}),
  };
}

/** Leg name for the timeline: no note, duration or fare. The row shows the minutes beside it. */
export function legLabel(leg: TripLeg): string {
  const cut = leg.detail.indexOf(LEG_NOTE);
  const head = (cut < 0 ? leg.detail : leg.detail.slice(0, cut)).trim();
  const bare = head
    .replace(new RegExp(DURATION_TOKEN.source, 'gi'), '')
    .replace(new RegExp(FARE_TOKEN.source, 'g'), '')
    .replace(/\(\s*\)/g, '')
    .replace(/^[\s·•,–-]+|[\s·•,–-]+$/g, '')
    .replace(/\s{2,}/g, ' ');
  return bare || head;
}

function parseStop(text: string, line: number, errors: TripError[]): Omit<TripStop, 'line'> {
  let rest = text.trim();
  let time: string | undefined;
  const timed = rest.match(TIME_PREFIX);
  if (timed) {
    time = timed[1];
    rest = rest.slice(timed[0].length);
  }

  const linked = rest.match(/^\[([^\]]+)\]\(([^)]+)\)(?:\s*(?:—|-)\s*(.*))?$/);
  if (!linked) return { time, label: rest, listNote: true };

  const label = linked[1].trim();
  const target = linked[2].trim();
  const note = linked[3]?.trim() || undefined;

  if (target.startsWith('place:')) {
    const placeId = target.slice('place:'.length).trim();
    if (!placeId) reject(errors, line, 'place-no-id');
    return { time, label, placeId: placeId || undefined, note };
  }

  if (/^https?:\/\//.test(target)) return { time, label, href: target, note };

  reject(errors, line, 'bad-link', target);
  return { time, label, note };
}

function checkPlaces(city: TripCity, errors: TripError[]) {
  if (!city.slug) return;
  const known = getTripCity(city.slug);
  if (!known) return;
  for (const day of city.days) {
    for (const stop of day.stops) {
      if (!stop.placeId) continue;
      if (!known.places.some((place) => place.id === stop.placeId)) {
        reject(errors, stop.line, 'place-missing', stop.placeId);
      }
    }
  }
}

/** Parse a trip markdown file. Never throws. */
export function parseTrip(id: string, file: string, raw: string): Trip {
  const errors: TripError[] = [];
  const lines = raw.split(/\r?\n/);
  let title = id;
  let sawH1 = false;
  const cities: TripCity[] = [];
  let city: TripCity | null = null;
  let day: TripDay | null = null;

  const closeCity = () => {
    if (!city) return;
    if (!city.slug) {
      reject(errors, 0, 'city-no-slug', city.name);
    } else if (!travelCities.some((item) => item.slug === city!.slug)) {
      reject(errors, 0, 'city-unknown', city.slug);
    }
    checkPlaces(city, errors);
  };

  /** The note a line ending in `\` breaks, which the next line goes on. */
  let carry: ((text: string) => void) | null = null;

  for (let index = 0; index < lines.length; index += 1) {
    const lineNo = index + 1;
    const line = lines[index] ?? '';
    const trimmed = line.trim();
    // A Markdown hard break: `\` at the end, the note goes on in the next line.
    const hard = trimmed.endsWith('\\');
    const body = hard ? trimmed.slice(0, -1).trimEnd() : trimmed;
    // A heading still starts a day or city, as in CommonMark: a stray `\` never eats one.
    if (carry && trimmed && !trimmed.startsWith('#')) {
      carry(body);
      if (!hard) carry = null;
      continue;
    }
    carry = null;
    if (!trimmed) continue;

    if (trimmed.startsWith('### ')) {
      if (!city) {
        reject(errors, lineNo, 'day-outside-city');
        continue;
      }
      day = { title: trimmed.slice(4).trim(), line: lineNo, stops: [], notes: [] };
      city.days.push(day);
      continue;
    }

    if (trimmed.startsWith('## ')) {
      closeCity();
      city = { slug: '', name: trimmed.slice(3).trim(), days: [] };
      day = null;
      cities.push(city);
      continue;
    }

    if (trimmed.startsWith('# ')) {
      if (!sawH1) title = trimmed.slice(2).trim() || id;
      sawH1 = true;
      continue;
    }

    const cityMatch = trimmed.match(CITY_LINE);
    if (cityMatch && city && !day) {
      city.slug = cityMatch[1] ?? '';
      continue;
    }

    const datesMatch = trimmed.match(DATES_LINE);
    if (datesMatch && city && !day) {
      city.dates = { start: datesMatch[1] ?? '', end: datesMatch[2] ?? '' };
      continue;
    }

    const headerVia = trimmed.match(CITY_VIA);
    if (headerVia && city && !day) {
      const detail = (headerVia[1] ?? '').trim();
      if (!detail) {
        reject(errors, lineNo, 'via-empty');
        continue;
      }
      if (city.leg) {
        reject(errors, lineNo, 'via-duplicate');
        continue;
      }
      city.leg = readLeg(detail, lineNo, errors);
      continue;
    }

    // Like `city:`, the target stays in the file: it is not a paragraph and the document does not draw it.
    const headerBudget = trimmed.match(CITY_BUDGET);
    if (headerBudget && city && !day) {
      const detail = (headerBudget[1] ?? '').trim();
      const target = parseBudget(detail);
      if (!target) reject(errors, lineNo, 'budget-empty');
      else if (city.budget) reject(errors, lineNo, 'budget-twice');
      else city.budget = { ...target, detail };
      continue;
    }

    const periods = /^[ \t]+- períodos fechados:[ \t]*(.*)$/.exec(line);
    if (periods && day && !day.stops.length) {
      const names: Record<string, Period> = { manhã: 'morning', tarde: 'afternoon', noite: 'evening' };
      day.closedPeriods = periods[1]!.split(',').flatMap((name) => names[name.trim()] ? [names[name.trim()]!] : []);
      continue;
    }
    const status = /^[ \t]+- status: (fechado|a confirmar|confirmado)\s*$/.exec(line);
    if (status && day) {
      const stop = day.stops.at(-1);
      if (stop && (status[1] === 'a confirmar' || status[1] === 'confirmado')) { stop.status = status[1]; continue; }
      if (!stop && status[1] === 'fechado') { day.status = 'fechado'; continue; }
    }

    const food = /^[ \t]+- comida:[ \t]*(.*)$/.exec(line);
    if (food) {
      const stop = day?.stops.at(-1);
      const amount = /^€\s?(\d+(?:[.,]\d{1,2})?)\s*$/.exec(food[1] ?? '');
      if (!stop?.placeId || stop.listNote || !amount || stop.foodEur !== undefined || !Number.isFinite(euros(amount[1]!))) {
        reject(errors, lineNo, 'food-invalid');
      } else stop.foodEur = euros(amount[1]!);
      continue;
    }

    const departure = /^[ \t]+- saída:[ \t]*(.*)$/.exec(line);
    if (departure) {
      const stop = day?.stops.at(-1);
      if (stop && !stop.listNote && /^([01]\d|2[0-3]):[0-5]\d$/.test(departure[1] ?? '')) stop.departureTime = departure[1];
      else reject(errors, lineNo, 'boarding-invalid');
      continue;
    }
    const boarding = /^[ \t]+- embarque:[ \t]*(.*)$/.exec(line);
    if (boarding) {
      const stop = day?.stops.at(-1);
      const match = /^(\d{4}-\d{2}-\d{2}) · (.+?) · (.+?) → (.+?) · ([0-2]\d:[0-5]\d) → ([0-2]\d:[0-5]\d)$/.exec(boarding[1] ?? '');
      if (!stop || stop.listNote || !match || !isoParts(match[1]!) || Number(match[5]!.slice(0, 2)) > 23 || Number(match[6]!.slice(0, 2)) > 23) {
        reject(errors, lineNo, 'boarding-invalid');
      } else {
        (stop.boardings ??= []).push({ date: match[1]!, service: match[2]!, board: match[3]!, exit: match[4]!, departure: match[5]!, arrival: match[6]! });
      }
      continue;
    }

    const via = VIA_BULLET.exec(line);
    if (via) {
      if (!day) {
        reject(errors, lineNo, 'via-outside-day');
        continue;
      }
      const stop = day.stops[day.stops.length - 1];
      const detail = (via[1] ?? '').trim();
      if (!stop) {
        reject(errors, lineNo, 'via-no-stop');
        continue;
      }
      if (!detail) {
        reject(errors, lineNo, 'via-empty');
        continue;
      }
      if (stop.leg) {
        reject(errors, lineNo, 'via-duplicate');
        continue;
      }
      stop.leg = readLeg(detail, lineNo, errors);
      continue;
    }

    // A comment asks the LLM for something; a decision is what the user settled. Both hang on the item above.
    const comment = COMMENT_BULLET.exec(line);
    const aside = comment ?? DECISION_BULLET.exec(line);
    if (aside) {
      const stop = day?.stops[day.stops.length - 1];
      const tail = (aside[1] ?? '').trim();
      const entry = { text: hard ? tail.slice(0, -1).trimEnd() : tail, line: lineNo };
      if (!stop) reject(errors, lineNo, comment ? 'comment-no-stop' : 'decision-no-stop');
      else if (entry.text) {
        (comment ? (stop.comments ??= []) : (stop.decisions ??= [])).push(entry);
        if (hard) carry = (more) => (entry.text += `\n${more}`);
      }
      continue;
    }

    if (trimmed.startsWith('- ')) {
      if (!day) {
        reject(errors, lineNo, 'stop-outside-day');
        continue;
      }
      const stop: TripStop = { ...parseStop(body.slice(2), lineNo, errors), line: lineNo };
      day.stops.push(stop);
      if (hard) {
        carry = (more) => {
          if (stop.listNote) stop.label += `\n${more}`;
          else stop.note = stop.note ? `${stop.note}\n${more}` : more;
        };
      }
      continue;
    }

    if (day) {
      const note = { text: body, line: lineNo };
      day.notes.push(note);
      if (hard) carry = (more) => (note.text += `\n${more}`);
      continue;
    }

    reject(errors, lineNo, 'line-outside-day');
  }

  closeCity();
  if (!sawH1) reject(errors, 1, 'no-title');

  return { id, file, title, cities, errors };
}

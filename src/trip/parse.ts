import { getTravelCity, travelCities } from '../catalog';

export type TripLegMode = 'walk' | 'transit' | 'taxi' | 'flight';

export type TripLeg = {
  /** Author text after `via:`. Export writes it back unchanged. */
  detail: string;
  mode?: TripLegMode;
  /**
   * Minutes. `N h` is N×60. `3h10` and `1 h 30 min` are one span (190 and 90).
   * Absent unless the line has exactly one duration.
   */
  durationMin?: number;
};

export type TripStop = {
  time?: string;
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
};

/** One line of the file: its text and 1-based number. */
export type TripLine = { text: string; line: number };

export type TripDay = {
  title: string;
  stops: TripStop[];
  notes: TripLine[];
};

export type TripCity = {
  slug: string;
  name: string;
  dates?: { start: string; end: string };
  /** Departure to the next city. The header line `via:`, not a stop leg. */
  leg?: TripLeg;
  days: TripDay[];
};

export type TripErrorCode =
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
const COMMENT_BULLET = /^[ \t]+-[ \t]+(?:comentário|comentario|comment):[ \t]*(.*)$/i;
// `3h10` is glued. `1 h 30 min` needs the `min`. `1 h 2 h` stays two spans.
const DURATION_TOKEN =
  /(?<![a-z0-9])(?:(\d+)\s*h\s*(\d{1,2})\s*min|(\d+)h(\d{1,2})|(\d+)\s?(min|h))(?![a-z0-9])/gi;

const MODE_WORDS: { mode: TripLegMode; words: string[] }[] = [
  { mode: 'walk', words: ['a pe', 'walk'] },
  { mode: 'transit', words: ['metro', 'rer', 'trem', 'train', 'onibus', 'bus', 'tram', 'ferry'] },
  { mode: 'taxi', words: ['taxi', 'uber', 'carro', 'car'] },
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

function readLeg(detail: string, line: number, errors: TripError[]): TripLeg {
  const mode = legMode(detail);
  if (!mode) reject(errors, line, 'via-no-mode');
  const matches = durationList(detail);
  let durationMin: number | undefined;
  if (matches.length === 1) durationMin = matches[0];
  else reject(errors, line, matches.length === 0 ? 'via-no-duration' : 'via-many-durations');
  return {
    detail,
    ...(mode ? { mode } : {}),
    ...(durationMin !== undefined ? { durationMin } : {}),
  };
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
  const known = getTravelCity(city.slug);
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

  for (let index = 0; index < lines.length; index += 1) {
    const lineNo = index + 1;
    const line = lines[index] ?? '';
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('### ')) {
      if (!city) {
        reject(errors, lineNo, 'day-outside-city');
        continue;
      }
      day = { title: trimmed.slice(4).trim(), stops: [], notes: [] };
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

    const comment = COMMENT_BULLET.exec(line);
    if (comment) {
      const stop = day?.stops[day.stops.length - 1];
      const text = (comment[1] ?? '').trim();
      if (!stop) reject(errors, lineNo, 'comment-no-stop');
      else if (text) (stop.comments ??= []).push({ text, line: lineNo });
      continue;
    }

    if (trimmed.startsWith('- ')) {
      if (!day) {
        reject(errors, lineNo, 'stop-outside-day');
        continue;
      }
      day.stops.push({ ...parseStop(trimmed.slice(2), lineNo, errors), line: lineNo });
      continue;
    }

    if (day) {
      day.notes.push({ text: trimmed, line: lineNo });
      continue;
    }

    reject(errors, lineNo, 'line-outside-day');
  }

  closeCity();
  if (!sawH1) reject(errors, 1, 'no-title');

  return { id, file, title, cities, errors };
}

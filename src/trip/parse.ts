import { getTravelCity, travelCities } from '../catalog';

export type TripLegMode = 'walk' | 'transit' | 'taxi' | 'flight';

export type TripLeg = {
  /** Author text after `via:`. Export writes it back unchanged. */
  detail: string;
  mode?: TripLegMode;
  /** Minutes. `N h` is N×60. Absent unless the line has exactly one duration token. */
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
};

export type TripDay = {
  title: string;
  stops: TripStop[];
  notes: string[];
};

export type TripCity = {
  slug: string;
  name: string;
  dates?: { start: string; end: string };
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
// `N h` → N×60 min. `3h10` does not match: `h` must not be followed by a letter or digit.
const DURATION_TOKEN = /(?<![a-z0-9])(\d+)\s?(min|h)(?![a-z0-9])/gi;

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

function readLeg(detail: string, line: number, errors: TripError[]): TripLeg {
  const mode = legMode(detail);
  if (!mode) reject(errors, line, 'via-no-mode');
  const matches = [...detail.matchAll(new RegExp(DURATION_TOKEN.source, 'gi'))];
  let durationMin: number | undefined;
  if (matches.length === 1) {
    const amount = Number(matches[0]?.[1]);
    durationMin = (matches[0]?.[2] ?? '').toLowerCase() === 'h' ? amount * 60 : amount;
  } else {
    reject(errors, line, matches.length === 0 ? 'via-no-duration' : 'via-many-durations');
  }
  return {
    detail,
    ...(mode ? { mode } : {}),
    ...(durationMin !== undefined ? { durationMin } : {}),
  };
}

function parseStop(text: string, line: number, errors: TripError[]): TripStop {
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

function checkPlaces(city: TripCity, errors: TripError[], lineOf: Map<TripStop, number>) {
  if (!city.slug) return;
  const known = getTravelCity(city.slug);
  if (!known) return;
  for (const day of city.days) {
    for (const stop of day.stops) {
      if (!stop.placeId) continue;
      if (!known.places.some((place) => place.id === stop.placeId)) {
        reject(errors, lineOf.get(stop) ?? 0, 'place-missing', stop.placeId);
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
  const lineOf = new Map<TripStop, number>();

  const closeCity = () => {
    if (!city) return;
    if (!city.slug) {
      reject(errors, 0, 'city-no-slug', city.name);
    } else if (!travelCities.some((item) => item.slug === city!.slug)) {
      reject(errors, 0, 'city-unknown', city.slug);
    }
    checkPlaces(city, errors, lineOf);
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

    if (trimmed.startsWith('- ')) {
      if (!day) {
        reject(errors, lineNo, 'stop-outside-day');
        continue;
      }
      const stop = parseStop(trimmed.slice(2), lineNo, errors);
      lineOf.set(stop, lineNo);
      day.stops.push(stop);
      continue;
    }

    if (day) {
      day.notes.push(trimmed);
      continue;
    }

    reject(errors, lineNo, 'line-outside-day');
  }

  closeCity();
  if (!sawH1) reject(errors, 1, 'no-title');

  return { id, file, title, cities, errors };
}

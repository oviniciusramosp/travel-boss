import { getTravelCity, travelCities } from '../catalog';

export type TripStop = {
  time?: string;
  label: string;
  placeId?: string;
  href?: string;
  note?: string;
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

export type TripError = { line: number; message: string };

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

function parseStop(text: string, line: number, errors: TripError[]): TripStop {
  let rest = text.trim();
  let time: string | undefined;
  const timed = rest.match(TIME_PREFIX);
  if (timed) {
    time = timed[1];
    rest = rest.slice(timed[0].length);
  }

  const linked = rest.match(/^\[([^\]]+)\]\(([^)]+)\)(?:\s*(?:—|-)\s*(.*))?$/);
  if (!linked) {
    errors.push({ line, message: 'item sem link' });
    return { time, label: rest };
  }

  const label = linked[1].trim();
  const target = linked[2].trim();
  const note = linked[3]?.trim() || undefined;

  if (target.startsWith('place:')) {
    const placeId = target.slice('place:'.length).trim();
    if (!placeId) errors.push({ line, message: 'link place: sem id' });
    return { time, label, placeId: placeId || undefined, note };
  }

  if (/^https?:\/\//.test(target)) return { time, label, href: target, note };

  errors.push({ line, message: `link inválido: ${target}` });
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
        errors.push({
          line: lineOf.get(stop) ?? 0,
          message: `lugar não encontrado: ${stop.placeId}`,
        });
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
      errors.push({ line: 0, message: `cidade sem slug: ${city.name}` });
    } else if (!travelCities.some((item) => item.slug === city!.slug)) {
      errors.push({ line: 0, message: `cidade desconhecida: ${city.slug}` });
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
        errors.push({ line: lineNo, message: 'dia fora de uma cidade' });
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

    if (trimmed.startsWith('- ')) {
      if (!day) {
        errors.push({ line: lineNo, message: 'parada fora de um dia' });
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

    errors.push({ line: lineNo, message: 'linha fora de um dia' });
  }

  closeCity();
  if (!sawH1) errors.push({ line: 1, message: 'documento sem título' });

  return { id, file, title, cities, errors };
}

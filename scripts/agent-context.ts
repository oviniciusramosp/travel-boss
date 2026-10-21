import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { travelCities, resolveVisit, type TravelPlace } from '../src/catalog';
import { dateCityNames, scheduleDays, tripDates } from '../src/trip/calendar';
import { shiftIso } from '../src/trip/dates';
import { dateBudget, dayPeriods, noPurchase, overBudget, periodSections, seenFromOutside, withSubPointPlaces } from '../src/trip/day-plan';
import { departureTimes } from '../src/trip/departures';
import { luggageStops } from '../src/trip/luggage';
import { legLabel, parseTrip, type Trip, type TripStop } from '../src/trip/parse';
import { accessHop, dateStops, transferLegs, type DateStop } from '../src/trip/route';
import { resolveTripLeg } from '../src/trip/legs';
import { closedPeriods, isDayClosed, isTentative } from '../src/trip/status';
import { attachSubPointNotes, walkOrder } from '../src/trip/subpoints';
import { tripBlocks } from './agent-blocks';
import { AgentError, readTrip, revisionOf } from './agent-service';

export type ContextOptions = { includeRaw?: boolean; placeEdits?: Record<string, Record<string, unknown>> };
const catalog = new Map(travelCities.flatMap(city => city.places.map(place => [place.id, { place, city: city.slug }] as const)));
const stopOf = (row: DateStop) => row.dated.day.stops[row.stopIndex]!;
function liveEdits(): Record<string, Record<string, unknown>> {
  const file = resolve('src/data/travel-place-edits.json');
  if (!existsSync(file)) return {};
  try {
    const value = JSON.parse(readFileSync(file, 'utf8'));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw Error();
    return value;
  }
  catch { throw new AgentError('Invalid live place edits', 422); }
}
function compactPlace(place: TravelPlace, edits: ReturnType<typeof liveEdits>) {
  const { id, name, category, subcategories, description, address, mapsUrl, mapsQuery, lat, lng,
    favorite, rating, googleRating, aiSuggested, aiReason, subPoints } = place;
  return { id, city: catalog.get(id)?.city, name, category, subcategories, description, address, mapsUrl, mapsQuery, lat, lng,
    favorite, rating, googleRating, aiSuggested, aiReason, visit: resolveVisit(id, place.visit),
    subPoints: subPoints?.map(({ photo: _photo, ...sub }) => sub),
    ...Object.fromEntries(['favorite', 'rating', 'googleRating'].flatMap(key => {
      const value = edits[id]?.[key];
      return value === null ? [[key, undefined]] : typeof value === (key === 'favorite' ? 'boolean' : 'number') ? [[key, value]] : [];
    })) };
}
function lodgingState(trip: Trip, first: DateStop, last: DateStop) {
  const incoming: TripStop = { label: '', line: -1, listNote: true };
  const outgoing: TripStop = { label: '', line: -2, listNote: true };
  const clone: Trip = { ...trip, cities: trip.cities.map(city => ({ ...city, days: city.days.map(day => ({ ...day,
    stops: [...(day === first.dated.day ? [incoming] : []), ...day.stops, ...(day === last.dated.day ? [outgoing] : [])],
  })) })) };
  const marked = luggageStops(clone);
  return { marked, incoming: marked.has(incoming), outgoing: marked.has(outgoing) };
}
function stopPoint(rows: readonly DateStop[], at: number, end: boolean) {
  const stop = stopOf(rows[at]!), place = catalog.get(stop.placeId ?? '')?.place;
  if (!place) return undefined;
  const notes: TripStop[] = [];
  for (let i = at + 1; i < rows.length && rows[i]!.dated.date === rows[at]!.dated.date && stopOf(rows[i]!).listNote; i++) notes.push(stopOf(rows[i]!));
  const subs = place.subPoints ?? [];
  const ordered = walkOrder(subs.length, attachSubPointNotes(notes, subs).attached.map(({ note, sub }) => ({ sub, time: note.time })));
  const point = subs[end ? ordered.at(-1)! : ordered[0]!];
  return { id: place.id, lat: point?.lat ?? place.lat, lng: point?.lng ?? place.lng };
}
function transfersFor(rows: readonly DateStop[], date: string) {
  const places = rows.map((row, index) => ({ row, index })).filter(({ row }) => !stopOf(row).listNote && stopOf(row).placeId);
  return places.slice(0, -1).flatMap(({ row, index }, at) => {
    const next = places[at + 1]!;
    if (row.dated.date !== date && next.row.dated.date !== date) return [];
    const from = stopOf(row), to = stopOf(next.row);
    const fromPoint = stopPoint(rows, index, true), toPoint = stopPoint(rows, next.index, false);
    if (!fromPoint || !toPoint) return [];
    const hop = accessHop({ from: fromPoint, to: toPoint, via: row.depart }, catalog.get(from.placeId!)?.place, catalog.get(to.placeId!)?.place);
    const legs = transferLegs(hop);
    const timing = departureTimes(legs, row.dated.date, from.time, row.dated.date === next.row.dated.date ? to.time : undefined, from.boardings, from.departureTime);
    const decision = resolveTripLeg(hop.from, hop.to, hop.via);
    return [{ fromLine: from.line, toLine: to.line, fromId: from.placeId!, toId: to.placeId!, fromDate: row.dated.date, toDate: next.row.dated.date,
      boundary: row.dated.date !== next.row.dated.date, route: decision.kind,
      warnings: [
        ...(!legs.length && from.placeId !== to.placeId ? ['route-duration-unavailable'] : []),
        ...((decision.kind === 'none' && row.depart?.mode === 'transit') || (decision.kind === 'catalog' && decision.leg.mode === 'transit' && !decision.geometry) ? ['route-geometry-unavailable'] : []),
        ...(legs.some((leg, i) => leg.mode === 'transit' && !timing[i]?.verified) ? ['unverified-service'] : []),
      ],
      legs: legs.map((leg, i) => ({ mode: leg.mode, durationMin: leg.durationMin,
        label: 'detail' in leg ? legLabel(leg) : leg.label,
        board: 'board' in leg ? leg.board : undefined, exit: 'exit' in leg ? leg.exit : undefined, timing: timing[i] })),
    }];
  });
}
function budgetFor(rows: readonly DateStop[]) {
  const places = withSubPointPlaces(rows.flatMap(row => { const found = catalog.get(stopOf(row).placeId ?? '')?.place; return found ? [found] : []; }), id => catalog.get(id)?.place);
  const outside = new Set<string>(), inside = new Set<string>(), noFood = new Set<string>(), buying = new Set<string>();
  const food = new Map<string, number>(), ticket = new Map<string, number>();
  for (const row of rows) {
    const stop = stopOf(row); if (!stop.placeId) continue;
    if (stop.foodEur !== undefined) food.set(stop.placeId, stop.foodEur);
    if (stop.ticketEur !== undefined) ticket.set(stop.placeId, stop.ticketEur);
    const text = `${stop.label} ${stop.note ?? ''}`;
    (seenFromOutside(text) ? outside : inside).add(stop.placeId);
    (noPurchase(text) ? noFood : buying).add(stop.placeId);
  }
  inside.forEach(id => outside.delete(id)); buying.forEach(id => noFood.delete(id));
  const fares = rows.flatMap(row => row.depart?.fareEur ? [{ label: legLabel(row.depart), eur: row.depart.fareEur }] : []);
  const budget = dateBudget(places, fares, outside, noFood, food, ticket);
  const target = rows.find(row => !stopOf(row).listNote)?.dated.city.budget?.food;
  return { ...budget, currency: 'EUR' as const, perPerson: true, foodTarget: target, foodOver: overBudget(budget.food, target) };
}

/** Build from the authoritative Markdown; all calculations use the app's pure domain functions. */
export function contextsFromRaw(id: string, raw: string, dates?: readonly string[], options: ContextOptions = {}) {
  const trip = parseTrip(id, `content/trips/${id}.md`, raw);
  const sections = tripDates(trip), allRows = dateStops(scheduleDays(trip)), blocks = tripBlocks(id, raw), edits = options.placeEdits ?? {};
  return sections.filter(section => !dates || dates.includes(section.date)).map(section => {
    const days = section.cities.flatMap(city => city.days), rows = dateStops(days);
    const periods = dayPeriods(rows.map(row => { const stop = stopOf(row); return { ...stop, text: `${stop.label} ${stop.note ?? ''}` }; }));
    const luggage = rows.length ? lodgingState(trip, rows[0]!, rows.at(-1)!) : { incoming: false, outgoing: false, marked: new Set<TripStop>() };
    const dayBlocks = blocks.days.filter(block => days.some(dated => dated.day.line === block.line));
    const reference = (stop: TripStop) => dayBlocks.flatMap(block => block.stops).find(block => block.line === stop.line);
    const attachments = new Map<number, { parentLine: number; parentId: string; index: number; placeId?: string }>();
    rows.forEach((row, i) => {
      const stop = stopOf(row), subs = catalog.get(stop.placeId ?? '')?.place.subPoints;
      if (!subs?.length) return;
      const notes: TripStop[] = [];
      for (let j = i + 1; j < rows.length && stopOf(rows[j]!).listNote; j++) notes.push(stopOf(rows[j]!));
      for (const { note, sub } of attachSubPointNotes(notes, subs).attached) attachments.set(note.line, { parentLine: stop.line, parentId: stop.placeId!, index: sub, placeId: subs[sub]?.placeId });
    });
    const resolved = rows.map((row, i) => {
      const stop = stopOf(row), block = reference(stop);
      return { ...stop, anchor: block?.anchor, revision: block?.revision, city: row.dated.city.slug, dayLine: row.dated.day.line,
        period: periods[i], tentative: isTentative(stop), luggage: luggage.marked.has(stop), depart: row.depart, subPoint: attachments.get(stop.line) };
    });
    const allPlaces = allRows.filter(row => !stopOf(row).listNote && stopOf(row).placeId);
    const before = allPlaces.filter(row => row.dated.date < section.date).at(-1), after = allPlaces.find(row => row.dated.date > section.date);
    const neighbor = (row: DateStop | undefined) => row ? { date: row.dated.date, city: row.dated.city.slug, ...stopOf(row), depart: row.depart } : null;
    const lodging = allPlaces.filter(row => catalog.get(stopOf(row).placeId!)?.place.category === 'lodging');
    const previousStay = lodging.filter(row => row.dated.date < section.date).at(-1), nextStay = lodging.find(row => row.dated.date > section.date);
    const ids = new Set([...resolved.flatMap(stop => stop.placeId ? [stop.placeId] : []), ...[before, after, previousStay, nextStay].flatMap(row => row ? [stopOf(row).placeId!] : [])]);
    for (const placeId of [...ids]) for (const sub of catalog.get(placeId)?.place.subPoints ?? []) if (sub.placeId) ids.add(sub.placeId);
    const places = [...ids].flatMap(placeId => { const found = catalog.get(placeId)?.place; return found ? [compactPlace(found, edits)] : []; });
    return { id, date: section.date, title: trip.title, revision: revisionOf(raw),
      catalogRevision: revisionOf(JSON.stringify(places)), cities: dateCityNames(section, 'pt-BR'),
      days: days.map(({ city, day }) => ({ city: city.slug, title: day.title, line: day.line, notes: day.notes,
        closedPeriods: closedPeriods(day), closed: isDayClosed(day) })),
      blocks: dayBlocks.map(({ raw: blockRaw, stops, ...block }) => ({ ...block, ...(options.includeRaw ? { raw: blockRaw } : {}),
        stops: stops.map(({ raw: stopRaw, ...stop }) => ({ ...stop, ...(options.includeRaw ? { raw: stopRaw } : {}) })) })),
      rows: resolved, places, budget: budgetFor(rows),
      periods: periodSections(periods).map(part => ({ period: part.period, lines: part.rows.map(i => resolved[i]!.line), from: resolved[part.rows[0]!]!.time })),
      luggage: { incoming: luggage.incoming, outgoing: luggage.outgoing, lines: resolved.filter(stop => stop.luggage).map(stop => stop.line) },
      neighbors: { previous: neighbor(before), next: neighbor(after) },
      lodging: { previous: neighbor(previousStay), current: resolved.filter(stop => catalog.get(stop.placeId ?? '')?.place.category === 'lodging'), next: neighbor(nextStay) },
      transfers: transfersFor(allRows, section.date), errors: trip.errors.filter(error => dayBlocks.some(block => error.line >= block.line && error.line <= block.endLine) || error.line === 0),
      warnings: [
        ...(scheduleDays(trip).length < trip.cities.flatMap(city => city.days).length ? ['some-days-have-no-calendar-date'] : []),
        'catalog-prices-and-durations-are-estimates', 'walking-routes-and-live-opening-hours-not-fetched',
      ],
    };
  });
}
export function contextFromRaw(id: string, raw: string, date: string, options: ContextOptions = {}) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || shiftIso(date, 0) !== date) throw new AgentError('Invalid ISO date');
  const context = contextsFromRaw(id, raw, [date], options)[0];
  if (!context) throw new AgentError('Date not found; use a scheduled ISO date', 404);
  return context;
}
export function getDateContext(id: string, date: string, options: ContextOptions = {}) {
  return contextFromRaw(id, readTrip(id).raw, date, { ...options, placeEdits: liveEdits() });
}

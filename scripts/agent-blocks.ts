import { createHash } from 'node:crypto';
import { parseTrip, type TripLeg } from '../src/trip/parse';
import { scheduleDays } from '../src/trip/calendar';
import { luggageStops } from '../src/trip/luggage';

export const blockRevision = (raw: string) => createHash('sha256').update(raw).digest('hex');
export type BlockGuard = { anchor: string; revision: string; scope?: string };
export type StopBlock = BlockGuard & { line: number; endLine: number; raw: string; dayAnchor: string };
export type DayBlock = BlockGuard & {
  line: number; endLine: number; raw: string; city: string; date?: string;
  stops: StopBlock[]; guards: BlockGuard[];
};

/** Addresses use semantic identity, never mutable line numbers or note/time text. */
export function tripBlocks(id: string, raw: string): { days: DayBlock[] } {
  const trip = parseTrip(id, '', raw), lines = raw.split(/\r?\n/);
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const dates = new Map(scheduleDays(trip).map(item => [item.day.line, item.date]));
  const occurrences = new Map<string, number>();
  const address = (kind: string, key: string) => {
    const count = (occurrences.get(key) ?? 0) + 1; occurrences.set(key, count);
    return `${kind}:${blockRevision(key).slice(0, 24)}:${count}`;
  };
  const days: DayBlock[] = trip.cities.flatMap(city => city.days.flatMap(day => {
    if (!day.line) return [];
    const start = day.line - 1;
    let end = start + 1;
    while (end < lines.length && !/^#{1,3} /.test(lines[end]!)) end++;
    const date = dates.get(day.line);
    const anchor = address('day', JSON.stringify([city.slug, date, day.title]));
    const text = lines.slice(start, end).join(eol);
    const stops = day.stops.map((stop, index) => {
      let stopEnd = (day.stops[index + 1]?.line ?? end + 1) - 1;
      while (stopEnd > stop.line && !lines[stopEnd - 1]?.trim()) stopEnd--;
      const text = lines.slice(stop.line - 1, stopEnd).join(eol);
      return { anchor: address('stop', JSON.stringify([anchor, stop.placeId ?? stop.href ?? stop.label])),
        revision: blockRevision(text), line: stop.line, endLine: stopEnd, raw: text, dayAnchor: anchor };
    });
    return [{ anchor, revision: blockRevision(text), line: day.line, endLine: end, raw: text,
      city: city.slug, date, stops, guards: [] }];
  }));
  // Calendar topology and city metadata can change date allocation and spending.
  const topology = lines.filter((line, index) => !days.some(day => index >= day.line && index < day.endLine));
  // Insert inert probes in one temporary parse. This runs the exact app luggage
  // state machine once, rather than reparsing every preceding day separately.
  const probeLines = [...lines];
  for (const day of [...days].reverse()) probeLines.splice(day.line, 0, '- [Agent luggage probe](https://example.invalid)');
  const probeTrip = parseTrip(id, '', probeLines.join(eol)), marked = luggageStops(probeTrip);
  const probePositions = new Map(days.map((day, index) => [day.line + index + 1, day.anchor]));
  const incoming = new Map(probeTrip.cities.flatMap(city => city.days).flatMap(day => day.stops)
    .flatMap(stop => probePositions.has(stop.line) ? [[probePositions.get(stop.line)!, marked.has(stop)] as const] : []));
  const endpoints = trip.cities.flatMap(city => city.days.flatMap(day => day.stops.filter(stop => !stop.listNote).map(stop => ({
    stop, city: city.slug,
    depart: stop.leg ?? (day === city.days.at(-1) && stop === day.stops.filter(item => !item.listNote).at(-1) ? city.leg : undefined),
  }))));
  const legState = (leg?: TripLeg): unknown => leg ? { head: leg.detail.split(' — ')[0], mode: leg.mode,
    durationMin: leg.durationMin, fareEur: leg.fareEur, access: legState(leg.access) } : null;
  const endpointState = (row: typeof endpoints[number] | undefined) => row ? {
    city: row.city, place: row.stop.placeId ?? row.stop.href, time: row.stop.time,
    departureTime: row.stop.departureTime, boardings: row.stop.boardings, leg: legState(row.depart),
  } : null;
  for (const day of days) {
    const peers = days.filter(candidate => candidate.anchor === day.anchor || (day.date && candidate.date === day.date));
    const firstLine = Math.min(...peers.map(peer => peer.line)), endLine = Math.max(...peers.map(peer => peer.endLine));
    const previous = endpoints.filter(row => row.stop.line < firstLine).at(-1);
    const next = endpoints.find(row => row.stop.line > endLine);
    day.guards = [
      ...peers
        .map(candidate => ({ anchor: candidate.anchor, revision: candidate.revision, scope: 'date-content' })),
      { anchor: `context:${day.anchor}`, revision: blockRevision(JSON.stringify([topology, day.date, incoming.get(day.anchor) ?? false])), scope: 'calendar-budget-incoming-luggage' },
      { anchor: `boundary:${day.anchor}`, revision: blockRevision(JSON.stringify([endpointState(previous), endpointState(next)])), scope: 'adjacent-transport' },
    ];
  }
  return { days };
}

export const describeTripBlocks = tripBlocks;

import { describe, expect, it } from 'vitest';
import { expandTimelineTransferParts, formatLegDuration, type ItineraryLegDef } from './travel-itinerary-legs';

it('does not add access walks when the two stops already are the railway endpoints', () => {
  const leg: ItineraryLegDef = { from: 'a', to: 'b', mode: 'transit', stationCount: 2, path: [[44, 9], [44, 10]] };
  expect(expandTimelineTransferParts(leg, { lat: 44, lng: 9 }, { lat: 44, lng: 10 }).map(part => part.mode)).toEqual(['transit']);
});

it('does not invent station access for transit with no known geometry or line', () => {
  const leg: ItineraryLegDef = { from: 'a', to: 'b', mode: 'transit' };
  expect(expandTimelineTransferParts(leg, { lat: 44, lng: 9 }, { lat: 44, lng: 10 }).map(part => part.mode)).toEqual(['transit']);
});

it.each([false, true])('uses checked access walks without changing the train duration (hops=%s)', (hops) => {
  const path: [number, number][] = [[44, 9], [44, 10]];
  const leg: ItineraryLegDef = { from: 'a', to: 'b', mode: 'transit', durationMin: 3,
    ...(hops ? { hops: [{ line: 'rome-a', path }] } : { path }) };
  const from = { lat: 44.001, lng: 9 };
  const to = { lat: 44.001, lng: 10 };
  const estimated = expandTimelineTransferParts(leg, from, to);
  const checked = expandTimelineTransferParts({ ...leg, walkInMin: 5, walkOutMin: 7 }, from, to);
  expect(checked.filter(part => part.mode === 'walk').map(part => part.durationMin)).toEqual([5, 7]);
  expect(checked.filter(part => part.mode === 'transit')).toEqual(estimated.filter(part => part.mode === 'transit')
    .map(part => ({ ...part, leg: checked[0]!.leg })));
  expect(expandTimelineTransferParts({ ...leg, walkInMin: 5 }, pathPoint(path[0]!), pathPoint(path[1]!))
    .map(part => part.mode)).toEqual(['transit']);
});

function pathPoint([lat, lng]: [number, number]) { return { lat, lng }; }

describe('formatLegDuration', () => {
  it.each([
    [12, '~12 min'],
    [59, '~59 min'],
    [59.6, '~1h'],
    [60, '~1h'],
    [65, '~1h05'],
    [95, '~1h35'],
    [397, '~6h37'],
  ])('reads %s min as %s in both locales', (min, text) => {
    expect(formatLegDuration(min)).toEqual({ en: text, 'pt-BR': text });
  });
});

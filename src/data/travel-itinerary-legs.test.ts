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

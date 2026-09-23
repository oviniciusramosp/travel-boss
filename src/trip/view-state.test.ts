import { describe, expect, it } from 'vitest';
import { activeSectionKey, cityInOsrmScope, dayKey, dayOpen, shouldRefit, stopKey } from './view-state';

describe('dayOpen', () => {
  const key = dayKey('paris', 1, 'Dia 2 — Oeste');

  it('opens only the first day on the first paint', () => {
    expect(dayOpen(true, key, new Set([key]), 0)).toBe(true);
    expect(dayOpen(true, key, new Set([key]), 1)).toBe(false);
  });

  it('restores the snapshot after the first paint', () => {
    expect(dayOpen(false, key, new Set([key]), 1)).toBe(true);
    expect(dayOpen(false, dayKey('paris', 0, 'Dia 1'), new Set([key]), 0)).toBe(false);
  });
});

describe('cityInOsrmScope', () => {
  const visible = new Set(['paris']);

  it('asks only for open days of the focused city', () => {
    expect(cityInOsrmScope('paris', true, { activeCity: 'paris', visible })).toBe(true);
    expect(cityInOsrmScope('milao', true, { activeCity: 'paris', visible })).toBe(false);
    expect(cityInOsrmScope('paris', false, { activeCity: 'paris', visible })).toBe(false);
  });

  it('uses the cities on screen when none is focused', () => {
    expect(cityInOsrmScope('paris', true, { activeCity: null, visible })).toBe(true);
    expect(cityInOsrmScope('roma', true, { activeCity: null, visible })).toBe(false);
    expect(cityInOsrmScope('paris', false, { activeCity: null, visible })).toBe(false);
  });
});

describe('stopKey', () => {
  it('uses the place id, or the label when there is no id', () => {
    expect(stopKey('paris', 0, 'Dia 1', 2, 'par-louvre', 'Louvre')).toBe(
      'paris:0:Dia 1:2:par-louvre',
    );
    expect(stopKey('paris', 0, 'Dia 1', 3, undefined, 'Nota')).toBe('paris:0:Dia 1:3:Nota');
  });
});

describe('activeSectionKey', () => {
  it('keeps the section that still covers the top edge', () => {
    expect(
      activeSectionKey([
        { key: 'paris', top: -400, height: 800, ratio: 0.5 },
        { key: 'milao', top: 400, height: 500, ratio: 0.2 },
      ]),
    ).toBe('paris');
    expect(
      activeSectionKey([
        { key: 'paris', top: -20, height: 400, ratio: 0.4 },
        { key: 'milao', top: -4, height: 500, ratio: 0.9 },
      ]),
    ).toBe('milao');
    expect(
      activeSectionKey([
        { key: 'paris', top: -800, height: 400, ratio: 0 },
        { key: 'milao', top: 80, height: 200, ratio: 1 },
        { key: 'roma', top: 40, height: 200, ratio: 1 },
      ]),
    ).toBe('roma');
    expect(activeSectionKey([])).toBeNull();
  });
});

describe('shouldRefit', () => {
  const here = { id: 'a', lat: 1, lng: 2 };
  const away = { id: 'b', lat: 3, lng: 4 };
  const inView = (lat: number) => lat === 1;

  it('fits the first paint only when there are pins', () => {
    expect(shouldRefit(true, [], new Set(), inView)).toBe(false);
    expect(shouldRefit(true, [here], new Set(), inView)).toBe(true);
  });

  it('skips a live save unless a new pin is outside the view', () => {
    expect(shouldRefit(false, [here], new Set(['a']), inView)).toBe(false);
    expect(shouldRefit(false, [here, away], new Set(['a']), inView)).toBe(true);
    expect(shouldRefit(false, [here, { ...away, id: 'c', lat: 1 }], new Set(['a']), inView)).toBe(
      false,
    );
  });
});

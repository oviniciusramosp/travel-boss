import { describe, expect, it } from 'vitest';
import { dayKey, dayOpen, shouldRefit, stopKey } from './view-state';

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

describe('stopKey', () => {
  it('uses the place id, or the label when there is no id', () => {
    expect(stopKey('paris', 0, 'Dia 1', 2, 'par-louvre', 'Louvre')).toBe(
      'paris:0:Dia 1:2:par-louvre',
    );
    expect(stopKey('paris', 0, 'Dia 1', 3, undefined, 'Nota')).toBe('paris:0:Dia 1:3:Nota');
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

import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  clearOpenNowCache,
  fetchOpeningHours,
  isOpenFromOsmHours,
  openNowStatus,
  timeZoneForCity,
  zonedClock,
} from './open-now';

afterEach(() => clearOpenNowCache());

describe('opening hours', () => {
  it('reads the common OSM patterns', () => {
    expect(isOpenFromOsmHours('24/7', 1, 3, 0)).toBe(true);
    expect(isOpenFromOsmHours('', 1, 10, 0)).toBeNull();
    expect(isOpenFromOsmHours('unknown', 1, 10, 0)).toBeNull();
    expect(isOpenFromOsmHours('Mo-Fr 09:00-18:00', 1, 10, 0)).toBe(true);
    expect(isOpenFromOsmHours('Mo-Fr 09:00-18:00', 1, 8, 0)).toBe(false);
    expect(isOpenFromOsmHours('Mo-Fr 09:00-18:00', 1, 18, 0)).toBe(false);
    expect(isOpenFromOsmHours('Mo-Fr 09:00-18:00', 0, 10, 0)).toBeNull();
    expect(isOpenFromOsmHours('Mo off', 1, 12, 0)).toBe(false);
    expect(isOpenFromOsmHours('Mo 22:00-02:00', 1, 23, 0)).toBe(true);
    expect(isOpenFromOsmHours('Mo 22:00-02:00', 1, 1, 0)).toBe(true);
    expect(isOpenFromOsmHours('sunrise-sunset', 1, 12, 0)).toBeNull();
  });

  it('uses the city zone and caches a successful lookup for the session', async () => {
    expect(zonedClock(new Date('2026-01-15T12:00:00Z'), 'Europe/Paris')).toEqual({
      day: 4,
      hour: 13,
      minute: 0,
    });
    expect(timeZoneForCity('roma')).toBe('Europe/Rome');
    expect(timeZoneForCity('elsewhere')).toBe('Europe/Paris');

    const fetcher = vi.fn(async () => ({
      ok: true,
      json: async () => ({ elements: [{ tags: { opening_hours: '24/7' } }] }),
    })) as unknown as typeof fetch;
    await expect(fetchOpeningHours('way/1', fetcher)).resolves.toBe('24/7');
    await expect(fetchOpeningHours('way/1', fetcher)).resolves.toBe('24/7');
    expect(fetcher).toHaveBeenCalledOnce();
    await expect(openNowStatus('nope', 'Europe/Paris', new Date(), fetcher)).resolves.toBe('unknown');
    await expect(openNowStatus('way/1', 'Europe/Paris', new Date(), fetcher)).resolves.toBe('open');
  });
});
import { afterEach, describe, expect, it, vi } from 'vitest';
import { forgetTrip, readTrip, readTripView, writeTrip, writeTripView } from './session';
import { parseTrip } from './parse';

afterEach(() => vi.unstubAllGlobals());

describe('saved trip', () => {
  function storage() {
    const data = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    });
    return data;
  }
  const source = { id: 'europa', file: 'content/trips/europa.md', raw: '# Europa\n\n## Paris\ncity: paris\n\n### Dia 1 — Chegada\n' };

  it('restores the parsed document and last trip; a changed source replaces it', () => {
    storage();
    writeTrip(source, parseTrip(source.id, source.file, source.raw));
    expect(readTrip()?.trip.title).toBe('Europa');
    const updated = { ...source, raw: '# Viagem atualizada' };
    writeTrip(updated, parseTrip(updated.id, updated.file, updated.raw));
    expect(readTrip('europa')?.trip.title).toBe('Viagem atualizada');
    forgetTrip('europa');
    expect(readTrip()).toBeNull();
  });

  it('rejects corrupt, incompatible, or mismatched snapshots', () => {
    const data = storage();
    writeTrip(source, parseTrip(source.id, source.file, source.raw));
    const saved = JSON.parse(data.get('tb:trip:europa')!);
    for (const value of ['{', JSON.stringify({ ...saved, version: 'old-build' }),
      JSON.stringify({ ...saved, trip: { ...saved.trip, cities: null } }),
      JSON.stringify({ ...saved, trip: { ...saved.trip, cities: [null] } }),
      JSON.stringify({ ...saved, source: { ...source, id: 'other' } })]) {
      data.set('tb:trip:europa', value);
      expect(readTrip('europa')).toBeNull();
    }
  });

  it('preserves closed days, scroll, selected tab and camera independently for each trip', () => {
    const data = storage();
    const view = { open: [], order: [], hidden: ['2026-10-13'], scroll: 820, tab: 1,
      camera: { lat: 45.5, lng: 9.2, zoom: 13 } };
    writeTripView('europa', view);
    expect(readTripView('europa')).toEqual(view);
    expect(readTripView('other')).toBeNull();
    for (const patch of [{ scroll: -1 }, { open: null }, { tab: 9 },
      { camera: { lat: 100, lng: 9.2, zoom: 13 } }]) {
      data.set('tb:trip-view:europa', JSON.stringify({ ...view, ...patch }));
      expect(readTripView('europa')).toBeNull();
    }
  });

  it('continues without persistence when storage is blocked or full', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => { throw Error('blocked'); },
      setItem: () => { throw Error('quota'); },
    });
    expect(readTrip()).toBeNull();
    expect(() => writeTrip(source, parseTrip(source.id, source.file, source.raw))).not.toThrow();
  });
});

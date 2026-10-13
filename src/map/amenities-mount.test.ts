import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Map as LeafletMap } from 'leaflet';
import { amenityCellBox, amenityCellKey } from './amenity-cells';

const drawn = vi.hoisted(() => ({ created: 0, layers: new Set<unknown>() }));
vi.mock('leaflet', () => ({
  divIcon: (options: unknown) => options,
  layerGroup: () => ({ addTo() { return this; }, clearLayers: () => drawn.layers.clear(), removeLayer: (pin: unknown) => drawn.layers.delete(pin) }),
  marker: () => {
    drawn.created++;
    return { bindTooltip() {}, on() {}, addTo() { drawn.layers.add(this); return this; } };
  },
}));
vi.mock('../ui/icons', () => ({ icon: () => ({ outerHTML: '<svg></svg>' }) }));
vi.mock('../ui/motion', () => ({ cameraMotion: () => ({ animate: false }) }));

let hooks: Map<string, () => void>;
let fetcher: ReturnType<typeof vi.fn>;
let center: { lat: number; lng: number };
let map: LeafletMap;
const key = amenityCellKey(45.44, 10.98), distant = amenityCellKey(41.9, 12.5);
const catalog = { [key]: amenityCellBox(key), [distant]: amenityCellBox(distant) };
const rows = Array.from({ length: 100 }, (_, i) => [45.44 + i * 0.00001, 10.98, i % 2, 2]);
const flush = () => vi.advanceTimersByTimeAsync(200);

beforeEach(() => {
  vi.resetModules(); vi.useFakeTimers();
  drawn.created = 0; drawn.layers.clear(); hooks = new Map(); center = { lat: 45.44, lng: 10.98 };
  vi.stubGlobal('document', Object.assign(new EventTarget(), { documentElement: { lang: 'pt-BR' } }));
  vi.stubGlobal('window', { setTimeout, clearTimeout, open: vi.fn() });
  vi.stubGlobal('MutationObserver', class { observe() {} disconnect() {} });
  fetcher = vi.fn(async (url: string) => ({ ok: true, json: async () => url.endsWith('cells.json') ? catalog : rows }));
  vi.stubGlobal('fetch', fetcher);
  map = {
    on: (event: string, fn: () => void) => hooks.set(event, fn), off: (event: string) => hooks.delete(event),
    getZoom: () => 16, getCenter: () => center,
    getBounds: () => ({ getSouth: () => 38, getWest: () => -10, getNorth: () => 46, getEast: () => 13, contains: () => true }),
  } as unknown as LeafletMap;
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('amenity layer lifecycle', () => {
  it('downloads only relevant tiles, reuses pins/cache, reacts to GPS and clears on stop', async () => {
    const { mountAmenities } = await import('./amenities');
    const { setAmenity } = await import('./amenity-state');
    const layer = mountAmenities(map);
    await flush();
    expect(fetcher).not.toHaveBeenCalled();
    setAmenity('water', true); setAmenity('toilet', true);
    layer.setWalks([[[45.44, 10.98]]]);
    await flush();
    expect(fetcher.mock.calls.map(([url]) => url)).toEqual(['/amenities/cells.json', `/amenities/cells/${key}.json`]);
    expect(drawn.layers.size).toBe(48);
    const created = drawn.created;
    hooks.get('moveend')!(); await flush();
    expect(drawn.created).toBe(created); expect(fetcher).toHaveBeenCalledTimes(2);
    layer.setLocation([41.9, 12.5]); center = { lat: 41.9, lng: 12.5 };
    hooks.get('moveend')!(); await flush();
    expect(fetcher.mock.calls.some(([url]) => url.endsWith(`${distant}.json`))).toBe(true);
    layer.setLocation(null); await flush();
    setAmenity('water', false); setAmenity('toilet', false);
    expect(drawn.layers.size).toBe(0);
    hooks.get('unload')!();
    setAmenity('water', true); await flush();
    expect(drawn.layers.size).toBe(0); expect(hooks.has('moveend')).toBe(false);
  });

  it('ignores a pending response when switched off and shares in-flight requests', async () => {
    const { mountAmenities } = await import('./amenities');
    const { setAmenity } = await import('./amenity-state');
    let resolve!: (value: unknown) => void;
    fetcher.mockImplementation(async (url: string) => ({ ok: true, json: () => url.endsWith('cells.json') ? Promise.resolve(catalog) : new Promise(done => { resolve = done; }) }));
    mountAmenities(map); setAmenity('water', true); await flush();
    hooks.get('moveend')!(); await flush();
    expect(fetcher).toHaveBeenCalledTimes(2);
    setAmenity('water', false); resolve(rows); await flush();
    expect(drawn.layers.size).toBe(0);
  });

  it('retries a failed tile without hiding results from another tile', async () => {
    const { mountAmenities } = await import('./amenities');
    const { setAmenity } = await import('./amenity-state');
    const layer = mountAmenities(map);
    fetcher.mockImplementation(async (url: string) => {
      if (url.endsWith(`${distant}.json`)) throw new Error('offline');
      return { ok: true, json: async () => url.endsWith('cells.json') ? catalog : rows };
    });
    layer.setWalks([[[45.44, 10.98]], [[41.9, 12.5]]]); setAmenity('water', true);
    await flush(); expect(drawn.layers.size).toBe(24);
    hooks.get('moveend')!(); await flush();
    expect(fetcher.mock.calls.filter(([url]) => url.endsWith(`${distant}.json`))).toHaveLength(2);
    expect(drawn.layers.size).toBe(24);
  });
});

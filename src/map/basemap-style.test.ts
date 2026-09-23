import type { FilterSpecification, Map as MaplibreMap } from 'maplibre-gl';
import { describe, expect, it, vi } from 'vitest';
import { applyBrightBasemap, bindBrightBasemap, overlayAlpha } from './basemap-style';

type Paint = Record<string, unknown>;

function fakeMap(layerIds: string[], filters: Record<string, FilterSpecification> = {}) {
  const present = new Set(layerIds);
  const paint = new Map<string, Paint>();
  const layout = new Map<string, Paint>();
  const nextFilters = new Map<string, FilterSpecification>(Object.entries(filters));
  const zooms = new Map<string, [number, number]>();
  const listeners = new Map<string, Set<() => void>>();

  const api = {
    getLayer(id: string) {
      return present.has(id) ? { maxzoom: 24 } : undefined;
    },
    getFilter(id: string) {
      return nextFilters.get(id);
    },
    setFilter(id: string, filter: FilterSpecification) {
      nextFilters.set(id, filter);
    },
    setPaintProperty(id: string, prop: string, value: unknown) {
      const bag = paint.get(id) ?? {};
      bag[prop] = value;
      paint.set(id, bag);
    },
    setLayoutProperty(id: string, prop: string, value: unknown) {
      const bag = layout.get(id) ?? {};
      bag[prop] = value;
      layout.set(id, bag);
    },
    setLayerZoomRange(id: string, minzoom: number, maxzoom: number) {
      zooms.set(id, [minzoom, maxzoom]);
    },
    isStyleLoaded: () => false,
    once(event: string, fn: () => void) {
      const bag = listeners.get(event) ?? new Set();
      bag.add(fn);
      listeners.set(event, bag);
    },
    on(event: string, fn: () => void) {
      const bag = listeners.get(event) ?? new Set();
      bag.add(fn);
      listeners.set(event, bag);
    },
    off(event: string, fn: () => void) {
      listeners.get(event)?.delete(fn);
    },
  };

  return {
    api: api as unknown as MaplibreMap,
    paint,
    layout,
    filters: nextFilters,
    zooms,
    listeners,
  };
}

const BRIGHT_LAYERS = [
  'background',
  'water',
  'water-intermittent',
  'waterway-river',
  'water_name_line_label',
  'park',
  'landcover-wood',
  'landcover-grass',
  'landcover-grass-park',
  'highway-motorway',
  'highway-primary',
  'highway-motorway-casing',
  'highway-primary-casing',
  'landuse-commercial',
  'landuse-hospital',
  'landuse-school',
  'landuse-industrial',
  'landuse-residential',
  'label_city',
  'label_town',
  'label_village',
  'label_other',
  'highway-shield-non-us',
  'highway-shield-us-interstate',
  'road_shield_us',
  'poi_transit',
  'poi_r1',
  'highway-name-major',
];

describe('bright basemap', () => {
  it('paints the portfolio light palette and hides overview clutter', () => {
    const map = fakeMap(BRIGHT_LAYERS, {
      poi_r1: ['all', ['match', ['geometry-type'], ['Point'], true, false]],
    });

    applyBrightBasemap(map.api);

    expect(map.paint.get('background')?.['background-color']).toBe('#f5f5f5');
    expect(map.paint.get('water')).toMatchObject({
      'fill-color': '#c5d9e8',
      'fill-antialias': true,
    });
    expect(map.paint.get('waterway-river')?.['line-color']).toBe('#a8c4d8');
    expect(map.paint.get('water_name_line_label')).toMatchObject({
      'text-color': '#6a8499',
      'text-halo-color': 'rgba(255, 255, 255, 0.9)',
    });
    expect(map.paint.get('park')).toMatchObject({
      'fill-color': '#d5e4d0',
      'fill-opacity': 0.75,
    });
    expect(map.paint.get('landcover-wood')).toMatchObject({
      'fill-color': '#c5d6bc',
      'fill-opacity': 0.45,
    });
    expect(map.paint.get('landcover-grass')?.['fill-color']).toBe('#dce8d6');
    expect(map.paint.get('highway-motorway')?.['line-color']).toBe('#e8e2d8');
    expect(map.paint.get('highway-primary')?.['line-color']).toBe('#f0ebe3');
    expect(map.paint.get('highway-motorway-casing')?.['line-color']).toBe('#d4cfc6');
    expect(map.paint.get('highway-primary-casing')?.['line-color']).toBe('#d4cfc6');
    expect(map.paint.get('landuse-commercial')?.['fill-color']).toBe('hsla(35, 10%, 90%, 0.28)');
    expect(map.paint.get('landuse-school')?.['fill-color']).toBe('hsla(40, 8%, 93%, 0.3)');
    expect(map.paint.get('landuse-residential')?.['fill-color']).toBe('hsla(40, 8%, 92%, 0.35)');
    expect(map.paint.get('label_city')).toMatchObject({
      'text-color': '#7a7e88',
      'text-halo-color': 'rgba(255, 255, 255, 0.92)',
      'text-halo-width': 1.25,
      'text-opacity': 0.82,
    });

    expect(map.layout.get('highway-shield-non-us')?.visibility).toBe('none');
    expect(map.layout.get('road_shield_us')?.visibility).toBe('none');
    expect(map.filters.get('poi_transit')).toEqual([
      'match',
      ['get', 'class'],
      ['airport', 'rail'],
      true,
      false,
    ]);
    expect(map.filters.get('poi_r1')).toEqual([
      'all',
      ['all', ['match', ['geometry-type'], ['Point'], true, false]],
      ['!=', ['get', 'class'], 'bus'],
    ]);
    expect(map.zooms.get('label_town')).toEqual([11.5, 24]);
    expect(map.zooms.get('label_city')).toEqual([9.5, 24]);
    expect(map.zooms.get('label_village')).toEqual([12.5, 24]);
    expect(map.zooms.get('label_other')).toEqual([13.5, 24]);
    expect(map.paint.has('landuse_park')).toBe(false);
  });

  it('does not nest the bus filter when the style paints twice', () => {
    const map = fakeMap(['poi_r1'], {
      poi_r1: ['>=', ['get', 'rank'], 1],
    });
    applyBrightBasemap(map.api);
    applyBrightBasemap(map.api);
    expect(map.filters.get('poi_r1')).toEqual([
      'all',
      ['>=', ['get', 'rank'], 1],
      ['!=', ['get', 'class'], 'bus'],
    ]);
  });

  it('repaints when the vector style loads', () => {
    const map = fakeMap(['water']);
    const unbind = bindBrightBasemap(map.api);
    expect(map.paint.has('water')).toBe(false);
    const styleLoad = [...(map.listeners.get('style.load') ?? [])];
    expect(styleLoad).toHaveLength(1);
    styleLoad[0]?.();
    expect(map.paint.get('water')?.['fill-color']).toBe('#c5d9e8');
    unbind();
    expect(map.listeners.get('style.load')?.size ?? 0).toBe(0);
    expect(map.listeners.get('load')?.size ?? 0).toBe(0);
  });

  it('paints immediately when the style is already loaded', () => {
    const map = fakeMap(['park']);
    vi.spyOn(map.api, 'isStyleLoaded').mockReturnValue(true);
    bindBrightBasemap(map.api);
    expect(map.paint.get('park')?.['fill-color']).toBe('#d5e4d0');
  });

  it('paints the portfolio night tints and leaves bright roads to the dark sheet', () => {
    const map = fakeMap([
      'background',
      'water',
      'waterway',
      'water_name',
      'landuse_park',
      'landcover_wood',
      'park',
      'highway-primary',
    ]);
    applyBrightBasemap(map.api, 'dark');
    expect(overlayAlpha('dark')).toEqual({ area: 0.32, heat: 0.18 });
    expect(overlayAlpha('light')).toEqual({ area: 0.52, heat: 0.22 });
    expect(map.paint.get('background')?.['background-color']).toBe('#111111');
    expect(map.paint.get('water')?.['fill-color']).toBe('#071824');
    expect(map.paint.get('waterway')?.['line-color']).toBe('#0a2233');
    expect(map.paint.get('water_name')).toMatchObject({
      'text-color': 'rgba(110, 140, 165, 0.55)',
      'text-halo-color': 'rgba(7, 24, 36, 0.8)',
    });
    expect(map.paint.get('landuse_park')).toMatchObject({
      'fill-color': '#1f4a32',
      'fill-opacity': 0.16,
    });
    expect(map.paint.get('landcover_wood')).toMatchObject({
      'fill-color': '#1a3d2a',
      'fill-opacity': 0.14,
      'fill-pattern': null,
    });
    expect(map.paint.get('park')?.['fill-opacity']).toBe(0.16);
    expect(map.paint.has('highway-primary')).toBe(false);
  });

  it('swaps the sheet on the same map and retints areas and heatmap', () => {
    const map = fakeMap(['water', 'landuse_park']);
    const urls: string[] = [];
    const area = new Map<string, string>();
    const heat = new Map<string, string>();
    const listeners = new Map<string, Set<(event: Event) => void>>();
    (map.api as unknown as { setStyle: (url: string) => void }).setStyle = (url) => {
      urls.push(url);
      map.listeners.get('style.load')?.forEach((fn) => fn());
    };
    vi.stubGlobal('window', {
      addEventListener(type: string, fn: (event: Event) => void) {
        const bag = listeners.get(type) ?? new Set();
        bag.add(fn);
        listeners.set(type, bag);
      },
      removeEventListener(type: string, fn: (event: Event) => void) {
        listeners.get(type)?.delete(fn);
      },
      matchMedia: () => ({
        matches: false,
        addEventListener() {},
        removeEventListener() {},
      }),
    });
    vi.stubGlobal('document', {
      documentElement: { getAttribute: () => null },
      querySelectorAll(selector: string) {
        const node = (bag: Map<string, string>) => ({
          setAttribute: (name: string, value: string) => bag.set(name, value),
        });
        if (selector.includes('tb-area')) return [node(area)];
        if (selector.includes('tbStayHeat')) return [node(heat)];
        return [];
      },
    });
    try {
      const unbind = bindBrightBasemap(map.api);
      const handlers = [...(listeners.get('tb:theme') ?? [])];
      expect(handlers).toHaveLength(1);
      const dark = new CustomEvent('tb:theme', { detail: { theme: 'dark' } });
      handlers[0]?.(dark);
      handlers[0]?.(dark);
      expect(urls).toEqual(['https://tiles.openfreemap.org/styles/dark']);
      expect(map.paint.get('water')?.['fill-color']).toBe('#071824');
      expect(map.paint.get('landuse_park')?.['fill-opacity']).toBe(0.16);
      expect(area.get('fill-opacity')).toBe('0.32');
      expect(heat.get('fill-opacity')).toBe('0.18');
      unbind();
      expect(listeners.get('tb:theme')?.size ?? 0).toBe(0);
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

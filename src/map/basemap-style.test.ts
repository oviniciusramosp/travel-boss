import type { FilterSpecification, Map as MaplibreMap } from 'maplibre-gl';
import { describe, expect, it, vi } from 'vitest';
import { applyBrightBasemap, bindBrightBasemap } from './basemap-style';

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
});

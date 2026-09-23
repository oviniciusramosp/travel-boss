import type { FilterSpecification, Map as MaplibreMap } from 'maplibre-gl';

/**
 * Light OpenFreeMap Bright treatment from the portfolio travel map.
 * Water and parks stay the soft accents; yellow highways and pink landuse are muted.
 * Highway shields, bus-stop markers, and distant place names stay hidden.
 */

const WATER_FILL = '#c5d9e8';
const WATERWAY_LINE = '#a8c4d8';
const WATER_NAME = '#6a8499';
const WATER_NAME_HALO = 'rgba(255, 255, 255, 0.9)';
const PARK_FILL = '#d5e4d0';
const PARK_OPACITY = 0.75;
const WOOD_FILL = '#c5d6bc';
const WOOD_OPACITY = 0.45;
const GRASS_FILL = '#dce8d6';
const ROAD_FILL = '#f0ebe3';
const ROAD_CASING = '#d4cfc6';
const MOTORWAY_FILL = '#e8e2d8';
const LANDUSE_MUTED = 'hsla(40, 8%, 92%, 0.35)';
const LANDUSE_COMMERCIAL = 'hsla(35, 10%, 90%, 0.28)';
const LANDUSE_HOSPITAL = 'hsla(0, 8%, 94%, 0.35)';
const LANDUSE_SCHOOL = 'hsla(40, 8%, 93%, 0.3)';
const LANDUSE_INDUSTRIAL = 'hsla(40, 12%, 92%, 0.3)';
const PLACE_LABEL = '#7a7e88';
const PLACE_HALO = 'rgba(255, 255, 255, 0.92)';

/** Same gray as `--color-canvas`, used when CSS variables are not available. */
const MAP_CANVAS_FALLBACK = '#f5f5f5';

function mapCanvasColor(): string {
  if (typeof document === 'undefined') return MAP_CANVAS_FALLBACK;
  const value = getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim();
  return value || MAP_CANVAS_FALLBACK;
}

/** Number badges (A6, I-95). The road lines stay. */
const HIDDEN_HIGHWAY_INDICATOR_LAYERS = [
  'highway-shield-non-us',
  'highway-shield-us-interstate',
  'road_shield_us',
  'highway_name_motorway',
] as const;

/** Symbol layers that can draw a bus stop. Transit lines stay. */
const POI_LAYERS_EXCLUDE_BUS = ['poi_transit', 'poi_r1', 'poi_r7', 'poi_r20'] as const;

/**
 * Suburbs and nearby towns stay unlabeled on a wide overview.
 * Values match the portfolio: names appear around walking scale.
 */
const PLACE_LABEL_MINZOOM: Record<string, number> = {
  place_other: 13.5,
  place_suburb: 13.2,
  place_village: 12.5,
  place_town: 11.5,
  place_city: 10,
  place_city_large: 8.5,
  label_other: 13.5,
  label_village: 12.5,
  label_town: 11.5,
  label_city: 9.5,
  label_city_capital: 8.5,
};

const ROAD_FILL_LAYERS = [
  'highway-motorway-link',
  'highway-link',
  'highway-secondary-tertiary',
  'highway-primary',
  'highway-trunk',
  'highway-motorway',
  'tunnel-motorway-link',
  'tunnel-link',
  'tunnel-secondary-tertiary',
  'tunnel-trunk-primary',
  'tunnel-motorway',
  'bridge-motorway-link',
  'bridge-link',
  'bridge-secondary-tertiary',
  'bridge-trunk-primary',
  'bridge-motorway',
] as const;

const ROAD_CASING_LAYERS = [
  'highway-motorway-link-casing',
  'highway-link-casing',
  'highway-secondary-tertiary-casing',
  'highway-primary-casing',
  'highway-trunk-casing',
  'highway-motorway-casing',
  'tunnel-motorway-link-casing',
  'tunnel-link-casing',
  'tunnel-secondary-tertiary-casing',
  'tunnel-trunk-primary-casing',
  'tunnel-motorway-casing',
  'bridge-motorway-link-casing',
  'bridge-link-casing',
  'bridge-secondary-tertiary-casing',
  'bridge-trunk-primary-casing',
  'bridge-motorway-casing',
] as const;

const WATERWAY_LAYERS = [
  'waterway',
  'waterway-other',
  'waterway-other-intermittent',
  'waterway-stream-canal',
  'waterway-stream-canal-intermittent',
  'waterway-river',
  'waterway-river-intermittent',
  'waterway_tunnel',
] as const;

const WATER_NAME_LAYERS = [
  'water_name',
  'waterway_line_label',
  'water_name_point_label',
  'water_name_line_label',
] as const;

const PLACE_LABEL_LAYERS = [
  'label_city',
  'label_city_capital',
  'label_town',
  'label_village',
  'label_state',
  'label_other',
  'label_country_1',
  'label_country_2',
  'label_country_3',
  'poi_r1',
  'poi_r7',
  'poi_r20',
  'poi_transit',
  'airport',
  'highway-name-path',
  'highway-name-minor',
  'highway-name-major',
] as const;

function setPaint(glMap: MaplibreMap, layerId: string, prop: string, value: unknown) {
  if (!glMap.getLayer(layerId)) return;
  try {
    glMap.setPaintProperty(layerId, prop, value);
  } catch {
    /* prop unsupported on this layer type */
  }
}

function setLayout(glMap: MaplibreMap, layerId: string, prop: string, value: unknown) {
  if (!glMap.getLayer(layerId)) return;
  try {
    glMap.setLayoutProperty(layerId, prop, value);
  } catch {
    /* prop unsupported on this layer type */
  }
}

function setLayerMinZoom(glMap: MaplibreMap, layerId: string, minzoom: number) {
  const layer = glMap.getLayer(layerId);
  if (!layer) return;
  try {
    glMap.setLayerZoomRange(layerId, minzoom, layer.maxzoom ?? 24);
  } catch {
    /* layer may not support zoom range */
  }
}

function hideBasemapClutter(glMap: MaplibreMap) {
  for (const id of HIDDEN_HIGHWAY_INDICATOR_LAYERS) {
    setLayout(glMap, id, 'visibility', 'none');
  }

  if (glMap.getLayer('poi_transit')) {
    try {
      glMap.setFilter('poi_transit', [
        'match',
        ['get', 'class'],
        ['airport', 'rail'],
        true,
        false,
      ]);
    } catch {
      setLayout(glMap, 'poi_transit', 'visibility', 'none');
    }
  }

  const noBus: FilterSpecification = ['!=', ['get', 'class'], 'bus'];
  const noBusKey = JSON.stringify(noBus);
  for (const id of POI_LAYERS_EXCLUDE_BUS) {
    if (id === 'poi_transit' || !glMap.getLayer(id)) continue;
    try {
      const existing = glMap.getFilter(id);
      if (existing && JSON.stringify(existing).includes(noBusKey)) continue;
      glMap.setFilter(
        id,
        existing ? (['all', existing, noBus] as FilterSpecification) : noBus,
      );
    } catch {
      /* keep the layer if the filter shape is unsupported */
    }
  }

  for (const [id, minzoom] of Object.entries(PLACE_LABEL_MINZOOM)) {
    setLayerMinZoom(glMap, id, minzoom);
  }
}

/** Idempotent. Safe to call again on style.load. */
export function applyBrightBasemap(glMap: MaplibreMap) {
  hideBasemapClutter(glMap);

  setPaint(glMap, 'background', 'background-color', mapCanvasColor());
  setPaint(glMap, 'water', 'fill-color', WATER_FILL);
  setPaint(glMap, 'water', 'fill-antialias', true);
  setPaint(glMap, 'water-intermittent', 'fill-color', WATER_FILL);

  for (const id of WATERWAY_LAYERS) {
    setPaint(glMap, id, 'line-color', WATERWAY_LINE);
  }

  for (const id of WATER_NAME_LAYERS) {
    setPaint(glMap, id, 'text-color', WATER_NAME);
    setPaint(glMap, id, 'text-halo-color', WATER_NAME_HALO);
  }

  setPaint(glMap, 'landuse_park', 'fill-color', PARK_FILL);
  setPaint(glMap, 'landuse_park', 'fill-opacity', PARK_OPACITY);
  setPaint(glMap, 'park', 'fill-color', PARK_FILL);
  setPaint(glMap, 'park', 'fill-opacity', PARK_OPACITY);
  setPaint(glMap, 'landcover_wood', 'fill-color', WOOD_FILL);
  setPaint(glMap, 'landcover_wood', 'fill-opacity', WOOD_OPACITY);
  setPaint(glMap, 'landcover-wood', 'fill-color', WOOD_FILL);
  setPaint(glMap, 'landcover-wood', 'fill-opacity', WOOD_OPACITY);
  setPaint(glMap, 'landcover-grass', 'fill-color', GRASS_FILL);
  setPaint(glMap, 'landcover-grass-park', 'fill-color', GRASS_FILL);

  for (const id of ROAD_FILL_LAYERS) {
    setPaint(glMap, id, 'line-color', id.includes('motorway') ? MOTORWAY_FILL : ROAD_FILL);
  }
  for (const id of ROAD_CASING_LAYERS) {
    setPaint(glMap, id, 'line-color', ROAD_CASING);
  }

  setPaint(glMap, 'landuse-commercial', 'fill-color', LANDUSE_COMMERCIAL);
  setPaint(glMap, 'landuse-hospital', 'fill-color', LANDUSE_HOSPITAL);
  setPaint(glMap, 'landuse-school', 'fill-color', LANDUSE_SCHOOL);
  setPaint(glMap, 'landuse-industrial', 'fill-color', LANDUSE_INDUSTRIAL);
  setPaint(glMap, 'landuse-residential', 'fill-color', LANDUSE_MUTED);
  setPaint(glMap, 'landuse-suburb', 'fill-color', LANDUSE_MUTED);
  setPaint(glMap, 'landuse-railway', 'fill-color', LANDUSE_MUTED);

  for (const id of PLACE_LABEL_LAYERS) {
    setPaint(glMap, id, 'text-color', PLACE_LABEL);
    setPaint(glMap, id, 'text-halo-color', PLACE_HALO);
    setPaint(glMap, id, 'text-halo-width', 1.25);
    setPaint(glMap, id, 'text-opacity', 0.82);
  }
}

/** Repaint after the vector style finishes loading. */
export function bindBrightBasemap(glMap: MaplibreMap) {
  const paint = () => applyBrightBasemap(glMap);
  if (glMap.isStyleLoaded()) paint();
  glMap.once('load', paint);
  glMap.on('style.load', paint);
  return () => {
    glMap.off('load', paint);
    glMap.off('style.load', paint);
  };
}

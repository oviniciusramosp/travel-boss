import type { FilterSpecification, Map as MaplibreMap } from 'maplibre-gl';

/**
 * OpenFreeMap treatment from the portfolio travel map.
 * Light keeps the Bright sheet: water and parks are the soft accents,
 * yellow highways and pink landuse are muted.
 * Dark swaps to the dark sheet on the same map and reapplies the night tints.
 * Highway shields, bus-stop markers, and distant place names stay hidden.
 */

export type BasemapTheme = 'light' | 'dark';

/** Same name the theme toggle dispatches. */
export const BASEMAP_THEME_EVENT = 'tb:theme';

const STYLE_URL: Record<BasemapTheme, string> = {
  light: 'https://tiles.openfreemap.org/styles/bright',
  dark: 'https://tiles.openfreemap.org/styles/dark',
};

type BasemapTint = {
  waterFill: string;
  waterwayLine: string;
  waterName: string;
  waterNameHalo: string;
  parkFill: string;
  parkOpacity: number;
  woodFill: string;
  woodOpacity: number;
  grassFill?: string;
  roadFill?: string;
  roadCasing?: string;
  motorwayFill?: string;
  landuseMuted?: string;
  landuseCommercial?: string;
  landuseHospital?: string;
  landuseSchool?: string;
  landuseIndustrial?: string;
  placeLabel?: string;
  placeHalo?: string;
};

/** Night water and parks from the portfolio. Roads stay the dark sheet's own. */
const TINTS: Record<BasemapTheme, BasemapTint> = {
  dark: {
    waterFill: '#071824',
    waterwayLine: '#0a2233',
    waterName: 'rgba(110, 140, 165, 0.55)',
    waterNameHalo: 'rgba(7, 24, 36, 0.8)',
    parkFill: '#1f4a32',
    parkOpacity: 0.16,
    woodFill: '#1a3d2a',
    woodOpacity: 0.14,
  },
  light: {
    waterFill: '#c5d9e8',
    waterwayLine: '#a8c4d8',
    waterName: '#6a8499',
    waterNameHalo: 'rgba(255, 255, 255, 0.9)',
    parkFill: '#d5e4d0',
    parkOpacity: 0.75,
    woodFill: '#c5d6bc',
    woodOpacity: 0.45,
    grassFill: '#dce8d6',
    roadFill: '#f0ebe3',
    roadCasing: '#d4cfc6',
    motorwayFill: '#e8e2d8',
    landuseMuted: 'hsla(40, 8%, 92%, 0.35)',
    landuseCommercial: 'hsla(35, 10%, 90%, 0.28)',
    landuseHospital: 'hsla(0, 8%, 94%, 0.35)',
    landuseSchool: 'hsla(40, 8%, 93%, 0.3)',
    landuseIndustrial: 'hsla(40, 12%, 92%, 0.3)',
    placeLabel: '#7a7e88',
    placeHalo: 'rgba(255, 255, 255, 0.92)',
  },
};

/** Light basemap needs a stronger wash; night drops back so hues don't glare. */
export function overlayAlpha(theme: BasemapTheme): { area: number; heat: number } {
  return theme === 'dark' ? { area: 0.32, heat: 0.18 } : { area: 0.52, heat: 0.22 };
}

/** Mirrors `--color-canvas` when the stylesheet has not been applied. */
const CANVAS_FALLBACK: Record<BasemapTheme, string> = {
  light: '#f5f5f5',
  dark: '#111111',
};

export function readBasemapTheme(): BasemapTheme {
  if (typeof document === 'undefined') return 'light';
  const explicit = document.documentElement.getAttribute('data-theme');
  if (explicit === 'dark' || explicit === 'light') return explicit;
  if (systemPrefersDark()) return 'dark';
  return 'light';
}

function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

function mapCanvasColor(theme: BasemapTheme): string {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') {
    return CANVAS_FALLBACK[theme];
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim();
  return value || CANVAS_FALLBACK[theme];
}

function retintMapOverlays(theme: BasemapTheme) {
  if (typeof document === 'undefined' || typeof document.querySelectorAll !== 'function') return;
  const alpha = overlayAlpha(theme);
  for (const node of document.querySelectorAll('.tb-map path.tb-area--poly')) {
    node.setAttribute('fill-opacity', String(alpha.area));
  }
  for (const node of document.querySelectorAll('.leaflet-tbStayHeat-pane path')) {
    node.setAttribute('fill-opacity', String(alpha.heat));
  }
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
export function applyBrightBasemap(glMap: MaplibreMap, theme: BasemapTheme = readBasemapTheme()) {
  hideBasemapClutter(glMap);
  const tint = TINTS[theme];

  setPaint(glMap, 'background', 'background-color', mapCanvasColor(theme));
  setPaint(glMap, 'water', 'fill-color', tint.waterFill);
  setPaint(glMap, 'water', 'fill-antialias', true);
  setPaint(glMap, 'water-intermittent', 'fill-color', tint.waterFill);

  for (const id of WATERWAY_LAYERS) {
    setPaint(glMap, id, 'line-color', tint.waterwayLine);
  }

  for (const id of WATER_NAME_LAYERS) {
    setPaint(glMap, id, 'text-color', tint.waterName);
    setPaint(glMap, id, 'text-halo-color', tint.waterNameHalo);
  }

  if (theme === 'dark' && glMap.getLayer('landcover_wood')) {
    try {
      glMap.setPaintProperty('landcover_wood', 'fill-pattern', null as unknown as string);
    } catch {
      /* pattern may be required */
    }
  }

  setPaint(glMap, 'landuse_park', 'fill-color', tint.parkFill);
  setPaint(glMap, 'landuse_park', 'fill-opacity', tint.parkOpacity);
  setPaint(glMap, 'park', 'fill-color', tint.parkFill);
  setPaint(glMap, 'park', 'fill-opacity', tint.parkOpacity);
  setPaint(glMap, 'landcover_wood', 'fill-color', tint.woodFill);
  setPaint(glMap, 'landcover_wood', 'fill-opacity', tint.woodOpacity);
  setPaint(glMap, 'landcover-wood', 'fill-color', tint.woodFill);
  setPaint(glMap, 'landcover-wood', 'fill-opacity', tint.woodOpacity);
  if (tint.grassFill) {
    setPaint(glMap, 'landcover-grass', 'fill-color', tint.grassFill);
    setPaint(glMap, 'landcover-grass-park', 'fill-color', tint.grassFill);
  }

  /* Dark roads and labels belong to the dark sheet. Don't paint Bright beige on top. */
  if (theme !== 'light' || !tint.roadFill || !tint.roadCasing || !tint.motorwayFill) return;

  for (const id of ROAD_FILL_LAYERS) {
    setPaint(glMap, id, 'line-color', id.includes('motorway') ? tint.motorwayFill : tint.roadFill);
  }
  for (const id of ROAD_CASING_LAYERS) {
    setPaint(glMap, id, 'line-color', tint.roadCasing);
  }

  setPaint(glMap, 'landuse-commercial', 'fill-color', tint.landuseCommercial);
  setPaint(glMap, 'landuse-hospital', 'fill-color', tint.landuseHospital);
  setPaint(glMap, 'landuse-school', 'fill-color', tint.landuseSchool);
  setPaint(glMap, 'landuse-industrial', 'fill-color', tint.landuseIndustrial);
  setPaint(glMap, 'landuse-residential', 'fill-color', tint.landuseMuted);
  setPaint(glMap, 'landuse-suburb', 'fill-color', tint.landuseMuted);
  setPaint(glMap, 'landuse-railway', 'fill-color', tint.landuseMuted);

  for (const id of PLACE_LABEL_LAYERS) {
    setPaint(glMap, id, 'text-color', tint.placeLabel);
    setPaint(glMap, id, 'text-halo-color', tint.placeHalo);
    setPaint(glMap, id, 'text-halo-width', 1.25);
    setPaint(glMap, id, 'text-opacity', 0.82);
  }
}

/**
 * Repaint after the vector style finishes loading.
 * Theme changes call setStyle on this map; they do not build a new one.
 */
export function bindBrightBasemap(glMap: MaplibreMap) {
  let theme = readBasemapTheme();
  let sheet: BasemapTheme = 'light';
  const paint = () => {
    applyBrightBasemap(glMap, theme);
    retintMapOverlays(theme);
  };

  const mountSheet = (next: BasemapTheme) => {
    theme = next;
    retintMapOverlays(next);
    if (next === sheet) {
      paint();
      return;
    }
    sheet = next;
    const setStyle = (glMap as MaplibreMap & { setStyle?: (url: string) => void }).setStyle;
    if (typeof setStyle !== 'function') {
      paint();
      return;
    }
    try {
      setStyle.call(glMap, STYLE_URL[next]);
    } catch {
      paint();
    }
  };

  const onTheme = (event: Event) => {
    const raw = (event as CustomEvent<{ theme?: string }>).detail?.theme;
    const next: BasemapTheme = raw === 'light' || raw === 'dark' ? raw : readBasemapTheme();
    if (next === theme && next === sheet) {
      paint();
      return;
    }
    mountSheet(next);
  };

  const media =
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;
  const onMedia = () => {
    if (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme')) return;
    mountSheet(media?.matches ? 'dark' : 'light');
  };

  glMap.once('load', paint);
  glMap.on('style.load', paint);
  if (typeof window !== 'undefined') window.addEventListener(BASEMAP_THEME_EVENT, onTheme);
  media?.addEventListener('change', onMedia);
  if (theme === 'dark') mountSheet('dark');
  else if (glMap.isStyleLoaded()) paint();

  return () => {
    glMap.off('load', paint);
    glMap.off('style.load', paint);
    if (typeof window !== 'undefined') window.removeEventListener(BASEMAP_THEME_EVENT, onTheme);
    media?.removeEventListener('change', onMedia);
  };
}

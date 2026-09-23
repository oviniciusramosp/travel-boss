import { pickLocale, type Locale } from '../catalog';
import type { Map as LeafletMap } from 'leaflet';
import { leafletMap } from './hotel-ring';

type Copy = { en: string; 'pt-BR': string };
type Band = 'best' | 'mixed' | 'caution' | 'unknown';
type LatLng = [number, number];
type Polygons = LatLng[][][];

type Zone = {
  id: string;
  name: Copy;
  note: Copy;
  safety: number;
  value: number;
};

type StudyZone = Zone & {
  mapBand: Band;
  polygons: Polygons;
  safety: number | null;
  reviewedAt?: string;
  reviewStatus?: string;
  sources?: { title?: string; url?: string }[];
};

type DisplayFile = {
  zones: Record<string, { polygons?: Polygons }>;
  transitionAreas: Record<string, Polygons>;
};

const BANDS: readonly Band[] = ['best', 'mixed', 'caution', 'unknown'];

/** Mirrors `stayZonesForCity`. The heavy geometry stays behind a dynamic import. */
export function cityHasStayHeat(slug: string): boolean {
  return slug === 'lisboa' || slug === 'roma';
}

export type StayHeatHandle = {
  toggle(): void;
  relabel(): void;
  dispose(): void;
};

type HeatApi = {
  stayZonesForCity: (slug: string) => Zone[];
  stayHeatBand: (zone: Zone) => Band;
  STAY_HEAT_RGB: Record<Band, [number, number, number]>;
  stayHeatUi: Record<string, Copy>;
};

/**
 * Stay polygons on the live map. Leaflet panes stay inside the map's isolate,
 * so their z-index is the engine order (tiles 200, overlay 400), not an app token.
 */
export function mountStayHeat(opts: {
  slug: string;
  button: HTMLButtonElement;
  locale: () => Locale;
}): StayHeatHandle {
  const say = (copy: Copy) => pickLocale(opts.locale(), copy);
  let on = false;
  let ready: Promise<void> | null = null;
  let map: LeafletMap | null = null;
  let zones: Zone[] = [];
  let study: StudyZone[] = [];
  let display: DisplayFile | null = null;
  let api: HeatApi | null = null;
  let L: typeof import('leaflet') | null = null;
  const enabled = new Set<Band>(['best', 'mixed', 'caution']);
  let legend: HTMLElement | null = null;
  let legendControl: { remove: () => void } | null = null;
  const layers: { remove: () => void }[] = [];

  const label = () => say(on ? hideCopy : showCopy);
  const syncButton = () => {
    const text = label();
    opts.button.setAttribute('aria-pressed', on ? 'true' : 'false');
    opts.button.setAttribute('aria-label', text);
    opts.button.setAttribute('data-tip', text);
  };

  const clearLayers = () => {
    for (const layer of layers) layer.remove();
    layers.length = 0;
    map?.closePopup();
  };

  const polygonsOf = (id: string): Polygons => display?.zones[id]?.polygons ?? [];

  const paint = () => {
    if (!on || !map || !L || !api || !display) return;
    clearLayers();
    const opacity = 0.22;
    const heatPane = 'tbStayHeat';
    const hitPane = 'tbStayHit';
    if (!map.getPane(heatPane)) {
      const pane = map.createPane(heatPane);
      pane.style.zIndex = '350';
      pane.style.pointerEvents = 'none';
    }
    if (!map.getPane(hitPane)) {
      const pane = map.createPane(hitPane);
      pane.style.zIndex = '450';
    }
    const heatRenderer = L.svg({ pane: heatPane });
    const hitRenderer = L.svg({ pane: hitPane });
    const addFill = (polygons: Polygons, band: Band, name: string, interactive: boolean) => {
      if (!polygons.length || !map || !L) return;
      const color = `rgb(${api!.STAY_HEAT_RGB[band].join(',')})`;
      const shape = L.polygon(polygons, {
        pane: interactive ? hitPane : heatPane,
        renderer: interactive ? hitRenderer : heatRenderer,
        stroke: false,
        fillColor: color,
        fillOpacity: interactive ? 0 : opacity,
        interactive,
        bubblingMouseEvents: false,
      });
      if (interactive) {
        shape.bindTooltip(name, {
          direction: 'top',
          sticky: true,
          opacity: 1,
          className: 'tb-stay-pill',
        });
        shape.on('mouseover', () => shape.setStyle({ fillOpacity: 0.12 }));
        shape.on('mouseout', () => shape.setStyle({ fillOpacity: 0 }));
      }
      shape.addTo(map);
      layers.push(shape);
    };
    for (const zone of zones) {
      const band = api.stayHeatBand(zone);
      if (!enabled.has(band)) continue;
      const name = say(zone.name);
      addFill(polygonsOf(zone.id), band, name, false);
      addFill(polygonsOf(zone.id), band, name, true);
    }
    for (const zone of study) {
      if (!enabled.has(zone.mapBand)) continue;
      addFill(zone.polygons, zone.mapBand, say(zone.name), false);
      addFill(zone.polygons, zone.mapBand, say(zone.name), true);
    }
    const transitions = display.transitionAreas[opts.slug] ?? [];
    if (transitions.length) {
      addFill(transitions, 'mixed', say({ en: 'Mixed · transition', 'pt-BR': 'Misto · transição' }), true);
    }
  };

  const paintLegend = () => {
    if (!legend || !api) return;
    legend.replaceChildren();
    const title = document.createElement('p');
    title.className = 'tb-stay-legend__title';
    title.textContent = say(api.stayHeatUi.legendTitle as Copy);
    const hint = document.createElement('p');
    hint.className = 'tb-stay-legend__hint';
    hint.textContent = say(api.stayHeatUi.hint as Copy);
    const list = document.createElement('ul');
    for (const band of BANDS) {
      const item = document.createElement('li');
      const button = document.createElement('button');
      button.type = 'button';
      const pressed = enabled.has(band);
      button.setAttribute('aria-pressed', pressed ? 'true' : 'false');
      const name = say(api.stayHeatUi[band] as Copy);
      const action = pressed
        ? say({ en: `Hide ${name}`, 'pt-BR': `Ocultar ${name}` })
        : say({ en: `Show ${name}`, 'pt-BR': `Mostrar ${name}` });
      button.setAttribute('aria-label', action);
      button.setAttribute('data-tip', action);
      const swatch = document.createElement('span');
      const [r, g, b] = api.STAY_HEAT_RGB[band];
      swatch.style.background = `rgb(${r}, ${g}, ${b})`;
      button.append(swatch, document.createTextNode(name));
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        if (enabled.has(band)) enabled.delete(band);
        else enabled.add(band);
        paint();
        paintLegend();
      });
      item.append(button);
      list.append(item);
    }
    legend.append(title, hint, list);
    legend.hidden = !on;
  };

  const ensure = () => {
    ready ??= (async () => {
      const [leaflet, heat, geometry] = await Promise.all([
        import('leaflet'),
        import('../data/travel-stay-heatmap'),
        import('../data/travel-stay-display.json'),
      ]);
      L = leaflet;
      api = heat as unknown as HeatApi;
      display = geometry.default as unknown as DisplayFile;
      zones = heat.stayZonesForCity(opts.slug);
      if (opts.slug === 'roma') {
        const rome = await import('../data/rome-hotel-neighborhoods');
        study = rome.ROME_HOTEL_NEIGHBORHOODS as unknown as StudyZone[];
      }
      map = leafletMap();
      if (!map) return;
      const control = new leaflet.Control({ position: 'topright' });
      control.onAdd = () => {
        const root = document.createElement('div');
        root.className = 'tb-stay-legend';
        root.hidden = true;
        legend = root;
        leaflet.DomEvent.disableClickPropagation(root);
        leaflet.DomEvent.disableScrollPropagation(root);
        return root;
      };
      control.addTo(map);
      legendControl = control;
      paintLegend();
    })();
    return ready;
  };

  syncButton();
  return {
    toggle() {
      on = !on;
      syncButton();
      void ensure().then(() => {
        if (!on) {
          clearLayers();
          if (legend) legend.hidden = true;
          return;
        }
        paint();
        paintLegend();
      });
    },
    relabel() {
      syncButton();
      paintLegend();
      if (on) paint();
    },
    dispose() {
      on = false;
      clearLayers();
      legendControl?.remove();
      legendControl = null;
      legend = null;
    },
  };
}

const showCopy: Copy = { en: 'Show where to stay', 'pt-BR': 'Mostrar onde ficar' };
const hideCopy: Copy = { en: 'Hide stay heatmap', 'pt-BR': 'Ocultar mapa de hospedagem' };

import { pickLocale, type Locale } from '../catalog';
import type { StayZone } from '../data/travel-stay-heatmap';
import type { Map as LeafletMap } from 'leaflet';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';
import { cssToken } from '../ui/motion';
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

type StudyZone = {
  id: string;
  citySlug: string;
  name: Copy;
  note: Copy;
  lat: number;
  lng: number;
  radiusM: number;
  mapBand: Band;
  polygons: Polygons;
  safety: number | null;
  reviewedAt?: string;
  reviewStatus?: string;
  sources?: { title?: string; url?: string }[];
};

type PopupZone = {
  id: string;
  citySlug?: string;
  name: Copy;
  note: Copy;
  lat: number;
  lng: number;
  radiusM?: number;
  safety: number | null;
  value?: number | null;
  polygons?: Polygons;
  reviewedAt?: string;
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

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Trip or form dates. An inverted range does not go into the OTA links. */
export function usableStayDates(
  dates: { checkin: string; checkout: string } | null | undefined,
): { checkin: string; checkout: string } | null {
  if (!dates || !ISO_DATE.test(dates.checkin) || !ISO_DATE.test(dates.checkout)) return null;
  return dates.checkout > dates.checkin ? dates : null;
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
 * Stay polygons on the live map. Pane z-index is the Leaflet stack
 * (--z-map-heat / --z-map-hit), not the chrome scale.
 */
export function mountStayHeat(opts: {
  slug: string;
  button: HTMLButtonElement;
  locale: () => Locale;
  dates: () => { checkin: string; checkout: string } | null;
}): StayHeatHandle {
  const say = (copy: Copy) => pickLocale(opts.locale(), copy);
  let on = false;
  let ready: Promise<void> | null = null;
  let map: LeafletMap | null = null;
  let zones: StayZone[] = [];
  let study: StudyZone[] = [];
  let display: DisplayFile | null = null;
  let api: HeatApi | null = null;
  let heatMod: typeof import('../data/travel-stay-heatmap') | null = null;
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

  const coverRadius = (zone: PopupZone): number => {
    const polygons = zone.polygons ?? polygonsOf(zone.id);
    let max = zone.radiusM && zone.radiusM > 0 ? zone.radiusM : 200;
    for (const polygon of polygons) {
      for (const ring of polygon) {
        for (const [lat, lng] of ring) {
          const dLat = (lat - zone.lat) * 111_320;
          const dLng = (lng - zone.lng) * 111_320 * Math.max(Math.cos((zone.lat * Math.PI) / 180), 0.2);
          max = Math.max(max, Math.hypot(dLat, dLng));
        }
      }
    }
    return max;
  };

  const zonePopup = (zone: PopupZone, editorial: boolean) => {
    const root = el('div', 'tb-stay-popup__body');
    const name = el('p', 'tb-stay-popup__name');
    name.append(icon('holiday_village', { size: 16 }), el('span', undefined, say(zone.name)));
    root.append(name);
    const safety = el('p', zone.safety != null && zone.safety < 70 ? 'tb-hotels__caution' : undefined);
    if (zone.safety != null && zone.safety < 70) safety.append(icon('warning', { size: 16 }));
    safety.append(
      document.createTextNode(
        `${say({ en: 'Safety', 'pt-BR': 'Segurança' })} ${zone.safety == null ? '—' : `${zone.safety}/100`}`,
      ),
    );
    root.append(safety);
    if (!editorial) {
      root.append(
        el(
          'p',
          undefined,
          `${say({ en: 'Value', 'pt-BR': 'Custo-benefício' })} ${zone.value == null ? '—' : `${zone.value}/100`}`,
        ),
      );
    }
    root.append(el('p', 'tb-stay-popup__note', say(zone.note)));
    if (editorial) {
      root.append(
        el(
          'p',
          'tb-meta',
          say({
            en: 'Editorial areas on the mapped urban zones. Not a safety guarantee.',
            'pt-BR': 'Áreas editoriais sobre as zonas urbanísticas. Não é garantia de segurança.',
          }),
        ),
      );
      if (zone.reviewedAt) root.append(el('p', 'tb-meta', zone.reviewedAt));
      const sources = (zone.sources ?? []).filter(
        (source): source is { title: string; url: string } =>
          Boolean(source.title && source.url && source.url.startsWith('https://')),
      );
      if (sources.length) {
        const line = el('p', 'tb-meta');
        sources.forEach((source, index) => {
          if (index) line.append(document.createTextNode(' · '));
          const anchor = el('a', undefined, source.title);
          anchor.href = source.url;
          anchor.target = '_blank';
          anchor.rel = 'noopener';
          line.append(anchor);
        });
        root.append(line);
      }
    }
    const links = el('div', 'tb-stay-popup__links');
    const dates = usableStayDates(opts.dates());
    const located = {
      ...zone,
      citySlug: zone.citySlug ?? opts.slug,
      safety: zone.safety ?? 0,
      value: zone.value ?? 0,
      overall: 0,
      radiusM: coverRadius(zone),
    } as StayZone;
    if (heatMod) {
      const airbnb = el('a', 'tb-stay-popup__link', say({ en: 'Airbnb', 'pt-BR': 'Airbnb' }));
      airbnb.href = heatMod.stayAirbnbUrl(located, opts.locale(), dates);
      airbnb.target = '_blank';
      airbnb.rel = 'noopener';
      airbnb.prepend(icon('holiday_village', { size: 16 }));
      const booking = el('a', 'tb-stay-popup__link', say({ en: 'Booking', 'pt-BR': 'Booking' }));
      booking.href = heatMod.stayBookingUrl(located, opts.locale(), dates);
      booking.target = '_blank';
      booking.rel = 'noopener';
      booking.prepend(icon('bed', { size: 16 }));
      links.append(airbnb, booking);
    }
    root.append(links);
    return root;
  };

  const paint = () => {
    if (!on || !map || !L || !api || !display) return;
    clearLayers();
    const opacity = 0.22;
    const heatPane = 'tbStayHeat';
    const hitPane = 'tbStayHit';
    if (!map.getPane(heatPane)) {
      const pane = map.createPane(heatPane);
      pane.style.zIndex = cssToken('--z-map-heat', '350');
      pane.style.pointerEvents = 'none';
    }
    if (!map.getPane(hitPane)) {
      const pane = map.createPane(hitPane);
      pane.style.zIndex = cssToken('--z-map-hit', '450');
    }
    const heatRenderer = L.svg({ pane: heatPane });
    const hitRenderer = L.svg({ pane: hitPane });
    const addFill = (
      polygons: Polygons,
      band: Band,
      name: string,
      interactive: boolean,
      popup?: () => HTMLElement,
    ) => {
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
        if (popup) {
          shape.on('click', (event) => {
            if (!map || !L) return;
            L.DomEvent.stop(event);
            const at = (event as { latlng?: L.LatLng }).latlng;
            if (!at) return;
            L.popup({ className: 'tb-stay-popup', autoPan: false, closeButton: true, maxWidth: 320 })
              .setLatLng(at)
              .setContent(popup())
              .openOn(map);
          });
        }
      }
      shape.addTo(map);
      layers.push(shape);
    };
    for (const zone of zones) {
      const band = api.stayHeatBand(zone);
      if (!enabled.has(band)) continue;
      const name = say(zone.name);
      const card = () => zonePopup(zone, false);
      addFill(polygonsOf(zone.id), band, name, false);
      addFill(polygonsOf(zone.id), band, name, true, card);
    }
    for (const zone of study) {
      if (!enabled.has(zone.mapBand)) continue;
      const card = () => zonePopup(zone, true);
      addFill(zone.polygons, zone.mapBand, say(zone.name), false);
      addFill(zone.polygons, zone.mapBand, say(zone.name), true, card);
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
      heatMod = heat;
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

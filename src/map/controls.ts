import { Control, DomEvent, type Map as LeafletMap } from 'leaflet';
import { pickLocale, type Locale } from '../catalog';
import { iconButton } from '../ui/controls';
import { AMENITY_EVENT, amenityOn, setAmenity } from './amenity-state';
import type { IconName } from '../ui/icons';
import { cameraMotion } from '../ui/motion';
import { MOBILE_QUERY } from '../app/viewport';
import { locationControl } from './location';

function uiLocale(): Locale {
  return document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
}

function relabel(button: HTMLButtonElement, label: string, name: IconName) {
  button.setAttribute('aria-label', label);
  button.setAttribute('data-tip', label);
  const glyph = button.querySelector('.material-symbols-rounded');
  if (glyph) glyph.textContent = name;
}

/** Separate navigation and map-layer bars. Fullscreen includes the place panel. */
export function attachMapControls(
  map: LeafletMap,
  host: HTMLElement,
  fit: () => void,
): void {
  const shell = host.closest<HTMLElement>('.tb-map-col') ?? host.parentElement ?? host;
  const zoomIn = iconButton({ icon: 'add', label: 'Zoom in' });
  const zoomOut = iconButton({ icon: 'remove', label: 'Zoom out' });
  const fitBtn = iconButton({ icon: 'fit_screen', label: 'Fit places' });
  const water = iconButton({ icon: 'water_drop', label: 'Drinking water', pressed: false });
  const toilets = iconButton({ icon: 'wc', label: 'Restrooms', pressed: false });
  const favorites = iconButton({ icon: 'favorite', label: 'Show favorites', pressed: false });
  const fullscreen = iconButton({ icon: 'fullscreen', label: 'Full screen', pressed: false });

  const syncZoom = () => {
    zoomIn.disabled = map.getZoom() >= map.getMaxZoom();
    zoomOut.disabled = map.getZoom() <= map.getMinZoom();
  };

  const syncLabels = () => {
    const enter = pickLocale(uiLocale(), { en: 'Full screen', 'pt-BR': 'Tela cheia' });
    const exit = pickLocale(uiLocale(), { en: 'Exit full screen', 'pt-BR': 'Sair da tela cheia' });
    const on = document.fullscreenElement === shell;
    relabel(zoomIn, pickLocale(uiLocale(), { en: 'Zoom in', 'pt-BR': 'Aproximar' }), 'add');
    relabel(zoomOut, pickLocale(uiLocale(), { en: 'Zoom out', 'pt-BR': 'Afastar' }), 'remove');
    relabel(fitBtn, pickLocale(uiLocale(), { en: 'Fit places', 'pt-BR': 'Enquadrar lugares' }), 'fit_screen');
    relabel(water, pickLocale(uiLocale(), { en: 'Drinking water', 'pt-BR': 'Água potável' }), 'water_drop');
    relabel(toilets, pickLocale(uiLocale(), { en: 'Restrooms', 'pt-BR': 'Banheiros' }), 'wc');
    relabel(favorites, pickLocale(uiLocale(), { en: 'Show favorites', 'pt-BR': 'Mostrar favoritos' }), 'favorite');
    relabel(fullscreen, on ? exit : enter, on ? 'fullscreen_exit' : 'fullscreen');
    fullscreen.setAttribute('aria-pressed', on ? 'true' : 'false');
  };

  zoomIn.addEventListener('click', () => {
    map.zoomIn(1, cameraMotion());
  });
  zoomOut.addEventListener('click', () => {
    map.zoomOut(1, cameraMotion());
  });
  fitBtn.addEventListener('click', () => {
    fit();
  });
  const amenityButtons = [[water, 'water'], [toilets, 'toilet']] as const;
  const syncAmenities = () => {
    for (const [button, kind] of amenityButtons) button.setAttribute('aria-pressed', amenityOn(kind) ? 'true' : 'false');
  };
  for (const [button, kind] of amenityButtons) {
    button.addEventListener('click', () => setAmenity(kind, !amenityOn(kind)));
  }
  document.addEventListener(AMENITY_EVENT, syncAmenities);
  favorites.addEventListener('click', () => {
    const on = host.classList.toggle('tb-show-favorites');
    favorites.setAttribute('aria-pressed', String(on));
  });
  fullscreen.addEventListener('click', () => {
    if (document.fullscreenElement === shell) void document.exitFullscreen();
    else void shell.requestFullscreen();
  });

  const onFullscreen = () => {
    syncLabels();
    map.invalidateSize();
  };
  document.addEventListener('fullscreenchange', onFullscreen);
  const lang = new MutationObserver(syncLabels);
  lang.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  map.on('zoomend', syncZoom);
  syncLabels();
  syncZoom();
  syncAmenities();

  const bar = document.createElement('div');
  bar.className = 'tb-map-control-stack';
  const navigation = document.createElement('div');
  navigation.className = 'tb-map-controls';
  navigation.append(zoomIn, zoomOut, fitBtn, locationControl(map, shell));
  const layers = document.createElement('div');
  layers.className = 'tb-map-controls';
  layers.append(water, toilets, favorites);
  bar.append(navigation, layers);
  DomEvent.disableClickPropagation(bar);
  DomEvent.disableScrollPropagation(bar);

  const Corner = Control.extend({
    options: { position: 'bottomright' },
    onAdd() {
      return bar;
    },
  });
  new Corner().addTo(map);
  const mobile = window.matchMedia(MOBILE_QUERY);
  const topLayers = host.closest('.tb-app')?.querySelector('.tb-bar-layers');
  const positionLayers = () => {
    const target = mobile.matches && !document.fullscreenElement && topLayers ? topLayers : bar;
    target.append(layers);
  };
  mobile.addEventListener('change', positionLayers);
  document.addEventListener('fullscreenchange', positionLayers);
  positionLayers();
  map.attributionControl?.setPosition('bottomleft');
}

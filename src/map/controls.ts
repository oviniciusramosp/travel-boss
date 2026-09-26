import { Control, DomEvent, type Map as LeafletMap } from 'leaflet';
import { pickLocale, type Locale } from '../catalog';
import { iconButton } from '../ui/controls';
import type { IconName } from '../ui/icons';
import { cameraMotion } from '../ui/motion';

function uiLocale(): Locale {
  return document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
}

function relabel(button: HTMLButtonElement, label: string, name: IconName) {
  button.setAttribute('aria-label', label);
  button.setAttribute('data-tip', label);
  const glyph = button.querySelector('.material-symbols-rounded');
  if (glyph) glyph.textContent = name;
}

/** Zoom, fit, water/restrooms near the walk, and fullscreen. The fullscreen target includes the place panel. */
export function attachMapControls(
  map: LeafletMap,
  host: HTMLElement,
  fit: () => void,
  setAmenities: (on: boolean) => void,
): void {
  const shell = host.closest<HTMLElement>('.tb-map-col') ?? host.parentElement ?? host;
  const zoomIn = iconButton({ icon: 'add', label: 'Zoom in' });
  const zoomOut = iconButton({ icon: 'remove', label: 'Zoom out' });
  const fitBtn = iconButton({ icon: 'fit_screen', label: 'Fit places' });
  const amenities = iconButton({ icon: 'wc', label: 'Water and restrooms', pressed: false });
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
    relabel(
      amenities,
      pickLocale(uiLocale(), { en: 'Water and restrooms near the walk', 'pt-BR': 'Água e banheiros perto da caminhada' }),
      'wc',
    );
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
  amenities.addEventListener('click', () => {
    const next = amenities.getAttribute('aria-pressed') !== 'true';
    amenities.setAttribute('aria-pressed', next ? 'true' : 'false');
    setAmenities(next);
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

  const bar = document.createElement('div');
  bar.className = 'tb-map-controls';
  bar.append(zoomIn, zoomOut, fitBtn, amenities, fullscreen);
  DomEvent.disableClickPropagation(bar);
  DomEvent.disableScrollPropagation(bar);

  const Corner = Control.extend({
    options: { position: 'bottomright' },
    onAdd() {
      return bar;
    },
  });
  new Corner().addTo(map);
  map.attributionControl.setPosition('bottomleft');
}

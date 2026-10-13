import { circle, divIcon, marker, type Map as LeafletMap, type Marker, type Circle } from 'leaflet';
import { pickLocale, travelUi, type Locale } from '../catalog';
import { iconButton } from '../ui/controls';
import { icon } from '../ui/icons';
import { cameraMotion } from '../ui/motion';
import { compassHeading } from './heading';
import { watchLocation } from './geolocation';

/** Live position has its own layer, independent of trip pins, city filters and route previews. */
export function locationControl(map: LeafletMap, host: HTMLElement): HTMLButtonElement {
  const button = iconButton({ icon: 'my_location', label: '', pressed: false });
  button.dataset.locate = 'true';
  const label = () => {
    const locale: Locale = document.documentElement.lang === 'pt-BR' ? 'pt-BR' : 'en';
    const text = pickLocale(locale, travelUi.locateMe);
    button.setAttribute('aria-label', text);
    button.setAttribute('data-tip', text);
    return locale;
  };
  const toast = document.createElement('p');
  toast.className = 'tb-locate-toast';
  toast.hidden = true;
  toast.setAttribute('role', 'status');
  host.append(toast);
  const report = (text: string) => { toast.textContent = text; toast.hidden = false; };
  let cancelLocation: (() => void) | null = null;
  let dot: Marker | null = null;
  let accuracy: Circle | null = null;
  let epoch = 0;
  let firstFix = true;
  const pin = document.createElement('div');
  pin.className = 'tb-user-location';
  pin.setAttribute('role', 'img');
  const direction = document.createElement('span');
  direction.className = 'tb-user-location__direction';
  direction.hidden = true;
  direction.append(icon('navigation', { fill: true }));
  const center = document.createElement('span');
  center.className = 'tb-user-location__dot';
  pin.append(direction, center);
  const onOrientation = (event: DeviceOrientationEvent) => {
    const heading = compassHeading(event, screen.orientation?.angle ?? window.orientation ?? 0);
    if (heading == null) return;
    direction.hidden = false;
    direction.style.transform = `rotate(${heading}deg)`;
    pin.setAttribute('aria-label', `${pickLocale(label(), travelUi.myLocation)} · ${Math.round(heading)}°`);
  };
  const stop = () => {
    epoch += 1;
    cancelLocation?.();
    cancelLocation = null;
    dot?.remove(); dot = null;
    accuracy?.remove(); accuracy = null;
    window.removeEventListener('deviceorientation', onOrientation);
    window.removeEventListener('deviceorientationabsolute', onOrientation);
    direction.hidden = true;
    toast.hidden = true;
    button.setAttribute('aria-pressed', 'false');
    button.removeAttribute('aria-busy');
  };
  button.addEventListener('click', () => {
    if (cancelLocation) { stop(); return; }
    const locale = label();
    if (!navigator.geolocation || !window.isSecureContext) {
      report(pickLocale(locale, travelUi.locateUnavailable)); return;
    }
    const seq = ++epoch;
    firstFix = true;
    button.setAttribute('aria-pressed', 'true');
    button.setAttribute('aria-busy', 'true');
    report(pickLocale(locale, travelUi.locating));
    pin.setAttribute('aria-label', pickLocale(locale, travelUi.myLocation));
    cancelLocation = watchLocation(navigator.geolocation, position => {
      if (seq !== epoch) return;
      const point: [number, number] = [position.coords.latitude, position.coords.longitude];
      if (!dot) {
        const size = Number.parseFloat(getComputedStyle(host).getPropertyValue('--location-pin-size'));
        dot = marker(point, { interactive: false, icon: divIcon({
          html: pin, className: 'tb-user-location-wrap', iconSize: [size, size], iconAnchor: [size / 2, size / 2],
        }) }).addTo(map);
      } else dot.setLatLng(point);
      const color = getComputedStyle(host).getPropertyValue('--color-location').trim();
      if (!accuracy) accuracy = circle(point, { color, fillColor: color, fillOpacity: 0.12, weight: 1, interactive: false }).addTo(map);
      accuracy.setLatLng(point).setRadius(position.coords.accuracy);
      button.removeAttribute('aria-busy');
      toast.hidden = true;
      if (firstFix) { map.setView(point, Math.max(map.getZoom(), 16), cameraMotion()); firstFix = false; }
    }, error => {
      if (seq !== epoch) return;
      stop();
      const message = error.code === 1 ? travelUi.locateDenied : error.code === 3 ? {
        en: 'Location timed out. Click the location button to try again.',
        'pt-BR': 'A localização demorou demais. Clique no botão de localização para tentar novamente.',
      } : {
        en: 'The browser could not determine your position. Check location services for your browser in system settings, then try again.',
        'pt-BR': 'O navegador não conseguiu determinar sua posição. Confira os serviços de localização do navegador nas configurações do sistema e tente novamente.',
      };
      report(pickLocale(label(), message));
    });
    const orientation = window.DeviceOrientationEvent as typeof DeviceOrientationEvent & {
      requestPermission?: (absolute?: boolean) => Promise<string>;
    };
    // iOS permission must be requested synchronously during this tap, before any await.
    const permission = orientation?.requestPermission?.(true) ?? Promise.resolve('granted');
    void permission.then(state => {
      if (state !== 'granted' || seq !== epoch) return;
      window.addEventListener('deviceorientation', onOrientation);
      window.addEventListener('deviceorientationabsolute', onOrientation);
    }).catch(() => { /* Position remains available when the compass is denied. */ });
  });
  const lang = new MutationObserver(label);
  lang.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
  window.addEventListener('pagehide', stop);
  map.on('unload', () => { stop(); lang.disconnect(); toast.remove(); window.removeEventListener('pagehide', stop); });
  label();
  return button;
}

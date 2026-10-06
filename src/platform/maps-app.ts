/** Preserve Google's full place/route URL, including place IDs and waypoints. */
export function mapsAppUrl(href: string, userAgent: string): string | null {
  let url: URL;
  try { url = new URL(href); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  if (url.hostname === 'maps.app.goo.gl') {
    for (const city of travelCities) {
      const place = city.places.find(place => place.mapsUrl === href);
      if (place) return mapsAppUrl(googleMapsUrl({ ...place, mapsUrl: undefined }, city), userAgent);
    }
    return null;
  }
  const maps = (url.hostname === 'www.google.com' || url.hostname === 'google.com') &&
    url.pathname.startsWith('/maps');
  if (!maps && url.hostname !== 'maps.google.com' &&
      !(url.hostname === 'goo.gl' && url.pathname.startsWith('/maps/'))) return null;
  if (/iPhone|iPad|iPod/.test(userAgent)) {
    return href.replace(/^https?:\/\//, 'comgooglemapsurl://');
  }
  if (/Android/.test(userAgent)) {
    return `intent://${url.host}${url.pathname}${url.search}${url.hash}#Intent;scheme=${url.protocol.slice(0, -1)};package=com.google.android.apps.maps;end`;
  }
  return null;
}

/** Capture also covers links inside map popups and controls that stop propagation. */
export function mountMapsAppLinks(): void {
  document.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!(link instanceof HTMLAnchorElement)) return;
    const ua = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
      ? 'iPad' : navigator.userAgent;
    const href = mapsAppUrl(link.href, ua);
    if (!href) return;
    event.preventDefault();
    event.stopPropagation();
    window.location.assign(href);
  }, { capture: true });
}
import { googleMapsUrl, travelCities } from '../catalog';

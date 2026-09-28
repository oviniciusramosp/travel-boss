import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/lekton/400.css';
import '@fontsource/lekton/700.css';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/tokens.css';
import './styles/icons.css';
import './styles/app.css';
import './styles/places.css';
import './styles/trip.css';
import './styles/hotels.css';
import './styles/ui.css';
import './styles/indoor.css';
import { mountSearch } from './app/search';
import { mountShell } from './app/shell';
import { bootTheme } from './app/theme';
import {
  commitRoute,
  navigationMode,
  parseHash,
  sameRoute,
  setDocumentTitle,
  type Route,
} from './app/router';
import { getTravelCity, pickLocale, travelCities } from './catalog';
import { runViewTransition } from './ui/motion';
import { mountTooltip } from './ui/tooltip';
import { mountMap } from './map/map';
import { mountCity, mountCityNav, type CityRouteState } from './views/places';
import { closePlace, mountPlacePanel, openPlaceId } from './views/place-panel';
import { loadTripFiles, mountTrip, mountTripNav } from './trip/mount';

bootTheme();

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('missing #app');

mountTooltip();

function closeOpenPopover(): boolean {
  try {
    const open = document.querySelector<HTMLElement>(':popover-open');
    if (open && typeof open.hidePopover === 'function') {
      open.hidePopover();
      return true;
    }
  } catch {
    /* :popover-open is unsupported */
  }
  const manual = document.querySelector<HTMLElement>(
    '.tb-popover:not([hidden]), [data-popover]:not([hidden])',
  );
  if (!manual) return false;
  manual.hidden = true;
  return true;
}

window.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  if (closeOpenPopover()) {
    event.preventDefault();
    return;
  }
  if (!openPlaceId()) return;
  event.preventDefault();
  closePlace({ focus: true });
});

const shell = mountShell(root);
const map = mountMap(shell.mapHost);
mountPlacePanel(shell.mapHost.parentElement ?? shell.mapHost, map);

let dispose = () => {};
let syncCity: ((state: CityRouteState) => void) | null = null;
let current: Route | null = null;

function cityLabel(slug: string): string {
  const city = getTravelCity(slug);
  return city ? pickLocale(shell.locale(), city.name) : slug;
}

function citySource(slug: string): string {
  return pickLocale(shell.locale(), {
    en: `city · ${slug}`,
    'pt-BR': `cidade · ${slug}`,
  });
}

function paintCities(fit: boolean) {
  const locale = shell.locale();
  map.setCities(
    travelCities.map((city) => ({
      id: city.slug,
      lat: city.lat,
      lng: city.lng,
      label: pickLocale(locale, city.name),
    })),
    { fit },
  );
}

function clearMap() {
  map.highlight(null);
  map.setOverview(null);
  map.setRoute([]);
  map.setRadius(null);
  map.setPins('place', []);
  map.setPins('hotel', []);
  map.setPins('stop', []);
  map.setCities([]);
}

function applyChrome(route: Route, title: boolean) {
  if (route.kind === 'home') {
    cityNav.setActive(null);
    tripNav.setActive(null);
    shell.setExportEnabled(false);
    shell.setSource('content/trips');
    if (title) setDocumentTitle('');
    return;
  }
  if (route.kind === 'trip') {
    cityNav.setActive(null);
    tripNav.setActive(route.id);
    shell.setSource(`content/trips/${route.id}.md`);
    if (title) setDocumentTitle(route.id);
    return;
  }
  tripNav.setActive(null);
  cityNav.setActive(route.slug);
  shell.setSource(citySource(route.slug));
  setDocumentTitle(cityLabel(route.slug));
}

function show(route: Route, mode: 'push' | 'replace' | 'none') {
  const previous = current;
  if (mode !== 'none') commitRoute(route, mode);
  current = route;

  if (
    syncCity &&
    previous?.kind === 'city' &&
    route.kind === 'city' &&
    previous.slug === route.slug
  ) {
    applyChrome(route, false);
    syncCity({ tab: route.tab, place: route.place, day: route.day });
    return;
  }

  if (previous?.kind === 'trip' && route.kind === 'trip' && previous.id === route.id) {
    applyChrome(route, false);
    return;
  }

  const swap = () => {
    dispose();
    syncCity = null;
    applyChrome(route, true);

    if (route.kind === 'home') {
      clearMap();
      shell.showEmpty();
      const off = map.onSelect((id) => {
        if (current?.kind !== 'home') return;
        if (!travelCities.some((city) => city.slug === id)) return;
        show({ kind: 'city', slug: id, tab: 'places' }, 'push');
      });
      paintCities(true);
      dispose = () => {
        off();
        map.setCities([]);
      };
      return;
    }

    if (route.kind === 'trip') {
      const view = mountTrip(shell.main, map, route.id, shell);
      dispose = () => view.dispose();
      return;
    }

    const slug = route.slug;
    const view = mountCity(
      shell.main,
      map,
      slug,
      shell,
      { tab: route.tab, place: route.place, day: route.day },
      (state) => {
        if (current?.kind !== 'city' || current.slug !== slug) return;
        const next: Route = {
          kind: 'city',
          slug,
          tab: state.tab,
          ...(state.place ? { place: state.place } : {}),
          ...(state.day != null ? { day: state.day } : {}),
        };
        const history = navigationMode(current, next);
        if (sameRoute(current, next)) return;
        current = next;
        commitRoute(next, history);
      },
    );
    syncCity = (state) => view.sync(state);
    dispose = () => {
      syncCity = null;
      view.dispose();
    };
  };

  if (previous) runViewTransition(swap);
  else swap();
}

const cityNav = mountCityNav(shell.navCities, shell, (slug) => {
  if (current?.kind === 'city' && current.slug === slug) return;
  show({ kind: 'city', slug, tab: 'places' }, 'push');
});

const tripNav = mountTripNav(shell.navTrips, shell, (id) => {
  if (current?.kind === 'trip' && current.id === id) return;
  show({ kind: 'trip', id }, 'push');
});

function onHistory() {
  const route = parseHash(location.hash);
  if (!route) {
    void openFirst();
    return;
  }
  if (sameRoute(route, current)) return;
  show(route, 'none');
}

async function openFirst() {
  try {
    const files = await loadTripFiles();
    if (parseHash(location.hash)) return;
    const first = files[0];
    if (first) show({ kind: 'trip', id: first.id }, 'replace');
  } catch {
    /* The shell already shows the empty state. */
  }
}

window.addEventListener('hashchange', onHistory);
window.addEventListener('popstate', onHistory);

shell.onLocale(() => {
  if (current?.kind === 'home') {
    paintCities(false);
    return;
  }
  if (current?.kind !== 'city') return;
  setDocumentTitle(cityLabel(current.slug));
  shell.setSource(citySource(current.slug));
});

mountSearch(shell, route => show(route, 'push'));

const initial = parseHash(location.hash);
if (initial) show(initial, 'none');
else void openFirst();

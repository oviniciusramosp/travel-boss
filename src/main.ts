import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/tokens.css';
import './styles/icons.css';
import './styles/app.css';
import './styles/places.css';
import './styles/trip.css';
import './styles/hotels.css';
import './styles/ui.css';
import { mountShell } from './app/shell';
import {
  commitRoute,
  navigationMode,
  parseHash,
  sameRoute,
  setDocumentTitle,
  type Route,
} from './app/router';
import { getTravelCity, pickLocale } from './catalog';
import { mountTooltip } from './ui/tooltip';
import { mountMap } from './map/map';
import { mountCity, mountCityNav, type CityRouteState } from './views/places';
import { mountPlacePanel } from './views/place-panel';
import { loadTripFiles, mountTrip, mountTripNav } from './trip/mount';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('missing #app');

mountTooltip();
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

function applyChrome(route: Route, title: boolean) {
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

  dispose();
  syncCity = null;
  applyChrome(route, true);

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
  if (current?.kind !== 'city') return;
  setDocumentTitle(cityLabel(current.slug));
  shell.setSource(citySource(current.slug));
});

const initial = parseHash(location.hash);
if (initial) show(initial, 'none');
else void openFirst();

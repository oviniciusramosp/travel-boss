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
import { mountTooltip } from './ui/tooltip';
import { mountMap } from './map/map';
import { mountCity, mountCityNav } from './views/places';
import { mountPlacePanel } from './views/place-panel';
import { mountTrip, mountTripNav } from './trip/mount';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('missing #app');

mountTooltip();
const shell = mountShell(root);
const map = mountMap(shell.mapHost);
mountPlacePanel(shell.mapHost.parentElement ?? shell.mapHost, map);

let dispose = () => {};
let current: { kind: 'city'; slug: string } | { kind: 'trip'; id: string } | null =
  null;
const cityNav = mountCityNav(shell.navCities, shell, (slug) => {
  if (current?.kind === 'city' && current.slug === slug) return;
  showCity(slug);
});

const tripNav = mountTripNav(shell.navTrips, shell, (id) => {
  if (current?.kind === 'trip' && current.id === id) return;
  showTrip(id);
});

function showCity(slug: string) {
  dispose();
  current = { kind: 'city', slug };
  tripNav.setActive(null);
  cityNav.setActive(slug);
  shell.setExportEnabled(false);
  shell.setSource(`cidade · ${slug}`);
  const view = mountCity(shell.main, map, slug, shell);
  dispose = () => view.dispose();
}

function showTrip(id: string) {
  dispose();
  current = { kind: 'trip', id };
  cityNav.setActive(null);
  tripNav.setActive(id);
  shell.setSource(`content/trips/${id}.md`);
  const view = mountTrip(shell.main, map, id, shell);
  dispose = () => view.dispose();
}

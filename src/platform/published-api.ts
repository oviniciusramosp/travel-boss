import { type ChecklistItem } from '../trip/checklist-state';
import savedPlaces from '../data/travel-place-edits.json';
import { type PlaceEditStore } from '../catalog/place-edit-model';
import { OPEN_METEO_FORECAST_URL, openMeteoForecastQuery, forecastToEnsemble, extendForecast } from '../trip/weather-source';

const trips = import.meta.glob<string>('../../content/trips/*.md', { eager: true, query: '?raw', import: 'default' });
const checklists = import.meta.glob<ChecklistItem[]>('../../content/checklists/*.json', { eager: true, import: 'default' });
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function trip(id: string) {
  const file = `../../content/trips/${id}.md`;
  const base = trips[file];
  return base === undefined ? null : { id, file: `content/trips/${id}.md`, raw: base };
}

export function publishedPlaceEdits(): PlaceEditStore {
  return savedPlaces;
}

/** Static deployment adapter. Never sends PATCH requests to GitHub Pages. */
export async function publishedRequest(path: string, options?: RequestInit): Promise<Response> {
  const url = new URL(path, 'https://travel.invalid');
  const parts = url.pathname.split('/');
  const kind = parts[2];
  const id = decodeURIComponent(parts[3] ?? '');
  if ((options?.method ?? 'GET').toUpperCase() !== 'GET') return reply({ error: 'Publication is read-only' }, 405);
  if (kind === 'trips') {
    if (!id) return reply(Object.keys(trips).map(file => trip(file.split('/').pop()!.slice(0, -3))));
    const value = trip(id);
    if (!value) return reply({}, 404);
    return reply(value);
  }
  if (kind === 'checklists') {
    if (!trip(id)) return reply({}, 404);
    return reply(checklists[`../../content/checklists/${id}.json`] ?? []);
  }
  if (kind === 'weather') {
    const query = url.searchParams;
    const lat = Number(query.get('lat'));
    const lng = Number(query.get('lng'));
    const tz = query.get('tz') ?? 'UTC';
    const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${openMeteoForecastQuery(lat, lng, tz)}`, { signal: options?.signal }).catch(() => null);
    const primary = response?.ok ? forecastToEnsemble(await response.json().catch(() => null)) : null;
    const hours = await extendForecast(primary, lat, lng, tz, options?.signal);
    return hours ? reply({ hours, at: Date.now(), source: 'Open-Meteo' })
      : reply({ error: response?.status === 429 ? 'limit' : response ? 'http' : 'network' }, 502);
  }
  return reply({ error: 'Unavailable on static hosting' }, 503);
}

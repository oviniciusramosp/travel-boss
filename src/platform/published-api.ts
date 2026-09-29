import { type ChecklistItem } from '../trip/checklist-state';
import savedPlaces from '../data/travel-place-edits.json';
import { type PlaceEditStore } from '../catalog/place-edit-model';
import { OPEN_METEO_FORECAST_URL, openMeteoForecastQuery, forecastToEnsemble } from '../trip/weather-source';

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
    const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${openMeteoForecastQuery(Number(query.get('lat')), Number(query.get('lng')), query.get('tz') ?? 'UTC')}`, { signal: options?.signal });
    if (!response.ok) return reply({ error: response.status === 429 ? 'limit' : 'http' }, response.status);
    const hours = forecastToEnsemble(await response.json());
    return hours ? reply({ hours, at: Date.now(), source: 'Open-Meteo (modelo)' }) : reply({ error: 'http' }, 502);
  }
  return reply({ error: 'Unavailable on static hosting' }, 503);
}

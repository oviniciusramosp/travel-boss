import { applyTripPatch, readTripPatch } from '../trip/api';
import { editChecklist, type ChecklistItem } from '../trip/checklist-state';
import savedPlaces from '../data/travel-place-edits.json';
import { readPlaceEdits, type PlaceEditStore } from '../catalog/place-edit-model';
import { OPEN_METEO_FORECAST_URL, openMeteoForecastQuery, forecastToEnsemble } from '../trip/weather-source';

const trips = import.meta.glob<string>('../../content/trips/*.md', { eager: true, query: '?raw', import: 'default' });
const checklists = import.meta.glob<ChecklistItem[]>('../../content/checklists/*.json', { eager: true, import: 'default' });
const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/** Published edits belong to this browser; a changed published source supersedes its old draft. */
export function browserValue<T>(key: string, base: T, next?: T): T {
  const name = `tb-published:${key}`;
  if (next !== undefined) {
    localStorage.setItem(name, JSON.stringify({ base, value: next }));
    return next;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(name) ?? 'null');
    return saved && JSON.stringify(saved.base) === JSON.stringify(base) ? saved.value : base;
  } catch { return base; }
}

function trip(id: string) {
  const file = `../../content/trips/${id}.md`;
  const base = trips[file];
  return base === undefined ? null : { id, file: `content/trips/${id}.md`, raw: browserValue(`trip:${id}`, base) };
}

export function publishedPlaceEdits(): PlaceEditStore {
  return browserValue<PlaceEditStore>('places', savedPlaces);
}

/** Static deployment adapter. Never sends PATCH requests to GitHub Pages. */
export async function publishedRequest(path: string, options?: RequestInit): Promise<Response> {
  const url = new URL(path, 'https://travel.invalid');
  const parts = url.pathname.split('/');
  const kind = parts[2];
  const id = decodeURIComponent(parts[3] ?? '');
  const patch = options?.method === 'PATCH';
  let body: unknown;
  if (patch) {
    try { body = JSON.parse(String(options?.body)); } catch { return reply({}, 400); }
  }
  if (kind === 'trips') {
    if (!id) return reply(Object.keys(trips).map(file => trip(file.split('/').pop()!.slice(0, -3))));
    const value = trip(id);
    if (!value) return reply({}, 404);
    if (!patch) return reply(value);
    const edit = readTripPatch(body);
    if (!edit) return reply({}, 400);
    const result = applyTripPatch(value.raw, edit);
    if (!result) return reply({}, 409);
    browserValue(`trip:${id}`, trips[`../../content/trips/${id}.md`], result.raw);
    return reply({ line: result.line });
  }
  if (kind === 'checklists') {
    if (!trip(id)) return reply({}, 404);
    const base = checklists[`../../content/checklists/${id}.json`] ?? [];
    const items = browserValue(`checklist:${id}`, base);
    if (!patch) return reply(items);
    const result = editChecklist(items, body);
    if (!result) return reply({}, 409);
    return reply(browserValue(`checklist:${id}`, base, result));
  }
  if (kind === 'places' && patch) {
    const edit = readPlaceEdits(body);
    if (!id || !edit) return reply({}, 400);
    const edits = { ...publishedPlaceEdits() };
    edits[id] = { ...edits[id], ...edit };
    return reply(browserValue<PlaceEditStore>('places', savedPlaces, edits));
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

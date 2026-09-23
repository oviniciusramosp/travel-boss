import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { haversineM, nightsBetween } from './hotel-search-match.mjs';
const run = promisify(execFile);
const python = fileURLToPath(new URL('../node_modules/.cache/airbnb-venv/bin/python', import.meta.url));
const script = fileURLToPath(new URL('./airbnb-search.py', import.meta.url));
const snapshotPath = fileURLToPath(new URL('../node_modules/.cache/airbnb-snapshots.json', import.meta.url));
const snapshots = new Map();
try {
  for (const h of JSON.parse(readFileSync(snapshotPath, 'utf8')).slice(-500)) {
    if (h.source === 'airbnb' && Date.now() - Date.parse(h.airbnb?.fetchedAt) < 86400000) snapshots.set(h.id, h);
  }
} catch { /* no saved evidence yet */ }

export const airbnbReady = () => existsSync(python);
export const airbnbSnapshot = (id) => {
  const h = snapshots.get(id);
  return h && Date.now() - Date.parse(h.airbnb.fetchedAt) < 86400000 ? h : undefined;
};
async function extract(params) {
  if (!airbnbReady()) throw new Error('Airbnb: execute npm run travel:airbnb:setup para instalar a busca gratuita.');
  try {
    const { stdout } = await run(python, [script, JSON.stringify(params)], { timeout: 180000, maxBuffer: 24 * 1024 * 1024 });
    return JSON.parse(stdout);
  } catch { throw new Error('Airbnb indisponível nesta tentativa. Tente novamente; os resultados das outras fontes foram preservados.'); }
}
const score5 = (n) => Number.isFinite(Number(n)) && Number(n) > 0 && Number(n) <= 5 ? Number(n) : null;
function airbnbType(title = '') {
  if (/guesthouse|bed and breakfast/i.test(title)) return { en: 'Guesthouse', pt: 'Pousada' };
  if (/hotel/i.test(title)) return { en: 'Hotel', pt: 'Hotel' };
  if (/room in/i.test(title)) return { en: 'Private room', pt: 'Quarto privativo' };
  if (/apartment|rental unit|condo/i.test(title)) return { en: 'Apartment', pt: 'Apartamento' };
  return { en: 'Vacation rental', pt: 'Aluguel por temporada' };
}
export function normalizeAirbnb(row, params, detail = null) {
  const total = row.price?.break_down?.find((v) => /^total$/i.test(v.description?.trim()));
  // No nightly/instalment arithmetic: accept only an explicit BRL stay total.
  if (!total || total.currency !== 'R$' || !Number.isFinite(total.amount) || total.amount <= 0) return null;
  const lat = row.coordinates?.latitude, lng = row.coordinates?.longitud;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !/^\d+$/.test(row.room_id)) return null;
  const km = haversineM(lat, lng, params.centre.lat, params.centre.lng) / 1000;
  const rating = score5(row.rating?.value);
  if (total.amount < (params.minTotal ?? 0) || total.amount > (params.maxTotal ?? Infinity) || km > (params.maxKm ?? 5) || (rating ?? 0) * 2 < (params.minScore ?? 7)) return null;
  const nights = nightsBetween(params.checkin, params.checkout);
  const pricedNights = row.price.break_down.map((v) => /^(\d+) nights?\b/i.exec(v.description ?? '')).find(Boolean);
  if (!pricedNights || Number(pricedNights[1]) !== nights) return null;
  const amenities = detail?.amenities?.flatMap((g) => g.values ?? []) ?? [];
  const wifi = amenities.find((a) => /wi[ -]?fi/i.test(a.title));
  const cleanliness = score5(detail?.rating?.cleanliness);
  const photos = [...new Set([...(row.images ?? []), ...(detail?.images ?? [])].map((i) => i.url).filter((u) => /^https:\/\//.test(u)))].slice(0, 12);
  const url = new URL(`https://www.airbnb.com/rooms/${row.room_id}`);
  url.search = new URLSearchParams({ check_in: params.checkin, check_out: params.checkout, adults: String(params.adults ?? 2), currency: 'BRL' });
  return {
    id: `airbnb:${row.room_id}`, uid: row.room_id, source: 'airbnb', name: row.name || row.title,
    lat, lng, locationApproximate: true, km, currency: 'BRL', priceTotal: total.amount,
    priceNight: Math.round(total.amount / nights * 100) / 100, azulUrl: '',
    type: { id: null, ...airbnbType(row.title) },
    airbnb: { rating, categoryScores: detail?.rating ?? {}, priceBreakdown: row.price.break_down, fetchedAt: new Date().toISOString() },
    // Shared legacy review envelope. Source always determines labels and requirements.
    booking: { name: row.name, score: (rating ?? 0) * 2, reviews: Number(row.rating?.reviewCount) || null,
      url: url.href, img: photos[0] ?? null, photos, address: null, distanceM: 0,
      categoryScores: { cleanliness: cleanliness == null ? null : cleanliness * 2, comfort: null, facilities: null, staff: null },
      wifiAvailable: wifi?.available === false ? false : wifi?.available === true ? true : null },
  };
}
export async function searchAirbnb(params, emit = () => {}) {
  if (!params.centre) throw new Error('Airbnb: a busca precisa do centro da cidade.');
  emit({ type: 'status', message: 'Airbnb: buscando estadias e percorrendo as páginas…' });
  const data = await extract(params);
  const candidates = data.listings.map((r) => ({ row: r, hotel: normalizeAirbnb(r, params) })).filter((r) => r.hotel).sort((a,b) => a.hotel.km-b.hotel.km);
  const selected = candidates.slice(0, Math.min(params.limit ?? 100, 50));
  emit({ type: 'status', message: `Airbnb: ${data.listings.length} anúncios, verificando comodidades de ${selected.length}…` });
  let details = {}, detailsWarning = [];
  try { details = selected.length ? await extract({ mode: 'details', ids: selected.map((c) => c.row.room_id) }) : {}; }
  catch { detailsWarning = ['Airbnb: detalhes indisponíveis; Wi-Fi e limpeza precisam de confirmação.']; }
  const hotels = selected.map(({row}) => normalizeAirbnb(row, params, details[row.room_id]));
  hotels.forEach((h) => snapshots.set(h.id, h));
  while (snapshots.size > 500) snapshots.delete(snapshots.keys().next().value);
  try {
    mkdirSync(dirname(snapshotPath), { recursive: true });
    writeFileSync(snapshotPath, JSON.stringify([...snapshots.values()]), { mode: 0o600 });
  } catch { /* reranking still works in this session */ }
  return { hotels, total: data.listings.length, inRange: candidates.length, candidates: selected.length,
    warnings: [...detailsWarning, ...(data.truncated ? ['Airbnb: limite de páginas atingido; a busca pode não cobrir todos os anúncios.'] : []), ...(candidates.length > selected.length ? [`Airbnb: detalhes dos ${selected.length} anúncios mais centrais; refine o raio para explorar outras opções.`] : [])] };
}

/**
 * Azul Viagens × Booking.com hotel cross-check — dev-only backend.
 *
 * Azul uses a cookie-bound HTTP/1.1 session via curl_cffi because its search
 * handler can fail with ERR_HTTP2_PROTOCOL_ERROR in Chrome. The browser is a
 * fallback for Azul and the primary client for Booking's pages. PinchTab must
 * be running for the Booking cross-check.
 *
 * Exposed to the site via a Vite dev plugin (scripts/vite-hotel-plugin.mjs):
 *   GET /api/hotel-search/status
 *   GET /api/hotel-search?city=Roma&checkin=YYYY-MM-DD&checkout=YYYY-MM-DD
 *       &adults=2&minTotal=0&maxTotal=2500&maxKm=5&minScore=7&limit=100
 *       &centerLat=41.9028&centerLng=12.4964
 *   Prices are for the WHOLE stay; maxKm is measured from the city centre.
 *   → NDJSON stream: {type:'status'|'progress'|'error'|'done', ...}
 *
 * Only exists under `vite dev`; a static build has no API.
 */
import { execFile } from 'node:child_process';
import { promisify, parseEnv } from 'node:util';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { searchAirbnb, airbnbSnapshot, airbnbReady } from './airbnb-search.mjs';
import { rankHotels } from './hotel-ranking.mjs';
import { extractBookingDetails, parseCategoryScores } from './hotel-booking-details.mjs';
import {
  accommodationType,
  azulHotelUrl,
  bestBookingMatch,
  bookingPhotoUrl,
  bookingHotelUrl,
  bookingImageLarge,
  bookingSearchUrl,
  decodeEntities,
  filterCandidates,
  foldText,
  haversineM,
  nightsBetween,
  parseBookingScore,
  pickZone,
  simplifyHotelName,
} from './hotel-search-match.mjs';

const run = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const CACHE_PATH = resolve(__dirname, '../node_modules/.cache/hotel-search-booking.json');
const CACHE_TTL_MS = 7 * 864e5;
const BOOKING_CONCURRENCY = 5;
const AZUL = 'https://www.azulviagens.com.br';

const log = (...a) => console.log('[hotel-search]', ...a);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── PinchTab CLI ───────────────────────────────────────────────────────────

let ptServer = process.env.HOTEL_SEARCH_PINCHTAB_SERVER || null;

async function discoverServer() {
  const { stdout } = await run('pinchtab', ['instances'], { encoding: 'utf8', timeout: 10000 });
  const inst = JSON.parse(stdout || '[]').find((i) => i.status === 'running');
  if (!inst) throw new Error('pinchtab: nenhuma instância rodando (abra o dashboard / `pinchtab server`)');
  return `http://localhost:${inst.port}`;
}

async function pt(args, { timeout = 60000 } = {}) {
  if (!ptServer) ptServer = await discoverServer();
  const { stdout } = await run(
    'pinchtab',
    ['--server', ptServer, '--agent-id', 'hotel-search', ...args],
    { encoding: 'utf8', timeout, maxBuffer: 32 * 1024 * 1024 },
  );
  return stdout.trim();
}

async function openTab(url) {
  const out = await pt(['nav', url, '--new-tab', '--print-tab-id', '--block-images'], { timeout: 45000 });
  const tab = out.split('\n').pop().trim();
  if (!/^[0-9A-F]{16,}$/i.test(tab)) throw new Error(`pinchtab nav: tab id inesperado "${tab.slice(0, 60)}"`);
  return tab;
}

async function evalIn(tab, expr, { awaitPromise = false, timeout } = {}) {
  const out = await pt(
    ['eval', ...(awaitPromise ? ['--await-promise'] : []), expr, '--tab', tab],
    { timeout },
  );
  if (!out) throw new Error('pinchtab eval: resposta vazia (aba morta ou fetch bloqueado)');
  return JSON.parse(out).result;
}

const closeTab = (tab) => pt(['tab', 'close', tab]).catch(() => {});

// ── Azul (same-origin fetches inside one long-lived tab) ───────────────────

let azulTab = null;

/**
 * Akamai only lets the JSON endpoints through once its sensor script has
 * finished posting from a loaded page: fetching right after `networkidle`
 * fails with "Failed to fetch". Hence the settle delay, and a health check
 * (cheap zone lookup) before the tab is trusted.
 */
const AZUL_SETTLE_MS = 10000;

async function azulTabHealthy(tab) {
  try {
    return (
      (await evalIn(
        tab,
        azulFetch(
          '/include/ctlZoneSelector/ashx/jsonZoneSelector.ashx?language=pt&product=hotels&queryType=zones&q=Roma',
          'status',
        ),
        { awaitPromise: true, timeout: 45000 },
      )) === 200
    );
  } catch {
    return false;
  }
}

async function openAzulTab() {
  const tab = await openTab(`${AZUL}/hotels/`);
  await pt(['wait', '--load', 'networkidle', '--timeout', '20000', '--tab', tab]).catch(() => {});
  await sleep(AZUL_SETTLE_MS);
  return tab;
}

async function ensureAzulTab({ fresh = false } = {}) {
  if (azulTab && !fresh && (await azulTabHealthy(azulTab))) return azulTab;
  // Never leave the old tab behind — they pile up across dev-server restarts
  if (azulTab) {
    void closeTab(azulTab);
    azulTab = null;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    const tab = await openAzulTab();
    if (await azulTabHealthy(tab)) {
      azulTab = tab;
      return tab;
    }
    log(`aba da Azul bloqueada (tentativa ${attempt})`);
    void closeTab(tab);
  }
  throw new Error(
    'Não foi possível estabelecer uma sessão de busca com a Azul.',
  );
}

const BLOCKED = '__AZUL_NETWORK_FAILED__';

/**
 * A network/protocol failure rejects fetch before any HTTP response; it
 * must not be diagnosed as an anti-bot block without evidence. Map it to a
 * sentinel the callers can recognise.
 */
const azulFetch = (path, as = 'json') =>
  `fetch(${JSON.stringify(path)}, { headers: { 'x-requested-with': 'XMLHttpRequest', accept: ${JSON.stringify(as === 'text' ? 'text/plain, */*; q=0.01' : 'application/json, text/javascript, */*; q=0.01')} } }).then(r => ${as === 'status' ? 'r.status' : `r.${as}()`}, () => ${JSON.stringify(BLOCKED)})`;

class AzulConnectionError extends Error {
  constructor() {
    super(
      'A conexão com a Azul falhou. A fonte está temporariamente indisponível; não foi possível confirmar preços.',
    );
    this.name = 'AzulConnectionError';
  }
}

async function azulZone(tab, city) {
  const q = new URLSearchParams({
    language: 'pt', categorize: 'simple', product: 'hotels', onlyWithProductIn: '1', queryType: 'zones', q: city,
  });
  const zones = await evalIn(tab, azulFetch(`/include/ctlZoneSelector/ashx/jsonZoneSelector.ashx?${q}`), { awaitPromise: true });
  if (zones === BLOCKED) throw new AzulConnectionError();
  return pickZone(zones, city);
}

async function azulSession(tab, zoneId, checkin, checkout, adults) {
  // paxs=20 is what the site sends for 1 room / 2 adults / 0 children.
  const q = new URLSearchParams({
    _: String(Date.now()), searchType: 'hotels', destinationID: String(zoneId),
    startDate: checkin, endDate: checkout, paxs: `${adults}0`, hashParams: '',
  });
  const text = await evalIn(tab, azulFetch(`/handlers/searcher.ashx?accion=searchhotels&${q}`, 'text'), { awaitPromise: true, timeout: 180000 });
  if (text === BLOCKED) throw new AzulConnectionError();
  const id = parseInt(String(text).trim(), 10);
  if (!(id > 0)) throw new Error(`Azul: searchSessionID inválido ("${String(text).slice(0, 80)}")`);
  return id;
}

/** Every hotel of the search (summary.hotels) — first call blocks while Azul queries providers (~15–20s). */
async function azulHotels(tab, sessionId) {
  const path = `/hotels/ashx/results.ashx?searchSessionID=${sessionId}&currency=BRL&order=etiquetaPrecio&page=1`;
  const expr = `${azulFetch(path)}.then(j => j === ${JSON.stringify(BLOCKED)} ? j : ({ errorType: j.summary && j.summary.errorType, hotels: ((j.summary && j.summary.hotels) || []).map(h => ({ id: h.ID, uid: h.UID, name: h.name, lat: h.latitude, lng: h.longitude, price: h.priceFrom, currency: h.currencyFrom })) }))`;
  for (let attempt = 1; attempt <= 3; attempt++) {
    const r = await evalIn(tab, expr, { awaitPromise: true, timeout: 120000 });
    if (r === BLOCKED) throw new AzulConnectionError();
    if (r?.hotels?.length) return r.hotels.map((h) => ({ ...h, name: decodeEntities(h.name) }));
    log(`Azul results vazios (tentativa ${attempt}, errorType=${r?.errorType})`);
    await sleep(4000);
  }
  return [];
}

// ── Booking (one throwaway tab per hotel, cached 7 days) ───────────────────

let cache = null;
function loadCache() {
  if (cache) return cache;
  try {
    cache = existsSync(CACHE_PATH) ? JSON.parse(readFileSync(CACHE_PATH, 'utf8')) : {};
  } catch {
    cache = {};
  }
  return cache;
}
function saveCache() {
  try {
    mkdirSync(dirname(CACHE_PATH), { recursive: true });
    writeFileSync(CACHE_PATH, JSON.stringify(cache));
  } catch (err) {
    log('cache write failed', err.message);
  }
}

const BOOKING_WAIT = `!!document.querySelector('[data-testid="property-card"]') || /errorc_searchstring_not_found/.test(location.href)`;

/**
 * Every property card on the results page (Booking may rank a sponsored hotel
 * first) + the Apollo BasicPropertyData blocks that carry coords/address,
 * joined by the hotel page name from each card link.
 */
const BOOKING_EXTRACT = String.raw`(() => {
  const cards = [...document.querySelectorAll('[data-testid="property-card"]')].slice(0, 25);
  if (!cards.length) return { notFound: /errorc_searchstring_not_found/.test(location.href), cards: [] };
  const props = {};
  for (const ch of document.documentElement.innerHTML.split('"__typename":"BasicPropertyData"').slice(1)) {
    const pn = (ch.match(/"pageName":"([^"]+)"/) || [])[1];
    const at = (ch.match(/"accommodationTypeId":(\d+)/) || [])[1];
    const m = ch.match(/"id":(\d+)[^]*?"address":"([^"]*)","city":"([^"]*)"[^]*?"latitude":([-\d.]+),"longitude":([-\d.]+)/);
    if (pn && m && !props[pn]) props[pn] = { id: Number(m[1]), typeId: at ? Number(at) : null, address: m[2], city: m[3], lat: Number(m[4]), lng: Number(m[5]) };
  }
  return {
    notFound: false,
    cards: cards.map((c) => {
      const link = c.querySelector('a[data-testid="title-link"]');
      const href = link ? link.href : '';
      const pn = (href.match(/\/hotel\/[a-z]{2}\/([^.?#]+)\./) || [])[1] || null;
      const img = c.querySelector('img');
      const scoreEl = c.querySelector('[data-testid="review-score"]');
      const titleEl = c.querySelector('[data-testid="title"]');
      return Object.assign({
        name: titleEl ? titleEl.textContent.trim() : '',
        scoreText: scoreEl ? scoreEl.textContent.replace(/\s+/g, ' ').trim() : '',
        link: href ? href.split('?')[0] : null,
        img: img ? img.src : null,
        pageName: pn,
      }, pn && props[pn] ? props[pn] : {});
    }),
  };
})()`;

async function bookingPage(query) {
  let tab = null;
  try {
    tab = await openTab(query);
    await pt(['wait', '--fn', BOOKING_WAIT, '--timeout', '20000', '--tab', tab]).catch(() => {});
    return await evalIn(tab, BOOKING_EXTRACT);
  } finally {
    if (tab) void closeTab(tab);
  }
}

/**
 * Booking cards for one Azul hotel. Booking's free-text resolver is flaky
 * ("Hotel X, Roma" may land on a generic city page while "Hotel X" alone hits
 * the property), so try a cascade of query strings and stop at the first page
 * that contains a geo/name match. Cached 7 days per hotel+city.
 */
async function bookingLookup({ azul, city, checkin, checkout, adults }) {
  const store = loadCache();
  // v4: cards now carry pageName + accommodationTypeId (type badge, gallery)
  const key = `v4|${foldText(azul.name).replace(/\s+/g, ' ').trim()}|${foldText(city).trim()}`;
  const hit = store[key];
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const name = azul.name.trim();
  const bare = simplifyHotelName(name, city);
  const queries = [...new Set([`${name}, ${city}`, name, bare ? `${bare} ${city}` : null].filter(Boolean))];
  let cards = [];
  try {
    for (const ss of queries) {
      const page = await bookingPage(bookingSearchUrl({ ss, checkin, checkout, adults }));
      cards = cards.concat(page.cards);
      if (bestBookingMatch(azul, page.cards, city).best) break;
    }
  } catch (err) {
    log(`Booking lookup falhou para "${name}": ${err.message.split('\n')[0]}`);
  }
  const data = { cards };
  store[key] = { at: Date.now(), data };
  saveCache();
  return data;
}

/**
 * Booking's results page carries a single photo per hotel; the gallery lives
 * on the hotel page. Only the hotels that survive the score filter are worth
 * the extra navigation, so this runs after matching, not during.
 */
const DETAILS_EXTRACT = `(${extractBookingDetails.toString()})()`;

async function bookingDetails(pageName, cc = 'it') {
  if (!pageName) return null;
  const store = loadCache();
  const key = `details-v1|${cc}|${pageName}`;
  const hit = store[key];
  if (hit && Date.now() - hit.at < 864e5) return hit.data;

  let details = null;
  let tab = null;
  try {
    tab = await openTab(`https://www.booking.com/hotel/${cc}/${pageName}.html?lang=en-us`);
    await pt(['wait', '--fn', 'document.querySelectorAll(\'[data-testid="review-subscore"]\').length > 0', '--timeout', '10000', '--tab', tab]).catch(() => {});
    const raw = await evalIn(tab, DETAILS_EXTRACT);
    if (raw) {
      const categoryScores = parseCategoryScores(raw.categoryRows);
      const overall = parseBookingScore(raw.overallText);
      details = {
        categoryScores,
        wifiAvailable: raw.wifiAvailable ?? (categoryScores.wifi != null ? true : null),
        score: overall.score, reviews: overall.reviews,
        photos: (raw.photos ?? []).map((u) => bookingPhotoUrl(u)).filter(Boolean),
        fetchedAt: new Date().toISOString(),
      };
    }
  } catch (err) {
    log(`detalhes falharam para ${pageName}: ${err.message.split('\n')[0]}`);
  } finally {
    if (tab) void closeTab(tab);
  }
  // Never cache a challenge page or a failed scrape as a successful detail lookup.
  if (details && Object.values(details.categoryScores).some((v) => v != null)) {
    store[key] = { at: Date.now(), data: details };
    saveCache();
  }
  return details;
}

export function bookingReference(booking) {
  try {
    const url = new URL(booking.url);
    if (url.protocol !== 'https:' || !['www.booking.com', 'booking.com'].includes(url.hostname)) return null;
    const match = url.pathname.match(/^\/hotel\/([a-z]{2})\/([a-z0-9_-]+)\.html$/i);
    return match ? { countryCode: match[1], pageName: match[2] } : null;
  } catch { return null; }
}

async function enrichBookingHotels(hotels, emit = () => {}) {
  let done = 0;
  await mapPool(hotels.filter((h) => h.source !== 'airbnb'), BOOKING_CONCURRENCY, async (h) => {
    const reference = bookingReference(h.booking);
    const details = reference ? await bookingDetails(reference.pageName, reference.countryCode) : null;
    h.booking.categoryScores = details?.categoryScores ?? parseCategoryScores();
    h.booking.wifiAvailable = details?.wifiAvailable ?? null;
    h.booking.detailsFetchedAt = details?.fetchedAt ?? null;
    if (details?.score != null) h.booking.score = details.score;
    if (details?.reviews != null) h.booking.reviews = details.reviews;
    if (details?.photos?.length) h.booking.photos = [...new Set([...(h.booking.photos ?? []), ...details.photos])].slice(0, 12);
    emit({ type: 'progress', done: ++done, total: hotels.length, name: h.name, phase: 'details' });
  });
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        out[i] = await fn(items[i], i);
      }
    }),
  );
  return out;
}

// ── Search ─────────────────────────────────────────────────────────────────

/**
 * @param {{city:string, checkin:string, checkout:string, adults?:number, minTotal?:number, maxTotal?:number, centre?:{lat:number,lng:number}|null, maxKm?:number, minScore?:number, limit?:number}} params
 * @param {(msg: object) => void} [emit] progress sink (NDJSON lines)
 */
async function searchAzulHotels(params, emit = () => {}, rankingOptions = {}) {
  const {
    city,
    checkin,
    checkout,
    adults = 2,
    minTotal = 0,
    maxTotal = Infinity,
    minScore = 7,
    limit = 100,
    centre = null,
    maxKm = Infinity,
  } = params;
  const nights = nightsBetween(checkin, checkout);
  if (!(nights >= 1)) throw new Error('check-out deve ser depois do check-in');

  emit({ type: 'status', message: `Azul: buscando hotéis em ${city}…` });
  let zone = null;
  let sessionId = null;
  let all = [];
  try {
    // Chrome can receive ERR_HTTP2_PROTOCOL_ERROR from the search handler even
    // when autocomplete works. HTTP/1.1 uses the same public endpoint and one
    // anonymous cookie session for autocomplete, search and results.
    const python = resolve(__dirname, '../node_modules/.cache/airbnb-venv/bin/python');
    if (!existsSync(python)) throw new Error('HTTP/1.1 helper not installed');
    const { stdout } = await run(python, [resolve(__dirname, 'azul-search.py'), JSON.stringify({ city, checkin, checkout, adults })],
      { encoding: 'utf8', timeout: 270000, maxBuffer: 16 * 1024 * 1024 });
    const result = JSON.parse(stdout);
    if (!result.zone || !Number.isInteger(result.sessionId) || !Array.isArray(result.hotels)) throw new Error('Invalid Azul response');
    zone = result.zone;
    sessionId = result.sessionId;
    all = result.hotels.map((h) => ({ ...h, name: decodeEntities(h.name) }));
  } catch {
    emit({ type: 'status', message: 'Azul: tentando a conexão pelo navegador…' });
    let tab = await ensureAzulTab();
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        zone = await azulZone(tab, city);
        if (!zone) throw new Error(`Azul: destino "${city}" não encontrado`);
        sessionId = await azulSession(tab, zone.id, checkin, checkout, adults);
        all = await azulHotels(tab, sessionId);
        break;
      } catch (err) {
        if (attempt === 2 || /não encontrado/.test(err.message)) throw err;
        log('Conexão da Azul falhou — renovando sessão do navegador');
        tab = await ensureAzulTab({ fresh: true });
      }
    }
  }
  if (!all.length) throw new Error('Azul: a busca não retornou hotéis (tente de novo em alguns segundos)');

  const inRange = filterCandidates(all, { minTotal, maxTotal, centre, maxKm });
  const candidates = inRange.slice(0, limit);
  const cityLabel = zone.name.split(',')[0].trim();
  const where = Number.isFinite(maxKm) ? ` até ${maxKm} km do centro` : '';
  emit({
    type: 'status',
    message: `Azul: ${all.length} hotéis, ${inRange.length} na faixa${where}${
      inRange.length > candidates.length ? ` (checando os ${candidates.length} mais centrais)` : ''
    }. Cruzando com o Booking…`,
  });

  let done = 0;
  const looked = await mapPool(candidates, BOOKING_CONCURRENCY, async (h) => {
    const booking = await bookingLookup({ azul: h, city: cityLabel, checkin, checkout, adults });
    done += 1;
    emit({ type: 'progress', done, total: candidates.length, name: h.name });
    return { azul: h, booking };
  });

  const hotels = [];
  const skipped = [];
  for (const { azul, booking } of looked) {
    const base = {
      id: azul.id,
      uid: azul.uid,
      name: azul.name,
      lat: azul.lat,
      lng: azul.lng,
      priceTotal: azul.price,
      priceNight: Math.round((azul.price / nights) * 100) / 100,
      currency: azul.currency || 'BRL',
      km: azul.km,
      azulUrl: azulHotelUrl(azul.uid),
    };
    const cards = booking?.cards ?? [];
    if (!cards.length) {
      skipped.push({ ...base, reason: 'not-found' });
      continue;
    }
    const { best, nearest } = bestBookingMatch(azul, cards, cityLabel);
    if (!best) {
      skipped.push({ ...base, reason: 'no-match', bookingName: nearest?.card.name ?? cards[0].name, distanceM: nearest?.distanceM ?? null });
      continue;
    }
    const s = parseBookingScore(best.card.scoreText);
    const entry = {
      ...base,
      // Use the matched property's coordinates for neighborhood and foot routing;
      // Azul's geocode can be up to 1.5 km away from the actual Booking property.
      lat: best.card.lat,
      lng: best.card.lng,
      type: accommodationType(best.card.typeId),
      booking: {
        name: best.card.name,
        score: s.score,
        label: s.label,
        reviews: s.reviews,
        url: bookingHotelUrl(best.card.link, { checkin, checkout, adults }),
        img: bookingImageLarge(best.card.img),
        photos: [bookingImageLarge(best.card.img)].filter(Boolean),
        pageName: best.card.pageName ?? null,
        countryCode: (best.card.link?.match(/\/hotel\/([a-z]{2})\//) || [])[1] ?? null,
        address: best.card.address ?? null,
        distanceM: best.distanceM,
      },
    };
    if (s.score == null) skipped.push({ ...entry, reason: 'no-score' });
    else if (s.score < minScore) skipped.push({ ...entry, reason: 'low-score' });
    else hotels.push(entry);
  }
  hotels.sort((a, b) => b.booking.score - a.booking.score || a.priceTotal - b.priceTotal);

  // Galleries: one hotel page per kept hotel, in parallel
  if (hotels.length) {
    emit({ type: 'status', message: `Booking: carregando notas por categoria e fotos de ${hotels.length} hotéis…` });
    await enrichBookingHotels(hotels, emit);
    for (let i = hotels.length - 1; i >= 0; i--) {
      if (hotels[i].booking.score < minScore) skipped.push({ ...hotels.splice(i, 1)[0], reason: 'low-score' });
    }
  }

  let ranked = { hotels, ranking: null };
  if (params.rankingContext && hotels.length) {
    emit({ type: 'status', message: 'Priorizando hotéis: rotas a pé, bairros, custo-benefício e JEV…' });
    ranked = await rankHotels(hotels, params.rankingContext, rankingOptions);
  }
  return {
    query: {
      city,
      checkin,
      checkout,
      adults,
      nights,
      minTotal,
      maxTotal: Number.isFinite(maxTotal) ? maxTotal : null,
      maxKm: Number.isFinite(maxKm) ? maxKm : null,
      minScore,
    },
    zone: { id: zone.id, name: zone.name },
    sessionId,
    totals: { azul: all.length, inRange: inRange.length, candidates: candidates.length, kept: hotels.length },
    ...ranked,
    skipped,
  };
}

/** Independent providers: a failed source must not erase successful results. */
export async function searchHotels(params, emit = () => {}, rankingOptions = {}) {
  const sources = params.sources ?? 'all';
  const [azul, airbnb] = await Promise.allSettled([
    sources === 'airbnb' ? null : searchAzulHotels({ ...params, rankingContext: null }, emit),
    sources === 'hotels' ? null : searchAirbnb(params, emit),
  ]);
  const failures = [azul.status === 'rejected' ? 'Azul/Booking' : null, airbnb.status === 'rejected' ? 'Airbnb' : null].filter(Boolean);
  const warnings = [azul, airbnb].filter((r) => r.status === 'rejected').map((r) => r.reason.message);
  const a = azul.status === 'fulfilled' ? azul.value : null;
  const b = airbnb.status === 'fulfilled' ? airbnb.value : null;
  if (!a && !b) throw new Error(warnings.join(' · '));
  const hotels = [...(a?.hotels ?? []), ...(b?.hotels ?? [])];
  emit({ type: 'status', message: `Avaliando ${(a?.hotels ?? []).length} hotéis da Azul/Booking + ${(b?.hotels ?? []).length} Airbnbs…` });
  const ranked = params.rankingContext && hotels.length ? await rankHotels(hotels, params.rankingContext, rankingOptions) : { hotels, ranking: null };
  return {
    query: { ...(a?.query ?? { ...params, rankingContext: undefined, nights: nightsBetween(params.checkin, params.checkout) }), sources },
    zone: a?.zone ?? null, sessionId: a?.sessionId ?? null,
    ...ranked, unavailableSources: failures, skipped: a?.skipped ?? [], warnings: [...warnings, ...(b?.warnings ?? [])],
    totals: { azul: a?.totals.azul ?? 0, airbnb: b?.total ?? 0,
      inRange: (a?.totals.inRange ?? 0) + (b?.inRange ?? 0),
      candidates: (a?.totals.candidates ?? 0) + (b?.candidates ?? 0), kept: hotels.length },
  };
}

// ── Astro dev integration ──────────────────────────────────────────────────

function parseParams(sp) {
  const str = (k, max = 80) => String(sp.get(k) ?? '').trim().slice(0, max);
  const num = (k, def, min, max) => {
    const raw = sp.get(k);
    if (raw == null || raw === '') return def;
    const n = Number(raw);
    if (!Number.isFinite(n)) throw new Error(`parâmetro inválido: ${k}`);
    return Math.min(max, Math.max(min, n));
  };
  const date = (k) => {
    const v = str(k, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || Number.isNaN(Date.parse(v))) throw new Error(`data inválida: ${k}`);
    return v;
  };
  const city = str('city');
  if (!city) throw new Error('cidade obrigatória');
  const lat = num('centerLat', NaN, -90, 90);
  const lng = num('centerLng', NaN, -180, 180);
  return {
    city,
    sources: ['all', 'hotels', 'airbnb'].includes(str('sources')) ? str('sources') : 'all',
    checkin: date('checkin'),
    checkout: date('checkout'),
    adults: Math.round(num('adults', 2, 1, 6)),
    // Price window is the WHOLE stay, not per night
    minTotal: num('minTotal', 0, 0, 1e7),
    maxTotal: num('maxTotal', Infinity, 0, 1e7),
    centre: Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null,
    maxKm: num('maxKm', Infinity, 0, 200),
    minScore: num('minScore', 7, 0, 10),
    // 5 Booking lookups run in parallel at ~1.5s each: 100 ≈ 30s, and a
    // 2-night R$2500 search in Rome already yields ~76 central candidates.
    limit: Math.round(num('limit', 100, 1, 150)),
  };
}

let busy = false;

function rankingKey() {
  const envPath = resolve(__dirname, '../.env');
  const localEnv = existsSync(envPath) ? parseEnv(readFileSync(envPath, 'utf8')) : {};
  let fileKey = localEnv.TYPESAFE_API_KEY;
  if (!fileKey) {
    const portfolioEnvPath = resolve(__dirname, '../../vinicius-ramos-portfolio/.env');
    const portfolioEnv = existsSync(portfolioEnvPath) ? parseEnv(readFileSync(portfolioEnvPath, 'utf8')) : {};
    fileKey = portfolioEnv.TYPESAFE_API_KEY;
  }
  return process.env.TYPESAFE_API_KEY || fileKey;
}

export function validateRankingHotels(input) {
  if (!Array.isArray(input) || !input.length || input.length > 200) throw new Error('Envie entre 1 e 200 hotéis.');
  const ids = new Set();
  return input.map((h) => {
    if (!h || typeof h.id !== 'string' || !h.id || h.id.length > 100 || ids.has(h.id) ||
        typeof h.name !== 'string' || h.name.length > 200 ||
        !Number.isFinite(h.lat) || Math.abs(h.lat) > 90 || !Number.isFinite(h.lng) || Math.abs(h.lng) > 180 ||
        !Number.isFinite(h.priceTotal) || h.priceTotal <= 0 || h.priceTotal > 1e7 ||
        !Number.isFinite(h.booking?.score) || h.booking.score < 0 || h.booking.score > 10 ||
        (h.booking.reviews != null && (!Number.isInteger(h.booking.reviews) || h.booking.reviews < 0 || h.booking.reviews > 1e8))) {
      throw new Error('Dados de hotel inválidos para classificação.');
    }
    ids.add(h.id);
    if (h.source === 'airbnb') {
      const snapshot = airbnbSnapshot(h.id);
      if (!snapshot) throw new Error('Refaça a busca para atualizar os dados do Airbnb quando o cache de evidências expirar.');
      return structuredClone(snapshot);
    }
    const reference = bookingReference(h.booking);
    return { id: h.id, name: h.name, lat: h.lat, lng: h.lng, priceTotal: h.priceTotal, currency: 'BRL', booking: { score: h.booking.score, reviews: h.booking.reviews ?? null,
      ...(reference ? { url: `https://www.booking.com/hotel/${reference.countryCode}/${reference.pageName}.html` } : {}),
    } };
  });
}

async function readRankingRequest(req) {
  let body = '';
  for await (const chunk of req) {
    body += chunk.toString();
    if (Buffer.byteLength(body) > 128 * 1024) throw new Error('Pedido de classificação muito grande.');
  }
  const data = JSON.parse(body);
  if (typeof data.citySlug !== 'string' || data.citySlug.length > 80) throw new Error('Cidade inválida.');
  return { citySlug: data.citySlug, hotels: validateRankingHotels(data.hotels),
    priorityIds: Array.isArray(data.priorityIds) ? data.priorityIds.filter((id) => typeof id === 'string' && id.length <= 100).slice(0, 30) : [] };
}

async function loadRankingContext(server, slug, ids) {
  const mod = await server.ssrLoadModule('/src/data/hotel-ranking-context.ts');
  return mod.hotelRankingContext(slug, ids);
}

/** Vite dev server: mounts /api/hotel-search. */
export function hotelSearchVite() {
  return {
    name: 'hotel-search-dev',
    configureServer(server) {
      server.middlewares.use('/api/hotel-search', async (req, res) => {
          const url = new URL(req.url ?? '/', 'http://localhost');
          res.setHeader('Cache-Control', 'no-store');
          // This local browser-backed API must not be callable by another website.
          const origin = req.headers.origin;
          let sameOrigin = !origin;
          try { if (origin) sameOrigin = new URL(origin).host === req.headers.host; } catch { /* malformed origin */ }
          if (!sameOrigin || req.headers['sec-fetch-site'] === 'cross-site') {
            res.statusCode = 403;
            res.end();
            return;
          }
          const rerank = url.pathname === '/rank' && req.method === 'POST';
          if (!rerank && (req.method !== 'GET' || !['/', '/status'].includes(url.pathname))) {
            res.statusCode = 404;
            res.end();
            return;
          }

          if (rerank) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            if (busy) {
              res.statusCode = 409;
              res.end(JSON.stringify({ error: 'Aguarde a busca em andamento.' }));
              return;
            }
            busy = true;
            try {
              const data = await readRankingRequest(req);
              const context = await loadRankingContext(server, data.citySlug, data.priorityIds);
              // A saved search from another city must never inherit this city's safety evidence.
              if (data.hotels.some((h) => haversineM(h.lat, h.lng, context.city.lat, context.city.lng) > 200000)) {
                throw new Error('Os hotéis não pertencem à região desta cidade.');
              }
              await enrichBookingHotels(data.hotels);
              const result = await rankHotels(data.hotels, context, { apiKey: rankingKey() });
              res.end(JSON.stringify({ ranking: result.ranking, hotels: result.hotels.map((h) => ({ id: h.id, ranking: h.ranking, booking: {
                score: h.booking.score, reviews: h.booking.reviews,
                categoryScores: h.booking.categoryScores, wifiAvailable: h.booking.wifiAvailable, detailsFetchedAt: h.booking.detailsFetchedAt,
              } })) }));
            } catch (err) {
              res.statusCode = 400;
              res.end(JSON.stringify({ error: err.message }));
            } finally { busy = false; }
            return;
          }

          if (url.pathname === '/status') {
            let ok = true;
            let error = null;
            try {
              ptServer = ptServer || (await discoverServer());
            } catch (err) {
              ok = false;
              error = err.message;
            }
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ ok: ok || airbnbReady(), airbnb: airbnbReady(), pinchtab: ptServer, busy, error }));
            return;
          }

          res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
          const send = (obj) => res.write(`${JSON.stringify(obj)}\n`);
          if (busy) {
            send({ type: 'error', message: 'Já existe uma busca em andamento — aguarde terminar.' });
            res.end();
            return;
          }
          busy = true;
          const t0 = Date.now();
          try {
            const params = parseParams(url.searchParams);
            log('search', JSON.stringify(params));
            const slug = String(url.searchParams.get('citySlug') ?? '').slice(0, 80);
            if (slug) {
              params.rankingContext = await loadRankingContext(server, slug, String(url.searchParams.get('priorityIds') ?? '').slice(0, 3000).split(',').slice(0, 30));
              // Search and ranking must use the same city even if URL parameters are edited.
              params.city = params.rankingContext.city.name['pt-BR'];
              params.centre = { lat: params.rankingContext.city.lat, lng: params.rankingContext.city.lng };
            }
            const result = await searchHotels(params, send, { apiKey: rankingKey() });
            log(`done in ${Math.round((Date.now() - t0) / 1000)}s — ${result.hotels.length} kept / ${result.skipped.length} skipped`);
            send({ type: 'done', ...result });
          } catch (err) {
            log('error', err.message);
            send({ type: 'error', message: err.message });
          } finally {
            busy = false;
            res.end();
          }
      });
    },
  };
}

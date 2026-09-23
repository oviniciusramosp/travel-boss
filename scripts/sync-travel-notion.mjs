#!/usr/bin/env node
/**
 * Sync travel places: Notion DB "Lugares" ↔ site snapshot.
 *
 *   npm run travel:notion:pull
 *   npm run travel:notion:push -- <placeId...>   # local → Notion (immediate after edits)
 *   npm run travel:notion:push -- --dump file.json
 *   npm run travel:notion:schema
 *   npm run travel:notion:migrate   # emoji City/Category + Place unify + place IDs
 *   npm run travel:notion:seed [dump.json]
 *   npm run travel:notion:seed-photos  # merge travel-photos.ts → Photo URLs (never shrink)
 *   npm run travel:notion:placeids  # resolve + write Google Place IDs
 *
 * Photos: Notion property "Photo URLs" (rich_text, one https URL per line).
 * Cover URL = first gallery image (UI convenience). Pull builds place.photos[].
 *
 * Photo / recency rules (do not wipe newer data):
 *  - Galleries are MERGE-UNION: never write fewer URLs than max(local, Notion).
 *  - If Notion last_edited_time is newer than our last push for that place and
 *    Notion has a longer gallery, Notion order wins; local-only URLs still append.
 *  - After any intentional local place edit, run `push` for those ids immediately.
 *  - State: src/data/travel-notion-sync-state.json
 *
 * Env (.env):
 *   NOTION_TOKEN
 *   NOTION_DATABASE_ID
 *   GOOGLE_MAPS_API_KEY   (optional but required to bulk-fill Place IDs)
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const outJsonPath = resolve(root, 'src/data/travel-notion.json');
const outTsPath = resolve(root, 'src/data/travel-notion.generated.ts');
const placeIdCachePath = resolve(root, 'src/data/travel-google-place-ids.json');
const syncStatePath = resolve(root, 'src/data/travel-notion-sync-state.json');
const NOTION_VERSION = '2022-06-28';

// —— env ——
function loadEnv() {
  const envPath = resolve(root, '.env');
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

const TOKEN = process.env.NOTION_TOKEN;
const DATABASE_ID = (
  process.env.NOTION_DATABASE_ID || '3812da8d81348023afe1ef676eb515f7'
).replace(/-/g, '');
const GOOGLE_KEY =
  process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_API_KEY || '';

if (!TOKEN) {
  console.error('Missing NOTION_TOKEN. Copy .env.example → .env and fill in.');
  process.exit(1);
}

// —— Display labels (Notion UI) ↔ site slugs ——
/** Site city slug → Notion select label (emoji first). */
const CITY_META = {
  'sao-paulo': { label: '🇧🇷 São Paulo', color: 'red' },
  florianopolis: { label: '🇧🇷 Florianópolis', color: 'blue' },
  'new-york': { label: '🇺🇸 New York', color: 'purple' },
  miami: { label: '🇺🇸 Miami', color: 'orange' },
  paris: { label: '🇫🇷 Paris', color: 'pink' },
  roma: { label: '🇮🇹 Roma', color: 'yellow' },
  milao: { label: '🇮🇹 Milão', color: 'yellow' },
  lisboa: { label: '🇵🇹 Lisboa', color: 'green' },
  porto: { label: '🇵🇹 Porto', color: 'brown' },
};

/** Site category → Notion select label (emoji first). */
const CATEGORY_META = {
  airport: { label: '✈️ Airport', color: 'gray' },
  transport: { label: '🚆 Transport', color: 'gray' },
  parks: { label: '🌳 Parks', color: 'green' },
  cafes: { label: '☕️ Cafés', color: 'brown' },
  restaurants: { label: '🍽️ Restaurants', color: 'orange' },
  commons: { label: '🍔 Chains', color: 'orange' },
  markets: { label: '🧺 Markets', color: 'blue' },
  shopping: { label: '🛍️ Shopping', color: 'pink' },
  photo: { label: '📷 Photo', color: 'blue' },
  tourist: { label: '⭐ Tourist', color: 'yellow' },
  lodging: { label: '🛏️ Stay', color: 'purple' },
};

const LANDMARK_OPTIONS = [
  'eiffel',
  'arc',
  'notre-dame',
  'sacre-coeur',
  'louvre',
  'opera',
  'pompidou',
  'montparnasse',
  'monument',
];

const CITY_BY_LABEL = Object.fromEntries(
  Object.entries(CITY_META).map(([slug, m]) => [m.label, slug]),
);
const CATEGORY_BY_LABEL = Object.fromEntries(
  Object.entries(CATEGORY_META).map(([slug, m]) => [m.label, slug]),
);

/** Legacy plain values still accepted on pull/migrate. */
const CITY_ALIASES = {
  ...CITY_BY_LABEL,
  'sao-paulo': 'sao-paulo',
  florianopolis: 'florianopolis',
  'new-york': 'new-york',
  miami: 'miami',
  paris: 'paris',
  roma: 'roma',
  lisboa: 'lisboa',
  porto: 'porto',
  // common free-text
  'São Paulo': 'sao-paulo',
  Paris: 'paris',
  Roma: 'roma',
  Rome: 'roma',
  milao: 'milao',
  'Milão': 'milao',
  Milan: 'milao',
  Milano: 'milao',
};

const CATEGORY_ALIASES = {
  ...CATEGORY_BY_LABEL,
  ...Object.fromEntries(Object.keys(CATEGORY_META).map((k) => [k, k])),
  // old Carol tags
  '🏠 Airbnb': 'lodging',
  '🍽️ Restaurante': 'restaurants',
  '✈️ Aeroporto': 'airport',
  '🏞️ Passeio': 'tourist',
  '🪩 Evento': 'tourist',
  '☕️ Café': 'cafes',
  '🛍️ Compras': 'shopping',
  Sobremesas: 'cafes',
};

function cityLabel(slug) {
  return CITY_META[slug]?.label || slug;
}

function categoryLabel(slug) {
  return CATEGORY_META[slug]?.label || slug;
}

function normalizeCity(raw) {
  if (!raw) return null;
  if (CITY_ALIASES[raw]) return CITY_ALIASES[raw];
  // strip emoji / case
  const stripped = raw
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\s]+/u, '')
    .trim()
    .toLowerCase();
  for (const [slug, meta] of Object.entries(CITY_META)) {
    if (
      meta.label.toLowerCase().includes(stripped) ||
      slug === stripped ||
      slug.replace('-', ' ') === stripped
    ) {
      return slug;
    }
  }
  return null;
}

function normalizeCategory(raw) {
  if (!raw) return 'tourist';
  if (CATEGORY_ALIASES[raw]) return CATEGORY_ALIASES[raw];
  const stripped = raw
    .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\s]+/u, '')
    .trim()
    .toLowerCase();
  for (const [slug, meta] of Object.entries(CATEGORY_META)) {
    const labelCore = meta.label
      .replace(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\s]+/u, '')
      .trim()
      .toLowerCase();
    if (slug === stripped || labelCore === stripped || labelCore.startsWith(stripped)) {
      return slug;
    }
  }
  return 'tourist';
}

// —— Notion helpers ——
async function notion(method, path, body) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.message || JSON.stringify(json).slice(0, 400);
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') || 1) * 1000;
      await sleep(wait + 200);
      return notion(method, path, body);
    }
    throw new Error(`Notion ${method} ${path} → ${res.status}: ${msg}`);
  }
  return json;
}

/** Notion rich_text segments are max 2000 chars each. */
function rt(content) {
  if (content == null || content === '') return [];
  const text = String(content);
  const chunks = [];
  for (let i = 0; i < text.length; i += 2000) {
    chunks.push({ type: 'text', text: { content: text.slice(i, i + 2000) } });
  }
  return chunks;
}
function title(content) {
  return { title: rt(content) };
}
function rich(content) {
  return { rich_text: rt(content) };
}
function richText(prop) {
  if (!prop?.rich_text?.length) return '';
  return prop.rich_text.map((t) => t.plain_text ?? '').join('').trim();
}

/**
 * Parse gallery URLs from Notion "Photo URLs" (one per line, commas ok).
 * Keeps order; de-dupes.
 */
function parsePhotoUrls(raw) {
  if (!raw || typeof raw !== 'string') return [];
  const seen = new Set();
  const out = [];
  for (const line of raw.split(/[\n,]+/)) {
    const u = line.trim().replace(/^<|>$/g, '');
    if (!/^https?:\/\//i.test(u)) continue;
    if (seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

/** Build photos[] + coverUrl from Cover URL + Photo URLs text. */
function photosFromNotionFields(coverUrl, photoUrlsText, nameEn, namePt) {
  const fromList = parsePhotoUrls(photoUrlsText);
  const urls = [];
  const push = (u) => {
    if (!u || urls.includes(u)) return;
    urls.push(u);
  };
  // List is source of truth when present; otherwise single cover.
  if (fromList.length) {
    for (const u of fromList) push(u);
  } else {
    push(coverUrl);
  }
  // If list omitted the cover, keep cover as first (Notion cover still useful)
  if (coverUrl && fromList.length && !fromList.includes(coverUrl)) {
    urls.unshift(coverUrl);
  }
  if (!urls.length) return {};
  const alt = { en: nameEn, 'pt-BR': namePt };
  return {
    coverUrl: coverUrl || urls[0],
    photos: urls.map((url) => ({ url, alt })),
  };
}

/**
 * Read curated galleries from src/data/travel-photos.ts (no TS compile).
 * Returns { [placeId]: string[] } of https URLs in order.
 */
function loadLocalPhotoUrlsByPlaceId() {
  const path = resolve(root, 'src/data/travel-photos.ts');
  const text = readFileSync(path, 'utf8');
  const start = text.indexOf('export const photosByPlaceId');
  if (start < 0) return {};
  const body = text.slice(start);
  const byId = {};
  const entryRe = /'([a-z0-9-]+)':\s*\[/g;
  let m;
  while ((m = entryRe.exec(body))) {
    const id = m[1];
    let i = m.index + m[0].length;
    let depth = 1;
    const from = i;
    while (i < body.length && depth > 0) {
      const ch = body[i];
      if (ch === '[') depth++;
      else if (ch === ']') depth--;
      i++;
    }
    const block = body.slice(from, i - 1);
    const urls = [];
    const urlRe = /https:\/\/[^'"\s)]+/g;
    let um;
    while ((um = urlRe.exec(block))) {
      // photo( first arg only: skip credit-ish non-image noise if any
      const u = um[0].replace(/[,]+$/, '');
      if (!urls.includes(u)) urls.push(u);
    }
    if (urls.length) byId[id] = urls;
  }
  return byId;
}
function titleText(prop) {
  if (!prop?.title?.length) return '';
  return prop.title.map((t) => t.plain_text ?? '').join('').trim();
}
function selectName(prop) {
  return prop?.select?.name ?? null;
}
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function loadPlaceIdCache() {
  if (!existsSync(placeIdCachePath)) return {};
  try {
    return JSON.parse(readFileSync(placeIdCachePath, 'utf8'));
  } catch {
    return {};
  }
}

function savePlaceIdCache(cache) {
  writeFileSync(
    placeIdCachePath,
    `${JSON.stringify(cache, null, 2)}\n`,
    'utf8',
  );
}

/** Extract Google Place ID from Maps URLs / strings. */
function extractPlaceId(...candidates) {
  for (const raw of candidates) {
    if (!raw || typeof raw !== 'string') continue;
    // query_place_id=ChIJ...
    let m = raw.match(/[?&]query_place_id=([^&]+)/i);
    if (m) return decodeURIComponent(m[1]);
    // !1sChIJ... or placeid=
    m = raw.match(/(?:place_id|placeid|query_place_id)[=:][\s"]*(ChIJ[\w-]+)/i);
    if (m) return m[1];
    // bare ChIJ…
    m = raw.match(/\b(ChIJ[A-Za-z0-9_-]{20,})\b/);
    if (m) return m[1];
  }
  return null;
}

// —— schema ——
async function ensureSchema() {
  // Only *add* emoji labels. Do not re-send legacy plain slugs with new colors
  // (Notion 400: "Cannot update color of select with name: …").
  const cityOpts = Object.values(CITY_META).map((m) => ({
    name: m.label,
    color: m.color,
  }));
  const catOpts = Object.values(CATEGORY_META).map((m) => ({
    name: m.label,
    color: m.color,
  }));
  const landmarkOpts = LANDMARK_OPTIONS.map((name, i) => ({
    name,
    color: [
      'yellow',
      'gray',
      'brown',
      'pink',
      'blue',
      'purple',
      'orange',
      'default',
      'green',
    ][i % 9],
  }));

  // Fetch current options so we preserve colors on already-existing names
  const current = await notion('GET', `/databases/${DATABASE_ID}`);
  const existing = current.properties || {};
  const curCity = existing.City?.select?.options ?? [];
  const curCat = existing.Category?.select?.options ?? [];
  const curLandmark = existing.Landmark?.select?.options ?? [];
  const curSub = existing.Subcategories?.multi_select?.options ?? [];

  const mergeOptions = (existingOpts, wanted) => {
    const byName = new Map(existingOpts.map((o) => [o.name, o]));
    for (const w of wanted) {
      if (!byName.has(w.name)) byName.set(w.name, w);
    }
    // Keep existing entries as-is (name + color); only append new wanted ones
    return [...byName.values()].map((o) => ({
      name: o.name,
      color: o.color || 'default',
    }));
  };

  /**
   * Only create missing properties. Re-sending multi_select: { options: [] }
   * wipes all options AND clears every page value — never do that.
   */
  const properties = {};

  const ensureRich = (name) => {
    if (!existing[name]) properties[name] = { rich_text: {} };
  };
  const ensureUrl = (name) => {
    if (!existing[name]) properties[name] = { url: {} };
  };
  const ensureNumber = (name) => {
    if (!existing[name]) properties[name] = { number: { format: 'number' } };
  };
  const ensureCheckbox = (name) => {
    if (!existing[name]) properties[name] = { checkbox: {} };
  };

  ensureRich('Slug');
  ensureRich('Name EN');
  ensureRich('Description');
  ensureRich('Description EN');
  ensureRich('Maps Query');
  ensureRich('Address');
  ensureRich('Google Place ID');
  // Gallery: one https URL per line. Cover URL = first image.
  ensureRich('Photo URLs');
  ensureUrl('Cover URL');
  ensureUrl('Maps URL');
  ensureNumber('Rating');
  ensureNumber('Google Rating');
  ensureNumber('Lat');
  ensureNumber('Lng');
  ensureCheckbox('Favorite');
  ensureCheckbox('Featured');
  ensureCheckbox('Published');

  // Select fields: always merge options (append-only)
  properties.City = {
    select: { options: mergeOptions(curCity, cityOpts) },
  };
  properties.Category = {
    select: { options: mergeOptions(curCat, catOpts) },
  };
  properties.Landmark = {
    select: { options: mergeOptions(curLandmark, landmarkOpts) },
  };

  // multi_select: create only if missing; if present, re-send existing options
  // so a future merge of known tags can append without wiping values.
  if (!existing.Subcategories) {
    properties.Subcategories = { multi_select: { options: [] } };
  } else if (curSub.length) {
    // No-op preserve (omit) — do not PATCH multi_select unless adding options
  }

  const updated = await notion('PATCH', `/databases/${DATABASE_ID}`, {
    properties,
  });
  console.log(
    'Schema OK. Properties:',
    Object.keys(updated.properties).sort().join(', '),
  );
  if (Object.keys(properties).length) {
    console.log(
      '  Patched:',
      Object.keys(properties).sort().join(', ') || '(none new)',
    );
  }
  const cities = updated.properties.City?.select?.options?.map((o) => o.name);
  const cats = updated.properties.Category?.select?.options?.map((o) => o.name);
  const subs =
    updated.properties.Subcategories?.multi_select?.options?.length ?? 0;
  console.log('  City options:', cities?.join(', '));
  console.log('  Category options:', cats?.join(', '));
  console.log(`  Subcategories options: ${subs}`);
}

// —— pull ——
async function queryAllPages() {
  const results = [];
  let cursor;
  do {
    const body = { page_size: 100 };
    if (cursor) body.start_cursor = cursor;
    const page = await notion(
      'POST',
      `/databases/${DATABASE_ID}/query`,
      body,
    );
    results.push(...page.results);
    cursor = page.has_more ? page.next_cursor : null;
    if (cursor) await sleep(350);
  } while (cursor);
  return results;
}

/**
 * Map a Notion page → portable place record.
 * City/Category normalized to site slugs (emoji labels stripped).
 * Coords: Lat/Lng numbers → Place native.
 * Address: Address text → Place.address.
 * Place ID: Google Place ID text → Place.google_place_id → URL extract.
 */
function mapPage(page) {
  const p = page.properties;
  if (p.Published?.checkbox === false) return null;

  const namePt = titleText(p.Nome) || richText(p['Name EN']);
  const nameEn = richText(p['Name EN']) || namePt;
  if (!namePt && !nameEn) return null;

  const place = p.Place?.place ?? null;
  const latNum = p.Lat?.number;
  const lngNum = p.Lng?.number;
  const lat =
    typeof latNum === 'number'
      ? latNum
      : typeof place?.lat === 'number'
        ? place.lat
        : null;
  const lng =
    typeof lngNum === 'number'
      ? lngNum
      : typeof place?.lon === 'number'
        ? place.lon
        : null;
  if (typeof lat !== 'number' || typeof lng !== 'number') {
    console.warn(`  skip (no coords): ${namePt || nameEn}`);
    return null;
  }

  let slug = richText(p.Slug);
  if (!slug) {
    slug = `notion-${page.id.replace(/-/g, '').slice(0, 12)}`;
    console.warn(`  warn (missing Slug, using ${slug}): ${namePt || nameEn}`);
  }

  const cityRaw = selectName(p.City);
  const city = normalizeCity(cityRaw);
  if (!city) {
    console.warn(`  skip (no City): ${slug} raw=${cityRaw}`);
    return null;
  }

  // Category: prefer Category select; fall back to first Tag
  let categoryRaw = selectName(p.Category);
  if (!categoryRaw) {
    const tags = p.Tag?.multi_select ?? [];
    if (tags[0]?.name) categoryRaw = tags[0].name;
  }
  const category = normalizeCategory(categoryRaw);

  const descriptionPt = richText(p.Description);
  const descriptionEn = richText(p['Description EN']) || descriptionPt;
  const coverUrlRaw = p['Cover URL']?.url || null;
  const photoUrlsText = richText(p['Photo URLs']);
  const photoFields = photosFromNotionFields(
    coverUrlRaw,
    photoUrlsText,
    nameEn,
    namePt,
  );
  const mapsUrl = p['Maps URL']?.url || null;
  const mapsQuery = richText(p['Maps Query']) || null;
  const rating = p.Rating?.number;
  const googleRating = p['Google Rating']?.number;
  const favorite = p.Favorite?.checkbox === true;
  const featured = p.Featured?.checkbox === true;
  const conhecido = p.Conhecido?.checkbox === true;
  const tags = (p.Tag?.multi_select ?? []).map((o) => o.name);
  const subcategories = (p.Subcategories?.multi_select ?? []).map(
    (o) => o.name,
  );
  const landmark = selectName(p.Landmark);
  const date = p.Date?.date?.start ?? null;
  const address =
    richText(p.Address) || place?.address || place?.name || undefined;

  const placeId =
    richText(p['Google Place ID']) ||
    place?.google_place_id ||
    extractPlaceId(mapsUrl, mapsQuery) ||
    undefined;

  return {
    notionPageId: page.id,
    id: slug,
    city,
    name: { en: nameEn, 'pt-BR': namePt },
    category,
    description: {
      en: descriptionEn || nameEn,
      'pt-BR': descriptionPt || namePt,
    },
    lat,
    lng,
    ...(address ? { address } : {}),
    ...(placeId ? { placeId } : {}),
    ...(mapsUrl ? { mapsUrl } : {}),
    ...(mapsQuery ? { mapsQuery } : {}),
    ...(typeof rating === 'number' ? { rating } : {}),
    ...(typeof googleRating === 'number' ? { googleRating } : {}),
    // Always include so unchecking in Notion can clear local defaults
    favorite,
    featured,
    ...(landmark ? { landmark } : {}),
    ...(subcategories.length ? { subcategories } : {}),
    ...photoFields,
    tags,
    conhecido,
    date,
    lastEdited: page.last_edited_time,
  };
}

function mapsUrlForPlace(place) {
  if (place.mapsUrl) return place.mapsUrl;
  if (place.placeId) {
    const q = place.mapsQuery || place.address || place.name?.en || place.id;
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}&query_place_id=${encodeURIComponent(place.placeId)}`;
  }
  return null;
}

/**
 * @typedef {{ lastPushedAt?: string, photoUrls?: string[], photoCount?: number }} PlaceSyncEntry
 * @typedef {{ version: number, places: Record<string, PlaceSyncEntry>, lastPullAt?: string }} SyncState
 */

function loadSyncState() {
  if (!existsSync(syncStatePath)) {
    return { version: 1, places: {} };
  }
  try {
    const raw = JSON.parse(readFileSync(syncStatePath, 'utf8'));
    return {
      version: 1,
      places: raw.places && typeof raw.places === 'object' ? raw.places : {},
      ...(raw.lastPullAt ? { lastPullAt: raw.lastPullAt } : {}),
    };
  } catch {
    return { version: 1, places: {} };
  }
}

function saveSyncState(state) {
  writeFileSync(
    syncStatePath,
    `${JSON.stringify({ version: 1, ...state, places: state.places || {} }, null, 2)}\n`,
    'utf8',
  );
}

function isHttpUrl(u) {
  return typeof u === 'string' && /^https?:\/\//i.test(u);
}

/** Dedupe preserve order. */
function uniqueUrls(list) {
  const out = [];
  const seen = new Set();
  for (const u of list || []) {
    if (!isHttpUrl(u) || seen.has(u)) continue;
    seen.add(u);
    out.push(u);
  }
  return out;
}

/**
 * Merge-union photo galleries. Never shrinks below max(local, notion).
 *
 * Recency (timestamp) rule when lengths differ:
 *  - If Notion has more photos AND notionLastEdited > lastPushedAt (or no push yet),
 *    Notion order is primary (Carol/agent edits in Notion are newer).
 *  - Otherwise local/registry order is primary (we just edited the app).
 * Unique URLs from the secondary source are always appended.
 *
 * @param {object} opts
 * @param {string[]} opts.localUrls
 * @param {string[]} opts.notionUrls
 * @param {string|null|undefined} opts.notionLastEdited ISO from page.last_edited_time
 * @param {string|null|undefined} opts.lastPushedAt ISO from sync state
 */
function mergePhotoGalleries({
  localUrls = [],
  notionUrls = [],
  notionLastEdited = null,
  lastPushedAt = null,
}) {
  const local = uniqueUrls(localUrls);
  const notion = uniqueUrls(notionUrls);
  if (!local.length && !notion.length) return [];
  if (!local.length) return notion;
  if (!notion.length) return local;

  const notionMs = notionLastEdited ? Date.parse(notionLastEdited) : NaN;
  const pushedMs = lastPushedAt ? Date.parse(lastPushedAt) : NaN;
  const notionIsNewer =
    Number.isFinite(notionMs) &&
    (!Number.isFinite(pushedMs) || notionMs > pushedMs);

  // Prefer longer gallery's order; on tie, prefer Notion only if it is newer.
  let preferNotion = false;
  if (notion.length > local.length) {
    preferNotion = notionIsNewer || !Number.isFinite(pushedMs);
  } else if (notion.length === local.length) {
    preferNotion = notionIsNewer;
  }

  const primary = preferNotion ? notion : local;
  const secondary = preferNotion ? local : notion;
  return uniqueUrls([...primary, ...secondary]);
}

/**
 * Resolve gallery URLs for a place when seeding Notion.
 * Merge-union local registry + dump + existing Notion; never shrink multi galleries.
 *
 * @param {object} place
 * @param {Record<string, string[]>} localById from loadLocalPhotoUrlsByPlaceId()
 * @param {string[]|null} existingNotionUrls current Photo URLs on the page (if any)
 * @param {{ notionLastEdited?: string|null, lastPushedAt?: string|null }} recency
 */
function resolveSeedPhotoUrls(
  place,
  localById,
  existingNotionUrls = null,
  recency = {},
) {
  const fromPlace = [];
  for (const ph of place.photos || []) {
    const u = typeof ph === 'string' ? ph : ph?.url;
    if (isHttpUrl(u) && !fromPlace.includes(u)) fromPlace.push(u);
  }
  if (place.coverUrl && isHttpUrl(place.coverUrl) && !fromPlace.includes(place.coverUrl)) {
    fromPlace.unshift(place.coverUrl);
  }

  const fromLocal = uniqueUrls([
    ...(localById?.[place.id] || []),
    ...fromPlace,
  ]);
  const fromExisting = uniqueUrls(existingNotionUrls || []);

  return mergePhotoGalleries({
    localUrls: fromLocal,
    notionUrls: fromExisting,
    notionLastEdited: recency.notionLastEdited,
    lastPushedAt: recency.lastPushedAt,
  });
}

/** Build Notion page properties from a seed/migrate place record (site slugs). */
function placeToNotionProps(place, citySlug, opts = {}) {
  const namePt = place.name?.['pt-BR'] || place.name?.en || place.id;
  const nameEn = place.name?.en || namePt;
  const descPt = place.description?.['pt-BR'] || '';
  const descEn = place.description?.en || descPt;
  const cat = place.category || 'tourist';
  const city = citySlug || place.city;

  const placeId =
    place.placeId ||
    extractPlaceId(place.mapsUrl, place.mapsQuery) ||
    null;
  const address = place.address || null;
  const mapsUrl = mapsUrlForPlace({ ...place, placeId }) || place.mapsUrl || null;

  const props = {
    Nome: title(namePt),
    'Name EN': rich(nameEn),
    Slug: rich(place.id),
    City: { select: { name: cityLabel(city) } },
    Category: { select: { name: categoryLabel(cat) } },
    Description: rich(descPt),
    'Description EN': rich(descEn),
    Lat: { number: place.lat },
    Lng: { number: place.lng },
    Published: { checkbox: place.published !== false },
    Favorite: { checkbox: place.favorite === true },
    Featured: { checkbox: place.featured === true },
    Conhecido: { checkbox: place.conhecido !== false },
  };

  if (address) props.Address = rich(address);
  if (place.mapsQuery) props['Maps Query'] = rich(place.mapsQuery);
  if (mapsUrl) props['Maps URL'] = { url: mapsUrl };
  if (placeId) props['Google Place ID'] = rich(placeId);

  // Gallery: Photo URLs (one per line) + Cover URL = first image.
  // Merge-union with existing Notion; never shrink multi galleries (timestamp-aware).
  const photoUrls = resolveSeedPhotoUrls(
    place,
    opts.localPhotoById || {},
    opts.existingNotionUrls || null,
    {
      notionLastEdited: opts.notionLastEdited,
      lastPushedAt: opts.lastPushedAt,
    },
  );
  if (photoUrls.length) {
    props['Photo URLs'] = rich(photoUrls.join('\n'));
    props['Cover URL'] = { url: photoUrls[0] };
  } else if (place.coverUrl && isHttpUrl(place.coverUrl)) {
    props['Cover URL'] = { url: place.coverUrl };
  }

  if (typeof place.rating === 'number') props.Rating = { number: place.rating };
  if (typeof place.googleRating === 'number') {
    props['Google Rating'] = { number: place.googleRating };
  }
  if (place.landmark) props.Landmark = { select: { name: place.landmark } };
  if (place.subcategories?.length) {
    props.Subcategories = {
      multi_select: place.subcategories.map((name) => ({ name })),
    };
  }

  // Unify: native Place pin = Address + coords + Google Place ID
  if (typeof place.lat === 'number' && typeof place.lng === 'number') {
    props.Place = {
      place: {
        lat: place.lat,
        lon: place.lng,
        name: address || nameEn,
        address: address || nameEn,
        ...(placeId ? { google_place_id: placeId } : {}),
      },
    };
  }

  // Tag column: mirror Category (emoji) so old views still group nicely
  props.Tag = { multi_select: [{ name: categoryLabel(cat) }] };

  return props;
}

// —— Google Place ID resolution ——
async function googleFindPlaceId({ name, address, lat, lng, mapsQuery }) {
  if (!GOOGLE_KEY) return null;

  // 1) Find Place From Text (best for named venues)
  const input = mapsQuery || (address ? `${name}, ${address}` : name);
  if (input) {
    const url = new URL(
      'https://maps.googleapis.com/maps/api/place/findplacefromtext/json',
    );
    url.searchParams.set('input', input);
    url.searchParams.set('inputtype', 'textquery');
    url.searchParams.set('fields', 'place_id,name,geometry');
    url.searchParams.set('key', GOOGLE_KEY);
    if (typeof lat === 'number' && typeof lng === 'number') {
      url.searchParams.set('locationbias', `point:${lat},${lng}`);
    }
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.candidates?.[0]?.place_id) {
        return data.candidates[0].place_id;
      }
    } catch {
      /* continue */
    }
  }

  // 2) Reverse geocode
  if (typeof lat === 'number' && typeof lng === 'number') {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('latlng', `${lat},${lng}`);
    url.searchParams.set('key', GOOGLE_KEY);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results?.[0]?.place_id) {
        return data.results[0].place_id;
      }
    } catch {
      /* continue */
    }
  }

  // 3) Forward geocode address
  if (address || name) {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address || name);
    url.searchParams.set('key', GOOGLE_KEY);
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status === 'OK' && data.results?.[0]?.place_id) {
        return data.results[0].place_id;
      }
    } catch {
      /* continue */
    }
  }

  return null;
}

/**
 * Resolve Google Place IDs for all pages missing them; write Place + column.
 */
async function resolvePlaceIds({ force = false } = {}) {
  const cache = loadPlaceIdCache();
  const pages = await queryAllPages();
  console.log(`Resolving Google Place IDs for ${pages.length} page(s)…`);
  if (!GOOGLE_KEY) {
    console.warn(
      '  ⚠ GOOGLE_MAPS_API_KEY not set — will only use cache, URL extract, and Place.google_place_id.',
    );
    console.warn(
      '  Add GOOGLE_MAPS_API_KEY to .env (Places API + Geocoding enabled) for bulk fill.',
    );
  }

  let filled = 0;
  let skipped = 0;
  let failed = 0;
  let fromCache = 0;
  let fromGoogle = 0;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page.archived || page.in_trash) continue;
    const mapped = mapPage(page);
    if (!mapped) {
      skipped++;
      continue;
    }

    let placeId = force ? null : mapped.placeId || null;
    if (!placeId && cache[mapped.id]) {
      placeId = cache[mapped.id];
      fromCache++;
    }
    if (!placeId) {
      placeId = await googleFindPlaceId({
        name: mapped.name.en,
        address: mapped.address,
        lat: mapped.lat,
        lng: mapped.lng,
        mapsQuery: mapped.mapsQuery,
      });
      if (placeId) fromGoogle++;
      if (GOOGLE_KEY) await sleep(200); // gentle on quota
    }

    if (!placeId) {
      failed++;
      if ((i + 1) % 20 === 0) {
        console.log(
          `  … ${i + 1}/${pages.length} filled=${filled} failed=${failed}`,
        );
      }
      continue;
    }

    cache[mapped.id] = placeId;

    // Only PATCH if changed
    const existingCol = richText(page.properties['Google Place ID']);
    const existingPlace = page.properties.Place?.place?.google_place_id;
    if (!force && existingCol === placeId && existingPlace === placeId) {
      skipped++;
      continue;
    }

    const props = {
      'Google Place ID': rich(placeId),
      Place: {
        place: {
          lat: mapped.lat,
          lon: mapped.lng,
          name: mapped.address || mapped.name.en,
          address: mapped.address || mapped.name.en,
          google_place_id: placeId,
        },
      },
      // Keep Address in sync with Place
      Address: rich(mapped.address || mapped.name.en),
      'Maps URL': {
        url: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapped.mapsQuery || mapped.address || mapped.name.en)}&query_place_id=${encodeURIComponent(placeId)}`,
      },
    };

    try {
      await notion('PATCH', `/pages/${page.id}`, { properties: props });
      filled++;
    } catch (err) {
      failed++;
      console.error(`  ✗ ${mapped.id}: ${err.message}`);
    }

    if ((i + 1) % 10 === 0 || i === pages.length - 1) {
      console.log(
        `  … ${i + 1}/${pages.length} filled=${filled} cache=${fromCache} google=${fromGoogle} failed=${failed}`,
      );
    }
    await sleep(350);
  }

  savePlaceIdCache(cache);
  console.log(
    `Place IDs done: filled=${filled} fromCache=${fromCache} fromGoogle=${fromGoogle} failed=${failed} skipped=${skipped}`,
  );
  console.log(`Cache → ${placeIdCachePath} (${Object.keys(cache).length} ids)`);
}

/**
 * Migrate existing rows: emoji City/Category, Place↔Address unify, Tag mirror.
 * Optionally resolve place IDs (if GOOGLE_MAPS_API_KEY set).
 */
async function migrate() {
  await ensureSchema();
  const pages = await queryAllPages();
  console.log(`Migrating ${pages.length} page(s)…`);

  const cache = loadPlaceIdCache();
  let updated = 0;
  let failed = 0;

  // Count by city for the "only 30" confusion
  const byCity = {};

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page.archived || page.in_trash) continue;
    const mapped = mapPage(page);
    if (!mapped) {
      console.warn(`  skip unmappable page ${page.id}`);
      continue;
    }
    byCity[mapped.city] = (byCity[mapped.city] || 0) + 1;

    // Prefer cached / resolved place id
    if (!mapped.placeId && cache[mapped.id]) {
      mapped.placeId = cache[mapped.id];
    }
    if (!mapped.placeId && GOOGLE_KEY) {
      const id = await googleFindPlaceId({
        name: mapped.name.en,
        address: mapped.address,
        lat: mapped.lat,
        lng: mapped.lng,
        mapsQuery: mapped.mapsQuery,
      });
      if (id) {
        mapped.placeId = id;
        cache[mapped.id] = id;
      }
      await sleep(150);
    }

    const props = placeToNotionProps(mapped, mapped.city);
    try {
      await notion('PATCH', `/pages/${page.id}`, { properties: props });
      updated++;
    } catch (err) {
      failed++;
      console.error(`  ✗ ${mapped.id}: ${err.message}`);
    }

    if ((i + 1) % 10 === 0 || i === pages.length - 1) {
      console.log(
        `  … ${i + 1}/${pages.length} updated=${updated} failed=${failed}`,
      );
    }
    await sleep(350);
  }

  savePlaceIdCache(cache);
  console.log(`Migrate done: updated=${updated} failed=${failed}`);
  console.log('Counts by city (API — if Notion UI shows less, clear view filters / open full page):');
  console.log(byCity);
}

async function seed(dumpPath) {
  if (!dumpPath || !existsSync(dumpPath)) {
    throw new Error(`Seed dump not found: ${dumpPath || '(missing path)'}`);
  }
  await ensureSchema();

  const dump = JSON.parse(readFileSync(dumpPath, 'utf8'));
  const citySlug = dump.city;
  const places = dump.places || [];
  if (!citySlug || !places.length) {
    throw new Error('Dump must include { city, places: [...] }');
  }

  const cache = loadPlaceIdCache();
  const localPhotoById = loadLocalPhotoUrlsByPlaceId();
  const syncState = loadSyncState();
  console.log(`Seeding ${places.length} place(s) for city="${citySlug}"…`);
  console.log(
    `  local multi-photo galleries available: ${
      Object.values(localPhotoById).filter((u) => u.length > 1).length
    }`,
  );

  const existing = await queryAllPages();
  const bySlug = new Map();
  /** @type {Map<string, string[]>} */
  const existingPhotosBySlug = new Map();
  /** @type {Map<string, string>} */
  const lastEditedBySlug = new Map();
  for (const page of existing) {
    if (page.archived || page.in_trash) continue;
    const slug = richText(page.properties?.Slug);
    if (!slug) continue;
    bySlug.set(slug, page.id);
    if (page.last_edited_time) lastEditedBySlug.set(slug, page.last_edited_time);
    const coverUrlRaw = page.properties?.['Cover URL']?.url || null;
    const photoUrlsText = richText(page.properties?.['Photo URLs']);
    const fields = photosFromNotionFields(coverUrlRaw, photoUrlsText, '', '');
    if (fields.photos?.length) {
      existingPhotosBySlug.set(
        slug,
        fields.photos.map((p) => p.url).filter(Boolean),
      );
    }
  }
  console.log(`  existing pages with slug: ${bySlug.size}`);

  let created = 0;
  let updated = 0;
  let failed = 0;
  let multiKept = 0;
  const pushedAt = new Date().toISOString();

  for (let i = 0; i < places.length; i++) {
    const place = { ...places[i], city: citySlug };
    if (!place.placeId && cache[place.id]) place.placeId = cache[place.id];
    if (!place.placeId && GOOGLE_KEY) {
      place.placeId = await googleFindPlaceId({
        name: place.name?.en,
        address: place.address,
        lat: place.lat,
        lng: place.lng,
        mapsQuery: place.mapsQuery,
      });
      if (place.placeId) cache[place.id] = place.placeId;
      await sleep(150);
    }

    const existingNotionUrls = existingPhotosBySlug.get(place.id) || null;
    const notionLastEdited = lastEditedBySlug.get(place.id) || null;
    const lastPushedAt = syncState.places[place.id]?.lastPushedAt || null;
    const resolvedPhotos = resolveSeedPhotoUrls(
      place,
      localPhotoById,
      existingNotionUrls,
      { notionLastEdited, lastPushedAt },
    );
    if (resolvedPhotos.length > 1) multiKept++;

    const props = placeToNotionProps(place, citySlug, {
      localPhotoById,
      existingNotionUrls,
      notionLastEdited,
      lastPushedAt,
    });
    const pageId = bySlug.get(place.id);
    try {
      if (pageId) {
        await notion('PATCH', `/pages/${pageId}`, { properties: props });
        updated++;
      } else {
        const page = await notion('POST', '/pages', {
          parent: { database_id: DATABASE_ID },
          properties: props,
        });
        bySlug.set(place.id, page.id);
        created++;
      }
      syncState.places[place.id] = {
        ...(syncState.places[place.id] || {}),
        lastPushedAt: pushedAt,
        photoUrls: resolvedPhotos,
        photoCount: resolvedPhotos.length,
      };
      if ((i + 1) % 10 === 0 || i === places.length - 1) {
        console.log(
          `  … ${i + 1}/${places.length} (created ${created}, updated ${updated}, failed ${failed}, multi ${multiKept})`,
        );
      }
    } catch (err) {
      failed++;
      console.error(`  ✗ ${place.id}: ${err.message}`);
    }
    await sleep(350);
  }

  savePlaceIdCache(cache);
  saveSyncState(syncState);
  console.log(
    `Seed done: created=${created} updated=${updated} failed=${failed} multi-gallery=${multiKept}`,
  );
  console.log(`  sync state → ${syncStatePath}`);
}

/**
 * Seed Subcategories multi-select from local registry dump:
 *   { "par-eiffel": ["monument", "tower"], ... }
 */
async function seedSubcategories(dumpPath) {
  const path =
    dumpPath || resolve(root, 'src/data/subcategories-seed.json');
  if (!existsSync(path)) {
    throw new Error(`Subcategories dump not found: ${path}`);
  }
  const bySlug = JSON.parse(readFileSync(path, 'utf8'));
  const pages = await queryAllPages();
  console.log(
    `Seeding subcategories for ${Object.keys(bySlug).length} ids across ${pages.length} pages…`,
  );

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page.archived || page.in_trash) continue;
    const slug = richText(page.properties?.Slug);
    const tags = bySlug[slug];
    if (!tags?.length) {
      skipped++;
      continue;
    }
    try {
      await notion('PATCH', `/pages/${page.id}`, {
        properties: {
          Subcategories: {
            multi_select: tags.map((name) => ({ name })),
          },
        },
      });
      updated++;
    } catch (err) {
      failed++;
      console.error(`  ✗ ${slug}: ${err.message}`);
    }
    if ((i + 1) % 20 === 0 || i === pages.length - 1) {
      console.log(
        `  … ${i + 1}/${pages.length} updated=${updated} skipped=${skipped} failed=${failed}`,
      );
    }
    await sleep(350);
  }

  console.log(
    `Subcategories seed done: updated=${updated} skipped=${skipped} failed=${failed}`,
  );
}

/**
 * Merge curated galleries from travel-photos.ts into Notion Photo URLs.
 * Never shrinks a Notion gallery; uses last_edited vs last push for order.
 * Only updates Photo URLs + Cover URL (first image). Safe to re-run.
 */
async function seedPhotos() {
  await ensureSchema();
  const byId = loadLocalPhotoUrlsByPlaceId();
  const syncState = loadSyncState();
  const pages = await queryAllPages();
  console.log(
    `Merging Photo URLs for ${Object.keys(byId).length} local galleries across ${pages.length} pages…`,
  );

  let updated = 0;
  let skipped = 0;
  let failed = 0;
  let multi = 0;
  let preservedNotion = 0;
  const pushedAt = new Date().toISOString();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page.archived || page.in_trash) continue;
    const slug = richText(page.properties?.Slug);
    const localUrls = byId[slug] || [];
    const coverUrlRaw = page.properties?.['Cover URL']?.url || null;
    const photoUrlsText = richText(page.properties?.['Photo URLs']);
    const fields = photosFromNotionFields(coverUrlRaw, photoUrlsText, '', '');
    const notionUrls = (fields.photos || []).map((p) => p.url).filter(Boolean);

    if (!localUrls.length && !notionUrls.length) {
      skipped++;
      continue;
    }
    // Nothing local to add and Notion already has photos — leave alone
    if (!localUrls.length) {
      skipped++;
      continue;
    }

    const lastPushedAt = syncState.places[slug]?.lastPushedAt || null;
    const merged = mergePhotoGalleries({
      localUrls,
      notionUrls,
      notionLastEdited: page.last_edited_time,
      lastPushedAt,
    });

    if (!merged.length) {
      skipped++;
      continue;
    }
    if (merged.length > 1) multi++;
    if (notionUrls.length > localUrls.length) preservedNotion++;

    // Skip write if identical list (no Notion churn / last_edited noise)
    const same =
      merged.length === notionUrls.length &&
      merged.every((u, idx) => u === notionUrls[idx]);
    if (same) {
      skipped++;
      continue;
    }

    try {
      await notion('PATCH', `/pages/${page.id}`, {
        properties: {
          'Photo URLs': rich(merged.join('\n')),
          'Cover URL': { url: merged[0] },
        },
      });
      updated++;
      syncState.places[slug] = {
        ...(syncState.places[slug] || {}),
        lastPushedAt: pushedAt,
        photoUrls: merged,
        photoCount: merged.length,
      };
    } catch (err) {
      failed++;
      console.error(`  ✗ ${slug}: ${err.message}`);
    }
    if ((i + 1) % 20 === 0 || i === pages.length - 1) {
      console.log(
        `  … ${i + 1}/${pages.length} updated=${updated} multi=${multi} preservedNotionLonger=${preservedNotion} skipped=${skipped} failed=${failed}`,
      );
    }
    await sleep(350);
  }

  saveSyncState(syncState);
  console.log(
    `Photo URLs merge done: updated=${updated} multi=${multi} preservedNotionLonger=${preservedNotion} skipped=${skipped} failed=${failed}`,
  );
  console.log(`  sync state → ${syncStatePath}`);
}

/**
 * Export local places by id via tsx (localTravelCities, pre-Notion merge).
 * @param {string[]} ids
 * @returns {object[]}
 */
function exportLocalPlacesByIds(ids) {
  const idList = ids.map((s) => s.trim()).filter(Boolean);
  if (!idList.length) return [];
  const script = `
import { writeFileSync } from 'node:fs';
import { localTravelCities } from './src/data/travel.ts';
import { photosForPlaceId } from './src/data/travel-photos.ts';
import { resolvePlaceSubcategories } from './src/data/travel-subcategories.ts';
const want = new Set(${JSON.stringify(idList)});
const places = [];
for (const city of localTravelCities) {
  for (const p of city.places) {
    if (!want.has(p.id)) continue;
    const photos = photosForPlaceId(p.id) ?? [];
    places.push({
      id: p.id,
      city: city.slug,
      name: p.name,
      category: p.category,
      description: p.description,
      lat: p.lat,
      lng: p.lng,
      address: p.address ?? null,
      mapsQuery: p.mapsQuery ?? null,
      mapsUrl: p.mapsUrl ?? null,
      placeId: p.placeId ?? null,
      rating: p.rating ?? null,
      googleRating: p.googleRating ?? null,
      favorite: p.favorite === true,
      featured: p.featured === true,
      conhecido: p.conhecido !== false,
      landmark: p.landmark ?? null,
      subcategories: resolvePlaceSubcategories(p.id, p.subcategories),
      coverUrl: photos[0]?.url ?? null,
      photos: photos.map((ph) => ({ url: ph.url, alt: ph.alt })),
    });
  }
}
const missing = [...want].filter((id) => !places.some((p) => p.id === id));
process.stdout.write(JSON.stringify({ places, missing }));
`;
  const result = spawnSync('npx', ['tsx', '-e', script], {
    cwd: root,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(
      `Failed to export local places: ${result.stderr || result.stdout || result.status}`,
    );
  }
  const out = (result.stdout || '').trim();
  // tsx may print warnings before JSON — find first JSON object
  const start = out.indexOf('{');
  if (start < 0) throw new Error(`No JSON from export: ${out.slice(0, 200)}`);
  const parsed = JSON.parse(out.slice(start));
  if (parsed.missing?.length) {
    console.warn(`  warn: local ids not found: ${parsed.missing.join(', ')}`);
  }
  return parsed.places || [];
}

/**
 * Immediate local → Notion push for place ids (or a dump file).
 * After editing travel places in the app, run this so Notion is not stale
 * and a later pull cannot overwrite fresher local editorial/photos.
 *
 *   node scripts/sync-travel-notion.mjs push par-montmartre par-bakery-gaite
 *   node scripts/sync-travel-notion.mjs push --dump src/data/paris-places-patch-dump.json
 */
async function push(argv) {
  const args = argv.filter(Boolean);
  let places = [];

  const dumpIdx = args.indexOf('--dump');
  if (dumpIdx >= 0) {
    const dumpPath = resolve(root, args[dumpIdx + 1] || '');
    if (!dumpPath || !existsSync(dumpPath)) {
      throw new Error(`push --dump requires an existing JSON path`);
    }
    const dump = JSON.parse(readFileSync(dumpPath, 'utf8'));
    places = (dump.places || []).map((p) => ({
      ...p,
      city: p.city || dump.city,
    }));
  } else {
    const ids = args.filter((a) => !a.startsWith('--'));
    if (!ids.length) {
      throw new Error(
        'Usage: push <placeId...> | push --dump path/to/dump.json',
      );
    }
    console.log(`Exporting ${ids.length} local place(s)…`);
    places = exportLocalPlacesByIds(ids);
  }

  if (!places.length) {
    throw new Error('push: no places to send');
  }

  // Group by city for seed()
  const byCity = new Map();
  for (const p of places) {
    const city = p.city || 'paris';
    const list = byCity.get(city) || [];
    list.push(p);
    byCity.set(city, list);
  }

  console.log(
    `Pushing ${places.length} place(s) across ${byCity.size} city(ies) → Notion…`,
  );
  for (const [city, list] of byCity) {
    const tmp = resolve(root, `src/data/.push-tmp-${city}.json`);
    writeFileSync(
      tmp,
      JSON.stringify({ city, count: list.length, places: list }, null, 2),
    );
    try {
      await seed(tmp);
    } finally {
      try {
        const { unlinkSync } = await import('node:fs');
        unlinkSync(tmp);
      } catch {
        /* ignore */
      }
    }
  }

  console.log('Pulling snapshot so site matches Notion…');
  await pull();
  console.log('Push complete.');
}

async function pull() {
  console.log('Pulling places from Notion…');
  const pages = await queryAllPages();
  console.log(`  ${pages.length} page(s) in database`);

  const places = [];
  for (const page of pages) {
    if (page.archived || page.in_trash) continue;
    const mapped = mapPage(page);
    if (mapped) places.push(mapped);
  }

  places.sort((a, b) => {
    if (a.city !== b.city) return a.city.localeCompare(b.city);
    return a.name.en.localeCompare(b.name.en);
  });

  const byCity = {};
  for (const pl of places) {
    byCity[pl.city] = (byCity[pl.city] || 0) + 1;
  }

  const generatedAt = new Date().toISOString();
  const syncState = loadSyncState();
  syncState.lastPullAt = generatedAt;
  saveSyncState(syncState);

  const payload = {
    generatedAt,
    databaseId: DATABASE_ID,
    count: places.length,
    byCity,
    places,
  };

  writeFileSync(outJsonPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  const ts = `/**
 * AUTO-GENERATED by \`npm run travel:notion:pull\`. Do not edit by hand.
 * Source: Notion DB "Lugares" → editorial place snapshot.
 */

const snapshot = ${JSON.stringify(payload, null, 2)} as const;

export default snapshot;
`;
  writeFileSync(outTsPath, ts, 'utf8');

  console.log(`Wrote ${places.length} place(s) →`);
  console.log(`  ${outTsPath}`);
  console.log(`  ${outJsonPath}`);
  console.log('By city:', byCity);
  if ((byCity.paris || 0) > 30) {
    console.log(
      `\nNote: API has ${byCity.paris} Paris places. If the Notion UI shows ~30, open the DB as full page and clear view filters (inline DBs paginate).`,
    );
  }
}

// —— CLI ——
const cmd = process.argv[2] || 'pull';
const arg = process.argv[3];
const rest = process.argv.slice(3);

try {
  if (cmd === 'pull') {
    await pull();
  } else if (cmd === 'schema') {
    await ensureSchema();
  } else if (cmd === 'sync') {
    // Schema + pull only. Does NOT push local → Notion (safe, no wipe).
    await ensureSchema();
    await pull();
  } else if (cmd === 'push') {
    await push(rest);
  } else if (cmd === 'seed') {
    await seed(arg || resolve(root, 'src/data/paris-seed-dump.json'));
  } else if (cmd === 'migrate') {
    await migrate();
  } else if (cmd === 'placeids') {
    await resolvePlaceIds({ force: arg === '--force' });
  } else if (cmd === 'seed-subcategories') {
    await seedSubcategories(arg);
  } else if (cmd === 'seed-photos') {
    await seedPhotos();
  } else {
    console.error(`Unknown command: ${cmd}`);
    console.error(
      'Usage: sync-travel-notion.mjs [pull|push|schema|sync|seed|migrate|placeids|seed-subcategories|seed-photos]',
    );
    process.exit(1);
  }
} catch (err) {
  console.error(err.message || err);
  process.exit(1);
}

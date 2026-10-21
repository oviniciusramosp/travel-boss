import { DatabaseSync } from 'node:sqlite';
import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, realpathSync, statSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { travelCities, resolveVisit } from '../src/data/travel';
import { readPlaceEdits } from '../src/catalog/place-edit-model';
import { revisionOf, tripPath } from './agent-service';
import { readReference, referenceFiles } from './agent-references';
import { parseTrip } from '../src/trip/parse';
import { scheduleDays } from '../src/trip/calendar';

export interface QueryOptions {
  city?: string; trip?: string; place?: string; date?: string;
  fields?: string[]; locale?: 'en' | 'pt-BR' | 'all'; excerptLength?: number;
}

/** Localize nested visit/money/subpoint copy without shipping both languages. */
function localize(value: any, locale: QueryOptions['locale']): any {
  if (!value || typeof value !== 'object') return value;
  if (locale !== 'all' && typeof value.en === 'string' && typeof value['pt-BR'] === 'string') return value[locale ?? 'pt-BR'];
  return Array.isArray(value) ? value.map(item => localize(item, locale))
    : Object.fromEntries(Object.entries(value).map(([key, item]) => [key, localize(item, locale)]));
}

function selectPlace(value: any, options: QueryOptions) {
  if (options.locale && !['en', 'pt-BR', 'all'].includes(options.locale)) throw Error('Invalid locale');
  const fields = options.fields;
  if (fields && (fields.length > 30 || fields.some(key => !/^[A-Za-z][A-Za-z0-9]*$/.test(key)))) throw Error('Invalid place fields');
  const selected = fields?.length ? Object.fromEntries(['id', 'city', ...fields].filter(key => Object.hasOwn(value, key)).map(key => [key, value[key]])) : value;
  return localize(selected, options.locale);
}

/** Disposable index: Markdown/catalog remain authoritative. No API credentials stored. */
export class AgentIndex {
  db: DatabaseSync;
  table = 'search';
  fts = true;
  stamps = new Map<string, string>();
  catalogStamp = '';
  constructor(file = resolve(process.env.TB_STATE_DIR || '.travel-boss', 'agent.sqlite'), options: { forcePlain?: boolean } = {}) {
    mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(file);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;
      CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, revision TEXT NOT NULL);
      `);
    try {
      if (options.forcePlain) throw Error('Normalized fallback requested');
      this.db.exec("CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5(kind UNINDEXED,id UNINDEXED,line UNINDEXED,city UNINDEXED,text,data UNINDEXED,tokenize='unicode61 remove_diacritics 2')");
    }
    catch {
      this.fts = false; this.table = 'search_plain';
      this.db.exec('CREATE TABLE IF NOT EXISTS search_plain(kind TEXT,id TEXT,line INTEGER,city TEXT,text TEXT,data TEXT,folded TEXT)');
    }
    this.syncCatalog();
  }
  syncCatalog() {
    const editsFile = resolve('src/data/travel-place-edits.json');
    const stat = existsSync(editsFile) ? statSync(editsFile) : undefined;
    const stamp = stat ? `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}` : 'missing';
    if (this.catalogStamp === stamp) return;
    let edits: Record<string, unknown> = {};
    try { edits = JSON.parse(readFileSync(resolve('src/data/travel-place-edits.json'), 'utf8')); } catch { /* No runtime edits in fixtures. */ }
    const catalog = travelCities.flatMap(city => city.places.map(place => {
      const overrides = readPlaceEdits(edits?.[place.id]);
      return {
        id: place.id, city: city.slug, name: place.name, category: place.category, subcategories: place.subcategories,
        lat: place.lat, lng: place.lng, description: place.description, address: place.address,
        mapsUrl: place.mapsUrl, mapsQuery: place.mapsQuery, placeId: place.placeId,
        favorite: overrides?.favorite ?? place.favorite, rating: overrides && Object.hasOwn(overrides, 'rating') ? overrides.rating : place.rating,
        googleRating: overrides && Object.hasOwn(overrides, 'googleRating') ? overrides.googleRating : place.googleRating,
        aiSuggested: place.aiSuggested, aiReason: place.aiReason, visit: resolveVisit(place.id, place.visit), subPoints: place.subPoints,
      };
    }));
    this.replace('@catalog', revisionOf(JSON.stringify(catalog)), catalog.map(place =>
      ['place', place.id, 0, place.city, JSON.stringify(place), JSON.stringify(place)]));
    this.catalogStamp = stamp;
  }
  replace(id: string, revision: string, rows: unknown[][]) {
    revision = `v2:${this.fts ? 'fts5' : 'plain'}:${revision}`;
    if (this.db.prepare('SELECT revision FROM documents WHERE id=?').get(id)?.revision === revision) return;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      if (id === '@catalog') this.db.prepare(`DELETE FROM ${this.table} WHERE kind='place'`).run();
      else this.db.prepare(`DELETE FROM ${this.table} WHERE kind=? AND id=?`).run(id.startsWith('@ref:') ? 'reference' : 'trip', id.replace(/^@ref:/, ''));
      const insert = this.db.prepare(`INSERT INTO ${this.table} VALUES (${this.fts ? '?,?,?,?,?,?' : '?,?,?,?,?,?,?'})`);
      for (const row of rows) insert.run(...(this.fts ? row : [...row, fold(String(row[4]))]) as any[]);
      this.db.prepare('INSERT OR REPLACE INTO documents VALUES (?,?)').run(id, revision);
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  sync() {
    this.syncCatalog();
    const dir = resolve('content/trips');
    const safeDir = existsSync(dir) && lstatSync(dir).isDirectory() && realpathSync(dir).startsWith(`${realpathSync(process.cwd())}${sep}`);
    const names = safeDir ? readdirSync(dir).filter(name => {
      if (!/^[\w-]+\.md$/.test(name)) return false;
      try { return lstatSync(tripPath(name.slice(0, -3))).isFile(); } catch { return false; }
    }) : [];
    const ids = new Set(names.map(name => name.slice(0, -3)));
    for (const name of names) {
      const id = name.slice(0, -3), file = tripPath(id), stat = statSync(file);
      const stamp = `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
      if (this.stamps.get(id) === stamp) continue;
      const raw = readFileSync(file, 'utf8'); let city = '', date = '', placeIds: string[] = [];
      const dates = new Map(scheduleDays(parseTrip(id, file, raw)).map(item => [item.day.line, item.date]));
      this.replace(id, revisionOf(raw), raw.split(/\r?\n/).map((text, i) => {
        if (text.startsWith('city:')) city = text.slice(5).trim();
        if (/^#{1,3} /.test(text)) placeIds = [];
        if (text.startsWith('### ')) date = dates.get(i + 1) ?? '';
        if (/^- /.test(text)) placeIds = [...text.matchAll(/place:([\w-]+)/g)].map(match => match[1]!);
        return ['trip', id, i + 1, city, text, JSON.stringify({ date, placeIds })];
      }));
      this.stamps.set(id, stamp);
    }
    const references = new Set<string>();
    for (const file of referenceFiles()) {
      const stat = statSync(file), stamp = `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
      const relativeName = file.slice(resolve('.').length + 1).replaceAll('\\', '/');
      const key = `@ref:${relativeName}`; references.add(key);
      if (this.stamps.get(key) === stamp) continue;
      const snippets = readReference(file);
      this.replace(key, revisionOf(JSON.stringify(snippets)), snippets.map(snippet =>
        ['reference', relativeName, snippet.line, snippet.city ?? '', `${snippet.section}\n${snippet.excerpt}`, JSON.stringify(snippet)]));
      this.stamps.set(key, stamp);
    }
    for (const row of this.db.prepare("SELECT id FROM documents WHERE id != '@catalog'").all()) {
      if (String(row.id).startsWith('@ref:')) {
        if (!references.has(String(row.id))) {
          this.db.prepare(`DELETE FROM ${this.table} WHERE kind='reference' AND id=?`).run(String(row.id).slice(5));
          this.db.prepare('DELETE FROM documents WHERE id=?').run(row.id); this.stamps.delete(String(row.id));
        }
        continue;
      }
      if (ids.has(row.id as string)) continue;
      this.db.prepare(`DELETE FROM ${this.table} WHERE kind='trip' AND id=?`).run(row.id);
      this.db.prepare('DELETE FROM documents WHERE id=?').run(row.id);
      this.stamps.delete(row.id as string);
    }
  }
  search(query: string, limit = 30, offset = 0, kind = '', options: QueryOptions = {}) {
    const tokens = query.match(/[\p{L}\p{N}_-]+/gu)?.slice(0, 12);
    if (!tokens?.length || query.length > 500) throw Error('Query requires words (max 500 characters)');
    this.sync();
    const match = tokens.map(token => `"${token}"*`).join(' AND ');
    const bounded = Math.max(1, Math.min(100, Number.isFinite(limit) ? Math.trunc(limit) : 30));
    const start = Math.max(0, Math.min(10000, Number.isFinite(offset) ? Math.trunc(offset) : 0));
    const filters = [kind, options.city ?? '', options.trip ?? ''];
    const where = `(?='' OR kind=?) AND (?='' OR city=?) AND (?='' OR kind='trip' AND id=? OR kind='reference' AND json_extract(data,'$.trip')=?)`;
    const args = [filters[0], filters[0], filters[1], filters[1], filters[2], filters[2], filters[2]];
    const extra = ` AND (?='' OR json_extract(data,'$.date')=? OR EXISTS(SELECT 1 FROM json_each(data,'$.dates') WHERE value=?))
      AND (?='' OR kind='place' AND id=? OR EXISTS(SELECT 1 FROM json_each(data,'$.placeIds') WHERE value=?))`;
    args.push(options.date ?? '', options.date ?? '', options.date ?? '', options.place ?? '', options.place ?? '', options.place ?? '');
    const rows = this.fts
      ? this.db.prepare(`SELECT kind,id,line,city,text,data,bm25(search) AS score FROM search
          WHERE search MATCH ? AND ${where}${extra} ORDER BY score LIMIT ? OFFSET ?`).all(match, ...args, bounded + 1, start)
      : this.db.prepare(`SELECT kind,id,line,city,text,data,0 AS score FROM search_plain
          WHERE ${tokens.map(() => 'instr(folded,?)>0').join(' AND ')} AND ${where}${extra} ORDER BY kind,id,line LIMIT ? OFFSET ?`)
          .all(...tokens.map(fold), ...args, bounded + 1, start);
    const excerptLength = Math.max(40, Math.min(1000, options.excerptLength ?? 240));
    return { engine: this.fts ? 'sqlite-fts5' : 'sqlite-normalized', matches: rows.slice(0, bounded).map(({ text, data: rawData, ...row }) => {
      const data = JSON.parse(rawData as string);
      if (row.kind === 'place') return { ...row, excerpt: localize(data.name, options.locale), data: selectPlace(data, { fields: ['name', 'category', 'favorite', 'rating', 'visit'], ...options }) };
      if (row.kind === 'reference') {
        const { excerpt, ...provenance } = data;
        return { ...row, excerpt: String(excerpt).slice(0, excerptLength), data: provenance };
      }
      return { ...row, excerpt: String(text).slice(0, excerptLength), data };
    }),
      offset: start, nextOffset: rows.length > bounded ? start + bounded : null };
  }
  place(id: string, options: QueryOptions = {}) {
    this.syncCatalog();
    const row = this.db.prepare(`SELECT data FROM ${this.table} WHERE kind='place' AND id=?`).get(id);
    return row ? selectPlace(JSON.parse(row.data as string), options) : null;
  }
  close() { this.db.close(); }
}

function fold(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

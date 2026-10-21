import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { travelCities } from '../src/data/travel';
import { revisionOf } from './agent-service';

/** Disposable index: Markdown/catalog remain authoritative. No API credentials stored. */
export class AgentIndex {
  db: DatabaseSync;
  table = 'search';
  fts = true;
  stamps = new Map<string, string>();
  constructor(file = resolve(process.env.TB_STATE_DIR || '.travel-boss', 'agent.sqlite')) {
    mkdirSync(dirname(file), { recursive: true, mode: 0o700 });
    this.db = new DatabaseSync(file);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=3000;
      CREATE TABLE IF NOT EXISTS documents (id TEXT PRIMARY KEY, revision TEXT NOT NULL);
      `);
    try { this.db.exec("CREATE VIRTUAL TABLE IF NOT EXISTS search USING fts5(kind UNINDEXED,id UNINDEXED,line UNINDEXED,city UNINDEXED,text,data UNINDEXED,tokenize='unicode61 remove_diacritics 2')"); }
    catch {
      this.fts = false; this.table = 'search_plain';
      this.db.exec('CREATE TABLE IF NOT EXISTS search_plain(kind TEXT,id TEXT,line INTEGER,city TEXT,text TEXT,data TEXT,folded TEXT)');
    }
    const catalog = travelCities.flatMap(city => city.places.map(place => ({
      id: place.id, city: city.slug, name: place.name, category: place.category,
      lat: place.lat, lng: place.lng, description: place.description, subPoints: place.subPoints,
    })));
    this.replace('catalog', revisionOf(JSON.stringify(catalog)), catalog.map(place =>
      ['place', place.id, 0, place.city, JSON.stringify(place), JSON.stringify(place)]));
  }
  replace(id: string, revision: string, rows: unknown[][]) {
    if (this.db.prepare('SELECT revision FROM documents WHERE id=?').get(id)?.revision === revision) return;
    this.db.exec('BEGIN IMMEDIATE');
    try {
      if (id === 'catalog') this.db.prepare(`DELETE FROM ${this.table} WHERE kind='place'`).run();
      else this.db.prepare(`DELETE FROM ${this.table} WHERE kind='trip' AND id=?`).run(id);
      const insert = this.db.prepare(`INSERT INTO ${this.table} VALUES (${this.fts ? '?,?,?,?,?,?' : '?,?,?,?,?,?,?'})`);
      for (const row of rows) insert.run(...(this.fts ? row : [...row, fold(String(row[4]))]) as any[]);
      this.db.prepare('INSERT OR REPLACE INTO documents VALUES (?,?)').run(id, revision);
      this.db.exec('COMMIT');
    } catch (error) { this.db.exec('ROLLBACK'); throw error; }
  }
  sync() {
    const dir = resolve('content/trips');
    const names = readdirSync(dir).filter(name => /^[\w-]+\.md$/.test(name));
    const ids = new Set(names.map(name => name.slice(0, -3)));
    for (const name of names) {
      const file = resolve(dir, name), stat = statSync(file), id = name.slice(0, -3);
      const stamp = `${stat.mtimeMs}:${stat.ctimeMs}:${stat.size}`;
      if (this.stamps.get(id) === stamp) continue;
      const raw = readFileSync(file, 'utf8'); let city = '';
      this.replace(id, revisionOf(raw), raw.split(/\r?\n/).map((text, i) => {
        if (text.startsWith('city:')) city = text.slice(5).trim();
        return ['trip', id, i + 1, city, text, '{}'];
      }));
      this.stamps.set(id, stamp);
    }
    for (const row of this.db.prepare("SELECT id FROM documents WHERE id != 'catalog'").all()) {
      if (ids.has(row.id as string) || existsSync(resolve(dir, `${row.id}.md`))) continue;
      this.db.prepare(`DELETE FROM ${this.table} WHERE kind='trip' AND id=?`).run(row.id);
      this.db.prepare('DELETE FROM documents WHERE id=?').run(row.id);
      this.stamps.delete(row.id as string);
    }
  }
  search(query: string, limit = 30, offset = 0, kind = '') {
    const tokens = query.match(/[\p{L}\p{N}_-]+/gu)?.slice(0, 12);
    if (!tokens?.length || query.length > 500) throw Error('Query requires words (max 500 characters)');
    this.sync();
    const match = tokens.map(token => `"${token}"*`).join(' AND ');
    const bounded = Math.max(1, Math.min(100, Number.isFinite(limit) ? Math.trunc(limit) : 30));
    const start = Math.max(0, Math.min(10000, Number.isFinite(offset) ? Math.trunc(offset) : 0));
    const rows = this.fts
      ? this.db.prepare(`SELECT kind,id,line,city,text,data,bm25(search) AS score FROM search
          WHERE search MATCH ? AND (?='' OR kind=?) ORDER BY score LIMIT ? OFFSET ?`).all(match, kind, kind, bounded + 1, start)
      : this.db.prepare(`SELECT kind,id,line,city,text,data,0 AS score FROM search_plain
          WHERE ${tokens.map(() => 'instr(folded,?)>0').join(' AND ')} AND (?='' OR kind=?) ORDER BY kind,id,line LIMIT ? OFFSET ?`)
          .all(...tokens.map(fold), kind, kind, bounded + 1, start);
    return { engine: this.fts ? 'sqlite-fts5' : 'sqlite-normalized', matches: rows.slice(0, bounded).map(row => ({ ...row, data: JSON.parse(row.data as string) })),
      offset: start, nextOffset: rows.length > bounded ? start + bounded : null };
  }
  place(id: string) {
    const row = this.db.prepare(`SELECT data FROM ${this.table} WHERE kind='place' AND id=?`).get(id);
    return row ? JSON.parse(row.data as string) : null;
  }
  close() { this.db.close(); }
}

function fold(value: string) { return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

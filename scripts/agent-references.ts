import { readdirSync, readFileSync, lstatSync, realpathSync } from 'node:fs';
import { relative, resolve, sep } from 'node:path';

export interface ReferenceSnippet {
  file: string;
  line: number;
  section: string;
  excerpt: string;
  sources: string[];
  /** Dates mentioned by the document, not a claim of verification or validity. */
  dates: string[];
  placeIds: string[];
  city?: string;
  trip?: string;
}

const PRIVATE = /(?:\b(?:pin|password|senha|localizador|confirmation|confirmação|pagamento|payment|cart[aã]o|card\s*number|e-?mail|telefone|phone|contato|contact|booking\s*(?:code|reference)|reserva\s*(?:n[úu]mero|c[óo]digo|endere[cç]o))\b|[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:sk|ghp|github_pat)[-_][A-Za-z0-9_]{12,})/i;

/** Drop sensitive lines rather than persisting private values in another index. */
export function referenceText(input: string): string {
  return publicLines(input).join('\n')
    .replace(/https?:\/\/[^\s<>"\])]+/g, input => {
      try {
        const url = new URL(input);
        if (url.username || url.password || [...url.searchParams.keys()].some(key => /token|secret|key|password|email|pin|code|auth/i.test(key))) return '[private URL omitted]';
        return url.href;
      } catch { return '[invalid URL omitted]'; }
    });
}

/** Preserve line numbers while redacting whole sensitive descendants and code blocks. */
function publicLines(input: string): string[] {
  let skipIndent: number | undefined, fenced = false;
  return input.split(/\r?\n/).map(line => {
    if (/^\s*(?:```|~~~)/.test(line)) { fenced = !fenced; return ''; }
    if (fenced) return '';
    const indent = line.length - line.trimStart().length;
    if (skipIndent !== undefined && line.trim() && indent > skipIndent) return '';
    skipIndent = undefined;
    if (PRIVATE.test(line)) { skipIndent = indent; return ''; }
    return line;
  });
}

function datesIn(text: string): string[] {
  const dates = [...text.matchAll(/\b(20\d{2}-\d{2}-\d{2})\b/g)].map(match => match[1]!);
  for (const match of text.matchAll(/\b(\d{2})\/(\d{2})\/(20\d{2})\b/g)) dates.push(`${match[3]}-${match[2]}-${match[1]}`);
  return [...new Set(dates)].filter(date => Number.isFinite(Date.parse(date)) && new Date(date).toISOString().slice(0, 10) === date).slice(0, 30);
}

function sourcesIn(text: string): string[] {
  return [...new Set(text.match(/https?:\/\/[^\s<>"\])]+/g) ?? [])].slice(0, 8);
}

function publicId(value: unknown): value is string {
  return typeof value === 'string' && /^[\w-]{1,100}$/.test(value) && referenceText(value) === value;
}

function snippets(file: string, text: string): ReferenceSnippet[] {
  const lines = publicLines(text), results: ReferenceSnippet[] = [];
  const documentDates = datesIn(`${file}\n${referenceText(lines.slice(0, 5).join('\n'))}`);
  const documentSources = sourcesIn(referenceText(lines.join('\n')));
  let section = file;
  for (let i = 0; i < lines.length && results.length < 80; i++) {
    const line = lines[i]!;
    const heading = /^(#{1,6})\s+(.+)/.exec(line);
    if (heading) { section = referenceText(heading[2]!).slice(0, 200); continue; }
    const excerpt = referenceText(line).trim().slice(0, 1000);
    if (excerpt.length < 12 || /^[-|\s]+$/.test(excerpt)) continue;
    results.push({ file, line: i + 1, section, excerpt,
      sources: [...new Set([...sourcesIn(excerpt), ...documentSources])].slice(0, 8), dates: [...new Set([...documentDates, ...datesIn(excerpt)])],
      placeIds: [...new Set([...excerpt.matchAll(/(?:place:|\bid[=:]\s*|\bplaceId[=:]\s*)([\w-]+)/g)].map(match => match[1]!).concat(excerpt.match(/\b[a-z]{2,8}-[a-z0-9][\w-]+\b/g) ?? []))],
    });
  }
  return results;
}

/** Bounded, explicit projection; raw audit payloads and unknown JSON keys never enter FTS. */
function jsonlSnippets(file: string, text: string): ReferenceSnippet[] {
  const fields = ['id', 'placeId', 'name', 'mapsName', 'sourceAddress', 'status', 'reason', 'notes', 'checkedAt', 'date', 'sourceUrl', 'source', 'url', 'city', 'trip'];
  return text.split(/\r?\n/).slice(0, 500).flatMap((line, i) => {
    let record: any;
    try { record = JSON.parse(line); } catch { return []; }
    if (!record || typeof record !== 'object' || Array.isArray(record)) return [];
    const selected = fields.flatMap(key => typeof record[key] === 'string' ? [`${key}=${record[key]}`] : []);
    const sanitized = referenceText(selected.join('\n'));
    const excerpt = sanitized.replace(/\n/g, ' · ').slice(0, 1000);
    if (excerpt.length < 12) return [];
    return [{ file, line: i + 1, section: [record.id, record.placeId].find(publicId) ?? file, excerpt,
      sources: sourcesIn(sanitized), dates: datesIn(`${file}\n${excerpt}`),
      placeIds: [record.id, record.placeId].filter(publicId),
      ...(publicId(record.city) ? { city: record.city } : {}),
      ...(publicId(record.trip) ? { trip: record.trip } : {}),
    }];
  }).slice(0, 80);
}

export function referenceFiles(root = resolve('docs/references'), projectRoot = process.cwd()): string[] {
  const files: string[] = [];
  try {
    const actual = realpathSync(root), boundary = realpathSync(projectRoot);
    if (!lstatSync(root).isDirectory() || actual !== boundary && !actual.startsWith(`${boundary}${sep}`)) return [];
  } catch { return []; }
  function walk(dir: string, depth: number) {
    if (depth > 5 || files.length >= 2000) return;
    let names: string[];
    try { names = readdirSync(dir).sort(); } catch { return; }
    for (const name of names) {
      if (name.startsWith('.') || files.length >= 2000) continue;
      const file = resolve(dir, name), stat = lstatSync(file);
      if (stat.isSymbolicLink()) continue;
      if (stat.isDirectory()) walk(file, depth + 1);
      else if (stat.isFile() && stat.size <= 262144 && /\.(?:md|txt|jsonl)$/i.test(name)) files.push(file);
    }
  }
  walk(root, 0); return files;
}

export function readReference(file: string, root = process.cwd()): ReferenceSnippet[] {
  const text = readFileSync(file, 'utf8'), name = relative(root, file).replaceAll('\\', '/');
  return file.endsWith('.jsonl') ? jsonlSnippets(name, text) : snippets(name, text);
}

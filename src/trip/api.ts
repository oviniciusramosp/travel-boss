export type TripPushReason = 'add' | 'change' | 'unlink';

export type TripPush = {
  id: string;
  reason: TripPushReason;
};

/** Trip id from a watcher path. Null when the file is not one markdown trip. */
export function tripIdFromPath(file: string): string | null {
  const normalized = file.replaceAll('\\', '/');
  const marker = '/content/trips/';
  const at = normalized.lastIndexOf(marker);
  if (at < 0 || !normalized.endsWith('.md')) return null;
  const name = normalized.slice(at + marker.length, -'.md'.length);
  if (!name || name.startsWith('.') || name.includes('/')) return null;
  return name;
}

/**
 * `list` for the collection, an id for one file, or null when the URL
 * is not a trip read (the dev server should pass it on).
 */
export function parseTripRequest(url: string | undefined): 'list' | string | null {
  const path = (url ?? '/').split('?')[0] ?? '/';
  const rest = path.startsWith('/api/trips') ? path.slice('/api/trips'.length) : path;
  let id = rest.replace(/^\/+/, '');
  if (!id) return 'list';
  try {
    id = decodeURIComponent(id);
  } catch {
    return null;
  }
  if (!/^[\w-]+$/.test(id)) return null;
  return id;
}

/**
 * One line edit from the browser. It lands only where the file still has
 * `before`, so the user and an LLM can edit different lines of the same trip.
 */
export type TripPatch = {
  /** 1-based line the browser saw. */
  line: number;
  /** That line's text then. */
  before: string;
  /** Lines that replace it. `[]` deletes it together with its indented lines. */
  after?: string[];
  /** Or one new line under it, after its indented lines (`via:`, comments). */
  child?: string;
};

function singleLine(value: unknown): value is string {
  return typeof value === 'string' && !/[\r\n]/.test(value);
}

/** Null unless the body is one patch of single-line strings. */
export function readTripPatch(body: unknown): TripPatch | null {
  if (!body || typeof body !== 'object') return null;
  const { line, before, after, child } = body as Record<string, unknown>;
  if (typeof line !== 'number' || !Number.isInteger(line) || line < 1) return null;
  if (!singleLine(before) || !before.trim()) return null;
  if (child !== undefined) return after === undefined && singleLine(child) ? { line, before, child } : null;
  if (!Array.isArray(after) || !after.every(singleLine)) return null;
  return { line, before, after };
}

function indentOf(line: string): number {
  return /^[ \t]*/.exec(line)?.[0].length ?? 0;
}

/** Index past `at` and the indented lines right under it. */
function blockEnd(lines: readonly string[], at: number): number {
  const depth = indentOf(lines[at] ?? '');
  let end = at + 1;
  while (end < lines.length && lines[end]!.trim() && indentOf(lines[end]!) > depth) end += 1;
  return end;
}

/**
 * The file with the patch, and the 1-based line of what it wrote.
 * `before` is looked up on its line, then as the one equal line elsewhere
 * (the file moved). Null when that line changed or is not unique.
 */
export function applyTripPatch(raw: string, patch: TripPatch): { raw: string; line: number } | null {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(eol);
  let at = patch.line - 1;
  if (lines[at] !== patch.before) {
    const hits = lines.flatMap((text, index) => (text === patch.before ? [index] : []));
    if (hits.length !== 1) return null;
    at = hits[0]!;
  }
  const end = blockEnd(lines, at);
  if (patch.child !== undefined) {
    lines.splice(end, 0, patch.child);
    return { raw: lines.join(eol), line: end + 1 };
  }
  const after = patch.after ?? [];
  lines.splice(at, after.length ? 1 : end - at, ...after);
  // A paragraph deleted between two blank lines leaves one of them.
  if (!after.length && !lines[at - 1]?.trim() && !lines[at]?.trim()) lines.splice(at, 1);
  return { raw: lines.join(eol), line: at + 1 };
}

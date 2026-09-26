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
 * One edit from the browser. It lands only where the file still has
 * `before`, so the user and an LLM can edit different lines of the same trip.
 */
export type TripPatch = {
  /** 1-based line the browser saw first. */
  line: number;
  /** Those lines then: a note and the lines its trailing `\` carries on to. */
  before: string[];
  /** Lines that replace them. `[]` deletes them together with the lines indented under them. */
  after?: string[];
  /** Or new lines under them, after their indented lines (`via:`, comments). */
  child?: string[];
};

function lineList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && !/[\r\n]/.test(item));
}

/** Null unless the body is one patch of single-line strings. */
export function readTripPatch(body: unknown): TripPatch | null {
  if (!body || typeof body !== 'object') return null;
  const { line, before, after, child } = body as Record<string, unknown>;
  if (typeof line !== 'number' || !Number.isInteger(line) || line < 1) return null;
  if (!lineList(before) || !before[0]?.trim()) return null;
  if (child !== undefined) return after === undefined && lineList(child) && child.length ? { line, before, child } : null;
  return lineList(after) ? { line, before, after } : null;
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

/** Where `block` starts: at `at` while it is still there, else at its one other place. */
function findBlock(lines: readonly string[], block: readonly string[], at: number): number | null {
  const matches = (start: number) => block.every((text, offset) => lines[start + offset] === text);
  if (matches(at)) return at;
  const hits = lines.flatMap((_, start) => (matches(start) ? [start] : []));
  return hits.length === 1 ? hits[0]! : null;
}

/**
 * The file with the patch, and the 1-based line of what it wrote.
 * `before` is looked up on its line, then as the one equal run of lines
 * elsewhere (the file moved). Null when those lines changed or repeat.
 */
export function applyTripPatch(raw: string, patch: TripPatch): { raw: string; line: number } | null {
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(eol);
  const at = findBlock(lines, patch.before, patch.line - 1);
  if (at == null) return null;
  // The note's own lines, then what is indented under its first one.
  const end = Math.max(at + patch.before.length, blockEnd(lines, at));
  if (patch.child) {
    lines.splice(end, 0, ...patch.child);
    return { raw: lines.join(eol), line: end + 1 };
  }
  const after = patch.after ?? [];
  lines.splice(at, after.length ? patch.before.length : end - at, ...after);
  // A paragraph deleted between two blank lines leaves one of them.
  if (!after.length && !lines[at - 1]?.trim() && !lines[at]?.trim()) lines.splice(at, 1);
  return { raw: lines.join(eol), line: at + 1 };
}

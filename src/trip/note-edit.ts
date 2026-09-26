import { readCssTime } from '../ui/motion';
import type { TripPatch } from './api';

export type NoteKind = 'stop' | 'item' | 'paragraph' | 'comment';

/** What an edit keeps on the line: bullet, time, link, `comentário:`. */
const KEEP: Record<NoteKind, RegExp> = {
  stop: /^\s*-\s+(?:\d{2}:\d{2}\s+)?\[[^\]]+\]\([^)]+\)/,
  item: /^\s*-\s+(?:\d{2}:\d{2}\s+)?/,
  paragraph: /^\s*/,
  comment: /^\s+-\s+[^:]+:\s*/,
};

/** A note is one Markdown line: breaks become spaces. */
export function oneLine(text: string): string {
  return text.replace(/\s*[\r\n]+\s*/g, ' ').trim();
}

/**
 * `line` with `text` as its note. A stop left empty loses only ` — note`;
 * an empty list note, paragraph or comment is `[]`, so the line goes.
 * Null when the line no longer has that shape.
 */
export function noteLine(kind: NoteKind, line: string, text: string): string[] | null {
  const keep = KEEP[kind].exec(line)?.[0];
  if (keep == null) return null;
  const clean = oneLine(text);
  if (kind === 'stop') return [clean ? `${keep} — ${clean}` : keep];
  return clean ? [`${keep}${clean}`] : [];
}

export type PatchResult = number | 'conflict' | 'error';

/** The line the server wrote, or why it did not. */
export async function sendPatch(id: string, patch: TripPatch): Promise<PatchResult> {
  try {
    const response = await fetch(`/api/trips/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    if (response.status === 409) return 'conflict';
    const data = response.ok ? ((await response.json()) as { line?: unknown }) : null;
    return typeof data?.line === 'number' ? data.line : 'error';
  } catch {
    return 'error';
  }
}

/** A line as the browser saw it: 1-based number and full text. */
export type SeenLine = { line: number; raw: string };

export type NoteEditorOptions = {
  kind: NoteKind;
  /** Markdown of the note on disk. Empty for a new comment. */
  text: string;
  /** The note's line. Null for a comment not written yet. */
  at: SeenLine | null;
  /** A new comment goes under this line, after its `via:` and comments. */
  parent?: SeenLine;
  label: string;
  placeholder?: string;
  render: (text: string) => Node[];
  save: (patch: TripPatch) => Promise<PatchResult>;
  /** True while open. The trip must not repaint under an open editor. */
  onEditing: (open: boolean) => void;
  onFail: (reason: 'conflict' | 'error', text: string) => void;
  /** After it closes or is removed, with the text now on disk. */
  onClose?: (text: string) => void;
};

export type NoteEditor = {
  edit(): void;
  /** Deletes the line, the same as clearing the text and leaving. */
  remove(): void;
};

/** Offset of a screen point in `node`'s text, or null outside it. */
function caretAt(node: HTMLElement, x: number, y: number): number | null {
  const hit = document.caretPositionFromPoint?.(x, y);
  const range = hit ? null : document.caretRangeFromPoint?.(x, y);
  const end = hit
    ? { at: hit.offsetNode, offset: hit.offset }
    : range
      ? { at: range.startContainer, offset: range.startOffset }
      : null;
  if (!end || !node.contains(end.at)) return null;
  const before = document.createRange();
  before.setStart(node, 0);
  before.setEnd(end.at, end.offset);
  return before.toString().length;
}

/**
 * Click or Tab shows the note's Markdown in place. A pause in typing saves,
 * blur and Enter save now, Escape drops what is not saved yet.
 */
export function editableNote(node: HTMLElement, opts: NoteEditorOptions): NoteEditor {
  let saved = opts.text;
  let anchor = opts.at;
  let open = false;
  let timer = 0;
  let queue = Promise.resolve();
  node.dataset.noteEdit = opts.kind;
  node.tabIndex = 0;
  node.setAttribute('role', 'textbox');
  node.setAttribute('aria-label', opts.label);
  if (opts.placeholder) node.dataset.placeholder = opts.placeholder;
  node.replaceChildren(...opts.render(saved));

  /** The patch that puts `text` on disk and the line it leaves, or null. */
  const patchFor = (text: string): { patch: TripPatch; line?: string } | null => {
    if (anchor) {
      const after = noteLine(opts.kind, anchor.raw, text);
      return after && { patch: { line: anchor.line, before: anchor.raw, after }, line: after[0] };
    }
    if (!opts.parent || !text) return null;
    const child = `${/^\s*/.exec(opts.parent.raw)?.[0] ?? ''}  - comentário: ${text}`;
    return { patch: { line: opts.parent.line, before: opts.parent.raw, child }, line: child };
  };

  const write = async (final: boolean) => {
    const text = oneLine(node.textContent ?? '');
    // A pause never deletes: an empty box may be mid-rewrite.
    if (text === saved || (!text && !final)) return;
    const next = patchFor(text);
    if (!next) {
      if (anchor) opts.onFail('conflict', text);
      return;
    }
    const result = await opts.save(next.patch);
    if (typeof result !== 'number') {
      opts.onFail(result, text);
      return;
    }
    saved = text;
    anchor = next.line != null ? { line: result, raw: next.line } : null;
  };
  // One write at a time, so each one anchors on the line the last one left.
  const flush = (final: boolean) => {
    window.clearTimeout(timer);
    queue = queue.then(() => write(final));
    return queue;
  };

  const start = (at: number | null) => {
    if (open) return;
    open = true;
    opts.onEditing(true);
    const plain = node.textContent === saved;
    node.contentEditable = 'plaintext-only';
    node.textContent = saved;
    node.focus();
    const text = node.firstChild;
    // The rendered text maps 1:1 to the Markdown only without marks or links.
    if (text) getSelection()?.collapse(text, at != null && plain ? at : saved.length);
  };

  node.addEventListener('mousedown', (event) => {
    if (open || event.button !== 0) return;
    if (event.target instanceof Element && event.target.closest('a, button')) return;
    event.preventDefault();
    start(caretAt(node, event.clientX, event.clientY));
  });
  // Keyboard only. A click is handled above; Safari can focus the note from its links.
  node.addEventListener('focus', () => {
    if (node.matches(':focus-visible')) start(null);
  });
  node.addEventListener('input', () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => void flush(false), readCssTime('--delay-autosave'));
  });
  node.addEventListener('keydown', (event) => {
    if (!open || event.isComposing) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      node.textContent = saved;
      node.blur();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      node.blur();
    }
  });
  node.addEventListener('blur', () => {
    // Another window took focus: the note stays open and nothing is deleted yet.
    const away = document.activeElement === node;
    void flush(!away).then(() => {
      if (document.activeElement === node) return;
      open = false;
      node.removeAttribute('contenteditable');
      node.replaceChildren(...opts.render(saved));
      opts.onEditing(false);
      opts.onClose?.(saved);
    });
  });

  return {
    edit: () => start(null),
    remove: () => {
      node.textContent = '';
      void flush(true).then(() => {
        node.replaceChildren(...opts.render(saved));
        opts.onClose?.(saved);
      });
    },
  };
}

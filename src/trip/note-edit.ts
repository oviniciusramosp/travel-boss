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

/** Each line trimmed, blank lines gone: a note breaks, it has no gaps. */
export function noteText(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * The lines for `text` as the note that starts on `first`. A break is a
 * Markdown hard break: `\` at the end, the rest indented under the bullet.
 * A stop left empty loses only ` — note`; an empty list note, paragraph or
 * comment is `[]`, so its lines go. Null when `first` lost its shape.
 */
export function noteLines(kind: NoteKind, first: string, text: string): string[] | null {
  const keep = KEEP[kind].exec(first)?.[0];
  if (keep == null) return null;
  const parts = noteText(text).split('\n').filter(Boolean);
  if (!parts.length) return kind === 'stop' ? [keep] : [];
  const lead = kind === 'stop' ? `${keep} — ` : keep;
  const indent = ' '.repeat(/^\s*(?:-\s+)?/.exec(keep)?.[0].length ?? 0);
  return parts.map((part, index) => `${index ? indent : lead}${part}${index < parts.length - 1 ? '\\' : ''}`);
}

/** The note on 1-based `line` and the lines its trailing `\` carries on to. */
export function noteBlock(lines: readonly string[], line: number): string[] {
  const block = [lines[line - 1] ?? ''];
  while (block.at(-1)!.trimEnd().endsWith('\\') && lines[line - 1 + block.length]?.trim()) {
    block.push(lines[line - 1 + block.length]!);
  }
  return block;
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

/** A note as the browser saw it: its first 1-based line and all its lines. */
export type SeenLine = { line: number; lines: string[] };

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
 * blur and Return save now, Shift+Return breaks the line, Escape drops what
 * is not saved yet.
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

  /** The patch that puts `text` on disk and the lines it leaves, or null. */
  const patchFor = (text: string): { patch: TripPatch; lines: string[] } | null => {
    if (anchor) {
      const after = noteLines(opts.kind, anchor.lines[0] ?? '', text);
      return after && { patch: { line: anchor.line, before: anchor.lines, after }, lines: after };
    }
    if (!opts.parent || !text) return null;
    const pad = /^\s*/.exec(opts.parent.lines[0] ?? '')?.[0] ?? '';
    const child = noteLines('comment', `${pad}  - comentário: `, text) ?? [];
    return { patch: { line: opts.parent.line, before: opts.parent.lines, child }, lines: child };
  };

  const write = async (final: boolean) => {
    const text = noteText(node.textContent ?? '');
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
    anchor = next.lines.length ? { line: result, lines: next.lines } : null;
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
      // Shift+Return breaks the line; Return alone is done.
      if (event.shiftKey) document.execCommand('insertLineBreak');
      else node.blur();
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

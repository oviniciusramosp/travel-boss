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

/** Replace `text[from, to)` with `insert`, then select `[start, end)`. */
export type MarkEdit = { from: number; to: number; insert: string; start: number; end: number };

/**
 * Bold (`**`) or italic (`*`) on the selection `[start, end)` of `text`, or off
 * when it already has it, around it or selected with it. `***x***` is both.
 * Spaces at the edges stay outside the marks. A caret gets an empty pair.
 */
export function toggleMark(text: string, start: number, end: number, mark: '**' | '*'): MarkEdit {
  while (start < end && /\s/.test(text[start] ?? '')) start += 1;
  while (end > start && /\s/.test(text[end - 1] ?? '')) end -= 1;
  const size = mark.length;
  const has = (run: number) => (size === 2 ? run >= 2 : run % 2 === 1);
  const stars = (from: number, step: 1 | -1) => {
    let count = 0;
    while (text[from + count * step] === '*') count += 1;
    return count;
  };
  const inner = text.slice(start, end);
  if (has(Math.min(stars(start - 1, -1), stars(end, 1)))) {
    return { from: start - size, to: end + size, insert: inner, start: start - size, end: end - size };
  }
  if (has(Math.min(stars(start, 1), stars(end - 1, -1), Math.floor(inner.length / 2)))) {
    return { from: start, to: end, insert: inner.slice(size, -size), start, end: end - 2 * size };
  }
  return { from: start, to: end, insert: `${mark}${inner}${mark}`, start: start + size, end: end + size };
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

/** Character offset of a DOM point in `node`'s text. */
function offsetIn(node: HTMLElement, at: Node, offset: number): number {
  const before = document.createRange();
  before.setStart(node, 0);
  before.setEnd(at, offset);
  return before.toString().length;
}

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
  return offsetIn(node, end.at, end.offset);
}

/** Selects characters `[start, end)` of `node`'s text, across its text nodes. */
function select(node: HTMLElement, start: number, end = start): void {
  const point = (index: number): [Node, number] => {
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let text = walker.nextNode(); text; text = walker.nextNode()) {
      const length = (text as Text).length;
      if (index <= length) return [text, index];
      index -= length;
    }
    return [node, node.childNodes.length];
  };
  getSelection()?.setBaseAndExtent(...point(start), ...point(end));
}

/** ⌘B and ⌘I on a Mac, Ctrl elsewhere: Ctrl+B on a Mac moves the caret back. */
function markFor(event: KeyboardEvent): '**' | '*' | null {
  const mac = navigator.platform.startsWith('Mac');
  if (!(mac ? event.metaKey : event.ctrlKey) || event.altKey || event.shiftKey) return null;
  const key = event.key.toLowerCase();
  return key === 'b' ? '**' : key === 'i' ? '*' : null;
}

/**
 * Click or Tab shows the note's Markdown in place. A pause in typing saves,
 * blur and Return save now, Shift+Return breaks the line, ⌘B and ⌘I put or
 * take `**` and `*` around the selection, Escape drops what is not saved yet.
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
    // The rendered text maps 1:1 to the Markdown only without marks or links.
    select(node, at != null && plain ? at : saved.length);
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
    const mark = markFor(event);
    const selection = getSelection()?.rangeCount ? getSelection()!.getRangeAt(0) : null;
    if (mark && selection && node.contains(selection.startContainer) && node.contains(selection.endContainer)) {
      event.preventDefault();
      const edit = toggleMark(
        node.textContent ?? '',
        offsetIn(node, selection.startContainer, selection.startOffset),
        offsetIn(node, selection.endContainer, selection.endOffset),
        mark,
      );
      // insertText keeps ⌘Z working.
      select(node, edit.from, edit.to);
      document.execCommand(edit.insert ? 'insertText' : 'delete', false, edit.insert);
      select(node, edit.start, edit.end);
      return;
    }
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

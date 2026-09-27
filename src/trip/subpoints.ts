/**
 * A park's rides: the timed list notes under a stop that name its sub-points belong to
 * those points, not to the timeline as loose paragraphs.
 */
import type { LString } from '../catalog';

/** A note attached to a sub-point: what the trip says about that point. */
export type SubPointNote = { sub: number; time?: string; text: string; line: number };

const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();

/** The name a note leads with: its opening `**bold**`, else the text before ` — `. */
export function noteTitle(text: string): string {
  const bold = /^\*\*([^*]+)\*\*/.exec(text.trim());
  if (bold) return bold[1]!.trim();
  return text.split(' — ')[0]!.trim();
}

/**
 * Index of the sub-point the note names, or null. The title equals a name in either
 * language, or one starts with the other ("Ratatouille" names "Ratatouille: The Adventure").
 */
export function matchSubPoint(text: string, subPoints: readonly { name: LString }[]): number | null {
  const title = fold(noteTitle(text));
  if (!title) return null;
  for (let index = 0; index < subPoints.length; index += 1) {
    const names = Object.values(subPoints[index]!.name).map(fold).filter(Boolean);
    if (names.some((name) => title === name || title.startsWith(`${name} `) || name.startsWith(`${title} `))) return index;
  }
  return null;
}

/** The note without its opening `**name** — `: under the point's own title, the name would repeat. */
export function stripNoteTitle(text: string): string {
  return text.trim().replace(/^\*\*[^*]+\*\*\s*(?:—\s*)?/, '');
}

/** The notes that name a sub-point, with its index, and the ones that stay on the timeline. */
export function attachSubPointNotes<T extends { label: string }>(
  notes: readonly T[],
  subPoints: readonly { name: LString }[],
): { attached: { note: T; sub: number }[]; loose: T[] } {
  const attached: { note: T; sub: number }[] = [];
  const loose: T[] = [];
  for (const note of notes) {
    const sub = matchSubPoint(note.label, subPoints);
    if (sub == null) loose.push(note);
    else attached.push({ note, sub });
  }
  return { attached, loose };
}

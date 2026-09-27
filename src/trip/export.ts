import { inline, inlineWithLinks } from './inline';
import type { Trip, TripDay, TripStop } from './parse';

/** A break goes back as a Markdown hard break, the next line indented by `indent`. */
function hardBreaks(text: string, indent: string): string {
  return text.replaceAll('\n', `\\\n${indent}`);
}

function pushStop(
  lines: string[],
  stop: TripStop,
  resolvePlace: (placeId: string) => string | null,
) {
  const time = stop.time ? `${stop.time} ` : '';
  if (stop.listNote) {
    lines.push(`- ${time}${hardBreaks(stop.label, '  ')}`);
  } else {
    let body: string;
    if (stop.href) body = `[${stop.label}](${stop.href})`;
    else if (stop.placeId) {
      const href = resolvePlace(stop.placeId);
      body = href ? `[${stop.label}](${href})` : `${stop.label} (lugar não encontrado)`;
    } else body = stop.label;
    const note = stop.note ? ` — ${hardBreaks(stop.note, '  ')}` : '';
    lines.push(`- ${time}${body}${note}`);
  }
  if (stop.status) lines.push(`  - status: ${stop.status}`);
  if (stop.leg) lines.push(`  - via: ${stop.leg.detail}`);
}

function pushDay(lines: string[], day: TripDay, resolvePlace: (placeId: string) => string | null) {
  lines.push(`### ${day.title}`, '');
  if (day.status && !day.stops.some((stop) => stop.status)) lines.push('Dia fechado', '');
  for (const stop of day.stops) pushStop(lines, stop, resolvePlace);
  if (day.stops.length) lines.push('');
  for (const note of day.notes) lines.push(hardBreaks(note.text, ''), '');
}

/** One day, same Markdown the trip export uses for that section. */
export function dayToMarkdown(day: TripDay, resolvePlace: (placeId: string) => string | null): string {
  const lines: string[] = [];
  pushDay(lines, day, resolvePlace);
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

export function tripToMarkdown(
  trip: Trip,
  resolveHref: (citySlug: string, placeId: string) => string | null,
): string {
  const lines: string[] = [`# ${trip.title}`, ''];

  for (const city of trip.cities) {
    lines.push(`## ${city.name}`);
    if (city.dates) lines.push(`${city.dates.start} → ${city.dates.end}`);
    if (city.leg) lines.push(`via: ${city.leg.detail}`);
    lines.push('');
    for (const day of city.days) {
      pushDay(lines, day, (placeId) => resolveHref(city.slug, placeId));
    }
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

/** Holds a hard break while the Markdown is read line by line. Private use, so `.` in a regex still matches it. */
const HARD_BREAK = '\uE000';

/**
 * HTML subset Apple Notes keeps: headings, paragraphs, lists, links, `<br>`.
 * An indented bullet becomes a `<ul>` inside the parent `<li>`.
 * `resolvePlace` turns an inline `place:` link into an https href.
 */
export function tripToHtml(
  markdown: string,
  resolvePlace?: (id: string) => string | null,
): string {
  const out: string[] = [];
  const stack: { liOpen: boolean }[] = [];

  const closeAll = () => {
    while (stack.length) {
      const frame = stack.pop();
      if (frame?.liOpen) out.push('</li>');
      out.push('</ul>');
    }
  };

  const pushItem = (depth: number, content: string) => {
    while (stack.length > depth + 1) {
      const frame = stack.pop();
      if (frame?.liOpen) out.push('</li>');
      out.push('</ul>');
    }
    if (stack.length === depth + 1) {
      const frame = stack[depth];
      if (frame?.liOpen) out.push('</li>');
      if (frame) frame.liOpen = false;
    } else {
      while (stack.length < depth + 1) {
        out.push('<ul>');
        stack.push({ liOpen: false });
      }
    }
    out.push(`<li>${content}`);
    const frame = stack[depth];
    if (frame) frame.liOpen = true;
  };

  for (const line of markdown.replace(/\\\n[ \t]*/g, HARD_BREAK).split('\n')) {
    const bullet = /^(\s*)- (.*)$/.exec(line);
    if (bullet) {
      const indent = (bullet[1] ?? '').replaceAll('\t', '  ').length;
      pushItem(Math.floor(indent / 2), inlineWithLinks(bullet[2] ?? '', resolvePlace));
      continue;
    }
    if (!line.trim()) {
      closeAll();
      continue;
    }
    closeAll();
    if (line.startsWith('### ')) {
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      out.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    out.push(`<p>${inlineWithLinks(line, resolvePlace)}</p>`);
  }
  closeAll();
  return out.join('\n').replaceAll(HARD_BREAK, '<br>');
}

export async function copyTrip(markdown: string, html: string): Promise<void> {
  const clipboard = navigator.clipboard;
  if (clipboard && typeof ClipboardItem !== 'undefined' && clipboard.write) {
    try {
      await clipboard.write([
        new ClipboardItem({
          'text/plain': new Blob([markdown], { type: 'text/plain' }),
          'text/html': new Blob([html], { type: 'text/html' }),
        }),
      ]);
      return;
    } catch {
      /* fall through to plain text */
    }
  }
  await navigator.clipboard.writeText(markdown);
}

export function downloadTrip(filename: string, markdown: string): void {
  const url = URL.createObjectURL(
    new Blob([markdown], { type: 'text/markdown;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

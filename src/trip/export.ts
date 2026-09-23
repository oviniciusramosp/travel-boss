import { inline, inlineWithLinks } from './inline';
import type { Trip } from './parse';

export function tripToMarkdown(
  trip: Trip,
  resolveHref: (citySlug: string, placeId: string) => string | null,
): string {
  const lines: string[] = [`# ${trip.title}`, ''];

  for (const city of trip.cities) {
    lines.push(`## ${city.name}`);
    if (city.dates) lines.push(`${city.dates.start} → ${city.dates.end}`);
    lines.push('');

    for (const day of city.days) {
      lines.push(`### ${day.title}`, '');
      for (const stop of day.stops) {
        const time = stop.time ? `${stop.time} ` : '';
        if (stop.listNote) {
          lines.push(`- ${time}${stop.label}`);
          if (stop.leg) lines.push(`  - via: ${stop.leg.detail}`);
          continue;
        }
        let body: string;
        if (stop.href) body = `[${stop.label}](${stop.href})`;
        else if (stop.placeId) {
          const href = resolveHref(city.slug, stop.placeId);
          body = href
            ? `[${stop.label}](${href})`
            : `${stop.label} (lugar não encontrado)`;
        } else body = stop.label;
        const note = stop.note ? ` — ${stop.note}` : '';
        lines.push(`- ${time}${body}${note}`);
        if (stop.leg) lines.push(`  - via: ${stop.leg.detail}`);
      }
      if (day.stops.length) lines.push('');
      for (const note of day.notes) lines.push(note, '');
    }
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

/**
 * HTML subset Apple Notes keeps: headings, paragraphs, lists, links.
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

  for (const line of markdown.split('\n')) {
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
  return out.join('\n');
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

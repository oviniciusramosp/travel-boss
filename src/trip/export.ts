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
      }
      if (day.stops.length) lines.push('');
      for (const note of day.notes) lines.push(note, '');
    }
  }

  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function inline(value: string): string {
  return escapeHtml(value)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>');
}

function inlineWithLinks(value: string): string {
  const pattern = /\[([^\]]+)\]\((https?:[^)\s]+)\)/g;
  let html = '';
  let last = 0;
  for (const match of value.matchAll(pattern)) {
    const index = match.index ?? 0;
    html += inline(value.slice(last, index));
    const href = (match[2] ?? '').replaceAll('"', '%22');
    html += `<a href="${href}">${inline(match[1] ?? '')}</a>`;
    last = index + match[0].length;
  }
  html += inline(value.slice(last));
  return html;
}

/** HTML subset Apple Notes keeps: headings, paragraphs, lists, links. */
export function tripToHtml(markdown: string): string {
  const out: string[] = [];
  let inList = false;
  const closeList = () => {
    if (!inList) return;
    out.push('</ul>');
    inList = false;
  };

  for (const line of markdown.split('\n')) {
    if (line.startsWith('### ')) {
      closeList();
      out.push(`<h3>${inline(line.slice(4))}</h3>`);
      continue;
    }
    if (line.startsWith('## ')) {
      closeList();
      out.push(`<h2>${inline(line.slice(3))}</h2>`);
      continue;
    }
    if (line.startsWith('# ')) {
      closeList();
      out.push(`<h1>${inline(line.slice(2))}</h1>`);
      continue;
    }
    if (line.startsWith('- ')) {
      if (!inList) {
        out.push('<ul>');
        inList = true;
      }
      out.push(`<li>${inlineWithLinks(line.slice(2))}</li>`);
      continue;
    }
    if (!line.trim()) {
      closeList();
      continue;
    }
    closeList();
    out.push(`<p>${inlineWithLinks(line)}</p>`);
  }
  closeList();
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

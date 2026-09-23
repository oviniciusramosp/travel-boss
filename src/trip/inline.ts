export type InlinePart =
  | { type: 'text'; text: string }
  | { type: 'strong'; children: InlinePart[] }
  | { type: 'em'; children: InlinePart[] }
  | { type: 'link'; href: string; children: InlinePart[] }
  | { type: 'place'; id: string; children: InlinePart[] };

const LINK = /\[([^\]]+)\]\((https?:[^)\s]+|place:[^)\s]+)\)/g;

function parseEmphasis(value: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let buf = '';
  let index = 0;
  const flush = () => {
    if (!buf) return;
    parts.push({ type: 'text', text: buf });
    buf = '';
  };
  while (index < value.length) {
    if (value.startsWith('**', index)) {
      const end = value.indexOf('**', index + 2);
      if (end !== -1) {
        flush();
        parts.push({ type: 'strong', children: parseEmphasis(value.slice(index + 2, end)) });
        index = end + 2;
        continue;
      }
    }
    if (value[index] === '*' && !value.startsWith('**', index)) {
      const end = value.indexOf('*', index + 1);
      if (end !== -1) {
        flush();
        parts.push({ type: 'em', children: parseEmphasis(value.slice(index + 1, end)) });
        index = end + 1;
        continue;
      }
    }
    buf += value[index] ?? '';
    index += 1;
  }
  flush();
  return parts;
}

/** Links first, then emphasis inside and outside them. No HTML. */
export function parseInline(value: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let last = 0;
  for (const match of value.matchAll(LINK)) {
    const at = match.index ?? 0;
    parts.push(...parseEmphasis(value.slice(last, at)));
    const label = match[1] ?? '';
    const target = (match[2] ?? '').trim();
    if (target.startsWith('place:')) {
      const id = target.slice('place:'.length).trim();
      if (id) parts.push({ type: 'place', id, children: parseEmphasis(label) });
      else parts.push(...parseEmphasis(label));
    } else {
      parts.push({ type: 'link', href: target, children: parseEmphasis(label) });
    }
    last = at + match[0].length;
  }
  parts.push(...parseEmphasis(value.slice(last)));
  return parts.filter((part) => part.type !== 'text' || part.text !== '');
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderHtml(parts: InlinePart[], resolvePlace?: (id: string) => string | null): string {
  return parts
    .map((part) => {
      if (part.type === 'text') return escapeHtml(part.text);
      if (part.type === 'strong') return `<strong>${renderHtml(part.children, resolvePlace)}</strong>`;
      if (part.type === 'em') return `<em>${renderHtml(part.children, resolvePlace)}</em>`;
      if (part.type === 'link') {
        return `<a href="${escapeHtml(part.href)}">${renderHtml(part.children, resolvePlace)}</a>`;
      }
      const href = resolvePlace?.(part.id);
      if (!href) return renderHtml(part.children, resolvePlace);
      return `<a href="${escapeHtml(href)}">${renderHtml(part.children, resolvePlace)}</a>`;
    })
    .join('');
}

/** Emphasis only. Headings use this so a bracket stays text. */
export function inline(value: string): string {
  return renderHtml(parseEmphasis(value));
}

/** Emphasis plus `https` links and `place:` links. */
export function inlineWithLinks(
  value: string,
  resolvePlace?: (id: string) => string | null,
): string {
  return renderHtml(parseInline(value), resolvePlace);
}

export type InlineNodeOptions = {
  onPlace?: (id: string, origin: HTMLElement) => void;
};

function renderNodes(parts: InlinePart[], opts?: InlineNodeOptions): Node[] {
  const nodes: Node[] = [];
  for (const part of parts) {
    if (part.type === 'text') {
      nodes.push(document.createTextNode(part.text));
      continue;
    }
    if (part.type === 'strong' || part.type === 'em') {
      const node = document.createElement(part.type === 'strong' ? 'strong' : 'em');
      node.append(...renderNodes(part.children, opts));
      nodes.push(node);
      continue;
    }
    if (part.type === 'link') {
      const anchor = document.createElement('a');
      anchor.href = part.href;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      anchor.append(...renderNodes(part.children, opts));
      nodes.push(anchor);
      continue;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tb-place-link';
    button.append(...renderNodes(part.children, opts));
    const id = part.id;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      opts?.onPlace?.(id, button);
    });
    nodes.push(button);
  }
  return nodes;
}

/** DOM for notes. Never uses innerHTML. A `place:` link selects the place. */
export function inlineNodes(value: string, opts?: InlineNodeOptions): Node[] {
  return renderNodes(parseInline(value), opts);
}

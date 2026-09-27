export const TOOLTIP_SHOW_MS = 350;
export const TOOLTIP_WARM_MS = 300;

const GAP = 6;

export const TRUNCATED_SELECTOR = [
  '.tb-row__title',
  '.tb-name',
  '.tb-row__sub',
  '.tb-date__meta',
  '.tb-route__name',
  '.tb-transfer__label',
  '.tb-span__name',
  '.tb-nav-label',
].join(', ');

export function isTruncated(node: {
  scrollWidth: number;
  clientWidth: number;
  scrollHeight: number;
  clientHeight: number;
}): boolean {
  return node.scrollWidth > node.clientWidth + 1 || node.scrollHeight > node.clientHeight + 1;
}

/** Explicit `[data-tip]` wins. Otherwise a clipped ancestor with a full text. */
export function tooltipHost(node: Element): HTMLElement | null {
  if (node.closest('.tb-timeline')) return null;
  const explicit = node.closest('[data-tip]');
  if (explicit instanceof HTMLElement) return explicit;
  const clipped = node.closest(TRUNCATED_SELECTOR);
  if (clipped instanceof HTMLElement && isTruncated(clipped)) return clipped;
  return null;
}

export function tooltipShowDelay(msSinceHide: number | null): number {
  if (msSinceHide != null && msSinceHide < TOOLTIP_WARM_MS) return 0;
  return TOOLTIP_SHOW_MS;
}

export function tooltipPlacement(
  target: { top: number; bottom: number; left: number; width: number },
  tip: { width: number; height: number },
  viewportWidth: number,
): { top: number; left: number; side: 'above' | 'below' } {
  let top = target.top - tip.height - GAP;
  let side: 'above' | 'below' = 'above';
  if (top < GAP) {
    top = target.bottom + GAP;
    side = 'below';
  }
  const centered = target.left + target.width / 2 - tip.width / 2;
  const left = Math.max(GAP, Math.min(centered, viewportWidth - tip.width - GAP));
  return { top, left, side };
}

let mounted = false;

/** One fixed tooltip for every `[data-tip]`. The accessible name stays on the control. */
export function mountTooltip(): void {
  if (mounted || typeof document === 'undefined') return;
  mounted = true;

  const tip = document.createElement('div');
  tip.className = 'tb-tooltip';
  tip.setAttribute('aria-hidden', 'true');
  tip.hidden = true;
  document.body.append(tip);

  let current: HTMLElement | null = null;
  let hideAt: number | null = null;
  let showTimer = 0;

  const hide = () => {
    window.clearTimeout(showTimer);
    if (!current && tip.hidden) return;
    if (!tip.hidden) hideAt = performance.now();
    current = null;
    tip.hidden = true;
  };

  const show = (target: HTMLElement) => {
    const explicit = target.getAttribute('data-tip');
    const text = explicit ?? target.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    if (!text) return;
    current = target;
    // A modal dialog sits in the top layer, over anything left in <body>.
    const layer = target.closest('dialog[open]') ?? document.body;
    if (tip.parentElement !== layer) layer.append(tip);
    tip.textContent = text;
    tip.hidden = false;
    const rect = target.getBoundingClientRect();
    const tipRect = tip.getBoundingClientRect();
    const place = tooltipPlacement(
      { top: rect.top, bottom: rect.bottom, left: rect.left, width: rect.width },
      { width: tipRect.width, height: tipRect.height },
      window.innerWidth,
    );
    tip.style.left = `${place.left}px`;
    tip.style.top = `${place.top}px`;
    tip.dataset.side = place.side;
  };

  const schedule = (target: HTMLElement) => {
    if (target === current) return;
    window.clearTimeout(showTimer);
    const since = hideAt == null ? null : performance.now() - hideAt;
    const delay = tooltipShowDelay(since);
    if (delay === 0) show(target);
    else showTimer = window.setTimeout(() => show(target), delay);
  };

  const hostOf = (event: Event): HTMLElement | null => {
    const node = event.target;
    if (!(node instanceof Element)) return null;
    return tooltipHost(node);
  };

  const leaves = (event: Event, host: HTMLElement): boolean => {
    const related = 'relatedTarget' in event ? event.relatedTarget : null;
    return !(related instanceof Node && host.contains(related));
  };

  document.addEventListener('pointerover', (event) => {
    const host = hostOf(event);
    if (host) schedule(host);
  });
  document.addEventListener('focusin', (event) => {
    const host = hostOf(event);
    if (host) schedule(host);
  });
  document.addEventListener('pointerout', (event) => {
    const host = hostOf(event);
    if (host && host === current && leaves(event, host)) hide();
  });
  document.addEventListener('focusout', (event) => {
    const host = hostOf(event);
    if (host && host === current && leaves(event, host)) hide();
  });
  document.addEventListener('scroll', () => hide(), true);
  document.addEventListener('pointerdown', () => hide(), true);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!current && tip.hidden) return;
    hide();
    event.preventDefault();
  });
}

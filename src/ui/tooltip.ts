import { prefersReducedMotion } from './motion';

export const TOOLTIP_SHOW_MS = 350;
export const TOOLTIP_WARM_MS = 300;

const EXIT_MS = 110;
const GAP = 6;

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

  let generation = 0;
  let current: HTMLElement | null = null;
  let hideAt: number | null = null;
  let showTimer = 0;
  let hideTimer = 0;

  const hide = () => {
    window.clearTimeout(showTimer);
    if (!current && tip.hidden) return;
    const gen = ++generation;
    if (!tip.hidden) hideAt = performance.now();
    current = null;
    tip.classList.remove('is-open');
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(() => {
      if (generation === gen) tip.hidden = true;
    }, prefersReducedMotion() ? 0 : EXIT_MS);
  };

  const show = (target: HTMLElement) => {
    const text = target.getAttribute('data-tip');
    if (!text) return;
    const gen = ++generation;
    current = target;
    window.clearTimeout(hideTimer);
    tip.textContent = text;
    tip.hidden = false;
    tip.classList.remove('is-open');
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
    requestAnimationFrame(() => {
      if (generation === gen) tip.classList.add('is-open');
    });
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
    const host = node.closest('[data-tip]');
    return host instanceof HTMLElement ? host : null;
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

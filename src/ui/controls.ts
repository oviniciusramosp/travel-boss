import { icon, type IconName } from './icons';

export type IconButtonVariant = 'ghost' | 'outline' | 'solid';
export type IconButtonSize = 'sm' | 'md';

function tipText(label: string, shortcut?: string): string {
  return shortcut ? `${label} · ${shortcut}` : label;
}

export function iconButton(opts: {
  icon: IconName;
  label: string;
  shortcut?: string;
  pressed?: boolean;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
}): HTMLButtonElement {
  const variant = opts.variant ?? 'ghost';
  const size = opts.size ?? 'md';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `tb-icon-btn tb-icon-btn--${variant} tb-icon-btn--${size}`;
  button.setAttribute('aria-label', opts.label);
  button.setAttribute('data-tip', tipText(opts.label, opts.shortcut));
  if (opts.pressed != null) button.setAttribute('aria-pressed', opts.pressed ? 'true' : 'false');
  button.append(icon(opts.icon, { size: size === 'sm' ? 16 : 18 }));
  return button;
}

export function iconLink(opts: {
  icon: IconName;
  label: string;
  href: string;
  size?: IconButtonSize;
}): HTMLAnchorElement {
  const size = opts.size ?? 'md';
  const link = document.createElement('a');
  link.className = `tb-icon-btn tb-icon-btn--ghost tb-icon-btn--${size}`;
  link.href = opts.href;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', opts.label);
  link.setAttribute('data-tip', opts.label);
  link.append(icon(opts.icon, { size: size === 'sm' ? 16 : 18 }));
  return link;
}

/** Next index for a horizontal segmented control. Null when the key is not a move. */
export function segmentedMove(index: number, count: number, key: string): number | null {
  if (count < 1 || index < 0) return null;
  if (key === 'ArrowRight') return (index + 1) % count;
  if (key === 'ArrowLeft') return (index - 1 + count) % count;
  if (key === 'Home') return 0;
  if (key === 'End') return count - 1;
  return null;
}

function segmentButtons(root: HTMLElement): HTMLButtonElement[] {
  return [...root.querySelectorAll<HTMLButtonElement>(':scope > button:not(:disabled)')];
}

function segmentOn(button: HTMLButtonElement): boolean {
  return (
    button.getAttribute('aria-selected') === 'true' || button.getAttribute('aria-pressed') === 'true'
  );
}

function syncSegmented(root: HTMLElement): void {
  const items = segmentButtons(root);
  if (!items.length) return;
  const current = items.findIndex(segmentOn);
  const selected = current >= 0 ? current : 0;
  items.forEach((button, index) => {
    button.tabIndex = index === selected ? 0 : -1;
  });
}

function onSegmentKey(event: KeyboardEvent) {
  if (event.altKey || event.metaKey || event.ctrlKey || event.shiftKey) return;
  const root = event.currentTarget;
  if (!(root instanceof HTMLElement)) return;
  const items = segmentButtons(root);
  const index = items.findIndex(
    (button) => button === event.target || button.contains(event.target as Node),
  );
  if (index < 0) return;
  const next = segmentedMove(index, items.length, event.key);
  if (next == null) return;
  event.preventDefault();
  if (next === index) return;
  const target = items[next];
  if (!target) return;
  target.focus();
  target.click();
  syncSegmented(root);
}

/** Arrow keys and roving tabindex for a row of buttons (tabs, language, arrival). */
export function segmented(root: HTMLElement): void {
  if (root.dataset.segmented !== 'true') {
    root.dataset.segmented = 'true';
    root.addEventListener('keydown', onSegmentKey);
    root.addEventListener('click', () => syncSegmented(root));
  }
  syncSegmented(root);
}

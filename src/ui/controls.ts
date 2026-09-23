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
}): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = 'tb-icon-btn tb-icon-btn--ghost tb-icon-btn--md';
  link.href = opts.href;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', opts.label);
  link.setAttribute('data-tip', opts.label);
  link.append(icon(opts.icon, { size: 18 }));
  return link;
}

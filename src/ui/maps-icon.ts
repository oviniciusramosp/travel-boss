import { icon } from './icons';

/** The Google Maps app icon. `badge` adds the route mark on a full route. */
export function mapsMark(opts?: { badge?: boolean }): HTMLSpanElement {
  const wrap = document.createElement('span');
  wrap.className = opts?.badge ? 'tb-maps-ico is-route' : 'tb-maps-ico';
  const pin = document.createElement('img');
  pin.src = '/google-maps-pin.webp';
  pin.alt = '';
  pin.draggable = false;
  wrap.append(pin);
  if (opts?.badge) {
    const badge = document.createElement('span');
    badge.className = 'tb-maps-badge';
    badge.append(icon('route', { fill: true }));
    wrap.append(badge);
  }
  return wrap;
}

/** Round icon button that opens Google Maps. Hairline border, like the outline buttons. */
export function mapsIconLink(opts: {
  label: string;
  href?: string | null;
  size?: 'sm' | 'md';
}): HTMLAnchorElement {
  const link = document.createElement('a');
  link.className = `tb-icon-btn tb-icon-btn--outline tb-icon-btn--${opts.size ?? 'md'}`;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', opts.label);
  link.setAttribute('data-tip', opts.label);
  link.append(mapsMark());
  if (opts.href) link.href = opts.href;
  else {
    link.setAttribute('aria-disabled', 'true');
    link.tabIndex = -1;
  }
  link.addEventListener('click', (event) => {
    event.stopPropagation();
    if (!link.getAttribute('href')) event.preventDefault();
  });
  return link;
}

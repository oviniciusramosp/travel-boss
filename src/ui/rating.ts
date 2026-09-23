import type { Locale } from '../catalog';
import { pickLocale, travelUi } from '../catalog';
import { el } from './dom';
import { icon, type IconName } from './icons';

export function clampRating(rating: number): number {
  return Math.min(5, Math.max(0, Math.round(rating * 10) / 10));
}

/** One decimal in the active locale. Missing ratings stay "-.-". */
export function formatRating(rating: number | null | undefined, locale: Locale): string {
  if (rating == null || !Number.isFinite(rating)) return '-.-';
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(clampRating(rating));
}

export type StarParts = { full: number; half: boolean; empty: number };

/** Full stars, then one half when the fraction is at least .5. */
export function starParts(rating: number | null | undefined): StarParts {
  if (rating == null || !Number.isFinite(rating)) return { full: 0, half: false, empty: 5 };
  const value = clampRating(rating);
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return { full, half, empty: 5 - full - (half ? 1 : 0) };
}

export function ratingAria(label: string, rating: number | null | undefined, locale: Locale): string {
  if (rating == null || !Number.isFinite(rating)) {
    return pickLocale(locale, { en: `${label}: no rating`, 'pt-BR': `${label}: sem nota` });
  }
  const value = formatRating(rating, locale);
  return pickLocale(locale, { en: `${label}: ${value} of 5`, 'pt-BR': `${label}: ${value} de 5` });
}

export function ratingSummary(
  mine: number | null | undefined,
  google: number | null | undefined,
  locale: Locale,
): string {
  return `${pickLocale(locale, travelUi.ratingMine)} ${formatRating(mine, locale)} · ${pickLocale(locale, travelUi.ratingGoogle)} ${formatRating(google, locale)}`;
}

/** Mine or Google. Empty ratings render "-.-" and five outline stars. */
export function starRating(opts: {
  rating: number | null | undefined;
  label: string;
  locale: Locale;
  icon: IconName;
}): HTMLElement {
  const parts = starParts(opts.rating);
  const empty = opts.rating == null || !Number.isFinite(opts.rating);
  const root = el('span', empty ? 'tb-stars is-empty' : 'tb-stars');
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', ratingAria(opts.label, opts.rating, opts.locale));
  root.append(icon(opts.icon, { size: 16, fill: true }));
  root.append(el('span', 'tb-stars__value', empty ? '-.-' : formatRating(opts.rating, opts.locale)));
  const stars = el('span', 'tb-stars__row');
  stars.setAttribute('aria-hidden', 'true');
  for (let i = 0; i < parts.full; i += 1) stars.append(icon('star', { size: 16, fill: true }));
  if (parts.half) stars.append(icon('star_half', { size: 16, fill: true }));
  for (let i = 0; i < parts.empty; i += 1) stars.append(icon('star', { size: 16 }));
  root.append(stars);
  return root;
}

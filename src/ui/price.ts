import type { Locale } from '../catalog';
import { pickLocale } from '../catalog';
import { el } from './dom';
import { icon } from './icons';

export type PriceLevel = 0 | 1 | 2 | 3;

type Money = { free?: boolean; min?: number; max?: number };

/**
 * 0 free, 1 up to €15, 2 up to €39, 3 above that.
 * Same bands as the portfolio PriceLevel.
 */
export function priceLevelOf(money: Money | null | undefined): PriceLevel | null {
  if (!money) return null;
  if (money.free) return 0;
  const amount = money.min ?? money.max;
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return 0;
  if (amount <= 15) return 1;
  if (amount <= 39) return 2;
  return 3;
}

const LEVEL_LABEL = {
  0: { en: 'free', 'pt-BR': 'grátis' },
  1: { en: 'budget (€1–15)', 'pt-BR': 'econômico (€1–15)' },
  2: { en: 'moderate (€16–39)', 'pt-BR': 'moderado (€16–39)' },
  3: { en: 'expensive (€40+)', 'pt-BR': 'caro (€40+)' },
} as const;

export function priceAria(level: PriceLevel, label: string, locale: Locale): string {
  return `${label}: ${pickLocale(locale, LEVEL_LABEL[level])}`;
}

/** Three attach_money glyphs, `level` of them filled. */
export function priceLevel(level: PriceLevel, label: string, locale: Locale): HTMLElement {
  const root = el('span', `tb-price tb-price--${level}`);
  root.setAttribute('role', 'img');
  root.setAttribute('aria-label', priceAria(level, label, locale));
  root.dataset.priceLevel = String(level);
  for (let i = 0; i < 3; i += 1) {
    const glyph = icon('attach_money', { size: 16, fill: i < level });
    if (i < level) glyph.classList.add('is-on');
    root.append(glyph);
  }
  return root;
}

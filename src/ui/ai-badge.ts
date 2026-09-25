import { cityGuide, pickLocale } from '../catalog';
import type { Locale } from '../catalog';
import { icon } from './icons';

const TABS = [
  ['market', { en: 'Market', 'pt-BR': 'Mercado' }],
  ['food', { en: 'Food', 'pt-BR': 'Comidas' }],
] as const;

/** Why an AI added the place: the guide items that point at it, with their tab. */
export function aiSuggestionTip(slug: string, placeId: string, locale: Locale): string {
  const guide = cityGuide(slug);
  const reasons = TABS.flatMap(([tab, label]) =>
    (guide?.[tab] ?? [])
      .filter((item) => item.where.includes(placeId))
      .map((item) => `${pickLocale(locale, item.name)} (${pickLocale(locale, label)})`),
  );
  if (!reasons.length) return pickLocale(locale, { en: 'AI suggestion', 'pt-BR': 'Sugestão feita por IA' });
  const list = reasons.join(', ');
  return pickLocale(locale, {
    en: `AI suggestion based on: ${list}`,
    'pt-BR': `Sugestão feita por IA com base em: ${list}`,
  });
}

/** Sparkle on the card of a place an AI added. The tip and the accessible name say why. */
export function aiBadge(tip: string): HTMLElement {
  const node = icon('auto_awesome', { size: 16, fill: true });
  node.classList.add('tb-ai-badge');
  node.removeAttribute('aria-hidden');
  node.setAttribute('role', 'img');
  node.setAttribute('aria-label', tip);
  node.setAttribute('data-tip', tip);
  return node;
}

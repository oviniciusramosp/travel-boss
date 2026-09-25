import { foodMeals, marketShelves, pickLocale } from '../catalog';
import type { GuideItem, Locale, LString, TravelPlace } from '../catalog';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';
import { categoryGlyph } from './place-panel';

export type GuideTab = 'market' | 'food';

export type GuideView = {
  tab: GuideTab;
  items: readonly GuideItem[];
  places: ReadonlyMap<string, TravelPlace>;
  locale: Locale;
  current: string | null;
  onSpot(id: string, origin: HTMLElement): void;
  onHover(id: string | null): void;
};

const GROUPS: Record<GuideTab, Record<string, LString>> = { market: marketShelves, food: foodMeals };

const WHERE: Record<GuideTab, LString> = {
  market: { en: 'Where to buy', 'pt-BR': 'Onde comprar' },
  food: { en: 'Where to eat', 'pt-BR': 'Onde comer' },
};

/** Places the items point at, each once, in the order they first appear. */
export function guidePlaceIds(items: readonly GuideItem[]): string[] {
  return [...new Set(items.flatMap((item) => item.where))];
}

function media(item: GuideItem, tab: GuideTab, locale: Locale): HTMLElement {
  const frame = el('span', 'tb-guide-card__media');
  const glyph = () => icon(tab === 'market' ? 'storefront' : 'restaurant', { size: 20 });
  if (!item.photo) {
    frame.append(glyph());
    return frame;
  }
  const img = el('img');
  img.alt = item.photo.alt ? pickLocale(locale, item.photo.alt) : '';
  img.loading = 'lazy';
  img.decoding = 'async';
  img.src = item.photo.url;
  img.addEventListener('error', () => img.replaceWith(glyph()));
  frame.append(img);
  return frame;
}

function spotChip(place: TravelPlace, view: GuideView): HTMLButtonElement {
  const chip = el('button', 'tb-chip tb-guide-spot');
  chip.type = 'button';
  chip.dataset.placeId = place.id;
  if (place.id === view.current) chip.setAttribute('aria-current', 'true');
  const glyph = categoryGlyph(place.category);
  if (glyph) chip.append(glyph);
  chip.append(el('span', 'tb-name', pickLocale(view.locale, place.name)));
  chip.addEventListener('click', () => view.onSpot(place.id, chip));
  chip.addEventListener('pointerenter', () => view.onHover(place.id));
  chip.addEventListener('pointerleave', () => view.onHover(null));
  return chip;
}

function card(item: GuideItem, view: GuideView): HTMLLIElement {
  const { locale } = view;
  const node = el('li', 'tb-guide-card');
  node.dataset.guideId = item.id;
  const text = el('div', 'tb-guide-card__body');
  text.append(
    el('span', 'tb-guide-card__title', pickLocale(locale, item.name)),
    el('p', 'tb-guide-card__desc', pickLocale(locale, item.description)),
  );
  const spots = item.where.flatMap((id) => view.places.get(id) ?? []);
  if (spots.length) {
    const where = el('div', 'tb-guide-card__where');
    const chips = el('div', 'tb-guide-card__spots');
    for (const place of spots) chips.append(spotChip(place, view));
    where.append(el('span', 'tb-guide-card__kicker', pickLocale(locale, WHERE[view.tab])), chips);
    text.append(where);
  }
  node.append(media(item, view.tab, locale), text);
  return node;
}

/** One open group per shelf or meal that has items, in the catalog order. */
export function renderGuide(body: HTMLElement, view: GuideView): void {
  const wrap = el('div', 'tb-guide');
  for (const [group, label] of Object.entries(GROUPS[view.tab])) {
    const items = view.items.filter((item) => item.group === group);
    if (!items.length) continue;
    const section = el('details', 'tb-group');
    section.open = true;
    const summary = el('summary', 'tb-group__summary');
    const chevron = icon('expand_more', { size: 18 });
    chevron.classList.add('tb-group__chevron');
    summary.append(
      el('span', 'tb-group__label', pickLocale(view.locale, label)),
      el('span', 'tb-group__count', String(items.length)),
      chevron,
    );
    const list = el('ul', 'tb-guide-list');
    for (const item of items) list.append(card(item, view));
    section.append(summary, list);
    wrap.append(section);
  }
  body.append(wrap);
}

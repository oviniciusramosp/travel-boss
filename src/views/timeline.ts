/**
 * Trip itinerary timeline: day header, budgets and periods.
 * The city page does not host this view.
 */
import { pickLocale, travelUi } from '../catalog';
import type { Locale } from '../catalog';
import type { BudgetLine, DateBudget } from '../trip/day-plan';
import { openDialog } from '../ui/dialog';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';

type Money = { currency?: string; free?: boolean; min?: number; max?: number };

/** Same typical-euro rule as the catalog budget. Catalog does not re-export it. */
export function typicalEur(money: Money | undefined): number {
  if (!money || money.free) return 0;
  if (money.currency && money.currency !== 'EUR') return 0;
  if (money.min != null && Number.isFinite(money.min)) return money.min;
  if (money.max != null && Number.isFinite(money.max)) return money.max;
  return 0;
}

export function formatEur(amount: number, locale: Locale): string {
  const cents = Math.round(amount * 100);
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  }).format(cents / 100);
}

export function stopCountLabel(count: number, locale: Locale): string {
  return pickLocale(locale, {
    en: count === 1 ? '1 stop' : `${count} stops`,
    'pt-BR': count === 1 ? '1 parada' : `${count} paradas`,
  });
}

const PERIODS = ['morning', 'afternoon', 'evening'] as const;
export type Period = (typeof PERIODS)[number];

export function periodLabel(period: Period, locale: Locale): string {
  const table = {
    morning: travelUi.itineraryMorning,
    afternoon: travelUi.itineraryAfternoon,
    evening: travelUi.itineraryEvening,
  } as const;
  return pickLocale(locale, table[period]);
}

// The date button names the pair, so a chip has no name or tip of its own.
function budgetChip(
  glyph: 'restaurant' | 'local_activity',
  amount: number,
  unit: string,
  locale: Locale,
): HTMLElement {
  const chip = el('span', 'tb-budget-chip');
  chip.classList.add(glyph === 'restaurant' ? 'is-food' : 'is-ticket');
  chip.append(icon(glyph, { size: 16, fill: true }));
  chip.append(el('strong', undefined, formatEur(amount, locale)));
  chip.append(el('span', 'tb-budget-chip__unit', unit));
  return chip;
}

const RECEIPT_KINDS = [
  { kind: 'food', glyph: 'restaurant', label: { en: 'Food', 'pt-BR': 'Comida' } },
  { kind: 'ticket', glyph: 'local_activity', label: { en: 'Tickets', 'pt-BR': 'Ingressos' } },
] as const;

/** Trip date card: one chip per kind, €0 included. The pair is one button that opens the day's receipt. */
export function dateBudgetCards(
  budget: DateBudget,
  nameOf: (id: string) => string,
  title: string,
  locale: Locale,
): HTMLButtonElement {
  // Both chips always show, €0 included, so tickets sit to the right of food on every date.
  const button = el('button', 'tb-date__budgets');
  button.type = 'button';
  button.dataset.dayAction = 'budget';
  button.setAttribute('aria-haspopup', 'dialog');
  const [food, ticket] = RECEIPT_KINDS.map(({ kind, label }) => `${pickLocale(locale, label)} ${formatEur(budget[kind], locale)}`);
  button.setAttribute('aria-label', `${pickLocale(locale, travelUi.itineraryBudgetGroup)}: ${food}, ${ticket}`);
  // The receipt says per person; the chip only needs "each".
  const unit = pickLocale(locale, { en: 'each', 'pt-BR': 'cada' });
  button.append(
    budgetChip('restaurant', budget.food, unit, locale),
    budgetChip('local_activity', budget.ticket, unit, locale),
  );
  button.addEventListener('click', () => openReceipt(budget, nameOf, title, locale));
  return button;
}

/** Name on the left, amount at the right edge. */
function receiptLine(tag: 'li' | 'p', className: string, name: string, amount: number, locale: Locale): HTMLElement {
  const line = el(tag, className);
  line.append(el('span', 'tb-receipt__name', name), el('span', 'tb-receipt__amount', formatEur(amount, locale)));
  return line;
}

/** The day's receipt: each place and extra fare per kind, a subtotal per kind, then the total per person. */
function openReceipt(budget: DateBudget, nameOf: (id: string) => string, title: string, locale: Locale): void {
  const body = el('div', 'tb-receipt__body');
  body.append(el('p', 'tb-receipt__caption', pickLocale(locale, travelUi.itineraryBudgetGroup)));
  for (const { kind, glyph, label } of RECEIPT_KINDS) {
    const lines = budget.lines.filter((line) => line[kind] > 0);
    if (lines.length === 0) continue;
    const group = el('section', `tb-receipt__group is-${kind}`);
    const head = el('h3', 'tb-receipt__head');
    head.append(icon(glyph, { size: 16, fill: true }), pickLocale(locale, label));
    const list = el('ul', 'tb-receipt__lines');
    for (const line of lines) {
      list.append(receiptLine('li', 'tb-receipt__line', line.label ?? nameOf(line.id), line[kind], locale));
    }
    group.append(head, list, receiptLine('p', 'tb-receipt__line is-subtotal', 'Subtotal', budget[kind], locale));
    body.append(group);
  }
  if (budget.lines.length === 0) {
    body.append(el('p', 'tb-receipt__caption', pickLocale(locale, { en: 'Nothing to pay this day.', 'pt-BR': 'Nada a pagar neste dia.' })));
  }
  const total = pickLocale(locale, { en: 'Total per person', 'pt-BR': 'Total por pessoa' });
  body.append(receiptLine('p', 'tb-receipt__line is-total', total, budget.food + budget.ticket, locale));
  openDialog({ className: 'tb-receipt', title, locale, body: [body] });
}

/** A stop's line of the date budget: icon and amount per person, each kind above €0. */
export function stopCostEl(line: BudgetLine, locale: Locale): HTMLElement {
  const costs = el('span', 'tb-stop-costs');
  const kinds = [
    ['food', 'restaurant', travelUi.itineraryFood],
    ['ticket', 'local_activity', travelUi.itineraryParks],
  ] as const;
  for (const [kind, glyph, label] of kinds) {
    if (!(line[kind] > 0)) continue;
    const figure = formatEur(line[kind], locale);
    const chip = el('span', `tb-stop-cost is-${kind}`);
    // No tip: the timeline has none. The name carries what the glyph says.
    chip.setAttribute('role', 'img');
    chip.setAttribute('aria-label', `${pickLocale(locale, label)} ${figure}`);
    chip.append(icon(glyph, { size: 16, fill: true }), figure);
    costs.append(chip);
  }
  return costs;
}

export function slotSwitch(on: boolean, slot: string, locale: Locale, onToggle: (on: boolean) => void): HTMLButtonElement {
  const button = el('button', 'tb-slot__switch');
  button.type = 'button';
  button.setAttribute('role', 'switch');
  button.dataset.timelineAction = 'slot';
  button.dataset.slot = slot;
  // One name for both states. `aria-checked` says which one it is.
  const label = pickLocale(locale, travelUi.itinerarySlotOnMap);
  button.setAttribute('aria-label', label);
  button.setAttribute('data-tip', label);
  const paint = (checked: boolean) => button.setAttribute('aria-checked', checked ? 'true' : 'false');
  paint(on);
  button.append(el('span', 'tb-slot__switch-track'));
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const next = button.getAttribute('aria-checked') !== 'true';
    paint(next);
    onToggle(next);
  });
  return button;
}

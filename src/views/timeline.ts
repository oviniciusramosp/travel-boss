/**
 * Trip itinerary timeline: day header, budgets and periods.
 * The city page does not host this view.
 */
import { pickLocale, travelUi } from '../catalog';
import type { Locale } from '../catalog';
import { averageDateBudget, overBudget, type BudgetLine, type DateBudget } from '../trip/day-plan';
import { openDialog } from '../ui/dialog';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';
import { weatherIcon } from '../ui/weather-icons';

/** Planned sunset in the stop's own text; never inferred from a day's heading. */
export function sunsetTip(text: string, locale: Locale): string | null {
  const plain = text.normalize('NFD').replace(/\p{M}/gu, '').replace(/\*+/g, '').toLowerCase();
  const match = /\b(?:por do sol|sunset)\b/.exec(plain);
  if (!match) return null;
  const before = plain.slice(0, match.index).split(/[.;!?]/).at(-1) ?? '';
  if (/\b(?:sem|nao|not|after|before|depois|apos|antes)\b/.test(before) || /\bno\s+sunset\b/.test(plain)) return null;
  const time = /^\s*(?:as|at)?\s*([01]?\d|2[0-3])(?:h|:)([0-5]\d)\b/.exec(plain.slice(match.index + match[0].length));
  const label = pickLocale(locale, { en: 'Sunset', 'pt-BR': 'Pôr do sol' });
  return time ? `${label} · ${time[1]!.padStart(2, '0')}:${time[2]}` : label;
}

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
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
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

/**
 * The date's food per person against its city's target (`budget:`). The chip takes `over`
 * and `tip`, the receipt takes `line`. Null without a target: the chip stays as it was.
 */
export function foodTarget(
  spent: number,
  target: number | undefined,
  locale: Locale,
): { over: boolean; tip: string; line: string } | null {
  if (target === undefined) return null;
  const over = overBudget(spent, target);
  const [amount, goal, gap] = [spent, target, over || Math.max(0, target - spent)].map((value) =>
    formatEur(value, locale),
  );
  return {
    over: over > 0,
    tip: pickLocale(locale, { en: `${amount} of ${goal} per person`, 'pt-BR': `${amount} de ${goal} por pessoa` }),
    line: pickLocale(
      locale,
      over > 0
        ? { en: `Target: ${goal} · ${gap} over`, 'pt-BR': `Meta: ${goal} · passou ${gap}` }
        : { en: `Target: ${goal} · ${gap} left`, 'pt-BR': `Meta: ${goal} · sobram ${gap}` },
    ),
  };
}

// Each chip opens its own receipt; food also shows its target on hover.
function budgetChip(
  glyph: 'restaurant' | 'local_activity',
  amount: number,
  unit: string,
  locale: Locale,
  target: { over: boolean; tip: string } | null = null,
): HTMLElement {
  const chip = el('button', 'tb-budget-chip');
  chip.type = 'button';
  chip.classList.add(glyph === 'restaurant' ? 'is-food' : 'is-ticket');
  chip.append(icon(glyph, { size: 16, fill: true }));
  chip.append(el('strong', undefined, formatEur(amount, locale)));
  if (target) chip.dataset.tip = target.tip;
  if (target?.over) {
    chip.classList.add('is-over');
    const warn = icon('warning', { size: 16 });
    warn.classList.add('tb-budget-chip__warn');
    chip.append(warn);
  }
  chip.append(el('span', 'tb-budget-chip__unit', unit));
  return chip;
}

const RECEIPT_KINDS = [
  { kind: 'food', glyph: 'restaurant', label: { en: 'Food', 'pt-BR': 'Comida' } },
  { kind: 'ticket', glyph: 'local_activity', label: { en: 'Tickets', 'pt-BR': 'Ingressos' } },
] as const;

export type ReceiptStop = { time?: string; select: () => void };

/** Daily averages with the dates included in each calculation. */
export function averageBudgetCards(days: readonly { title: string; budget: DateBudget }[], locale: Locale): HTMLElement {
  const group = el('div', 'tb-date__budgets');
  const average = averageDateBudget(days.map(({ budget }) => budget));
  const unit = pickLocale(locale, { en: 'per person / day', 'pt-BR': 'por pessoa / dia' });
  const heading = pickLocale(locale, { en: 'Daily average', 'pt-BR': 'Média diária' });
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', heading);
  for (const { kind, glyph, label } of RECEIPT_KINDS) {
    const name = pickLocale(locale, label);
    const chip = budgetChip(glyph, average[kind], unit, locale);
    const tip = `${heading} · ${name}: ${formatEur(average[kind], locale)} ${unit}`;
    chip.setAttribute('aria-label', tip);
    chip.setAttribute('aria-haspopup', 'dialog');
    chip.dataset.tip = tip;
    chip.onclick = () => {
      const included = kind === 'food' ? days.filter(({ budget }) => budget.food > 0) : days;
      const body = el('div', 'tb-receipt__body');
      const list = el('ul', 'tb-receipt__lines');
      for (const day of included) list.append(receiptLine('li', 'tb-receipt__line', day.title, day.budget[kind], locale));
      const total = days.reduce((sum, { budget }) => sum + budget[kind], 0);
      body.append(
        el('p', 'tb-receipt__caption', pickLocale(locale, kind === 'food' ? {
          en: included.length ? `Planned total per person divided by ${included.length} days with food expenses. Zero-cost days are excluded.` : 'No days with food expenses yet.',
          'pt-BR': included.length ? `Total previsto por pessoa dividido por ${included.length} dias com gastos de comida. Dias zerados ficam fora da média.` : 'Ainda não há dias com gastos de comida.',
        } : {
          en: `Planned total per person divided by ${days.length} days, including days with no expenses.`,
          'pt-BR': `Total previsto por pessoa dividido por ${days.length} dias, incluindo dias sem gastos.`,
        })),
        list,
        receiptLine('p', 'tb-receipt__line is-subtotal', pickLocale(locale, { en: 'Trip total per person', 'pt-BR': 'Total da viagem por pessoa' }), total, locale),
        receiptLine('p', 'tb-receipt__line is-total', heading, average[kind], locale),
      );
      openDialog({ className: 'tb-receipt tb-receipt--average', title: `${heading} · ${name}`, locale, body: [body] });
    };
    group.append(chip);
  }
  return group;
}

/** Each kind opens its own receipt, including dates with no expenses. */
export function dateBudgetCards(
  budget: DateBudget,
  nameOf: (id: string) => string,
  title: string,
  locale: Locale,
  goal?: number,
  stopFor?: (id: string) => ReceiptStop | undefined,
): HTMLElement {
  const group = el('div', 'tb-date__budgets');
  const target = foodTarget(budget.food, goal, locale);
  const unit = pickLocale(locale, { en: 'each', 'pt-BR': 'cada' });
  for (const { kind, glyph, label } of RECEIPT_KINDS) {
    const chip = budgetChip(glyph, budget[kind], unit, locale, kind === 'food' ? target : null);
    chip.dataset.dayAction = 'budget';
    chip.setAttribute('aria-haspopup', 'dialog');
    chip.setAttribute('aria-label', `${pickLocale(locale, label)}: ${kind === 'food' && target ? target.tip : formatEur(budget[kind], locale)}`);
    chip.addEventListener('click', () => openReceipt(budget, kind, nameOf, title, locale, target?.line, stopFor));
    group.append(chip);
  }
  return group;
}

/** Name on the left, amount at the right edge. */
function receiptLine(tag: 'li' | 'p', className: string, name: string, amount: number, locale: Locale): HTMLElement {
  const line = el(tag, className);
  line.append(el('span', 'tb-receipt__name', name), el('span', 'tb-receipt__amount', formatEur(amount, locale)));
  return line;
}

/**
 * A single kind's receipt, with links back to the itinerary.
 * `targetLine` (see `foodTarget`) goes under the food subtotal.
 */
function openReceipt(
  budget: DateBudget,
  selectedKind: 'food' | 'ticket',
  nameOf: (id: string) => string,
  title: string,
  locale: Locale,
  targetLine?: string,
  stopFor?: (id: string) => ReceiptStop | undefined,
): void {
  let dialog: HTMLDialogElement;
  const body = el('div', 'tb-receipt__body');
  body.append(el('p', 'tb-receipt__caption', pickLocale(locale, travelUi.itineraryBudgetGroup)));
  for (const { kind, glyph, label } of RECEIPT_KINDS) {
    if (kind !== selectedKind) continue;
    const lines = budget.lines.filter((line) => line[kind] > 0);
    if (lines.length === 0) continue;
    const group = el('section', `tb-receipt__group is-${kind}`);
    const head = el('h3', 'tb-receipt__head');
    head.append(icon(glyph, { size: 16, fill: true }), pickLocale(locale, label));
    const list = el('ul', 'tb-receipt__lines');
    for (const line of lines) {
      const row = receiptLine('li', 'tb-receipt__line', line.label ?? nameOf(line.id), line[kind], locale);
      const stop = stopFor?.(line.id);
      if (stop) {
        const name = el('button', 'tb-receipt__name', line.label ?? nameOf(line.id));
        name.type = 'button';
        name.addEventListener('click', () => {
          dialog.addEventListener('close', () => requestAnimationFrame(stop.select), { once: true });
          dialog.close();
        });
        row.querySelector('.tb-receipt__name')?.replaceWith(name);
      }
      row.prepend(el('span', 'tb-receipt__time', stop?.time ?? '—'));
      list.append(row);
    }
    group.append(head, list, receiptLine('p', 'tb-receipt__line is-subtotal', 'Subtotal', budget[kind], locale));
    if (kind === 'food' && targetLine) group.append(el('p', 'tb-receipt__caption tb-receipt__target', targetLine));
    body.append(group);
  }
  if (!budget.lines.some((line) => line[selectedKind] > 0)) {
    body.append(el('p', 'tb-receipt__caption', pickLocale(locale, { en: 'Nothing to pay this day.', 'pt-BR': 'Nada a pagar neste dia.' })));
  }
  const total = pickLocale(locale, { en: 'Total per person', 'pt-BR': 'Total por pessoa' });
  body.append(receiptLine('p', 'tb-receipt__line is-total', total, budget[selectedKind], locale));
  const label = pickLocale(locale, RECEIPT_KINDS.find(({ kind }) => kind === selectedKind)!.label);
  dialog = openDialog({ className: 'tb-receipt', title: `${label} · ${title}`, locale, body: [body] });
}

/** A stop's line of the date budget: icon and amount per person, each kind above €0. */
export function stopCostEl(line: BudgetLine, locale: Locale, sunset?: string | null): HTMLElement {
  const costs = el('span', 'tb-stop-costs');
  if (sunset) {
    const mark = el('span', 'tb-stop-cost');
    mark.setAttribute('role', 'img');
    mark.setAttribute('aria-label', sunset);
    mark.setAttribute('data-tip', sunset);
    mark.append(weatherIcon('sunset'));
    costs.append(mark);
  }
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

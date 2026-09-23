import { el } from './dom';

export type RowOptions = {
  time?: string;
  lead?: Node;
  title: string;
  sub?: string;
  meta?: Node | string;
  actions?: Node;
  current?: boolean;
  onSelect?: () => void;
  data?: Record<string, string>;
};

/** One subgrid line. With `onSelect`, the title is a button so Enter works. */
export function row(opts: RowOptions): HTMLLIElement {
  const item = el('li', 'tb-row');
  if (opts.current) item.setAttribute('aria-current', 'true');
  if (opts.data) {
    for (const [key, value] of Object.entries(opts.data)) item.dataset[key] = value;
  }

  const time = el('span', 'tb-row__time', opts.time ?? '');
  const lead = el('span', 'tb-row__lead');
  if (opts.lead) lead.append(opts.lead);

  const main = opts.onSelect ? el('button', 'tb-row__main') : el('div', 'tb-row__main');
  if (main instanceof HTMLButtonElement) {
    main.type = 'button';
    main.addEventListener('click', () => opts.onSelect?.());
  }
  const title = el('span', 'tb-row__title', opts.title);
  title.setAttribute('data-tip', opts.title);
  main.append(title);
  if (opts.sub) main.append(el('span', 'tb-row__sub', opts.sub));

  const actions = el('div', 'tb-row__actions');
  if (opts.actions) actions.append(opts.actions);

  item.append(time, lead, main);
  if (opts.meta != null) {
    const meta = el('span', 'tb-row__meta');
    if (typeof opts.meta === 'string') meta.textContent = opts.meta;
    else meta.append(opts.meta);
    item.append(meta);
  }
  item.append(actions);
  return item;
}

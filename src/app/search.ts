import { pickLocale, travelCities, type Locale } from '../catalog';
import { el } from '../ui/dom';
import { placePin } from '../ui/place-pin';
import { icon } from '../ui/icons';
import { formatDayTitle } from '../trip/dates';
import { isMobileLayout, preparePlaceSearch } from '../views/place-activation';
import type { Shell } from './shell';
import type { Route } from './router';

export const searchText = (text: string): string => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
type Suggestion = { label: string; detail: string; text: string; lead?: () => Node; select(): void };

export function searchMatches<T extends { label: string; text: string }>(items: T[], value: string): T[] {
  const query = searchText(value);
  if (!query) return [];
  const rank = (item: T) => {
    const label = searchText(item.label);
    return label === query ? 2 : label.startsWith(query) ? 1 : 0;
  };
  return items.filter(item => searchText(item.text).includes(query))
    .sort((a, b) => rank(b) - rank(a)).slice(0, 8);
}

export function searchSchedule(date: string, time: string, locale: Locale): string {
  return [date ? formatDayTitle(date, locale).split(' • ')[0] : '', time].filter(Boolean).join(' · ');
}

/** Suggestions keep focus in the input; only selecting a result navigates. */
export function mountSearch(shell: Shell, navigate: (route: Route) => void) {
  const host = shell.root.querySelector<HTMLElement>('.tb-search')!;
  const input = host.querySelector('input')!;
  const popup = el('div', 'tb-search-results');
  popup.id = 'tb-search-results';
  popup.setAttribute('role', 'listbox');
  popup.hidden = true;
  host.append(popup);
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-controls', popup.id);
  input.setAttribute('aria-expanded', 'false');
  let options: Suggestion[] = [];
  let active = -1;
  const close = () => {
    popup.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };
  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    input.value = '';
    close();
    if (isMobileLayout()) input.blur();
    option.select();
  };
  const paint = () => {
    const query = searchText(input.value);
    close();
    popup.replaceChildren();
    options = [];
    if (!query) return;
    const locale = shell.locale();
    const trips: Suggestion[] = [...shell.navTrips.querySelectorAll<HTMLButtonElement>('button')].map(button => ({
      label: button.querySelector('.tb-nav-label')?.textContent ?? '', detail: pickLocale(locale, { en: 'Open trip', 'pt-BR': 'Abrir roteiro' }),
      lead: () => icon('route', { size: 16 }), text: button.textContent ?? '', select: () => button.click(),
    }));
    for (const node of shell.main.querySelectorAll<HTMLElement>('[data-stop]')) {
      const label = node.querySelector('.tb-row__title')?.textContent ?? node.textContent ?? '';
      trips.push({ label,
        detail: searchSchedule(node.closest('[data-date]')?.getAttribute('data-date') ?? '', node.dataset.stopTime ?? node.querySelector('.tb-row__time')?.textContent?.trim() ?? '', locale),
        lead: () => node.querySelector('.tb-stop-pin')?.cloneNode(true) ?? icon('route', { size: 16 }),
        text: node.dataset.hay ?? label,
        select: () => {
          for (let parent = node.parentElement; parent; parent = parent.parentElement) {
            if (parent instanceof HTMLDetailsElement) parent.open = true;
          }
          node.scrollIntoView({ block: 'center' });
          if (node.dataset.placeId) preparePlaceSearch(node.dataset.placeId);
          const control = node.querySelector<HTMLElement>('.tb-row__main');
          if (control instanceof HTMLButtonElement) { control.focus({ preventScroll: true }); control.click(); }
          else { node.tabIndex = -1; node.focus({ preventScroll: true }); }
        },
      });
    }
    const cities: Suggestion[] = travelCities.flatMap(city => {
      const name = pickLocale(locale, city.name);
      return [{ label: name, detail: pickLocale(locale, { en: 'Open city', 'pt-BR': 'Abrir cidade' }), text: name, lead: () => icon('location_on', { size: 16 }),
        select: () => navigate({ kind: 'city', slug: city.slug, tab: 'places' }),
      }, ...city.places.map(place => ({ label: pickLocale(locale, place.name), detail: name, lead: () => placePin(place),
        text: `${name} ${place.name.en} ${place.name['pt-BR']}`,
        select: () => { preparePlaceSearch(place.id); navigate({ kind: 'city', slug: city.slug, tab: 'places', place: place.id }); },
      }))];
    });
    for (const [label, items] of [
      [pickLocale(locale, { en: 'Trip', 'pt-BR': 'Roteiro' }), trips],
      [pickLocale(locale, { en: 'Cities', 'pt-BR': 'Cidades' }), cities],
    ] as const) {
      const group = el('div', 'tb-search-group');
      group.setAttribute('role', 'group');
      group.setAttribute('aria-label', label);
      group.append(el('strong', 'tb-search-heading', label));
      const matches = searchMatches(items, query);
      for (const item of matches) {
        const index = options.push(item) - 1;
        const option = el('div', 'tb-search-option');
        option.id = `tb-search-option-${index}`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        const lead = el('span', 'tb-search-lead');
        lead.setAttribute('aria-hidden', 'true');
        if (item.lead) lead.append(item.lead());
        const text = el('span', 'tb-search-text');
        text.append(el('span', undefined, item.label), el('small', undefined, item.detail));
        option.append(lead, text);
        option.addEventListener('mousedown', event => event.preventDefault());
        option.addEventListener('click', () => choose(index));
        group.append(option);
      }
      if (!matches.length) group.append(el('p', 'tb-search-heading', pickLocale(locale, { en: 'No results', 'pt-BR': 'Nenhum resultado' })));
      popup.append(group);
    }
    popup.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };
  input.addEventListener('input', paint);
  input.addEventListener('focus', paint);
  input.addEventListener('blur', close);
  input.addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); close(); return; }
    if (popup.hidden) return;
    if (event.key === 'Enter') { event.preventDefault(); choose(active < 0 ? 0 : active); }
    if (!['ArrowDown', 'ArrowUp'].includes(event.key) || !options.length) return;
    event.preventDefault();
    active = (active + (event.key === 'ArrowDown' ? 1 : active < 0 ? 0 : -1) + options.length) % options.length;
    popup.querySelectorAll('[role="option"]').forEach((node, index) => node.setAttribute('aria-selected', String(index === active)));
    const selected = document.getElementById(`tb-search-option-${active}`)!;
    input.setAttribute('aria-activedescendant', selected.id);
    selected.scrollIntoView({ block: 'nearest' });
  });
  shell.onLocale(() => { if (document.activeElement === input) paint(); });
}

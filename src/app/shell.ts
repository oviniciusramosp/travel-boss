export type Locale = 'en' | 'pt-BR';

const LOCALE_KEY = 'tb-locale';
const SIDE_KEY = 'tb-side';
const MAIN_KEY = 'tb-main-width';

export type Shell = {
  root: HTMLElement;
  navTrips: HTMLElement;
  navCities: HTMLElement;
  main: HTMLElement;
  mapHost: HTMLElement;
  locale(): Locale;
  onLocale(fn: (locale: Locale) => void): () => void;
  query(): string;
  onQuery(fn: (query: string) => void): () => void;
  setSource(path: string): void;
  setExportEnabled(on: boolean): void;
  onExport(fn: () => void): () => void;
};

function readLocale(): Locale {
  const stored = localStorage.getItem(LOCALE_KEY);
  return stored === 'en' ? 'en' : 'pt-BR';
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export function mountShell(root: HTMLElement): Shell {
  root.className = 'tb-app';
  root.replaceChildren();

  const bar = el('header', 'tb-bar');
  const sideToggle = el('button', 'tb-side-toggle');
  sideToggle.type = 'button';
  sideToggle.innerHTML =
    '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></svg>';
  const mark = el('p', 'tb-mark');
  mark.append(document.createTextNode('Travel Boss'));
  const markMeta = el('span');
  markMeta.textContent = 'roteiros';
  mark.append(markMeta);

  const search = el('label', 'tb-search');
  search.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>`;
  const searchInput = el('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Buscar lugar ou roteiro';
  searchInput.autocomplete = 'off';
  searchInput.spellcheck = false;
  searchInput.setAttribute('aria-label', 'Buscar');
  const kbd = el('kbd');
  kbd.textContent = '⌘K';
  search.append(searchInput, kbd);

  const spacer = el('div', 'tb-bar-spacer');
  const source = el('p', 'tb-source');
  source.textContent = 'content/trips';

  const localeWrap = el('div', 'tb-locale');
  localeWrap.setAttribute('role', 'group');
  localeWrap.setAttribute('aria-label', 'Idioma');
  const ptBtn = el('button', undefined, 'PT');
  const enBtn = el('button', undefined, 'EN');
  ptBtn.type = 'button';
  enBtn.type = 'button';
  localeWrap.append(ptBtn, enBtn);

  const exportBtn = el('button', 'tb-btn', 'Exportar');
  exportBtn.type = 'button';
  exportBtn.disabled = true;
  exportBtn.title = 'Copiar Markdown para Notes ou Notion';

  bar.append(sideToggle, mark, search, spacer, source, localeWrap, exportBtn);

  const workspace = el('div', 'tb-workspace');
  const side = el('nav', 'tb-side');
  side.setAttribute('aria-label', 'Roteiros e cidades');
  const tripsLabel = el('p', 'tb-side-label', 'Roteiros');
  const navTrips = el('div');
  const citiesLabel = el('p', 'tb-side-label', 'Cidades');
  const navCities = el('div');
  side.append(tripsLabel, navTrips, citiesLabel, navCities);

  const main = el('main', 'tb-main');
  main.innerHTML =
    '<div class="tb-empty"><strong>Nenhum documento aberto</strong>Escolha um roteiro ou uma cidade. O roteiro é um arquivo Markdown: um LLM pode editá-lo com o app aberto.</div>';

  const split = el('div', 'tb-split');
  split.setAttribute('role', 'separator');
  split.setAttribute('aria-orientation', 'vertical');
  split.tabIndex = 0;
  const mapCol = el('section', 'tb-map-col');
  mapCol.setAttribute('aria-label', 'Mapa');
  const mapHost = el('div', 'tb-map');
  mapCol.append(mapHost);
  workspace.append(side, main, split, mapCol);
  root.append(bar, workspace);

  const storedMain = localStorage.getItem(MAIN_KEY);
  if (storedMain && /^\d+px$/.test(storedMain)) {
    workspace.style.setProperty('--pane-main', storedMain);
    workspace.style.setProperty('--pane-map', '1fr');
  }

  let sideOpen = localStorage.getItem(SIDE_KEY) !== '0';

  const applySide = () => {
    workspace.classList.toggle('is-collapsed', !sideOpen);
    side.toggleAttribute('inert', !sideOpen);
    sideToggle.setAttribute('aria-expanded', sideOpen ? 'true' : 'false');
    sideToggle.setAttribute(
      'aria-label',
      sideOpen
        ? locale === 'pt-BR'
          ? 'Recolher menu'
          : 'Collapse menu'
        : locale === 'pt-BR'
          ? 'Mostrar menu'
          : 'Show menu',
    );
  };

  let locale = readLocale();
  const localeFns = new Set<(value: Locale) => void>();
  const queryFns = new Set<(value: string) => void>();
  const exportFns = new Set<() => void>();

  const paintLocale = () => {
    ptBtn.setAttribute('aria-pressed', locale === 'pt-BR' ? 'true' : 'false');
    enBtn.setAttribute('aria-pressed', locale === 'en' ? 'true' : 'false');
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en';
    searchInput.placeholder =
      locale === 'pt-BR' ? 'Buscar lugar ou roteiro' : 'Search a place or trip';
    exportBtn.textContent = locale === 'pt-BR' ? 'Exportar' : 'Export';
    tripsLabel.textContent = locale === 'pt-BR' ? 'Roteiros' : 'Trips';
    citiesLabel.textContent = locale === 'pt-BR' ? 'Cidades' : 'Cities';
    markMeta.textContent = locale === 'pt-BR' ? 'roteiros' : 'trips';
    applySide();
  };
  paintLocale();

  sideToggle.addEventListener('click', () => {
    sideOpen = !sideOpen;
    localStorage.setItem(SIDE_KEY, sideOpen ? '1' : '0');
    applySide();
  });

  const setMainWidth = (px: number) => {
    const sideWidth = side.getBoundingClientRect().width;
    const total = workspace.getBoundingClientRect().width;
    const max = Math.max(280, total - sideWidth - 5 - 280);
    const next = Math.min(max, Math.max(280, Math.round(px)));
    const value = `${next}px`;
    workspace.style.setProperty('--pane-main', value);
    workspace.style.setProperty('--pane-map', '1fr');
    localStorage.setItem(MAIN_KEY, value);
    split.setAttribute('aria-valuenow', String(next));
  };

  split.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    split.setPointerCapture(event.pointerId);
    split.classList.add('is-dragging');
    const startX = event.clientX;
    const startW = main.getBoundingClientRect().width;
    const move = (ev: PointerEvent) => setMainWidth(startW + ev.clientX - startX);
    const up = () => {
      split.classList.remove('is-dragging');
      split.removeEventListener('pointermove', move);
    };
    split.addEventListener('pointermove', move);
    split.addEventListener('pointerup', up, { once: true });
    split.addEventListener('pointercancel', up, { once: true });
  });

  split.addEventListener('keydown', (event) => {
    const current = main.getBoundingClientRect().width;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setMainWidth(current - 24);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setMainWidth(current + 24);
    }
  });

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    locale = next;
    localStorage.setItem(LOCALE_KEY, next);
    paintLocale();
    for (const fn of localeFns) fn(next);
  };
  ptBtn.addEventListener('click', () => setLocale('pt-BR'));
  enBtn.addEventListener('click', () => setLocale('en'));

  searchInput.addEventListener('input', () => {
    const value = searchInput.value;
    for (const fn of queryFns) fn(value);
  });

  window.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      searchInput.focus();
      searchInput.select();
    }
  });

  exportBtn.addEventListener('click', () => {
    for (const fn of exportFns) fn();
  });

  return {
    root,
    navTrips,
    navCities,
    main,
    mapHost,
    locale: () => locale,
    onLocale(fn) {
      localeFns.add(fn);
      return () => localeFns.delete(fn);
    },
    query: () => searchInput.value,
    onQuery(fn) {
      queryFns.add(fn);
      return () => queryFns.delete(fn);
    },
    setSource(path) {
      source.textContent = path;
      source.title = path;
    },
    setExportEnabled(on) {
      exportBtn.disabled = !on;
    },
    onExport(fn) {
      exportFns.add(fn);
      return () => exportFns.delete(fn);
    },
  };
}

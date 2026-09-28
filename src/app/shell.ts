import { pickLocale } from '../catalog';
import { activeTheme, THEME_EVENT, toggleTheme } from './theme';
import { iconButton, segmented } from '../ui/controls';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';
import {
  EXIT_RATIO,
  markChromeMotion,
  markChromeSettled,
  readCssTime,
  sidebarSteps,
} from '../ui/motion';

export type Locale = 'en' | 'pt-BR';

const LOCALE_KEY = 'tb-locale';
const SIDE_KEY = 'tb-side';
const MAIN_KEY = 'tb-main-width';
export const PANE_MIN = 280;
const PANE_SPLIT = 5;

/** Width of the document pane. Without a measured workspace, only the minimum applies. */
export function clampPaneWidth(px: number, total: number, sideWidth: number): number {
  const rounded = Math.round(px);
  if (!(total > PANE_MIN * 2)) return Math.max(PANE_MIN, rounded);
  const max = Math.max(PANE_MIN, total - sideWidth - PANE_SPLIT - PANE_MIN);
  return Math.min(max, Math.max(PANE_MIN, rounded));
}

function paneMax(total: number, sideWidth: number): number {
  if (!(total > PANE_MIN * 2)) return PANE_MIN;
  return Math.max(PANE_MIN, Math.round(total - sideWidth - PANE_SPLIT - PANE_MIN));
}

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
  /** The empty document already in the shell. No new screen. */
  showEmpty(): void;
};

/** The saved choice, else Portuguese. The browser language does not decide. */
export function resolveLocale(stored: string | null): Locale {
  return stored === 'en' ? 'en' : 'pt-BR';
}

function readLocale(): Locale {
  let stored: string | null = null;
  try {
    stored = localStorage.getItem(LOCALE_KEY);
  } catch {
    stored = null;
  }
  return resolveLocale(stored);
}

export function mountShell(root: HTMLElement): Shell {
  root.className = 'tb-app';
  root.replaceChildren();

  const bar = el('header', 'tb-bar');
  const sideToggle = iconButton({
    icon: 'left_panel_close',
    label: 'Recolher menu',
    size: 'md',
  });
  sideToggle.classList.add('tb-side-toggle');
  const mark = el('a', 'tb-mark');
  mark.href = '#/';
  mark.append(document.createTextNode('Travel Boss'));
  const markMeta = el('span');
  markMeta.textContent = 'roteiros';
  mark.append(markMeta);

  const search = el('div', 'tb-search');
  const searchInput = el('input');
  searchInput.type = 'search';
  searchInput.placeholder = 'Buscar lugar ou roteiro';
  searchInput.autocomplete = 'off';
  searchInput.spellcheck = false;
  searchInput.setAttribute('aria-label', 'Search');
  const kbd = el('kbd');
  kbd.textContent = /Mac/.test(navigator.platform) ? '⌘K' : 'Ctrl K';
  search.append(icon('search', { size: 16 }), searchInput, kbd);

  const spacer = el('div', 'tb-bar-spacer');
  const localeWrap = el('div', 'tb-locale');
  localeWrap.setAttribute('role', 'group');
  localeWrap.setAttribute('aria-label', 'Language');
  const ptBtn = el('button', undefined, 'PT');
  const enBtn = el('button', undefined, 'EN');
  ptBtn.type = 'button';
  enBtn.type = 'button';
  localeWrap.append(ptBtn, enBtn);

  const exportBtn = iconButton({ icon: 'ios_share', label: 'Exportar roteiro' });
  exportBtn.disabled = true;

  const themeBtn = iconButton({
    icon: 'dark_mode',
    label: 'Mudar para modo escuro',
  });

  bar.append(sideToggle, mark, search, spacer, themeBtn, localeWrap, exportBtn);

  const workspace = el('div', 'tb-workspace');
  const side = el('nav', 'tb-side');
  side.setAttribute('aria-label', 'Trips and cities');
  const tripsLabel = el('p', 'tb-side-label', 'Roteiros');
  const navTrips = el('div');
  const citiesLabel = el('p', 'tb-side-label', 'Cidades');
  const navCities = el('div');
  side.append(tripsLabel, navTrips, citiesLabel, navCities);

  const main = el('main', 'tb-main');
  const empty = el('div', 'tb-empty');
  const emptyTitle = el('strong');
  const emptyBody = document.createTextNode('');
  empty.append(emptyTitle, emptyBody);
  main.append(empty);

  const split = el('div', 'tb-split');
  split.setAttribute('role', 'separator');
  split.setAttribute('aria-orientation', 'vertical');
  split.setAttribute('aria-valuemin', String(PANE_MIN));
  split.setAttribute('aria-valuemax', String(PANE_MIN));
  split.setAttribute('aria-valuenow', String(PANE_MIN));
  split.tabIndex = 0;
  const mapCol = el('section', 'tb-map-col');
  mapCol.setAttribute('aria-label', 'Map');
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
  if (!sideOpen) workspace.classList.add('is-collapsed', 'is-side-closed');

  let sideGen = 0;
  let holding = false;
  let stopSide = () => {};

  const endHold = () => {
    if (!holding) return;
    holding = false;
    markChromeSettled();
  };

  const cancelSide = () => {
    sideGen += 1;
    stopSide();
    stopSide = () => {};
  };

  const columnClosed = (closed: boolean) => {
    workspace.classList.toggle('is-side-closed', closed);
    reclamp(true);
  };

  const fadeClosed = (closed: boolean) => {
    workspace.classList.toggle('is-collapsed', closed);
  };

  const waitFade = (gen: number, ms: number, after: () => void) => {
    let done = false;
    const finish = () => {
      if (done || gen !== sideGen) return;
      done = true;
      stopSide();
      stopSide = () => {};
      after();
    };
    const timer = window.setTimeout(finish, ms + 40);
    const onEnd = (event: TransitionEvent) => {
      if (event.target !== side || event.propertyName !== 'opacity') return;
      finish();
    };
    side.addEventListener('transitionend', onEnd);
    stopSide = () => {
      window.clearTimeout(timer);
      side.removeEventListener('transitionend', onEnd);
    };
  };

  const playSide = (steps: readonly ('column' | 'fade')[], index: number, gen: number, ms: number) => {
    if (gen !== sideGen) return;
    const step = steps[index];
    if (!step) {
      window.requestAnimationFrame(() => {
        if (gen !== sideGen) return;
        if (sideOpen) side.toggleAttribute('inert', false);
        endHold();
      });
      return;
    }
    if (step === 'column') {
      columnClosed(!sideOpen);
      playSide(steps, index + 1, gen, ms);
      return;
    }
    const go = () => {
      if (gen !== sideGen) return;
      fadeClosed(!sideOpen);
      waitFade(gen, sideOpen ? ms : ms * EXIT_RATIO, () => playSide(steps, index + 1, gen, ms));
    };
    if (sideOpen && index > 0) window.requestAnimationFrame(go);
    else go();
  };

  const applySide = (animate: boolean) => {
    sideToggle.setAttribute('aria-expanded', sideOpen ? 'true' : 'false');
    const sideLabel = pickLocale(locale, {
      en: sideOpen ? 'Collapse menu' : 'Show menu',
      'pt-BR': sideOpen ? 'Recolher menu' : 'Mostrar menu',
    });
    sideToggle.setAttribute('aria-label', sideLabel);
    sideToggle.setAttribute('data-tip', sideLabel);
    const glyph = sideToggle.querySelector('.material-symbols-rounded');
    if (glyph) glyph.textContent = sideOpen ? 'left_panel_close' : 'left_panel_open';

    const closed = !sideOpen;
    const atRest =
      workspace.classList.contains('is-collapsed') === closed &&
      workspace.classList.contains('is-side-closed') === closed &&
      !holding;
    if (!animate || atRest || readCssTime('--dur-slow') === 0) {
      const resume = holding;
      cancelSide();
      const columnWas = workspace.classList.contains('is-side-closed');
      fadeClosed(closed);
      if (columnWas !== closed) columnClosed(closed);
      side.toggleAttribute('inert', closed);
      if (resume) endHold();
      return;
    }

    cancelSide();
    const gen = sideGen;
    holding = true;
    markChromeMotion();
    side.toggleAttribute('inert', true);
    playSide(sidebarSteps(sideOpen), 0, gen, readCssTime('--dur-slow'));
  };

  let locale = readLocale();
  const paintTheme = () => {
    const dark = activeTheme() === 'dark';
    const label = pickLocale(
      locale,
      dark
        ? { en: 'Switch to light mode', 'pt-BR': 'Mudar para modo claro' }
        : { en: 'Switch to dark mode', 'pt-BR': 'Mudar para modo escuro' },
    );
    themeBtn.setAttribute('aria-label', label);
    themeBtn.setAttribute('data-tip', label);
    const glyph = themeBtn.querySelector('.material-symbols-rounded');
    if (glyph) glyph.textContent = dark ? 'light_mode' : 'dark_mode';
  };
  themeBtn.addEventListener('click', () => {
    toggleTheme();
  });
  window.addEventListener(THEME_EVENT, () => paintTheme());
  const localeFns = new Set<(value: Locale) => void>();
  const queryFns = new Set<(value: string) => void>();
  const exportFns = new Set<() => void>();

  const paintLocale = () => {
    ptBtn.setAttribute('aria-pressed', locale === 'pt-BR' ? 'true' : 'false');
    enBtn.setAttribute('aria-pressed', locale === 'en' ? 'true' : 'false');
    document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : 'en';
    searchInput.placeholder = pickLocale(locale, {
      en: 'Search a place or trip',
      'pt-BR': 'Buscar lugar ou roteiro',
    });
    searchInput.setAttribute(
      'aria-label',
      pickLocale(locale, { en: 'Search', 'pt-BR': 'Buscar' }),
    );
    localeWrap.setAttribute(
      'aria-label',
      pickLocale(locale, { en: 'Language', 'pt-BR': 'Idioma' }),
    );
    const exportTip = pickLocale(locale, {
      en: 'Copy the open trip and download a Markdown (.md) file',
      'pt-BR': 'Copiar o roteiro aberto e baixar um arquivo Markdown (.md)',
    });
    exportBtn.setAttribute('aria-label', exportTip);
    exportBtn.setAttribute('data-tip', exportTip);
    kbd.setAttribute('data-tip', pickLocale(locale, { en: 'Focus search', 'pt-BR': 'Focar a busca' }));
    side.setAttribute(
      'aria-label',
      pickLocale(locale, { en: 'Trips and cities', 'pt-BR': 'Roteiros e cidades' }),
    );
    tripsLabel.textContent = pickLocale(locale, { en: 'Trips', 'pt-BR': 'Roteiros' });
    citiesLabel.textContent = pickLocale(locale, { en: 'Cities', 'pt-BR': 'Cidades' });
    markMeta.textContent = pickLocale(locale, { en: 'trips', 'pt-BR': 'roteiros' });
    emptyTitle.textContent = pickLocale(locale, {
      en: 'No document open',
      'pt-BR': 'Nenhum documento aberto',
    });
    emptyBody.textContent = pickLocale(locale, {
      en: 'Choose a trip or a city. The trip is a Markdown file: an LLM can edit it with the app open.',
      'pt-BR':
        'Escolha um roteiro ou uma cidade. O roteiro é um arquivo Markdown: um LLM pode editá-lo com o app aberto.',
    });
    paintTheme();
    mapCol.setAttribute('aria-label', pickLocale(locale, { en: 'Map', 'pt-BR': 'Mapa' }));
    split.setAttribute(
      'aria-label',
      pickLocale(locale, { en: 'Document width', 'pt-BR': 'Largura do documento' }),
    );
    applySide(false);
    segmented(localeWrap);
  };
  paintLocale();

  sideToggle.addEventListener('click', () => {
    sideOpen = !sideOpen;
    localStorage.setItem(SIDE_KEY, sideOpen ? '1' : '0');
    applySide(true);
  });

  const setMainWidth = (px: number, persist: boolean) => {
    const sideWidth = side.getBoundingClientRect().width;
    const total = workspace.getBoundingClientRect().width;
    const next = clampPaneWidth(px, total, sideWidth);
    workspace.style.setProperty('--pane-main', `${next}px`);
    workspace.style.setProperty('--pane-map', '1fr');
    if (persist) localStorage.setItem(MAIN_KEY, `${next}px`);
    split.setAttribute('aria-valuemin', String(PANE_MIN));
    split.setAttribute('aria-valuemax', String(paneMax(total, sideWidth)));
    split.setAttribute('aria-valuenow', String(next));
  };

  const reclamp = (persist: boolean) => {
    const raw = workspace.style.getPropertyValue('--pane-main').trim();
    if (!/^\d+px$/.test(raw)) {
      const sideWidth = side.getBoundingClientRect().width;
      const total = workspace.getBoundingClientRect().width;
      const now = Math.round(main.getBoundingClientRect().width);
      split.setAttribute('aria-valuemin', String(PANE_MIN));
      split.setAttribute('aria-valuemax', String(paneMax(total, sideWidth)));
      split.setAttribute('aria-valuenow', String(Math.max(PANE_MIN, now || PANE_MIN)));
      return;
    }
    setMainWidth(Number.parseInt(raw, 10), persist);
  };

  requestAnimationFrame(() => reclamp(true));
  window.addEventListener('resize', () => reclamp(true));

  split.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    split.setPointerCapture(event.pointerId);
    split.classList.add('is-dragging');
    const startX = event.clientX;
    const startW = main.getBoundingClientRect().width;
    let frame = 0;
    let pending = startW;
    const move = (ev: PointerEvent) => {
      pending = startW + ev.clientX - startX;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        setMainWidth(pending, false);
      });
    };
    let done = false;
    const up = () => {
      if (done) return;
      done = true;
      split.classList.remove('is-dragging');
      split.removeEventListener('pointermove', move);
      if (frame) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
      setMainWidth(pending, true);
    };
    split.addEventListener('pointermove', move);
    split.addEventListener('pointerup', up, { once: true });
    split.addEventListener('pointercancel', up, { once: true });
  });

  split.addEventListener('keydown', (event) => {
    const current = main.getBoundingClientRect().width;
    const total = workspace.getBoundingClientRect().width;
    const sideWidth = side.getBoundingClientRect().width;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setMainWidth(current - 24, true);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setMainWidth(current + 24, true);
    } else if (event.key === 'Home') {
      event.preventDefault();
      setMainWidth(PANE_MIN, true);
    } else if (event.key === 'End') {
      event.preventDefault();
      setMainWidth(paneMax(total, sideWidth), true);
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
    // Autocomplete owns typing; selecting a suggestion navigates to the result.
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
    query: () => '',
    onQuery(fn) {
      queryFns.add(fn);
      return () => queryFns.delete(fn);
    },
    setSource() {},
    setExportEnabled(on) {
      exportBtn.disabled = !on;
    },
    onExport(fn) {
      exportFns.add(fn);
      return () => exportFns.delete(fn);
    },
    showEmpty() {
      main.replaceChildren(empty);
      paintLocale();
    },
  };
}

export type Theme = 'light' | 'dark';

/** Saved choice. Absent means follow the system. */
export const THEME_KEY = 'tb:theme';

/** Basemap and the top-bar button listen for this. */
export const THEME_EVENT = 'tb:theme';

const CANVAS: Record<Theme, string> = {
  light: '#f5f5f5',
  dark: '#111111',
};

export function parseTheme(value: string | null): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

/** Saved choice wins. Otherwise follow the system. Light when the system is light. */
export function resolveTheme(stored: string | null, systemDark: boolean): Theme {
  return parseTheme(stored) ?? (systemDark ? 'dark' : 'light');
}

export function readStoredTheme(): Theme | null {
  try {
    return parseTheme(localStorage.getItem(THEME_KEY));
  } catch {
    return null;
  }
}

export function systemPrefersDark(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
}

/** Attribute when the user chose, otherwise the system. */
export function activeTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  const explicit = parseTheme(document.documentElement.getAttribute('data-theme'));
  if (explicit) return explicit;
  return systemPrefersDark() ? 'dark' : 'light';
}

function canvasColor(theme: Theme): string {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return CANVAS[theme];
  const value = getComputedStyle(document.documentElement).getPropertyValue('--color-canvas').trim();
  return value || CANVAS[theme];
}

function meta(name: string): HTMLMetaElement {
  const found = document.querySelector(`meta[name="${name}"]`);
  if (found instanceof HTMLMetaElement) return found;
  const created = document.createElement('meta');
  created.name = name;
  document.head.append(created);
  return created;
}

function syncChrome(theme: Theme) {
  const root = document.documentElement;
  root.style.colorScheme = theme;
  meta('color-scheme').setAttribute('content', theme);
  meta('theme-color').setAttribute('content', canvasColor(theme));
}

function publish(theme: Theme) {
  if (typeof document !== 'undefined') syncChrome(theme);
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
}

let watching = false;

function watchSystem() {
  if (watching || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
  watching = true;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    if (readStoredTheme()) return;
    publish(activeTheme());
  });
}

/** Apply a saved choice before the shell paints. No attribute means the system decides. */
export function bootTheme(): void {
  if (typeof document === 'undefined') return;
  const stored = readStoredTheme();
  if (stored) document.documentElement.setAttribute('data-theme', stored);
  else document.documentElement.removeAttribute('data-theme');
  syncChrome(activeTheme());
  watchSystem();
}

export function toggleTheme(): Theme {
  const next: Theme = activeTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* private mode */
  }
  if (typeof document !== 'undefined') document.documentElement.setAttribute('data-theme', next);
  publish(next);
  return next;
}

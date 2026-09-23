/** Seconds. One duration for every programmatic camera move. */
export const CAMERA_DURATION_S = 0.45;

/** Exit transitions run at about 70% of the entrance. */
export const EXIT_RATIO = 0.7;

export const CHROME_MOTION_EVENT = 'tb-chrome-motion';
export const CHROME_SETTLED_EVENT = 'tb-chrome-settled';

/** MapLibre label-collision fade when motion is allowed. */
export const LABEL_FADE_MS = 300;

const REDUCE_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(REDUCE_QUERY).matches
  );
}

export type CameraMotion = { animate: boolean; duration: number };

/** Animated camera, or a cut when the user prefers reduced motion. */
export function cameraMotion(reduced = prefersReducedMotion()): CameraMotion {
  if (reduced) return { animate: false, duration: 0 };
  return { animate: true, duration: CAMERA_DURATION_S };
}

export function labelFadeDuration(reduced = prefersReducedMotion()): number {
  return reduced ? 0 : LABEL_FADE_MS;
}

export function markChromeMotion(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CHROME_MOTION_EVENT));
}

export function markChromeSettled(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CHROME_SETTLED_EVENT));
}

/** Computed custom property, or `fallback` when CSS has not been applied. */
export function cssToken(name: string, fallback: string): string {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

/** Computed time token in milliseconds (`320ms` → 320). */
export function readCssTime(name: string, fallback = 0): number {
  if (typeof document === 'undefined' || typeof getComputedStyle !== 'function') return fallback;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : fallback;
}

/** Collapse fades, then the column closes. Expand opens the column, then fades in. */
export function sidebarSteps(opening: boolean): readonly ('column' | 'fade')[] {
  return opening ? ['column', 'fade'] : ['fade', 'column'];
}

/** Crossfade the main panel. Skips the API when motion is reduced or unsupported. */
export function runViewTransition(update: () => void, reduced = prefersReducedMotion()): void {
  const start =
    typeof document !== 'undefined' && typeof document.startViewTransition === 'function'
      ? document.startViewTransition.bind(document)
      : null;
  if (reduced || !start) {
    update();
    return;
  }
  let ran = false;
  const once = () => {
    if (ran) return;
    ran = true;
    update();
  };
  try {
    start(once);
  } catch {
    once();
  }
}

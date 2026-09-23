/** Seconds. One duration for every programmatic camera move. */
export const CAMERA_DURATION_S = 0.45;

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

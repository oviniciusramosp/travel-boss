import { labelFadeDuration } from '../ui/motion';

/** MapLibre options from the portfolio map. `fadeDuration: 0` skips the label fade. */
export const MAPLIBRE_PERF = {
  fadeDuration: 0,
  validateStyle: false,
  maxTileCacheZoomLevels: 8,
  localIdeographFontFamily: false as const,
};

/**
 * Reduced motion already asks for 0. The perf options also use 0,
 * so the two never disagree.
 */
export function maplibreFade(reduced: boolean): number {
  return reduced ? labelFadeDuration(true) : MAPLIBRE_PERF.fadeDuration;
}

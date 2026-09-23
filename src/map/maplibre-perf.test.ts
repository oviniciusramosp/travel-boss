import { describe, expect, it } from 'vitest';
import { MAPLIBRE_PERF, maplibreFade } from './maplibre-perf';

describe('MapLibre performance options', () => {
  it('skips the label fade, including when motion is reduced', () => {
    expect(MAPLIBRE_PERF).toEqual({
      fadeDuration: 0,
      validateStyle: false,
      maxTileCacheZoomLevels: 8,
      localIdeographFontFamily: false,
    });
    expect(maplibreFade(false)).toBe(0);
    expect(maplibreFade(true)).toBe(0);
  });
});

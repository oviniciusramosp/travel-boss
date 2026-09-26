import { describe, expect, it } from 'vitest';
import { loadOsmAreas, osmAreaFor, osmAreasReady, placeHasOsmArea } from './osm-area-bridge';

describe('osm area bridge', () => {
  it('keeps outlines out until the geometry module loads', async () => {
    expect(placeHasOsmArea('par-montmartre')).toBe(true);
    expect(placeHasOsmArea('par-no-such-place')).toBe(false);
    expect(osmAreasReady()).toBe(false);
    expect(osmAreaFor('par-montmartre')).toBeUndefined();
    await loadOsmAreas();
    expect(osmAreasReady()).toBe(true);
    expect(osmAreaFor('par-montmartre')?.kind).toBe('multipolygon');
    await loadOsmAreas();
    expect(osmAreaFor('par-montmartre')?.kind).toBe('multipolygon');
  });
});

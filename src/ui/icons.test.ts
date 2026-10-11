import { describe, expect, it, vi } from 'vitest';
import fontUrl from '../../public/fonts/material-symbols-rounded.woff2?url';
import metadata from '../../public/fonts/material-symbols-rounded.json';
import { categoryMaterialIcon } from '../data/travel-categories';
import { subcategoryMaterialIcon } from '../data/travel-subcategories';
import { ICON_FONT_HREF, ICONS, loadIconFont } from './icons';

const ligatures = [
  ...Object.values(categoryMaterialIcon),
  ...Object.values(subcategoryMaterialIcon),
].filter((name): name is string => Boolean(name));

describe('ICONS', () => {
  it('is sorted and unique', () => {
    expect([...ICONS]).toEqual([...ICONS].sort());
    expect(new Set(ICONS).size).toBe(ICONS.length);
  });

  it('includes every category and subcategory ligature', () => {
    for (const name of ligatures) expect(ICONS).toContain(name);
  });

  it('ships the same subset as a local WOFF2 asset', () => {
    expect(ICON_FONT_HREF).toBe('fonts/material-symbols-rounded.woff2');
    expect(fontUrl).toMatch(/\/fonts\/material-symbols-rounded\.woff2$/);
    expect(metadata.iconNames).toEqual(ICONS);
  });
});

describe('icon font readiness', () => {
  it('reveals icons only after the local font finishes loading', async () => {
    let finish!: (faces: FontFace[]) => void;
    const load = vi.fn(() => new Promise<FontFace[]>((resolve) => { finish = resolve; }));
    const ready = vi.fn();
    const pending = loadIconFont({ load }, ready);
    expect(ready).not.toHaveBeenCalled();
    finish([{ status: 'loaded' } as FontFace]);
    await pending;
    expect(ready).toHaveBeenCalledOnce();
  });

  it('keeps names hidden when the font is missing or unavailable offline', async () => {
    const ready = vi.fn();
    await loadIconFont({ load: vi.fn().mockResolvedValue([]) }, ready);
    await loadIconFont({ load: vi.fn().mockRejectedValue(new Error('offline')) }, ready);
    expect(ready).not.toHaveBeenCalled();
  });
});

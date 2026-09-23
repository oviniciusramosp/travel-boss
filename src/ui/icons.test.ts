import { describe, expect, it } from 'vitest';
import { categoryMaterialIcon } from '../data/travel-categories';
import { subcategoryMaterialIcon } from '../data/travel-subcategories';
import { ICON_FONT_HREF, ICONS } from './icons';

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

  it('points the font stylesheet at that same alphabetical subset', () => {
    const url = new URL(ICON_FONT_HREF);
    expect(url.searchParams.get('display')).toBe('block');
    expect(url.searchParams.get('icon_names')).toBe(ICONS.join(','));
    expect(url.searchParams.get('family')).toContain(
      'opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200',
    );
  });
});

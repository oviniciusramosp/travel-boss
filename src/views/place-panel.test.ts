import { describe, expect, it } from 'vitest';
import { dropSlide, slideIndex } from './place-panel';

describe('photo slider', () => {
  it('wraps the index in either direction', () => {
    expect(slideIndex(0, 0)).toBe(0);
    expect(slideIndex(3, 3)).toBe(0);
    expect(slideIndex(-1, 3)).toBe(2);
  });

  it('drops a broken photo and keeps a valid index', () => {
    expect(dropSlide(['a', 'b', 'c'], 1)).toEqual({ slides: ['a', 'c'], index: 1 });
    expect(dropSlide(['a', 'b'], 1)).toEqual({ slides: ['a'], index: 0 });
    expect(dropSlide(['only'], 0)).toEqual({ slides: [], index: 0 });
  });
});
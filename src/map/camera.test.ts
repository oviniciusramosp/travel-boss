import { describe, expect, it } from 'vitest';
import { diffPinIds, paddedCenterOffset, selectionEases, selectionZoom } from './camera';

describe('selection camera', () => {
  it('keeps detail zoom and only raises a wide view to 14', () => {
    expect(selectionZoom(16)).toBe(16);
    expect(selectionZoom(13)).toBe(13);
    expect(selectionZoom(12.9)).toBe(14);
    expect(selectionZoom(4)).toBe(14);
  });

  it('pans when zoom barely changes and flies otherwise', () => {
    expect(selectionEases(0)).toBe('pan');
    expect(selectionEases(0.39)).toBe('pan');
    expect(selectionEases(-0.39)).toBe('pan');
    expect(selectionEases(0.4)).toBe('fly');
  });

  it('shifts the center by half the covered padding', () => {
    expect(paddedCenterOffset({ top: 0, right: 320, bottom: 0, left: 0 })).toEqual({
      x: 160,
      y: 0,
    });
  });
});

describe('diffPinIds', () => {
  it('keeps existing ids, creates new ones, and drops the rest', () => {
    expect(diffPinIds(['a', 'b', 'c'], ['b', 'b', 'd'])).toEqual({
      create: ['d'],
      keep: ['b'],
      remove: ['a', 'c'],
    });
  });
});

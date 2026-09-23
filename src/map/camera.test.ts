import { describe, expect, it } from 'vitest';
import {
  diffPinIds,
  fitMaxZoom,
  paddedCenterOffset,
  pointsForFit,
  selectionEases,
  selectionFrame,
  selectionZoom,
} from './camera';
import { coveredInsets, mergeInsets } from './chrome';

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

describe('selection frame', () => {
  it('pans a point when already close, and flies to an area from a wide view', () => {
    expect(selectionFrame(16, true)).toEqual({ zoom: 16, ease: 'pan', frame: 'point' });
    expect(selectionFrame(14, false)).toEqual({ zoom: 14, ease: 'pan', frame: 'point' });
    expect(selectionFrame(12, false)).toEqual({ zoom: 14, ease: 'fly', frame: 'point' });
    expect(selectionFrame(12, true)).toEqual({ zoom: 14, ease: 'fly', frame: 'area' });
  });
});

describe('city fit', () => {
  const core = [
    { id: 'a', lat: 48.86, lng: 2.34, category: 'tourist' },
    { id: 'b', lat: 48.85, lng: 2.35, category: 'cafes' },
    { id: 'c', lat: 48.87, lng: 2.33, category: 'parks' },
    { id: 'd', lat: 48.855, lng: 2.36, category: 'photo' },
    { id: 'e', lat: 48.865, lng: 2.345, category: 'markets' },
  ];

  it('drops airports and points outside the p75 radius', () => {
    const kept = pointsForFit([
      ...core,
      { id: 'ory', lat: 48.726, lng: 2.365, category: 'airport' },
      { id: 'far', lat: 48.8049, lng: 2.1204, category: 'tourist' },
    ]);
    expect(kept.map((pin) => pin.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('keeps a lone airport so the camera still has a target', () => {
    const only = { id: 'cdg', lat: 49.01, lng: 2.55, category: 'airport' };
    expect(pointsForFit([only])).toEqual([only]);
  });

  it('uses the tightest known city zoom', () => {
    expect(fitMaxZoom([14])).toBe(14);
    expect(fitMaxZoom([14, 12, Number.NaN])).toBe(12);
    expect(fitMaxZoom([])).toBe(16);
  });
});

describe('chrome insets', () => {
  const map = { left: 0, top: 0, right: 800, bottom: 600 };

  it('counts a sidebar on the left and a panel on the right, not a column beside the map', () => {
    expect(coveredInsets(map, { left: 0, top: 0, right: 232, bottom: 600 }).left).toBe(232);
    expect(coveredInsets(map, { left: 500, top: 40, right: 780, bottom: 560 }).right).toBe(300);
    expect(coveredInsets({ left: 400, top: 0, right: 1200, bottom: 600 }, { left: 0, top: 0, right: 232, bottom: 600 })).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('keeps the larger inset when padding and measurement disagree', () => {
    expect(
      mergeInsets(
        { top: 0, right: 360, bottom: 0, left: 0 },
        { top: 0, right: 300, bottom: 0, left: 232 },
      ),
    ).toEqual({ top: 0, right: 360, bottom: 0, left: 232 });
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

import { describe, expect, it } from 'vitest';
import { pinchZoom, wheelPixels } from './trackpad';

describe('trackpad wheel', () => {
  it('scales line and page deltas into pixels', () => {
    expect(wheelPixels(1, -2, 0, 800, 600)).toEqual({ dx: 1, dy: -2 });
    expect(wheelPixels(1, 2, 1, 800, 600)).toEqual({ dx: 16, dy: 32 });
    expect(wheelPixels(0.5, 1, 2, 800, 600)).toEqual({ dx: 400, dy: 600 });
  });

  it('turns a pinch into a fractional zoom around the current level', () => {
    expect(pinchZoom(12, -30, 2, 18)).toBe(12.5);
    expect(pinchZoom(12, 60, 2, 18)).toBe(11);
    expect(pinchZoom(2, 120, 2, 18)).toBe(2);
    expect(pinchZoom(18, -120, 2, 18)).toBe(18);
  });
});

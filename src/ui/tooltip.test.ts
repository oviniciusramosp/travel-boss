import { describe, expect, it } from 'vitest';
import { TOOLTIP_SHOW_MS, tooltipPlacement, tooltipShowDelay } from './tooltip';

describe('tooltipShowDelay', () => {
  it('waits before the first tooltip and stays warm after a recent one', () => {
    expect(tooltipShowDelay(null)).toBe(TOOLTIP_SHOW_MS);
    expect(tooltipShowDelay(0)).toBe(0);
    expect(tooltipShowDelay(299)).toBe(0);
    expect(tooltipShowDelay(300)).toBe(TOOLTIP_SHOW_MS);
  });
});

describe('tooltipPlacement', () => {
  const target = { top: 80, bottom: 108, left: 40, width: 28 };
  const tip = { width: 100, height: 24 };

  it('prefers above the target', () => {
    expect(tooltipPlacement(target, tip, 800)).toMatchObject({ top: 50, side: 'above' });
  });

  it('flips below when the tip would leave the viewport', () => {
    expect(tooltipPlacement({ ...target, top: 4, bottom: 32 }, tip, 800)).toMatchObject({
      top: 38,
      side: 'below',
    });
  });

  it('keeps the tip inside the viewport horizontally', () => {
    const placed = tooltipPlacement({ ...target, left: 780, width: 28 }, tip, 800);
    expect(placed.left).toBe(694);
  });
});

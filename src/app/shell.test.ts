import { describe, expect, it } from 'vitest';
import { PANE_MIN, clampPaneWidth } from './shell';

describe('clampPaneWidth', () => {
  it('keeps the document and the map above the minimum', () => {
    expect(clampPaneWidth(900, 1000, 232)).toBe(483);
    expect(clampPaneWidth(100, 1000, 232)).toBe(PANE_MIN);
    expect(clampPaneWidth(400.4, 1000, 0)).toBe(400);
  });

  it('does not invent a maximum before the workspace has a width', () => {
    expect(clampPaneWidth(640, 0, 0)).toBe(640);
    expect(clampPaneWidth(10, 0, 0)).toBe(PANE_MIN);
  });
});

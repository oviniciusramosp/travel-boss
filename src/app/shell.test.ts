import { describe, expect, it } from 'vitest';
import { PANE_MIN, clampPaneWidth, resolveLocale } from './shell';

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

describe('resolveLocale', () => {
  it('keeps the saved language and falls back to Portuguese', () => {
    expect(resolveLocale('en')).toBe('en');
    expect(resolveLocale('pt-BR')).toBe('pt-BR');
    expect(resolveLocale(null)).toBe('pt-BR');
    expect(resolveLocale('fr')).toBe('pt-BR');
  });
});

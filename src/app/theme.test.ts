import { describe, expect, it } from 'vitest';
import { BASEMAP_THEME_EVENT } from '../map/basemap-style';
import { THEME_EVENT, bootTheme, parseTheme, resolveTheme } from './theme';

describe('resolveTheme', () => {
  it('keeps a saved choice over the system', () => {
    expect(resolveTheme('light', true)).toBe('light');
    expect(resolveTheme('dark', false)).toBe('dark');
  });

  it('follows the system when nothing valid is saved, and light stays the default', () => {
    expect(resolveTheme(null, false)).toBe('light');
    expect(resolveTheme(null, true)).toBe('dark');
    expect(resolveTheme('system', true)).toBe('dark');
    expect(resolveTheme('', false)).toBe('light');
  });
});

describe('parseTheme', () => {
  it('accepts only light and dark', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme(null)).toBeNull();
    expect(parseTheme('auto')).toBeNull();
  });
});

describe('theme event', () => {
  it('uses the same name the basemap listens for', () => {
    expect(THEME_EVENT).toBe('tb:theme');
    expect(THEME_EVENT).toBe(BASEMAP_THEME_EVENT);
  });

  it('does not touch the document when there is none', () => {
    expect(() => bootTheme()).not.toThrow();
  });
});

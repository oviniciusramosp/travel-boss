/** sRGB relative luminance. Null when `color` is not a hex. */
export function relativeLuminance(color: string): number | null {
  const hex = color.trim().replace(/^#/, '');
  const full = hex.length === 3 ? [...hex].map((channel) => channel + channel).join('') : hex;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  const channel = (pair: string) => {
    const value = Number.parseInt(pair, 16) / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel(full.slice(0, 2)) +
    0.7152 * channel(full.slice(2, 4)) +
    0.0722 * channel(full.slice(4, 6))
  );
}

export type ContrastInk = 'ink' | 'on-ink';

/** Light brand fills read as ink. Dark fills read as on-ink. */
export function chipTone(color: string): ContrastInk {
  const luminance = relativeLuminance(color);
  if (luminance == null) return 'on-ink';
  return luminance > 0.4 ? 'ink' : 'on-ink';
}

const INK = '#0a0a0a';
const ON_INK = '#fafafa';

/**
 * Foreground for a glyph sitting on a filled circle.
 * Picks whichever of ink / on-ink wins the contrast ratio.
 */
export function circleInk(color: string): ContrastInk {
  const background = relativeLuminance(color);
  const ink = relativeLuminance(INK);
  const paper = relativeLuminance(ON_INK);
  if (background == null || ink == null || paper == null) return 'on-ink';
  const ratio = (a: number, b: number) => {
    const hi = Math.max(a, b);
    const lo = Math.min(a, b);
    return (hi + 0.05) / (lo + 0.05);
  };
  return ratio(background, paper) > ratio(background, ink) ? 'on-ink' : 'ink';
}

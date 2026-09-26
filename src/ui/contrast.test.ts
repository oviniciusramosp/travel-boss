import { describe, expect, it } from 'vitest';
import { circleInk, chipTone } from './contrast';

describe('circleInk', () => {
  it('puts a light glyph on the train slate and keeps ink on light pins', () => {
    expect(circleInk('#64748b')).toBe('on-ink');
    expect(circleInk('#a78bfa')).toBe('on-ink'); // lodging lilac, by request
    expect(circleInk('#facc15')).toBe('ink');
    expect(circleInk('#f97316')).toBe('ink');
    expect(circleInk('#666666')).toBe('on-ink');
  });

  it('keeps the chip threshold that yellow lines already use', () => {
    expect(chipTone('#F4CA16')).toBe('ink');
    expect(chipTone('#62259D')).toBe('on-ink');
  });
});

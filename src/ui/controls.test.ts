import { describe, expect, it } from 'vitest';
import { segmentedMove } from './controls';

describe('segmentedMove', () => {
  it('moves with the arrows and wraps', () => {
    expect(segmentedMove(0, 3, 'ArrowRight')).toBe(1);
    expect(segmentedMove(2, 3, 'ArrowRight')).toBe(0);
    expect(segmentedMove(0, 3, 'ArrowLeft')).toBe(2);
    expect(segmentedMove(1, 3, 'ArrowLeft')).toBe(0);
  });

  it('jumps to the ends and ignores other keys', () => {
    expect(segmentedMove(1, 4, 'Home')).toBe(0);
    expect(segmentedMove(1, 4, 'End')).toBe(3);
    expect(segmentedMove(1, 4, 'ArrowDown')).toBeNull();
    expect(segmentedMove(1, 0, 'ArrowRight')).toBeNull();
  });
});
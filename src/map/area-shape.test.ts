import { describe, expect, it } from 'vitest';
import { drawableRings } from './area-shape';

describe('drawableRings', () => {
  it('keeps a line, a ring, and only the long multipolygon parts', () => {
    expect(drawableRings({ kind: 'polyline', path: [[1, 2], [3, 4]] }).line).toBe(true);
    expect(drawableRings({ kind: 'polyline', path: [[1, 2]] }).paths).toEqual([]);
    expect(drawableRings({ kind: 'polygon', path: [[0, 0], [0, 1], [1, 1]] }).paths).toHaveLength(1);
    expect(
      drawableRings({
        kind: 'multipolygon',
        paths: [
          [[0, 0], [1, 1]],
          [[0, 0], [0, 1], [1, 1], [1, 0]],
        ],
      }).paths,
    ).toHaveLength(1);
    expect(
      drawableRings({
        kind: 'multipolygon',
        paths: [[[0, 0], [0, 1], [1, 1]]],
        lines: [[[0, 0]], [[0, 0], [1, 1]]],
      }).lines,
    ).toEqual([[[0, 0], [1, 1]]]);
  });
});

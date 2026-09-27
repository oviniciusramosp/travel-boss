import type { TravelPlace } from '../catalog';

type Area = NonNullable<TravelPlace['area']>;

/** Rings worth drawing. Short paths are skipped, same as the portfolio map. */
export function drawableRings(area: Area): { line: boolean; paths: [number, number][][]; lines: [number, number][][] } {
  if (area.kind === 'polyline') {
    return { line: true, paths: area.path.length >= 2 ? [area.path] : [], lines: [] };
  }
  if (area.kind === 'polygon') {
    return { line: false, paths: area.path.length >= 3 ? [area.path] : [], lines: [] };
  }
  return {
    line: false,
    paths: area.paths.filter((ring) => ring.length >= 3),
    lines: (area.lines ?? []).filter((path) => path.length >= 2),
  };
}

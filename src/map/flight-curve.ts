type Point = { lat: number; lng: number };

/** Quadratic curve in Mercator space. Illustrative, never a surveyed flight track. */
export function flightCurve(from: Point, to: Point): [number, number][] {
  const rad = Math.PI / 180;
  const project = (lat: number) => Math.log(Math.tan(Math.PI / 4 + Math.max(-85, Math.min(85, lat)) * rad / 2)) / rad;
  const x0 = from.lng;
  // Unwrap the destination so flights across the date line take the short way.
  const x1 = x0 + ((to.lng - x0 + 540) % 360) - 180;
  const y0 = project(from.lat);
  const y1 = project(to.lat);
  const cx = (x0 + x1) / 2 - (y1 - y0) * 0.2;
  const cy = (y0 + y1) / 2 + (x1 - x0) * 0.2;
  return Array.from({ length: 65 }, (_, index) => {
    const t = index / 64;
    const u = 1 - t;
    const y = u * u * y0 + 2 * u * t * cy + t * t * y1;
    return [(2 * Math.atan(Math.exp(y * rad)) - Math.PI / 2) / rad, u * u * x0 + 2 * u * t * cx + t * t * x1];
  });
}

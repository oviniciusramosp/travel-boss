/** Great-circle samples and the dashed connectors between overview cities. */

const TO_RAD = Math.PI / 180;
const TO_DEG = 180 / Math.PI;

export type OverviewArc = {
  fromId: string;
  toId: string;
  latlngs: [number, number][];
  /** City names, plus the departure `via:` when the trip has one. */
  label: string;
};

/**
 * Spherical interpolation. Ends snap to the inputs so a node sits on the arc.
 * `steps` defaults to about one vertex per four degrees, clamped to 8–64.
 */
export function greatCircle(
  from: readonly [number, number],
  to: readonly [number, number],
  steps?: number,
): [number, number][] {
  const lat1 = from[0] * TO_RAD;
  const lng1 = from[1] * TO_RAD;
  const lat2 = to[0] * TO_RAD;
  const lng2 = to[1] * TO_RAD;
  const d = 2 * Math.asin(
    Math.min(
      1,
      Math.sqrt(
        Math.sin((lat2 - lat1) / 2) ** 2 +
          Math.cos(lat1) * Math.cos(lat2) * Math.sin((lng2 - lng1) / 2) ** 2,
      ),
    ),
  );
  const count = steps ?? Math.min(64, Math.max(8, Math.round((d * TO_DEG) / 4) || 8));
  if (!Number.isFinite(d) || d < 1e-6) return [[from[0], from[1]], [to[0], to[1]]];
  const points: [number, number][] = [];
  for (let i = 0; i <= count; i += 1) {
    const f = i / count;
    const a = Math.sin((1 - f) * d) / Math.sin(d);
    const b = Math.sin(f * d) / Math.sin(d);
    const x = a * Math.cos(lat1) * Math.cos(lng1) + b * Math.cos(lat2) * Math.cos(lng2);
    const y = a * Math.cos(lat1) * Math.sin(lng1) + b * Math.cos(lat2) * Math.sin(lng2);
    const z = a * Math.sin(lat1) + b * Math.sin(lat2);
    points.push([
      Math.atan2(z, Math.sqrt(x * x + y * y)) * TO_DEG,
      Math.atan2(y, x) * TO_DEG,
    ]);
  }
  points[0] = [from[0], from[1]];
  points[points.length - 1] = [to[0], to[1]];
  return points;
}

/** One dashed connector per consecutive pair, in trip order. */
export function overviewArcs(
  cities: readonly { id: string; label: string; lat: number; lng: number; via?: string }[],
): OverviewArc[] {
  const arcs: OverviewArc[] = [];
  for (let i = 0; i < cities.length - 1; i += 1) {
    const from = cities[i];
    const to = cities[i + 1];
    if (!from || !to) continue;
    if (![from.lat, from.lng, to.lat, to.lng].every((value) => Number.isFinite(value))) continue;
    const via = from.via?.trim();
    const route = `${from.label} → ${to.label}`;
    arcs.push({
      fromId: from.id,
      toId: to.id,
      latlngs: greatCircle([from.lat, from.lng], [to.lat, to.lng]),
      label: via ? `${route} · ${via}` : route,
    });
  }
  return arcs;
}

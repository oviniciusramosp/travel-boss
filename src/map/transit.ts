import { getTransitLine, type TransitLine } from '../catalog';

/** A metro place such as `par-metro-6` is the whole line, not one station. */
export function transitLineForPlace(placeId: string): TransitLine | undefined {
  const match = /^par-metro-(\d+)$/.exec(placeId);
  const lineId = match?.[1];
  if (!lineId) return undefined;
  return getTransitLine(`m${lineId}`);
}

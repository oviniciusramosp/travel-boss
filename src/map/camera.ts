/** Desktop selection zoom from the portfolio map: stay put at detail zoom, otherwise 14. */
export function selectionZoom(current: number): number {
  return current >= 13 ? current : Math.max(current, 14);
}

/** Pan when zoom barely changes; fly when the level actually changes. */
export function selectionEases(zoomDelta: number): 'pan' | 'fly' {
  return Math.abs(zoomDelta) < 0.4 ? 'pan' : 'fly';
}

export function paddedCenterOffset(padding: {
  top: number;
  right: number;
  bottom: number;
  left: number;
}): { x: number; y: number } {
  return {
    x: (padding.right - padding.left) / 2,
    y: (padding.bottom - padding.top) / 2,
  };
}

export function diffPinIds(
  prev: readonly string[],
  next: readonly string[],
): { create: string[]; keep: string[]; remove: string[] } {
  const prevSet = new Set(prev);
  const seen = new Set<string>();
  const create: string[] = [];
  const keep: string[] = [];
  for (const id of next) {
    if (seen.has(id)) continue;
    seen.add(id);
    if (prevSet.has(id)) keep.push(id);
    else create.push(id);
  }
  return { create, keep, remove: prev.filter((id) => !seen.has(id)) };
}

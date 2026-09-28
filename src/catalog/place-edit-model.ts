export type PlaceEdits = { favorite?: boolean; rating?: number | null; googleRating?: number | null };
export type PlaceEditStore = Record<string, PlaceEdits>;

export function readPlaceEdits(value: unknown): PlaceEdits | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (!entries.length) return null;
  for (const [key, v] of entries) {
    if (key === 'favorite') { if (typeof v !== 'boolean') return null; }
    else if (key === 'rating' || key === 'googleRating') {
      if (v !== null && (typeof v !== 'number' || !Number.isFinite(v) || v < 0 || v > 5)) return null;
    } else return null;
  }
  return value as PlaceEdits;
}

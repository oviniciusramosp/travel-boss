/** What was open, focused, or on screen before a repaint. */

export function dayKey(city: string, index: number, title: string): string {
  return `${city}:${index}:${title}`;
}

/** First day of each city only on the first paint. Later paints use the snapshot. */
export function dayOpen(
  firstPaint: boolean,
  key: string,
  openKeys: ReadonlySet<string>,
  dayIndex: number,
): boolean {
  if (firstPaint) return dayIndex === 0;
  return openKeys.has(key);
}

export function stopKey(
  city: string,
  dayIndex: number,
  dayTitle: string,
  stopIndex: number,
  placeId: string | undefined,
  label: string,
): string {
  return `${city}:${dayIndex}:${dayTitle}:${stopIndex}:${placeId ?? label}`;
}

export type FocusMark =
  | { kind: 'day'; key: string }
  | { kind: 'stop'; key: string; action?: string }
  | { kind: 'category'; id: string }
  | { kind: 'city'; id: string }
  | { kind: 'span'; id: string }
  | { kind: 'warn' }
  | { kind: 'warn-copy' }
  | { kind: 'day-action'; key: string; action: string };

export type SeenPin = { id: string; lat: number; lng: number };

/**
 * Live save does not fit. A new pin outside the current view does.
 * The first paint fits when there is something to frame.
 */
export function shouldRefit(
  firstPaint: boolean,
  pins: readonly SeenPin[],
  seen: ReadonlySet<string>,
  inView: (lat: number, lng: number) => boolean,
): boolean {
  if (firstPaint) return pins.length > 0;
  return pins.some((pin) => !seen.has(pin.id) && !inView(pin.lat, pin.lng));
}

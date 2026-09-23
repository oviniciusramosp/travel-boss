/** What was open, focused, or on screen before a repaint. */

export function dayKey(city: string, index: number, title: string): string {
  return `${city}:${index}:${title}`;
}

/**
 * OSRM only for an open day in the focused city, or in a city currently on screen
 * when nothing is focused.
 */
export function cityInOsrmScope(
  city: string,
  dayIsOpen: boolean,
  scope: { activeCity: string | null; visible: ReadonlySet<string> },
): boolean {
  if (!dayIsOpen) return false;
  if (scope.activeCity) return city === scope.activeCity;
  return scope.visible.has(city);
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
  | { kind: 'city-link'; city: string; action: string }
  | { kind: 'warn' }
  | { kind: 'warn-copy' }
  | { kind: 'day-action'; key: string; action: string };

export type SeenPin = { id: string; lat: number; lng: number };

export type SectionHit = { key: string; top: number; height: number; ratio: number };

/**
 * The section that owns the top of the scrollport.
 * A later section wins once its top crosses that edge. Nothing visible returns null.
 */
export function activeSectionKey(items: readonly SectionHit[]): string | null {
  const visible = items.filter((item) => item.ratio > 0 && item.height > 0);
  if (!visible.length) return null;
  const covering = visible.filter((item) => item.top <= 0 && item.top + item.height > 0);
  if (covering.length) {
    covering.sort((a, b) => b.top - a.top);
    return covering[0]?.key ?? null;
  }
  visible.sort((a, b) => a.top - b.top);
  return visible[0]?.key ?? null;
}

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

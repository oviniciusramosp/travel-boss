export type Box = { left: number; top: number; right: number; bottom: number };

export type Insets = { top: number; right: number; bottom: number; left: number };

/** How many pixels of `map` are covered by `chrome` on each edge. */
export function coveredInsets(map: Box, chrome: Box, cap = 0.72): Insets {
  const out: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const width = map.right - map.left;
  const height = map.bottom - map.top;
  if (!(width > 0) || !(height > 0)) return out;
  const maxX = width * cap;
  const maxY = height * cap;
  const overlapY = chrome.bottom > map.top && chrome.top < map.bottom;
  const overlapX = chrome.right > map.left && chrome.left < map.right;
  if (overlapY) {
    const fromLeft = chrome.right - map.left;
    if (fromLeft > 0 && chrome.left < map.left + width / 2) out.left = Math.min(maxX, fromLeft);
    const fromRight = map.right - chrome.left;
    if (fromRight > 0 && chrome.right > map.right - width / 2) out.right = Math.min(maxX, fromRight);
  }
  if (overlapX) {
    const fromTop = chrome.bottom - map.top;
    if (fromTop > 0 && chrome.top < map.top + height / 2) out.top = Math.min(maxY, fromTop);
    const fromBottom = map.bottom - chrome.top;
    if (fromBottom > 0 && chrome.bottom > map.bottom - height / 2) {
      out.bottom = Math.min(maxY, fromBottom);
    }
  }
  return out;
}

export function mergeInsets(base: Insets, extra: Insets): Insets {
  return {
    top: Math.max(base.top, extra.top),
    right: Math.max(base.right, extra.right),
    bottom: Math.max(base.bottom, extra.bottom),
    left: Math.max(base.left, extra.left),
  };
}

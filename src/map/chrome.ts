export type Box = { left: number; top: number; right: number; bottom: number };

export type Insets = { top: number; right: number; bottom: number; left: number };

/**
 * Pixels of `map` covered by `chrome` on one edge.
 * A tall card that crosses the middle is only a right or left inset.
 * A wide bar is only a top or bottom inset.
 */
export function coveredInsets(map: Box, chrome: Box, cap = 0.72): Insets {
  const out: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const width = map.right - map.left;
  const height = map.bottom - map.top;
  if (!(width > 0) || !(height > 0)) return out;
  const maxX = width * cap;
  const maxY = height * cap;
  const overlapY = chrome.bottom > map.top && chrome.top < map.bottom;
  const overlapX = chrome.right > map.left && chrome.left < map.right;
  if (!overlapX || !overlapY) return out;

  const chromeW = chrome.right - chrome.left;
  const chromeH = chrome.bottom - chrome.top;
  if (chromeH >= chromeW) {
    const onRight = (chrome.left + chrome.right) / 2 >= map.left + width / 2;
    if (onRight) {
      const fromRight = map.right - chrome.left;
      if (fromRight > 0) out.right = Math.min(maxX, fromRight);
    } else {
      const fromLeft = chrome.right - map.left;
      if (fromLeft > 0) out.left = Math.min(maxX, fromLeft);
    }
    return out;
  }

  const onBottom = (chrome.top + chrome.bottom) / 2 >= map.top + height / 2;
  if (onBottom) {
    const fromBottom = map.bottom - chrome.top;
    if (fromBottom > 0) out.bottom = Math.min(maxY, fromBottom);
  } else {
    const fromTop = chrome.bottom - map.top;
    if (fromTop > 0) out.top = Math.min(maxY, fromTop);
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

/** Fixed Booking vocabulary; never infer category scores from the overall rating. */
export const BOOKING_CATEGORIES = {
  cleanliness: 'Cleanliness', comfort: 'Comfort', facilities: 'Facilities',
  staff: 'Staff', wifi: 'Free Wifi', location: 'Location', value: 'Value for money',
};
export const STAFF_MINIMUM = 7;
export const CORE_CATEGORIES = ['cleanliness', 'comfort', 'facilities'];
const validScore = (n) => Number.isFinite(n) && n >= 1 && n <= 10;

export function parseCategoryScores(rows = []) {
  const scores = Object.fromEntries(Object.keys(BOOKING_CATEGORIES).map((key) => [key, null]));
  for (const { label, value } of rows) {
    const key = Object.keys(BOOKING_CATEGORIES).find((k) => BOOKING_CATEGORIES[k].toLowerCase() === String(label).trim().toLowerCase());
    const score = Number(String(value ?? '').replace(',', '.'));
    if (key && String(value ?? '').trim() && Number.isFinite(score) && score >= 1 && score <= 10) scores[key] = score;
  }
  return scores;
}

export function bookingEligibility(booking) {
  const s = booking.categoryScores ?? {};
  const failures = [];
  const unknown = [];
  if (booking.wifiAvailable === false) failures.push('wifi');
  else if (booking.wifiAvailable !== true) unknown.push('wifi');
  if (!validScore(s.staff)) unknown.push('staff');
  else if (s.staff < STAFF_MINIMUM) failures.push('staff');
  for (const key of CORE_CATEGORIES) if (!validScore(s[key])) unknown.push(key);
  return { status: failures.length ? 'excluded' : unknown.length ? 'pending' : 'eligible', failures, unknown, staffMinimum: STAFF_MINIMUM };
}

/** Serialized into the existing PinchTab page; keep this function self-contained. */
export function extractBookingDetails() {
  const categoryRows = [...document.querySelectorAll('[data-testid="review-subscore"]')].map((el) => {
    const meter = el.querySelector('[role="meter"]');
    const labelled = meter?.getAttribute('aria-labelledby');
    const label = (labelled ? document.getElementById(labelled)?.textContent : null)?.trim();
    const value = meter?.getAttribute('aria-valuetext');
    // Accessible fallback survives layout changes and includes a single score.
    const fallback = el.textContent.match(/^\s*(Staff|Facilities|Cleanliness|Comfort|Value for money|Location|Free WiFi)\s*,\s*(\d+(?:[.,]\d+)?)/i);
    return { label: label || fallback?.[1] || '', value: value || fallback?.[2] || '' };
  });
  const facilityText = [...document.querySelectorAll('[data-testid*="facilit"], #hp_facilities_box')].map((el) => el.textContent).join(' ');
  const negative = /(?:no|without)\s+(?:wi[ -]?fi|internet)|(?:wi[ -]?fi|internet)\s+(?:is\s+)?not\s+available/i.test(facilityText);
  const positive = /\b(?:free\s+wi[ -]?fi|wi[ -]?fi\s+(?:is\s+)?available)\b/i.test(facilityText);
  const photos = new Map();
  for (const m of document.documentElement.innerHTML.matchAll(/\/xdata\/images\/hotel\/(?:max|square)[\dx]+\/(\d+)\.(?:jpg|webp)\?k=([a-f0-9]+)/g)) {
    if (!photos.has(m[1])) photos.set(m[1], m[0]);
  }
  return {
    categoryRows, wifiAvailable: negative ? false : positive ? true : null,
    // Keep only the aggregate rating text, not guest names or review bodies.
    overallText: document.querySelector('[data-testid="review-score-right-component"]')?.textContent ?? '',
    photos: [...photos.values()].slice(0, 12),
  };
}

/** Keep in sync with the mobile media queries in styles. */
export const MOBILE_QUERY = '(max-width: 767px)';

export function isMobile(): boolean {
  return window.matchMedia(MOBILE_QUERY).matches;
}

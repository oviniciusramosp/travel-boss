/**
 * Alphabetical on purpose: Google's `icon_names` subset ignores a font
 * unless the ligatures are sorted and unique.
 */
export const ICONS = [
  'account_balance',
  'add',
  'add_comment',
  'apartment',
  'attach_money',
  'auto_awesome',
  'bakery_dining',
  'bridge',
  'calendar_month',
  'castle',
  'chat_bubble',
  'check',
  'check_circle',
  'chevron_left',
  'chevron_right',
  'church',
  'close',
  'content_copy',
  'cookie',
  'dark_mode',
  'delete',
  'directions',
  'directions_transit',
  'directions_walk',
  'download',
  'expand_more',
  'favorite',
  'filter_list',
  'fit_screen',
  'flight',
  'fort',
  'fullscreen',
  'fullscreen_exit',
  'help',
  'holiday_village',
  'hotel',
  'icecream',
  'import_contacts',
  'ios_share',
  'left_panel_close',
  'left_panel_open',
  'light_mode',
  'local_activity',
  'local_cafe',
  'local_taxi',
  'location_on',
  'luggage',
  'lunch_dining',
  'map',
  'mode_heat',
  'museum',
  'my_location',
  'nature',
  'navigation',
  'open_in_new',
  'person',
  'photo_camera',
  'play_circle',
  'remove',
  'restaurant',
  'route',
  'sailing',
  'schedule',
  'search',
  'shopping_bag',
  'sort',
  'star',
  'star_half',
  'storefront',
  'subway',
  'sync',
  'theater_comedy',
  'train',
  'verified',
  'visibility',
  'warning',
  'water_drop',
  'wc',
  'yard',
] as const;

export type IconName = (typeof ICONS)[number];

export type IconSize = 16 | 18 | 20;

/** Self-hosted variable subset. Regenerate when ICONS changes; see offline-icons reference. */
export const ICON_FONT_HREF = 'fonts/material-symbols-rounded.woff2';

/** Keep ligature names invisible until the actual font is ready, including raw HTML pins. */
export async function loadIconFont(
  fonts: Pick<FontFaceSet, 'load'>,
  onReady: () => void,
): Promise<void> {
  try {
    const faces = await fonts.load('400 20px "Material Symbols Rounded"', ICONS.join(' '));
    if (faces.length && faces.every((face) => face.status === 'loaded')) onReady();
  } catch {
    // Buttons retain accessible names; keep font failure from exposing technical ligatures.
  }
}

if (typeof document !== 'undefined' && document.fonts) {
  const prepare = () => {
    void loadIconFont(document.fonts, () => document.documentElement.classList.add('tb-icons-ready'));
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', prepare, { once: true });
  else prepare();
}

export function icon(
  name: IconName,
  opts?: { fill?: boolean; size?: IconSize },
): HTMLSpanElement {
  const node = document.createElement('span');
  node.className = 'material-symbols-rounded';
  if (opts?.size) node.classList.add(`is-${opts.size}`);
  if (opts?.fill) node.classList.add('is-fill');
  node.setAttribute('aria-hidden', 'true');
  node.textContent = name;
  return node;
}

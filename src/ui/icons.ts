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

const ICON_AXIS = 'opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200';

export const ICON_FONT_HREF =
  `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:${ICON_AXIS}&icon_names=${ICONS.join(',')}&display=block`;

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

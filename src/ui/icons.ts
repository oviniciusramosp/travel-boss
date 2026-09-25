/**
 * Alphabetical on purpose: Google's `icon_names` subset ignores a font
 * unless the ligatures are sorted and unique.
 */
export const ICONS = [
  'account_balance',
  'add',
  'apartment',
  'attach_money',
  'auto_awesome',
  'bakery_dining',
  'bed',
  'bridge',
  'calendar_month',
  'castle',
  'check',
  'chevron_left',
  'chevron_right',
  'church',
  'clear_day',
  'clear_night',
  'close',
  'cloud',
  'content_copy',
  'cookie',
  'dark_mode',
  'directions',
  'directions_transit',
  'directions_walk',
  'download',
  'expand_more',
  'favorite',
  'filter_list',
  'fit_screen',
  'flight',
  'foggy',
  'fort',
  'fullscreen',
  'fullscreen_exit',
  'holiday_village',
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
  'lunch_dining',
  'map',
  'mode_heat',
  'museum',
  'my_location',
  'nature',
  'open_in_new',
  'partly_cloudy_day',
  'partly_cloudy_night',
  'person',
  'photo_camera',
  'rainy',
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
  'thunderstorm',
  'train',
  'visibility',
  'warning',
  'weather_snowy',
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

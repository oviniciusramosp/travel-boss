/** Duotone forecast glyphs from the user's pack, in `public/weather/`, with the pack's own colors. */
export const WEATHER_ICONS = [
  'cloud-moon',
  'cloud-moon-rain',
  'cloud-rain',
  'cloud-showers',
  'cloud-showers-heavy',
  'cloud-sun',
  'cloud-sun-rain',
  'clouds',
  'clouds-moon',
  'clouds-sun',
  'moon-stars',
  'suitcase-rolling',
  'sun',
  'sunset',
] as const;

export type WeatherIcon = (typeof WEATHER_ICONS)[number];

/** Decorative: the slot around it carries the words. */
export function weatherIcon(name: WeatherIcon): HTMLImageElement {
  const image = document.createElement('img');
  image.className = 'tb-weather__icon';
  image.src = `${import.meta.env.BASE_URL}weather/${name}.svg`;
  image.alt = '';
  image.draggable = false;
  return image;
}

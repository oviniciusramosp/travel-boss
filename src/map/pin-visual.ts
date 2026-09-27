import { placePinIconHtml } from '../catalog';
import { circleInk } from '../ui/contrast';

const PIN_FALLBACK = '#0a0a0a';

/** 8-point star, short rounded tips. Same path as the portfolio map. */
const STAR_8_PATH =
  'M10.91 3.86 Q12 2 13.09 3.86 L13.82 5.1 Q14.43 6.13 15.59 5.83 L16.98 5.47 ' +
  'Q19.07 4.93 18.53 7.02 L18.17 8.41 Q17.87 9.57 18.9 10.18 L20.14 10.91 ' +
  'Q22 12 20.14 13.09 L18.9 13.82 Q17.87 14.43 18.17 15.59 L18.53 16.98 ' +
  'Q19.07 19.07 16.98 18.53 L15.59 18.17 Q14.43 17.87 13.82 18.9 L13.09 20.14 ' +
  'Q12 22 10.91 20.14 L10.18 18.9 Q9.57 17.87 8.41 18.17 L7.02 18.53 ' +
  'Q4.93 19.07 5.47 16.98 L5.83 15.59 Q6.13 14.43 5.1 13.82 L3.86 13.09 ' +
  'Q2 12 3.86 10.91 L5.1 10.18 Q6.13 9.57 5.83 8.41 L5.47 7.02 ' +
  'Q4.93 4.93 7.02 5.47 L8.41 5.83 Q9.57 6.13 10.18 5.1 Z';

export type PinModel = {
  color: string;
  label: string;
  category?: string;
  subcategories?: readonly string[] | null;
  featured: boolean;
  number: string;
  glyph: string;
  star: boolean;
};

export function zoomPinBucket(zoom: number): 'far' | 'mid' | 'near' {
  if (zoom < 11) return 'far';
  if (zoom < 13) return 'mid';
  return 'near';
}

function cssColor(value: string | undefined): string {
  const color = (value ?? '').trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(color)) return color;
  return PIN_FALLBACK;
}

export function pinModel(input: {
  label: string;
  color?: string;
  featured?: boolean;
  number?: number;
  category?: string;
  subcategories?: readonly string[] | null;
}): PinModel {
  const category = input.category;
  const glyph = placePinIconHtml(category, input.subcategories);
  return {
    color: cssColor(input.color),
    label: input.label,
    category,
    subcategories: input.subcategories,
    featured: Boolean(input.featured),
    number: input.number == null ? '' : String(input.number),
    glyph,
    star: category === 'tourist',
  };
}

export function samePinModel(a: PinModel | undefined, b: PinModel): boolean {
  return (
    a != null &&
    a.color === b.color &&
    a.label === b.label &&
    a.glyph === b.glyph &&
    a.star === b.star &&
    a.featured === b.featured &&
    a.number === b.number
  );
}

function starSvg(): string {
  return (
    `<svg class="tb-pin__star" viewBox="0 0 24 24" aria-hidden="true" focusable="false">` +
    `<path fill="currentColor" stroke-linejoin="round" paint-order="stroke fill" ` +
    `vector-effect="non-scaling-stroke" d="${STAR_8_PATH}"/></svg>`
  );
}

/** `.tb-pin` markup. Zoom size is `--pin-scale` on the map, not width. */
export function pinHtml(model: PinModel, state?: { active?: boolean; hover?: boolean }): string {
  const classes = [
    'tb-pin',
    model.star ? 'tb-pin--star' : '',
    model.glyph ? 'tb-pin--has-glyph' : 'tb-pin--dot',
    model.featured ? 'is-featured' : '',
    state?.active ? 'is-active' : '',
    state?.hover ? 'is-hover' : '',
  ]
    .filter(Boolean)
    .join(' ');
  const glyph = `<span class="tb-pin__glyph">${model.glyph}</span>`;
  const tone = circleInk(model.color) === 'on-ink' ? ' is-on-ink' : '';
  const face = model.star
    ? `<span class="tb-pin__face${tone}">${starSvg()}${glyph}</span>`
    : `<span class="tb-pin__face${tone}">${glyph}</span>`;
  return `<span class="${classes}" style="--pin-color:${model.color}">${face}</span>`;
}

export function pinBox(featured: boolean): { size: number; anchor: number } {
  const size = featured ? 56 : 44;
  return { size, anchor: size / 2 };
}

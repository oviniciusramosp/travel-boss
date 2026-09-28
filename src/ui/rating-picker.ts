import { pickLocale, type Locale } from '../catalog';
import { el } from './dom';
import { icon } from './icons';
import { formatRating } from './rating';

/** Half-star slider with a directly editable decimal score. */
export function ratingPicker(title: string, locale: Locale) {
  const root = el('div', 'tb-place-rating');
  const caption = el('span', undefined, title);
  const controls = el('div', 'tb-rating-picker');
  const input = el('input', 'tb-input tb-rating-picker__number');
  input.type = 'number'; input.min = '0'; input.max = '5'; input.step = '0.1';
  input.placeholder = '—';
  input.setAttribute('aria-label', title);
  input.setAttribute('data-tip', pickLocale(locale, { en: 'Type a score from 0 to 5 · clear to remove', 'pt-BR': 'Digite uma nota de 0 a 5 · apague para remover' }));
  const stars = el('span', 'tb-rating-picker__stars');
  for (const filled of [false, true]) {
    const row = el('span', filled ? 'tb-rating-picker__fill' : 'tb-rating-picker__outline');
    row.setAttribute('aria-hidden', 'true');
    for (let n = 0; n < 5; n++) row.append(icon('star', { size: 18, fill: filled }));
    stars.append(row);
  }
  const slider = el('input', 'tb-rating-picker__slider');
  slider.type = 'range'; slider.min = '0'; slider.max = '5'; slider.step = '0.5';
  slider.setAttribute('aria-label', pickLocale(locale, { en: `${title} · stars`, 'pt-BR': `${title} · estrelas` }));
  slider.setAttribute('data-tip', pickLocale(locale, { en: '0–5 stars · half-star steps', 'pt-BR': '0–5 estrelas · passos de meia estrela' }));
  const paint = () => {
    const value = input.value === '' || !input.validity.valid ? 0 : input.valueAsNumber;
    stars.style.setProperty('--rating-fill', `${value * 20}%`);
    slider.value = String(value);
    slider.setAttribute('aria-valuetext', input.value === ''
      ? pickLocale(locale, { en: 'No rating', 'pt-BR': 'Sem nota' })
      : pickLocale(locale, { en: `${formatRating(value, locale)} of 5`, 'pt-BR': `${formatRating(value, locale)} de 5` }));
  };
  slider.addEventListener('input', () => {
    input.value = slider.value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
  slider.addEventListener('change', () => input.dispatchEvent(new Event('change', { bubbles: true })));
  input.addEventListener('input', paint);
  input.addEventListener('focus', () => input.select());
  stars.append(slider);
  controls.append(input, stars);
  root.append(caption, controls);
  return { root, input, paint, slider };
}

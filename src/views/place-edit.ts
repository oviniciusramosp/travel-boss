import { pickLocale, savePlaceEdits, travelUi, type Locale, type PlaceEdits, type TravelPlace } from '../catalog';
import { el } from '../ui/dom';
import { iconButton } from '../ui/controls';
import { icon } from '../ui/icons';
import { readCssTime } from '../ui/motion';

/** Card controls save independently; requests remain ordered even during fast edits. */
export function placeEditor(place: TravelPlace, locale: Locale) {
  const text = (en: string, pt: string) => pickLocale(locale, { en, 'pt-BR': pt });
  const favorite = iconButton({ icon: 'favorite', label: '', pressed: !!place.favorite });
  const ratings = el('div', 'tb-panel__ratings');
  const status = el('span', 'tb-live', text('Saved automatically', 'Salvo automaticamente'));
  status.setAttribute('role', 'status');
  const retry = el('button', 'tb-btn tb-btn-outline', text('Retry saving', 'Tentar salvar novamente'));
  retry.type = 'button';
  retry.hidden = true;
  const feedback = el('div', 'tb-place-edit-status');
  feedback.append(status, retry);
  let queue = Promise.resolve();
  let pending = 0;
  let failed: PlaceEdits = {};
  const inputs: Partial<Record<'rating' | 'googleRating', HTMLInputElement>> = {};
  const submitted: Partial<Record<'rating' | 'googleRating', string>> = {};
  const sync = () => {
    const label = place.favorite ? text('Remove favorite', 'Remover dos favoritos') : text('Add favorite', 'Favoritar lugar');
    favorite.setAttribute('aria-label', label);
    favorite.setAttribute('data-tip', label);
    favorite.setAttribute('aria-pressed', String(!!place.favorite));
    favorite.replaceChildren(icon('favorite', { size: 18, fill: !!place.favorite }));
    for (const key of ['rating', 'googleRating'] as const) {
      const input = inputs[key];
      if (input && document.activeElement !== input && !pending && !Object.hasOwn(failed, key)) { input.value = String(place[key] ?? ''); submitted[key] = input.value; }
    }
  };
  const save = (patch: PlaceEdits) => {
    pending++;
    status.textContent = text('Saving…', 'Salvando…');
    queue = queue.then(async () => {
      try {
        await savePlaceEdits(place.id, patch);
        for (const key of Object.keys(patch)) delete failed[key as keyof PlaceEdits];
      } catch { failed = { ...failed, ...patch }; }
      pending--;
      retry.hidden = !Object.keys(failed).length;
      status.textContent = !retry.hidden ? text('Not saved', 'Não foi salvo') : pending ? text('Saving…', 'Salvando…') : text('Saved', 'Salvo');
      favorite.disabled = false;
      sync();
    });
  };
  retry.addEventListener('click', () => save({ ...failed }));
  favorite.addEventListener('click', () => {
    favorite.disabled = true;
    save({ favorite: !place.favorite });
  });
  for (const key of ['googleRating', 'rating'] as const) {
    const label = el('label', 'tb-place-rating');
    const title = pickLocale(locale, key === 'rating' ? travelUi.ratingMine : travelUi.ratingGoogle);
    const caption = el('span', undefined, title);
    const input = el('input', 'tb-input');
    input.type = 'number'; input.min = '1'; input.max = '5'; input.step = '0.1';
    input.placeholder = '—';
    input.setAttribute('aria-label', title);
    input.setAttribute('data-tip', text('1–5 · clear to remove', '1–5 · apague para remover'));
    inputs[key] = input;
    let timer = 0;
    submitted[key] = String(place[key] ?? '');
    const flush = () => {
      window.clearTimeout(timer);
      if (!input.validity.valid) { input.reportValidity(); return; }
      if (input.value === submitted[key]) return;
      submitted[key] = input.value;
      save({ [key]: input.value === '' ? null : input.valueAsNumber });
    };
    input.addEventListener('input', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(flush, readCssTime('--delay-autosave'));
    });
    input.addEventListener('change', flush);
    input.addEventListener('blur', flush);
    input.addEventListener('keydown', (event) => { if (event.key === 'Enter') flush(); });
    label.append(caption, input);
    ratings.append(label);
  }
  sync();
  return { favorite, ratings, feedback, sync };
}

import { pickLocale, type Locale } from '../catalog';
import type { TripError, TripErrorCode } from './parse';

const TEXT: Record<TripErrorCode, { en: string; 'pt-BR': string }> = {
  'via-no-mode': { en: 'via without a mode', 'pt-BR': 'via sem modo' },
  'via-no-duration': { en: 'via without a duration', 'pt-BR': 'via sem duração' },
  'via-many-durations': {
    en: 'via with more than one duration',
    'pt-BR': 'via com mais de uma duração',
  },
  'stop-no-link': { en: 'item without a link', 'pt-BR': 'item sem link' },
  'place-no-id': { en: 'place link without an id', 'pt-BR': 'link place: sem id' },
  'bad-link': { en: 'invalid link: {detail}', 'pt-BR': 'link inválido: {detail}' },
  'place-missing': { en: 'place not found: {detail}', 'pt-BR': 'lugar não encontrado: {detail}' },
  'city-no-slug': { en: 'city without a slug: {detail}', 'pt-BR': 'cidade sem slug: {detail}' },
  'city-unknown': { en: 'unknown city: {detail}', 'pt-BR': 'cidade desconhecida: {detail}' },
  'day-outside-city': { en: 'day outside a city', 'pt-BR': 'dia fora de uma cidade' },
  'via-outside-day': { en: 'via outside a day', 'pt-BR': 'via fora de um dia' },
  'via-no-stop': { en: 'via without a stop', 'pt-BR': 'via sem parada' },
  'via-empty': { en: 'empty via', 'pt-BR': 'via vazio' },
  'via-duplicate': { en: 'duplicate via', 'pt-BR': 'via duplicado' },
  'comment-no-stop': { en: 'comment without a stop', 'pt-BR': 'comentário sem parada' },
  'stop-outside-day': { en: 'stop outside a day', 'pt-BR': 'parada fora de um dia' },
  'line-outside-day': { en: 'line outside a day', 'pt-BR': 'linha fora de um dia' },
  'no-title': { en: 'document without a title', 'pt-BR': 'documento sem título' },
};

/** The parser stores a code. The sentence is chosen here, in the active language. */
export function tripErrorText(error: TripError, locale: Locale): string {
  return pickLocale(locale, TEXT[error.code]).replaceAll('{detail}', error.detail ?? '');
}

export function warningCountLabel(count: number, locale: Locale): string {
  if (locale === 'pt-BR') return count === 1 ? '1 aviso' : `${count} avisos`;
  return count === 1 ? '1 warning' : `${count} warnings`;
}

/** One line per warning, ready to paste back to the model that edits the file. */
export function warningCopyText(file: string, errors: readonly TripError[], locale: Locale): string {
  return errors
    .map((error) => `${file}:${error.line} — ${tripErrorText(error, locale)}`)
    .join('\n');
}

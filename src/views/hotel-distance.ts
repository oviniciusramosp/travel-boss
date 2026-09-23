import { pickLocale, type Locale } from '../catalog';
import { googleDirectionsUrl } from '../trip/directions';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';
import { row } from '../ui/row';

type Copy = { en: string; 'pt-BR': string };

export type WalkStop = {
  id: string;
  name: Copy;
  lat: number;
  lng: number;
  minutes: number;
  distanceM: number;
};

const say = (locale: Locale, copy: Copy) => pickLocale(locale, copy);

export function formatMetres(locale: Locale, distanceM: number): string {
  if (distanceM < 1000) return `${Math.round(distanceM)} m`;
  const km = new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(distanceM / 1000);
  return `${km} km`;
}

export function directionHref(
  origin: { lat: number; lng: number },
  dest: { lat: number; lng: number },
  mode: 'walk' | 'transit',
): string | null {
  return googleDirectionsUrl([origin, dest], mode);
}

/** Keeps only finite, non-negative walks and sorts the shortest first. */
export function walkStops(value: unknown): WalkStop[] {
  if (!Array.isArray(value)) return [];
  const stops: WalkStop[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const name = record.name;
    if (!name || typeof name !== 'object') continue;
    const label = name as Record<string, unknown>;
    if (typeof label.en !== 'string') continue;
    const lat = record.lat;
    const lng = record.lng;
    const minutes = record.minutes;
    const distanceM = record.distanceM;
    if (typeof lat !== 'number' || typeof lng !== 'number') continue;
    if (typeof minutes !== 'number' || minutes < 0 || typeof distanceM !== 'number' || distanceM < 0) continue;
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(minutes) || !Number.isFinite(distanceM)) {
      continue;
    }
    stops.push({
      id: typeof record.id === 'string' ? record.id : '',
      name: { en: label.en, 'pt-BR': typeof label['pt-BR'] === 'string' ? label['pt-BR'] : label.en },
      lat,
      lng,
      minutes,
      distanceM,
    });
  }
  return stops.sort((a, b) => a.minutes - b.minutes || a.id.localeCompare(b.id));
}

function dirLink(
  href: string,
  label: string,
  glyph: 'directions_walk' | 'directions_transit',
  text?: string,
): HTMLAnchorElement {
  const anchor = el('a', 'tb-hotels__dir');
  anchor.href = href;
  anchor.target = '_blank';
  anchor.rel = 'noopener';
  anchor.setAttribute('aria-label', label);
  anchor.setAttribute('data-tip', label);
  anchor.append(icon(glyph, { size: 16 }));
  if (text) anchor.append(document.createTextNode(text));
  return anchor;
}

export function distanceSection(
  locale: Locale,
  origin: { lat: number; lng: number },
  places: WalkStop[],
  totalCount: number,
  kind: 'attractions' | 'transport',
): HTMLDetailsElement {
  const details = el('details', 'tb-hotels__distances');
  const summary = el('summary');
  summary.append(icon(kind === 'transport' ? 'train' : 'route', { size: 16 }));
  summary.append(
    el(
      'span',
      undefined,
      say(
        locale,
        kind === 'transport'
          ? { en: 'Transport access', 'pt-BR': 'Acesso ao transporte' }
          : { en: 'Distances to saved places', 'pt-BR': 'Distâncias aos pontos salvos' },
      ),
    ),
  );
  summary.append(el('small', undefined, `${places.length}/${totalCount}`));
  const list = el('ol', 'tb-list tb-hotels__walks');
  if (!places.length) {
    list.append(
      el(
        'li',
        'tb-meta',
        say(locale, {
          en: 'Walking routes unavailable. Try updating priorities.',
          'pt-BR': 'Rotas a pé indisponíveis. Tente atualizar as prioridades.',
        }),
      ),
    );
  }
  for (const place of places) {
    const name = say(locale, place.name);
    const walkHref = directionHref(origin, place, 'walk');
    const transitHref = directionHref(origin, place, 'transit');
    const actions = el('div');
    if (walkHref) {
      actions.append(
        dirLink(
          walkHref,
          say(locale, {
            en: `Walk to ${name}: ${place.minutes} min`,
            'pt-BR': `Caminhar até ${name}: ${place.minutes} min`,
          }),
          'directions_walk',
          `${place.minutes} min`,
        ),
      );
    }
    if (transitHref) {
      actions.append(
        dirLink(
          transitHref,
          say(locale, {
            en: `Check transit to ${name}`,
            'pt-BR': `Consultar transporte para ${name}`,
          }),
          'directions_transit',
        ),
      );
    }
    list.append(
      row({
        title: name,
        sub: formatMetres(locale, place.distanceM),
        actions,
      }),
    );
  }
  const note = el(
    'p',
    'tb-meta',
    say(locale, {
      en: 'Walking estimates via OpenStreetMap. Transit schedules and transfers open in Maps.',
      'pt-BR': 'Caminhada estimada via OpenStreetMap. Horários e baldeações abrem no Maps.',
    }),
  );
  details.append(summary, list, note);
  return details;
}

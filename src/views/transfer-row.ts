/**
 * One line between stops: icon, label, duration, and the line chip.
 * Pass a `TimelineTransferPart` for one metro hop or "a pé até <linha>".
 * A ride lists where you board and where you get off under the chip.
 * A whole multi-hop `ItineraryLegDef` stays a single row.
 */
import {
  formatLegDuration,
  legDisplayLabel,
  legLineColor,
  pickLocale,
} from '../catalog';
import type { ItineraryLegDef, Locale, TimelineTransferPart } from '../catalog';
import { legLabel, type TripLeg, type TripLegMode } from '../trip/parse';
import type { DepartureTime } from '../trip/departures';
import { chipTone } from '../ui/contrast';
import { el } from '../ui/dom';
import { icon, type IconName } from '../ui/icons';

export { chipTone };

const TRANSFER_ICON: Record<TripLegMode, IconName> = {
  walk: 'directions_walk',
  transit: 'directions_transit',
  taxi: 'local_taxi',
  flight: 'flight',
};

/** Catalog leg, one expanded hop, or the markdown `via:` leg. */
export type TransferLeg = ItineraryLegDef | TimelineTransferPart | TripLeg;

export type TransferChipTone = 'ink' | 'on-ink';

export type TransferRowModel = {
  mode: TripLegMode;
  icon: IconName;
  label: string;
  /** `formatLegDuration`, or null when the leg has no duration. */
  duration: string | null;
  /** Lines under the chip: the board station, then the exit with the count ("Magenta (3 estações)"). */
  stations: string[];
  /** The `via:` note after ` — `, shown under the row. */
  note: string | null;
  /** Null for walks and for transit with no brand color. */
  lineColor: string | null;
  /** Foreground token on top of `lineColor`. Null when there is no chip. */
  chipTone: TransferChipTone | null;
  from?: string;
  to?: string;
  hopIndex?: number;
  walkIndex?: number;
};

function isTripLeg(leg: TransferLeg): leg is TripLeg {
  return 'detail' in leg && typeof leg.detail === 'string';
}

function isTransferPart(leg: TransferLeg): leg is TimelineTransferPart {
  return !isTripLeg(leg) && 'label' in leg && typeof leg.label === 'object' && leg.label !== null;
}

function transferMode(leg: TransferLeg): TripLegMode {
  return leg.mode ?? 'transit';
}

function labelOf(leg: TransferLeg, locale: Locale): string {
  // A walk reads the same as a catalog walk. Its minutes already sit in `duration`.
  if (isTripLeg(leg) && leg.mode === 'walk') return pickLocale(locale, legDisplayLabel({ from: '', to: '', mode: 'walk' }));
  if (isTripLeg(leg)) return legLabel(leg);
  if (isTransferPart(leg)) return pickLocale(locale, leg.label);
  return pickLocale(locale, legDisplayLabel(leg));
}

function durationMinutes(leg: TransferLeg): number | null {
  const minutes = leg.durationMin;
  if (typeof minutes !== 'number' || minutes <= 0) return null;
  return minutes;
}

/**
 * Hop parts keep the color `expandTimelineTransferParts` already resolved.
 * `legLineColor` on the parent would paint every hop with the first line.
 */
function lineColorOf(leg: TransferLeg): string | null {
  if (isTripLeg(leg)) return null;
  if (isTransferPart(leg)) {
    if (leg.mode !== 'transit') return null;
    return leg.color ?? legLineColor(leg.leg);
  }
  return legLineColor(leg);
}

/** A long-distance `trem` / `train` leg, not a metro or RER hop. */
function isTrainRide(detail: string): boolean {
  const folded = detail
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
  return /(?<![a-z0-9])(trem|train)(?![a-z0-9])/.test(folded);
}

function identityOf(leg: TransferLeg): Pick<TransferRowModel, 'from' | 'to' | 'hopIndex' | 'walkIndex'> {
  if (isTripLeg(leg)) return {};
  if (isTransferPart(leg)) {
    return {
      from: leg.leg.from,
      to: leg.leg.to,
      ...(leg.hopIndex != null ? { hopIndex: leg.hopIndex } : {}),
      ...(leg.walkIndex != null ? { walkIndex: leg.walkIndex } : {}),
    };
  }
  return { from: leg.from, to: leg.to };
}

/** Stations after boarding, to where you get off. A path lists both ends. */
function stationCountOf(leg: TimelineTransferPart, locale: Locale): string | null {
  if (leg.stationCount < 2) return null;
  const count = leg.stationCount - 1;
  return pickLocale(locale, {
    en: count === 1 ? '1 stop' : `${count} stops`,
    'pt-BR': count === 1 ? '1 estação' : `${count} estações`,
  });
}

/** Board station, then the exit with the count. A ride with no names keeps the count. */
function stationsOf(leg: TransferLeg, locale: Locale): string[] {
  if (!isTransferPart(leg) || leg.mode !== 'transit') return [];
  const count = stationCountOf(leg, locale);
  const exit = leg.exit && count ? `${leg.exit} (${count})` : (leg.exit ?? count);
  return [leg.board, exit].filter((line): line is string => Boolean(line));
}

/** Icon, label, duration and line color. No DOM — safe under the node test runner. */
export function transferRowModel(leg: TransferLeg, locale: Locale = 'pt-BR'): TransferRowModel {
  const mode = transferMode(leg);
  const lineColor = lineColorOf(leg);
  const minutes = durationMinutes(leg);
  const iconName =
    mode === 'transit' && isTripLeg(leg) && isTrainRide(leg.detail) ? 'train' : TRANSFER_ICON[mode];
  return {
    mode,
    icon: iconName,
    label: labelOf(leg, locale),
    duration: minutes == null ? null : pickLocale(locale, formatLegDuration(minutes)),
    stations: stationsOf(leg, locale),
    note: isTripLeg(leg) ? (leg.note ?? null) : null,
    lineColor,
    chipTone: lineColor ? chipTone(lineColor) : null,
    ...identityOf(leg),
  };
}

/** One transfer row. `locale` defaults to pt-BR, same as the shell. */
export function transferRow(leg: TransferLeg, locale: Locale = 'pt-BR', departure?: DepartureTime): HTMLLIElement {
  const model = transferRowModel(departure?.durationMin != null ? { ...leg, durationMin: departure.durationMin } : leg, locale);
  const item = el('li', `tb-transfer tb-transfer--${model.mode}`);
  item.setAttribute(
    'aria-label',
    [model.label, model.duration, ...model.stations, model.note].filter(Boolean).join(', '),
  );
  item.dataset.legMode = model.mode;
  if (model.from) item.dataset.legFrom = model.from;
  if (model.to) item.dataset.legTo = model.to;
  if (model.hopIndex != null) item.dataset.legHop = String(model.hopIndex);
  if (model.walkIndex != null) item.dataset.legWalk = String(model.walkIndex);

  const lead = el('span', 'tb-transfer__lead');
  const glyph = icon(model.icon, { size: 16 });
  glyph.classList.add('tb-transfer__icon');
  lead.append(glyph);

  const main = el('span', 'tb-transfer__main');
  if (model.lineColor) {
    const chip = el('span', 'tb-transfer__chip', model.label);
    chip.style.setProperty('--line-color', model.lineColor);
    if (model.chipTone === 'ink') chip.classList.add('is-ink');
    main.append(chip);
  } else {
    main.append(el('span', 'tb-transfer__label', model.label));
  }
  if (model.duration) main.append(el('span', 'tb-transfer__duration', model.duration));

  if (departure && (model.mode === 'walk' || model.mode === 'transit')) {
    const time = el('span', 'tb-transfer__time', departure.time ?? '—');
    const label = departure.conflict
      ? pickLocale(locale, { en: 'Departure conflicts with the planned stop or connection', 'pt-BR': 'Saída em conflito com o horário da parada ou conexão' })
      : departure.verified
        ? pickLocale(locale, { en: 'Published departure, checked for this date', 'pt-BR': 'Partida publicada, consultada para esta data' })
        : departure.time
          ? pickLocale(locale, { en: 'Estimated walking departure', 'pt-BR': 'Saída prevista a pé (estimativa)' })
          : pickLocale(locale, { en: 'Departure not verified', 'pt-BR': 'Partida a conferir' });
    time.setAttribute('data-tip', label);
    time.setAttribute('aria-label', `${label}${departure.time ? `: ${departure.time}` : ''}`);
    item.setAttribute('aria-label', `${time.getAttribute('aria-label')}, ${item.getAttribute('aria-label')}`);
    item.append(time);
    if (departure.conflict) {
      const warning = icon('warning', { size: 16 });
      warning.setAttribute('data-tip', label);
      main.append(warning);
    }
  }
  item.append(lead, main);
  if (model.stations.length) {
    const stations = el('span', 'tb-transfer__stations');
    stations.append(...model.stations.map((line) => el('span', undefined, line)));
    item.append(stations);
  }
  if (model.note) item.append(el('span', 'tb-transfer__note', model.note));
  return item;
}

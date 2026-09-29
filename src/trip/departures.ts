import { pickLocale } from '../catalog';
import type { TripBoarding } from './parse';
import type { TransferLeg } from '../views/transfer-row';

export type DepartureTime = { time?: string; durationMin?: number; verified?: boolean; conflict?: boolean; conflictReason?: { en: string; 'pt-BR': string } };
const minutes = (time?: string): number | null => time && /^([01]\d|2[0-3]):[0-5]\d$/.test(time)
  ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3)) : null;
const clock = (time: number): string => `${String(Math.floor(((time % 1440) + 1440) % 1440 / 60)).padStart(2, '0')}:${String(((time % 60) + 60) % 60).padStart(2, '0')}`;
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');

function matches(leg: TransferLeg, service: TripBoarding): boolean {
  if (leg.mode !== 'transit') return false;
  if ('board' in leg && 'exit' in leg && leg.board && leg.exit && 'label' in leg && typeof leg.label === 'object') {
    return fold(pickLocale('pt-BR', leg.label)) === fold(service.service)
      && fold(leg.board) === fold(service.board) && fold(leg.exit) === fold(service.exit);
  }
  // A whole authored train/bus leg has no station geometry. Its explicit service must match.
  return 'detail' in leg && fold(leg.detail).includes(fold(service.service));
}

/** Published trains anchor the walks. Never derive a train departure from a duration. */
export function departureTimes(
  legs: readonly TransferLeg[], date: string, fromTime?: string, toTime?: string,
  services: readonly TripBoarding[] = [], explicitDeparture?: string,
): DepartureTime[] {
  const result: DepartureTime[] = legs.map(() => ({}));
  const origin = minutes(fromTime);
  let destination = minutes(toTime);
  if (origin != null && destination != null && destination < origin) destination += 1440;
  const starts: (number | null)[] = legs.map(() => null);
  const ends: (number | null)[] = legs.map(() => null);
  for (const [index, leg] of legs.entries()) {
    const service = services.find(value => value.date === date && matches(leg, value));
    if (!service) continue;
    let start = minutes(service.departure), end = minutes(service.arrival);
    if (start == null || end == null) continue;
    if (origin != null && origin > 1200 && start < 240) start += 1440;
    if (end < start) end += 1440;
    starts[index] = start; ends[index] = end;
    result[index] = { time: clock(start), durationMin: end - start, verified: true,
      conflict: (origin != null && start < origin) || (destination != null && end > destination) };
    if (origin != null && start < origin) result[index]!.conflictReason = {
      en: `Departure at ${clock(start)}, before the planned stop at ${clock(origin)}.`,
      'pt-BR': `Partida às ${clock(start)}, antes da parada prevista às ${clock(origin)}.`,
    };
    else if (destination != null && end > destination) result[index]!.conflictReason = {
      en: `Arrival at ${clock(end)}; the next stop is planned for ${clock(destination)}.`,
      'pt-BR': `Chegada às ${clock(end)}; a próxima parada está prevista para ${clock(destination)}.`,
    };
  }
  for (let i = 0; i < legs.length;) {
    if (legs[i]!.mode !== 'walk') { i++; continue; }
    const first = i;
    while (i < legs.length && legs[i]!.mode === 'walk') i++;
    const durations = legs.slice(first, i).map(leg => leg.durationMin);
    if (durations.some(value => value == null || value <= 0)) continue;
    const total = durations.reduce<number>((sum, value) => sum + value!, 0);
    const prior = first > 0 ? ends[first - 1] : null;
    const target = i < legs.length ? starts[i] : destination;
    let start = prior ?? (target == null ? null : target - total - (i < legs.length ? 3 : 0));
    if (first === 0 && minutes(explicitDeparture) != null) start = minutes(explicitDeparture);
    if (start == null) continue;
    const conflict = (origin != null && start < origin)
      || (target != null && start + total + (i < legs.length ? 3 : 0) > target);
    const conflictReason = origin != null && start < origin ? {
      en: `Leave at ${clock(start)}; the previous stop is planned for ${clock(origin)}.`,
      'pt-BR': `É preciso sair às ${clock(start)}; a parada anterior está prevista para ${clock(origin)}.`,
    } : conflict && target != null ? i < legs.length ? {
      en: `Leave by ${clock(target - total - 3)} to board at ${clock(target)} with 3 minutes to spare. Planned departure: ${clock(start)}.`,
      'pt-BR': `Saia até ${clock(target - total - 3)} para embarcar às ${clock(target)} com 3 min de margem. Saída planejada: ${clock(start)}.`,
    } : {
      en: `The walk ends at ${clock(start + total)}; the next stop is planned for ${clock(target)}.`,
      'pt-BR': `A caminhada termina às ${clock(start + total)}; a próxima parada está prevista para ${clock(target)}.`,
    } : undefined;
    for (let j = first; j < i; j++) {
      result[j] = { time: clock(start), conflict, conflictReason };
      start += legs[j]!.durationMin!;
    }
    if (conflict && i < legs.length) Object.assign(result[i]!, { conflict: true, conflictReason });
  }
  // Even when there is no walking row, a connection needs boarding margin.
  for (let i = 1; i < legs.length; i++) {
    if (ends[i - 1] != null && starts[i] != null && ends[i - 1]! + 3 > starts[i]!) {
      result[i]!.conflict = true;
      result[i]!.conflictReason = {
        en: `Arrival at ${clock(ends[i - 1]!)} and next departure at ${clock(starts[i]!)}: less than 3 minutes to change.`,
        'pt-BR': `Chegada às ${clock(ends[i - 1]!)} e próximo embarque às ${clock(starts[i]!)}: menos de 3 min para a troca.`,
      };
    }
  }
  return result;
}

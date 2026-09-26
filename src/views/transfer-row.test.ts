import { describe, expect, it } from 'vitest';
import {
  expandTimelineTransferParts,
  formatLegDuration,
  legLineColor,
  legsForDay,
  pickLocale,
} from '../catalog';
import type { TripLeg } from '../trip/parse';
import { transferRowModel } from './transfer-row';

describe('transferRowModel', () => {
  it('maps each mode to its icon', () => {
    const via = (leg: TripLeg) => transferRowModel(leg);
    expect(via({ detail: 'a pé', mode: 'walk' }).icon).toBe('directions_walk');
    expect(via({ detail: 'metrô', mode: 'transit' }).icon).toBe('directions_transit');
    expect(
      via({
        detail: 'trem Frecciarossa 07:30 → Milano Centrale 14:07 · 6h37',
        mode: 'transit',
        durationMin: 397,
      }).icon,
    ).toBe('train');
    expect(via({ detail: 'voo', mode: 'flight' }).icon).toBe('flight');
    expect(via({ detail: 'a pé · 7 min', mode: 'walk', durationMin: 7 }).label).toBe('A pé');
    expect(transferRowModel({ detail: 'a pé · 7 min', mode: 'walk', durationMin: 7 }, 'en').label).toBe('Walk');
    expect(via({ detail: 'sem palavra-chave' }).icon).toBe('directions_transit');

    const taxi = via({ detail: 'táxi até o hotel', mode: 'taxi', durationMin: 15 });
    expect(taxi.icon).toBe('local_taxi');
    expect(taxi.label).toBe('táxi até o hotel');
    expect(taxi.duration).toBe(pickLocale('pt-BR', formatLegDuration(15)));
    expect(taxi.lineColor).toBeNull();
    expect(taxi.note).toBeNull();

    const bolt = via({
      detail: 'Pegar um Bolt · 35 min — o app mostra onde',
      note: 'o app mostra onde',
      mode: 'taxi',
      durationMin: 35,
    });
    expect(bolt.label).toBe('Pegar um Bolt');
    expect(bolt.duration).toBe(pickLocale('pt-BR', formatLegDuration(35)));
    expect(bolt.note).toBe('o app mostra onde');
  });

  it('labels a catalog walk and colors a metro chip from legLineColor', () => {
    const walk = transferRowModel({ from: 'a', to: 'b', mode: 'walk' });
    expect(walk).toMatchObject({
      mode: 'walk',
      icon: 'directions_walk',
      label: 'A pé',
      duration: null,
      lineColor: null,
      chipTone: null,
      from: 'a',
      to: 'b',
    });
    expect(transferRowModel({ from: 'a', to: 'b', mode: 'walk' }, 'en').label).toBe('Walk');

    const yellow = {
      from: 'mil-sondrio',
      to: 'mil-cesarino',
      mode: 'transit' as const,
      line: 'mil-m3',
      label: 'M3',
      durationMin: 25,
    };
    const light = transferRowModel(yellow);
    expect(light.icon).toBe('directions_transit');
    expect(light.label).toBe('M3');
    expect(light.duration).toBe(pickLocale('pt-BR', formatLegDuration(25)));
    expect(light.lineColor).toBe(legLineColor(yellow));
    expect(light.lineColor).toBe('#F4CA16');
    expect(light.chipTone).toBe('ink');

    const purple = {
      from: 'a',
      to: 'b',
      mode: 'transit' as const,
      line: 'm14',
      label: 'M14',
      durationMin: 12,
    };
    const dark = transferRowModel(purple);
    expect(dark.lineColor).toBe(legLineColor(purple));
    expect(dark.lineColor).toBe('#62259D');
    expect(dark.chipTone).toBe('on-ink');
    expect(dark.duration).toBe(pickLocale('pt-BR', formatLegDuration(12)));
  });

  it('counts the stations of a ride and tags each walk of a train leg', () => {
    const tower = legsForDay('paris-d1').find((leg) => leg.label === 'RER E + M9')!;
    const parts = expandTimelineTransferParts(tower);
    // Noisy-le-Sec → Pantin, Rosa Parks, Magenta, Haussmann–Saint-Lazare
    expect(transferRowModel(parts[0]!, 'pt-BR').stations).toBe('4 estações');
    expect(transferRowModel(parts[0]!, 'en').stations).toBe('4 stops');
    const walk = parts.find((part) => part.mode === 'walk')!;
    expect(transferRowModel(walk).stations).toBeNull();
    expect(transferRowModel(walk).walkIndex).toBe(1);
  });

  it('reads a metro hop and the walk to the next line', () => {
    const tower = legsForDay('paris-d1').find((leg) => leg.label === 'RER E + M9');
    expect(tower).toBeTruthy();
    const parts = expandTimelineTransferParts(tower!);
    const walk = parts.find((part) => part.mode === 'walk');
    const m9 = parts.find((part) => part.label.en === 'M9 → Trocadéro');
    expect(walk).toBeTruthy();
    expect(m9).toBeTruthy();

    const whole = transferRowModel(tower!, 'en');
    expect(whole.label).toBe('RER E + M9');
    expect(whole.lineColor).toBe(legLineColor(tower!));

    expect(transferRowModel(walk!, 'pt-BR')).toMatchObject({
      mode: 'walk',
      icon: 'directions_walk',
      label: 'A pé até M9',
      duration: pickLocale('pt-BR', formatLegDuration(walk!.durationMin)),
      lineColor: null,
      chipTone: null,
      from: tower!.from,
      to: tower!.to,
    });
    expect(transferRowModel(walk!, 'en').label).toBe('Walk to M9');

    const hop = transferRowModel(m9!, 'en');
    expect(hop).toMatchObject({
      mode: 'transit',
      icon: 'directions_transit',
      label: 'M9 → Trocadéro',
      duration: pickLocale('en', formatLegDuration(m9!.durationMin)),
      lineColor: m9!.color,
      hopIndex: 1,
      from: tower!.from,
      to: tower!.to,
    });
    expect(hop.lineColor).not.toBe(legLineColor(tower!));
    expect(hop.lineColor).toBeTruthy();
  });
});

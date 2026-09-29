import { afterEach, describe, expect, it, vi } from 'vitest';
import type { TravelCity, TravelPlace } from '../catalog';
import type { MapHandle } from '../map/types';
import { openPlace } from './place-panel';
import { activatePlace, consumePlaceSearch, preparePlaceSearch, resetPlaceSelection, revealPlace } from './place-activation';

vi.mock('./place-panel', () => ({ openPlace: vi.fn() }));
const place = (id: string) => ({ id, lat: 48, lng: 2 }) as TravelPlace;
const city = {} as TravelCity;
const map = () => ({ flyTo: vi.fn(), select: vi.fn() }) as unknown as MapHandle;
const viewport = (mobile: boolean) => vi.stubGlobal('window', { matchMedia: () => ({ matches: mobile }) });
afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe('place activation', () => {
  it('selects on first mobile tap and opens on the next tap from either source', () => {
    viewport(true);
    const target = map();
    activatePlace(target, place('a'), city, 'pt-BR');
    expect(target.select).toHaveBeenCalledWith('a', place('a'));
    expect(target.flyTo).not.toHaveBeenCalled();
    expect(openPlace).not.toHaveBeenCalled();
    activatePlace(target, place('a'), city, 'pt-BR');
    expect(openPlace).toHaveBeenCalledOnce();
  });

  it('switches selection for another place and resets between views', () => {
    viewport(true);
    const target = map();
    activatePlace(target, place('a'), city, 'en');
    activatePlace(target, place('b'), city, 'en');
    expect(openPlace).not.toHaveBeenCalled();
    resetPlaceSelection(target);
    activatePlace(target, place('b'), city, 'en');
    expect(openPlace).not.toHaveBeenCalled();
    activatePlace(target, place('b'), city, 'en');
    expect(openPlace).toHaveBeenCalledOnce();
  });

  it('opens directly on desktop and retains direct-link selection on mobile', () => {
    viewport(false);
    const target = map();
    activatePlace(target, place('a'), city, 'en');
    expect(openPlace).toHaveBeenCalledOnce();
    expect(target.flyTo).not.toHaveBeenCalled();
    viewport(true);
    revealPlace(target, place('b'), city, 'en');
    activatePlace(target, place('b'), city, 'en');
    expect(openPlace).toHaveBeenCalledTimes(3);
  });

  it('selects again when search finds an already selected stop', () => {
    viewport(true);
    const target = map();
    activatePlace(target, place('a'), city, 'en');
    preparePlaceSearch('a');
    activatePlace(target, place('a'), city, 'en');
    expect(openPlace).not.toHaveBeenCalled();
    activatePlace(target, place('a'), city, 'en');
    expect(openPlace).toHaveBeenCalledOnce();
  });

  it('consumes a mobile search selection once without affecting desktop links', () => {
    viewport(true);
    preparePlaceSearch('a');
    expect(consumePlaceSearch('a')).toBe(true);
    expect(consumePlaceSearch('a')).toBe(false);
    viewport(false);
    preparePlaceSearch('a');
    expect(consumePlaceSearch('a')).toBe(false);
  });
});

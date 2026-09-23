import { describe, expect, it } from 'vitest';
import type { ItineraryDay, ItineraryStop, PlaceCategory, TravelPlace } from '../catalog';
import { placeCategoriesOffByDefault, placeCategoryOrder } from '../catalog';
import {
  applyCategoryClick,
  categoriesPresent,
  citySearchPlaceholder,
  groupOpenState,
  groupsToggleLabel,
  isDefaultCategoryFilter,
  primaryDayRoute,
  searchBlob,
  searchLeavesView,
} from './places';

const day: ItineraryDay = {
  id: 'd',
  day: 1,
  title: { en: 'Day', 'pt-BR': 'Dia' },
  stops: [],
};

function stop(placeId: string, optional?: boolean): ItineraryStop {
  return optional ? { placeId, optional: true } : { placeId };
}

describe('searchLeavesView', () => {
  const inside = () => true;
  const outside = (lat: number) => lat === 1;

  it('does not refit when every result is already in view', () => {
    expect(searchLeavesView([{ lat: 1, lng: 2 }], inside)).toBe(false);
    expect(searchLeavesView([], inside)).toBe(false);
  });

  it('refits when any result leaves the view', () => {
    expect(
      searchLeavesView(
        [
          { lat: 1, lng: 2 },
          { lat: 3, lng: 4 },
        ],
        outside,
      ),
    ).toBe(true);
  });
});

describe('category groups', () => {
  const order = ['parks', 'cafes', 'commons'] as PlaceCategory[];

  it('drops categories the city does not have, and keeps catalog order', () => {
    expect(categoriesPresent(order, [{ category: 'commons' }, { category: 'parks' }])).toEqual([
      'parks',
      'commons',
    ]);
  });

  it('treats the catalog default as no badge, and any other set as custom', () => {
    const enabled = placeCategoryOrder.filter((category) => !placeCategoriesOffByDefault.has(category));
    expect(isDefaultCategoryFilter(enabled, placeCategoryOrder, placeCategoriesOffByDefault)).toBe(true);
    expect(isDefaultCategoryFilter(['parks'], placeCategoryOrder, placeCategoriesOffByDefault)).toBe(false);
  });

  it('toggles one category and isolates on only-this', () => {
    expect(applyCategoryClick(['parks', 'cafes'], 'cafes', false)).toEqual(['parks']);
    expect(applyCategoryClick(['parks'], 'cafes', false)).toEqual(['parks', 'cafes']);
    expect(applyCategoryClick(['parks', 'cafes'], 'commons', true)).toEqual(['commons']);
  });

  it('starts groups collapsed unless the city saved them open', () => {
    expect(groupOpenState(['parks', 'cafes'], null)).toEqual({ parks: false, cafes: false });
    expect(groupOpenState(['parks', 'cafes'], { parks: true })).toEqual({ parks: true, cafes: false });
    expect(groupsToggleLabel(false, 'pt-BR')).toBe('Expandir tudo');
    expect(groupsToggleLabel(true, 'en')).toBe('Collapse all');
  });
});

describe('searchBlob', () => {
  it('includes subcategories, price, tips, favorite and nota', () => {
    const place = {
      id: 'x',
      name: { en: 'Cafe', 'pt-BR': 'Café' },
      category: 'cafes',
      description: { en: 'Quiet', 'pt-BR': 'Quieto' },
      subcategories: ['coffee-shop'],
      favorite: true,
      rating: 4.6,
      lat: 0,
      lng: 0,
      visit: {
        avgPricePerPerson: { currency: 'EUR', min: 12, max: 20 },
        bestTime: { en: 'Morning', 'pt-BR': 'Manhã' },
        bestDay: { en: 'Tuesday', 'pt-BR': 'Terça' },
        tips: { en: 'Book ahead', 'pt-BR': 'Reserve antes' },
      },
    } as TravelPlace;
    const blob = searchBlob(place);
    expect(blob).toContain('cafeteria');
    expect(blob).toContain('coffee shop');
    expect(blob).toContain('favorito');
    expect(blob).toContain('nota 4.6');
    expect(blob).toContain('nota 4,6');
    expect(blob).toContain('manha');
    expect(blob).toContain('terca');
    expect(blob).toContain('reserve');
    expect(blob).toContain('12');
    expect(citySearchPlaceholder(12, 'pt-BR')).toBe('Buscar entre 12 lugares…');
  });
});

describe('primaryDayRoute', () => {
  it('keeps optional stops out of the ids and the fallback legs', () => {
    const stops = [stop('a'), stop('opt', true), stop('b'), stop('gone')];
    const route = primaryDayRoute(day, stops, new Set(['a', 'opt', 'b']));
    expect(route.ids).toEqual(['a', 'b']);
    expect(route.fallback).toEqual([{ from: 'a', to: 'b', mode: 'walk' }]);
  });

  it('uses the active stop list, not the day default', () => {
    const stored: ItineraryStop[] = [stop('old')];
    const active = [stop('a'), stop('opt', true), stop('c')];
    const route = primaryDayRoute({ ...day, stops: stored }, active, new Set(['old', 'a', 'opt', 'c']));
    expect(route.ids).toEqual(['a', 'c']);
    expect(route.fallback.map((leg) => `${leg.from}>${leg.to}`)).toEqual(['a>c']);
  });
});

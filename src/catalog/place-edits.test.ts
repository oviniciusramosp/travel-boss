import { afterEach, describe, expect, it } from 'vitest';
import { readPlaceEdits, syncPlaceEdits, withPlaceEdits } from './place-edits';

afterEach(() => syncPlaceEdits({}));
describe('place edits', () => {
  it('accepts favorites, decimal ratings and clearing a rating', () => {
    expect(readPlaceEdits({ favorite: false, rating: null, googleRating: 4.7 })).toEqual({ favorite: false, rating: null, googleRating: 4.7 });
  });
  it('rejects unknown fields and invalid ratings', () => {
    for (const value of [{}, [], { favorite: 1 }, { rating: '4' }, { rating: 0 }, { rating: 6 }, { rating: NaN }, { name: 'x' }]) expect(readPlaceEdits(value)).toBeNull();
  });
  it('keeps existing and resolved records current without overwriting authored defaults', () => {
    const authored = { id: 'test', favorite: true, rating: 4, googleRating: 4.5 };
    const place = withPlaceEdits(authored);
    const resolved = withPlaceEdits({ ...place });
    syncPlaceEdits({ test: { favorite: false, rating: null } });
    expect(place.favorite).toBe(false);
    expect(resolved.rating).toBeUndefined();
    expect(resolved.googleRating).toBe(4.5);
    expect(authored.rating).toBe(4);
    syncPlaceEdits({ test: { rating: 3.5 } });
    expect(resolved.rating).toBe(3.5);
    expect(place.favorite).toBe(true);
  });
});

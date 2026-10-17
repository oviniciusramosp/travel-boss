import { describe, expect, it } from 'vitest';
import { getTravelCity } from './travel';
import { photosForPlaceId } from './travel-photos';
const localAssets = import.meta.glob('/public/photos/lisboa/*.webp');

describe('Lisbon photo coverage', () => {
  it('covers every identified place and gives food venues a storefront and food', () => {
    for (const place of getTravelCity('lisboa')!.places) {
      if (place.id === 'lis-palacio-sao-vicente') continue; // User-authorized identity exception.
      const photos = photosForPlaceId(place.id) ?? [];
      expect(photos.length, place.id).toBeGreaterThan(0);
      if (place.category === 'restaurants' || place.category === 'cafes') {
        expect(photos.map(photo => photo.url), place.id).toEqual([
          expect.stringContaining('-facade.webp'), expect.stringContaining('-food.webp'),
        ]);
      }
      for (const photo of photos) expect(`/public${photo.url}` in localAssets, photo.url).toBe(true);
    }
  });
});

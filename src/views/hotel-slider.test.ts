import { describe, expect, it } from 'vitest';
import { hotelPhotoUrls } from './hotel-slider';

describe('hotel photos', () => {
  it('keeps the gallery and drops anything that is not an http url', () => {
    expect(hotelPhotoUrls({ photos: ['https://img.test/a.jpg', 'data:image/png;base64,xx'], img: 'https://img.test/b.jpg' })).toEqual([
      'https://img.test/a.jpg',
    ]);
    expect(hotelPhotoUrls({ img: 'https://img.test/b.jpg' })).toEqual(['https://img.test/b.jpg']);
    expect(hotelPhotoUrls({})).toEqual([]);
  });
});

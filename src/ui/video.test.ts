import { describe, expect, it } from 'vitest';
import { travelCities } from '../catalog';
import { videoEmbedUrl } from './video';

describe('videoEmbedUrl', () => {
  it('turns an Instagram reel or post into its embed page', () => {
    const reel = 'https://www.instagram.com/reel/DcG6jLkTUtf/embed/';
    expect(videoEmbedUrl('https://www.instagram.com/reel/DcG6jLkTUtf/')).toBe(reel);
    expect(videoEmbedUrl('https://www.instagram.com/jjslavin/reel/DcG6jLkTUtf/?stkn=abc')).toBe(reel);
    expect(videoEmbedUrl('https://instagram.com/reels/DcG6jLkTUtf')).toBe(reel);
    expect(videoEmbedUrl('https://www.instagram.com/p/DdBWEG0gPnD/')).toBe(
      'https://www.instagram.com/p/DdBWEG0gPnD/embed/',
    );
  });

  it('leaves profiles and other hosts to a new tab', () => {
    expect(videoEmbedUrl('https://www.instagram.com/jjslavin/')).toBeNull();
    expect(videoEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(videoEmbedUrl('http://www.instagram.com/reel/DcG6jLkTUtf/')).toBeNull();
  });
});

describe('place videos', () => {
  it('are https links without a share query', () => {
    const bad = travelCities.flatMap((city) =>
      city.places.flatMap((place) =>
        (place.videos ?? [])
          .filter((url) => !url.startsWith('https://') || url.includes('?'))
          .map((url) => `${place.id}: ${url}`),
      ),
    );
    expect(bad).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { travelCities } from '../catalog';
import { videoSourceUrl } from './video';

describe('videoSourceUrl', () => {
  it('maps Instagram links to stable local MP4 files', () => {
    const reel = '/videos/instagram/DcG6jLkTUtf.mp4';
    expect(videoSourceUrl('https://www.instagram.com/reel/DcG6jLkTUtf/')).toBe(reel);
    expect(videoSourceUrl('https://www.instagram.com/jjslavin/reel/DcG6jLkTUtf/?stkn=abc')).toBe(reel);
    expect(videoSourceUrl('https://instagram.com/reels/DcG6jLkTUtf')).toBe(reel);
    expect(videoSourceUrl('https://www.instagram.com/p/DdBWEG0gPnD/')).toBe(
      '/videos/instagram/DdBWEG0gPnD.mp4',
    );
  });

  it('leaves profiles and other hosts to a new tab', () => {
    expect(videoSourceUrl('https://www.instagram.com/jjslavin/')).toBeNull();
    expect(videoSourceUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBeNull();
    expect(videoSourceUrl('https://www.instagram.com.evil.test/reel/DcG6jLkTUtf/')).toBeNull();
    expect(videoSourceUrl('https://www.instagram.com/reel/../../secret')).toBeNull();
    expect(videoSourceUrl('http://www.instagram.com/reel/DcG6jLkTUtf/')).toBeNull();
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

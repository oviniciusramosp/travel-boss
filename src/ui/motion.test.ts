import { describe, expect, it } from 'vitest';
import { CAMERA_DURATION_S, LABEL_FADE_MS, cameraMotion, labelFadeDuration } from './motion';

describe('cameraMotion', () => {
  it('animates for 0.45s when motion is allowed', () => {
    expect(cameraMotion(false)).toEqual({ animate: true, duration: CAMERA_DURATION_S });
  });

  it('cuts instantly when reduced motion is preferred', () => {
    expect(cameraMotion(true)).toEqual({ animate: false, duration: 0 });
  });
});

describe('labelFadeDuration', () => {
  it('keeps the MapLibre fade unless motion is reduced', () => {
    expect(labelFadeDuration(false)).toBe(LABEL_FADE_MS);
    expect(labelFadeDuration(true)).toBe(0);
  });
});

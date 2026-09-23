import { describe, expect, it } from 'vitest';
import {
  CAMERA_DURATION_S,
  LABEL_FADE_MS,
  cameraMotion,
  labelFadeDuration,
  readCssTime,
  runViewTransition,
  sidebarSteps,
} from './motion';

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

describe('sidebarSteps', () => {
  it('fades out before the column closes, and opens the column before fading in', () => {
    expect(sidebarSteps(false)).toEqual(['fade', 'column']);
    expect(sidebarSteps(true)).toEqual(['column', 'fade']);
  });
});

describe('readCssTime', () => {
  it('uses the fallback when the document is not styled', () => {
    expect(readCssTime('--dur-slow', 12)).toBe(12);
  });
});

describe('runViewTransition', () => {
  it('updates immediately when motion is reduced', () => {
    let ran = false;
    runViewTransition(() => {
      ran = true;
    }, true);
    expect(ran).toBe(true);
  });

  it('updates immediately when the API is missing', () => {
    let ran = false;
    runViewTransition(() => {
      ran = true;
    }, false);
    expect(ran).toBe(true);
  });
});

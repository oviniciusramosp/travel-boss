import { describe, expect, it } from 'vitest';
import { compassHeading } from './heading';

describe('phone compass', () => {
  it('uses Safari compass headings and rejects uncalibrated samples', () => {
    expect(compassHeading({ absolute: false, alpha: 20, webkitCompassHeading: 90 })).toBe(90);
    expect(compassHeading({ absolute: false, alpha: 20, webkitCompassHeading: 90, webkitCompassAccuracy: -1 })).toBeNull();
  });
  it('converts absolute Android rotation, including north and landscape', () => {
    expect(compassHeading({ absolute: true, alpha: 0 })).toBe(0);
    expect(compassHeading({ absolute: true, alpha: 270 })).toBe(90);
    expect(compassHeading({ absolute: true, alpha: 270 }, 90)).toBe(180);
    expect(compassHeading({ absolute: true, alpha: 90 }, -90)).toBe(180);
  });
  it('does not turn a relative gyroscope or missing data into a compass', () => {
    expect(compassHeading({ absolute: false, alpha: 90 })).toBeNull();
    expect(compassHeading({ absolute: true, alpha: null })).toBeNull();
    expect(compassHeading({ absolute: true, alpha: NaN })).toBeNull();
  });
});

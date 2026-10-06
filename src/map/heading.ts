type CompassSample = {
  absolute: boolean;
  alpha: number | null;
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

/** Relative gyro rotation cannot tell north. Safari supplies a calibrated compass instead. */
export function compassHeading(sample: CompassSample, screenAngle = 0): number | null {
  if (sample.webkitCompassAccuracy != null && sample.webkitCompassAccuracy < 0) return null;
  const value = sample.webkitCompassHeading ??
    (sample.absolute && sample.alpha != null ? 360 - sample.alpha : null);
  if (value == null || !Number.isFinite(value)) return null;
  return ((value + screenAngle) % 360 + 360) % 360;
}

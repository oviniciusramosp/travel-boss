import { describe, expect, it } from 'vitest';
import { directionsMode, googleDirectionsUrl, type DirectionsPoint } from './directions';

const a: DirectionsPoint = { lat: 48.8, lng: 2.3 };
const b: DirectionsPoint = { lat: 48.86, lng: 2.35 };
const far: DirectionsPoint = { lat: 48.73, lng: 2.37 };

describe('googleDirectionsUrl', () => {
  it('needs two points and encodes origin, destination and mode', () => {
    expect(googleDirectionsUrl([a], 'walk')).toBeNull();
    expect(googleDirectionsUrl([a, b], 'walk')).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=48.8%2C2.3&destination=48.86%2C2.35&travelmode=walking',
    );
    expect(googleDirectionsUrl([a, b], 'transit')).toContain('travelmode=transit');
  });

  it('keeps at most 9 waypoints between origin and destination', () => {
    const points = Array.from({ length: 12 }, (_, index) => ({
      lat: index,
      lng: index + 0.5,
    }));
    const url = googleDirectionsUrl(points, 'transit');
    expect(url).toContain('origin=0%2C0.5');
    expect(url).toContain('destination=11%2C11.5');
    const waypoints = new URL(url ?? '').searchParams.get('waypoints') ?? '';
    expect(waypoints.split('|')).toHaveLength(9);
    expect(waypoints.startsWith('1,1.5|')).toBe(true);
    expect(waypoints.endsWith('|9,9.5')).toBe(true);
    expect(waypoints).not.toContain('10,10.5');
  });
});

describe('directionsMode', () => {
  it('walks a short hop and sends a long hop to transit', () => {
    const near: DirectionsPoint = { lat: 48.863, lng: 2.352 };
    expect(directionsMode(b, near)).toBe('walk');
    expect(directionsMode(far, b)).toBe('transit');
  });
});

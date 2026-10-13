import { describe, expect, it, vi } from 'vitest';
import { watchLocation } from './geolocation';

function setup() {
  const requests: { success: PositionCallback; failure: PositionErrorCallback; options?: PositionOptions }[] = [];
  const geo = {
    watchPosition: vi.fn((success: PositionCallback, failure: PositionErrorCallback, options?: PositionOptions) => {
      requests.push({ success, failure, options });
      return requests.length;
    }),
    clearWatch: vi.fn(),
  } as unknown as Geolocation;
  const success = vi.fn();
  const failure = vi.fn();
  const stop = watchLocation(geo, success, failure);
  const error = (code: number) => ({ code } as GeolocationPositionError);
  const position = { coords: { latitude: 45, longitude: 9, accuracy: 100 } } as GeolocationPosition;
  return { geo, requests, success, failure, stop, error, position };
}

describe('location tracking', () => {
  it.each([2, 3])('retries error %s at default accuracy and keeps tracking', code => {
    const s = setup();
    expect(s.requests[0].options?.enableHighAccuracy).toBe(true);
    s.requests[0].failure(s.error(code));
    expect(s.geo.clearWatch).toHaveBeenCalledWith(1);
    expect(s.requests[1].options).toMatchObject({ enableHighAccuracy: false, timeout: 30000 });
    expect(s.failure).not.toHaveBeenCalled();
    s.requests[0].failure(s.error(1)); // Ignore callbacks queued by the previous watch.
    s.requests[0].success(s.position);
    expect(s.success).not.toHaveBeenCalled();
    s.requests[1].success(s.position);
    s.requests[1].success(s.position);
    expect(s.success).toHaveBeenCalledTimes(2);
    s.stop();
    expect(s.geo.clearWatch).toHaveBeenLastCalledWith(2);
  });

  it('does not retry denied permission', () => {
    const s = setup();
    s.requests[0].failure(s.error(1));
    expect(s.requests).toHaveLength(1);
    expect(s.geo.clearWatch).toHaveBeenCalledWith(1);
    expect(s.failure).toHaveBeenCalledWith(s.error(1));
  });

  it.each([1, 2, 3])('stops and reports fallback error %s once', code => {
    const s = setup();
    s.requests[0].failure(s.error(2));
    s.requests[1].failure(s.error(code));
    s.requests[1].failure(s.error(code));
    s.requests[1].success(s.position);
    expect(s.requests).toHaveLength(2);
    expect(s.geo.clearWatch).toHaveBeenLastCalledWith(2);
    expect(s.failure).toHaveBeenCalledExactlyOnceWith(s.error(code));
    expect(s.success).not.toHaveBeenCalled();
  });

  it('ignores pending callbacks after the user stops', () => {
    const s = setup();
    s.stop();
    s.requests[0].failure(s.error(3));
    s.requests[0].success(s.position);
    expect(s.requests).toHaveLength(1);
    expect(s.success).not.toHaveBeenCalled();
    expect(s.failure).not.toHaveBeenCalled();
  });
});

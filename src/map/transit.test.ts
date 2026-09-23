import { describe, expect, it } from 'vitest';
import { transitLineForPlace } from './transit';

describe('transitLineForPlace', () => {
  it('returns the full metro line for a line place and nothing for a landmark', () => {
    const line6 = transitLineForPlace('par-metro-6');
    expect(line6?.id).toBe('m6');
    expect(line6 && line6.stations.length).toBeGreaterThan(10);
    expect(transitLineForPlace('par-metro-2')?.id).toBe('m2');
    expect(transitLineForPlace('par-eiffel')).toBeUndefined();
    expect(transitLineForPlace('par-metro-99')).toBeUndefined();
  });
});

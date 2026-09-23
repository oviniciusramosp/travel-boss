import { describe, expect, it } from 'vitest';
import { parseTripRequest, tripIdFromPath } from './api';

describe('parseTripRequest', () => {
  it('reads the collection and one id, from either url shape', () => {
    expect(parseTripRequest('/')).toBe('list');
    expect(parseTripRequest('')).toBe('list');
    expect(parseTripRequest('/europa')).toBe('europa');
    expect(parseTripRequest('/api/trips/europa?t=1')).toBe('europa');
    expect(parseTripRequest('/api/trips')).toBe('list');
  });

  it('rejects paths that are not a single trip id', () => {
    expect(parseTripRequest('/../secret')).toBeNull();
    expect(parseTripRequest('/europa/extra')).toBeNull();
    expect(parseTripRequest('/europa.md')).toBeNull();
    expect(parseTripRequest('/%2e%2e')).toBeNull();
  });
});

describe('tripIdFromPath', () => {
  it('reads the id from a trips markdown path and ignores the rest', () => {
    expect(tripIdFromPath('/repo/content/trips/europa.md')).toBe('europa');
    expect(tripIdFromPath('C:\\repo\\content\\trips\\europa.md')).toBe('europa');
    expect(tripIdFromPath('/repo/content/trips/.draft.md')).toBeNull();
    expect(tripIdFromPath('/repo/src/main.ts')).toBeNull();
  });
});

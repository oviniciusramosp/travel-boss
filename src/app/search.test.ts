import { describe, expect, it } from 'vitest';
import { searchMatches } from './search';

describe('search suggestions', () => {
  it('matches accents and case in names and contextual notes', () => {
    const place = { label: 'São Paulo', text: 'São Paulo · café' };
    expect(searchMatches([place], ' SAO ')).toEqual([place]);
    expect(searchMatches([place], 'CAFE')).toEqual([place]);
    expect(searchMatches([place], 'Roma')).toEqual([]);
    expect(searchMatches([place], '  ')).toEqual([]);
  });
  it('puts exact names before prefixes and incidental mentions without mutating the source', () => {
    const items = ['Port du Louvre', 'Louvre café', 'Louvre'].map(label => ({ label, text: label }));
    expect(searchMatches(items, 'louvre').map(item => item.label)).toEqual(['Louvre', 'Louvre café', 'Port du Louvre']);
    expect(items[0].label).toBe('Port du Louvre');
    expect(searchMatches(Array.from({ length: 12 }, () => items[0]), 'louvre')).toHaveLength(8);
  });
});

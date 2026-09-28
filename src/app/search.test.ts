import { describe, expect, it } from 'vitest';
import { searchMatches, searchSchedule } from './search';

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

describe('search schedule', () => {
  it('uses the card month format and the scheduled stop time', () => {
    expect(searchSchedule('2026-10-05', '13:30', 'pt-BR')).toBe('05 Out · 13:30');
    expect(searchSchedule('2026-10-05', '13:30', 'en')).toBe('05 Oct · 13:30');
    expect(searchSchedule('2026-01-04', '', 'pt-BR')).toBe('04 Jan');
    expect(searchSchedule('', '09:00', 'pt-BR')).toBe('09:00');
  });
});

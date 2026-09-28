import { describe, expect, it } from 'vitest';
import { compareTaskSchedule, editChecklist, type ChecklistItem } from './checklist-state';

const item: ChecklistItem = { id: 'one', group: 'tasks', text: 'Passaporte', done: false };
describe('checklist edits', () => {
  it('orders dates and times chronologically, keeping undated tasks last and ties stable', () => {
    const entries = [
      { id: 'undated' }, { id: 'later', date: '2026-10-03' },
      { id: 'afternoon', date: '2026-10-02', time: '15:00' },
      { id: 'morning', date: '2026-10-02', time: '09:00' },
      { id: 'all-day', date: '2026-10-02' }, { id: 'same-day', date: '2026-10-02' },
      { id: 'time-only', time: '08:00' }, { id: 'past', date: '2026-09-01' },
    ];
    expect(entries.sort(compareTaskSchedule).map(({ id }) => id)).toEqual([
      'past', 'all-day', 'same-day', 'morning', 'afternoon', 'later', 'undated', 'time-only',
    ]);
  });
  it('supports independent optional date and time, including clearing them', () => {
    for (const schedule of [{ date: '2026-10-02' }, { time: '09:30' }, { date: '2028-02-29', time: '23:59' }]) {
      const after = { ...item, ...schedule };
      expect(editChecklist([item], { before: item, after })).toEqual([after]);
      expect(editChecklist([after], { before: after, after: item })).toEqual([item]);
      expect(editChecklist([after], { before: item, after: null })).toBeNull();
    }
  });
  it('rejects invalid dates, times and schedules on packing items', () => {
    for (const schedule of [{ date: '2026-02-29' }, { date: '2026-13-02' }, { date: '' }, { date: 2026 },
      { time: '24:00' }, { time: '12:60' }, { time: '' }, { time: null }, { group: 'packing', date: '2026-10-02' }]) {
      expect(editChecklist([], { before: null, after: { ...item, ...schedule } })).toBeNull();
    }
  });
  it('adds, edits, completes and deletes a single item', () => {
    expect(editChecklist([], { before: null, after: item })).toEqual([item]);
    const after = { ...item, text: 'Documentos', done: true };
    expect(editChecklist([item], { before: item, after })).toEqual([after]);
    expect(editChecklist([after], { before: after, after: null })).toEqual([]);
  });
  it('preserves unrelated concurrent additions and rejects stale edits', () => {
    const other = { ...item, id: 'two', group: 'packing' as const };
    expect(editChecklist([item, other], { before: item, after: null })).toEqual([other]);
    expect(editChecklist([{ ...item, done: true }], { before: item, after: null })).toBeNull();
    expect(editChecklist([item], { before: null, after: item })).toBeNull();
  });
  it('rejects malformed items and identity changes', () => {
    for (const after of [undefined, {}, { ...item, text: ' ' }, { ...item, done: 'yes' }, { ...item, id: 'two' }]) {
      expect(editChecklist([item], { before: item, after })).toBeNull();
    }
  });
});

import { describe, expect, it } from 'vitest';
import { editChecklist, type ChecklistItem } from './checklist-state';

const item: ChecklistItem = { id: 'one', group: 'tasks', text: 'Passaporte', done: false };
describe('checklist edits', () => {
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

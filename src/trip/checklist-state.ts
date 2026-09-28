export type ChecklistItem = { id: string; group: 'tasks' | 'packing'; text: string; done: boolean };
export type ChecklistEdit = { before: ChecklistItem | null; after: ChecklistItem | null };

function isItem(value: unknown): value is ChecklistItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as ChecklistItem;
  return typeof item.id === 'string' && /^[\w-]{1,80}$/.test(item.id)
    && (item.group === 'tasks' || item.group === 'packing')
    && typeof item.text === 'string' && item.text.trim().length > 0 && item.text.length <= 500
    && typeof item.done === 'boolean';
}

/** Apply one item edit; reject stale edits instead of overwriting another tab. */
export function editChecklist(items: ChecklistItem[], value: unknown): ChecklistItem[] | null {
  if (!value || typeof value !== 'object') return null;
  const { before, after } = value as ChecklistEdit;
  if (before !== null && !isItem(before) || after !== null && !isItem(after) || !before && !after) return null;
  if (before && after && (before.id !== after.id || before.group !== after.group)) return null;
  const id = (before ?? after)!.id;
  const index = items.findIndex((item) => item.id === id);
  if (!before) return index < 0 ? [...items, after!] : null;
  const current = items[index];
  if (!current || current.group !== before.group || current.text !== before.text || current.done !== before.done) return null;
  return items.flatMap((item) => item.id === id ? after ? [after] : [] : [item]);
}

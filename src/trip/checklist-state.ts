export type ChecklistItem = { id: string; group: 'tasks' | 'packing'; text: string; done: boolean; date?: string; time?: string };
export type ChecklistEdit = { before: ChecklistItem | null; after: ChecklistItem | null };

/** Chronological dates, all-day tasks first on each date, undated tasks last. */
export function compareTaskSchedule(a: Pick<ChecklistItem, 'date' | 'time'>, b: Pick<ChecklistItem, 'date' | 'time'>): number {
  return (a.date ?? '\uffff').localeCompare(b.date ?? '\uffff') || (a.time ?? '').localeCompare(b.time ?? '');
}

function validDate(value: unknown): boolean {
  if (typeof value !== 'string' || !/^(?!0000)\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isItem(value: unknown): value is ChecklistItem {
  if (!value || typeof value !== 'object') return false;
  const item = value as ChecklistItem;
  return typeof item.id === 'string' && /^[\w-]{1,80}$/.test(item.id)
    && (item.group === 'tasks' || item.group === 'packing')
    && typeof item.text === 'string' && item.text.trim().length > 0 && item.text.length <= 500
    && typeof item.done === 'boolean'
    && (item.date === undefined || item.group === 'tasks' && validDate(item.date))
    && (item.time === undefined || item.group === 'tasks' && typeof item.time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(item.time));
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
  if (!current || current.group !== before.group || current.text !== before.text || current.done !== before.done
    || current.date !== before.date || current.time !== before.time) return null;
  return items.flatMap((item) => item.id === id ? after ? [after] : [] : [item]);
}

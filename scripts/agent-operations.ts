import { parseTrip } from '../src/trip/parse';
import { tripBlocks, type DayBlock, type StopBlock } from './agent-blocks';

export class OperationError extends Error {
  constructor(message: string, public status = 400, public details?: unknown) { super(message); }
}
const fail = (message: string, status = 400): never => { throw new OperationError(message, status); };
const singleLine = (value: unknown): value is string => typeof value === 'string' && !/[\r\n\\]/.test(value);
const validTime = (value: unknown): value is string => typeof value === 'string' && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
const stopAnchor = (value: unknown): string => typeof value === 'string' ? value : fail('Stop target anchor required');

/** Intention operations preserve every unedited child line and the file's newline style. */
export function applyOperations(id: string, raw: string, operations: any[]) {
  if (!operations.length || operations.length > 100) fail('Invalid operations');
  // Structural edits affect occurrence addresses. Re-read the resulting addresses
  // before a second structural operation rather than guessing shifted identities.
  if (operations.length > 1 && operations.some(op => ['insert-stop', 'move-stop', 'remove-stop'].includes(op?.operation))) {
    fail('Structural operations require a separate atomic request; preview and use its new anchors');
  }
  let updated = raw;
  const touched = new Set<string>();
  for (const op of operations) {
    if (!op || typeof op !== 'object') fail('Invalid operation');
    const blocks = tripBlocks(id, updated), lines = updated.split(/\r?\n/);
    const eol = updated.includes('\r\n') ? '\r\n' : '\n';
    const findDay = (anchor: unknown): DayBlock => blocks.days.find(day => day.anchor === anchor) ?? fail('Day anchor not found', 409);
    const findStop = (target: unknown): StopBlock => {
      const anchor = stopAnchor(target);
      const matches = blocks.days.flatMap(day => day.stops).filter(stop => stop.anchor === anchor);
      return matches.length === 1 ? matches[0]! : fail('Stop anchor missing or ambiguous', 409);
    };
    const appendAt = (day: DayBlock) => {
      let at = day.endLine;
      while (at > day.line && !lines[at - 1]?.trim()) at--;
      return at;
    };
    const replace = (block: StopBlock, text: string[]) => { lines.splice(block.line - 1, block.endLine - block.line + 1, ...text); touched.add(block.dayAnchor); };
    if (op.operation === 'insert-stop') {
      const day = findDay(op.day), data = op.stop;
      if (!data || typeof data.placeId !== 'string' || !/^[\w-]+$/.test(data.placeId) || !singleLine(data.label) || !data.label.trim() || /[\[\]()]/.test(data.label)) fail('Invalid inserted stop');
      if (data.time !== undefined && !validTime(data.time)) fail('Invalid time');
      if (data.note !== undefined && !singleLine(data.note)) fail('Invalid note');
      if (Object.keys(data).some(key => !['placeId', 'label', 'time', 'note'].includes(key))) fail('Unsupported inserted stop field');
      const text = `- ${data.time ? `${data.time} ` : ''}[${data.label}](place:${data.placeId})${data.note ? ` — ${data.note}` : ''}`;
      const before = op.before ? findStop(op.before) : undefined;
      if (before && before.dayAnchor !== day.anchor) fail('Insertion anchor must belong to destination day');
      lines.splice(before ? before.line - 1 : appendAt(day), 0, text); touched.add(day.anchor);
    } else if (op.operation === 'move-stop') {
      const stop = findStop(op.target), day = findDay(op.day), before = op.before ? findStop(op.before) : undefined;
      if (before?.anchor === stop.anchor) fail('Cannot move a stop before itself');
      if (before && before.dayAnchor !== day.anchor) fail('Move anchor must belong to destination day');
      let at = before ? before.line - 1 : appendAt(day);
      const count = stop.endLine - stop.line + 1, content = lines.splice(stop.line - 1, count);
      if (at >= stop.endLine) at -= count;
      lines.splice(at, 0, ...content); touched.add(stop.dayAnchor); touched.add(day.anchor);
    } else {
      const stop = findStop(op.target), content = lines.slice(stop.line - 1, stop.endLine);
      if (op.operation === 'remove-stop') replace(stop, []);
      else if (op.operation === 'update-stop') {
        const changes = op.changes;
        if (!changes || typeof changes !== 'object' || !Object.keys(changes).length || Object.keys(changes).some(key => !['time', 'note'].includes(key))) fail('Invalid stop update');
        let head = content[0]!;
        if (changes.time !== undefined) {
          if (changes.time !== null && !validTime(changes.time)) fail('Invalid time');
          head = head.replace(/^- (?:\d{2}:\d{2} )?/, `- ${changes.time ? `${changes.time} ` : ''}`);
        }
        if (changes.note !== undefined) {
          if (!singleLine(changes.note) || head.endsWith('\\')) fail('Invalid note; multiline notes require an exact block edit');
          const link = /^(- (?:\d{2}:\d{2}\s+)?\[[^\]]+\]\((?:place:|https?:\/\/)[^)]+\))(?:\s*(?:—|-)\s*.*)?$/.exec(head);
          if (!link) fail('Note updates require a place or linked stop');
          head = link![1] + (changes.note ? ` — ${changes.note}` : '');
        }
        content[0] = head; replace(stop, content);
      } else if (op.operation === 'set-cost') {
        const field = op.kind === 'food' ? 'comida' : op.kind === 'ticket' ? 'ingresso' : fail('Invalid cost kind');
        if (op.amount !== null && (typeof op.amount !== 'number' || !Number.isFinite(op.amount) || op.amount < 0 || Math.abs(Math.round(op.amount * 100) - op.amount * 100) > 1e-7)) fail('Invalid cost amount');
        const clean = content.filter(line => !new RegExp(`^\\s+- ${field}:`).test(line));
        if (op.amount !== null) clean.push(`  - ${field}: €${Number(op.amount).toFixed(2).replace('.', ',')}`);
        replace(stop, clean);
      } else if (op.operation === 'set-transfer') {
        if (!singleLine(op.detail) || !op.detail.trim()) fail('Invalid transfer detail');
        if (op.departure !== undefined && op.departure !== null && !validTime(op.departure)) fail('Invalid departure');
        const clean = content.filter(line => !/^\s+- (via|acesso|embarque|saída):/.test(line));
        clean.push(`  - via: ${op.detail}`);
        if (op.access !== undefined) {
          if (!singleLine(op.access) || !op.access.trim()) fail('Invalid transfer access');
          clean.push(`  - acesso: ${op.access}`);
        }
        if (op.departure) clean.push(`  - saída: ${op.departure}`);
        if (op.boardings !== undefined && (!Array.isArray(op.boardings) || op.boardings.length > 20)) fail('Invalid boardings');
        for (const item of op.boardings ?? []) {
          if (!item || !['date', 'service', 'board', 'exit', 'departure', 'arrival'].every(key => singleLine(item[key]) && item[key].trim() && !/[·→]/.test(item[key])) || !validTime(item.departure) || !validTime(item.arrival)) fail('Invalid boarding');
          clean.push(`  - embarque: ${item.date} · ${item.service} · ${item.board} → ${item.exit} · ${item.departure} → ${item.arrival}`);
        }
        replace(stop, clean);
      } else if (op.operation === 'resolve-comment') {
        const parsed = parseTrip(id, '', updated).cities.flatMap(city => city.days).flatMap(day => day.stops).find(item => item.line === stop.line);
        const matches = parsed?.comments?.filter(comment => comment.text === op.commentText) ?? [];
        if (matches.length !== 1) fail('Expected one exact comment text', 409);
        const at = matches[0]!.line - stop.line;
        let end = at + 1;
        while (content[end - 1]?.trimEnd().endsWith('\\') && end < content.length) end++;
        content.splice(at, end - at); replace(stop, content);
      } else fail('Unknown structured operation');
    }
    updated = lines.join(eol);
  }
  return { after: updated, touchedDayAnchors: [...touched] };
}

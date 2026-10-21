import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { parseTrip } from '../src/trip/parse';
import { applyTripPatch, readTripPatch } from '../src/trip/api';
import { dayPeriods, type Period } from '../src/trip/day-plan';
import { scheduleDays } from '../src/trip/calendar';
import { closedPeriods } from '../src/trip/status';
import { tripBlocks, type BlockGuard } from './agent-blocks';
import { applyOperations, OperationError } from './agent-operations';

export const revisionOf = (raw: string) => createHash('sha256').update(raw).digest('hex');
export class AgentError extends Error {
  constructor(message: string, public status = 400, public details?: unknown) { super(message); }
}
export function tripPath(id: string) {
  if (!/^[\w-]+$/.test(id)) throw new AgentError('Invalid trip id');
  const file = resolve('content/trips', `${id}.md`);
  if (!existsSync(file)) throw new AgentError('Trip not found', 404);
  const root = realpathSync(process.cwd()), base = realpathSync(resolve('content/trips')), actual = realpathSync(file);
  const inside = (parent: string, child: string) => { const path = relative(parent, child); return path !== '..' && !path.startsWith('../') && !path.startsWith('..\\') && !isAbsolute(path); };
  if (!inside(root, base) || !inside(base, actual)) throw new AgentError('Trip path must stay inside this checkout', 403);
  return file;
}
export function readTrip(id: string) {
  const raw = readFileSync(tripPath(id), 'utf8');
  return { id, revision: revisionOf(raw), raw, trip: parseTrip(id, `content/trips/${id}.md`, raw) };
}
export function listTrips() {
  return readdirSync(resolve('content/trips')).filter(name => /^[\w-]+\.md$/.test(name)).map(name => {
    const { id, revision, trip } = readTrip(name.slice(0, -3));
    return { id, revision, title: trip.title, cities: trip.cities.map(city => ({ slug: city.slug,
      days: city.days.map(day => ({ line: day.line, title: day.title, stops: day.stops.length })) })), errors: trip.errors };
  });
}
function withoutComments(raw: string) {
  const kept: string[] = []; let skip = false;
  for (const line of raw.split(/\r?\n/)) {
    if (skip || /^\s+-\s+(?:comentário|comentario|comment):/i.test(line)) { skip = line.trimEnd().endsWith('\\'); continue; }
    kept.push(line);
  }
  return kept;
}
/** Status belongs to the stable stop, rather than its mutable note/time line. */
function protectedState(id: string, raw: string, movedStatuses = new Map<string, string>()) {
  const trip = parseTrip(id, '', raw), blocks = tripBlocks(id, raw), state: string[] = [];
  for (const day of blocks.days) {
    const header = day.raw.split(/\r?\n/).slice(0, day.stops[0] ? day.stops[0].line - day.line : undefined);
    for (const marker of header.filter(line => /^\s+-\s+(?:status|períodos fechados):/i.test(line))) state.push(JSON.stringify(['approval', day.anchor, marker]));
    for (const stop of day.stops) {
      const lines = stop.raw.split(/\r?\n/);
      for (const marker of lines.filter(line => /^\s+-\s+status:/i.test(line))) state.push(JSON.stringify(['status', movedStatuses.get(stop.anchor) ?? stop.anchor, marker]));
      if (lines.some(line => /^\s+-\s+(?:decisão|decisao|decision):/i.test(line))) {
        // No model claim can authorize weakening an owner's decision. Retain the
        // whole owner, except resolved requests which are not decision content.
        const owner = withoutComments(stop.raw);
        state.push(JSON.stringify(['decision', stop.anchor, owner]));
      }
    }
  }
  const dated = new Map(scheduleDays(trip).map(item => [item.day.line, item.date]));
  const groups = new Map<string, { day: typeof trip.cities[number]['days'][number]; anchor: string }[]>();
  for (const day of trip.cities.flatMap(city => city.days)) {
    const block = blocks.days.find(item => item.line === day.line)!;
    const key = dated.get(day.line) ?? block.anchor;
    groups.set(key, [...groups.get(key) ?? [], { day, anchor: block.anchor }]);
  }
  for (const [date, group] of groups) {
    const approved = new Set<Period>(group.flatMap(item => [...closedPeriods(item.day)]));
    if (!approved.size) continue;
    const stops = group.flatMap(item => item.day.stops.map(stop => ({ stop, owner: item.anchor })));
    const periods = dayPeriods(stops.map(({ stop }) => ({ time: stop.time,
      text: [stop.label, stop.note].filter(Boolean).join(' — '), listNote: stop.listNote, period: stop.period })));
    for (const period of approved) {
      const protectedRows = stops.flatMap(({ stop, owner }, index) => {
        if (periods[index] !== period) return [];
        const block = blocks.days.find(item => item.anchor === owner)!.stops.find(item => item.line === stop.line)!;
        return [[owner, block.anchor, withoutComments(block.raw)]];
      });
      state.push(JSON.stringify(['period', date, period, protectedRows]));
    }
  }
  return state.sort();
}
export function validateChange(id: string, before: string, after: string, agent = true, movedStatuses?: Map<string, string>) {
  if (agent && JSON.stringify(protectedState(id, before)) !== JSON.stringify(protectedState(id, after, movedStatuses))) {
    throw new AgentError('Protected decision, approval or status would change; explicit owner review is required', 409,
      { code: 'protected-change', resolution: 'Use the owner-controlled browser/manual workflow for the protected change. Agent payload flags cannot authorize it.' });
  }
  for (const line of after.split(/\r?\n/)) {
    const time = /^- (\d{2}):(\d{2}) /.exec(line);
    if (time && (Number(time[1]) > 23 || Number(time[2]) > 59)) throw new AgentError('Invalid stop time', 422);
  }
  const errors = (raw: string) => parseTrip(id, '', raw).errors;
  const old = errors(before).map(error => JSON.stringify([error.code, error.detail]));
  for (const error of errors(after)) {
    const key = JSON.stringify([error.code, error.detail]);
    const at = old.indexOf(key);
    if (at < 0) throw new AgentError(`Validation: ${error.code} at line ${error.line}`, 422);
    old.splice(at, 1);
  }
  return errors(after);
}
export function assertWritable() {
  if (process.env.TB_DEPLOY_LOCK && existsSync(process.env.TB_DEPLOY_LOCK)) throw new AgentError('Deployment in progress; retry shortly', 503);
}
/** Pure plan: preview consumers can calculate semantic effects without acquiring a write lock. */
export function planTripEdit(id: string, raw: string, payload: any) {
  const revision = revisionOf(raw), original = tripBlocks(id, raw);
  const scoped = Array.isArray(payload?.preconditions);
  let operations = payload?.operations;
  if (payload?.operation) operations = [payload];
  if (scoped && (!Array.isArray(operations) || operations.some((op: any) => op.dayLine !== undefined || op.stopLine !== undefined))) {
    throw new AgentError('Scoped edits require stable operation anchors');
  }
  if (!scoped && payload?.revision !== revision) throw new AgentError('Revision changed; read again', 409,
    { code: 'revision-conflict', currentRevision: revision });
  let after = raw, touched: string[] = [];
  if (Array.isArray(operations)) {
    operations = operations.map((op: any) => {
      if (op?.operation !== 'update-stop' || op.target) return op;
      const day = original.days.find(day => day.line === op.dayLine);
      return { ...op, target: day?.stops.find(stop => stop.line === op.stopLine)?.anchor };
    });
    try { const result = applyOperations(id, raw, operations); after = result.after; touched = result.touchedDayAnchors; }
    catch (error) { if (error instanceof OperationError) throw new AgentError(error.message, error.status, error.details); throw error; }
  } else {
    const edits = payload?.edits;
    if (!Array.isArray(edits) || !edits.length || edits.length > 100) throw new AgentError('Invalid edits');
    const lines = raw.split(/\r?\n/);
    for (const edit of edits) {
      if (!Array.isArray(edit.before) || !edit.before.length || !Array.isArray(edit.after) ||
        ![...edit.before, ...edit.after].every(value => typeof value === 'string' && !/[\r\n]/.test(value))) throw new AgentError('Invalid edit');
      const hits = lines.flatMap((_, i) => edit.before.every((value: string, j: number) => lines[i + j] === value) ? [i] : []);
      if (hits.length !== 1) throw new AgentError('Expected unique matching block', 409);
      lines.splice(hits[0]!, edit.before.length, ...edit.after);
    }
    after = lines.join(raw.includes('\r\n') ? '\r\n' : '\n');
  }
  if (scoped) {
    const supplied = new Map<string, string>();
    for (const guard of payload.preconditions) {
      if (!guard || typeof guard.anchor !== 'string' || typeof guard.revision !== 'string' || supplied.has(guard.anchor)) throw new AgentError('Invalid or duplicate block precondition');
      supplied.set(guard.anchor, guard.revision);
    }
    const required = new Map<string, BlockGuard>();
    for (const anchor of touched) for (const guard of original.days.find(day => day.anchor === anchor)!.guards) required.set(guard.anchor, guard);
    const conflicts = [...required.values()].filter(guard => supplied.get(guard.anchor) !== guard.revision)
      .map(guard => ({ anchor: guard.anchor, expectedRevision: supplied.get(guard.anchor) ?? null, currentRevision: guard.revision, scope: guard.scope }));
    if (conflicts.length) throw new AgentError('Block or dependency revision changed; refresh context', 409,
      { code: 'block-conflict', conflicts });
  }
  const updated = tripBlocks(id, after);
  const movedStatuses = new Map<string, string>();
  // A move is not a new confirmation: the operation physically preserves the
  // entire selected block. Normalize that one status owner only. Decision/day
  // ownership is deliberately not normalized and remains protected.
  if (operations?.length === 1 && operations[0]?.operation === 'move-stop') {
    const move = operations[0], source = original.days.flatMap(day => day.stops).find(stop => stop.anchor === move.target);
    if (source && /^\s+- status:/m.test(source.raw)) {
      const destination = updated.days.find(day => day.anchor === move.day);
      const matches = destination?.stops.filter(stop => stop.raw === source.raw) ?? [];
      if (matches.length !== 1) throw new AgentError('Moved status owner is ambiguous; refresh or use the owner workflow', 409, { code: 'ambiguous-status-move' });
      movedStatuses.set(matches[0]!.anchor, source.anchor);
    }
  }
  const errors = validateChange(id, raw, after, true, movedStatuses);
  const changes = original.days.flatMap(day => {
    const next = updated.days.find(item => item.anchor === day.anchor);
    return next?.raw === day.raw ? [] : [{ anchor: day.anchor, before: day.raw, after: next?.raw ?? '' }];
  });
  return { before: raw, after, changes, errors,
    result: { id, revision: revisionOf(after), previousRevision: revision, errors, dryRun: !!payload?.dryRun, changes } };
}
export function editTrip(id: string, payload: any, browser = false) {
  assertWritable();
  const file = tripPath(id), lock = `${file}.lock`, tmp = `${file}.${randomUUID()}.tmp`;
  try { mkdirSync(lock); } catch { throw new AgentError('Trip busy; retry after current writer finishes', 409); }
  try {
    const raw = readFileSync(file, 'utf8'), revision = revisionOf(raw);
    let updated = raw, line: number | undefined;
    let changes: ReturnType<typeof planTripEdit>['changes'] = [];
    let errors: ReturnType<typeof validateChange> = [];
    if (browser) {
      const patch = readTripPatch(payload);
      if (!patch) throw new AgentError('Invalid patch');
      const result = applyTripPatch(raw, patch);
      if (!result) throw new AgentError('Conflicting patch', 409);
      updated = result.raw; line = result.line;
      errors = validateChange(id, raw, updated, false);
    } else {
      const plan = planTripEdit(id, raw, payload); updated = plan.after; changes = plan.changes; errors = plan.errors;
    }
    if (readFileSync(file, 'utf8') !== raw) throw new AgentError('Concurrent external change', 409);
    if (!payload?.dryRun) {
      writeFileSync(tmp, updated, { flag: 'wx', mode: 0o600 });
      renameSync(tmp, file);
    }
    return { id, revision: revisionOf(updated), previousRevision: revision, line, errors, dryRun: !!payload?.dryRun,
      ...(payload?.dryRun ? { changes: changes.map(change => ({ anchor: change.anchor,
        beforeRevision: revisionOf(change.before), afterRevision: revisionOf(change.after) })) } : {}) };
  } finally { rmSync(tmp, { force: true }); rmSync(lock, { recursive: true, force: true }); }
}

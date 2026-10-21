import { createHash, randomUUID } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseTrip } from '../src/trip/parse';
import { applyTripPatch, readTripPatch } from '../src/trip/api';

export const revisionOf = (raw: string) => createHash('sha256').update(raw).digest('hex');
export class AgentError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}
export function tripPath(id: string) {
  if (!/^[\w-]+$/.test(id)) throw new AgentError('Invalid trip id');
  const file = resolve('content/trips', `${id}.md`);
  if (!existsSync(file)) throw new AgentError('Trip not found', 404);
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
// Preserve the owner and exact text of decisions/review metadata. Approved days and
// stops with decisions are conservatively immutable through agent tools.
function protectedState(raw: string) {
  const lines = raw.split(/\r?\n/);
  let city = '', day = '', stop = '';
  const state: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (/^## /.test(line)) city = line;
    if (/^### /.test(line)) { day = line; stop = ''; }
    if (/^- /.test(line)) stop = line;
    if (/^\s+-\s+(?:decisão|decisao|decision|status|períodos fechados):/i.test(line)) {
      state.push(JSON.stringify([city, day, stop, line]));
      if (/\s(?:decisão|decisao|decision):/i.test(line)) {
        let start = i; while (start > 0 && !/^- /.test(lines[start]!)) start--;
        let end = i + 1; while (end < lines.length && !/^(?:- |#{1,3} )/.test(lines[end]!)) end++;
        state.push(JSON.stringify(lines.slice(start, end)));
      }
      if (/períodos fechados:\s*\S|status:\s*fechado/i.test(line)) {
        let start = i; while (start > 0 && !/^### /.test(lines[start]!)) start--;
        let end = i + 1; while (end < lines.length && !/^#{1,3} /.test(lines[end]!)) end++;
        state.push(JSON.stringify(lines.slice(start, end)));
      }
    }
  }
  return state.sort();
}
export function validateChange(id: string, before: string, after: string, agent = true) {
  if (agent && JSON.stringify(protectedState(before)) !== JSON.stringify(protectedState(after))) {
    throw new AgentError('Protected decision, approval or status would change', 409);
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
export function editTrip(id: string, payload: any, browser = false) {
  assertWritable();
  const file = tripPath(id), lock = `${file}.lock`, tmp = `${file}.${randomUUID()}.tmp`;
  try { mkdirSync(lock); } catch { throw new AgentError('Trip busy; retry after current writer finishes', 409); }
  try {
    const raw = readFileSync(file, 'utf8'), revision = revisionOf(raw);
    if (!browser && payload?.revision !== revision) throw new AgentError('Revision changed; read again', 409);
    let updated = raw, line: number | undefined;
    if (browser) {
      const patch = readTripPatch(payload);
      if (!patch) throw new AgentError('Invalid patch');
      const result = applyTripPatch(raw, patch);
      if (!result) throw new AgentError('Conflicting patch', 409);
      updated = result.raw; line = result.line;
    } else {
      let edits = payload?.edits;
      if (payload?.operation === 'update-stop') {
        const day = readTrip(id).trip.cities.flatMap(city => city.days).find(day => day.line === payload.dayLine);
        const stop = day?.stops.find(stop => stop.line === payload.stopLine);
        const changes = payload.changes;
        if (!stop?.placeId || !changes || Object.keys(changes).some(key => !['time', 'note'].includes(key))) throw new AgentError('Invalid stop update');
        const before = raw.split(/\r?\n/)[stop.line - 1]!;
        let after = before;
        if (changes.time !== undefined) {
          if (typeof changes.time !== 'string' || !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(changes.time)) throw new AgentError('Invalid time');
          after = after.replace(/^- (?:\d{2}:\d{2} )?/, `- ${changes.time} `);
        }
        if (changes.note !== undefined) {
          if (typeof changes.note !== 'string' || /[\r\n]/.test(changes.note) || before.endsWith('\\')) throw new AgentError('Invalid note');
          after = after.split(' — ')[0] + (changes.note ? ` — ${changes.note}` : '');
        }
        edits = [{ before: [before], after: [after] }];
      }
      if (!Array.isArray(edits) || !edits.length || edits.length > 100) throw new AgentError('Invalid edits');
      const lines = raw.split(/\r?\n/);
      for (const edit of edits) {
        if (!Array.isArray(edit.before) || !edit.before.length || !Array.isArray(edit.after) ||
          ![...edit.before, ...edit.after].every(value => typeof value === 'string' && !/[\r\n]/.test(value))) throw new AgentError('Invalid edit');
        const hits = lines.flatMap((_, i) => edit.before.every((value: string, j: number) => lines[i + j] === value) ? [i] : []);
        if (hits.length !== 1) throw new AgentError('Expected unique matching block', 409);
        lines.splice(hits[0]!, edit.before.length, ...edit.after);
      }
      updated = lines.join(raw.includes('\r\n') ? '\r\n' : '\n');
    }
    const errors = validateChange(id, raw, updated, !browser);
    if (readFileSync(file, 'utf8') !== raw) throw new AgentError('Concurrent external change', 409);
    if (!payload?.dryRun) {
      writeFileSync(tmp, updated, { flag: 'wx', mode: 0o600 });
      renameSync(tmp, file);
    }
    return { id, revision: revisionOf(updated), previousRevision: revision, line, errors, dryRun: !!payload?.dryRun };
  } finally { rmSync(tmp, { force: true }); rmSync(lock, { recursive: true, force: true }); }
}

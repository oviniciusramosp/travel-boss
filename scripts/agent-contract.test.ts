import { expect, it } from 'vitest';
import { EDIT_PAYLOAD_SCHEMA, ContractError, validateArguments } from './agent-contract';

const revision = 'a'.repeat(64), target = `stop:${'b'.repeat(24)}:1`, day = `day:${'c'.repeat(24)}:1`;
const preconditions = [{ anchor: day, revision, scope: 'date-content' },
  { anchor: `context:${day}`, revision, scope: 'calendar-budget-incoming-luggage' },
  { anchor: `boundary:${day}`, revision, scope: 'adjacent-transport' }];
const validate = (value: unknown) => validateArguments(value, EDIT_PAYLOAD_SCHEMA, 'payload');
const supported = [
  { operation: 'update-stop', target, changes: { time: '12:30', note: 'Nota útil' } },
  { operation: 'update-stop', target, changes: { time: null, note: '' } },
  { operation: 'insert-stop', day, before: target, stop: { placeId: 'par-louvre', label: 'Louvre', time: '10:00', note: 'Visita' } },
  { operation: 'move-stop', target, day, before: `stop:${'d'.repeat(24)}:1` },
  { operation: 'remove-stop', target },
  { operation: 'set-cost', target, kind: 'food', amount: 41.63 },
  { operation: 'set-cost', target, kind: 'ticket', amount: null },
  { operation: 'set-transfer', target, detail: 'Metrô · 20 min', access: 'A pé · 5 min', departure: null,
    boardings: [{ date: '2026-10-21', service: 'M1', board: 'A', exit: 'B', departure: '11:00', arrival: '11:20' }] },
  { operation: 'resolve-comment', target, commentText: 'Pedido com\nduas linhas' },
];
it.each(supported)('describes and accepts supported operation $operation', operation => {
  expect(() => validate({ preconditions, operations: [operation], dryRun: true })).not.toThrow();
  expect(() => validate({ revision, ...operation })).not.toThrow();
});
it('preserves legacy whole-revision edits and single line-addressed update-stop', () => {
  expect(() => validate({ revision, edits: [{ before: ['- 10:00 [X](place:x)'], after: [] }], dryRun: true })).not.toThrow();
  expect(() => validate({ revision, operation: 'update-stop', dayLine: 6, stopLine: 7, changes: { note: '' } })).not.toThrow();
  expect(() => validate({ preconditions, operation: 'update-stop', dayLine: 6, stopLine: 7, changes: { note: '' } })).toThrow(ContractError);
});
it.each([
  { operation: 'update-stop', target, changes: { note: 'x' } },
  { revision, operations: [] },
  { revision, preconditions: [] },
  { preconditions: [{ anchor: day, revision: 'stale' }], operations: [supported[0]] },
  { revision, operation: 'update-stop', target, changes: {} },
  { revision, operation: 'update-stop', target, changes: { note: 'a\n- status: confirmado' } },
  { revision, operation: 'update-stop', target, changes: { time: '25:00' } },
  { revision, operation: 'update-stop', target, changes: { status: 'confirmado' } },
  { revision, operation: 'set-cost', target, kind: 'food', amount: -1 },
  { revision, operation: 'set-cost', target, kind: 'food', amount: 0.001 },
  { revision, operation: 'insert-stop', day, stop: { placeId: 'par-louvre', label: 'X](place:evil)' } },
  { revision, operation: 'insert-stop', day, stop: { placeId: 'par-louvre', label: 'X', status: 'confirmado' } },
  { revision, operation: 'set-transfer', target, detail: 'Metrô · 20 min', boardings: [{ date: '2026-10-21', service: 'M1\n  - status: confirmado', board: 'A', exit: 'B', departure: '11:00', arrival: '11:20' }] },
  { revision, operation: 'remove-stop', target, force: true },
  { revision, operation: 'remove-stop', target, authorizedByUser: true },
  { revision, operations: [supported[0]], edits: [{ before: ['x'], after: [] }] },
  { revision, operation: 'update-stop', target, changes: { note: 'x' }, day },
])('rejects malformed, ambiguous or unsupported nested payload %#', value => {
  expect(() => validate(value)).toThrow(ContractError);
});
it('rejects prototype-property injection instead of treating inherited names as schema properties', () => {
  const payload = JSON.parse(JSON.stringify({ revision, operation: 'remove-stop', target }).replace(/}$/, ',"__proto__":{"force":true}}'));
  expect(() => validate(payload)).toThrow(ContractError);
  expect(() => validateArguments(Object.create({ trip: 'x' }), { type: 'object', properties: { trip: { type: 'string' } }, required: ['trip'] })).toThrow('missing');
});
it('validates the existing root schemas, numeric bounds, arrays, unions and oneOf correctly', () => {
  const schema = { type: 'object', properties: { q: { type: 'string', minLength: 1, maxLength: 5 },
    limit: { type: 'integer', minimum: 1, maximum: 100 }, fields: { type: 'array', maxItems: 2, items: { type: 'string' } } }, required: ['q'], additionalProperties: false };
  expect(() => validateArguments({ q: 'Louvre'.slice(0, 5), limit: 5, fields: ['name'] }, schema)).not.toThrow();
  for (const value of [{ q: '' }, { q: 'abcdef' }, { q: 'x', limit: 1.5 }, { q: 'x', limit: 101 }, { q: 'x', fields: [1] }, { q: 'x', extra: true }]) expect(() => validateArguments(value, schema)).toThrow(ContractError);
  expect(() => validateArguments(null, { type: ['number', 'null'], minimum: 0 })).not.toThrow();
  expect(() => validateArguments(Infinity, { type: 'number' })).toThrow('finite');
  expect(() => validateArguments('x', { oneOf: [{ type: 'string' }, { const: 'x' }] })).toThrow('oneOf');
  expect(() => validateArguments('y', { oneOf: [{ type: 'string' }, { const: 'x' }] })).not.toThrow();
});

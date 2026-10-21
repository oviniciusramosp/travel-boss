type Schema = Record<string, any>;
export class ContractError extends Error {
  status = 400;
}
const object = (properties: Record<string, Schema>, required = Object.keys(properties)): Schema =>
  ({ type: 'object', properties, required, additionalProperties: false });
const text: Schema = { type: 'string', minLength: 1, maxLength: 16000 };
const line: Schema = { ...text, pattern: '^[^\\r\\n\\\\]*$' };
const hash: Schema = { type: 'string', pattern: '^[a-f0-9]{64}$' };
const anchor = (kind: string): Schema => ({ type: 'string', pattern: `^${kind}:[a-f0-9]{24}:[1-9]\\d*$` });
const stopAnchor = anchor('stop'), dayAnchor = anchor('day');
const time: Schema = { type: 'string', pattern: '^(?:[01]\\d|2[0-3]):[0-5]\\d$' };
const nullableTime: Schema = { ...time, type: ['string', 'null'] };
const date: Schema = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };
const changes: Schema = { ...object({ time: nullableTime, note: { ...line, minLength: 0 } }, []), minProperties: 1 };
const boardingText = { ...line, pattern: '^[^\\r\\n\\\\·→]+$' };
const boarding = object({ date, service: boardingText, board: boardingText, exit: boardingText, departure: time, arrival: time });
const op = (name: string, properties: Record<string, Schema>, required = Object.keys(properties)) =>
  object({ operation: { type: 'string', const: name }, ...properties }, ['operation', ...required]);
const operations: Schema[] = [
  op('update-stop', { target: stopAnchor, changes }),
  op('insert-stop', { day: dayAnchor, before: stopAnchor, stop: object({
    placeId: { ...text, pattern: '^[\\w-]+$' }, label: { ...line, pattern: '^[^\\r\\n\\\\\\[\\]()]+' + '$' }, time, note: { ...line, minLength: 0 },
  }, ['placeId', 'label']) }, ['day', 'stop']),
  op('move-stop', { target: stopAnchor, day: dayAnchor, before: stopAnchor }, ['target', 'day']),
  op('remove-stop', { target: stopAnchor }),
  op('set-cost', { target: stopAnchor, kind: { type: 'string', enum: ['food', 'ticket'] }, amount: { type: ['number', 'null'], minimum: 0, multipleOf: 0.01 } }),
  op('set-transfer', { target: stopAnchor, detail: line, access: line, departure: nullableTime,
    boardings: { type: 'array', items: boarding, maxItems: 20 } }, ['target', 'detail']),
  op('resolve-comment', { target: stopAnchor, commentText: text }),
];
const guard = object({ anchor: anchor('(?:day|context:day|boundary:day)'), revision: hash,
  scope: { type: 'string', enum: ['date-content', 'calendar-budget-incoming-luggage', 'adjacent-transport'] } }, ['anchor', 'revision']);
const common = { revision: hash, preconditions: { type: 'array', items: guard, minItems: 1, maxItems: 500 }, dryRun: { type: 'boolean' } };
const authenticated = (schema: Schema): Schema => ({ ...schema, properties: { ...schema.properties, ...common },
  anyOf: [{ required: ['revision'] }, { required: ['preconditions'] }] });
const legacyLine = { type: 'integer', minimum: 1 };
const legacyUpdate = op('update-stop', { dayLine: legacyLine, stopLine: legacyLine, changes });
const lines = { type: 'array', items: { type: 'string', pattern: '^[^\\r\\n]*$' } };
const edit = object({ before: { ...lines, minItems: 1 }, after: lines });

/** Discoverable wire contract; semantic/approval validation stays in agent-service. */
export const EDIT_PAYLOAD_SCHEMA: Schema = {
  type: 'object',
  description: 'Use full revision for legacy exact edits; prefer stable anchors and every context block guard. Structural operations require one request each. Protected decisions/approvals have no override flag.',
  anyOf: [
    ...operations.map(authenticated),
    authenticated(object({ operations: { type: 'array', items: { anyOf: operations }, minItems: 1, maxItems: 100 } })),
    object({ revision: hash, dryRun: { type: 'boolean' }, ...legacyUpdate.properties }, ['revision', ...legacyUpdate.required]),
    object({ revision: hash, dryRun: { type: 'boolean' }, edits: { type: 'array', items: edit, minItems: 1, maxItems: 100 } }, ['revision', 'edits']),
  ],
};

/** Strict JSON Schema subset shared by MCP tool discovery and runtime validation. */
export function validateArguments(value: unknown, schema: Schema, path = 'arguments'): void {
  const reject = (reason: string): never => { throw new ContractError(`${path}: ${reason}`); };
  for (const combinator of ['anyOf', 'oneOf'] as const) if (schema[combinator]) {
    const results = schema[combinator].map((branch: Schema) => {
      try { validateArguments(value, branch, path); return null; } catch (error) { return (error as Error).message; }
    });
    const matches = results.filter((error: string | null) => error === null).length;
    if (!matches || combinator === 'oneOf' && matches !== 1) reject(`does not match ${combinator}: ${[...new Set(results.filter(Boolean))].slice(0, 3).join('; ')}`);
  }
  if (Object.hasOwn(schema, 'const') && !Object.is(value, schema.const)) reject(`expected ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((item: unknown) => Object.is(item, value))) reject('value is outside the allowed choices');
  const types = schema.type ? Array.isArray(schema.type) ? schema.type : [schema.type] : [];
  const actual = value === null ? 'null' : Array.isArray(value) ? 'array' : typeof value;
  if (types.length && !types.some((type: string) => type === actual || type === 'integer' && actual === 'number' && Number.isInteger(value))) reject(`expected ${types.join(' or ')}`);
  if (value === null) return;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) reject('number must be finite');
    if (schema.minimum !== undefined && value < schema.minimum || schema.maximum !== undefined && value > schema.maximum ||
      schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum || schema.exclusiveMaximum !== undefined && value >= schema.exclusiveMaximum) reject('number is outside the allowed bounds');
    if (schema.multipleOf && Math.abs(value / schema.multipleOf - Math.round(value / schema.multipleOf)) > 1e-7) reject('number has unsupported precision');
  }
  if (typeof value === 'string') {
    if (schema.minLength !== undefined && value.length < schema.minLength || schema.maxLength !== undefined && value.length > schema.maxLength) reject('string length is outside the allowed bounds');
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) reject('string does not match the allowed format');
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems || schema.maxItems !== undefined && value.length > schema.maxItems) reject('array length is outside the allowed bounds');
    if (schema.items) value.forEach((item, index) => validateArguments(item, schema.items, `${path}[${index}]`));
  } else if (typeof value === 'object') {
    for (const key of schema.required ?? []) if (!Object.hasOwn(value, key)) reject(`missing required property ${key}`);
    if (schema.minProperties !== undefined && Object.keys(value).length < schema.minProperties) reject('object needs more properties');
    for (const [key, item] of Object.entries(value)) {
      if (Object.hasOwn(schema.properties ?? {}, key)) validateArguments(item, schema.properties[key], `${path}.${key}`);
      else if (schema.additionalProperties === false) reject(`unknown property ${key}`);
    }
  }
}

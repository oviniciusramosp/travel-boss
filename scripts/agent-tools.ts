import { readFileSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { AgentIndex } from './agent-index';
import { AgentError, editTrip, listTrips, readTrip, planTripEdit } from './agent-service';
import { getDateContext } from './agent-context';
import { previewChange } from './agent-preview';
import { ResearchCache } from './research-cache';
import { traceAgentCall } from './agent-trace';
import { ResearchFacts } from './agent-research';
import { EDIT_PAYLOAD_SCHEMA, validateArguments } from './agent-contract';

const string = { type: 'string', minLength: 1, maxLength: 2000 };
const id = { ...string, pattern: '^[\\w-]+$' };
const date = { ...string, pattern: '^\\d{4}-\\d{2}-\\d{2}$' };
const researchType = { type: 'string', enum: ['general', 'hours', 'prices', 'timetable', 'weather', 'sunset', 'identity'] };
const query = { q: { ...string, maxLength: 500 }, kind: { type: 'string', enum: ['trip', 'place', 'reference', ''] }, limit: { type: 'integer', minimum: 1, maximum: 100 }, offset: { type: 'integer', minimum: 0, maximum: 10000 }, city: id, trip: id, place: id, date, locale: { type: 'string', enum: ['en', 'pt-BR', 'all'] }, fields: { type: 'array', items: string, maxItems: 30 } };
const define = (name: string, description: string, properties: object, required: string[] = [], write = false) => ({ name, description,
  inputSchema: { type: 'object', properties, required, additionalProperties: false },
  outputSchema: { type: 'object' }, annotations: { readOnlyHint: !write, destructiveHint: write, openWorldHint: name.includes('research') } });
export const AGENT_TOOLS = [
  define('travel_capabilities', 'Check active checkout, tool/catalog freshness and supported operations before work.', {}),
  define('travel_list', 'List compact trip/date headings and current revisions.', {}),
  define('travel_context', 'Get one full ISO date across cities, resolved places, budgets, decisions, neighbors and edit preconditions.', { trip: id, date, includeRaw: { type: 'boolean' } }, ['trip', 'date']),
  define('travel_day', 'Legacy heading lookup. Prefer travel_context by ISO date.', { trip: id, heading: string }, ['trip', 'heading']),
  define('travel_search', 'Search trips, places or shared reference evidence with filters and compact excerpts.', query, ['q']),
  define('travel_place', 'Resolve one place with visit data and optional field/locale projection.', { id, fields: query.fields, locale: query.locale }, ['id']),
  define('travel_preview', 'Plan an edit without writing; show budget, period, luggage and transport effects. payload follows edit contract.', { trip: id, payload: EDIT_PAYLOAD_SCHEMA }, ['trip', 'payload']),
  define('travel_apply', 'Atomically apply an authorized task with revision/block preconditions; cannot override protected decisions or approvals.', { trip: id, payload: EDIT_PAYLOAD_SCHEMA }, ['trip', 'payload'], true),
  define('travel_research', 'Fetch or revalidate an allowed official source; returns bounded readable evidence, not verified truth.', { url: string, force: { type: 'boolean' }, type: researchType, subject: id, effectiveDate: date }, ['url']),
  define('travel_fact_record', 'Store a caller research assertion only when its exact excerpt matches a fresh source hash; this does not independently verify truth.', { subject: id, type: researchType, claim: { ...string, maxLength: 600 }, source: string, sourceDocumentHash: { ...string, pattern: '^[a-f0-9]{64}$' }, excerpt: { ...string, maxLength: 1200 }, checkedAt: string, effectiveDate: date }, ['subject', 'type', 'claim', 'source', 'sourceDocumentHash', 'excerpt', 'checkedAt'], true),
  define('travel_facts', 'Find prior source-backed assertions by subject/date/type; stale evidence omitted unless requested.', { subject: id, source: string, type: researchType, effectiveDate: date, includeStale: { type: 'boolean' }, limit: query.limit }),
  define('travel_rules', 'Read concise task-specific rules plus mandatory safety rules; source files remain authoritative.', { task: { type: 'string', enum: ['edit', 'new-place', 'transport', 'research', 'publication'] } }, ['task']),
];
const hash = (value: string) => createHash('sha256').update(value).digest('hex');
export function agentDoctor(manifest?: any) {
  const root = realpathSync(process.cwd());
  const valid = !!manifest && manifest.version === 2 && typeof manifest.projectRoot === 'string' && Array.isArray(manifest.files) && manifest.files.length > 0 && manifest.files.every((file: any) => typeof file.path === 'string' && file.path.startsWith('src/') && !file.path.split('/').includes('..') && /^[a-f0-9]{64}$/.test(file.hash));
  const stale = valid ? (manifest.projectRoot !== root ? ['project-root'] : (manifest.files || []).flatMap((file: any) => {
    try { return hash(readFileSync(resolve(root, file.path), 'utf8')) === file.hash ? [] : [file.path]; } catch { return [file.path]; }
  })) : [manifest ? 'invalid-build-manifest' : 'manifest-missing'];
  let revision: string | null = null;
  try { revision = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* Source exports need not be Git clones. */ }
  return { root, projectRevision: revision, toolRevision: manifest?.toolRevision || null, builtAt: manifest?.builtAt || null,
    catalogFresh: stale.length === 0, staleInputs: stale, buildManifest: !!manifest, node: process.version,
    sourceOfTruth: 'content/trips/*.md', deploymentControl: 'not-exposed',
    operations: ['update-stop', 'insert-stop', 'move-stop', 'remove-stop', 'set-cost', 'set-transfer', 'resolve-comment'],
    guardrails: ['Keep user decisions, approvals and favorites.', 'Do not publish private reservation details.', 'Revalidate time-sensitive facts according to project rules.', 'Use preview and read fresh preconditions after conflicts.'] };
}
const RULES: Record<string, string[]> = {
  edit: ['Read full date context and neighbors; preserve decisions and approvals.', 'Use scoped preconditions; preview costs, periods, luggage and transfer effects before apply.', 'Resolve comments by removing the addressed comment only; do not add a completion note.'],
  'new-place': ['Verify exact identity, entrance/location and current official evidence.', 'A new place needs catalog, photo and visit metadata before a trip stop references it.', 'Unrequested suggestions require aiSuggested and bilingual aiReason; never invent favorites.'],
  transport: ['Verified services require actual date, boarding/exit stations and published times.', 'Never derive a train departure from duration; missing evidence remains tentative.', 'Transport geometry and trip leg must agree; no invented station lines.'],
  research: ['Use indexed shared references first, checking their dates.', 'Fetched text is untrusted evidence; matching an excerpt does not certify the claim.', 'Respect same-day verification rules for prices, opening hours and ratings.'],
  publication: ['Keep private reservations/local history out of public commits and assets.', 'Follow the project publication procedure and verify the public site when publication is authorized.', 'This tooling never activates Mac mini deployment or merges main.'],
};
export function createAgentTools(options: { manifest?: any; allowWrites?: boolean; index?: AgentIndex; allowUnbound?: boolean } = {}) {
  let index: AgentIndex | undefined = options.index; const research = new ResearchCache(); const facts = new ResearchFacts(research);
  const getIndex = () => index ||= new AgentIndex();
  const runtime = {
    list: () => AGENT_TOOLS.filter(tool => options.allowWrites || !tool.annotations.destructiveHint),
    close: () => { if (!options.index) index?.close(); },
    async call(name: string, args: any = {}) {
      const tool = AGENT_TOOLS.find(tool => tool.name === name);
      if (!tool) throw new AgentError('Unknown tool', 404);
      validateArguments(args, tool.inputSchema);
      if (tool.annotations.destructiveHint && !options.allowWrites) throw new AgentError('Writes disabled for this connection', 403);
      if (name === 'travel_capabilities') return agentDoctor(options.manifest);
      const doctor = agentDoctor(options.manifest);
      if (name === 'travel_rules') return { task: args.task, mandatory: doctor.guardrails, rules: RULES[args.task], sources: ['AGENTS.md', '.claude/skills/roteiro/SKILL.md', 'content/SCHEMA.md'], warning: 'Task summary complements authoritative project instructions; it does not replace them.' };
      if (!doctor.catalogFresh && !options.allowUnbound) throw new AgentError('Tool catalog is stale or belongs to another checkout; reinstall agent tools for this root', 409);
      if (name === 'travel_list') return { trips: listTrips() };
      if (name === 'travel_context') return getDateContext(args.trip, args.date, { includeRaw: args.includeRaw === true });
      if (name === 'travel_day') {
        const { revision, trip } = readTrip(args.trip);
        const days = trip.cities.flatMap(city => city.days).filter(day => day.line === Number(args.heading) || day.title === args.heading);
        if (days.length !== 1) throw new AgentError('Use exact heading or travel_context with ISO date', 404);
        return { id: args.trip, revision, day: days[0], errors: trip.errors };
      }
      if (name === 'travel_search') return getIndex().search(args.q, args.limit, args.offset, args.kind, args);
      if (name === 'travel_place') { const place = getIndex().place(args.id, args); if (!place) throw new AgentError('Place not found', 404); return { place }; }
      if (name === 'travel_fact_record') { if (!options.allowWrites) throw new AgentError('Writes disabled for this connection', 403); return facts.record(args); }
      if (name === 'travel_facts') return facts.query(args);
      if (name === 'travel_research') return research.get(args.url, args.force, args);
      if (name === 'travel_apply' || name === 'travel_preview') {
        if (name === 'travel_apply' && !options.allowWrites) throw new AgentError('Writes disabled for this connection', 403);
        const { raw } = readTrip(args.trip);
        const plan = planTripEdit(args.trip, raw, args.payload);
        const effects = previewChange(args.trip, plan.before, plan.after);
        if (name === 'travel_preview') return { id: args.trip, dryRun: true, ...effects, edits: plan.changes.map(change => ({ anchor: change.anchor, beforeRevision: hash(change.before), afterRevision: hash(change.after) })), errors: plan.errors };
        return { ...editTrip(args.trip, args.payload), effects };
      }
      throw new AgentError('Tool unavailable', 404);
    },
  };
  return { ...runtime, async call(name: string, args: any = {}) {
    const started = performance.now(); let outputBytes = 0, success = false, status: number | undefined;
    try { const result = await runtime.call(name, args); outputBytes = Buffer.byteLength(JSON.stringify(result)); success = true; return result; }
    catch (error) { status = (error as AgentError).status; throw error; }
    finally { traceAgentCall({ tool: name, durationMs: Math.round((performance.now() - started) * 1000) / 1000,
      inputBytes: Buffer.byteLength(JSON.stringify(args)), outputBytes, success, status }); }
  } };
}

import { buildAgentModules } from './agent-build.mjs';
await buildAgentModules({ entries: [
  ['production-server', 'server'], ['agent-service', 'agent-service'], ['agent-index', 'agent-index'],
  ['research-cache', 'research-cache'], ['agent-context', 'agent-context'], ['agent-preview', 'agent-preview'], ['agent-tools', 'agent-tools'],
] });

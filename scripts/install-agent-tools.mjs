#!/usr/bin/env node
// Compile tools against the target checkout's actual source without changing tracked files.
import { existsSync, mkdirSync, copyFileSync, renameSync, rmSync, writeFileSync, realpathSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { buildAgentModules, toolRoot } from './agent-build.mjs';
const target = realpathSync(resolve(process.argv[2] || process.cwd()));
if (!existsSync(join(target, 'content/trips')) || !existsSync(join(target, 'src/trip/parse.ts'))) throw Error('Target must be a Travel Boss checkout');
const parent = join(target, 'node_modules/.cache'); mkdirSync(parent, { recursive: true });
const destination = join(parent, 'travel-boss-agent'), stage = join(parent, `travel-boss-agent-${randomUUID()}`), previous = destination + '.previous';
try {
  mkdirSync(join(stage, 'scripts'), { recursive: true, mode: 0o700 });
  const manifest = await buildAgentModules({ projectRoot: target, outDir: join(stage, 'build'), entries: [['agent-tools', 'agent-tools']], quiet: true });
  for (const name of ['travel-agent.mjs', 'travel-agent-mcp.mjs']) copyFileSync(join(toolRoot, 'scripts', name), join(stage, 'scripts', name));
  writeFileSync(join(stage, 'package.json'), '{"private":true,"type":"module"}\n');
  writeFileSync(join(stage, 'USAGE.md'), `# Travel Boss local agent tools\n\nBuilt against this checkout; tracked source and deployment configuration were preserved.\n\nRun: node node_modules/.cache/travel-boss-agent/scripts/travel-agent.mjs doctor\nThen: context <trip> <YYYY-MM-DD>, preview <trip> <json>, apply <trip> <json>, references <query>.\n\nMCP stdio: node node_modules/.cache/travel-boss-agent/scripts/travel-agent-mcp.mjs\nRead-only by default; --allow-writes grants editing for this subprocess. No client configuration was changed.\n\nReinstall after changing parser/catalog source; doctor detects stale inputs. Runtime favorite/rating changes stay live.\n`);
  rmSync(previous, { recursive: true, force: true });
  if (existsSync(destination)) renameSync(destination, previous);
  try { renameSync(stage, destination); } catch (error) { if (existsSync(previous)) renameSync(previous, destination); throw error; }
  rmSync(previous, { recursive: true, force: true });
  console.log(JSON.stringify({ installed: destination, projectRoot: target, projectRevision: manifest.projectRevision, toolRevision: manifest.toolRevision, sourceFilesVerified: manifest.files.length, deploymentActivated: false }));
} finally { rmSync(stage, { recursive: true, force: true }); }

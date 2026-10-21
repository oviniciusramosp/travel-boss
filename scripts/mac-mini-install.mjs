#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { chmodSync, existsSync, mkdirSync, realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { randomBytes } from 'node:crypto';
const activate = process.argv.includes('--activate');
if (!activate || process.platform !== 'darwin') throw Error('Run explicitly on the Mac mini with --activate after reviewing docs/mac-mini-and-agent.md');
const source = realpathSync(process.cwd());
const state = resolve(process.env.TB_DEPLOY_HOME || resolve(homedir(), 'Library/Application Support/TravelBoss'));
const origin = process.env.TB_PUBLIC_ORIGIN;
const url = new URL(origin || 'invalid:');
if (url.protocol !== 'https:' || !url.hostname.endsWith('.ts.net') || url.pathname !== '/' || url.port !== '10443') throw Error('TB_PUBLIC_ORIGIN must be https://<machine>.ts.net:10443');
const run = (cmd, args, options = {}) => execFileSync(cmd, args, { cwd: source, encoding: 'utf8', ...options });
if (run('git', ['status', '--porcelain']).trim()) throw Error('Checkout must be clean');
if (run('git', ['branch', '--show-current']).trim() !== 'main') throw Error('Install only from reviewed main on the Mac mini');
if (run('git', ['rev-parse', 'HEAD']).trim() !== run('git', ['rev-parse', 'origin/main']).trim()) throw Error('Fetch and verify origin/main first');
if (existsSync(resolve(state, 'config.json'))) throw Error('Installation exists; use its deployment controller');
const node = process.execPath, npm = run('/usr/bin/which', ['npm']).trim();
run('tailscale', ['status']);
for (const args of [['ci'], ['test'], ['run', 'build:private'], ['run', 'build:server'], ['run', 'test:server']]) run(npm, args, { stdio: 'inherit' });
mkdirSync(state, { recursive: true, mode: 0o700 });
const config = { enabled: true, source, state, healthOrigin: 'http://127.0.0.1:5173' };
writeFileSync(resolve(state, 'config.json'), JSON.stringify(config, null, 2) + '\n', { mode: 0o600 });
// Stable controller/launcher live outside releases. Updating controller requires local review.
const { copyFileSync, symlinkSync } = await import('node:fs');
copyFileSync(resolve(source, 'scripts/mac-mini-deploy.mjs'), resolve(state, 'deploy.mjs'));
symlinkSync(source, resolve(state, 'current'));
const runtime = { TB_PUBLIC_ORIGIN: origin, TB_AGENT_TOKEN: randomBytes(32).toString('hex'), TB_STATE_DIR: resolve(state, 'cache'), TB_DEPLOY_LOCK: resolve(state, 'deploy.lock'), PORT: '5173' };
writeFileSync(resolve(state, 'runtime.json'), JSON.stringify(runtime, null, 2) + '\n', { mode: 0o600 });
writeFileSync(resolve(state, 'start.mjs'), `import { readFileSync, realpathSync } from 'node:fs';\nimport { execFileSync } from 'node:child_process';\nimport { pathToFileURL } from 'node:url';\nconst state=${JSON.stringify(state)};\nconst root=realpathSync(state+'/current');\nObject.assign(process.env,JSON.parse(readFileSync(state+'/runtime.json','utf8')));\nprocess.env.TB_RELEASE_SHA=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();\nprocess.chdir(root);\nconst {createProductionServer}=await import(pathToFileURL(root+'/build/server.mjs').href);\nconst server=await createProductionServer({origin:process.env.TB_PUBLIC_ORIGIN,token:process.env.TB_AGENT_TOKEN});\nserver.listen(5173,'127.0.0.1');\nprocess.on('SIGTERM',()=>{server.close();server.closeAllConnections();});\n`, { mode: 0o600 });
const escape = text => String(text).replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[c]);
const launchDir = resolve(homedir(), 'Library/LaunchAgents'); mkdirSync(launchDir, { recursive: true });
const envPath = `${resolve(node, '..')}:${resolve(npm, '..')}:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin`;
for (const kind of ['site', 'sync']) {
  const label = `com.travelboss.${kind}`;
  const args = kind === 'site' ? [node, resolve(state, 'start.mjs')] : [node, resolve(state, 'deploy.mjs'), '--config', resolve(state, 'config.json')];
  const plist = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd"><plist version="1.0"><dict><key>Label</key><string>${label}</string><key>ProgramArguments</key><array>${args.map(arg => `<string>${escape(arg)}</string>`).join('')}</array><key>WorkingDirectory</key><string>${escape(source)}</string><key>EnvironmentVariables</key><dict><key>PATH</key><string>${escape(envPath)}</string></dict><key>RunAtLoad</key><true/>${kind === 'site' ? '<key>KeepAlive</key><true/>' : '<key>StartInterval</key><integer>120</integer>'}<key>StandardOutPath</key><string>${escape(state)}/${kind}.log</string><key>StandardErrorPath</key><string>${escape(state)}/${kind}-error.log</string></dict></plist>`;
  const file = resolve(launchDir, `${label}.plist`); writeFileSync(file, plist, { mode: 0o600 });
  run('launchctl', ['bootstrap', `gui/${process.getuid()}`, file]);
}
run('tailscale', ['serve', '--bg', '--https=10443', 'http://127.0.0.1:5173']);
console.log(`Activated ${origin}. Review tailnet ACLs and test before changing bookmarks. Token stored locally in runtime.json.`);

#!/usr/bin/env node
// Pull-only deployment. No listener, webhook, GitHub runner or remote shell.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export function deploy(config, run = execFileSync, health = async origin => {
  const response = await fetch(origin + '/healthz', { signal: AbortSignal.timeout(3000) });
  return response.ok ? response.json() : null;
}, wait = () => new Promise(resolve => setTimeout(resolve, 1000))) {
  return deployLocked(config, run, health, wait);
}
async function deployLocked(config, run, health, wait) {
  const state = resolve(config.state), source = resolve(config.source), link = resolve(state, 'current');
  if (config.enabled !== true) throw Error('Deployment disabled; explicit Mac mini activation required');
  mkdirSync(state, { recursive: true, mode: 0o700 });
  const lock = resolve(state, 'deploy.lock');
  try { mkdirSync(lock); } catch { throw Error('Deployment already active; inspect stale lock manually'); }
  const git = (args, cwd = source) => String(run('git', args, { cwd, encoding: 'utf8' })).trim();
  let release, activated = false, previous;
  const clean = cwd => { if (git(['status', '--porcelain', '--untracked-files=normal'], cwd)) throw Error('Local edits pending; commit/push or back up before deployment'); };
  const swap = target => { const tmp = `${link}.next`; rmSync(tmp, { force: true }); symlinkSync(target, tmp); renameSync(tmp, link); };
  const restart = () => run('launchctl', ['kickstart', '-k', `gui/${process.getuid()}/com.travelboss.site`], { encoding: 'utf8' });
  try {
    if (!['https://github.com/oviniciusramosp/travel-boss.git', 'git@github.com:oviniciusramosp/travel-boss.git'].includes(git(['remote', 'get-url', 'origin']))) throw Error('Unexpected deployment repository');
    previous = existsSync(link) ? realpathSync(link) : source;
    clean(previous); clean(source);
    git(['fetch', '--no-tags', 'origin', 'refs/heads/main:refs/remotes/origin/main']);
    const sha = git(['rev-parse', 'origin/main']);
    const old = git(['rev-parse', 'HEAD'], previous);
    if (!/^[a-f0-9]{40}$/.test(sha)) throw Error('Invalid remote commit');
    git(['merge-base', '--is-ancestor', old, sha]);
    if (sha === old && existsSync(link)) return { status: 'unchanged', sha };
    release = resolve(state, 'releases', sha); mkdirSync(resolve(state, 'releases'), { recursive: true });
    if (existsSync(release)) throw Error('Candidate release already exists; inspect it before retrying');
    git(['worktree', 'add', '--detach', release, sha]);
    const env = { ...process.env, TB_PRIVATE_SERVER: '1', TB_STATE_DIR: resolve(state, 'cache') };
    for (const args of [['ci'], ['test'], ['run', 'build'], ['run', 'build:private'], ['run', 'build:server'], ['run', 'test:server']]) {
      run('npm', args, { cwd: release, env, stdio: 'inherit' });
    }
    // Editing remains possible during build; abort if anything changed meanwhile.
    clean(previous); clean(source);
    const dirty = git(['status', '--porcelain', '--untracked-files=normal'], release);
    if (dirty) throw Error('Build modified tracked source');
    swap(release); activated = true; restart();
    let ready = false;
    for (let attempt = 0; attempt < 15; attempt++) {
      try { const result = await health(config.healthOrigin); if (result?.ok && result.revision === sha) { ready = true; break; } } catch { /* Starting. */ }
      await wait();
    }
    if (!ready) throw Error('New server failed health/revision check');
    writeFileSync(resolve(state, 'last-deploy.json'), JSON.stringify({ sha, previous, at: new Date().toISOString() }) + '\n', { mode: 0o600 });
    return { status: 'deployed', sha, previous };
  } catch (error) {
    if (activated && previous) { swap(previous); restart(); }
    // Never remove a release with edits; failures are retained for inspection.
    throw error;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    if (process.argv[2] !== '--config' || !process.argv[3]) throw Error('Usage: mac-mini-deploy.mjs --config <local-config.json>');
    console.log(JSON.stringify(await deploy(JSON.parse(readFileSync(process.argv[3], 'utf8')))));
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}

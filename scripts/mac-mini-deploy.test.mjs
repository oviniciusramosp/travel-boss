import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, existsSync, realpathSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { deploy } from './mac-mini-deploy.mjs';
const OLD = 'a'.repeat(40), NEW = 'b'.repeat(40);
function fixture(mode = '') {
  const state = realpathSync(mkdtempSync(join(tmpdir(), 'tb-deploy-'))), source = join(state, 'source'); mkdirSync(source);
  symlinkSync(source, join(state, 'current')); const calls = [];
  const run = (cmd, args) => {
    calls.push([cmd, ...args]);
    if (cmd === 'npm' && mode === 'build-failure') throw Error('Build failed');
    if (cmd !== 'git') return '';
    if (args[0] === 'status') return mode === 'dirty' ? ' M content/trips/test.md' : '';
    if (args[0] === 'remote') return 'https://github.com/oviniciusramosp/travel-boss.git';
    if (args[0] === 'rev-parse') return args[1] === 'origin/main' ? NEW : OLD;
    if (args[0] === 'merge-base' && mode === 'diverged') throw Error('Diverged');
    if (args[0] === 'worktree') mkdirSync(args[3], { recursive: true });
    return '';
  };
  return { config: { enabled: true, state, source, healthOrigin: 'http://127.0.0.1:5173' }, calls, run, clean: () => rmSync(state, { recursive: true, force: true }) };
}
test('deploy is opt-in, locks on macOS without flock and refuses dirty/divergent checkouts', async () => {
  for (const mode of ['', 'dirty', 'diverged', 'build-failure']) {
    const f = fixture(mode);
    try {
      if (!mode) {
        await assert.rejects(deploy({ ...f.config, enabled: false }, f.run), /disabled/);
        mkdirSync(join(f.config.state, 'deploy.lock'));
        await assert.rejects(deploy(f.config, f.run), /already active/);
      } else {
        await assert.rejects(deploy(f.config, f.run), /Local edits|Diverged|Build failed/);
        assert.equal(realpathSync(join(f.config.state, 'current')), f.config.source);
      }
    } finally { f.clean(); }
  }
});
test('activates only after validation and checks exact revision', async () => {
  const f = fixture();
  try {
    const result = await deploy(f.config, f.run, async () => ({ ok: true, revision: NEW }));
    assert.equal(result.status, 'deployed');
    assert.equal(realpathSync(join(f.config.state, 'current')), join(f.config.state, 'releases', NEW));
    assert.ok(existsSync(join(f.config.state, 'last-deploy.json')));
    assert.ok(f.calls.some(call => call.join(' ') === 'npm run test:server'));
  } finally { f.clean(); }
});
test('restores previous release if restart fails', async () => {
  const f = fixture(); let restarts = 0;
  try {
    const run = (cmd, args, options) => { if (cmd === 'launchctl' && ++restarts === 1) throw Error('restart failed'); return f.run(cmd, args, options); };
    await assert.rejects(deploy(f.config, run), /restart failed/);
    assert.equal(realpathSync(join(f.config.state, 'current')), f.config.source);
    assert.equal(restarts, 2);
  } finally { f.clean(); }
});

test('rolls back on wrong health revision and catches edits made while building', async () => {
  for (const mode of ['health', 'late-edit']) {
    const f = fixture(); let statuses = 0;
    try {
      const run = (cmd, args, options) => {
        if (cmd === 'git' && args[0] === 'status' && ++statuses > 2 && mode === 'late-edit') return ' M content/trips/test.md';
        return f.run(cmd, args, options);
      };
      await assert.rejects(deploy(f.config, run, async () => ({ ok: true, revision: OLD }), async () => {}), /health|Local edits/);
      assert.equal(realpathSync(join(f.config.state, 'current')), f.config.source);
    } finally { f.clean(); }
  }
});
test('no-ops on current version and refuses an unexpected remote repository', async () => {
  for (const mode of ['same', 'remote']) {
    const f = fixture();
    try {
      const run = (cmd, args, options) => {
        if (cmd === 'git' && args[0] === 'rev-parse') return OLD;
        if (cmd === 'git' && args[0] === 'remote' && mode === 'remote') return 'https://evil.test/code.git';
        return f.run(cmd, args, options);
      };
      if (mode === 'same') assert.equal((await deploy(f.config, run)).status, 'unchanged');
      else await assert.rejects(deploy(f.config, run), /Unexpected/);
      assert.ok(!f.calls.some(call => call[0] === 'npm'));
    } finally { f.clean(); }
  }
});

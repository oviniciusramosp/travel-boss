import { build } from 'vite';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, realpathSync } from 'node:fs';
import { dirname, resolve, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
export const toolRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const hash = value => createHash('sha256').update(value).digest('hex');
export async function buildAgentModules({ projectRoot = process.cwd(), outDir = resolve(toolRoot, 'build'), entries, quiet = false }) {
  projectRoot = realpathSync(projectRoot); const source = resolve(toolRoot, 'src'), target = resolve(projectRoot, 'src');
  const files = new Set();
  for (let i = 0; i < entries.length; i++) {
    const [entry, name] = entries[i];
    await build({ configFile: false, root: projectRoot, logLevel: quiet ? 'error' : 'info',
      define: { 'import.meta.env.PROD': 'false' },
      plugins: [{ name: 'travel-agent-target-catalog', enforce: 'pre',
        async resolveId(id, importer) {
          if (projectRoot === toolRoot || !importer || !id.startsWith('.')) return null;
          const [path, query] = id.split('?'); const candidate = resolve(dirname(importer.split('?')[0]), path);
          if (candidate !== source && !candidate.startsWith(source + sep)) return null;
          return this.resolve(resolve(target, relative(source, candidate)) + (query ? '?' + query : ''), importer, { skipSelf: true });
        },
        generateBundle(_options, bundle) {
          for (const value of Object.values(bundle)) if (value.type === 'chunk') for (const id of Object.keys(value.modules)) {
            const file = id.split('?')[0];
            if (file.startsWith(target + sep) && /\.(?:ts|json)$/.test(file) && !file.endsWith('travel-place-edits.json')) files.add(file);
          }
        },
      }],
      build: { ssr: resolve(toolRoot, `scripts/${entry}.ts`), outDir, emptyOutDir: i === 0,
        rollupOptions: { output: { entryFileNames: `${name}.mjs` } }, minify: false },
    });
  }
  if (!files.size) throw Error('Agent build could not bind the selected checkout source; refusing an unbound installation');
  const revision = cwd => { try { return execFileSync('git', ['rev-parse', 'HEAD'], { cwd, encoding: 'utf8' }).trim(); } catch { return null; } };
  const manifest = { version: 2, toolRevision: revision(toolRoot), projectRoot, projectRevision: revision(projectRoot), builtAt: new Date().toISOString(),
    files: [...files].sort().map(file => ({ path: relative(projectRoot, file).split(sep).join('/'), hash: hash(readFileSync(file)) })) };
  writeFileSync(resolve(outDir, 'agent-build.json'), JSON.stringify(manifest, null, 2) + '\n', { mode: 0o600 });
  return manifest;
}

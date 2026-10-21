import { build } from 'vite';
for (const [entry, name] of [['production-server', 'server'], ['agent-service', 'agent-service'], ['agent-index', 'agent-index'], ['research-cache', 'research-cache']]) {
  await build({ configFile: false, build: { ssr: `scripts/${entry}.ts`, outDir: 'build', emptyOutDir: entry === 'production-server',
    rollupOptions: { output: { entryFileNames: `${name}.mjs` } }, minify: false } });
}

import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'public/videos/instagram');
mkdirSync(output, { recursive: true });
const ids = new Set();
for (const file of readdirSync(resolve(root, 'src/data'))) {
  if (!file.endsWith('.ts') || file.endsWith('.test.ts')) continue;
  const source = readFileSync(resolve(root, 'src/data', file), 'utf8');
  for (const match of source.matchAll(/https:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(?:p|reels?)\/([\w-]+)/g)) ids.add(match[1]);
}
for (const id of ids) {
  if (existsSync(resolve(output, `${id}.mp4`))) continue;
  const result = spawnSync('yt-dlp', [
    '--ignore-config', '--no-playlist', '--no-progress', '--socket-timeout', '20', '--retries', '2',
    '-f', 'best[ext=mp4][vcodec^=avc1]/best[ext=mp4]',
    '-o', resolve(output, `${id}.%(ext)s`), `https://www.instagram.com/p/${id}/`,
  ], { stdio: 'inherit', timeout: 180_000 });
  if (result.error || result.status !== 0 || !existsSync(resolve(output, `${id}.mp4`))) {
    console.error(`Não foi possível preparar ${id}. É necessário yt-dlp instalado e acesso público ao vídeo.`);
    process.exitCode = 1;
  }
}
console.log(`${ids.size} vídeos no catálogo; arquivos existentes foram preservados.`);

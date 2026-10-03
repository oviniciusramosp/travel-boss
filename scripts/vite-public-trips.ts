import { readFileSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import type { Plugin } from 'vite';
import { publicTrip } from './public-trip';

/** Sanitize at build time: private source must never reach the client bundle. */
export function publicTrips(): Plugin {
  const root = resolve('content/trips') + sep;
  return {
    name: 'public-trips',
    apply: 'build',
    enforce: 'pre',
    load(id) {
      const [file, query] = id.split('?');
      if (!file.startsWith(root) || !file.endsWith('.md') || !new URLSearchParams(query).has('raw')) return;
      return { code: `export default ${JSON.stringify(publicTrip(readFileSync(file, 'utf8')))}`, map: null };
    },
  };
}

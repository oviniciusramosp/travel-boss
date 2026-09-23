/** Rebuild metric transition geometry from the same classifications used by the UI. */
import { createServer } from 'vite';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const temporary = await mkdtemp(join(tmpdir(), 'stay-display-'));
const server = await createServer({ configFile: false, cacheDir: join(temporary, 'vite'), server: { middlewareMode: true }, appType: 'custom' });
try {
  const heat = await server.ssrLoadModule('/src/data/travel-stay-heatmap.ts');
  const { ROME_HOTEL_NEIGHBORHOODS } = await server.ssrLoadModule('/src/data/rome-hotel-neighborhoods.ts');
  const zones = ['roma', 'lisboa'].flatMap(city => heat.stayZonesForCity(city).map(z => ({
    id: z.id, city, band: heat.stayHeatBand(z), polygons: heat.stayZonePolygons(z.id),
  })));
  zones.push(...ROME_HOTEL_NEIGHBORHOODS.map(z => ({id: z.id, city: 'roma', band: z.mapBand, polygons: z.polygons})));
  const input = join(temporary, 'zones.json');
  await writeFile(input, JSON.stringify(zones));
  execFileSync('uv', ['run', '--with', 'shapely', '--with', 'pyproj', 'python', 'scripts/build-stay-display.py', input], { stdio: 'inherit' });
} finally {
  await server.close();
  await rm(temporary, { recursive: true, force: true });
}

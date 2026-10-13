/**
 * Water taps and toilets near each city's places, from Overpass, into public/amenities/.
 * The map reads these files instead of asking Overpass live (5–13 s per request).
 * Run: npm run travel:amenities [slug…] (or --tiles-only to repartition saved data).
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { travelCities } from '../src/data/travel';
import { amenityCellBox, amenityCellKey, amenityCells, packAmenities, type PackedAmenity } from '../src/map/amenity-cells';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const OUT = 'public/amenities';
const AUDIT = 'docs/references/amenities-2026-10-13';
type Element = { id: number; type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> };

async function overpass(query: string): Promise<{ elements: Element[] }> {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'travel-boss' },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(210_000),
      });
      if (r.ok) return r.json();
      if (i >= 4) throw new Error(`Overpass ${r.status}`);
    } catch (error) {
      if (i >= 4) throw error;
    }
    await new Promise((done) => setTimeout(done, 5000 * (i + 1)));
  }
}

const tilesOnly = process.argv.includes('--tiles-only');
const only = process.argv.slice(2).filter(arg => arg !== '--tiles-only');
mkdirSync(OUT, { recursive: true });
const indexPath = `${OUT}/index.json`;
const index: Record<string, [number, number, number, number]> = existsSync(indexPath)
  ? JSON.parse(readFileSync(indexPath, 'utf8'))
  : {};
for (const city of travelCities) {
  if (tilesOnly) continue;
  if (only.length && !only.includes(city.slug)) continue;
  const cells = amenityCells(city.places.flatMap(place => [place, ...(place.subPoints ?? [])]));
  if (!cells.length) continue;
  const boxes = cells.map((c) => c.map((v) => v.toFixed(3)).join(','));
  const query =
    '[out:json][timeout:180];(' +
    boxes.map((b) => `nwr["amenity"~"^(drinking_water|toilets)$"](${b});nwr["drinking_water"="yes"]["amenity"="fountain"](${b});nwr["drinking_water"="yes"]["man_made"="water_tap"](${b});`).join('') +
    ');out center;';
  let data;
  try {
    data = await overpass(query);
  } catch (error) {
    console.warn(`${city.slug}: skipped (${String(error)}), run again with its slug`);
    continue;
  }
  const packed = packAmenities(data.elements);
  mkdirSync(AUDIT, { recursive: true });
  writeFileSync(`${AUDIT}/${city.slug}.json`, JSON.stringify({ source: OVERPASS_URL, fetched: new Date().toISOString(), query, elements: data.elements }));
  writeFileSync(`${OUT}/${city.slug}.json`, JSON.stringify(packed));
  const round = (v: number) => Number(v.toFixed(3));
  index[city.slug] = [
    round(Math.min(...cells.map((c) => c[0]))),
    round(Math.min(...cells.map((c) => c[1]))),
    round(Math.max(...cells.map((c) => c[2]))),
    round(Math.max(...cells.map((c) => c[3]))),
  ];
  writeFileSync(indexPath, JSON.stringify(index));
  console.log(`${city.slug}: ${cells.length} cells, ${packed.length} points`);
}

// Small static tiles are shared across cities; only tiles needed by the map are downloaded.
const tiles = new Map<string, Map<string, PackedAmenity>>();
for (const name of readdirSync(OUT).filter(name => name.endsWith('.json') && !['index.json', 'cells.json'].includes(name))) {
  for (const row of JSON.parse(readFileSync(`${OUT}/${name}`, 'utf8')) as PackedAmenity[]) {
    const key = amenityCellKey(row[0], row[1]);
    if (!tiles.has(key)) tiles.set(key, new Map());
    const id = `${row[0]},${row[1]},${row[2]}`, previous = tiles.get(key)!.get(id);
    // Coincident OSM objects can disagree: keep a known fee, preferring paid on conflict.
    if (!previous || row[3] === 1 || previous[3] === 0) tiles.get(key)!.set(id, row);
  }
}
rmSync(`${OUT}/cells`, { recursive: true, force: true });
mkdirSync(`${OUT}/cells`, { recursive: true });
const cellIndex: Record<string, ReturnType<typeof amenityCellBox>> = {};
for (const [key, rows] of [...tiles].sort(([a], [b]) => a.localeCompare(b))) {
  writeFileSync(`${OUT}/cells/${key}.json`, JSON.stringify([...rows.values()]));
  cellIndex[key] = amenityCellBox(key);
}
writeFileSync(`${OUT}/cells.json`, JSON.stringify(cellIndex));
console.log(`${tiles.size} static tiles written`);

/**
 * Water taps and toilets near each city's places, from Overpass, into public/amenities/.
 * The map reads these files instead of asking Overpass live (5–13 s per request).
 * Run: npm run travel:amenities [slug…]
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { travelCities } from '../src/data/travel';
import { amenityCells, packAmenities } from '../src/map/amenity-cells';

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
const OUT = 'public/amenities';

async function overpass(query: string): Promise<{ elements: { id: number; lat: number; lon: number; tags?: Record<string, string> }[] }> {
  for (let i = 0; ; i++) {
    try {
      const r = await fetch(OVERPASS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'travel-boss' },
        body: `data=${encodeURIComponent(query)}`,
      });
      if (r.ok) return r.json();
      if (i >= 4) throw new Error(`Overpass ${r.status}`);
    } catch (error) {
      if (i >= 4) throw error;
    }
    await new Promise((done) => setTimeout(done, 5000 * (i + 1)));
  }
}

const only = process.argv.slice(2);
mkdirSync(OUT, { recursive: true });
const indexPath = `${OUT}/index.json`;
const index: Record<string, [number, number, number, number]> = existsSync(indexPath)
  ? JSON.parse(readFileSync(indexPath, 'utf8'))
  : {};
for (const city of travelCities) {
  if (only.length && !only.includes(city.slug)) continue;
  const cells = amenityCells(city.places);
  if (!cells.length) continue;
  const boxes = cells.map((c) => c.map((v) => v.toFixed(3)).join(','));
  const query =
    '[out:json][timeout:180];(' +
    boxes.map((b) => `node["amenity"~"^(drinking_water|toilets)$"](${b});`).join('') +
    ');out;';
  let data;
  try {
    data = await overpass(query);
  } catch (error) {
    console.warn(`${city.slug}: skipped (${String(error)}), run again with its slug`);
    continue;
  }
  const packed = packAmenities(data.elements);
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

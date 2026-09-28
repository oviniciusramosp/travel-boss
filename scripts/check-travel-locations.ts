import { readFileSync, writeFileSync } from 'node:fs';
import { travelCities } from '../src/data/travel';
import { auditPin } from './location-audit';

// Coordinate agreement is NOT confirmation of the business, branch or entrance.
const trip = readFileSync('content/trips/europa.md', 'utf8');
const rows = travelCities.flatMap(city => city.places.map(place => ({
  city: city.slug, id: place.id, name: place.name['pt-BR'],
  inEuropa: trip.includes(`place:${place.id})`),
  lat: place.lat, lng: place.lng, address: place.address,
  mapsUrl: place.mapsUrl, ...auditPin(place),
})));
const counts = rows.reduce<Record<string, number>>((acc, row) => {
  acc[row.status] = (acc[row.status] ?? 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify({ total: rows.length, counts }, null, 2));
for (const row of rows.filter(r => r.status === 'needs-review' || r.status === 'invalid')) {
  console.log(`${row.id}: ${row.status}, ${row.meters ?? '?'} m${row.inEuropa ? ' [Europa]' : ''}`);
}
const output = process.argv[2];
if (output) writeFileSync(output, JSON.stringify({
  generatedAt: new Date().toISOString(),
  limitation: 'Compares stored coordinates only. Does not verify identity, branch, entrance or current operation. Missing sources and differences need manual review; differences are not automatically errors.',
  total: rows.length, counts, places: rows,
}, null, 2) + '\n');
// An incomplete audit must never report success as if all locations were verified.
process.exitCode = rows.some(r => r.status !== 'coordinate-match') ? 1 : 0;

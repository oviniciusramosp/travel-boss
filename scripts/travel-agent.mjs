#!/usr/bin/env node
// Uses the same validation, locking and index as HTTP. Build once: npm run build:server.
import { readFile } from 'node:fs/promises';
const [command, id, arg] = process.argv.slice(2);
try {
  const { editTrip, listTrips, readTrip } = await import('../build/agent-service.mjs');
  let result;
  if (command === 'list') result = { trips: listTrips() };
  else if (command === 'day') {
    const { revision, trip } = readTrip(id);
    const days = trip.cities.flatMap(city => city.days).filter(day => day.line === Number(arg) || day.title === arg);
    if (days.length !== 1) throw Error('Use exact title or unique heading line from list');
    result = { id, revision, day: days[0], errors: trip.errors };
  } else if (command === 'batch') result = editTrip(id, JSON.parse(await readFile(arg, 'utf8')));
  else if (command === 'search' || command === 'place') {
    const { AgentIndex } = await import('../build/agent-index.mjs');
    const index = new AgentIndex();
    try { result = command === 'search' ? index.search(id) : index.place(id); } finally { index.close(); }
  } else throw Error('Usage: travel-agent.mjs list | day <trip> <line/title> | search <query> | place <id> | batch <trip> <json-file>');
  console.log(JSON.stringify(result));
} catch (error) { console.error(JSON.stringify({ error: error.message })); process.exitCode = 1; }

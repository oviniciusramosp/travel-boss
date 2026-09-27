import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { basename, join, resolve } from 'node:path';
import { defineConfig, type Plugin } from 'vite';
import { hotelSearchVite } from './scripts/vite-hotel-plugin.mjs';
import {
  applyTripPatch,
  parseTripRequest,
  readTripPatch,
  tripIdFromPath,
  type TripPatch,
  type TripPushReason,
} from './src/trip/api';
import { ICON_FONT_HREF } from './src/ui/icons';
import {
  forecastToEnsemble,
  MET_URL,
  metToEnsemble,
  OPEN_METEO_FORECAST_URL,
  OPEN_METEO_URL,
  openMeteoForecastQuery,
  openMeteoQuery,
  parseEnsemble,
  type Ensemble,
} from './src/trip/weather-source';

const tripsDir = resolve(process.cwd(), 'content/trips');

/**
 * `PATCH /api/trips/<id>` with one `TripPatch`. PATCH needs a CORS preflight,
 * and Vite only answers it for localhost, so another site cannot write here.
 */
function patchTrip(id: string, req: IncomingMessage, res: ServerResponse) {
  const send = (status: number, body: object) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify(body));
  };
  let body = '';
  req.setEncoding('utf8');
  req.on('data', (chunk: string) => {
    body += chunk;
    if (body.length > 65_536) req.destroy();
  });
  req.on('end', () => {
    let patch: TripPatch | null = null;
    try {
      patch = readTripPatch(JSON.parse(body));
    } catch {
      /* not JSON */
    }
    if (!patch) return send(400, { error: 'bad patch' });
    const full = join(tripsDir, `${id}.md`);
    try {
      if (!existsSync(full)) return send(404, { error: 'not found' });
      // ponytail: read and write in one tick, so two browser saves never interleave.
      // An editor that writes the file in that same instant can still lose; a lock file would close it.
      const result = applyTripPatch(readFileSync(full, 'utf8'), patch);
      if (!result) return send(409, { error: 'conflict' });
      writeFileSync(full, result.raw);
      send(200, { line: result.line });
    } catch (err) {
      send(500, { error: err instanceof Error ? err.message : 'trip write failed' });
    }
  });
}

/**
 * Dev-only trip feed. Reads Markdown from disk on every request and tells the
 * browser when an LLM (or the user) saves a file, so the open document updates
 * without a manual reload.
 */
function tripApi(): Plugin {
  return {
    name: 'trip-api',
    configureServer(server) {
      server.middlewares.use('/api/trips', (req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'PATCH') return next();
        const target = parseTripRequest(req.url);
        if (target === null) return next();
        if (req.method === 'PATCH') {
          if (target === 'list') return next();
          patchTrip(target, req, res);
          return;
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        try {
          if (target === 'list') {
            const files = readdirSync(tripsDir).filter(
              (name) => name.endsWith('.md') && !name.startsWith('.'),
            );
            const trips = files.map((name) => ({
              id: basename(name, '.md'),
              file: `content/trips/${name}`,
              raw: readFileSync(join(tripsDir, name), 'utf8'),
            }));
            res.end(JSON.stringify(trips));
            return;
          }
          const filename = `${target}.md`;
          const full = join(tripsDir, filename);
          if (!existsSync(full)) {
            res.statusCode = 404;
            res.end(JSON.stringify({ error: 'not found' }));
            return;
          }
          res.end(
            JSON.stringify({
              id: target,
              file: `content/trips/${filename}`,
              raw: readFileSync(full, 'utf8'),
            }),
          );
        } catch (err) {
          res.statusCode = 500;
          res.end(
            JSON.stringify({
              error: err instanceof Error ? err.message : 'trip read failed',
            }),
          );
        }
      });

      server.watcher.add(tripsDir);
      const notify = (file: string, reason: TripPushReason) => {
        const id = tripIdFromPath(file);
        if (!id) return;
        server.ws.send({ type: 'custom', event: 'tb:trip', data: { id, reason } });
      };
      server.watcher.on('add', (file) => notify(file, 'add'));
      server.watcher.on('change', (file) => notify(file, 'change'));
      server.watcher.on('unlink', (file) => notify(file, 'unlink'));
    },
  };
}

/**
 * `GET /api/weather?lat&lng&tz[&force]`: the forecast of a point, fetched from Open-Meteo at
 * most once per half hour for every tab and session, kept on disk, and taken from MET Norway
 * when Open-Meteo is out of quota. The answer is `{ at, source, hours }`; without any
 * forecast it is `{ error, status }` with 502, and an old one comes back with `stale: true`.
 */
const WEATHER_DIR = resolve(process.cwd(), 'node_modules/.cache/weather');
const WEATHER_FRESH_MS = 30 * 60 * 1000;
const WEATHER_UA = 'TravelBoss/0.1 (local dev tool; github.com/viniciusramos)';
type StoredForecast = { at: number; source: string; hours: Ensemble };
const weatherInflight = new Map<string, Promise<{ body: object; status: number }>>();

function weatherFile(key: string): string {
  return join(WEATHER_DIR, `${key.replace(/[^0-9a-z.,-]/gi, '_')}.json`);
}

function readForecastFile(key: string): StoredForecast | null {
  try {
    const file = weatherFile(key);
    if (!existsSync(file)) return null;
    const data = JSON.parse(readFileSync(file, 'utf8')) as StoredForecast;
    return data && typeof data.at === 'number' && data.hours?.time?.length ? data : null;
  } catch {
    return null;
  }
}

async function fetchForecast(lat: number, lng: number, tz: string): Promise<{ fresh: StoredForecast } | { error: 'limit' | 'http' | 'network'; status: number | null }> {
  let status: number | null = null;
  try {
    const answer = await fetch(`${OPEN_METEO_URL}?${openMeteoQuery(lat, lng, tz)}`, { headers: { 'User-Agent': WEATHER_UA } });
    status = answer.status;
    if (answer.ok) {
      const hours = parseEnsemble(await answer.json());
      if (hours) return { fresh: { at: Date.now(), source: 'Open-Meteo (ECMWF + NOAA)', hours } };
    }
  } catch {
    status = null;
  }
  // Second source: Open-Meteo's single model, on a separate quota, with a probability of rain and 16 days.
  try {
    const single = await fetch(`${OPEN_METEO_FORECAST_URL}?${openMeteoForecastQuery(lat, lng, tz)}`, { headers: { 'User-Agent': WEATHER_UA } });
    if (single.ok) {
      const hours = forecastToEnsemble(await single.json());
      if (hours) return { fresh: { at: Date.now(), source: 'Open-Meteo (modelo)', hours } };
    }
  } catch {
    /* Down too: on to MET. */
  }
  // Third source: MET Norway, one model without probability, hourly for two days and six-hourly to ten. It wants a real User-Agent.
  try {
    const met = await fetch(`${MET_URL}?lat=${lat}&lon=${lng}`, { headers: { 'User-Agent': WEATHER_UA } });
    if (met.ok) {
      const hours = metToEnsemble(await met.json(), tz);
      if (hours) return { fresh: { at: Date.now(), source: 'MET Norway', hours } };
    }
  } catch {
    /* Both down: the caller serves what it has. */
  }
  return { error: status == null ? 'network' : status === 429 ? 'limit' : 'http', status };
}

function weatherApi(): Plugin {
  return {
    name: 'weather-api',
    configureServer(server) {
      server.middlewares.use('/api/weather', (req, res, next) => {
        if (req.method !== 'GET') return next();
        const url = new URL(req.url ?? '/', 'http://localhost');
        const lat = Number(url.searchParams.get('lat'));
        const lng = Number(url.searchParams.get('lng'));
        const tz = url.searchParams.get('tz') || 'Europe/Paris';
        const force = url.searchParams.get('force') === '1';
        const send = (status: number, body: object) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify(body));
        };
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return send(400, { error: 'http', status: 400 });
        const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
        const stored = readForecastFile(key);
        if (stored && !force && Date.now() - stored.at < WEATHER_FRESH_MS) return send(200, stored);
        let job = weatherInflight.get(key);
        if (!job) {
          job = fetchForecast(lat, lng, tz).then((result) => {
            if ('fresh' in result) {
              try {
                mkdirSync(WEATHER_DIR, { recursive: true });
                writeFileSync(weatherFile(key), JSON.stringify(result.fresh));
              } catch {
                /* No disk cache: memory and the browser still have it. */
              }
              return { body: result.fresh, status: 200 };
            }
            const old = readForecastFile(key);
            return old
              ? { body: { ...old, stale: true, error: result.error, status: result.status }, status: 200 }
              : { body: { error: result.error, status: result.status }, status: 502 };
          });
          weatherInflight.set(key, job);
          void job.finally(() => weatherInflight.delete(key));
        }
        job.then(({ body, status }) => send(status, body)).catch(() => send(502, { error: 'network', status: null }));
      });
    },
  };
}

/** One icon list: the href is built in src/ui/icons.ts and injected here. */
function iconFont(): Plugin {
  return {
    name: 'tb-icon-font',
    transformIndexHtml() {
      return [
        {
          tag: 'link',
          injectTo: 'head-prepend',
          attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        },
        {
          tag: 'link',
          injectTo: 'head-prepend',
          attrs: {
            rel: 'preconnect',
            href: 'https://fonts.gstatic.com',
            crossorigin: '',
          },
        },
        {
          tag: 'link',
          injectTo: 'head',
          attrs: { rel: 'stylesheet', href: ICON_FONT_HREF },
        },
      ];
    },
  };
}

export default defineConfig({
  plugins: [iconFont(), hotelSearchVite(), tripApi(), weatherApi()],
  server: {
    port: 5173,
    strictPort: false,
  },
});

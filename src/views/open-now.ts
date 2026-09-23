const OVERPASS_URL = 'https://overpass-api.de/api/interpreter';

const CITY_ZONE: Record<string, string> = {
  paris: 'Europe/Paris',
  milao: 'Europe/Rome',
  roma: 'Europe/Rome',
  lisboa: 'Europe/Lisbon',
  porto: 'Europe/Lisbon',
  'sao-paulo': 'America/Sao_Paulo',
  florianopolis: 'America/Sao_Paulo',
  'new-york': 'America/New_York',
  miami: 'America/New_York',
};

const session = new Map<string, string | null>();

export type OpenNow = 'open' | 'closed' | 'unknown';

export function timeZoneForCity(slug: string): string {
  return CITY_ZONE[slug] ?? 'Europe/Paris';
}

export function clearOpenNowCache(): void {
  session.clear();
}

/** Weekday index matches the OSM evaluator: Su 0 … Sa 6. */
export function zonedClock(
  date: Date,
  timeZone: string,
): { day: number; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  }).formatToParts(date);
  const weekday = parts.find((part) => part.type === 'weekday')?.value ?? 'Mon';
  let hour = Number(parts.find((part) => part.type === 'hour')?.value ?? 0);
  const minute = Number(parts.find((part) => part.type === 'minute')?.value ?? 0);
  if (hour === 24) hour = 0;
  const dayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return { day: dayMap[weekday] ?? 1, hour, minute };
}

/** Minimal opening_hours evaluator for common OSM patterns. Ported from the portfolio. */
export function isOpenFromOsmHours(
  oh: string,
  day: number,
  hour: number,
  minute: number,
): boolean | null {
  if (!oh || oh === 'unknown') return null;
  if (oh.includes('24/7')) return true;

  const nowMins = hour * 60 + minute;
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const today = dayNames[day];
  const rules = oh
    .split(';')
    .map((rule) => rule.trim())
    .filter(Boolean);
  let open: boolean | null = null;

  for (const rule of rules) {
    if (today && /\boff\b/i.test(rule) && rule.includes(today)) return false;
    const match = rule.match(
      /^(?:(Mo|Tu|We|Th|Fr|Sa|Su)(?:-(Mo|Tu|We|Th|Fr|Sa|Su))?|PH)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/i,
    );
    if (!match) continue;
    const startDay = match[1];
    const endDay = match[2];
    const startText = match[3];
    const endText = match[4];
    if (!startDay || !startText || !endText || !today) continue;
    const idx = (name: string) => dayNames.indexOf(name);
    let inDay = false;
    if (endDay) {
      const from = idx(startDay);
      const to = idx(endDay);
      inDay = from <= to ? day >= from && day <= to : day >= from || day <= to;
    } else {
      inDay = startDay === today;
    }
    if (!inDay) continue;
    const [h1, m1] = startText.split(':').map(Number);
    const [h2, m2] = endText.split(':').map(Number);
    const start = h1 * 60 + m1;
    let end = h2 * 60 + m2;
    if (end <= start) end += 24 * 60;
    let cur = nowMins;
    if (end > 24 * 60 && cur < start) cur += 24 * 60;
    open = cur >= start && cur < end;
  }
  return open;
}

export function overpassQuery(osmRef: string): string | null {
  const match = osmRef.match(/^(node|way|relation)\/(\d+)$/i);
  if (!match) return null;
  return `[out:json][timeout:15];${match[1].toLowerCase()}(${match[2]});out tags;`;
}

export async function fetchOpeningHours(
  osmRef: string,
  fetcher: typeof fetch = fetch,
): Promise<string | null> {
  if (session.has(osmRef)) return session.get(osmRef) ?? null;
  const query = overpassQuery(osmRef);
  if (!query) {
    session.set(osmRef, null);
    return null;
  }
  try {
    const response = await fetcher(OVERPASS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    });
    if (!response.ok) return null;
    const data = (await response.json()) as {
      elements?: { tags?: Record<string, string> }[];
    };
    const hours = data.elements?.[0]?.tags?.opening_hours ?? null;
    session.set(osmRef, hours);
    return hours;
  } catch {
    return null;
  }
}

export async function openNowStatus(
  osmRef: string | undefined,
  timeZone: string,
  now = new Date(),
  fetcher: typeof fetch = fetch,
): Promise<OpenNow> {
  if (!osmRef) return 'unknown';
  const hours = await fetchOpeningHours(osmRef, fetcher);
  if (!hours) return 'unknown';
  const clock = zonedClock(now, timeZone);
  const open = isOpenFromOsmHours(hours, clock.day, clock.hour, clock.minute);
  if (open == null) return 'unknown';
  return open ? 'open' : 'closed';
}

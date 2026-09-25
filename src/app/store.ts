const PREFIX = 'tb:';

/** JSON value under `tb:<key>`. Corrupt or missing storage returns `fallback`. */
export function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* private mode or quota */
  }
}

/** Enabled place categories, shared by every city. Absent until the user changes one. */
export const categoryFilterKey = 'categories';

export function groupsKey(city: string): string {
  return `groups:${city}`;
}

export function arrivalKey(city: string, dayId: string): string {
  return `arrival:${city}:${dayId}`;
}

export function readCategoryFilter(): string[] | null {
  const value = read<unknown>(categoryFilterKey, null);
  if (!Array.isArray(value)) return null;
  return value.filter((item): item is string => typeof item === 'string');
}

export function writeCategoryFilter(ids: readonly string[]): void {
  write(categoryFilterKey, [...ids]);
}

/** Open category groups for one city. The list that toggles them is phase 6. */
export function readGroups(city: string): Record<string, boolean> | null {
  const value = read<unknown>(groupsKey(city), null);
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const state: Record<string, boolean> = {};
  for (const [key, open] of Object.entries(value)) {
    if (typeof open === 'boolean') state[key] = open;
  }
  return state;
}

export function writeGroups(city: string, state: Readonly<Record<string, boolean>>): void {
  write(groupsKey(city), { ...state });
}

export function periodsKey(trip: string): string {
  return `periods:${trip}`;
}

/** Periods of a trip the user folded or switched, by `date:period`. Untouched ones keep the default. */
export type PeriodPrefs = Record<string, { open?: boolean; on?: boolean }>;

export function readPeriods(trip: string): PeriodPrefs {
  const value = read<unknown>(periodsKey(trip), null);
  const prefs: PeriodPrefs = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return prefs;
  for (const [key, entry] of Object.entries(value)) {
    if (!entry || typeof entry !== 'object') continue;
    const { open, on } = entry as { open?: unknown; on?: unknown };
    prefs[key] = {
      ...(typeof open === 'boolean' ? { open } : {}),
      ...(typeof on === 'boolean' ? { on } : {}),
    };
  }
  return prefs;
}

export function writePeriods(trip: string, prefs: Readonly<PeriodPrefs>): void {
  write(periodsKey(trip), prefs);
}

export function readArrival(city: string, dayId: string): string | null {
  const value = read<unknown>(arrivalKey(city, dayId), null);
  return typeof value === 'string' && value ? value : null;
}

export function writeArrival(city: string, dayId: string, arrivalId: string): void {
  write(arrivalKey(city, dayId), arrivalId);
}

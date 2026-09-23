export type CityHashTab = 'places' | 'itinerary' | 'hotels';

/** `#/city/<slug>/<tab>` plus the query the city view already understands, and hotel dates. */
export function cityHash(
  slug: string,
  tab: CityHashTab,
  query?: { day?: number; in?: string; out?: string },
): string {
  const params = new URLSearchParams();
  if (query?.day != null && query.day > 0) params.set('day', String(query.day));
  if (query?.in) params.set('in', query.in);
  if (query?.out) params.set('out', query.out);
  const text = params.toString();
  return `#/city/${encodeURIComponent(slug)}/${tab}${text ? `?${text}` : ''}`;
}

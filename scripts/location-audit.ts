export type Pin = { lat: number; lng: number };

/** Camera coordinates (@lat,lng) are deliberately not accepted as place pins. */
export function destinationPin(url = ''): Pin | undefined {
  const matches = [...url.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)];
  const unique = new Map(matches.map(m => [`${m[1]},${m[2]}`, { lat: +m[1], lng: +m[2] }]));
  if (unique.size !== 1) return undefined;
  const pin = [...unique.values()][0];
  return Math.abs(pin.lat) <= 90 && Math.abs(pin.lng) <= 180 ? pin : undefined;
}

export function distanceMeters(a: Pin, b: Pin): number {
  const rad = Math.PI / 180;
  const h = Math.sin((b.lat - a.lat) * rad / 2) ** 2
    + Math.cos(a.lat * rad) * Math.cos(b.lat * rad)
    * Math.sin((b.lng - a.lng) * rad / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(Math.min(1, h)));
}

export function auditPin(place: Pin & { mapsUrl?: string }) {
  if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)
    || Math.abs(place.lat) > 90 || Math.abs(place.lng) > 180) {
    return { status: 'invalid' as const };
  }
  const source = destinationPin(place.mapsUrl);
  if (!source) return { status: 'no-coordinate-source' as const };
  const meters = distanceMeters(place, source);
  return {
    status: meters > 25 ? 'needs-review' as const : 'coordinate-match' as const,
    meters: Math.round(meters), source,
  };
}

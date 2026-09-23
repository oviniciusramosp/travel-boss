/**
 * Pure helpers for the Azul Viagens × Booking.com hotel cross-check.
 * No I/O here — everything is unit-tested in src/data/hotel-search.test.ts.
 */

/** Words that carry no identity when comparing hotel names across sites. */
const GENERIC = new Set([
  'hotel', 'hotels', 'hoteis', 'albergo', 'alberghi', 'bb', 'bed', 'breakfast',
  'guest', 'house', 'guesthouse', 'residence', 'residenza', 'suites', 'suite',
  'rooms', 'room', 'apartments', 'apartment', 'aparthotel', 'hostel', 'inn',
  'relais', 'boutique',
  'the', 'il', 'la', 'le', 'lo', 'gli', 'di', 'de', 'da', 'del', 'della', 'dei',
  'degli', 'delle', 'dell', 'al', 'all', 'alla', 'and', 'of', 'by', 'au', 'aux',
  'des', 'du', 'les', 'el', 'los', 'las',
]);
const ARTICLES = new Set(['the', 'il', 'la', 'le', 'lo', 'gli', 'di', 'de', 'da', 'del', 'della', 'dei', 'degli', 'delle', 'dell', 'and', 'of', 'el', 'los', 'las', 'les', 'des', 'du']);

export function decodeEntities(s) {
  return String(s ?? '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

export function foldText(s) {
  return decodeEntities(s)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

function words(s) {
  return foldText(s).split(/[^a-z0-9]+/).filter((w) => w.length > 1);
}

/**
 * Identity tokens of a hotel name: drops generic hotel words, articles and the
 * city name. Falls back to "everything but articles" when nothing is left
 * ("Hotel Roma" → ["roma"] is better than []).
 */
export function normalizeHotelName(name, city = '') {
  const cityTokens = new Set(words(city));
  const all = words(name);
  const strict = all.filter((w) => !GENERIC.has(w) && !cityTokens.has(w));
  if (strict.length) return strict;
  return all.filter((w) => !ARTICLES.has(w));
}

/** Share of the shorter token set found in the other (prefix-tolerant for words ≥ 4 chars). */
export function nameOverlap(a, b) {
  const A = [...new Set(a)];
  const B = [...new Set(b)];
  if (!A.length || !B.length) return 0;
  const hits = A.filter((t) =>
    B.some((x) => x === t || (x.length >= 4 && t.length >= 4 && (x.startsWith(t) || t.startsWith(x)))),
  ).length;
  return hits / Math.min(A.length, B.length);
}

export function haversineM(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

/**
 * Same hotel on both sites? Name overlap decides how far apart the two
 * geocodes may be, and a longer matching name buys more slack: Azul geocodes
 * apart-hotels loosely (Domus Vatican Holiday's sits 930 m from Booking's
 * pin for the very same name).
 *
 * `tokens` is the size of the smaller identity-token set — a full match on
 * three words is far stronger evidence than a full match on one.
 *
 * ponytail: thresholds hand-tuned on Rome; if false negatives pile up, loosen
 * the distance, not the name rule.
 */
export function isMatch({ overlap, distanceM, tokens = 1 }) {
  if (!(distanceM >= 0)) return false;
  if (overlap >= 0.99) return distanceM <= (tokens >= 2 ? 1500 : 500);
  if (overlap >= 0.5) return distanceM <= 200;
  return overlap > 0 && distanceM <= 40;
}

/** "Scored 8.2 8.2Very Good 1,690 reviews" → { score: 8.2, label: 'Very Good', reviews: 1690 } */
export function parseBookingScore(text) {
  const t = String(text ?? '').replace(/\s+/g, ' ').trim();
  const num = t.match(/(\d{1,2}(?:[.,]\d)?)/);
  const score = num ? parseFloat(num[1].replace(',', '.')) : NaN;
  const rev = t.match(/([\d.,]+)\s*reviews?/i);
  const label = t
    .replace(/scored/gi, ' ')
    .replace(/[\d.,]+\s*reviews?/i, ' ')
    .replace(/\d{1,2}(?:[.,]\d)?/g, ' ')
    .replace(/[^A-Za-z ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return {
    score: score >= 0 && score <= 10 ? score : null,
    label: label || null,
    reviews: rev ? parseInt(rev[1].replace(/[.,]/g, ''), 10) : null,
  };
}

export function nightsBetween(checkin, checkout) {
  const a = Date.parse(`${checkin}T00:00:00Z`);
  const b = Date.parse(`${checkout}T00:00:00Z`);
  return Math.round((b - a) / 864e5);
}

/**
 * Azul `summary.hotels` → the candidates worth a (slow) Booking lookup:
 * priced, geocoded, inside [minTotal, maxTotal] for the whole stay and, when a
 * centre is given, within `maxKm` of it.
 *
 * Ordered by distance to the centre, NOT by price: the cheapest rooms in Rome
 * are campsites by the ring road, so a price-ordered cut drops every central
 * hotel before the limit is reached. Each candidate carries `km`.
 */
export function filterCandidates(
  hotels,
  { minTotal = 0, maxTotal = Infinity, centre = null, maxKm = Infinity, limit = Infinity } = {},
) {
  const withKm = hotels
    .filter(
      (h) =>
        h.price > 0 &&
        h.price >= minTotal &&
        h.price <= maxTotal &&
        Number.isFinite(h.lat) &&
        Number.isFinite(h.lng),
    )
    .map((h) => ({
      ...h,
      km: centre
        ? Math.round(haversineM(centre.lat, centre.lng, h.lat, h.lng)) / 1000
        : null,
    }))
    .filter((h) => h.km == null || h.km <= maxKm);

  withKm.sort((a, b) =>
    a.km != null && b.km != null ? a.km - b.km || a.price - b.price : a.price - b.price,
  );
  return Number.isFinite(limit) ? withKm.slice(0, limit) : withKm;
}

/** Azul zone autocomplete → the city itself ("Roma, Lácio, Itália"), not stations or "Roma Area - …". */
export function pickZone(zones, city) {
  const q = foldText(city).trim();
  const list = (zones ?? []).filter((z) => z && z.type === 'zone' && z.name);
  const head = (z) => foldText(z.name).split(',')[0].trim();
  return (
    list.find((z) => head(z) === q) ??
    list.find((z) => head(z).startsWith(q)) ??
    list[0] ??
    null
  );
}

/** Booking results page for a free-text destination string (hotel name, hotel + city, …). */
export function bookingSearchUrl({ ss, checkin, checkout, adults }) {
  const q = new URLSearchParams({
    ss: decodeEntities(ss),
    checkin,
    checkout,
    group_adults: String(adults),
    no_rooms: '1',
    lang: 'en-us',
    selected_currency: 'BRL',
  });
  return `https://www.booking.com/searchresults.html?${q}`;
}

export function bookingHotelUrl(link, { checkin, checkout, adults }) {
  if (!link) return null;
  const q = new URLSearchParams({
    checkin,
    checkout,
    group_adults: String(adults),
    no_rooms: '1',
    selected_currency: 'BRL',
  });
  return `${link.split('?')[0]}?${q}`;
}

/** Booking CDN thumbnails come as square240; the same hash serves max500. */
export function bookingImageLarge(url) {
  return url ? url.replace(/\/xdata\/images\/hotel\/[^/]+\//, '/xdata/images/hotel/max500/') : null;
}

/** Hotel page on Azul — works without a search session (photos + date form). */
export function azulHotelUrl(uid) {
  return `https://www.azulviagens.com.br/hotels/details.aspx?UID=${String(uid).replace(/[^A-Za-z0-9@._-]/g, '')}`;
}

/** Identity tokens as a plain query — retry string when Booking finds nothing for the full name. */
export function simplifyHotelName(name, city = '') {
  return normalizeHotelName(name, city).join(' ');
}

/**
 * Among the property cards of one Booking results page, pick the one that is
 * the same hotel as the Azul entry (name overlap + geocode distance).
 * Returns { card, overlap, distanceM } or null; `nearest` helps explain misses.
 */
export function bestBookingMatch(azul, cards, city = '') {
  const a = normalizeHotelName(azul.name, city);
  let best = null;
  let nearest = null;
  for (const card of cards ?? []) {
    if (!card || !Number.isFinite(card.lat) || !Number.isFinite(card.lng)) continue;
    const b = normalizeHotelName(card.name, city);
    const overlap = nameOverlap(a, b);
    const tokens = Math.min(a.length, b.length);
    const distanceM = Math.round(haversineM(azul.lat, azul.lng, card.lat, card.lng));
    if (!nearest || distanceM < nearest.distanceM) nearest = { card, overlap, distanceM };
    if (!isMatch({ overlap, distanceM, tokens })) continue;
    if (!best || overlap > best.overlap || (overlap === best.overlap && distanceM < best.distanceM)) {
      best = { card, overlap, distanceM };
    }
  }
  return { best, nearest };
}

/**
 * Booking's accommodation types, read off its own "Property Type" filter
 * (the ids arrive as `accommodationTypeId` on every property card).
 */
export const ACCOMMODATION_TYPES = {
  201: { en: 'Apartment', pt: 'Apartamento' },
  203: { en: 'Hostel', pt: 'Albergue' },
  204: { en: 'Hotel', pt: 'Hotel' },
  205: { en: 'Motel', pt: 'Motel' },
  206: { en: 'Resort', pt: 'Resort' },
  208: { en: 'Bed and Breakfast', pt: 'Pousada / B&B' },
  212: { en: 'Resort Village', pt: 'Vila de resort' },
  213: { en: 'Villa', pt: 'Vila' },
  214: { en: 'Campground', pt: 'Acampamento' },
  216: { en: 'Guesthouse', pt: 'Pousada' },
  220: { en: 'Vacation Home', pt: 'Casa de temporada' },
  221: { en: 'Lodge', pt: 'Chalé' },
  222: { en: 'Homestay', pt: 'Quarto na casa' },
  223: { en: 'Country House', pt: 'Casa de campo' },
  224: { en: 'Farm Stay', pt: 'Fazenda' },
  226: { en: 'Love Hotel', pt: 'Motel (love hotel)' },
  228: { en: 'Boat', pt: 'Barco' },
  235: { en: 'Student accommodation', pt: 'Moradia estudantil' },
};

export function accommodationType(id) {
  const n = Number(id);
  const t = ACCOMMODATION_TYPES[n];
  return t ? { id: n, ...t } : { id: Number.isFinite(n) ? n : null, en: 'Other', pt: 'Outro' };
}

/**
 * Booking photo URLs are `/xdata/images/hotel/<size>/<id>.<ext>?k=<hash>`;
 * the id+hash are size independent, so a thumbnail can be re-requested large.
 */
export function bookingPhotoUrl(url, size = 'max500') {
  if (!url) return null;
  const abs = url.startsWith('http') ? url : `https://cf.bstatic.com${url}`;
  return abs.replace(/\/xdata\/images\/hotel\/[^/]+\//, `/xdata/images/hotel/${size}/`);
}

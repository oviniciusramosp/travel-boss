import type { Shell } from '../app/shell';
import { getTravelCity, pickLocale, placeCategoryMeta } from '../catalog';
import type { MapHandle, MapPin } from '../map/types';
import { iconButton } from '../ui/controls';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';
import { prefersReducedMotion } from '../ui/motion';
import { distanceSection, walkStops } from './hotel-distance';
import { clearSearchRing, markContextMarkers, syncSearchRing } from './hotel-ring';
import { scoreCard, whyParts, type WhyPart } from './hotel-rank';
import { hotelPhotoUrls, mountHotelSlider } from './hotel-slider';
import { cityHasStayHeat, mountStayHeat, type StayHeatHandle } from './stay-heatmap';
import { closePlace, openPlaceId } from './place-panel';

type Locale = 'en' | 'pt-BR';
type Localized = { en: string; 'pt-BR': string };
type CategoryKey = 'cleanliness' | 'comfort' | 'facilities' | 'staff' | 'wifi' | 'location' | 'value';
type Eligibility = 'eligible' | 'pending' | 'excluded';
type SkipReason = 'not-found' | 'no-match' | 'no-score' | 'low-score';

type Booking = {
  name?: string;
  score: number;
  label?: string | null;
  reviews: number | null;
  url: string | null;
  img?: string | null;
  photos?: string[];
  address?: string | null;
  distanceM?: number;
  categoryScores?: Partial<Record<CategoryKey, number | null>>;
  wifiAvailable?: boolean | null;
  detailsFetchedAt?: string | null;
};

type AccommodationType = { id: number | null; en: string; pt: string };

type HotelRanking = {
  position: number | null;
  score: number | null;
  provisional?: boolean;
  evidenceCoverage?: number;
  missingComponents?: string[];
  eligibility?: {
    status: Eligibility;
    failures?: string[];
    unknown?: string[];
    staffMinimum: number | null;
  };
  region?: {
    name: Localized;
    safety: number | null;
    coverage?: string;
  } | null;
  walkingMinutes: number | null;
  walkingCoverage?: number;
  reachableWithin30?: number;
  beyond90?: number;
  pointCount?: number;
  totalPoints?: number;
  walks?: unknown;
  transit?: { name?: Localized; minutes?: number } | null;
  jev?: { weight?: number } | null;
};

type Hotel = {
  source?: 'airbnb';
  locationApproximate?: boolean;
  id: string;
  name: string;
  lat: number;
  lng: number;
  priceTotal: number;
  priceNight: number;
  currency?: string;
  type?: AccommodationType;
  km: number | null;
  azulUrl?: string;
  booking: Booking;
  ranking?: HotelRanking;
};

type Skipped = {
  name: string;
  priceTotal: number;
  azulUrl?: string;
  reason: SkipReason;
  bookingName?: string;
  distanceM?: number | null;
  booking?: { score?: number };
};

type SearchResult = {
  type: 'done';
  query: {
    city?: string;
    sources?: string;
    checkin?: string;
    checkout?: string;
    adults?: number;
    nights?: number;
    minScore?: number;
    minTotal?: number | null;
    maxTotal?: number | null;
    maxKm?: number | null;
  };
  warnings?: string[];
  unavailableSources?: string[];
  totals: {
    airbnb?: number;
    azul: number;
    inRange: number;
    candidates: number;
    kept: number;
  };
  hotels: Hotel[];
  skipped: Skipped[];
  ranking?: {
    version?: number;
    jevStatus?: string;
    pointCount?: number;
    totalPoints?: number;
    eligibilityCounts?: { eligible: number; pending: number; excluded: number };
  } | null;
};

type Msg =
  | { type: 'status'; message: string }
  | { type: 'progress'; done: number; total: number; name: string }
  | { type: 'error'; message: string }
  | SearchResult;

type RankResponse = {
  error?: string;
  ranking?: SearchResult['ranking'];
  hotels?: { id: string; ranking?: HotelRanking; booking?: Partial<Booking> }[];
};

const API = '/api/hotel-search';

const SKIP_REASON: Record<SkipReason, [string, string]> = {
  'not-found': ['not found on Booking', 'não encontrado no Booking'],
  'no-match': ['name/location did not match', 'nome/local não bateu'],
  'no-score': ['no Booking score yet', 'sem nota no Booking'],
  'low-score': ['below minimum score', 'abaixo da nota mínima'],
};

const CATEGORIES: readonly [CategoryKey, string, string][] = [
  ['cleanliness', 'Cleanliness', 'Limpeza'],
  ['comfort', 'Comfort', 'Conforto'],
  ['facilities', 'Facilities', 'Comodidades'],
  ['staff', 'Staff', 'Funcionários'],
];

const UNKNOWN_LABEL: Record<string, [string, string]> = {
  overall: ['Airbnb overall', 'nota geral do Airbnb'],
  wifi: ['Wi-Fi', 'Wi-Fi'],
  staff: ['staff', 'funcionários'],
  cleanliness: ['cleanliness', 'limpeza'],
  comfort: ['comfort', 'conforto'],
  facilities: ['facilities', 'comodidades'],
};

const MISSING_LABEL: Record<string, [string, string]> = {
  safety: ['neighborhood safety', 'segurança do bairro'],
  walking: ['walking routes', 'rotas a pé'],
  transit: ['transport access', 'acesso ao transporte'],
  quality: ['quality', 'qualidade'],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function finite(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function isoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

function parseISODate(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y || 0, (m || 1) - 1, d || 1);
}

function nightsBetween(checkin?: string, checkout?: string): number | null {
  if (!checkin || !checkout) return null;
  const ms = Date.parse(checkout) - Date.parse(checkin);
  if (!Number.isFinite(ms) || ms <= 0) return null;
  return Math.round(ms / 86_400_000);
}

function kmBetween(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.min(1, Math.sqrt(h)));
}

function safeUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url.href;
  } catch {
    return null;
  }
}

function isAbort(error: unknown): boolean {
  return error instanceof DOMException
    ? error.name === 'AbortError'
    : error instanceof Error && error.name === 'AbortError';
}

function normalizeHotel(value: unknown): Hotel | null {
  if (!isRecord(value) || typeof value.name !== 'string') return null;
  if (!isRecord(value.booking) || typeof value.booking.score !== 'number') return null;
  if (typeof value.id !== 'string' && typeof value.id !== 'number') return null;
  value.id = String(value.id);
  return value as unknown as Hotel;
}

function normalizeSkipped(value: unknown): Skipped | null {
  if (!isRecord(value) || typeof value.name !== 'string') return null;
  const reason = value.reason;
  if (reason !== 'not-found' && reason !== 'no-match' && reason !== 'no-score' && reason !== 'low-score') {
    return null;
  }
  return value as unknown as Skipped;
}

function asResult(value: unknown): SearchResult | null {
  if (!isRecord(value) || value.type !== 'done' || !Array.isArray(value.hotels)) return null;
  const hotels = value.hotels.map(normalizeHotel).filter((hotel): hotel is Hotel => hotel !== null);
  value.hotels = hotels;
  if (!Array.isArray(value.skipped)) value.skipped = [];
  else value.skipped = value.skipped.map(normalizeSkipped).filter((item): item is Skipped => item !== null);
  if (!isRecord(value.query)) value.query = {};
  if (!isRecord(value.totals)) {
    value.totals = { azul: 0, inRange: 0, candidates: hotels.length, kept: hotels.length };
  }
  return value as unknown as SearchResult;
}

function asMsg(value: unknown): Msg | null {
  if (!isRecord(value)) return null;
  if (value.type === 'status' && typeof value.message === 'string') {
    return { type: 'status', message: value.message };
  }
  if (value.type === 'error' && typeof value.message === 'string') {
    return { type: 'error', message: value.message };
  }
  if (value.type === 'progress' && typeof value.name === 'string') {
    return {
      type: 'progress',
      done: finite(value.done) ?? 0,
      total: finite(value.total) ?? 0,
      name: value.name,
    };
  }
  if (value.type === 'done') return asResult(value);
  return null;
}

/** Airbnb listings are the approximate ones. The warning must not require a non-Airbnb source. */
export function safetyLine(
  hotel: { source?: string; locationApproximate?: boolean },
  region: { name: string; safety: number | null } | null,
  t: (en: string, pt: string) => string,
): string | null {
  if (hotel.locationApproximate) {
    return t('Neighborhood safety not scored', 'Segurança do bairro sem nota');
  }
  if (hotel.source === 'airbnb' || !region) return null;
  const safety =
    region.safety == null ? t('safety not assessed', 'segurança não avaliada') : `${region.safety}/100`;
  return region.name ? `${region.name} ${safety}` : safety;
}

/** `null` means the form can stay enabled. A string is the setup message and the form locks. */
export function hotelSetupFailure(
  outcome: 'unreachable' | 'http' | 'ok',
  body: { ok?: boolean; error?: unknown } | null,
  fallback: string,
): string | null {
  if (outcome === 'unreachable' || outcome === 'http') return fallback;
  if (!body || body.ok !== false) return null;
  return typeof body.error === 'string' && body.error.trim() ? body.error : fallback;
}

/** Missing content type stays on the ndjson reader. JSON must not be parsed line by line. */
export function responseIsNdjson(contentType: string | null): boolean {
  const type = (contentType ?? '').toLowerCase();
  if (!type) return true;
  return type.includes('ndjson');
}

export function interpretSearchBody(
  body: unknown,
  fallback: string,
): { kind: 'done'; result: SearchResult } | { kind: 'status'; message: string; error: boolean } {
  const message = asMsg(body);
  if (message?.type === 'done') return { kind: 'done', result: message };
  if (message?.type === 'error') return { kind: 'status', message: message.message, error: true };
  if (message?.type === 'status') return { kind: 'status', message: message.message, error: false };
  if (isRecord(body)) {
    const text =
      typeof body.error === 'string' ? body.error : typeof body.message === 'string' ? body.message : '';
    return { kind: 'status', message: text || fallback, error: true };
  }
  return { kind: 'status', message: fallback, error: true };
}

export function mountHotels(
  host: HTMLElement,
  city: { slug: string; name: string; lat: number; lng: number },
  map: MapHandle,
  shell: Shell,
  priorityIds: string[],
): { dispose(): void } {
  const locale = (): Locale => shell.locale();
  const t = (en: string, pt: string) => (locale() === 'pt-BR' ? pt : en);
  const storeKey = `travel-hotels:v2:${city.slug}`;
  const listeners = new AbortController();
  const listen = (target: EventTarget, type: string, fn: EventListener) => {
    target.addEventListener(type, fn, { signal: listeners.signal });
  };

  let disposed = false;
  let displayed: SearchResult | null = null;
  let currentId: string | null = null;
  let radiusTimer = 0;
  let job = 0;
  let searchAbort: AbortController | null = null;
  let rankAbort: AbortController | null = null;
  const statusAbort = new AbortController();
  const mutedTypes = new Set<string>();
  let contextObserver: MutationObserver | null = null;
  let contextLabels = new Set<string>();
  let sheetId: string | null = null;
  let sheetOrigin: HTMLElement | null = null;
  let heat: StayHeatHandle | null = null;
  let heatButton: HTMLButtonElement | null = null;
  document.documentElement.dataset.tbHotels = '';

  const root = el('div', 'tb-hotels');
  const form = el('form', 'tb-hotels__form');
  form.autocomplete = 'off';
  form.noValidate = false;

  const cityInput = el('input', 'tb-input');
  cityInput.name = 'city';
  cityInput.type = 'text';
  cityInput.required = true;
  cityInput.maxLength = 80;
  cityInput.readOnly = true;
  cityInput.tabIndex = -1;
  cityInput.setAttribute('aria-readonly', 'true');
  cityInput.value = city.name;
  cityInput.spellcheck = false;

  const sources = el('select', 'tb-select');
  sources.name = 'sources';
  const optAll = el('option');
  const optHotels = el('option');
  const optAirbnb = el('option');
  optAll.value = 'all';
  optHotels.value = 'hotels';
  optAirbnb.value = 'airbnb';
  sources.append(optAll, optHotels, optAirbnb);

  const checkin = el('input', 'tb-input');
  checkin.name = 'checkin';
  checkin.type = 'date';
  checkin.required = true;
  const checkout = el('input', 'tb-input');
  checkout.name = 'checkout';
  checkout.type = 'date';
  checkout.required = true;

  const minTotal = el('input', 'tb-input');
  minTotal.name = 'minTotal';
  minTotal.type = 'number';
  minTotal.min = '0';
  minTotal.step = '50';
  minTotal.placeholder = '0';
  minTotal.inputMode = 'numeric';

  const maxTotal = el('input', 'tb-input');
  maxTotal.name = 'maxTotal';
  maxTotal.type = 'number';
  maxTotal.min = '0';
  maxTotal.step = '50';
  maxTotal.placeholder = '2500';
  maxTotal.inputMode = 'numeric';

  const radius = el('input', 'tb-hotels__range');
  radius.id = 'tb-hotel-radius';
  radius.name = 'maxKm';
  radius.type = 'range';
  radius.min = '1';
  radius.max = '20';
  radius.step = '0.5';
  radius.value = '5';

  const adults = el('input', 'tb-input');
  adults.name = 'adults';
  adults.type = 'number';
  adults.min = '1';
  adults.max = '6';
  adults.step = '1';
  adults.value = '2';
  adults.inputMode = 'numeric';
  adults.required = true;

  const minScore = el('input', 'tb-input');
  minScore.name = 'minScore';
  minScore.type = 'number';
  minScore.min = '0';
  minScore.max = '10';
  minScore.step = '0.1';
  minScore.value = '7';
  minScore.inputMode = 'decimal';
  minScore.required = true;

  const today = new Date();
  checkin.min = isoDate(today);
  checkin.value = isoDate(addDays(today, 1));
  checkout.value = isoDate(addDays(today, 3));
  checkout.min = checkin.value;

  const submit = el('button', 'tb-btn');
  submit.type = 'submit';

  const cityLbl = el('span', 'tb-hotels__lbl');
  const sourcesLbl = el('span', 'tb-hotels__lbl');
  const checkinLbl = el('span', 'tb-hotels__lbl');
  const checkoutLbl = el('span', 'tb-hotels__lbl');
  const minLbl = el('span', 'tb-hotels__lbl');
  const maxLbl = el('span', 'tb-hotels__lbl');
  const radiusLbl = el('span', 'tb-hotels__lbl');
  const guestsLbl = el('span', 'tb-hotels__lbl');
  const scoreLbl = el('span', 'tb-hotels__lbl');
  const radiusOut = el('output');
  radiusOut.setAttribute('for', radius.id);

  const cityField = el('label', 'tb-hotels__field tb-hotels__field--city');
  cityField.append(cityLbl, cityInput);
  const sourcesField = el('label', 'tb-hotels__field tb-hotels__field--sources');
  sourcesField.append(sourcesLbl, sources);
  const checkinField = el('label', 'tb-hotels__field tb-hotels__field--date');
  checkinField.append(checkinLbl, checkin);
  const checkoutField = el('label', 'tb-hotels__field tb-hotels__field--date');
  checkoutField.append(checkoutLbl, checkout);
  const minField = el('label', 'tb-hotels__field tb-hotels__field--num');
  minField.append(minLbl, minTotal);
  const maxField = el('label', 'tb-hotels__field tb-hotels__field--num');
  maxField.append(maxLbl, maxTotal);
  const radiusName = el('label', 'tb-hotels__lbl');
  radiusName.htmlFor = radius.id;
  radiusName.append(radiusLbl);
  const radiusRow = el('span', 'tb-hotels__label-row');
  radiusRow.append(radiusName, radiusOut);
  const radiusField = el('div', 'tb-hotels__field tb-hotels__field--grow');
  radiusField.append(radiusRow, radius);
  const guestsField = el('label', 'tb-hotels__field tb-hotels__field--num');
  guestsField.append(guestsLbl, adults);
  const scoreField = el('label', 'tb-hotels__field tb-hotels__field--score');
  scoreField.append(scoreLbl, minScore);
  form.append(
    cityField,
    sourcesField,
    checkinField,
    checkoutField,
    minField,
    maxField,
    radiusField,
    guestsField,
    scoreField,
    submit,
  );

  const setup = el('p', 'tb-meta tb-error tb-hotels__setup');
  setup.hidden = true;
  const status = el('p', 'tb-meta tb-hotels__status');
  status.hidden = true;

  const bar = el('div', 'tb-hotels__bar');
  const sortLbl = el('span', 'tb-hotels__lbl');
  const sortSel = el('select', 'tb-select');
  const optPriority = el('option');
  const optPrice = el('option');
  const optReviews = el('option');
  const optWalking = el('option');
  optPriority.value = 'priority';
  optPrice.value = 'price';
  optReviews.value = 'reviews';
  optWalking.value = 'walking';
  sortSel.append(optPriority, optPrice, optReviews, optWalking);
  const sortField = el('label', 'tb-hotels__field');
  sortField.append(sortLbl, sortSel);
  const rerankBtn = el('button', 'tb-btn-outline');
  rerankBtn.type = 'button';
  rerankBtn.disabled = true;
  const showExcluded = el('input');
  showExcluded.type = 'checkbox';
  const excludedText = el('span');
  const excludedLabel = el('label', 'tb-hotels__check');
  excludedLabel.append(showExcluded, excludedText);
  bar.append(sortField, rerankBtn, excludedLabel);

  const note = el('p', 'tb-meta tb-hotels__note');
  note.hidden = true;
  const chips = el('div', 'tb-hotels__chips');
  chips.hidden = true;
  const list = el('div', 'tb-hotels__list');
  const skipped = el('details', 'tb-hotels__skipped');
  skipped.hidden = true;
  const summary = el('summary');
  const skippedList = el('ul');
  skipped.append(summary, skippedList);

  root.append(form, setup, status, bar, note, chips, list, skipped);
  host.replaceChildren(root);

  const money = (value: number) =>
    Number.isFinite(value)
      ? new Intl.NumberFormat(locale(), { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
      : '—';
  const decimal = (value: number) =>
    new Intl.NumberFormat(locale(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(value);
  const formatKm = (value: number, digits: number) =>
    new Intl.NumberFormat(locale(), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);

  const currentKm = () => {
    const value = Number(radius.value);
    return Number.isFinite(value) ? Math.min(20, Math.max(1, value)) : 5;
  };

  const distanceKm = (hotel: Hotel): number | null => {
    if (typeof hotel.km === 'number' && Number.isFinite(hotel.km)) return hotel.km;
    if (!Number.isFinite(hotel.lat) || !Number.isFinite(hotel.lng)) return null;
    return kmBetween(city, hotel);
  };

  const meetsFilter = (hotel: Hotel) =>
    showExcluded.checked || hotel.ranking?.eligibility?.status !== 'excluded';

  const typeKey = (hotel: Hotel) => String(hotel.type?.id ?? hotel.type?.en ?? 'other');

  const typeLabel = (hotel: Hotel) => {
    const type = hotel.type;
    if (!type) return t('Other', 'Outro');
    const label = locale() === 'pt-BR' ? type.pt || type.en : type.en || type.pt;
    return label || t('Other', 'Outro');
  };

  const placeName = (value: Localized | undefined) => {
    if (!value) return '';
    return locale() === 'pt-BR' ? value['pt-BR'] || value.en || '' : value.en || value['pt-BR'] || '';
  };

  const labelOf = (table: Record<string, [string, string]>, key: string) => {
    const pair = table[key];
    return pair ? t(pair[0], pair[1]) : key;
  };

  const visibleHotels = (hotels: Hotel[]) => {
    const km = currentKm();
    return hotels.filter((hotel) => {
      const distance = distanceKm(hotel);
      const inRing = distance == null || distance <= km + 1e-6;
      return meetsFilter(hotel) && inRing && !mutedTypes.has(typeKey(hotel));
    });
  };

  const syncRing = () => {
    const spec = { lat: city.lat, lng: city.lng, km: currentKm() };
    syncSearchRing(() => map.setRadius(spec), spec);
  };

  const remarkContext = () => {
    const pane = document.querySelector('.leaflet-marker-pane');
    if (pane) markContextMarkers(pane, contextLabels);
  };

  const showContextPins = () => {
    const data = getTravelCity(city.slug);
    const pins: MapPin[] = [];
    const labels = new Set<string>();
    for (const place of data?.places ?? []) {
      if (!Number.isFinite(place.lat) || !Number.isFinite(place.lng)) continue;
      if (pins.some((pin) => pin.id === place.id)) continue;
      const label = pickLocale(locale(), place.name);
      labels.add(label);
      pins.push({
        id: place.id,
        lat: place.lat,
        lng: place.lng,
        label,
        color: placeCategoryMeta[place.category].color,
        kind: 'place',
      });
    }
    contextLabels = labels;
    map.setPins('place', pins);
    remarkContext();
  };

  const watchContextPins = () => {
    const pane = document.querySelector('.leaflet-marker-pane');
    if (!pane || contextObserver) return;
    contextObserver = new MutationObserver(() => remarkContext());
    contextObserver.observe(pane, { childList: true });
  };

  const showSkeleton = () => {
    const skeleton = el('div', 'tb-hotels__skeleton');
    skeleton.setAttribute('aria-hidden', 'true');
    for (let index = 0; index < 4; index += 1) skeleton.append(el('div', 'tb-hotels__bone'));
    list.setAttribute('aria-busy', 'true');
    list.replaceChildren(skeleton);
  };

  const hideSkeleton = () => {
    list.querySelector('.tb-hotels__skeleton')?.remove();
    list.removeAttribute('aria-busy');
  };

  const paintRadius = () => {
    const km = formatKm(currentKm(), Number(radius.value) % 1 === 0 ? 0 : 1);
    const total = displayed?.hotels.length ?? 0;
    const shown = displayed ? visibleHotels(displayed.hotels).length : 0;
    const counts = displayed ? ` · ${shown}/${total}` : '';
    const searched = displayed?.query.maxKm;
    const wider =
      displayed && typeof searched === 'number' && Number.isFinite(searched) && currentKm() > searched + 1e-6
        ? ` · ${t('search again to widen', 'buscar de novo para ampliar')}`
        : '';
    radiusOut.textContent = `${km} km${counts}${wider}`;
  };

  const pinsFor = (hotels: Hotel[]): MapPin[] =>
    hotels
      .filter((hotel) => Number.isFinite(hotel.lat) && Number.isFinite(hotel.lng))
      .map((hotel) => ({
        id: hotel.id,
        lat: hotel.lat,
        lng: hotel.lng,
        label:
          hotel.booking.score != null
            ? `${hotel.name} · ${decimal(hotel.booking.score)}`
            : hotel.name,
        kind: 'hotel' as const,
        color: placeCategoryMeta.lodging.color,
      }));

  const applyFilter = () => {
    if (!displayed) {
      map.setPins('hotel', []);
      syncRing();
      paintRadius();
      return;
    }
    const visible = visibleHotels(displayed.hotels);
    const keep = new Set(visible.map((hotel) => hotel.id));
    list.querySelectorAll<HTMLElement>('[data-place-id]').forEach((card) => {
      card.hidden = !keep.has(card.dataset.placeId ?? '');
    });
    map.setPins('hotel', pinsFor(visible));
    remarkContext();
    syncRing();
    paintRadius();
  };

  const markCurrent = (id: string | null, scroll: boolean) => {
    currentId = id;
    let target: HTMLElement | null = null;
    list.querySelectorAll<HTMLElement>('[data-place-id]').forEach((card) => {
      const on = Boolean(id) && card.dataset.placeId === id;
      if (on) {
        card.setAttribute('aria-current', 'true');
        target = card;
      } else {
        card.removeAttribute('aria-current');
      }
    });
    if (!scroll || !target) return;
    const card: HTMLElement = target;
    if (card.hidden) return;
    card.scrollIntoView({
      block: 'nearest',
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
    });
  };

  const requirementOrder = (hotel: Hotel) => {
    const statusName = hotel.ranking?.eligibility?.status ?? 'pending';
    if (statusName === 'eligible') return 0;
    if (statusName === 'pending') return 1;
    return 2;
  };

  const walkSort = (hotel: Hotel) =>
    hotel.ranking && (hotel.ranking.walkingCoverage ?? 0) >= 0.8
      ? hotel.ranking.walkingMinutes ?? Number.POSITIVE_INFINITY
      : Number.POSITIVE_INFINITY;

  const sortHotels = (hotels: Hotel[]) => {
    const mode = sortSel.value;
    return [...hotels].sort((a, b) => {
      const eligibility = requirementOrder(a) - requirementOrder(b);
      if (eligibility) return eligibility;
      if (mode === 'price') return (a.priceTotal || 0) - (b.priceTotal || 0);
      if (mode === 'reviews') return (b.booking.score ?? 0) - (a.booking.score ?? 0);
      if (mode === 'walking') {
        const delta = walkSort(a) - walkSort(b);
        return Number.isFinite(delta) ? delta : 0;
      }
      const provisional = Number(a.ranking?.provisional ?? true) - Number(b.ranking?.provisional ?? true);
      if (provisional) return provisional;
      return (b.ranking?.score ?? 0) - (a.ranking?.score ?? 0);
    });
  };

  const bookingWord = (score: number) => {
    if (score >= 9) return t('Wonderful', 'Fantástico');
    if (score >= 8) return t('Very good', 'Muito bom');
    if (score >= 7) return t('Good', 'Bom');
    if (score >= 6) return t('Pleasant', 'Satisfatório');
    return t('Review score', 'Nota');
  };

  const failureText = (hotel: Hotel, key: string) => {
    if (key === 'wifi') return t('no Wi-Fi', 'sem Wi-Fi');
    if (key === 'staff') {
      const minimum = hotel.ranking?.eligibility?.staffMinimum;
      const floor = minimum != null ? decimal(minimum) : '7';
      return t(`staff below ${floor}`, `funcionários abaixo de ${floor}`);
    }
    return labelOf(UNKNOWN_LABEL, key);
  };

  const explain = (hotel: Hotel): string | null => {
    const ranking = hotel.ranking;
    if (!ranking?.eligibility || ranking.provisional == null) {
      return t(
        'Update priorities to load the trip score.',
        'Atualize as prioridades para carregar a nota.',
      );
    }
    const bits: string[] = [];
    if (ranking.provisional) {
      const coverage = Math.round((ranking.evidenceCoverage ?? 0) * 100);
      bits.push(`${t('Provisional', 'Provisória')} ${coverage}%`);
      if (ranking.missingComponents?.length) {
        bits.push(
          `${t('Missing', 'Faltam')} ${ranking.missingComponents.map((key) => labelOf(MISSING_LABEL, key)).join(', ')}`,
        );
      }
    }
    if (ranking.walkingMinutes == null) {
      bits.push(t('Walking routes unavailable', 'Rotas a pé indisponíveis'));
    } else {
      bits.push(
        `${ranking.reachableWithin30 ?? 0}/${ranking.pointCount ?? 0} ${t('within 30 min', 'em até 30 min')}`,
      );
      if (ranking.beyond90) bits.push(`${ranking.beyond90} ${t('beyond 90 min', 'acima de 1h30')}`);
      if ((ranking.walkingCoverage ?? 1) < 1) bits.push(t('incomplete routes', 'rotas incompletas'));
    }
    const safety = safetyLine(
      hotel,
      ranking.region
        ? { name: placeName(ranking.region.name), safety: ranking.region.safety }
        : null,
      t,
    );
    if (safety) bits.push(safety);
    if (
      hotel.source !== 'airbnb' &&
      ranking.eligibility.staffMinimum != null &&
      !ranking.eligibility.failures?.includes('staff')
    ) {
      bits.push(
        `${t('staff min.', 'funcionários mín.')} ${decimal(ranking.eligibility.staffMinimum)}`,
      );
    }
    if (ranking.transit && Number.isFinite(ranking.transit.minutes)) {
      const name = placeName(ranking.transit.name);
      bits.push(
        `${name ? `${name} ` : ''}${ranking.transit.minutes} min ${t('to transit', 'até o transporte')}`,
      );
    }
    if (ranking.eligibility.status === 'excluded' && ranking.eligibility.failures?.length) {
      bits.push(ranking.eligibility.failures.map((key) => failureText(hotel, key)).join(', '));
    } else if (ranking.eligibility.status === 'pending' && ranking.eligibility.unknown?.length) {
      bits.push(
        `${t('Confirm', 'Confirmar')}: ${ranking.eligibility.unknown.map((key) => labelOf(UNKNOWN_LABEL, key)).join(', ')}`,
      );
    }
    if (ranking.jev && Number.isFinite(ranking.jev.weight) && (ranking.jev.weight ?? 0) > 0) {
      bits.push(`JEV ${Math.round((ranking.jev.weight ?? 0) * 100)}%`);
    }
    if (hotel.source === 'airbnb') {
      bits.push(t('Airbnb rating ×2 is 50% of the score', 'Nota Airbnb ×2 é 50% da nota'));
    }
    return bits.join(' · ') || null;
  };

  const categoryLine = (hotel: Hotel): string | null => {
    const scores = hotel.booking.categoryScores;
    if (!scores) return null;
    const parts = CATEGORIES.flatMap(([key, en, pt]) => {
      const value = scores[key];
      return value != null && Number.isFinite(value) ? [`${t(en, pt)} ${decimal(value)}`] : [];
    });
    return parts.length ? parts.join(' · ') : null;
  };

  const wifiLine = (hotel: Hotel): string | null => {
    if (!Object.prototype.hasOwnProperty.call(hotel.booking, 'wifiAvailable')) return null;
    if (hotel.booking.wifiAvailable === true) return t('Wi-Fi confirmed', 'Wi-Fi confirmado');
    if (hotel.booking.wifiAvailable === false) return t('No Wi-Fi', 'Sem Wi-Fi');
    if (hotel.booking.wifiAvailable === null) return t('Wi-Fi to confirm', 'Wi-Fi a confirmar');
    return null;
  };

  const addMeta = (parent: HTMLElement, text: string | null) => {
    if (!text) return;
    parent.append(el('p', 'tb-meta', text));
  };

  const cardFor = (hotel: Hotel) => {
    const article = el('article', 'tb-card tb-hotels__card');
    article.dataset.placeId = hotel.id;
    article.tabIndex = 0;
    const isAirbnb = hotel.source === 'airbnb';
    const media = el('div', 'tb-hotels__media tb-slider is-instant');
    mountHotelSlider(
      media,
      hotelPhotoUrls(hotel.booking),
      hotel.name,
      locale(),
      placeCategoryMeta.lodging.color,
    );
    const head = el('div', 'tb-hotels__head');
    const title = el('div', 'tb-hotels__title');
    title.append(el('h3', 'tb-hotels__name', hotel.name), el('span', 'tb-badge', typeLabel(hotel)));
    const price = el('p', 'tb-hotels__price');
    price.append(document.createTextNode(money(hotel.priceTotal)));
    price.append(el('span', 'tb-hotels__total-word', t('total', 'total')));
    if (Number.isFinite(hotel.priceNight)) {
      price.append(el('span', 'tb-hotels__night', `${money(hotel.priceNight)} / ${t('night', 'noite')}`));
    }
    head.append(title, price);

    const facts = el('div', 'tb-hotels__facts');
    facts.append(el('span', 'tb-badge-soft', isAirbnb ? 'Airbnb' : 'Azul/Booking'));
    const scoreText =
      hotel.booking.score == null
        ? null
        : isAirbnb
          ? new Intl.NumberFormat(locale(), { maximumFractionDigits: 2 }).format(hotel.booking.score)
          : decimal(hotel.booking.score);
    const reviewParts = [
      scoreText,
      !isAirbnb && scoreText ? bookingWord(hotel.booking.score) : null,
      hotel.booking.reviews != null
        ? `${hotel.booking.reviews.toLocaleString(locale())} ${t('reviews', 'avaliações')}`
        : null,
    ].filter((part): part is string => Boolean(part));
    if (reviewParts.length) facts.append(el('span', undefined, reviewParts.join(' · ')));
    const kmLabel = distanceKm(hotel);
    if (kmLabel != null) facts.append(el('span', undefined, `${formatKm(kmLabel, 1)} km`));

    const body = el('div', 'tb-hotels__body');
    body.append(head, facts);
    if (hotel.booking.address) body.append(el('p', 'tb-meta', hotel.booking.address));
    article.append(media, body);

    const ranked = scoreCard(locale(), hotel);
    if (ranked) {
      const block = el('section', 'tb-hotels__score');
      block.setAttribute('aria-label', ranked.eyebrow);
      const ring = el('div', 'tb-hotels__ring');
      ring.style.setProperty('--hotel-score', `${ranked.score ?? 0}%`);
      ring.setAttribute('aria-label', ranked.aria);
      const figure = el('span');
      figure.append(el('strong', undefined, ranked.score == null ? '—' : String(ranked.score)));
      ring.append(figure);
      const copy = el('div', 'tb-hotels__score-copy');
      copy.append(
        el('span', 'tb-hotels__eyebrow', ranked.eyebrow),
        el('strong', undefined, ranked.title),
        el('small', undefined, ranked.detail),
      );
      const model = el('div', 'tb-hotels__model');
      model.append(ring, copy);
      block.append(model);
      if (ranked.airbnbNote) block.append(el('p', 'tb-hotels__fine', ranked.airbnbNote));
      if (ranked.bars.length) {
        const meters = el('div', 'tb-hotels__meters');
        for (const bar of ranked.bars) {
          const meter = el('div', 'tb-hotels__meter');
          meter.append(el('span', undefined, bar.label), el('strong', undefined, bar.text));
          const track = el('span', 'tb-hotels__track');
          track.setAttribute('role', 'meter');
          track.setAttribute('aria-valuemin', '0');
          track.setAttribute('aria-valuemax', '10');
          track.setAttribute('aria-valuenow', bar.value == null ? '0' : String(bar.value));
          track.setAttribute(
            'aria-label',
            `${bar.label}: ${bar.value == null ? t('unavailable', 'indisponível') : bar.text}`,
          );
          const fill = el('span');
          fill.style.width = `${Math.max(0, Math.min(10, bar.value ?? 0)) * 10}%`;
          track.append(fill);
          meter.append(track);
          meters.append(meter);
        }
        block.append(meters);
      }
      const requirements = el('div', 'tb-hotels__requirements');
      requirements.append(el('span', undefined, ranked.wifi), el('span', undefined, ranked.staff));
      block.append(requirements);
      if (ranked.requirementNote) block.append(el('p', 'tb-hotels__fine', ranked.requirementNote));
      const safety = el('p', ranked.safety.caution ? 'tb-hotels__caution' : undefined);
      if (ranked.safety.caution) safety.append(icon('warning', { size: 16 }));
      safety.append(document.createTextNode(ranked.safety.text));
      block.append(safety);
      if (ranked.coverage) block.append(el('p', 'tb-hotels__fine', ranked.coverage));
      block.append(el('p', undefined, ranked.walking));
      body.append(block);
    }

    const ranking = hotel.ranking;
    if (!ranked && ranking && (ranking.eligibility || ranking.score != null || ranking.walkingMinutes != null)) {
      const line = el('p', 'tb-hotels__rank');
      const statusName = ranking.eligibility?.status;
      const mark =
        statusName === 'eligible'
          ? t('Eligible', 'Atende')
          : statusName === 'pending'
            ? t('Pending', 'A confirmar')
            : statusName === 'excluded'
              ? t('Out', 'Fora')
              : '';
      const rest = [
        statusName === 'eligible' && ranking.provisional === false && ranking.position != null
          ? `#${ranking.position}`
          : null,
        ranking.score != null && Number.isFinite(ranking.score) ? String(Math.round(ranking.score)) : null,
        ranking.walkingMinutes != null ? `${ranking.walkingMinutes} min` : null,
      ]
        .filter((part): part is string => Boolean(part))
        .join(' · ');
      if (statusName === 'excluded') {
        line.append(el('span', 'tb-hotels__out', mark));
        if (rest) line.append(document.createTextNode(` · ${rest}`));
      } else {
        line.textContent = [mark, rest].filter(Boolean).join(' · ');
      }
      if (line.textContent || line.childNodes.length) body.append(line);
    }

    if (!ranked) {
      addMeta(body, categoryLine(hotel));
      addMeta(body, wifiLine(hotel));
    }
    if (isAirbnb) {
      addMeta(
        body,
        t(
          'Approximate location. Total as shown by Airbnb.',
          'Localização aproximada. Total informado pelo Airbnb.',
        ),
      );
    }
    const reasons = ranked ? whyParts(locale(), hotel) : null;
    if (reasons) {
      const box = el('details', 'tb-hotels__why');
      box.append(el('summary', 'tb-meta', t('Why this position?', 'Por que essa posição?')));
      for (const part of reasons) box.append(whyNode(part));
      body.append(box);
      if (Number.isFinite(hotel.lat) && Number.isFinite(hotel.lng)) {
        const origin = { lat: hotel.lat, lng: hotel.lng };
        body.append(
          distanceSection(
            locale(),
            origin,
            walkStops(hotel.ranking?.walks),
            hotel.ranking?.pointCount ?? 0,
            'attractions',
          ),
        );
        if (hotel.ranking?.transit) {
          body.append(
            distanceSection(locale(), origin, walkStops([hotel.ranking.transit]), 1, 'transport'),
          );
        }
      }
    } else {
      const why = explain(hotel);
      if (why) {
        const box = el('details', 'tb-hotels__why');
        box.append(el('summary', 'tb-meta', t('Why this score', 'Por que esta nota')));
        box.append(el('p', 'tb-meta', why));
        body.append(box);
      }
    }

    const links = el('div', 'tb-hotels__links');
    const listing = safeUrl(hotel.booking.url);
    if (listing) {
      const anchor = el('a', 'tb-btn-ghost', isAirbnb ? 'Airbnb' : 'Booking');
      anchor.href = listing;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      links.append(anchor);
    }
    const azul = !isAirbnb ? safeUrl(hotel.azulUrl) : null;
    if (azul) {
      const anchor = el('a', 'tb-btn-ghost', 'Azul');
      anchor.href = azul;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      links.append(anchor);
    }
    if (links.childNodes.length) body.append(links);
    return article;
  };

  const whyNode = (part: WhyPart) => {
    if (part.kind === 'text') return el('p', 'tb-meta', part.text);
    const line = el('p', 'tb-meta');
    line.append(document.createTextNode(part.before));
    part.links.forEach((link, index) => {
      if (index > 0) line.append(document.createTextNode(' · '));
      const anchor = el('a', undefined, link.title);
      anchor.href = link.href;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      line.append(anchor);
    });
    line.append(document.createTextNode(part.after));
    return line;
  };

  const renderTypes = (result: SearchResult) => {
    const counts = new Map<string, { label: string; n: number }>();
    for (const hotel of result.hotels) {
      const key = typeKey(hotel);
      const current = counts.get(key);
      if (current) current.n += 1;
      else counts.set(key, { label: typeLabel(hotel), n: 1 });
    }
    for (const key of [...mutedTypes]) if (!counts.has(key)) mutedTypes.delete(key);
    if (counts.size < 2) mutedTypes.clear();
    chips.hidden = counts.size < 2;
    chips.replaceChildren();
    const entries = [...counts.entries()].sort(
      (a, b) => b[1].n - a[1].n || a[1].label.localeCompare(b[1].label, locale()),
    );
    for (const [key, info] of entries) {
      const on = !mutedTypes.has(key);
      const chip = el('button', on ? 'tb-hotels__chip tb-badge' : 'tb-hotels__chip tb-badge-soft');
      chip.type = 'button';
      chip.dataset.typeKey = key;
      chip.setAttribute('aria-pressed', on ? 'true' : 'false');
      chip.append(document.createTextNode(`${info.label} `), el('span', undefined, String(info.n)));
      chips.append(chip);
    }
  };

  const renderSkipped = (result: SearchResult) => {
    const items = result.skipped ?? [];
    skipped.hidden = items.length === 0;
    const floor = result.query.minScore ?? '';
    summary.textContent = t(
      `${items.length} hidden (not on Booking, no match or below ${floor})`,
      `${items.length} ocultos (fora do Booking, sem match ou abaixo de ${floor})`,
    );
    skippedList.replaceChildren();
    for (const item of items) {
      const li = el('li');
      const href = safeUrl(item.azulUrl);
      if (href) {
        const anchor = el('a', undefined, item.name);
        anchor.href = href;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        li.append(anchor);
      } else {
        li.append(document.createTextNode(item.name));
      }
      let extra = '';
      if (item.reason === 'no-match' && item.bookingName) {
        extra = ` (${item.bookingName}, ${item.distanceM ?? '?'} m)`;
      } else if (item.reason === 'low-score' && item.booking && Number.isFinite(item.booking.score)) {
        extra = ` (${Number(item.booking.score).toFixed(1)})`;
      }
      const why = SKIP_REASON[item.reason];
      li.append(
        document.createTextNode(
          ` · ${money(item.priceTotal)} ${t('total', 'total')} · ${why ? t(why[0], why[1]) : item.reason}${extra}`,
        ),
      );
      skippedList.append(li);
    }
  };

  const renderNote = (result: SearchResult) => {
    if (!result.hotels.length) {
      note.hidden = true;
      note.textContent = '';
      return;
    }
    const ranking = result.ranking;
    const stale = !ranking || (typeof ranking.version === 'number' && ranking.version < 9) || ranking.pointCount == null;
    note.hidden = false;
    if (stale) {
      note.textContent = t(
        'Saved prices. Update scores to load categories and apply requirements.',
        'Preços salvos. Atualize as notas para carregar as categorias e aplicar os requisitos.',
      );
      return;
    }
    const counts = ranking.eligibilityCounts
      ? t(
          `${ranking.eligibilityCounts.eligible} eligible · ${ranking.eligibilityCounts.pending} pending · ${ranking.eligibilityCounts.excluded} out. `,
          `${ranking.eligibilityCounts.eligible} atende · ${ranking.eligibilityCounts.pending} a confirmar · ${ranking.eligibilityCounts.excluded} fora. `,
        )
      : '';
    const jev =
      ranking.jevStatus && !['ok', 'empty'].includes(ranking.jevStatus)
        ? t(' JEV unavailable for some results.', ' JEV indisponível em parte dos resultados.')
        : '';
    note.textContent = t(
      `Ranking uses ${ranking.pointCount} of ${ranking.totalPoints ?? ranking.pointCount} saved places. ${counts}Updating priorities does not refresh prices.${jev}`,
      `Ranking usa ${ranking.pointCount} de ${ranking.totalPoints ?? ranking.pointCount} pontos salvos. ${counts}Atualizar prioridades não atualiza preços.${jev}`,
    );
  };

  const renderStatus = (result: SearchResult) => {
    const nights =
      typeof result.query.nights === 'number'
        ? result.query.nights
        : nightsBetween(result.query.checkin, result.query.checkout);
    const nightLabel = nights == null ? '' : t(`, ${nights} night(s)`, `, ${nights} noite(s)`);
    const radiusLabel =
      typeof result.query.maxKm === 'number'
        ? t(` within ${formatKm(result.query.maxKm, result.query.maxKm % 1 ? 1 : 0)} km`, ` até ${formatKm(result.query.maxKm, result.query.maxKm % 1 ? 1 : 0)} km do centro`)
        : '';
    const candidates = result.totals?.candidates ?? result.hotels.length;
    const inRange = result.totals?.inRange ?? candidates;
    const capped =
      inRange > candidates
        ? t(
            ` (${inRange} in range, checked the ${candidates} most central)`,
            ` (${inRange} na faixa, checados os ${candidates} mais centrais)`,
          )
        : '';
    let message = t(
      `${result.hotels.length} of ${candidates} hotels${radiusLabel}${capped} · ${result.totals?.azul ?? 0} on Azul · ${result.totals?.airbnb ?? 0} on Airbnb${nightLabel}`,
      `${result.hotels.length} de ${candidates} hotéis${radiusLabel}${capped} · ${result.totals?.azul ?? 0} na Azul · ${result.totals?.airbnb ?? 0} no Airbnb${nightLabel}`,
    );
    if (result.warnings?.length) message += ` · ${result.warnings.join(' · ')}`;
    const unavailable = result.unavailableSources?.length
      ? result.unavailableSources
      : result.warnings?.some((warning) => /Azul.*bloque/i.test(warning))
        ? ['Azul/Booking']
        : [];
    const error = unavailable.length > 0;
    if (error) {
      message = `${t('Partial search', 'Busca parcial')}: ${unavailable.join(', ')} ${t('unavailable', 'indisponível')}. ${message}`;
    }
    setStatus(message, error, true);
  };

  function setStatus(message: string | null, error = false, live = error) {
    if (live) status.setAttribute('aria-live', 'polite');
    else status.removeAttribute('aria-live');
    status.hidden = !message;
    status.textContent = message ?? '';
    status.classList.toggle('tb-error', error);
  }

  const render = (result: SearchResult) => {
    displayed = result;
    rerankBtn.disabled = result.hotels.length === 0;
    renderTypes(result);
    list.replaceChildren(...sortHotels(result.hotels).map(cardFor));
    renderSkipped(result);
    renderNote(result);
    renderStatus(result);
    applyFilter();
    if (currentId) markCurrent(currentId, false);
    if (sheetId) fillSheet(sheetId, false);
  };

  const paint = () => {
    cityLbl.textContent = t('City', 'Cidade');
    sourcesLbl.textContent = t('Sources', 'Fontes');
    checkinLbl.textContent = 'Check-in';
    checkoutLbl.textContent = 'Check-out';
    minLbl.textContent = t('Min R$ (stay)', 'Mín R$ (total)');
    maxLbl.textContent = t('Max R$ (stay)', 'Máx R$ (total)');
    radiusLbl.textContent = t('Radius from centre', 'Raio do centro');
    guestsLbl.textContent = t('Guests', 'Hóspedes');
    scoreLbl.textContent = t('Min review score (0–10)', 'Nota mín. avaliações (0–10)');
    optAll.textContent = t('Hotels + Airbnb', 'Hotéis + Airbnb');
    optHotels.textContent = 'Azul + Booking';
    optAirbnb.textContent = 'Airbnb';
    sortLbl.textContent = t('Order by', 'Ordenar por');
    optPriority.textContent = t('Best for the trip', 'Melhor para o roteiro');
    optPrice.textContent = t('Lowest total price', 'Menor preço total');
    optReviews.textContent = t('Review score', 'Nota das avaliações');
    optWalking.textContent = t('Shortest average walk', 'Menor caminhada média');
    submit.textContent = t('Search hotels', 'Buscar hotéis');
    rerankBtn.textContent = t('Update scores and priorities', 'Atualizar notas e prioridades');
    excludedText.textContent = t(
      'Show hotels outside our requirements',
      'Mostrar hotéis fora dos critérios',
    );
    list.setAttribute('aria-label', t('Hotels', 'Hotéis'));
    if (checkin.value && checkout.value && checkout.value <= checkin.value) {
      checkout.setCustomValidity(
        t('Check-out must be after check-in.', 'O check-out precisa ser depois do check-in.'),
      );
    } else {
      checkout.setCustomValidity('');
    }
    paintRadius();
  };

  const relaxDates = () => {
    const todayIso = isoDate(new Date());
    checkin.min = checkin.value && checkin.value < todayIso ? checkin.value : todayIso;
    checkout.min = checkin.value || todayIso;
    if (checkin.value && checkout.value <= checkin.value) {
      checkout.value = isoDate(addDays(parseISODate(checkin.value), 2));
    }
    checkout.setCustomValidity('');
  };

  const selectedPriorities = () =>
    priorityIds
      .filter((id) => typeof id === 'string' && id.length > 0 && id.length <= 100 && id !== 'user-location')
      .slice(0, 30);

  const searchParams = () => {
    const qs = new URLSearchParams();
    qs.set('city', city.name);
    qs.set('sources', sources.value || 'all');
    qs.set('checkin', checkin.value);
    qs.set('checkout', checkout.value);
    qs.set('adults', adults.value.trim() || '2');
    const minValue = minTotal.value.trim();
    const maxValue = maxTotal.value.trim();
    if (minValue !== '') qs.set('minTotal', minValue);
    if (maxValue !== '') qs.set('maxTotal', maxValue);
    qs.set('centerLat', String(city.lat));
    qs.set('centerLng', String(city.lng));
    qs.set('maxKm', String(currentKm()));
    qs.set('minScore', minScore.value.trim() || '7');
    qs.set('citySlug', city.slug);
    const ids = selectedPriorities();
    if (ids.length) qs.set('priorityIds', ids.join(','));
    return qs;
  };

  const persist = (result: SearchResult) => {
    const write = (value: SearchResult) => localStorage.setItem(storeKey, JSON.stringify(value));
    try {
      write(result);
    } catch {
      try {
        write({
          ...result,
          hotels: result.hotels.map((hotel) => {
            const booking: Booking = { ...hotel.booking, img: null };
            delete booking.photos;
            return { ...hotel, booking };
          }),
        });
      } catch {
        /* quota or private mode */
      }
    }
  };

  const readStored = (): SearchResult | null => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (!raw) return null;
      const result = asResult(JSON.parse(raw) as unknown);
      if (!result) return null;
      const storedCity = result.query?.city;
      if (typeof storedCity === 'string' && storedCity.length > 0 && storedCity !== city.name) return null;
      return result;
    } catch {
      return null;
    }
  };

  const applyQuery = (query: SearchResult['query']) => {
    if (query.sources === 'all' || query.sources === 'hotels' || query.sources === 'airbnb') {
      sources.value = query.sources;
    }
    if (query.checkin) checkin.value = query.checkin;
    if (query.checkout) checkout.value = query.checkout;
    if (query.adults != null) adults.value = String(query.adults);
    if (query.minTotal != null && Number.isFinite(query.minTotal)) minTotal.value = String(query.minTotal);
    if (query.maxTotal != null && Number.isFinite(query.maxTotal)) maxTotal.value = String(query.maxTotal);
    if (query.maxKm != null && Number.isFinite(query.maxKm)) radius.value = String(query.maxKm);
    if (query.minScore != null && Number.isFinite(query.minScore)) minScore.value = String(query.minScore);
    relaxDates();
  };

  const unlock = () => {
    submit.disabled = false;
    sources.disabled = false;
    rerankBtn.disabled = !displayed?.hotels.length;
  };

  const clearResults = () => {
    displayed = null;
    currentId = null;
    closeSheet(false);
    list.replaceChildren();
    chips.replaceChildren();
    chips.hidden = true;
    skipped.hidden = true;
    skippedList.replaceChildren();
    summary.textContent = '';
    note.hidden = true;
    note.textContent = '';
    rerankBtn.disabled = true;
    map.setPins('hotel', []);
    showSkeleton();
    paintRadius();
  };

  const readStream = async (response: Response, signal: AbortSignal) => {
    const reader = response.body?.getReader();
    if (!reader) throw new Error(t('Search unavailable.', 'Busca indisponível.'));
    const decoder = new TextDecoder();
    let buffer = '';
    const handle = (message: Msg) => {
      if (disposed || signal.aborted) return;
      if (message.type === 'status') setStatus(message.message, false);
      else if (message.type === 'progress') {
        setStatus(`Booking: ${message.done}/${message.total} · ${message.name}`, false);
      } else if (message.type === 'error') setStatus(message.message, true);
      else {
        render(message);
        persist(message);
      }
    };
    const consume = (chunk: string) => {
      buffer += chunk;
      let nl = buffer.indexOf('\n');
      while (nl >= 0) {
        const line = buffer.slice(0, nl).trim();
        buffer = buffer.slice(nl + 1);
        if (line) {
          try {
            const message = asMsg(JSON.parse(line) as unknown);
            if (message) handle(message);
          } catch {
            /* skip a bad line and keep reading */
          }
        }
        nl = buffer.indexOf('\n');
      }
    };
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        consume(decoder.decode(value, { stream: true }));
      }
      consume(decoder.decode());
      const tail = buffer.trim();
      if (tail) {
        try {
          const message = asMsg(JSON.parse(tail) as unknown);
          if (message) handle(message);
        } catch {
          /* ignore a truncated trailing line */
        }
      }
    } finally {
      reader.releaseLock();
    }
  };

  const runSearch = async () => {
    if (disposed || submit.disabled) return;
    relaxDates();
    if (checkout.value <= checkin.value) {
      checkout.setCustomValidity(
        t('Check-out must be after check-in.', 'O check-out precisa ser depois do check-in.'),
      );
    } else {
      checkout.setCustomValidity('');
    }
    if (!form.reportValidity()) return;
    const mine = ++job;
    rankAbort?.abort();
    searchAbort?.abort();
    searchAbort = new AbortController();
    const signal = searchAbort.signal;
    submit.disabled = true;
    sources.disabled = true;
    rerankBtn.disabled = true;
    clearResults();
    setStatus(null);
    try {
      const response = await fetch(`${API}?${searchParams()}`, {
        signal,
        headers: { Accept: 'application/x-ndjson' },
      });
      if (disposed || signal.aborted) return;
      if (!response.ok || !response.body) {
        let message = t('Search unavailable.', 'Busca indisponível.');
        try {
          const data = (await response.json()) as { error?: string; message?: string };
          message = data.error || data.message || message;
        } catch {
          /* non-JSON error body */
        }
        setStatus(message, true);
        return;
      }
      if (!responseIsNdjson(response.headers.get('content-type'))) {
        const fallback = t('Search unavailable.', 'Busca indisponível.');
        let data: unknown;
        try {
          data = await response.json();
        } catch {
          setStatus(fallback, true);
          return;
        }
        const notice = interpretSearchBody(data, fallback);
        if (notice.kind === 'done') {
          render(notice.result);
          persist(notice.result);
          return;
        }
        setStatus(notice.message, notice.error);
        return;
      }
      await readStream(response, signal);
    } catch (error) {
      if (disposed || signal.aborted || isAbort(error)) return;
      setStatus(error instanceof Error ? error.message : t('Search unavailable.', 'Busca indisponível.'), true);
    } finally {
      if (!disposed && mine === job) {
        unlock();
        if (!displayed) hideSkeleton();
      }
    }
  };

  const rerank = async () => {
    if (disposed || !displayed?.hotels.length || rerankBtn.disabled) return;
    const saved = displayed;
    const mine = ++job;
    rankAbort?.abort();
    rankAbort = new AbortController();
    const signal = rankAbort.signal;
    rerankBtn.disabled = true;
    submit.disabled = true;
    setStatus(
      t(
        'Loading category scores, Wi-Fi and trip priorities…',
        'Carregando notas por categoria, Wi-Fi e prioridades do roteiro…',
      ),
      false,
    );
    try {
      const response = await fetch(`${API}/rank`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          citySlug: city.slug,
          priorityIds: selectedPriorities(),
          hotels: saved.hotels.map((hotel) => ({
            id: String(hotel.id),
            source: hotel.source,
            name: hotel.name,
            lat: hotel.lat,
            lng: hotel.lng,
            priceTotal: hotel.priceTotal,
            booking: {
              score: hotel.booking.score,
              reviews: hotel.booking.reviews,
              url: hotel.booking.url,
            },
          })),
        }),
      });
      const data = (await response.json()) as RankResponse;
      if (disposed || signal.aborted) return;
      if (!response.ok || !Array.isArray(data.hotels)) {
        throw new Error(
          data.error || t('Could not update priorities.', 'Não foi possível atualizar as prioridades.'),
        );
      }
      const byId = new Map(data.hotels.map((hotel) => [String(hotel.id), hotel]));
      const updated: SearchResult = {
        ...saved,
        ranking: data.ranking ?? saved.ranking,
        hotels: saved.hotels.map((hotel) => {
          const next = byId.get(String(hotel.id));
          if (!next) return hotel;
          return {
            ...hotel,
            ranking: next.ranking ?? hotel.ranking,
            booking: next.booking ? { ...hotel.booking, ...next.booking } : hotel.booking,
          };
        }),
      };
      render(updated);
      persist(updated);
    } catch (error) {
      if (disposed || signal.aborted || isAbort(error)) return;
      setStatus(
        error instanceof Error
          ? error.message
          : t('Could not update priorities.', 'Não foi possível atualizar as prioridades.'),
        true,
      );
    } finally {
      if (!disposed && mine === job) unlock();
    }
  };

  listen(form, 'submit', (event) => {
    event.preventDefault();
    void runSearch();
  });
  listen(sources, 'change', () => {
    void runSearch();
  });
  listen(checkin, 'change', relaxDates);
  listen(sortSel, 'change', () => {
    if (displayed) render(displayed);
  });
  listen(showExcluded, 'change', () => applyFilter());
  listen(radius, 'input', () => {
    syncRing();
    paintRadius();
    window.clearTimeout(radiusTimer);
    radiusTimer = window.setTimeout(() => {
      if (!disposed) applyFilter();
    }, 150);
  });
  listen(chips, 'click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const chip = target.closest<HTMLButtonElement>('[data-type-key]');
    if (!chip) return;
    const key = chip.dataset.typeKey ?? '';
    if (mutedTypes.has(key)) mutedTypes.delete(key);
    else mutedTypes.add(key);
    const on = !mutedTypes.has(key);
    chip.setAttribute('aria-pressed', on ? 'true' : 'false');
    chip.classList.toggle('tb-badge', on);
    chip.classList.toggle('tb-badge-soft', !on);
    applyFilter();
  });
  const hotelById = (id: string) => displayed?.hotels.find((hotel) => hotel.id === id) ?? null;

  const sheetPad = () => {
    const panel = document.querySelector<HTMLElement>('.tb-place-panel');
    if (!panel || panel.hidden || panel.dataset.hotelSheet !== 'true') {
      map.setPadding({ right: 0 });
      return;
    }
    const host = panel.parentElement?.getBoundingClientRect();
    const box = panel.getBoundingClientRect();
    if (!host) return;
    map.setPadding({ right: Math.max(0, host.right - box.left) });
  };

  const closeSheet = (focus: boolean) => {
    const panel = document.querySelector<HTMLElement>('.tb-place-panel');
    const origin = sheetOrigin;
    sheetId = null;
    sheetOrigin = null;
    if (panel?.dataset.hotelSheet === 'true') {
      delete panel.dataset.hotelSheet;
      panel.hidden = true;
      panel.replaceChildren();
    }
    map.setPadding({ right: 0 });
    if (focus && origin?.isConnected) origin.focus();
  };

  const fillSheet = (id: string, frame: boolean) => {
    const hotel = hotelById(id);
    const panel = document.querySelector<HTMLElement>('.tb-place-panel');
    if (!hotel || !panel) {
      closeSheet(false);
      return;
    }
    if (openPlaceId()) closePlace({ focus: false });
    const origin = list.querySelector<HTMLElement>(`[data-place-id="${CSS.escape(id)}"]`);
    sheetId = id;
    sheetOrigin = origin;
    const inside = panel.contains(document.activeElement);
    panel.dataset.hotelSheet = 'true';
    panel.replaceChildren();
    const photo = el('div', 'tb-place-panel__photo tb-slider is-instant');
    mountHotelSlider(photo, hotelPhotoUrls(hotel.booking), hotel.name, locale(), placeCategoryMeta.lodging.color);
    const close = iconButton({
      icon: 'close',
      label: pickLocale(locale(), { en: 'Close', 'pt-BR': 'Fechar' }),
      size: 'sm',
    });
    close.classList.add('tb-place-panel__close');
    close.addEventListener('click', () => {
      map.highlight(null);
      markCurrent(null, false);
      closeSheet(true);
    });
    const body = el('div', 'tb-panel__body');
    const title = el('h2', undefined, hotel.name);
    title.id = 'tb-place-title';
    title.tabIndex = -1;
    body.append(title);
    const price = el('p', 'tb-hotels__price', money(hotel.priceTotal));
    body.append(price);
    if (hotel.booking.address) body.append(el('p', 'tb-meta', hotel.booking.address));
    const ranked = scoreCard(locale(), hotel);
    if (ranked) body.append(el('p', undefined, `${ranked.eyebrow} · ${ranked.title}`));
    const links = el('div', 'tb-hotels__links');
    const listing = safeUrl(hotel.booking.url);
    if (listing) {
      const anchor = el('a', 'tb-btn-ghost', hotel.source === 'airbnb' ? 'Airbnb' : 'Booking');
      anchor.href = listing;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      links.append(anchor);
    }
    const azul = hotel.source === 'airbnb' ? null : safeUrl(hotel.azulUrl);
    if (azul) {
      const anchor = el('a', 'tb-btn-ghost', 'Azul');
      anchor.href = azul;
      anchor.target = '_blank';
      anchor.rel = 'noopener';
      links.append(anchor);
    }
    if (links.childNodes.length) body.append(links);
    panel.append(photo, close, body);
    panel.hidden = false;
    sheetPad();
    if (frame) map.select(id);
    if (!inside) title.focus();
  };

  const selectHotel = (id: string, scroll: boolean) => {
    markCurrent(id, scroll);
    fillSheet(id, true);
  };
  const hoveredHotel = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>('[data-place-id]');
  };
  listen(list, 'pointerover', (event) => {
    const id = hoveredHotel(event)?.dataset.placeId;
    if (id) map.hover(id);
  });
  listen(list, 'pointerleave', () => map.hover(null));
  listen(list, 'focusin', (event) => {
    const id = hoveredHotel(event)?.dataset.placeId;
    if (id) map.hover(id);
  });
  listen(list, 'focusout', (event) => {
    const next = event instanceof FocusEvent ? event.relatedTarget : null;
    if (next instanceof Node && list.contains(next)) return;
    map.hover(null);
  });
  listen(list, 'click', (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    if (target.closest('a, button, input, label, summary')) return;
    const card = target.closest<HTMLElement>('[data-place-id]');
    if (!card) return;
    const id = card.dataset.placeId;
    if (!id) return;
    selectHotel(id, false);
  });
  listen(list, 'keydown', (event) => {
    if (!(event instanceof KeyboardEvent) || (event.key !== 'Enter' && event.key !== ' ')) return;
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest('a, button, input, select, textarea, summary')) return;
    const card = target.closest<HTMLElement>('[data-place-id]');
    if (!card || target !== card) return;
    const id = card.dataset.placeId;
    if (!id) return;
    event.preventDefault();
    selectHotel(id, false);
  });
  listen(window, 'keydown', (event) => {
    if (!(event instanceof KeyboardEvent) || event.key !== 'Escape' || !sheetId || event.defaultPrevented) return;
    event.preventDefault();
    map.highlight(null);
    markCurrent(null, false);
    closeSheet(true);
  });
  listen(rerankBtn, 'click', () => {
    void rerank();
  });

  const unsubLocale = shell.onLocale(() => {
    if (disposed) return;
    paint();
    showContextPins();
    if (displayed) render(displayed);
    else if (sheetId) fillSheet(sheetId, false);
    heat?.relabel();
  });
  const unsubSelect = map.onSelect((id) => {
    if (disposed) return;
    if (!hotelById(id)) {
      sheetId = null;
      sheetOrigin = null;
      document.querySelector('.tb-place-panel')?.removeAttribute('data-hotel-sheet');
      return;
    }
    selectHotel(id, true);
  });

  if (cityHasStayHeat(city.slug)) {
    const bar = document.querySelector('.tb-map-controls');
    if (bar) {
      heatButton = iconButton({
        icon: 'mode_heat',
        label: pickLocale(locale(), { en: 'Show where to stay', 'pt-BR': 'Mostrar onde ficar' }),
        pressed: false,
      });
      bar.append(heatButton);
      const button = heatButton;
      listen(button, 'click', () => {
        heat ??= mountStayHeat({ slug: city.slug, button, locale });
        heat.toggle();
      });
    }
  }

  paint();
  showContextPins();
  watchContextPins();
  const stored = readStored();
  if (stored) {
    applyQuery(stored.query);
    render(stored);
  } else {
    syncRing();
    paintRadius();
  }

  const lockSearch = (message: string) => {
    setup.hidden = false;
    setup.textContent = message;
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLButtonElement>('input, select, button').forEach(
      (control) => {
        control.disabled = true;
      },
    );
  };

  void fetch(`${API}/status`, { signal: statusAbort.signal })
    .then(async (response) => {
      if (disposed) return;
      const fallback = t('Hotel search is unavailable.', 'A busca de hotéis está indisponível.');
      if (!response.ok) {
        lockSearch(hotelSetupFailure('http', null, fallback) ?? fallback);
        return;
      }
      const body = (await response.json()) as { ok?: boolean; error?: unknown };
      const failure = hotelSetupFailure('ok', body, fallback);
      if (failure) lockSearch(failure);
    })
    .catch(() => {
      if (disposed) return;
      const fallback = t('Hotel search is unreachable.', 'Não foi possível alcançar a busca de hotéis.');
      lockSearch(hotelSetupFailure('unreachable', null, fallback) ?? fallback);
    });

  return {
    dispose() {
      if (disposed) return;
      disposed = true;
      window.clearTimeout(radiusTimer);
      listeners.abort();
      searchAbort?.abort();
      rankAbort?.abort();
      statusAbort.abort();
      unsubLocale();
      unsubSelect();
      contextObserver?.disconnect();
      contextObserver = null;
      closeSheet(false);
      heat?.dispose();
      heatButton?.remove();
      delete document.documentElement.dataset.tbHotels;
      clearSearchRing(() => map.setRadius(null));
      map.setPins('hotel', []);
      map.setPins('place', []);
      host.replaceChildren();
    },
  };
}

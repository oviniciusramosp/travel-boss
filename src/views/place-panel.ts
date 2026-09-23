import type { Locale, TravelCity, TravelPlace } from '../catalog';
import {
  categoryMaterialName,
  googleMapsUrl,
  pickLocale,
  placeCategoryMeta,
  resolvePlacePhotos,
  resolveVisit,
  subcategoryLabel,
  travelUi,
  visitFieldsForDisplay,
} from '../catalog';
import type { MapHandle } from '../map/types';
import { iconButton } from '../ui/controls';
import { el } from '../ui/dom';
import { icon, ICONS, type IconName } from '../ui/icons';
import { priceLevel, priceLevelOf } from '../ui/price';
import { ratingSummary, starRating } from '../ui/rating';
import { openNowStatus, timeZoneForCity } from './open-now';
import { createRouteButton, routePlannerOn } from './route-planner';

function categoryGlyph(category: TravelPlace['category']): HTMLElement | null {
  const name = categoryMaterialName(category);
  if (!(ICONS as readonly string[]).includes(name)) return null;
  const node = icon(name as IconName, { size: 16 });
  node.style.color = placeCategoryMeta[category].color;
  return node;
}

function ticketLink(href: string, locale: Locale): HTMLAnchorElement {
  const link = el('a', 'tb-ticket', 'ⓘ');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener';
  const label = pickLocale(locale, travelUi.visit.ticketLink);
  link.setAttribute('aria-label', label);
  link.setAttribute('data-tip', label);
  return link;
}

type CloseOptions = { focus?: boolean };

type Panel = {
  open(place: TravelPlace, city: TravelCity, locale: Locale, origin: HTMLElement | null): void;
  close(opts?: CloseOptions): void;
  id(): string | null;
  retarget(origin: HTMLElement | null): void;
  relabel(locale: Locale): void;
};

let panel: Panel | null = null;
let closeHook: (() => void) | null = null;

/** Views clear the list selection. The panel does not know which row opened it. */
export function onPlaceClose(fn: () => void): () => void {
  closeHook = fn;
  return () => {
    if (closeHook === fn) closeHook = null;
  };
}

export function slideIndex(index: number, count: number): number {
  if (count < 1) return 0;
  return ((index % count) + count) % count;
}

export function dropSlide<T>(slides: readonly T[], index: number): { slides: T[]; index: number } {
  if (index < 0 || index >= slides.length) return { slides: [...slides], index: Math.max(0, index) };
  const next = slides.filter((_, at) => at !== index);
  return { slides: next, index: next.length === 0 ? 0 : Math.min(index, next.length - 1) };
}

function listedOrigin(node: HTMLElement | null | undefined): HTMLElement | null {
  if (!node || node === document.body || node === document.documentElement) return null;
  if (!node.closest('[data-place-id]')) return null;
  return node;
}

export function mountPlacePanel(column: HTMLElement, map: MapHandle): void {
  const root = document.createElement('aside');
  root.className = 'tb-place-panel';
  root.hidden = true;
  root.setAttribute('role', 'dialog');
  root.setAttribute('aria-modal', 'false');
  root.setAttribute('aria-labelledby', 'tb-place-title');
  column.append(root);

  let photoIndex = 0;
  let liveEpoch = 0;
  let current: { place: TravelPlace; city: TravelCity; locale: Locale } | null = null;
  let returnFocus: HTMLElement | null = null;
  let slides: { url: string; alt: string }[] = [];
  let front = 0;
  let fadeToken = 0;
  let imgs: HTMLImageElement[] = [];
  let dotBar: HTMLElement | null = null;
  let prevBtn: HTMLButtonElement | null = null;
  let nextBtn: HTMLButtonElement | null = null;
  let fallbackEl: HTMLElement | null = null;

  const syncSlider = () => {
    const many = slides.length > 1;
    if (prevBtn) prevBtn.hidden = !many;
    if (nextBtn) nextBtn.hidden = !many;
    if (dotBar) dotBar.hidden = !many;
    if (fallbackEl) fallbackEl.hidden = slides.length > 0;
    for (const img of imgs) img.hidden = slides.length === 0;
    dotBar?.querySelectorAll('button').forEach((dot, index) => {
      if (index === photoIndex) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const showSlide = (index: number) => {
    const incoming = imgs[1 - front];
    const outgoing = imgs[front];
    const photo = slides[slideIndex(index, slides.length)];
    if (!incoming || !outgoing || !photo) {
      syncSlider();
      return;
    }
    photoIndex = slideIndex(index, slides.length);
    const shown = outgoing.classList.contains('is-shown');
    if (!shown || outgoing.getAttribute('src') === photo.url) {
      if (!shown) {
        outgoing.alt = photo.alt;
        outgoing.src = photo.url;
        outgoing.classList.add('is-shown');
      }
      syncSlider();
      return;
    }
    const mine = ++fadeToken;
    let revealed = false;
    const reveal = () => {
      if (revealed || mine !== fadeToken) return;
      revealed = true;
      incoming.classList.add('is-shown');
      outgoing.classList.remove('is-shown');
      front = 1 - front;
      syncSlider();
    };
    incoming.alt = photo.alt;
    incoming.addEventListener('load', () => {
      if (incoming.getAttribute('src') === photo.url) reveal();
    }, { once: true });
    incoming.src = photo.url;
    if (incoming.complete && incoming.naturalWidth > 0) reveal();
  };

  const dropBroken = (src: string) => {
    const at = slides.findIndex((slide) => slide.url === src);
    if (at < 0) return;
    const next = dropSlide(slides, at);
    slides = next.slides;
    photoIndex = next.index;
    buildDots();
    imgs.forEach((img) => img.classList.remove('is-shown'));
    front = 0;
    if (!slides.length) {
      imgs.forEach((img) => img.removeAttribute('src'));
      syncSlider();
      return;
    }
    showSlide(photoIndex);
  };

  const buildDots = () => {
    if (!dotBar || !current) return;
    const { locale } = current;
    dotBar.replaceChildren();
    slides.forEach((_, index) => {
      const dot = el('button', 'tb-slider__dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', pickLocale(locale, { en: `Photo ${index + 1}`, 'pt-BR': `Foto ${index + 1}` }));
      dot.addEventListener('click', (event) => {
        event.stopPropagation();
        showSlide(index);
      });
      dotBar?.append(dot);
    });
    syncSlider();
  };

  root.addEventListener('keydown', (event) => {
    if (root.hidden || slides.length < 2) return;
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    showSlide(photoIndex + (event.key === 'ArrowRight' ? 1 : -1));
  });

  const paint = () => {
    const epoch = ++liveEpoch;
    imgs = [];
    dotBar = null;
    prevBtn = null;
    nextBtn = null;
    fallbackEl = null;
    front = 0;
    if (!current) {
      root.hidden = true;
      root.replaceChildren();
      return;
    }
    const { place, city, locale } = current;
    const photos = resolvePlacePhotos(place.id, place.photos) ?? [];
    const visit = resolveVisit(place.id, place.visit);
    const fields = visit ? visitFieldsForDisplay(visit, locale) : [];
    photoIndex = Math.min(photoIndex, Math.max(photos.length - 1, 0));
    root.hidden = false;
    root.replaceChildren();

    const close = iconButton({
      icon: 'close',
      label: pickLocale(locale, { en: 'Close', 'pt-BR': 'Fechar' }),
      size: 'sm',
    });
    close.classList.add('tb-place-panel__close');
    close.addEventListener('click', () => {
      dismiss({ focus: true });
    });

    slides = photos.map((photo) => ({
      url: photo.url,
      alt: photo.alt ? pickLocale(locale, photo.alt) : pickLocale(locale, place.name),
    }));
    photoIndex = slideIndex(photoIndex, slides.length);
    const frame = el('div', 'tb-place-panel__photo tb-slider is-instant');
    const onError = (event: Event) => {
      const img = event.currentTarget;
      if (!(img instanceof HTMLImageElement)) return;
      const src = img.getAttribute('src');
      if (src) dropBroken(src);
    };
    imgs = [0, 1].map(() => {
      const img = el('img', 'tb-slider__img');
      img.alt = '';
      img.addEventListener('error', onError);
      return img;
    });
    frame.append(...imgs);
    const nav = (iconName: 'chevron_left' | 'chevron_right', delta: number, side: string) => {
      const button = iconButton({
        icon: iconName,
        label: pickLocale(locale, {
          en: delta < 0 ? 'Previous photo' : 'Next photo',
          'pt-BR': delta < 0 ? 'Foto anterior' : 'Próxima foto',
        }),
        size: 'sm',
      });
      button.classList.add('tb-slider__nav', side);
      button.addEventListener('click', (event) => {
        event.stopPropagation();
        showSlide(photoIndex + delta);
      });
      return button;
    };
    prevBtn = nav('chevron_left', -1, 'tb-slider__nav--prev');
    nextBtn = nav('chevron_right', 1, 'tb-slider__nav--next');
    dotBar = el('div', 'tb-slider__dots');
    fallbackEl = el('div', 'tb-slider__fallback');
    const glyph = categoryGlyph(place.category);
    if (glyph) fallbackEl.append(glyph);
    frame.append(prevBtn, nextBtn, dotBar, fallbackEl);
    buildDots();
    showSlide(photoIndex);
    root.append(frame, close);
    requestAnimationFrame(() => frame.classList.remove('is-instant'));

    const body = el('div', 'tb-panel__body');
    const head = el('header', 'tb-panel__head');
    const title = el('h2', undefined, pickLocale(locale, place.name));
    title.id = 'tb-place-title';
    title.tabIndex = -1;
    head.append(title);
    body.append(head);

    const badges = el('div', 'tb-badges');
    const cat = el('span', 'tb-badge-soft');
    const catGlyph = categoryGlyph(place.category);
    if (catGlyph) cat.append(catGlyph);
    cat.append(document.createTextNode(pickLocale(locale, travelUi.categories[place.category])));
    badges.append(cat);
    if (place.favorite) {
      const fav = el('span', 'tb-badge-soft');
      fav.append(icon('favorite', { fill: true, size: 16 }));
      fav.append(document.createTextNode(pickLocale(locale, travelUi.favorite)));
      badges.append(fav);
    }
    for (const id of place.subcategories ?? []) {
      badges.append(el('span', 'tb-badge-soft', subcategoryLabel(id, locale)));
    }
    body.append(badges);

    const ratings = el('div', 'tb-ratings');
    ratings.setAttribute('data-tip', ratingSummary(place.rating, place.googleRating, locale));
    ratings.append(
      starRating({
        rating: place.rating,
        label: pickLocale(locale, travelUi.ratingMine),
        locale,
        icon: 'person',
      }),
      starRating({
        rating: place.googleRating,
        label: pickLocale(locale, travelUi.ratingGoogle),
        locale,
        icon: 'map',
      }),
    );
    const nightly = !place.visit?.avgPricePerPerson && place.visit?.pricePerNight;
    const money = place.visit?.avgPricePerPerson ?? place.visit?.pricePerNight;
    const level = priceLevelOf(money);
    if (level != null && money) {
      ratings.append(
        priceLevel(
          level,
          pickLocale(locale, nightly ? travelUi.visit.pricePerNight : travelUi.visit.avgPrice),
          locale,
        ),
      );
    }
    const live = el('span', 'tb-live');
    live.hidden = true;
    ratings.append(live);
    const osmRef = visit?.osmRef;
    if (osmRef) {
      const placeId = place.id;
      void openNowStatus(osmRef, timeZoneForCity(city.slug)).then((state) => {
        if (epoch !== liveEpoch || current?.place.id !== placeId || !live.isConnected) return;
        if (state === 'unknown') return;
        live.hidden = false;
        live.classList.toggle('is-open', state === 'open');
        live.classList.toggle('is-closed', state === 'closed');
        live.textContent = pickLocale(
          locale,
          state === 'open' ? travelUi.visit.liveOpen : travelUi.visit.liveClosed,
        );
      });
    }
    body.append(ratings);

    if (place.description) {
      body.append(el('p', 'tb-place-panel__copy', pickLocale(locale, place.description)));
    }

    if (fields.length) {
      const list = el('dl', 'tb-place-panel__facts');
      for (const field of fields) {
        const label = travelUi.visit[field.key as keyof typeof travelUi.visit];
        const dt = el('dt', undefined, label ? pickLocale(locale, label) : field.key);
        const dd = el('dd', field.key === 'tips' ? 'tb-tips' : undefined);
        if (field.key === 'ticket' && visit) {
          dd.textContent = field.value;
          const note = visit.ticket?.note ? pickLocale(locale, visit.ticket.note) : '';
          if (note) dd.append(el('span', 'tb-note', note));
          if (visit.ticketUrl) dd.append(ticketLink(visit.ticketUrl, locale));
          if (visit.ticketPromos?.length) {
            const promos = el('ul', 'tb-promos');
            for (const promo of visit.ticketPromos) promos.append(el('li', undefined, pickLocale(locale, promo.label)));
            dd.append(promos);
          }
        } else {
          dd.textContent = field.note ? `${field.value} — ${field.note}` : field.value;
        }
        list.append(dt, dd);
      }
      body.append(list);
    }

    const address = el('a', 'tb-place-panel__address');
    address.href = googleMapsUrl(place, city);
    address.target = '_blank';
    address.rel = 'noopener';
    address.setAttribute('aria-label', pickLocale(locale, travelUi.openInMaps));
    address.append(icon('location_on', { size: 16 }));
    address.append(document.createTextNode(place.address || pickLocale(locale, travelUi.openInMaps)));
    body.append(address);
    if (routePlannerOn()) body.append(createRouteButton(place.id, locale, true));
    root.append(body);
  };

  function dismiss(opts?: CloseOptions) {
    const origin = returnFocus;
    returnFocus = null;
    current = null;
    paint();
    syncPad();
    // hover(null) only clears the hover ring; the selected pin stays put.
    map.highlight(null);
    closeHook?.();
    if (opts?.focus === false || !origin?.isConnected || origin.closest('[hidden]')) return;
    origin.focus();
  }

  const syncPad = () => {
    if (root.hidden) {
      map.setPadding({ right: 0 });
      return;
    }
    const host = column.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    map.setPadding({ right: Math.max(0, host.right - box.left) });
  };
  const padObserver = new ResizeObserver(() => syncPad());
  padObserver.observe(column);

  panel = {
    open(place, city, locale, origin) {
      photoIndex = 0;
      returnFocus = origin;
      current = { place, city, locale };
      paint();
      syncPad();
      map.select(place.id);
      root.querySelector<HTMLElement>('#tb-place-title')?.focus();
    },
    close(opts) {
      dismiss(opts);
    },
    id() {
      return current?.place.id ?? null;
    },
    retarget(origin) {
      if (!current) return;
      const next = listedOrigin(origin);
      if (next) returnFocus = next;
    },
    relabel(locale) {
      if (!current) return;
      const inside = root.contains(document.activeElement);
      current = { ...current, locale };
      paint();
      syncPad();
      if (inside) root.querySelector<HTMLElement>('#tb-place-title')?.focus();
    },
  };
}

export function openPlace(
  place: TravelPlace,
  city: TravelCity,
  locale: Locale,
  origin?: HTMLElement | null,
): void {
  panel?.open(place, city, locale, listedOrigin(origin));
}

export function closePlace(opts?: CloseOptions): void {
  panel?.close(opts);
}

export function openPlaceId(): string | null {
  return panel?.id() ?? null;
}

/** New language only. Does not reset the photo or move the camera. */
export function repaintPlace(locale: Locale): void {
  panel?.relabel(locale);
}

/** Point the close button at a row that was recreated after the panel opened. */
export function setPlaceOrigin(origin: HTMLElement | null): void {
  panel?.retarget(origin);
}

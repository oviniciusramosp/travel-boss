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
import { aiBadge, aiSuggestionTip } from '../ui/ai-badge';
import { iconButton } from '../ui/controls';
import { prefersReducedMotion } from '../ui/motion';
import { mapsMark } from '../ui/maps-icon';
import { el } from '../ui/dom';
import { icon, ICONS, type IconName } from '../ui/icons';
import { priceLevel, priceLevelOf } from '../ui/price';
import { starRating } from '../ui/rating';
import { videoButton } from '../ui/video';
import { louvreMapButton } from '../ui/louvre-map';
import { openNowStatus, timeZoneForCity } from './open-now';
import { inlineNodes } from '../trip/inline';
import { createRouteButton, routePlannerOn } from './route-planner';

export function categoryGlyph(category: TravelPlace['category']): HTMLElement | null {
  const name = categoryMaterialName(category);
  if (!(ICONS as readonly string[]).includes(name)) return null;
  const node = icon(name as IconName, { size: 16, fill: true });
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

/** What the trip timeline hands the card: its links, the trip's notes on the sub-points, and one point to open. */
export type PlaceLinks = {
  maps?: string;
  route?: string;
  /** The trip's timed notes that name a sub-point (`sub` is its index), shown inside that point. */
  subNotes?: readonly { sub: number; time?: string; text: string }[];
  /** Open this sub-point's fold at once (a click on it in the timeline). */
  focusSub?: number;
  /** The trip's other notes under this stop (a parade spot, a cheap-food list): shown here, not on the timeline. */
  parkNotes?: readonly { time?: string; text: string }[];
};

type Panel = {
  open(
    place: TravelPlace,
    city: TravelCity,
    locale: Locale,
    origin: HTMLElement | null,
    links?: PlaceLinks,
  ): void;
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
  let collapsed = false;
  let folding = false;
  let liveEpoch = 0;
  let current: {
    place: TravelPlace;
    city: TravelCity;
    locale: Locale;
    links?: PlaceLinks;
  } | null = null;
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
    const shown = current?.place;
    map.setSubPoints(
      (shown?.subPoints ?? []).map((sub) => ({
        lat: sub.lat,
        lng: sub.lng,
        label: pickLocale(current!.locale, sub.name),
        color: placeCategoryMeta[shown!.category].color,
      })),
      // A click on the numbered dot opens that point in the card.
      (index) => {
        const fold = root.querySelectorAll<HTMLDetailsElement>('.tb-panel__subpoint > details')[index];
        if (fold) fold.open = true;
      },
    );
    if (!current) {
      root.hidden = true;
      root.replaceChildren();
      return;
    }
    const { place, city, locale, links } = current;
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
    frame.classList.toggle('is-empty', photos.length === 0);
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
    const collapse = iconButton({
      icon: collapsed ? 'chevron_left' : 'chevron_right',
      label: pickLocale(
        locale,
        collapsed
          ? { en: 'Show place', 'pt-BR': 'Mostrar lugar' }
          : { en: 'Hide card', 'pt-BR': 'Recolher' },
      ),
      size: 'sm',
    });
    collapse.classList.add('tb-place-panel__collapse');
    collapse.addEventListener('click', (event) => {
      event.stopPropagation();
      collapsed = !collapsed;
      root.classList.toggle('is-collapsed', collapsed);
      const glyph = collapse.querySelector('.material-symbols-rounded');
      if (glyph) glyph.textContent = collapsed ? 'chevron_left' : 'chevron_right';
      const label = pickLocale(
        current?.locale ?? locale,
        collapsed
          ? { en: 'Show place', 'pt-BR': 'Mostrar lugar' }
          : { en: 'Hide card', 'pt-BR': 'Recolher' },
      );
      collapse.setAttribute('aria-label', label);
      collapse.setAttribute('data-tip', label);
      folding = true;
      syncPad();
      if (prefersReducedMotion() && current) {
        folding = false;
        map.select(current.place.id);
      }
    });
    root.classList.toggle('is-collapsed', collapsed);
    root.append(frame, close, collapse);
    requestAnimationFrame(() => frame.classList.remove('is-instant'));

    const body = el('div', 'tb-panel__body');
    const title = el('h2', 'tb-panel__title', pickLocale(locale, place.name));
    title.id = 'tb-place-title';
    title.tabIndex = -1;
    body.append(title);

    const tags = el('div', 'tb-panel__tags');
    const tagsMain = el('div', 'tb-panel__tags-main');
    const cat = el('span', 'tb-panel__cat');
    cat.style.setProperty('--cat-color', placeCategoryMeta[place.category].color);
    const catGlyph = categoryGlyph(place.category);
    if (catGlyph) cat.append(catGlyph);
    cat.append(document.createTextNode(pickLocale(locale, travelUi.categories[place.category])));
    tagsMain.append(cat);
    if (place.favorite) {
      const fav = el('span', 'tb-panel__fav');
      fav.setAttribute('aria-label', pickLocale(locale, travelUi.favorite));
      fav.append(icon('favorite', { fill: true, size: 16 }));
      tagsMain.append(fav);
    }
    if (place.aiSuggested) tagsMain.append(aiBadge(aiSuggestionTip(city.slug, place, locale)));
    tags.append(tagsMain);
    const subs = place.subcategories ?? [];
    if (subs.length) {
      const row = el('div', 'tb-panel__subs');
      for (const id of subs) row.append(el('span', 'tb-panel__sub', subcategoryLabel(id, locale)));
      tags.append(row);
    }
    body.append(tags);

    if (place.description) {
      body.append(el('p', 'tb-panel__desc', pickLocale(locale, place.description)));
    }
    if (place.id === 'par-louvre') body.append(louvreMapButton(locale));
    // Right under the description, so a long card does not push the video below the fold.
    const videos = place.videos ?? [];
    if (videos.length) {
      const bar = el('div', 'tb-place-panel__links');
      videos.forEach((url, index) => {
        bar.append(videoButton(url, pickLocale(locale, place.name), locale, videos.length > 1 ? index + 1 : undefined));
      });
      body.append(bar);
    }
    // Points inside the place, in the walking order the trip route follows.
    const subPoints = place.subPoints ?? [];
    if (subPoints.length) {
      const list = el('dl', 'tb-panel__meta');
      const row = el('div', 'tb-panel__meta-row');
      row.append(el('dt', undefined, pickLocale(locale, { en: 'Points along the walk', 'pt-BR': 'Pontos no caminho' })));
      const dd = el('dd');
      const steps = el('ol', 'tb-panel__subpoints');
      subPoints.forEach((sub, index) => {
        const item = el('li', 'tb-panel__subpoint');
        // One open at a time (`name`). Opening lights the numbered dot on the map.
        const fold = el('details');
        fold.name = 'tb-subpoints';
        const head = el('summary');
        head.append(el('span', undefined, pickLocale(locale, sub.name)));
        if (sub.aiSuggested) head.append(aiBadge(pickLocale(locale, { en: 'Suggested by AI', 'pt-BR': 'Sugerido pela IA' })));
        const notes = (current?.links?.subNotes ?? []).filter((note) => note.sub === index);
        if (sub.photo || notes.length) head.append(icon('expand_more', { size: 16 }));
        fold.append(head);
        if (sub.photo) {
          const img = el('img', 'tb-panel__subpoint-photo');
          img.src = sub.photo;
          img.alt = pickLocale(locale, sub.name);
          img.loading = 'lazy';
          fold.append(img);
        }
        // What the trip says about this point: its time and the note, with its marks.
        for (const note of notes) {
          const text = el('p', 'tb-panel__subpoint-note');
          if (note.time) text.append(el('span', 'tb-panel__subpoint-time', note.time));
          text.append(...inlineNodes(note.text));
          fold.append(text);
        }
        if (current?.links?.focusSub === index) fold.open = true;
        fold.addEventListener('toggle', () => {
          if (fold.open) map.selectSubPoint(index);
          else if (!steps.querySelector('details[open]')) map.selectSubPoint(null);
        });
        item.append(fold);
        // Hover lights the numbered dot; the camera stays put.
        item.addEventListener('pointerenter', () => map.hoverSubPoint(index));
        item.addEventListener('pointerleave', () => map.hoverSubPoint(null));
        steps.append(item);
      });
      dd.append(steps);
      row.append(dd);
      list.append(row);
      body.append(list);
    }
    const ratings = el('div', 'tb-panel__ratings');
    ratings.append(
      starRating({
        rating: place.googleRating,
        label: pickLocale(locale, travelUi.ratingGoogle),
        locale,
        icon: 'map',
      }),
      starRating({
        rating: place.rating,
        label: pickLocale(locale, travelUi.ratingMine),
        locale,
        icon: 'person',
      }),
    );
    body.append(ratings);

    // The trip's loose notes under this stop, in the day's order.
    const parkNotes = current?.links?.parkNotes ?? [];
    if (parkNotes.length) {
      const list = el('dl', 'tb-panel__meta');
      const row = el('div', 'tb-panel__meta-row');
      row.append(el('dt', undefined, pickLocale(locale, { en: 'Trip notes', 'pt-BR': 'Notas do roteiro' })));
      const dd = el('dd');
      const notes = el('ul', 'tb-panel__trip-notes');
      for (const note of parkNotes) {
        const item = el('li', 'tb-panel__trip-note');
        if (note.time) item.append(el('span', 'tb-panel__subpoint-time', note.time));
        item.append(...inlineNodes(note.text));
        notes.append(item);
      }
      dd.append(notes);
      row.append(dd);
      list.append(row);
      body.append(list);
    }

    const live = el('span', 'tb-live');
    live.hidden = true;
    const osmRef = visit?.osmRef;
    if (osmRef) {
      body.append(live);
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

    if (fields.length) {
      const list = el('dl', 'tb-panel__meta');
      for (const field of fields) {
        const row = el('div', 'tb-panel__meta-row');
        const label = travelUi.visit[field.key as keyof typeof travelUi.visit];
        row.append(el('dt', undefined, label ? pickLocale(locale, label) : field.key));
        const dd = el('dd');
        const value = el('span', 'tb-panel__meta-value');
        if (field.key === 'avgPrice' || field.key === 'pricePerNight') {
          const money = field.key === 'avgPrice' ? visit?.avgPricePerPerson : visit?.pricePerNight;
          const level = priceLevelOf(money);
          if (level != null && money) {
            value.append(
              priceLevel(level, pickLocale(locale, travelUi.visit[field.key]), locale),
            );
          }
        }
        value.append(document.createTextNode(field.value));
        if (field.key === 'ticket' && visit?.ticketUrl) value.append(ticketLink(visit.ticketUrl, locale));
        dd.append(value);
        if (field.key === 'tips') {
          value.classList.add('tb-tips');
        } else if (field.note && field.key !== 'ticket') {
          dd.append(el('span', 'tb-note', field.note));
        } else if (field.key === 'ticket' && visit?.ticket?.note) {
          dd.append(el('span', 'tb-note', pickLocale(locale, visit.ticket.note)));
        }
        if (field.key === 'ticket' && visit?.ticketPromos?.length) {
          const promos = el('ul', 'tb-promos');
          for (const promo of visit.ticketPromos) {
            promos.append(el('li', undefined, pickLocale(locale, promo.label)));
          }
          dd.append(promos);
        }
        row.append(dd);
        list.append(row);
      }
      body.append(list);
    }

    const mapsRow = el('div', 'tb-panel__maps');
    mapsRow.append(el('span', 'tb-panel__kicker', pickLocale(locale, travelUi.address)));
    const address = el('a', 'tb-panel__maps-link');
    address.href = googleMapsUrl(place, city);
    address.target = '_blank';
    address.rel = 'noopener';
    address.setAttribute('aria-label', pickLocale(locale, travelUi.openInMaps));
    address.append(
      el('span', place.address ? 'tb-panel__address' : 'tb-panel__address is-empty', place.address || '—'),
      mapsMark(),
    );
    mapsRow.append(address);
    body.append(mapsRow);
    if (links?.route) {
      const bar = el('div', 'tb-place-panel__links');
      bar.append(
        placeAction(
          links.route,
          pickLocale(locale, { en: 'Route', 'pt-BR': 'Rota' }),
          pickLocale(locale, {
            en: 'Directions from the previous stop',
            'pt-BR': 'Como chegar desde a parada anterior',
          }),
        ),
      );
      body.append(bar);
    }
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
    if (root.hidden || root.classList.contains('is-collapsed')) {
      map.setPadding({ right: 0 });
      return;
    }
    const host = column.getBoundingClientRect();
    const box = root.getBoundingClientRect();
    map.setPadding({ right: Math.max(0, host.right - box.left) });
  };
  const padObserver = new ResizeObserver(() => syncPad());
  padObserver.observe(column);
  root.addEventListener('transitionend', (event) => {
    if (!folding || event.target !== root || event.propertyName !== 'transform') return;
    folding = false;
    syncPad();
    if (current) map.select(current.place.id);
  });

  panel = {
    open(place, city, locale, origin, links) {
      photoIndex = 0;
      collapsed = false;
      root.classList.remove('is-collapsed');
      returnFocus = origin;
      current = links ? { place, city, locale, links } : { place, city, locale };
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
  links?: PlaceLinks,
): void {
  panel?.open(place, city, locale, listedOrigin(origin), links);
}

function placeAction(href: string, label: string, aria = label): HTMLAnchorElement {
  const link = el('a', 'tb-btn-outline');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener';
  link.setAttribute('aria-label', aria);
  link.append(icon('route', { size: 16 }), document.createTextNode(label));
  return link;
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

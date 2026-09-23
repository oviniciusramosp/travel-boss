import type { Locale, TravelCity, TravelPlace } from '../catalog';
import {
  googleMapsUrl,
  pickLocale,
  placeCategoryMeta,
  resolvePlacePhotos,
  resolveVisit,
  travelUi,
  visitFieldsForDisplay,
} from '../catalog';
import type { MapHandle } from '../map/types';

type Panel = {
  open(place: TravelPlace, city: TravelCity, locale: Locale): void;
  close(): void;
};

let panel: Panel | null = null;

export function mountPlacePanel(column: HTMLElement, map: MapHandle): void {
  const root = document.createElement('aside');
  root.className = 'tb-place-panel';
  root.hidden = true;
  column.append(root);

  let photoIndex = 0;
  let current: { place: TravelPlace; city: TravelCity; locale: Locale } | null = null;

  const paint = () => {
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

    const close = document.createElement('button');
    close.type = 'button';
    close.className = 'tb-place-panel__close';
    close.textContent = '×';
    close.setAttribute(
      'aria-label',
      pickLocale(locale, { en: 'Close', 'pt-BR': 'Fechar' }),
    );
    close.addEventListener('click', () => {
      current = null;
      paint();
    });

    if (photos.length) {
      const frame = document.createElement('div');
      frame.className = 'tb-place-panel__photo';
      const img = document.createElement('img');
      const photo = photos[photoIndex];
      img.src = photo?.url ?? '';
      img.alt = photo?.alt ? pickLocale(locale, photo.alt) : pickLocale(locale, place.name);
      img.addEventListener('error', () => {
        img.hidden = true;
      });
      frame.append(img);
      if (photos.length > 1) {
        const nav = document.createElement('div');
        nav.className = 'tb-place-panel__photos';
        const prev = document.createElement('button');
        const next = document.createElement('button');
        prev.type = 'button';
        next.type = 'button';
        prev.className = 'tb-btn-ghost';
        next.className = 'tb-btn-ghost';
        prev.textContent = '←';
        next.textContent = '→';
        prev.addEventListener('click', () => {
          photoIndex = (photoIndex - 1 + photos.length) % photos.length;
          paint();
        });
        next.addEventListener('click', () => {
          photoIndex = (photoIndex + 1) % photos.length;
          paint();
        });
        const count = document.createElement('span');
        count.className = 'tb-meta';
        count.textContent = `${photoIndex + 1}/${photos.length}`;
        nav.append(prev, count, next);
        frame.append(nav);
      }
      root.append(frame);
    }
    root.append(close);

    const body = document.createElement('div');
    body.className = 'tb-panel__body';

    const title = document.createElement('h2');
    title.textContent = pickLocale(locale, place.name);
    body.append(title);

    const meta = document.createElement('p');
    meta.className = 'tb-meta';
    const bits = [pickLocale(locale, travelUi.categories[place.category])];
    if (place.rating != null) bits.push(`${place.rating.toFixed(1)}`);
    if (place.googleRating != null) {
      bits.push(`Google ${place.googleRating.toFixed(1)}`);
    }
    meta.textContent = bits.join(' · ');
    const dot = document.createElement('span');
    dot.className = 'tb-cat-dot';
    dot.style.background = placeCategoryMeta[place.category].color;
    meta.prepend(dot);
    body.append(meta);

    if (place.description) {
      const copy = document.createElement('p');
      copy.className = 'tb-place-panel__copy';
      copy.textContent = pickLocale(locale, place.description);
      body.append(copy);
    }

    if (fields.length) {
      const list = document.createElement('dl');
      list.className = 'tb-place-panel__facts';
      for (const field of fields) {
        const label = travelUi.visit[field.key as keyof typeof travelUi.visit];
        const dt = document.createElement('dt');
        dt.textContent = label ? pickLocale(locale, label) : field.key;
        const dd = document.createElement('dd');
        dd.textContent = field.note ? `${field.value} — ${field.note}` : field.value;
        list.append(dt, dd);
      }
      body.append(list);
    }

    if (place.address) {
      const address = document.createElement('p');
      address.className = 'tb-meta';
      address.textContent = place.address;
      body.append(address);
    }

    const maps = document.createElement('a');
    maps.className = 'tb-btn';
    maps.href = googleMapsUrl(place, city);
    maps.target = '_blank';
    maps.rel = 'noopener';
    maps.textContent = 'Google Maps';
    body.append(maps);
    root.append(body);

    map.highlight(place.id);
    map.flyTo(place.lat, place.lng, 16);
  };

  panel = {
    open(place, city, locale) {
      photoIndex = 0;
      current = { place, city, locale };
      paint();
    },
    close() {
      current = null;
      paint();
    },
  };
}

export function openPlace(place: TravelPlace, city: TravelCity, locale: Locale): void {
  panel?.open(place, city, locale);
}

export function closePlace(): void {
  panel?.close();
}

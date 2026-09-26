import type { Locale } from '../catalog';
import { pickLocale } from '../catalog';
import { iconButton } from '../ui/controls';
import { el } from '../ui/dom';
import { icon } from '../ui/icons';
import { dropSlide, slideIndex } from './place-panel';

export function hotelPhotoUrls(booking: { img?: string | null; photos?: string[] }): string[] {
  const listed = (booking.photos ?? []).filter((url) => typeof url === 'string' && /^https?:\/\//.test(url));
  if (listed.length) return listed;
  return booking.img && /^https?:\/\//.test(booking.img) ? [booking.img] : [];
}

/** Same crossfade as the place panel: two stacked images, dots, and arrows. */
export function mountHotelSlider(
  frame: HTMLElement,
  photos: string[],
  alt: string,
  locale: Locale,
  glyphColor?: string,
): void {
  let slides = photos.map((url) => ({ url }));
  let index = 0;
  let front = 0;
  let token = 0;
  const imgs: HTMLImageElement[] = [];
  let dots: HTMLElement | null = null;
  let prev: HTMLButtonElement | null = null;
  let next: HTMLButtonElement | null = null;

  const sync = () => {
    const many = slides.length > 1;
    if (prev) prev.hidden = !many;
    if (next) next.hidden = !many;
    if (dots) dots.hidden = !many;
    dots?.querySelectorAll('button').forEach((dot, at) => {
      if (at === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
  };

  const show = (at: number) => {
    const incoming = imgs[1 - front];
    const outgoing = imgs[front];
    const photo = slides[slideIndex(at, slides.length)];
    if (!incoming || !outgoing || !photo) {
      sync();
      return;
    }
    index = slideIndex(at, slides.length);
    const shown = outgoing.classList.contains('is-shown');
    if (!shown || outgoing.getAttribute('src') === photo.url) {
      if (!shown) {
        outgoing.alt = alt;
        outgoing.src = photo.url;
        outgoing.classList.add('is-shown');
      }
      sync();
      return;
    }
    const mine = ++token;
    let revealed = false;
    const reveal = () => {
      if (revealed || mine !== token) return;
      revealed = true;
      incoming.classList.add('is-shown');
      outgoing.classList.remove('is-shown');
      front = 1 - front;
      sync();
    };
    incoming.alt = alt;
    incoming.addEventListener(
      'load',
      () => {
        if (incoming.getAttribute('src') === photo.url) reveal();
      },
      { once: true },
    );
    incoming.src = photo.url;
    if (incoming.complete && incoming.naturalWidth > 0) reveal();
  };

  const drop = (src: string) => {
    const at = slides.findIndex((slide) => slide.url === src);
    if (at < 0) return;
    const nextSlides = dropSlide(slides, at);
    slides = nextSlides.slides;
    index = nextSlides.index;
    buildDots();
    imgs.forEach((img) => img.classList.remove('is-shown'));
    front = 0;
    if (!slides.length) {
      imgs.forEach((img) => img.removeAttribute('src'));
      frame.classList.add('is-empty');
      sync();
      return;
    }
    show(index);
  };

  const buildDots = () => {
    if (!dots) return;
    dots.replaceChildren();
    slides.forEach((_, at) => {
      const dot = el('button', 'tb-slider__dot');
      dot.type = 'button';
      dot.setAttribute(
        'aria-label',
        pickLocale(locale, { en: `Photo ${at + 1}`, 'pt-BR': `Foto ${at + 1}` }),
      );
      dot.addEventListener('click', (event) => {
        event.stopPropagation();
        show(at);
      });
      dots?.append(dot);
    });
    sync();
  };

  const onError = (event: Event) => {
    const img = event.currentTarget;
    if (!(img instanceof HTMLImageElement)) return;
    const src = img.getAttribute('src');
    if (src) drop(src);
  };

  frame.classList.toggle('is-empty', slides.length === 0);
  for (const slot of [0, 1]) {
    const img = el('img', 'tb-slider__img');
    img.alt = '';
    img.decoding = 'async';
    img.draggable = false;
    img.referrerPolicy = 'no-referrer';
    img.addEventListener('error', onError);
    if (slot === 0) img.loading = 'eager';
    imgs.push(img);
  }
  const nav = (name: 'chevron_left' | 'chevron_right', delta: number, side: string) => {
    const button = iconButton({
      icon: name,
      label: pickLocale(locale, {
        en: delta < 0 ? 'Previous photo' : 'Next photo',
        'pt-BR': delta < 0 ? 'Foto anterior' : 'Próxima foto',
      }),
      size: 'sm',
    });
    button.classList.add('tb-slider__nav', side);
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      show(index + delta);
    });
    return button;
  };
  prev = nav('chevron_left', -1, 'tb-slider__nav--prev');
  next = nav('chevron_right', 1, 'tb-slider__nav--next');
  dots = el('div', 'tb-slider__dots');
  const fallback = el('div', 'tb-slider__fallback');
  const glyph = icon('hotel', { size: 20 });
  if (glyphColor) glyph.style.color = glyphColor;
  fallback.append(glyph);
  frame.append(...imgs, prev, next, dots, fallback);
  buildDots();
  if (slides.length) show(0);
  else sync();
  requestAnimationFrame(() => frame.classList.remove('is-instant'));

  const onKey = (event: KeyboardEvent) => {
    if (slides.length < 2) return;
    if (event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const target = event.target;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) return;
    event.preventDefault();
    show(index + (event.key === 'ArrowRight' ? 1 : -1));
  };
  frame.addEventListener('keydown', onKey);
  const card = frame.closest<HTMLElement>('[data-place-id]');
  card?.addEventListener('keydown', (event) => {
    if (event.target !== card) return;
    onKey(event);
  });
}

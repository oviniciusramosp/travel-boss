import { pickLocale } from '../catalog';
import type { Locale } from '../catalog';
import { iconButton, iconLink } from './controls';
import { el } from './dom';
import { icon } from './icons';

/** Instagram post or reel → its embed page, which plays inside an iframe. Null for any other link. */
export function videoEmbedUrl(url: string): string | null {
  const match = /^https:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(p|reels?)\/([\w-]+)/.exec(url);
  if (!match) return null;
  const kind = match[1] === 'p' ? 'p' : 'reel';
  return `https://www.instagram.com/${kind}/${match[2]}/embed/`;
}

function openVideo(embed: string, url: string, title: string, locale: Locale): void {
  const dialog = el('dialog', 'tb-video');
  dialog.setAttribute('aria-labelledby', 'tb-video-title');
  const heading = el('h2', 'tb-video__title', title);
  heading.id = 'tb-video-title';
  // Open on the title, as the place panel does: a focused icon would pop its tooltip.
  heading.tabIndex = -1;
  heading.autofocus = true;
  const close = iconButton({
    icon: 'close',
    label: pickLocale(locale, { en: 'Close', 'pt-BR': 'Fechar' }),
    size: 'sm',
  });
  close.addEventListener('click', () => dialog.close());
  const bar = el('div', 'tb-video__bar');
  bar.append(
    heading,
    iconLink({
      icon: 'open_in_new',
      label: pickLocale(locale, { en: 'Open on Instagram', 'pt-BR': 'Abrir no Instagram' }),
      href: url,
      size: 'sm',
    }),
    close,
  );
  const frame = el('iframe', 'tb-video__frame');
  frame.src = embed;
  frame.title = pickLocale(locale, { en: `Video: ${title}`, 'pt-BR': `Vídeo: ${title}` });
  frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  dialog.append(bar, frame);
  // The backdrop is part of the dialog box, so a click on it targets the dialog itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  // Escape closes this dialog only: the window shortcut in main.ts would close the place card behind it.
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') event.stopPropagation();
  });
  // Dropping the iframe is what stops the video.
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
}

/** One card button per video: Instagram opens in a modal, any other link in a new tab. */
export function videoButton(url: string, title: string, locale: Locale, index?: number): HTMLElement {
  const embed = videoEmbedUrl(url);
  let node: HTMLAnchorElement | HTMLButtonElement;
  if (embed) {
    node = el('button', 'tb-btn-outline');
    node.type = 'button';
    node.addEventListener('click', () => openVideo(embed, url, title, locale));
  } else {
    node = el('a', 'tb-btn-outline');
    node.href = url;
    node.target = '_blank';
    node.rel = 'noopener';
  }
  const text = pickLocale(locale, { en: 'Video', 'pt-BR': 'Vídeo' });
  node.append(icon('play_circle', { size: 16 }), document.createTextNode(index ? `${text} ${index}` : text));
  return node;
}

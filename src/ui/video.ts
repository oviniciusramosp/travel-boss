import { pickLocale } from '../catalog';
import type { Locale } from '../catalog';
import { iconLink } from './controls';
import { openDialog } from './dialog';
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
  const frame = el('iframe', 'tb-video__frame');
  frame.src = embed;
  frame.title = pickLocale(locale, { en: `Video: ${title}`, 'pt-BR': `Vídeo: ${title}` });
  frame.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
  // Closing drops the dialog and the iframe with it, which is what stops the video.
  openDialog({
    className: 'tb-video',
    title,
    locale,
    actions: [
      iconLink({
        icon: 'open_in_new',
        label: pickLocale(locale, { en: 'Open on Instagram', 'pt-BR': 'Abrir no Instagram' }),
        href: url,
        size: 'sm',
      }),
    ],
    body: [frame],
  });
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

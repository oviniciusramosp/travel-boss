import { pickLocale } from '../catalog';
import type { Locale } from '../catalog';
import { iconLink } from './controls';
import { openDialog } from './dialog';
import { el } from './dom';
import { icon } from './icons';

/** Public Instagram media prepared by travel:videos:sync; never load the remote embed. */
export function videoSourceUrl(url: string): string | null {
  const match = /^https:\/\/(?:www\.)?instagram\.com\/(?:[\w.]+\/)?(?:p|reels?)\/([\w-]+)\/?(?:[?#].*)?$/.exec(url);
  if (!match) return null;
  return `${import.meta.env.BASE_URL}videos/instagram/${match[1]}.mp4`;
}

function openVideo(source: string, url: string, title: string, locale: Locale): void {
  const video = el('video', 'tb-video__frame');
  video.controls = true;
  video.playsInline = true;
  video.preload = 'metadata';
  video.setAttribute('aria-label', pickLocale(locale, { en: `Video: ${title}`, 'pt-BR': `Vídeo: ${title}` }));
  const status = el('p', 'tb-video__status');
  status.setAttribute('role', 'status');
  status.hidden = true;
  video.addEventListener('error', () => {
    status.hidden = false;
    status.textContent = pickLocale(locale, {
      en: 'This video is not available locally yet. Try again after the video library is updated.',
      'pt-BR': 'Este vídeo ainda não está disponível localmente. Tente novamente após a atualização da biblioteca de vídeos.',
    });
  });
  video.src = source;
  const dialog = openDialog({
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
    body: [video, status],
  });
  dialog.addEventListener('close', () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  });
}

/** One card button per video: Instagram opens in a modal, any other link in a new tab. */
export function videoButton(url: string, title: string, locale: Locale, index?: number): HTMLElement {
  const source = videoSourceUrl(url);
  let node: HTMLAnchorElement | HTMLButtonElement;
  if (source) {
    node = el('button', 'tb-btn-outline');
    node.type = 'button';
    node.addEventListener('click', () => openVideo(source, url, title, locale));
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

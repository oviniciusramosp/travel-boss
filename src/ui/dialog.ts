import { pickLocale } from '../catalog';
import type { Locale } from '../catalog';
import { iconButton } from './controls';
import { el } from './dom';

let count = 0;

/**
 * Modal `<dialog>`: a title bar (title, `actions`, close) over `body`. Focus starts
 * on the title, Escape and a click outside close it, and closing removes it.
 */
export function openDialog(opts: {
  className: string;
  title: string;
  locale: Locale;
  actions?: Node[];
  body: Node[];
}): HTMLDialogElement {
  const dialog = el('dialog', `tb-dialog ${opts.className}`);
  const heading = el('h2', 'tb-dialog__title', opts.title);
  count += 1;
  heading.id = `tb-dialog-title-${count}`;
  dialog.setAttribute('aria-labelledby', heading.id);
  // Open on the title, as the place panel does: a focused icon would pop its tooltip.
  heading.tabIndex = -1;
  heading.autofocus = true;
  const close = iconButton({
    icon: 'close',
    label: pickLocale(opts.locale, { en: 'Close', 'pt-BR': 'Fechar' }),
    size: 'sm',
  });
  close.addEventListener('click', () => dialog.close());
  const bar = el('div', 'tb-dialog__bar');
  bar.append(heading, ...(opts.actions ?? []), close);
  dialog.append(bar, ...opts.body);
  // The backdrop is part of the dialog box, so a click on it targets the dialog itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  // Escape closes this dialog only: the window shortcut in main.ts would close the place card behind it.
  dialog.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') event.stopPropagation();
  });
  // Gone on close: an iframe inside stops playing.
  dialog.addEventListener('close', () => dialog.remove());
  document.body.append(dialog);
  dialog.showModal();
  return dialog;
}

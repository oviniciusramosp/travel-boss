import type * as Leaflet from 'leaflet';
import { louvreRoute, louvreSources, pickLocale, type Locale, type LouvreFloor } from '../catalog';
import { el } from './dom';
import { icon } from './icons';
import { iconButton } from './controls';
import { openDialog } from './dialog';

/** Official floor plans with a proposed sequence; deliberately no invented corridor polyline. */
export function louvreMapButton(locale: Locale): HTMLButtonElement {
  const t = (en: string, pt: string) => pickLocale(locale, { en, 'pt-BR': pt });
  const trigger = el('button', 'tb-btn-outline', t('Explore the indoor route', 'Ver percurso dentro do Louvre'));
  trigger.type = 'button';
  trigger.prepend(icon('map', { size: 16 }));
  trigger.addEventListener('click', async () => {
    const { default: L } = await import('leaflet');
    const body = el('div', 'tb-panel__body tb-indoor__body');
    const intro = el('p', 'tb-indoor__intro', t(
      '5 Oct · 13:30–17:00 · proposed 3½-hour visit, including walking and estimated queues. Numbered points mark rooms/areas, not exact artwork positions. Follow museum signs for passages and diversions.',
      '05 Out · 13h30–17h · proposta de 3h30, incluindo deslocamentos e filas estimadas. Os números marcam salas/áreas, não a posição exata das obras. Siga as placas do museu nas passagens e desvios.'));
    const layout = el('div', 'tb-indoor__layout');
    const list = el('nav', 'tb-indoor__steps');
    list.setAttribute('aria-label', t('Visit sequence', 'Sequência da visita'));
    const canvas = el('div', 'tb-indoor__canvas');
    const toolbar = el('div', 'tb-indoor__toolbar');
    toolbar.setAttribute('aria-label', t('Floors and zoom', 'Andares e zoom'));
    const mapNode = el('div', 'tb-indoor__map');
    mapNode.setAttribute('aria-label', t('Louvre floor plan; drag to pan', 'Planta do Louvre; arraste para mover'));
    const detail = el('div', 'tb-indoor__detail');
    detail.setAttribute('aria-live', 'polite');
    const title = el('h3');
    const directions = el('p');
    const pagination = el('div', 'tb-indoor__toolbar');
    const previous = el('button', 'tb-btn-outline', t('Previous', 'Anterior'));
    const next = el('button', 'tb-btn-outline', t('Next stop', 'Próxima parada'));
    previous.type = next.type = 'button';
    pagination.append(previous, next);
    detail.append(title, directions, pagination);
    canvas.append(toolbar, mapNode, detail);
    layout.append(list, canvas);
    const warning = el('p', 'tb-indoor__intro', t(
      'Greek vases: Galerie Campana (Sully, 1) is currently closed and excluded from this route. Room 709 is closed 29 Sep–6 Oct. Check openings again before your visit. Glass roofs: Cour Puget and Cour Marly.',
      'Vasos gregos: a Galerie Campana (Sully, 1) está fechada e fora deste percurso. Sala 709 fechada de 29/09 a 06/10. Confira as aberturas novamente antes da visita. Tetos de vidro: Cour Puget e Cour Marly.'));
    const sources = el('div', 'tb-indoor__sources');
    for (const [key, label] of [
      ['map', t('Official map © Musée du Louvre', 'Mapa oficial © Musée du Louvre')],
      ['pdf', t('Download PDF', 'Baixar PDF')],
      ['closures', t('Gallery openings', 'Abertura das salas')],
      ['services', t('Lockers and services', 'Armários e serviços')],
    ] as const) {
      const link = el('a', undefined, label);
      link.href = louvreSources[key]; link.target = '_blank'; link.rel = 'noopener';
      sources.append(link);
    }
    body.append(intro, layout, warning, sources);
    const external = el('details', 'tb-indoor__external');
    external.append(el('summary', undefined, t('Try room-to-room navigation · Museum Buddy', 'Testar navegação entre salas · Museum Buddy')));
    external.append(el('p', 'tb-indoor__intro', t(
      'Independent app with in-app purchases. Its developer advertises room-to-room navigation and a custom planner. Reproduce the sequence manually; automatic import and preservation of this order have not been verified. Test before buying: recent store reviews report download and premium-access failures. Check museum closures separately.',
      'App independente, com compras internas. O desenvolvedor anuncia navegação entre salas e planejador próprio. Reproduza a sequência manualmente; importação automática e preservação desta ordem não foram verificadas. Teste antes de comprar: avaliações recentes relatam falhas de download e de acesso premium. Confira as salas fechadas no site do Louvre.')));
    const externalActions = el('div', 'tb-indoor__toolbar');
    const copy = el('button', 'tb-btn-outline', t('Copy visit sequence', 'Copiar sequência da visita'));
    copy.type = 'button';
    const sequence = louvreRoute.map((step, i) => `${i + 1}. ${pickLocale(locale, step.name)} — ${step.room} — ${t('Level', 'Nível')} ${step.floor}`).join('\n');
    const manual = el('textarea');
    manual.readOnly = true;
    manual.value = sequence;
    manual.hidden = true;
    manual.setAttribute('aria-label', t('Visit sequence to copy manually', 'Sequência da visita para copiar manualmente'));
    const feedback = el('span');
    feedback.setAttribute('role', 'status');
    copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(sequence);
        feedback.textContent = t('Sequence copied', 'Sequência copiada');
      } catch {
        manual.hidden = false;
        manual.focus(); manual.select();
        feedback.textContent = t('Select and copy the text below', 'Selecione e copie o texto abaixo');
      }
    });
    externalActions.append(copy);
    for (const [label, url] of [
      ['iPhone / iPad', 'https://apps.apple.com/us/app/louvre-museum-audio-tours/id1076660928'],
      ['Android', 'https://play.google.com/store/apps/details?id=air.com.lvr.paris.vusiem'],
    ]) {
      const link = el('a', 'tb-btn-outline', label);
      link.href = url; link.target = '_blank'; link.rel = 'noopener';
      externalActions.append(link);
    }
    external.append(externalActions, feedback, manual);
    body.append(external);
    const dialog = openDialog({ className: 'tb-indoor', title: t('Louvre · indoor route', 'Louvre · percurso interno'), locale, body: [body] });
    const map = L.map(mapNode, { crs: L.CRS.Simple, zoomControl: false, attributionControl: false, minZoom: -2, maxZoom: 3, zoomSnap: 0.25, scrollWheelZoom: true });
    const bounds = L.latLngBounds([0, 0], [477.6, 949.2]);
    const markers = L.layerGroup().addTo(map);
    const markerRefs = new Map<number, Leaflet.Marker>();
    let overlay: Leaflet.ImageOverlay | undefined;
    let selected = 0;
    let floor: LouvreFloor | undefined;
    const floorButtons = new Map<LouvreFloor, HTMLButtonElement>();
    const stepButtons = louvreRoute.map((step, index) => {
      const button = el('button', 'tb-indoor__step');
      button.type = 'button';
      button.append(el('strong', undefined, `${index + 1}. ${pickLocale(locale, step.name)}`),
        el('span', undefined, `${step.room} · ${t('Level', 'Nível')} ${step.floor} · ${step.minutes} min`));
      button.addEventListener('click', () => select(index));
      list.append(button);
      return button;
    });
    const fit = () => map.fitBounds(bounds, { padding: [12, 12], animate: false });
    function select(index: number) {
      selected = index;
      const step = louvreRoute[index];
      const changedFloor = floor !== step.floor;
      if (changedFloor) {
        floor = step.floor;
        overlay?.remove();
        overlay = L.imageOverlay(`/maps/louvre/niveau${Math.max(-1, floor)}.svg`, bounds).addTo(map);
        fit();
      }
      floorButtons.forEach((button, level) => button.setAttribute('aria-pressed', String(level === floor)));
      stepButtons.forEach((button, i) => button.setAttribute('aria-current', i === index ? 'step' : 'false'));
      title.textContent = `${index + 1}. ${pickLocale(locale, step.name)} · ${t('Level', 'Nível')} ${floor}`;
      directions.textContent = pickLocale(locale, step.directions);
      previous.disabled = index === 0;
      next.disabled = index === louvreRoute.length - 1;
      if (changedFloor) { markers.clearLayers(); markerRefs.clear(); }
      louvreRoute.forEach((point, i) => {
        if (point.floor !== floor) return;
        if (!changedFloor) {
          markerRefs.get(i)?.getElement()?.classList.toggle('is-active', i === selected);
          return;
        }
        const label = `${i + 1}. ${pickLocale(locale, point.name)} · ${point.room}`;
        const marker = L.marker([477.6 - point.point[1], point.point[0]], {
          icon: L.divIcon({ className: `tb-indoor__pin${i === selected ? ' is-active' : ''}`, html: String(i + 1), iconSize: [28, 28], iconAnchor: [14, 14] }),
          title: label, alt: label, keyboard: true,
        }).addTo(markers);
        marker.getElement()?.setAttribute('aria-label', label);
        markerRefs.set(i, marker);
        marker.on('click', () => select(i));
      });
    }
    for (const level of [-2, -1, 0, 1] as const) {
      const button = el('button', 'tb-btn-outline', `${t('Level', 'Nível')} ${level}`);
      button.type = 'button';
      button.addEventListener('click', () => select(louvreRoute.findIndex(step => step.floor === level)));
      floorButtons.set(level, button);
      toolbar.append(button);
    }
    for (const [glyph, label, action] of [
      ['add', t('Zoom in', 'Aproximar'), () => map.zoomIn()],
      ['remove', t('Zoom out', 'Afastar'), () => map.zoomOut()],
      ['fit_screen', t('Show whole floor', 'Mostrar andar inteiro'), fit],
    ] as const) {
      const button = iconButton({ icon: glyph, label, size: 'sm' });
      button.addEventListener('click', action);
      toolbar.append(button);
    }
    previous.addEventListener('click', () => select(selected - 1));
    next.addEventListener('click', () => select(selected + 1));
    select(0);
    const resize = new ResizeObserver(() => { map.invalidateSize(); });
    resize.observe(mapNode);
    dialog.addEventListener('close', () => { resize.disconnect(); map.remove(); trigger.focus(); });
  });
  return trigger;
}

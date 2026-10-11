import { pickLocale, type Locale } from '../catalog';
import type { Trip } from '../trip/parse';
import { el } from '../ui/dom';
import { collectOfflineRoutes, offlineRoutesReady, removeOfflineRoutes } from './offline-routes';
import { cacheMessage, cachedPhotos, downloadedPhotoUrls, offlineManifestReady, offlineTripPhotos, type OfflineProgress, type OfflineManifest, type OfflineCacheStatus } from './offline-trip';

type Manifest = OfflineManifest;
type CacheStatus = OfflineCacheStatus;
type Options = { trip: Trip; locale: Locale; routes: (progress: (done: number, total: number) => void) => Promise<void> };

/** A content change invalidates the previous download, even if the trip keeps its ID. */
export function offlineFingerprint(trip: Trip): string {
  let hash = 2166136261;
  for (const character of JSON.stringify(trip)) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return (hash >>> 0).toString(16);
}

/** Labelled action and live status; map coverage is intentionally never promised. */
export function offlineControl({ trip, locale, routes }: Options): HTMLElement {
  const wrap = el('div', 'tb-offline');
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) { wrap.hidden = true; return wrap; }
  const text = (en: string, pt: string) => pickLocale(locale, { en, 'pt-BR': pt });
  const button = el('button', 'tb-btn-outline', text('Download trip for offline', 'Baixar viagem para offline'));
  button.type = 'button';
  const remove = el('button', 'tb-btn-ghost', text('Remove downloaded trip', 'Remover viagem baixada'));
  remove.type = 'button';
  remove.hidden = true;
  const status = el('p', 'tb-doc-summary');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  status.textContent = text('Checking offline availability…', 'Verificando disponibilidade offline…');
  const coverage = el('p', 'tb-doc-summary', text(
    'Includes routes and cover photos. Map: partial coverage of viewed areas; other areas need a connection. External links and videos need a connection.',
    'Inclui rotas e fotos de capa. Mapa: cobertura parcial das áreas visualizadas; outras áreas precisam de conexão. Links externos e vídeos precisam de conexão.',
  ));
  wrap.append(button, remove, status, coverage);
  const key = `tb:offline-trip:${trip.id}`;
  const fingerprint = offlineFingerprint(trip);
  const bytes = (value: number) => `${(value / 1_000_000).toLocaleString(locale, { maximumFractionDigits: 1 })} MB`;
  let busy = false;
  let revision = 0;
  const ready = (size: number) => text(`Trip saved · ${bytes(size)} · limited map coverage`, `Viagem salva · ${bytes(size)} · mapa com cobertura limitada`);

  async function verify(): Promise<void> {
    const own = ++revision;
    try {
      const raw = localStorage.getItem(key);
      const shell = await cacheMessage<CacheStatus>({ type: 'CACHE_STATUS' });
      if (own !== revision || busy) return;
      if (!raw) {
        status.textContent = shell.essentialReady
          ? text('App and itinerary available offline. Download photos and routes below.', 'App e roteiro disponíveis offline. Baixe fotos e rotas abaixo.')
          : text('App still being prepared for offline use. Keep this page open with a connection.', 'App ainda em preparação para offline. Mantenha esta página aberta com conexão.');
        return;
      }
      const manifest = JSON.parse(raw) as Manifest;
      remove.hidden = false;
      if (manifest.fingerprint !== fingerprint || !manifest.complete) {
        status.textContent = text('Partial or outdated download. Download again.', 'Download parcial ou desatualizado. Baixe novamente.');
        return;
      }
      const complete = await offlineManifestReady(manifest, fingerprint, shell);
      if (own !== revision || busy) return;
      status.textContent = complete ? ready(manifest.bytes) : text('Some saved files are missing. Download again.', 'Alguns arquivos salvos estão ausentes. Baixe novamente.');
    } catch {
      if (!busy) status.textContent = text('Could not verify offline availability.', 'Não foi possível verificar a disponibilidade offline.');
    }
  }
  void verify();

  button.addEventListener('click', () => {
    if (busy) return;
    busy = true;
    revision++;
    button.disabled = true;
    remove.disabled = true;
    const progress = (value: OfflineProgress) => {
      status.textContent = text(
        `Saving files: ${value.completed}/${value.total} · ${bytes(value.bytes)}${value.failed ? ` · ${value.failed} failed` : ''}`,
        `Salvando arquivos: ${value.completed}/${value.total} · ${bytes(value.bytes)}${value.failed ? ` · ${value.failed} falharam` : ''}`,
      );
    };
    void (async () => {
      try {
        // This permission request follows an explicit user action, never page load.
        try { await navigator.storage?.persist?.(); } catch { /* Not available in every browser. */ }
        const shell = await cacheMessage<CacheStatus>({ type: 'CACHE_STATUS' });
        if (!shell.essentialReady) throw new Error('essential cache');
        const photos = offlineTripPhotos(trip);
        // Record ownership first so an interrupted download remains removable.
        const pending: Manifest = {
          fingerprint,
          photos,
          assets: shell.optionalUrls,
          routes: [],
          bytes: 0,
          complete: false,
        };
        localStorage.setItem(key, JSON.stringify(pending));
        remove.hidden = false;
        const assets = await cacheMessage<OfflineProgress>({ type: 'CACHE_URLS', urls: photos }, progress);
        status.textContent = text('Saving routes…', 'Salvando rotas…');
        const paths = await collectOfflineRoutes(() => routes((done, total) => {
          status.textContent = text(`Saving routes: ${done}/${total} · ${bytes(assets.bytes)}`, `Salvando rotas: ${done}/${total} · ${bytes(assets.bytes)}`);
        }));
        const complete = assets.failed === 0 && paths.failed === 0 &&
          await cachedPhotos([...photos, ...shell.optionalUrls]) && await offlineRoutesReady(paths.keys);
        const size = assets.bytes + paths.bytes;
        const manifest: Manifest = { fingerprint, photos, assets: shell.optionalUrls, routes: paths.keys, bytes: size, complete };
        localStorage.setItem(key, JSON.stringify(manifest));
        remove.hidden = false;
        status.textContent = complete ? ready(size) : text(
          'Partial download. Some files or routes are unavailable; try again with a connection.',
          'Download parcial. Alguns arquivos ou rotas estão indisponíveis; tente novamente com conexão.',
        );
      } catch {
        status.textContent = text('Download incomplete. Check connection and available storage, then try again.', 'Download incompleto. Confira a conexão e o espaço disponível e tente novamente.');
      } finally {
        busy = false;
        button.disabled = false;
        remove.disabled = false;
      }
    })();
  });
  remove.addEventListener('click', () => {
    void (async () => {
      try {
        const manifest = JSON.parse(localStorage.getItem(key) ?? '{}') as Partial<Manifest>;
        const retained = new Set<string>();
        const retainedPhotos = new Set<string>();
        for (let index = 0; index < localStorage.length; index++) {
          const other = localStorage.key(index);
          if (!other?.startsWith('tb:offline-trip:') || other === key) continue;
          const saved = JSON.parse(localStorage.getItem(other) ?? '{}') as Partial<Manifest>;
          for (const route of saved.routes ?? []) retained.add(route);
          for (const photo of saved.photos ?? []) retainedPhotos.add(photo);
        }
        const urls = await downloadedPhotoUrls((manifest.photos ?? []).filter(photo => !retainedPhotos.has(photo)));
        const removed = await cacheMessage<{ failed: number }>({ type: 'CACHE_REMOVE_URLS', urls });
        if (removed.failed) throw new Error('Partial photo removal');
        await removeOfflineRoutes(manifest.routes ?? [], retained);
        localStorage.removeItem(key);
        revision++;
        remove.hidden = true;
        status.textContent = text('Downloaded photos and routes removed. Shared files and viewed map cache are kept.', 'Fotos e rotas baixadas removidas. Arquivos compartilhados e cache do mapa visto são mantidos.');
      } catch {
        status.textContent = text('Could not remove downloaded routes.', 'Não foi possível remover as rotas baixadas.');
      }
    })();
  });
  return wrap;
}

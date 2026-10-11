/** Force a network check, then activate only a completely installed public build. */
export function refreshAppCache(
  container: ServiceWorkerContainer = navigator.serviceWorker,
  base = import.meta.env.BASE_URL,
  nonce = Date.now(),
): Promise<void> {
  return new Promise((resolve, reject) => {
    let worker: ServiceWorker | null = null;
    let requested = false;
    let finished = false;
    const finish = (error?: Error) => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      worker?.removeEventListener('statechange', check);
      container.removeEventListener('controllerchange', check);
      if (error) reject(error); else resolve();
    };
    const check = () => {
      if (!worker || finished) return;
      if (worker.state === 'redundant') finish(new Error('Update installation failed'));
      else if (container.controller?.state === 'activated' && container.controller.scriptURL === worker.scriptURL) finish();
      else if (worker.state === 'installed' && !requested) {
        requested = true;
        worker.postMessage({ type: 'APPLY_UPDATE' });
      }
    };
    const timer = setTimeout(() => finish(new Error('Update timed out')), 60_000);
    container.addEventListener('controllerchange', check);
    // A unique script URL also bypasses intermediary HTTP caches, including Pages' CDN.
    void container.register(`${base}sw.js?refresh=${nonce}`, {
      scope: base, updateViaCache: 'none',
    }).then(registration => {
      if (finished) return;
      worker = registration.installing ?? registration.waiting ?? registration.active;
      if (!worker) { finish(new Error('Update worker unavailable')); return; }
      worker.addEventListener('statechange', check);
      check();
    }).catch(error => finish(error instanceof Error ? error : new Error('Update unavailable')));
  });
}

/** Reload the canonical shell, preserving the current itinerary/tab in the hash. */
export function refreshedUrl(current: string, base: string): string {
  const url = new URL(base, current);
  url.hash = new URL(current).hash;
  return url.href;
}

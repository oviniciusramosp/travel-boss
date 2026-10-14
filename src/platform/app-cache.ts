import { reloadApp } from './refresh';

/** Apply a completely installed public build; local editors never register this worker. */
export function registerAppCache(): void {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  // Slow images and map tiles must not postpone preparing the application shell.
  const container = navigator.serviceWorker;
  const controlled = Boolean(container.controller);
  container.addEventListener('controllerchange', () => {
    if (controlled) reloadApp();
  }, { once: true });
  void container.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL,
    updateViaCache: 'none',
  }).then(registration => {
    const apply = () => registration.waiting?.postMessage({ type: 'APPLY_UPDATE' });
    apply();
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => { if (worker.state === 'installed') apply(); });
    });
    let checking = false;
    const check = () => {
      if (checking || document.visibilityState === 'hidden' || !navigator.onLine) return;
      checking = true;
      void registration.update().catch(() => {}).finally(() => { checking = false; });
    };
    window.addEventListener('online', check);
    window.addEventListener('focus', check);
    document.addEventListener('visibilitychange', check);
    window.setInterval(check, 60_000);
  }).catch(() => { /* Browsers that deny storage keep the normal network loading. */ });
}

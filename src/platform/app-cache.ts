/** Let the browser upgrade the cache when existing tabs close, without interrupting a trip. */
export function registerAppCache(): void {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  // Slow images and map tiles must not postpone preparing the application shell.
  void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
    scope: import.meta.env.BASE_URL,
    updateViaCache: 'none',
  }).catch(() => { /* Browsers that deny storage keep the normal network loading. */ });
}

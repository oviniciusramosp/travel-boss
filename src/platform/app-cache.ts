/** Let the browser upgrade the cache when existing tabs close, without interrupting a trip. */
export function registerAppCache(): void {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return;
  const register = () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, {
      scope: import.meta.env.BASE_URL,
      updateViaCache: 'none',
    }).catch(() => { /* Browsers that deny storage keep the normal network loading. */ });
  };
  if (document.readyState === 'complete') register();
  else window.addEventListener('load', register, { once: true });
}

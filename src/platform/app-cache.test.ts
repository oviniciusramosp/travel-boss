import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerAppCache } from './app-cache';

afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

function environment() {
  vi.useFakeTimers();
  vi.stubEnv('DEV', false);
  const postMessage = vi.fn();
  const registration = Object.assign(new EventTarget(), {
    waiting: { postMessage }, update: vi.fn().mockResolvedValue(undefined),
  });
  const container = Object.assign(new EventTarget(), { controller: {}, register: vi.fn().mockResolvedValue(registration) });
  const window = Object.assign(new EventTarget(), { setInterval });
  const document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
  const navigator = { serviceWorker: container, onLine: true };
  const location = { href: 'https://example.com/#/trip/europa', replace: vi.fn(), reload: vi.fn() };
  vi.stubGlobal('navigator', navigator);
  vi.stubGlobal('location', location);
  vi.stubGlobal('window', window);
  vi.stubGlobal('document', document);
  return { postMessage, registration, container, window, document, navigator, location };
}

describe('public build activation', () => {
  it('takes over a waiting complete build and reloads the canonical trip after takeover', async () => {
    const { postMessage, container, location } = environment();
    location.href = 'https://example.com/%69ndex.html?refresh=123#/trip/europa';
    registerAppCache();
    await Promise.resolve();
    expect(postMessage).toHaveBeenCalledWith({ type: 'APPLY_UPDATE' });
    expect(location.replace).not.toHaveBeenCalled();
    container.dispatchEvent(new Event('controllerchange'));
    expect(location.replace).toHaveBeenCalledWith('https://example.com/#/trip/europa');
  });
  it('actually reloads when a new build takes over the canonical URL', async () => {
    const { container, location } = environment();
    registerAppCache();
    await Promise.resolve();
    container.dispatchEvent(new Event('controllerchange'));
    expect(location.reload).toHaveBeenCalledOnce();
    expect(location.replace).not.toHaveBeenCalled();
  });
  it('checks open tabs periodically and when returning online, skipping hidden or offline tabs', async () => {
    const { registration, window, document, navigator } = environment();
    registerAppCache();
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(60_000);
    expect(registration.update).toHaveBeenCalledTimes(1);
    document.visibilityState = 'hidden';
    await vi.advanceTimersByTimeAsync(60_000);
    expect(registration.update).toHaveBeenCalledTimes(1);
    document.visibilityState = 'visible';
    navigator.onLine = false;
    window.dispatchEvent(new Event('focus'));
    expect(registration.update).toHaveBeenCalledTimes(1);
    navigator.onLine = true;
    registration.update.mockRejectedValueOnce(new Error('temporary network failure'));
    window.dispatchEvent(new Event('online'));
    await vi.advanceTimersByTimeAsync(60_000);
    expect(registration.update).toHaveBeenCalledTimes(3);
    document.dispatchEvent(new Event('visibilitychange'));
    expect(registration.update).toHaveBeenCalledTimes(4);
  });
  it('leaves the local editable application alone', () => {
    vi.stubEnv('DEV', true);
    const register = vi.fn();
    vi.stubGlobal('navigator', { serviceWorker: { register } });
    registerAppCache();
    expect(register).not.toHaveBeenCalled();
  });
});

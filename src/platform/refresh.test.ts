import { afterEach, describe, expect, it, vi } from 'vitest';
import { refreshAppCache, refreshedUrl } from './refresh';

class Worker extends EventTarget {
  scriptURL = 'https://example.com/travel-boss/sw.js?refresh=123';
  state: ServiceWorkerState = 'installing';
  postMessage = vi.fn();
  change(state: ServiceWorkerState) { this.state = state; this.dispatchEvent(new Event('statechange')); }
}
function environment() {
  const worker = new Worker();
  const container = Object.assign(new EventTarget(), {
    controller: null as Worker | null,
    register: vi.fn().mockResolvedValue({ installing: worker }),
  });
  return { worker, container, refresh: () => refreshAppCache(container as unknown as ServiceWorkerContainer, '/travel-boss/', 123) };
}
afterEach(() => vi.useRealTimers());

describe('force itinerary refresh', () => {
  it('bypasses script caches and waits for installation and controller takeover before reloading', async () => {
    const { worker, container, refresh } = environment();
    const complete = vi.fn();
    const request = refresh().then(complete);
    await Promise.resolve();
    expect(container.register).toHaveBeenCalledWith('/travel-boss/sw.js?refresh=123', { scope: '/travel-boss/', updateViaCache: 'none' });
    expect(worker.postMessage).not.toHaveBeenCalled();
    worker.change('installed');
    expect(worker.postMessage).toHaveBeenCalledExactlyOnceWith({ type: 'APPLY_UPDATE' });
    worker.change('activated');
    expect(complete).not.toHaveBeenCalled();
    // Some browser bindings expose a different wrapper for the same underlying worker.
    container.controller = new Worker();
    container.controller.state = 'activated';
    container.dispatchEvent(new Event('controllerchange'));
    await request;
    expect(complete).toHaveBeenCalledOnce();
  });
  it('rejects unavailable network and failed installation without activating anything', async () => {
    const { worker, container, refresh } = environment();
    container.register.mockRejectedValueOnce(new Error('offline'));
    await expect(refresh()).rejects.toThrow('offline');
    const request = refresh();
    await Promise.resolve();
    worker.change('redundant');
    await expect(request).rejects.toThrow('installation failed');
    expect(worker.postMessage).not.toHaveBeenCalled();
  });
  it('times out a stalled update and ignores late installation', async () => {
    vi.useFakeTimers();
    const { worker, refresh } = environment();
    const request = expect(refresh()).rejects.toThrow('timed out');
    await vi.advanceTimersByTimeAsync(60_000);
    await request;
    worker.change('installed');
    expect(worker.postMessage).not.toHaveBeenCalled();
  });
  it('reloads the canonical shell preserving the trip and clearing cache-busting query parameters', () => {
    expect(refreshedUrl('https://example.com/travel-boss/%69ndex.html?v=old#/trip/europa', '/travel-boss/'))
      .toBe('https://example.com/travel-boss/#/trip/europa');
  });
});

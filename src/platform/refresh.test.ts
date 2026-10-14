import { afterEach, describe, expect, it, vi } from 'vitest';
import { onlineRefreshUrl, refreshAppCache, refreshedUrl, reloadApp } from './refresh';

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
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('force itinerary refresh', () => {
  it('escapes old navigation caches only when the current shell is reachable', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response('current')).mockRejectedValueOnce(new Error('offline'));
    vi.stubGlobal('fetch', fetcher);
    const url = await onlineRefreshUrl('https://example.com/travel-boss/#/trip/europa', '/travel-boss/', 123);
    expect(url).toBe('https://example.com/travel-boss/%69ndex.html?refresh=123#/trip/europa');
    expect(fetcher).toHaveBeenCalledWith(url, expect.objectContaining({ cache: 'no-store' }));
    await expect(onlineRefreshUrl('https://example.com/travel-boss/#/trip/europa', '/travel-boss/')).rejects.toThrow('offline');
  });
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
  it('reloads a document already at the target URL instead of making a same-document hash navigation', () => {
    const url = 'https://example.com/travel-boss/#/trip/europa';
    const reload = vi.fn();
    const replace = vi.fn();
    vi.stubGlobal('location', { href: url, reload, replace });
    reloadApp(url);
    expect(reload).toHaveBeenCalledOnce();
    expect(replace).not.toHaveBeenCalled();
  });
  it('navigates to a different shell when recovering from an older worker', () => {
    const current = 'https://example.com/travel-boss/#/trip/europa';
    const target = 'https://example.com/travel-boss/%69ndex.html?refresh=123#/trip/europa';
    const reload = vi.fn();
    const replace = vi.fn();
    vi.stubGlobal('location', { href: current, reload, replace });
    reloadApp(target);
    expect(replace).toHaveBeenCalledWith(target);
    expect(reload).not.toHaveBeenCalled();
  });
});

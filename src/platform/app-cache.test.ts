import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerAppCache } from './app-cache';

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('public build activation', () => {
  it('takes over a waiting complete build and reloads the canonical trip after takeover', async () => {
    vi.stubEnv('DEV', false);
    const postMessage = vi.fn();
    const registration = Object.assign(new EventTarget(), { waiting: { postMessage } });
    const container = Object.assign(new EventTarget(), { controller: {}, register: vi.fn().mockResolvedValue(registration) });
    const replace = vi.fn();
    vi.stubGlobal('navigator', { serviceWorker: container });
    vi.stubGlobal('location', { href: 'https://example.com/%69ndex.html?refresh=123#/trip/europa', replace });
    registerAppCache();
    await Promise.resolve();
    expect(postMessage).toHaveBeenCalledWith({ type: 'APPLY_UPDATE' });
    expect(replace).not.toHaveBeenCalled();
    container.dispatchEvent(new Event('controllerchange'));
    expect(replace).toHaveBeenCalledWith('https://example.com/#/trip/europa');
  });
  it('leaves the local editable application alone', () => {
    vi.stubEnv('DEV', true);
    const register = vi.fn();
    vi.stubGlobal('navigator', { serviceWorker: { register } });
    registerAppCache();
    expect(register).not.toHaveBeenCalled();
  });
});

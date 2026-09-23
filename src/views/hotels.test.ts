import { describe, expect, it } from 'vitest';
import {
  hotelSetupFailure,
  interpretSearchBody,
  responseIsNdjson,
  safetyLine,
} from './hotels';

const t = (en: string, pt: string) => pt || en;

describe('safetyLine', () => {
  it('warns about an approximate Airbnb listing', () => {
    expect(
      safetyLine({ source: 'airbnb', locationApproximate: true }, { name: 'Centro', safety: 80 }, t),
    ).toBe('Segurança do bairro sem nota');
  });

  it('keeps the neighborhood score for a precise hotel', () => {
    expect(safetyLine({ source: 'booking' }, { name: 'Centro', safety: 80 }, t)).toBe('Centro 80/100');
    expect(safetyLine({ source: 'booking', locationApproximate: true }, null, t)).toBe(
      'Segurança do bairro sem nota',
    );
  });
});

describe('hotelSetupFailure', () => {
  it('locks the form when the API cannot be reached', () => {
    expect(hotelSetupFailure('unreachable', null, 'offline')).toBe('offline');
    expect(hotelSetupFailure('http', null, 'offline')).toBe('offline');
    expect(hotelSetupFailure('ok', { ok: false, error: '' }, 'offline')).toBe('offline');
    expect(hotelSetupFailure('ok', { ok: false, error: 'sem venv' }, 'offline')).toBe('sem venv');
    expect(hotelSetupFailure('ok', { ok: true }, 'offline')).toBeNull();
  });
});

describe('interpretSearchBody', () => {
  it('treats a JSON 200 that is not ndjson as a visible result or error', () => {
    expect(responseIsNdjson('application/json')).toBe(false);
    expect(responseIsNdjson('application/x-ndjson; charset=utf-8')).toBe(true);
    expect(responseIsNdjson(null)).toBe(true);

    const done = interpretSearchBody(
      {
        type: 'done',
        query: {},
        totals: { azul: 0, inRange: 0, candidates: 0, kept: 0 },
        hotels: [],
        skipped: [],
      },
      'falha',
    );
    expect(done.kind).toBe('done');

    expect(interpretSearchBody({ error: 'sem stream' }, 'falha')).toEqual({
      kind: 'status',
      message: 'sem stream',
      error: true,
    });
    expect(interpretSearchBody({ ok: true }, 'falha')).toEqual({
      kind: 'status',
      message: 'falha',
      error: true,
    });
  });
});

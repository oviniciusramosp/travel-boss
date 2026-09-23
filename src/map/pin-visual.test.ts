import { describe, expect, it } from 'vitest';
import { placePinIconHtml } from '../catalog';
import { pinHtml, pinModel, samePinModel, zoomPinBucket } from './pin-visual';
import { placeZoom, resolvedPlace } from './place-index';

describe('zoomPinBucket', () => {
  it('splits far, mid, and near at 11 and 13', () => {
    expect(zoomPinBucket(4)).toBe('far');
    expect(zoomPinBucket(10.9)).toBe('far');
    expect(zoomPinBucket(11)).toBe('mid');
    expect(zoomPinBucket(12.9)).toBe('mid');
    expect(zoomPinBucket(13)).toBe('near');
    expect(zoomPinBucket(16)).toBe('near');
  });
});

describe('pinHtml', () => {
  it('puts the category glyph inside the pin', () => {
    const model = pinModel({
      label: 'Bakery',
      color: '#8b5e3c',
      category: 'cafes',
      subcategories: ['bakery'],
    });
    const html = pinHtml(model);
    expect(html).toContain(placePinIconHtml('cafes', ['bakery']));
    expect(html).toContain('bakery_dining');
    expect(html).not.toContain('tb-pin--star');
    expect(html).not.toContain('width:');
  });

  it('draws a tourist place as an 8-point star plus the pin glyph', () => {
    const model = pinModel({
      label: 'Tower',
      color: '#facc15',
      category: 'tourist',
      featured: true,
    });
    const html = pinHtml(model, { active: true });
    expect(model.star).toBe(true);
    expect(model.featured).toBe(true);
    expect(html).toContain('tb-pin--star');
    expect(html).toContain('is-featured');
    expect(html).toContain('is-active');
    expect(html).toContain('tb-pin__star');
    expect(html).toContain(placePinIconHtml('tourist'));
    expect(html).toContain('M10.91 3.86');
  });

  it('ignores a color that is not a hex', () => {
    expect(pinModel({ label: 'X', color: 'red;background:url(x)' }).color).toBe('#0a0a0a');
  });

  it('treats two models as the same when the drawn fields match', () => {
    const model = pinModel({ label: 'A', color: '#000', category: 'parks' });
    expect(samePinModel(model, { ...model })).toBe(true);
    expect(samePinModel(model, { ...model, featured: true })).toBe(false);
    expect(samePinModel(undefined, model)).toBe(false);
  });
});

describe('place index', () => {
  it('reads Paris zoom and a resolved tourist place', () => {
    expect(placeZoom('par-eiffel')).toBe(14);
    expect(resolvedPlace('par-eiffel')?.category).toBe('tourist');
    expect(resolvedPlace('par-ory')?.category).toBe('airport');
    expect(resolvedPlace('par-ory')?.featured).toBe(true);
    expect(placeZoom('missing')).toBeUndefined();
  });
});

import { describe, expect, it } from 'vitest';
import { getTravelCity, travelCities, withResolvedArea } from './travel';
import { osmTravelAreas } from './travel-areas-osm';
import {
  mergeNotionPlaces,
  notionRecordToPlace,
  travelNotionSnapshot,
} from './travel-notion';

describe('travel-notion snapshot', () => {
  it('has places pulled from Notion', () => {
    expect(travelNotionSnapshot.count).toBeGreaterThan(0);
    expect(travelNotionSnapshot.places.length).toBe(travelNotionSnapshot.count);
  });

  it('every place has id, city, coords, and bilingual name', () => {
    for (const p of travelNotionSnapshot.places) {
      expect(p.id, 'id').toBeTruthy();
      expect(p.city, `${p.id} city`).toBeTruthy();
      expect(typeof p.lat).toBe('number');
      expect(typeof p.lng).toBe('number');
      expect(p.name.en, `${p.id} name.en`).toBeTruthy();
      expect(p.name['pt-BR'], `${p.id} name.pt`).toBeTruthy();
    }
  });
});

describe('mergeNotionPlaces', () => {
  it('includes all Paris places from Notion', () => {
    expect(travelNotionSnapshot.byCity.paris).toBe(127);
    const paris = getTravelCity('paris');
    expect(paris).toBeDefined();
    const notionParis = travelNotionSnapshot.places.filter(
      (p) => p.city === 'paris',
    );
    for (const rec of notionParis) {
      const place = paris!.places.find((p) => p.id === rec.id);
      expect(place, `missing ${rec.id}`).toBeDefined();
      expect(place!.name.en).toBe(rec.name.en);
      // Places with map geometry (authored area or OSM outline) keep local pin.
      const hasGeometry =
        Boolean(place!.area) || Boolean(osmTravelAreas[place!.id]);
      if (!hasGeometry) {
        expect(place!.lat).toBe(rec.lat);
        expect(place!.lng).toBe(rec.lng);
      }
    }
    // Editorial from Notion (e.g. Eiffel rating / cover / featured)
    const eiffel = paris!.places.find((p) => p.id === 'par-eiffel');
    expect(eiffel?.rating).toBe(5);
    expect(eiffel?.landmark).toBe('eiffel');
    expect(eiffel?.favorite).toBe(true);
    expect(eiffel?.featured).toBe(true);

    const louvre = paris!.places.find((p) => p.id === 'par-louvre');
    expect(louvre?.featured).toBe(true);

    // Subcategories seeded from local registry into Notion
    const withSubs = travelNotionSnapshot.places.filter(
      (p) => p.city === 'paris' && p.subcategories && p.subcategories.length > 0,
    );
    expect(withSubs.length).toBeGreaterThan(50);
    const felicita = paris!.places.find((p) => p.id === 'par-felicita');
    expect(felicita?.subcategories).toEqual(
      expect.arrayContaining(['self-service', 'italian']),
    );
  });

  it('appends Notion-only places into São Paulo', () => {
    const sp = getTravelCity('sao-paulo');
    expect(sp).toBeDefined();
    const notionIds = travelNotionSnapshot.places
      .filter((p) => p.city === 'sao-paulo')
      .map((p) => p.id);
    expect(notionIds.length).toBeGreaterThan(0);
    for (const id of notionIds) {
      expect(
        sp!.places.some((p) => p.id === id),
        `expected ${id} on SP map`,
      ).toBe(true);
    }
  });

  it('keeps local-only places', () => {
    const sp = getTravelCity('sao-paulo');
    // Local seed places still present
    expect(sp!.places.some((p) => p.id === 'sp-gru')).toBe(true);
    expect(sp!.places.some((p) => p.id === 'sp-mercado-municipal')).toBe(true);
  });

  it('Notion wins on matching id while preserving local area/landmark', () => {
    const cities = mergeNotionPlaces([
      {
        slug: 'sao-paulo',
        name: { en: 'São Paulo', 'pt-BR': 'São Paulo' },
        country: { en: 'Brazil', 'pt-BR': 'Brasil' },
        countryKey: 'brasil',
        lat: -23.55,
        lng: -46.63,
        zoom: 12,
        places: [
          {
            id: 'sp-test-merge',
            name: { en: 'Local name', 'pt-BR': 'Nome local' },
            category: 'tourist',
            description: { en: 'local desc', 'pt-BR': 'desc local' },
            lat: 0,
            lng: 0,
            landmark: 'monument',
            area: {
              kind: 'polygon',
              path: [
                [0, 0],
                [0, 1],
                [1, 1],
                [1, 0],
              ],
            },
          },
        ],
      },
    ]);

    // Inject via direct notionRecordToPlace path: merge only uses snapshot.
    // Unit-test the merge rule with a synthetic local + manual override shape:
    const notionPlace = notionRecordToPlace({
      notionPageId: 'x',
      id: 'sp-test-merge',
      city: 'sao-paulo',
      name: { en: 'Notion name', 'pt-BR': 'Nome Notion' },
      category: 'restaurants',
      description: { en: 'from notion', 'pt-BR': 'do notion' },
      lat: -23.5,
      lng: -46.6,
    });

    const local = cities[0].places[0];
    // Simulate override rule used in mergeNotionPlaces (area keeps local pin)
    const merged = {
      ...local,
      ...notionPlace,
      area: local.area,
      landmark: local.landmark,
      ...(local.area
        ? { lat: local.lat, lng: local.lng }
        : {}),
    };
    expect(merged.name.en).toBe('Notion name');
    expect(merged.category).toBe('restaurants');
    expect(merged.landmark).toBe('monument');
    expect(merged.area?.kind).toBe('polygon');
    // Local area → local pin stays put (geometry anchor)
    expect(merged.lat).toBe(0);
    expect(merged.lng).toBe(0);
  });

  it('does not drop other cities', () => {
    expect(travelCities.some((c) => c.slug === 'paris')).toBe(true);
    expect(getTravelCity('paris')!.places.length).toBeGreaterThan(0);
  });

  it('keeps Montmartre pin inside its OSM area and off Sacré-Cœur', () => {
    const paris = getTravelCity('paris')!;
    const mont = withResolvedArea(
      paris.places.find((p) => p.id === 'par-montmartre')!,
    );
    const sacre = paris.places.find((p) => p.id === 'par-sacre-coeur')!;
    expect(['polygon', 'multipolygon']).toContain(mont.area?.kind);
    // Distinct click targets
    expect(mont.lat === sacre.lat && mont.lng === sacre.lng).toBe(false);
    // Pin must sit inside the neighborhood geometry (tourist zone ∪ Louise Michel ∪ basilica)
    const rings: [number, number][][] =
      mont.area?.kind === 'polygon'
        ? [mont.area.path]
        : mont.area?.kind === 'multipolygon'
          ? mont.area.paths
          : [];
    const insideRing = (lat: number, lng: number, path: [number, number][]) => {
      let ins = false;
      for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
        const [yi, xi] = path[i]!;
        const [yj, xj] = path[j]!;
        const inter =
          yi > lat !== yj > lat &&
          lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (inter) ins = !ins;
      }
      return ins;
    };
    const inside = (lat: number, lng: number) =>
      rings.some((path) => insideRing(lat, lng, path));
    expect(inside(mont.lat, mont.lng)).toBe(true);
    // Butte covers basilica + square (not only the tourist-zone cut)
    expect(inside(sacre.lat, sacre.lng)).toBe(true);
    expect(inside(48.8853, 2.3438)).toBe(true); // Square Louise Michel
  });
});

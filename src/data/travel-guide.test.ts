import { describe, expect, it } from 'vitest';
import { getTravelCity, travelCities } from './travel';
import { cityGuide, type GuideItem } from './travel-guide';

const guided = travelCities.flatMap((city) => {
  const guide = cityGuide(city.slug);
  return guide ? [{ city, guide }] : [];
});

function filled(text: { en: string; 'pt-BR': string }): boolean {
  return text.en.trim().length > 0 && text['pt-BR'].trim().length > 0;
}

describe('city guides', () => {
  it('Paris has a market and a food list', () => {
    const paris = cityGuide('paris');
    expect(paris?.market.length).toBeGreaterThan(0);
    expect(paris?.food.length).toBeGreaterThan(0);
  });

  it('points only at places of the same city, one to three per item', () => {
    const fails: string[] = [];
    for (const { city, guide } of guided) {
      const ids = new Set(getTravelCity(city.slug)?.places.map((place) => place.id));
      const items: GuideItem[] = [...guide.market, ...guide.food];
      for (const item of items) {
        if (item.where.length < 1 || item.where.length > 3) fails.push(`${city.slug}/${item.id}: ${item.where.length} places`);
        if (new Set(item.where).size !== item.where.length) fails.push(`${city.slug}/${item.id}: repeated place`);
        for (const id of item.where) if (!ids.has(id)) fails.push(`${city.slug}/${item.id}: unknown place ${id}`);
      }
    }
    expect(fails, fails.join('\n')).toEqual([]);
  });

  it('every AI-added place has a reason: its own aiReason or a guide item of its city', () => {
    const fails: string[] = [];
    for (const city of travelCities) {
      const guide = cityGuide(city.slug);
      const pointed = new Set([...(guide?.market ?? []), ...(guide?.food ?? [])].flatMap((item) => item.where));
      for (const place of city.places) {
        if (place.aiReason && (!place.aiSuggested || !filled(place.aiReason))) fails.push(`${city.slug}/${place.id}: aiReason`);
        if (place.aiSuggested && !place.aiReason && !pointed.has(place.id)) fails.push(`${city.slug}/${place.id}`);
      }
    }
    expect(fails, fails.join('\n')).toEqual([]);
  });

  it('has unique ids and copy in both languages', () => {
    const fails: string[] = [];
    for (const { city, guide } of guided) {
      for (const [tab, items] of Object.entries(guide) as [string, GuideItem[]][]) {
        const seen = new Set<string>();
        for (const item of items) {
          if (seen.has(item.id)) fails.push(`${city.slug}/${tab}: duplicate ${item.id}`);
          seen.add(item.id);
          if (!filled(item.name) || !filled(item.description)) fails.push(`${city.slug}/${item.id}: missing copy`);
        }
      }
    }
    expect(fails, fails.join('\n')).toEqual([]);
  });

  it('uses sized Wikimedia thumbs with alt text and credit', () => {
    const sizedThumb = /^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\/thumb\/.+\/\d+px-[^/?]+\.(jpe?g|png|webp)$/i;
    const fails: string[] = [];
    for (const { city, guide } of guided) {
      for (const item of [...guide.market, ...guide.food]) {
        const photo = item.photo;
        if (!photo) continue;
        if (!sizedThumb.test(photo.url)) fails.push(`${city.slug}/${item.id}: ${photo.url}`);
        if (!photo.alt || !filled(photo.alt) || !photo.credit) fails.push(`${city.slug}/${item.id}: alt or credit`);
      }
    }
    expect(fails, fails.join('\n')).toEqual([]);
  });
});

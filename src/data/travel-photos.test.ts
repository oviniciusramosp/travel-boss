/**
 * Structural + inventory checks for travel gallery photos.
 *
 * Network liveness is handled by scripts/check-travel-photos.py
 * (`npm run travel:photos:check`) — not in unit tests (rate limits / CI flakiness).
 */
import { describe, expect, it } from 'vitest';
import { photosByPlaceId, photosForPlaceId } from './travel-photos';
import {
  getTravelCity,
  resolvePlacePhotos,
  travelCities,
  withResolvedArea,
} from './travel';

const WIKI_HOST = 'upload.wikimedia.org';
const ALLOWED_HOSTS = new Set([
  WIKI_HOST,
  'live.staticflickr.com',
  // Legacy Flickr CDN hosts
  'farm1.staticflickr.com',
  'farm2.staticflickr.com',
  'farm3.staticflickr.com',
  'farm4.staticflickr.com',
  'farm5.staticflickr.com',
  'farm6.staticflickr.com',
  'farm8.staticflickr.com',
  'farm9.staticflickr.com',
  // Occasional Google-hosted CC mirrors already in the registry
  'lh3.googleusercontent.com',
  // Google image thumbnails
  'encrypted-tbn0.gstatic.com',
  // Blogger / Blogspot hosted images
  'blogger.googleusercontent.com',
  // TripAdvisor media CDN (curated place covers)
  'dynamic-media-cdn.tripadvisor.com',
  // Sortir à Paris CDN
  'cdn.sortiraparis.com',
  // Magnific stock (Luxor Obelisk cover)
  'img.magnific.com',
  // laSexta photo CDN (Luxor Obelisk gallery)
  'fotografias.lasexta.com',
  // ArchDaily CDN (BnF cover)
  'images.adsttc.com',
  // Arquitectura Viva (BnF gallery)
  'arquitecturaviva.com',
  // WordPress.com media CDN (BnF Labrouste room)
  'fernandoeichenberg.files.wordpress.com',
  // WordPress Jetpack image CDN (Sainte-Chapelle cover)
  'i0.wp.com',
  // Tiqets Imgix CDN (Sainte-Chapelle gallery)
  'aws-tiqets-cdn.imgix.net',
  // World in Paris (Cour du Commerce cover)
  'worldinparis.com',
]);

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}

describe('travel-photos registry', () => {
  it('every entry has at least one https image URL with alt + credit', () => {
    const fails: string[] = [];
    for (const [id, list] of Object.entries(photosByPlaceId)) {
      if (!list.length) {
        fails.push(`${id}: empty list`);
        continue;
      }
      for (const [i, photo] of list.entries()) {
        if (!photo.url?.startsWith('https://')) {
          fails.push(`${id}[${i}]: missing https url`);
        }
        const u = parseUrl(photo.url);
        if (!u) {
          fails.push(`${id}[${i}]: invalid URL ${photo.url}`);
          continue;
        }
        if (!ALLOWED_HOSTS.has(u.hostname) && !u.hostname.endsWith('staticflickr.com')) {
          fails.push(
            `${id}[${i}]: host ${u.hostname} not in allowlist (prefer Wikimedia/Flickr CC)`,
          );
        }
        if (!photo.alt?.en) {
          fails.push(`${id}[${i}]: missing alt.en`);
        }
        if (!photo.credit) {
          fails.push(`${id}[${i}]: missing credit`);
        }
      }
    }
    expect(fails, fails.join('\n')).toEqual([]);
  });

  it('rejects known-bad Wikimedia patterns (deleted thumbs, empty path)', () => {
    const fails: string[] = [];
    // Hash paths that 404'd in production (keep list of fixed bugs so they don't return)
    const BANNED_SUBSTRINGS = [
      // Old Pompidou thumb (file removed / path changed)
      'Centre_Georges-Pompidou%2C_Paris_2013.jpg',
      // Old Champ de Mars hash a/a8 (file moved to 0/0e)
      'thumb/a/a8/Champ_de_Mars_from_the_Eiffel_Tower_-_July_2006_edit.jpg',
      // Old Montparnasse self-referential bad thumb
      'Tour_Montparnasse_from_the_Tour_Maine-Montparnasse.jpg',
      // Old Orly aerial hash 5/5a
      'thumb/5/5a/Aerial_view_of_Paris-Orly_Airport_1.jpg',
    ];
    for (const [id, list] of Object.entries(photosByPlaceId)) {
      for (const photo of list) {
        for (const bad of BANNED_SUBSTRINGS) {
          if (photo.url.includes(bad)) {
            fails.push(`${id}: banned broken URL fragment ${bad}`);
          }
        }
      }
    }
    expect(fails, fails.join('\n')).toEqual([]);
  });

  it('photosForPlaceId returns undefined for empty / unknown', () => {
    expect(photosForPlaceId('__no-such-place__')).toBeUndefined();
  });

  it('resolvePlacePhotos prefers curated multi-photo registry over an authored cover-only list', () => {
    const registry = photosForPlaceId('par-galeries-lafayette');
    expect(registry?.length).toBeGreaterThan(1);

    // An authored cover that is not in the local registry
    const authoredOnly = [
      {
        url: 'https://example.com/authored-only-galeries-cover.jpg',
        alt: { en: 'Galeries Lafayette (authored cover)', 'pt-BR': 'Galeries Lafayette (capa avulsa)' },
      },
    ];
    const resolved = resolvePlacePhotos('par-galeries-lafayette', authoredOnly);
    // Registry order wins as base; the authored-only cover is appended, never dropped
    expect(resolved?.length).toBe(registry!.length + 1);
    expect(resolved?.[0]?.url).toBe(registry![0]!.url);
    expect(resolved?.some((p) => p.url === authoredOnly[0]!.url)).toBe(true);

    // Live city merge + withResolvedArea must expose at least the full registry
    const paris = getTravelCity('paris');
    const place = paris?.places.find((p) => p.id === 'par-galeries-lafayette');
    expect(place).toBeDefined();
    const full = withResolvedArea(place!);
    expect(full.photos?.length).toBeGreaterThanOrEqual(registry!.length);
  });

  it('resolvePlacePhotos keeps Notion multi-gallery when registry is shorter', () => {
    const notionMulti = [
      {
        url: 'https://example.com/a.jpg',
        alt: { en: 'A', 'pt-BR': 'A' },
      },
      {
        url: 'https://example.com/b.jpg',
        alt: { en: 'B', 'pt-BR': 'B' },
      },
      {
        url: 'https://example.com/c.jpg',
        alt: { en: 'C', 'pt-BR': 'C' },
      },
    ];
    // Unknown place id → no registry; Notion gallery is used as-is
    const onlyNotion = resolvePlacePhotos('__no-registry-place__', notionMulti);
    expect(onlyNotion?.map((p) => p.url)).toEqual(notionMulti.map((p) => p.url));
  });

  it('every place id with photos exists in travel data (no orphan keys)', () => {
    const placeIds = new Set(
      travelCities.flatMap((c) => c.places.map((p) => p.id)),
    );
    const orphans = Object.keys(photosByPlaceId).filter((id) => !placeIds.has(id));
    expect(orphans, `orphan photo keys: ${orphans.join(', ')}`).toEqual([]);
  });

  it('Wikimedia thumbs use a sized /thumb/ path (not a dangling folder)', () => {
    const fails: string[] = [];
    // Accept: …/1280px-File.jpg  or  …/page1-1280px-File.pdf.jpg  or  …/1280px-File.svg.png
    const sizedThumb =
      /\/(?:page\d+-)?\d+px-[^/]+\.(jpe?g|png|webp|gif|svg\.png)$/i;
    for (const [id, list] of Object.entries(photosByPlaceId)) {
      for (const photo of list) {
        const u = photo.url;
        if (!u.includes('/wikipedia/') || !u.includes('/thumb/')) continue;
        if (!sizedThumb.test(u)) {
          fails.push(`${id}: odd thumb URL shape ${u}`);
        }
      }
    }
    expect(fails, fails.join('\n')).toEqual([]);
  });
});


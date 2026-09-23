# Travel places: Notion ↔ app sync

This app is Vite, not Astro. The sync script keeps the portfolio paths: it
reads and writes `src/data` (`travel.ts`, `travel-photos.ts`,
`travel-subcategories.ts`, the snapshot, and the seed dumps). `src/catalog`
only re-exports the browser catalog. It does **not** export `localTravelCities`,
so push must keep importing `src/data/travel.ts` — otherwise it would upload
the already-merged Notion snapshot instead of the local source.

Editorial place content lives in the Notion DB **Lugares**. The app merges a
pulled snapshot with local code (`travel.ts`, `travel-photos.ts`, OSM areas).

## Rules (agents + humans)

### 1. After any local place edit → **push immediately**

If you change place name, description, coords, rating, photos, subcategories,
or add a place in the repo:

```bash
# One or more place ids (from localTravelCities + travel-photos.ts)
npm run travel:notion:push -- par-montmartre par-bakery-gaite

# Or a dump file
npm run travel:notion:push -- --dump src/data/paris-places-patch-dump.json
```

`push` = seed those places to Notion (photo merge-safe) + `pull` snapshot.

**Do not** leave local-only edits sitting for the next bulk seed/pull — that is
how covers and copy get overwritten by older Notion rows (or the reverse).

### 2. Photos never shrink

| Source | Role |
|--------|------|
| `src/data/travel-photos.ts` | Curated gallery registry (preferred order when ≥ Notion) |
| Notion `Photo URLs` + `Cover URL` | CMS gallery; covers added in Notion must survive |

On every seed / seed-photos / push:

- Galleries are **merge-union** (unique URLs).
- Written list length ≥ `max(local, Notion)`.
- If Notion has **more** photos and `last_edited_time` is **newer** than our
  last push for that place, **Notion order** wins; local-only URLs still append.
- Otherwise **local order** wins; Notion-only URLs still append.

Runtime (`resolvePlacePhotos`) uses the same merge idea so the site does not
drop Notion-only covers even when the registry is shorter.

### 3. Timestamps / recency

| Signal | Where |
|--------|--------|
| Notion `page.last_edited_time` | Stored on each snapshot row as `lastEdited` |
| Last successful push | `src/data/travel-notion-sync-state.json` → `places[id].lastPushedAt` |
| Last pull | `travel-notion-sync-state.json` → `lastPullAt` |

Compare **day + time** (ISO): if Notion was edited after our last push and has
a longer gallery, we do not stomp it with a shorter local list.

### 4. Ownership (who wins what)

| Field | Source of truth |
|-------|-----------------|
| Name, description, rating, favorite, featured, category | Notion after merge (edit in Notion **or** push from local) |
| Photos | Union of registry + Notion; see rules above |
| Map `area`, routeStops, pin when OSM/area exists | **Local** (OSM / authored geometry) |
| Visit tips, itineraries | Local only (`travel-visit.ts`, itineraries) |

### 5. Safe vs unsafe commands

| Command | Direction | Safe for photos? |
|---------|-----------|------------------|
| `travel:notion:pull` / `sync` | Notion → snapshot | Yes (read-only) |
| `travel:notion:push -- <ids>` | Local → Notion + pull | Yes (merge-union) |
| `travel:notion:seed-photos` | Local photos → Notion | Yes (merge-union; no longer replaces) |
| `travel:notion:seed dump.json` | Dump → Notion | Yes for photos if dump is current; still merge-union |
| Full seed of **stale** dump | Dump → Notion | **Unsafe for copy** if dump is old — only seed dumps you just generated from `localTravelCities` |

### 6. Checklist when adding / updating places

1. Edit local: `travel.ts` (use `localTravelCities`), `travel-photos.ts`,
   `travel-visit.ts`, `travel-subcategories.ts` as needed.
2. `npm run travel:notion:push -- <new-or-changed-ids>`
3. Confirm snapshot: place appears in `travel-notion.generated.ts` with photos.
4. Run `vitest run src/data/travel-notion.test.ts src/data/travel-photos.test.ts`.

### 7. If covers disappeared

1. Do **not** re-run a bulk `seed-photos` from an incomplete registry alone —
   current tool merges and should not shrink.
2. Restore URLs into `travel-photos.ts` **and** Notion `Photo URLs` (push).
3. `pull` so the snapshot matches.

## Files

| Path | Role |
|------|------|
| `scripts/sync-travel-notion.mjs` | pull / push / seed / seed-photos |
| `src/data/travel-notion.generated.ts` | Pulled snapshot (do not hand-edit) |
| `src/data/travel-notion-sync-state.json` | lastPushedAt / photo counts per place |
| `src/data/travel-photos.ts` | Local multi-photo registry |
| `src/data/travel-notion.ts` | Merge into `travelCities` |

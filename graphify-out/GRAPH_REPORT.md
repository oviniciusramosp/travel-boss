# Graph Report - travel-boss  (2026-09-23)

## Corpus Check
- 104 files · ~260,938 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 894 nodes · 1868 edges · 34 communities (33 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.68)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7f0f0281`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search.mjs
- travel-itinerary-legs.ts
- parse.ts
- travel.ts
- hotels.ts
- travel-visit.ts
- travel-categories.ts
- airbnb-search.py
- places.ts
- travel-stay-heatmap.ts
- travel-areas.test.ts
- LString
- index.ts
- hotel-ranking.mjs
- basemap-style.ts
- travel-notion.ts
- rome-hotel-neighborhoods.ts
- compilerOptions
- sync-travel-notion.mjs
- hotel-ranking.test.ts
- hotel-booking-details.test.ts
- Rules (agents + humans)
- scripts
- hotel-ranking-context.ts
- fetch-travel-polygons.py
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- travel-subcategories.ts
- Hotel priorities
- hotel-scripts.d.ts
- Europa
- travel-photos.test.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026

## God Nodes (most connected - your core abstractions)
1. `mountCity()` - 27 edges
2. `searchAzulHotels()` - 21 edges
3. `scripts` - 20 edges
4. `Travel Boss — plano de paridade com o portfólio + polimento de UI` - 20 edges
5. `getTravelCity()` - 17 edges
6. `seed()` - 16 edges
7. `mountHotels()` - 14 edges
8. `compilerOptions` - 14 edges
9. `pickLocale()` - 13 edges
10. `bookingDetails()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `encode()` --calls--> `ring()`  [INFERRED]
  scripts/build-stay-display.py → scripts/fetch-rome-hotel-boundaries.py
- `accommodationEligibility()` --calls--> `bookingEligibility()`  [EXTRACTED]
  scripts/hotel-ranking.mjs → scripts/hotel-booking-details.mjs
- `metres()` --calls--> `haversineM()`  [EXTRACTED]
  scripts/hotel-ranking.mjs → scripts/hotel-search-match.mjs

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (34 total, 1 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.06
Nodes (75): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType(), extract() (+67 more)

### Community 1 - "travel-itinerary-legs.ts"
Cohesion: 0.05
Nodes (68): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+60 more)

### Community 2 - "parse.ts"
Cohesion: 0.12
Nodes (25): copyTrip(), downloadTrip(), escapeHtml(), inline(), inlineWithLinks(), tripToHtml(), tripToMarkdown(), exportCurrent() (+17 more)

### Community 3 - "travel.ts"
Cohesion: 0.14
Nodes (14): areaForPlace(), favoritePlaceIds(), favoritePlaces(), localTravelCities, resolvePlaceArea(), travelCountryKeys, TravelLandmark, TravelRouteStop (+6 more)

### Community 4 - "hotels.ts"
Cohesion: 0.06
Nodes (54): diffPinIds(), paddedCenterOffset(), selectionEases(), selectionZoom(), KINDS, mountMap(), zoomBucket(), MapHandle (+46 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (28): cafeVisit(), CrowdProfile, formatMoneyTypical(), free, L(), landmarkOutdoor(), Locale, lodgingVisit() (+20 more)

### Community 6 - "travel-categories.ts"
Cohesion: 0.13
Nodes (20): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+12 more)

### Community 7 - "airbnb-search.py"
Cohesion: 0.09
Nodes (23): concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details, pyairbnb pinned to git commit 1ee4151 (+15 more)

### Community 8 - "places.ts"
Cohesion: 0.06
Nodes (75): Locale, mountShell(), readLocale(), Shell, PlaceCategoryMeta, getTravelCity(), googleMapsUrl(), computeDayBudget() (+67 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.11
Nodes (27): BY_CITY, CITY_SEARCH, citySearchName(), hasStayHeat(), LISBON, ROME, searchQuery(), STAY_HEAT_BEST_MIN (+19 more)

### Community 10 - "travel-areas.test.ts"
Cohesion: 0.15
Nodes (22): AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM(), haversineM() (+14 more)

### Community 11 - "LString"
Cohesion: 0.40
Nodes (5): LString, l(), milanCity, place(), TravelCity

### Community 12 - "index.ts"
Cohesion: 0.14
Nodes (19): placeCategoriesOffByDefault, computeTripBudget(), DayBudget, dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItineraryDay, ItinerarySlot (+11 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.20
Nodes (17): ref_node_crypto, accommodationEligibility(), airbnbQuality(), clamp(), evaluateJev(), hotelEvidence(), hotelRegion(), insideRing() (+9 more)

### Community 14 - "basemap-style.ts"
Cohesion: 0.14
Nodes (17): applyBrightBasemap(), bindBrightBasemap(), HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter(), mapCanvasColor(), PLACE_LABEL_LAYERS, PLACE_LABEL_MINZOOM, POI_LAYERS_EXCLUDE_BUS (+9 more)

### Community 15 - "travel-notion.ts"
Cohesion: 0.16
Nodes (16): OsmArea, osmTravelAreas, snapshot, LString, mergeNotionPlaces(), normalizeCategorySlug(), normalizeCitySlug(), NotionMergeCity (+8 more)

### Community 16 - "rome-hotel-neighborhoods.ts"
Cohesion: 0.15
Nodes (15): src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles, researchSources (+7 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "sync-travel-notion.mjs"
Cohesion: 0.09
Nodes (54): ref_node_fs, CATEGORY_ALIASES, CATEGORY_BY_LABEL, CATEGORY_META, categoryLabel(), CITY_ALIASES, CITY_BY_LABEL, CITY_META (+46 more)

### Community 19 - "hotel-ranking.test.ts"
Cohesion: 0.18
Nodes (7): categoryScores, hotel, name, point, targets, walk, zone

### Community 20 - "hotel-booking-details.test.ts"
Cohesion: 0.18
Nodes (11): BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), booking, categories (+3 more)

### Community 21 - "Rules (agents + humans)"
Cohesion: 0.07
Nodes (24): Arquitetura, Comandos, Como um LLM edita um roteiro, Contrato, Travel Boss, Travel places ↔ Notion (obrigatório), Export, Multi-city (+16 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (43): @fontsource/geist-sans, leaflet, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, leaflet, maplibre-gl (+35 more)

### Community 23 - "hotel-ranking-context.ts"
Cohesion: 0.54
Nodes (6): rankingTargets(), hotelRankingContext(), src_data_travel_stay_display, stayZonePolygons(), stayZoneRings(), stayZonesForCity()

### Community 24 - "fetch-travel-polygons.py"
Cohesion: 0.17
Nodes (23): Any, dist_point_polygon_m(), dist_point_polyline_m(), dist_point_segment_m(), extract_geojson(), fetch_nominatim(), haversine_m(), load_queries() (+15 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.10
Nodes (20): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+12 more)

### Community 26 - "travel-subcategories.ts"
Cohesion: 0.16
Nodes (14): PlaceCategory, isPlaceSubcategory(), LString, normalizeSubcategories(), parisSubcategoriesByPlaceId, pinSubcategoryPriority, PlaceSubcategory, PlaceSubcategoryMeta (+6 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Europa"
Cohesion: 0.20
Nodes (9): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Chegada · Orly · Torre, Dia 2 — Bate-volta, Dia 2 — La Défense e eixo oeste, Europa, Milão, Paris (+1 more)

### Community 30 - "travel-photos.test.ts"
Cohesion: 0.28
Nodes (5): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, travelCities

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

## Knowledge Gaps
- **295 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+290 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getTravelCity()` connect `places.ts` to `parse.ts`, `travel.ts`, `index.ts`, `travel-notion.ts`, `hotel-ranking-context.ts`, `travel-photos.test.ts`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `itineraryForCity()` connect `places.ts` to `travel.ts`, `index.ts`, `hotel-ranking-context.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Why does `mountCity()` connect `places.ts` to `hotels.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _295 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05873340143003064 - nodes in this community are weakly interconnected._
- **Should `travel-itinerary-legs.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05052631578947368 - nodes in this community are weakly interconnected._
- **Should `parse.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11822660098522167 - nodes in this community are weakly interconnected._
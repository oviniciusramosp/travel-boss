# Graph Report - travel-boss  (2026-09-23)

## Corpus Check
- 72 files · ~136,809 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: .css 4, (none) 1)

## Summary
- 706 nodes · 1705 edges · 29 communities (28 shown, 1 thin omitted)
- Extraction: 93% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 110 edges (avg confidence: 0.91)
- Token cost: 274,457 input · 0 output

## Community Hubs (Navigation)
- Hotel Search Server
- Transit Legs and Routing
- Trip Markdown Artifact
- Place Catalog Core
- Hotels View UI
- Visit Info Formatting
- Category Icons and Tooltips
- Python Hotel Helpers
- App Shell and Places View
- Stay Heatmap Data
- Area Geometry Validation
- Catalog Facade
- City Itineraries and Budgets
- Hotel Ranking Engine
- Basemap Styling
- Notion Catalog Sync
- Rome Neighborhood Safety
- TypeScript Config
- App Entry and Styles
- Hotel Ranking Tests
- Booking Details Parsing
- Leaflet Map Module
- Package Manifest
- Ranking Context and Stay Zones
- Milan Itinerary
- Place Link Resolution
- Runtime Dependencies
- Dev Dependencies
- Hotel Script Typings

## God Nodes (most connected - your core abstractions)
1. `mountCity()` - 31 edges
2. `searchAzulHotels()` - 22 edges
3. `mountTrip()` - 22 edges
4. `getTravelCity()` - 20 edges
5. `paint()` - 19 edges
6. `vitest` - 18 edges
7. `mountHotels()` - 16 edges
8. `compilerOptions` - 14 edges
9. `pickLocale()` - 13 edges
10. `bookingDetails()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `via: transport annotation (stop legs 4.6a, inter-city 5.4)` --semantically_similar_to--> `ItineraryLegDef`  [INFERRED] [semantically similar]
  docs/plano-paridade.md → src/data/travel-itinerary-legs.ts
- `Trip leg precedence (src/trip/legs.ts)` --semantically_similar_to--> `buildItineraryRoute()`  [INFERRED] [semantically similar]
  docs/plano-paridade.md → src/map/itinerary-route.ts
- `Hotel search environment (airbnb-venv, Fase 0.4)` --references--> `airbnbReady()`  [INFERRED]
  docs/plano-paridade.md → scripts/airbnb-search.mjs
- `Fase 10 — Route planner and geolocation` --references--> `rankingTargets()`  [INFERRED]
  docs/plano-paridade.md → scripts/hotel-ranking.mjs
- `Fase 9 — Hotéis e onde ficar` --shares_data_with--> `hotelEvidence()`  [INFERRED]
  docs/plano-paridade.md → scripts/hotel-ranking.mjs

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Trip artifact pipeline (SCHEMA format, parse, render, export, live feed)** — content_schema_trip_artifact_v1, content_trips_europa, vite_config_tripapi, src_trip_parse_parsetrip, src_trip_mount_mounttrip_paint, src_trip_export_triptomarkdown, src_trip_export_triptohtml [INFERRED 0.95]
- **Three identical el() DOM helpers to consolidate in src/ui/dom.ts** — src_app_shell_el, src_views_places_el, src_views_hotels_el, docs_plano_paridade_dom_el_helper [EXTRACTED 1.00]
- **airbnb-venv Python stack behind /api/hotel-search** — scripts_airbnb_requirements, package_scripts_travel_airbnb_setup, scripts_airbnb_search_py_scripts_airbnb_search, scripts_azul_search, scripts_hotel_search_searchazulhotels, scripts_airbnb_search_airbnbready, readme_api_hotel_search [INFERRED 0.95]

## Communities (29 total, 1 thin omitted)

### Community 0 - "Hotel Search Server"
Cohesion: 0.07
Nodes (75): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType() (+67 more)

### Community 1 - "Transit Legs and Routing"
Cohesion: 0.05
Nodes (70): Fase 10 — Route planner and geolocation, Trip leg precedence (src/trip/legs.ts), transferRow(leg) transfer line (src/views/transfer-row.ts), day1, day1AfterBase, day1Cdg, day2, day3 (+62 more)

### Community 2 - "Trip Markdown Artifact"
Cohesion: 0.08
Nodes (58): City section (## City + city: slug + dates:), Day section (### Dia N — Title), Trip export (Apple Notes HTML, Notion Markdown, .md download), Markdown as single source of truth (LLM edits, UI follows), Multi-city trip (several H2 sections = one trip), Narrative paragraphs under a day, Stop bullet (HH:mm + link + — note), Trip artifact format travel-boss/trip/v1 (+50 more)

### Community 3 - "Place Catalog Core"
Cohesion: 0.09
Nodes (24): areaForPlace(), OsmArea, osmTravelAreas, PlaceCategory, favoritePlaceIds(), favoritePlaces(), localTravelCities, LString (+16 more)

### Community 4 - "Hotels View UI"
Cohesion: 0.09
Nodes (32): AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey, el() (+24 more)

### Community 5 - "Visit Info Formatting"
Cohesion: 0.09
Nodes (32): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+24 more)

### Community 6 - "Category Icons and Tooltips"
Cohesion: 0.11
Nodes (28): Material Symbols Rounded icon system (src/ui/icons.ts: ICONS, icon()), Tooltip + iconButton/iconLink controls (src/ui/tooltip.ts, controls.ts), CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName (+20 more)

### Community 7 - "Python Hotel Helpers"
Cohesion: 0.08
Nodes (25): concurrent_futures, contextlib, curl_cffi, Hotel search environment (airbnb-venv, Fase 0.4), json, scripts, build, dev (+17 more)

### Community 8 - "App Shell and Places View"
Cohesion: 0.14
Nodes (26): Shared el() DOM helper (src/ui/dom.ts, task 1.1), Fase 2 — Confirmed audit bug fixes (2.1–2.16), Fase 3 — Navigation, state and locale (hash router, store, i18n, keyboard), el(), Locale, mountShell(), readLocale(), Shell (+18 more)

### Community 9 - "Stay Heatmap Data"
Cohesion: 0.11
Nodes (27): BY_CITY, CITY_SEARCH, citySearchName(), hasStayHeat(), LISBON, ROME, searchQuery(), STAY_HEAT_BEST_MIN (+19 more)

### Community 10 - "Area Geometry Validation"
Cohesion: 0.15
Nodes (22): AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM(), haversineM() (+14 more)

### Community 11 - "Catalog Facade"
Cohesion: 0.17
Nodes (19): Fase 6 — Places list and panel v2, placeCategoriesOffByDefault, placeCategoryMeta, placeCategoryOrder, googleMapsUrl(), Locale, resolvePlacePhotos(), TravelCity (+11 more)

### Community 12 - "City Itineraries and Budgets"
Cohesion: 0.15
Nodes (20): Fase 8 — City itinerary timeline, computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption (+12 more)

### Community 13 - "Hotel Ranking Engine"
Cohesion: 0.16
Nodes (19): ref_node_crypto, accommodationEligibility(), airbnbQuality(), clamp(), evaluateJev(), hotelEvidence(), hotelRegion(), insideRing() (+11 more)

### Community 14 - "Basemap Styling"
Cohesion: 0.14
Nodes (17): maplibre-gl, applyBrightBasemap(), bindBrightBasemap(), HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter(), PLACE_LABEL_LAYERS, PLACE_LABEL_MINZOOM, POI_LAYERS_EXCLUDE_BUS (+9 more)

### Community 15 - "Notion Catalog Sync"
Cohesion: 0.16
Nodes (15): Fase 12 — Catalog pipeline port (Notion sync, OSM areas, photos, stay display), snapshot, LString, mergeNotionPlaces(), normalizeCategorySlug(), normalizeCitySlug(), NotionMergeCity, NotionPhoto (+7 more)

### Community 16 - "Rome Neighborhood Safety"
Cohesion: 0.15
Nodes (15): src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles, researchSources (+7 more)

### Community 17 - "TypeScript Config"
Cohesion: 0.12
Nodes (15): compilerOptions, forceConsistentCasingInFileNames, isolatedModules, lib, module, moduleResolution, noEmit, noUnusedLocals (+7 more)

### Community 18 - "App Entry and Styles"
Cohesion: 0.18
Nodes (13): cityNav, dispose(), map, root, shell, showCity(), showTrip(), tripNav (+5 more)

### Community 19 - "Hotel Ranking Tests"
Cohesion: 0.15
Nodes (8): vitest, categoryScores, hotel, name, point, targets, walk, zone

### Community 20 - "Booking Details Parsing"
Cohesion: 0.18
Nodes (11): BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), booking, categories (+3 more)

### Community 21 - "Leaflet Map Module"
Cohesion: 0.22
Nodes (9): Fase 7 — Map (glyph pins, list↔map hover, camera policy, areas, transit, controls), Map API: hover(id) vs select(id), onHover, setPadding, diffed setPins, leaflet, @maplibre/maplibre-gl-leaflet, KINDS, mountMap(), zoomBucket(), MapPinKind (+1 more)

### Community 22 - "Package Manifest"
Cohesion: 0.18
Nodes (10): engines, node, name, private, type, version, @fontsource/geist-sans, @types/leaflet (+2 more)

### Community 23 - "Ranking Context and Stay Zones"
Cohesion: 0.54
Nodes (6): rankingTargets(), hotelRankingContext(), src_data_travel_stay_display, stayZonePolygons(), stayZoneRings(), stayZonesForCity()

### Community 24 - "Milan Itinerary"
Cohesion: 0.40
Nodes (5): ItineraryDay, TravelItinerary, excursion(), l(), milanItinerary

### Community 25 - "Place Link Resolution"
Cohesion: 0.60
Nodes (5): place:<placeId> catalog link, getTravelCity(), resolveHref(), stopPins(), checkPlaces()

### Community 26 - "Runtime Dependencies"
Cohesion: 0.40
Nodes (5): dependencies, @fontsource/geist-sans, leaflet, maplibre-gl, @maplibre/maplibre-gl-leaflet

### Community 27 - "Dev Dependencies"
Cohesion: 0.40
Nodes (5): devDependencies, @types/leaflet, typescript, vite, vitest

## Ambiguous Edges - Review These
- `travel-milan-itinerary.ts` → `Markdown as single source of truth (LLM edits, UI follows)`  [AMBIGUOUS]
  content/SCHEMA.md · relation: conceptually_related_to

## Knowledge Gaps
- **192 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+187 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 233 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `travel-milan-itinerary.ts` and `Markdown as single source of truth (LLM edits, UI follows)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `vitest` connect `Hotel Ranking Tests` to `Hotel Search Server`, `Trip Markdown Artifact`, `Place Catalog Core`, `Category Icons and Tooltips`, `Stay Heatmap Data`, `Area Geometry Validation`, `City Itineraries and Budgets`, `Hotel Ranking Engine`, `Basemap Styling`, `Rome Neighborhood Safety`, `Booking Details Parsing`, `Package Manifest`, `Ranking Context and Stay Zones`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `Travel catalog (cities, places, city itineraries, search engine)` connect `Trip Markdown Artifact` to `Hotel Search Server`, `Place Catalog Core`, `Catalog Facade`?**
  _High betweenness centrality (0.098) - this node is a cross-community bridge._
- **Why does `Hotel search environment (airbnb-venv, Fase 0.4)` connect `Python Hotel Helpers` to `Hotel Search Server`, `Trip Markdown Artifact`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `mountCity()` (e.g. with `Fase 2 — Confirmed audit bug fixes (2.1–2.16)` and `Fase 3 — Navigation, state and locale (hash router, store, i18n, keyboard)`) actually correct?**
  _`mountCity()` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 8 inferred relationships involving `paint()` (e.g. with `Fase 2 — Confirmed audit bug fixes (2.1–2.16)` and `Fase 5 — Multi-city trip UI (summary strip, overview map, rail navigation)`) actually correct?**
  _`paint()` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _192 weakly-connected nodes found - possible documentation gaps or missing edges._
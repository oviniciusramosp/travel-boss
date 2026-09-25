# Graph Report - disney-paris-itinerary-c67dae  (2026-09-25)

## Corpus Check
- 174 files · ~254,388 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1412 nodes · 3617 edges · 63 communities (62 shown, 1 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 18 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6913f358`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search.mjs
- expandTimelineTransferParts
- travel-area-geometry.ts
- place-panel.ts
- hotels.ts
- travel-visit.ts
- travel-categories.ts
- fetch-travel-polygons.py
- places.ts
- travel-stay-heatmap.ts
- travel-areas.test.ts
- shell.ts
- index.ts
- hotel-ranking.mjs
- main.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- mountHotels
- timeline.ts
- areas.ts
- Travel Boss
- scripts
- basemap-style.ts
- mount.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- travel-subcategories.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- travelCities
- Travel Boss
- Milão — 11–14 de outubro de 2026
- transfer-row.ts
- travel-itinerary-legs.ts
- route.ts
- walk-route.ts
- export.ts
- hotel-search-match.mjs
- hotel-rank.ts
- mountMap
- paint
- travel.ts
- maplibre-perf.ts
- route-draw.ts
- el
- airbnb-search.mjs
- overlays.ts
- pickLocale
- summary.ts
- vite.config.ts
- place-index.ts
- parse.ts
- open-now.ts
- map.ts
- hotel-ring.ts
- hotel-dates.ts
- directions.ts
- trackpad.ts
- overview.ts
- asMsg

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 75 edges
2. `mountCity()` - 67 edges
3. `el()` - 47 edges
4. `paint()` - 45 edges
5. `mountHotels()` - 42 edges
6. `icon()` - 41 edges
7. `mountTrip()` - 31 edges
8. `getTravelCity()` - 28 edges
9. `mountPlacePanel()` - 24 edges
10. `iconButton()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `paris()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/legs.test.ts → src/data/travel.ts
- `place()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/route.test.ts → src/data/travel.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (63 total, 1 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (26): parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT (+18 more)

### Community 1 - "expandTimelineTransferParts"
Cohesion: 0.43
Nodes (8): estimateLegDurationMin(), expandTimelineTransferParts(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin(), haversineM()

### Community 2 - "travel-area-geometry.ts"
Cohesion: 0.21
Nodes (15): AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM(), haversineM() (+7 more)

### Community 3 - "place-panel.ts"
Cohesion: 0.11
Nodes (32): categoryMaterialName(), PlaceCategoryMeta, googleMapsUrl(), Locale, iconButton(), icon(), ICON_FONT_HREF, IconName (+24 more)

### Community 4 - "hotels.ts"
Cohesion: 0.11
Nodes (18): Shell, AccommodationType, Booking, CATEGORIES, CategoryKey, Eligibility, Hotel, HotelRanking (+10 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (28): cafeVisit(), CrowdProfile, formatMoneyTypical(), free, L(), landmarkOutdoor(), Locale, lodgingVisit() (+20 more)

### Community 6 - "travel-categories.ts"
Cohesion: 0.18
Nodes (12): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+4 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "places.ts"
Cohesion: 0.13
Nodes (32): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, ItineraryDay, ItineraryStop, subcategoryLabel(), TravelPlace, iconLink() (+24 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (64): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+56 more)

### Community 10 - "travel-areas.test.ts"
Cohesion: 0.18
Nodes (14): installOsmAreas(), Lookup, OsmOutline, OSM_AREA_IDS, areaForPlace(), OsmArea, osmTravelAreas, MIN_AUTHORED_POLYLINE_POINTS (+6 more)

### Community 11 - "shell.ts"
Cohesion: 0.08
Nodes (44): browserLanguages(), clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), activeTheme() (+36 more)

### Community 12 - "index.ts"
Cohesion: 0.13
Nodes (24): favoritePlaces(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, itineraryForCity(), parisD1AfterBase (+16 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (37): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+29 more)

### Community 14 - "main.ts"
Cohesion: 0.08
Nodes (42): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+34 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.16
Nodes (27): ItineraryTransitHop, lineBrandColor(), getTransitLine(), LatLng, nearestStation(), stationById(), asCoord(), BuildItineraryOptions (+19 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.07
Nodes (62): arrivalKey(), categoryFilterKey, groupsKey(), read(), readArrival(), readCategoryFilter(), readGroups(), write() (+54 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 19 - "timeline.ts"
Cohesion: 0.10
Nodes (42): computeDayBudget(), computeTripBudget(), moneyTypicalEur(), resolveVisit(), budgetChip(), budgetDay(), budgetGroup(), dayBudgetEl() (+34 more)

### Community 20 - "areas.ts"
Cohesion: 0.36
Nodes (7): loadOsmAreas(), osmAreaFor(), osmAreasReady(), placeHasOsmArea(), resolvePlaceArea(), ensureOsmAreas(), invalidateResolvedPlaces()

### Community 21 - "Travel Boss"
Cohesion: 0.12
Nodes (14): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Travel Boss, Export, Multi-city (+6 more)

### Community 22 - "scripts"
Cohesion: 0.06
Nodes (33): @fontsource/geist-sans, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, leaflet, maplibre-gl, @maplibre/maplibre-gl-leaflet (+25 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (27): applyBrightBasemap(), BASEMAP_THEME_EVENT, BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter() (+19 more)

### Community 24 - "mount.ts"
Cohesion: 0.12
Nodes (24): changedStopKeys(), stopFingerprint(), trip(), visitStops(), cityHash(), CityHashTab, appLink(), emptyNotice() (+16 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.10
Nodes (20): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+12 more)

### Community 26 - "travel-subcategories.ts"
Cohesion: 0.19
Nodes (13): placePinMaterialName(), isPlaceSubcategory(), LString, normalizeSubcategories(), parisSubcategoriesByPlaceId, pinMaterialFromSubcategories(), pinSubcategoryPriority, PlaceSubcategory (+5 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, topo da Torre Eiffel e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Café reforçado, Opéra, Uniqlo e Créteil, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Janou e pôr do sol em Montmartre (+7 more)

### Community 30 - "travelCities"
Cohesion: 0.28
Nodes (5): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, travelCities

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "transfer-row.ts"
Cohesion: 0.26
Nodes (15): formatLegDuration(), legDisplayLabel(), legLineColor(), TripLegMode, chipTone(), durationMinutes(), identityOf(), isTransferPart() (+7 more)

### Community 35 - "travel-itinerary-legs.ts"
Cohesion: 0.07
Nodes (34): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+26 more)

### Community 36 - "route.ts"
Cohesion: 0.09
Nodes (31): ItineraryLegDef, milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey() (+23 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.11
Nodes (29): abortError(), acquire(), bindUser(), cached(), execute(), fetchWalkingRoute(), hydrate(), inflight (+21 more)

### Community 38 - "export.ts"
Cohesion: 0.18
Nodes (19): copyTrip(), dayToMarkdown(), downloadTrip(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown(), escapeHtml() (+11 more)

### Community 39 - "hotel-search-match.mjs"
Cohesion: 0.19
Nodes (24): bookingLookup(), ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge() (+16 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "mountMap"
Cohesion: 0.19
Nodes (18): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+10 more)

### Community 42 - "paint"
Cohesion: 0.18
Nodes (28): getTravelCity(), clearStopCurrent(), mountTrip(), applyQuery(), bindSpy(), drawTripRoutes(), flashMs(), flashSource() (+20 more)

### Community 43 - "travel.ts"
Cohesion: 0.12
Nodes (14): favoritePlaceIds(), ItinerarySlot, localTravelCities, l(), milanCity, place(), travelCountryKeys, TravelLandmark (+6 more)

### Community 44 - "maplibre-perf.ts"
Cohesion: 0.70
Nodes (3): MAPLIBRE_PERF, maplibreFade(), labelFadeDuration()

### Community 45 - "route-draw.ts"
Cohesion: 0.19
Nodes (16): drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer(), routeEmphasis() (+8 more)

### Community 46 - "el"
Cohesion: 0.19
Nodes (16): googleDirectionsUrl(), el(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection() (+8 more)

### Community 47 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (24): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType() (+16 more)

### Community 48 - "overlays.ts"
Cohesion: 0.27
Nodes (8): TransitLine, Area, drawableRings(), fadeMs(), mountPlaceOverlays(), paint(), transitLineForPlace(), cssToken()

### Community 49 - "pickLocale"
Cohesion: 0.25
Nodes (14): pickLocale(), appendCityBar(), clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating() (+6 more)

### Community 50 - "summary.ts"
Cohesion: 0.24
Nodes (13): formatSpan(), isoParts, monthName(), MONTHS, nightsBetween(), Trip, TripCity, CityBand (+5 more)

### Community 51 - "vite.config.ts"
Cohesion: 0.29
Nodes (7): hotelSearchVite(), parseTripRequest(), tripIdFromPath(), TripPush, TripPushReason, tripApi(), tripsDir

### Community 52 - "place-index.ts"
Cohesion: 0.17
Nodes (16): placePinIconHtml(), modelFor(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel() (+8 more)

### Community 53 - "parse.ts"
Cohesion: 0.19
Nodes (19): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), fold() (+11 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "map.ts"
Cohesion: 0.26
Nodes (11): KINDS, MapCityPin, MapHandle, MapOverviewCity, MapPadding, MapPin, MapPinKind, MapRadius (+3 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "directions.ts"
Cohesion: 0.36
Nodes (6): directionsMode, DirectionsPoint, haversineM(), a, b, far

### Community 59 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 60 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 61 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

## Knowledge Gaps
- **349 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+344 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `place-panel.ts`, `hotels.ts`, `places.ts`, `travel-stay-heatmap.ts`, `shell.ts`, `index.ts`, `main.ts`, `route-planner.ts`, `mountHotels`, `timeline.ts`, `mount.ts`, `transfer-row.ts`, `export.ts`, `hotel-rank.ts`, `paint`, `travel.ts`, `el`, `summary.ts`, `parse.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `route.ts`, `hotels.ts`, `places.ts`, `travel-stay-heatmap.ts`, `travel.ts`, `index.ts`, `main.ts`, `mountHotels`, `timeline.ts`, `parse.ts`, `mount.ts`, `travelCities`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `mountCity()` connect `places.ts` to `place-panel.ts`, `hotels.ts`, `paint`, `shell.ts`, `index.ts`, `route-draw.ts`, `main.ts`, `itinerary-route.ts`, `route-planner.ts`, `pickLocale`, `el`, `timeline.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _349 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14838709677419354 - nodes in this community are weakly interconnected._
- **Should `place-panel.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1064102564102564 - nodes in this community are weakly interconnected._
- **Should `hotels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
# Graph Report - travel-boss  (2026-09-23)

## Corpus Check
- 183 files · ~307,098 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1489 nodes · 3795 edges · 63 communities (62 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0f5ea49e`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search.mjs
- travel-itinerary-legs.ts
- parse.ts
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
- sync-travel-notion.mjs
- pickLocale
- hotel-booking-details.test.ts
- Rules (agents + humans)
- scripts
- basemap-style.ts
- mount.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- travel-subcategories.ts
- Hotel priorities
- hotel-scripts.d.ts
- Europa
- travelCities
- Travel Boss
- Milão — 11–14 de outubro de 2026
- transfer-row.ts
- travel-transit-lines.ts
- getTravelCity
- walk-route.ts
- export.ts
- hotel-search-match.mjs
- hotel-rank.ts
- mountMap
- paint
- travel.ts
- motion.ts
- route-draw.ts
- hotel-distance.ts
- airbnb-search.mjs
- overlays.ts
- el
- summary.ts
- vite.config.ts
- pin-visual.ts
- errors.ts
- open-now.ts
- map.ts
- hotel-ring.ts
- hotel-dates.ts
- getTransitLine
- trackpad.ts
- overview.ts
- travel-milan.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 75 edges
2. `mountCity()` - 67 edges
3. `el()` - 47 edges
4. `paint()` - 45 edges
5. `mountHotels()` - 42 edges
6. `icon()` - 41 edges
7. `mountTrip()` - 31 edges
8. `getTravelCity()` - 29 edges
9. `mountPlacePanel()` - 24 edges
10. `iconButton()` - 22 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts
- `tripApi()` --calls--> `parseTripRequest()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts
- `normalizeAirbnb()` --calls--> `haversineM()`  [EXTRACTED]
  scripts/airbnb-search.mjs → scripts/hotel-search-match.mjs

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (63 total, 1 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (28): AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT, bookingDetails() (+20 more)

### Community 1 - "travel-itinerary-legs.ts"
Cohesion: 0.13
Nodes (21): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+13 more)

### Community 2 - "parse.ts"
Cohesion: 0.21
Nodes (17): changedStopKeys(), stopFingerprint(), trip(), visitStops(), checkPlaces(), durationList(), fold(), legMode() (+9 more)

### Community 3 - "place-panel.ts"
Cohesion: 0.10
Nodes (36): categoryMaterialName(), PlaceCategoryMeta, googleMapsUrl(), Locale, TravelCity, travelUi, appendCityBar(), iconLink() (+28 more)

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (36): hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey (+28 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.10
Nodes (27): cafeVisit(), CrowdProfile, formatMoneyTypical(), free, L(), landmarkOutdoor(), Locale, lodgingVisit() (+19 more)

### Community 6 - "travel-categories.ts"
Cohesion: 0.18
Nodes (12): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+4 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "places.ts"
Cohesion: 0.11
Nodes (38): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, ItineraryDay, ItineraryStop, subcategoryLabel(), TravelPlace, buildItineraryRoute() (+30 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (64): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+56 more)

### Community 10 - "travel-areas.test.ts"
Cohesion: 0.06
Nodes (50): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+42 more)

### Community 11 - "shell.ts"
Cohesion: 0.14
Nodes (27): browserLanguages(), clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell (+19 more)

### Community 12 - "index.ts"
Cohesion: 0.14
Nodes (25): favoritePlaces(), computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption (+17 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.10
Nodes (29): ref_node_crypto, accommodationEligibility(), airbnbQuality(), clamp(), evaluateJev(), hotelEvidence(), hotelRegion(), insideRing() (+21 more)

### Community 14 - "main.ts"
Cohesion: 0.08
Nodes (42): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+34 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.19
Nodes (22): ItineraryTransitHop, LatLng, nearestStation(), sliceLinePath(), stationById(), asCoord(), BuildItineraryOptions, BuiltItineraryRoute (+14 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (77): arrivalKey(), categoryFilterKey, groupsKey(), read(), readArrival(), readCategoryFilter(), readGroups(), write() (+69 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "sync-travel-notion.mjs"
Cohesion: 0.09
Nodes (54): ref_node_fs, CATEGORY_ALIASES, CATEGORY_BY_LABEL, CATEGORY_META, categoryLabel(), CITY_ALIASES, CITY_BY_LABEL, CITY_META (+46 more)

### Community 19 - "pickLocale"
Cohesion: 0.11
Nodes (38): TimelineTransferPart, pickLocale(), toPins(), budgetChip(), budgetDay(), budgetGroup(), dayBudgetEl(), dayDirectionsUrl() (+30 more)

### Community 20 - "hotel-booking-details.test.ts"
Cohesion: 0.12
Nodes (18): airbnbSnapshot(), BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), parseCategoryScores(), STAFF_MINIMUM, validScore() (+10 more)

### Community 21 - "Rules (agents + humans)"
Cohesion: 0.07
Nodes (24): Arquitetura, Comandos, Como um LLM edita um roteiro, Contrato, Travel Boss, Travel places ↔ Notion (obrigatório), Export, Multi-city (+16 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (43): @fontsource/geist-sans, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, leaflet, maplibre-gl, @maplibre/maplibre-gl-leaflet (+35 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (27): applyBrightBasemap(), BASEMAP_THEME_EVENT, BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter() (+19 more)

### Community 24 - "mount.ts"
Cohesion: 0.13
Nodes (21): cityHash(), CityHashTab, appLink(), emptyNotice(), loadTripFile(), loadTripFiles(), routeHops(), screenCities() (+13 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.10
Nodes (20): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+12 more)

### Community 26 - "travel-subcategories.ts"
Cohesion: 0.19
Nodes (13): placePinMaterialName(), isPlaceSubcategory(), LString, normalizeSubcategories(), parisSubcategoriesByPlaceId, pinMaterialFromSubcategories(), pinSubcategoryPriority, PlaceSubcategory (+5 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Europa"
Cohesion: 0.20
Nodes (9): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Chegada · Orly · Torre, Dia 2 — Bate-volta, Dia 2 — La Défense e eixo oeste, Europa, Milão, Paris (+1 more)

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
Cohesion: 0.24
Nodes (16): formatLegDuration(), legDisplayLabel(), legLineColor(), TripLegMode, chipTone(), durationMinutes(), identityOf(), isTransferPart() (+8 more)

### Community 35 - "travel-transit-lines.ts"
Cohesion: 0.13
Nodes (12): metro1, metro12, metro13, metro14, metro2, metro4, metro6, metro8 (+4 more)

### Community 36 - "getTravelCity"
Cohesion: 0.10
Nodes (33): getTravelCity(), ItineraryLegDef, lineBrandColor(), catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey() (+25 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.11
Nodes (29): abortError(), acquire(), bindUser(), cached(), execute(), fetchWalkingRoute(), hydrate(), inflight (+21 more)

### Community 38 - "export.ts"
Cohesion: 0.17
Nodes (20): copyTrip(), dayToMarkdown(), downloadTrip(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown(), escapeHtml() (+12 more)

### Community 39 - "hotel-search-match.mjs"
Cohesion: 0.22
Nodes (20): ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge(), bookingPhotoUrl() (+12 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "mountMap"
Cohesion: 0.20
Nodes (17): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+9 more)

### Community 42 - "paint"
Cohesion: 0.25
Nodes (20): clearStopCurrent(), mountTrip(), applyQuery(), bindSpy(), flashMs(), flashSource(), focusCity(), framePins() (+12 more)

### Community 43 - "travel.ts"
Cohesion: 0.12
Nodes (13): favoritePlaceIds(), ItinerarySlot, localTravelCities, travelCountryKeys, TravelLandmark, TravelRouteStop, formatDuration(), formatMoney() (+5 more)

### Community 44 - "motion.ts"
Cohesion: 0.19
Nodes (14): attachMapControls(), relabel(), uiLocale(), MAPLIBRE_PERF, maplibreFade(), CAMERA_DURATION_S, cameraMotion, CHROME_MOTION_EVENT (+6 more)

### Community 45 - "route-draw.ts"
Cohesion: 0.20
Nodes (16): drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer(), routeEmphasis() (+8 more)

### Community 46 - "hotel-distance.ts"
Cohesion: 0.18
Nodes (15): directionsMode, DirectionsPoint, googleDirectionsUrl(), haversineM(), a, b, far, Copy (+7 more)

### Community 47 - "airbnb-search.mjs"
Cohesion: 0.17
Nodes (15): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+7 more)

### Community 48 - "overlays.ts"
Cohesion: 0.20
Nodes (12): Area, drawableRings(), modelFor(), fadeMs(), mountPlaceOverlays(), paint(), Hit, placeRecord() (+4 more)

### Community 49 - "el"
Cohesion: 0.19
Nodes (13): el(), LEVEL_LABEL, Money, priceAria(), priceLevel, priceLevelOf(), row(), RowOptions (+5 more)

### Community 50 - "summary.ts"
Cohesion: 0.28
Nodes (11): formatSpan(), isoParts, monthName(), MONTHS, nightsBetween(), CityBand, cityBands(), cityStay() (+3 more)

### Community 51 - "vite.config.ts"
Cohesion: 0.29
Nodes (7): hotelSearchVite(), parseTripRequest(), tripIdFromPath(), TripPush, TripPushReason, tripApi(), tripsDir

### Community 52 - "pin-visual.ts"
Cohesion: 0.30
Nodes (10): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+2 more)

### Community 53 - "errors.ts"
Cohesion: 0.27
Nodes (10): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), firstLegs(), modeCases, parisDay() (+2 more)

### Community 54 - "open-now.ts"
Cohesion: 0.35
Nodes (9): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+1 more)

### Community 55 - "map.ts"
Cohesion: 0.36
Nodes (8): KINDS, MapCityPin, MapHandle, MapOverviewCity, MapPadding, MapPin, MapPinKind, MapRadius

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "getTransitLine"
Cohesion: 0.47
Nodes (4): getTransitLine(), TransitLine, hopLabel(), transitLineForPlace()

### Community 59 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 60 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 61 - "travel-milan.ts"
Cohesion: 0.67
Nodes (3): l(), milanCity, place()

## Knowledge Gaps
- **386 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+381 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `place-panel.ts`, `hotels.ts`, `places.ts`, `travel-stay-heatmap.ts`, `shell.ts`, `index.ts`, `main.ts`, `route-planner.ts`, `mount.ts`, `transfer-row.ts`, `export.ts`, `hotel-rank.ts`, `paint`, `travel.ts`, `motion.ts`, `hotel-distance.ts`, `el`, `summary.ts`, `errors.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `getTravelCity` to `parse.ts`, `hotels.ts`, `export.ts`, `places.ts`, `travel-stay-heatmap.ts`, `travel-areas.test.ts`, `travel.ts`, `index.ts`, `paint`, `main.ts`, `pickLocale`, `mount.ts`, `travelCities`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `itineraryForCity()` connect `index.ts` to `places.ts`, `travel-stay-heatmap.ts`, `travel.ts`, `pickLocale`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _386 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14772727272727273 - nodes in this community are weakly interconnected._
- **Should `travel-itinerary-legs.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12648221343873517 - nodes in this community are weakly interconnected._
- **Should `place-panel.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09619450317124736 - nodes in this community are weakly interconnected._
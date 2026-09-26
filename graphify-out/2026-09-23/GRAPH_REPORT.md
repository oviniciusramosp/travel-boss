# Graph Report - travel-boss  (2026-09-23)

## Corpus Check
- 185 files · ~307,642 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1503 nodes · 3835 edges · 67 communities (65 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 19 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `36215fcc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search.mjs
- travel-itinerary-legs.ts
- calendar.ts
- mount.ts
- hotels.ts
- travel-visit.ts
- travel-notion.ts
- fetch-travel-polygons.py
- places.ts
- travel-stay-heatmap.ts
- travel-areas.test.ts
- shell.ts
- travel-itineraries.ts
- hotel-ranking.mjs
- main.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- sync-travel-notion.mjs
- timeline.ts
- hotel-booking-details.test.ts
- Rules (agents + humans)
- scripts
- basemap-style.ts
- view-state.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- index.ts
- Hotel priorities
- hotel-scripts.d.ts
- Europa
- route.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- transfer-row.test.ts
- travel-transit-lines.ts
- legs.ts
- walk-route.ts
- export.ts
- hotel-search-match.mjs
- hotel-rank.ts
- camera.ts
- paint
- travel.ts
- motion.ts
- route-draw.ts
- el
- airbnb-search.mjs
- mountMap
- mountHotels
- summary.ts
- vite.config.ts
- place-index.ts
- parse.ts
- open-now.ts
- map.ts
- hotel-ring.ts
- hotel-dates.ts
- getTransitLine
- trackpad.ts
- overview.ts
- icon
- osm-area-bridge.ts
- store.ts
- links.ts
- asMsg

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 75 edges
2. `mountCity()` - 67 edges
3. `el()` - 47 edges
4. `paint()` - 44 edges
5. `mountHotels()` - 42 edges
6. `icon()` - 41 edges
7. `mountTrip()` - 33 edges
8. `getTravelCity()` - 31 edges
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

## Communities (67 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (28): AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT, bookingDetails() (+20 more)

### Community 1 - "travel-itinerary-legs.ts"
Cohesion: 0.12
Nodes (22): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+14 more)

### Community 2 - "calendar.ts"
Cohesion: 0.24
Nodes (13): assignedDayDate(), DateCity, DatedDay, daysOnDate(), eachDate(), nearestTripDate(), stayCovers(), todayIso() (+5 more)

### Community 3 - "mount.ts"
Cohesion: 0.09
Nodes (38): googleMapsUrl(), Locale, resolvePlacePhotos(), travelUi, appLink(), resolveHref(), TripFile, tripFileListeners (+30 more)

### Community 4 - "hotels.ts"
Cohesion: 0.11
Nodes (18): WhyPart, AccommodationType, Booking, CATEGORIES, CategoryKey, Eligibility, Hotel, HotelRanking (+10 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (32): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+24 more)

### Community 6 - "travel-notion.ts"
Cohesion: 0.11
Nodes (21): installOsmAreas(), OSM_AREA_IDS, areaForPlace(), OsmArea, osmTravelAreas, legsForDay(), snapshot, LString (+13 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "places.ts"
Cohesion: 0.13
Nodes (32): ItineraryDay, ItineraryStop, subcategoryLabel(), closePlace(), applyCategoryClick(), categoriesPresent(), categoryGlyph(), citySearchPlaceholder() (+24 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (65): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+57 more)

### Community 10 - "travel-areas.test.ts"
Cohesion: 0.15
Nodes (22): AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM(), haversineM() (+14 more)

### Community 11 - "shell.ts"
Cohesion: 0.14
Nodes (27): browserLanguages(), clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell (+19 more)

### Community 12 - "travel-itineraries.ts"
Cohesion: 0.14
Nodes (15): DayBudget, dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItinerarySlot, parisD1AfterBase, parisD1CdgStops, parisD1OryStops (+7 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.10
Nodes (29): ref_node_crypto, accommodationEligibility(), airbnbQuality(), clamp(), evaluateJev(), hotelEvidence(), hotelRegion(), insideRing() (+21 more)

### Community 14 - "main.ts"
Cohesion: 0.07
Nodes (46): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+38 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.19
Nodes (22): ItineraryTransitHop, stationById(), asCoord(), BuildItineraryOptions, buildItineraryRoute(), buildItineraryRoutePreview(), buildItineraryRouteSync(), BuiltItineraryRoute (+14 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.09
Nodes (57): pickLocale(), segmented(), apply(), barActive(), beginLocate(), CITY_FAR_KM, drawRoutePreview(), formatRouteDistance() (+49 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "sync-travel-notion.mjs"
Cohesion: 0.09
Nodes (54): ref_node_fs, CATEGORY_ALIASES, CATEGORY_BY_LABEL, CATEGORY_META, categoryLabel(), CITY_ALIASES, CITY_BY_LABEL, CITY_META (+46 more)

### Community 19 - "timeline.ts"
Cohesion: 0.10
Nodes (42): computeDayBudget(), computeTripBudget(), dayPrimaryRoutePlaceIds(), moneyTypicalEur(), resolveVisit(), priorityPlaceIds(), budgetChip(), budgetDay() (+34 more)

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

### Community 24 - "view-state.ts"
Cohesion: 0.18
Nodes (15): changedStopKeys(), stopFingerprint(), trip(), visitStops(), Trip, TripStop, activeSectionKey(), cityInOsrmScope() (+7 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.10
Nodes (20): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+12 more)

### Community 26 - "index.ts"
Cohesion: 0.10
Nodes (30): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon, categoryMaterialName() (+22 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Europa"
Cohesion: 0.20
Nodes (9): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Chegada · Orly · Torre, Dia 2 — Bate-volta, Dia 2 — La Défense e eixo oeste, Europa, Milão, Paris (+1 more)

### Community 30 - "route.ts"
Cohesion: 0.15
Nodes (19): ItineraryLegDef, drawTripRoutes(), neutralColor(), geometrySegments(), HopDraw, neutralStraight(), planHop(), previewHop() (+11 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "transfer-row.test.ts"
Cohesion: 0.24
Nodes (12): formatLegDuration(), legLineColor(), TripLeg, chipTone(), durationMinutes(), identityOf(), isTransferPart(), isTripLeg() (+4 more)

### Community 35 - "travel-transit-lines.ts"
Cohesion: 0.12
Nodes (13): LatLng, metro1, metro12, metro13, metro14, metro2, metro4, metro6 (+5 more)

### Community 36 - "legs.ts"
Cohesion: 0.17
Nodes (14): lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey() (+6 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.11
Nodes (29): abortError(), acquire(), bindUser(), cached(), execute(), fetchWalkingRoute(), hydrate(), inflight (+21 more)

### Community 38 - "export.ts"
Cohesion: 0.18
Nodes (19): copyTrip(), dayToMarkdown(), downloadTrip(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown(), escapeHtml() (+11 more)

### Community 39 - "hotel-search-match.mjs"
Cohesion: 0.22
Nodes (20): ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge(), bookingPhotoUrl() (+12 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 42 - "paint"
Cohesion: 0.16
Nodes (27): getTravelCity(), clearStopCurrent(), contextPlaces(), emptyNotice(), loadTripFile(), mountTrip(), applyQuery(), bindSpy() (+19 more)

### Community 43 - "travel.ts"
Cohesion: 0.09
Nodes (22): categoryColor(), PlaceCategoryIcon, favoritePlaceIds(), favoritePlaces(), localTravelCities, LString, l(), milanCity (+14 more)

### Community 44 - "motion.ts"
Cohesion: 0.19
Nodes (14): attachMapControls(), relabel(), uiLocale(), MAPLIBRE_PERF, maplibreFade(), CAMERA_DURATION_S, cameraMotion, CHROME_MOTION_EVENT (+6 more)

### Community 45 - "route-draw.ts"
Cohesion: 0.19
Nodes (16): drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer(), routeEmphasis() (+8 more)

### Community 46 - "el"
Cohesion: 0.14
Nodes (20): directionsMode, DirectionsPoint, googleDirectionsUrl(), haversineM(), a, b, far, el() (+12 more)

### Community 47 - "airbnb-search.mjs"
Cohesion: 0.17
Nodes (15): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+7 more)

### Community 48 - "mountMap"
Cohesion: 0.32
Nodes (9): Area, drawableRings(), modelFor(), mountMap(), fadeMs(), mountPlaceOverlays(), paint(), resolvedPlace() (+1 more)

### Community 49 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 50 - "summary.ts"
Cohesion: 0.29
Nodes (13): formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween(), CityBand, cityBands() (+5 more)

### Community 51 - "vite.config.ts"
Cohesion: 0.29
Nodes (7): hotelSearchVite(), parseTripRequest(), tripIdFromPath(), TripPush, TripPushReason, tripApi(), tripsDir

### Community 52 - "place-index.ts"
Cohesion: 0.20
Nodes (12): pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg(), zoomPinBucket() (+4 more)

### Community 53 - "parse.ts"
Cohesion: 0.17
Nodes (20): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), fold() (+12 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "map.ts"
Cohesion: 0.22
Nodes (13): Box, coveredInsets(), Insets, mergeInsets(), KINDS, MapCityPin, MapHandle, MapOverviewCity (+5 more)

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

### Community 61 - "icon"
Cohesion: 0.20
Nodes (15): iconButton(), IconButtonSize, IconButtonVariant, iconLink(), onSegmentKey(), segmentButtons(), segmentedMove(), segmentOn() (+7 more)

### Community 63 - "osm-area-bridge.ts"
Cohesion: 0.35
Nodes (8): loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), ensureOsmAreas(), invalidateResolvedPlaces()

### Community 64 - "store.ts"
Cohesion: 0.33
Nodes (11): arrivalKey(), categoryFilterKey, groupsKey(), read(), readArrival(), readCategoryFilter(), readGroups(), write() (+3 more)

### Community 69 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

## Knowledge Gaps
- **388 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+383 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `route-planner.ts` to `mount.ts`, `hotels.ts`, `places.ts`, `travel-stay-heatmap.ts`, `shell.ts`, `main.ts`, `timeline.ts`, `index.ts`, `transfer-row.test.ts`, `export.ts`, `hotel-rank.ts`, `paint`, `travel.ts`, `motion.ts`, `el`, `mountHotels`, `summary.ts`, `parse.ts`, `icon`?**
  _High betweenness centrality (0.054) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `mount.ts`, `legs.ts`, `hotels.ts`, `travel-notion.ts`, `places.ts`, `travel-stay-heatmap.ts`, `travel.ts`, `travel-itineraries.ts`, `main.ts`, `mountHotels`, `timeline.ts`, `parse.ts`, `index.ts`, `route.ts`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `mountCity()` connect `places.ts` to `store.ts`, `mount.ts`, `hotels.ts`, `travel-notion.ts`, `travel-stay-heatmap.ts`, `paint`, `travel.ts`, `route-draw.ts`, `main.ts`, `itinerary-route.ts`, `route-planner.ts`, `el`, `timeline.ts`, `icon`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _388 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14772727272727273 - nodes in this community are weakly interconnected._
- **Should `travel-itinerary-legs.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.12318840579710146 - nodes in this community are weakly interconnected._
- **Should `mount.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09065679925994449 - nodes in this community are weakly interconnected._
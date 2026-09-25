# Graph Report - disney-paris-itinerary-c67dae  (2026-09-25)

## Corpus Check
- 190 files · ~279,474 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1537 nodes · 4069 edges · 69 communities (67 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ea6d84a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search.mjs
- airbnb-search.mjs
- paint
- directions.ts
- hotels.ts
- travel-visit.ts
- hotel-search-match.mjs
- fetch-travel-polygons.py
- place-panel.ts
- travel-stay-heatmap.ts
- places.ts
- day-plan.ts
- itinerary-panel.ts
- hotel-ranking.mjs
- motion.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- map.ts
- timeline.ts
- index.ts
- Travel Boss
- scripts
- basemap-style.ts
- view-state.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- vite.config.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- mount.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel-areas.test.ts
- cssToken
- travel-categories.ts
- walk-route.ts
- export.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- calendar.ts
- pickLocale
- camera.ts
- transfer-row.ts
- store.ts
- travel-itineraries.ts
- place-index.ts
- overlays.ts
- parse.ts
- summary.ts
- weather.ts
- expandTimelineTransferParts
- hotel-distance.ts
- open-now.ts
- travel.ts
- hotel-ring.ts
- hotel-dates.ts
- osm-area-bridge.ts
- pin-visual.ts
- rating.ts
- main.ts
- mountMap
- getTravelCity
- getTransitLine
- trackpad.ts
- overview.ts
- links.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 93 edges
2. `el()` - 62 edges
3. `paint()` - 61 edges
4. `icon()` - 55 edges
5. `mountTrip()` - 44 edges
6. `mountHotels()` - 42 edges
7. `mountCity()` - 42 edges
8. `getTravelCity()` - 34 edges
9. `mountItineraryBoard()` - 31 edges
10. `mountPlacePanel()` - 28 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `ride()` --calls--> `sliceLinePath()`  [EXTRACTED]
  src/data/travel-itinerary-legs.ts → src/data/travel-transit-lines.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts
- `tripApi()` --calls--> `parseTripRequest()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (69 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (26): parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT (+18 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (24): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType() (+16 more)

### Community 2 - "paint"
Cohesion: 0.12
Nodes (39): pastPeriods(), periodSections(), googleDirectionsUrl(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), catalogPins() (+31 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (36): hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey (+28 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (28): cafeVisit(), CrowdProfile, formatMoneyTypical(), free, L(), landmarkOutdoor(), Locale, lodgingVisit() (+20 more)

### Community 6 - "hotel-search-match.mjs"
Cohesion: 0.19
Nodes (24): bookingLookup(), ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge() (+16 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "place-panel.ts"
Cohesion: 0.14
Nodes (29): googleMapsUrl(), Locale, subcategoryLabel(), aiBadge(), aiSuggestionTip(), TABS, iconButton(), tipText() (+21 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (64): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+56 more)

### Community 10 - "places.ts"
Cohesion: 0.14
Nodes (26): categoryMaterialName(), resolveVisit(), guidePlaceIds(), listedOrigin(), onPlaceClose(), openPlace(), repaintPlace(), setPlaceOrigin() (+18 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.18
Nodes (16): MoneyInfo, VisitInfo, BudgetLine, dateBudget, dayPeriods(), hopRails(), mealOf(), midEur() (+8 more)

### Community 12 - "itinerary-panel.ts"
Cohesion: 0.13
Nodes (23): buildItineraryRoute(), buildItineraryRoutePreview(), buildItineraryRouteSync(), toMapRoute(), IconButtonSize, IconButtonVariant, iconLink(), onSegmentKey() (+15 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (37): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+29 more)

### Community 14 - "motion.ts"
Cohesion: 0.23
Nodes (11): MAPLIBRE_PERF, maplibreFade(), CAMERA_DURATION_S, CHROME_MOTION_EVENT, CHROME_SETTLED_EVENT, EXIT_RATIO, LABEL_FADE_MS, labelFadeDuration() (+3 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.19
Nodes (21): nearestStation(), sliceLinePath(), stationById(), asCoord(), BuildItineraryOptions, BuiltItineraryRoute, expandLeg(), expandLegSync() (+13 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.08
Nodes (55): apply(), barActive(), beginLocate(), CITY_FAR_KM, drawRoutePreview(), formatRouteDistance(), formatRouteDuration(), GeoPermission (+47 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "map.ts"
Cohesion: 0.23
Nodes (12): Box, coveredInsets(), Insets, mergeInsets(), KINDS, MapCityPin, MapHandle, MapOverviewCity (+4 more)

### Community 19 - "timeline.ts"
Cohesion: 0.12
Nodes (31): ItineraryStop, legsForDay(), dayDirectionsUrl(), daySummary(), directionPoints(), hopRow(), legBetween(), mapsLink() (+23 more)

### Community 20 - "index.ts"
Cohesion: 0.14
Nodes (16): placeCategoriesOffByDefault, placeCategoryOrder, cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf (+8 more)

### Community 21 - "Travel Boss"
Cohesion: 0.11
Nodes (16): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), Travel Boss, Day card (+8 more)

### Community 22 - "scripts"
Cohesion: 0.06
Nodes (35): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+27 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (27): applyBrightBasemap(), BASEMAP_THEME_EVENT, BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter() (+19 more)

### Community 24 - "view-state.ts"
Cohesion: 0.21
Nodes (13): changedStopKeys(), stopFingerprint(), visitStops(), TripStop, activeSectionKey(), cityInOsrmScope(), dayKey(), dayOpen() (+5 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "vite.config.ts"
Cohesion: 0.29
Nodes (7): hotelSearchVite(), parseTripRequest(), tripIdFromPath(), TripPush, TripPushReason, tripApi(), tripsDir

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, topo da Torre Eiffel e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Café reforçado, Opéra, Uniqlo e Créteil, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Janou e pôr do sol em Montmartre (+7 more)

### Community 30 - "mount.ts"
Cohesion: 0.15
Nodes (22): fetchDrivingRoute(), fetchWalkingRoute(), peekWalkingRoute(), walkRouteKey(), emptyNotice(), loadTripFile(), drawTripRoutes(), walkPoints() (+14 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.12
Nodes (26): installOsmAreas(), AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM() (+18 more)

### Community 35 - "cssToken"
Cohesion: 0.19
Nodes (16): drawRouteSegments(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer(), RouteFocus, routeLayerKind() (+8 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.10
Nodes (26): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+18 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.11
Nodes (27): abortError(), acquire(), bindUser(), cached(), execute(), fetchOsrm(), hydrate(), inflight (+19 more)

### Community 38 - "export.ts"
Cohesion: 0.19
Nodes (18): copyTrip(), dayToMarkdown(), downloadTrip(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown(), escapeHtml() (+10 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.06
Nodes (36): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+28 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "calendar.ts"
Cohesion: 0.20
Nodes (16): DateCity, DatedDay, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate() (+8 more)

### Community 42 - "pickLocale"
Cohesion: 0.20
Nodes (19): pickLocale(), fillWeather(), el(), card(), GROUPS, GuideTab, GuideView, media() (+11 more)

### Community 43 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.25
Nodes (16): formatLegDuration(), legLineColor(), TimelineTransferPart, durationMinutes(), identityOf(), isTrainRide(), isTransferPart(), isTripLeg() (+8 more)

### Community 45 - "store.ts"
Cohesion: 0.27
Nodes (15): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+7 more)

### Community 46 - "travel-itineraries.ts"
Cohesion: 0.12
Nodes (24): favoritePlaceIds(), favoritePlaces(), computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug (+16 more)

### Community 47 - "place-index.ts"
Cohesion: 0.18
Nodes (9): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, resolvePlaceArea(), resolvePlacePhotos(), travelCities, withResolvedArea(), Hit (+1 more)

### Community 48 - "overlays.ts"
Cohesion: 0.23
Nodes (10): PlaceCategoryMeta, Area, drawableRings(), modelFor(), fadeMs(), mountPlaceOverlays(), paint(), placeRecord() (+2 more)

### Community 49 - "parse.ts"
Cohesion: 0.16
Nodes (21): trip(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList() (+13 more)

### Community 50 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 51 - "weather.ts"
Cohesion: 0.22
Nodes (13): cache, Entry, Hourly, keyOf(), loadForecast(), mergeWeather(), parseHourly(), peekForecast() (+5 more)

### Community 52 - "expandTimelineTransferParts"
Cohesion: 0.36
Nodes (10): estimateLegDurationMin(), expandTimelineTransferParts(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin(), walkMinutes() (+2 more)

### Community 53 - "hotel-distance.ts"
Cohesion: 0.27
Nodes (10): row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres(), say() (+2 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "travel.ts"
Cohesion: 0.13
Nodes (16): PlaceCategory, localTravelCities, l(), milanCity, place(), TravelPhoto, PlaceSubcategory, TravelCity (+8 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "osm-area-bridge.ts"
Cohesion: 0.28
Nodes (9): loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), OSM_AREA_IDS, ensureOsmAreas() (+1 more)

### Community 59 - "pin-visual.ts"
Cohesion: 0.22
Nodes (14): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+6 more)

### Community 60 - "rating.ts"
Cohesion: 0.44
Nodes (8): travelUi, clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.05
Nodes (68): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+60 more)

### Community 63 - "mountMap"
Cohesion: 0.43
Nodes (7): attachMapControls(), relabel(), uiLocale(), mountMap(), paintRouteFocus(), routeEmphasis(), cameraMotion

### Community 64 - "getTravelCity"
Cohesion: 0.10
Nodes (27): getTravelCity(), ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke (+19 more)

### Community 65 - "getTransitLine"
Cohesion: 0.38
Nodes (5): hopName(), legDisplayLabel(), getTransitLine(), TransitLine, transitLineForPlace()

### Community 67 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 69 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

## Knowledge Gaps
- **370 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+365 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `itinerary-panel.ts`, `route-planner.ts`, `timeline.ts`, `index.ts`, `mount.ts`, `export.ts`, `hotel-rank.ts`, `transfer-row.ts`, `parse.ts`, `summary.ts`, `hotel-distance.ts`, `travel.ts`, `rating.ts`, `main.ts`, `mountMap`, `getTravelCity`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `getTravelCity` to `paint`, `hotels.ts`, `travel-stay-heatmap.ts`, `calendar.ts`, `places.ts`, `itinerary-panel.ts`, `travel-itineraries.ts`, `place-index.ts`, `parse.ts`, `timeline.ts`, `index.ts`, `travel.ts`, `main.ts`, `mount.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `mountTrip()` connect `paint` to `getTravelCity`, `export.ts`, `calendar.ts`, `pickLocale`, `places.ts`, `store.ts`, `parse.ts`, `main.ts`, `mount.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _370 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14838709677419354 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.1241565452091768 - nodes in this community are weakly interconnected._
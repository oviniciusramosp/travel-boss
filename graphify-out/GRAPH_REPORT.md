# Graph Report - travel-boss  (2026-09-25)

## Corpus Check
- 184 files · ~263,855 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1508 nodes · 3965 edges · 60 communities (58 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `650447fe`
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
- mountHotels
- travel-stay-heatmap.ts
- places.ts
- mount.ts
- hotel-ranking.mjs
- motion.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- map.ts
- pickLocale
- Trip artifact — `travel-boss/trip/v1`
- scripts
- shell.ts
- view-state.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- vite.config.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- route.ts
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
- camera.ts
- transfer-row.ts
- index.ts
- parse.ts
- summary.ts
- weather.ts
- expandTimelineTransferParts
- open-now.ts
- travel.ts
- hotel-ring.ts
- hotel-dates.ts
- overlays.ts
- pin-visual.ts
- main.ts
- asMsg
- legs.ts
- trackpad.ts
- overview.ts
- links.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 86 edges
2. `paint()` - 61 edges
3. `el()` - 57 edges
4. `icon()` - 50 edges
5. `mountTrip()` - 44 edges
6. `mountHotels()` - 42 edges
7. `mountCity()` - 39 edges
8. `getTravelCity()` - 33 edges
9. `mountItineraryBoard()` - 31 edges
10. `mountPlacePanel()` - 26 edges

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
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (60 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (26): parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT (+18 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (24): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType() (+16 more)

### Community 2 - "paint"
Cohesion: 0.13
Nodes (39): getTravelCity(), googleDirectionsUrl(), cityDisplayName(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), catalogPins() (+31 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.11
Nodes (18): WhyPart, AccommodationType, Booking, CATEGORIES, CategoryKey, Eligibility, Hotel, HotelRanking (+10 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (32): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+24 more)

### Community 6 - "hotel-search-match.mjs"
Cohesion: 0.19
Nodes (24): bookingLookup(), ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge() (+16 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (64): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+56 more)

### Community 10 - "places.ts"
Cohesion: 0.11
Nodes (36): PlaceCategoryMeta, placeCategoryOrder, ItineraryStop, Locale, subcategoryLabel(), travelUi, IconName, CloseOptions (+28 more)

### Community 11 - "mount.ts"
Cohesion: 0.13
Nodes (26): BudgetLine, dateBudget, dayPeriods(), hopRails(), mealOf(), midEur(), pastPeriods(), Period (+18 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (37): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+29 more)

### Community 14 - "motion.ts"
Cohesion: 0.18
Nodes (15): attachMapControls(), relabel(), uiLocale(), MAPLIBRE_PERF, maplibreFade(), CAMERA_DURATION_S, cameraMotion, CHROME_MOTION_EVENT (+7 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.16
Nodes (25): ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, haversineM(), LatLng, nearestStation(), sliceLinePath(), stationById() (+17 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.05
Nodes (83): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+75 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "map.ts"
Cohesion: 0.23
Nodes (12): Box, coveredInsets(), Insets, mergeInsets(), KINDS, MapCityPin, MapHandle, MapOverviewCity (+4 more)

### Community 19 - "pickLocale"
Cohesion: 0.05
Nodes (95): categoryMaterialIcon, googleMapsUrl(), legsForDay(), pickLocale(), buildItineraryRoute(), buildItineraryRoutePreview(), buildItineraryRouteSync(), toMapRoute() (+87 more)

### Community 21 - "Trip artifact — `travel-boss/trip/v1`"
Cohesion: 0.11
Nodes (15): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Travel Boss, Day card, Export (+7 more)

### Community 22 - "scripts"
Cohesion: 0.06
Nodes (35): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+27 more)

### Community 23 - "shell.ts"
Cohesion: 0.06
Nodes (52): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, activeTheme() (+44 more)

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

### Community 30 - "route.ts"
Cohesion: 0.13
Nodes (23): DatedDay, drawTripRoutes(), walkPoints(), TripDay, DateStop, dateStops(), endpoints(), HopDraw (+15 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.11
Nodes (27): installOsmAreas(), AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM() (+19 more)

### Community 35 - "cssToken"
Cohesion: 0.18
Nodes (19): mountMap(), drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer() (+11 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.11
Nodes (26): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialName() (+18 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (31): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), fetchWalkingRoute() (+23 more)

### Community 38 - "export.ts"
Cohesion: 0.19
Nodes (18): copyTrip(), dayToMarkdown(), downloadTrip(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown(), escapeHtml() (+10 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.07
Nodes (32): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+24 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "calendar.ts"
Cohesion: 0.23
Nodes (14): DateCity, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso() (+6 more)

### Community 43 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.25
Nodes (16): formatLegDuration(), legLineColor(), TimelineTransferPart, TripLeg, durationMinutes(), identityOf(), isTrainRide(), isTransferPart() (+8 more)

### Community 46 - "index.ts"
Cohesion: 0.15
Nodes (23): favoritePlaceIds(), favoritePlaces(), computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug (+15 more)

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
Cohesion: 0.18
Nodes (15): estimateLegDurationMin(), expandTimelineTransferParts(), hopName(), interHopWalkM(), legDisplayLabel(), pathLengthM(), stationCountFromPath(), transitMPerMin() (+7 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "travel.ts"
Cohesion: 0.10
Nodes (22): PlaceCategory, ItinerarySlot, localTravelCities, LString, l(), milanCity, place(), photosByPlaceId (+14 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "overlays.ts"
Cohesion: 0.15
Nodes (18): loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), Area, drawableRings() (+10 more)

### Community 59 - "pin-visual.ts"
Cohesion: 0.31
Nodes (9): modelFor(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+1 more)

### Community 61 - "main.ts"
Cohesion: 0.08
Nodes (45): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+37 more)

### Community 63 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

### Community 64 - "legs.ts"
Cohesion: 0.17
Nodes (14): ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM() (+6 more)

### Community 67 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 69 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

## Knowledge Gaps
- **366 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+361 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getTravelCity()` connect `paint` to `legs.ts`, `hotels.ts`, `mountHotels`, `travel-stay-heatmap.ts`, `calendar.ts`, `mount.ts`, `places.ts`, `index.ts`, `parse.ts`, `pickLocale`, `travel.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `export.ts`, `hotel-rank.ts`, `mountHotels`, `places.ts`, `mount.ts`, `travel-stay-heatmap.ts`, `transfer-row.ts`, `motion.ts`, `index.ts`, `route-planner.ts`, `parse.ts`, `summary.ts`, `shell.ts`, `travel.ts`, `main.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `el()` connect `pickLocale` to `paint`, `hotels.ts`, `mountHotels`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `transfer-row.ts`, `route-planner.ts`, `shell.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _366 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14838709677419354 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.12955465587044535 - nodes in this community are weakly interconnected._
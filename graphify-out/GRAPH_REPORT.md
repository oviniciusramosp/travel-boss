# Graph Report - roteiro-04-outubro-d264b0  (2026-09-26)

## Corpus Check
- 193 files · ~283,788 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1553 nodes · 4114 edges · 66 communities (64 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `02ff25ca`
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
- mount.ts
- ui/controls.ts
- hotel-ranking.mjs
- store.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- motion.ts
- timeline.ts
- index.ts
- Editar um roteiro
- scripts
- basemap-style.ts
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
- legs.ts
- pickLocale
- asMsg
- transfer-row.ts
- map.ts
- mountHotels
- camera.ts
- mountMap
- parse.ts
- summary.ts
- weather.ts
- expandTimelineTransferParts
- el
- open-now.ts
- travel.ts
- hotel-ring.ts
- hotel-dates.ts
- pin-visual.ts
- rating.ts
- main.ts
- trackpad.ts
- map/controls.ts
- overview.ts
- links.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 96 edges
2. `el()` - 65 edges
3. `paint()` - 62 edges
4. `icon()` - 57 edges
5. `mountTrip()` - 44 edges
6. `mountHotels()` - 42 edges
7. `mountCity()` - 42 edges
8. `getTravelCity()` - 34 edges
9. `mountItineraryBoard()` - 31 edges
10. `mountPlacePanel()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `paris()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/legs.test.ts → src/data/travel.ts
- `place()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/route.test.ts → src/data/travel.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts
- `tripApi()` --calls--> `parseTripRequest()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (66 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (26): parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT (+18 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (24): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType() (+16 more)

### Community 2 - "paint"
Cohesion: 0.12
Nodes (42): getTravelCity(), daysOnDate(), tripDates(), googleDirectionsUrl(), cityDisplayName(), clearStopCurrent(), mountTrip(), applyQuery() (+34 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.11
Nodes (18): WhyPart, AccommodationType, Booking, CATEGORIES, CategoryKey, Eligibility, Hotel, HotelRanking (+10 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.10
Nodes (27): cafeVisit(), CrowdProfile, formatMoneyTypical(), free, L(), landmarkOutdoor(), Locale, lodgingVisit() (+19 more)

### Community 6 - "hotel-search-match.mjs"
Cohesion: 0.19
Nodes (24): bookingLookup(), ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge() (+16 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "place-panel.ts"
Cohesion: 0.13
Nodes (28): Locale, subcategoryLabel(), aiBadge(), aiSuggestionTip(), TABS, iconButton(), icon(), ICONS (+20 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (66): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+58 more)

### Community 10 - "places.ts"
Cohesion: 0.11
Nodes (34): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, ItineraryDay, ItineraryStop, TravelPlace, guidePlaceIds(), GuideTab (+26 more)

### Community 11 - "mount.ts"
Cohesion: 0.12
Nodes (28): MoneyInfo, VisitInfo, todayIso(), BudgetLine, dateBudget, dayPeriods(), hopRails(), mealOf() (+20 more)

### Community 12 - "ui/controls.ts"
Cohesion: 0.21
Nodes (13): IconButtonSize, IconButtonVariant, iconLink(), onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn() (+5 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (37): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+29 more)

### Community 14 - "store.ts"
Cohesion: 0.27
Nodes (15): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+7 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.14
Nodes (27): hopName(), ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, getTransitLine(), LatLng, nearestStation(), sliceLinePath() (+19 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.08
Nodes (56): apply(), barActive(), beginLocate(), CITY_FAR_KM, createRouteButton(), drawRoutePreview(), formatRouteDistance(), formatRouteDuration() (+48 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "motion.ts"
Cohesion: 0.25
Nodes (10): MAPLIBRE_PERF, maplibreFade(), CAMERA_DURATION_S, CHROME_MOTION_EVENT, CHROME_SETTLED_EVENT, LABEL_FADE_MS, labelFadeDuration(), readCssTime() (+2 more)

### Community 19 - "timeline.ts"
Cohesion: 0.07
Nodes (61): googleMapsUrl(), computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption (+53 more)

### Community 20 - "index.ts"
Cohesion: 0.17
Nodes (13): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+5 more)

### Community 21 - "Editar um roteiro"
Cohesion: 0.07
Nodes (23): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), 1. Onde vai cada informação, 2. O que não fazer (+15 more)

### Community 22 - "scripts"
Cohesion: 0.06
Nodes (35): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+27 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (27): applyBrightBasemap(), BASEMAP_THEME_EVENT, BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter() (+19 more)

### Community 24 - "view-state.ts"
Cohesion: 0.18
Nodes (15): changedStopKeys(), stopFingerprint(), trip(), visitStops(), Trip, TripStop, activeSectionKey(), cityInOsrmScope() (+7 more)

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
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Printemps, Opéra, Créteil e pôr do sol na Galeries Lafayette, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "route.ts"
Cohesion: 0.11
Nodes (28): DateCity, DatedDay, fold(), mentionsCity(), scheduleDays(), titleDate(), TripDate, shiftIso() (+20 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.06
Nodes (48): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+40 more)

### Community 35 - "cssToken"
Cohesion: 0.19
Nodes (16): drawRouteSegments(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer(), RouteFocus, routeLayerKind() (+8 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.09
Nodes (28): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+20 more)

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

### Community 41 - "legs.ts"
Cohesion: 0.16
Nodes (15): ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM() (+7 more)

### Community 42 - "pickLocale"
Cohesion: 0.33
Nodes (10): pickLocale(), card(), GROUPS, GuideView, media(), renderGuide(), spotChip(), WHERE (+2 more)

### Community 43 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

### Community 44 - "transfer-row.ts"
Cohesion: 0.25
Nodes (17): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), TripLeg, durationMinutes(), identityOf(), isTrainRide() (+9 more)

### Community 45 - "map.ts"
Cohesion: 0.33
Nodes (9): KINDS, MapCityPin, MapHandle, MapOverviewCity, MapPadding, MapPin, MapPinKind, MapRadius (+1 more)

### Community 46 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 47 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 48 - "mountMap"
Cohesion: 0.32
Nodes (7): Box, coveredInsets(), Insets, mergeInsets(), mountMap(), paintRouteFocus(), routeEmphasis()

### Community 49 - "parse.ts"
Cohesion: 0.14
Nodes (24): nearestTripDate(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList() (+16 more)

### Community 50 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 51 - "weather.ts"
Cohesion: 0.20
Nodes (14): fillWeather(), cache, Entry, Hourly, keyOf(), loadForecast(), mergeWeather(), parseHourly() (+6 more)

### Community 52 - "expandTimelineTransferParts"
Cohesion: 0.36
Nodes (10): estimateLegDurationMin(), expandTimelineTransferParts(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin(), walkMinutes() (+2 more)

### Community 53 - "el"
Cohesion: 0.16
Nodes (20): categoryMaterialName(), el(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection() (+12 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "travel.ts"
Cohesion: 0.09
Nodes (21): favoritePlaceIds(), favoritePlaces(), localTravelCities, l(), milanCity, place(), photosByPlaceId, photosForPlaceId() (+13 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "pin-visual.ts"
Cohesion: 0.22
Nodes (14): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+6 more)

### Community 60 - "rating.ts"
Cohesion: 0.44
Nodes (8): travelUi, clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.05
Nodes (68): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+60 more)

### Community 65 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 66 - "map/controls.ts"
Cohesion: 0.53
Nodes (5): attachMapControls(), relabel(), uiLocale(), IconName, cameraMotion

### Community 68 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

## Knowledge Gaps
- **378 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+373 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `ui/controls.ts`, `route-planner.ts`, `timeline.ts`, `index.ts`, `export.ts`, `hotel-rank.ts`, `transfer-row.ts`, `mountHotels`, `parse.ts`, `summary.ts`, `weather.ts`, `el`, `travel.ts`, `rating.ts`, `main.ts`, `map/controls.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `hotels.ts`, `travel-stay-heatmap.ts`, `legs.ts`, `mount.ts`, `places.ts`, `mountHotels`, `parse.ts`, `timeline.ts`, `index.ts`, `travel.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `mountTrip()` connect `paint` to `export.ts`, `pickLocale`, `mount.ts`, `places.ts`, `store.ts`, `parse.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _378 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14838709677419354 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.12195121951219512 - nodes in this community are weakly interconnected._
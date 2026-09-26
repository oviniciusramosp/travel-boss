# Graph Report - hospedagens-icon-update-79f5a5  (2026-09-26)

## Corpus Check
- 191 files · ~328,544 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1578 nodes · 4164 edges · 72 communities (70 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3f9b54b7`
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
- pin-visual.ts
- hotel-ranking.mjs
- motion.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- index.ts
- timeline.ts
- route.ts
- Trip artifact — `travel-boss/trip/v1`
- scripts
- basemap-style.ts
- view-state.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- vite.config.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- stay-heatmap.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel-areas.test.ts
- cssToken
- travel-categories.ts
- walk-route.ts
- note-edit.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- calendar.ts
- travel.ts
- transfer-row.ts
- mountHotels
- travel-itineraries.ts
- pickLocale
- rome-hotel-neighborhoods.ts
- parse.ts
- summary.ts
- weather.ts
- expandTimelineTransferParts
- el
- open-now.ts
- withResolvedArea
- hotel-ring.ts
- hotel-dates.ts
- ui/controls.ts
- map.ts
- rating.ts
- main.ts
- camera.ts
- hotel-ranking.test.ts
- getTransitLine
- place-index.ts
- price.ts
- hotel-ranking-context.ts
- asMsg
- trackpad.ts
- links.ts
- overview.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 93 edges
2. `paint()` - 64 edges
3. `el()` - 64 edges
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
- `guided` --calls--> `cityGuide`  [EXTRACTED]
  src/data/travel-guide.test.ts → src/data/travel-guide.ts
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

## Communities (72 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.13
Nodes (31): airbnbSnapshot(), parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone() (+23 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.16
Nodes (16): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+8 more)

### Community 2 - "paint"
Cohesion: 0.14
Nodes (36): getTravelCity(), googleDirectionsUrl(), cityDisplayName(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), catalogPins() (+28 more)

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
Nodes (23): ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge(), bookingPhotoUrl() (+15 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "place-panel.ts"
Cohesion: 0.14
Nodes (29): categoryMaterialName(), googleMapsUrl(), cityGuide, Locale, subcategoryLabel(), aiBadge(), aiSuggestionTip(), TABS (+21 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.12
Nodes (25): BY_CITY, CITY_SEARCH, citySearchName(), LISBON, ROME, searchQuery(), STAY_HEAT_BEST_MIN, STAY_HEAT_RGB (+17 more)

### Community 10 - "places.ts"
Cohesion: 0.11
Nodes (36): placeCategoriesOffByDefault, placeCategoryOrder, ItineraryDay, ItineraryStop, TravelPlace, guidePlaceIds(), closePlace(), listedOrigin() (+28 more)

### Community 11 - "mount.ts"
Cohesion: 0.14
Nodes (25): MoneyInfo, VisitInfo, BudgetLine, dateBudget, dayPeriods(), hopRails(), mealOf(), midEur() (+17 more)

### Community 12 - "pin-visual.ts"
Cohesion: 0.20
Nodes (15): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+7 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.10
Nodes (32): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+24 more)

### Community 14 - "motion.ts"
Cohesion: 0.18
Nodes (15): attachMapControls(), relabel(), uiLocale(), MAPLIBRE_PERF, maplibreFade(), CAMERA_DURATION_S, cameraMotion, CHROME_MOTION_EVENT (+7 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.15
Nodes (24): ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, LatLng, nearestStation(), sliceLinePath(), stationById(), asCoord() (+16 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (67): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+59 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "index.ts"
Cohesion: 0.22
Nodes (10): FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide, guided (+2 more)

### Community 19 - "timeline.ts"
Cohesion: 0.09
Nodes (48): Shell, PlaceCategoryMeta, TravelCity, resolveVisit(), buildItineraryRoute(), buildItineraryRoutePreview(), buildItineraryRouteSync(), emptyCopy() (+40 more)

### Community 20 - "route.ts"
Cohesion: 0.09
Nodes (35): ItineraryLegDef, lineBrandColor(), DatedDay, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey() (+27 more)

### Community 21 - "Trip artifact — `travel-boss/trip/v1`"
Cohesion: 0.10
Nodes (17): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), Travel Boss, Day card (+9 more)

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
Cohesion: 0.17
Nodes (17): ref_node_fs, hotelSearchVite(), applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest() (+9 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, topo da Torre Eiffel e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Café reforçado, Opéra, Uniqlo e Créteil, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Janou e pôr do sol em Montmartre (+7 more)

### Community 30 - "stay-heatmap.ts"
Cohesion: 0.11
Nodes (20): src_data_travel_stay_display, hasStayHeat(), StayZone, leafletMap(), Band, BANDS, cityHasStayHeat(), Copy (+12 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.08
Nodes (38): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+30 more)

### Community 35 - "cssToken"
Cohesion: 0.17
Nodes (19): mountMap(), drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer() (+11 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.09
Nodes (28): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+20 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (31): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), fetchWalkingRoute() (+23 more)

### Community 38 - "note-edit.ts"
Cohesion: 0.08
Nodes (44): copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown() (+36 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.07
Nodes (34): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+26 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "calendar.ts"
Cohesion: 0.26
Nodes (13): DateCity, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso() (+5 more)

### Community 43 - "travel.ts"
Cohesion: 0.13
Nodes (11): favoritePlaceIds(), favoritePlaces(), localTravelCities, l(), milanCity, place(), NEAR_BNF, travelCountryKeys (+3 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.25
Nodes (16): formatLegDuration(), legLineColor(), TimelineTransferPart, durationMinutes(), identityOf(), isTrainRide(), isTransferPart(), isTripLeg() (+8 more)

### Community 45 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 46 - "travel-itineraries.ts"
Cohesion: 0.15
Nodes (19): computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, itineraryForCity() (+11 more)

### Community 47 - "pickLocale"
Cohesion: 0.24
Nodes (13): pickLocale(), fillWeather(), card(), GROUPS, GuideTab, GuideView, media(), renderGuide() (+5 more)

### Community 48 - "rome-hotel-neighborhoods.ts"
Cohesion: 0.16
Nodes (14): src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles, researchSources (+6 more)

### Community 49 - "parse.ts"
Cohesion: 0.16
Nodes (21): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), fold() (+13 more)

### Community 50 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 51 - "weather.ts"
Cohesion: 0.22
Nodes (13): cache, Entry, Hourly, keyOf(), loadForecast(), mergeWeather(), parseHourly(), peekForecast() (+5 more)

### Community 52 - "expandTimelineTransferParts"
Cohesion: 0.36
Nodes (10): estimateLegDurationMin(), expandTimelineTransferParts(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin(), walkMinutes() (+2 more)

### Community 53 - "el"
Cohesion: 0.22
Nodes (14): el(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+6 more)

### Community 54 - "open-now.ts"
Cohesion: 0.35
Nodes (9): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+1 more)

### Community 55 - "withResolvedArea"
Cohesion: 0.21
Nodes (9): allPlaces(), resolvedPlaces(), photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, resolvePlaceArea(), resolvePlacePhotos() (+1 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "ui/controls.ts"
Cohesion: 0.29
Nodes (10): IconButtonSize, IconButtonVariant, iconLink(), onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn() (+2 more)

### Community 59 - "map.ts"
Cohesion: 0.22
Nodes (13): Box, coveredInsets(), Insets, mergeInsets(), KINDS, MapCityPin, MapHandle, MapOverviewCity (+5 more)

### Community 60 - "rating.ts"
Cohesion: 0.44
Nodes (8): travelUi, clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.05
Nodes (69): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+61 more)

### Community 63 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 64 - "hotel-ranking.test.ts"
Cohesion: 0.17
Nodes (8): categoryScores, hotel, name, point, targets, walk, zone, ROME_HOTEL_COVERAGE

### Community 65 - "getTransitLine"
Cohesion: 0.32
Nodes (6): hopName(), legDisplayLabel(), getTransitLine(), TransitLine, hopLabel(), transitLineForPlace()

### Community 66 - "place-index.ts"
Cohesion: 0.32
Nodes (6): modelFor(), Hit, placeRecord(), placeZoom(), resolved, resolvedPlace()

### Community 67 - "price.ts"
Cohesion: 0.39
Nodes (6): LEVEL_LABEL, Money, priceAria(), priceLevel, priceLevelOf(), placeMeta()

### Community 68 - "hotel-ranking-context.ts"
Cohesion: 0.67
Nodes (5): rankingTargets(), hotelRankingContext(), stayZonePolygons(), stayZoneRings(), stayZonesForCity()

### Community 69 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

### Community 70 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 73 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

## Knowledge Gaps
- **380 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+375 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `places.ts`, `mount.ts`, `motion.ts`, `route-planner.ts`, `index.ts`, `timeline.ts`, `stay-heatmap.ts`, `note-edit.ts`, `hotel-rank.ts`, `travel.ts`, `transfer-row.ts`, `mountHotels`, `parse.ts`, `summary.ts`, `el`, `rating.ts`, `main.ts`, `price.ts`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `hotel-ranking-context.ts`, `hotels.ts`, `calendar.ts`, `places.ts`, `travel.ts`, `mount.ts`, `mountHotels`, `travel-itineraries.ts`, `parse.ts`, `index.ts`, `timeline.ts`, `route.ts`, `withResolvedArea`, `main.ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `el()` connect `el` to `paint`, `price.ts`, `hotels.ts`, `note-edit.ts`, `place-panel.ts`, `places.ts`, `mount.ts`, `transfer-row.ts`, `mountHotels`, `pickLocale`, `route-planner.ts`, `timeline.ts`, `rating.ts`, `main.ts`, `stay-heatmap.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _380 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.14126984126984127 - nodes in this community are weakly interconnected._
- **Should `hotels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
# Graph Report - gifted-panini-8f080f  (2026-09-27)

## Corpus Check
- 211 files · ~339,201 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1612 nodes · 4148 edges · 68 communities (66 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `047566b3`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search.mjs
- stay-heatmap.ts
- paint
- directions.ts
- hotels.ts
- travel-visit.ts
- vite.config.ts
- fetch-travel-polygons.py
- place-panel.ts
- travel-stay-heatmap.ts
- places.ts
- day-plan.ts
- travel-area-geometry.ts
- hotel-ranking.mjs
- motion.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- summary.ts
- rome-hotel-neighborhoods.ts
- pin-visual.ts
- Trip artifact — `travel-boss/trip/v1`
- scripts
- basemap-style.ts
- travel.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- pickLocale
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- route.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel-areas.test.ts
- travel-itineraries.ts
- travel-categories.ts
- walk-route.ts
- note-edit.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- hotel-ranking.test.ts
- price.ts
- map.ts
- transfer-row.ts
- hotel-ranking-context.ts
- legs.ts
- amenities.ts
- parse.ts
- calendar.ts
- weather.ts
- expandTimelineTransferParts
- hotel-distance.ts
- open-now.ts
- mount.ts
- hotel-ring.ts
- hotel-dates.ts
- camera.ts
- icons.ts
- rating.ts
- main.ts
- index.ts
- trackpad.ts
- overview.ts
- links.ts
- overlays.ts
- el

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 95 edges
2. `paint()` - 69 edges
3. `el()` - 65 edges
4. `icon()` - 58 edges
5. `mountTrip()` - 44 edges
6. `mountCity()` - 43 edges
7. `mountHotels()` - 42 edges
8. `getTravelCity()` - 31 edges
9. `mountPlacePanel()` - 29 edges
10. `Locale` - 24 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `guided` --calls--> `cityGuide`  [EXTRACTED]
  src/data/travel-guide.test.ts → src/data/travel-guide.ts
- `paris()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/legs.test.ts → src/data/travel.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (68 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.06
Nodes (74): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType(), extract() (+66 more)

### Community 1 - "stay-heatmap.ts"
Cohesion: 0.11
Nodes (20): src_data_travel_stay_display, hasStayHeat(), StayZone, leafletMap(), Band, BANDS, cityHasStayHeat(), Copy (+12 more)

### Community 2 - "paint"
Cohesion: 0.13
Nodes (37): getTravelCity(), cityDisplayName(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), catalogPins(), datedPoints() (+29 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (36): hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey (+28 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.08
Nodes (33): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+25 more)

### Community 6 - "vite.config.ts"
Cohesion: 0.19
Nodes (16): hotelSearchVite(), applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest(), readTripPatch() (+8 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "place-panel.ts"
Cohesion: 0.15
Nodes (24): googleMapsUrl(), cityGuide, aiBadge(), aiSuggestionTip(), TABS, iconButton(), tipText(), icon() (+16 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.12
Nodes (26): src_data_rome_hotel_boundaries, BY_CITY, CITY_SEARCH, citySearchName(), LISBON, ROME, searchQuery(), STAY_HEAT_BEST_MIN (+18 more)

### Community 10 - "places.ts"
Cohesion: 0.12
Nodes (31): placeCategoriesOffByDefault, subcategoryLabel(), amenityName(), closePlace(), onPlaceClose(), repaintPlace(), amenityGroup(), applyCategoryClick() (+23 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.17
Nodes (21): BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot(), mealOf() (+13 more)

### Community 12 - "travel-area-geometry.ts"
Cohesion: 0.21
Nodes (15): AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM(), haversineM() (+7 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.11
Nodes (28): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+20 more)

### Community 14 - "motion.ts"
Cohesion: 0.20
Nodes (13): MAPLIBRE_PERF, maplibreFade(), walkColor(), CAMERA_DURATION_S, CHROME_MOTION_EVENT, CHROME_SETTLED_EVENT, cssToken(), EXIT_RATIO (+5 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.15
Nodes (27): hopName(), ItineraryTransitHop, WALK_CONNECTOR_MIN_M, getTransitLine(), LatLng, nearestStation(), stationById(), asCoord() (+19 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (68): categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readCategoryFilter(), readGroups(), readPeriods() (+60 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 19 - "rome-hotel-neighborhoods.ts"
Cohesion: 0.17
Nodes (13): Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles, researchSources, reviews (+5 more)

### Community 20 - "pin-visual.ts"
Cohesion: 0.16
Nodes (19): placePinIconHtml(), modelFor(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel() (+11 more)

### Community 21 - "Trip artifact — `travel-boss/trip/v1`"
Cohesion: 0.07
Nodes (24): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), 1. Onde vai cada informação, 2. O que não fazer (+16 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (36): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+28 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (27): applyBrightBasemap(), BASEMAP_THEME_EVENT, BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter() (+19 more)

### Community 24 - "travel.ts"
Cohesion: 0.10
Nodes (19): PlaceCategory, favoritePlaceIds(), favoritePlaces(), DayBudget, ItinerarySlot, localTravelCities, l(), milanCity (+11 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "pickLocale"
Cohesion: 0.26
Nodes (12): pickLocale(), card(), GROUPS, guidePlaceIds(), GuideTab, GuideView, media(), renderGuide() (+4 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Printemps, Opéra e pôr do sol na Galeries Lafayette, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "route.ts"
Cohesion: 0.13
Nodes (23): DatedDay, drawTripRoutes(), walkPoints(), DateStop, dateStops(), endpoints(), gatedHops(), GroupedPoint (+15 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.14
Nodes (20): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), OSM_AREA_IDS (+12 more)

### Community 35 - "travel-itineraries.ts"
Cohesion: 0.15
Nodes (20): computeDayBudget(), computeTripBudget(), dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItineraryDay, itineraryForCity() (+12 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.09
Nodes (29): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+21 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.11
Nodes (30): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), hydrate() (+22 more)

### Community 38 - "note-edit.ts"
Cohesion: 0.08
Nodes (44): copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown() (+36 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.06
Nodes (36): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+28 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "hotel-ranking.test.ts"
Cohesion: 0.17
Nodes (8): categoryScores, hotel, name, point, targets, walk, zone, ROME_HOTEL_COVERAGE

### Community 42 - "price.ts"
Cohesion: 0.39
Nodes (6): LEVEL_LABEL, Money, priceAria(), priceLevel, priceLevelOf(), placeMeta()

### Community 43 - "map.ts"
Cohesion: 0.17
Nodes (23): KINDS, drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer() (+15 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.25
Nodes (17): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), TripLeg, durationMinutes(), identityOf(), isTrainRide() (+9 more)

### Community 45 - "hotel-ranking-context.ts"
Cohesion: 0.67
Nodes (5): rankingTargets(), hotelRankingContext(), stayZonePolygons(), stayZoneRings(), stayZonesForCity()

### Community 47 - "legs.ts"
Cohesion: 0.16
Nodes (15): ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM() (+7 more)

### Community 48 - "amenities.ts"
Cohesion: 0.10
Nodes (32): ref_node_fs, only, amenitiesIn(), Amenity, AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin(), Box (+24 more)

### Community 49 - "parse.ts"
Cohesion: 0.14
Nodes (24): trip(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList() (+16 more)

### Community 50 - "calendar.ts"
Cohesion: 0.23
Nodes (14): DateCity, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso() (+6 more)

### Community 51 - "weather.ts"
Cohesion: 0.13
Nodes (20): Period, fillWeather(), cache, dayWeather(), Ensemble, Entry, keyOf(), loadForecast() (+12 more)

### Community 52 - "expandTimelineTransferParts"
Cohesion: 0.36
Nodes (10): estimateLegDurationMin(), expandTimelineTransferParts(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin(), walkMinutes() (+2 more)

### Community 53 - "hotel-distance.ts"
Cohesion: 0.25
Nodes (11): googleDirectionsUrl(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+3 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "mount.ts"
Cohesion: 0.17
Nodes (18): changedStopKeys(), stopFingerprint(), visitStops(), emptyNotice(), loadTripFile(), TripFile, tripFileListeners, Trip (+10 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "camera.ts"
Cohesion: 0.20
Nodes (16): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+8 more)

### Community 59 - "icons.ts"
Cohesion: 0.24
Nodes (11): IconButtonSize, IconButtonVariant, onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn(), syncSegmented() (+3 more)

### Community 60 - "rating.ts"
Cohesion: 0.53
Nodes (7): clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.05
Nodes (70): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+62 more)

### Community 64 - "index.ts"
Cohesion: 0.11
Nodes (19): FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide, guided (+11 more)

### Community 65 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 66 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 72 - "overlays.ts"
Cohesion: 0.33
Nodes (6): Area, drawableRings(), fadeMs(), mountPlaceOverlays(), paint(), transitLineForPlace()

### Community 74 - "el"
Cohesion: 0.15
Nodes (24): Locale, travelUi, openSlotRow(), railHalf(), iconLink(), openDialog(), el(), openVideo() (+16 more)

## Knowledge Gaps
- **396 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+391 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `stay-heatmap.ts`, `paint`, `hotels.ts`, `place-panel.ts`, `places.ts`, `route-planner.ts`, `summary.ts`, `travel.ts`, `note-edit.ts`, `hotel-rank.ts`, `price.ts`, `transfer-row.ts`, `amenities.ts`, `parse.ts`, `weather.ts`, `hotel-distance.ts`, `mount.ts`, `rating.ts`, `main.ts`, `index.ts`, `el`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `index.ts`, `travel-itineraries.ts`, `hotels.ts`, `places.ts`, `hotel-ranking-context.ts`, `legs.ts`, `parse.ts`, `calendar.ts`, `mount.ts`, `travel.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Why does `cssToken()` connect `motion.ts` to `stay-heatmap.ts`, `paint`, `overlays.ts`, `map.ts`, `itinerary-route.ts`, `amenities.ts`, `pin-visual.ts`, `mount.ts`, `hotel-ring.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _396 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0642570281124498 - nodes in this community are weakly interconnected._
- **Should `stay-heatmap.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11255411255411256 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.13363363363363365 - nodes in this community are weakly interconnected._
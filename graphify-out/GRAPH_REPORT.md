# Graph Report - roteiros-valores-pessoa-7575f7  (2026-09-27)

## Corpus Check
- 212 files · ~343,855 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1653 nodes · 4388 edges · 68 communities (66 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `66304703`
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
- store.ts
- hotel-ranking.mjs
- motion.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- summary.ts
- timeline.ts
- pin-visual.ts
- Trip artifact — `travel-boss/trip/v1`
- scripts
- basemap-style.ts
- travel.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- map/controls.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- mount.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel-areas.test.ts
- travel-itineraries.ts
- travel-categories.ts
- walk-route.ts
- note-edit.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- mountMap
- ItineraryDay
- map.ts
- transfer-row.ts
- travel-milan.ts
- legs.ts
- amenities.ts
- parse.ts
- calendar.ts
- weather.ts
- expandTimelineTransferParts
- hotel-distance.ts
- open-now.ts
- view-state.ts
- hotel-ring.ts
- hotel-dates.ts
- camera.ts
- shell.ts
- rating.ts
- main.ts
- index.ts
- trackpad.ts
- overview.ts
- links.ts
- getTransitLine
- pickLocale

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 106 edges
2. `el()` - 74 edges
3. `paint()` - 69 edges
4. `icon()` - 62 edges
5. `mountTrip()` - 44 edges
6. `mountCity()` - 43 edges
7. `mountHotels()` - 42 edges
8. `getTravelCity()` - 34 edges
9. `mountItineraryBoard()` - 31 edges
10. `mountPlacePanel()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `guided` --calls--> `cityGuide`  [EXTRACTED]
  src/data/travel-guide.test.ts → src/data/travel-guide.ts
- `paris()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/legs.test.ts → src/data/travel.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts
- `tripApi()` --calls--> `parseTripRequest()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (68 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.13
Nodes (31): airbnbSnapshot(), parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone() (+23 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.13
Nodes (19): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+11 more)

### Community 2 - "paint"
Cohesion: 0.15
Nodes (30): clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), datedPoints(), datePlaces(), flashMs(), flashSource() (+22 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (36): hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey (+28 more)

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
Cohesion: 0.11
Nodes (35): categoryMaterialName(), googleMapsUrl(), cityGuide, subcategoryLabel(), aiBadge(), aiSuggestionTip(), TABS, iconButton() (+27 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (65): rankingTargets(), hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds (+57 more)

### Community 10 - "places.ts"
Cohesion: 0.12
Nodes (32): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, ItineraryStop, TravelPlace, guidePlaceIds(), closePlace(), onPlaceClose() (+24 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.17
Nodes (21): BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot(), mealOf() (+13 more)

### Community 12 - "store.ts"
Cohesion: 0.27
Nodes (15): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+7 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (36): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+28 more)

### Community 14 - "motion.ts"
Cohesion: 0.22
Nodes (12): MAPLIBRE_PERF, maplibreFade(), CAMERA_DURATION_S, cameraMotion, CHROME_MOTION_EVENT, CHROME_SETTLED_EVENT, EXIT_RATIO, LABEL_FADE_MS (+4 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.15
Nodes (26): ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, LatLng, nearestStation(), sliceLinePath(), stationById(), asCoord() (+18 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.08
Nodes (55): apply(), barActive(), beginLocate(), CITY_FAR_KM, drawRoutePreview(), formatRouteDistance(), formatRouteDuration(), GeoPermission (+47 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 19 - "timeline.ts"
Cohesion: 0.09
Nodes (45): TravelCity, resolveVisit(), buildItineraryRoutePreview(), toMapRoute(), categoryGlyph(), emptyCopy(), mountItineraryBoard(), Selection (+37 more)

### Community 20 - "pin-visual.ts"
Cohesion: 0.20
Nodes (15): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+7 more)

### Community 21 - "Trip artifact — `travel-boss/trip/v1`"
Cohesion: 0.07
Nodes (24): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), 1. Onde vai cada informação, 2. O que não fazer (+16 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (36): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+28 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.07
Nodes (43): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+35 more)

### Community 24 - "travel.ts"
Cohesion: 0.13
Nodes (11): localTravelCities, NEAR_BNF, photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, resolvePlacePhotos(), travelCountryKeys (+3 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "map/controls.ts"
Cohesion: 0.27
Nodes (11): AMENITY_EVENT, AMENITY_ICON, AmenityKind, amenityName(), amenityOn(), setAmenity(), state, attachMapControls() (+3 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Printemps, Opéra e pôr do sol na Galeries Lafayette, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "mount.ts"
Cohesion: 0.11
Nodes (35): getTravelCity(), ItineraryLegDef, cityDisplayName(), emptyNotice(), loadTripFile(), catalogPins(), drawTripRoutes(), routeHops() (+27 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.06
Nodes (48): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+40 more)

### Community 35 - "travel-itineraries.ts"
Cohesion: 0.14
Nodes (21): favoritePlaceIds(), favoritePlaces(), computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug (+13 more)

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
Cohesion: 0.06
Nodes (33): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+25 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "mountMap"
Cohesion: 0.32
Nodes (7): Box, coveredInsets(), Insets, mergeInsets(), mountMap(), paintRouteFocus(), routeEmphasis()

### Community 42 - "ItineraryDay"
Cohesion: 0.40
Nodes (5): ItineraryDay, TravelItinerary, excursion(), l(), milanItinerary

### Community 43 - "map.ts"
Cohesion: 0.15
Nodes (24): KINDS, drawRouteSegments(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer(), RouteFocus (+16 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.24
Nodes (17): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), durationMinutes(), identityOf(), isTrainRide(), isTransferPart() (+9 more)

### Community 45 - "travel-milan.ts"
Cohesion: 0.67
Nodes (3): l(), milanCity, place()

### Community 47 - "legs.ts"
Cohesion: 0.19
Nodes (13): lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey() (+5 more)

### Community 48 - "amenities.ts"
Cohesion: 0.08
Nodes (37): ref_node_fs, only, hotelSearchVite(), amenitiesIn(), Amenity, AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin() (+29 more)

### Community 49 - "parse.ts"
Cohesion: 0.15
Nodes (23): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), euros() (+15 more)

### Community 50 - "calendar.ts"
Cohesion: 0.20
Nodes (16): DateCity, DatedDay, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate() (+8 more)

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

### Community 55 - "view-state.ts"
Cohesion: 0.20
Nodes (14): changedStopKeys(), stopFingerprint(), trip(), visitStops(), TripStop, activeSectionKey(), cityInOsrmScope(), dayKey() (+6 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 59 - "shell.ts"
Cohesion: 0.17
Nodes (18): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, IconButtonSize (+10 more)

### Community 60 - "rating.ts"
Cohesion: 0.44
Nodes (8): travelUi, clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.08
Nodes (40): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+32 more)

### Community 64 - "index.ts"
Cohesion: 0.22
Nodes (10): FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide, guided (+2 more)

### Community 65 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 66 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 72 - "getTransitLine"
Cohesion: 0.38
Nodes (5): hopName(), getTransitLine(), TransitLine, hopLabel(), transitLineForPlace()

### Community 74 - "pickLocale"
Cohesion: 0.14
Nodes (30): Locale, Locale, pickLocale(), citySource(), paintCities(), openSlotRow(), railHalf(), iconLink() (+22 more)

## Knowledge Gaps
- **400 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+395 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `route-planner.ts`, `summary.ts`, `timeline.ts`, `travel.ts`, `map/controls.ts`, `mount.ts`, `note-edit.ts`, `hotel-rank.ts`, `transfer-row.ts`, `amenities.ts`, `parse.ts`, `weather.ts`, `hotel-distance.ts`, `shell.ts`, `rating.ts`, `main.ts`, `index.ts`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `mount.ts` to `index.ts`, `paint`, `travel-itineraries.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `places.ts`, `legs.ts`, `parse.ts`, `calendar.ts`, `timeline.ts`, `travel.ts`, `main.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `el()` connect `pickLocale` to `paint`, `hotels.ts`, `note-edit.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `transfer-row.ts`, `route-planner.ts`, `timeline.ts`, `hotel-distance.ts`, `map/controls.ts`, `shell.ts`, `rating.ts`, `mount.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _400 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.12554112554112554 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.1471264367816092 - nodes in this community are weakly interconnected._
# Graph Report - roteiro-04-outubro-d264b0  (2026-09-27)

## Corpus Check
- 211 files · ~343,146 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1649 nodes · 4371 edges · 76 communities (74 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0e8efde2`
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
- travel-itineraries.ts
- hotel-ranking.mjs
- shell.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- summary.ts
- pickLocale
- place-index.ts
- Trip artifact — `travel-boss/trip/v1`
- scripts
- basemap-style.ts
- travel-subcategories.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- vite.config.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- route.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel-areas.test.ts
- travel.ts
- travel-categories.ts
- walk-route.ts
- note-edit.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- theme.ts
- overlays.ts
- map.ts
- transfer-row.ts
- router.ts
- mountHotels
- legs.ts
- amenities.ts
- parse.ts
- calendar.ts
- mount.ts
- expandTimelineTransferParts
- el
- open-now.ts
- view-state.ts
- hotel-ring.ts
- hotel-dates.ts
- camera.ts
- icons.ts
- rating.ts
- main.ts
- contrast.ts
- index.ts
- trackpad.ts
- overview.ts
- withResolvedArea
- tooltip.ts
- Locale
- asMsg
- links.ts
- getTransitLine
- maplibre-perf.ts
- guide.ts
- ItineraryDay

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 104 edges
2. `paint()` - 71 edges
3. `el()` - 70 edges
4. `icon()` - 61 edges
5. `mountTrip()` - 44 edges
6. `mountCity()` - 43 edges
7. `mountHotels()` - 42 edges
8. `getTravelCity()` - 34 edges
9. `mountItineraryBoard()` - 31 edges
10. `mountPlacePanel()` - 29 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `guided` --calls--> `cityGuide`  [EXTRACTED]
  src/data/travel-guide.test.ts → src/data/travel-guide.ts
- `ride()` --calls--> `sliceLinePath()`  [EXTRACTED]
  src/data/travel-itinerary-legs.ts → src/data/travel-transit-lines.ts
- `paris()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/legs.test.ts → src/data/travel.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (76 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.13
Nodes (31): airbnbSnapshot(), parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone() (+23 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.13
Nodes (19): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+11 more)

### Community 2 - "paint"
Cohesion: 0.15
Nodes (37): getTravelCity(), daysOnDate(), tripDates(), cityDisplayName(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer() (+29 more)

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
Cohesion: 0.19
Nodes (20): MapHandle, iconButton(), iconLink(), icon(), openVideo(), videoButton(), videoEmbedUrl(), mountHotelSlider() (+12 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (65): rankingTargets(), hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds (+57 more)

### Community 10 - "places.ts"
Cohesion: 0.12
Nodes (33): cityGuide, subcategoryLabel(), amenityName(), aiBadge(), aiSuggestionTip(), TABS, guidePlaceIds(), closePlace() (+25 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.17
Nodes (20): BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot(), mealOf() (+12 more)

### Community 12 - "travel-itineraries.ts"
Cohesion: 0.13
Nodes (24): computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, itineraryForCity() (+16 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (36): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+28 more)

### Community 14 - "shell.ts"
Cohesion: 0.21
Nodes (16): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), CAMERA_DURATION_S, CHROME_MOTION_EVENT (+8 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.18
Nodes (23): nearestStation(), sliceLinePath(), stationById(), asCoord(), BuildItineraryOptions, buildItineraryRoute(), buildItineraryRouteSync(), BuiltItineraryRoute (+15 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (70): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+62 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "summary.ts"
Cohesion: 0.22
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 19 - "pickLocale"
Cohesion: 0.10
Nodes (46): Shell, categoryMaterialName(), googleMapsUrl(), pickLocale(), buildItineraryRoutePreview(), mapsIconLink(), mapsMark(), categoryGlyph() (+38 more)

### Community 20 - "place-index.ts"
Cohesion: 0.19
Nodes (15): placePinIconHtml(), modelFor(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel() (+7 more)

### Community 21 - "Trip artifact — `travel-boss/trip/v1`"
Cohesion: 0.07
Nodes (24): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), 1. Onde vai cada informação, 2. O que não fazer (+16 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (36): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+28 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (26): applyBrightBasemap(), BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter(), mapCanvasColor() (+18 more)

### Community 24 - "travel-subcategories.ts"
Cohesion: 0.16
Nodes (15): categoryMaterialIcon, placePinMaterialName(), isPlaceSubcategory(), LString, normalizeSubcategories(), parisSubcategoriesByPlaceId, pinMaterialFromSubcategories(), pinSubcategoryPriority (+7 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "vite.config.ts"
Cohesion: 0.19
Nodes (16): hotelSearchVite(), applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest(), readTripPatch() (+8 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Printemps, Opéra e pôr do sol na Galeries Lafayette, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "route.ts"
Cohesion: 0.12
Nodes (25): DatedDay, drawTripRoutes(), walkPoints(), TripDay, DateStop, dateStops(), endpoints(), gatedHops() (+17 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.11
Nodes (27): installOsmAreas(), AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM() (+19 more)

### Community 35 - "travel.ts"
Cohesion: 0.12
Nodes (17): PlaceCategory, favoritePlaceIds(), favoritePlaces(), localTravelCities, l(), milanCity, place(), NEAR_BNF (+9 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.11
Nodes (18): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, MAPS_MATERIAL_ICON (+10 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (31): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), fetchWalkingRoute() (+23 more)

### Community 38 - "note-edit.ts"
Cohesion: 0.08
Nodes (44): copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown() (+36 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.06
Nodes (37): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+29 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "theme.ts"
Cohesion: 0.22
Nodes (17): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+9 more)

### Community 42 - "overlays.ts"
Cohesion: 0.20
Nodes (13): loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), Area, drawableRings() (+5 more)

### Community 43 - "map.ts"
Cohesion: 0.14
Nodes (28): KINDS, mountMap(), drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor() (+20 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.25
Nodes (17): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), TripLeg, durationMinutes(), identityOf(), isTrainRide() (+9 more)

### Community 45 - "router.ts"
Cohesion: 0.29
Nodes (11): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+3 more)

### Community 46 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 47 - "legs.ts"
Cohesion: 0.16
Nodes (15): ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM() (+7 more)

### Community 48 - "amenities.ts"
Cohesion: 0.10
Nodes (31): ref_node_fs, only, amenitiesIn(), Amenity, AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin(), Box (+23 more)

### Community 49 - "parse.ts"
Cohesion: 0.15
Nodes (23): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), euros() (+15 more)

### Community 50 - "calendar.ts"
Cohesion: 0.27
Nodes (10): DateCity, fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso(), TripDate (+2 more)

### Community 51 - "mount.ts"
Cohesion: 0.11
Nodes (29): Period, googleDirectionsUrl(), emptyNotice(), fillWeather(), loadTripFile(), loadTripFiles(), mountTripNav(), onTripFiles() (+21 more)

### Community 52 - "expandTimelineTransferParts"
Cohesion: 0.36
Nodes (10): estimateLegDurationMin(), expandTimelineTransferParts(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin(), walkMinutes() (+2 more)

### Community 53 - "el"
Cohesion: 0.20
Nodes (15): openSlotRow(), railHalf(), el(), row(), RowOptions, Copy, directionHref(), dirLink() (+7 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "view-state.ts"
Cohesion: 0.18
Nodes (15): changedStopKeys(), stopFingerprint(), trip(), visitStops(), Trip, TripStop, activeSectionKey(), cityInOsrmScope() (+7 more)

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
Cohesion: 0.22
Nodes (12): IconButtonSize, IconButtonVariant, onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn(), syncSegmented() (+4 more)

### Community 60 - "rating.ts"
Cohesion: 0.44
Nodes (8): travelUi, clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.12
Nodes (23): setDocumentTitle(), Locale, applyChrome(), cityLabel(), cityNav, citySource(), clearMap(), dispose() (+15 more)

### Community 63 - "contrast.ts"
Cohesion: 0.39
Nodes (6): stopPin(), chipTone(), circleInk(), ContrastInk, ON_INK_FILLS, relativeLuminance()

### Community 64 - "index.ts"
Cohesion: 0.21
Nodes (10): FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide, guided (+2 more)

### Community 65 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 66 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 67 - "withResolvedArea"
Cohesion: 0.29
Nodes (6): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, resolvePlaceArea(), resolvePlacePhotos(), withResolvedArea()

### Community 68 - "tooltip.ts"
Cohesion: 0.38
Nodes (8): isTruncated(), mountTooltip(), TOOLTIP_SHOW_MS, TOOLTIP_WARM_MS, tooltipHost(), tooltipPlacement(), tooltipShowDelay(), TRUNCATED_SELECTOR

### Community 69 - "Locale"
Cohesion: 0.33
Nodes (7): Locale, LEVEL_LABEL, Money, priceAria(), priceLevel, priceLevelOf(), placeMeta()

### Community 70 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

### Community 72 - "getTransitLine"
Cohesion: 0.47
Nodes (4): hopName(), getTransitLine(), TransitLine, transitLineForPlace()

### Community 73 - "maplibre-perf.ts"
Cohesion: 0.70
Nodes (3): MAPLIBRE_PERF, maplibreFade(), labelFadeDuration()

### Community 74 - "guide.ts"
Cohesion: 0.29
Nodes (9): card(), GROUPS, GuideTab, GuideView, media(), renderGuide(), spotChip(), WHERE (+1 more)

### Community 75 - "ItineraryDay"
Cohesion: 0.40
Nodes (5): ItineraryDay, TravelItinerary, excursion(), l(), milanItinerary

## Knowledge Gaps
- **398 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+393 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `shell.ts`, `route-planner.ts`, `summary.ts`, `travel.ts`, `note-edit.ts`, `hotel-rank.ts`, `transfer-row.ts`, `mountHotels`, `amenities.ts`, `parse.ts`, `mount.ts`, `el`, `rating.ts`, `main.ts`, `index.ts`, `Locale`, `guide.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `index.ts`, `withResolvedArea`, `travel.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `places.ts`, `travel-itineraries.ts`, `mountHotels`, `legs.ts`, `parse.ts`, `mount.ts`, `pickLocale`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `el()` connect `el` to `paint`, `hotels.ts`, `Locale`, `note-edit.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `guide.ts`, `places.ts`, `transfer-row.ts`, `shell.ts`, `mountHotels`, `route-planner.ts`, `mount.ts`, `pickLocale`, `rating.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _398 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.12554112554112554 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.14564564564564564 - nodes in this community are weakly interconnected._
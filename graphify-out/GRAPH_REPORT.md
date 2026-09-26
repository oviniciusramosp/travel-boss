# Graph Report - hospedagens-icon-update-79f5a5  (2026-09-26)

## Corpus Check
- 191 files · ~287,677 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1577 nodes · 4162 edges · 65 communities (63 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c4a416fc`
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
- theme.ts
- hotel-ranking.mjs
- shell.ts
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
- map.ts
- travel-categories.ts
- walk-route.ts
- note-edit.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- calendar.ts
- export.ts
- travel.ts
- transfer-row.ts
- mountHotels
- travel-itineraries.ts
- pickLocale
- router.ts
- parse.ts
- summary.ts
- weather.ts
- expandTimelineTransferParts
- hotel-distance.ts
- open-now.ts
- withResolvedArea
- hotel-ring.ts
- hotel-dates.ts
- icons.ts
- tooltip.ts
- rating.ts
- main.ts
- legs.ts
- links.ts

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

## Communities (65 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.13
Nodes (31): airbnbSnapshot(), parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone() (+23 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.16
Nodes (16): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+8 more)

### Community 2 - "paint"
Cohesion: 0.12
Nodes (40): getTravelCity(), pastPeriods(), periodSections(), googleDirectionsUrl(), cityDisplayName(), clearStopCurrent(), emptyNotice(), loadTripFile() (+32 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.11
Nodes (25): WhyPart, AccommodationType, asMsg(), asResult(), Booking, CATEGORIES, CategoryKey, Eligibility (+17 more)

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
Nodes (27): Locale, aiBadge(), aiSuggestionTip(), TABS, iconButton(), icon(), mapsIconLink(), mapsMark() (+19 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.06
Nodes (53): rankingTargets(), hotelRankingContext(), categoryScores, hotel, name, point, targets, walk (+45 more)

### Community 10 - "places.ts"
Cohesion: 0.12
Nodes (32): placeCategoriesOffByDefault, placeCategoryOrder, itineraryForCity(), ItineraryStop, subcategoryLabel(), guidePlaceIds(), closePlace(), onPlaceClose() (+24 more)

### Community 11 - "mount.ts"
Cohesion: 0.12
Nodes (26): BudgetLine, dateBudget, dayPeriods(), hopRails(), mealOf(), midEur(), Period, periodAt() (+18 more)

### Community 12 - "theme.ts"
Cohesion: 0.24
Nodes (16): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+8 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.10
Nodes (32): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+24 more)

### Community 14 - "shell.ts"
Cohesion: 0.20
Nodes (17): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, CAMERA_DURATION_S (+9 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.14
Nodes (26): ItineraryLegDef, ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, LatLng, nearestStation(), sliceLinePath(), stationById() (+18 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (70): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+62 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "index.ts"
Cohesion: 0.16
Nodes (14): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+6 more)

### Community 19 - "timeline.ts"
Cohesion: 0.09
Nodes (46): buildItineraryRoute(), buildItineraryRoutePreview(), buildItineraryRouteSync(), toMapRoute(), row(), RowOptions, categoryGlyph(), emptyCopy() (+38 more)

### Community 20 - "route.ts"
Cohesion: 0.13
Nodes (23): DatedDay, drawTripRoutes(), neutralColor(), walkPoints(), TripDay, DateStop, dateStops(), endpoints() (+15 more)

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
Cohesion: 0.20
Nodes (14): changedStopKeys(), stopFingerprint(), trip(), visitStops(), TripStop, activeSectionKey(), cityInOsrmScope(), dayKey() (+6 more)

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
Cohesion: 0.12
Nodes (19): src_data_travel_stay_display, StayZone, leafletMap(), Band, BANDS, cityHasStayHeat(), Copy, DisplayFile (+11 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.09
Nodes (35): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+27 more)

### Community 35 - "map.ts"
Cohesion: 0.05
Nodes (72): placePinIconHtml(), Area, drawableRings(), centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm() (+64 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.10
Nodes (28): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+20 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (31): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), fetchWalkingRoute() (+23 more)

### Community 38 - "note-edit.ts"
Cohesion: 0.13
Nodes (24): markSpans(), looks(), caretAt(), editableNote(), KEEP, MarkEdit, noteBlock(), NoteEditor (+16 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.07
Nodes (33): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+25 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "calendar.ts"
Cohesion: 0.23
Nodes (14): DateCity, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso() (+6 more)

### Community 42 - "export.ts"
Cohesion: 0.18
Nodes (20): copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown() (+12 more)

### Community 43 - "travel.ts"
Cohesion: 0.12
Nodes (16): PlaceCategory, favoritePlaceIds(), favoritePlaces(), googleMapsUrl(), localTravelCities, l(), milanCity, place() (+8 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.27
Nodes (15): formatLegDuration(), legLineColor(), TimelineTransferPart, durationMinutes(), identityOf(), isTrainRide(), isTransferPart(), isTripLeg() (+7 more)

### Community 45 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 46 - "travel-itineraries.ts"
Cohesion: 0.12
Nodes (23): computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItineraryDay (+15 more)

### Community 47 - "pickLocale"
Cohesion: 0.20
Nodes (19): pickLocale(), fillWeather(), el(), card(), GROUPS, GuideTab, GuideView, media() (+11 more)

### Community 48 - "router.ts"
Cohesion: 0.29
Nodes (11): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+3 more)

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
Cohesion: 0.24
Nodes (14): estimateLegDurationMin(), expandTimelineTransferParts(), hopName(), interHopWalkM(), legDisplayLabel(), pathLengthM(), stationCountFromPath(), transitMPerMin() (+6 more)

### Community 53 - "hotel-distance.ts"
Cohesion: 0.36
Nodes (8): Copy, directionHref(), dirLink(), distanceSection(), formatMetres(), say(), WalkStop, walkStops()

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "withResolvedArea"
Cohesion: 0.29
Nodes (6): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, resolvePlaceArea(), resolvePlacePhotos(), withResolvedArea()

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "icons.ts"
Cohesion: 0.16
Nodes (17): attachMapControls(), relabel(), uiLocale(), IconButtonSize, IconButtonVariant, iconLink(), onSegmentKey(), segmentButtons() (+9 more)

### Community 59 - "tooltip.ts"
Cohesion: 0.38
Nodes (8): isTruncated(), mountTooltip(), TOOLTIP_SHOW_MS, TOOLTIP_WARM_MS, tooltipHost(), tooltipPlacement(), tooltipShowDelay(), TRUNCATED_SELECTOR

### Community 60 - "rating.ts"
Cohesion: 0.53
Nodes (7): clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.12
Nodes (23): setDocumentTitle(), Locale, applyChrome(), cityLabel(), cityNav, citySource(), clearMap(), dispose() (+15 more)

### Community 64 - "legs.ts"
Cohesion: 0.18
Nodes (14): lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey() (+6 more)

## Knowledge Gaps
- **379 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+374 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `places.ts`, `mount.ts`, `shell.ts`, `route-planner.ts`, `index.ts`, `timeline.ts`, `stay-heatmap.ts`, `hotel-rank.ts`, `export.ts`, `travel.ts`, `transfer-row.ts`, `mountHotels`, `parse.ts`, `summary.ts`, `hotel-distance.ts`, `icons.ts`, `rating.ts`, `main.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `legs.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `calendar.ts`, `travel.ts`, `mount.ts`, `mountHotels`, `travel-itineraries.ts`, `places.ts`, `parse.ts`, `index.ts`, `timeline.ts`, `route.ts`, `withResolvedArea`, `main.ts`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Why does `mountTrip()` connect `paint` to `calendar.ts`, `export.ts`, `mount.ts`, `places.ts`, `pickLocale`, `route-planner.ts`, `parse.ts`, `timeline.ts`, `route.ts`, `main.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _379 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.12435897435897436 - nodes in this community are weakly interconnected._
- **Should `hotels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
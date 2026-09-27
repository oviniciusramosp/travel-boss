# Graph Report - dazzling-sanderson-3b0ddd  (2026-09-27)

## Corpus Check
- 212 files · ~344,400 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1654 nodes · 4388 edges · 66 communities (64 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0633b445`
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
- stay-heatmap.ts
- hotel-ranking.mjs
- shell.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- summary.ts
- timeline.ts
- contrast.ts
- Trip artifact — `travel-boss/trip/v1`
- scripts
- basemap-style.ts
- withResolvedArea
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- amenities.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- getTravelCity
- Travel Boss
- Milão — 11–14 de outubro de 2026
- getTransitLine
- travel.ts
- travel-categories.ts
- walk-route.ts
- note-edit.ts
- travel-transit-lines.ts
- hotel-rank.ts
- travel-areas.test.ts
- store.ts
- map.ts
- transfer-row.ts
- theme.ts
- router.ts
- hotel-distance.ts
- vite.config.ts
- parse.ts
- calendar.ts
- mount.ts
- travel-itinerary-legs.ts
- pickLocale
- open-now.ts
- view-state.ts
- hotel-ring.ts
- hotel-dates.ts
- tooltip.ts
- ui/controls.ts
- rating.ts
- main.ts
- index.ts
- asMsg
- links.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 106 edges
2. `el()` - 74 edges
3. `paint()` - 70 edges
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
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts
- `tripApi()` --calls--> `parseTripRequest()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts
- `patchTrip()` --calls--> `readTripPatch()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (66 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.13
Nodes (31): airbnbSnapshot(), parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone() (+23 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.13
Nodes (19): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+11 more)

### Community 2 - "paint"
Cohesion: 0.15
Nodes (32): clearStopCurrent(), loadTripFile(), mountTrip(), applyQuery(), armTransfer(), catalogPins(), datedPoints(), datePlaces() (+24 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (29): hotelPhotoUrls(), AccommodationType, addDays(), Booking, CATEGORIES, CategoryKey, Eligibility, Hotel (+21 more)

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
Nodes (31): travelUi, aiBadge(), aiSuggestionTip(), TABS, icon(), IconName, ICONS, IconSize (+23 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.07
Nodes (47): rankingTargets(), hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds (+39 more)

### Community 10 - "places.ts"
Cohesion: 0.11
Nodes (35): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, ItineraryDay, ItineraryStop, subcategoryLabel(), TravelPlace, guidePlaceIds() (+27 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.17
Nodes (22): resolveVisit(), BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot() (+14 more)

### Community 12 - "stay-heatmap.ts"
Cohesion: 0.12
Nodes (18): src_data_travel_stay_display, StayZone, leafletMap(), Band, BANDS, Copy, DisplayFile, HeatApi (+10 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (36): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+28 more)

### Community 14 - "shell.ts"
Cohesion: 0.20
Nodes (17): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, CAMERA_DURATION_S (+9 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.15
Nodes (25): ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, LatLng, nearestStation(), sliceLinePath(), stationById(), asCoord() (+17 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.08
Nodes (56): apply(), barActive(), beginLocate(), CITY_FAR_KM, createRouteButton(), drawRoutePreview(), formatRouteDistance(), formatRouteDuration() (+48 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 19 - "timeline.ts"
Cohesion: 0.09
Nodes (49): googleMapsUrl(), legsForDay(), buildItineraryRoute(), buildItineraryRoutePreview(), buildItineraryRouteSync(), toMapRoute(), categoryGlyph(), emptyCopy() (+41 more)

### Community 20 - "contrast.ts"
Cohesion: 0.39
Nodes (6): stopPin(), chipTone(), circleInk(), ContrastInk, ON_INK_FILLS, relativeLuminance()

### Community 21 - "Trip artifact — `travel-boss/trip/v1`"
Cohesion: 0.07
Nodes (24): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), 1. Onde vai cada informação, 2. O que não fazer (+16 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (36): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+28 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (27): applyBrightBasemap(), BASEMAP_THEME_EVENT, BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter() (+19 more)

### Community 24 - "withResolvedArea"
Cohesion: 0.25
Nodes (7): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, resolvePlaceArea(), resolvePlacePhotos(), withResolvedArea()

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "amenities.ts"
Cohesion: 0.10
Nodes (30): only, amenitiesIn(), Amenity, AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin(), Box, boxesOverlap() (+22 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Printemps, Opéra e pôr do sol na Galeries Lafayette, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "getTravelCity"
Cohesion: 0.08
Nodes (37): getTravelCity(), ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke (+29 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "getTransitLine"
Cohesion: 0.47
Nodes (4): hopName(), getTransitLine(), TransitLine, transitLineForPlace()

### Community 35 - "travel.ts"
Cohesion: 0.09
Nodes (30): favoritePlaceIds(), favoritePlaces(), computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug (+22 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.09
Nodes (29): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+21 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (31): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), fetchWalkingRoute() (+23 more)

### Community 38 - "note-edit.ts"
Cohesion: 0.08
Nodes (44): copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown() (+36 more)

### Community 39 - "travel-transit-lines.ts"
Cohesion: 0.10
Nodes (18): metro1, metro12, metro13, metro14, metro2, metro4, metro5, metro6 (+10 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "travel-areas.test.ts"
Cohesion: 0.09
Nodes (35): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+27 more)

### Community 42 - "store.ts"
Cohesion: 0.27
Nodes (15): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+7 more)

### Community 43 - "map.ts"
Cohesion: 0.05
Nodes (73): placePinIconHtml(), Area, drawableRings(), centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm() (+65 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.23
Nodes (18): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), durationMinutes(), identityOf(), isTrainRide(), isTransferPart() (+10 more)

### Community 45 - "theme.ts"
Cohesion: 0.24
Nodes (16): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+8 more)

### Community 46 - "router.ts"
Cohesion: 0.26
Nodes (13): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+5 more)

### Community 47 - "hotel-distance.ts"
Cohesion: 0.25
Nodes (11): googleDirectionsUrl(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+3 more)

### Community 48 - "vite.config.ts"
Cohesion: 0.17
Nodes (17): ref_node_fs, hotelSearchVite(), applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest() (+9 more)

### Community 49 - "parse.ts"
Cohesion: 0.15
Nodes (23): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), euros() (+15 more)

### Community 50 - "calendar.ts"
Cohesion: 0.20
Nodes (16): DateCity, DatedDay, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate() (+8 more)

### Community 51 - "mount.ts"
Cohesion: 0.12
Nodes (26): Period, Rail, emptyNotice(), fillWeather(), paintWeather(), refreshWeather(), TripFile, tripFileListeners (+18 more)

### Community 52 - "travel-itinerary-legs.ts"
Cohesion: 0.11
Nodes (25): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+17 more)

### Community 53 - "pickLocale"
Cohesion: 0.17
Nodes (24): Locale, pickLocale(), amenityName(), openSlotRow(), railHalf(), iconLink(), openDialog(), el() (+16 more)

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

### Community 58 - "tooltip.ts"
Cohesion: 0.38
Nodes (8): isTruncated(), mountTooltip(), TOOLTIP_SHOW_MS, TOOLTIP_WARM_MS, tooltipHost(), tooltipPlacement(), tooltipShowDelay(), TRUNCATED_SELECTOR

### Community 59 - "ui/controls.ts"
Cohesion: 0.30
Nodes (10): iconButton(), IconButtonSize, IconButtonVariant, onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn() (+2 more)

### Community 60 - "rating.ts"
Cohesion: 0.53
Nodes (7): clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.11
Nodes (24): setDocumentTitle(), Locale, applyChrome(), cityLabel(), cityNav, citySource(), clearMap(), dispose() (+16 more)

### Community 64 - "index.ts"
Cohesion: 0.15
Nodes (16): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+8 more)

### Community 67 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

## Knowledge Gaps
- **400 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+395 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `places.ts`, `stay-heatmap.ts`, `shell.ts`, `route-planner.ts`, `summary.ts`, `timeline.ts`, `amenities.ts`, `getTravelCity`, `travel.ts`, `note-edit.ts`, `hotel-rank.ts`, `transfer-row.ts`, `hotel-distance.ts`, `parse.ts`, `mount.ts`, `rating.ts`, `main.ts`, `index.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `getTravelCity` to `index.ts`, `paint`, `travel.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `places.ts`, `parse.ts`, `calendar.ts`, `mount.ts`, `timeline.ts`, `withResolvedArea`, `main.ts`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `el()` connect `pickLocale` to `paint`, `hotels.ts`, `note-edit.ts`, `place-panel.ts`, `places.ts`, `stay-heatmap.ts`, `transfer-row.ts`, `shell.ts`, `hotel-distance.ts`, `route-planner.ts`, `mount.ts`, `timeline.ts`, `rating.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _400 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.12554112554112554 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.14919354838709678 - nodes in this community are weakly interconnected._
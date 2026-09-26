# Graph Report - roteiro-04-outubro-d264b0  (2026-09-26)

## Corpus Check
- 195 files · ~335,446 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1602 nodes · 4237 edges · 61 communities (59 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `da7160a7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search.mjs
- airbnb-search.mjs
- mount.ts
- directions.ts
- hotels.ts
- travel-visit.ts
- hotel-search-match.mjs
- fetch-travel-polygons.py
- place-panel.ts
- travel-stay-heatmap.ts
- places.ts
- day-plan.ts
- hotel-ranking.mjs
- shell.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- map.ts
- timeline.ts
- Trip artifact — `travel-boss/trip/v1`
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
- travel.ts
- travel-categories.ts
- walk-route.ts
- note-edit.ts
- travel-transit-lines.ts
- hotel-rank.ts
- hotel-booking-details.test.ts
- calendar.ts
- asMsg
- transfer-row.ts
- pickLocale
- mountHotels
- parse.ts
- Locale
- weather.ts
- travel-itinerary-legs.ts
- hotel-distance.ts
- open-now.ts
- index.ts
- hotel-ring.ts
- hotel-dates.ts
- contrast.ts
- icons.ts
- main.ts
- overlays.ts
- osm-area-bridge.ts
- links.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 98 edges
2. `paint()` - 70 edges
3. `el()` - 68 edges
4. `icon()` - 58 edges
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

## Communities (61 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (28): AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT, bookingDetails() (+20 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.17
Nodes (15): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+7 more)

### Community 2 - "mount.ts"
Cohesion: 0.09
Nodes (54): setDocumentTitle(), getTravelCity(), googleMapsUrl(), googleDirectionsUrl(), cityDisplayName(), clearStopCurrent(), emptyNotice(), loadTripFile() (+46 more)

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
Cohesion: 0.22
Nodes (20): ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge(), bookingPhotoUrl() (+12 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "place-panel.ts"
Cohesion: 0.13
Nodes (23): resolvePlacePhotos(), subcategoryLabel(), aiBadge(), aiSuggestionTip(), TABS, LEVEL_LABEL, Money, priceAria() (+15 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (63): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+55 more)

### Community 10 - "places.ts"
Cohesion: 0.11
Nodes (35): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, ItineraryDay, ItineraryStop, TravelPlace, guidePlaceIds(), closePlace() (+27 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.14
Nodes (23): MoneyInfo, VisitInfo, BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails() (+15 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.10
Nodes (29): ref_node_crypto, accommodationEligibility(), airbnbQuality(), clamp(), evaluateJev(), hotelEvidence(), hotelRegion(), insideRing() (+21 more)

### Community 14 - "shell.ts"
Cohesion: 0.08
Nodes (47): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, activeTheme() (+39 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.15
Nodes (27): ItineraryTransitHop, lineBrandColor(), ride(), WALK_CONNECTOR_MIN_M, haversineM(), LatLng, nearestStation(), sliceLinePath() (+19 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (67): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+59 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "map.ts"
Cohesion: 0.06
Nodes (62): placePinIconHtml(), centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset() (+54 more)

### Community 19 - "timeline.ts"
Cohesion: 0.09
Nodes (53): computeDayBudget(), computeTripBudget(), dayPrimaryRoutePlaceIds(), moneyTypicalEur(), legsForDay(), resolveVisit(), buildItineraryRoute(), buildItineraryRoutePreview() (+45 more)

### Community 21 - "Trip artifact — `travel-boss/trip/v1`"
Cohesion: 0.07
Nodes (24): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), 1. Onde vai cada informação, 2. O que não fazer (+16 more)

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
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Printemps, Opéra e pôr do sol na Galeries Lafayette, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "route.ts"
Cohesion: 0.07
Nodes (40): ItineraryLegDef, milanDayLegsById, parisDayLegsById, fetchDrivingRoute(), fetchWalkingRoute(), peekWalkingRoute(), walkRouteKey(), DatedDay (+32 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.13
Nodes (24): installOsmAreas(), AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM() (+16 more)

### Community 35 - "travel.ts"
Cohesion: 0.08
Nodes (25): favoritePlaceIds(), favoritePlaces(), DayBudget, dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItinerarySlot, parisD1AfterBase (+17 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.10
Nodes (26): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialName() (+18 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.11
Nodes (27): abortError(), acquire(), bindUser(), cached(), execute(), fetchOsrm(), hydrate(), inflight (+19 more)

### Community 38 - "note-edit.ts"
Cohesion: 0.08
Nodes (43): copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown() (+35 more)

### Community 39 - "travel-transit-lines.ts"
Cohesion: 0.09
Nodes (19): metro1, metro12, metro13, metro14, metro2, metro4, metro5, metro6 (+11 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "hotel-booking-details.test.ts"
Cohesion: 0.12
Nodes (18): airbnbSnapshot(), BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), parseCategoryScores(), STAFF_MINIMUM, validScore() (+10 more)

### Community 42 - "calendar.ts"
Cohesion: 0.26
Nodes (13): DateCity, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso() (+5 more)

### Community 43 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

### Community 44 - "transfer-row.ts"
Cohesion: 0.24
Nodes (17): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), durationMinutes(), identityOf(), isTrainRide(), isTransferPart() (+9 more)

### Community 45 - "pickLocale"
Cohesion: 0.16
Nodes (27): pickLocale(), fillWeather(), openSlotRow(), railHalf(), iconLink(), el(), icon(), openVideo() (+19 more)

### Community 46 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 49 - "parse.ts"
Cohesion: 0.15
Nodes (23): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), euros() (+15 more)

### Community 50 - "Locale"
Cohesion: 0.22
Nodes (18): Locale, capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS (+10 more)

### Community 51 - "weather.ts"
Cohesion: 0.22
Nodes (13): cache, Entry, Hourly, keyOf(), loadForecast(), mergeWeather(), parseHourly(), peekForecast() (+5 more)

### Community 52 - "travel-itinerary-legs.ts"
Cohesion: 0.11
Nodes (25): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+17 more)

### Community 53 - "hotel-distance.ts"
Cohesion: 0.27
Nodes (10): row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres(), say() (+2 more)

### Community 54 - "open-now.ts"
Cohesion: 0.35
Nodes (9): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+1 more)

### Community 55 - "index.ts"
Cohesion: 0.15
Nodes (15): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+7 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.25
Nodes (10): capture(), clearSearchRing(), ink(), leafletMap(), LeafletNs, loadLeaflet(), markContextMarkers(), paint() (+2 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "contrast.ts"
Cohesion: 0.48
Nodes (5): chipTone(), circleInk(), ContrastInk, ON_INK_FILLS, relativeLuminance()

### Community 60 - "icons.ts"
Cohesion: 0.20
Nodes (14): categoryMaterialIcon, travelUi, ICON_FONT_HREF, IconName, ICONS, IconSize, ligatures, clampRating() (+6 more)

### Community 61 - "main.ts"
Cohesion: 0.08
Nodes (41): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+33 more)

### Community 63 - "overlays.ts"
Cohesion: 0.14
Nodes (16): allPlaces(), resolvedPlaces(), resolvePlaceArea(), getTransitLine(), withResolvedArea(), Area, drawableRings(), fadeMs() (+8 more)

### Community 66 - "osm-area-bridge.ts"
Cohesion: 0.28
Nodes (9): loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), OSM_AREA_IDS, ensureOsmAreas() (+1 more)

## Knowledge Gaps
- **390 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+385 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `mount.ts`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `shell.ts`, `route-planner.ts`, `timeline.ts`, `travel.ts`, `note-edit.ts`, `hotel-rank.ts`, `transfer-row.ts`, `mountHotels`, `parse.ts`, `Locale`, `hotel-distance.ts`, `index.ts`, `icons.ts`, `main.ts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `mount.ts` to `travel.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `calendar.ts`, `places.ts`, `mountHotels`, `parse.ts`, `timeline.ts`, `index.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `el()` connect `pickLocale` to `mount.ts`, `hotels.ts`, `note-edit.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `transfer-row.ts`, `shell.ts`, `mountHotels`, `route-planner.ts`, `timeline.ts`, `hotel-distance.ts`, `icons.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _390 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14772727272727273 - nodes in this community are weakly interconnected._
- **Should `mount.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09494949494949495 - nodes in this community are weakly interconnected._
- **Should `hotels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
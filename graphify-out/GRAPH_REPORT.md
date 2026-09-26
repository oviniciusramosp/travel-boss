# Graph Report - place-cards-video-references-47b097  (2026-09-26)

## Corpus Check
- 191 files · ~281,189 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1542 nodes · 4098 edges · 64 communities (62 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `385c202b`
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
- icons.ts
- hotel-ranking.mjs
- mountHotels
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- beginLocate
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
- route.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel-areas.test.ts
- map.ts
- travel-categories.ts
- walk-route.ts
- export.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- calendar.ts
- pickLocale
- asMsg
- transfer-row.ts
- store.ts
- travel-itineraries.ts
- overlays.ts
- parse.ts
- summary.ts
- mount.ts
- expandTimelineTransferParts
- el
- open-now.ts
- travel.ts
- hotel-ring.ts
- hotel-dates.ts
- contrast.ts
- rating.ts
- main.ts
- legs.ts
- getTransitLine
- links.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 96 edges
2. `el()` - 65 edges
3. `paint()` - 61 edges
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
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
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

## Communities (64 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (26): parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT (+18 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (24): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType() (+16 more)

### Community 2 - "paint"
Cohesion: 0.10
Nodes (43): setDocumentTitle(), getTravelCity(), googleDirectionsUrl(), cityDisplayName(), clearStopCurrent(), loadTripFile(), mountTrip(), applyQuery() (+35 more)

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

### Community 8 - "place-panel.ts"
Cohesion: 0.13
Nodes (27): Locale, aiBadge(), aiSuggestionTip(), TABS, icon(), mapsIconLink(), mapsMark(), LEVEL_LABEL (+19 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (64): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+56 more)

### Community 10 - "places.ts"
Cohesion: 0.13
Nodes (28): placeCategoriesOffByDefault, placeCategoryOrder, ItineraryStop, subcategoryLabel(), resolveVisit(), guidePlaceIds(), applyCategoryClick(), categoriesPresent() (+20 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.20
Nodes (17): BudgetLine, dateBudget, dayPeriods(), hopRails(), mealOf(), midEur(), pastPeriods(), Period (+9 more)

### Community 12 - "icons.ts"
Cohesion: 0.12
Nodes (24): categoryMaterialIcon, attachMapControls(), relabel(), uiLocale(), iconButton(), IconButtonSize, IconButtonVariant, iconLink() (+16 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (37): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+29 more)

### Community 14 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.15
Nodes (24): ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, LatLng, sliceLinePath(), stationById(), asCoord(), BuildItineraryOptions (+16 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.10
Nodes (42): apply(), CITY_FAR_KM, formatRouteDistance(), formatRouteDuration(), GeoPermission, googleDirectionsUrl(), locateFailure, MAX_ROUTE_STOPS (+34 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "beginLocate"
Cohesion: 0.20
Nodes (14): fetchWalkingRoute(), barActive(), beginLocate(), drawRoutePreview(), isFarFromCity(), locateFailureLabel(), mountLocate(), paintLocate() (+6 more)

### Community 19 - "timeline.ts"
Cohesion: 0.10
Nodes (47): googleMapsUrl(), legsForDay(), buildItineraryRoute(), buildItineraryRoutePreview(), buildItineraryRouteSync(), toMapRoute(), categoryGlyph(), emptyCopy() (+39 more)

### Community 20 - "index.ts"
Cohesion: 0.14
Nodes (17): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+9 more)

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
Cohesion: 0.20
Nodes (14): changedStopKeys(), stopFingerprint(), trip(), visitStops(), TripStop, activeSectionKey(), cityInOsrmScope(), dayKey() (+6 more)

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
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, topo da Torre Eiffel e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Café reforçado, Opéra, Uniqlo e Créteil, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "route.ts"
Cohesion: 0.14
Nodes (21): drawTripRoutes(), neutralColor(), walkPoints(), DateStop, dateStops(), endpoints(), HopDraw, lastPlaceIndex() (+13 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.11
Nodes (27): installOsmAreas(), AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM() (+19 more)

### Community 35 - "map.ts"
Cohesion: 0.06
Nodes (64): placePinIconHtml(), centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset() (+56 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.11
Nodes (24): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialName() (+16 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.11
Nodes (30): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), hydrate() (+22 more)

### Community 38 - "export.ts"
Cohesion: 0.19
Nodes (18): copyTrip(), dayToMarkdown(), downloadTrip(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown(), escapeHtml() (+10 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.07
Nodes (33): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+25 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "calendar.ts"
Cohesion: 0.20
Nodes (16): DateCity, DatedDay, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate() (+8 more)

### Community 42 - "pickLocale"
Cohesion: 0.33
Nodes (10): pickLocale(), card(), GROUPS, GuideTab, GuideView, media(), renderGuide(), spotChip() (+2 more)

### Community 43 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

### Community 44 - "transfer-row.ts"
Cohesion: 0.26
Nodes (16): formatLegDuration(), legDisplayLabel(), legLineColor(), TripLeg, durationMinutes(), identityOf(), isTrainRide(), isTransferPart() (+8 more)

### Community 45 - "store.ts"
Cohesion: 0.27
Nodes (15): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+7 more)

### Community 46 - "travel-itineraries.ts"
Cohesion: 0.14
Nodes (21): computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItineraryDay (+13 more)

### Community 48 - "overlays.ts"
Cohesion: 0.13
Nodes (20): loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), PlaceCategoryMeta, resolvePlaceArea() (+12 more)

### Community 49 - "parse.ts"
Cohesion: 0.17
Nodes (20): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), fold() (+12 more)

### Community 50 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 51 - "mount.ts"
Cohesion: 0.13
Nodes (26): emptyNotice(), fillWeather(), loadTripFiles(), paintWeather(), refreshWeather(), mountTripNav(), onTripFiles(), stopPin() (+18 more)

### Community 52 - "expandTimelineTransferParts"
Cohesion: 0.27
Nodes (12): estimateLegDurationMin(), expandTimelineTransferParts(), hopName(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin() (+4 more)

### Community 53 - "el"
Cohesion: 0.22
Nodes (14): el(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+6 more)

### Community 54 - "open-now.ts"
Cohesion: 0.35
Nodes (9): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+1 more)

### Community 55 - "travel.ts"
Cohesion: 0.13
Nodes (15): PlaceCategory, favoritePlaceIds(), favoritePlaces(), localTravelCities, l(), milanCity, place(), PlaceSubcategory (+7 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 59 - "contrast.ts"
Cohesion: 0.60
Nodes (4): chipTone(), circleInk(), ContrastInk, relativeLuminance()

### Community 60 - "rating.ts"
Cohesion: 0.53
Nodes (7): clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.05
Nodes (72): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+64 more)

### Community 64 - "legs.ts"
Cohesion: 0.17
Nodes (14): ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM() (+6 more)

### Community 65 - "getTransitLine"
Cohesion: 0.60
Nodes (3): getTransitLine(), TransitLine, transitLineForPlace()

## Knowledge Gaps
- **370 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+365 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `icons.ts`, `mountHotels`, `route-planner.ts`, `beginLocate`, `timeline.ts`, `index.ts`, `export.ts`, `hotel-rank.ts`, `transfer-row.ts`, `parse.ts`, `summary.ts`, `mount.ts`, `el`, `travel.ts`, `rating.ts`, `main.ts`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `legs.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `calendar.ts`, `places.ts`, `travel-itineraries.ts`, `mountHotels`, `parse.ts`, `mount.ts`, `index.ts`, `timeline.ts`, `travel.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Why does `mountTrip()` connect `paint` to `export.ts`, `calendar.ts`, `pickLocale`, `day-plan.ts`, `store.ts`, `parse.ts`, `mount.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _370 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14838709677419354 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.10409745293466224 - nodes in this community are weakly interconnected._
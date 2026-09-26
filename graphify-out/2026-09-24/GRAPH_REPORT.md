# Graph Report - travel-boss  (2026-09-24)

## Corpus Check
- 182 files · ~255,403 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1473 nodes · 3861 edges · 53 communities (51 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 20 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `545dd588`
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
- places.ts
- travel-stay-heatmap.ts
- day-plan.ts
- hotel-ranking.mjs
- main.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
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
- map.ts
- travel-categories.ts
- walk-route.ts
- inline.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- calendar.ts
- travel-transit-lines.ts
- transfer-row.ts
- index.ts
- parse.ts
- summary.ts
- expandTimelineTransferParts
- open-now.ts
- travel.ts
- hotel-ring.ts
- hotel-dates.ts
- mount.ts
- legs.ts
- asMsg
- links.ts

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 84 edges
2. `paint()` - 57 edges
3. `el()` - 56 edges
4. `icon()` - 49 edges
5. `mountHotels()` - 42 edges
6. `mountTrip()` - 41 edges
7. `mountCity()` - 39 edges
8. `getTravelCity()` - 31 edges
9. `mountItineraryBoard()` - 31 edges
10. `mountPlacePanel()` - 26 edges

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

## Communities (53 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (26): parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT (+18 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (24): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType() (+16 more)

### Community 2 - "paint"
Cohesion: 0.13
Nodes (38): setDocumentTitle(), Locale, getTravelCity(), applyChrome(), cityLabel(), citySource(), googleDirectionsUrl(), cityDisplayName() (+30 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (33): prefersReducedMotion(), hotelPhotoUrls(), AccommodationType, addDays(), Booking, CATEGORIES, CategoryKey, Eligibility (+25 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (32): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+24 more)

### Community 6 - "hotel-search-match.mjs"
Cohesion: 0.19
Nodes (24): bookingLookup(), ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge() (+16 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "places.ts"
Cohesion: 0.05
Nodes (100): categoryMaterialName(), placeCategoriesOffByDefault, placeCategoryOrder, googleMapsUrl(), Locale, pickLocale(), resolvePlacePhotos(), subcategoryLabel() (+92 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (61): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+53 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.20
Nodes (16): BudgetLine, dateBudget, dayPeriods(), hopRails(), mealOf(), midEur(), pastPeriods(), Period (+8 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (37): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+29 more)

### Community 14 - "main.ts"
Cohesion: 0.05
Nodes (71): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+63 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.17
Nodes (22): ItineraryTransitHop, LatLng, sliceLinePath(), stationById(), asCoord(), BuildItineraryOptions, BuiltItineraryRoute, expandLeg() (+14 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.07
Nodes (64): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+56 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 19 - "timeline.ts"
Cohesion: 0.09
Nodes (51): itineraryForCity(), ItineraryLegDef, legsForDay(), TimelineTransferPart, travelUi, resolveVisit(), buildItineraryRoute(), buildItineraryRoutePreview() (+43 more)

### Community 21 - "Trip artifact — `travel-boss/trip/v1`"
Cohesion: 0.11
Nodes (15): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Travel Boss, Day card, Export (+7 more)

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
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, topo da Torre Eiffel e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Café reforçado, Opéra, Uniqlo e Créteil, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disneyland Paris, Dia 5 — Qui 8/10 · Marais, almoço no Chez Janou e pôr do sol em Montmartre (+7 more)

### Community 30 - "route.ts"
Cohesion: 0.14
Nodes (22): TripLegPoint, drawTripRoutes(), TripDay, DateStop, dateStops(), endpoints(), HopDraw, lastPlaceIndex() (+14 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel-areas.test.ts"
Cohesion: 0.06
Nodes (47): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+39 more)

### Community 35 - "map.ts"
Cohesion: 0.05
Nodes (69): placePinIconHtml(), centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset() (+61 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.09
Nodes (28): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+20 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (31): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), fetchWalkingRoute() (+23 more)

### Community 38 - "inline.ts"
Cohesion: 0.33
Nodes (10): escapeHtml(), inline(), InlineNodeOptions, inlineNodes(), InlinePart, inlineWithLinks(), parseEmphasis(), parseInline() (+2 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.13
Nodes (18): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+10 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "calendar.ts"
Cohesion: 0.21
Nodes (15): DateCity, DatedDay, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate() (+7 more)

### Community 42 - "travel-transit-lines.ts"
Cohesion: 0.13
Nodes (12): metro1, metro12, metro13, metro14, metro2, metro4, metro6, metro8 (+4 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.30
Nodes (13): formatLegDuration(), TripLeg, durationMinutes(), identityOf(), isTrainRide(), isTransferPart(), isTripLeg(), labelOf() (+5 more)

### Community 46 - "index.ts"
Cohesion: 0.14
Nodes (25): PlaceCategory, computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption (+17 more)

### Community 49 - "parse.ts"
Cohesion: 0.17
Nodes (20): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), fold() (+12 more)

### Community 50 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 52 - "expandTimelineTransferParts"
Cohesion: 0.31
Nodes (8): expandTimelineTransferParts(), legDisplayLabel(), legLineColor(), lineBrandColor(), stationCountFromPath(), getTransitLine(), TransitLine, transitLineForPlace()

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "travel.ts"
Cohesion: 0.10
Nodes (17): favoritePlaceIds(), favoritePlaces(), ItinerarySlot, localTravelCities, l(), milanCity, place(), photosByPlaceId (+9 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.24
Nodes (11): capture(), clearSearchRing(), ink(), leafletMap(), LeafletNs, loadLeaflet(), markContextMarkers(), paint() (+3 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 61 - "mount.ts"
Cohesion: 0.19
Nodes (17): copyTrip(), dayToMarkdown(), downloadTrip(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown(), emptyNotice() (+9 more)

### Community 64 - "legs.ts"
Cohesion: 0.21
Nodes (11): milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey(), resolveTripLeg() (+3 more)

### Community 69 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

## Knowledge Gaps
- **365 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+360 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getTravelCity()` connect `paint` to `legs.ts`, `hotels.ts`, `places.ts`, `travel-stay-heatmap.ts`, `calendar.ts`, `main.ts`, `index.ts`, `parse.ts`, `timeline.ts`, `travel.ts`, `mount.ts`, `route.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `pickLocale()` connect `places.ts` to `paint`, `hotels.ts`, `hotel-rank.ts`, `travel-stay-heatmap.ts`, `transfer-row.ts`, `index.ts`, `main.ts`, `route-planner.ts`, `parse.ts`, `summary.ts`, `timeline.ts`, `travel.ts`, `hotel-ring.ts`, `mount.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Why does `el()` connect `places.ts` to `paint`, `hotels.ts`, `travel-stay-heatmap.ts`, `transfer-row.ts`, `main.ts`, `route-planner.ts`, `timeline.ts`, `hotel-ring.ts`, `mount.ts`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _365 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14838709677419354 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09971509971509972 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.1251778093883357 - nodes in this community are weakly interconnected._
# Graph Report - montparnasse-tour-update-4f8aec  (2026-09-27)

## Corpus Check
- 211 files · ~344,094 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1654 nodes · 4390 edges · 69 communities (66 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 22 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `6e5aa9c2`
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
- vite.config.ts
- hotel-ranking.mjs
- motion.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- summary.ts
- pickLocale
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
- route.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel-areas.test.ts
- travel-itineraries.ts
- travel-subcategories.ts
- walk-route.ts
- note-edit.ts
- travel-transit-lines.ts
- hotel-rank.ts
- travel-itinerary-legs.ts
- Locale
- map.ts
- transfer-row.ts
- LString
- travel-categories.ts
- travelCities
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
- mountMap
- itinerary-panel.ts
- rating.ts
- main.ts
- index.ts
- trackpad.ts
- overview.ts
- links.ts
- transit.ts
- el

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
- `place()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/route.test.ts → src/data/travel.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (69 total, 3 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.13
Nodes (31): airbnbSnapshot(), parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone() (+23 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.13
Nodes (19): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+11 more)

### Community 2 - "paint"
Cohesion: 0.15
Nodes (35): getTravelCity(), cityDisplayName(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), catalogPins(), datedPoints() (+27 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (36): hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey (+28 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (28): cafeVisit(), CrowdProfile, formatMoneyTypical(), free, L(), landmarkOutdoor(), Locale, lodgingVisit() (+20 more)

### Community 6 - "hotel-search-match.mjs"
Cohesion: 0.19
Nodes (23): ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge(), bookingPhotoUrl() (+15 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "place-panel.ts"
Cohesion: 0.16
Nodes (26): googleMapsUrl(), resolvePlacePhotos(), subcategoryLabel(), aiBadge(), aiSuggestionTip(), TABS, iconButton(), icon() (+18 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (65): rankingTargets(), hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds (+57 more)

### Community 10 - "places.ts"
Cohesion: 0.10
Nodes (40): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, favoritePlaces(), dayPrimaryRoutePlaceIds(), ItineraryDay, itineraryForCity(), ItineraryStop (+32 more)

### Community 11 - "mount.ts"
Cohesion: 0.14
Nodes (27): BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot(), mealOf() (+19 more)

### Community 12 - "vite.config.ts"
Cohesion: 0.19
Nodes (16): hotelSearchVite(), applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest(), readTripPatch() (+8 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (36): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+28 more)

### Community 14 - "motion.ts"
Cohesion: 0.20
Nodes (13): MAPLIBRE_PERF, maplibreFade(), walkColor(), CAMERA_DURATION_S, CHROME_MOTION_EVENT, CHROME_SETTLED_EVENT, cssToken(), EXIT_RATIO (+5 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.15
Nodes (25): ItineraryTransitHop, WALK_CONNECTOR_MIN_M, LatLng, nearestStation(), stationById(), asCoord(), BuildItineraryOptions, buildItineraryRoute() (+17 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (70): arrivalKey(), categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readArrival(), readCategoryFilter() (+62 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 19 - "pickLocale"
Cohesion: 0.10
Nodes (48): computeDayBudget(), computeTripBudget(), legsForDay(), pickLocale(), resolveVisit(), emptyCopy(), mountItineraryBoard(), toPins() (+40 more)

### Community 20 - "pin-visual.ts"
Cohesion: 0.35
Nodes (9): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+1 more)

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
Cohesion: 0.14
Nodes (11): favoritePlaceIds(), localTravelCities, NEAR_BNF, travelCountryKeys, TravelLandmark, TravelRouteStop, TravelSubPoint, formatDuration() (+3 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "map/controls.ts"
Cohesion: 0.29
Nodes (10): AMENITY_EVENT, AMENITY_ICON, AmenityKind, amenityOn(), setAmenity(), state, attachMapControls(), relabel() (+2 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Printemps, Opéra e pôr do sol na Galeries Lafayette, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "route.ts"
Cohesion: 0.08
Nodes (40): ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, DatedDay, catalogGeometry(), catalogLegByPair, CatalogLegStroke (+32 more)

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
Cohesion: 0.16
Nodes (13): itinerariesByCitySlug, ItinerarySlot, moneyTypicalEur(), parisD1AfterBase, parisD1CdgStops, parisD1OryStops, parisItinerary, TravelItinerary (+5 more)

### Community 36 - "travel-subcategories.ts"
Cohesion: 0.15
Nodes (16): categoryMaterialIcon, placePinMaterialName(), isPlaceSubcategory(), LString, normalizeSubcategories(), parisSubcategoriesByPlaceId, pinMaterialFromSubcategories(), pinSubcategoryPriority (+8 more)

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

### Community 41 - "travel-itinerary-legs.ts"
Cohesion: 0.11
Nodes (16): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+8 more)

### Community 42 - "Locale"
Cohesion: 0.23
Nodes (9): Locale, iconLink(), openDialog(), LEVEL_LABEL, Money, priceAria(), openVideo(), videoButton() (+1 more)

### Community 43 - "map.ts"
Cohesion: 0.15
Nodes (25): KINDS, drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer() (+17 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.16
Nodes (23): formatLegDuration(), legLineColor(), stopPin(), legLabel(), chipTone(), circleInk(), ContrastInk, ON_INK_FILLS (+15 more)

### Community 45 - "LString"
Cohesion: 0.50
Nodes (4): LString, l(), milanCity, place()

### Community 46 - "travel-categories.ts"
Cohesion: 0.20
Nodes (11): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, MAPS_MATERIAL_ICON (+3 more)

### Community 47 - "travelCities"
Cohesion: 0.20
Nodes (6): guided, photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, travelCities

### Community 48 - "amenities.ts"
Cohesion: 0.13
Nodes (21): ref_node_fs, only, amenitiesIn(), Amenity, AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin(), Box (+13 more)

### Community 49 - "parse.ts"
Cohesion: 0.13
Nodes (25): trip(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList() (+17 more)

### Community 50 - "calendar.ts"
Cohesion: 0.29
Nodes (12): DateCity, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso() (+4 more)

### Community 51 - "weather.ts"
Cohesion: 0.14
Nodes (19): fillWeather(), cache, dayWeather(), Ensemble, Entry, keyOf(), loadForecast(), median() (+11 more)

### Community 52 - "expandTimelineTransferParts"
Cohesion: 0.23
Nodes (14): dayRoutePlaceIds(), estimateLegDurationMin(), expandTimelineTransferParts(), hopName(), interHopWalkM(), legDisplayLabel(), pathLengthM(), stationCountFromPath() (+6 more)

### Community 53 - "hotel-distance.ts"
Cohesion: 0.25
Nodes (11): googleDirectionsUrl(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+3 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "view-state.ts"
Cohesion: 0.20
Nodes (14): changedStopKeys(), stopFingerprint(), visitStops(), Trip, TripStop, activeSectionKey(), cityInOsrmScope(), dayKey() (+6 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "mountMap"
Cohesion: 0.20
Nodes (17): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+9 more)

### Community 59 - "itinerary-panel.ts"
Cohesion: 0.15
Nodes (18): PlaceCategoryMeta, ItineraryArrivalOption, TravelCity, buildItineraryRoutePreview(), IconButtonSize, IconButtonVariant, onSegmentKey(), segmentButtons() (+10 more)

### Community 60 - "rating.ts"
Cohesion: 0.44
Nodes (8): travelUi, clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.05
Nodes (68): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+60 more)

### Community 64 - "index.ts"
Cohesion: 0.26
Nodes (10): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+2 more)

### Community 65 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 66 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 74 - "el"
Cohesion: 0.16
Nodes (19): categoryMaterialName(), openSlotRow(), railHalf(), el(), card(), GROUPS, guidePlaceIds(), GuideTab (+11 more)

## Knowledge Gaps
- **400 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+395 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `route-planner.ts`, `summary.ts`, `travel.ts`, `map/controls.ts`, `note-edit.ts`, `hotel-rank.ts`, `Locale`, `transfer-row.ts`, `amenities.ts`, `parse.ts`, `weather.ts`, `hotel-distance.ts`, `itinerary-panel.ts`, `rating.ts`, `main.ts`, `index.ts`, `el`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `index.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `travelCities`, `parse.ts`, `calendar.ts`, `pickLocale`, `expandTimelineTransferParts`, `travel.ts`, `itinerary-panel.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `el()` connect `el` to `paint`, `hotels.ts`, `note-edit.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `Locale`, `mount.ts`, `places.ts`, `transfer-row.ts`, `route-planner.ts`, `pickLocale`, `hotel-distance.ts`, `itinerary-panel.ts`, `rating.ts`, `main.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _400 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.12554112554112554 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.1495798319327731 - nodes in this community are weakly interconnected._
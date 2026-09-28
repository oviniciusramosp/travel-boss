# Graph Report - travel-boss  (2026-09-27)

## Corpus Check
- 232 files · ~379,339 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1776 nodes · 4531 edges · 83 communities (79 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 23 edges (avg confidence: 0.64)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7b5a09b9`
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
- timeline.ts
- hotel-ranking.mjs
- camera.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- travel-areas.test.ts
- weather.ts
- summary.ts
- Travel Boss
- scripts
- basemap-style.ts
- vite.config.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- amenities.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- mount.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- note-edit.ts
- pickLocale
- travel-categories.ts
- walk-route.ts
- view-state.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- stay-heatmap.ts
- travel-area-geometry.ts
- cssToken
- transfer-row.ts
- trackpad.ts
- asMsg
- api.ts
- grande-epicerie-2026-10-06.md
- parse.ts
- louvre/README.md
- overview.ts
- travel.ts
- hotel-distance.ts
- open-now.ts
- motion.ts
- hotel-ring.ts
- hotel-dates.ts
- subpoints.ts
- ui/controls.ts
- rating.ts
- main.ts
- legs.ts
- index.ts
- map/controls.ts
- drawTripRoutes
- map.ts
- pin-visual.ts
- expandTimelineTransferParts
- place-index.ts
- links.ts
- export.ts
- overlays.ts
- withResolvedArea
- Os 12 critérios
- Não mostra nem a fachada nem o produto (36)
- Auditoria do Travel Boss — 2026-09-27
- Onda 2 (depois da onda 1)
- Plano de execução (Sonnet e Opus)
- Onda 1 (sem dependências; arquivos disjuntos)
- 1. Link do Google Maps que não abre o lugar direto — 40 de 232 verificados (tarefa E1)
- 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 104 edges
2. `paint()` - 82 edges
3. `el()` - 71 edges
4. `icon()` - 64 edges
5. `mountTrip()` - 52 edges
6. `mountCity()` - 44 edges
7. `mountHotels()` - 42 edges
8. `getTravelCity()` - 32 edges
9. `mountPlacePanel()` - 31 edges
10. `Locale` - 27 edges

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
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (83 total, 4 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.13
Nodes (31): airbnbSnapshot(), parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone() (+23 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.13
Nodes (19): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+11 more)

### Community 2 - "paint"
Cohesion: 0.13
Nodes (36): getTravelCity(), paris(), cityDisplayName(), clearStopCurrent(), emptyNotice(), loadTripFile(), mountTrip(), applyQuery() (+28 more)

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
Nodes (28): googleMapsUrl(), Locale, aiBadge(), aiSuggestionTip(), TABS, IconName, ICONS, IconSize (+20 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.08
Nodes (45): rankingTargets(), hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds (+37 more)

### Community 10 - "places.ts"
Cohesion: 0.11
Nodes (37): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, dayPrimaryRoutePlaceIds(), ItineraryDay, ItineraryStop, subcategoryLabel(), subPointParents() (+29 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.14
Nodes (27): resolveVisit(), BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot() (+19 more)

### Community 12 - "timeline.ts"
Cohesion: 0.18
Nodes (18): travelUi, fillWeather(), weatherIcon, budgetChip(), dateBudgetCards(), foodTarget(), formatEur(), Money (+10 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (37): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+29 more)

### Community 14 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.13
Nodes (30): ItineraryLegDef, ItineraryTransitHop, lineBrandColor(), ride(), WALK_CONNECTOR_MIN_M, getTransitLine(), LatLng, nearestStation() (+22 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (65): categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readCategoryFilter(), readGroups(), readPeriods() (+57 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "travel-areas.test.ts"
Cohesion: 0.14
Nodes (20): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), OSM_AREA_IDS (+12 more)

### Community 19 - "weather.ts"
Cohesion: 0.14
Nodes (23): cache, dayWeather(), Entry, failureKind, forecastState, keyOf(), loadForecast(), median() (+15 more)

### Community 20 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 21 - "Travel Boss"
Cohesion: 0.06
Nodes (29): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), Instruções compartilhadas (Codex e Claude Code), Quem edita onde (+21 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (36): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+28 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (26): applyBrightBasemap(), BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter(), mapCanvasColor() (+18 more)

### Community 24 - "vite.config.ts"
Cohesion: 0.13
Nodes (22): hotelSearchVite(), Ensemble, forecastToEnsemble(), localStamp(), Member, MET_URL, MetSeries, metToEnsemble() (+14 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "amenities.ts"
Cohesion: 0.13
Nodes (21): ref_node_fs, only, amenitiesIn(), Amenity, AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin(), Box (+13 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Arco do Triunfo, Louvre e compras na Opéra, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "mount.ts"
Cohesion: 0.12
Nodes (32): DateCity, DatedDay, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate() (+24 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "note-edit.ts"
Cohesion: 0.13
Nodes (24): markSpans(), looks(), caretAt(), editableNote(), KEEP, MarkEdit, noteBlock(), NoteEditor (+16 more)

### Community 35 - "pickLocale"
Cohesion: 0.15
Nodes (32): pickLocale(), periodBlock(), openSlotRow(), railHalf(), weatherSlot(), iconButton(), iconLink(), openDialog() (+24 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.10
Nodes (28): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+20 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (31): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), fetchWalkingRoute() (+23 more)

### Community 38 - "view-state.ts"
Cohesion: 0.21
Nodes (13): changedStopKeys(), stopFingerprint(), trip(), visitStops(), activeSectionKey(), cityInOsrmScope(), dayKey(), dayOpen() (+5 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.06
Nodes (38): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+30 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "stay-heatmap.ts"
Cohesion: 0.11
Nodes (20): src_data_travel_stay_display, hasStayHeat(), StayZone, leafletMap(), Band, BANDS, cityHasStayHeat(), Copy (+12 more)

### Community 42 - "travel-area-geometry.ts"
Cohesion: 0.21
Nodes (15): AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM(), haversineM() (+7 more)

### Community 43 - "cssToken"
Cohesion: 0.19
Nodes (18): mountMap(), drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer() (+10 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.23
Nodes (18): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), TripLegMode, durationMinutes(), identityOf(), isTrainRide() (+10 more)

### Community 45 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 46 - "asMsg"
Cohesion: 0.48
Nodes (7): asMsg(), asResult(), finite(), interpretSearchBody(), isRecord(), normalizeHotel(), normalizeSkipped()

### Community 47 - "api.ts"
Cohesion: 0.23
Nodes (13): applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest(), readTripPatch(), day (+5 more)

### Community 49 - "parse.ts"
Cohesion: 0.15
Nodes (24): TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList(), euros() (+16 more)

### Community 51 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 52 - "travel.ts"
Cohesion: 0.08
Nodes (30): favoritePlaceIds(), favoritePlaces(), computeDayBudget(), computeTripBudget(), DayBudget, dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption (+22 more)

### Community 53 - "hotel-distance.ts"
Cohesion: 0.24
Nodes (11): googleDirectionsUrl(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+3 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 55 - "motion.ts"
Cohesion: 0.22
Nodes (12): MAPLIBRE_PERF, maplibreFade(), CAMERA_DURATION_S, cameraMotion, CHROME_MOTION_EVENT, CHROME_SETTLED_EVENT, EXIT_RATIO, LABEL_FADE_MS (+4 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "subpoints.ts"
Cohesion: 0.32
Nodes (10): hopsForDate(), notesUnderStop(), attachSubPointNotes(), fold(), matchSubPoint(), noteTitle(), stripNoteTitle(), SubPointNote (+2 more)

### Community 59 - "ui/controls.ts"
Cohesion: 0.33
Nodes (9): IconButtonSize, IconButtonVariant, onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn(), syncSegmented() (+1 more)

### Community 60 - "rating.ts"
Cohesion: 0.53
Nodes (7): clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.05
Nodes (72): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+64 more)

### Community 63 - "legs.ts"
Cohesion: 0.20
Nodes (12): milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey(), resolveTripLeg() (+4 more)

### Community 64 - "index.ts"
Cohesion: 0.15
Nodes (18): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+10 more)

### Community 65 - "map/controls.ts"
Cohesion: 0.27
Nodes (11): AMENITY_EVENT, AMENITY_ICON, AmenityKind, amenityName(), amenityOn(), setAmenity(), state, attachMapControls() (+3 more)

### Community 66 - "drawTripRoutes"
Cohesion: 0.16
Nodes (18): drawTripRoutes(), neutralColor(), paintWalk(), paintWalks(), refreshWalks(), routeDeps(), routeHops(), walkPoints() (+10 more)

### Community 67 - "map.ts"
Cohesion: 0.23
Nodes (12): Box, coveredInsets(), Insets, mergeInsets(), KINDS, MapCityPin, MapHandle, MapOverviewCity (+4 more)

### Community 68 - "pin-visual.ts"
Cohesion: 0.20
Nodes (15): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+7 more)

### Community 69 - "expandTimelineTransferParts"
Cohesion: 0.31
Nodes (11): estimateLegDurationMin(), expandTimelineTransferParts(), hopName(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin() (+3 more)

### Community 70 - "place-index.ts"
Cohesion: 0.40
Nodes (4): Hit, placeRecord(), placeZoom(), resolved

### Community 72 - "export.ts"
Cohesion: 0.14
Nodes (25): TripPatch, copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml() (+17 more)

### Community 73 - "overlays.ts"
Cohesion: 0.24
Nodes (9): PlaceCategoryMeta, Area, drawableRings(), modelFor(), fadeMs(), mountPlaceOverlays(), paint(), resolvedPlace() (+1 more)

### Community 74 - "withResolvedArea"
Cohesion: 0.25
Nodes (7): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, resolvePlaceArea(), resolvePlacePhotos(), withResolvedArea()

### Community 75 - "Os 12 critérios"
Cohesion: 0.15
Nodes (13): 10. Orçamento diário por pessoa com aviso, sugestão e exceções — ❌, 11. Decisões do usuário lembradas pelo LLM — ❌, 12. Horário de funcionamento e melhor período — 🟡, 1. Edição colaborativa usuário + LLM sem conflito — 🟡, 2. Cidade e viagem como duas áreas — ✅ (guias só em Paris), 3. Parada com duração, gasto, descrição e sub-pontos — 🟡, 4. Clima por período definido pelas paradas — 🟡, 5. Documentação para o LLM (editar, manter padrão, receber feature) — 🟡 (+5 more)

### Community 77 - "Não mostra nem a fachada nem o produto (36)"
Cohesion: 0.18
Nodes (11): cafes (2), commons (4), lodging (1), markets (3), Não mostra nem a fachada nem o produto (36), parks (4), photo (4), restaurants (10) (+3 more)

### Community 78 - "Auditoria do Travel Boss — 2026-09-27"
Cohesion: 0.40
Nodes (3): Auditoria do Travel Boss — 2026-09-27, Saúde do repositório, Varredura dos pontos de Paris

### Community 79 - "Onda 2 (depois da onda 1)"
Cohesion: 0.25
Nodes (8): B2 · Meta de orçamento por pessoa por dia — Opus (depende de B1), B3 · "Em aberto" declarado no roteiro — Sonnet, B4 · Duração e gasto por parada no Markdown — Opus (depende de B1; sequencial a B2 no parser), D1 · Horário semanal no catálogo e no card — Opus, D2 · Aviso de parada fora do horário — Opus (depende de D1), D3 · Preencher `hours` dos lugares do roteiro de Paris — Sonnet (dados; depende de D1), E3 · Fotos fracas de Paris (não mostram fachada nem produto) — Sonnet (dados; depois de E2), Onda 2 (depois da onda 1)

### Community 80 - "Plano de execução (Sonnet e Opus)"
Cohesion: 0.22
Nodes (9): A2 · Skill `feature`: como o LLM recebe, executa e documenta um pedido de feature — Sonnet, Contrato para quem executa, F1 · Guias de Milão e Roma (Mercado e Comidas) — Sonnet, G1 · Limpeza de worktrees mesclados — usuário decide, G2 · `scripts/check-travel-photos.py` pula metade das entradas — Sonnet, Onda 3, Ordem e paralelismo, Plano de execução (Sonnet e Opus) (+1 more)

### Community 81 - "Onda 1 (sem dependências; arquivos disjuntos)"
Cohesion: 0.33
Nodes (6): A1 · Regras de colaboração, favoritos e sugestão de IA no `AGENTS.md` — Sonnet, B1 · `decisão:` sob a parada — Opus, C1 · Janela do clima segue as paradas do período — Sonnet, E1 · Links do Google Maps quebrados em Paris — Sonnet (dados), E2 · Lugares de Paris sem foto ou com foto que não carrega — Sonnet (dados), Onda 1 (sem dependências; arquivos disjuntos)

### Community 82 - "1. Link do Google Maps que não abre o lugar direto — 40 de 232 verificados (tarefa E1)"
Cohesion: 0.33
Nodes (6): 1. Link do Google Maps que não abre o lugar direto — 40 de 232 verificados (tarefa E1), list (25), no-card (10), no-results (3), not-maps (1), wrong-place (1)

### Community 88 - "2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)"
Cohesion: 0.29
Nodes (7): 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2), 3. Foto que não mostra a fachada nem o prato/produto principal — 54 de 211 revisados (tarefa E3), Paris — pontos para revisão (varredura de 2026-09-27), Sem nenhuma foto (21), Só a fachada, sem o prato ou produto (18) — atende ao mínimo; o padrão do catálogo (`travel-photos.ts`) pede a comida na capa, Todas as fotos falham (0), Uma das fotos falha (0)

## Knowledge Gaps
- **461 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+456 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `places.ts`, `timeline.ts`, `route-planner.ts`, `weather.ts`, `summary.ts`, `amenities.ts`, `mount.ts`, `hotel-rank.ts`, `stay-heatmap.ts`, `transfer-row.ts`, `parse.ts`, `travel.ts`, `hotel-distance.ts`, `subpoints.ts`, `rating.ts`, `main.ts`, `index.ts`, `map/controls.ts`, `drawTripRoutes`, `export.ts`?**
  _High betweenness centrality (0.068) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `index.ts`, `hotels.ts`, `travel-itinerary-legs.ts`, `export.ts`, `travel-stay-heatmap.ts`, `withResolvedArea`, `places.ts`, `itinerary-route.ts`, `parse.ts`, `travel.ts`, `main.ts`, `mount.ts`, `legs.ts`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `icon()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `places.ts`, `timeline.ts`, `route-planner.ts`, `amenities.ts`, `mount.ts`, `stay-heatmap.ts`, `transfer-row.ts`, `parse.ts`, `hotel-distance.ts`, `ui/controls.ts`, `rating.ts`, `main.ts`, `map/controls.ts`, `drawTripRoutes`, `map.ts`, `pin-visual.ts`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _461 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.13015873015873017 - nodes in this community are weakly interconnected._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.12554112554112554 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.12698412698412698 - nodes in this community are weakly interconnected._
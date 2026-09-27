# Graph Report - travel-boss  (2026-09-27)

## Corpus Check
- 225 files · ~365,324 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1756 nodes · 4455 edges · 80 communities (78 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `096a5039`
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
- pickLocale
- hotel-ranking.mjs
- mountMap
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- travel-areas.test.ts
- weather.ts
- parse.ts
- Travel Boss
- scripts
- basemap-style.ts
- travel.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- amenities.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- mount.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- stay-heatmap.ts
- el
- travel-categories.ts
- walk-route.ts
- hotel-booking-details.test.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- theme.ts
- shell.ts
- map.ts
- transfer-row.ts
- trackpad.ts
- price.ts
- travel-photos.test.ts
- expandTimelineTransferParts
- summary.ts
- view-state.ts
- overview.ts
- TravelPlace
- hotel-distance.ts
- open-now.ts
- router.ts
- hotel-ring.ts
- hotel-dates.ts
- subpoints.ts
- icons.ts
- rating.ts
- main.ts
- legs.ts
- index.ts
- tooltip.ts
- walk-distance.ts
- maplibre-perf.ts
- pin-visual.ts
- links.ts
- note-edit.ts
- overlays.ts
- Os 12 critérios
- Não mostra nem a fachada nem o produto (36)
- Auditoria do Travel Boss — 2026-09-27
- Onda 2 (depois da onda 1)
- Plano de execução (Sonnet e Opus)
- Onda 1 (sem dependências; arquivos disjuntos)
- 1. Link do Google Maps que não abre o lugar direto — 40 de 232 verificados (tarefa E1)
- 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 101 edges
2. `paint()` - 81 edges
3. `el()` - 68 edges
4. `icon()` - 61 edges
5. `mountTrip()` - 52 edges
6. `mountCity()` - 44 edges
7. `mountHotels()` - 42 edges
8. `getTravelCity()` - 32 edges
9. `mountPlacePanel()` - 30 edges
10. `Locale` - 26 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `guided` --calls--> `cityGuide`  [EXTRACTED]
  src/data/travel-guide.test.ts → src/data/travel-guide.ts
- `paris()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/legs.test.ts → src/data/travel.ts
- `place()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/route.test.ts → src/data/travel.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (80 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (28): AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT, bookingDetails() (+20 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.17
Nodes (15): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+7 more)

### Community 2 - "paint"
Cohesion: 0.14
Nodes (42): getTravelCity(), daysOnDate(), tripDates(), cityDisplayName(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer() (+34 more)

### Community 3 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (37): WhyPart, hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES (+29 more)

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
Nodes (23): PlaceCategoryMeta, googleMapsUrl(), cityGuide, TravelCity, aiBadge(), aiSuggestionTip(), TABS, iconButton() (+15 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.08
Nodes (44): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+36 more)

### Community 10 - "places.ts"
Cohesion: 0.11
Nodes (35): placeCategoriesOffByDefault, placeCategoryOrder, subcategoryLabel(), subPointParents(), amenityName(), closePlace(), listedOrigin(), onPlaceClose() (+27 more)

### Community 11 - "day-plan.ts"
Cohesion: 0.14
Nodes (25): BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot(), mealOf() (+17 more)

### Community 12 - "pickLocale"
Cohesion: 0.15
Nodes (26): Locale, pickLocale(), travelUi, fillWeather(), iconLink(), openDialog(), openVideo(), videoButton() (+18 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.10
Nodes (29): ref_node_crypto, accommodationEligibility(), airbnbQuality(), clamp(), evaluateJev(), hotelEvidence(), hotelRegion(), insideRing() (+21 more)

### Community 14 - "mountMap"
Cohesion: 0.19
Nodes (18): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+10 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.14
Nodes (27): ItineraryLegDef, ItineraryTransitHop, WALK_CONNECTOR_MIN_M, LatLng, nearestStation(), stationById(), asCoord(), BuildItineraryOptions (+19 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.06
Nodes (65): categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readCategoryFilter(), readGroups(), readPeriods() (+57 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "travel-areas.test.ts"
Cohesion: 0.11
Nodes (27): installOsmAreas(), AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM() (+19 more)

### Community 19 - "weather.ts"
Cohesion: 0.05
Nodes (60): hotelSearchVite(), applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest(), readTripPatch() (+52 more)

### Community 20 - "parse.ts"
Cohesion: 0.14
Nodes (26): trip(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList() (+18 more)

### Community 21 - "Travel Boss"
Cohesion: 0.06
Nodes (29): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), Instruções compartilhadas (Codex e Claude Code), Quem edita onde (+21 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (36): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+28 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (26): applyBrightBasemap(), BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter(), mapCanvasColor() (+18 more)

### Community 24 - "travel.ts"
Cohesion: 0.09
Nodes (31): favoritePlaceIds(), favoritePlaces(), computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug (+23 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "amenities.ts"
Cohesion: 0.10
Nodes (31): ref_node_fs, only, amenitiesIn(), Amenity, AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin(), Box (+23 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.12
Nodes (15): Dia 1 — Centro antigo, Dia 1 — Chegada, Duomo e Galleria, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 2 — Bate-volta, Dia 2 — Seg 5/10 · Arco do Triunfo, Louvre e compras na Opéra, Dia 3 — Ter 6/10 · Notre-Dame, Quartier Latin, Luxemburgo e piquenique na Torre, Dia 4 — Qua 7/10 · Disney: Adventure World de manhã, Disneyland Park e fogos, Dia 5 — Qui 8/10 · Marais, almoço no Chez Pradel e pôr do sol em Montmartre (+7 more)

### Community 30 - "mount.ts"
Cohesion: 0.13
Nodes (29): DatedDay, emptyNotice(), loadTripFile(), drawTripRoutes(), routeDeps(), walkPoints(), TripFile, tripFileListeners (+21 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "stay-heatmap.ts"
Cohesion: 0.11
Nodes (18): src_data_travel_stay_display, hasStayHeat(), StayZone, Band, BANDS, cityHasStayHeat(), Copy, DisplayFile (+10 more)

### Community 35 - "el"
Cohesion: 0.17
Nodes (22): categoryMaterialName(), openSlotRow(), railHalf(), el(), icon(), card(), GROUPS, guidePlaceIds() (+14 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.10
Nodes (26): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+18 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.11
Nodes (30): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), hydrate() (+22 more)

### Community 38 - "hotel-booking-details.test.ts"
Cohesion: 0.12
Nodes (18): airbnbSnapshot(), BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), parseCategoryScores(), STAFF_MINIMUM, validScore() (+10 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.06
Nodes (37): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+29 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "theme.ts"
Cohesion: 0.22
Nodes (17): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+9 more)

### Community 42 - "shell.ts"
Cohesion: 0.20
Nodes (17): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, CAMERA_DURATION_S (+9 more)

### Community 43 - "map.ts"
Cohesion: 0.16
Nodes (25): KINDS, drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer() (+17 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.21
Nodes (18): formatLegDuration(), legDisplayLabel(), TimelineTransferPart, legLabel(), durationMinutes(), identityOf(), isTrainRide(), isTransferPart() (+10 more)

### Community 45 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 46 - "price.ts"
Cohesion: 0.39
Nodes (6): LEVEL_LABEL, Money, priceAria(), priceLevel, priceLevelOf(), placeMeta()

### Community 47 - "travel-photos.test.ts"
Cohesion: 0.36
Nodes (4): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, resolvePlacePhotos()

### Community 48 - "expandTimelineTransferParts"
Cohesion: 0.31
Nodes (11): estimateLegDurationMin(), expandTimelineTransferParts(), hopName(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin() (+3 more)

### Community 49 - "summary.ts"
Cohesion: 0.13
Nodes (28): DateCity, fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso(), TripDate (+20 more)

### Community 50 - "view-state.ts"
Cohesion: 0.20
Nodes (14): changedStopKeys(), stopFingerprint(), visitStops(), Trip, TripStop, activeSectionKey(), cityInOsrmScope(), dayKey() (+6 more)

### Community 51 - "overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 52 - "TravelPlace"
Cohesion: 0.25
Nodes (8): PlaceCategory, l(), milanCity, place(), TravelPhoto, PlaceSubcategory, TravelPlace, VisitInfo

### Community 53 - "hotel-distance.ts"
Cohesion: 0.25
Nodes (11): googleDirectionsUrl(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+3 more)

### Community 54 - "open-now.ts"
Cohesion: 0.35
Nodes (9): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+1 more)

### Community 55 - "router.ts"
Cohesion: 0.26
Nodes (13): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+5 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.25
Nodes (10): capture(), clearSearchRing(), ink(), leafletMap(), LeafletNs, loadLeaflet(), markContextMarkers(), paint() (+2 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "subpoints.ts"
Cohesion: 0.35
Nodes (9): notesUnderStop(), attachSubPointNotes(), fold(), matchSubPoint(), noteTitle(), stripNoteTitle(), SubPointNote, subs (+1 more)

### Community 59 - "icons.ts"
Cohesion: 0.20
Nodes (13): IconButtonSize, IconButtonVariant, onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn(), syncSegmented() (+5 more)

### Community 60 - "rating.ts"
Cohesion: 0.53
Nodes (7): clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.11
Nodes (24): setDocumentTitle(), Locale, applyChrome(), cityLabel(), cityNav, citySource(), clearMap(), dispose() (+16 more)

### Community 63 - "legs.ts"
Cohesion: 0.19
Nodes (12): milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey(), resolveTripLeg() (+4 more)

### Community 64 - "index.ts"
Cohesion: 0.14
Nodes (16): FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide, guided (+8 more)

### Community 65 - "tooltip.ts"
Cohesion: 0.36
Nodes (9): isTruncated(), mountTooltip(), ownsTooltip(), TOOLTIP_SHOW_MS, TOOLTIP_WARM_MS, tooltipHost(), tooltipPlacement(), tooltipShowDelay() (+1 more)

### Community 66 - "walk-distance.ts"
Cohesion: 0.52
Nodes (5): extraWalkMeters(), formatWalk(), isExtraWalkNote(), polylineMeters(), walkedMeters()

### Community 67 - "maplibre-perf.ts"
Cohesion: 0.70
Nodes (3): MAPLIBRE_PERF, maplibreFade(), labelFadeDuration()

### Community 68 - "pin-visual.ts"
Cohesion: 0.20
Nodes (14): modelFor(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+6 more)

### Community 72 - "note-edit.ts"
Cohesion: 0.08
Nodes (44): copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown() (+36 more)

### Community 73 - "overlays.ts"
Cohesion: 0.14
Nodes (20): loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), resolvePlaceArea(), withResolvedArea() (+12 more)

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
- **458 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+453 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `places.ts`, `route-planner.ts`, `weather.ts`, `parse.ts`, `travel.ts`, `amenities.ts`, `mount.ts`, `stay-heatmap.ts`, `el`, `hotel-rank.ts`, `shell.ts`, `transfer-row.ts`, `price.ts`, `summary.ts`, `hotel-distance.ts`, `rating.ts`, `main.ts`, `index.ts`, `note-edit.ts`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `index.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `places.ts`, `travel-photos.test.ts`, `parse.ts`, `travel.ts`, `main.ts`, `mount.ts`, `legs.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `icon()` connect `el` to `paint`, `hotels.ts`, `place-panel.ts`, `places.ts`, `pickLocale`, `route-planner.ts`, `parse.ts`, `amenities.ts`, `mount.ts`, `stay-heatmap.ts`, `shell.ts`, `map.ts`, `transfer-row.ts`, `price.ts`, `hotel-distance.ts`, `icons.ts`, `rating.ts`, `main.ts`, `pin-visual.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _458 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `hotel-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14772727272727273 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.13588850174216027 - nodes in this community are weakly interconnected._
- **Should `hotels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08013937282229965 - nodes in this community are weakly interconnected._
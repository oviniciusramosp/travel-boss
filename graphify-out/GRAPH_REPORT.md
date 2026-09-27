# Graph Report - travel-boss  (2026-09-27)

## Corpus Check
- 220 files · ~359,361 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1736 nodes · 4396 edges · 78 communities (76 shown, 2 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f7edbc42`
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
- pickLocale
- hotel-ranking.mjs
- shell.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- summary.ts
- vite.config.ts
- el
- Travel Boss
- scripts
- basemap-style.ts
- travel-itineraries.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- amenities.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- route.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- theme.ts
- travel.ts
- travel-subcategories.ts
- walk-route.ts
- hotel-booking-details.test.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- travel-areas.test.ts
- router.ts
- map.ts
- transfer-row.ts
- tooltip.ts
- price.ts
- travel-itineraries.test.ts
- legs.ts
- parse.ts
- calendar.ts
- weather.ts
- expandTimelineTransferParts
- hotel-distance.ts
- open-now.ts
- view-state.ts
- hotel-ring.ts
- hotel-dates.ts
- subpoints.ts
- icons.ts
- rating.ts
- main.ts
- airbnb-search.test.ts
- travel-guide.ts
- walk-distance.ts
- LString
- travel-categories.ts
- links.ts
- note-edit.ts
- Os 12 critérios
- Não mostra nem a fachada nem o produto (36)
- Auditoria do Travel Boss — 2026-09-27
- Onda 2 (depois da onda 1)
- Plano de execução (Sonnet e Opus)
- Onda 1 (sem dependências; arquivos disjuntos)
- 1. Link do Google Maps que não abre o lugar direto — 40 de 232 verificados (tarefa E1)
- 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 100 edges
2. `paint()` - 78 edges
3. `el()` - 68 edges
4. `icon()` - 59 edges
5. `mountTrip()` - 52 edges
6. `mountCity()` - 44 edges
7. `mountHotels()` - 42 edges
8. `getTravelCity()` - 32 edges
9. `mountPlacePanel()` - 30 edges
10. `Locale` - 26 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `fetchForecast()` --calls--> `parseEnsemble()`  [EXTRACTED]
  vite.config.ts → src/trip/weather-source.ts
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

## Communities (78 total, 2 thin omitted)

### Community 0 - "hotel-search.mjs"
Cohesion: 0.16
Nodes (25): AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT, bookingDetails() (+17 more)

### Community 1 - "airbnb-search.mjs"
Cohesion: 0.14
Nodes (19): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract() (+11 more)

### Community 2 - "paint"
Cohesion: 0.12
Nodes (42): getTravelCity(), cityDisplayName(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), catalogPins(), datedPoints() (+34 more)

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
Cohesion: 0.21
Nodes (20): ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge(), bookingSearchUrl() (+12 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "place-panel.ts"
Cohesion: 0.15
Nodes (20): googleMapsUrl(), cityGuide, Locale, subcategoryLabel(), resolveVisit(), aiBadge(), aiSuggestionTip(), TABS (+12 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (65): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+57 more)

### Community 10 - "places.ts"
Cohesion: 0.09
Nodes (48): categoryMaterialName(), placeCategoriesOffByDefault, PlaceCategory, PlaceCategoryMeta, placeCategoryOrder, favoritePlaces(), foodMeals, GuideItem (+40 more)

### Community 11 - "mount.ts"
Cohesion: 0.14
Nodes (29): BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot(), mealOf() (+21 more)

### Community 12 - "pickLocale"
Cohesion: 0.17
Nodes (21): pickLocale(), iconLink(), openDialog(), openVideo(), videoButton(), videoEmbedUrl(), budgetChip(), dateBudgetCards() (+13 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.11
Nodes (26): ref_node_crypto, accommodationEligibility(), airbnbQuality(), clamp(), evaluateJev(), hotelEvidence(), hotelRegion(), insideRing() (+18 more)

### Community 14 - "shell.ts"
Cohesion: 0.20
Nodes (17): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, CAMERA_DURATION_S (+9 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.14
Nodes (27): ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, LatLng, nearestStation(), sliceLinePath(), stationById(), asCoord() (+19 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.05
Nodes (82): categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readCategoryFilter(), readGroups(), readPeriods() (+74 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "summary.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 19 - "vite.config.ts"
Cohesion: 0.09
Nodes (31): hotelSearchVite(), applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest(), readTripPatch() (+23 more)

### Community 20 - "el"
Cohesion: 0.18
Nodes (21): openSlotRow(), railHalf(), el(), icon(), mapsIconLink(), mapsMark(), card(), GROUPS (+13 more)

### Community 21 - "Travel Boss"
Cohesion: 0.07
Nodes (25): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), Quem edita onde, 1. Onde vai cada informação (+17 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (36): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+28 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (26): applyBrightBasemap(), BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter(), mapCanvasColor() (+18 more)

### Community 24 - "travel-itineraries.ts"
Cohesion: 0.15
Nodes (15): computeDayBudget(), computeTripBudget(), DayBudget, itinerariesByCitySlug, ItineraryArrivalOption, ItinerarySlot, moneyTypicalEur(), parisD1AfterBase (+7 more)

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

### Community 30 - "route.ts"
Cohesion: 0.12
Nodes (26): DatedDay, drawTripRoutes(), routeDeps(), walkPoints(), TripDay, TripLeg, DateStop, dateStops() (+18 more)

### Community 31 - "Travel Boss"
Cohesion: 0.40
Nodes (4): Artefato, Catálogo, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "theme.ts"
Cohesion: 0.22
Nodes (17): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+9 more)

### Community 35 - "travel.ts"
Cohesion: 0.14
Nodes (11): favoritePlaceIds(), localTravelCities, NEAR_BNF, travelCountryKeys, TravelLandmark, TravelRouteStop, TravelSubPoint, formatDuration() (+3 more)

### Community 36 - "travel-subcategories.ts"
Cohesion: 0.15
Nodes (15): categoryMaterialIcon, isPlaceSubcategory(), LString, normalizeSubcategories(), parisSubcategoriesByPlaceId, pinMaterialFromSubcategories(), pinSubcategoryPriority, PlaceSubcategory (+7 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (31): abortError(), acquire(), bindUser(), cached(), execute(), fetchDrivingRoute(), fetchOsrm(), fetchWalkingRoute() (+23 more)

### Community 38 - "hotel-booking-details.test.ts"
Cohesion: 0.15
Nodes (14): BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), parseCategoryScores(), STAFF_MINIMUM, validScore(), enrichBookingHotels() (+6 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.07
Nodes (32): day1, day1AfterBase, day1Cdg, day2, day3, day4, day5, day6 (+24 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "travel-areas.test.ts"
Cohesion: 0.06
Nodes (47): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+39 more)

### Community 42 - "router.ts"
Cohesion: 0.26
Nodes (13): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+5 more)

### Community 43 - "map.ts"
Cohesion: 0.06
Nodes (54): Box, coveredInsets(), Insets, mergeInsets(), KINDS, modelFor(), mountMap(), pinIcon() (+46 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.19
Nodes (19): formatLegDuration(), ItineraryLegDef, legDisplayLabel(), legLineColor(), TimelineTransferPart, legLabel(), durationMinutes(), identityOf() (+11 more)

### Community 45 - "tooltip.ts"
Cohesion: 0.36
Nodes (9): isTruncated(), mountTooltip(), ownsTooltip(), TOOLTIP_SHOW_MS, TOOLTIP_WARM_MS, tooltipHost(), tooltipPlacement(), tooltipShowDelay() (+1 more)

### Community 46 - "price.ts"
Cohesion: 0.39
Nodes (6): LEVEL_LABEL, Money, priceAria(), priceLevel, priceLevelOf(), placeMeta()

### Community 47 - "travel-itineraries.test.ts"
Cohesion: 0.24
Nodes (6): parisItinerary, hopName(), legsForDay(), getTransitLine(), TransitLine, transitLineForPlace()

### Community 48 - "legs.ts"
Cohesion: 0.19
Nodes (13): lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM(), pairKey() (+5 more)

### Community 49 - "parse.ts"
Cohesion: 0.14
Nodes (26): trip(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), warningBadge(), checkPlaces(), durationList() (+18 more)

### Community 50 - "calendar.ts"
Cohesion: 0.23
Nodes (14): DateCity, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate(), todayIso() (+6 more)

### Community 51 - "weather.ts"
Cohesion: 0.12
Nodes (26): fillWeather(), cache, dayWeather(), Entry, failureKind, forecastState, keyOf(), loadForecast() (+18 more)

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
Cohesion: 0.21
Nodes (13): changedStopKeys(), stopFingerprint(), visitStops(), TripStop, activeSectionKey(), cityInOsrmScope(), dayKey(), dayOpen() (+5 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "subpoints.ts"
Cohesion: 0.42
Nodes (7): attachSubPointNotes(), fold(), matchSubPoint(), noteTitle(), stripNoteTitle(), SubPointNote, subs

### Community 59 - "icons.ts"
Cohesion: 0.24
Nodes (11): IconButtonSize, IconButtonVariant, onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn(), syncSegmented() (+3 more)

### Community 60 - "rating.ts"
Cohesion: 0.53
Nodes (7): clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 61 - "main.ts"
Cohesion: 0.11
Nodes (24): setDocumentTitle(), Locale, applyChrome(), cityLabel(), cityNav, citySource(), clearMap(), dispose() (+16 more)

### Community 63 - "airbnb-search.test.ts"
Cohesion: 0.25
Nodes (7): airbnbSnapshot(), bookingReference(), readRankingRequest(), validateRankingHotels(), details, params, row

### Community 64 - "travel-guide.ts"
Cohesion: 0.14
Nodes (11): FoodMeal, guides, MarketShelf, parisGuide, guided, photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS (+3 more)

### Community 65 - "walk-distance.ts"
Cohesion: 0.80
Nodes (3): formatWalk(), polylineMeters(), walkedMeters()

### Community 66 - "LString"
Cohesion: 0.50
Nodes (4): LString, l(), milanCity, place()

### Community 68 - "travel-categories.ts"
Cohesion: 0.17
Nodes (14): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, MAPS_MATERIAL_ICON (+6 more)

### Community 72 - "note-edit.ts"
Cohesion: 0.08
Nodes (44): copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml(), tripToMarkdown() (+36 more)

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
- **453 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+448 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `shell.ts`, `route-planner.ts`, `summary.ts`, `el`, `amenities.ts`, `travel.ts`, `hotel-rank.ts`, `transfer-row.ts`, `price.ts`, `parse.ts`, `weather.ts`, `hotel-distance.ts`, `rating.ts`, `main.ts`, `note-edit.ts`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `paint` to `travel-guide.ts`, `travel.ts`, `hotels.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `travel-itineraries.test.ts`, `legs.ts`, `parse.ts`, `calendar.ts`, `main.ts`, `route.ts`?**
  _High betweenness centrality (0.041) - this node is a cross-community bridge._
- **Why does `el()` connect `el` to `paint`, `hotels.ts`, `note-edit.ts`, `place-panel.ts`, `places.ts`, `mount.ts`, `pickLocale`, `travel-stay-heatmap.ts`, `shell.ts`, `price.ts`, `route-planner.ts`, `transfer-row.ts`, `weather.ts`, `hotel-distance.ts`, `rating.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _453 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `airbnb-search.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.12427409988385599 - nodes in this community are weakly interconnected._
- **Should `hotels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08292682926829269 - nodes in this community are weakly interconnected._
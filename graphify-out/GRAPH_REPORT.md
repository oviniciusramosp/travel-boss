# Graph Report - travel-boss  (2026-09-29)

## Corpus Check
- 307 files · ~536,958 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2073 nodes · 5226 edges · 124 communities (107 shown, 17 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.61)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5901ae6f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search-match.mjs
- check-travel-locations.ts
- paint
- stay-heatmap.ts
- hotels.ts
- travel-visit.ts
- api.ts
- fetch-travel-polygons.py
- iconButton
- travel-stay-heatmap.ts
- places.ts
- mount.ts
- airbnb-search.mjs
- hotel-ranking.mjs
- store.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- travel-areas.test.ts
- pickLocale
- weather.ts
- Travel Boss
- scripts
- basemap-style.ts
- place-activation.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- amenities.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- export.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel.ts
- calendar.ts
- travel-categories.ts
- walk-route.ts
- place-panel.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- summary.ts
- index.ts
- theme.ts
- transfer-row.ts
- Alimentação em Versalhes — pesquisa de 28/09/2026
- mercado-2026-10-10.md
- published-api.ts
- grande-epicerie-2026-10-06.md
- Locale
- louvre/README.md
- getTravelCity
- departures.ts
- camera.ts
- open-now.ts
- baguetts-moliere-location-2026-09-28.md
- hotel-ring.ts
- hotel-dates.ts
- subpoints.ts
- Trens da Itália — 12 a 16/10/2026
- route.ts
- main.ts
- vite.config.ts
- Mangez et cassez-vous em Paris — 29/09/2026
- parse.ts
- hotel-search.mjs
- checklist-state.ts
- expandTimelineTransferParts
- vaudeville-2026-09-29.md
- Flan, croque-monsieur e crème brûlée
- links.ts
- McDonald's perto do roteiro de Paris — 28/09/2026
- opera-mercado-2026-10-10.md
- route-draw.ts
- Os 12 critérios
- Pompidou e Montmartre — 8/10/2026
- Não mostra nem a fachada nem o produto (36)
- Auditoria do Travel Boss — 2026-09-27
- Onda 2 (depois da onda 1)
- Plano de execução (Sonnet e Opus)
- Onda 1 (sem dependências; arquivos disjuntos)
- 1. Link do Google Maps que não abre o lugar direto — 40 de 232 verificados (tarefa E1)
- Jantar de 7/10 — pesquisa em 27/09/2026
- europa-calendar-2026.md
- Descrições e fotos — 4 e 5 de outubro de 2026
- shell.ts
- cedric-grolet-meurice-2026-10-10.md
- 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)
- Caminhadas de 6, 8 e 10/10 — estudo de alternativas
- Auditoria de localização de Paris — 28/09/2026
- note-edit.ts
- Richelieu e brunch de 10/10 — consulta em 28/09/2026
- directions.ts
- view-state.ts
- dom.ts
- Jardins de Versalhes — subpontos, 28/09/2026
- appRequest
- getTransitLine
- overlays.ts
- checklists/README.md
- withResolvedArea
- trackpad.ts
- paris-monoprix-les-champs-2026-10-10.md
- maplibre-perf.ts
- paris-milan-rail.md
- Partidas de transporte — Europa
- pin-visual.ts
- Fotos de interiores — Archives nationales e Carnavalet
- map/overview.ts
- Roma — recomendações do Airbnb
- mountHotels
- Cafés próximos à Casa do Gui — 2026-09-28
- Bouillon Pigalle e transporte do Louvre — 29/09/2026
- europa-lodging-2026.md
- map.ts
- brioche-doree-chaussee-antin-2026-09-29.md
- el
- icon
- tooltip.ts
- search.ts
- tripChecklist
- walk-distance.ts
- mountMap

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 121 edges
2. `paint()` - 93 edges
3. `el()` - 87 edges
4. `icon()` - 72 edges
5. `mountTrip()` - 54 edges
6. `mountCity()` - 48 edges
7. `mountHotels()` - 43 edges
8. `Locale` - 31 edges
9. `iconButton()` - 31 edges
10. `mountPlacePanel()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `fetchForecast()` --calls--> `openMeteoForecastQuery()`  [EXTRACTED]
  vite.config.ts → src/trip/weather-source.ts
- `place()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/route.test.ts → src/data/travel.ts
- `syncDistantCities()` --indirect_call--> `leafletMap()`  [INFERRED]
  src/map/map.ts → src/views/hotel-ring.ts
- `tripApi()` --calls--> `tripIdFromPath()`  [EXTRACTED]
  vite.config.ts → src/trip/api.ts

## Import Cycles
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 3-file cycle: `src/data/travel-italy-rail.ts -> src/data/travel-itinerary-legs.ts -> src/data/travel.ts -> src/data/travel-italy-rail.ts`

## Communities (124 total, 17 thin omitted)

### Community 0 - "hotel-search-match.mjs"
Cohesion: 0.22
Nodes (21): bookingLookup(), ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge() (+13 more)

### Community 1 - "check-travel-locations.ts"
Cohesion: 0.27
Nodes (9): counts, rows, trip, auditPin(), destinationPin(), distanceMeters(), Pin, evidence (+1 more)

### Community 2 - "paint"
Cohesion: 0.13
Nodes (41): getTripCity(), cityDisplayName(), clearStopCurrent(), emptyNotice(), loadTripFile(), mountTrip(), applyQuery(), armTransfer() (+33 more)

### Community 3 - "stay-heatmap.ts"
Cohesion: 0.12
Nodes (19): src_data_travel_stay_display, hasStayHeat(), leafletMap(), Band, BANDS, cityHasStayHeat(), Copy, DisplayFile (+11 more)

### Community 4 - "hotels.ts"
Cohesion: 0.11
Nodes (25): WhyPart, AccommodationType, asMsg(), asResult(), Booking, CATEGORIES, CategoryKey, Eligibility (+17 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (32): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+24 more)

### Community 6 - "api.ts"
Cohesion: 0.23
Nodes (13): applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest(), readTripPatch(), day (+5 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "iconButton"
Cohesion: 0.18
Nodes (17): iconButton(), IconButtonSize, IconButtonVariant, iconLink(), onSegmentKey(), segmentButtons(), segmented(), segmentedMove() (+9 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.07
Nodes (46): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+38 more)

### Community 10 - "places.ts"
Cohesion: 0.09
Nodes (40): placeCategoriesOffByDefault, PlaceCategory, placeCategoryOrder, favoritePlaceIds(), favoritePlaces(), ItineraryDay, ItineraryStop, subPointParents() (+32 more)

### Community 11 - "mount.ts"
Cohesion: 0.14
Nodes (30): resolveVisit(), averageDateBudget(), BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails() (+22 more)

### Community 12 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (25): ref_node_child_process, ref_node_fs, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract() (+17 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (37): ref_node_crypto, BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+29 more)

### Community 14 - "store.ts"
Cohesion: 0.27
Nodes (13): categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readCategoryFilter(), readGroups(), readPeriods() (+5 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.14
Nodes (28): ItineraryLegDef, ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, nearestStation(), sliceLinePath(), stationById(), asCoord() (+20 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.08
Nodes (53): apply(), barActive(), beginLocate(), CITY_FAR_KM, drawRoutePreview(), formatRouteDistance(), formatRouteDuration(), GeoPermission (+45 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "travel-areas.test.ts"
Cohesion: 0.09
Nodes (33): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+25 more)

### Community 19 - "pickLocale"
Cohesion: 0.19
Nodes (22): pickLocale(), amenityName(), periodBlock(), amenityGroup(), averageBudgetCards(), budgetChip(), dateBudgetCards(), foodTarget() (+14 more)

### Community 20 - "weather.ts"
Cohesion: 0.13
Nodes (25): fillWeather(), cache, dayWeather(), Entry, failureKind, forecastState, keyOf(), loadForecast() (+17 more)

### Community 21 - "Travel Boss"
Cohesion: 0.05
Nodes (31): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), Instruções compartilhadas (Codex e Claude Code), Publicação estática (+23 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (38): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+30 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (26): applyBrightBasemap(), BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter(), mapCanvasColor() (+18 more)

### Community 24 - "place-activation.ts"
Cohesion: 0.18
Nodes (12): l(), milanCity, place(), TravelCity, activatePlace(), consumePlaceSearch(), resetPlaceSelection(), revealPlace() (+4 more)

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
Cohesion: 0.07
Nodes (27): Dia 1 — Dom 11/10 · Chegada, Duomo e Galleria, Dia 1 — Dom 18/10 · Chegada a Lisboa, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 1 — Qua 14/10 · Chegada a La Spezia, Dia 1 — Sex 16/10 · Chegada a Roma, Dia 2 — Qui 15/10 · Cinque Terre, Dia 2 — Seg 12/10 · Bate-volta a Veneza, Dia 2 — Seg 19/10 · Lisboa (+19 more)

### Community 30 - "export.ts"
Cohesion: 0.22
Nodes (17): PERIODS, copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToMarkdown() (+9 more)

### Community 31 - "Travel Boss"
Cohesion: 0.33
Nodes (5): Artefato, Catálogo, Publicação, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel.ts"
Cohesion: 0.07
Nodes (36): computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItinerarySlot (+28 more)

### Community 35 - "calendar.ts"
Cohesion: 0.18
Nodes (17): DateCity, DatedDay, daysOnDate(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate() (+9 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.10
Nodes (28): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+20 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (32): decodeFootShape(), footFallback(), waitForSlot(), abortError(), acquire(), bindUser(), cached(), execute() (+24 more)

### Community 38 - "place-panel.ts"
Cohesion: 0.13
Nodes (24): googleMapsUrl(), subcategoryLabel(), aiBadge(), aiSuggestionTip(), TABS, prefersReducedMotion(), LEVEL_LABEL, Money (+16 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.05
Nodes (41): italyRailCities, italyRailLegs, laSpeziaStation, venice, verona, day1, day1AfterBase, day1Cdg (+33 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.17
Nodes (17): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+9 more)

### Community 41 - "summary.ts"
Cohesion: 0.22
Nodes (18): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+10 more)

### Community 42 - "index.ts"
Cohesion: 0.15
Nodes (18): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+10 more)

### Community 43 - "theme.ts"
Cohesion: 0.22
Nodes (17): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+9 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.23
Nodes (18): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), TripLeg, durationMinutes(), identityOf(), isTrainRide() (+10 more)

### Community 45 - "Alimentação em Versalhes — pesquisa de 28/09/2026"
Cohesion: 0.12
Nodes (15): Alimentação em Versalhes — pesquisa de 28/09/2026, Almoço em Versalhes, Aplicação ao roteiro e reentrada (28/09), Boulangerie Castellane, Café da manhã e compra para levar em Paris, Café da tarde, Carré aux Crêpes, Comida no domínio (+7 more)

### Community 47 - "published-api.ts"
Cohesion: 0.35
Nodes (8): browserValue(), checklists, publishedPlaceEdits(), publishedRequest(), reply(), trip(), trips, openMeteoForecastQuery()

### Community 49 - "Locale"
Cohesion: 0.30
Nodes (11): Locale, travelUi, clampRating(), formatRating(), ratingPicker(), ratingAria(), ratingSummary(), starParts (+3 more)

### Community 51 - "getTravelCity"
Cohesion: 0.17
Nodes (15): getTravelCity(), lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM() (+7 more)

### Community 52 - "departures.ts"
Cohesion: 0.23
Nodes (11): clock(), DepartureTime, departureTimes(), fold(), matches(), minutes(), service, train (+3 more)

### Community 53 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 54 - "open-now.ts"
Cohesion: 0.32
Nodes (10): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+2 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "subpoints.ts"
Cohesion: 0.35
Nodes (9): notesUnderStop(), attachSubPointNotes(), fold(), matchSubPoint(), noteTitle(), stripNoteTitle(), SubPointNote, subs (+1 more)

### Community 60 - "route.ts"
Cohesion: 0.12
Nodes (25): flightCurve(), Point, cityByPlace, intercityHops(), hop(), point(), DateStop, dateStops() (+17 more)

### Community 61 - "main.ts"
Cohesion: 0.10
Nodes (35): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+27 more)

### Community 63 - "vite.config.ts"
Cohesion: 0.13
Nodes (21): hotelSearchVite(), Ensemble, forecastToEnsemble(), localStamp(), Member, MET_URL, MetSeries, metToEnsemble() (+13 more)

### Community 64 - "Mangez et cassez-vous em Paris — 29/09/2026"
Cohesion: 0.40
Nodes (4): Critério de localização, Horário da unidade Taitbout, Mangez et cassez-vous em Paris — 29/09/2026, Preço e fotos

### Community 65 - "parse.ts"
Cohesion: 0.13
Nodes (27): travelCities, placeCity(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel(), parse(), warningBadge() (+19 more)

### Community 66 - "hotel-search.mjs"
Cohesion: 0.12
Nodes (32): airbnbSnapshot(), parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone() (+24 more)

### Community 67 - "checklist-state.ts"
Cohesion: 0.36
Nodes (7): ChecklistEdit, ChecklistItem, compareTaskSchedule(), editChecklist(), isItem(), item, validDate()

### Community 68 - "expandTimelineTransferParts"
Cohesion: 0.36
Nodes (10): estimateLegDurationMin(), expandTimelineTransferParts(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin(), walkMinutes() (+2 more)

### Community 70 - "Flan, croque-monsieur e crème brûlée"
Cohesion: 0.22
Nodes (6): Fotos e notas das padarias premiadas, Croissants premiados do Grand Paris, Croque-monsieur: recomendação editorial, Crème brûlée: recomendação editorial, Flan: categoria profissional, 2024–2026, Flan, croque-monsieur e crème brûlée

### Community 72 - "McDonald's perto do roteiro de Paris — 28/09/2026"
Cohesion: 0.22
Nodes (7): Disney: estabelecimento novo e limites do levantamento, McDonald's perto do roteiro de Paris — 28/09/2026, Opções e encaixes, Prioridade sugerida, ainda sem decisão do usuário, Fotos e avaliações — conferência em 28/09/2026, McDonald's no mapa de Paris — seleção de 28/09/2026, Pesquisa e limites

### Community 74 - "route-draw.ts"
Cohesion: 0.19
Nodes (16): cityByPlace, drawRouteSegments(), RouteEntry, RoutePointer, safeColor(), walkColor(), nearTransfer(), RouteFocus (+8 more)

### Community 75 - "Os 12 critérios"
Cohesion: 0.15
Nodes (13): 10. Orçamento diário por pessoa com aviso, sugestão e exceções — ❌, 11. Decisões do usuário lembradas pelo LLM — ❌, 12. Horário de funcionamento e melhor período — 🟡, 1. Edição colaborativa usuário + LLM sem conflito — 🟡, 2. Cidade e viagem como duas áreas — ✅ (guias só em Paris), 3. Parada com duração, gasto, descrição e sub-pontos — 🟡, 4. Clima por período definido pelas paradas — 🟡, 5. Documentação para o LLM (editar, manter padrão, receber feature) — 🟡 (+5 more)

### Community 76 - "Pompidou e Montmartre — 8/10/2026"
Cohesion: 0.29
Nodes (5): 8/10/2026 — Canal Saint-Martin e Chez Janou, Sentier entre Pompidou e Montmartre — consulta em 28/09/2026, Ajuste de transporte — 28/09/2026, Coordenadas OSM, Pompidou e Montmartre — 8/10/2026

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

### Community 83 - "Jantar de 7/10 — pesquisa em 27/09/2026"
Cohesion: 0.25
Nodes (7): Alternativas, Detalhes dos pontos do parque, Escolha aplicada — 27/09/2026, Ingresso, Jantar de 7/10 — pesquisa em 27/09/2026, Preparar antes, Restrições do roteiro atual

### Community 85 - "Descrições e fotos — 4 e 5 de outubro de 2026"
Cohesion: 0.40
Nodes (4): Descrições e fotos — 4 e 5 de outubro de 2026, Fontes da revisão, Fotos, Validação

### Community 86 - "shell.ts"
Cohesion: 0.17
Nodes (19): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, isMobile() (+11 more)

### Community 88 - "2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)"
Cohesion: 0.29
Nodes (7): 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2), 3. Foto que não mostra a fachada nem o prato/produto principal — 54 de 211 revisados (tarefa E3), Paris — pontos para revisão (varredura de 2026-09-27), Sem nenhuma foto (21), Só a fachada, sem o prato ou produto (18) — atende ao mínimo; o padrão do catálogo (`travel-photos.ts`) pede a comida na capa, Todas as fotos falham (0), Uma das fotos falha (0)

### Community 89 - "Caminhadas de 6, 8 e 10/10 — estudo de alternativas"
Cohesion: 0.33
Nodes (5): Base, Caminhadas de 6, 8 e 10/10 — estudo de alternativas, Fontes, Opções preservando as paradas, Trechos em que não compensa acrescentar metrô

### Community 90 - "Auditoria de localização de Paris — 28/09/2026"
Cohesion: 0.29
Nodes (6): Auditoria de localização de Paris — 28/09/2026, Causa e método, Correções aplicadas nesta rodada, Evidência por lugar e prevenção, Pendências e limites para usar o roteiro, Resultado

### Community 91 - "note-edit.ts"
Cohesion: 0.09
Nodes (37): TripPatch, tripToHtml(), escapeHtml(), inline(), InlineNodeOptions, inlineNodes(), InlinePart, inlineWithLinks() (+29 more)

### Community 93 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 94 - "view-state.ts"
Cohesion: 0.21
Nodes (13): changedStopKeys(), stopFingerprint(), trip(), visitStops(), activeSectionKey(), cityInOsrmScope(), dayKey(), dayOpen() (+5 more)

### Community 95 - "dom.ts"
Cohesion: 0.21
Nodes (12): tripTabs(), googleDirectionsUrl(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection() (+4 more)

### Community 96 - "Jardins de Versalhes — subpontos, 28/09/2026"
Cohesion: 0.29
Nodes (6): Ajuste do dia para preservar o pôr do sol, Coordenadas OSM, Critério e fontes, Fotos e descrições do card, Jardins de Versalhes — subpontos, 28/09/2026, Ordem e duração

### Community 97 - "appRequest"
Cohesion: 0.29
Nodes (8): placeEditsApi(), PlaceEdits, PlaceEditStore, readPlaceEdits(), savePlaceEdits(), syncPlaceEdits(), withPlaceEdits(), appRequest()

### Community 98 - "getTransitLine"
Cohesion: 0.47
Nodes (4): hopName(), getTransitLine(), TransitLine, transitLineForPlace()

### Community 99 - "overlays.ts"
Cohesion: 0.18
Nodes (12): PlaceCategoryMeta, Area, drawableRings(), modelFor(), fadeMs(), mountPlaceOverlays(), paint(), Hit (+4 more)

### Community 101 - "withResolvedArea"
Cohesion: 0.21
Nodes (9): allPlaces(), resolvedPlaces(), photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, resolvePlaceArea(), resolvePlacePhotos() (+1 more)

### Community 102 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 104 - "maplibre-perf.ts"
Cohesion: 0.70
Nodes (3): MAPLIBRE_PERF, maplibreFade(), labelFadeDuration()

### Community 106 - "Partidas de transporte — Europa"
Cohesion: 0.50
Nodes (3): Partidas de transporte — Europa, Pendências e limites, Serviços consultados

### Community 107 - "pin-visual.ts"
Cohesion: 0.22
Nodes (13): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+5 more)

### Community 108 - "Fotos de interiores — Archives nationales e Carnavalet"
Cohesion: 0.50
Nodes (3): Fotos de interiores — Archives nationales e Carnavalet, par-archives-nationales, par-carnavalet

### Community 109 - "map/overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 110 - "Roma — recomendações do Airbnb"
Cohesion: 0.50
Nodes (3): Monte Ciocci (`rom-monte-ciocci`), Roma — recomendações do Airbnb, Valle Aurelia (`rom-valle-aurelia`)

### Community 111 - "mountHotels"
Cohesion: 0.14
Nodes (12): hotelPhotoUrls(), addDays(), hotelSetupFailure(), isAbort(), isoDate(), kmBetween(), mountHotels(), nightsBetween() (+4 more)

### Community 112 - "Cafés próximos à Casa do Gui — 2026-09-28"
Cohesion: 0.40
Nodes (4): Boulangerie Eden — par-boulangerie-eden-noisy, Cafés próximos à Casa do Gui — 2026-09-28, Candidatos não adicionados, Le Jean Jaurès — par-le-jean-jaures-noisy

### Community 113 - "Bouillon Pigalle e transporte do Louvre — 29/09/2026"
Cohesion: 0.50
Nodes (3): Bouillon Pigalle e transporte do Louvre — 29/09/2026, Bouillon Pigalle em 08/10, Louvre → Lafayette Gourmet em 05/10

### Community 115 - "map.ts"
Cohesion: 0.23
Nodes (12): Box, coveredInsets(), Insets, mergeInsets(), KINDS, MapCityPin, MapHandle, MapOverviewCity (+4 more)

### Community 117 - "el"
Cohesion: 0.27
Nodes (12): openSlotRow(), railHalf(), weatherSlot(), el(), card(), GROUPS, GuideView, media() (+4 more)

### Community 118 - "icon"
Cohesion: 0.26
Nodes (10): icon(), IconName, IconSize, mapsIconLink(), mapsMark(), placePin(), mountCityNav(), modeButton() (+2 more)

### Community 119 - "tooltip.ts"
Cohesion: 0.36
Nodes (9): isTruncated(), mountTooltip(), ownsTooltip(), TOOLTIP_SHOW_MS, TOOLTIP_WARM_MS, tooltipHost(), tooltipPlacement(), tooltipShowDelay() (+1 more)

### Community 120 - "search.ts"
Cohesion: 0.47
Nodes (7): mountSearch(), searchMatches(), searchSchedule(), searchText(), Suggestion, isMobileLayout, preparePlaceSearch()

### Community 121 - "tripChecklist"
Cohesion: 0.44
Nodes (9): tripChecklist(), addItem(), edit(), sync(), count(), load(), save(), scheduleFields() (+1 more)

### Community 122 - "walk-distance.ts"
Cohesion: 0.52
Nodes (5): extraWalkMeters(), formatWalk(), isExtraWalkNote(), polylineMeters(), walkedMeters()

### Community 123 - "mountMap"
Cohesion: 0.60
Nodes (5): mountMap(), syncDistantCities(), zoomPinBucket(), paintRouteFocus(), routeEmphasis()

## Knowledge Gaps
- **577 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+572 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **17 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `stay-heatmap.ts`, `hotels.ts`, `iconButton`, `places.ts`, `mount.ts`, `route-planner.ts`, `weather.ts`, `place-activation.ts`, `amenities.ts`, `export.ts`, `travel.ts`, `place-panel.ts`, `hotel-rank.ts`, `summary.ts`, `index.ts`, `transfer-row.ts`, `Locale`, `departures.ts`, `main.ts`, `parse.ts`, `shell.ts`, `dom.ts`, `mountHotels`, `map.ts`, `el`, `icon`, `search.ts`, `tripChecklist`, `mountMap`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `el()` connect `el` to `paint`, `stay-heatmap.ts`, `hotels.ts`, `iconButton`, `places.ts`, `mount.ts`, `route-planner.ts`, `pickLocale`, `weather.ts`, `place-panel.ts`, `transfer-row.ts`, `Locale`, `shell.ts`, `note-edit.ts`, `dom.ts`, `mountHotels`, `icon`, `search.ts`, `tripChecklist`?**
  _High betweenness centrality (0.031) - this node is a cross-community bridge._
- **Why does `mountTrip()` connect `paint` to `parse.ts`, `calendar.ts`, `places.ts`, `mount.ts`, `store.ts`, `pickLocale`, `place-activation.ts`, `subpoints.ts`, `main.ts`, `export.ts`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _577 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.13414634146341464 - nodes in this community are weakly interconnected._
- **Should `stay-heatmap.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11904761904761904 - nodes in this community are weakly interconnected._
- **Should `hotels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.1076923076923077 - nodes in this community are weakly interconnected._
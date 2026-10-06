# Graph Report - travel-boss-publicacao-final-2026-10-06  (2026-10-06)

## Corpus Check
- 334 files · ~559,318 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2172 nodes · 5405 edges · 135 communities (115 shown, 20 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b054fe20`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search-match.mjs
- travel-itineraries.ts
- paint
- index.ts
- hotels.ts
- travel-visit.ts
- dates.ts
- fetch-travel-polygons.py
- amenities.ts
- travel-stay-heatmap.ts
- places.ts
- mount.ts
- airbnb-search.mjs
- hotel-ranking.mjs
- export.ts
- itinerary-route.ts
- route-planner.ts
- compilerOptions
- travel-areas.test.ts
- pickLocale
- weather.ts
- Travel Boss
- scripts
- basemap-style.ts
- theme.ts
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- shell.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- contrast.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- travel.ts
- calendar.ts
- travel-subcategories.ts
- walk-route.ts
- place-panel.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- travel-italy-rail.ts
- LString
- vite.config.ts
- transfer-row.ts
- Alimentação em Versalhes — pesquisa de 28/09/2026
- mercado-2026-10-10.md
- departures.ts
- grande-epicerie-2026-10-06.md
- icons.ts
- louvre/README.md
- legs.ts
- check-travel-locations.ts
- camera.ts
- open-now.ts
- baguetts-moliere-location-2026-09-28.md
- hotel-ring.ts
- hotel-dates.ts
- subpoints.ts
- Trens da Itália — 12 a 16/10/2026
- route.ts
- main.ts
- weather-source.ts
- Mangez et cassez-vous em Paris — 29/09/2026
- parse.ts
- hotel-search.mjs
- store.ts
- expandTimelineTransferParts
- vaudeville-2026-09-29.md
- Flan, croque-monsieur e crème brûlée
- links.ts
- McDonald's perto do roteiro de Paris — 28/09/2026
- opera-mercado-2026-10-10.md
- map.ts
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
- checklist-state.ts
- cedric-grolet-meurice-2026-10-10.md
- 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)
- Caminhadas de 6, 8 e 10/10 — estudo de alternativas
- Auditoria de localização de Paris — 28/09/2026
- note-edit.ts
- Richelieu e brunch de 10/10 — consulta em 28/09/2026
- directions.ts
- travel-guide.ts
- hotel-distance.ts
- Jardins de Versalhes — subpontos, 28/09/2026
- amenities.test.ts
- osm-area-bridge.ts
- travelCities
- checklists/README.md
- withResolvedArea
- trackpad.ts
- paris-monoprix-les-champs-2026-10-10.md
- appRequest
- paris-milan-rail.md
- Partidas de transporte — Europa
- mountMap
- Fotos de interiores — Archives nationales e Carnavalet
- map/overview.ts
- Roma — recomendações do Airbnb
- airbnb-search.test.ts
- Cafés próximos à Casa do Gui — 2026-09-28
- Bouillon Pigalle e transporte do Louvre — 29/09/2026
- map/controls.ts
- view-state.ts
- brioche-doree-chaussee-antin-2026-09-29.md
- Revisão do roteiro e refeições de 12/10
- icon
- Milão — 11/10/2026
- search.ts
- Refeições da Itália e de Portugal — 3/10/2026
- Roma → Lisboa — 18/10/2026
- vite-app-cache.ts
- Itália — atualização a partir do Notion
- Manhã de 14/10 e depósito de malas em Roma
- getTravelCity
- maplibre-perf.ts
- Lisboa — retorno de 20/10/2026
- lisboa-mercado-calhariz-2026-10-03.md
- pouletos-paris-2026-10-02.md
- weather-coverage-2026-10-03.md
- walk-distance.ts
- Primark em Milão — consulta de 06/10/2026
- maps-links-2026-10-06.md

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 123 edges
2. `paint()` - 95 edges
3. `el()` - 87 edges
4. `icon()` - 74 edges
5. `mountTrip()` - 52 edges
6. `mountCity()` - 48 edges
7. `mountHotels()` - 43 edges
8. `Locale` - 33 edges
9. `iconButton()` - 32 edges
10. `mountPlacePanel()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `weatherApi()` --calls--> `extendForecast()`  [EXTRACTED]
  vite.config.ts → src/trip/weather-source.ts
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `guided` --calls--> `cityGuide`  [EXTRACTED]
  src/data/travel-guide.test.ts → src/data/travel-guide.ts
- `paris()` --calls--> `getTravelCity()`  [EXTRACTED]
  src/trip/legs.test.ts → src/data/travel.ts

## Import Cycles
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 3-file cycle: `src/data/travel-italy-rail.ts -> src/data/travel-itinerary-legs.ts -> src/data/travel.ts -> src/data/travel-italy-rail.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (135 total, 20 thin omitted)

### Community 0 - "hotel-search-match.mjs"
Cohesion: 0.20
Nodes (23): bookingLookup(), ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge() (+15 more)

### Community 1 - "travel-itineraries.ts"
Cohesion: 0.13
Nodes (21): computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItineraryDay (+13 more)

### Community 2 - "paint"
Cohesion: 0.13
Nodes (44): daysOnDate(), tripDates(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), catalogPins(), datedPoints() (+36 more)

### Community 3 - "index.ts"
Cohesion: 0.14
Nodes (21): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialName(), MAPS_MATERIAL_ICON (+13 more)

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (36): hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey (+28 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (32): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+24 more)

### Community 6 - "dates.ts"
Cohesion: 0.23
Nodes (17): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+9 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "amenities.ts"
Cohesion: 0.16
Nodes (19): amenitiesIn(), AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin(), Box, boxesOverlap(), cities, label() (+11 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (64): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+56 more)

### Community 10 - "places.ts"
Cohesion: 0.12
Nodes (32): cityGuide, subcategoryLabel(), subPointParents(), amenityName(), aiBadge(), aiSuggestionTip(), TABS, guidePlaceIds() (+24 more)

### Community 11 - "mount.ts"
Cohesion: 0.14
Nodes (30): resolveVisit(), averageDateBudget(), BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails() (+22 more)

### Community 12 - "airbnb-search.mjs"
Cohesion: 0.13
Nodes (20): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbType(), extract(), run (+12 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (38): BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), parseCategoryScores(), STAFF_MINIMUM, validScore(), accommodationEligibility() (+30 more)

### Community 14 - "export.ts"
Cohesion: 0.22
Nodes (17): PERIODS, copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToMarkdown() (+9 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.14
Nodes (27): ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, LatLng, nearestStation(), sliceLinePath(), stationById(), asCoord() (+19 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.09
Nodes (53): apply(), barActive(), beginLocate(), CITY_FAR_KM, createRouteButton(), drawRoutePreview(), formatRouteDistance(), formatRouteDuration() (+45 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "travel-areas.test.ts"
Cohesion: 0.11
Nodes (27): installOsmAreas(), AreaIssue, AreaIssueCode, AreaPolicy, DEFAULT_AREA_POLICY, distPointToPolygonM(), distPointToPolylineM(), distPointToSegmentM() (+19 more)

### Community 19 - "pickLocale"
Cohesion: 0.11
Nodes (42): pickLocale(), tripChecklist(), addItem(), edit(), sync(), count(), load(), save() (+34 more)

### Community 20 - "weather.ts"
Cohesion: 0.12
Nodes (27): fillWeather(), cache, dayWeather(), Entry, failureKind, forecastState, keyOf(), loadForecast() (+19 more)

### Community 21 - "Travel Boss"
Cohesion: 0.05
Nodes (32): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), Instruções compartilhadas (Codex e Claude Code), Publicação estática (+24 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (38): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+30 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (26): applyBrightBasemap(), BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter(), mapCanvasColor() (+18 more)

### Community 24 - "theme.ts"
Cohesion: 0.22
Nodes (17): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+9 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "shell.ts"
Cohesion: 0.17
Nodes (19): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), Shell, isMobile() (+11 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.07
Nodes (27): Dia 1 — Dom 11/10 · Chegada, Duomo e Galleria, Dia 1 — Dom 18/10 · Chegada a Lisboa, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 1 — Qua 14/10 · Chegada a La Spezia, Dia 1 — Sex 16/10 · Chegada, Coliseu, Fórum e Palatino, Dia 2 — Qui 15/10 · Cinque Terre, Dia 2 — Seg 12/10 · Bate-volta a Veneza, Dia 2 — Seg 19/10 · Lisboa (+19 more)

### Community 30 - "contrast.ts"
Cohesion: 0.48
Nodes (5): chipTone(), circleInk(), ContrastInk, ON_INK_FILLS, relativeLuminance()

### Community 31 - "Travel Boss"
Cohesion: 0.33
Nodes (5): Artefato, Catálogo, Publicação, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "travel.ts"
Cohesion: 0.08
Nodes (19): categoryColor(), PlaceCategoryIcon, favoritePlaceIds(), favoritePlaces(), localTravelCities, NEAR_BNF, Branch, branches (+11 more)

### Community 35 - "calendar.ts"
Cohesion: 0.17
Nodes (16): currentTripDate(), DateCity, dateCityNames(), DatedDay, fold(), mentionsCity(), nearestTripDate(), scheduleDays() (+8 more)

### Community 36 - "travel-subcategories.ts"
Cohesion: 0.15
Nodes (15): categoryMaterialIcon, isPlaceSubcategory(), LString, normalizeSubcategories(), parisSubcategoriesByPlaceId, pinMaterialFromSubcategories(), pinSubcategoryPriority, PlaceSubcategory (+7 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (33): decodeFootShape(), footFallback(), waitForSlot(), abortError(), acquire(), bindUser(), cached(), execute() (+25 more)

### Community 38 - "place-panel.ts"
Cohesion: 0.15
Nodes (18): mapsIconLink(), mapsMark(), LEVEL_LABEL, Money, priceAria(), priceLevel, priceLevelOf(), mountHotelSlider() (+10 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.06
Nodes (39): cinqueTerreRegional, milanMetro3, romeMetroB, veniceVaporetto1, day1, day1AfterBase, day1Cdg, day2 (+31 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "travel-italy-rail.ts"
Cohesion: 0.15
Nodes (10): cinqueTerreNotionPlaces, romeNotionPlaces, veniceNotionPlaces, veronaNotionPlaces, italyRailCities, italyRailLegs, laSpeziaStation, venice (+2 more)

### Community 42 - "LString"
Cohesion: 0.14
Nodes (13): IndoorStep, LouvreFloor, louvreRoute, louvreSources, IndoorPathPart, louvrePaths, plans, laSpeziaFoodPlaces (+5 more)

### Community 43 - "vite.config.ts"
Cohesion: 0.11
Nodes (24): ref_node_fs, hotelSearchVite(), publicTrip(), publicTrips(), applyTripPatch(), blockEnd(), findBlock(), indentOf() (+16 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.22
Nodes (17): formatLegDuration(), legLineColor(), TimelineTransferPart, legLabel(), durationMinutes(), identityOf(), isTrainRide(), isTransferPart() (+9 more)

### Community 45 - "Alimentação em Versalhes — pesquisa de 28/09/2026"
Cohesion: 0.12
Nodes (15): Alimentação em Versalhes — pesquisa de 28/09/2026, Almoço em Versalhes, Aplicação ao roteiro e reentrada (28/09), Boulangerie Castellane, Café da manhã e compra para levar em Paris, Café da tarde, Carré aux Crêpes, Comida no domínio (+7 more)

### Community 47 - "departures.ts"
Cohesion: 0.23
Nodes (11): clock(), DepartureTime, departureTimes(), fold(), matches(), minutes(), service, train (+3 more)

### Community 49 - "icons.ts"
Cohesion: 0.21
Nodes (15): TravelPlace, travelUi, canEdit, IconName, ICONS, IconSize, clampRating(), formatRating() (+7 more)

### Community 51 - "legs.ts"
Cohesion: 0.15
Nodes (16): ItineraryLegDef, lineBrandColor(), milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM() (+8 more)

### Community 52 - "check-travel-locations.ts"
Cohesion: 0.27
Nodes (9): counts, rows, trip, auditPin(), destinationPin(), distanceMeters(), Pin, evidence (+1 more)

### Community 53 - "camera.ts"
Cohesion: 0.20
Nodes (16): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+8 more)

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
Cohesion: 0.38
Nodes (8): attachSubPointNotes(), fold(), matchSubPoint(), noteTitle(), stripNoteTitle(), SubPointNote, subs, walkOrder()

### Community 60 - "route.ts"
Cohesion: 0.12
Nodes (28): flightCurve(), Point, drawTripRoutes(), routeDeps(), walkPoints(), cityByPlace, intercityHops(), hop() (+20 more)

### Community 61 - "main.ts"
Cohesion: 0.06
Nodes (51): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+43 more)

### Community 63 - "weather-source.ts"
Cohesion: 0.15
Nodes (23): checklists, publishedPlaceEdits(), publishedRequest(), reply(), trip(), trips, extendForecast(), forecastToEnsemble() (+15 more)

### Community 64 - "Mangez et cassez-vous em Paris — 29/09/2026"
Cohesion: 0.40
Nodes (4): Critério de localização, Horário da unidade Taitbout, Mangez et cassez-vous em Paris — 29/09/2026, Preço e fotos

### Community 65 - "parse.ts"
Cohesion: 0.11
Nodes (32): changedStopKeys(), stopFingerprint(), trip(), visitStops(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel() (+24 more)

### Community 66 - "hotel-search.mjs"
Cohesion: 0.16
Nodes (23): AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT, bookingDetails() (+15 more)

### Community 67 - "store.ts"
Cohesion: 0.30
Nodes (12): categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readCategoryFilter(), readGroups(), readPeriods() (+4 more)

### Community 68 - "expandTimelineTransferParts"
Cohesion: 0.20
Nodes (15): estimateLegDurationMin(), expandTimelineTransferParts(), hopName(), interHopWalkM(), legDisplayLabel(), pathLengthM(), stationCountFromPath(), transitMPerMin() (+7 more)

### Community 70 - "Flan, croque-monsieur e crème brûlée"
Cohesion: 0.22
Nodes (6): Fotos e notas das padarias premiadas, Croissants premiados do Grand Paris, Croque-monsieur: recomendação editorial, Crème brûlée: recomendação editorial, Flan: categoria profissional, 2024–2026, Flan, croque-monsieur e crème brûlée

### Community 72 - "McDonald's perto do roteiro de Paris — 28/09/2026"
Cohesion: 0.22
Nodes (7): Disney: estabelecimento novo e limites do levantamento, McDonald's perto do roteiro de Paris — 28/09/2026, Opções e encaixes, Prioridade sugerida, ainda sem decisão do usuário, Fotos e avaliações — conferência em 28/09/2026, McDonald's no mapa de Paris — seleção de 28/09/2026, Pesquisa e limites

### Community 74 - "map.ts"
Cohesion: 0.16
Nodes (23): KINDS, cityByPlace, drawRouteSegments(), paintRouteFocus(), RouteEntry, RoutePointer, safeColor(), walkColor() (+15 more)

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

### Community 86 - "checklist-state.ts"
Cohesion: 0.31
Nodes (8): checklistApi(), ChecklistEdit, ChecklistItem, compareTaskSchedule(), editChecklist(), isItem(), item, validDate()

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
Nodes (36): tripToHtml(), escapeHtml(), inline(), InlineNodeOptions, inlineNodes(), InlinePart, inlineWithLinks(), MarkSpan (+28 more)

### Community 93 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 94 - "travel-guide.ts"
Cohesion: 0.18
Nodes (9): FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide, guided (+1 more)

### Community 95 - "hotel-distance.ts"
Cohesion: 0.25
Nodes (11): googleDirectionsUrl(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+3 more)

### Community 96 - "Jardins de Versalhes — subpontos, 28/09/2026"
Cohesion: 0.29
Nodes (6): Ajuste do dia para preservar o pôr do sol, Coordenadas OSM, Critério e fontes, Fotos e descrições do card, Jardins de Versalhes — subpontos, 28/09/2026, Ordem e duração

### Community 97 - "amenities.test.ts"
Cohesion: 0.25
Nodes (6): only, Amenity, amenityCells(), Cell, packAmenities(), PackedAmenity

### Community 98 - "osm-area-bridge.ts"
Cohesion: 0.35
Nodes (8): loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), ensureOsmAreas(), invalidateResolvedPlaces()

### Community 99 - "travelCities"
Cohesion: 0.17
Nodes (14): travelCities, Area, drawableRings(), modelFor(), fadeMs(), mountPlaceOverlays(), paint(), Hit (+6 more)

### Community 101 - "withResolvedArea"
Cohesion: 0.29
Nodes (6): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, resolvePlaceArea(), resolvePlacePhotos(), withResolvedArea()

### Community 102 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 104 - "appRequest"
Cohesion: 0.26
Nodes (9): placeEditsApi(), PlaceEdits, PlaceEditStore, readPlaceEdits(), savePlaceEdits(), syncPlaceEdits(), withPlaceEdits(), appRequest() (+1 more)

### Community 106 - "Partidas de transporte — Europa"
Cohesion: 0.50
Nodes (3): Partidas de transporte — Europa, Pendências e limites, Serviços consultados

### Community 107 - "mountMap"
Cohesion: 0.27
Nodes (11): mountMap(), syncDistantCities(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel() (+3 more)

### Community 108 - "Fotos de interiores — Archives nationales e Carnavalet"
Cohesion: 0.50
Nodes (3): Fotos de interiores — Archives nationales e Carnavalet, par-archives-nationales, par-carnavalet

### Community 109 - "map/overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 110 - "Roma — recomendações do Airbnb"
Cohesion: 0.50
Nodes (3): Monte Ciocci (`rom-monte-ciocci`), Roma — recomendações do Airbnb, Valle Aurelia (`rom-valle-aurelia`)

### Community 111 - "airbnb-search.test.ts"
Cohesion: 0.20
Nodes (9): airbnbSnapshot(), bookingReference(), enrichBookingHotels(), mapPool(), readRankingRequest(), validateRankingHotels(), details, params (+1 more)

### Community 112 - "Cafés próximos à Casa do Gui — 2026-09-28"
Cohesion: 0.40
Nodes (4): Boulangerie Eden — par-boulangerie-eden-noisy, Cafés próximos à Casa do Gui — 2026-09-28, Candidatos não adicionados, Le Jean Jaurès — par-le-jean-jaures-noisy

### Community 113 - "Bouillon Pigalle e transporte do Louvre — 29/09/2026"
Cohesion: 0.50
Nodes (3): Bouillon Pigalle e transporte do Louvre — 29/09/2026, Bouillon Pigalle em 08/10, Louvre → Lafayette Gourmet em 05/10

### Community 114 - "map/controls.ts"
Cohesion: 0.31
Nodes (8): setAmenity(), attachMapControls(), relabel(), uiLocale(), compassHeading(), CompassSample, locationControl(), cameraMotion

### Community 115 - "view-state.ts"
Cohesion: 0.31
Nodes (8): activeSectionKey(), cityInOsrmScope(), dayKey(), dayOpen(), FocusMark, SectionHit, SeenPin, shouldRefit()

### Community 117 - "Revisão do roteiro e refeições de 12/10"
Cohesion: 0.29
Nodes (6): Auditoria aplicada, Café da tarde em Veneza, Compras de 11/10, Jantar e orçamento, Revisão do roteiro e refeições de 12/10, Validação

### Community 118 - "icon"
Cohesion: 0.18
Nodes (19): Locale, iconButton(), IconButtonSize, IconButtonVariant, iconLink(), onSegmentKey(), segmentButtons(), segmented() (+11 more)

### Community 119 - "Milão — 11/10/2026"
Cohesion: 0.29
Nodes (6): Bilhete, Cobertura do passeio, Google Maps: notas e capas, M3: estações e serviços de domingo, Milão — 11/10/2026, Validação

### Community 120 - "search.ts"
Cohesion: 0.16
Nodes (18): mountSearch(), searchMatches(), searchSchedule(), searchText(), Suggestion, TravelCity, MapHandle, placePin() (+10 more)

### Community 121 - "Refeições da Itália e de Portugal — 3/10/2026"
Cohesion: 0.33
Nodes (5): Fontes de La Spezia, Lisboa e voo de retorno, Refeições da Itália e de Portugal — 3/10/2026, Revisão por dia, Roma

### Community 122 - "Roma → Lisboa — 18/10/2026"
Cohesion: 0.33
Nodes (5): Documentos fornecidos, Lanche e táxis, Margens do plano, Pino de Fiumicino, Roma → Lisboa — 18/10/2026

### Community 123 - "vite-app-cache.ts"
Cohesion: 0.47
Nodes (4): ref_node_crypto, appCache(), cacheWorker(), worker()

### Community 124 - "Itália — atualização a partir do Notion"
Cohesion: 0.40
Nodes (4): Compromissos e preços, Identidade e posição dos pinos, Itália — atualização a partir do Notion, Transporte no mapa

### Community 125 - "Manhã de 14/10 e depósito de malas em Roma"
Cohesion: 0.40
Nodes (4): Manhã de 14/10 e depósito de malas em Roma, Milão, quarta-feira 14/10/2026, Stow Your Bags — Colosseo, Validação

### Community 126 - "getTravelCity"
Cohesion: 0.50
Nodes (6): getTravelCity(), googleMapsUrl(), getTripCity(), placeCity(), resolveHref(), weatherCity()

### Community 127 - "maplibre-perf.ts"
Cohesion: 0.70
Nodes (3): MAPLIBRE_PERF, maplibreFade(), labelFadeDuration()

### Community 128 - "Lisboa — retorno de 20/10/2026"
Cohesion: 0.50
Nodes (3): Lisboa — retorno de 20/10/2026, Plano vigente: levar lanches, Priority Pass do Ultravioleta e janela conservadora

### Community 132 - "walk-distance.ts"
Cohesion: 0.52
Nodes (5): extraWalkMeters(), formatWalk(), isExtraWalkNote(), polylineMeters(), walkedMeters()

### Community 133 - "Primark em Milão — consulta de 06/10/2026"
Cohesion: 0.50
Nodes (3): Identidade, endereço e pino, Possibilidade no primeiro dia (11/10), Primark em Milão — consulta de 06/10/2026

## Knowledge Gaps
- **612 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+607 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **20 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `index.ts`, `hotels.ts`, `dates.ts`, `amenities.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `export.ts`, `route-planner.ts`, `weather.ts`, `shell.ts`, `travel.ts`, `calendar.ts`, `place-panel.ts`, `hotel-rank.ts`, `transfer-row.ts`, `departures.ts`, `icons.ts`, `main.ts`, `parse.ts`, `map.ts`, `hotel-distance.ts`, `mountMap`, `map/controls.ts`, `icon`, `search.ts`?**
  _High betweenness centrality (0.062) - this node is a cross-community bridge._
- **Why does `travelCities` connect `travelCities` to `index.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `travel-areas.test.ts`, `travel.ts`, `calendar.ts`, `check-travel-locations.ts`, `route.ts`, `main.ts`, `parse.ts`, `map.ts`, `travel-guide.ts`, `amenities.test.ts`, `withResolvedArea`, `appRequest`, `icon`, `search.ts`, `getTravelCity`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `el()` connect `pickLocale` to `paint`, `hotels.ts`, `place-panel.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `transfer-row.ts`, `route-planner.ts`, `icons.ts`, `weather.ts`, `icon`, `search.ts`, `shell.ts`, `note-edit.ts`, `hotel-distance.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _612 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `travel-itineraries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.12896405919661733 - nodes in this community are weakly interconnected._
- **Should `index.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14333333333333334 - nodes in this community are weakly interconnected._
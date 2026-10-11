# Graph Report - travel-boss-offline-public  (2026-10-11)

## Corpus Check
- 350 files · ~574,747 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2250 nodes · 5586 edges · 142 communities (118 shown, 24 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 27 edges (avg confidence: 0.63)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `0c2dcef6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- overlays.ts
- travel-itineraries.ts
- paint
- weather-source.ts
- hotels.ts
- travel-visit.ts
- dates.ts
- fetch-travel-polygons.py
- view-state.ts
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
- tripChecklist
- weather.ts
- Travel Boss
- scripts
- basemap-style.ts
- pickLocale
- Travel Boss — plano de paridade com o portfólio + polimento de UI
- shell.ts
- Hotel priorities
- hotel-scripts.d.ts
- Paris
- store.ts
- Travel Boss
- Milão — 11–14 de outubro de 2026
- rating.ts
- calendar.ts
- travel-categories.ts
- walk-route.ts
- parse.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- ui/controls.ts
- theme.ts
- vite.config.ts
- transfer-row.ts
- Alimentação em Versalhes — pesquisa de 28/09/2026
- Mercado de 10/10 — consulta em 28/09/2026
- route-draw.ts
- grande-epicerie-2026-10-06.md
- map.ts
- louvre/README.md
- departures.ts
- pin-visual.ts
- search.ts
- open-now.ts
- baguetts-moliere-location-2026-09-28.md
- hotel-ring.ts
- hotel-dates.ts
- hotel-search-match.mjs
- Trens da Itália — 12 a 16/10/2026
- route.ts
- main.ts
- router.ts
- Mangez et cassez-vous em Paris — 29/09/2026
- travel-italy-rail.ts
- hotel-search.mjs
- mountMap
- expandTimelineTransferParts
- vaudeville-2026-09-29.md
- Flan, croque-monsieur e crème brûlée
- links.ts
- McDonald's perto do roteiro de Paris — 28/09/2026
- opera-mercado-2026-10-10.md
- hotel-distance.ts
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
- checklist.ts
- cedric-grolet-meurice-2026-10-10.md
- 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)
- Caminhadas de 6, 8 e 10/10 — estudo de alternativas
- Auditoria de localização de Paris — 28/09/2026
- note-edit.ts
- Richelieu e brunch de 10/10 — consulta em 28/09/2026
- directions.ts
- index.ts
- tooltip.ts
- Jardins de Versalhes — subpontos, 28/09/2026
- travel-photos.test.ts
- check-travel-locations.ts
- maps-app.ts
- checklists/README.md
- travel.ts
- Versalhes — saída às 8h30 e croissants com Guilherme
- paris-monoprix-les-champs-2026-10-10.md
- appRequest
- Traçado Paris–Milão — 11/10/2026
- Partidas de transporte — Europa
- amenities.ts
- Fotos de interiores — Archives nationales e Carnavalet
- travel-itineraries.test.ts
- Roma — recomendações do Airbnb
- paris-2026-10-10-early-lunch.md
- Cafés próximos à Casa do Gui — 2026-09-28
- Bouillon Pigalle e transporte do Louvre — 29/09/2026
- place-panel.ts
- travelCities
- brioche-doree-chaussee-antin-2026-09-29.md
- Revisão do roteiro e refeições de 12/10
- Comentários dos passeios realizados — 10/10/2026
- Milão — 11/10/2026
- Paris — 10/10/2026: saída às 10h30, canal sem République e Torre Eiffel
- Refeições da Itália e de Portugal — 3/10/2026
- Roma → Lisboa — 18/10/2026
- ref_node_fs
- Itália — atualização a partir do Notion
- Manhã de 14/10 e depósito de malas em Roma
- price.ts
- Cesarino Via Pattari — fotos e pedido de 11/10/2026
- Lisboa — retorno de 20/10/2026
- lisboa-mercado-calhariz-2026-10-03.md
- pouletos-paris-2026-10-02.md
- weather-coverage-2026-10-03.md
- trackpad.ts
- Primark em Milão — consulta de 06/10/2026
- maps-links-2026-10-06.md
- Versalhes — entrada ao meio-dia, revisão de 08/10/2026
- paris-post-disney-2026-10-08.md
- Rede lenta e disponibilidade offline — 11/10/2026
- offline-icons-2026-10-11.md
- map/overview.ts
- subpoints.ts
- Paris — 10/10/2026: Vendôme, Cédric, Marais, barco e Torre

## God Nodes (most connected - your core abstractions)
1. `pickLocale()` - 125 edges
2. `paint()` - 99 edges
3. `el()` - 89 edges
4. `icon()` - 74 edges
5. `mountTrip()` - 52 edges
6. `mountCity()` - 48 edges
7. `mountHotels()` - 43 edges
8. `Locale` - 34 edges
9. `parseTrip()` - 32 edges
10. `iconButton()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `hotelRankingContext()` --calls--> `rankingTargets()`  [EXTRACTED]
  src/data/hotel-ranking-context.ts → scripts/hotel-ranking.mjs
- `weatherApi()` --calls--> `pastWeatherDate()`  [EXTRACTED]
  vite.config.ts → src/trip/weather-source.ts
- `resolvedPlaces()` --indirect_call--> `withResolvedArea()`  [INFERRED]
  src/data/travel-areas.test.ts → src/data/travel.ts
- `load()` --indirect_call--> `url()`  [INFERRED]
  src/trip/checklist.ts → src/platform/offline-routes.ts
- `save()` --indirect_call--> `url()`  [INFERRED]
  src/trip/checklist.ts → src/platform/offline-routes.ts

## Import Cycles
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 3-file cycle: `src/data/travel-italy-rail.ts -> src/data/travel-itinerary-legs.ts -> src/data/travel.ts -> src/data/travel-italy-rail.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (142 total, 24 thin omitted)

### Community 0 - "overlays.ts"
Cohesion: 0.20
Nodes (11): Area, drawableRings(), modelFor(), fadeMs(), mountPlaceOverlays(), paint(), Hit, placeRecord() (+3 more)

### Community 1 - "travel-itineraries.ts"
Cohesion: 0.15
Nodes (15): computeDayBudget(), computeTripBudget(), DayBudget, itinerariesByCitySlug, ItineraryArrivalOption, ItinerarySlot, moneyTypicalEur(), parisD1AfterBase (+7 more)

### Community 2 - "paint"
Cohesion: 0.15
Nodes (38): daysOnDate(), tripDates(), clearStopCurrent(), mountTrip(), applyQuery(), armTransfer(), catalogPins(), datedPoints() (+30 more)

### Community 3 - "weather-source.ts"
Cohesion: 0.14
Nodes (26): checklists, publishedPlaceEdits(), publishedRequest(), reply(), trip(), trips, Ensemble, extendForecast() (+18 more)

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (36): hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey (+28 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (32): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+24 more)

### Community 6 - "dates.ts"
Cohesion: 0.22
Nodes (18): capitalized(), formatDayTitle(), formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween() (+10 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "view-state.ts"
Cohesion: 0.29
Nodes (9): activeSectionKey(), cityInOsrmScope(), dayKey(), dayOpen(), FocusMark, SectionHit, SeenPin, shouldRefit() (+1 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.05
Nodes (63): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+55 more)

### Community 10 - "places.ts"
Cohesion: 0.09
Nodes (45): categoryMaterialName(), placeCategoriesOffByDefault, placeCategoryOrder, placePinMaterialName(), dayPrimaryRoutePlaceIds(), ItineraryDay, ItineraryStop, subcategoryLabel() (+37 more)

### Community 11 - "mount.ts"
Cohesion: 0.12
Nodes (34): averageDateBudget(), BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails(), isOpenSlot() (+26 more)

### Community 12 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (25): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType(), extract() (+17 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (36): BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility(), airbnbQuality() (+28 more)

### Community 14 - "export.ts"
Cohesion: 0.24
Nodes (16): PERIODS, copyTrip(), dayToMarkdown(), downloadTrip(), hardBreaks(), pushDay(), pushStop(), tripToHtml() (+8 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.14
Nodes (27): ItineraryStation, ItineraryTransitHop, ride(), WALK_CONNECTOR_MIN_M, nearestStation(), sliceLinePath(), stationById(), asCoord() (+19 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.09
Nodes (53): apply(), barActive(), beginLocate(), CITY_FAR_KM, createRouteButton(), drawRoutePreview(), formatRouteDistance(), formatRouteDuration() (+45 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "travel-areas.test.ts"
Cohesion: 0.08
Nodes (36): installOsmAreas(), loadOsmAreas(), Lookup, osmAreaFor(), osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue (+28 more)

### Community 19 - "tripChecklist"
Cohesion: 0.44
Nodes (9): tripChecklist(), addItem(), edit(), sync(), count(), load(), save(), scheduleFields() (+1 more)

### Community 20 - "weather.ts"
Cohesion: 0.12
Nodes (30): fillWeather(), paintWeather(), refreshWeather(), refreshWeatherByHand(), cache, dayWeather(), Entry, failureKind (+22 more)

### Community 21 - "Travel Boss"
Cohesion: 0.05
Nodes (32): Arquitetura, Catálogo de lugares, Comandos, Como um LLM edita um roteiro, Contrato, Guia da cidade (Mercado e Comidas), Instruções compartilhadas (Codex e Claude Code), Publicação estática (+24 more)

### Community 22 - "scripts"
Cohesion: 0.05
Nodes (38): @fontsource/geist-sans, @fontsource/lekton, maplibre-gl, @maplibre/maplibre-gl-leaflet, dependencies, @fontsource/geist-sans, @fontsource/lekton, leaflet (+30 more)

### Community 23 - "basemap-style.ts"
Cohesion: 0.09
Nodes (27): applyBrightBasemap(), BASEMAP_THEME_EVENT, BasemapTheme, BasemapTint, bindBrightBasemap(), CANVAS_FALLBACK, HIDDEN_HIGHWAY_INDICATOR_LAYERS, hideBasemapClutter() (+19 more)

### Community 24 - "pickLocale"
Cohesion: 0.11
Nodes (39): pickLocale(), tripTabs(), openSlotRow(), railHalf(), iconLink(), openDialog(), el(), openVideo() (+31 more)

### Community 25 - "Travel Boss — plano de paridade com o portfólio + polimento de UI"
Cohesion: 0.09
Nodes (21): Contexto, Contrato para quem executa (Sonnet, Grok ou outro agente), Fase 0 — Preparação (bloqueante), Fase 10 — Planejador de rota e localização, Fase 11 — Passe de motion e hover, Fase 12 — Pipeline do catálogo (porte do portfólio), Fase 13 — Performance, Fase 14 — Tema escuro (por último, pedido do usuário) (+13 more)

### Community 26 - "shell.ts"
Cohesion: 0.17
Nodes (19): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), toggleTheme(), isMobile() (+11 more)

### Community 27 - "Hotel priorities"
Cohesion: 0.17
Nodes (10): Airbnb gratuito (busca local), Cartographic boundaries, Evidence and scoring, Hotel priorities, Polígonos e transições visuais (versão 8), Recuperação da conexão com a Azul, Revisão de segurança por zona (20/09/2026), Rome coverage review — 2026-09-20 (+2 more)

### Community 29 - "Paris"
Cohesion: 0.07
Nodes (27): Dia 1 — Dom 11/10 · Chegada, Duomo e Galleria, Dia 1 — Dom 18/10 · Chegada a Lisboa, Dia 1 — Dom 4/10 · Chegada, Torre Eiffel ao pôr do sol e jantar no Margaux, Dia 1 — Qua 14/10 · Chegada a La Spezia, Dia 1 — Sex 16/10 · Chegada, Coliseu, Fórum e Palatino, Dia 2 — Qui 15/10 · Cinque Terre, Dia 2 — Seg 12/10 · Bate-volta a Veneza, Dia 2 — Seg 19/10 · Lisboa (+19 more)

### Community 30 - "store.ts"
Cohesion: 0.30
Nodes (12): categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readCategoryFilter(), readGroups(), readPeriods() (+4 more)

### Community 31 - "Travel Boss"
Cohesion: 0.33
Nodes (5): Artefato, Catálogo, Publicação, Rodar, Travel Boss

### Community 32 - "Milão — 11–14 de outubro de 2026"
Cohesion: 0.50
Nodes (3): Fontes e limites, Milão — 11–14 de outubro de 2026, Rota

### Community 34 - "rating.ts"
Cohesion: 0.53
Nodes (7): clampRating(), formatRating(), ratingAria(), ratingSummary(), starParts, starRating(), scoreNode()

### Community 35 - "calendar.ts"
Cohesion: 0.17
Nodes (16): currentTripDate(), DateCity, dateCityNames(), fold(), mentionsCity(), nearestTripDate(), scheduleDays(), titleDate() (+8 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.09
Nodes (27): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+19 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.06
Nodes (57): decodeFootShape(), footFallback(), waitForSlot(), abortError(), acquire(), bindUser(), cached(), execute() (+49 more)

### Community 38 - "parse.ts"
Cohesion: 0.10
Nodes (33): publicTrip(), publicTrips(), trip(), changedStopKeys(), stopFingerprint(), trip(), visitStops(), TEXT (+25 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.06
Nodes (41): cinqueTerreRegional, milanMetro3, romeMetroB, veniceVaporetto1, day1, day1AfterBase, day1Cdg, day2 (+33 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "ui/controls.ts"
Cohesion: 0.33
Nodes (9): IconButtonSize, IconButtonVariant, onSegmentKey(), segmentButtons(), segmented(), segmentedMove(), segmentOn(), syncSegmented() (+1 more)

### Community 42 - "theme.ts"
Cohesion: 0.25
Nodes (15): activeTheme(), bootTheme(), CANVAS, canvasColor(), meta(), parseTheme(), publish(), readStoredTheme() (+7 more)

### Community 43 - "vite.config.ts"
Cohesion: 0.13
Nodes (22): hotelSearchVite(), checklistApi(), applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest() (+14 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.25
Nodes (17): formatLegDuration(), legDisplayLabel(), legLineColor(), legLabel(), durationMinutes(), identityOf(), isTrainRide(), isTransferPart() (+9 more)

### Community 45 - "Alimentação em Versalhes — pesquisa de 28/09/2026"
Cohesion: 0.12
Nodes (15): Alimentação em Versalhes — pesquisa de 28/09/2026, Almoço em Versalhes, Aplicação ao roteiro e reentrada (28/09), Boulangerie Castellane, Café da manhã e compra para levar em Paris, Café da tarde, Carré aux Crêpes, Comida no domínio (+7 more)

### Community 46 - "Mercado de 10/10 — consulta em 28/09/2026"
Cohesion: 0.50
Nodes (3): Histórico do planejamento anterior, Mercado de 10/10 — consulta em 28/09/2026, Troca pelo Auchan — consulta em 08/10/2026

### Community 47 - "route-draw.ts"
Cohesion: 0.21
Nodes (17): cityByPlace, drawRouteSegments(), paintRouteFocus(), RoutePointer, safeColor(), walkColor(), isIntercityRoute(), nearTransfer() (+9 more)

### Community 49 - "map.ts"
Cohesion: 0.22
Nodes (12): KINDS, MAPLIBRE_PERF, maplibreFade(), RouteEntry, MapCityPin, MapOverviewCity, MapPadding, MapPin (+4 more)

### Community 51 - "departures.ts"
Cohesion: 0.21
Nodes (12): clock(), DepartureTime, departureTimes(), fold(), matches(), minutes(), service, train (+4 more)

### Community 52 - "pin-visual.ts"
Cohesion: 0.22
Nodes (13): placePinIconHtml(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel, samePinModel(), starSvg() (+5 more)

### Community 53 - "search.ts"
Cohesion: 0.16
Nodes (18): mountSearch(), searchMatches(), searchSchedule(), searchText(), Suggestion, Shell, MapHandle, placePin() (+10 more)

### Community 54 - "open-now.ts"
Cohesion: 0.35
Nodes (9): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+1 more)

### Community 56 - "hotel-ring.ts"
Cohesion: 0.29
Nodes (9): capture(), clearSearchRing(), ink(), LeafletNs, loadLeaflet(), markContextMarkers(), paint(), SearchRing (+1 more)

### Community 57 - "hotel-dates.ts"
Cohesion: 0.46
Nodes (6): addIsoDays(), cityStayFromTrips(), defaultStayDates(), hashStayDates(), StayRange, validStayRange()

### Community 58 - "hotel-search-match.mjs"
Cohesion: 0.18
Nodes (24): ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge(), bookingPhotoUrl() (+16 more)

### Community 60 - "route.ts"
Cohesion: 0.12
Nodes (28): flightCurve(), Point, DatedDay, drawTripRoutes(), routeDeps(), walkPoints(), cityByPlace, intercityHops() (+20 more)

### Community 61 - "main.ts"
Cohesion: 0.11
Nodes (25): setDocumentTitle(), Locale, applyChrome(), cityLabel(), cityNav, citySource(), clearMap(), dispose() (+17 more)

### Community 63 - "router.ts"
Cohesion: 0.26
Nodes (13): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+5 more)

### Community 64 - "Mangez et cassez-vous em Paris — 29/09/2026"
Cohesion: 0.40
Nodes (4): Critério de localização, Horário da unidade Taitbout, Mangez et cassez-vous em Paris — 29/09/2026, Preço e fotos

### Community 65 - "travel-italy-rail.ts"
Cohesion: 0.10
Nodes (16): cinqueTerreNotionPlaces, romeNotionPlaces, veniceNotionPlaces, veronaNotionPlaces, italyRailCities, italyRailLegs, laSpeziaStation, venice (+8 more)

### Community 66 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (27): parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT (+19 more)

### Community 67 - "mountMap"
Cohesion: 0.17
Nodes (20): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+12 more)

### Community 68 - "expandTimelineTransferParts"
Cohesion: 0.36
Nodes (10): estimateLegDurationMin(), expandTimelineTransferParts(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin(), walkMinutes() (+2 more)

### Community 70 - "Flan, croque-monsieur e crème brûlée"
Cohesion: 0.22
Nodes (6): Fotos e notas das padarias premiadas, Croissants premiados do Grand Paris, Croque-monsieur: recomendação editorial, Crème brûlée: recomendação editorial, Flan: categoria profissional, 2024–2026, Flan, croque-monsieur e crème brûlée

### Community 72 - "McDonald's perto do roteiro de Paris — 28/09/2026"
Cohesion: 0.22
Nodes (7): Disney: estabelecimento novo e limites do levantamento, McDonald's perto do roteiro de Paris — 28/09/2026, Opções e encaixes, Prioridade sugerida, ainda sem decisão do usuário, Fotos e avaliações — conferência em 28/09/2026, McDonald's no mapa de Paris — seleção de 28/09/2026, Pesquisa e limites

### Community 74 - "hotel-distance.ts"
Cohesion: 0.25
Nodes (11): googleDirectionsUrl(), row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres() (+3 more)

### Community 75 - "Os 12 critérios"
Cohesion: 0.15
Nodes (13): 10. Orçamento diário por pessoa com aviso, sugestão e exceções — ❌, 11. Decisões do usuário lembradas pelo LLM — ❌, 12. Horário de funcionamento e melhor período — 🟡, 1. Edição colaborativa usuário + LLM sem conflito — 🟡, 2. Cidade e viagem como duas áreas — ✅ (guias só em Paris), 3. Parada com duração, gasto, descrição e sub-pontos — 🟡, 4. Clima por período definido pelas paradas — 🟡, 5. Documentação para o LLM (editar, manter padrão, receber feature) — 🟡 (+5 more)

### Community 76 - "Pompidou e Montmartre — 8/10/2026"
Cohesion: 0.22
Nodes (7): 8/10/2026 — Canal Saint-Martin e Chez Janou, Sentier entre Pompidou e Montmartre — consulta em 28/09/2026, Ajuste de transporte — 28/09/2026, Comida destacada no roteiro — 08/10/2026, Coordenadas OSM, Pompidou e Montmartre — 8/10/2026, Pontos próprios — 08/10/2026

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

### Community 86 - "checklist.ts"
Cohesion: 0.36
Nodes (7): ChecklistEdit, ChecklistItem, compareTaskSchedule(), editChecklist(), isItem(), item, validDate()

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
Nodes (36): canEdit, escapeHtml(), inline(), InlineNodeOptions, inlineNodes(), InlinePart, inlineWithLinks(), MarkSpan (+28 more)

### Community 93 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 94 - "index.ts"
Cohesion: 0.13
Nodes (20): cityGuide, FoodMeal, foodMeals, GuideItem, guides, MarketShelf, marketShelves, parisGuide (+12 more)

### Community 95 - "tooltip.ts"
Cohesion: 0.36
Nodes (9): isTruncated(), mountTooltip(), ownsTooltip(), TOOLTIP_SHOW_MS, TOOLTIP_WARM_MS, tooltipHost(), tooltipPlacement(), tooltipShowDelay() (+1 more)

### Community 96 - "Jardins de Versalhes — subpontos, 28/09/2026"
Cohesion: 0.29
Nodes (6): Ajuste do dia para preservar o pôr do sol, Coordenadas OSM, Critério e fontes, Fotos e descrições do card, Jardins de Versalhes — subpontos, 28/09/2026, Ordem e duração

### Community 97 - "travel-photos.test.ts"
Cohesion: 0.32
Nodes (4): photosForPlaceId(), ALLOWED_HOSTS, TravelPhoto, resolvePlacePhotos()

### Community 98 - "check-travel-locations.ts"
Cohesion: 0.27
Nodes (9): counts, rows, trip, auditPin(), destinationPin(), distanceMeters(), Pin, evidence (+1 more)

### Community 99 - "maps-app.ts"
Cohesion: 0.48
Nodes (4): googleMapsAppTarget(), SHORT_MAPS_URLS, mapsAppUrl(), mountMapsAppLinks()

### Community 101 - "travel.ts"
Cohesion: 0.08
Nodes (22): PlaceCategory, favoritePlaceIds(), favoritePlaces(), laSpeziaFoodPlaces, localTravelCities, NEAR_BNF, Branch, branches (+14 more)

### Community 102 - "Versalhes — saída às 8h30 e croissants com Guilherme"
Cohesion: 0.33
Nodes (5): Jardins e reentrada, Ponto e trajeto da Entrada A, Sanduíches e orçamento, Transportes e compromisso do palácio, Versalhes — saída às 8h30 e croissants com Guilherme

### Community 104 - "appRequest"
Cohesion: 0.26
Nodes (9): placeEditsApi(), PlaceEdits, PlaceEditStore, readPlaceEdits(), savePlaceEdits(), syncPlaceEdits(), withPlaceEdits(), appRequest() (+1 more)

### Community 106 - "Partidas de transporte — Europa"
Cohesion: 0.50
Nodes (3): Partidas de transporte — Europa, Pendências e limites, Serviços consultados

### Community 107 - "amenities.ts"
Cohesion: 0.09
Nodes (33): only, amenitiesIn(), Amenity, AMENITY_RADIUS_M, amenityMapsUrl(), amenityPin(), Box, boxesOverlap() (+25 more)

### Community 108 - "Fotos de interiores — Archives nationales e Carnavalet"
Cohesion: 0.50
Nodes (3): Fotos de interiores — Archives nationales e Carnavalet, par-archives-nationales, par-carnavalet

### Community 109 - "travel-itineraries.test.ts"
Cohesion: 0.24
Nodes (6): dayRoutePlaceIds(), parisItinerary, hopName(), legsForDay(), getTransitLine(), transitLineForPlace()

### Community 110 - "Roma — recomendações do Airbnb"
Cohesion: 0.50
Nodes (3): Monte Ciocci (`rom-monte-ciocci`), Roma — recomendações do Airbnb, Valle Aurelia (`rom-valle-aurelia`)

### Community 112 - "Cafés próximos à Casa do Gui — 2026-09-28"
Cohesion: 0.40
Nodes (4): Boulangerie Eden — par-boulangerie-eden-noisy, Cafés próximos à Casa do Gui — 2026-09-28, Candidatos não adicionados, Le Jean Jaurès — par-le-jean-jaures-noisy

### Community 113 - "Bouillon Pigalle e transporte do Louvre — 29/09/2026"
Cohesion: 0.50
Nodes (3): Bouillon Pigalle e transporte do Louvre — 29/09/2026, Bouillon Pigalle em 08/10, Louvre → Lafayette Gourmet em 05/10

### Community 114 - "place-panel.ts"
Cohesion: 0.14
Nodes (26): Locale, travelUi, aiBadge(), aiSuggestionTip(), TABS, iconButton(), icon(), IconName (+18 more)

### Community 115 - "travelCities"
Cohesion: 0.15
Nodes (20): getTravelCity(), googleMapsUrl(), lineBrandColor(), travelCities, getTripCity(), placeCity(), catalogGeometry(), catalogLegByPair (+12 more)

### Community 117 - "Revisão do roteiro e refeições de 12/10"
Cohesion: 0.29
Nodes (6): Auditoria aplicada, Café da tarde em Veneza, Compras de 11/10, Jantar e orçamento, Revisão do roteiro e refeições de 12/10, Validação

### Community 119 - "Milão — 11/10/2026"
Cohesion: 0.29
Nodes (6): Bilhete, Cobertura do passeio, Google Maps: notas e capas, M3: estações e serviços de domingo, Milão — 11/10/2026, Validação

### Community 120 - "Paris — 10/10/2026: saída às 10h30, canal sem République e Torre Eiffel"
Cohesion: 0.40
Nodes (4): Fotos dos pontos do canal, Paris — 10/10/2026: saída às 10h30, canal sem République e Torre Eiffel, Torre, barco e orçamento, Transportes

### Community 121 - "Refeições da Itália e de Portugal — 3/10/2026"
Cohesion: 0.33
Nodes (5): Fontes de La Spezia, Lisboa e voo de retorno, Refeições da Itália e de Portugal — 3/10/2026, Revisão por dia, Roma

### Community 122 - "Roma → Lisboa — 18/10/2026"
Cohesion: 0.33
Nodes (5): Documentos fornecidos, Lanche e táxis, Margens do plano, Pino de Fiumicino, Roma → Lisboa — 18/10/2026

### Community 123 - "ref_node_fs"
Cohesion: 0.24
Nodes (6): ref_node_crypto, ref_node_fs, appCache(), cacheWorker(), worker(), photosByPlaceId

### Community 124 - "Itália — atualização a partir do Notion"
Cohesion: 0.40
Nodes (4): Compromissos e preços, Identidade e posição dos pinos, Itália — atualização a partir do Notion, Transporte no mapa

### Community 125 - "Manhã de 14/10 e depósito de malas em Roma"
Cohesion: 0.40
Nodes (4): Manhã de 14/10 e depósito de malas em Roma, Milão, quarta-feira 14/10/2026, Stow Your Bags — Colosseo, Validação

### Community 126 - "price.ts"
Cohesion: 0.39
Nodes (6): LEVEL_LABEL, Money, priceAria(), priceLevel, priceLevelOf(), placeMeta()

### Community 127 - "Cesarino Via Pattari — fotos e pedido de 11/10/2026"
Cohesion: 0.50
Nodes (3): Cesarino Via Pattari — fotos e pedido de 11/10/2026, Fotos, Pedido sugerido e orçamento

### Community 128 - "Lisboa — retorno de 20/10/2026"
Cohesion: 0.50
Nodes (3): Lisboa — retorno de 20/10/2026, Plano vigente: levar lanches, Priority Pass do Ultravioleta e janela conservadora

### Community 132 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 133 - "Primark em Milão — consulta de 06/10/2026"
Cohesion: 0.40
Nodes (4): Identidade, endereço e pino, Inclusão depois da Galleria — 11/10/2026, Possibilidade no primeiro dia (11/10), Primark em Milão — consulta de 06/10/2026

### Community 137 - "Rede lenta e disponibilidade offline — 11/10/2026"
Cohesion: 0.40
Nodes (4): Comportamento, Limites do mapa, Rede lenta e disponibilidade offline — 11/10/2026, Verificação

### Community 139 - "map/overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 141 - "subpoints.ts"
Cohesion: 0.38
Nodes (8): attachSubPointNotes(), fold(), matchSubPoint(), noteTitle(), stripNoteTitle(), SubPointNote, subs, walkOrder()

### Community 145 - "Paris — 10/10/2026: Vendôme, Cédric, Marais, barco e Torre"
Cohesion: 0.50
Nodes (3): Fontes e limites, Paris — 10/10/2026: Vendôme, Cédric, Marais, barco e Torre, Transportes

## Knowledge Gaps
- **641 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+636 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **24 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `dates.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `export.ts`, `route-planner.ts`, `tripChecklist`, `weather.ts`, `shell.ts`, `rating.ts`, `calendar.ts`, `walk-route.ts`, `parse.ts`, `hotel-rank.ts`, `transfer-row.ts`, `map.ts`, `departures.ts`, `search.ts`, `main.ts`, `mountMap`, `hotel-distance.ts`, `checklist.ts`, `index.ts`, `travel.ts`, `amenities.ts`, `place-panel.ts`, `price.ts`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `travelCities` connect `travelCities` to `overlays.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `travel-areas.test.ts`, `pickLocale`, `calendar.ts`, `walk-route.ts`, `parse.ts`, `route-draw.ts`, `map.ts`, `search.ts`, `route.ts`, `main.ts`, `index.ts`, `travel-photos.test.ts`, `check-travel-locations.ts`, `maps-app.ts`, `travel.ts`, `appRequest`, `amenities.ts`?**
  _High betweenness centrality (0.035) - this node is a cross-community bridge._
- **Why does `icon()` connect `place-panel.ts` to `paint`, `hotels.ts`, `travel-stay-heatmap.ts`, `places.ts`, `mount.ts`, `route-planner.ts`, `pickLocale`, `shell.ts`, `rating.ts`, `parse.ts`, `ui/controls.ts`, `transfer-row.ts`, `map.ts`, `pin-visual.ts`, `search.ts`, `main.ts`, `hotel-distance.ts`, `amenities.ts`, `price.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _641 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.14935988620199148 - nodes in this community are weakly interconnected._
- **Should `weather-source.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.135632183908046 - nodes in this community are weakly interconnected._
- **Should `hotels.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.08292682926829269 - nodes in this community are weakly interconnected._
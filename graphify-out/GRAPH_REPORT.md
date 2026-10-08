# Graph Report - travel-boss-public-oct10  (2026-10-08)

## Corpus Check
- 337 files · ~563,581 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2186 nodes · 5443 edges · 136 communities (113 shown, 23 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.62)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `df432bc6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- hotel-search-match.mjs
- travel-itineraries.ts
- paint
- rome-hotel-neighborhoods.ts
- hotels.ts
- travel-visit.ts
- dates.ts
- fetch-travel-polygons.py
- amenities.ts
- travel-stay-heatmap.ts
- index.ts
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
- travel-categories.ts
- walk-route.ts
- place-panel.ts
- travel-itinerary-legs.ts
- hotel-rank.ts
- travel-italy-rail.ts
- stay-heatmap.ts
- store.ts
- transfer-row.ts
- Alimentação em Versalhes — pesquisa de 28/09/2026
- Mercado de 10/10 — consulta em 28/09/2026
- departures.ts
- grande-epicerie-2026-10-06.md
- camera.ts
- louvre/README.md
- getTravelCity
- mountMap
- map.ts
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
- published-api.ts
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
- checklist-state.ts
- cedric-grolet-meurice-2026-10-10.md
- 2. Sem foto ou com foto que não carrega — 21 lugares (tarefa E2)
- Caminhadas de 6, 8 e 10/10 — estudo de alternativas
- Auditoria de localização de Paris — 28/09/2026
- note-edit.ts
- Richelieu e brunch de 10/10 — consulta em 28/09/2026
- directions.ts
- LString
- hotel-distance.ts
- Jardins de Versalhes — subpontos, 28/09/2026
- travel-milan.ts
- tooltip.ts
- cssToken
- checklists/README.md
- withResolvedArea
- trackpad.ts
- paris-monoprix-les-champs-2026-10-10.md
- place-edits.ts
- paris-milan-rail.md
- Partidas de transporte — Europa
- maps-app.ts
- Fotos de interiores — Archives nationales e Carnavalet
- map/overview.ts
- Roma — recomendações do Airbnb
- paris-2026-10-10-early-lunch.md
- Cafés próximos à Casa do Gui — 2026-09-28
- Bouillon Pigalle e transporte do Louvre — 29/09/2026
- iconButton
- view-state.ts
- brioche-doree-chaussee-antin-2026-09-29.md
- Revisão do roteiro e refeições de 12/10
- Milão — 11/10/2026
- search.ts
- Refeições da Itália e de Portugal — 3/10/2026
- Roma → Lisboa — 18/10/2026
- vite-app-cache.ts
- Itália — atualização a partir do Notion
- Manhã de 14/10 e depósito de malas em Roma
- walk-distance.ts
- maplibre-perf.ts
- Lisboa — retorno de 20/10/2026
- lisboa-mercado-calhariz-2026-10-03.md
- pouletos-paris-2026-10-02.md
- weather-coverage-2026-10-03.md
- vite-public-trips.ts
- Primark em Milão — consulta de 06/10/2026
- maps-links-2026-10-06.md
- Versalhes — entrada ao meio-dia, revisão de 08/10/2026
- paris-post-disney-2026-10-08.md

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
- `weatherApi()` --calls--> `pastWeatherDate()`  [EXTRACTED]
  vite.config.ts → src/trip/weather-source.ts
- `fetchForecast()` --calls--> `openMeteoQuery()`  [EXTRACTED]
  vite.config.ts → src/trip/weather-source.ts
- `fetchForecast()` --calls--> `parseEnsemble()`  [EXTRACTED]
  vite.config.ts → src/trip/weather-source.ts
- `fetchForecast()` --calls--> `metToEnsemble()`  [EXTRACTED]
  vite.config.ts → src/trip/weather-source.ts

## Import Cycles
- 2-file cycle: `src/data/travel-itineraries.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`
- 2-file cycle: `src/data/travel-photos.ts -> src/data/travel.ts -> src/data/travel-photos.ts`
- 3-file cycle: `src/data/travel-italy-rail.ts -> src/data/travel-itinerary-legs.ts -> src/data/travel.ts -> src/data/travel-italy-rail.ts`
- 3-file cycle: `src/data/travel-itineraries.ts -> src/data/travel-milan-itinerary.ts -> src/data/travel.ts -> src/data/travel-itineraries.ts`

## Communities (136 total, 23 thin omitted)

### Community 0 - "hotel-search-match.mjs"
Cohesion: 0.18
Nodes (24): ACCOMMODATION_TYPES, accommodationType(), ARTICLES, azulHotelUrl(), bestBookingMatch(), bookingHotelUrl(), bookingImageLarge(), bookingPhotoUrl() (+16 more)

### Community 1 - "travel-itineraries.ts"
Cohesion: 0.13
Nodes (21): computeDayBudget(), computeTripBudget(), DayBudget, dayPrimaryRoutePlaceIds(), dayRoutePlaceIds(), itinerariesByCitySlug, ItineraryArrivalOption, ItineraryDay (+13 more)

### Community 2 - "paint"
Cohesion: 0.11
Nodes (50): daysOnDate(), tripDates(), googleDirectionsUrl(), clearStopCurrent(), emptyNotice(), mountTrip(), applyQuery(), armTransfer() (+42 more)

### Community 3 - "rome-hotel-neighborhoods.ts"
Cohesion: 0.15
Nodes (20): hotelRankingContext(), src_data_rome_hotel_boundaries, Boundary, entries, geometry, legacyById, legacyUrbanIds, profiles (+12 more)

### Community 4 - "hotels.ts"
Cohesion: 0.08
Nodes (36): hotelPhotoUrls(), AccommodationType, addDays(), asMsg(), asResult(), Booking, CATEGORIES, CategoryKey (+28 more)

### Community 5 - "travel-visit.ts"
Cohesion: 0.09
Nodes (32): cafeVisit(), CrowdProfile, formatDuration(), formatMoney(), formatMoneyTypical(), formatTicketPromo(), free, L() (+24 more)

### Community 6 - "dates.ts"
Cohesion: 0.26
Nodes (15): formatMonthYear(), formatSpan(), isoParts, monthName(), MONTHS, nightsBetween(), WEEKDAYS, CityBand (+7 more)

### Community 7 - "fetch-travel-polygons.py"
Cohesion: 0.06
Nodes (46): Any, concurrent_futures, contextlib, curl_cffi, json, travel:airbnb:setup, pyairbnb, pyairbnb_details (+38 more)

### Community 8 - "amenities.ts"
Cohesion: 0.09
Nodes (30): ref_node_fs, counts, rows, trip, only, auditPin(), destinationPin(), distanceMeters() (+22 more)

### Community 9 - "travel-stay-heatmap.ts"
Cohesion: 0.12
Nodes (26): BY_CITY, CITY_SEARCH, citySearchName(), hasStayHeat(), LISBON, ROME, searchQuery(), STAY_HEAT_BEST_MIN (+18 more)

### Community 10 - "index.ts"
Cohesion: 0.07
Nodes (59): categoryMaterialName(), placeCategoriesOffByDefault, PlaceCategory, PlaceCategoryMeta, placeCategoryOrder, placePinMaterialName(), favoritePlaces(), googleMapsUrl() (+51 more)

### Community 11 - "mount.ts"
Cohesion: 0.14
Nodes (30): resolveVisit(), averageDateBudget(), BudgetLine, clockMin(), dateBudget, dayPeriods(), freeMinutes(), hopRails() (+22 more)

### Community 12 - "airbnb-search.mjs"
Cohesion: 0.10
Nodes (25): ref_node_child_process, ref_node_path, ref_node_url, ref_node_util, airbnbReady(), airbnbSnapshot(), airbnbType(), extract() (+17 more)

### Community 13 - "hotel-ranking.mjs"
Cohesion: 0.08
Nodes (36): BOOKING_CATEGORIES, bookingEligibility(), CORE_CATEGORIES, extractBookingDetails(), STAFF_MINIMUM, validScore(), accommodationEligibility(), airbnbQuality() (+28 more)

### Community 14 - "export.ts"
Cohesion: 0.12
Nodes (29): applyTripPatch(), blockEnd(), findBlock(), indentOf(), lineList(), parseTripRequest(), readTripPatch(), day (+21 more)

### Community 15 - "itinerary-route.ts"
Cohesion: 0.18
Nodes (26): lineBrandColor(), getTransitLine(), haversineM(), nearestStation(), sliceLinePath(), stationById(), asCoord(), BuildItineraryOptions (+18 more)

### Community 16 - "route-planner.ts"
Cohesion: 0.09
Nodes (53): apply(), barActive(), beginLocate(), CITY_FAR_KM, createRouteButton(), drawRoutePreview(), formatRouteDistance(), formatRouteDuration() (+45 more)

### Community 17 - "compilerOptions"
Cohesion: 0.10
Nodes (20): DOM, DOM.Iterable, ES2023, src, vite/client, compilerOptions, forceConsistentCasingInFileNames, isolatedModules (+12 more)

### Community 18 - "travel-areas.test.ts"
Cohesion: 0.09
Nodes (34): installOsmAreas(), loadOsmAreas(), Lookup, osmAreasReady(), OsmOutline, placeHasOsmArea(), AreaIssue, AreaIssueCode (+26 more)

### Community 19 - "pickLocale"
Cohesion: 0.12
Nodes (37): pickLocale(), fillWeather(), openSlotRow(), railHalf(), iconLink(), openDialog(), el(), louvreMapButton() (+29 more)

### Community 20 - "weather.ts"
Cohesion: 0.13
Nodes (24): cache, dayWeather(), Entry, failureKind, forecastState, keyOf(), loadForecast(), median() (+16 more)

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
Cohesion: 0.21
Nodes (16): clampPaneWidth(), mountShell(), PANE_MIN, paneMax(), readLocale(), resolveLocale(), isMobile(), MOBILE_QUERY (+8 more)

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
Nodes (19): osmAreaFor(), favoritePlaceIds(), laSpeziaFoodPlaces, localTravelCities, NEAR_BNF, Branch, branches, parisMangezEtCassezVous (+11 more)

### Community 35 - "calendar.ts"
Cohesion: 0.20
Nodes (14): currentTripDate(), DateCity, dateCityNames(), DatedDay, fold(), mentionsCity(), nearestTripDate(), scheduleDays() (+6 more)

### Community 36 - "travel-categories.ts"
Cohesion: 0.09
Nodes (26): CATEGORIES_WITH_SUBCATEGORY_PIN_ICONS, categoryColor(), categoryIcon(), categoryIconHtml(), categoryIconSvg, categoryIonIconName, categoryIonName, categoryMaterialIcon (+18 more)

### Community 37 - "walk-route.ts"
Cohesion: 0.10
Nodes (33): decodeFootShape(), footFallback(), waitForSlot(), abortError(), acquire(), bindUser(), cached(), execute() (+25 more)

### Community 38 - "place-panel.ts"
Cohesion: 0.12
Nodes (34): PlaceEdits, Locale, travelUi, icon(), IconName, ICONS, IconSize, mapsIconLink() (+26 more)

### Community 39 - "travel-itinerary-legs.ts"
Cohesion: 0.05
Nodes (45): cinqueTerreRegional, milanMetro3, romeMetroB, veniceVaporetto1, day1, day1AfterBase, day1Cdg, day2 (+37 more)

### Community 40 - "hotel-rank.ts"
Cohesion: 0.16
Nodes (18): BARS, clampScore(), COMPARE, Copy, httpsSources(), MISSING, placeName(), RankInput (+10 more)

### Community 41 - "travel-italy-rail.ts"
Cohesion: 0.14
Nodes (11): cinqueTerreNotionPlaces, romeNotionPlaces, veniceNotionPlaces, veronaNotionPlaces, italyRailCities, italyRailLegs, laSpeziaStation, venice (+3 more)

### Community 42 - "stay-heatmap.ts"
Cohesion: 0.12
Nodes (19): src_data_travel_stay_display, StayZone, leafletMap(), Band, BANDS, cityHasStayHeat(), Copy, DisplayFile (+11 more)

### Community 43 - "store.ts"
Cohesion: 0.30
Nodes (12): categoryFilterKey, groupsKey(), PeriodPrefs, periodsKey(), read(), readCategoryFilter(), readGroups(), readPeriods() (+4 more)

### Community 44 - "transfer-row.ts"
Cohesion: 0.23
Nodes (18): formatLegDuration(), legDisplayLabel(), legLineColor(), TripLeg, TripLegMode, durationMinutes(), identityOf(), isTrainRide() (+10 more)

### Community 45 - "Alimentação em Versalhes — pesquisa de 28/09/2026"
Cohesion: 0.12
Nodes (15): Alimentação em Versalhes — pesquisa de 28/09/2026, Almoço em Versalhes, Aplicação ao roteiro e reentrada (28/09), Boulangerie Castellane, Café da manhã e compra para levar em Paris, Café da tarde, Carré aux Crêpes, Comida no domínio (+7 more)

### Community 46 - "Mercado de 10/10 — consulta em 28/09/2026"
Cohesion: 0.50
Nodes (3): Histórico do planejamento anterior, Mercado de 10/10 — consulta em 28/09/2026, Troca pelo Auchan — consulta em 08/10/2026

### Community 47 - "departures.ts"
Cohesion: 0.23
Nodes (11): clock(), DepartureTime, departureTimes(), fold(), matches(), minutes(), service, train (+3 more)

### Community 49 - "camera.ts"
Cohesion: 0.30
Nodes (12): centralFitRadiusKm(), diffPinIds(), fitMaxZoom(), FitPoint, haversineKm(), medianOf(), paddedCenterOffset(), pinIncludedInCityFit() (+4 more)

### Community 51 - "getTravelCity"
Cohesion: 0.14
Nodes (16): getTravelCity(), ItineraryLegDef, milanDayLegsById, parisDayLegsById, catalogGeometry(), catalogLegByPair, CatalogLegStroke, haversineM() (+8 more)

### Community 52 - "mountMap"
Cohesion: 0.29
Nodes (11): placePinIconHtml(), mountMap(), syncDistantCities(), pinIcon(), cssColor(), pinBox(), pinHtml(), pinModel (+3 more)

### Community 53 - "map.ts"
Cohesion: 0.16
Nodes (16): Box, coveredInsets(), Insets, mergeInsets(), KINDS, RouteEntry, MapCityPin, MapHandle (+8 more)

### Community 54 - "open-now.ts"
Cohesion: 0.35
Nodes (9): CITY_ZONE, clearOpenNowCache(), fetchOpeningHours(), isOpenFromOsmHours(), OpenNow, openNowStatus(), overpassQuery(), session (+1 more)

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
Nodes (27): flightCurve(), Point, drawTripRoutes(), routeDeps(), walkPoints(), cityByPlace, intercityHops(), hop() (+19 more)

### Community 61 - "main.ts"
Cohesion: 0.09
Nodes (36): CityTab, commitRoute(), formatHash(), isTab(), navigationMode(), parseDay(), parseHash(), Route (+28 more)

### Community 63 - "vite.config.ts"
Cohesion: 0.13
Nodes (23): hotelSearchVite(), Ensemble, extendForecast(), historicalWeather(), localStamp(), mergeForecasts(), MET_URL, MetSeries (+15 more)

### Community 64 - "Mangez et cassez-vous em Paris — 29/09/2026"
Cohesion: 0.40
Nodes (4): Critério de localização, Horário da unidade Taitbout, Mangez et cassez-vous em Paris — 29/09/2026, Preço e fotos

### Community 65 - "parse.ts"
Cohesion: 0.10
Nodes (35): travelCities, getTripCity(), placeCity(), trip(), TEXT, tripErrorText(), warningCopyText(), warningCountLabel() (+27 more)

### Community 66 - "hotel-search.mjs"
Cohesion: 0.15
Nodes (27): parseCategoryScores(), AzulConnectionError, azulFetch(), azulHotels(), azulSession(), azulTabHealthy(), azulZone(), BOOKING_EXTRACT (+19 more)

### Community 67 - "published-api.ts"
Cohesion: 0.29
Nodes (10): checklists, publishedPlaceEdits(), publishedRequest(), reply(), trip(), trips, forecastToEnsemble(), openMeteoForecastQuery() (+2 more)

### Community 68 - "expandTimelineTransferParts"
Cohesion: 0.29
Nodes (10): estimateLegDurationMin(), expandTimelineTransferParts(), hopName(), interHopWalkM(), pathLengthM(), stationCountFromPath(), transitMPerMin(), transitPathDurationMin() (+2 more)

### Community 70 - "Flan, croque-monsieur e crème brûlée"
Cohesion: 0.22
Nodes (6): Fotos e notas das padarias premiadas, Croissants premiados do Grand Paris, Croque-monsieur: recomendação editorial, Crème brûlée: recomendação editorial, Flan: categoria profissional, 2024–2026, Flan, croque-monsieur e crème brûlée

### Community 72 - "McDonald's perto do roteiro de Paris — 28/09/2026"
Cohesion: 0.22
Nodes (7): Disney: estabelecimento novo e limites do levantamento, McDonald's perto do roteiro de Paris — 28/09/2026, Opções e encaixes, Prioridade sugerida, ainda sem decisão do usuário, Fotos e avaliações — conferência em 28/09/2026, McDonald's no mapa de Paris — seleção de 28/09/2026, Pesquisa e limites

### Community 74 - "route-draw.ts"
Cohesion: 0.24
Nodes (15): cityByPlace, drawRouteSegments(), paintRouteFocus(), RoutePointer, safeColor(), walkColor(), isIntercityRoute(), nearTransfer() (+7 more)

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
Cohesion: 0.07
Nodes (48): appRequest(), canEdit, tripChecklist(), addItem(), edit(), sync(), count(), load() (+40 more)

### Community 93 - "directions.ts"
Cohesion: 0.31
Nodes (7): directionsMode, DirectionsPoint, haversineM(), MAPS_MAX_POINTS, a, b, far

### Community 94 - "LString"
Cohesion: 0.26
Nodes (8): IndoorStep, LouvreFloor, louvreRoute, louvreSources, IndoorPathPart, louvrePaths, plans, LString

### Community 95 - "hotel-distance.ts"
Cohesion: 0.27
Nodes (10): row(), RowOptions, Copy, directionHref(), dirLink(), distanceSection(), formatMetres(), say() (+2 more)

### Community 96 - "Jardins de Versalhes — subpontos, 28/09/2026"
Cohesion: 0.29
Nodes (6): Ajuste do dia para preservar o pôr do sol, Coordenadas OSM, Critério e fontes, Fotos e descrições do card, Jardins de Versalhes — subpontos, 28/09/2026, Ordem e duração

### Community 97 - "travel-milan.ts"
Cohesion: 0.50
Nodes (4): googleRatings, l(), milanCity, place()

### Community 98 - "tooltip.ts"
Cohesion: 0.36
Nodes (9): isTruncated(), mountTooltip(), ownsTooltip(), TOOLTIP_SHOW_MS, TOOLTIP_WARM_MS, tooltipHost(), tooltipPlacement(), tooltipShowDelay() (+1 more)

### Community 99 - "cssToken"
Cohesion: 0.18
Nodes (13): Area, drawableRings(), modelFor(), fadeMs(), mountPlaceOverlays(), paint(), Hit, placeRecord() (+5 more)

### Community 101 - "withResolvedArea"
Cohesion: 0.33
Nodes (5): photosByPlaceId, photosForPlaceId(), ALLOWED_HOSTS, resolvePlacePhotos(), withResolvedArea()

### Community 102 - "trackpad.ts"
Cohesion: 0.60
Nodes (4): attachTrackpadGestures(), PinchMap, pinchZoom(), wheelPixels()

### Community 104 - "place-edits.ts"
Cohesion: 0.38
Nodes (6): placeEditsApi(), PlaceEditStore, readPlaceEdits(), savePlaceEdits(), syncPlaceEdits(), withPlaceEdits()

### Community 106 - "Partidas de transporte — Europa"
Cohesion: 0.50
Nodes (3): Partidas de transporte — Europa, Pendências e limites, Serviços consultados

### Community 107 - "maps-app.ts"
Cohesion: 0.48
Nodes (4): googleMapsAppTarget(), SHORT_MAPS_URLS, mapsAppUrl(), mountMapsAppLinks()

### Community 108 - "Fotos de interiores — Archives nationales e Carnavalet"
Cohesion: 0.50
Nodes (3): Fotos de interiores — Archives nationales e Carnavalet, par-archives-nationales, par-carnavalet

### Community 109 - "map/overview.ts"
Cohesion: 0.70
Nodes (3): greatCircle(), OverviewArc, overviewArcs()

### Community 110 - "Roma — recomendações do Airbnb"
Cohesion: 0.50
Nodes (3): Monte Ciocci (`rom-monte-ciocci`), Roma — recomendações do Airbnb, Valle Aurelia (`rom-valle-aurelia`)

### Community 112 - "Cafés próximos à Casa do Gui — 2026-09-28"
Cohesion: 0.40
Nodes (4): Boulangerie Eden — par-boulangerie-eden-noisy, Cafés próximos à Casa do Gui — 2026-09-28, Candidatos não adicionados, Le Jean Jaurès — par-le-jean-jaures-noisy

### Community 113 - "Bouillon Pigalle e transporte do Louvre — 29/09/2026"
Cohesion: 0.50
Nodes (3): Bouillon Pigalle e transporte do Louvre — 29/09/2026, Bouillon Pigalle em 08/10, Louvre → Lafayette Gourmet em 05/10

### Community 114 - "iconButton"
Cohesion: 0.12
Nodes (26): AMENITY_EVENT, AMENITY_ICON, AmenityKind, amenityName(), amenityOn(), setAmenity(), state, attachMapControls() (+18 more)

### Community 115 - "view-state.ts"
Cohesion: 0.18
Nodes (14): changedStopKeys(), stopFingerprint(), visitStops(), parse(), parse(), activeSectionKey(), cityInOsrmScope(), dayKey() (+6 more)

### Community 117 - "Revisão do roteiro e refeições de 12/10"
Cohesion: 0.29
Nodes (6): Auditoria aplicada, Café da tarde em Veneza, Compras de 11/10, Jantar e orçamento, Revisão do roteiro e refeições de 12/10, Validação

### Community 119 - "Milão — 11/10/2026"
Cohesion: 0.29
Nodes (6): Bilhete, Cobertura do passeio, Google Maps: notas e capas, M3: estações e serviços de domingo, Milão — 11/10/2026, Validação

### Community 120 - "search.ts"
Cohesion: 0.15
Nodes (16): mountSearch(), searchMatches(), searchSchedule(), searchText(), Suggestion, Shell, capitalized(), formatDayTitle() (+8 more)

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

### Community 126 - "walk-distance.ts"
Cohesion: 0.52
Nodes (5): extraWalkMeters(), formatWalk(), isExtraWalkNote(), polylineMeters(), walkedMeters()

### Community 127 - "maplibre-perf.ts"
Cohesion: 0.70
Nodes (3): MAPLIBRE_PERF, maplibreFade(), labelFadeDuration()

### Community 128 - "Lisboa — retorno de 20/10/2026"
Cohesion: 0.50
Nodes (3): Lisboa — retorno de 20/10/2026, Plano vigente: levar lanches, Priority Pass do Ultravioleta e janela conservadora

### Community 133 - "Primark em Milão — consulta de 06/10/2026"
Cohesion: 0.50
Nodes (3): Identidade, endereço e pino, Possibilidade no primeiro dia (11/10), Primark em Milão — consulta de 06/10/2026

## Knowledge Gaps
- **617 isolated node(s):** `name`, `private`, `type`, `version`, `node` (+612 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **23 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pickLocale()` connect `pickLocale` to `paint`, `hotels.ts`, `dates.ts`, `amenities.ts`, `index.ts`, `mount.ts`, `export.ts`, `route-planner.ts`, `weather.ts`, `shell.ts`, `travel.ts`, `calendar.ts`, `place-panel.ts`, `hotel-rank.ts`, `stay-heatmap.ts`, `transfer-row.ts`, `departures.ts`, `mountMap`, `map.ts`, `main.ts`, `parse.ts`, `note-edit.ts`, `hotel-distance.ts`, `iconButton`, `search.ts`?**
  _High betweenness centrality (0.072) - this node is a cross-community bridge._
- **Why does `travelCities` connect `parse.ts` to `travel.ts`, `cssToken`, `calendar.ts`, `withResolvedArea`, `amenities.ts`, `travel-stay-heatmap.ts`, `index.ts`, `place-edits.ts`, `route-draw.ts`, `maps-app.ts`, `mount.ts`, `stay-heatmap.ts`, `travel-areas.test.ts`, `pickLocale`, `map.ts`, `search.ts`, `route.ts`, `main.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `getTravelCity()` connect `getTravelCity` to `travel-itineraries.ts`, `travel.ts`, `rome-hotel-neighborhoods.ts`, `parse.ts`, `withResolvedArea`, `hotels.ts`, `index.ts`, `mount.ts`, `route.ts`, `main.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `name`, `private`, `type` to the rest of the system?**
  _617 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `travel-itineraries.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._
- **Should `paint` be split into smaller, more focused modules?**
  _Cohesion score 0.10857142857142857 - nodes in this community are weakly interconnected._
- **Should `rome-hotel-neighborhoods.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.14855072463768115 - nodes in this community are weakly interconnected._
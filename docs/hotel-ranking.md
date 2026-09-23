# Hotel priorities

The local hotel search combines Azul total-stay prices with Booking review scores,
then ranks matched properties using the canonical city places and stay heatmap.
It runs through `npm run dev` (Vite). The production build stays static.
PinchTab is required for new searches and for loading category scores when saved
hotels have no fresh detail cache. Recalculating uses a 24-hour detail cache when available.

Store `TYPESAFE_API_KEY` in the root `.env` (Git-ignored), or the server environment.
Never use a `PUBLIC_` variable. The key is read by the local middleware and is never
included in browser responses, storage, or the production bundle.

## Evidence and scoring

- Base weights: quality 50% (cleanliness, comfort and facilities, equally weighted),
  editorial safety 25%, walking 20%, transport access 5%. Price is only a budget filter and optional sort, never score evidence (including JEV).
  Booking overall, location and value-for-money scores are excluded from the model
  and the JEV payload. The overall rating remains visible for reference and the
  existing minimum overall-score search filter still applies.
- Wi-Fi must be present; its numerical rating gives no bonus. Staff must score at
  least 7.0; scores above that cutoff give no bonus. Confirmed failures are excluded
  from recommendations and hidden by default (the UI can show them). Missing
  requirements or core category scores are marked pending, with no score or rank.
  Neither excluded nor pending hotels are sent to JEV. Missing components are excluded, and known weights are normalized. Scores with missing data or limited neighborhood evidence are provisional and have no final position. No automatic 0 or 50 is assigned.
- Each property detail visit extracts all seven Booking subscores via accessible
  category meters, Wi-Fi facilities, aggregate score/count, and photos. The same
  collection updates the overall score and review count. Wi-Fi can be confirmed by
  the facility description or the presence of a Wi-Fi subscore; explicit absence
  takes precedence. Detail cache keys are versioned, TTL 24h. Empty/challenge pages
  are not cached as successful category lookups.
- Pick at most 24 city attractions with stable ordering. Selected route IDs get +6,
  required itinerary stops +3, favorites +2, and personal ratings up to +1, over a
  base weight of 1. Airports, accommodation and transport are excluded from this
  attraction sample. The same weighted targets are used for every hotel.
- Safety uses point-in-polygon membership in the existing editorial stay zones.
  Radius fallback is explicitly approximate. Precise polygons take precedence over supplemental study circles; within the same coverage type, overlaps use the most cautious score;
  locations outside coverage remain unknown. These are the existing 2025–2026
  editorial assessments, not live crime data or guarantees, and lack per-zone source dates.
- Matched Booking coordinates are used for the hotel location because Azul pins can
  be imprecise. Large source disagreements remain available as `booking.distanceM`.
- OSRM's dedicated foot service calculates a hotel-to-destination matrix in batches
  of 20 hotels, with up to 24 attractions and 8 saved transport points. Sequential
  requests wait 1.1 seconds and successful matrices are cached in memory for 24h.
  A transient network failure gets one delayed retry; HTTP rate limits are not retried.
  Missing routes stay null; snapping over 250m is rejected. Walking only contributes
  to the score when at least 80% of selected attractions have routes.
- Quality is the mean of the three core category scores, scaled to 100. Overall
  review count is supplied to JEV as context; no category-specific sample counts
  are invented. Walking scores are averaged per destination with itinerary weights: 100 through 30 minutes, linearly down to 25 at 90 minutes, then zero at 120 minutes. More destinations beyond 90 minutes reduce this score. These prices do not infer unlisted taxes, fees or cancellation terms.
- JEV (`jev-1.13.0`) evaluates structured evidence in batches of 12 hotels. Accepted
  0–4 scores contribute at most 15% of the final score: their effective weight is
  `0.15 × reported confidence`; the rest comes from the base score. Invalid answers
  or zero confidence fall back to the base. Confidence limits influence but is not
  a calibrated guarantee of correctness for this task. Requests timeout at
  15s; 429/529 are retried once. Successful evaluations are cached for 24h.
- Transit access covers only registered stops; it is not a complete station search
  and does not compute transit journey duration, schedules, fares or transfers.
  Per-attraction Google Maps links allow checking walking and transit routes.

## UI and API

The default sort is trip priority, with total price, Booking score and average walk
as alternatives. Each card exposes its evidence, missing data and per-place routes.
`Update scores and priorities` loads Booking details and uses the currently selected
route and saved hotel results without fetching new prices. Old saved searches can also be ranked.
Use a new search to refresh availability and prices. Changing the selected route
does not silently re-rank: use the update button.

- `GET /api/hotel-search?...&citySlug=roma&priorityIds=id1,id2` streams search and ranking.
- `POST /api/hotel-search/rank` accepts `{citySlug, priorityIds, hotels}`. Hotels need
  `id`, `name`, `lat`, `lng`, `priceTotal`, and `booking: {score, reviews, url}`. The
  URL must match a Booking property path. Submitted category scores are ignored;
  evidence comes from the server's detail lookup/cache. It returns refreshed Booking
  fields, rankings by ID and metadata, without secrets. Input is bounded to 150 hotels and
  128 KiB. City evidence is loaded server-side; cross-site browser calls are rejected.

The card's “Our rating” ring is distinct from the Booking badge. Quality meters show
the three core categories; prerequisite chips show Wi-Fi and staff. Accommodation
types and Booking score labels are localized, including guesthouse → pousada.
Walking times and map links render in `src/views/hotels.ts`. This repo has no
`src/components/travel/travel-distance-list.ts` (that module stayed in the
Astro portfolio).

Validation: `npx vitest run src/data/hotel-ranking.test.ts src/data/hotel-booking-details.test.ts src/data/hotel-search.test.ts src/data/travel-stay-heatmap.test.ts` and `npm run build`.

API references: [TypeSafe](https://docs.typesafe.ai/api),
[OSRM table](https://project-osrm.org/docs/v5.24.0/api/#table-service).


## Rome coverage review — 2026-09-20

`rome-hotel-neighborhoods.ts` separates 11 editorial contexts from individual cartographic urban zones to hotel ranking,
covering the northern, northeastern and western hotel clusters missing from the
16 original heatmap zones. The source URLs, review date, qualitative notes and
limited confidence travel through the API to JEV and the card. These areas use imported cartographic polygons for both map display and ranking
membership; they do not change the original central heatmap polygons. The map
uses the same green/amber/red palette and filters for assessed regions, and gray outlines
for areas without a safety score, with names and source popups.
Scores of 80 (calmer residential context) or 70 (mixed/nightlife context) are coarse
editorial interpretations, not values reported by a source or measured crime risk.
Fleming and Pietralata have geographic/contextual coverage but no safety
score where the reviewed evidence is insufficient. They remain provisional. We do
not infer safety from wealth, housing prices, lack of reported incidents, or a
citywide advisory. Supplemental scores also retain limited-confidence status.

Coverage regression includes all 11 previously uncovered hotel coordinates in the
saved 5 km Roma search; it does not claim coverage of every address in the circle.


## Cartographic boundaries

The supplemental areas now use `rome-hotel-boundaries.json`, imported from the
ArcGIS `ZoneUrbanistiche_Roma` layer. `scripts/fetch-rome-hotel-boundaries.py`
dissolves named urban zones, subtracts existing central editorial areas, and
resolves source overlap slivers in a stable order. Shared vertices are not
independently simplified; holes and multipolygons are retained in both rendering
and point-in-polygon ranking. The map uses solid outlines. This replaces all
radius-derived supplemental outlines. Geography precision does not upgrade the
confidence of editorial safety evidence. Regenerate with:
`uv run --with shapely --with pyproj python scripts/fetch-rome-hotel-boundaries.py`.


Coverage now imports every individual urban zone intersecting the 5 km Roma search
footprint (center 41.9028, 12.4964), including unassessed areas and parks. The importer
checks uncovered mapped area in a local metric projection (<1 m²), polygon validity,
non-overlapping interiors, and shared borders. Current output: 57 supplemental
areas; original central editorial regions retain precedence. This is coverage of
the source footprint, not a claim of safety or coverage outside the search radius.
All four legend categories start visible and filter both old and new regions.
New assessments use the safety thresholds (78 best, 70 mixed, below 70 caution),
without fabricating a price/value score. Gray explicitly means unassessed.
Both layers use the same pill marker, theme styles and zoom visibility threshold.

Residual urban-zone geometry for the same named legacy region inherits its existing assessment and legend band; its label is shared instead of duplicated. Other added areas remain explicitly unassessed.

## Revisão de segurança por zona (20/09/2026)

Versão 7 do ranking integra `rome-neighborhood-safety.json`: conclusão específica para as 32 zonas antes sem nota, fontes com tipo e forma de acesso, e `reviewStatus` enviado ao modelo/JEV. Ver [inventário e metodologia](rome-neighborhood-safety.md). `insufficient-evidence` e `special-use` continuam sem nota; o mapa distingue essas conclusões de uma pesquisa pendente.

## Polígonos e transições visuais (versão 8)

Ativar “Onde ficar” preserva a câmera. Preenchimentos sem bordas usam opacidade de 18% (escuro) / 22% (claro), com aumento de 10 pontos no hover; nomes só aparecem no hover. “Sem nota conclusiva” começa desativado. Cliques não focam SVGs nem deslocam a câmera para abrir popups.

A antiga redução radial de polígonos foi removida. `rome-hotel-boundaries.json.editorialZones` contém a partição canônica das áreas centrais, usada também pelo ranking, com buracos preservados. As zonas urbanísticas 1X (Zona Archeologica) e 2X (Villa Borghese) preservam seu contorno de origem. Monti e Esquilino mantêm os contornos dos rioni, descontadas interseções. “Termini leste” agora é um **recorte editorial aproximado** entre os segmentos OSM de Via Giovanni Giolitti e Via Filippo Turati, dentro de Esquilino; não representa todo Castro Pretorio nem um limite administrativo. A origem das ruas está em `rome-termini-streets.json` (OpenStreetMap, consulta via Nominatim); homônimos fora do entorno da estação foram excluídos. A [RFI confirma os acessos por Giolitti e Marsala](https://www.rfi.it/en/stations/station-page/roma-termini---information-totem/accessing-the-station.html).

`travel-stay-display.json` contém apenas geometria de apresentação. Faixas de 35 m de cada lado dos contatos Melhor/Cuidado são geradas em projeção métrica, removidas dos preenchimentos originais e desenhadas como Misto. São transições visuais, não novas medições de segurança nem alterações nas notas. O cálculo inclui todas as regiões antes dos filtros; as faixas continuam visíveis mesmo quando Melhor, Cuidado ou Misto estão ocultos. Faixas sobrepostas são unidas para não escurecer o mapa.

Regenerar após mudanças de contornos ou categorias:

```sh
uv run --with shapely --with pyproj python scripts/fetch-rome-hotel-boundaries.py --input /tmp/rome-zones.geojson
node scripts/build-stay-display.mjs
```

O segundo comando exporta as categorias reais do TypeScript, executa operações Shapely/pyproj e valida que nenhum contato Melhor/Cuidado permaneça direto. O teste `travel-stay-display.test.ts` detecta novas regiões e categorias desatualizadas. O primeiro comando também pode obter as zonas urbanísticas da fonte quando `--input` for omitido.

### Airbnb gratuito (busca local)

Instalação: `npm run travel:airbnb:setup` (requer `uv` e Python 3.10+).
A pyairbnb está fixada no commit de `scripts/airbnb-requirements.txt`; não exige
conta, chave de API, assinatura ou proxy pago. Funciona no backend local já existente,
não no site estático. Se o Airbnb alterar seu site ou bloquear a consulta, a interface
informa a falha sem apagar os resultados das outras fontes.

O seletor de fontes permite Azul/Booking, Airbnb ou ambas. Airbnb consulta BRL, datas,
adultos, Wi-Fi e o retângulo do raio; depois filtra o círculo e o total explícito da
discriminação (incluindo taxas informadas). Nunca usa parcela ou diária como total.
Percorre até 15 páginas, deduplica IDs como strings e informa limites. Por busca,
carrega detalhes de até 50 anúncios mais centrais, para limitar tempo e requisições.
Não promete cobertura completa do inventário. Refazer busca atualiza preços;
reordenar prioridades não atualiza disponibilidade/preços.

Notas Airbnb originais ficam em `airbnb.categoryScores`; o envelope legado `booking`
serve apenas como interface comum dos cards, sempre acompanhado de `source: airbnb`.
A nota pública do Airbnb é exibida de 0 a 10 (original × 2), sem estrela, preservando até duas casas decimais. O filtro usa a mesma escala.
Wi-Fi precisa ser confirmado nos detalhes; funcionários não tem equivalente e não
é substituído pela comunicação do anfitrião. A nota geral do Airbnb (0–5) é multiplicada por 20 e recebe o peso completo de qualidade
(50%). Categorias individuais não entram no cálculo nem são requisitos. Localização pública é aproximada:
segurança não recebe nota numérica e caminhadas são estimativas. O score sempre é
provisório, com pesos disponíveis normalizados e sem posição definitiva. JEV recebe
essas limitações. Preço continua fora da nota.

Reavaliações aceitam apenas os dados Airbnb obtidos pelo servidor (até 500 snapshots
locais, válidos por 24 horas), nunca avaliações/URLs enviadas pelo cliente. Depois de 24 horas,
é preciso refazer a busca antes de reavaliar Airbnbs salvos. Dados de hóspedes e
identidades dos anfitriões não são importados.

### Recuperação da conexão com a Azul

A busca primária usa `scripts/azul-search.py` com `curl_cffi` e HTTP/1.1,
preservando a mesma sessão anônima entre destino, abertura da busca e preços.
Reutiliza o ambiente gratuito instalado por `npm run travel:airbnb:setup`.
Isso resolve o `net::ERR_HTTP2_PROTOCOL_ERROR` observado também no formulário
oficial da Azul em Chrome. Se esse transporte falhar, tenta o navegador existente.
Uma falha de conexão não é rotulada como bloqueio anti-bot sem evidência.
Booking continua sendo consultado via PinchTab. Nenhuma taxa ou moeda é inferida.

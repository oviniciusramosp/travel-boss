# Travel Boss — plano de paridade com o portfólio + polimento de UI

## Contexto

O travel-boss (Vite + TS vanilla) nasceu da migração da ferramenta de viagens do portfólio (Astro).
Os dados vieram inteiros para `src/data/`: catálogo, itinerários, pernas, fotos, visitas, áreas OSM,
heatmap, subcategorias e até o mapeamento de ícones. A UI, porém, foi reescrita do zero e tem ~3,7k
linhas, contra ~11,5k de scripts de UI no portfólio. Muita feature virou dado morto.

Objetivos:
1. Fechar os gaps de feature com o portfólio mantendo a arquitetura "o Markdown é a fonte da verdade,
   o LLM edita, a UI acompanha ao vivo".
2. UI e motion suaves, coerentes e nos padrões atuais de UI/UX.
3. Raio concêntrico em todo elemento aninhado (modelo `ConcentricRectangle` da Apple).
4. Recuperar a iconografia Material Symbols Rounded do portfólio, com botões só-ícone onde couber.
5. Alinhamento em colunas nas listas (ações sempre no mesmo X).
6. Hover para revelar ou destacar informação secundária.

Fatos medidos em 2026-09-23 (auditoria desta sessão):
- `npx tsc --noEmit` e `npm test` passam (16 arquivos, 133 testes). O JS de produção tem 1,84 MB (518 KB gzip).
- **Artefato vivo:** `src/trip/mount.ts` faz polling de `/api/trips` a cada 800 ms (`:545`) além do HMR. Cada save recria o DOM inteiro, reabre só o 1º dia, perde foco e seleção e refaz o fit do mapa. Todas as pernas são desenhadas a pé (`:173,190`), então Orly → Noisy vira ~20 km de caminhada no OSRM público.
- **Ícones:** `src/data/travel-categories.ts` tem `categoryMaterialIcon`, `placePinIconHtml` e `MAPS_MATERIAL_ICON`; `travel-subcategories.ts` tem `subcategoryMaterialIcon` e `pinMaterialFromSubcategories`. A UI não usa nada disso e a fonte nunca é carregada.
- **Alinhamento:** a parada do roteiro é um `li` com `flex-wrap` (`trip.css:66-75`) e o link "Mapa" vem logo depois do nome (`mount.ts:438-449`). Por isso o X muda a cada linha.
- **Contraste:** o texto secundário `#737373` sobre o canvas `#f5f5f5` dá **4,35:1** e reprova AA no painel do documento inteiro. O erro `#e7000b` sobre canvas dá 4,38:1. Os inputs têm o mesmo fundo do painel e nenhuma borda.
- **Teclado:** as paradas do roteiro só respondem ao mouse (não há como abrir o painel pelo teclado); os 127 pinos de Paris são tab stops que não fazem nada com Enter (Leaflet 1.9.4); re-renderizar filtros e chegada derruba o foco para o `<body>`.
- **Mapa:** em 1280 e 1440 px o pino selecionado fica embaixo do painel de 320 px; os controles do Leaflet (z 1000) pintam por cima do painel (z 600); os pinos animam `width/height/margin` (127 de uma vez a cada troca de nível de zoom); a câmera ora anima, ora corta seco, e ignora `prefers-reduced-motion`.
- **Hotéis:** `node_modules/.cache` não existe. Sem o venv, o helper HTTP/1.1 da Azul falha (`scripts/hotel-search.mjs:419-420`) e o Airbnb fica desligado (`scripts/airbnb-search.mjs:8`). `uv` e `pinchtab` estão instalados.
- **Catálogo:** o pipeline do portfólio (`travel:notion:*`, `travel:areas`, `travel:photos:check`, `build-stay-display`, docs) não veio. O `src/data` é idêntico ao do portfólio.

Decisões do usuário (2026-09-23): criar git antes de tudo (o Grok já terminou); tema escuro só na última
fase; portar o pipeline de catálogo; construir o grafo graphify na Fase 0; foco desktop (itens mobile do
portfólio ficam fora).

---

## Contrato para quem executa (Sonnet)

Caminhos: **B** = `/Users/viniciusramos/Documents/Apps/side-projects/web/travel-boss` · **P** = `/Users/viniciusramos/Documents/Apps/side-projects/web/vinicius-ramos-portfolio`.

Abreviações do portfólio:
- `P tm` = `src/scripts/travel-map.ts`
- `P itin` = `src/scripts/travel-itinerary.ts`
- `P heat` = `src/scripts/travel-stay-heatmap.ts`
- `P ohotels` = `src/scripts/travel-hotels.ts`
- `P route` / `P routeui` = `src/scripts/travel-route(-ui).ts`
- `P DayCard` = `src/components/travel/TravelItineraryDayCard.astro`
- `P PlaceCard` = `src/components/travel/TravelPlaceCard.astro`

Toda tarefa:
1. **Antes:** `graphify query "<tema>"`, depois ler os arquivos da tarefa e o trecho de origem em P. As linhas são de 2026-09-23; se não baterem, localize pelo nome da função.
2. **Escopo:** só o da tarefa. Se o diff passar de ~250 linhas, pare e divida em duas.
3. **Depois:** `npx tsc --noEmit && npm test`, conferir no navegador (`npm run dev`, 1440×900), `graphify update .`, commit `feat(<fase>.<n>): …` ou `fix(…)`.
4. **Teste:** lógica não trivial (parser, heurística, cálculo) ganha um teste pequeno, no padrão de `src/trip/parse.test.ts`.

Regras de UI (valem a partir da Fase 1):
- **Tokens:** só tokens de cor, espaço, tipo, raio, motion e z-index (`src/styles/tokens.css`). Nada de ms, px de raio, cor ou z-index soltos.
- **Ícones:** só via `icon()` de `src/ui/icons.ts`. Glifo novo entra em `ICONS`, e o teste reclama se faltar.
- **Botão só-ícone:** só em ação repetida por linha, controle de mapa ou painel, ou convenção universal (fechar, anterior/próxima, tela cheia). Sempre com `aria-label` + tooltip. A ação primária única de uma tela mantém o rótulo (Exportar, Buscar hotéis).
- **Listas:** usam o primitivo de linha em subgrid (1.8). Colunas fixas, ações no mesmo X.
- **Hover:** informação secundária aparece no hover **e** em `:focus-within`, e em `@media (hover: none)` fica sempre visível. Nunca esconda informação essencial nem o único caminho para uma ação.
- **Câmera:** hover nunca move a câmera do mapa; só clique ou Enter movem.
- **Cor:** o chrome é acromático. Cor de categoria aparece só em pinos, glifos de categoria e pontos.
- **Idioma:** textos PT/EN com `pickLocale(locale, { en, 'pt-BR' })`, que já existe em `src/data/travel.ts`.
- **Re-render:** nunca recriar o controle que está com foco. Atualize atributos no lugar, como `mount.ts:205-217` já faz.

Regras de arquitetura:
- `content/trips/*.md` é a fonte da verdade dos roteiros. Mudou o formato? Atualize `content/SCHEMA.md`, o parser, o export e os testes na mesma tarefa.
- A UI importa o catálogo só por `src/catalog/index.ts`. Reexporte ali o que faltar.
- Não edite `src/data/*` a menos que a tarefa diga. Não adicione dependência npm sem a tarefa pedir.
- Portar é adaptar: P é Astro/SSR. Traga o comportamento para DOM puro, sem os efeitos de "Fora do escopo".
- Marcações 🤔 no plano são suposições não verificadas. Verifique antes de depender delas.

---

## Fase 0 — Preparação (bloqueante)

**0.1 Git.** Em B: `git init`. Confira o `.gitignore`, que já cobre `node_modules`, `dist`, `.env*` e `graphify-out/cache`. Copie este plano para `B/docs/plano-paridade.md`, depois `git add -A` e commit `chore: baseline da migração`.

**0.2 graphify.** Rode `/graphify .` em B e commite `graphify-out/` (sem `cache/`).

**0.3 `AGENTS.md` + `CLAUDE.md`** (symlink, como em P). Conteúdo:
- comandos: `dev`, `test`, `tsc`, `build`, `travel:airbnb:setup` e graphify;
- mapa da arquitetura: `main.ts` → `app/shell` · `map/*` · `views/*` · `trip/*` · `catalog` → `data`;
- o contrato acima;
- "como um LLM edita um roteiro", apontando para `content/SCHEMA.md`.

Cada primitivo criado depois acrescenta a regra dele aqui.

**0.4 Ambiente de hotéis.**
1. Rode `npm run travel:airbnb:setup`. Ele cria `node_modules/.cache/airbnb-venv`, usado pela Azul e pelo Airbnb.
2. Opcional: copie para `B/node_modules/.cache/` o cache aquecido `hotel-search-booking.json` (4,2 MB) e `airbnb-snapshots.json`, ambos em `P/node_modules/.cache/`.
3. Documente no README que `rm -rf node_modules` apaga o venv.

A chave `TYPESAFE_API_KEY` hoje vem do `.env` do portfólio (`hotel-search.mjs:621-627`). Se o usuário quiser um `B/.env`, ele mesmo copia o valor; quem executa não mexe em segredo.
Pronto quando: `GET /api/hotel-search/status` responde `airbnb: true` e uma busca em Paris traz Azul/Booking + Airbnb (com o PinchTab rodando).

---

## Fase 1 — Fundação de UI

Ordem obrigatória: 1.1 → 1.9. Todas as fases seguintes dependem desta.

**1.1 Helpers DOM.** Crie `src/ui/dom.ts` exportando `el()` e troque por import as três cópias idênticas: `shell.ts:27-36`, `places.ts:39-48` e `hotels.ts:270-280`.

**1.2 Motion.** Tokens em `tokens.css`:
```css
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);    /* entrar, revelar */
--ease-in: cubic-bezier(0.55, 0, 1, 0.45);     /* sair */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1); /* mover, trocar */
--dur-instant: 90ms;  /* cor no hover/press */
--dur-fast: 150ms;    /* revelar ações, tooltip */
--dur-base: 220ms;    /* painel, popover, details, crossfade */
--dur-slow: 320ms;    /* áreas no mapa, sidebar */
```
- Em `@media (prefers-reduced-motion: reduce)` todo `--dur-*` vira `0ms`.
- Crie `src/ui/motion.ts` com `prefersReducedMotion()`. Hoje só `hotels.ts:596` checa isso. O `panTo` animado (`map.ts:206`), os `fitBounds` (`:157`, `:189`) e o fade de rótulos do MapLibre ignoram a preferência.
- Unifique a câmera: 0,45 s com animação, instantânea em reduced motion. `flyTo` virou `setView` sem animação (`map.ts:161-163`) e, quando o painel abre, o `panTo` animado é cancelado pelo `setView` no mesmo tick (`place-panel.ts:149-150`). Resultado: um corte seco de até +3 níveis de zoom.
- Regras: anime só `opacity`, `transform`/`translate`/`scale`, `background-color` e `color`. Nunca `width/height/top/left/margin`, nunca `transition: all`. Entrada usa `--ease-out`; saída usa `--ease-in` e dura ~70% da entrada.

**1.3 Cor, tipo, tamanhos, camadas.** Tudo em `tokens.css`:
- `--color-mid-gray: #666666`. É ≥ 4,5:1 sobre `#f5f5f5` (≈5,3) e sobre o hover `#ececec` (≈4,9). O DESIGN.md só proíbe texto *mais claro* que `#737373`.
- `--color-ember-text` para texto de erro (ex.: `#c10007`, ≈5,8:1 sobre canvas). O `--color-ember` fica para ícones.
- `--color-on-ink: #fafafa`, que hoje está solto 6×: `app.css:157,319,403,459`, `trip.css:33`, `places.css:52`.
- `--color-hover: rgba(10,10,10,.04)` e `--color-press: rgba(10,10,10,.08)`. O primeiro está solto em `app.css:274` e `places.css:85`.
- Input sobre canvas ganha fundo `--color-paper` + borda hairline. Hoje não tem borda visível (`app.css:431-439`), e o anel de foco `#e5e5e5` sobre `#f5f5f5` dá ≈1,16:1.
- Tipo: use os tokens existentes e crie `--text-h2: 18px` e `--text-h3: 15px`. O piso é 12 px: `kbd` e as contagens da sidebar estão em 11 (`app.css:115,269`). Troque os px literais listados na auditoria (`app.css`, `trip.css`, `places.css`, `hotels.css`).
- Alturas de controle: `--h-sm: 24px`, `--h-md: 28px`, `--h-lg: 32px`. Hoje há 32/28/26/20 soltos.
- Camadas: `--z-map: 0`, `--z-controls: 10`, `--z-panel: 20`, `--z-popover: 30`, `--z-tooltip: 40`, `--z-toast: 50`. `.tb-map` ganha `isolation: isolate`, para que os z 400/1000 internos do Leaflet fiquem contidos e o painel fique por cima.
- Sombras: `--shadow-float` (elevação maior) para o painel e popovers sobre o mapa. O `--shadow-subtle` continua nos cards.
- Fundo do mapa: `.tb-map-col`, `.leaflet-container` e a camada `background` do estilo (`basemap-style.ts`) usam o mesmo token. Hoje o fundo pisca #fff → #f5f5f5 → cor do estilo.
- Remova `--map-width` (sem uso).

**1.4 Raio concêntrico.** A regra da Apple (`ConcentricRectangle` + `.containerShape()`): um canto é concêntrico quando o raio interno compartilha o centro do raio do contêiner, isto é, `r_interno = r_externo − distância até a borda`. Se o resultado for ≤ 0, a Apple usa canto reto ou o piso de `.concentric(minimum:)`. Com `isUniform`, os quatro cantos usam o maior raio resolvido. Cápsula dentro de cápsula, com recuo uniforme, é concêntrica por construção. Como o CSS não tem `inherit()` estável para custom property, os pares viram tokens explícitos com `calc()`:
```css
--r-min: 4px;                                   /* piso, como .concentric(minimum:) */
--r-pill: 999px;                                /* botões, chips, inputs, segmentados, badges, linha de 1 linha */
--r-card: 24px;    --inset-card: 12px;          /* card de hotel e painel do lugar (DESIGN.md: card 24) */
--r-card-inner: max(var(--r-min), calc(var(--r-card) - var(--inset-card)));          /* 12px */
--r-row: 12px;     --inset-row: 6px;            /* linha de 2+ linhas */
--r-row-inner: max(var(--r-min), calc(var(--r-row) - var(--inset-row)));             /* 6px: miniatura */
--r-popover: 16px; --inset-popover: 4px;
--r-popover-inner: max(var(--r-min), calc(var(--r-popover) - var(--inset-popover))); /* 12px: itens */
--r-group: 16px;   --inset-group: 2px;          /* pilha de controles do mapa: botão 28px → 14 + 2 */
--r-tip: 8px;
```
Regras:
- Um filho que encosta nas duas bordas de um canto usa o `*-inner` do contêiner.
- Um filho longe do canto (distância à borda maior que o raio do contêiner) segue o próprio componente.
- Linha de 1 linha é cápsula, com botões-pílula dentro: concêntrica por construção. Linha de 2+ linhas usa `--r-row`, selecionável com `:has(.tb-row__sub)`.
- Mídia sangrando no topo de um card usa `var(--r-card) var(--r-card) 0 0`, porque o recuo é 0.
- Anel de foco sempre com `outline` + `outline-offset`: o navegador curva o outline pelo raio + offset, então o anel sai concêntrico para fora. Em linha que corta overflow, use `outline-offset: -2px`. Nunca faça anel de foco com `box-shadow`.
- Container com raio que rola não corta a barra de rolagem: role um filho interno (`.tb-panel__body`).
- Mapa, sidebar e documento encostam na janela: raio 0.

Corrija os pares que a auditoria achou:
- (a) Card de hotel: os links-pílula no canto têm raio 13 com recuos de 13/17 (`hotels.css:144,246-251`). Viram `--inset-card` uniforme + pílulas de 24 px.
- (b) Painel: o fechar tem raio 16 (alvo 11/7) e o Google Maps também (alvo 7) (`place-panel.ts:45-53,141-147`). Padding uniforme de 12 (hoje 12/16, `places.css:281`), fechar em 24 px no canto e foto sangrando no topo.
- (c) Linhas `.tb-place`/`.tb-stop`/`.tb-stops li` usam 18 fixo, então a forma depende da altura. Ficam cápsula ou `--r-row` (`places.css:67`, `trip.css:72`).
- (d) Foto do painel com raio 10 no recuo 17 (`places.css:312`).
- (e) Sobre o mapa convivem quatro famílias de raio (painel 24, zoom do Leaflet 4/2, atribuição 0, tooltip 11). Todas vão para os tokens. A atribuição continua visível (licença OSM/OpenFreeMap), só que restilizada.
- (f) Anéis de foco: pino (anel quadrado no wrap 32×32), linha de lugar (anel cortado por `content-visibility`, `places.css:79`) e inputs (`outline: none`, `app.css:438`).
- (g) O painel rola com raio 24 e corta a trilha da barra de rolagem.
- (h) O kbd `⌘K` tem 6 px literais. Vira pílula de 20 px com recuo 6 no campo de 32 px, que dá 10 + 6 = 16 (concêntrico).

Documente a regra no `AGENTS.md`.
Pronto quando: `grep -rn "border-radius" src/styles` só mostra `var(--r-*)`, e os tokens antigos `--radius-*` somem.

**1.5 Ícones Material Symbols Rounded.** Recupera a iconografia de P (`src/styles/global.css:4-27`, `src/layouts/BaseLayout.astro:205-208`).
- `src/ui/icons.ts` exporta:
  - `ICONS` (`as const`, ordenado, sem repetição) e `type IconName`;
  - `icon(name, { fill?, size?: 16|18|20 })`, que gera `<span class="material-symbols-rounded" aria-hidden="true">`;
  - `ICON_FONT_HREF` = `https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,300..700,0..1,-50..200&icon_names=${ICONS.join(',')}&display=block`. O `icon_names` baixa só os glifos usados e exige ordem alfabética; `display=block` evita piscar o nome da ligadura.
  - O módulo não pode tocar `document` no topo, porque o `vite.config.ts` o importa.
- `vite.config.ts`: um hook `transformIndexHtml` injeta o `preconnect` (googleapis/gstatic) e o `<link>` a partir de `ICON_FONT_HREF`. Assim há uma lista só.
- `src/styles/icons.css`: a classe `.material-symbols-rounded` de P, tamanhos 16/18/20 e `.is-fill` (`'FILL' 1`).
- O catálogo reexporta `placePinIconHtml`, `categoryMaterialName`, `MAPS_MATERIAL_ICON` e `subcategoryLabel`.
- `ICONS` inicial = valores de `categoryMaterialIcon` e `subcategoryMaterialIcon` + os de UI: `add attach_money bed calendar_month check chevron_left chevron_right close content_copy directions directions_transit directions_walk download expand_more favorite filter_list fit_screen flight fullscreen fullscreen_exit ios_share left_panel_close left_panel_open local_activity local_taxi location_on map mode_heat my_location open_in_new person photo_camera remove restaurant route schedule search sort star star_half sync warning`.
- `src/ui/icons.test.ts`: `ICONS` ordenado e único; todo valor de `categoryMaterialIcon` e `subcategoryMaterialIcon` está nele.

🤔 Não medi o peso do subset com todos os eixos. Se passar de ~150 KB, fixe `GRAD@0` e `wght@400`.
Pronto quando: `document.fonts.check('20px "Material Symbols Rounded"')` dá `true` e nenhum glifo aparece como texto.

**1.6 Tooltip + botão de ícone.**
- `src/ui/tooltip.ts`: um único elemento `position: fixed` no `body`, com delegação em `[data-tip]` (`pointerover`/`focusin`).
  - Aparece em 350 ms. Se outro tooltip fechou há menos de 300 ms, aparece na hora (modo "quente", como no macOS).
  - Some em `pointerout`, `focusout`, scroll, `pointerdown` e Esc.
  - Fica acima do alvo, ou abaixo quando não cabe. Entra com fade + 2 px de translate em `--dur-fast`.
  - É `aria-hidden`, porque o nome acessível vem do `aria-label`.
  - É JS, e não `::after`, porque `.tb-main` e o mapa cortam overflow.
- `src/ui/controls.ts`:
  - `iconButton({ icon, label, shortcut?, pressed?, variant: 'ghost'|'outline'|'solid', size: 'sm'|'md' })`: 24 ou 28 px, círculo `--r-pill`.
  - `iconLink({ icon, label, href })`: `target=_blank`, `rel=noopener`.
  - Os dois definem `aria-label` e `data-tip` (label + atalho).
- Aplique no shell:
  - o toggle da sidebar (`left_panel_close`/`left_panel_open`) substitui o SVG de `shell.ts:45`;
  - a lupa (`search`) substitui o SVG de `shell.ts:54`;
  - Exportar ganha o ícone `ios_share` **e** mantém o rótulo;
  - o `⌘K` vira `Ctrl K` fora do macOS (`shell.ts:62`).

**1.7 Estados de interação.** Hoje não há nenhum `:active`, os três botões não têm hover e ghost/outline não têm disabled. O "Atualizar notas" (`hotels.ts:457-459`) parece habilitado com `cursor: pointer`.
- Defina hover, active (`scale(.97)` + `--color-press`), `focus-visible`, disabled (opacidade .4 + `cursor: not-allowed`) e selecionado para: `.tb-btn`, `-ghost`, `-outline`, icon button, chips, segmentado, linhas, `summary`, inputs e `select`.
- Conserte o hover do rail, vencido por especificidade (`trip.css:25-29`).
- Dê estilo ao `summary` aberto: um chevron `expand_more` que gira em `--dur-base`, no lugar do marcador que foi removido sem substituto (`places.css:261-268`).
- O campo de cidade read-only dos hotéis não pode parecer editável (`hotels.ts:316`).

**1.8 Lista em subgrid com ações reveladas.** Resolve o "Mapa" com X diferente em cada linha.
```css
.tb-list { display: grid; column-gap: 8px; }
.tb-list--stops  { grid-template-columns: [time] 40px [lead] 20px [main] minmax(0,1fr) [actions] auto; }
.tb-list--places { grid-template-columns: [lead] 32px [main] minmax(0,1fr) [meta] auto [actions] auto; }
.tb-list > .tb-row { grid-column: 1 / -1; display: grid; grid-template-columns: subgrid;
  align-items: center; padding: var(--inset-row); border-radius: var(--r-row); }
.tb-row:not(:has(.tb-row__sub)) { border-radius: var(--r-pill); }
.tb-row__actions { grid-column: actions; display: flex; gap: 2px; opacity: 0;
  transition: opacity var(--dur-fast) var(--ease-out); }
.tb-row:is(:hover, :focus-within, [aria-current='true']) .tb-row__actions { opacity: 1; }
@media (hover: none) { .tb-row__actions { opacity: 1; } }
```
- Hora em `tabular-nums`. Título em uma linha com reticências e tooltip do texto completo. A 2ª linha em `--color-mid-gray`, com clamp de 2.
- Ações escondem por `opacity`, nunca por `display`, para o Tab continuar alcançando e nada pular de lugar.
- O `subgrid` faz todas as linhas compartilharem as trilhas, então o X das ações é idêntico mesmo com conteúdo de largura variável.
- `src/ui/row.ts` exporta `row({ time?, lead?, title, sub?, meta?, actions?, current?, onSelect?, data? })`. Com `onSelect`, a área principal é um `<button>`, o que conserta as paradas do roteiro que hoje só respondem ao mouse (`mount.ts:412-474`).
- Primeiro consumidor, na mesma tarefa: as paradas do documento de roteiro. A nota desce para a 2ª linha, e a ação vira `iconLink('location_on', 'Google Maps')`.
- Os outros consumidores vêm depois: 4.1 (enriquece o roteiro), 6.2 (lugares), Fase 8 (timeline da cidade), 9.2 (hotéis).
- Largura máxima de ~760 px no conteúdo do documento e das listas. Em 1920 px as linhas passam de 800 px e o olho viaja demais entre o nome e a ação.

**1.9 API do mapa: hover × seleção.** Em `src/map/types.ts` + `map.ts`:
- `hover(id | null)`: destaca o pino **sem mover a câmera**. Hoje `highlight()` faz `panTo` (`map.ts:206`).
- `select(id)`: destaque + política de câmera (7.3), descontando o painel.
- `onHover(fn)`: o hover no pino destaca a linha.
- `setPadding({ right })`: o painel informa a própria largura, e `fit`/`select` centralizam na área visível.
- `MapPin` ganha `icon?`, `featured?` e `number?` (usados em 7.1 e 8.6a).
- `setPins` faz diff por id em vez de `clearLayers` + recriar tudo (`map.ts:102-130`): sem piscar e mais barato com 127 pinos.

---

## Fase 2 — Correções (bugs confirmados na auditoria)

**2.1 O roteiro ignora a troca de idioma.** `render()` sai cedo quando o arquivo não mudou (`mount.ts:154-156` + `:514`). No `onLocale`, chame `paint(current)` direto.

**2.2 As setas da foto movem o mapa e reconstroem o painel.** Cada clique roda `paint()`, que chama `highlight` e `flyTo` (`place-panel.ts:78-85` → `:149-150`), e o foco cai no body. A câmera só se move em `open()`; a navegação de foto troca só o `src`.

**2.3 Fechar o painel não limpa a seleção.** Pino e linha continuam destacados (`place-panel.ts:49-52`). Crie `onClose`: as vistas limpam `aria-current`, chamam `map.hover(null)` e devolvem o foco à linha que abriu o painel.

**2.4 Paradas opcionais entram na rota.** Em `places.ts:378,392`, use `dayPrimaryRoutePlaceIds` para os ids e para as pernas de fallback.

**2.5 Código morto e CSS duplicado.** Remova:
- o handler `[data-day-select]` (`places.ts:678-688`);
- `.tb-day-title button` (`places.css:132-150`);
- `.tb-sr` (`app.css:500-509`);
- `.tb-city-section h3` (`trip.css:53-58`);
- a checagem de H3 irmão (`mount.ts:229-230`).

Unifique o `.tb-place`, duplicado em `places.css:63-81` e `:230-239`, e o `.tb-stop-time`, que está em `trip.css` e em `places.css`.

**2.6 Hotéis.**
- (a) O aviso de localização aproximada nunca aparece: está dentro do ramo não-Airbnb (`hotels.ts:674-684`).
- (b) Com a API inalcançável, o formulário fica habilitado e sem mensagem (`hotels.ts:1377-1388`).
- (c) Uma resposta 200 que não é stream passa em silêncio (`hotels.ts:1214-1225`).
- (d) O `<output aria-live>` do raio está dentro do `<label>` do slider e é lido a cada passo (`hotels.ts:401-419`). O status de progresso anuncia cada tick (`:441`). Deixe só o status final como `polite`.
- (e) O card de hotel só é selecionável com o mouse (`hotels.ts:1343-1353`).

**2.7 O painel sobrevive ao próprio contexto.** Ele deve fechar ao trocar de aba (`places.ts:739-749`), quando o lugar sai do filtro (`:650-652`, paridade `P tm:2981-2984`) e quando a parada some após um save. Na troca de idioma, repinte o painel.

**2.8 Foco perdido em re-render.** Filtros de categoria (`places.ts:645-656`) e opção de chegada (`:659-676`) passam a atualizar `aria-pressed` no lugar, sem reconstruir.

**2.9 O mapa se move a cada tecla da busca.** Hoje cada tecla recria os markers e roda `fitBounds` (`places.ts:719-728`). Faça o refit com debounce de 400 ms e só quando algum resultado sair da vista.

**2.10 Várias paradas aparecem selecionadas.** O clique limpa `aria-current` só no dia do clique (`mount.ts:468-470`). Limpe no documento inteiro.

**2.11 `innerHTML` com texto dinâmico.** `mount.ts:516,529` interpola `error.message`. Troque por nós DOM com `textContent`.

**2.12 Scroll.**
- Zere o scroll ao trocar de vista ou aba; restaure só no save ao vivo (hoje ele vaza entre vistas: `places.ts:236`, `mount.ts:287,501`).
- Adicione `scroll-margin-top` em `.tb-city-section`, que hoje fica embaixo do rail sticky.
- Baixe o padding inferior de `70vh` para `30vh` (`app.css:286`).
- Zere as margens de `p.tb-meta`.

**2.13 Divisor de painéis.**
- Faça o clamp da largura salva no load, no resize da janela e ao abrir/fechar a sidebar (hoje só acontece ao arrastar, `shell.ts:109-113`).
- Durante o arraste, atualize via `requestAnimationFrame` e grave no `localStorage` só no `pointerup` (hoje grava a cada movimento, `:166`).
- Complete o ARIA: `aria-valuemin`, `aria-valuemax`, `aria-valuenow` desde o início, `aria-label`, e as teclas Home/End.

**2.14 Pinos como tab stops.** Hoje são 127 tab stops em Paris, sem nome acessível e sem Enter. Use `keyboard: false` e `title` com o nome. O caminho de teclado é a lista, porque selecionar uma linha seleciona o pino.

**2.15 Feedback do export.** O status em `<p>` empurra o documento e volta depois de 2 s (`mount.ts:263-273`). Vira um toast `role="status"` em `--z-toast`.

**2.16 Conteúdo.** Em `content/trips/europa.md:62`, a parada "Piazza Venezia" está depois do parágrafo narrativo. Suba-a para a lista.

---

## Fase 3 — Navegação, estado e idioma

**3.1 Rotas por hash.** Crie `src/app/router.ts` com `#/trip/<id>` e `#/city/<slug>/<places|itinerary|hotels>?place=<id>&day=<n>`.
- `main.ts` abre a rota da URL. Sem rota, abre o primeiro roteiro; isso substitui o auto-open fixo de `europa` (`mount.ts:125-133`).
- `hashchange` navega.
- Trocar de vista usa `pushState`. Trocar de lugar, dia ou aba usa `replaceState`.
- `document.title = "<título> · Travel Boss"`.

Pronto quando: o reload mantém cidade, aba e lugar, e voltar/avançar do navegador funcionam.

**3.2 Persistência.** Crie `src/app/store.ts` com `read(key, fallback)` e `write(key, value)`: JSON, try/catch, prefixo `tb:`. Guarde:
- o filtro de categorias, global (`P filter:19,34-58`);
- os grupos abertos, por cidade;
- a chegada escolhida, por cidade e dia (`P itin:412-418`).

**3.3 Idioma completo.**
- O idioma inicial segue a ordem: salvo → `navigator.language` → en (`P i18n:27-42`).
- Traduza o que está fixo em PT: `shell.ts:57,60,71,81,87,96,103`, `main.ts:43` (`cidade · slug`), `mount.ts:516-517`.
- Os erros do parser passam a ter `code` + `detail`, e a mensagem é montada na UI conforme o idioma. Atualize `parse.test.ts`.

**3.4 Teclado.**
- Esc fecha painel, popover e tooltip.
- As abas da cidade viram `tablist`/`tab`/`tabpanel` com `aria-selected`. Hoje usam `role=group` + `aria-pressed` (`places.ts:280-291`).
- Os controles segmentados (abas, idioma, chegada) ganham setas + roving tabindex por um helper `segmented()` em `src/ui/controls.ts` (`P itin:687-709`).

---

## Fase 4 — Documento de roteiro (o artefato Markdown)

**4.1 Paradas enriquecidas.** Sobre as linhas de 1.8:
- O ponto colorido (`mount.ts:427-432`) vira o glifo `placePinIconHtml(category, subcategories)` na cor da categoria.
- Nova ação "Como chegar desde a parada anterior" (`directions`), com URL de `googleDirectionsUrl` portada de `P route:234-262`.
- Um `place:` inexistente vira linha desabilitada mostrando o id (hoje é texto solto, `mount.ts:450-458`).

Pronto quando: `.tb-row__actions` tem o mesmo `left` em todas as linhas e as ações só aparecem com hover ou foco.

**4.2 O estado sobrevive ao save.**
- Antes do `paint`, guarde os dias abertos (chave `cidade:índice:título`), a parada atual, o foco e o scroll; restaure tudo depois.
- O padrão "só o 1º dia aberto" vale apenas na primeira pintura.
- Save ao vivo **não** refaz o fit do mapa (hoje refaz, `mount.ts:503` → `:238`), a menos que um pino novo esteja fora da vista.
- A prévia da rota usa a geometria já em cache (`walk-route.ts:10`), para não piscar linha reta antes da rota real.

**4.3 Destacar o que mudou.**
- Faça o diff entre o `Trip` anterior e o novo. A chave da parada é cidade + dia + índice + placeId/label.
- Linhas novas ou alteradas ganham `.is-changed`: um flash de fundo de ~1,2 s com `--ease-out`, sem animação em reduced motion.
- O caminho do arquivo no topo pisca "atualizado".

É isso que torna visível a edição ao vivo pelo LLM.

**4.4 Fim do polling.**
- Remova o `setInterval` de 800 ms (`mount.ts:545-547`).
- No `vite.config.ts`, o evento `tb:trip` passa a enviar `{ id }`, e surge `GET /api/trips/:id`.
- O cliente refaz fetch só daquele arquivo, e também em `visibilitychange`/`focus` como rede de segurança.
- A lista lateral só recarrega em add/unlink (hoje é reconstruída a cada save, `mount.ts:94-109`).

Pronto quando: a aba Network fica parada sem edição e um save aparece em menos de 1 s.

**4.5 Markdown inline de verdade.** O SCHEMA promete negrito, itálico e listas extras, mas a UI mostra os asteriscos crus (`mount.ts:478-483` usa `textContent`), e um bullet sem link vira erro (`parse.ts:49`).
- Crie `src/trip/inline.ts`, compartilhado com `export.ts` (mova `inline` e `inlineWithLinks` para lá).
- Gere nós DOM, nunca `innerHTML`.
- Suporte `**b**`, `*i*`, `[x](https://…)` e `[x](place:id)`; este último seleciona o lugar no app.
- Bullet sem link dentro de um dia vira "nota em lista", sem erro.
- Atualize o SCHEMA e os testes.

**4.6a Pernas no formato.** Um sub-bullet indentado sob a parada de **saída** descreve o trajeto até a próxima: `  - via: metrô M14 + RER E · 35 min`.
- O modo sai de palavra-chave PT/EN: a pé/walk; metrô/metro/rer/trem/train/ônibus/bus/tram/ferry; táxi/uber/carro/car; voo/flight.
- A duração sai de `(\d+)\s?(min|h)`.
- Mexe no parser, no SCHEMA, em `tripToMarkdown` e em `tripToHtml` (lista aninhada, `<ul>` dentro do `<li>`, que Notes e Notion preservam). Com testes.

**4.6b Pernas no mapa.** Crie a função pura `src/trip/legs.ts`, com esta precedência:
1. a perna autoral do catálogo para o par `from→to`, com índice montado a partir de `parisDayLegsById` e `milanDayLegsById` (reexportados no catálogo);
2. o modo do `via:`: walk usa OSRM; os demais viram linha reta tracejada neutra;
3. sem informação: a pé se o haversine for ≤ 1,5 km; senão, reta neutra e **sem** OSRM.

Isso substitui o `mode: 'walk'` fixo de `mount.ts:173-191`. Com teste da precedência.

**4.6c Linha de transferência.** Crie `src/views/transfer-row.ts`, com `transferRow(leg)`:
- ícone `directions_walk`, `directions_transit`, `local_taxi` ou `flight`;
- rótulo e duração;
- chip na cor da linha (`legLineColor`, `formatLegDuration`).

Fica entre as paradas no roteiro, e a Fase 8 reusa.

**4.7 Avisos do parser.** Hoje são uma linha solta (`mount.ts:304-312`).
- Viram um badge "N avisos" no cabeçalho.
- O popover (hover ou clique) lista `linha: mensagem`.
- Ele tem um botão "Copiar para o LLM", que copia `content/trips/<id>.md:<linha> — <mensagem>`.

**4.8 Ações do dia no hover.** No cabeçalho do dia:
- "Rotas do dia no Google Maps": origem, destino e até 9 waypoints via `googleDirectionsUrl`;
- "Enquadrar no mapa";
- "Copiar dia (Markdown)".

---

## Fase 5 — Multi-cidade (feature nova do pedido original)

**5.1 Cabeçalho do roteiro.**
- Um resumo: "Paris → Milão → Roma · 11 noites · 2–13 abr".
- Uma faixa de cidades com largura proporcional às noites e com as datas.
- Hover na faixa destaca a cidade no mapa; clique foca a cidade (5.3).

**5.2 Mapa em visão geral.** `map.setOverview(cities)` desenha:
- nós numerados na ordem da viagem (lat/lng de `getTravelCity`);
- conectores tracejados entre as cidades (grande círculo interpolado);
- paradas esmaecidas.

Clique num nó foca a cidade. A visão geral é o estado inicial do roteiro.

**5.3 O rail vira navegação.** Hoje ele filtra (`mount.ts:314-339`).
- Passa a ter "Visão geral" + as cidades. Clique rola até a seção e enquadra as paradas daquela cidade.
- Um scroll-spy (IntersectionObserver em `.tb-city-section`) marca a cidade ativa no rail e destaca o nó no mapa, **sem mover a câmera**.

**5.4 Transporte entre cidades.** Linha opcional no cabeçalho da cidade, depois de `dates:`: `via: trem Frecciarossa · 3h10`. Diz como se chega da cidade anterior.
- Aparece no tooltip do conector e na faixa.
- O export mantém a linha.
- Mexe no parser, no SCHEMA e nos testes.

**5.5 "Hotéis nestas datas".**
- Uma ação no hover do cabeçalho da cidade abre `#/city/<slug>/hotels?in=AAAA-MM-DD&out=AAAA-MM-DD`.
- `hotels.ts` pré-preenche check-in e check-out a partir da URL (`applyQuery`, `hotels.ts:1097`).

**5.6 (opcional) Cidades no mapa.** Sem nada aberto, mostra os pinos das 9 cidades; clique abre a cidade.

---

## Fase 6 — Lugares: lista e painel

**6.1 Grupos de categoria.**
- Cada categoria vira um `<details>` com chip (glifo + cor + contagem ao vivo).
- "Expandir tudo / Recolher tudo", com estado salvo por cidade (3.2).
- Categoria sem lugares na cidade some; hoje as 11 aparecem sempre.
- Chips de filtro: desligado = transparente + `--color-mid-gray`; ligado = `--color-paper` + `--shadow-subtle`. Hoje são 11 pílulas pretas, que pesam demais.
- Badge de contagem quando o filtro difere do padrão (`P filter:452-486`).
- O hover no chip revela "só esta"; ⌥-clique faz o mesmo.

**6.2 Linha de lugar** (no subgrid):
- miniatura de 32 px com a capa de `resolvePlacePhotos` (`loading=lazy`), ou o glifo da categoria como placeholder;
- nome + coração se for favorito;
- 2ª linha com `subcategoryLabel`;
- meta alinhada à direita: nota compacta e preço;
- ações no hover: Google Maps e, na Fase 10, adicionar à rota.

Um hover de ~350 ms abre um preview com foto maior e 2 linhas de descrição: a informação aparece sob demanda em vez de ocupar a tela.

**6.3 Nota e preço.**
- `src/ui/rating.ts` porta `P StarRating.astro`: meia estrela, "-.-" sem nota, `aria-label` "x de 5", Minha × Google.
- `src/ui/price.ts` porta `P PriceLevel.astro`: 3× `attach_money`, de 0 a 3 preenchidos.
- O tooltip da nota diz "Minha 4,6 · Google 4,4".

**6.4 Painel v2.** Card `--r-card` + `--shadow-float`, de cima para baixo:
- foto sangrando no topo (6.5), com o fechar (`close`, 24 px) sobre ela no recuo `--inset-card`;
- cabeçalho sticky;
- badges: categoria com glifo, favorito, subcategorias;
- notas (6.3), preço e "aberto agora" (6.6);
- descrição e fatos: `tips` com `white-space: pre-line`, link `ticketUrl` ⓘ, promoções como lista;
- endereço como link do Google Maps, e as ações.

Semântica e comportamento:
- `role="dialog"` não modal + `aria-labelledby`.
- O foco vai para o título ao abrir e volta para a origem ao fechar.
- Entra com fade + 8 px de translate (`@starting-style`, `--dur-base`).
- A câmera centraliza o pino na área visível (1.9).

**6.5 Slider de fotos.**
- Crossfade entre duas `<img>` sobrepostas em `--dur-base`.
- Dots clicáveis, e ←/→ com o painel em foco.
- Setas visíveis só no hover ou foco.
- Foto quebrada sai da lista. Sem nenhuma foto, mostra o placeholder com o glifo (`P slider:13-72`).

**6.6 "Aberto agora".**
- Porte `P src/scripts/travel-live.ts` (Overpass por `osmRef`) para `src/views/open-now.ts`.
- A busca é preguiçosa, feita quando o painel abre, com cache por sessão.
- O estado "desconhecido" fica oculto.

**6.7 Busca completa.**
- Amplie `searchBlob` (`places.ts:124-137`) com subcategorias, preços, dicas, melhor horário/dia, "favorito" e "nota N" (`P PlaceCard:103-121`).
- Dentro de uma cidade, o placeholder vira "Buscar entre N lugares".

---

## Fase 7 — Mapa

**7.1 Pinos.**
- `.tb-pin` passa a conter `placePinIconHtml(category, subcategories)`.
- Tamanho por zoom via **uma** variável `--pin-scale` no container, animada com `transform: scale()`. Hoje cada pino anima `width/height/margin` + `box-shadow` (`app.css:331,349-378`).
- O brilho vira um pseudo-elemento com opacidade.
- O tamanho congela durante a animação de zoom, com uma classe entre `zoomstart` e `zoomend` (`P tm:1637-1654`).
- Pino turístico = estrela de 8 pontas (`P tm:682-777`). Pino `featured` = maior + anel pulsante (`P tm:803-813`, `P travel-map.css:610-812`), sem pulso em reduced motion.

**7.2 Hover lista ↔ mapa.**
- Delegação de `pointerover`/`focusin` nas listas → `map.hover(id)`.
- `map.onHover` → a linha ganha `.is-hover`.
- Sem câmera e sem scroll.

**7.3 Câmera.**
- O fit ignora outliers: mediana + raio p75, aeroportos fora (porte de `P tm:835-899`).
- Zoom máximo por cidade vem de `TravelCity.zoom`, que hoje é ignorado.
- O padding desconta o painel e a sidebar.
- A política de seleção: zoom ≥ 14 só quando estiver abaixo de 13; pan animado para mudanças pequenas; voo curto para longe; instantâneo em reduced motion (`P tm:2817-2929`).

**7.4 Áreas.**
- Mostra o polígono ou a linha da área no hover e na seleção, via `withResolvedArea` + `travel-area-geometry.ts`, com fade de `--dur-slow`.
- O mapa usa `preferCanvas: true`, então as áreas vão num pane com renderer SVG (`L.svg({ pane })`) para o fade CSS funcionar.

**7.5 Transporte.** Um lugar de metrô mostra a linha inteira + as estações (com tooltip) no hover e na seleção (`P tm:1986-2027`), via `getTransitLine`.

**7.6 Controles.**
- Uma pilha de botões só-ícone no canto inferior direito (`--r-group`): zoom +/−, enquadrar (`fit_screen`) e tela cheia (`fullscreen`/`fullscreen_exit`, incluindo o painel; `P tm:3975-4052`).
- Desligue o `zoomControl` padrão (`map.ts:50`), que hoje tem glifos Lucida Console de 22 px, raio 4/2 e fica por cima do painel.
- Restilize a atribuição com os tokens e mantenha-a visível.

**7.7 Trackpad.** Porte `attachTrackpadGestures` (`P tm:1385-1537`): dois dedos = pan, pinça (ctrl+wheel) = zoom no cursor, zoom fracionado.

**7.8 MapLibre.** Aplique as opções de performance de P: `fadeDuration: 0` etc. (`P tm:268-278`).

---

## Fase 8 — Roteiro da cidade (timeline)

**8.1 Cabeçalho do dia.**
- Badge "Dia N" e a contagem de paradas, que segue a chegada escolhida.
- Ações no hover: mostrar a rota (estados ocioso/desenhando/no mapa) e rotas no Google Maps.
- Chips de orçamento separados: comida × ingressos por pessoa, com detalhamento no tooltip.
- Acima dos dias: o título do itinerário e o orçamento total (`computeTripBudget`, exportado e nunca usado).

**8.2 Períodos.** Manhã/Tarde/Noite, pelo `slot` de cada parada (`ItinerarySlot`):
- grupo recolhível com contagem;
- link do Google Maps do período;
- chave "no mapa", que esconde as pernas do período sem emendar o buraco (`P DayCard:527-612`, `P itin:217-310`).

**8.3 Transferências.**
- Reuse `transferRow` (4.6c) com `legsForDay` + `expandTimelineTransferParts`: uma linha por trecho de metrô, e "a pé até <linha>".
- O trilho vertical é pontilhado para caminhada e sólido, na cor da linha, para transporte (`P DayCard:697-708`).

**8.4 Paradas.**
- Chips de custo por parada (comida/ingresso), respeitando `countFood` e `countTicket`.
- Rótulo "Opcional".
- Parada sem lugar aparece desabilitada.

**8.5 Chegada.** O controle ORY/CDG vira abas com o ícone `flight` e setas (3.4), persistido (3.2).

**8.6a Camada do dia.** Badges numerados nos pinos da rota (`P tm:2698-2718`); os demais pinos ficam em 0,22 de opacidade (`P tm:2729-2737`).

**8.6b Detalhe de transporte.**
- Estações e pontos de baldeação de duas cores. O builder já devolve `transfers` (`itinerary-route.ts:51-62`); estenda `MapRouteSegment` em `types.ts`.
- Fluxo tracejado animado no transporte, com renderer SVG e sem animação em reduced motion.

**8.6c Hover sincronizado.**
- Hover numa parada ou transferência destaca a perna no mapa, e vice-versa (`P itin:711-844`, `P tm:3233-3339`).
- As linhas deixam de ser `interactive: false` (`map.ts:150`).

---

## Fase 9 — Hotéis e onde ficar

**9.1 Contexto no mapa.**
- Na aba Hotéis, os pinos de lugares ficam esmaecidos. Hoje `places.ts:410-416` apaga tudo.
- O anel de raio fica tracejado e é redimensionado no lugar: `setRadius` em vez de recriar (`map.ts:167-181`).
- Enquanto a busca carrega, mostre um skeleton de linhas no lugar do texto "Carregando…".

**9.2 Card de hotel** (`--r-card`, `--inset-card`):
- slider de fotos (reuse 6.5);
- anel de nota 0–100 com manchete (#N / Provisório / Não elegível);
- barras de limpeza, conforto e instalações;
- requisitos: Wi-Fi e staff;
- segurança do bairro, em estilo de alerta abaixo de 70 (`P ohotels:125-160`).

**9.3 "Por que esta posição?"** Um disclosure com pesos e método, fontes com datas, aviso editorial, participação JEV e o transporte mais próximo (`P ohotels:162-171`).

**9.4 Distâncias.**
- Porte `P src/components/travel/travel-distance-list.ts`: minutos e metros até cada lugar salvo, e links a pé/transporte do Google Maps.
- 🤔 Confira se `scripts/hotel-ranking.mjs` devolve `walks`; o tipo em `hotels.ts:28-53` não tem esse campo.

**9.5 Hotel no painel.** Clique no card ou no pino abre o hotel no mesmo painel dos lugares; hover no card destaca o pino (`P ohotels:665-684`).

**9.6a Heatmap de estadia.**
- Módulo preguiçoso `src/map/stay-heatmap.ts`, porte de `P heat`: zonas por faixa, pílula de nome no hover, legenda com toggles e "desconhecido" oculto por padrão.
- `data/travel-stay-heatmap.ts` entra só por `import()` dinâmico, respeitando o aviso de `catalog/index.ts:3-4`.
- Toggle `mode_heat` nos controles do mapa.

**9.6b Popup de zona.** Notas de segurança e de valor, a nota editorial de Roma e links Airbnb/Booking com as datas (as do roteiro, quando houver; ver 5.5).

**9.7 Datas e texto.**
- Datas padrão: as do roteiro; senão, hoje+30 → +32 (paridade com `P ohotels:593-596`; hoje é +1 → +3).
- Um parágrafo curto explicando o ranking (`P page:508-516`).

---

## Fase 10 — Planejador de rota e localização

**10.1 Estado da rota.** `src/views/route-planner.ts`: adicionar e remover paradas (máx. 8), por cidade, persistido. Ação `route` nas linhas e no painel (`P routeui:549-563,673-693`).

**10.2 Barra da rota** (`P routeui:148-455`):
- paradas numeradas, remover uma e limpar tudo;
- a pé × transporte;
- "sair da minha localização";
- dicas: ≥ 2 paradas, calculando, erro, dica de transporte.

**10.3 Prévia.**
- OSRM a pé com vários pontos (`fetchWalkingRoute` já aceita).
- Badges numerados (8.6a).
- "Prévia a pé · 25 min · 1,9 km".
- Link do Google Maps, a pé ou de transporte.

**10.4 Localização.**
- Botão `my_location` nos controles.
- Ponto "você está aqui" + círculo de precisão, e voo até o ponto.
- Mensagens de negado, indisponível e timeout, e aviso quando estiver a mais de 80 km (`P route:34-102`, `P tm:3679-3728,3905-3969`).

**10.5 Ranking.** As paradas do planejador entram nas prioridades do hotel com peso +6 (`P ohotels:293-294`, `hotel-ranking.mjs:20-27`).

---

## Fase 11 — Passe de motion e hover

**11.1 Entrada e saída.** Painel, popovers, tooltip e toast com `@starting-style` + `transition-behavior: allow-discrete`. Hoje tudo aparece e some por `hidden`: painel, abas, chips, cards de hotel e status.

**11.2 `<details>` animado.** Dias, categorias e períodos com `interpolate-size: allow-keywords` + transição em `::details-content`. 🤔 O suporte no Safari não foi verificado; sem suporte, abre instantâneo, o que é aceitável.

**11.3 Troca de vista.** Cidade, roteiro e aba com `document.startViewTransition` quando existir, fazendo crossfade só do painel principal (`view-transition-name`). Filtrar lista continua instantâneo: animar filtro atrasa a resposta.

**11.4 Sidebar.**
- Ao recolher: `translate: -100%` + fade em `--dur-slow`; a coluna do grid muda uma vez só, no fim. Ao expandir, a ordem se inverte.
- O `invalidateSize` do mapa roda uma vez, no fim.
- Hoje a coluna troca seca (`app.css:173-182`) e o mapa redimensiona a cada frame (`map.ts:65-68`).

**11.5 Varredura.**
- `grep` por ms, cubic-bezier, `border-radius`, cores e z-index fora de token em `src/styles` e em estilos inline de `src/**/*.ts`.
- Confira em reduced motion que nada anima, nem a câmera.

**11.6 Inventário de hover.** Tudo abaixo deve existir. O que não coube nas fases anteriores vira subtarefa aqui.

| Onde | Em repouso | No hover/focus |
|---|---|---|
| Linha de parada/lugar | hora, glifo, nome, nota | ações (Google Maps, direções, rota); o pino cresce no mapa |
| Linha de lugar (≥ 350 ms) | miniatura | preview com foto grande + descrição |
| Transferência | ícone + duração | a perna destacada no mapa |
| Cabeçalho do dia | título, "Dia N", nº de paradas | Google Maps do dia, enquadrar, copiar Markdown |
| Cabeçalho da cidade (roteiro) | nome + datas | hotéis nestas datas, abrir cidade, enquadrar |
| Chip de categoria | glifo + nome + contagem | "só esta" |
| Chips de orçamento | total | comida × ingressos |
| Nota | ★ 4,6 | Minha × Google |
| Foto do painel | imagem | setas + dots |
| Caminho do arquivo (topo) | `content/trips/europa.md` | copiar caminho ou contexto para o LLM |
| Sidebar | nome | contagem em contraste pleno |
| Texto truncado | reticências | texto completo (tooltip) |
| Badge de avisos | "3 avisos" | lista com as linhas |
| Card de hotel | nome, total, nota | detalhamento da nota; pino destacado |

---

## Fase 12 — Pipeline do catálogo (porte do portfólio)

**12.1 Notion.**
- Copie `P scripts/sync-travel-notion.mjs` e os dados que ele lê e escreve: `travel-notion.json`, `travel-notion-sync-state.json`, `travel-google-place-ids.json` e os dumps de seed que ele referencia. Ajuste os caminhos.
- Crie os npm scripts `travel:notion:*` (lista em `P package.json:19-28`) e `docs/travel-notion-sync.md`.
- Copie a seção "Travel places ↔ Notion (obrigatório)" do `P AGENTS.md`.
- Crie um `.env.example` com os nomes das variáveis.
- Valide com `pull` (só leitura) depois que o usuário puser o token em `B/.env`.

**12.2 Áreas.** `fetch-travel-polygons.py` + `travel-area-queries.json` + `travel-polygons-raw.json` + `travel-areas-report.json`, com os scripts `travel:areas`, `travel:areas:force` e `travel:areas:check`.

**12.3 Fotos e estadia.** `check-travel-photos.py` (`travel:photos:check`), `build-stay-display.{mjs,py}` e `fetch-rome-hotel-boundaries.py` + `rome-termini-streets.json`.

**12.4 Docs.** `hotel-ranking.md`, `milan-itinerary.md` e `rome-neighborhood-safety.md`, em `B/docs/`.

**12.5 Um escritor só.** Depois do porte, o portfólio não deve mais dar push no Notion. Proponha ao usuário remover ou bloquear `travel:notion:push/seed` em P. Não faça isso sem OK explícito.

---

## Fase 13 — Performance

**13.1 Dados sob demanda.**
- `travel-areas-osm.ts` (4,8k linhas) entra só por `import()` quando uma área for desenhada.
- O heatmap é preguiçoso (9.6).
- Meça com `vite build` antes e depois.

**13.2 OSRM educado.** O servidor FOSSGIS é público, e hoje cada save refaz todas as pernas; algumas levam de 10 a 16 s.
- Cache de rotas a pé em `localStorage`: chave por coordenadas, LRU de ~300.
- Peça só as pernas de dias abertos ou da cidade visível.
- No máximo 2 requisições simultâneas.

**13.3 Medir antes de otimizar.** Meça o tempo de `paint()` do `europa.md` depois de 4.2/4.3. Só faça patch parcial se passar de 16 ms.

---

## Fase 14 — Tema escuro (por último, pedido do usuário)

**14.1 Tokens escuros.** `:root[data-theme=dark]` + `prefers-color-scheme` quando não houver escolha salva. Depois de 1.3 e 11.5, não sobra cor fora de token.

**14.2 Basemap escuro.** Porte os tints escuros (`P tm:255-266,310-320`) para `basemap-style.ts`, com troca ao vivo sem remontar o mapa (`P tm:1777-1817`). Áreas e heatmap re-tingem.

**14.3 Toggle.** Botão só-ícone (`light_mode`/`dark_mode`, que entram em `ICONS`) no topo. Persistido em `tb:theme`, sincronizando `color-scheme` e `<meta name="theme-color">` (`P theme:37-54`).

---

## Fora do escopo (decidido; reabrir se o usuário pedir)

- **Mobile/responsivo:** bottom-sheet, layout empilhado, slider de dias, breakpoints. O pedido original é desktop.
- **Efeitos de vitrine do portfólio:** pino magnético, cursor e botões magnéticos, pinos que se afastam no hover, intro de zoom no carregamento. Custam muito código e atrasam uma ferramenta de trabalho.
- **Service worker de tiles:** só servia ao build de produção, e o travel-boss roda em `vite dev`.
- **Índice de cidades com chips de país e busca de cidades:** a sidebar e o 5.6 cobrem 9 cidades. Volte a isso quando o catálogo crescer.

---

## Verificação ponta a ponta

**Por tarefa:** `npx tsc --noEmit && npm test` + conferência no navegador.

**Por fase**, no painel do navegador (1440×900 e 1280×800):
1. **Artefato vivo.**
   - Abra `#/trip/europa` com dois dias abertos. Edite `content/trips/europa.md`: nova parada, nota em negrito e `via:`.
   - A tela atualiza em menos de 1 s, mantém dias, foco e scroll, pisca o que mudou e não move o mapa.
   - A aba Network fica parada sem edição.
2. **Export.** Exporte e cole no Apple Notes e no Notion. Títulos, bullets, `via:` aninhado e links sobrevivem.
3. **Alinhamento.** Todas as linhas da lista dão o mesmo `getBoundingClientRect().left` para `.tb-row__actions`. As ações ficam invisíveis até hover ou Tab.
4. **Lugares (Paris).**
   - O filtro persiste após reload.
   - Hover na linha faz o pino crescer sem mover o mapa.
   - Clique abre o painel e o pino fica fora da área coberta por ele.
   - Esc fecha e devolve o foco.
5. **Itinerário (Paris, dia 1, ORY/CDG).** Transferências com as cores das linhas, orçamento separado e períodos. O link do Google Maps abre as paradas certas.
6. **Hotéis.** Status ok; a busca traz Azul/Booking + Airbnb; aparecem explicação do ranking, distâncias e heatmap.
7. **Motion.** Com `prefers-reduced-motion: reduce` emulado, nada anima, nem a câmera. Sem ele, nenhuma transição mexe em width/height/top/left (DevTools → Animations).
8. **Teclado.** Tab, Shift+Tab, Enter, Esc e as setas percorrem tudo, inclusive as paradas do roteiro. Os tooltips aparecem no foco.
9. **Contraste e raio.**
   - Texto secundário ≥ 4,5:1 (DevTools).
   - Os pares de 1.4 conferem: fechar e links no canto dos cards, miniaturas nas linhas, botões na pilha do mapa, kbd no campo de busca.

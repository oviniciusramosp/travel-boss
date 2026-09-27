# Primitivos de UI

- `el` — `src/ui/dom.ts`. Cria um elemento, aplica `className` e, se vier texto, `textContent`.
- `prefersReducedMotion` — `src/ui/motion.ts`. Lê `prefers-reduced-motion`. A câmera usa `cameraMotion`: 0,45 s, ou corte instantâneo.
- `icon` — `src/ui/icons.ts`. Único jeito de desenhar um glifo. O nome entra em `ICONS` (ordenado, sem repetir); o teste falha se uma categoria ou subcategoria ficar de fora.
- `weatherIcon` — `src/ui/weather-icons.ts`. Glifo da previsão do tempo: `<img>` decorativo de um SVG duotone do pack do usuário em `public/weather/`, com as cores do arquivo (fora dos tokens, a pedido do usuário). O nome entra em `WEATHER_ICONS`; o teste de `src/trip/weather.test.ts` falha se faltar o arquivo. Quem escolhe o glifo é `weatherLook` (`src/trip/weather.ts`): abaixo de 30% de chance de chuva, só o céu; de 30% a 59%, "pode chover"; a partir de 60%, garoa, chuva ou chuva forte. O card do dia mostra o período mais chuvoso (`dayWeather`), para nunca mostrar chuva que nenhum período mostra. A janela de cada período não é mais o relógio fixo (`WINDOWS` em `src/trip/weather.ts`): `periodWindows` (`src/trip/day-plan.ts`) cobre as paradas com horário daquele período, com 1h de piso; sem parada com horário, o período cai na janela fixa. O tooltip do período mostra essa janela (`7h–14h`) antes da temperatura. A última previsão de cada cidade fica no `localStorage` (`tb:weather:<lat,lng>`), então o card mostra a anterior enquanto a API não responde, marcada `is-stale`; sem nenhuma, o glifo do dia respira (`is-loading`) ou fica cinza (`is-off`) e aparece o botão `sync` de atualizar (`data-day-action="weather"`). O tooltip vem em linhas (`weatherTip`): céu, janela e temperatura, chuva, e a hora da última atualização. Só o glifo fica visível; a leitura desliza no hover do próprio glifo (`.tb-reveal`), como a palavra "paradas" no hover do número e "a pé" no hover dos km.
- `iconButton` / `iconLink` — `src/ui/controls.ts`. Botão ou link só de ícone, com `aria-label` e `data-tip`. Tamanho `sm` (24 px) ou `md` (28 px), círculo `--r-pill`.
- tooltip — `mountTooltip` em `src/ui/tooltip.ts`. Um único balão `position: fixed` para `[data-tip]`. Espera 350 ms; se outro fechou há menos de 300 ms, abre na hora. Dentro de um `dialog[open]` o balão passa a morar no dialog, porque o top layer cobre o `<body>`.
- `row` — `src/ui/row.ts`. Linha de lista em subgrid (`.tb-list` / `.tb-row`). Ações na coluna `actions`, escondidas por opacidade no hover, no foco e em `aria-current`. Com `onSelect`, o título é um botão.
- `editableNote` — `src/trip/note-edit.ts`. Nota (de parada, de lista, parágrafo, comentário ou a de um `via:`, depois do ` — `) que vira o próprio Markdown ao clicar, com negrito e itálico já aplicados entre os `**` e `*` (que ficam visíveis, em cinza; `markSpans` em `src/trip/inline.ts` corta o texto com as regras do `parseInline`) (o caret fica onde foi o clique quando a nota não tem marcas nem links) ou com Tab. Salva numa pausa (`--delay-autosave`), ao sair e no Enter; Esc descarta o que não foi salvo. Shift+Return quebra a linha (vira `\` no fim da linha do Markdown); ⌘B e ⌘I (Ctrl fora do Mac) põem ou tiram `**` e `*` em volta da seleção. Como o editor repinta as marcas a cada tecla, o desfazer é dele (⌘Z, ⌘⇧Z e Editar > Desfazer), não o do navegador. Cada save é um `PATCH` de uma linha ancorado no texto que o browser viu. `onEditing` avisa o documento para não repintar enquanto a nota está aberta.
- sub-pontos na timeline — `src/trip/subpoints.ts` casa a nota de lista com o sub-ponto pelo nome em negrito (`matchSubPoint`). Sob a parada, a lista `.tb-substops` mostra os pontos como bolinhas de 8 px na cor da categoria do pai, na ordem do dia (`walkOrder`), com a hora da nota quando há; sem nenhuma hora na lista, a coluna de hora some (`is-untimed`). O nome abre o card do lugar já naquele ponto (`PlaceLinks.focusSub`), onde a nota aparece sob a foto (`PlaceLinks.subNotes`).
- `aiBadge` — `src/ui/ai-badge.ts`. Faíscas (`auto_awesome`, 16 px, cinza) no card de lugar com `aiSuggested`. `aiSuggestionTip` monta o tooltip e o nome acessível com o `aiReason` do lugar ou, sem ele, com os itens do guia que levaram ao lugar. Fica ao lado do nome no card da lista e nas tags do card aberto.
- `openDialog` — `src/ui/dialog.ts`. `<dialog>` modal com barra de título (título, `actions`, fechar) sobre o `body`. O foco começa no título, Escape e clique fora fecham (o Escape não chega ao atalho da janela, que fecharia o card de lugar atrás), e fechar tira o dialog do DOM. A caixa não tem padding nem rola: quem rola é o corpo. Usado pelo vídeo e pela nota do dia (`.tb-receipt`, `src/views/timeline.ts`).
- `videoButton` — `src/ui/video.ts`. Um botão "Vídeo" (`play_circle`) por link de `TravelPlace.videos`, logo abaixo da descrição do card aberto. Reel ou post do Instagram abre o embed num `openDialog`: fechar descarta o iframe (o vídeo para). Qualquer outro link abre em nova aba.

## Raio concêntrico

Um canto é concêntrico quando o raio interno divide o centro com o raio do contêiner: `r_interno = r_externo − distância até a borda`. Se o resultado for ≤ 0, o canto fica reto (`--r-none`) ou no piso `--r-min` (o `.concentric(minimum:)` da Apple). Os pares estão em `src/styles/tokens.css` porque o CSS não herda esse cálculo sozinho:

- `--r-card` / `--inset-card` → `--r-card-inner`
- `--r-row` / `--inset-row` → `--r-row-inner`
- `--r-popover` / `--inset-popover` → `--r-popover-inner`
- `--r-group` / `--inset-group` → `--r-group-inner`
- `--r-pill` para cápsula (botão, chip, input, segmentado, badge, linha de uma linha)
- `--r-tip` para tooltip e atribuição do mapa

Regras:

- Filho que encosta nas duas bordas de um canto usa o `*-inner` daquele contêiner.
- Filho longe do canto (a distância até a borda é maior que o raio do contêiner) usa o raio do próprio componente.
- Cápsula dentro de cápsula, com o mesmo recuo nos quatro lados, é concêntrica por construção. Uma pílula de 24 px (`--h-sm`) com `--inset-card` fecha com `--r-card`.
- Linha de uma linha é cápsula. Linha de duas ou mais (`:has(.tb-row__sub)`, e os equivalentes já na lista) usa `--r-row`.
- Mídia sangrando no topo do card usa `var(--r-card) var(--r-card) var(--r-none) var(--r-none)`, porque o recuo é zero.
- Anel de foco é `outline` + `outline-offset`. O navegador acompanha o raio, então o anel sai concêntrico para fora. Em quem corta overflow, `outline-offset: -2px`. Nunca desenhar o anel com `box-shadow`.
- Contêiner arredondado não rola: quem rola é o filho interno (`.tb-panel__body`), para a barra de rolagem não ser cortada pelo raio.
- Mapa, sidebar e documento encostam na janela: raio zero, sem token de canto.

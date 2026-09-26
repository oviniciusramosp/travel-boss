# Primitivos de UI

- `el` — `src/ui/dom.ts`. Cria um elemento, aplica `className` e, se vier texto, `textContent`.
- `prefersReducedMotion` — `src/ui/motion.ts`. Lê `prefers-reduced-motion`. A câmera usa `cameraMotion`: 0,45 s, ou corte instantâneo.
- `icon` — `src/ui/icons.ts`. Único jeito de desenhar um glifo. O nome entra em `ICONS` (ordenado, sem repetir); o teste falha se uma categoria ou subcategoria ficar de fora.
- `iconButton` / `iconLink` — `src/ui/controls.ts`. Botão ou link só de ícone, com `aria-label` e `data-tip`. Tamanho `sm` (24 px) ou `md` (28 px), círculo `--r-pill`.
- tooltip — `mountTooltip` em `src/ui/tooltip.ts`. Um único balão `position: fixed` para `[data-tip]`. Espera 350 ms; se outro fechou há menos de 300 ms, abre na hora. Dentro de um `dialog[open]` o balão passa a morar no dialog, porque o top layer cobre o `<body>`.
- `row` — `src/ui/row.ts`. Linha de lista em subgrid (`.tb-list` / `.tb-row`). Ações na coluna `actions`, escondidas por opacidade no hover, no foco e em `aria-current`. Com `onSelect`, o título é um botão.
- `aiBadge` — `src/ui/ai-badge.ts`. Faíscas (`auto_awesome`, 16 px, cinza) no card de lugar com `aiSuggested`. `aiSuggestionTip` monta o tooltip e o nome acessível com os itens do guia que levaram ao lugar. Fica ao lado do nome no card da lista e nas tags do card aberto.
- `videoButton` — `src/ui/video.ts`. Um botão "Vídeo" (`play_circle`) por link de `TravelPlace.videos`, logo abaixo da descrição do card aberto. Reel ou post do Instagram abre o embed numa `<dialog>` modal: o foco começa no título, Escape e clique fora fecham, e fechar descarta o iframe (o vídeo para). Qualquer outro link abre em nova aba.

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

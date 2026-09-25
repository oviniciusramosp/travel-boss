# Travel Boss

Vite + TypeScript, DOM puro. O Markdown do roteiro é a fonte da verdade; a UI acompanha o save. O portfólio (Astro) é a origem do comportamento — porte é adaptar, não copiar.

## Comandos

```bash
npm run dev                  # Vite; save em content/trips/*.md atualiza o roteiro aberto
npm test                     # vitest run
npx tsc --noEmit
npm run build                # tsc --noEmit && vite build
npm run travel:airbnb:setup  # venv em node_modules/.cache/airbnb-venv
npm run travel:areas             # Overpass → src/data/travel-polygons-raw.json
npm run travel:photos:check
```

`graphify-out/graph.json` existe. Consulte o grafo antes de ler arquivo:

```bash
graphify query "<tema>"
```

Depois de criar, renomear, mover ou apagar código: `graphify update .`. Não edite `graph.json` na mão. Não commite `graphify-out/cache/`.

## Arquitetura

`src/main.ts` → `src/app/shell` · `src/map/*` · `src/views/*` · `src/trip/*` · `src/catalog` → `src/data`.

- `src/main.ts` monta o shell (`src/app/shell`), o mapa (`src/map/map`, mais rota e basemap em `src/map/*`), as views e o roteiro (`src/trip/mount`).
- `src/views/*`: `places.ts` e `place-panel.ts` sobem com a cidade; `hotels.ts` entra por import dinâmico a partir de `places.ts`.
- `src/trip/*`: `parse.ts`, `mount.ts`, `export.ts`.
- A UI importa o catálogo só por `src/catalog/index.ts`, que reexporta `src/data`.

## Contrato

- `content/trips/*.md` é a fonte da verdade dos roteiros. Mudou o formato? Atualize `content/SCHEMA.md`, o parser, o export e os testes na mesma tarefa.
- A UI importa o catálogo só por `src/catalog/index.ts`. Reexporte ali o que faltar.
- Não edite `src/data/*` salvo tarefa explícita. Sem dependência npm nova sem a tarefa pedir.
- Tokens de cor, espaço, tipo, raio, motion e z-index só em `src/styles/tokens.css`. Nada de ms, px de raio, cor ou z-index soltos.
- Ícones só via `icon()` de `src/ui/icons.ts`. Glifo novo entra em `ICONS` (ordenado, único). O teste falha se categoria ou subcategoria ficar de fora.
- Idioma: `pickLocale(locale, { en, 'pt-BR' })`. A função está em `src/data/travel.ts`; a UI importa de `src/catalog`.
- Re-render não recria o controle focado: atualize atributos no lugar (como `syncView` em `src/trip/mount.ts`).
- Foco desktop (conferir em 1440×900). Itens mobile do portfólio ficam fora.
- Escopo só da tarefa. Se o diff passar de ~250 linhas, pare e divida.
- Lógica não trivial (parser, heurística, cálculo) ganha teste no padrão de `src/trip/parse.test.ts`.
- Antes: `graphify query`, depois os arquivos da tarefa. Depois: `npx tsc --noEmit && npm test`, olhar no browser (`npm run dev`, 1440×900), `graphify update .`, commit `feat(<fase>.<n>): …` ou `fix(…)`.
- Marcações 🤔 no plano são suposição. Verifique antes de depender delas.

UI (vale a partir da Fase 1):

- Botão só-ícone só em ação repetida por linha, controle de mapa ou painel, ou convenção universal (fechar, anterior/próxima, tela cheia), sempre com `aria-label` e tooltip. A ação primária única da tela mantém o rótulo.
- Listas usam o primitivo de linha em subgrid: colunas fixas, ações no mesmo X.
- Informação secundária aparece no hover e em `:focus-within`; em `@media (hover: none)` fica sempre visível. Não esconda o essencial nem o único caminho de uma ação.
- Hover não move a câmera do mapa. Só clique ou Enter movem.
- O chrome é acromático. Cor de categoria só em pinos, glifos de categoria e pontos. Exceções pedidas pelo usuário: os ícones de orçamento do card do dia (comida `--color-food`, ingresso `--color-ticket`) e os de previsão do tempo (`--color-weather-*`, um tom por céu).

Cada primitivo novo acrescenta a regra dele neste arquivo. Os atuais estão em [docs/ui-primitives.md](docs/ui-primitives.md): `el`, `prefersReducedMotion`, `icon`, `iconButton`/`iconLink`, tooltip, `row`.

Raio concêntrico: `r_interno = r_externo − distância até a borda`, piso `--r-min`, canto reto `--r-none`. Os pares (`--r-card`/`--inset-card`/`--r-card-inner`, e o mesmo para row, popover e group) ficam em `src/styles/tokens.css`. Filho que encosta no canto usa o `*-inner`. Linha de uma linha é `--r-pill`; linha com `.tb-row__sub` é `--r-row`. Foco é `outline` + `outline-offset`, nunca `box-shadow`. Quem rola é `.tb-panel__body`, não o card arredondado. `grep border-radius src/styles` só pode mostrar `var(--r-*)`.

## Como um LLM edita um roteiro

Formato: [`content/SCHEMA.md`](content/SCHEMA.md). Um arquivo por viagem em `content/trips/<id>.md`.

- H1: título da viagem.
- H2: cidade, na ordem. A linha seguinte é `city: <slug>` do catálogo; `dates: YYYY-MM-DD → YYYY-MM-DD` é opcional.
- H3: `### Dia N — Título`.
- Parada: bullet com `HH:mm` opcional e link `[Rótulo](place:<id>)` (o id já existe naquela cidade) ou URL `https://…`. Nota depois de ` — `.
- Parágrafo sob o dia é narrativa: entra no documento e no export, não vira pino.
- Sem comentário HTML, front matter YAML ou HTML cru.

Edite o `.md`. Com `npm run dev`, o save avisa o browser (`tb:trip`) e o roteiro aberto é relido de `/api/trips`. Não duplique o roteiro em TypeScript. Coordenadas, avaliações e ranking de hotel ficam em `src/data`; o arquivo da viagem só referencia ids.

Trecho de trem ou metrô entre dois lugares só aparece no mapa se `src/data/travel-itinerary-legs.ts` tiver uma perna para esse par (a lista da viagem é `tripEuropa2026`). Monte a perna com `ride(linha, estação, estação)` sobre as estações de `src/data/travel-transit-lines.ts`, que vêm do OSM. Mudou uma parada que tem `via:` de trem? Atualize a perna junto.

## Catálogo de lugares

A fonte da verdade é `src/data/travel.ts` (`travelCities`), com `travel-visit.ts`, `travel-photos.ts` e `travel-subcategories.ts`. Não há CMS nem sincronização: o Notion era do portfólio e não é usado aqui. Lugar novo ou correção vai direto nesses arquivos.

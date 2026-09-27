# Travel Boss

Vite + TypeScript, DOM puro. O Markdown do roteiro é a fonte da verdade; a UI acompanha o save. O portfólio (Astro) é a origem do comportamento — porte é adaptar, não copiar.

## Instruções compartilhadas (Codex e Claude Code)

`AGENTS.md` é a fonte única das regras; `CLAUDE.md` aponta para ele. A skill de roteiro fica em `.claude/skills/roteiro/`, com link simbólico em `.agents/skills/roteiro/` para descoberta pelo Codex. Edite o mesmo conteúdo, sem criar cópias. As referências de pesquisa ficam em `docs/references/`, acessíveis aos dois agentes; novas referências necessárias ao roteiro devem ficar no repositório, não apenas na memória privada de um assistente.

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

Depois de criar, renomear, mover ou apagar código: `graphify update .`. Não edite `graph.json` na mão. Não commite `graphify-out/cache/`. O merge de `graph.json` usa o driver do graphify (`.gitattributes`); em clone novo, rode `git config merge.graphify.driver "graphify merge-driver %O %A %B"`, senão o git volta a escrever marcadores de conflito.

## Arquitetura

`src/main.ts` → `src/app/shell` · `src/map/*` · `src/views/*` · `src/trip/*` · `src/catalog` → `src/data`.

- `src/main.ts` monta o shell (`src/app/shell`), o mapa (`src/map/map`, mais rota e basemap em `src/map/*`), as views e o roteiro (`src/trip/mount`).
- `src/views/*`: `places.ts` e `place-panel.ts` sobem com a cidade; `guide.ts` desenha as abas Mercado e Comidas; `hotels.ts` entra por import dinâmico a partir de `places.ts`.
- `src/trip/*`: `parse.ts`, `mount.ts`, `export.ts`.
- A UI importa o catálogo só por `src/catalog/index.ts`, que reexporta `src/data`.

## Contrato

- `content/trips/*.md` é a fonte da verdade dos roteiros. Mudou o formato? Atualize `content/SCHEMA.md`, o parser, o export e os testes na mesma tarefa.
- A UI importa o catálogo só por `src/catalog/index.ts`. Reexporte ali o que faltar.
- Não edite `src/data/*` salvo tarefa explícita. Sem dependência npm nova sem a tarefa pedir.
- Tokens de cor, espaço, tipo, raio, motion e z-index só em `src/styles/tokens.css`. Nada de ms, px de raio, cor ou z-index soltos.
- Ícones só via `icon()` de `src/ui/icons.ts`. Glifo novo entra em `ICONS` (ordenado, único). O teste falha se categoria ou subcategoria ficar de fora. A exceção é a previsão do tempo e o indicador de pôr do sol: `weatherIcon()` (`src/ui/weather-icons.ts`) desenha os SVGs do pack em `public/weather/`. No roteiro, a menção a pôr do sol na própria parada mostra `sunset` na coluna dos valores, com nome acessível e tooltip; não acrescentar anotações para registrar a implementação.
- Idioma: `pickLocale(locale, { en, 'pt-BR' })`. A função está em `src/data/travel.ts`; a UI importa de `src/catalog`.
- Re-render não recria o controle focado: atualize atributos no lugar (como `syncView` em `src/trip/mount.ts`).
- Foco desktop (conferir em 1440×900). Itens mobile do portfólio ficam fora.
- Escopo só da tarefa. Se o diff passar de ~250 linhas, pare e divida.
- Lógica não trivial (parser, heurística, cálculo) ganha teste no padrão de `src/trip/parse.test.ts`.
- Antes: `graphify query`, depois os arquivos da tarefa. Depois: `npx tsc --noEmit && npm test`, olhar no browser (`npm run dev`, 1440×900), `graphify update .`, commit `feat(<fase>.<n>): …` ou `fix(…)`.
- Marcações 🤔 no plano são suposição. Verifique antes de depender delas.

UI (vale a partir da Fase 1):

- Controles do mapa: navegação (zoom, enquadrar, tela cheia) e camadas (água, banheiros, favoritos) ficam em barras separadas. “Mostrar favoritos” troca apenas os pins de lugares com `favorite: true` por corações vermelhos (`--color-favorite`), com escala, destaque no hover e seleção como nos pins, preservando os demais pins, a numeração do roteiro e a câmera; desligar restaura a aparência normal.

- Botão só-ícone só em ação repetida por linha, controle de mapa ou painel, ou convenção universal (fechar, anterior/próxima, tela cheia), sempre com `aria-label` e tooltip. A ação primária única da tela mantém o rótulo.
- Listas usam o primitivo de linha em subgrid: colunas fixas, ações no mesmo X.
- Informação secundária aparece no hover e em `:focus-within`; em `@media (hover: none)` fica sempre visível. Não esconda o essencial nem o único caminho de uma ação.
- Hover não move a câmera do mapa. Só clique ou Enter movem.
- Nota editável usa `editableNote` (`src/trip/note-edit.ts`): o texto vira o próprio Markdown no lugar e cada save é um `PATCH` de uma linha. Com um editor aberto, o documento não repinta.
- O chrome é acromático. Cor de categoria só em pinos, glifos de categoria e pontos. Exceções pedidas pelo usuário: os ícones de orçamento do card do dia, da nota do dia e do valor de cada parada, à direita da nota (comida `--color-food`, ingresso `--color-ticket`), o botão de rota do card do dia quando ligado (fundo `--color-walk`), e os de previsão do tempo (o pack duotone de `public/weather/`, com as cores do próprio SVG).

Cada primitivo novo acrescenta a regra dele neste arquivo. Os atuais estão em [docs/ui-primitives.md](docs/ui-primitives.md): `el`, `prefersReducedMotion`, `icon`, `iconButton`/`iconLink`, tooltip, `row`, `aiBadge`, `openDialog`, `videoButton`, `editableNote`, `weatherIcon`.

Raio concêntrico: `r_interno = r_externo − distância até a borda`, piso `--r-min`, canto reto `--r-none`. Os pares (`--r-card`/`--inset-card`/`--r-card-inner`, e o mesmo para row, popover e group) ficam em `src/styles/tokens.css`. Filho que encosta no canto usa o `*-inner`. Linha de uma linha é `--r-pill`; linha com `.tb-row__sub` é `--r-row`. Foco é `outline` + `outline-offset`, nunca `box-shadow`. Quem rola é `.tb-panel__body`, não o card arredondado. `grep border-radius src/styles` só pode mostrar `var(--r-*)`.

## Como um LLM edita um roteiro

Estado de revisão: `  - status: fechado` logo sob o H3 registra um dia aprovado pelo usuário; preserve esse plano salvo pedido dele. `  - status: a confirmar` sob uma parada ou nota de sub-ponto indica dúvida explícita. Nunca feche um dia nem retire uma dúvida por conta própria. São metadados, não anotações; não alteram horários, orçamento ou rota.

Formato: [`content/SCHEMA.md`](content/SCHEMA.md). Um arquivo por viagem em `content/trips/<id>.md`. Antes de mexer num roteiro, siga [`.claude/skills/roteiro/SKILL.md`](.claude/skills/roteiro/SKILL.md): onde vai cada informação, o que não acrescentar e o que conferir no app.

- H1: título da viagem.
- H2: cidade, na ordem. A linha seguinte é `city: <slug>` do catálogo; `dates: YYYY-MM-DD → YYYY-MM-DD` é opcional.
- Meta de comida: `budget: comida €50` no cabeçalho da cidade, junto de `city:` e `dates:`, é por pessoa por dia. Fica só no Markdown, como `city:`; o chip de comida do card do dia avisa quando a data passa. Ingressos não têm meta.
- H3: `### Dia N — Título`.
- Parada: bullet com `HH:mm` opcional e link `[Rótulo](place:<id>)` (o id já existe naquela cidade) ou URL `https://…`. Nota depois de ` — `.
- Trecho: `  - via:` embaixo da parada de saída, com uma ação curta e a duração (`Pegar um Bolt · 35 min`). O detalhe do trajeto vai depois de ` — ` e aparece embaixo do trecho. Preço (`· €2,55`, antes da nota) só quando é gasto a mais que o passe semanal.
- Parágrafo sob o dia é narrativa: entra no documento e no export, não vira pino.
- Comentário: `  - comentário: …` recuado sob uma parada ou nota de lista é um pedido do usuário para aquele ponto, escrito pelo app. Quando ele pedir para ler os comentários, rode `grep -n "comentário:" content/trips/<id>.md`; a parada é o bullet sem recuo logo acima. Aja em cada um e apague a linha dele. Não substitua o comentário atendido por anotação, resumo de conclusão ou `decisão:`. Novas decisões só são registradas se o usuário pedir explicitamente esse registro.
- Decisão: `  - decisão: <AAAA-MM-DD> · …` sob uma parada ou nota de lista é o que o usuário decidiu ali. Fica: nunca desfaça, mova nem apague o que ela protege sem ele pedir; antes de mexer numa parada, `grep -niE "decis(ão|ao|ion):" content/trips/<id>.md`.
- Sem comentário HTML, front matter YAML ou HTML cru.
- Os km a pé de cada dia são calculados pelo app a partir das rotas (OSRM) a cada save, na ordem dos horários das notas dos sub-pontos. Caminhada que a rota não vê (dentro de museu, filas) entra como nota `- +3 km — motivo` sob a parada; fora isso, não escreva distância no roteiro.

Edite o `.md`. Com `npm run dev`, o save avisa o browser (`tb:trip`) e o roteiro aberto é relido de `/api/trips`. O usuário edita o mesmo arquivo pelo browser enquanto você trabalha, uma linha por save. Use Edit, que troca um trecho do arquivo atual; não use Write num roteiro, porque ele regrava o arquivo inteiro a partir da sua cópia e apaga o que o usuário salvou nesse meio-tempo. Não duplique o roteiro em TypeScript. Coordenadas, avaliações e ranking de hotel ficam em `src/data`; o arquivo da viagem só referencia ids.

Trecho de trem ou metrô entre dois lugares só aparece no mapa se `src/data/travel-itinerary-legs.ts` tiver uma perna para esse par (a lista da viagem é `tripEuropa2026`). Monte a perna com `ride(linha, estação, estação)` sobre as estações de `src/data/travel-transit-lines.ts`, que vêm do OSM. Mudou uma parada que tem `via:` de trem? Atualize a perna junto.

## Quem edita onde

O usuário vê o app pelo checkout principal (porta 5173). Um worktree (`.claude/worktrees/<nome>`) tem cópia própria de `content/trips` e `src/data`: uma edição feita lá não aparece no app do usuário até o merge, e o `PATCH` que o usuário salva pelo browser vai para o checkout principal, não para o worktree.

- Tarefa de conteúdo (roteiro, catálogo) com o app aberto: edite no checkout principal. Se estiver num worktree, diga no resumo que a mudança ficou só no branch e como ela chega ao `main`.
- Antes de tocar num dia do roteiro: `git worktree list` e `git log main..<branch>` de cada branch que mexeu naquele dia ou em `src/data/travel-visit.ts`. Rebase no branch que já mudou aquele dia.
- Porta do Vite: `lsof -nP -iTCP:<porta> -sTCP:LISTEN` antes de subir. Num worktree, `npx vite --port <livre> --strictPort`.
- Sem `origin`: merge é local. `git merge main` no branch, `tsc` + testes, depois `git -C <checkout-principal> merge --ff-only <branch>` com o `main` limpo.
- `git stash` é compartilhado entre worktrees. Nunca `git stash` / `git stash pop` puros.

## Catálogo de lugares

A fonte da verdade é `src/data/travel.ts` (`travelCities`), com `travel-visit.ts`, `travel-photos.ts` e `travel-subcategories.ts`. Não há CMS nem sincronização: o Notion era do portfólio e não é usado aqui. Lugar novo ou correção vai direto nesses arquivos.

Lugar grande (parque, palácio) pode ter `subPoints`: pontos internos em ordem de caminhada, com nome em en e pt-BR e coordenada do OSM. A rota do dia entra pelo primeiro, passa por todos (bolinhas com nome no mapa) e sai do último; a timeline lista os pontos embaixo da parada. `photo` opcional (thumb Commons `500px-…`) aparece no card quando o ponto é expandido (um aberto por vez); com o card aberto o mapa numera os pontos, o hover realça a bolinha e o ponto expandido fica destacado. Ponto que é um lugar do catálogo (atração ou restaurante de um parque, como na Disney) leva `placeId`: a comida e o ingresso dele entram no orçamento do dia e no valor da linha do parque, e esse lugar não desenha pino próprio (a bolinha do ponto é dele; o clique abre o card do pai naquele ponto). Ponto que o LLM sugere sem pedido pelo nome (um lugar de foto) leva `aiSuggested: true`. A nota do roteiro sobre um ponto é uma nota de lista com hora sob a parada do pai, começando pelo nome do ponto em negrito: ela aparece dentro do ponto no card, não na timeline.

Vídeo de referência (reel do Instagram) entra em `videos` do lugar, sem a query de compartilhamento (`?stkn=`, `?igsh=`). O teste de `src/ui/video.test.ts` falha se sobrar query.

Favorito: `favorite: true` no lugar desenha o coração na lista e no card e dá prioridade no ranking de hotéis. Só grava a pedido do usuário; o LLM nunca tira um `favorite` existente por conta própria.

Sugestão de IA: todo lugar que o LLM acrescenta sem pedido direto pelo nome (busca na região, "achei perto do X", alternativa que ele mesmo propôs) leva `aiSuggested: true` e `aiReason` (en e pt-BR) dizendo o porquê. Lugar que o usuário pediu pelo nome não leva. Vale para qualquer lugar do catálogo, não só o guia da cidade.

## Guia da cidade (Mercado e Comidas)

Um arquivo por cidade, `src/data/travel-guide-<cidade>.ts`, registrado em `cityGuide` (`src/data/travel-guide.ts`). Cidade sem guia mostra as abas vazias.

- Grupos e ordem: `marketShelves` (Mercado) e `foodMeals` (Comidas), no mesmo arquivo.
- Item: `name` e `description` em en e pt-BR, `photo` do Commons (thumb `500px-…` em `upload.wikimedia.org`), `where` com 1 a 3 ids do catálogo da mesma cidade, o melhor primeiro.
- Loja ou restaurante que ainda não existe entra antes em `travelCities` (foto em `travel-photos.ts`) e só depois no `where`. Assim vira pino, card e parada possível do roteiro.
- Lugar que a IA adiciona segue a regra de sugestão de IA em "Catálogo de lugares" (`aiSuggested` + `aiReason`). O card mostra as faíscas de IA com o motivo no tooltip, e o teste exige um motivo: algum item do guia aponta para ele, ou o lugar traz `aiReason`, como os achados perto de outro lugar.
- `src/data/travel-guide.test.ts` falha com id desconhecido, texto vazio ou foto fora do padrão.

Mapa interno: `louvreMapButton` abre `openDialog` com plantas oficiais, níveis e sequência numerada. Coordenadas e roteiro vêm do catálogo; não desenhar caminhos por corredores sem validação. Selecionar uma etapa troca o andar; zoom e arraste ficam dentro da modal.

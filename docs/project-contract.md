# Contrato de desenvolvimento e UI

Referência canônica vinculada por `AGENTS.md`. Leia a seção da tarefa antes de editar. Regras de conteúdo na [autoria](../.claude/skills/roteiro/references/authoring.md); publicação em [publication.md](publication.md).

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
- Desktop em 1440×900 e mobile até 767px: top bar transparente sobre o mapa, com menu circular com fundo, busca e controles de água, banheiros e favoritos em linha à direita; menu lateral sobreposto com roteiros, cidades e ações secundárias; viewport dividido igualmente entre mapa acima e conteúdo com rolagem abaixo. Respeitar viewport dinâmico e áreas seguras.
- No mobile, primeiro toque no lugar seleciona e centraliza no mapa; novo toque no mesmo lugar abre os detalhes em modal. Fechar mantém seleção e posição da lista; mudar de roteiro/cidade limpa a seleção. Ações internas das linhas não contam como toque no lugar. Desktop mantém abertura direta do painel.
- Escopo só da tarefa. Se o diff passar de ~250 linhas, pare e divida.
- Lógica não trivial (parser, heurística, cálculo) ganha teste no padrão de `src/trip/parse.test.ts`.
- Antes: `graphify query`, depois os arquivos da tarefa. Depois: `npx tsc --noEmit && npm test`, olhar no browser (`npm run dev`, 1440×900), `graphify update .`, commit `feat(<fase>.<n>): …` ou `fix(…)`.
- Marcações 🤔 no plano são suposição. Verifique antes de depender delas.

UI (vale a partir da Fase 1):

- No roteiro, todos os lugares do catálogo continuam disponíveis no mapa e seus cards permanecem acessíveis, mesmo fora da viagem ou do dia ativo. Ao ativar uma rota, suas paradas ganham numeração e mantêm o tamanho e a opacidade padrão; os demais pontos diminuem e ficam mais transparentes, recuperando o destaque no hover ou na seleção. Lugares internos continuam representados pelos subpontos do pai.

- Localização (`locationControl`, `src/map/location.ts`): toque explícito liga/desliga acompanhamento e solicita permissões. Posição, precisão e bússola ficam numa camada própria, também no mobile e no roteiro; apenas o primeiro resultado centraliza a câmera. Direção usa bússola calibrada ou orientação absoluta, nunca rotação relativa. Desligar, sair da página ou desmontar o mapa libera GPS e sensores; sem bússola, mantém apenas a posição.

- Controles do mapa: navegação (zoom, enquadrar, tela cheia) e camadas (água, banheiros, favoritos) ficam em barras separadas. “Mostrar favoritos” troca apenas os pins de lugares com `favorite: true` por corações vermelhos (`--color-favorite`), com escala, destaque no hover e seleção como nos pins, preservando os demais pins, a numeração do roteiro e a câmera; desligar restaura a aparência normal.

- Botão só-ícone só em ação repetida por linha, controle de mapa ou painel, ou convenção universal (fechar, anterior/próxima, tela cheia), sempre com `aria-label` e tooltip. A ação primária única da tela mantém o rótulo.
- Listas usam o primitivo de linha em subgrid: colunas fixas, ações no mesmo X.
- Informação secundária aparece no hover e em `:focus-within`; em `@media (hover: none)` fica sempre visível. Não esconda o essencial nem o único caminho de uma ação.
- Hover não move a câmera do mapa. Só clique ou Enter movem.
- Voos usam curvas ilustrativas entre aeroportos, com traços longos animados na direção do destino; movimento reduzido desliga a animação. Não representam o trajeto real do avião.
- Com todos os cards de dias fechados, o mapa mostra os deslocamentos conhecidos entre cidades e seus terminais, incluindo bate-voltas. Fechar o último card enquadra o conjunto; abrir um dia restaura a rota daquele dia.
- Em zoom distante (abaixo de 11), os pontos de lugares, estações e subpontos dão lugar a um ponto por cidade representada. Clique no ponto aproxima a cidade; ao aproximar, os pontos individuais reaparecem.
- Ao chegar ao zoom 11, pontos individuais aparecem com fade e trajetos de trem/voo entre cidades ficam ocultos. Ao afastar, esses trajetos voltam. Movimento reduzido desliga o fade.
- Metrôs, RER e Transilien do roteiro ativo permanecem visíveis no mapa ao aproximar, com todas as estações do trecho. Bate-voltas regionais como Paris–Versalhes não recebem a ocultação de trajetos entre cidades. Todos os subpontos dos jardins visitados no roteiro têm horário estimado.
- Nota editável usa `editableNote` (`src/trip/note-edit.ts`): o texto vira o próprio Markdown no lugar e cada save é um `PATCH` de uma linha. Com um editor aberto, o documento não repinta.
- O chrome é acromático. Cor de categoria só em pinos, glifos de categoria e pontos. Exceções pedidas pelo usuário: os ícones de orçamento do card do dia, da nota do dia e do valor de cada parada, à direita da nota (comida `--color-food`, ingresso `--color-ticket`), o botão de rota do card do dia quando ligado (fundo `--color-walk`), e os de previsão do tempo (o pack duotone de `public/weather/`, com as cores do próprio SVG).

Cada primitivo novo acrescenta a regra dele neste arquivo. Os atuais estão em [docs/ui-primitives.md](ui-primitives.md): `el`, `prefersReducedMotion`, `icon`, `iconButton`/`iconLink`, tooltip, `row`, `aiBadge`, `openDialog`, `videoButton`, `editableNote`, `weatherIcon`.

Mala na timeline: exceção autorizada para o SVG `suitcase-rolling.svg` fornecido pelo usuário, via `weatherIcon`, com as cores originais. Aparece na coluna de valores, como o pôr do sol, com nome acessível e tooltip “Com as malas”. `luggageStops` acompanha as ações de checkout e check-in na primeira linha de cada parada/nota, incluindo os dois extremos e atravessando cidades/datas; detalhes multilinha de reservas não iniciam um checkout. Depois do check-in, a marca desaparece até o próximo checkout. Deixar/guardar/depositar as malas suspende a marca depois do depósito; retirar/recolher/buscar as malas a retoma, incluindo a retirada. Não acrescentar notas para registrar a implementação.

Raio concêntrico: `r_interno = r_externo − distância até a borda`, piso `--r-min`, canto reto `--r-none`. Os pares (`--r-card`/`--inset-card`/`--r-card-inner`, e o mesmo para row, popover e group) ficam em `src/styles/tokens.css`. Filho que encosta no canto usa o `*-inner`. Linha de uma linha é `--r-pill`; linha com `.tb-row__sub` é `--r-row`. Foco é `outline` + `outline-offset`, nunca `box-shadow`. Quem rola é `.tb-panel__body`, não o card arredondado. `grep border-radius src/styles` só pode mostrar `var(--r-*)`.

## Componentes do guia e busca

Mapa interno: `louvreMapButton` abre `openDialog` com plantas oficiais, níveis e sequência numerada. Coordenadas e roteiro vêm do catálogo; não desenhar caminhos por corredores sem validação. Selecionar uma etapa troca o andar; zoom e arraste ficam dentro da modal.

Seletor de avaliação: `ratingPicker` (`src/ui/rating-picker.ts`) combina estrelas de 0 a 5 em passos de 0,5 com número editável em décimos. Zero é uma nota; campo vazio remove a nota. Setas, Home e End operam as estrelas; o salvamento mantém o controle focado.

Busca da top bar: `mountSearch` (`src/app/search.ts`) mostra autocomplete em dois grupos, roteiro aberto e catálogo de cidades. Digitar não filtra a tela nem move o mapa; clique ou Enter abre o resultado, setas navegam e Escape fecha. O campo mantém o foco com `aria-activedescendant`. ⌘K/Ctrl K foca a busca. A exportação da top bar é uma exceção autorizada de botão só-ícone, com tooltip explicando cópia e download do roteiro em Markdown.

Círculo de categoria: `placePin` (`src/ui/place-pin.ts`) compartilha o ícone por subcategoria, a cor e o contraste entre timeline e autocomplete. Resultados de paradas no autocomplete mostram `DD Mmm · HH:mm`, omitindo o horário quando não existe no roteiro.


## Servidor privado e APIs para agentes

O build público continua somente leitura. `npm run build:private` gera o frontend com editor para o servidor Node (`npm run build:server && npm start`), com `TB_PUBLIC_ORIGIN` explícito. Nunca publique `dist/` privado no Pages. Produção privada escuta apenas em loopback, com acesso remoto exclusivamente pela ACL do Tailscale. A preparação/ativação está em `docs/mac-mini-and-agent.md`; não ativar a instalação sem acesso e autorização para o Mac mini.

Para consultar/editar roteiros por agente, priorize `/api/agent` ou `scripts/travel-agent.mjs` após compilar o servidor: liste os dias, leia só o necessário, use a revisão recebida e aplique mudanças em lote. A proteção de decisões/aprovações não pode ser desativada pela API. Graphify continua sendo o mapa do código; SQLite é um índice descartável dos roteiros e catálogo.

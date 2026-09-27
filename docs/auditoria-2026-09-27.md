# Auditoria do Travel Boss — 2026-09-27

Auditoria contra os 12 critérios de sucesso definidos pelo usuário em 27/09/2026, seguida do plano de execução para Sonnet e Opus. Tudo o que está aqui foi verificado no código, nos docs e no grafo nesta data; suposição está marcada com 🤔.

## Saúde do repositório

| Item | Estado |
|---|---|
| `npx tsc --noEmit && npm test` | passam: 65 arquivos, 432 testes |
| Grafo `graphify-out/graph.json` | existe; última atualização 2026-09-27 |
| Worktrees ativos | 22 em `.claude/worktrees/` (a maioria já mesclada em `main`) |
| Roteiro | `content/trips/europa.md`: Paris (8 dias), Milão (2), Roma (1) |
| Catálogo de Paris | 232 lugares; 23 favoritos; 49 `aiSuggested`; 186 com `visit`; 6 com `osmRef` |

## Os 12 critérios

Legenda: ✅ atende · 🟡 parcial · ❌ não existe.

### 1. Edição colaborativa usuário + LLM sem conflito — 🟡

O que existe:
- Markdown é a fonte da verdade (`content/SCHEMA.md`); o app salva uma linha por vez com `PATCH /api/trips/<id>` ancorado no texto que o browser viu (`src/trip/api.ts`, `applyTripPatch`). Se a linha mudou, responde 409 e nada é gravado. Leitura e escrita acontecem no mesmo tick (`vite.config.ts`, `patchTrip`).
- O watcher do Vite avisa o browser (`tb:trip`) e o documento é relido; com um editor aberto, o documento não repinta (`editableNote`, `onEditing`).
- O LLM recebe a regra de usar `Edit` e nunca `Write` num roteiro (`AGENTS.md`), e `comentário:` é o canal do usuário para o LLM.
- `src/trip/api.test.ts` cobre o patch.

O que falta:
- **O app e o LLM muitas vezes não editam o mesmo arquivo.** O usuário vê o servidor do checkout principal (porta 5173) e cada sessão do Claude Desktop nasce num worktree com a própria cópia de `content/trips/europa.md`. A edição do usuário vai para `main`, a do LLM para o branch, e só se encontram no merge. As memórias da sessão registram exatamente isso (portas 5173–5175 mostrando roteiros diferentes; 22 worktrees). Nada disso está no `AGENTS.md`, então Grok, Sonnet e Opus não sabem.
- Duas gravações no mesmo instante ainda podem se perder (comentário `ponytail:` em `patchTrip`: "a lock file would close it"). Risco baixo, mas documentado como conhecido.
- Não há regra escrita sobre quem é dono de qual arquivo quando várias sessões rodam juntas (a memória privada do Claude diz "a sessão de conteúdo é dona de `europa.md` e `src/data`", o repositório não).

### 2. Cidade e viagem como duas áreas — ✅ (guias só em Paris)

- Cidade: lista por categoria e card com detalhes (`src/views/places.ts`, `place-panel.ts`), busca de hotéis Azul + Booking + Airbnb (`src/views/hotels.ts`, `/api/hotel-search`), abas Mercado e Comidas (`src/views/guide.ts`).
- Viagem: várias cidades num arquivo, dias, paradas, trechos por modo (a pé, transporte público, táxi, voo), mapa com rota e trechos de trem (`src/data/travel-itinerary-legs.ts`).
- Gap: `cityGuide` (`src/data/travel-guide.ts`) só registra Paris. Milão e Roma, que estão no roteiro, mostram as abas vazias.
- Gap: trecho de trem/metrô no mapa depende de uma perna em TypeScript (`tripEuropa2026`), uma segunda fonte fora do Markdown. Documentado no `AGENTS.md`, mas é atrito a cada mudança de parada.

### 3. Parada com duração, gasto, descrição e sub-pontos — 🟡

- Descrição própria do roteiro: ✅ nota depois de ` — `.
- Sub-pontos: ✅ `subPoints` no catálogo com nome, foto e `placeId`; expansíveis no card (`.tb-panel__subpoint`), bolinhas na cor da categoria do pai (`src/trip/mount.ts:484`) e numeradas com o card aberto (`.tb-subpoint-dot--n`). Disney tem 9 sub-pontos sem foto.
- Gasto: 🟡 vem só do catálogo (meio da faixa de `avgPricePerPerson` e `ticket`) mais o `€` de cada `via:`. Não há como escrever na parada um valor específico daquele dia (ingresso promocional, prato escolhido). O `€221 para 3` do Dia 4 é texto e não entra na conta.
- Duração esperada: 🟡 `durationMin/Max` do catálogo só alimenta o cálculo do "Roteiro em aberto" (`mount.ts:1611`). Não há duração por parada no Markdown nem exibição da estadia prevista na timeline.

### 4. Clima por período definido pelas paradas — 🟡

- Os períodos seguem almoço e jantar, não o relógio (`src/trip/day-plan.ts`, `dayPeriods`): almoço às 14h ainda fecha a manhã. ✅
- Mas a previsão de cada período usa janelas fixas de relógio: manhã 7–12, tarde 12–18, noite 18–23 (`WINDOWS` em `src/trip/weather.ts`; `paintWeather` em `mount.ts:1042` diz "on its fixed clock window"). Num dia com almoço às 14h, a manhã do card cobre paradas até 14h, mas o clima mostrado é o das 7h às 12h. ❌ nesta metade.

### 5. Documentação para o LLM (editar, manter padrão, receber feature) — 🟡

- Existe: `AGENTS.md` (arquitetura, contrato, formato, UI), `content/SCHEMA.md`, skill `roteiro` (onde vai cada informação, pesquisa, checagem), `docs/ui-primitives.md`, `docs/plano-paridade.md` (contrato de execução, fases 0–14 quase todas entregues, ver `git log`), grafo `graphify`.
- Falta: (a) o fluxo de **pedido de feature** não está escrito (como especificar, onde registrar, o que documentar ao terminar, como revisar o que já foi definido e sugerir); (b) as regras de colaboração do critério 1; (c) as regras de orçamento e de decisões (critérios 10 e 11) não existem porque as features não existem; (d) o `SCHEMA.md` está em inglês e o resto em português (cosmético).

### 6. Período "Em aberto" definido pelo usuário ou LLM — 🟡

- O app calcula sozinho: sobra de 2 h ou mais depois de uma parada vira o bloco "Roteiro em aberto" (`isOpenSlot`, `OPEN_SLOT_MIN = 120`). O `SCHEMA.md` diz que ele "não é escrito no arquivo".
- Não há como declarar um trecho ou uma tarde como aberta no Markdown. O bloco automático some assim que alguém preenche o buraco com uma parada, e não dá para dizer "das 15h às 18h fica em aberto de propósito".

### 7. Favoritos a pedido do usuário — 🟡

- `favorite: true` no catálogo (23 em Paris) desenha o coração na lista e no card e dá prioridade no ranking de hotéis. ✅ no dado.
- Não há regra escrita de que "favoritar" é o LLM gravar `favorite: true` em `src/data/travel.ts` a pedido, nem de que o LLM nunca tira um favorito sozinho. `AGENTS.md` não cita favoritos.

### 8. Ícone de sugestão de IA — 🟡

- `aiSuggested` + `aiReason` desenham as faíscas com o motivo no tooltip (`src/ui/ai-badge.ts`); o teste exige um motivo. 49 lugares em Paris. ✅
- A regra no `AGENTS.md` está só na seção "Guia da cidade". Não está escrita como regra geral: todo lugar que o LLM acrescenta sem pedido direto (busca na região, "achei perto do X") leva `aiSuggested` e `aiReason`.

### 9. Água e banheiro grátis por cidade — ✅

- `public/amenities/<cidade>.json` para as 9 cidades (`npm run travel:amenities`, Overpass), switches na aba Lugares, pinos no mapa, clique abre no Google Maps (`src/map/amenities.ts`, `src/views/places.ts:748`).

### 10. Orçamento diário por pessoa com aviso, sugestão e exceções — ❌

- O card do dia mostra comida e ingressos por pessoa e a nota do dia (`dateBudget`, `.tb-receipt`). ✅ como medição.
- Não existe meta de orçamento em lugar nenhum (grep por "limite", "budget per day", "orçamento diário" em `src`, `content`, `docs`, `AGENTS.md`, skill: nada). Sem meta não há aviso, sugestão nem exceção. O grafo não tem nó para isso.

### 11. Decisões do usuário lembradas pelo LLM — ❌

- O único registro é o `comentário:`, que o LLM apaga depois de agir. A decisão fica no chat e na memória privada do Claude (invisível para Grok, Sonnet e Opus em outra sessão). Nada no roteiro diz "isto foi decidido, não mexa".

### 12. Horário de funcionamento e melhor período — 🟡

- Catálogo: `bestTime` (109 lugares de Paris), `bestDay` (161), `tips` (179); `osmRef` (6) dá "aberto agora" ao vivo via Overpass (`src/views/open-now.ts`, com um avaliador de `opening_hours`).
- A skill `roteiro` §5 ensina a pesquisar horário no dia (Google Maps no painel, Transitous).
- Falta: o horário semanal não é guardado no catálogo, então cada sessão pesquisa de novo; nada confere se uma parada cai fora do horário (parada às 12h35 num lugar que fecha terça). 6 de 232 lugares têm fonte de horário.

## Varredura dos pontos de Paris

Três agentes Sonnet varreram os 232 lugares de Paris em 27/09/2026. As listas completas, por lugar, estão em [`docs/paris-pontos-revisao.md`](paris-pontos-revisao.md).

| Lista | Resultado | Tarefa |
|---|---|---|
| 1. Link do Google Maps que não abre o lugar direto | 40 de 232 verificados (25 abrem lista, 10 abrem o mapa sem card, 3 sem resultado, 1 lugar errado, 1 link que nem é do Maps) | E1 |
| 2. Sem foto, ou com foto que não carrega | 21 sem nenhuma foto · 0 fotos mortas (todas as 347 URLs de Paris carregam) | E2 |
| 3. Foto que não mostra a fachada nem o prato/produto | 54 de 211 revisados (36 sem fachada nem produto, 18 só com a fachada de um lugar de comida) | E3 |

Achados sistemáticos da lista 1:
- Os `mapsUrl` escritos à mão na forma `google.fr/maps/place/<Nome>/@lat,lng,zoom` (sem o trecho `data=!…!1s0x…`) centram o mapa mas não abrem o card: 8 lugares (Pierre Hermé, Cédric Grolet, Le Procope, Brasserie des Prés, Fric-Frac, Maison de Balzac, Bateaux-Mouches, Arnaud Nicolas).
- O único link com `query_place_id` (Torre Eiffel) é ignorado pelo Google, que abre o mapa na localização de quem clica.
- Um `mapsUrl` aponta para o site de um restaurante, não para o Maps (Église de la Madeleine).
- 25 links de busca abrem lista porque o nome casa com várias unidades (PAUL, Bouillon Chartier, Five Guys, McDonald's) ou com um lugar genérico (Invalides, Palais-Royal). O `googleMapsUrl` de `src/data/travel.ts` monta `search/?api=1&query=…` para 200 dos 232 lugares; nenhum usa `placeId`.

Método: (1) cada link foi aberto num Chrome headless (PinchTab) e a URL final foi lida: `/maps/place/` com o nome certo é `ok`; `/maps/search/` é lista; (2) cada URL de foto foi baixada com espera entre requisições (o Commons responde 429 quando há pressa, e isso não é foto quebrada); (3) as miniaturas foram vistas uma a uma por agentes com o critério "fachada ou produto principal".

## Plano de execução (Sonnet e Opus)

### Contrato para quem executa

Vale o contrato de `docs/plano-paridade.md` ("Contrato para quem executa") e o `AGENTS.md`. Além deles:

1. **Uma tarefa, um worktree, um branch** `claude/<id-da-tarefa>` a partir de `main`. Antes de começar: `git -C <main> status --short` (main limpo?) e `git worktree list`. Dentro do worktree, `ln -s <main>/node_modules node_modules` se faltar.
2. **Cada tarefa é dona só dos arquivos listados nela.** Precisou mexer em outro? Pare e anote no resumo. Duas tarefas da mesma onda nunca compartilham arquivo.
3. **Conteúdo e catálogo** (`content/trips/*.md`, `src/data/*`) só entram em `main` quando o usuário não está com esse arquivo aberto no app a partir de outro checkout. Na dúvida, avise no resumo que a mudança está só no branch.
4. **Antes de terminar:** `npx tsc --noEmit && npm test`, abrir no browser numa porta livre (`lsof -nP -iTCP:<porta> -sTCP:LISTEN`; `npx vite --port <porta> --strictPort`), `graphify update .`, commit `feat(<id>): …` ou `fix(<id>): …`, e o resumo diz: o que mudou, o que mudou junto sem ter sido pedido, o que ficou para o usuário decidir.
5. **Formato do roteiro mudou?** `content/SCHEMA.md`, `src/trip/parse.ts`, `src/trip/export.ts`, os testes e a skill `roteiro` na mesma tarefa.
6. **Regra nova para o LLM?** Entra no `AGENTS.md` (curta) e, se for sobre roteiro, na skill `roteiro`.
7. **Modelo:** Opus para parser, schema, timeline e mount (`src/trip/*`, `src/views/timeline.ts`); Sonnet para dados (`src/data/*`), docs, skills e cálculos puros com teste.
8. Diff acima de ~250 linhas: pare e divida.

### Status (2026-09-27, fim da sessão da auditoria)

Onda 1 executada por agentes e mesclada em `main` (tsc e 441 testes passando em cada merge):

| Tarefa | Modelo | Commit | Resultado |
|---|---|---|---|
| A1 | Sonnet | `bbcfb0e` | `AGENTS.md` ganhou "Quem edita onde", favoritos e a regra geral de `aiSuggested`; skill `roteiro` §2 e §3 |
| B1 | Opus | `3370672` | `decisão:` no parser, render sob a parada (glifo `verified`, sempre visível, editável), fora do export; `SCHEMA.md`, skill §2, `AGENTS.md`; 8 testes |
| C1 | Sonnet | `458cdd5` | `periodWindows` em `day-plan.ts`; a previsão de cada período cobre as paradas dele e o tooltip mostra a janela (`11h–17h`); 5 testes |
| E2 | Sonnet | `106b43c` | 16 dos 21 lugares sem foto ganharam foto do Commons |
| E1 | Sonnet | `b196ae7` | 39 dos 40 links abrem o card direto (`mapsUrl` canônico completo, o `data=` encurtado falha em aba nova); 10 pinos movidos |
| B2 | Opus | `fa7dac6` `748f775` `a830ad2` | `budget: comida €50` no cabeçalho da cidade (por pessoa por dia, só comida); o chip de comida ganha `is-over`, glifo `warning` e tooltip `€80,50 de €50 por pessoa`; a nota do dia mostra `Meta: €50 · passou €30,50`. A linha não aparece no documento nem no export. Paris ganhou a linha em `europa.md` (`6f2b50f`) |
| Card do dia (pedido de 27/09) | Fable | ver `git log src/trip/walk-distance.ts` | Só o número de paradas e o glifo do clima; a palavra e a leitura deslizam no hover ou foco (`.tb-reveal`); km a pé do dia somados dos segmentos a pé da rota (OSRM), recalculados a cada save |
| G2 | Fable | ver `git log scripts/check-travel-photos.py` | `parse_photos` agora usa lookahead: 243 chaves com URL e as 354 URLs entram na checagem (antes, 122 e 185). Na rodada completa a 0,4 s o Commons devolveu 429 em 20 URLs, todas carregam devagar: 429 não é foto morta |

Conferido no browser (Dia 1 do Europa): a decisão aparece sob a parada em cinza com o glifo; os tooltips do clima dizem `11h–17h`, `17h–21h` e `21h–24h`, batendo com as paradas e o almoço às 14h30.

Ficou para o usuário decidir:
- `par-pierre-herme` (Champs-Élysées) consta como fechado em definitivo no Google: tirar do catálogo ou apontar para outra loja Pierre Hermé.
- Pinos movidos pela E1 para o pino do Google (conferir se algum era proposital): `par-cdg-paul` 297 m, `par-orly-paul` 589 m, `par-orly-m14` 550 m, `par-boulogne` 378 m, `par-five-guys-rivoli` 792 m, `par-mcdonalds-champs` 218 m, `par-promenade-plantee` 370 m (ancorado na Bastille), `par-trianon` 384 m (Grand Trianon), `par-creteil-soleil` 224 m, `par-metro-2` 430 m (de Pigalle para Anvers, onde o roteiro embarca).
- 5 atrações da Disney seguem sem foto livre no Commons: Spider-Man W.E.B., Frozen Ever After, Stark Factory, Star Tours, Casa de Coco.
- Uma decisão pode ser apagada pelo app ao esvaziar o texto (mesmo caminho do comentário); bloquear custa poucas linhas em `note-edit.ts`.
- `docs/ui-primitives.md` ainda não cita o tipo `decision` do `editableNote` (B1 deixou para não colidir com C1).
- Os `routeStops` da linha 2 (Anvers, Barbès, La Chapelle) parecem deslocados ~0,01° de longitude (observação da E1, fora do escopo dela).

Onda 2 em andamento: B2 entrou; E3 (fotos fracas) em execução. Faltam B4, B3, D1 → D2, depois D3, A2, F1. G1 feita em 27/09 (24 worktrees e 7 branches mesclados apagados; sobra só o backup do dia da Disney). G2 feita.

### Onda 1 (sem dependências; arquivos disjuntos)

#### A1 · Regras de colaboração, favoritos e sugestão de IA no `AGENTS.md` — Sonnet
- **Critérios:** 1, 7, 8.
- **Arquivos:** `AGENTS.md`, `.claude/skills/roteiro/SKILL.md`.
- **Fazer:**
  - Seção "Quem edita onde": o usuário vê o servidor do checkout principal (5173); worktree tem cópia própria de `content/trips` e `src/data`; tarefa de conteúdo com o app aberto edita no checkout principal ou avisa que ficou no branch; antes de tocar num dia do roteiro, `git worktree list` e `git log main..<branch>` de cada branch; portas: `lsof` antes de subir o Vite.
  - Regra: "favoritar" é gravar `favorite: true` no lugar em `src/data/travel.ts`, só a pedido; o LLM nunca tira um favorito sem pedido.
  - Regra geral (fora da seção do guia): todo lugar que o LLM acrescenta sem pedido direto leva `aiSuggested: true` e `aiReason` (en e pt-BR); "buscar lugares na região" é o caso típico. Lugar pedido pelo nome não leva.
  - Na skill: §3 ganha a checagem do checkout; §2 ganha as duas regras.
- **Aceite:** `AGENTS.md` ≤ 120 linhas; sem duplicar o `SCHEMA.md`.
- **Tamanho:** ~40 linhas de doc.

#### B1 · `decisão:` sob a parada — Opus
- **Critérios:** 11 (base do 10).
- **Arquivos:** `src/trip/parse.ts`, `src/trip/parse.test.ts`, `src/trip/export.ts`, `src/trip/export.test.ts`, `src/trip/mount.ts`, `src/styles/trip.css`, `src/ui/icons.ts`, `content/SCHEMA.md`, `.claude/skills/roteiro/SKILL.md`.
- **Formato:** sub-bullet `  - decisão: …` (também `decisao:` e `decision:`), indentado como `comentário:`, sob uma parada ou nota de lista. Não é parada, não vira pino, não exporta. Pode quebrar linha com `\` como o comentário.
- **Fazer:** `DECISION_BULLET` ao lado de `COMMENT_BULLET`; `TripStop.decisions`; renderizar sob a parada com o glifo `verified` (entra em `ICONS`) e texto em `--color-text-secondary`, sempre visível (é informação essencial); export ignora; `SCHEMA.md` ganha a regra; skill `roteiro` §2: "Linha `decisão:` é decisão do usuário: nunca desfaça nem apague sem ele pedir. Antes de mover, trocar ou remover uma parada, leia as decisões dela (`grep -n "decisão:" content/trips/<id>.md`). Quando o usuário decidir algo no chat (exceção de orçamento, manter um lugar), grave a decisão na parada com a data: `- decisão: 2026-09-27 · manter o Margaux mesmo acima do orçamento`".
- **Testes:** parse (decisão sob parada, sob nota de lista, sem parada = erro `decision-no-stop`, quebra de linha), export (não sai).
- **Tamanho:** ~120 linhas.

#### C1 · Janela do clima segue as paradas do período — Sonnet
- **Critério:** 4.
- **Arquivos:** `src/trip/day-plan.ts`, `src/trip/day-plan.test.ts`, `src/trip/mount.ts` (só `paintWeather`), `docs/ui-primitives.md` (parágrafo do `weatherIcon`).
- **Fazer:** `periodWindows(rows, periods): Partial<Record<Period,[number,number]>>` em `day-plan.ts`: para cada período com pelo menos um horário, início = hora da primeira parada do período (manhã: mínimo 6); fim = hora da primeira parada do período seguinte, ou, no último período, hora da última parada + 1 (máximo 24); janela com menos de 1 h vira 1 h. Período sem horário usa `WINDOWS`. Em `paintWeather`, trocar `WINDOWS[period]` pela janela calculada. `weatherIn` já aceita qualquer janela.
- **Testes:** almoço às 14h → manhã termina às 14; jantar às 21h → noite começa às 21; dia sem horário → `WINDOWS`.
- **Aceite:** no Dia 3 (almoço 14h), a manhã usa a janela 7h–14h. O tooltip de `fillWeather` (`mount.ts:173`) hoje não diz as horas: acrescentar a janela (`7h–14h`) ao texto do tooltip, para dar para conferir.
- **Tamanho:** ~70 linhas.

#### E1 · Links do Google Maps quebrados em Paris — Sonnet (dados)
- **Critério:** lista 1 da varredura (`docs/paris-pontos-revisao.md`).
- **Arquivos:** `src/data/travel.ts` (só o bloco de Paris).
- **Fazer:** para cada lugar da lista "Links quebrados", abrir a busca no PinchTab (`pinchtab nav "<url>"; sleep 5; pinchtab eval "location.href"`), achar o resultado certo (nome e endereço batem), abrir o card e copiar a URL final `https://www.google.com/maps/place/<nome>/@lat,lng,17z/data=…!1s0x…` sem `?entry=…&g_ep=…`. Gravar em `mapsUrl` do lugar. Se o lugar não existe mais no Google (fechado), anotar no resumo em vez de inventar link. Conferir que `lat/lng` do catálogo ficam a menos de ~200 m do pino do Google; se não, corrigir com o `!3d…!4d…` da URL.
- **Aceite:** `npm test` (o teste de dados não muda) e cada `mapsUrl` novo abre o card direto.
- **Tamanho:** dados; dividir em duas tarefas se passar de 60 lugares.

#### E2 · Lugares de Paris sem foto ou com foto que não carrega — Sonnet (dados)
- **Critério:** lista 2 da varredura.
- **Arquivos:** `src/data/travel-photos.ts`, `src/data/travel.ts` (só `subPoints[].photo` da Disney).
- **Fazer:** buscar no Commons (`https://commons.wikimedia.org/w/api.php?action=query&list=search&srnamespace=6&srsearch=<nome>&format=json`), escolher fachada ou o prato/produto principal (café e padaria: comida, nunca fachada nem retrato), gravar thumb `https://upload.wikimedia.org/wikipedia/commons/thumb/<a>/<ab>/<Arquivo>/500px-<Arquivo>` com `alt` en/pt e `credit`. Sem foto livre? Deixar sem e anotar. Atrações da Disney: foto da atração (Commons tem `Category:Disneyland Paris`).
- **Aceite:** `npm run travel:photos:check` sem erro nos ids tocados (o script espera ≥ 0,4 s entre requisições: 429 do Commons não é foto quebrada, é pressa).
- **Tamanho:** dados.

### Onda 2 (depois da onda 1)

#### B2 · Meta de orçamento por pessoa por dia — Opus (depende de B1)
- **Critério:** 10.
- **Arquivos:** `src/trip/parse.ts` (+test), `src/trip/day-plan.ts` (+test), `src/views/timeline.ts` (+test), `src/trip/mount.ts`, `src/styles/trip.css`, `src/trip/export.ts` (+test), `content/SCHEMA.md`, `.claude/skills/roteiro/SKILL.md`, `AGENTS.md`.
- **Formato:** no cabeçalho da cidade, depois de `dates:`: `budget: comida €40 · ingressos €30` (por pessoa, por dia; um dos dois pode faltar). Export escreve a linha como está.
- **Fazer:** parser → `TripCity.budget?: { food?: number; ticket?: number }`; card do dia: chip que passa da meta ganha `is-over` (texto em negrito, glifo `warning` ao lado, sem cor nova: o chrome continua acromático e o ícone do chip mantém a cor já aprovada), tooltip "€52 de €40"; a nota do dia mostra meta, gasto e diferença. Skill `roteiro` §4: "Passou da meta? Diga no resumo onde economizar (trocar uma refeição, cortar um ingresso, lugar mais barato perto) e espere. Se o usuário abrir exceção, grave `decisão:` na parada com a data e não sugira cortar de novo esse ponto".
- **Testes:** parse (com e sem os dois valores; segundo `budget:` é erro), `overBudget(budget, target)`.
- **Tamanho:** ~150 linhas; dividir parser/dado (B2a) e UI (B2b) se passar.

#### B3 · "Em aberto" declarado no roteiro — Sonnet
- **Critério:** 6.
- **Arquivos:** `src/trip/day-plan.ts` (+test), `src/trip/mount.ts`, `content/SCHEMA.md`, `.claude/skills/roteiro/SKILL.md`.
- **Formato:** nota de lista cujo texto começa com `em aberto` ou `open` (qualquer caixa), com horário opcional: `- 15:00 Em aberto — até as 18h, ideias: Marais ou Canal`. Já é uma nota de lista válida hoje; a mudança é só de render.
- **Fazer:** `isOpenNote(text)` em `day-plan.ts`; em `mount.ts`, a nota de lista que casa vira o `openSlotRow` com o texto depois de ` — ` embaixo; o bloco automático não aparece no mesmo intervalo. Export mantém o bullet.
- **Testes:** `isOpenNote` (pt/en, com negrito, não casa "aberto até 18h").
- **Tamanho:** ~50 linhas.

#### B4 · Duração e gasto por parada no Markdown — Opus (depende de B1; sequencial a B2 no parser)
- **Critério:** 3.
- **Arquivos:** `src/trip/parse.ts` (+test), `src/trip/day-plan.ts` (+test), `src/trip/mount.ts`, `src/trip/export.ts` (+test), `content/SCHEMA.md`, `.claude/skills/roteiro/SKILL.md`.
- **Formato:** entre o link e ` — `, tokens separados por ` · `: duração (`· 2h`, `· 45 min`, mesmas regras do `via:`), `· comida €12`, `· ingresso €32` (por pessoa; faixa `€10–14` conta o meio). Exemplo: `- 10:00 [Louvre](place:par-louvre) · 4h · ingresso €32 — Vitória de Samotrácia…`.
- **Fazer:** `TripStop.stayMin`, `TripStop.food`, `TripStop.ticket`; duração aparece à direita do horário (sempre visível, pequena); `isOpenSlot` usa `stayMin` antes do catálogo; `dateBudget` usa o valor da parada no lugar do catálogo naquela data, e a nota do dia marca "(roteiro)" na linha. Export copia os tokens como estão.
- **Testes:** parse (cada token, ordem livre, dois iguais = erro), `dateBudget` com override.
- **Tamanho:** ~180 linhas; dividir em B4a (duração) e B4b (gasto) se passar.

#### D1 · Horário semanal no catálogo e no card — Opus
- **Critério:** 12.
- **Arquivos:** `src/data/travel-visit.ts` (tipo), `src/views/place-panel.ts`, `src/views/open-now.ts` (+test), `src/styles/places.css`, `AGENTS.md`.
- **Fazer:** `VisitInfo.hours?: string` na sintaxe `opening_hours` do OSM (`Mo-Fr 07:00-20:00; Sa 08:00-13:00; Su off`), `hoursChecked?: 'YYYY-MM-DD'`, `hoursSource?: string`. O card mostra o horário da semana e "conferido em <data>", e o "aberto agora" passa a usar `hours` quando não há `osmRef` (reaproveitar `isOpenFromOsmHours`). `AGENTS.md`: "Horário vai em `hours`, com `hoursChecked` do dia da consulta; horário sem fonte não entra".
- **Testes:** `isOpenFromOsmHours` com os padrões que a D3 vai gravar.
- **Tamanho:** ~100 linhas.

#### D2 · Aviso de parada fora do horário — Opus (depende de D1)
- **Arquivos:** `src/trip/day-plan.ts` (+test), `src/trip/mount.ts`, `src/styles/trip.css`.
- **Fazer:** `stopClosed(hours, date, time)`; parada com horário fora de `hours` ganha o glifo `warning` com tooltip "fecha às 17h" ou "fechado às terças". Lugar sem `hours` não avisa.
- **Tamanho:** ~60 linhas.

#### D3 · Preencher `hours` dos lugares do roteiro de Paris — Sonnet (dados; depende de D1)
- **Arquivos:** `src/data/travel-visit.ts`.
- **Fazer:** para cada `place:` do `content/trips/europa.md` em Paris (~70 ids), ler o horário no Google Maps pelo PinchTab (`pinchtab nav "https://www.google.com/maps/search/?api=1&hl=en&query=<nome>"`, `pinchtab text`, linhas `Monday 7 AM–8 PM…`), converter para `opening_hours` e gravar com `hoursChecked` do dia. Site oficial vale mais que o Google quando divergem (anotar em `hoursSource`).
- **Tamanho:** dados; dividir por dia do roteiro (D3a dias 1–4, D3b dias 5–8).

#### E3 · Fotos fracas de Paris (não mostram fachada nem produto) — Sonnet (dados; depois de E2)
- **Critério:** lista 3 da varredura.
- **Arquivos:** `src/data/travel-photos.ts`.
- **Fazer:** mesma receita de E2, trocando a foto de capa pela melhor disponível; manter a antiga como segunda foto quando ainda for útil. Dividir por categoria (E3a comida e cafés; E3b atrações, parques, compras, transporte) para duas sessões em paralelo sem tocar nas mesmas chaves.

### Onda 3

#### A2 · Skill `feature`: como o LLM recebe, executa e documenta um pedido de feature — Sonnet
- **Critério:** 5.
- **Arquivos:** `.claude/skills/feature/SKILL.md`, `AGENTS.md` (uma linha apontando).
- **Fazer:** roteiro em 6 passos: (1) `graphify query` e leitura dos arquivos; (2) escrever a tarefa no padrão deste plano (id, critério, arquivos, formato, fazer, aceite, testes, tamanho) em `docs/plano-<tema>.md` antes de codar; (3) desafiar o pedido com fatos (trade-off, o que quebra, `graphify affected`); (4) implementar no contrato; (5) documentar: `AGENTS.md` (regra), `content/SCHEMA.md` (formato), `docs/ui-primitives.md` (primitivo), skill `roteiro` (rotina); (6) revisar pontos previamente definidos que a feature muda e listar sugestões no resumo, sem aplicar.
- **Tamanho:** ~60 linhas.

#### F1 · Guias de Milão e Roma (Mercado e Comidas) — Sonnet
- **Critério:** 2.
- **Arquivos:** `src/data/travel-guide-milao.ts`, `src/data/travel-guide-roma.ts`, `src/data/travel-guide.ts`, `src/data/travel.ts` (lugares novos), `src/data/travel-photos.ts`.
- **Fazer:** o mesmo padrão de `travel-guide-paris.ts` e a rotina em `AGENTS.md` ("Guia da cidade"); um agente por cidade.

#### G2 · `scripts/check-travel-photos.py` pula metade das entradas — Sonnet
- **Achado da E2 (2026-09-27):** a regex que delimita cada chave em `travel-photos.ts` consome a aspa de abertura da entrada seguinte, então o script confere só uma entrada sim, outra não (8 de 16 ids pedidos; metade das 232 chaves do arquivo) e não avisa. Trocar o delimitador por um lookahead, e fazer o script aceitar 429 como "tente de novo mais devagar" em vez de "quebrado". Teste: rodar com `--only` em duas chaves vizinhas e ver as duas no relatório.
- **Arquivos:** `scripts/check-travel-photos.py`.

#### G1 · Limpeza de worktrees mesclados — usuário decide
- Listar com `git worktree list` e `git branch --merged main`; remover só com OK do usuário (`git worktree remove <caminho>` e `git branch -d <branch>`).

### Ordem e paralelismo

| Onda | Em paralelo | Modelo |
|---|---|---|
| 1 | A1 · B1 · C1 · E1 · E2 | Sonnet · Opus · Sonnet · Sonnet · Sonnet |
| 2 | B2 → B4 (mesmo parser, em sequência) · B3 · D1 → D2 · E3a · E3b | Opus · Sonnet · Opus · Sonnet |
| 3 | D3a · D3b · A2 · F1 (Milão) · F1 (Roma) | Sonnet |

Merge em `main` depois de cada tarefa, com `main` limpo: `git -C <main> merge --ff-only <branch>` (ou `git merge main` no branch primeiro, tsc + testes, e então o ff). Depois do merge, `graphify update .` em `main`.

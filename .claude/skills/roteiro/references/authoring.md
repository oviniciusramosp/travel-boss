# Autoria e revisão de roteiros

Referência canônica de roteiro, catálogo e revisão. `AGENTS.md` mantém as proteções obrigatórias; a [skill](../SKILL.md) seleciona detalhes por tarefa. O formato completo continua em [content/SCHEMA.md](../../../../content/SCHEMA.md). Consulte seções relevantes, sem carregar o arquivo inteiro para uma mudança pequena.

## Índice por tarefa

- Qualquer dia: [semântica e revisão](#como-um-llm-edita-um-roteiro), [onde editar](#quem-edita-onde) e [verificação final](#6-antes-de-dizer-que-terminou).
- Paradas, notas, transporte e mercado: [onde vai cada informação](#1-onde-vai-cada-informação).
- Restrições e efeitos: [o que não fazer](#2-o-que-não-fazer), [antes de editar](#3-antes-de-editar) e [regras que o texto controla](#4-regras-do-app-que-o-texto-controla).
- Pesquisa externa: [fontes do dia](#5-pesquisa-com-fonte-do-dia).
- Criar/mover lugar: [catálogo](#catálogo-de-lugares); guia: [mercado e comidas](#guia-da-cidade-mercado-e-comidas).
- Publicação: [procedimento e privacidade](../../../../docs/publication.md).

## Como um LLM edita um roteiro

Sub-pontos ficam restritos a pontos de interesse dentro de parques, jardins, palácios ou construções. Cidades, vilas e bairros não são lugares-pai: portos, praias, mirantes, igrejas, praças, escadarias e restaurantes neles entram como lugares individuais e paradas próprias. Estações de embarque e desembarque pertencem à linha do transporte.

Todo item de visita precisa referenciar um ponto ou sub-ponto, com categoria, ponto colorido e descrição; não deixe uma visita apenas como nota solta. Bairros como Montmartre são percorridos por paradas próprias de interesse (fotografia, caminhada, café etc.), sem um pino-pai do bairro. Estações de chegada e saída pertencem à linha do transporte, como no metrô. Pontos de comida ficam como paradas próprias no roteiro.

Nunca crie comentários ou instruções como linhas avulsas no meio da timeline, mesmo com horário ou título em negrito. Eles pertencem à nota de um ponto/sub-ponto existente ou à nota do trecho de transporte (`via: … — …`). Exemplo: almoço com comida própria durante a viagem fica na nota da row Frecciarossa, com o horário no texto; `- 12:00 **Almoço no trem** …` não é uma parada válida. Não crie um lugar fictício para acomodar o comentário. Na revisão de cada dia editado, confira que nenhuma instrução ficou solta entre as rows.

Notas só acrescentam informação necessária que a UI ainda não mostra. Não repetir estações intermediárias, destino, etapas seguintes ou duração/caminhada calculadas nos cards. `via:` com embarque consultado registra só o tempo dentro do transporte; não embutir espera nem caminhada no tempo do metrô. O trecho a pé fica no próprio card. Não deixe tarefas vagas como "conferir calendário" ou afirmações do Notion na nota quando a tarefa exige pesquisa: verifique a fonte oficial e escreva apenas a restrição prática. A fonte e os limites da pesquisa ficam em `docs/references/` e na resposta.

Revisão obrigatória em cada dia editado e em todo o roteiro quando o usuário pedir auditoria:
- Hospedagem: uma única parada por permanência dentro do mesmo período. Café da manhã, descanso, preparo das malas, checkout e saída dessa permanência ficam juntos; preservar os horários na nota e usar `saída:` para o deslocamento. Uma permanência contínua só pode aparecer em duas linhas quando uma encerra um período e a outra abre o seguinte. Retornos reais após passeio ou deslocamento são novas permanências e mantêm parada própria, mesmo dentro do mesmo período. Conferir os períodos calculados pelo app antes de concluir.
- Cidades: registrar `  - cidades: Milão → Veneza` sob o H3, antes das paradas, em dias com mais de uma cidade. Incluir base e destinos em ordem, inclusive bate-voltas (Paris → Versalhes), sem repetir a base na volta nem duplicar o dia em outro H2. Conferir o título no app.
- Valores: refeição e ingresso por pessoa ficam no indicador à direita, pelo catálogo, `comida:`, `ingresso:` ou preço no `via:`. Nunca repetir na descrição, nem como faixa, estimativa ou total equivalente do casal. Exceção: prato/produto/bilhete específico cujo valor seja diferente do indicador. Comprovantes e pagamentos privados permanecem nos detalhes da reserva. Conferir também sub-pontos.
- Malas: ação real na primeira linha: `Saída com as malas` ao deixar casa de amigo/hospedagem; `Chegada com as malas` no início da viagem. Checkout/check-in e depósito/retirada também controlam a marca. Conferir o ícone à direita de todas as paradas até guardar as malas, incluindo extremos e atravessando cidades/datas. Não chamar saída de casa de amigo de checkout nem criar nota sobre implementação.
- Refeições: conferir café da manhã, almoço, café da tarde e jantar; verificar se o café da hospedagem está incluído e cabe no horário. Comer no quarto/levar comida exige mercado aberto na véspera; contabilizar a compra uma vez e usar `comida: €0` no consumo já pago.
- Sacolas de mercado: minimizar sempre o tempo carregando compras. Priorizar mercado no caminho final da hospedagem, depois do jantar/passeio, e retorno direto para guardá-las; não encaixar compras antes de horas de visitas. Se houver perecíveis, conferir refrigeração e duração. Compra para consumo imediato (piquenique) fica junto da refeição. Conferir o tempo entre a compra e a entrega/consumo, não apenas a distância até o mercado.
- Check-in de voo (inclusive online) não equivale a guardar malas na hospedagem e não encerra a marca; conferir essa distinção na revisão de aeroportos.

Estado de revisão: `  - períodos fechados: manhã, tarde, noite` logo sob o H3 registra os períodos aprovados pelo usuário. O dia fecha automaticamente com os três períodos fechados e sem lugares em dúvida. Preserve as aprovações salvo pedido dele; o legado `  - status: fechado` equivale aos três períodos. `  - status: a confirmar` sob uma parada ou nota de sub-ponto indica dúvida explícita. Nunca feche um dia nem retire uma dúvida por conta própria. São metadados, não anotações; não alteram horários, orçamento ou rota.

Todo lugar principal sem status começa em dúvida. Certeza exige `  - status: confirmado`, só a pedido do usuário. Notas e sub-pontos não participam da revisão. Acrescentar um lugar sem confirmação torna um dia fechado pendente; não herde a confirmação do dia para lugares novos.

Formato: [`content/SCHEMA.md`](../../../../content/SCHEMA.md). Um arquivo por viagem em `content/trips/<id>.md`. Antes de mexer num roteiro, siga [`.claude/skills/roteiro/SKILL.md`](../../../../.claude/skills/roteiro/SKILL.md): onde vai cada informação, o que não acrescentar e o que conferir no app.

- H1: título da viagem.
- H2: cidade, na ordem. A linha seguinte é `city: <slug>` do catálogo; `dates: YYYY-MM-DD → YYYY-MM-DD` é opcional.
- Meta de comida: `budget: comida €50` no cabeçalho da cidade, junto de `city:` e `dates:`, é por pessoa por dia. Fica só no Markdown, como `city:`; o chip de comida do card do dia avisa quando a data passa. Ingressos não têm meta.
- H3: `### Dia N — Título`.
- Parada: bullet com `HH:mm` opcional e link `[Rótulo](place:<id>)` (o id já existe naquela cidade) ou URL `https://…`. Nota depois de ` — `.
- Gasto de comida específico da viagem: `  - comida: €30` sob a parada do catálogo substitui a estimativa do catálogo por pessoa naquela data, inclusive com zero. Entra no total, na nota de gastos e no valor da parada; export preserva. Não alterar o preço do catálogo para representar uma compra planejada da viagem. Detalhes em `content/SCHEMA.md`.
- Gasto de ingresso específico da viagem: `  - ingresso: €41,63` substitui a estimativa por pessoa naquela data. Entrada já incluída num pacote leva `€0`, com o pagamento registrado em uma única parada; não altere o preço geral do catálogo. Export e orçamento preservam o valor, inclusive zero.
- Trecho: `  - via:` embaixo da parada de saída. Título apenas com modo, operador ou linha (`Uber`, `Bolt`, `Táxi`, `M3`, `RER E`, `Frecciarossa`), sem "Pegar um" nem destino: os extremos já aparecem na timeline. Exemplo: `Uber · 15 min — Uber ou Bolt por estarmos com malas`. Alternativas e detalhes vão depois de ` — ` e aparecem embaixo do trecho. Duração permanece no campo próprio. Preço (`· €2,55`, antes da nota) só quando é gasto a mais que o passe semanal.
- Partidas: `  - saída: HH:mm` preserva a saída a pé prevista; `  - embarque:` registra data, serviço, estações e horários consultados conforme `content/SCHEMA.md`. Trem sem serviço conferido fica a confirmar; nunca calcular sua partida pela duração. Caminhadas são estimativas e conexões incompatíveis aparecem sinalizadas.
- Parágrafo sob o dia é narrativa: entra no documento e no export, não vira pino.
- Comentário: `  - comentário: …` recuado sob uma parada ou nota de lista é um pedido do usuário para aquele ponto, escrito pelo app. Quando ele pedir para ler os comentários, rode `grep -n "comentário:" content/trips/<id>.md`; a parada é o bullet sem recuo logo acima. Aja em cada um e apague a linha dele. Não substitua o comentário atendido por anotação, resumo de conclusão ou `decisão:`. Novas decisões só são registradas se o usuário pedir explicitamente esse registro.
- Decisão: `  - decisão: <AAAA-MM-DD> · …` sob uma parada ou nota de lista é o que o usuário decidiu ali. Fica: nunca desfaça, mova nem apague o que ela protege sem ele pedir; antes de mexer numa parada, `grep -niE "decis(ão|ao|ion):" content/trips/<id>.md`.
- Sem comentário HTML, front matter YAML ou HTML cru.
- Os km a pé de cada dia são calculados pelo app a partir das rotas (OSRM) a cada save, na ordem dos horários das notas dos sub-pontos. Caminhada que a rota não vê (dentro de museu, filas) entra como nota `- +3 km — motivo` sob a parada; fora isso, não escreva distância no roteiro.

Edite o `.md`. Com `npm run dev`, o save avisa o browser (`tb:trip`) e o roteiro aberto é relido de `/api/trips`. O usuário edita o mesmo arquivo pelo browser enquanto você trabalha, uma linha por save. Use Edit, que troca um trecho do arquivo atual; não use Write num roteiro, porque ele regrava o arquivo inteiro a partir da sua cópia e apaga o que o usuário salvou nesse meio-tempo. Não duplique o roteiro em TypeScript. Coordenadas, avaliações e ranking de hotel ficam em `src/data`; o arquivo da viagem só referencia ids.

Trecho de trem ou metrô entre dois lugares só aparece no mapa se `src/data/travel-itinerary-legs.ts` tiver uma perna para esse par (a lista da viagem é `tripEuropa2026`). Monte a perna com `ride(linha, estação, estação)` sobre as estações de `src/data/travel-transit-lines.ts`, que vêm do OSM. Mudou uma parada que tem `via:` de trem? Atualize a perna junto.

Todo trecho de trem/metrô exige estações de embarque e desembarque explícitas, todas as estações intermediárias ligadas no mapa e `embarque:` consultado para a data do roteiro. Use o serviço real para decidir quais estações ele atende; não confunda vértices da geometria com estações. Sem tabela disponível, mantenha o horário a confirmar e registre a limitação em `docs/references/`; nunca calcule a partida pela duração. Linha sem geometria não ganha uma reta que pareça trajeto completo, inclusive no modo offline. `período:` sob uma parada define o começo explícito de manhã/tarde/noite, sem aprovar esse período.

## Quem edita onde

O usuário vê o app pelo checkout principal (porta 5173). Um worktree (`.claude/worktrees/<nome>`) tem cópia própria de `content/trips` e `src/data`: uma edição feita lá não aparece no app do usuário até o merge, e o `PATCH` que o usuário salva pelo browser vai para o checkout principal, não para o worktree.

- Tarefa de conteúdo (roteiro, catálogo) com o app aberto: edite no checkout principal. Se estiver num worktree, diga no resumo que a mudança ficou só no branch e como ela chega ao `main`.
- Antes de tocar num dia do roteiro: `git worktree list` e `git log main..<branch>` de cada branch que mexeu naquele dia ou em `src/data/travel-visit.ts`. Rebase no branch que já mudou aquele dia.
- Porta do Vite: `lsof -nP -iTCP:<porta> -sTCP:LISTEN` antes de subir. Num worktree, `npx vite --port <livre> --strictPort`.
- Sem `origin`: merge é local. `git merge main` no branch, `tsc` + testes, depois `git -C <checkout-principal> merge --ff-only <branch>` com o `main` limpo.
- `git stash` é compartilhado entre worktrees. Nunca `git stash` / `git stash pop` puros.

## Catálogo de lugares

Localização: antes de criar ou mover um pino, conferir identidade, unidade e endereço na ficha exata do Maps ou objeto OSM, cruzando com o site oficial quando houver conflito. Registrar fonte, data e escolha de entrada/centro em `docs/references/`. Nunca usar coordenadas estimadas, o centro de câmera `@lat,lng` do Google, ou um resultado de geocodificação de endereço como prova da unidade. Em áreas grandes e estações, justificar o acesso ou ponto interno; distância ao centro do Maps, sozinha, não prova erro. Conferir também os `subPoints` e manter pino, endereço e link coerentes. `npm run travel:locations:check` é triagem, não certificação de identidade.

Descrição do lugar (`description`): um ou dois parágrafos curtos sobre o que é, sua história e por que é relevante; para comércio e serviços, identidade e especialidade, sem inventar importância histórica. Dicas gerais, acesso e melhor dia/horário ficam em `visit.tips`, `bestDay` e `bestTime`. Instruções que dependem da viagem (pedido escolhido, horário de saída, direção do passeio, compra planejada) ficam só na nota da timeline em `content/trips/*.md`. Manter a distinção nos dois idiomas.

A fonte da verdade é `src/data/travel.ts` (`travelCities`), com `travel-visit.ts`, `travel-photos.ts` e `travel-subcategories.ts`. Não há CMS nem sincronização: o Notion era do portfólio e não é usado aqui. Lugar novo ou correção vai direto nesses arquivos. Favoritos e avaliações editados pelo card ficam em `src/data/travel-place-edits.json`, com prioridade sobre os valores originais; `null` remove uma nota. O catálogo aplica esses valores também nas cópias resolvidas. O endpoint local `PATCH /api/places/:id` salva um campo por vez e avisa os clientes sem recarregar o card.

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


# Editar um roteiro

O formato está em `content/SCHEMA.md`. Esta skill cobre o que ele não diz: onde cada informação vai, o que não entra e o que conferir antes de dizer que terminou. Cada regra vem de um erro real (setembro de 2026).

## 1. Onde vai cada informação

Todo item de visita deve ter ponto ou sub-ponto com categoria, ponto colorido e descrição, nunca apenas uma nota solta. Passeios por bairros usam lugares de interesse como paradas próprias, sem pino-pai do bairro. Estações ficam na linha do transporte; comida fica em parada própria. Essa regra prevalece sobre o agrupamento de comida em sub-pontos descrito abaixo.

Nunca acrescente comentários ou instruções como rows avulsas na timeline, mesmo com horário e título em negrito. Vincule-os à nota do ponto/sub-ponto correspondente; durante um deslocamento, use a nota do `via:` depois de ` — `. Almoço com comida própria no trem é comentário da row Frecciarossa, com o horário no texto, não uma parada `- 12:00 **Almoço no trem** …`. Não crie lugar fictício para acomodar esse comentário.

Mercado: minimizar sempre o tempo carregando sacolas; comprar no final do passeio/jantar, perto da hospedagem, e seguir direto para guardar as compras. Para piquenique/consumo imediato, comprar junto da refeição. Conferir abertura, caminho, intervalo até guardar/consumir e refrigeração de perecíveis; proximidade do mercado sozinha não basta.

Malas: check-in de voo, inclusive online, não é check-in da hospedagem nem encerra o intervalo marcado.

Hospedagem: reunir as ações de uma mesma permanência (café da manhã, descanso, preparo das malas, checkout e saída) numa única parada por período, mantendo os horários na nota e a partida em `saída:`. Uma permanência contínua só pode aparecer em duas linhas quando uma encerra um período e a outra abre o seguinte. Retornos reais após passeio ou deslocamento são novas permanências e mantêm parada própria, mesmo dentro do mesmo período. Não criar outra linha da hospedagem só para registrar a saída.

Aplicar a revisão obrigatória de `AGENTS.md`: cidades, valores, malas e refeições. Dia com bate-volta/mudança de cidade declara `  - cidades: Milão → Veneza` sob o H3, antes das paradas; conferir o título no app. Não repetir na descrição o valor de refeição/ingresso do indicador à direita, nem faixa/estimativa/total equivalente do casal; só preço de prato/produto/bilhete específico diferente do indicador, além de pagamentos privados nos detalhes de reserva. Casa de amigo usa `Saída com as malas` na primeira linha, chegada inicial usa `Chegada com as malas`; conferir a marca até check-in/depósito e após retirada. Conferir as quatro refeições; saída cedo com comida própria exige compra na véspera em mercado aberto, contabilizada uma vez, e `comida: €0` no consumo já pago.

| Informação | Onde |
|---|---|
| O que fazer no lugar: o que pedir, ingresso, horário que importa | nota da parada, depois de ` — ` |
| Comida ou ingresso pago nesta viagem, por pessoa, diferente do catálogo | `  - comida: €30` ou `  - ingresso: €41,63` sob a parada; ingresso incluído num pacote pago em outro ponto leva `€0` |
| Como chegar à próxima parada | `  - via:` embaixo da parada de onde se sai |
| Detalhe do trajeto: preço do carro, onde encontrar o motorista, plataforma | nota do trecho, depois de ` — ` no `via:` |
| Caminhada de acesso a um transporte sem geometria interna validada | `  - acesso: A pé · 10 min — …` depois do `via:`, com duração estimada identificada na nota; `saída:` marca o início da caminhada. Não criar pino ou corredores fictícios |
| Quanto cada pessoa paga a mais que o passe semanal naquele trecho (ticket avulso num dia sem passe, a compra do passe) | `· €2,55` no `via:`, antes da nota. Trecho coberto pelo passe fica sem `€`. Entra no card de ingressos e aparece à direita do trecho |
| Narrativa do dia | parágrafo sob o dia |
| Alternativa, plano B, aviso de greve | só se o usuário pedir. Se não pediu, sugira na resposta |

- O título do transporte é apenas o modo, operador ou linha: "Uber", "Bolt", "Táxi", "M3", "RER E", "Frecciarossa". Nunca escreva "Pegar um", "até o hotel" ou repita o destino: a timeline já mostra os extremos. Exemplo: `via: Uber · 15 min — Uber ou Bolt por estarmos com malas`. Alternativas e instruções ficam na nota depois de ` — `; duração e preço ficam nos campos próprios. Não coloque o preço do carro na nota de outro ponto.
- O `via:` precisa de uma palavra de modo (a pé, metrô, RER, trem, ônibus, táxi, uber, bolt, carro, voo) antes da nota, e de exatamente uma duração. Voos podem omitir a duração enquanto ela não for conhecida; o mapa desenha uma curva ilustrativa entre os aeroportos.
- Nota curta: uma ou duas frases com o que o viajante precisa naquela hora. O histórico da pesquisa fica na resposta, não no roteiro.
- Nota necessária, sem duplicar a UI: não liste estações, destino, próximas etapas ou caminhadas que os cards já mostram. Com `embarque:` consultado, a duração de `via:` é embarque → desembarque, sem somar espera e caminhada. Exemplo: `Metrô M3 · 8 min · €2,20` não precisa de "inclui espera e caminhada até o Cesarino" nem da sequência de estações. Verifique avisos vagos em fonte oficial e registre só o efeito prático; fonte, pesquisa e limitações ficam nas referências e na resposta.

## 2. O que não fazer

- Não acrescente notas, dicas, alternativas ("Mais barato: …"), planos B ou avisos que o usuário não pediu.
- Texto que o usuário mandou entra como ele escreveu. Se o app depende de uma palavra que ele tirou (ver §4), avise em vez de recolocá-la escondido.
- Não mova, crie nem remova parada fora do pedido sem dizer. Se uma mudança pedida arrasta outra (horário de saída, orçamento, período, pino), diga qual mudou e por quê.
- Linha `decisão:` é decisão do usuário: nunca desfaça, mova nem apague o que ela protege sem ele pedir. Antes de mover, trocar ou remover uma parada, leia as decisões dela (`grep -niE "decis(ão|ao|ion):" content/trips/<id>.md`). Não registre a conclusão de um pedido como anotação ou `decisão:`. Ao atender um `comentário:`, apenas apague sua linha; não acrescente texto substituto. Para registrar uma nova decisão no roteiro, espere um pedido explícito do usuário para esse registro.
- Não mude preço, horário ou nota do Google no catálogo sem fonte consultada no dia.
- Não grave `favorite: true` num lugar por conta própria — só a pedido do usuário — nem tire um `favorite` existente sem pedido.
- Lugar novo que você acrescenta sem pedido direto pelo nome (busca na região, achado perto de outro lugar) leva `aiSuggested: true` e `aiReason` (en e pt-BR); pedido pelo nome não leva.

## 3. Antes de editar

1. Confira onde sua edição vai cair: app do usuário aberto no checkout principal (5173) ou você está num worktree próprio? Num worktree, a mudança só chega ao app do usuário depois do merge — avise no resumo (ver "Quem edita onde" no `AGENTS.md`).
2. `graphify query "<tema>"`. Depois leia o dia inteiro no `.md` e as paradas vizinhas.
3. Veja se outro agente mexeu no mesmo dia: `git worktree list` e `git log main..<branch>`. Rebase no branch que já mudou aquele dia.
4. Lugar novo entra antes no catálogo: `src/data/travel.ts`, foto em `travel-photos.ts` (café e padaria: foto da comida), visita e preço em `travel-visit.ts`. O `.md` só referencia o id.
5. Trecho de trem ou metrô só aparece no mapa com perna em `src/data/travel-itinerary-legs.ts` (`tripEuropa2026`, `ride(linha, de, até)`). Perna que ficou sem uso sai do arquivo.

## 4. Regras do app que o texto controla

- **Períodos do card.** A manhã termina na última parada antes do jantar que diz "almoço" ou "lunch" (ou piquenique antes das 16h). A noite começa na primeira que diz "jantar" ou "dinner" (ou piquenique a partir das 18h). Trocar uma nota pode mover os períodos.
- **Orçamento por pessoa.** Comida e ingressos vêm do catálogo, pelo meio da faixa, mais o `€` de cada `via:`. Os dois cards sempre aparecem, mesmo com €0, e um clique neles abre a nota do dia, lugar por lugar. Um gasto que só está escrito na nota ("Compre 2 tickets por pessoa, €2,55 cada") não entra na conta: ponha o preço no trecho. Passe semanal vai no primeiro trecho do dia em que começa a valer. Visita só por fora (fachada, passar pela Torre sem subir): a nota diz "por fora", "fachada", "passar na frente", "sem subir", "sem entrar", "não vamos subir" ou "não vamos entrar", e o ingresso do catálogo não entra. Se o usuário reescrever a nota sem nenhuma dessas, o ingresso volta: avise. Com "por dentro" na mesma nota, ele volta a contar. Parada que só olha o lugar sem consumir (um café famoso): a nota diz "sem comprar", "sem comer", "só olhar" ou "só visitar", e a comida do catálogo não entra nesse dia. Tirou ou pôs uma parada ou trecho com preço? Diga no resumo como os cards mudaram.
- **Meta de comida.** `budget: comida €50` no cabeçalho da cidade é por pessoa por dia; o chip de comida do card avisa quando a data passa. Passou? Diga no resumo onde economizar (refeição mais barata, lugar mais barato perto, tirar um lanche) e espere. Se o usuário abrir exceção, respeite-a e não sugira cortar esse ponto de novo; só grave `decisão:` se ele pedir explicitamente para registrar a exceção no roteiro. Ingressos não têm meta.
- **Trilhos da timeline.** A pé é pontilhado; trem, metrô e carro são contínuos. Caminhada de ~1 min não vira linha "A pé": o pontilhado liga as paradas direto. Carro de app só sai da porta quando parte da hospedagem; de outro lugar (café do aeroporto), o trecho até o carro é a pé.
- **Roteiro em aberto.** Sobrou 2h ou mais depois de uma parada (visita do catálogo, ou 1h, mais o trajeto)? O app põe o bloco "Roteiro em aberto" sozinho. Não invente parada para tapar o buraco: diga no resumo que há tempo livre e sugira, se fizer sentido.
- **Sub-pontos.** Parque ou lugar grande onde o roteiro caminha por dentro ganha `subPoints` no catálogo (OSM, em ordem de caminhada: entra pelo lado de quem chega e sai para o lado da próxima parada). Não escreva a rota interna na nota. No roteiro, a parada é o parque; atração ou restaurante lá dentro não é parada. Se tem horário e dica, vira nota de lista com hora (`- 10:15 **Ratatouille** — …`): o negrito tem de ser o nome do sub-ponto (en ou pt-BR, ou o começo dele), porque é por ele que o app tira a nota da timeline e a põe dentro do ponto no card do lugar. O ponto dele no catálogo leva `placeId` para a comida contar no orçamento. O `via:` para sair do parque fica embaixo da parada do parque; a timeline mostra o trecho logo antes da próxima parada. Como nota de lista não conta como refeição, o almoço e o jantar dentro do parque não dividem os períodos: valem 12h e 18h (Disney em 7/10).
- **Km a pé.** O card soma os trechos a pé da rota, na ordem dos horários das notas dos sub-pontos. Caminhada que a rota não vê (corredores do Louvre e do palácio de Versalhes, filas e idas e voltas na Disney) entra como nota de lista `- +3 km — motivo` sob a parada, que o app mostra no card do lugar, não na timeline; o tooltip do km mostra a rota e o acréscimo separados. Não invente o número: diga no resumo que é estimativa.
- **Pino.** Se o plano depende de um ponto exato (terminal onde o voo pousa, entrada, ponto de embarque), confira o pino no mapa. Para corrigir, use o `!3d…!4d…` do Google no catálogo.

## 5. Pesquisa, com fonte do dia

- Horário, nota e pino: Google Maps no painel do navegador (`google.com/maps/search/?api=1&hl=en&query=…`). Com o painel escondido, leia os `aria-label` que casam com `/day, .*(AM|PM|Closed)/`.
- Ingresso: site oficial. Brasileiro paga a tarifa de fora da UE/EEE.
- Trem, metrô, obras e greve: Transitous `api.transitous.org/api/v1/plan` (horário em UTC; em outubro some 2 h). Alerta da IDFM ("arrêt non desservi", obras à noite) vale mais que o plano calculado.
- Carro de app: páginas de rota da Bolt (`bolt.eu/fr-fr/cities/paris/route/<de>-to-<para>/`) e do Uber (`uber.com/global/en/r/routes/…`). O preço que vale é o que o usuário simulou no app.
- Pôr do sol: `api.sunrise-sunset.org` (UTC).
- Endpoints e casos já resolvidos estão nas referências compartilhadas: [Disney e fontes de transporte](../../../../docs/references/dlp-idfm-live-data-sources.md), [obras e interrupções em Paris](../../../../docs/references/paris-oct-2026-transit-disruptions.md) e [verificação de localização](../../../../docs/references/place-location-verification.md). As datas de consulta estão em cada arquivo; reconfira fatos que podem mudar. Os links funcionam tanto por `.claude/skills/roteiro/` quanto por `.agents/skills/roteiro/`.
- Fato sem fonte leva 🤔 na resposta.

## 6. Antes de dizer que terminou

1. `npx tsc --noEmit && npm test`.
2. Abra o dia no app (`npm run dev` na 5173; num worktree, `npx vite --port 5174 --strictPort`) e confira no card:
   - os períodos (manhã, tarde, noite) começam e terminam onde o usuário espera;
   - cada permanência na hospedagem tem uma única parada por período; retornos reais mantêm parada própria, e a mesma permanência só se repete entre o fim de um período e o início do seguinte;
   - os cards de comida e ingressos: batem com o que o dia gasta (entrada, ticket de metrô)? Se mudaram, explique;
   - cada trecho: nome curto, duração uma vez, nota embaixo, trilho certo (a pé pontilhado);
   - comentários e instruções vinculados à row correspondente, sem linhas avulsas entre pontos ou trechos;
   - os pinos no lugar certo do mapa.
3. `graphify update .` e commit `feat(trip): …` ou `fix(trip): …`.
   Publicação obrigatória por autorização permanente do usuário (08/10/2026): seguir `docs/references/publication-2026-10-03.md`, preparar cópia sanitizada a partir de `origin/main`, testar, publicar sem enviar o histórico privado local e conferir o workflow e o site. Não pedir nova confirmação; ajuste só termina após a publicação.
4. No resumo: o que mudou, o que mudou junto sem ter sido pedido e o que ficou para o usuário decidir.

# Fluxo de trabalho para agentes

As ferramentas desta branch usam o mesmo runtime em CLI, HTTP e MCP. Markdown e catálogo continuam sendo as fontes da verdade; SQLite, cache e prévias são auxiliares descartáveis. O fluxo recomendado é **doctor → contexto da data → evidências → prévia → aplicação → conferência**. Ferramenta disponível não concede autorização para mudar decisões, aprovações, favoritos, publicar conteúdo ou ativar serviços.

## Instalação local sem integrar main

Requer Node >=22.13. A partir desta branch com as dependências instaladas:

```sh
npm run build:server
npm run agent -- doctor
node scripts/install-agent-tools.mjs /caminho/absoluto/do/checkout-travel-boss
```

O instalador compila contra os arquivos `src/` reais do checkout de destino, inclusive alterações locais de catálogo/parser. Instala apenas em `node_modules/.cache/travel-boss-agent`, com troca de diretório e recuperação da instalação anterior se essa troca falhar. Não altera arquivos versionados, branch, app em execução, configuração de cliente MCP, Pages ou Mac mini. Dependências locais da branch que fornece a ferramenta precisam estar disponíveis para compilação; a instalação não executa `npm install` no destino.

No checkout de destino, use:

```sh
node node_modules/.cache/travel-boss-agent/scripts/travel-agent.mjs doctor
node node_modules/.cache/travel-boss-agent/scripts/travel-agent.mjs list
node node_modules/.cache/travel-boss-agent/scripts/travel-agent.mjs context europa 2026-10-05
```

Não suponha que o checkout principal já contém um script npm `agent`. Nesta branch, os equivalentes são `npm run agent -- <comando>` e `npm run agent:mcp -- <opções>`.

`doctor` mostra raiz real, revisão do projeto, revisão da ferramenta, data do build, versão Node, `catalogFresh` e `staleInputs`. O manifesto vincula o runtime à raiz e aos hashes dos módulos `src/` efetivamente empacotados. Raiz diferente, manifesto ausente/inválido ou entrada alterada bloqueia consultas/edições com 409; reinstale para aquele checkout. `--root` apenas seleciona o diretório de trabalho: não recompila nem troca o catálogo do runtime. Alterações posteriores no código da ferramenta também exigem novo build/instalação.

Roteiros, referências e favoritos/avaliações do browser são dados lidos em execução. Alterar `content/trips/*.md` ou `src/data/travel-place-edits.json` não exige reinstalação. Mudanças em parser/catálogo e demais fontes empacotadas exigem.

## Descoberta e transportes

`tools` devolve nomes, descrições e JSON Schemas aceitos. O contrato de edição é compartilhado por prévia/aplicação e recusa propriedades desconhecidas; não invente campos de aprovação ou formas de contornar precondições.

| Família | Ferramentas |
| --- | --- |
| Diagnóstico e regras | `travel_capabilities`, `travel_rules` |
| Contexto | `travel_list`, `travel_context`, legado `travel_day` |
| Catálogo e evidências locais | `travel_search`, `travel_place`, `travel_facts` |
| Pesquisa | `travel_research`, `travel_fact_record` |
| Edição | `travel_preview`, `travel_apply` |

CLI disponível: `doctor`, `tools`, `list`, `context <viagem> <data>`, `day`, `search`, `references`, `place`, `research`, `facts`, `record-fact`, `rules <tarefa>`, `preview`, `apply` e `call <ferramenta> <arquivo.json>`. `batch` é alias legado de `apply`. Arquivos JSON são entradas locais; mantenha payloads e saídas com reservas em diretório privado/ignorado, nunca em documentos públicos.

No servidor privado, sob `/api/agent`:

| Método | Caminho | Uso |
| --- | --- | --- |
| GET | `/capabilities`, `/tools` | Diagnóstico e esquemas |
| POST | `/tools/:nome` | Chamada com os argumentos do esquema |
| GET | `/trips` | Resumos e revisões |
| GET | `/trips/:id/context?date=YYYY-MM-DD` | Data completa; `includeRaw=true` inclui blocos exatos |
| POST | `/trips/:id/preview`, `/trips/:id/edit` | Mesmo payload de edição |
| GET | `/search?q=...`, `/references?q=...` | Busca paginada e filtros |
| GET | `/places/:id` | Lugar resolvido e projeção |
| POST | `/research`, `/facts` | Fonte externa ou registro de afirmação |
| GET | `/facts`, `/rules?task=edit` | Evidências anteriores ou resumo das regras |

O servidor de produção mantém as exigências de Host/origem/bearer token e JSON descritas em [mac-mini-and-agent.md](mac-mini-and-agent.md). Nenhuma dessas APIs existe no Pages estático.

MCP usa stdio, sem porta de rede e sem modificar configurações de clientes:

```sh
node node_modules/.cache/travel-boss-agent/scripts/travel-agent-mcp.mjs
# Acrescente --allow-writes somente quando esse subprocesso puder editar
# e registrar evidências dentro da tarefa autorizada.
```

O processo anuncia protocolo `2025-06-18`, `initialize`, `ping`, `tools/list` e `tools/call`. Sem `--allow-writes`, edição e registro de evidências ficam desabilitados; prévia permanece disponível. O sinalizador não libera alterações protegidas. A configuração do cliente que inicia o processo fica a cargo do usuário; instalar arquivos não registra automaticamente um novo servidor MCP.

## Contexto de uma data e projeções

`context <viagem> <YYYY-MM-DD>` usa o calendário do app e reúne todos os H3/cidades daquela data. `day` continua disponível para título exato/linha de H3, mas cobre somente aquele bloco. Uma data inexistente retorna 404, sem escolher silenciosamente um dia vizinho.

O contexto contém paradas e notas em ordem, comentários/decisões/status, períodos calculados e aprovações preservadas, catálogo com `resolveVisit`, endereços, favoritos/avaliações atuais, subpontos e sua associação às notas, orçamento por pessoa, gastos substituídos inclusive zero, limites de comida, vizinhos/hospedagem, malas de entrada/saída e trechos de transporte. Blocos exatos só entram com `includeRaw`; anchors, revisões e guards vêm na resposta normal.

Preços e durações de catálogo são estimativas. O contexto não busca horários atuais, disponibilidade nem OSRM. Usa serviços `embarque:` para calcular conflitos pelo mesmo código do app; transporte sem serviço/geometria suficiente gera aviso. Arestas de entrada/saída entre datas são identificadas como fronteiras; não representam confirmação de deslocamento.

Para catálogo e busca, `locale` aceita `pt-BR`, `en` ou `all`. `fields` seleciona campos de lugar, mantendo `id`/`city`. Exemplo de argumentos para `travel_place`:

```json
{"id":"par-louvre","locale":"pt-BR","fields":["name","address","visit","favorite"]}
```

O CLI aceita esse objeto de opções como arquivo após `place <id>`. `search`/`references` aceitam arquivo de opções depois da consulta, com `city`, `trip`, `place`, `date`, `kind`, `limit` e `offset`; `fields`/`locale` projetam os resultados de catálogo. No HTTP, `fields=name,address,visit` e `locale=pt-BR` são parâmetros de consulta. Resultados de referências trazem trechos limitados e proveniência, não arquivos inteiros. Metadados extraídos incompletos podem excluir resultados de um filtro: ausência em uma consulta filtrada não prova ausência no documento.

## Precondições e aplicação atômica

Use `context.blocks[].guards` de todos os dias tocados. Para mover entre datas, consulte origem e destino e reúna seus guards, eliminando duplicatas pelo `anchor`. `context.rows[].anchor` identifica paradas; `context.blocks[].anchor` identifica dias. Números de linha são apenas endereços daquela leitura.

Os anchors usam identidade semântica e ocorrência: não mudam com simples deslocamento de linhas, horário ou nota. Inserir/remover/mover ocorrências repetidas pode mudar endereços: depois de cada alteração estrutural, releia o contexto. Eles não são IDs imutáveis para guardar indefinidamente.

| Guard | O que protege |
| --- | --- |
| `date-content` | Conteúdo de todos os blocos H3 na mesma data |
| `calendar-budget-incoming-luggage` | Cabeçalhos/topologia de calendário, orçamento e estado de malas recebido |
| `adjacent-transport` | Extremos de transporte imediatamente anteriores/posteriores à data |

Mudança sem relação em outro dia pode preservar os guards e permitir a edição. Mudança em período diferente da mesma data ainda pode conflitar: a revisão de conteúdo tem granularidade de dia. Não envie apenas a revisão de uma parada como se substituísse todos os guards. Em 409, releia o contexto e recalcule a operação; não remova a precondição para forçar o save.

Forma recomendada, com valores reais copiados da resposta:

```json
{
  "preconditions": [
    {"anchor":"<anchor de guard retornado>","revision":"<sha256 retornado>"}
  ],
  "operations": [
    {"operation":"update-stop","target":"<anchor da parada>","changes":{"note":"Texto pedido pelo usuário"}}
  ]
}
```

O exemplo ilustra o formato; envie **todos** os guards exigidos, com seus valores completos. Alternativamente, `revision` SHA-256 do documento inteiro mantém o modo legado de concorrência. Edições exatas (`edits` com `before`/`after`) exigem a revisão inteira e correspondência única. Use-as quando o formato não couber nas operações estruturadas, sem regravar o roteiro inteiro.

| Operação | Campos principais e efeito |
| --- | --- |
| `update-stop` | `target`, `changes.time`/`note`; `time: null` remove horário |
| `insert-stop` | `day`, `stop` com `placeId`/`label` e horário/nota opcionais; `before` posiciona antes de outra parada |
| `move-stop` | `target`, `day`, `before` opcional; transporta o bloco completo |
| `remove-stop` | `target`; sujeito às proteções e validação |
| `set-cost` | `target`, `kind: food/ticket`, `amount`; zero conta como valor, `null` remove substituição |
| `set-transfer` | `target`, `detail`, `access`/`departure`/`boardings` opcionais; substitui os metadados de transporte daquele bloco |
| `resolve-comment` | `target`, `commentText` exato; remove o comentário atendido sem registrar conclusão |

Há até 100 operações por lote; **inserção, remoção e movimento exigem uma única operação estrutural por requisição, sem outras operações no mesmo pedido**. Releia os anchors resultantes antes da etapa seguinte. `set-transfer` substitui também acesso/partida/embarques anteriores: mantenha explicitamente os que continuam válidos. Catálogo e geometria de transporte seguem edição/revisão própria; essa API não cria lugares, pesquisa serviços ou altera pernas do mapa automaticamente.

`preview` planeja sem gravar. Retorna mudanças por data, incluindo notas/comentários/narrativas, delta de comida/ingressos, horários, períodos, estado das malas, revisão e conflitos de transporte computáveis; alterações de malas podem afetar datas posteriores. Ignora deslocamentos de números de linha sem efeito semântico. Alterações textuais podem aparecer sem mudar custos ou horários; linhas apenas deslocadas não tornam outros dias modificados. Reutilize o payload e as mesmas precondições em `apply`; a prévia não reserva o arquivo contra edições concorrentes.

A aplicação revalida o arquivo atual, usa lock exclusivo por roteiro e grava por rename. Falha em uma operação impede salvar o lote todo. Erros novos de parser/horário são recusados e problemas preexistentes continuam informados. O editor externo que ignora o lock ainda pode disputar uma gravação; o lock não é uma transação do sistema de arquivos para todos os programas.

## Proteções de conteúdo

Status confirmado permanece no mesmo bloco lógico: editar sua nota não cria nem remove a confirmação. Períodos aprovados protegem conteúdo e pertencimento das suas paradas; editar período ainda não aprovado é possível quando não modifica o aprovado. Uma mudança de nota que desloca almoço/jantar pode afetar esses limites e ser recusada.

`decisão:` e aliases protegem o bloco inteiro; remover um comentário atendido pode preservar a decisão, mas não libera mudar seu conteúdo. A API não tem sinalizador para autorizar decisões, status ou aprovações protegidos. Mudanças legítimas dessas proteções exigem o fluxo manual/browser controlado pelo usuário e autorização explícita. Mover parada confirmada pode preservar o mesmo status quando o bloco é inequívoco; não equivale a confirmar uma parada nova.

Prévia não substitui pesquisa oficial, auditoria de refeições/sacolas, interpretação de uma decisão nem a conferência visual prevista na [skill de roteiro](../.claude/skills/roteiro/SKILL.md). Publicação real segue [publication.md](publication.md). Ferramentas locais não publicam nem ativam deploy.

## Pesquisa estruturada e cache

Primeiro consulte `references`: o índice lê arquivos permitidos de `docs/references/`, preserva arquivo/linha/seção/fontes/datas e omite linhas sensíveis e conteúdo fora da projeção. Datas encontradas no texto não são atestado de validade. O filtro de privacidade é triagem: não copie reservas para referências nem para novos índices. Índice/cache/afirmações ficam sob `TB_STATE_DIR`; na instalação CLI/MCP, o padrão é `node_modules/.cache/travel-boss-agent-state` da raiz vinculada.

`research` aceita somente hosts HTTPS explícitos de `scripts/research-cache.ts`, sem credenciais, portas alternativas nem redirecionamentos. Timeout de 15 s, quatro consultas simultâneas, 1 MiB de entrada, texto extraído limitado a 16 mil caracteres e até 256 entradas. Não é um navegador universal; fontes não permitidas usam o mecanismo de pesquisa autorizado da tarefa.

A política usa validade por tipo (`general`, `hours`, `prices`, `timetable`, `weather`, `sunset`, `identity`), ETag/Last-Modified e revalidação condicional. Horários/preços vencem também à meia-noite de `America/Sao_Paulo`; horários de serviços e clima têm limites menores. Pôr do sol sem data fixa tem validade curta. Falha pode devolver evidência vencida dentro de `policy.staleMs`, sempre marcada `stale` com erro. Isso não autoriza usar dado vencido como fato atual.

`record-fact` exige assunto, tipo, afirmação, URL permitida, hash da resposta atual, trecho exato e data declarada da consulta; `effectiveDate` é opcional. O trecho precisa existir na fonte atual e fresca. O registro continua `verification: caller-assertion`, `evidenceStatus: exact-excerpt-matched`, `verifiedAt: null`: provar citação não prova a conclusão nem disponibilidade futura. `facts` omite vencidos por padrão e detecta fonte alterada. Regras de fonte do dia continuam obrigatórias.

## Medição e limites conhecidos

Resultados e reprodução: [agent-performance.md](agent-performance.md). `TB_AGENT_TRACE` permite registrar somente metadados de chamadas; não há coleta automática de prompts, reservas, tokens ou latência do modelo. Tempo/bytes das ferramentas e fluxos determinísticos não demonstram aceleração de uma tarefa real do LLM.

A redução de 79,4% dos pontos de entrada `AGENTS.md` + skill pertence à branch: detalhes foram movidos para referências por tarefa, com preservação das regras. O checkout principal mantém suas instruções versionadas até adotar essa alteração. A instalação ignorada entrega ferramentas locais separadamente; não integra documentos nem código em `main`. O deploy Mac mini permanece desativado até acesso e autorização específicos.

# Mac mini e ferramentas para agentes — preparação do PR #1

Implementação preparada na branch `feat/mac-mini-agent-performance`. **Nada foi instalado no Mac mini, nenhum serviço foi ativado e `main`/GitHub Pages não foram alterados.** A ativação continua dependendo de uma sessão no Mac mini e da revisão deste PR.

## O que mudou

- Servidor Node de produção em `build/server.mjs`, sem servidor Vite em execução. O frontend privado é um build separado, com editor habilitado e APIs reais.
- As fábricas das APIs de roteiro, checklist, lugares, clima e hotéis são reutilizadas por um adaptador de middleware. Os dois módulos que hotéis/lugares carregavam por Vite são resolvidos por uma lista fixa de módulos compilados. Não há carregamento arbitrário de arquivos TypeScript.
- Eventos SSE atualizam o roteiro e avaliações após saves em disco. As regras existentes de foco/editor continuam no frontend.
- SQLite persistente para linhas de roteiro e registros estruturados do catálogo. Usa FTS5 quando disponível; em distribuições de Node sem FTS5, usa tabela SQLite com texto normalizado e busca por termos. O retorno informa `engine`. Essa alternativa não tem o ranking nem a escalabilidade do FTS5.
- Revisões SHA-256, lock exclusivo por roteiro, gravação por rename, edição em lote, alteração estruturada de horário/nota e validação com o parser existente. CLI e HTTP compartilham a implementação.
- Cache de pesquisa externa com fontes permitidas, limite de tamanho, timeout, deduplicação, proveniência e validade. Clima e hotéis mantêm seus caches existentes, agora com localização persistente configurável.

## Como o deploy automático funcionará

Depois da ativação local, um LaunchAgent consulta `origin/main` a cada 120 segundos. Não recebe conexões do GitHub, não abre webhook e não registra runner no Mac. Apenas o repositório exato `oviniciusramosp/travel-boss` é aceito. A fonte é `main`; configure a proteção dessa branch no GitHub antes de ativar.

O controlador local:

1. Obtém um lock por diretório, compatível com macOS sem `flock`.
2. Recusa arquivos locais modificados, arquivos novos não ignorados e histórico divergente. Não faz reset, stash, commit ou push de edições do editor.
3. Busca o commit remoto e prepara um worktree separado. Executa instalação reproduzível, testes, builds e testes HTTP antes da troca.
4. Volta a verificar edições locais. Durante a operação, novas gravações recebem erro temporário; o documento continua legível. Isso impede que um save durante a troca seja perdido.
5. Troca atomicamente o link `current`, reinicia o serviço e exige `/healthz` com o SHA exato. Falha na troca/reinício/saúde restaura o link anterior e tenta reiniciar a versão anterior.

Uma falha anterior à troca preserva o serviço em execução. Candidatos com falha e releases anteriores são mantidos para inspeção. Uma repetição com o mesmo candidato existente exige intervenção local: confira seu estado e remova-o com `git worktree remove` apenas se estiver limpo. Não apague o diretório ativo. Um lock abandonado exige conferir se há deploy em execução antes de removê-lo.

O controlador e a configuração ficam fora dos releases, em `~/Library/Application Support/TravelBoss`; sua atualização exige revisão local. Os worktrees pertencem ao clone de origem: não mova/apague esse clone. Não há limpeza automática de releases nem rotação de logs.

## Ativação futura, somente no Mac mini

Pré-requisitos: Node >=22.13, npm, Git, Tailscale autenticado e uma sessão de usuário macOS. O LaunchAgent depende dessa sessão; não é um daemon de sistema disponível antes do login. Se a máquina dormir ou ficar offline, o site ficará indisponível.

Antes da ativação: revisar dependências e ACLs do Tailscale, manter cópia privada dos roteiros/reservas e resolver edições locais. O clone público não contém reservas privadas removidas anteriormente; o instalador não as recupera nem as publica.

Depois da revisão e integração autorizada do PR, no clone limpo de `main` no Mac:

```sh
git fetch origin main
# Confirmar que HEAD corresponde ao origin/main revisado.
TB_PUBLIC_ORIGIN=https://mac-mini-de-vinicius.tail969dc0.ts.net:10443 \
  bash scripts/mac-mini-install.sh --activate
```

**Esses comandos não foram executados nesta tarefa.** Sem `--activate`, o instalador recusa continuar. A instalação também recusa branch diferente de `main`, checkout sujo, HEAD diferente do `origin/main` local e configuração já existente.

O instalador testa e compila, grava configurações locais com permissão restrita, cria os agentes `com.travelboss.site` e `com.travelboss.sync` e configura Tailscale Serve em `:10443`, encaminhando para `127.0.0.1:5173`. O dashboard em `:10000` usa outra porta. Não usar Funnel.

Verificar no Mac:

- `/healthz` retorna o SHA esperado; abrir roteiro, editar uma nota de teste, checklist e avaliação; conferir save e atualização em outra aba.
- ACLs permitem somente os usuários/dispositivos desejados. O acesso de leitura depende da rede privada: não há login próprio por usuário na aplicação. Todo membro autorizado pela ACL pode consultar o conteúdo privado.
- Requisições de escrita exigem origem exata do navegador ou bearer token, além de JSON. O token é gerado localmente em `runtime.json`; não incluí-lo em commits, URLs ou logs. `Host`, origem e requisições cross-site são verificados no servidor.
- Uma edição local interrompe os próximos deploys com segurança. Commitar/sincronizar ou fazer backup e resolver a divergência conscientemente antes de liberar uma atualização. Não publicar reservas privadas no repositório público.
- Hotéis continuam dependendo de PinchTab, ambiente Python e chaves opcionais. Essas integrações externas não foram exercitadas contra serviços reais; fornecer os recursos locais necessários separadamente. Reinstalar o ambiente Python por release quando necessário.
- Verificar atualização após push e simular rollback no Mac antes de mudar favoritos. O GitHub Pages permanece disponível e sem alterações de configuração.

Para suspender a sincronização: `launchctl bootout gui/$(id -u)/com.travelboss.sync` e definir `enabled: false` no `config.json` local. Para parar o site: `launchctl bootout gui/$(id -u)/com.travelboss.site`. Os arquivos e releases permanecem disponíveis. Não desligar Tailscale Serve globalmente, pois pode atender outros serviços; remover apenas a configuração `:10443` conforme a versão instalada do Tailscale.

Para rollback manual, parar a sincronização e o site, conferir que o release anterior não contém edições pendentes, restaurar `current` para o caminho `previous` do `last-deploy.json` e reiniciar o site. Confirmar novamente o SHA em `/healthz`.

## Fluxo rápido para o LLM

Compilar uma vez com `npm ci && npm run build:server`. Priorizar HTTP persistente quando disponível, evitando o custo de iniciar um processo CLI para cada consulta.

```sh
node scripts/travel-agent.mjs list
node scripts/travel-agent.mjs day europa '<título exato ou linha do H3 retornada por list>'
node scripts/travel-agent.mjs search 'Louvre'
node scripts/travel-agent.mjs place par-louvre
node scripts/travel-agent.mjs batch europa /caminho/edits.json
```

`list` devolve resumos, revisões e linhas de cada dia. `day` devolve a estrutura do parser, com linhas das paradas, trechos, decisões e dúvidas. Títulos parciais ou ambíguos são recusados. A busca retorna até 100 resultados por página; não é preciso solicitar o documento inteiro.

| Método | Endpoint | Uso |
| --- | --- | --- |
| GET | `/api/agent/trips` | Resumos e revisões |
| GET | `/api/agent/trips/:id/days/:headingLine` | Dia estruturado |
| GET | `/api/agent/search?q=Louvre&kind=trip&limit=30&offset=0` | Busca paginada; `kind=place` consulta catálogo |
| GET | `/api/agent/places/:id` | Registro de lugar, coordenadas e subpontos |
| POST | `/api/agent/trips/:id/edit` | Lote ou `update-stop` |
| POST | `/api/agent/research` | Pesquisa externa em cache |

Exemplo de alteração estruturada (usar os números de linha e a revisão reais da leitura):

```json
{"revision":"<sha256>","operation":"update-stop","dayLine":6,"stopLine":7,"changes":{"time":"11:00","note":"Entrada pelo acesso reservado"},"dryRun":true}
```

Para aplicar, remover `dryRun` ou usar `false`. A simulação devolve a revisão proposta sem alterar o arquivo; o pedido aplicado ainda deve usar a revisão original. Para lote:

```json
{"revision":"<sha256>","edits":[{"before":["linha completa existente"],"after":["linha completa substituta"]}]}
```

Cada bloco precisa casar exatamente uma vez. Até 100 mudanças por lote, no máximo 128 KiB via HTTP. Conflitos retornam 409; erro de parser novo ou horário inválido retorna 422; erro de formato retorna 400. Um lote inválido não grava parcialmente. Ler de novo antes de tentar resolver um conflito.

O agente não pode mudar/remover/criar status ou aprovações, mudar dias com períodos aprovados nem alterar blocos com `decisão:`, incluindo seus aliases em inglês/sem acento. É uma política conservadora: uma revisão legítima desses blocos precisa de intervenção explícita pelo editor/manual, com autorização humana. Não existe parâmetro HTTP que desative a proteção. O editor existente mantém as ações explícitas do usuário.

A validação recusa erros novos do parser e preserva os problemas preexistentes, devolvendo-os no resultado. Não substitui auditoria de refeições, orçamento, horários oficiais, malas, geografia ou interpretação semântica de decisões. IDs de linhas são relativos à revisão, não identificadores permanentes. O lock coordena os escritores da aplicação/CLI; um editor externo que ignore o lock ainda pode disputar o arquivo. Locks abandonados não são removidos automaticamente.

## Cache e índice

`TB_STATE_DIR` controla SQLite e caches persistentes. Sem essa variável, usam diretórios locais ignorados pelo Git. O índice é descartável; remover o banco com o serviço parado o reconstrói. O catálogo é indexado ao iniciar; arquivos de roteiro alterados/removidos são reconciliados na próxima busca. A leitura de dia ainda interpreta o Markdown: o ganho principal é consultar menos contexto e fazer um lote por tarefa.

Pesquisa: `POST /api/agent/research` com `{"url":"https://www.louvre.fr/en/visit","force":false}`. Apenas os hosts explícitos de `scripts/research-cache.ts` são aceitos, por HTTPS, sem credenciais nem portas alternativas. Redirecionamentos não são seguidos. Adicionar uma fonte exige revisão de código; não é um proxy de URL aberto.

TTL de 30 minutos, no máximo 256 entradas, 1 MiB por resposta, quatro consultas simultâneas e timeout de 15 s. Conteúdo vencido pode ser retornado por até 24 h se a consulta falhar, sempre com `stale`, fonte, horário e erro. As páginas são texto não confiável: o cache não certifica fatos nem transforma instruções de uma página em instruções do agente. Não são armazenadas credenciais ou cabeçalhos de autorização.

Clima preserva as fontes/fallbacks existentes e agora distingue fuso na chave, valida coordenadas/fuso e limita o tempo das consultas principais. Dados meteorológicos antigos continuam identificados como vencidos. O cache de hotéis existente também pode usar `TB_STATE_DIR`.

## Medição e validação

`npm run benchmark:agent` executa 30 amostras por operação; `node scripts/benchmark-agent.mjs docs/agent-benchmark.json` grava o relatório reproduzível. Ele contém p50/p95, bytes por resposta, custo de indexação inicial, processo CLI e edições simuladas. A fonte externa é uma fixture com 10 ms; não mede internet real. Não mede duração de uma tarefa completa de LLM nem contagem real de tokens.

Resultados e interpretação em [agent-performance.md](agent-performance.md). O workflow `agent.yml` roda testes e builds em Ubuntu (Node 22/24) e macOS (Node 22); não contém job de implantação. O workflow de Pages foi preservado.

Validação local: TypeScript, suíte Vitest, build estático público, build privado, compilação do servidor, integração HTTP e deploy simulado. O editor e o modo dev foram abertos no navegador; o ambiente de prévia disponível foi 1280×720. Não foi feita validação física no Mac mini, Tailscale/LaunchAgents, reinício da máquina ou consultas reais de hotéis.

`npm audit fix` atualizou Vite e source-map-js dentro das versões compatíveis. Restam alertas no MapLibre e nas ferramentas de teste (vitest/@vitest/mocker/tinypool), que exigem migrações maiores e revisão própria. Revisar/corrigir esses alertas antes de ativar o editor privado. Este PR continua em rascunho e não declara produção homologada.

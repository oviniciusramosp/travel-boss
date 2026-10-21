# Mac mini e ferramentas para agentes — preparação do PR #1

Implementação preparada na branch `feat/mac-mini-agent-performance`. **Nada foi instalado no Mac mini, nenhum serviço foi ativado e `main`/GitHub Pages não foram alterados.** A ativação continua dependendo de uma sessão no Mac mini e da revisão deste PR.

## O que mudou

- Servidor Node de produção em `build/server.mjs`, sem servidor Vite em execução. O frontend privado é um build separado, com editor habilitado e APIs reais.
- As fábricas das APIs de roteiro, checklist, lugares, clima e hotéis são reutilizadas por um adaptador de middleware. Os dois módulos que hotéis/lugares carregavam por Vite são resolvidos por uma lista fixa de módulos compilados. Não há carregamento arbitrário de arquivos TypeScript.
- Eventos SSE atualizam o roteiro e avaliações após saves em disco. As regras existentes de foco/editor continuam no frontend.
- SQLite persistente para linhas de roteiro e registros estruturados do catálogo. Usa FTS5 quando disponível; em distribuições de Node sem FTS5, usa tabela SQLite com texto normalizado e busca por termos. O retorno informa `engine`. Essa alternativa não tem o ranking nem a escalabilidade do FTS5.
- Revisões SHA-256, anchors estáveis, precondições por data/dependências, lock exclusivo e gravação por rename. Contexto reúne a data completa; prévia calcula efeitos; operações estruturadas editam paradas, custos, transporte e comentários. CLI, HTTP e MCP compartilham o runtime e seu contrato.
- Referências compartilhadas indexadas, fontes externas com cache/revalidação e registros estruturados de afirmações com hash/trecho exato. Proveniência não equivale a verdade verificada. Clima e hotéis mantêm seus caches existentes, com localização persistente configurável.

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

## Ferramentas locais, HTTP e MCP

O fluxo atualizado está em [agent-workflow.md](agent-workflow.md): instalação ignorada no checkout principal sem integrar `main`, manifesto vinculado ao catálogo/parser reais, diagnóstico `doctor`, contexto por data ISO, precondições, operações estruturadas, prévia e evidências com validade.

A instalação de ferramentas em `node_modules/.cache/travel-boss-agent` é independente da instalação do Mac mini descrita acima. Não sobe servidor, não modifica arquivos versionados nem configura cliente MCP. O MCP stdio começa sem escrita; `--allow-writes` permite apenas as ações já autorizadas para o subprocesso e mantém as proteções de decisões/aprovações. CLI, HTTP e MCP usam os mesmos esquemas e validação.

`TB_STATE_DIR` controla SQLite e caches persistentes. O índice é descartável: reconstruí-lo preserva as fontes Markdown/catalogo/referências. O motor informa `sqlite-fts5` ou a alternativa `sqlite-normalized`; não suponha o mesmo desempenho/ranking nos dois. Roteiros e referências são reconciliados durante as buscas; favoritos/avaliações do browser são lidos em execução. Parser e catálogo empacotados exigem reinstalação após mudanças, detectadas por `doctor`.

O fluxo de pesquisa consulta primeiro referências do projeto. Cache externo usa fontes permitidas e políticas por tipo, com revalidação HTTP e marcação de conteúdo vencido. Texto de página é evidência não confiável; uma afirmação com trecho correspondente não recebe selo de verdade. Revalidação e fonte do dia continuam obrigatórias conforme a skill. Detalhes de limites e formatos estão no guia do workflow.

## Medição e validação

[agent-performance.md](agent-performance.md) separa microbenchmarks, fluxos determinísticos completos e a medição futura com um modelo real. Bytes não são contagem de tokens. `TB_AGENT_TRACE` é opcional e registra somente metadados de chamadas; dados ausentes do modelo permanecem desconhecidos.

O workflow `agent.yml` testa Ubuntu (Node 22/24) e macOS (Node 22); não contém implantação. O workflow de Pages permanece separado. Os testes cobrem TypeScript, Vitest, build público/privado, servidor HTTP, MCP/CLI e deploy simulado. Aprovação nesses ambientes não homologa o Mac mini: Tailscale, ACLs, LaunchAgents, reinício/login, serviços de hotéis e rollback real dependem de validação acompanhada naquele computador.

Alertas de dependências precisam ser revistos antes da ativação. O PR permanece preparação: nenhum serviço do Mac mini foi ativado e nenhuma alteração desta tarefa foi integrada a `main` ou publicada no Pages.

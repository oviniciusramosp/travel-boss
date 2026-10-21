# Medição das ferramentas para agentes

A entrega mede custo e comportamento das ferramentas locais. **Ainda não há percentual demonstrado de aceleração de uma tarefa real do LLM.** Tokens, latência do modelo e tempo total de trabalho não podem ser inferidos a partir de bytes ou da duração de uma consulta.

## Relatórios reproduzíveis

| Relatório | Reprodução após `npm run build:server` | O que mede |
| --- | --- | --- |
| [agent-benchmark.json](agent-benchmark.json) | `node scripts/benchmark-agent.mjs docs/agent-benchmark.json` | 30 amostras por operação: documento/dia, busca, início da CLI, edição simulada e fonte sintética com/sem cache |
| [agent-workflow-benchmark.json](agent-workflow-benchmark.json) | `node scripts/benchmark-workflows.mjs docs/agent-workflow-benchmark.json` | 20 amostras de cada fluxo completo de ferramentas: contexto → prévia → aplicação → verificação |

Cada JSON registra runtime, plataforma e data da execução. Os tempos definitivos e tamanhos devem ser lidos nesses arquivos, evitando comparar execuções de versões/ambientes diferentes como se fossem o mesmo teste. Esses ensaios usam arquivos temporários e não editam roteiros reais nem publicam conteúdo.

O primeiro relatório separa p50/p95, bytes por resposta, indexação inicial, custo do processo CLI e chamadas externas. A busca SQLite usa termos; a varredura de referência usa substring. Resultados/ranking não são equivalentes. FTS5 e a alternativa normalizada podem ter desempenhos diferentes; corpus pequeno pode favorecer a varredura. O custo de um dia estruturado inclui interpretar a fonte Markdown, não apenas ler um registro pronto.

No relatório atual com Node 22/FTS5, a busca SQLite mais rica foi mais lenta que a varredura simples. O índice agora inclui catálogo resolvido, referências e filtros/proveniência; a melhoria entregue é estruturar/reduzir consultas, não alegar uma aceleração da busca que a medição não mostrou.

O provedor externo é uma fixture de 10 ms. Reutilizar seu cache demonstra deduplicação e economia de chamadas nesse cenário; não mede internet real, qualidade de pesquisa, disponibilidade do provedor ou latência do modelo. Edições do microbenchmark são `dryRun` numa fixture de cinco paradas; disco real sob carga e concorrência do Mac mini não estão medidos.

O relatório de workflows exercita nota em parada confirmada, custo/comentário, mover parada, inserir parada e alterar transporte. Registra tempo, quantidade de chamadas, bytes e falhas; confere que prévia não grava e que aplicação mantém os invariantes esperados. Uma data com dois H3/cidades é obtida numa única consulta. O fluxo completo é determinístico, sem escolha ou geração por modelo; quatro chamadas previamente definidas não equivalem a quatro consultas suficientes para toda tarefa real.

## Tamanho das instruções

Na branch, `AGENTS.md` passou de 31.195 para 5.791 bytes e a skill de roteiro de 14.651 para 3.655 bytes: **45.846 → 9.446 bytes, redução de 79,4% nos pontos de entrada**. Os detalhes originais permanecem em referências canônicas por tarefa, com links e symlinks conferidos. `content/SCHEMA.md` não foi alterado. São bytes UTF-8, não tokens medidos.

O benefício depende de consultar apenas as seções relevantes. Carregar novamente todas as referências e o schema inteiro elimina parte da economia. A instalação local ignorada fornece ferramentas sem integrar os novos documentos ao checkout principal: suas instruções versionadas continuam anteriores até a adoção do PR.

## Rastreio opcional de chamadas reais

No processo CLI, HTTP ou MCP, configure variáveis apenas quando quiser coletar a medição:

```sh
TB_AGENT_TRACE=/caminho/privado/agent-events.jsonl \
TB_AGENT_RUN_ID=execucao-01 \
TB_AGENT_TASK_ID=atender-comentario \
TB_AGENT_VARIANT=tools \
  node scripts/travel-agent.mjs context europa 2026-10-05
```

Na instalação do checkout principal, troque o caminho do script por `node_modules/.cache/travel-boss-agent/scripts/travel-agent.mjs`. Para repetir tarefas reais, mantenha `runId`/`taskId` coerentes durante toda a execução. `TB_AGENT_VARIANT=baseline` diferencia uma execução de comparação; o valor padrão é `tools`.

O evento automático registra instante, identificadores escolhidos, ferramenta, duração, bytes de entrada/saída, sucesso e status de erro. Não inclui prompts, texto de fonte, afirmações, URLs, reservas ou credenciais. Identificadores de tarefa são texto do operador: não coloque informação privada neles. Os arquivos são locais e não são enviados automaticamente.

Eventos automáticos têm `inputTokens`/`outputTokens: null`; não medem o modelo. O cliente pode acrescentar eventos `phase: model` com duração e tokens realmente medidos, e um evento `phase: workflow` com a duração total observada. Todos precisam de `taskId`, `runId`, `variant` e `durationMs`. Agregue com:

```sh
node scripts/benchmark-llm-traces.mjs /caminho/privado/agent-events.jsonl /caminho/privado/agent-report.json
```

A agregação informa chamadas/falhas das ferramentas e usa tokens somente quando todos os eventos de modelo daquele run possuem contagens. Sem eventos do modelo, métricas de modelo continuam `null`. Apenas um evento `workflow` fornece `wallTimeMs`; somar chamadas paralelas não mede tempo total.

## Comparação com LLM que falta executar

Use as mesmas tarefas, dados iniciais, modelo, configuração e ambiente: atender comentário, ajustar horário/nota, mover/adicionar visita e corrigir transporte. Compare conclusão correta, tempo total, tokens reais, consultas e tentativas que falham. Registre também consultas do browser e ações fora deste runtime; o trace das ferramentas sozinho não as observa. Preserve decisões e aprovações em ambos os cenários.

O Mac mini ainda exige medição local após ativação autorizada. As ferramentas reduzem caminhos de consulta e fornecem efeitos calculados, mas essa mudança não comprova menor latência do modelo, melhoria universal de CPU ou conclusão automática de pesquisas/revisão visual.

Fluxo operacional, contratos e limites: [agent-workflow.md](agent-workflow.md).

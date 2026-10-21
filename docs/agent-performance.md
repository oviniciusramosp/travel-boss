# Medição das ferramentas para agentes

Medição local em 2026-10-21, darwin, Node v22.22.2, 30 amostras por operação. Motor detectado: `sqlite-fts5`. Dados reproduzíveis em [agent-benchmark.json](agent-benchmark.json); executar `npm run build:server && npm run benchmark:agent`.

| Operação | p50 (ms) | p95 (ms) | Bytes da resposta |
| --- | ---: | ---: | ---: |
| Documento completo (API legada) | 0.105 | 0.170 | 67257 |
| Dia estruturado | 1.474 | 1.970 | 3961 |
| Busca por varredura do Markdown | 0.299 | 0.480 | 1580 |
| Busca no SQLite/FTS5 | 0.112 | 0.216 | 2220 |
| Listagem CLI incluindo início do processo | 58.957 | 82.437 | 2195 |
| Uma edição simulada | 0.220 | 0.549 | 203 |
| Cinco edições simuladas em um lote | 0.216 | 0.544 | 203 |
| Fonte sintética sem cache | 11.944 | 12.762 | 265 |
| Fonte sintética com cache | 0.041 | 0.183 | 264 |

A consulta por dia devolveu **94.1% menos bytes** (67257 → 3961). Esse é o ganho medido mais relevante para reduzir contexto e esforço de localização do LLM. Não é uma medição de tokens nem de duração completa de uma tarefa.

O dia estruturado leva mais CPU que ler o arquivo bruto: ainda interpreta o roteiro inteiro com o parser. No Node 22.22.2, com FTS5 disponível, a busca indexada teve p50 de 0,112 ms, contra 0,299 ms da varredura. Em uma medição exploratória anterior no Node 23.6 sem FTS5, a alternativa normalizada foi mais lenta (0,553 ms contra 0,347 ms). O relatório JSON registra a execução final com Node 22/FTS5; não generalizar o ganho para a alternativa compatível. Indexação inicial: 16.462 ms. O resultado no Mac mini e em outras distribuições de Node precisa ser medido separadamente; as duas buscas não têm semântica idêntica.

A inicialização do processo CLI custou cerca de 59 ms na mediana. Preferir HTTP persistente e um lote de mudanças por tarefa. As edições medidas usam `dryRun` em fixture de cinco paradas; nenhum roteiro real foi alterado. Os tempos de gravação real, disco sob carga e concorrência no Mac mini não foram medidos.

O cache fez 30 chamadas na fase sem cache e nenhuma chamada adicional nas 30 consultas com cache. O provedor é uma fixture de 10 ms, portanto os números não representam a internet real, a qualidade da pesquisa ou latência do modelo. Validade, fontes e marcação de conteúdo vencido continuam obrigatórias.

## Fluxo recomendado

1. Listar roteiros/dias e pegar a revisão atual.
2. Consultar somente o dia e os lugares envolvidos, com resultados paginados.
3. Consultar fontes externas apenas quando necessárias; reutilizar o cache válido e verificar a proveniência.
4. Aplicar as mudanças em um lote, preservando decisões e aprovações; usar simulação quando útil.
5. Ler novamente apenas o dia alterado e executar a revisão exigida pela skill de roteiro.

Uma medição de ponta a ponta ainda exige o mesmo conjunto de tarefas reais, modelo e ambiente, contando chamadas, tokens e tempo total antes/depois. Não há ganho percentual demonstrado de velocidade do LLM nesta entrega. A medição no Mac mini fica para a ativação acompanhada.

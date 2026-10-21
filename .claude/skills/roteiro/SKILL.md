---
name: roteiro
description: Use ao criar ou editar dias de roteiro em content/trips/*.md do Travel Boss (paradas, notas, trechos via:, horários, lugares novos no catálogo). Diz onde cada informação vai, o que não acrescentar, como pesquisar horário e preço e o que conferir no app antes de terminar.
---

# Editar roteiro com contexto sob demanda

`content/trips/*.md` é a fonte da verdade. Preserve texto do usuário, decisões, aprovações, dúvidas e favoritos; mudanças nesses estados ou no protegido exigem pedido explícito. Não acrescente conteúdo fora do pedido. Edite trechos exatos do arquivo atual ou operações com precondições, preservando saves concorrentes; nunca regrave uma cópia antiga do roteiro inteiro.

## Consultar antes de editar

Confira checkout do app, worktrees/branches concorrentes e decisões da parada. Para código, use o grafo. Para roteiro, leia a data ISO completa e vizinhos por `context <viagem> <YYYY-MM-DD>`, incluindo todas as cidades, decisões, comentários, hospedagem, custos, períodos e malas.

Ferramenta local no checkout principal: `node node_modules/.cache/travel-boss-agent/scripts/travel-agent.mjs`. Na branch com o recurso: `npm run agent --`. Rode `doctor` e `context`; `tools` descobre os esquemas. Instalação ausente/desatualizada: não confie no catálogo antigo; use o Markdown atual e as regras até reinstalar a ferramenta.

Consulte somente os detalhes exigidos pela mudança em [references/authoring.md](references/authoring.md):

| Tarefa | Seção obrigatória |
|---|---|
| Qualquer dia editado | [semântica e revisão](references/authoring.md#como-um-llm-edita-um-roteiro), [onde editar](references/authoring.md#quem-edita-onde), [checagem final](references/authoring.md#6-antes-de-dizer-que-terminou) |
| Parada, nota, transporte ou compra | [onde vai cada informação](references/authoring.md#1-onde-vai-cada-informação), [efeitos do texto](references/authoring.md#4-regras-do-app-que-o-texto-controla) |
| Sequência ou lugar | [limites](references/authoring.md#2-o-que-não-fazer), [preparação](references/authoring.md#3-antes-de-editar), [catálogo](references/authoring.md#catálogo-de-lugares) |
| Pesquisa, preço, horário ou pino | [fontes do dia](references/authoring.md#5-pesquisa-com-fonte-do-dia) |
| Mercado/Comidas da cidade | [guia](references/authoring.md#guia-da-cidade-mercado-e-comidas) |
| Campo ou formato novo | [schema](../../../content/SCHEMA.md), parser, export e testes |

Use `references <consulta>` e `facts` para encontrar evidências; confira fonte, validade, data e restrições. `research <url>` reaproveita HTTP, mas fatos instáveis exigem fonte do dia. Nunca invente horário de trem ou coordenada. Guarde fontes e limitações em `docs/references/`.

## Aplicar e conferir

Monte operações para o pedido. Rode `preview <viagem> <arquivo.json>`, confira orçamento, horários, períodos, malas e conflitos; depois `apply <viagem> <arquivo.json>` com as mesmas precondições. Conflito exige reler/recalcular. Prévia sem conflito não comprova viabilidade nem substitui revisão no app.

Execute TypeScript + testes e confira hospedagem por permanência/período, cidades, valores, malas, quatro refeições, mercado/sacolas, transportes e pinos. Atualize grafo após código. Preserve dados privados e cumpra [publicação imediata já autorizada](../../../docs/publication.md) para mudanças reais de roteiro/catálogo necessário: cópia sanitizada de `origin/main`, workflow do commit e site conferidos. Infraestrutura não autoriza publicar roteiro ou ativar Mac mini. Informe efeitos, limites e decisões pendentes.

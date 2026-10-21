# Travel Boss

Vite + TypeScript, DOM puro. O Markdown do roteiro é a fonte da verdade; a UI acompanha o save. O portfólio (Astro) é a origem do comportamento — porte é adaptar, não copiar.

## Instruções compartilhadas (Codex e Claude Code)

`AGENTS.md` é a fonte única das regras; `CLAUDE.md` aponta para ele. A skill de roteiro fica em `.claude/skills/roteiro/`, com link simbólico em `.agents/skills/roteiro/` para descoberta pelo Codex. Edite o mesmo conteúdo, sem criar cópias. As referências de pesquisa ficam em `docs/references/`, acessíveis aos dois agentes; novas referências necessárias ao roteiro devem ficar no repositório, não apenas na memória privada de um assistente.

## Proteções obrigatórias

- Só o escopo pedido. Não acrescente paradas, notas, dicas, alternativas ou planos B sem pedido; preserve o texto fornecido pelo usuário e explique efeitos dependentes.
- `content/trips/*.md` é a fonte da verdade. Edite trechos exatos do arquivo atual ou operações com precondições; nunca regrave o roteiro inteiro de uma cópia antiga. O usuário salva uma linha por vez pelo browser. Não duplique roteiro em TypeScript.
- Leia `decisão:` antes de editar e nunca desfaça, mova ou apague o protegido sem pedido humano. Apague `comentário:` atendido sem anotação substituta; nova decisão só com pedido explícito. Aprovações, dúvidas, `confirmado` e favoritos só mudam a pedido; lugar novo não herda confirmação.
- Não edite `src/data/*` fora de tarefa explícita nem adicione dependência npm sem a tarefa pedir. Lugar sugerido sem pedido pelo nome leva `aiSuggested` e motivo nos dois idiomas.
- Horários, preços, avaliações e localização exigem fonte conferida no dia. Referência/cache preserva evidência, data e validade; não dispensa revalidação. Registre fonte/limites em `docs/references/`. Não invente partida pela duração nem pino por geocodificação/centro da câmera.
- Reservas e histórico privados nunca vão ao Git público nem ao Pages. Publique cópia sanitizada de `origin/main`, preservando roteiro e histórico locais. Nunca envie `dist/` privado ao Pages. Leia [publicação e privacidade](docs/publication.md) antes de publicar ou mudar persistência/carregamento.
- Toda alteração real de roteiro/catalogo necessário tem publicação imediata já autorizada (08 e 11/10/2026): validar, publicar cópia pública, aguardar workflow do commit e conferir site; sem nova confirmação. Preparar infraestrutura/ferramentas não autoriza alterar `main` nem ativar implantação. Mac mini exige acesso e autorização de ativação.

## Desenvolvimento

Vite + TypeScript, DOM puro. `src/main.ts` → shell/mapa/views/roteiro → `src/catalog/index.ts` → dados. A UI importa catálogo só pelo facade; idioma por `pickLocale`. Mudou formato Markdown: schema, parser, export e testes juntos.

Tokens só em `src/styles/tokens.css`; ícones via `icon()` ou exceções `weatherIcon`. Preserve foco, acessibilidade, movimento reduzido, câmera e comportamento desktop/mobile. Chrome acromático; raio concêntrico via tokens. Antes de UI leia [contrato completo](docs/project-contract.md#contrato), [primitivos](docs/ui-primitives.md) e [componentes](docs/project-contract.md#componentes-do-guia-e-busca). Primitivo novo acrescenta sua regra ao contrato canônico.

- Comandos: `npm run dev`, `npx tsc --noEmit`, `npm test`, `npm run build`. [Outros comandos e arquitetura](docs/project-contract.md#comandos).
- Lógica não trivial ganha teste. Depois: TypeScript + testes, browser em 1440×900/mobile quando afetado, grafo e commit `feat(<fase>.<n>): …` ou `fix(…)`. Diff acima de ~250 linhas é dividido. 🤔 é suposição a verificar.
- Conteúdo com app aberto: checkout principal (5173); worktree só chega ao app após merge. Confira worktrees/branches e porta; nunca use stash compartilhado sem nome. [Procedimento completo](.claude/skills/roteiro/references/authoring.md#quem-edita-onde).

## Navegação do código

`graphify-out/graph.json` existe. Consulte o grafo antes de ler arquivo:

```bash
graphify query "<tema>"
```

Depois de criar, renomear, mover ou apagar código: `graphify update .`. Não edite `graph.json` na mão. Não commite `graphify-out/cache/`. O merge de `graph.json` usa o driver do graphify (`.gitattributes`); em clone novo, rode `git config merge.graphify.driver "graphify merge-driver %O %A %B"`, senão o git volta a escrever marcadores de conflito.

Sem grafo em projeto de código: avise o ganho de menos tokens nas próximas sessões e espere OK para o build inicial, que pode usar LLM e demorar. Não construa sozinho.

## Roteiro e ferramentas do agente

Antes de editar roteiro, carregue [a skill compartilhada](.claude/skills/roteiro/SKILL.md). Detalhes: [autoria](.claude/skills/roteiro/references/authoring.md); formato: [content/SCHEMA.md](content/SCHEMA.md). Cada dia editado exige revisão de hospedagem/períodos, cidades, valores, malas, refeições e sacolas, conferida no app. Consulte a data ISO completa, incluindo todas as cidades/H3.

Prefira `doctor` → `context` → `references`/`research` → `preview` → `apply`, mantendo anchors, revisions e guards recebidos. A API não amplia permissões. No checkout principal instalado: `node node_modules/.cache/travel-boss-agent/scripts/travel-agent.mjs <comando>`; não suponha script npm ali. Na branch com o recurso: `npm run agent -- <comando>`. `doctor` confirma checkout, catálogo e runtime atuais. Sem ferramentas atuais, use edição exata do Markdown com as mesmas proteções.

Servidor privado/instalação: [contrato](docs/project-contract.md#servidor-privado-e-apis-para-agentes) e [Mac mini/API](docs/mac-mini-and-agent.md). O build público permanece somente leitura.

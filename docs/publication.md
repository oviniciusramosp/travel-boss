# Publicação e dados privados

Referência canônica vinculada por `AGENTS.md`. A autorização permanente abaixo vale para tarefas reais de roteiro; preparação de infraestrutura não autoriza alterar `main` nem ativar o Mac mini. Servidor privado: [mac-mini-and-agent.md](mac-mini-and-agent.md).

## Publicação estática

Dados privados de reservas (PIN, senha, confirmação, localizador, contato, e-mail, pagamento, cartão e endereço da reserva) são exclusivos do modo local. `publicTrips` (`scripts/vite-public-trips.ts`) remove esses campos do Markdown antes de incluí-lo no bundle de produção; esconder na UI não basta. Novos formatos de dados privados devem atualizar `publicTrip` e seus testes. Conferir também a ausência desses valores nos arquivos de `dist/` após o build. Essa proteção é do GitHub Pages, não remove informações do histórico ou dos arquivos do repositório Git.

O destino de produção é GitHub Pages (`/travel-boss/`), publicado pelo workflow `.github/workflows/pages.yml` a cada push em `main`. Nunca depender de `/api/*` no build estático: use `appRequest` (`src/platform/request.ts`), que mantém APIs de arquivos no dev e usa conteúdo empacotado somente para leitura em produção. `canEdit` (`src/platform/request.ts`) habilita edição apenas no dev: builds não exibem controles de edição nem usam rascunhos do navegador. Publicar alterações exige commit e push; o frontend não escreve no GitHub. Assets públicos usam `import.meta.env.BASE_URL`. Vídeos locais necessários ao site são versionados. Validar o build de produção, além do dev, ao mudar carregamento ou persistência.

Por autorização permanente do usuário em 08/10/2026, reforçada em 11/10/2026, toda alteração do roteiro exige publicação imediata após a edição e validação, na mesma tarefa e sem pedir nova confirmação. Vale também para ajustes pequenos de texto, horários, notas, valores, status e comentários atendidos, e para alterações do catálogo necessárias ao roteiro. Não deixe a publicação para outra tarefa ou para o usuário pedir: ele depende da versão publicada ao sair de casa.

Prepare a cópia pública conforme o procedimento abaixo, teste, envie para `origin/main`, aguarde o sucesso do workflow de GitHub Pages correspondente ao commit enviado e abra o site publicado para conferir que a alteração está presente. Commit, push ou sucesso no localhost, sozinhos, não concluem o ajuste. Se houver falha, corrija e tente novamente; se um impedimento externo impossibilitar a publicação, informe explicitamente que a versão publicada continua desatualizada e qual é o impedimento. Só diga que o roteiro foi atualizado após verificar a publicação; inclua no resumo o link do site conferido.

O repositório é público. Enquanto `main` local contiver reservas, prepare a publicação em uma cópia a partir de `origin/main`, removendo os campos privados antes de commitar. Não envie o histórico privado local nem substitua o roteiro local pela cópia pública. A publicação de 03/10/2026 preservou esse histórico local; `main` local e `origin/main` divergem deliberadamente. Procedimento e commits em [docs/references/publication-2026-10-03.md](references/publication-2026-10-03.md).


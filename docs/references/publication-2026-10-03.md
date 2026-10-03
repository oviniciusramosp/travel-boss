# Publicação — 03/10/2026

Destino: https://oviniciusramosp.github.io/travel-boss/. Repositório público: `oviniciusramosp/travel-boss`. Workflow: `Publish GitHub Pages`, execução inicial [37094221814](https://github.com/oviniciusramosp/travel-boss/actions/runs/37094221814) e correção [37094662331](https://github.com/oviniciusramosp/travel-boss/actions/runs/37094662331).

Fonte local publicada: `5f685d6`, com correção do filtro em `94b150c`. Versão pública final enviada a `origin/main`: `20d2e4a5405d83ba9f299015028bfbf58d132138`, preparada no branch local `codex/publicacao-2026-10-03`, a partir de `808103d`. Foram preservadas as alterações já commitadas do app e roteiro. Checklist e arquivos de grafo que estavam modificados no checkout principal não foram incluídos.

O histórico local de `main` contém os detalhes privados das reservas. Ele foi preservado e não foi enviado ao repositório público. Por isso `main` local e `origin/main` têm históricos diferentes. Não fazer reset do roteiro local para a versão pública nem enviar os commits privados para resolver essa diferença.

Na cópia de publicação, todos os arquivos em `content/trips/*.md` passaram por `publicTrip`; o documento privado `docs/references/europa-lodging-2026.md` foi omitido. As mesmas proteções continuam no build. A versão final passou em 583 testes, TypeScript e build com `GITHUB_ACTIONS=true`; os valores privados verificados não apareceram na fonte de publicação nem no bundle. O filtro remove também quebras de linha que ficariam sem continuação após excluir uma reserva, preservando os trechos e preços seguintes. Os detalhes privados permanecem no checkout local. Isso não apaga dados que já estivessem no histórico remoto anterior.

Próxima publicação: partir de `origin/main` em uma cópia separada, aplicar as mudanças da versão local, remover os campos privados antes do primeiro commit e testar a cópia pública. Enviar somente essa sequência pública para `origin/main`, sem force push; o workflow usa o ambiente `github-pages`, que permite apenas `main`.

Confirmação final: execução 37094662331 concluída com sucesso. Site público aberto no navegador, dia 16/10 com total de ingressos €70,98, incluindo €19,35 do trem e o pacote do Coliseu contado uma única vez. Passeio da tarde e pino do Coliseu conferidos. A cópia temporária de publicação foi removida; o branch local público continua disponível.

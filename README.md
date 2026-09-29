# Travel Boss

App de roteiros publicado em https://oviniciusramosp.github.io/travel-boss/. O documento que você lê na tela é um Markdown em `content/trips/`. Um LLM edita esse arquivo; com `npm run dev` aberto, a tela acompanha o save.

## Rodar

```bash
npm install
npm run dev
```

Busca de hotel (Azul + Booking) e Airbnb só existe no dev server, em `/api/hotel-search`. Airbnb precisa de `npm run travel:airbnb:setup` uma vez. A chave de ranking, se existir, fica em `.env` (`TYPESAFE_API_KEY`) — o servidor também olha o `.env` do portfólio ao lado.

`rm -rf node_modules` apaga o venv do Airbnb/Azul (`node_modules/.cache/airbnb-venv`). Depois disso, rode `npm run travel:airbnb:setup` de novo.

## Artefato

Vídeos do Instagram usam MP4 locais com controles nativos. Após adicionar links ao catálogo ou clonar o projeto, execute `npm run travel:videos:sync` (requer `yt-dlp` no PATH). O comando obtém apenas vídeos públicos, preserva os arquivos existentes e retorna erro se algum download falhar. Os arquivos ficam em `public/videos/instagram/`, versionados para publicação; o Vite os serve no dev e os inclui no build. Prepare-os antes de gerar o build ou transferir o app para outro computador. Não há dependência do embed, login ou cookies do Instagram durante a reprodução.

O formato está em `content/SCHEMA.md`. Exportar copia HTML (Apple Notes) e Markdown (Notion) e também baixa o `.md`.

## Catálogo

Cidades, lugares, roteiros por cidade e o motor de busca vieram do portfólio e ficam em `src/data` e `scripts/`. A interface importa o catálogo só por `src/catalog/index.ts`.

## Publicação

Cada push em `main` roda testes, gera o build e publica no GitHub Pages pelo workflow `.github/workflows/pages.yml`. O site inclui os Markdown e checklists do repositório no build e funciona sem servidor de aplicação. A previsão é consultada diretamente no Open-Meteo.

No site publicado, alterações de notas, revisão, checklist, favoritos e avaliações são salvas apenas no navegador atual; não sincronizam com outros aparelhos ou com os arquivos do repositório. Uma nova publicação que altere a fonte de um item substitui o rascunho local desse item. Exporte o roteiro em Markdown para levar suas alterações. A busca automatizada de hotéis exige os scripts do servidor de desenvolvimento e fica indisponível no site estático.

`npm run dev` continua salvando nos arquivos. Para conferir o build do Pages localmente: `GITHUB_ACTIONS=true npm run build` e `GITHUB_ACTIONS=true npm run preview -- --port 4173`, abrindo `/travel-boss/`.

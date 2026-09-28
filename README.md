# Travel Boss

Ferramenta local de roteiros. O documento que você lê na tela é um Markdown em `content/trips/`. Um LLM edita esse arquivo; com `npm run dev` aberto, a tela acompanha o save.

## Rodar

```bash
npm install
npm run dev
```

Busca de hotel (Azul + Booking) e Airbnb só existe no dev server, em `/api/hotel-search`. Airbnb precisa de `npm run travel:airbnb:setup` uma vez. A chave de ranking, se existir, fica em `.env` (`TYPESAFE_API_KEY`) — o servidor também olha o `.env` do portfólio ao lado.

`rm -rf node_modules` apaga o venv do Airbnb/Azul (`node_modules/.cache/airbnb-venv`). Depois disso, rode `npm run travel:airbnb:setup` de novo.

## Artefato

Vídeos do Instagram usam MP4 locais com controles nativos. Após adicionar links ao catálogo ou clonar o projeto, execute `npm run travel:videos:sync` (requer `yt-dlp` no PATH). O comando obtém apenas vídeos públicos, preserva os arquivos existentes e retorna erro se algum download falhar. Os arquivos ficam em `public/videos/instagram/`, fora do Git; o Vite os serve no dev e os inclui no build. Prepare-os antes de gerar o build ou transferir o app para outro computador. Não há dependência do embed, login ou cookies do Instagram durante a reprodução.

O formato está em `content/SCHEMA.md`. Exportar copia HTML (Apple Notes) e Markdown (Notion) e também baixa o `.md`.

## Catálogo

Cidades, lugares, roteiros por cidade e o motor de busca vieram do portfólio e ficam em `src/data` e `scripts/`. A interface importa o catálogo só por `src/catalog/index.ts`.

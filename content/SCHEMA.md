# Trip artifact — `travel-boss/trip/v1`

One Markdown file per trip: `content/trips/<id>.md`.

This file is the source of truth. The UI parses it and renders it. With `npm run dev` running, saving the file updates the open trip in the browser. An LLM edits the Markdown directly. Do not invent a second copy of the itinerary in TypeScript.

## Shape

```markdown
# Europa

## Paris
city: paris
dates: 2026-04-02 → 2026-04-06

### Dia 1 — Chegada

- 14:45 [Trocadéro](place:par-trocadero) — Primeira vista da torre
- 15:50 [Torre Eiffel](place:par-eiffel) — Só por fora

Parágrafo livre, **negrito**, *itálico* e listas extras entram no documento e no export. Não viram pinos.

## Milão
city: milao
dates: 2026-04-06 → 2026-04-09

### Dia 1 — Centro

- 10:00 [Duomo](place:mil-duomo)
```

## Rules

- One H1. It is the trip title.
- One H2 per city, in travel order. The next non-empty line is `city: <slug>` using a slug from the catalog (`paris`, `milao`, `roma`, `lisboa`, `porto`, `sao-paulo`, `florianopolis`, `new-york`, `miami`).
- Optional `dates: YYYY-MM-DD → YYYY-MM-DD` on the following line.
- One H3 per day, in order, inside that city: `### Dia N — Title`.
- A stop is a bullet that starts with optional `HH:mm`, then a link.
  - Catalog stop: `[Label](place:<placeId>)`. The id must already exist on that city.
  - External stop: `[Label](https://...)`.
  - Note, if any, after an em dash: ` — note`.
- Paragraphs under a day are narrative. They render and they export. They are not stops.
- Do not use HTML comments, YAML front matter, or raw HTML.

## Export

Export rewrites the same document for Apple Notes and Notion:

- H1, H2, H3 stay headings.
- Bullets stay bullets.
- `**bold**` and `*italic*` stay.
- `place:<id>` becomes a normal `https://` Google Maps link, using the catalog URL for that place.
- The `city:` line is omitted.
- `dates:` becomes a single line under the city heading.
- Clipboard writes `text/html` (Apple Notes uses this and keeps headings, lists and links) and `text/plain` Markdown (Notion pastes this).
- A `.md` download uses the same Markdown.

## Multi-city

Several H2 sections in one file are one trip. The UI shows a city rail and one scrolling document. The map fits every resolved stop.

## What not to edit for a trip change

Place coordinates, ratings and hotel ranking stay in `src/data`. Hotel and Airbnb search stays on `/api/hotel-search`. A trip file only references place ids.

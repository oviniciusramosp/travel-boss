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
  - via: metrô · 20 min
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
- A bullet inside a day with no link is a list note. It stays in that position in the list, renders, and exports as a bullet. It is not a stop, not a pin, and not an error. `**bold**`, `*italic*`, `[label](https://...)` and `[label](place:<id>)` work in list notes, in the stop note after ` — `, and in paragraphs. A `place:` link selects that place in the app. It does not add a stop.
- The departure stop may have one indented sub-bullet for the leg to the next stop. It is not a stop and it does not become a pin.

  ```markdown
  - 09:00 [Louvre](place:par-louvre)
    - via: metrô M14 + RER E · 35 min
  ```

  - The line must be indented (`  - via: …`). A top-level `- via:` is not a leg — it is a list note, not an error. A second `via:` under the same stop is an error; the first leg is kept.
  - Mode is the earliest PT/EN keyword on the line. Matching ignores case and accents:
    - walk: `a pé`, `walk`
    - transit: `metrô` / `metro`, `rer`, `trem` / `train`, `ônibus` / `onibus`, `bus`, `tram`, `ferry`
    - taxi: `táxi` / `taxi`, `uber`, `carro`, `car`
    - flight: `voo`, `flight`
  - Duration is exactly one token `(\d+)\s?(min|h)`: `35 min`, `35min`, `1 h`, `1h`. The unit is only `min` or `h` (`35 minutos` does not count). `N h` is N hours, stored as 60N minutes (`1 h` = 60, `3 h` = 180). `3h10` is not a token — `h` must not be followed by a letter or digit — so it is not 3 hours and not 3 hours 10 minutes; write `3 h` or `190 min`. Two tokens (`1 h 30 min`) are not added together.
- Paragraphs under a day are narrative. They render (including inline marks) and they export. They are not stops.
- Do not use HTML comments, YAML front matter, or raw HTML.

## Export

Export rewrites the same document for Apple Notes and Notion:

- H1, H2, H3 stay headings.
- Bullets stay bullets. An indented `via:` stays nested under its stop. HTML export puts a `<ul>` inside that stop's `<li>` so Apple Notes and Notion keep the nesting. The `via:` text is copied as written; it is not rewritten from the parsed mode or minutes.
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

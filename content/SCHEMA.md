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
- Optional `via:` in that same city header, before the first day. It says how you leave this city for the next one. It is not a stop and it does not become a pin.

  ```markdown
  via: trem Frecciarossa · 3h10
  ```

  - Same mode keywords and the same duration rules as a stop `via:`.
  - One line per city. A second `via:` is an error; the first leg is kept. An empty `via:` is an error.
  - The line is not a bullet. An indented `- via:` before any day is still outside a day.
  - A paragraph that starts with `via:` under a day stays narrative. It is not this leg.
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
  - Duration is exactly one span. The unit is only `min` or `h` (`35 minutos` does not count):
    - `N min` or `Nmin`: `35 min`, `35min`.
    - `N h` or `Nh`: `1 h` = 60, `3 h` = 180, `3h` = 180.
    - `NhMM`: `3h10` = 190, `1h30` = 90. The minutes are one or two digits glued to `h`, not a second token.
    - `N h M min`: `1 h 30 min` = 90, `3 h 10 min` = 190. `1h30min` is the same span.
    - Two spans are an error (`20 min` and `40 min`, or `1 h` and `2 h`). `1 h 30 min` is one span, not two.
- A stop or a list note may have indented `comentário:` sub-bullets. Each one is a request from the user to the LLM about that item, written from the app.

  ```markdown
  - 09:00 [Louvre](place:par-louvre) — Ingresso das 9h
    - via: metrô · 20 min
    - comentário: dá para entrar mais cedo?
  ```

  - Keyword `comentário:`, `comentario:` or `comment:`, any case, indented like `via:`. A top-level `- comentário:` is a list note. An empty one is ignored. One before the first stop of a day is an error.
  - Not a stop, not a pin, not exported. The UI shows it under its item.
  - The LLM that acts on a comment deletes its line.
- Paragraphs under a day are narrative. They render (including inline marks) and they export. They are not stops.
- Do not use HTML comments, YAML front matter, or raw HTML.

## Export

Export rewrites the same document for Apple Notes and Notion:

- H1, H2, H3 stay headings.
- Bullets stay bullets. An indented `via:` stays nested under its stop. HTML export puts a `<ul>` inside that stop's `<li>` so Apple Notes and Notion keep the nesting. The `via:` text is copied as written; it is not rewritten from the parsed mode or minutes.
- `**bold**` and `*italic*` stay.
- `comentário:` lines are left out.
- `place:<id>` becomes a normal `https://` Google Maps link, using the catalog URL for that place.
- The `city:` line is omitted.
- `dates:` becomes a single line under the city heading.
- A city-header `via:` stays on the next line, copied as written. `3h10` is not rewritten as minutes.
- Clipboard writes `text/html` (Apple Notes uses this and keeps headings, lists and links) and `text/plain` Markdown (Notion pastes this).
- A `.md` download uses the same Markdown.

## Editing from the app

With `npm run dev` the app writes the file too: a stop note, a list note, a paragraph or a comment, one line per save (`PATCH /api/trips/<id>`). A save lands only where the file still has the line the app saw, so the user and an LLM can change different lines at the same time. An LLM edits the current file in place. It never rewrites the whole file from an older copy.

## Multi-city

Several H2 sections in one file are one trip. The UI shows one scrolling document, a city rail, and the header `via:` on the city you leave. The map fits every resolved stop.

## Day card

The UI shows one card per date, not per `### Dia N`. Nothing here is a new syntax.

- Lunch and dinner split the day. Morning runs from waking up through lunch, afternoon until dinner, evening from dinner on. Write the meal in the stop label or note:
  - Lunch: the last stop before dinner that says `almoço` / `lunch`, or a picnic (`piquenique`) before 16:00.
  - Dinner: the first stop that says `jantar` / `dinner`, or a picnic from 18:00.
  - A list note never counts, so "Almoço alternativo: …" does not move the split.
  - Without a lunch stop the morning ends at 12:00. Without a dinner stop the evening starts at 18:00 (and before 05:00). A stop without a time stays in the period above it. A date with no time and no meal has no periods.
- Food and tickets per person come from the catalog, not from the notes: the middle of each range, one count per place per date. A `**Comida:**` line in a note is text for the reader; the card does not read it.

## What not to edit for a trip change

Place coordinates, ratings and hotel ranking stay in `src/data`. Hotel and Airbnb search stays on `/api/hotel-search`. A trip file only references place ids.

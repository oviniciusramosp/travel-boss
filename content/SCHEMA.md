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
- Optional `budget:` in that same city header, before the first day, in any order with `city:` and `dates:`. It is the city's food target per person per day.

  ```markdown
  budget: comida €50
  ```

  - `comida €50` (or `food`) and `ingressos €30` (or `tickets`), either one or both, joined by ` · `. Any case. The amount follows `€`, with a comma or a dot (`€47,50`).
  - One line per city. A second `budget:` is an error (`budget-twice`); the first is kept. One with no amount is an error (`budget-empty`).
  - Like `city:`, the document does not draw it: not a paragraph, not a stop. A paragraph that starts with `budget:` under a day stays narrative.
  - Only food is checked. When a date's food (see "Day card") goes past the target, the food chip turns bold with a `warning` glyph; with a target, its tooltip compares the two (`€62 de €50 por pessoa`). The day's receipt adds `Meta: €50 · passou €12` (or `sobram €8`) under the food subtotal. A date across two cities uses the city of its first stop. Tickets have no target: `ingressos` is read and exported, and nothing warns on it.
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
    - taxi: `táxi` / `taxi`, `uber`, `bolt`, `carro`, `car`
    - flight: `voo`, `flight`
  - Duration is exactly one span. The unit is only `min` or `h` (`35 minutos` does not count):
    - `N min` or `Nmin`: `35 min`, `35min`.
    - `N h` or `Nh`: `1 h` = 60, `3 h` = 180, `3h` = 180.
    - `NhMM`: `3h10` = 190, `1h30` = 90. The minutes are one or two digits glued to `h`, not a second token.
    - `N h M min`: `1 h 30 min` = 90, `3 h 10 min` = 190. `1h30min` is the same span.
    - Two spans are an error (`20 min` and `40 min`, or `1 h` and `2 h`). `1 h 30 min` is one span, not two.
  - Text after ` — ` is the leg's note: what to know on the way (price, where to meet the car). Mode and duration are read only before it, so a duration inside the note does not count.

    ```markdown
    - 13:00 [Brioche Dorée CDG 2E](place:par-cdg-brioche-doree) — Croissant e café
      - via: Pegar um Bolt · 35 min — €29–35 na simulação; o app mostra onde encontrar o carro
    ```

  - A `€` amount before the note is the leg's price per person (`€2,55`, or a range `€15–18`, which counts its middle). The day card adds it to tickets, once per leg. Write only what each person pays on top of the week pass: a single metro ticket on a day the pass does not cover, or the pass itself on the first leg of the day it starts (`com a Navigo Semaine · 35 min · €32,40`). A leg the pass covers has no `€`. The timeline shows the price at the right of the leg, on its first ride.

    ```markdown
    - 17:15 [Casa do Gui](place:par-casa-do-gui) — Compre 2 tickets Métro-Train-RER por pessoa
      - via: RER E + metrô 9 · 45 min · €2,55
    ```

  - The timeline names the leg with the text before the note, minus the duration and the price. It already shows the minutes beside the name. The note goes under that name. Write the name as a short action ("Pegar um Bolt"). A catalog leg keeps its own name and hops.
- A stop or a list note may have indented `comentário:` sub-bullets. Each one is a request from the user to the LLM about that item, written from the app.

  ```markdown
  - 09:00 [Louvre](place:par-louvre) — Ingresso das 9h
    - via: metrô · 20 min
    - comentário: dá para entrar mais cedo?
  ```

  - Keyword `comentário:`, `comentario:` or `comment:`, any case, indented like `via:`. A top-level `- comentário:` is a list note. An empty one is ignored. One before the first stop of a day is an error.
  - Not a stop, not a pin, not exported. The UI shows it under its item.
  - The LLM that acts on a comment deletes its line.
- A stop or a list note may also have indented `decisão:` sub-bullets. Each one is something the user decided about that item. Unlike a comment, it stays: the LLM never undoes, moves or deletes what it protects unless the user asks.

  ```markdown
  - 21:15 [Margaux](place:par-margaux) — **Jantar** (~€35 por pessoa)
    - via: metrô 9 · 20 min
    - decisão: 2026-09-27 · manter o Margaux mesmo acima do orçamento do dia
  ```

  - Keyword `decisão:`, `decisao:` or `decision:`, any case, indented like `via:`. The date it was decided goes first (`2026-09-27 · …`); the parser does not check it. More than one per item is fine. A top-level `- decisão:` is a list note. An empty one is ignored. One before the first stop of a day is an error (`decision-no-stop`).
  - Not a stop, not a pin, not exported. The UI shows it under its item, above the comments, always visible and with no delete button.
- A stop note, a list note, a paragraph, a comment or a decision can break onto the next line (a `via:` note stays on its line): end the line with `\` (a Markdown hard break) and go on in the next one, indented under the bullet. The app writes this for Shift+Return.

  ```markdown
  - 11:55 [CDG](place:par-cdg) — Pouso no Terminal 2.\
    Passaporte e malas: conte ~1h.
    - via: RER B · 35 min
    - comentário: dá para pegar o RER B direto?\
      Ou precisa do TGV?
  ```

  - The next line goes on the note whatever it starts with, even `- `, unless it is a heading. The line after one without `\` does not.
  - Indent the rest under the text: 2 spaces for a stop or list note, 4 for a comment or a decision, none for a paragraph.
  - A blank line ends the note. Export writes the breaks back the same way, and as `<br>` in the HTML.
- Paragraphs under a day are narrative. They render (including inline marks) and they export. They are not stops.
- Do not use HTML comments, YAML front matter, or raw HTML.

## Export

Export rewrites the same document for Apple Notes and Notion:

- H1, H2, H3 stay headings.
- Bullets stay bullets. An indented `via:` stays nested under its stop. HTML export puts a `<ul>` inside that stop's `<li>` so Apple Notes and Notion keep the nesting. The `via:` text is copied as written; it is not rewritten from the parsed mode or minutes.
- `**bold**` and `*italic*` stay.
- `comentário:` and `decisão:` lines are left out.
- `place:<id>` becomes a normal `https://` Google Maps link, using the catalog URL for that place.
- The `city:` line is omitted.
- `dates:` becomes a single line under the city heading.
- A city-header `budget:` is left out, like `city:`: the target is for the app, not for the reader.
- A city-header `via:` stays on the next line, copied as written. `3h10` is not rewritten as minutes.
- Clipboard writes `text/html` (Apple Notes uses this and keeps headings, lists and links) and `text/plain` Markdown (Notion pastes this).
- A `.md` download uses the same Markdown.

## Editing from the app

With `npm run dev` the app writes the file too: a stop note, a list note, a paragraph, a comment, a decision or the note of a `via:` (after ` — `), one line per save (`PATCH /api/trips/<id>`). A save lands only where the file still has the line the app saw, so the user and an LLM can change different lines at the same time. An LLM edits the current file in place. It never rewrites the whole file from an older copy.

## Multi-city

Several H2 sections in one file are one trip. The UI shows one scrolling document, a city rail, and the header `via:` on the city you leave. The map fits every resolved stop.

## Day card

- A stop whose label or note mentions `pôr do sol` / `sunset` shows the user's sunset icon beside its costs, including free stops. An explicit `19h21` or `19:21` immediately after that phrase is included in the tooltip. Negated plans and mentions of before/after sunset in the same clause do not mark the stop. This indicates the authored plan; it does not calculate astronomical times or use the day's heading.

The UI shows one card per date, not per `### Dia N`. Nothing here is a new syntax.

- Lunch and dinner split the day. Morning runs from waking up through lunch, afternoon until dinner, evening from dinner on. Write the meal in the stop label or note:
  - Lunch: the last stop before dinner that says `almoço` / `lunch`, or a picnic (`piquenique`) before 16:00.
  - Dinner: the first stop that says `jantar` / `dinner`, or a picnic from 18:00.
  - A list note never counts, so "Almoço alternativo: …" does not move the split.
  - Without a lunch stop the morning ends at 12:00. Without a dinner stop the evening starts at 18:00 (and before 05:00). A stop without a time stays in the period above it. A date with no time and no meal has no periods.
- Food and tickets per person come from the catalog, not from the notes: the middle of each range, one count per place per date. A `**Comida:**` line in a note is text for the reader; the card does not read it. A leg's `€` price (see `via:`) is the one thing outside the catalog that counts, as a ticket. A stop's sub-points that name a catalog place (`placeId`, such as the restaurants inside a park) count too, on the park's row. Both cards always show, €0 included. A click on them opens the day's receipt: each place and leg price, a subtotal per kind and the total per person.
- When two hours or more are left after a stop (its catalog stay, or 1 h without one, and the way to the next stop), the timeline adds a "Roteiro em aberto" block: at the end of the stop's period, or right before the next stop inside the same period. Arriving and leaving the same place (a rest at home) does not count. It is not a stop and is not written in the file.
- A walk the timeline would show as "~1 min" gets no row of its own; the dotted line still joins the two stops, and the map still draws it.
- A leg's row sits just before the next stop, after any list notes between the two. A park is the stop and its rides are timed list notes under it, so the walk out of the park shows after the last ride. Walks start at a place's last sub-point and end at the next place's first, like the map.
- A list note that starts with `+3 km`, `+1,5 km` or `+800 m` adds that much to the date's walked distance (a museum's corridors, the queues of a park): the route's walk segments never include those. The rest of the line is why. It goes in the card of the stop above it ("Trip notes"), not on the timeline.
- A timed list note right under a stop whose opening `**bold**` (or the text before ` — `) is the name of one of the place's sub-points, in either language, belongs to that point: it leaves the timeline, the place card shows it inside that point (with the photo), and the stop's "points" line becomes a toggle that lists the points as small dots in the parent's color, with the note's time. The day's route walks the points in the order of those times, a revisit included (Pirates at 16:00 and again at 19:15); points without a time follow their catalog neighbour. Without timed notes the route takes the catalog order. A note that only mentions a point ("Piratas e Phantom Manor de novo") stays a list note.
- A stop whose label or note says `sem comprar`, `sem comer`, `sem consumir`, `só olhar`, `só uma olhada`, `só visitar` (`no purchase`, `just looking`, `just a look`) only looks at the place, so its food does not count that date; its ticket still does. If another stop that date buys there, the food counts again.
- A stop whose label or note says `por fora`, `fachada`, `passar na frente`, `sem subir`, `sem entrar`, `não vamos subir` or `não vamos entrar` (`outside`, `facade`) is seen from outside, so its place's ticket does not count that date: "Foto por fora" at the Moulin Rouge costs nothing. If the note also says `por dentro` (`inside`), as in "Por fora é grátis. Por dentro, €25", going in is part of the plan and the ticket counts.

## What not to edit for a trip change

Place coordinates, ratings and hotel ranking stay in `src/data`. Hotel and Airbnb search stays on `/api/hotel-search`. A trip file only references place ids.

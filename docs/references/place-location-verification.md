# place-location-verification

Referência migrada da memória do projeto em 2026-09-27. Os fatos abaixo mantêm a data da pesquisa original; reconfira fontes antes de alterar o roteiro.

Sources that settled `par-fric-frac` (2026-09-25):

- **BAN** `https://api-adresse.data.gouv.fr/search/?q=<address>` gives house-number coordinates for French addresses. If `type` comes back as `street`, the house number doesn't exist.
- **OSM node history** `api.openstreetmap.org/api/0.6/node/<id>/history.json` shows renames. An `old_name` tag means the business changed hands.
- **Pappers / societe.com** show fonds de commerce sales (buyer, date). This is how a shop's closure gets confirmed.
- **Official site's Google Maps link**: `!3d<lat>!4d<lng>` is the real pin.

A `mapsUrl` `@lat,lng` is the viewport centre, not the pin. Paris entries sit a median ~190 m off, so it's not evidence of a wrong pin. Before trusting a description ("by the canal"), check the itinerary legs too (`travel-itinerary-legs.ts`), since they often show which branch was meant. Related: `no-notion-push-public-portfolio` (memória histórica do Claude), `concurrent-agents-travel-boss` (memória histórica do Claude).

Added by the five-place audit (Chartier, Fric-Frac, Crêperie des Arts, Jeffrey Cagnes, Michalak; commit 666ffd7, 2026-09-25):

- **SIRENE** `recherche-entreprises.api.gouv.fr/search?q=<name or address>&code_postal=<cp>` is free and needs no key. It lists every company registered at an address, open or closed. The SIRET in the official site's "mentions légales" tells you which company runs the shop.
- Two shops can share one house number. A shared e-mail or owner doesn't prove a rename: Crêperie des Arts and Crêperie des Pêcheurs at 27 Rue Saint-André des Arts have separate SIRETs, phones and sites.
- When one field disagrees with all the others, that field is probably the stale one. For Michalak, the name, mapsUrl and the Versailles leg all said Neuilly, and only the address said 7e. The user's report had assumed the address was the right field.
- Google rating and pin come from the browser pane: open `google.com/maps/search/?api=1&hl=en&query=…`, then read the `h1`'s 4th ancestor `innerText` ("Name | 4.1 | (33,328)·€10–20"). The URL's `!3d!4d` is the pin. There was no consent wall. `googleRating` goes stale too: Chartier was 4.9 in the catalog and 4.1 on Google.
- Overpass: `overpass-api.de` gave 429/504 errors and `overpass.private.coffee` timed out, but `maps.mail.ru/osm/tools/overpass/api/interpreter` worked.

Added by the Paris link audit (2026-09-27):

- **Does the Maps link open the place card or a results list?** `curl` cannot tell: Google renders client-side and `maps.app.goo.gl` returns a Firebase interstitial. Use PinchTab (installed, headless Chrome): `pinchtab bridge --engine chrome &`, then per place `pinchtab nav "<url>"; sleep 5; pinchtab eval "location.href"`. A final URL with `/maps/place/…!1s0x…` means the card opened; `/maps/search/…` means a list (count results with `document.querySelectorAll('div[role=feed] a[href*="/maps/place/"]').length`). Google answers in pt-BR (`h1` = "Campo de Marte"), so compare the heading with `name['pt-BR']` as well as `name.en`. ~5 s per place, 232 places ≈ 40 min, no consent wall or captcha on this Mac.
- The app builds most links as `search/?api=1&query=<mapsQuery>` (200 of 232 Paris places; 32 have a hand-written `mapsUrl`; none use `placeId`). A query link opens the card only when Google finds exactly one match; the durable fix is the canonical `https://www.google.com/maps/place/<name>/@lat,lng,17z/data=…!1s0x…` URL (strip `?entry=ttu&g_ep=…`) in `mapsUrl`.

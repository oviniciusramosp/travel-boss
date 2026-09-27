# dlp-idfm-live-data-sources

Referência migrada da memória do projeto em 2026-09-27. Os fatos abaixo mantêm a data da pesquisa original; reconfira fontes antes de alterar o roteiro.

Sources that returned hard data on 2026-09-25 (planning the 7/10 Disney day):

- **Park hours per date:** `https://api.themeparks.wiki/v1/entity/<id>/schedule/YYYY/MM` mirrors the official API. Disneyland Park `dae968d5-630d-4719-8b06-3d107e944401`, Disney Adventure World `ca888437-ebb4-4d50-aed2-d227f7096968`. `/live` has today's show times and Premier Access prices.
- **Official ticket price per date:** open `https://tickets.disneylandparis.com/fr-fr/tickets` in the browser pane, then `fetch('/api/selectionDrawer/priceCalendar', {method:'POST', …})` from the page. Get the body by capturing the page's own call. 1 day/2 parks = `contentLabelId`/`productType` `TKITL1DJ`, adult `TKITHL001A`, child `TKITHL001C`; 1 park = `TKITL1DV` / `TKITK6001A`. WebFetch gets 403 or Queue-it on disneylandparis.com. `news.disneylandparis.com` works with curl and a browser User-Agent.
- **Train/bus itineraries with planned works:** `https://api.transitous.org/api/v1/plan?fromPlace=lat,lng&toPlace=lat,lng&time=<UTC ISO>` (IDFM GTFS). Times come back in UTC, so add 2 h in CEST. The first walk leg is inflated. Works calendars: `malignee.transilien.com` (RER E) and `malignea.fr` (RER A).
- **Walking time between pins:** the same OSRM foot endpoint as the app, `routing.openstreetmap.de/routed-foot`.
- **Pins:** use Overpass `nwr["attraction"]` / `["amenity"~"restaurant|fast_food"]` in a bbox. It often times out, so retry after 15 s.

Added 2026-09-26 (planning 4–6/10):
- **Ride prices:** Bolt route pages `bolt.eu/fr-fr/cities/paris/route/<from>-to-<to>/` (curl works; slugs like `terminal-2e-paris-charles-de-gaulle-airport-to-gare-de-lest`) list a price per category. They fit base €4.33 + €1.10/km + €0.18/min almost exactly, with no surge and no airport fee. Uber route pages `uber.com/global/en/r/routes/<from>-to-<place>-idf-fr/` show last-month averages (CDG → Noisy-le-Sec UberX €28).
- **Restaurant slots:** Zenchef's public `bookings-middleware.zenchef.com/getAvailabilities?restaurantId=<id>&date_begin=…&date_end=…` returns the slot grid (rid comes from the site's booking link).
- **Opéra Garnier slots:** operadeparis.fr `/ajax/data-affluence/details/timetable?date=YYYY-MM-DD`.
- **Hours when the browser pane is hidden:** clicks fail, but Google Maps still renders. Read the hours from `[aria-label]` values matching `/day, .*(AM|PM|Closed)/`.
- **Transitous caveat:** plans ignore "arrêt non desservi" alerts. See [paris-oct-2026-transit-disruptions](paris-oct-2026-transit-disruptions.md).

Related: `commons-photo-urls` (memória histórica do Claude), `concurrent-agents-travel-boss` (memória histórica do Claude).

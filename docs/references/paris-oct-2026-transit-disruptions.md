# paris-oct-2026-transit-disruptions

Referência migrada da memória do projeto em 2026-09-27. Os fatos abaixo mantêm a data da pesquisa original; reconfira fontes antes de alterar o roteiro.

Checked 2026-09-26 (IDFM alerts via Transitous, sortiraparis, malignee.transilien.com):

Rechecked 2026-09-29: [official RER E works calendar](https://malignee.transilien.com/2026/09/02/calendrier-travaux-rer-e-septembre-et-octobre-2026/), [official 5–14 October poster](https://malignee.transilien.com/wp-content/uploads/2026/09/Affiche-A0-CSG-du-5-au-14-oct-a-afficher-le-5-sept-page-001-scaled.jpg), [Transitous last-train query](https://api.transitous.org/api/v1/plan?fromPlace=48.875016%2C2.328696&toPlace=48.896765%2C2.458672&time=2026-10-05T19%3A55%3A00Z&numItineraries=12&detailedTransfers=true), and [Transitous fallback query](https://api.transitous.org/api/v1/plan?fromPlace=48.8715109%2C2.341904&toPlace=48.893017%2C2.454059&time=2026-10-05T20%3A25%3A00Z&numItineraries=6&detailedTransfers=true).

- **CGT-RATP unlimited strike notice** from Mon 28 Sep 2026 19:00: all metro lines, RATP buses and trams, RER A, RER B south of Gare du Nord. SNCF lines (RER C, D, E, Transilien, RER B CDG branch) are not covered. That is why the trip keeps "Greve no metrô X:" fallbacks that use RER C/E. The user drops a fallback once the day no longer uses that line.
- **RER E closes at night, whole line Nanterre ↔ Chelles** (Haussmann, Magenta, Noisy-le-Sec included):
  - Weekends 26 Sep–6 Dec (not 25 Oct): from 22:45; last train Haussmann 22:59 → Noisy 23:16.
  - Weeknights Mon 5–Wed 14 Oct: no trains from 22:30. For Mon 5 Oct, the timetable query shows Haussmann → Noisy-le-Sec departures at 22:07 (arrival 22:19) and 22:14 (arrival 22:31); 22:14 is the last through train returned before the closure.
  - Other weeknights: last train 22:59.
  - Replacement buses leave Bobigny–Pablo Picasso (end of M5), not central Paris.
- **M8 does not stop at République until 22 Apr 2027.** Use M9 or get off at Filles du Calvaire. Transitous still routes through it, so trust the alert, not the plan.

Fallback checked for Mon 5 Oct after the RER E closure: walk to Grands Boulevards, M9 to République, M5 to Bobigny–Pantin–Raymond Queneau, bus 145 to Jeanne d’Arc, then about 8 min on foot to Casa do Gui. Transitous timetable: 22:39–23:28 local, about 49 min. The official works poster also provides a replacement bus from Bobigny–Pablo Picasso (M5) serving every RER E station through Chelles–Gournay.

**How to apply:** any evening return to Casa do Gui must beat those last trains; put the cutoff in the stop note. Related: `trip-train-legs` (memória histórica do Claude), [dlp-idfm-live-data-sources](dlp-idfm-live-data-sources.md).

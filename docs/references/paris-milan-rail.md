# Traçado Paris–Milão — 11/10/2026

Consultado em 28/09/2026. Geometria em `src/data/travel-paris-milan-rail.json`, na ordem `[lat, lng]`.

- [Consulta Transitous](https://api.transitous.org/api/v1/plan?fromPlace=48.8449,2.3735&toPlace=45.4863,9.2045&time=2026-10-11T05:00:00Z&numItineraries=5&detailedTransfers=true): primeira opção, perna `HIGHSPEED_RAIL`, `FR 9281`, operador TRENITALIA, 11/10/2026 05:30–12:07 UTC (07:30–14:07 local). Fonte informada: `it_trenitalia.netex.zip/trenitalia.xml:359014691:359014691`. Horário programado, não informação em tempo real nem reserva.
- `tripId`: `20261011_07:30_it-trenitalia_IT::VehicleJourney:railTRENITALIA:680083_0_68-9281-4B19-0083_68-9281-4B19-0083`.
- Geometria `legGeometry.points` decodificada com a precisão **7** informada pela API (11.563 vértices), simplificada por Douglas–Peucker com tolerância de 30 m em projeção equiretangular a 47° e arredondada a seis casas decimais. Preservados os extremos fornecidos pelo serviço; os acessos a pé desde os pinos do catálogo continuam separados.
- [Tabela oficial da Trenitalia](https://trenitalia.fr/wp-content/uploads/2026/06/Horaires-Trenitalia-Paris-Milan-2026.pdf) e [linha Paris–Milão](https://trenitalia.fr/voyager-avec-trenitalia/nos-trains-et-lignes/paris-milan/): corredor por Lyon, Chambéry, Saint-Jean-de-Maurienne, Modane, Oulx e Torino, terminando em Milano Centrale.

O traçado é a geometria ferroviária retornada pelo planejador, simplificada para o mapa; não uma linha reta entre cidades nem uma rota rodoviária. Esta alteração não move os pinos das estações e não altera horários ou confirmações do roteiro.

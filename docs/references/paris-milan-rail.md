# Traçado Paris–Milão — 11/10/2026

Consultado em 28/09/2026. Geometria em `src/data/travel-paris-milan-rail.json`, na ordem `[lat, lng]`.

- [Consulta Transitous](https://api.transitous.org/api/v1/plan?fromPlace=48.8449,2.3735&toPlace=45.4863,9.2045&time=2026-10-11T05:00:00Z&numItineraries=5&detailedTransfers=true): primeira opção, perna `HIGHSPEED_RAIL`, `FR 9281`, operador TRENITALIA, 11/10/2026 05:30–12:07 UTC (07:30–14:07 local). Fonte informada: `it_trenitalia.netex.zip/trenitalia.xml:359014691:359014691`. Horário programado, não informação em tempo real nem reserva.
- `tripId`: `20261011_07:30_it-trenitalia_IT::VehicleJourney:railTRENITALIA:680083_0_68-9281-4B19-0083_68-9281-4B19-0083`.
- Geometria `legGeometry.points` decodificada com a precisão **7** informada pela API (11.563 vértices), simplificada por Douglas–Peucker com tolerância de 30 m em projeção equiretangular a 47° e arredondada a seis casas decimais. Preservados os extremos fornecidos pelo serviço; os acessos a pé desde os pinos do catálogo continuam separados.
- [Tabela oficial da Trenitalia](https://trenitalia.fr/wp-content/uploads/2026/06/Horaires-Trenitalia-Paris-Milan-2026.pdf) e [linha Paris–Milão](https://trenitalia.fr/voyager-avec-trenitalia/nos-trains-et-lignes/paris-milan/): corredor por Lyon, Chambéry, Saint-Jean-de-Maurienne, Modane, Oulx e Torino, terminando em Milano Centrale.

O traçado é a geometria ferroviária retornada pelo planejador, simplificada para o mapa; não uma linha reta entre cidades nem uma rota rodoviária. Esta alteração não move os pinos das estações e não altera horários ou confirmações do roteiro.

## Estações do Frecciarossa 9281 — consulta em 11/10/2026

A tabela oficial acima confirma o serviço de fim de semana de 10/10 a 12/12: Paris 07:30, Lyon Part-Dieu 09:26–09:31, Chambéry 10:41–10:54, Saint-Jean-de-Maurienne 11:33–11:36, Modane 12:03–12:10, Oulx 12:34–12:36, Torino Porta Susa 13:20–13:22 e Milano Centrale 14:07. Horários programados, sem afirmar pontualidade em tempo real. A consulta Transitous de hoje não retornou esse serviço; preservada a geometria previamente consultada e usada a tabela da operadora para selecionar as paradas.

Coordenadas consultadas nos objetos exatos do OSM (`https://www.openstreetmap.org/api/0.6/node/<id>.json`), sem geocodificação:

| Parada | Objeto OSM | Latitude, longitude |
|---|---|---|
| Lyon Part-Dieu | [4290857016](https://www.openstreetmap.org/node/4290857016) | 45.7605725, 4.8601628 |
| Chambéry - Challes-les-Eaux | [5066478129](https://www.openstreetmap.org/node/5066478129) | 45.5714735, 5.9198732 |
| Saint-Jean-de-Maurienne Arvan | [1240169744](https://www.openstreetmap.org/node/1240169744) | 45.2779151, 6.3544141 |
| Modane | [11599419549](https://www.openstreetmap.org/node/11599419549) | 45.1933301, 6.6590437 |
| Oulx - Cesana - Claviere - Sestriere | [256630618](https://www.openstreetmap.org/node/256630618) | 45.038731, 6.831411 |
| Torino Porta Susa | [11592793752](https://www.openstreetmap.org/node/11592793752) | 45.0715765, 7.6658551 |

Centros ferroviários das estações para as bolinhas da linha; Saint-Jean usa o objeto `railway=stop` nos trilhos. Não são pontos de acesso de pedestres nem novas visitas do catálogo. Paris e Milão mantêm os extremos da geometria existente. O mapa recebe as oito paradas separadamente do traçado, com nome no tooltip; a timeline conta seis intermediárias.

Transferência Milano Centrale → Joy 124: preferência do usuário por Uber ou Bolt com malas. Janela de 15 min é estimativa de planejamento incluindo espera; disponibilidade, ponto de encontro e tarifa dependem da consulta no aplicativo. Check-in às 14h45 preservado, assim como as refeições e seus gastos.

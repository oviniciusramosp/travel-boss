# Marché Notre-Dame — polígono de destaque, 11/10/2026

Pedido: destacar o conjunto do mercado no hover de seu ponto. Pino, endereço, card e roteiro preservados.

- [Turismo oficial — Notre-Dame market](https://en.versailles-tourisme.com/notre-dame-market.html): identifica o mercado na Place du Marché Notre-Dame e distingue os pavilhões cobertos e os Carrés de mercado ao ar livre.
- [OSM — Place du Marché Notre-Dame, way 1289322292](https://www.openstreetmap.org/way/1289322292): área fechada `place=square`.
- Pavilhões OSM `building=retail`: [Carré à la Viande, 74623939](https://www.openstreetmap.org/way/74623939), [Carré à la Marée, 74627499](https://www.openstreetmap.org/way/74627499), [Carré aux Herbes, 74628546](https://www.openstreetmap.org/way/74628546) e [Carré à la Farine, 74629112](https://www.openstreetmap.org/way/74629112).

Dados consultados pela API OSM `map?bbox=2.1305,48.8055,2.1335,48.8075` em 11/10/2026. Polígono formado pela união da praça e dos quatro pavilhões: removidas apenas as arestas internas compartilhadas; as 46 coordenadas externas vêm dos objetos OSM, sem interpolação, caixa retangular ou estimativa. Contorno fechado com 47 pontos e registrado em `travel-areas-osm.ts` e `OSM_AREA_IDS`.

O node 270242626 de nome Marché Notre-Dame representa estacionamento subterrâneo (`amenity=parking`, `parking=underground`) e não foi usado como área do mercado. O centro já auditado do catálogo fica dentro do polígono.

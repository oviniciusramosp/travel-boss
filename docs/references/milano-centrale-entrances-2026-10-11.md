# Milano Centrale — área e entradas, 11/10/2026

Identidade e área: [relação OSM 18231605](https://www.openstreetmap.org/relation/18231605), `building=train_station`, `name=Milano Centrale`. Anel externo conectado dos membros da relação obtido da API OSM; simplificação de aproximadamente 0,8 m, 65 → 31 vértices. Marca o edifício ferroviário, sem incluir as praças nem o bairro homônimo. Contorno armazenado na tabela OSM e registrado no índice para carregamento no hover.

Acessos públicos alternativos, separados dos sub-pontos de passeio:
- Piazza IV Novembre, oeste: [nó 1512865718](https://www.openstreetmap.org/node/1512865718), `entrance=main`, `railway=train_station_entrance`, 45.4865548, 9.2032798. Conectado ao caminho interno 190443524 e à calçada 936646999.
- Piazza Duca d’Aosta, principal: [nó 2010688969](https://www.openstreetmap.org/node/2010688969), `entrance=main`, 45.4855653, 9.2039649, na fachada do edifício.
- Piazza Luigi di Savoia, leste: [nó 1875027118](https://www.openstreetmap.org/node/1875027118), `entrance=main`, `railway=train_station_entrance`, 45.4854415, 9.2055335.

[YesMilano](https://www.yesmilano.it/esplora/itinerari/itinerario-accessibile-alta-moda-e-teatro) identifica a entrada lateral da Piazza Luigi di Savoia e vagas junto à entrada da Piazza IV Novembre. [Grandi Stazioni](https://www.milanocentrale.it/stores/mercato-centrale) confirma o Mercado Centrale no térreo do lado IV Novembre. Consulta OSM: `https://api.openstreetmap.org/api/0.6/map?bbox=9.202,45.484,9.209,45.490`. Portas não certificadas e acessos de lojas não foram incluídos.

Rotas a pé usam a entrada cadastrada mais próxima do outro extremo, por distância geográfica, e depois solicitam o trajeto real ao roteador. Não representa escolha por menor tempo entre todas as portas; não soma circulação interna entre os acessos e a plataforma. Trem e carro preservam seus pontos anteriores. Mapa, km a pé e card do trecho compartilham o acesso escolhido; o pino da estação continua sendo a âncora do lugar, sem movê-lo artificialmente.

Hotel Joy 124 → acesso IV Novembre conferido no OSRM: 1.013,6 m, 810,6 s (~14 min), ajuste de destino 0 m. Endpoint: `https://routing.openstreetmap.de/routed-foot/route/v1/foot/9.20589,45.49337;9.2032798,45.4865548?overview=full&geometries=geojson`. Os 25 min planejados no roteiro continuam como margem para malas; não substituir por duração automática até a plataforma. Horários e orçamento preservados.

# Contornos do Castel Sant’Angelo e da Piazza Navona

Consulta em 17/10/2026, diretamente na API do OpenStreetMap, com os nós completos de cada way. Identidade conferida pelo nome, tags e Wikidata do mesmo objeto já referenciado pelo catálogo; pinos, endereços e links permanecem coerentes e não foram alterados.

- **Castel Sant’Angelo (`rom-castel-angelo`)**: [way 8035487](https://www.openstreetmap.org/way/8035487), versão 103, `historic=castle`, `building=yes`, nome Castel Sant’Angelo, Wikidata Q486382. Usado o contorno fechado da construção do castelo, sem incluir o Parco Adriano ou a ponte. [Geometria completa](https://api.openstreetmap.org/api/0.6/way/8035487/full.json): 115 vértices com fechamento, reduzidos a 33.
- **Piazza Navona (`rom-navona`)**: [way 4247138](https://www.openstreetmap.org/way/4247138), versão 80, `place=square`, nome Piazza Navona, Wikidata Q463400. Usado o limite fechado da própria praça, incluindo sua extensão norte e sul; não o contorno de uma fonte ou de uma rua. [Geometria completa](https://api.openstreetmap.org/api/0.6/way/4247138/full.json): 109 vértices com fechamento, reduzidos a 26.

Simplificação Ramer–Douglas–Peucker com tolerância de 0,25 m em projeção métrica local, preservando o fechamento. Coordenadas em `[latitude, longitude]`, sem estimativas por centro de câmera. Os dois pinos existentes ficam dentro dos respectivos polígonos. As consultas de regeneração preservam estas geometrias verificadas; a fonte acima permite atualização explícita.

Escopo: acrescentar as áreas ao registro de geometrias e à lista de carregamento do mapa. Nenhuma alteração de horários, preços, visitas ou reservas.

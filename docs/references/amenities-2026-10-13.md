# Água e banheiros próximos — 13/10/2026

Dados © colaboradores do OpenStreetMap, ODbL. Coleta pelo [Overpass](https://overpass-api.de/api/interpreter), com resposta original, consulta, horário e objetos OSM preservados em `amenities-2026-10-13/<cidade>.json`.

| Cidade/área | Água | Banheiros |
| --- | ---: | ---: |
| Milão | 372 | 181 |
| Veneza | 150 | 51 |
| Verona | 128 | 18 |
| La Spezia e Cinque Terre | 103 | 30 |
| Roma | 1094 | 168 |
| Lisboa | 601 | 338 |
| Porto | 98 | 242 |

A cobertura usa células de 0,02° e as oito vizinhas de cada lugar e subponto do catálogo; não é uma busca nacional. A posição exata de nós vem do objeto OSM. Banheiros desenhados como edifícios usam o centro calculado pelo Overpass como representação do edifício, sem afirmar que seja a porta de acesso. Objetos coincidentes são reunidos por coordenada e tipo nos arquivos compartilhados, preservando tarifa conhecida e preferindo cobrança quando os objetos discordam. Os pontos são indicadores de serviço, separados do catálogo e da timeline.

Consulta: `nwr[amenity~"^(drinking_water|toilets)$"]`, fontes `amenity=fountain` com `drinking_water=yes` e torneiras `man_made=water_tap` com `drinking_water=yes`. Exclui coordenadas ausentes, `access=private/no/customers/permit` e objetos marcados como desativados. A camada de água exclui `drinking_water=no` e qualquer cobrança explícita. A ausência de `fee` em água pública adota o padrão documentado pelo OSM de uso gratuito e público; não é uma confirmação individual de operação. Fontes ornamentais sem potabilidade explícita não entram. Banheiros preservam cobrança conhecida; ausência de tarifa não recebe rótulo de gratuito.

Fontes consultadas em 13/10/2026: [amenity=drinking_water](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Ddrinking_water), [drinking_water](https://wiki.openstreetmap.org/wiki/Key:drinking_water), [amenity=toilets](https://wiki.openstreetmap.org/wiki/Tag:amenity%3Dtoilets). As informações dependem da cobertura e atualização dos colaboradores; não verificam abertura, manutenção, disponibilidade ou acesso naquele instante. As demais cidades preservam sua coleta anterior.

No mapa: corredor de 150 m dos segmentos a pé e raio de 500 m da posição compartilhada pelo controle de localização. Sem rota e sem GPS, considera 500 m do centro visível. Apenas células que cruzam a área visível e o corredor/raio são elegíveis; por atualização, carrega até 24 células mais próximas do centro. O índice da rota evita comparar cada ponto com todos os seus vértices. Renderiza no máximo 24 pontos de água e 24 banheiros, priorizando a proximidade ao GPS, depois à região visível da rota. Zoom mínimo 14. Movimentos são agrupados por 150 ms; GPS só refaz a busca após deslocamento de 25 m. Cache LRU de 64 células, compartilhamento de requisições em andamento, repetição após falha e preservação dos ícones que continuam elegíveis.

Coleta completa: 367 arquivos de células, 173.963 bytes no total; maior célula de 2.979 bytes. Os arquivos usam `BASE_URL` no build estático e entram no conjunto opcional de cache offline já existente. Localização permanece restrita ao toque explícito e é liberada ao desligar ou desmontar o mapa.

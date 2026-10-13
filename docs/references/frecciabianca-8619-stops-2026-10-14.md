# Frecciabianca 8619 — estações até La Spezia em 14/10/2026

Consulta em 13/10/2026 para o serviço do roteiro. [Transitous](https://api.transitous.org/api/v1/plan?fromPlace=45.48634%2C9.20454&toPlace=44.111%2C9.8136&time=2026-10-14T10%3A55%3A00Z&numItineraries=6): primeira opção, `agencyName: TRENITALIA`, `tripShortName: 8619`, `routeLongName: Frecciabianca`, destino final Roma Termini. Fonte declarada: `it_trenitalia.gtfs.zip/stop_times.txt:133340:133354`. O trecho pedido termina em La Spezia; estações posteriores não foram acrescentadas.

Horários programados convertidos de UTC para Europe/Rome (UTC+2 nesta data), sem atraso em tempo real:

| Estação | Chegada | Partida |
|---|---|---|
| Milano Centrale | — | 13:10 |
| Pavia | 13:34 | 13:36 |
| Genova Piazza Principe | 14:39 | 14:50 |
| Genova Brignole | 14:56 | 14:58 |
| Rapallo | 15:23 | 15:25 |
| Chiavari | 15:32 | 15:34 |
| La Spezia Centrale | 16:14 | — |

As cinco paradas são `intermediateStops` do serviço, não vértices da geometria. Duração 184 min e horários do roteiro preservados. A geometria Transitous existente corresponde ao mesmo serviço (ver [italy-trains-2026.md](italy-trains-2026.md)).

## Identidade e coordenadas dos pontos intermediários

Pesquisa nominal no Nominatim em 13/10/2026, com nome da estação + `railway station`, `format=jsonv2`, `extratags=1`. Cada resultado é um objeto OSM `railway=station`, `public_transport=station`, operado por RFI; não é geocodificação de endereço. Nomes coincidem com as paradas do GTFS da Trenitalia.

| Estação / objeto OSM | Latitude | Longitude |
|---|---|---|
| [Pavia · nó 211030020](https://www.openstreetmap.org/node/211030020) | 45.1887959 | 9.1449027 |
| [Genova Piazza Principe · nó 1777874067](https://www.openstreetmap.org/node/1777874067) | 44.4170197 | 8.9211296 |
| [Genova Brignole · nó 36899984](https://www.openstreetmap.org/node/36899984) | 44.4066928 | 8.9469156 |
| [Rapallo · nó 82739131](https://www.openstreetmap.org/node/82739131) | 44.3512719 | 9.2313476 |
| [Chiavari · nó 203592307](https://www.openstreetmap.org/node/203592307) | 44.3150590 | 9.3224198 |

Escolha: ponto OSM da estação como âncora do nome no mapa, sem alegação de plataforma ou acesso específico. Milano Centrale e La Spezia usam os extremos da geometria já cadastrada; pinos e acessos existentes não foram movidos. As estações pertencem ao trecho de transporte, sem novas visitas na timeline nem lugares no catálogo. Overpass indisponível por sobrecarga/timeout; os objetos foram identificados pela pesquisa nominal Nominatim.

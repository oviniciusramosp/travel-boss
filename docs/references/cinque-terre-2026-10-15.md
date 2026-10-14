# Cinque Terre — revisão para 15/10/2026

Consulta em 14/10/2026. As visitas do dia usam lugares individuais; as cinco estações mantêm seus ids e coordenadas OSM, agora com categoria Transporte. Nenhuma vila mantém `subPoints`. San Lorenzo e Bottega Visconti deixam de pertencer a um pai. Mirante e Largo Taragio preservam a origem de sugestão de IA; os demais pontos já constavam do passeio.

## Identidade dos lugares

Objetos reconferidos no OSM API (`/api/0.6/<objeto>`, com `/full` para áreas), não por geocodificação de endereço:

| Lugar | Objeto | Ponto escolhido |
|---|---|---|
| Porto de Riomaggiore | [node/628608902](https://www.openstreetmap.org/node/628608902), `amenity=ferry_terminal` | 44.0977601, 9.7377579; embarcadouro |
| Mirante de Manarola | [node/3161424138](https://www.openstreetmap.org/node/3161424138), `tourism=viewpoint` | 44.1069489, 9.7267715; mirante |
| San Lorenzo | [way/204991720](https://www.openstreetmap.org/way/204991720), igreja | Pino existente do edifício preservado |
| Lardarina | [node/14159144701](https://www.openstreetmap.org/node/14159144701), `tourism=viewpoint` | 44.1201473, 9.7106212; ponto identificado na escadaria |
| Largo Taragio | [way/41867193](https://www.openstreetmap.org/way/41867193), praça de pedestres | Âncora existente preservada |
| Porto de Vernazza | [way/1382978364](https://www.openstreetmap.org/way/1382978364), `man_made=pier` | Nó 12804054234: 44.1350913, 9.6818790; extremo do píer em terra |
| Santa Margherita | [way/33191237](https://www.openstreetmap.org/way/33191237), igreja | Pino existente do edifício preservado, sem afirmar entrada |
| Bottega Visconti | [node/4734113344](https://www.openstreetmap.org/node/4734113344), `shop=deli` | Pino e endereço existentes preservados |
| Praia de Fegina | [way/30019970](https://www.openstreetmap.org/way/30019970), `natural=beach` | 44.1451364, 9.6471945; ponto da área retornado pela busca nominal OSM |
| Netuno / Il Gigante | [node/330291074](https://www.openstreetmap.org/node/330291074), estátua | 44.1441232, 9.6439291; obra, artista e data conforme tags OSM |

As fotos de novos pontos externos reutilizam as vistas Commons das respectivas vilas com as legendas originais: são ilustrações da região, sem alegar fotografias específicas de cada ponto. As fontes anteriores das estações estão em [italy-notion-sync-2026-10-02.md](italy-notion-sync-2026-10-02.md).

## Trens da data

[Tabela oficial Trenitalia](https://www.trenitalia.com/content/dam/trenitalia/allegati/info/orario-digitale/collegamenti/G1_5-terre-edizione2026summer.pdf), ligada em “Orari regionali digitali” como válida de 20/07 a 01/11/2026, cruzada com o GTFS Trenitalia consultado no [Transitous](https://api.transitous.org/api/v1/plan). Horários locais (UTC+2), programados; não são informação de atraso em tempo real. A tabela imprime partidas nas estações intermediárias; as chegadas abaixo vêm do serviço GTFS da data.

| Serviço | Embarque → desembarque | Partida → chegada |
|---|---|---|
| Regionale 22904 | La Spezia Centrale → Riomaggiore | 08:20 → 08:26 |
| Regionale 12224 | Manarola → Corniglia | 11:24 → 11:26 |
| Regionale 22922 | Corniglia → Vernazza | 13:07 → 13:10 |
| Regionale 12230 | Vernazza → Monterosso | 14:31 → 14:35 |
| Regionale 22935 | Monterosso → La Spezia Centrale | 16:43 → 17:10 |

Consultas `plan`, `numItineraries=4` ou `5`, todas para `2026-10-15`: Spezia → Riomaggiore às `06:10Z`; Manarola → Corniglia às `09:15Z`; Corniglia → Vernazza às `10:45Z`; Vernazza → Monterosso às `12:20Z`; Monterosso → Spezia às `14:30Z`. Manarola usa `fromPlace=it-trenitalia_04735`, `toPlace=it-trenitalia_04734`: o ponto Manarola do GTFS é deslocado e a consulta por coordenadas sugeria caminhar de volta a Riomaggiore. Essa caminhada não foi adotada.

Geometria: recortes do traçado ferroviário já verificado do FB 8619 em `travel-italy-rail-paths.json`, ao longo do mesmo corredor costeiro. Os vértices mais próximos às seis estações ficam a 4–18 m dos pontos OSM; não foram criadas retas entre vilas nem usados os pontos deslocados do GTFS. Preservados todos os vértices entre esses acessos. Lista de estações separada da geometria: no retorno, Vernazza, Corniglia, Manarola e Riomaggiore são paradas do Regionale 22935, conforme `intermediateStops`.

[Via dell’Amore — fonte oficial](https://www.parconazionale5terre.it/pagina.php?id=480): em 15/10, 9h–21h, reserva de faixa para visitantes, sentido Riomaggiore → Manarola, cerca de 30 min. A faixa das 9h30 continua desejada, sem reserva confirmada. As páginas oficiais divergem na redação sobre integração/suplemento; a nota pede conferir a modalidade escolhida, sem afirmar inclusão gratuita ou cobrar um suplemento não consultado.

Passe: 15/10 é faixa A (verde) no [calendário oficial 2026](https://www.trenitalia.com/content/dam/trenitalia/allegati/regionale/collegamenti-regionale/Calendario_ABC_prezzi_2026.pdf), quadro de cartão de um dia. [Venda oficial](https://card.parconazionale5terre.it/it/ticketingtreno): adulto de um dia €22. Valor contado uma vez no primeiro trem, demais regionais cobertos. Consumos no quarto e lanche da mochila usam compras da véspera; café da tarde na estátua leva `comida: €0`. Orçamento do dia preservado em €45 de comida e €22 de ingressos/transporte por pessoa.

Le camere in città: a aba pública consultada em 14/10 já resolve as linhas para `place:spe-le-camere-in-citta`, categoria `lodging`, com glifo `hotel` visível às 7h15. A captura enviada não mostra essa versão do indicador. A conferência final também deve atualizar a aba aberta após o deploy.

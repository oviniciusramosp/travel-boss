# Trens da Itália — 12 a 14/10/2026

Horários e serviços transcritos das três imagens fornecidas pelo usuário em 28/09/2026. Todos os horários são locais. Reservas e valores da imagem de Veneza estão nas notas do roteiro; o símbolo `$` foi preservado sem inferir moeda, número de passageiros ou conversão para euros. Nenhum valor foi somado ao orçamento em euros.

| Data | Serviço | De → para | Partida → chegada |
|---|---|---|---|
| 12/10 | Italo 8973 | Milano Centrale → Venezia Santa Lucia | 07:35 → 10:05 |
| 12/10 | Italo 8992 | Venezia Santa Lucia → Milano Centrale | 17:57 → 20:27 |
| 13/10 | Frecciarossa 9703 | Milano Centrale → Verona Porta Nuova | 06:45 → 07:58 |
| 13/10 | Italo 8988 | Verona Porta Nuova → Milano Centrale | 17:12 → 18:27 |
| 14/10 | Frecciabianca 8619 | Milano Centrale → La Spezia Centrale | 13:10 → 16:14 |

## Geometria e estações

Consultas ao Transitous em 28/09/2026, endpoint `https://api.transitous.org/api/v1/plan`, `numItineraries=6`:

| Chave do JSON | fromPlace | toPlace | time (UTC) | Geometria usada |
|---|---|---|---|---|
| venice | 45.48634,9.20454 | 45.4408,12.3209 | 2026-10-12T05:20:00Z | FR 9709, segunda opção |
| venice-back | 45.4408,12.3209 | 45.48634,9.20454 | 2026-10-12T15:40:00Z | FR 9752, primeira opção |
| verona | 45.48634,9.20454 | 45.429,10.982 | 2026-10-13T04:30:00Z | FR 9703, primeira opção |
| verona-back | 45.429,10.982 | 45.48634,9.20454 | 2026-10-13T14:55:00Z | FR 9744, primeira opção |
| spezia | 45.48634,9.20454 | 44.111,9.8136 | 2026-10-14T10:55:00Z | FB 8619, primeira opção |

`travel-italy-rail-paths.json` contém as polylines decodificadas usando `legGeometry.precision`, arredondadas a seis casas decimais, preservando todos os vértices. FR 9703 e FB 8619 correspondem aos serviços e horários enviados. Italo não apareceu nas consultas: **as três pernas Italo usam um traçado de referência de outro trem no mesmo corredor, não a geometria verificada desses serviços específicos**. Seus horários continuam exclusivamente os das imagens. Acessos aos pinos são tratados separadamente pelo mapa.

Novos pinos identificados pela busca nominal Nominatim, retornando objetos OSM `railway=station`, não geocodificação de endereço:

- [Venezia Santa Lucia — nó 6063641885](https://www.openstreetmap.org/node/6063641885): 45.4410753, 12.3210322.
- [Verona Porta Nuova — nó 3738591149](https://www.openstreetmap.org/node/3738591149): 45.4291820, 10.9823706.
- [La Spezia Centrale — nó 1262114259](https://www.openstreetmap.org/node/1262114259): 44.1115640, 9.8135800.

Escolha: ponto da estação no OSM, usado como referência do terminal; não representa plataforma ou entrada validada. Nome e link apontam ao mesmo objeto. Nenhum endereço postal ou subponto foi inventado. Os destinos foram pedidos pelo usuário, sem marcação de sugestão de IA.

# Regionale 22904 e caminhadas — 15/10/2026

Consulta em 15/10/2026, para a mesma data. Horários locais de Roma (UTC+2).

## Horários La Spezia Centrale → Riomaggiore

[Tabela oficial Trenitalia](https://www.trenitalia.com/content/dam/trenitalia/allegati/info/orario-digitale/collegamenti/G1_5-terre-edizione2026summer.pdf), válida de 20/07 a 01/11/2026 conforme [Orari regionali digitali](https://www.trenitalia.com/it/informazioni/orari-regionali-digitali.html), cruzada com [Transitous](https://api.transitous.org/api/v1/plan?fromPlace=it-trenitalia_06000&toPlace=it-trenitalia_04736&time=2026-10-15T05%3A00%3A00Z&numItineraries=30). Consulta por ids de estação, pois as coordenadas do GTFS de Riomaggiore e Manarola estão deslocadas. Apenas serviços diretos que atendem Riomaggiore, com saída entre 07:00 e 10:30; excluídos os trens que passam sem parar.

| Regionale | Partida | Chegada |
|---|---|---|
| 12214 | 07:04 | 07:11 |
| 22902 | 07:50 | 07:56 |
| 12218 | 08:12 | 08:20 |
| 22904 | 08:20 | 08:26 |
| 22906 | 08:50 | 08:56 |
| 22908 | 09:20 | 09:26 |
| 12302 | 09:47 | 09:53 |
| 12222 | 10:15 | 10:23 |
| 22912 | 10:20 | 10:26 |

Nove partidas; intervalos de 5 a 46 minutos, sem uma frequência única para toda a manhã. 22904, 22906 e 22908 têm intervalo de 30 minutos. As chegadas vêm do GTFS; a tabela oficial imprime partidas nas estações intermediárias. O 22904 está programado para 08:20–08:26 e a consulta não traz informação de atraso em tempo real (`realTime: false`); não é confirmação de bilhete ou garantia de pontualidade. A chegada planejada à estação às 08:10 mantém 10 minutos até o embarque.

## Card e acesso a pé

O card do serviço usa a âncora de embarque existente de La Spezia Centrale, reconferida no [OSM node 1262114259](https://www.openstreetmap.org/node/1262114259): 44.111564, 9.81358, `railway=station`, `public_transport=station`, operador RFI. É a estação, sem alegar posição de um trem ou uma entrada diferente. A descrição apresenta o serviço; os horários e a frequência ficam nas dicas do card, acessível pelo trecho do roteiro.

A timeline expandia caminhadas de acesso/saída apenas para pernas com vários hops. As pernas de um único trem já tinham esses conectores no mapa, mas mostravam apenas o trem na timeline. A expansão agora usa os mesmos extremos da geometria para gerar acesso → trem → saída a pé, com índices 0/1 compartilhados com o mapa, inclusive na seleção individual da caminhada. Sem geometria ou linha conhecida, não são inventadas estações. Paradas que já estão na estação não ganham acesso duplicado; caminhadas de cerca de um minuto continuam sem row.

Os minutos de caminhada são estimativas pela distância entre os pontos, como os conectores existentes; o mapa usa o roteador de pedestres. Não são horários oficiais, nem avaliação de filas, plataformas ou do esforço das escadas. San Lorenzo → estação de Manarola, estação de Corniglia → Lardarina, Largo Taragio → estação de Corniglia e os demais acessos do dia passam a aparecer na sequência. Os horários consultados dos trens e as saídas explícitas do roteiro são preservados.

Quando a parada já é de transporte, um desvio de cerca de um minuto até o extremo da geometria ferroviária não vira acesso adicional nem produz alerta de conexão. A mesma caminhada partindo de um café continua considerada na margem do embarque. Teste de regressão cobre o FB 8619: pino de Milano Centrale às 13:10, partida às 13:10, sem acesso fictício de um minuto; origem fora da estação continua sinalizada quando não há margem.

Hospedagem: uma única parada às 08:00 conserva a saída confirmada e incorpora o café das 07:15 em sua nota. Mantidos os estados de revisão e os orçamentos de €45 de comida e €22 de transporte/ingressos por pessoa; Via dell’Amore permanece a confirmar.

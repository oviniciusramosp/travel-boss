# Roma a pé, Baffetto e metrô de volta — 17/10/2026

Pedido do usuário: almoço na Pizzeria da Baffetto, sobremesa na Two Sizes e ordem que evite os táxis do plano anterior. Saída do apartamento às 11h e Panteão antes das 13h preservados.

## Sequência e limites

Apartamento → São Pedro → Castel Sant’Angelo/Ponte Sant’Angelo → Panteão → Baffetto → Two Sizes → Navona → Popolo → Spagna → Trevi/Forno → jantar na Gallina Bianca → metrô A → apartamento. O castelo por fora entra na passagem desde o Vaticano; Popolo fica antes de Spagna e Trevi para terminar na direção de Termini. Nenhuma atração removida; os cinco táxis saem e o jantar escolhido permanece.

Caminhada [Via Giovanni Aurispa 9 → Praça de São Pedro](https://www.google.com/maps/dir/?api=1&origin=Via+Giovanni+Aurispa+9,+Roma&destination=Piazza+San+Pietro,+Città+del+Vaticano&travelmode=walking) consultada no Maps em 17/10: 31 min, 2,3 km pela Via Aurelia; plano reserva 35 min. São Pedro 11h35–12h, castelo por fora 12h20–12h25 e Panteão 12h50, após caminhadas com margem. O tempo de São Pedro é principalmente para a praça e não comporta fila longa da basílica; visita completa ao interior não foi prometida. Entrada do Panteão conserva a janela registrada 12h–13h, sem presumir validade após as 13h. Demais caminhadas são estimativas do app.

## Baffetto

[Ficha exata no Maps](https://www.google.com/maps/place/Pizzeria+da+Baffetto/data=!4m6!3m5!1s0x132f6045227055b3:0xa8a865b132b31835!8m2!3d41.8982758!4d12.4702938!16s%2Fg%2F1vp5_4kl), Via del Governo Vecchio 114, conferida em 17/10. Sábado no horário semanal expandido: 12h–15h30 e 18h–0h. Almoço 13h45–14h40 deixa margem para a fila e fica antes do fechamento; a disponibilidade de mesa não foi confirmada. Two Sizes às 14h45, na mesma rua no número 88. Orçamento de almoço €15/pessoa dentro da faixa já existente no catálogo; não é compra ou preço de pedido confirmado. Comida diária passa de €47,50 para €42,50; ingresso do Panteão €7,75, mais €1,50 de metrô = €9,25 no indicador de ingressos. O site legado do Baffetto apareceu associado a conteúdo de apostas e não foi usado para horário, preço ou compra.

## Metrô de retorno

Transitous consultado para 17/10/2026 às 20h30 locais: endpoint `/api/v1/plan`, origem Gallina Bianca `41.8995729,12.4976136`, destino apartamento `41.9015843,12.4411534`, `time=2026-10-17T18:30:00Z`; acesso HTTP 403. Consulta de horários feita então no [Google Maps](https://www.google.com/maps/dir/?api=1&origin=La+Gallina+Bianca,+Via+Antonio+Rosmini+8,+Roma&destination=Via+Giovanni+Aurispa+9,+Roma&travelmode=transit), selecionando **Partida**, sábado **17/10**, **20h30**, e expandindo o serviço:

- Saída a pé sugerida 20h32, cerca de 6 min/350 m até Termini. O roteiro usa saída às 20h30 para margem.
- Metrô A sentido **Battistini**, **Termini 20h38 → Valle Aurelia 20h50**, 12 min dentro do trem, sem confundir com caminhadas/espera.
- Intermediárias confirmadas na expansão: Repubblica 20h39, Barberini 20h40, Spagna 20h42, Flaminio 20h43, Lepanto 20h45, Ottaviano 20h47, Cipro 20h49. Nove estações contando as pontas, oito intervalos de viagem.
- Caminhada final cerca de 6 min/280 m; chegada mostrada 20h56. Roteiro arredonda chegada ao apartamento para 21h. Horários de planejamento, sujeitos à operação.

[Tarifa oficial BIT](https://www.atac.roma.it/biglietti-e-abbonamenti/bit): €1,50 por 100 min, uma viagem de metrô. Pagamento [Tap&Go](https://www.atac.roma.it/biglietti-e-abbonamenti/tap-go) por cartão individual. A [página de avisos ATAC](https://www.atac.roma.it/stato-del-servizio) sem dados dinâmicos não foi tratada como prova de ausência de interrupções. Avisos de 17/10 sobre corridas alteram ônibus pela manhã no eixo Caracalla/Coliseu; a obra de Valle Aurelia indicada pela ATAC refere-se à rua e ao ônibus 495L, não a anúncio de fechamento da linha A.

## Mapa e geometria

OpenStreetMap, [relação 1720955 — Metro A (Battistini)](https://www.openstreetmap.org/relation/1720955), API `/api/0.6/relation/1720955/full.json`, consulta de 17/10. Relação-mãe 2207255 e direção oposta 207973 identificadas antes da escolha. Estações usam os nós de parada da direção Battistini; trilhos das oito ways da relação concatenados apenas por extremos realmente compartilhados, sem criar segmentos de conexão. Recorte de Termini (nó 4445930041) a Valle Aurelia (430193448): 116 vértices, salvos em `travel-rome-a-path.json`. Estações intermediárias ficam separadas da geometria para não marcar curvas como paradas. Geometria permanece disponível offline, sem reta inventada. Overpass indisponível nas tentativas; API principal OSM respondeu e forneceu o objeto completo.

# São Pedro no domingo e metrô até Castel Sant’Angelo — 17–18/10/2026

Em 17/10 o usuário aprovou transferir o Vaticano para domingo, para ampliar a margem do Panteão, e autorizou estudar trem ou táxi até Castel Sant’Angelo. A visita gratuita de São Pedro sai de 17/10 e entra em 18/10 antes do checkout; as malas permanecem no apartamento até as 10h. Almoço, despacho e voo de domingo mantidos. Estados de revisão preservados, sem confirmação automática.

## Domingo cedo

[Horário oficial da basílica](https://www.basilicasanpietro.va/en/opening-hours), consultado em 17/10: abertura desde 7h, fechamento às 20h. Domingo 13h30–15h30 é a janela de **visitas guiadas**, não o horário geral de abertura para visitantes individuais. [FAQ oficial](https://www.basilicasanpietro.va/en/help/the-basilica): entrada gratuita, segurança obrigatória, ombros e joelhos cobertos; celebrações podem restringir áreas. O calendário oficial de outubro foi aberto no navegador; não apareceu evento de 18/10 na lista carregada, o que não garante ausência de alterações litúrgicas. Não se prometeu Angelus ou acesso sem fila.

Café no apartamento 6h30, saída a pé 7h, São Pedro 7h35–8h50, retorno 9h25, checkout às 10h. A caminhada de 35 min por sentido mantém margem sobre os 31 min/2,3 km até a praça consultados no Maps (fonte em `rome-walk-baffetto-2026-10-17.md`). Praça e basílica gratuitas; museus, Sistina e cúpula não fazem parte da visita. Entrada no interior depende da fila e da operação no momento. Voo para Lisboa às 18h20 e toda a programação após o checkout preservados.

## Sábado: comparação e serviço consultado

[Google Maps — Via Giovanni Aurispa 9 → Castel Sant’Angelo](https://www.google.com/maps/dir/?api=1&origin=Via+Giovanni+Aurispa+9,+Roma&destination=Castel+Sant%27Angelo,+Roma&travelmode=transit), consulta em 17/10 com **Partida**, sábado **17/10**, **11h**:

- Caminhada integral: 38 min. Carro: 14–16 min na consulta, sem espera de táxi ou tarifa simulada; não se estimou o custo da corrida.
- Metrô A selecionado: 29 min totais, de 11h01 a 11h30; caminhada inicial 6 min/280 m, **Valle Aurelia 11h07 → Lepanto 11h12**, direção **Anagnina**, caminhada final 18 min/1,3 km. O campo `via:` registra somente os **5 min dentro do metrô**.
- Expansão do serviço: Cipro 11h08 e Ottaviano 11h10. Quatro estações com as pontas, duas intermediárias. Caminhadas ficam nos cards separados.
- Escolhido metrô pelo pedido anterior de reduzir o gasto com táxis. Roteiro sai às 11h, chega ao castelo às 11h35, reserva 30 min para exterior/ponte, sai às 12h05 e chega ao Panteão às 12h30 dentro da janela 12h–13h. Restante do sábado preservado.

[Tarifa oficial BIT](https://www.atac.roma.it/biglietti-e-abbonamenti/bit): €1,50 por viagem de metrô; duas viagens no sábado somam €3/pessoa, além dos €7,75 do Panteão. Indicador de ingressos/transporte €10,75, comida €42,50. Domingo mantém os valores anteriores: a visita gratuita e as caminhadas não acrescentam gastos. Consulta Transitous havia retornado 403 na pesquisa do mesmo dia (`rome-walk-baffetto-2026-10-17.md`); horários desta ida foram conferidos diretamente no Maps para a data, sem calcular a partida pela duração.

## Geometria de ida

[OpenStreetMap, relação 207973 — Metro A (Anagnina)](https://www.openstreetmap.org/relation/207973), API `/api/0.6/relation/207973/full.json`, consulta em 17/10. Recorte por nós de parada Valle Aurelia 13144169944 → Lepanto 13144169953, passando por Cipro 13144169945 e Ottaviano 13144169946. Trilhos concatenados exclusivamente em extremos compartilhados; 35 vértices salvos em `travel-rome-a-outward-path.json`. Usa a direção Anagnina, sem inverter artificialmente a geometria de Battistini. Estações separadas dos vértices e mantidas no modo offline. O par apartamento → castelo referencia `ride(romeMetroA, 'valle-aurelia', 'lepanto')`, substituindo o caminho pelos trilhos e posições das paradas da direção efetiva.

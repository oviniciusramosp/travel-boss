# Vaticano de metrô e checkout às 11h — 18/10/2026

Pesquisa em 17/10/2026; horários de Roma. O usuário informou checkout às 11h, substituindo o planejamento anterior de 10h. O horário específico fica no roteiro; removida a antiga informação de checkout às 10h do card genérico da hospedagem, mantendo o check-in desde 16h. Reserva privada preservada.

## Caminhada enviada e metrôs consultados

Correção após esclarecimento do usuário: a saída de casa deve ocorrer **depois das 8h**, e o trem escolhido é o primeiro alcançável após a caminhada e o acesso à plataforma. A interpretação anterior (saída 7h45 para o trem 8h01) foi retirada.

Consulta à rota da **ficha exata do apartamento em Via Giovanni Aurispa 9** até Valle Aurelia no [Google Maps](https://www.google.com/maps/dir/?api=1&hl=en&origin=Vatican+Modern+Apartment+5+min+Metro+Terrestre,+Via+Giovanni+Aurispa+9,+Roma&destination=Valle+Aurelia+Metro,+Roma&travelmode=walking): **5 min/350 m**, pela Via Giulio Sacchetti e Via Angelo Emo; os detalhes mostram travessia e escadas no final. Alternativa 6 min/400 m pela Via Giulio Sacchetti. Este percurso foi usado no cálculo, em vez dos 2 minutos automáticos até a coordenada do trilho subterrâneo no app. Saída **8h01**, chegada ao acesso por volta de **8h06**, **4 minutos estimados** para entrar e chegar à plataforma, pronta às **8h10**; os 2 minutos restantes são a espera até o trem consultado. O tempo interno de acesso é margem de planejamento, não medição do Google.

O catálogo das pernas aceita tempos consultados de caminhada de acesso/saída (`walkInMin`/`walkOutMin`), sem somar circulação interna ou espera aos minutos do trem. As duas caminhadas junto ao apartamento aparecem como 5 minutos na timeline de domingo; a geometria existente do metrô permanece intacta. Testes cobrem prevalência dos tempos consultados, preservação do tempo do trem e ausência de caminhada fictícia quando o lugar já é a estação.

O [link do usuário](https://maps.app.goo.gl/TxffRKJQ6VKAZGAi6) abriu no Google Maps a rota da localização junto ao apartamento até a Basílica de São Pedro: **29 min/2,1 km pela Via Aurelia**, alternativa de 32 min/2,4 km por Via Angelo Emo. A previsão antiga de 35 minutos foi retirada; o planejamento atual usa metrô A e caminhadas.

- [Valle Aurelia → Ottaviano](https://www.google.com/maps/dir/?api=1&hl=en&origin=Valle+Aurelia+Metro,+Roma&destination=Ottaviano+Metro,+Roma&travelmode=transit): selecionados Depart at, Sun Oct 18 e **8:10 AM**. Primeiro A mostrado: **08h12–08h15**, sentido Anagnina; Cipro **08h13** na expansão Details. Consulta datada confirmada no campo e no resultado consolidado, timestamp `1792311000`. Chegada à praça às 8h35 permite saída da estação e caminhada após o desembarque.
- [Ottaviano → Valle Aurelia](https://www.google.com/maps/dir/?api=1&hl=en&origin=Ottaviano+Metro,+Roma&destination=Valle+Aurelia+Metro,+Roma&travelmode=transit): mesma data, consulta de partida às 10h05. Serviço escolhido **10h10–10h13**, sentido Battistini, duas paradas contando Cipro e o desembarque. Saída da basílica às 09h45 reserva 25 minutos para caminhar até a estação, entrar e chegar à plataforma. Retorno ao apartamento previsto às **10h25**, incluindo saída da estação e caminhada real, com 35 minutos até o checkout.

O `via:` inclui somente os 3 minutos dentro de cada trem; esperas e caminhadas não foram embutidas. Horários de planejamento sujeitos à operação, sem cálculo de partida pela duração. [BIT ATAC](https://www.atac.roma.it/biglietti-e-abbonamenti/bit), consultado no mesmo dia: €1,50 por viagem de metrô, portanto €3/pessoa no domingo, registrados nos trechos e no indicador de ingressos/transporte.

Trilhos da direção efetiva preservados: ida usa os 28 primeiros vértices de `travel-rome-a-outward-path.json`, OSM relação 207973 (Anagnina), até a parada Ottaviano 13144169946; estações Valle Aurelia, Cipro e Ottaviano. Volta usa os 30 últimos vértices de `travel-rome-a-path.json` a partir do índice 86, relação 1720955 (Battistini), mesmas três estações na ordem inversa. Não se inverteu uma direção para fingir a outra. Teste verifica extremos, Cipro e caminho disponível offline.

## Circuito gratuito e fontes dos pontos

[Fonte oficial da praça](https://www.basilicasanpietro.va/it/san-pietro/la-piazza) e [FAQ oficial](https://www.basilicasanpietro.va/it/help/la-basilica): praça de Bernini, obelisco e duas fontes; basílica gratuita, sem reserva obrigatória, com segurança no hemiciclo direito de quem olha para a fachada, ombros e joelhos cobertos. Entrada geral desde 7h; visitas guiadas têm outra janela de domingo e não foram reservadas. Celebrações e filas podem limitar a visita: o interior é condicionado a conseguir sair até 9h45. O calendário dinâmico da Prefettura foi aberto, mas não carregou a lista de eventos; não se alegou ausência de celebrações nem acesso garantido.

Praça como lugar próprio, OSM [relação 10044166](https://www.openstreetmap.org/relation/10044166), versão 10, `place=square`, Wikidata Q83425; pino no centro junto ao obelisco, endereço Piazza San Pietro, 00120 Città del Vaticano. Subpontos internos em circuito norte → centro → sul → braço oeste, sem tratar a cidade do Vaticano como lugar-pai. API OSM `/api/0.6/map.json?bbox=12.4515,41.9010,12.4580,41.9035`, consulta de 17/10, forneceu objetos e nós completos:

- **Fonte de Maderno**, 8h35: [way 244928138](https://www.openstreetmap.org/way/244928138), v22; nó da borda `41.9028123,12.4572074`.
- **Obelisco Vaticano**, 8h42: [way 799694267](https://www.openstreetmap.org/way/799694267), v16; nó da base `41.9022527,12.4572422`, também usado como ponto central representativo da praça.
- **Fonte de Bernini**, 8h48: [way 244928574](https://www.openstreetmap.org/way/244928574), v20; nó da borda `41.9017366,12.4572472`.
- **Colunata de Bernini**, 8h55: [way 149958437](https://www.openstreetmap.org/way/149958437), v49; extremo do braço sul junto à basílica `41.9016731,12.4562631`, sem colocar pino no centro de um edifício fechado.
- **Pietà de Michelangelo**, 9h25 estimado: [node 10578527910](https://www.openstreetmap.org/node/10578527910), `tourism=artwork`, Wikidata Q235242, `41.9023032,12.4545797`. Subponto da basílica, distinto dos pontos da praça; visita sujeita à fila e às celebrações. A [FAQ oficial](https://www.basilicasanpietro.va/it/help/la-basilica) identifica a Pietà entre as obras do interior gratuito.

Coordenadas de nós reais do OSM, não de centro de câmera nem de geocodificação. Pontos sugeridos por IA marcados como tal; descrições e horários individuais presentes no app. Foto da praça reutiliza a imagem Commons da fachada da basílica, vista desde a praça. Sem Museu do Tesouro, Museus Vaticanos, Capela Sistina ou cúpula paga.

## Efeito no restante do domingo

Checkout 11h, mantendo as malas no quarto durante a visita. **All’Antico Vinaio removido a pedido do usuário**: seguir direto de táxi ao Terminal 3 de Fiumicino. [Rota do Maps](https://www.google.com/maps/dir/?api=1&hl=en&origin=Vatican+Modern+Apartment+5+min+Metro+Terrestre,+Via+Giovanni+Aurispa+9,+Roma&destination=Fiumicino+Airport+Terminal+3&travelmode=driving), Depart at, Sun Oct 18, **11:00 AM**: via A91, previsão consolidada **26–50 min**, chegada até 11h50; adotados **50 min** de planejamento. Não é cotação de táxi, e a antiga tarifa fixa do centro não foi aplicada ao embarque no apartamento. Almoço às 12h na área pública, antes do despacho; demais horários de balcão, segurança, voo 18h20 e Lisboa preservados.

Alimentação diária preservada em **€33,50/pessoa**, agora concentrada no aeroporto para almoço e lanche/jantar; o override por lugar/data reúne a verba anterior do sanduíche (€13,50) e das refeições de aeroporto (€20), sem duplicar o mesmo aeroporto no total. Não é preço de menu confirmado. Compra de mercado não acrescentada; sem sacolas no passeio. A marca de malas só começa no checkout às 11h e continua até o despacho, sem confundir check-in online de voo com guarda de bagagem.

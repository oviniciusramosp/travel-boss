# Itália — atualização a partir do Notion

Consulta em 02/10/2026, horário de São Paulo. Fonte da viagem: [EUR 2026](https://app.notion.com/p/carolagostini-nutri/EUR-2026-3a22da8d813480ab9b7deef1f8cf4a06), declarada pelo usuário como a versão mais atualizada para a Itália. Aplicação em `content/trips/europa.md`, no checkout principal.

Prioridade: reservas e planos específicos de 16–17/10 prevalecem sobre a sugestão genérica anterior da mesma página. Os trens já reservados continuam nos dias e horários dos comprovantes; duração aproximada da lista de sugestões não substitui bilhete. A decisão mais recente do usuário para 18/10 (checkout, refeição com malas e táxi para FCO) prevalece sobre a manhã livre do Notion.

## Compromissos e preços

- Voucher do Coliseu anexado ao Notion: 16/10/2026 às 14h30, resgate na Prisão Mamertina pelo menos uma hora antes e chegada antecipada à segurança. O PDF pede 30 minutos de antecedência no Coliseu; usado 14h para a chegada, mais conservador que 14h15 no texto. Identificação obrigatória. Notion: €83,26 pelo casal, incluindo Mamertina, Coliseu, Fórum e Palatino.
- Bilhetes do Panteão anexados ao Notion: 17/10/2026, janela 12h–13h. “Basilica di Santa Maria ad Martyres” é o mesmo monumento. [Ministério da Cultura](https://cultura.gov.it/luogo/pantheon): €7 por adulto desde 01/07/2026, vestimenta adequada e sem garantia de furar fila. Notion: €15,50 pelo casal com taxas.
- [Museus Vaticanos](https://www.museivaticani.va/content/museivaticani/en/organizza-visita.html): abrem às 8h. O horário inicial é intenção, sem comprovante de reserva na fonte. Capela Sistina faz parte da visita aos museus.
- [Stow Your Bags — Colosseo](https://www.stowyourbags.com/en/shop/rome/colosseum-roman-forum/): Via del Colosseo 2; 7h–23h. Armário Maxi por seis horas: €19,99. As quantidades anunciadas são de malas de cabine; dimensões das malas grandes e disponibilidade precisam ser conferidas na reserva.
- [São Marcos, tarifário oficial](https://www.basilicasanmarco.it/wp-content/uploads/2025/10/11-Tariffario-Biglietti.pdf): basílica €10 e campanário €15 para particulares; os €3–6 da lista estão desatualizados. Palazzo Ducale e campanário ficam por fora no passeio para caber entre os trens.
- [ACTV](https://actv.avmspa.it/it/node/1946): bilhete de navegação por 75 minutos €9,50, validar antes do embarque.
- [Cinque Terre Train Card](https://card.parconazionale5terre.it/en/cartatreno): seleção no navegador de 15/10/2026, adulto, um dia, mostrou €22 por pessoa. Dois cartões nominativos = €44. [Via dell’Amore — FAQ](https://www.viadellamore.info/en/faq): precisa de cartão combinado ou suplemento e horário reservado; não é gratuita com o Train Card comum. 9h30 é o horário desejado, sem bilhete encontrado.
- Casa de Julieta: [Museus de Verona](https://museomaffeiano.comune.verona.it/nqcontent.cfm?a_id=98352), acesso Teatro Nuovo–pátio com reserva online, entrada pela Piazzetta Navona. Não confundir com o acesso antigo da Via Cappello.
- Duomo de Milão: fechamento 15h–17h por crisma consta no Notion, sem aviso oficial específico localizado. Terraços no fim da tarde, sujeitos à disponibilidade e ao calendário; não prometer acesso durante o pôr do sol. Referência anterior: `docs/milan-itinerary.md`.

## Identidade e posição dos pinos

Objetos OSM consultados diretamente pela API Overpass em 02/10/2026. `node` usa a coordenada do objeto. `way` e `relation` usam o centro do objeto identificado, para orientação da atração ou praça, sem afirmar que é uma bilheteria ou entrada exata. Pontes usam o centro do segmento identificado. Riva degli Schiavoni usa o trecho pedestre imediatamente após a Ponte della Paglia; não o centro de toda a orla. Castel San Pietro ancora o castelo; o roteiro visita o mirante externo.

| Grupo | Objetos OSM |
|---|---|
| Roma | Stow node/12641308482; Mamertina relation/1849827; Navona way/4247138; Castel Sant’Angelo way/8035487; Spagna relation/13474926; Popolo relation/318583 |
| Veneza | Costituzione way/199257611; Rialto relation/2289364; mercado way/233887039; Antico Forno node/4441007690, número 973; San Marco way/172349507; basílica way/138800932; campanário way/252637693; Ducale way/138803915; Paglia way/431014237; Riva way/1422558317; Acqua Alta node/676820117, Calle Longa Santa Maria Formosa 5176b; Accademia way/556239027; Salute way/138801509 |
| Verona | Bra way/23964274; Arena relation/311873; Teatro Nuovo way/138957062; Erbe way/24400748; Lamberti way/138829597; Signori way/24403675; Arche way/347696754; Duomo way/1193534140; Pietra way/641027177; San Pietro way/142874973; Borsari way/138812787; ponte do Castelvecchio way/116634447 |
| Cinque Terre | Riomaggiore node/7472186134; Manarola node/305994253; Corniglia node/7472159376; Vernazza node/7472143603; Monterosso node/7472143593; Via dell’Amore way/299665149; San Lorenzo way/204991720; Bottega Visconti node/4734113344 |

As cinco vilas ficam no catálogo de La Spezia como destinos do passeio, usando suas estações como acesso identificado. Os pinos são descritos explicitamente como acessos, não como centro do porto ou mirante. Via dell’Amore usa seu trecho inicial junto à estação de Riomaggiore, sem afirmar a posição exata da cancela.

Sub-pontos verificados em 03/10/2026 nos objetos retornados pelo OSM API `/api/0.6/map` na consulta de 02/10: porto de Riomaggiore no embarcadouro node/628608902; mirante junto ao porto de Manarola node/3161424138 (`tourism=viewpoint`); San Lorenzo way/204991720; Scalinata Lardarina node/14159144701; Largo Taragio way/41867193; Santa Margherita di Antiochia way/33191237, centro da igreja para orientação no porto, sem afirmar entrada; Bottega Visconti node/4734113344; estátua de Netuno/Statua del Gigante node/330291074. O mirante específico e a praça de Corniglia são escolhas de encaminhamento da IA, marcadas `aiSuggested`.

As caminhadas começam nas estações e voltam a elas em Riomaggiore, Manarola, Corniglia e Monterosso. Vernazza termina no almoço, com caminhada à estação incluída no trecho seguinte. Notas com horário ficam sob os pontos das vilas; San Lorenzo e Bottega Visconti usam `placeId`, preservando o orçamento e sem pinos duplicados. Horários internos são estimativas, não partidas de trem publicadas.

Amido: a [ficha exata indicada no Notion](https://www.google.com/maps/place/Amido+-+Pasta+%26+Tiramis%C3%B9/data=!4m2!3m1!1s0x0:0x462b33ba80db3492) mostra Via Pellicciai 5/c e coordenadas da entidade `!3d45.4423198!4d10.9962248`. Terça: 12h–17h, faixa atual €10–20. Não usar o objeto OSM “Amido” da Corso Porta Nuova 74a: é outra unidade. A foto do prato vem da mesma ficha; os demais registros fotográficos usam imagens retornadas pelo `pageimages` da Wikipedia e Wikimedia Commons, com identificação por monumento ou vila.

As alternativas de alimentação da fonte continuam como sugestões; selecionada uma refeição compatível por passeio, sem transformar todas as opções em despesas do dia. Lugares e períodos novos permanecem pendentes de revisão do usuário.

## Transporte no mapa

Metrô B: Termini node/4445930042, Cavour node/251895414 e Colosseo node/297376921. Registro por estações no sentido de Laurentina. Regionais de Cinque Terre: mesmas seis estações OSM do catálogo, da Spezia a Monterosso, em ordem ao longo da costa. Consultas ao Transitous para 15/10 não retornaram itinerários; serviços e partidas permanecem a confirmar, sem inventar números de trem ou inferir partida pela duração. Tempos dos `via:` são estimativas com espera, não horários consultados.

Vaporetto 1, Salute → Ferrovia: Salute node/1859365812; Giglio node/762651642; Accademia node/695741733; Ca’ Rezzonico node/3586368091; Rialto way/138803124; San Marcuola node/695741790; Riva di Biasio node/643584279; Ferrovia E node/5395448187, identificado no OSM com `ref=1`. Âncoras obtidas no OSM API `/api/0.6/map`, não do centro de câmera de Maps. A linha é um esquema por paradas, omitindo paradas intermediárias; não representa a geometria completa dos trilhos nem o percurso preciso do barco. Serviço de 12/10 sem horário de partida confirmado; reservada uma hora com espera.

Chocolateria “Nino”: identidade/endereço não identificados com segurança na busca. Não criado pino nem prometida degustação gratuita.

Orçamento: `ingresso:` registra €41,63 por pessoa no Coliseu e zero na Mamertina e Fórum/Palatino já incluídos; Panteão €7,75 por pessoa, conforme totais do casal nos comprovantes. Depósito Maxi: €10 por pessoa como divisão arredondada de €19,99, contado uma vez apesar da retirada. Os demais valores continuam estimativas do catálogo. [Mercados de Veneza](https://www.veneziaunica.it/en/markets): o mercado de peixes não funciona na segunda-feira; a visita de 12/10 é à região do Rialto, sem prometer bancas de peixe abertas.

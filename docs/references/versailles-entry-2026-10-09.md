# Versalhes — entrada ao meio-dia, revisão de 08/10/2026

Linha L reconferida em 08/10 para sexta 09/10: La Défense → Versailles–Rive Droite às 8h56–9h19, 9h07–9h31, 9h18–9h43, 9h26–9h49, 9h37–10h01 e 9h48–10h13. Intervalos de 8–12 min nessa faixa, sem presumir frequência constante durante todo o dia. Informação do próximo trem acrescentada à nota do trecho na timeline; perder o das 8h56 reduz os jardins em aproximadamente 12 min, mantendo o compromisso do palácio às 12h como prioridade. Fonte: [Transitous, data e hora consultadas](https://api.transitous.org/api/v1/plan?fromPlace=48.892639%2C2.237309&toPlace=48.809529%2C2.135282&time=2026-10-09T06%3A50%3A00Z&numItineraries=10). UTC +2 h.

Bilhetes Passeport fornecidos pelo usuário: sexta 09/10/2026, 12h, entrada A do Pavillon Dufour, €35 por pessoa. Não copiar nomes, códigos de barras, identificadores de bilhete ou transação para o repositório. Chegada planejada à fila às 11h40.

Sem parada de café da manhã: comer no caminho conforme pedido. Saída às 8h. RER E Noisy-le-Sec 8h20 → La Défense 8h41; Transilien L 8h56 → Versailles–Rive Droite 9h19, com 15 min para trocar de plataforma. O planejador oferece conexões de apenas 3–8 min; foram descartadas para não depender de troca rápida numa estação profunda. Via Haussmann/Saint-Lazare é mais demorado e exige caminhada entre as estações; via M13/Montparnasse acrescenta trocas e ônibus para o mercado. RER C direto na volta é adequado ao destino seguinte, Champ de Mars, em vez de voltar a Saint-Lazare.

Marché Notre-Dame às 9h25 no caminho aos jardins, sem compras. Jardins 9h50–11h25. Mantidos os 16 pontos, reordenados com uma matriz de caminhadas OSRM e minimização do circuito com início no Parterre d’Eau e término na Salle de Bal/Parterre do Midi. Estimativa: 60,5 min andando dentro dos jardins, deixando cerca de 34 min para paradas; não é uma visita demorada a cada bosque. Pirâmide → Dragão → Netuno → Três Fontes → Teatro de Água → Banhos de Apolo → Latona → Tapis Vert → Encélado → Grand Canal → Apolo → Colunata → Espelho → Salle de Bal → Midi. A numeração antiga muda; os antigos pontos 3 e 2 ficam na volta, conforme pedido. Em vez de regressar diretamente do canal ao palácio, o retorno inclui os bosques do sul. Entrada A às 11h40, reservando 15 min da Orangerie pela Cour des Princes. Palácio 12h–14h15; janela de 2h15 inclui controle e visita focada.

Pino RER E La Défense: OSM stop_position 11822383636 (plataforma subterrânea 12, nível −7), 48.8925665, 2.2393248. Não confundir com o RER A ou com o Transilien L na superfície. Fonte: API OSM bbox 2.235,48.892,2.240,48.896 consultada em 08/10. Esta estação e Neuilly–Porte Maillot completam a sequência desenhada no mapa.
Trianon fora da sequência principal: o domínio inclui Grand Trianon, Petit Trianon, jardins e Hameau de la Reine, e ampliaria os deslocamentos da tarde. Sem retorno aos jardins após o palácio, evitando depender de reentrada no mesmo portão. A alternativa de outlet também não consta no dia atual.

Almoço e café juntos no The Stray Bean às 14h30: Lunch Combo €18, com café (ou suco), quiche e salada (ou scone salgado e salada) e um doce. Carta oficial de maio/2026 consultada em 08/10. Aberto sexta 8h–17h, sem reservas; comida depende do estoque da casa. Saída até 16h, com folga para RER C Rive Gauche 16h25 → Champ de Mars 16h54 e Torre às 17h10. Ingresso da Torre para 17h30 continua previsto, sem confirmação nova.

## Fontes

- [FAQ oficial](https://www.chateauversailles.fr/preparer-ma-visite/faq): entrada A para visitantes individuais e Passeport incluindo jardins/Trianon.
- [OSM node 4265123028](https://www.openstreetmap.org/node/4265123028), `Entrée A`, referência A e descrição de entrada individual; 48.8040070, 2.1218939. Cruzado com mapa e instrução dos bilhetes. Pino do palácio agora nesta porta, em vez do centro do edifício. Porta dos jardins: [OSM node 9806041237](https://www.openstreetmap.org/node/9806041237), 48.8040270, 2.1212080. API OSM consultada em 08/10; auditoria atualizada.
- [Jardins Musicais 2026](https://www.chateauversailles-spectacles.fr/evenement/les-jardins-musicaux-2026/): bosques a partir de 9h.
- [Marché Notre-Dame](https://www.versailles-tourisme.com/marche-notre-dame.html): sexta, feira 7h30–14h; halles 7h–13h30 / 15h–19h30.
- [Domaine de Trianon](https://www.chateauversailles.fr/decouvrir/domaine/domaine-trianon).
- [Stray Bean](https://thestraybean.com/), [menu](https://thestraybean.com/menu/) e [carta de comida](https://thestraybean.com/wp-content/uploads/2026/05/french-food.jpg).
- Transitous `/api/v1/plan`: 09/10, Noisy-le-Sec → La Défense às 06:05 UTC; La Défense → Rive Droite às 06:50 UTC; Rive Gauche → Champ de Mars às 14:10 UTC. Horários locais somam duas horas. Escolhida linha L desde Saint-Lazare, com margem de conexão.
- [OSRM canal → Cour des Princes → porta A](https://routing.openstreetmap.de/routed-foot/route/v1/foot/2.108834,48.808737;2.121208,48.804027;2.1218939,48.804007?overview=false). Caminhada estimada; portões temporariamente fechados não são validados pelo roteador.

Almoço/café €18 por pessoa, comida no caminho sem compra adicional definida; jantar mantido. Passeport €35 contado uma vez no palácio; jardins incluídos. Nenhum dado privado do PDF é publicado.

Matriz OSRM e otimização: `routed-foot/table/v1/foot/` com os 16 pontos já verificados; durações usadas apenas para comparar caminhadas, nunca para calcular partidas de trem. Portões e controles podem aumentar os tempos.

Revisão da noite: saída do jantar às 21h20 para alcançar M9 em Franklin D. Roosevelt às 21h31. A nota anterior dizia 21h30, deixando apenas um minuto para chegar à estação; esta margem foi corrigida. Mantidos M9 21h31–21h37 e RER E 21h48–22h01, com 11 min de conexão, antes do encerramento noturno. Comida no card: €55,50/pessoa (€18 almoço/café e €37,50 jantar), acima da meta de €50.

Todos os 16 subpontos agora têm horário estimado entre 9h50 e 11h21, incluindo os antigos 3 e 2 no retorno. Correção de mapa: os trechos já existiam, mas a classificação por cidades ocultava RER/Transilien ao chegar ao zoom 11. Linhas regionais de Paris permanecem visíveis também nesse zoom. Teste cobre L, C, E e preserva a ocultação de trens de longa distância/voos. M9 e RER E da noite reconferidos para 09/10 no Transitous (consultas UTC 19h20 e 19h40).

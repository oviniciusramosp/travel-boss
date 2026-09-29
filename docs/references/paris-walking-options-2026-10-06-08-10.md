# Caminhadas de 6, 8 e 10/10 — estudo de alternativas

Consulta: 2026-09-28. Propostas, ainda não aplicadas ao roteiro.

## Base

Roteiro: `content/trips/europa.md`; dias de Paris 3, 5 e 7 (datas 6, 8 e 10/10).
Reconstituição das paradas, sub-pontos na ordem das notas e pernas de transporte do catálogo.
Distâncias pelo mesmo OSRM de pedestres do app, incluindo acesso aos trens e conexões externas.
Valores arredondados; corredores internos de estações e circulação livre nas atrações podem acrescentar caminhada.

| Data | Soma calculada | Caminhadas que mais interessam à comparação |
|---|---:|---|
| 6/10 | 14,75 km | Épicerie → CityPharma 856 m; Port du Louvre → Saint-Michel 1.171 m; conexão Gare du Nord → Magenta 323 m |
| 8/10 | 14,71 km | Magenta → início do canal 1.136 m; Pompidou → Sentier 1.196 m; percurso interno de Montmartre 1.891 m; Sacré-Cœur → Moulin Rouge 1.205 m |
| 10/10 | 9,97 km | Haussmann → Baguett’s 1.488 m; Palais-Royal → Starbucks 1.022 m |

O app arredonda os totais de aproximadamente 10 km para cima/baixo em quilômetros inteiros.
O dia 10 já está na meta nominal, mas praticamente sem margem para circulação dentro das visitas.

## Opções preservando as paradas

- **6/10, Épicerie → CityPharma:** M10 Vaneau → Mabillon, sentido Gare d’Austerlitz. Transitous às 17h30 locais: 11–12 min, 355 m de caminhada informada, contra 856 m a pé. Economia aproximada de 500 m, antes de contabilizar corredores. O ônibus 70 Vaneau → Saint-Germain-des-Prés também apareceu: 10 min, 111 m a pé; alternativa se o usuário aceitar ônibus.
- **6/10, volta do Port du Louvre:** caminhar até Pont Neuf, M7 até Chaussée d’Antin–La Fayette e conexão com RER E em Haussmann. Transitous às 20h10: 20–21 min até a região da estação Haussmann, 984 m a pé informados. A rota atual até embarcar no RER E soma cerca de 1.494 m (Saint-Michel + conexão Magenta). Economia aproximada de 500 m; ainda há acesso à plataforma do RER. Não elimina a caminhada Noisy-le-Sec → casa. Prever aproximadamente 50–60 min porta a porta, sujeito à conexão, contra 55 min atuais.
- **8/10, Sacré-Cœur → Moulin Rouge:** descer de funicular, caminhar até Anvers, M2 sentido Porte Dauphine até Blanche. Preserva pôr do sol e foto do Moulin Rouge. O plano sem funicular retorna 11 min e 630 m a pé; o funicular poupa parte da descida, mas acrescenta espera. Estimativa de planejamento com funicular: 15–20 min e economia de 600–800 m frente aos 1.205 m atuais. Não é uma rota porta a porta integralmente validada pelo planejador.
- **10/10, chegada ao Baguett’s:** do RER E, conexão com M14 em Saint-Lazare até Pyramides, sentido Aéroport d’Orly. Transitous às 8h40: 14–15 min desde o ponto de Haussmann consultado, 613 m a pé informados. Contra 1.488 m a pé, poupa cerca de 800 m, descontada margem para conexão interna.
- **10/10, Palais-Royal → Starbucks Opéra:** M7 Palais Royal–Musée du Louvre → Opéra, sentido La Courneuve. Transitous às 14h10: 9 min, 412 m a pé, contra 1.022 m atuais. Prever 10–15 min com espera; poupa aproximadamente 500–600 m sem cortar uma parada intermediária.

Essas estimativas indicam aproximadamente 14 km para 6/10, 14 km para 8/10 e 8,5–9 km para 10/10.
Não sustentam uma promessa de máximo de 10 km nos dias 6 e 8 sem outra mudança de escopo.

## Trechos em que não compensa acrescentar metrô

- 8/10, Magenta → começo do canal: alternativas retornadas com M5/M7 ainda exigem 0,9–1,1 km de caminhada e 18–19 min; há pouco ganho diante dos 1,14 km atuais.
- 8/10, Pompidou → Sentier: M11 Rambuteau → Arts et Métiers ainda deixa 1.063 m a pé e demora 16 min, praticamente o mesmo tempo da caminhada prevista. Ônibus 38 deixa 775 m, também em 16 min.
- 8/10, Sentier → Montmartre já tem M4 e funicular. O planejador oferece M4 até Château Rouge, mas com 1.133 m a pé e subida; não melhora o conforto do plano atual.
- Os trechos curtos entre os pontos do Quartier Latin e do Marais, e os passeios dentro do Luxemburgo, do canal e de Montmartre, não podem ser suprimidos como simples deslocamentos sem afetar o passeio desejado.

## Fontes

- Distâncias: https://routing.openstreetmap.de/routed-foot/route/v1/foot/ (coordenadas do catálogo, geometria de pedestres).
- Planejador: https://api.transitous.org/api/v1/plan ; parâmetros `fromPlace`, `toPlace`, `time` em UTC (outubro: hora local menos 2 h). Horários e distâncias de acesso são estimativas; não garantem assento.
- M10: https://www.ratp.fr/infos-trafic/metro/10 — fechamento anunciado em 27–28/10, depois da visita.
- M2: https://www.ratp.fr/infos-trafic/metro/2 — obras anunciadas entre Père-Lachaise e Barbès em 19–25/10, depois da visita.
- M7: https://www.ratp.fr/infos-trafic/metro/7 — consulta sem interrupção futura listada.
- M14: https://www.ratp.fr/infos-trafic/metro/14 — consulta sem interrupção futura listada.

As páginas consultadas não confirmam a antiga nota de greve que consta no roteiro. Ausência de alerta hoje não garante operação normal no dia da viagem.

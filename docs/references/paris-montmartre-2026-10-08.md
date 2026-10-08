# Pompidou e Montmartre — 8/10/2026

## Pontos próprios — 08/10/2026

Esta revisão substitui a estrutura descrita abaixo. Montmartre deixa de ser um lugar-pai e pino de bairro: Place du Tertre, Maison Rose/Rue de l’Abreuvoir, Clos Montmartre, Lapin Agile, Passe-Muraille, Moulin Radet e Saint-Pierre passam a lugares próprios, com descrição e categoria. O favorito do antigo ponto ancorado na Place du Tertre foi preservado na praça. A estação superior permanece apenas na linha do funicular, como estação de desembarque do trecho desde o Palais-Royal. A chegada estimada ao alto continua por volta de 16h10; o trecho reserva 65 min até a praça às 16h20, incluindo a caminhada final. Sem horário publicado de partida do funicular, o app mantém essa partida a conferir.

Identidades reconferidas em 08/10 na API OSM para os sete objetos da tabela abaixo (nodes: `/api/0.6/node/<id>.json`; ways: `/api/0.6/way/<id>/full.json`). Preservadas as coordenadas documentadas; praça e edifícios usam centro do objeto, escultura usa seu nó e vinhedo usa o painel de informação público junto à rua. O moinho é o Radet sobre o edifício, não o restaurante homônimo. Fontes de contexto: [turismo oficial](https://parisjetaime.com/article/montmartre-village-a-paris-a728) e [RATP](https://www.ratp.fr/decouvrir/patrimoine/histoire-funiculaire-montmartre), consultados na mesma data. Auditorias individuais em `paris-location-audit-2026-09-28/montmartre-2026-10-08.jsonl`. Fotos obtidas do Commons por `imageinfo`, com thumbnail, autoria e licença retornadas pela API; nomes de arquivos via imagens P18 do Wikidata e tags OSM.

## Comida destacada no roteiro — 08/10/2026

A pedido do usuário, a Charcuterie Arnaud Nicolas (Caulaincourt) passa a parada própria às 17h05, com o gasto planejado de €11 por pessoa visível na linha. Removido o sub-ponto de comida de Montmartre; o lugar existente e sua localização não mudam. Os três pontos posteriores (Passe-Muraille, Moulin de la Galette e Saint-Pierre) permanecem como notas visíveis após o café e guiam a perna a pé até a Sacré-Cœur, usando os mesmos pontos OSM abaixo. Saem da sequência interna anterior para evitar que o mapa os percorra antes do café e depois volte à charcutaria. O orçamento de comida de 8/10 permanece €55,50; Montmartre passa a €0 e a charcutaria mostra €11.

Consultado em 27/09/2026. O usuário confirmou o funicular, não o trenzinho turístico.

- [Centre Pompidou, reforma 2025–2030](https://www.centrepompidou.fr/en/centre-pompidou-is-transforming-itself): prédio fechado; parada apenas por fora, sujeita à visibilidade do canteiro de obras, sem ingresso nem acesso à cobertura.
- Transitous: `api.transitous.org/api/v1/plan`, 8/10 às 12:15 UTC, origem Étienne Marcel (48.863953, 2.349393), destino Moulin Rouge (48.8841, 2.3322): M4 até Barbès–Rochechouart, M2 até Blanche, ~21 min incluindo acessos calculados pela API. Reservados 35 min desde o Pompidou, com caminhada até Étienne Marcel e margem. A consulta direta desde o Pompidou também oferece M11 + M2 por Belleville; a escolha do roteiro usa as linhas já cadastradas e evita essa volta a leste.
- [RATP, funicular](https://www.ratp.fr/decouvrir/patrimoine/histoire-funiculaire-montmartre): liga a Place Saint-Pierre à esplanada da basílica, evita a escadaria principal; funcionamento diário 6h–0h45. A estação inferior fica junto à Rue Foyatier; a Rue du Cardinal-Dubois é a chegada no alto. A reserva de 25 min desde o Moulin Rouge inclui caminhada e espera; não é a duração da subida.
- [Guia tarifário IDFM](https://www.iledefrance-mobilites.fr/medias/portail-idfm/aCMJMydWJ-7kR_xj_IDFM_A5_guide-tarifaire_AM_130525.pdf) e [Navigo Semaine](https://www.iledefrance-mobilites.fr/titres-et-tarifs/detail/forfait-navigo-semaine): funicular no transporte público; usar o passe semanal, sem somar outro bilhete ao dia.
- [Passeio de Montmartre, turismo oficial](https://parisjetaime.com/article/paris-montmartre-et-pigalle-a922) e [bairro de Montmartre](https://parisjetaime.com/article/montmartre-village-a-paris-a728): Place du Tertre, Rue de l’Abreuvoir, Maison Rose, vinhedo, cabarés e moinhos. O circuito mantém a Charcuterie Arnaud Nicolas já escolhida, agora como sub-ponto com `placeId`, e termina na igreja Saint-Pierre antes da Sacré-Cœur. Há ladeiras no bairro mesmo usando o funicular.
- [Fête des Vendanges](https://fetedesvendangesdemontmartre.com/le-programme/): 7–11/10/2026. A visita guiada das vinhas de 8/10 é às 14h, incompatível com este roteiro; o plano vê o vinhedo por fora, sem prometer entrada.

## Ajuste de transporte — 28/09/2026

Por pedido do usuário, o Moulin Rouge passa para depois do pôr do sol. Esta sequência substitui os trajetos anteriores descritos acima.

- Ida: M4 Étienne Marcel → Barbès–Rochechouart, caminhada até o funicular inferior e subida; reservados 50 min desde o Pompidou, incluindo acessos e espera.
- OSRM a pé: Barbès → funicular inferior, cerca de 631 m / 8 min (roteiro reserva cerca de 10 min); Sacré-Cœur → Moulin Rouge, cerca de 1,2 km / 16 min (roteiro reserva 20 min).
- Transitous consultado para 8/10 às 17:55 UTC: Moulin Rouge → Noisy-le-Sec, M2 Blanche → La Chapelle, caminhada a Magenta e RER E → Noisy-le-Sec, cerca de 42–43 min incluindo acessos calculados pela API. Roteiro reserva 45 min e chegada às 20:40.

## Coordenadas OSM

Consulta Overpass por POST a `https://overpass-api.de/api/interpreter`, `out center` para os locais e `out geom` para o funicular; Nominatim para conferir nomes. Não usar o restaurante homônimo como pino da escultura Passe-Muraille.

| Ponto | Objeto OSM | Latitude, longitude |
| --- | --- | --- |
| Funicular inferior | node 3417692497 | 48.8846923, 2.3426644 |
| Funicular superior | node 3417692499 | 48.8856581, 2.3425549 |
| Place du Tertre | way 23369825 | 48.8865274, 2.3408043 |
| Maison Rose | node 1904540725 | 48.8879853, 2.3396455 |
| Clos Montmartre, ponto de informação junto à rua | node 5290571510 | 48.8881857, 2.3398340 |
| Lapin Agile | way 316800538 | 48.8886110, 2.3399947 |
| Passe-Muraille, escultura | node 4379056701 | 48.8875399, 2.3380698 |
| Moulin Radet, visível sobre o restaurante Moulin de la Galette | way 307906882 | 48.8874, 2.3371053 |
| Saint-Pierre de Montmartre | way 23884336 | 48.8867202, 2.3420378 |

As coordenadas da Charcuterie Arnaud Nicolas foram preservadas do catálogo. Os sub-pontos novos de passeio levam `aiSuggested`; não foram confirmados nem favoritados pelo assistente.

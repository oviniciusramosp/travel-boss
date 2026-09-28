# Auditoria de localização — 28/09/2026

## Conclusão e limites

Não há evidência suficiente para certificar todos os pinos. Varredura inicial: 393 lugares, 39 com coordenadas coerentes com o destino de seu link, 10 divergentes em mais de 25 m e 344 sem coordenadas de destino explícitas no link. Coerência não prova identidade, unidade, acesso ou operação atual.

Após as correções e inclusões simultâneas de outro trabalho: 399 lugares, 44 coerentes, 10 a revisar e 345 sem fonte de coordenadas explícita. No roteiro Europa: 12 coerentes, 5 a revisar e 94 sem essa fonte. Estes números são uma fotografia; o comando abaixo recalcula o estado atual.

“Sem fonte” aqui significa que o link cadastrado não contém `!3d!4d` inequívocos, não que o lugar esteja errado ou nunca tenha sido pesquisado. Links curtos, pesquisas, referências OSM e pontos internos exigem outra verificação. Não extrair coordenadas de `@lat,lng`: são da câmera.

## Verificações manuais realizadas

Nome, unidade, endereço e coordenadas foram lidos nas fichas do Google Maps. Os links canônicos estão nos respectivos `mapsUrl` do catálogo.

| Lugar | Resultado |
| --- | --- |
| Baguett’s Molière | Corrigido na etapa anterior; nº 30, não a unidade nº 33. |
| Starbucks Capucines | Pino corrigido para 48.8709, 2.33378; mesmo nº 3 Bd des Capucines. |
| Chez Janou | Pino corrigido para 48.8567159, 2.3671983; nº 2 Rue Roger Verlomme. |
| Bien Élevé | Pino corrigido para 48.8740003, 2.3433307; nº 47 Rue Richer; deslocamento anterior de cerca de 1,9 km. |
| Chez Elo | Pino corrigido para 48.8639957, 2.3602498; nº 61 Rue de Bretagne. |
| Maison d’Isabelle | Pino já correto; endereço corrigido de 47 para 47 ter Bd Saint-Germain. |
| Paris Bakery & Co | Pendente: link curto abre Paris & Co em 48.8385671, 2.3227985, enquanto cadastro usa Convention e outro pino. Não mover para uma unidade arbitrária. |

## Triagem por endereço

249 endereços públicos do catálogo Paris consultados pela API oficial IGN/BAN `https://data.geopf.fr/geocodage/search?q=...&limit=1`. Hospedagem privada excluída. 246 respostas com resultado, duas sem resultado e um timeout. Isso é triagem geográfica, não validação de comércio.

Outros conflitos que merecem conferência: Amorino (pino x endereço da Île Saint-Louis), Five Guys Rivoli (pino x nº 105) e Paris Bakery & Co. Não corrigir pelo endereço isolado: pode ser esse campo que está errado. A Maison d’Isabelle demonstrou esse risco (número incompleto).

Os dez destinos com divergência >25 m na triagem inicial: `par-jardin-plantes`, `par-buttes-chaumont`, `par-palais`, `par-palais-royal`, `par-paul-defense`, `par-chessy-rer`, `par-cdg-rer`, `par-val-de-fontenay-rer`, `par-chapelle-saint-louis`, `par-bnf`. Muitos são áreas ou estações e a diferença pode corresponder ao ponto de entrada ou centro; precisam de revisão, não de sincronização automática. A conferência posterior confirmou que o link de `par-bnf` é da biblioteca François-Mitterrand, não da estação: a diferença de 29 m ocorre dentro do complexo.

## Auditoria paralela do catálogo Paris

Inventário inicial desta etapa: 259 lugares de Paris, dos quais 100 referenciados nos arquivos de roteiro e 159 restantes, além de 81 subpontos. Três revisores conferem primeiro os 100 prioritários; a revisão principal trata 40 registros restantes com links e conflitos conhecidos. Resultados individuais, fontes e ressalvas ficam em [paris-location-audit-2026-09-28](paris-location-audit-2026-09-28/). A auditoria está em andamento; os registros concluídos não certificam os ainda ausentes.

Primeiro lote de correções desta etapa:

| Registro | Correção | Evidência |
| --- | --- | --- |
| Paris & Co Convention | Pino ~816 m fora; link abria Gaîté. Mantida a unidade Convention já pretendida; corrigidos pino/link e nome explícito. | Google Maps + [site da padaria](https://boulangerieparisandco.fr/2-accueil) |
| Le Franklin Passy | Pino ~192 m fora, corrigido no nº 1 rue Benjamin Franklin. | Ficha Maps da unidade |
| Francette | Pino ~338 m fora, corrigido para a embarcação no Port de Suffren. | Maps + [restaurante](https://fugafamily.com/restaurants/francette) |
| La Felicità | Pino ~83 m deslocado do estabelecimento; corrigido e link canônico registrado. | Maps + [restaurante](https://www.lafelicita.fr/) |
| PAUL La Défense | Pino ~78 m distante da unidade já selecionada pelo link; alinhado a ela. | Ficha Maps cadastrada |
| Amorino | Nome/endereço/consulta agora Beaubourg, unidade correspondente ao pino e link existentes. Não é a Île Saint-Louis. | Maps + [localizador oficial](https://www.amorino.com/en/storelocator) |
| Five Guys | Nome/endereço/consulta agora Châtelet Les Halles, 1 place Joachim du Bellay, conforme pino/link existentes. | Maps + [ficha oficial](https://restaurants.fiveguys.fr/ile-de-france/1-place-joachim-du-belay) |
| Michalak Étienne Marcel | Código postal 75001, sem mudança de pino. | [Site oficial](https://www.christophemichalak.com/) |

`verified` nos arquivos de evidência significa localização/identidade conferidas com as ressalvas registradas; não comprova horário futuro, disponibilidade, ingresso ou cada porta de acesso. `correction` registra divergência encontrada, com a aplicação descrita no relatório. `ambiguous`/`blocked` permanecem pendências. O resultado do geocodificador reverso sozinho não foi aceito como prova de unidade: no Moulin Rouge, por exemplo, ele retornou o endereço de um vizinho, embora o pino da atração estivesse correto.

## Como repetir e concluir

`npm run travel:locations:check -- /tmp/travel-location-audit.json`

O comando lê o catálogo efetivo, lista divergências e grava inventário completo se receber caminho de saída. Retorna código 1 enquanto houver falta de fonte, coordenada inválida ou divergência. Não representa uma certificação mesmo se todas as coordenadas coincidirem: a identidade e a unidade precisam de confirmação humana na fonte.

Para concluir a validação: abrir a ficha de cada pendência, confirmar nome + unidade + endereço, escolher entrada pública quando relevante, registrar fonte e data, atualizar pino/link juntos e repetir a checagem. Grandes áreas, estações e subpontos precisam de justificativa de entrada/centro; não devem ser movidos cegamente para o centro do Google.

O teste de regressão cobre os seis estabelecimentos conferidos nesta conversa e falha se seus pinos se afastarem do destino cadastrado. Os demais continuam explicitamente pendentes: nenhum teste deve transformar ausência de evidência em confirmação.

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

Os dez destinos com divergência >25 m: `par-jardin-plantes`, `par-buttes-chaumont`, `par-palais`, `par-palais-royal`, `par-paul-defense`, `par-chessy-rer`, `par-cdg-rer`, `par-val-de-fontenay-rer`, `par-chapelle-saint-louis`, `par-bnf`. Muitos são áreas ou estações e a diferença pode corresponder ao ponto de entrada ou centro; precisam de revisão, não de sincronização automática. O link de `par-bnf` também deve ser conferido quanto a biblioteca versus estação homônima.

## Como repetir e concluir

`npm run travel:locations:check -- /tmp/travel-location-audit.json`

O comando lê o catálogo efetivo, lista divergências e grava inventário completo se receber caminho de saída. Retorna código 1 enquanto houver falta de fonte, coordenada inválida ou divergência. Não representa uma certificação mesmo se todas as coordenadas coincidirem: a identidade e a unidade precisam de confirmação humana na fonte.

Para concluir a validação: abrir a ficha de cada pendência, confirmar nome + unidade + endereço, escolher entrada pública quando relevante, registrar fonte e data, atualizar pino/link juntos e repetir a checagem. Grandes áreas, estações e subpontos precisam de justificativa de entrada/centro; não devem ser movidos cegamente para o centro do Google.

O teste de regressão cobre os seis estabelecimentos conferidos nesta conversa e falha se seus pinos se afastarem do destino cadastrado. Os demais continuam explicitamente pendentes: nenhum teste deve transformar ausência de evidência em confirmação.

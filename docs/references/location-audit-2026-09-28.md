# Auditoria de localização de Paris — 28/09/2026

## Resultado

Auditoria do catálogo completo de Paris, iniciada pelos lugares referenciados nos roteiros: **259 lugares e 81 subpontos**, sem IDs ausentes ou repetidos. Três revisores trabalharam em paralelo; a revisão principal reconciliou divergências e aplicou as correções no checkout usado pelo app.

| Escopo | Verificados sem correção | Correções aplicadas | Pendências | Total |
| --- | ---: | ---: | ---: | ---: |
| Lugares referenciados nos roteiros | 94 | 4 | 2 | 100 |
| Demais lugares de Paris | 145 | 14 | 0 | 159 |
| Total de lugares | 239 | 18 | 2 | 259 |
| Subpontos internos | 80 | 1 | 0 | 81 |

A correção do subponto do canal já integra um dos 18 lugares; não é um 19º cadastro. As duas pendências são a residência particular e o acesso público da Brioche Dorée do CDG. **Não há certificação irrestrita de todos os pontos.**

## Causa e método

O problema do Baguett’s expôs uma falha de validação do cadastro: nome/unidade, endereço, pino e destino do link não haviam sido conferidos juntos. O mapa desenhava as coordenadas cadastradas; não era evidência de um deslocamento geral causado pela renderização. Outros registros também misturavam unidade/endereço/link ou usavam coordenadas aproximadas.

Cada registro foi confrontado com ficha específica do Maps, fonte oficial e/ou objeto cartográfico OSM identificável. Para polígonos e pontos internos, foi examinada a geometria do próprio lugar. Não se aceitou um comércio vizinho retornado pelo geocodificador reverso como prova da identidade. Endereço geocodificado serve para triagem, não para provar que uma loja ocupa aquele endereço.

Coordenadas `@lat,lng` de URLs Google são da câmera e não foram usadas como destino. Coordenadas explícitas `!3d!4d` só foram aceitas depois da conferência da identidade da ficha. Um centro Google diferente não significa necessariamente erro: prédio, parque, aeroporto, praça e estação podem ter várias âncoras válidas.

## Correções aplicadas nesta rodada

| Cadastro | Alteração |
| --- | --- |
| Paris & Co — Convention | Pino corrigido em aproximadamente 816 m; link antigo abria Gaîté. Nome e link agora explicitam Convention. |
| Francette | Pino corrigido em aproximadamente 338 m para a embarcação no Port de Suffren. |
| Rosa Bonheur Buttes-Chaumont | Pino corrigido em aproximadamente 275 m para o restaurante, e não outro ponto do parque. |
| Burger King Opéra Italiens | Endereço antigo sem unidade comprovada; cadastro agora corresponde à unidade nominal oficial, 36 boulevard des Italiens. Pino ajustado em aproximadamente 272 m. |
| Le Franklin Passy | Pino corrigido em aproximadamente 192 m, no nº 1 rue Benjamin Franklin. |
| La Felicità | Pino ajustado em aproximadamente 83 m para a ficha do estabelecimento. |
| PAUL La Défense | Pino alinhado à unidade já indicada pelo link, aproximadamente 78 m. |
| Jardin des Plantes | Entrada Porte Jussieu, 57 rue Cuvier, identificada no OSM; ajuste de aproximadamente 30 m. Removida confusão com Fontaine Cuvier. |
| KFC Les Halles | Ajuste de aproximadamente 27 m para a ficha da unidade dentro do shopping; endereço e link específico registrados. |
| Amorino | Nome/endereço agora Beaubourg, 119–121 rue Saint-Martin, conforme pino e link existentes; não Île Saint-Louis. |
| Five Guys | Nome/endereço agora Châtelet Les Halles, 1 place Joachim du Bellay, conforme pino e link existentes. |
| Michalak Étienne Marcel | Código postal corrigido para 75001. |
| Noisy-le-Sec RER | Endereço oficial corrigido para Rue de la Gare. Pino preservado. |
| Carnavalet | Endereço completo: 23 rue Madame de Sévigné. Pino dentro do complexo preservado. |
| Montorgueil | Código postal 75002 no trecho onde fica o pino. |
| Le Royal Cambronne | Endereço corrigido para 2 place Cambronne. |
| Petit e Grand Palais | Preservado o card conjunto; o pino no Grand Palais agora abre a ficha desse edifício. Endereço e dicas distinguem os dois acessos. |
| Canal Saint-Martin — até République | Percurso existente começa no Quai de Jemmapes; primeiro subponto, descrição, endereço e nota do roteiro corrigidos. Atravessa para Valmy na Rue du Faubourg du Temple. |

Correções anteriores que motivaram esta auditoria também foram reconferidas: Baguett’s Molière (30 rue de Richelieu), Starbucks Capucines, Chez Janou, Bien Élevé e Chez Elo; endereço da Maison d’Isabelle completado para 47 ter boulevard Saint-Germain. Elas não entram novamente nas 18 correções desta rodada.

## Pendências e limites para usar o roteiro

- **Brioche Dorée CDG 2E:** a ficha “Arrivées” corresponde ao pino, mas o plano oficial consultado identifica uma unidade em Portes L. Não foi comprovado acesso à unidade cadastrada a partir do desembarque público. O card e a parada do roteiro deixaram de prometer esse acesso; confirmar no aeroporto antes de contar com a parada.
- **Casa do Gui:** residência particular; endereço e coordenadas não foram enviados a novos serviços externos. A conferência independente depende de confirmação do anfitrião/usuário ou evidência local confiável. Não foi marcado como verificado.

“Verificado” significa **identidade e localização**, com as ressalvas de cada registro. Não garante funcionamento na data futura, acesso interno, fila, ingresso ou que uma âncora do prédio seja sua porta. Orly mantém referência do aeródromo; uma rota terrestre deve escolher o terminal. A capela Saint-Louis mantém localização comprovada dentro da École Militaire, com acesso sujeito a autorização. O ponto do show Disney está em Main Street, sem garantia de vista, assento ou espaço reservado. No Grand Canal de Versailles, o ponto fica no passeio da margem, não dentro da água.

Geometrias impediram falsas correções: BHV (way 29168869), Carnavalet (relation 2405955), One Nation (relation 3414182), Orly (relation 10867719), CDG RER (way 1020882998), Disneyland/Disney Adventure World (portões nodes 3100784971/11238857526), Ratatouille (way 1269073076), Pirates (way 1243661105) e Grand Bassin Rond das Tuileries (way 14037695). A instalação olímpica próxima do bassin não invalida o lago.

## Evidência por lugar e prevenção

Os [registros JSONL da auditoria](paris-location-audit-2026-09-28/) guardam ID, data, fontes, evidência, status, proposta original quando pertinente, resolução aplicada, ressalvas e estado final do cadastro (`catalogSnapshot`). Os três arquivos `itinerary-*` cobrem 100 lugares; os demais cobrem 159. Os 81 subpontos ficam dentro dos respectivos registros. Proposta de revisor não equivale a alteração aplicada: `resolution` e `catalogSnapshot` registram a decisão final.

- `verified`: localização conferida, com ressalvas descritas.
- `correction`: divergência encontrada e corrigida nesta rodada.
- `ambiguous`: evidência insuficiente ou conflitante; não certificado.
- `blocked`: conferência externa não realizada, neste caso residência particular.

O teste `src/data/location-audit.test.ts` exige cobertura de todos os lugares de Paris e de seus subpontos. Mudanças no nome, endereço, pino, link/consulta Maps ou subpontos invalidam o registro até nova revisão das fontes. **Não atualizar snapshots automaticamente para fazer o teste passar.** O teste não converte uma pendência em confirmação; também preserva a checagem dos estabelecimentos com destino Maps explícito.

`npm run travel:locations:check -- /tmp/travel-location-audit.json` continua sendo uma triagem global por coordenadas dos links, não uma leitura desta auditoria. Pode apontar divergências justificadas entre centro/entrada e ausência de coordenadas em links curtos ou consultas; código de saída 1 não significa que todos esses pinos estejam errados. A triagem inicial dos 399 lugares globais não é uma certificação de cidades fora de Paris.

Validação: TypeScript, suíte de testes e inspeção do app a 1440×900; detalhes finais de execução registrados na entrega. As regras de cadastro no AGENTS.md passam a exigir fonte, data e conferência da unidade antes de novas coordenadas.

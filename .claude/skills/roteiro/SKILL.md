---
name: roteiro
description: Use ao criar ou editar dias de roteiro em content/trips/*.md do Travel Boss (paradas, notas, trechos via:, horários, lugares novos no catálogo). Diz onde cada informação vai, o que não acrescentar, como pesquisar horário e preço e o que conferir no app antes de terminar.
---

# Editar um roteiro

O formato está em `content/SCHEMA.md`. Esta skill cobre o que ele não diz: onde cada informação vai, o que não entra e o que conferir antes de dizer que terminou. Cada regra vem de um erro real (setembro de 2026).

## 1. Onde vai cada informação

| Informação | Onde |
|---|---|
| O que fazer no lugar: o que pedir, ingresso, horário que importa | nota da parada, depois de ` — ` |
| Como chegar à próxima parada | `  - via:` embaixo da parada de onde se sai |
| Detalhe do trajeto: preço do carro, onde encontrar o motorista, plataforma | nota do trecho, depois de ` — ` no `via:` |
| Quanto cada pessoa paga a mais que o passe semanal naquele trecho (ticket avulso num dia sem passe, a compra do passe) | `· €2,55` no `via:`, antes da nota. Trecho coberto pelo passe fica sem `€`. Entra no card de ingressos e aparece à direita do trecho |
| Narrativa do dia | parágrafo sob o dia |
| Alternativa, plano B, aviso de greve | só se o usuário pedir. Se não pediu, sugira na resposta |

- O nome do trecho é uma ação curta: "Pegar um Bolt · 35 min", "RER E até Magenta · 14 min". A duração aparece uma vez só, porque a timeline já mostra os minutos ao lado. Errado: "carro (Bolt) · 35 min", ou o preço do Bolt na nota do café.
- O `via:` precisa de uma palavra de modo (a pé, metrô, RER, trem, ônibus, táxi, uber, bolt, carro, voo) antes da nota, e de exatamente uma duração.
- Nota curta: uma ou duas frases com o que o viajante precisa naquela hora. O histórico da pesquisa fica na resposta, não no roteiro.

## 2. O que não fazer

- Não acrescente notas, dicas, alternativas ("Mais barato: …"), planos B ou avisos que o usuário não pediu.
- Texto que o usuário mandou entra como ele escreveu. Se o app depende de uma palavra que ele tirou (ver §4), avise em vez de recolocá-la escondido.
- Não mova, crie nem remova parada fora do pedido sem dizer. Se uma mudança pedida arrasta outra (horário de saída, orçamento, período, pino), diga qual mudou e por quê.
- Linha `decisão:` é decisão do usuário: nunca desfaça, mova nem apague o que ela protege sem ele pedir. Antes de mover, trocar ou remover uma parada, leia as decisões dela (`grep -niE "decis(ão|ao|ion):" content/trips/<id>.md`). Não registre a conclusão de um pedido como anotação ou `decisão:`. Ao atender um `comentário:`, apenas apague sua linha; não acrescente texto substituto. Para registrar uma nova decisão no roteiro, espere um pedido explícito do usuário para esse registro.
- Não mude preço, horário ou nota do Google no catálogo sem fonte consultada no dia.
- Não grave `favorite: true` num lugar por conta própria — só a pedido do usuário — nem tire um `favorite` existente sem pedido.
- Lugar novo que você acrescenta sem pedido direto pelo nome (busca na região, achado perto de outro lugar) leva `aiSuggested: true` e `aiReason` (en e pt-BR); pedido pelo nome não leva.

## 3. Antes de editar

1. Confira onde sua edição vai cair: app do usuário aberto no checkout principal (5173) ou você está num worktree próprio? Num worktree, a mudança só chega ao app do usuário depois do merge — avise no resumo (ver "Quem edita onde" no `AGENTS.md`).
2. `graphify query "<tema>"`. Depois leia o dia inteiro no `.md` e as paradas vizinhas.
3. Veja se outro agente mexeu no mesmo dia: `git worktree list` e `git log main..<branch>`. Rebase no branch que já mudou aquele dia.
4. Lugar novo entra antes no catálogo: `src/data/travel.ts`, foto em `travel-photos.ts` (café e padaria: foto da comida), visita e preço em `travel-visit.ts`. O `.md` só referencia o id.
5. Trecho de trem ou metrô só aparece no mapa com perna em `src/data/travel-itinerary-legs.ts` (`tripEuropa2026`, `ride(linha, de, até)`). Perna que ficou sem uso sai do arquivo.

## 4. Regras do app que o texto controla

- **Períodos do card.** A manhã termina na última parada antes do jantar que diz "almoço" ou "lunch" (ou piquenique antes das 16h). A noite começa na primeira que diz "jantar" ou "dinner" (ou piquenique a partir das 18h). Trocar uma nota pode mover os períodos.
- **Orçamento por pessoa.** Comida e ingressos vêm do catálogo, pelo meio da faixa, mais o `€` de cada `via:`. Os dois cards sempre aparecem, mesmo com €0, e um clique neles abre a nota do dia, lugar por lugar. Um gasto que só está escrito na nota ("Compre 2 tickets por pessoa, €2,55 cada") não entra na conta: ponha o preço no trecho. Passe semanal vai no primeiro trecho do dia em que começa a valer. Visita só por fora (fachada, passar pela Torre sem subir): a nota diz "por fora", "fachada", "passar na frente", "sem subir", "sem entrar", "não vamos subir" ou "não vamos entrar", e o ingresso do catálogo não entra. Se o usuário reescrever a nota sem nenhuma dessas, o ingresso volta: avise. Com "por dentro" na mesma nota, ele volta a contar. Parada que só olha o lugar sem consumir (um café famoso): a nota diz "sem comprar", "sem comer", "só olhar" ou "só visitar", e a comida do catálogo não entra nesse dia. Tirou ou pôs uma parada ou trecho com preço? Diga no resumo como os cards mudaram.
- **Meta de comida.** `budget: comida €50` no cabeçalho da cidade é por pessoa por dia; o chip de comida do card avisa quando a data passa. Passou? Diga no resumo onde economizar (refeição mais barata, lugar mais barato perto, tirar um lanche) e espere. Se o usuário abrir exceção, respeite-a e não sugira cortar esse ponto de novo; só grave `decisão:` se ele pedir explicitamente para registrar a exceção no roteiro. Ingressos não têm meta.
- **Trilhos da timeline.** A pé é pontilhado; trem, metrô e carro são contínuos. Caminhada de ~1 min não vira linha "A pé": o pontilhado liga as paradas direto. Carro de app só sai da porta quando parte da hospedagem; de outro lugar (café do aeroporto), o trecho até o carro é a pé.
- **Roteiro em aberto.** Sobrou 2h ou mais depois de uma parada (visita do catálogo, ou 1h, mais o trajeto)? O app põe o bloco "Roteiro em aberto" sozinho. Não invente parada para tapar o buraco: diga no resumo que há tempo livre e sugira, se fizer sentido.
- **Sub-pontos.** Parque ou lugar grande onde o roteiro caminha por dentro ganha `subPoints` no catálogo (OSM, em ordem de caminhada: entra pelo lado de quem chega e sai para o lado da próxima parada). Não escreva a rota interna na nota. No roteiro, a parada é o parque; atração ou restaurante lá dentro não é parada. Se tem horário e dica, vira nota de lista com hora (`- 10:15 **Ratatouille** — …`): o negrito tem de ser o nome do sub-ponto (en ou pt-BR, ou o começo dele), porque é por ele que o app tira a nota da timeline e a põe dentro do ponto no card do lugar. O ponto dele no catálogo leva `placeId` para a comida contar no orçamento. O `via:` para sair do parque fica embaixo da parada do parque; a timeline mostra o trecho logo antes da próxima parada. Como nota de lista não conta como refeição, o almoço e o jantar dentro do parque não dividem os períodos: valem 12h e 18h (Disney em 7/10).
- **Km a pé.** O card soma os trechos a pé da rota, na ordem dos horários das notas dos sub-pontos. Caminhada que a rota não vê (corredores do Louvre e do palácio de Versalhes, filas e idas e voltas na Disney) entra como nota de lista `- +3 km — motivo` sob a parada, que o app mostra no card do lugar, não na timeline; o tooltip do km mostra a rota e o acréscimo separados. Não invente o número: diga no resumo que é estimativa.
- **Pino.** Se o plano depende de um ponto exato (terminal onde o voo pousa, entrada, ponto de embarque), confira o pino no mapa. Para corrigir, use o `!3d…!4d…` do Google no catálogo.

## 5. Pesquisa, com fonte do dia

- Horário, nota e pino: Google Maps no painel do navegador (`google.com/maps/search/?api=1&hl=en&query=…`). Com o painel escondido, leia os `aria-label` que casam com `/day, .*(AM|PM|Closed)/`.
- Ingresso: site oficial. Brasileiro paga a tarifa de fora da UE/EEE.
- Trem, metrô, obras e greve: Transitous `api.transitous.org/api/v1/plan` (horário em UTC; em outubro some 2 h). Alerta da IDFM ("arrêt non desservi", obras à noite) vale mais que o plano calculado.
- Carro de app: páginas de rota da Bolt (`bolt.eu/fr-fr/cities/paris/route/<de>-to-<para>/`) e do Uber (`uber.com/global/en/r/routes/…`). O preço que vale é o que o usuário simulou no app.
- Pôr do sol: `api.sunrise-sunset.org` (UTC).
- Endpoints e casos já resolvidos estão nas referências compartilhadas: [Disney e fontes de transporte](../../../docs/references/dlp-idfm-live-data-sources.md), [obras e interrupções em Paris](../../../docs/references/paris-oct-2026-transit-disruptions.md) e [verificação de localização](../../../docs/references/place-location-verification.md). As datas de consulta estão em cada arquivo; reconfira fatos que podem mudar. Os links funcionam tanto por `.claude/skills/roteiro/` quanto por `.agents/skills/roteiro/`.
- Fato sem fonte leva 🤔 na resposta.

## 6. Antes de dizer que terminou

1. `npx tsc --noEmit && npm test`.
2. Abra o dia no app (`npm run dev` na 5173; num worktree, `npx vite --port 5174 --strictPort`) e confira no card:
   - os períodos (manhã, tarde, noite) começam e terminam onde o usuário espera;
   - os cards de comida e ingressos: batem com o que o dia gasta (entrada, ticket de metrô)? Se mudaram, explique;
   - cada trecho: nome curto, duração uma vez, nota embaixo, trilho certo (a pé pontilhado);
   - os pinos no lugar certo do mapa.
3. `graphify update .` e commit `feat(trip): …` ou `fix(trip): …`.
4. No resumo: o que mudou, o que mudou junto sem ter sido pedido e o que ficou para o usuário decidir.

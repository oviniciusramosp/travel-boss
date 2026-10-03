# Manhã de 14/10 e depósito de malas em Roma

Consulta em 3/10/2026. Novos lugares em Milão são sugestões de IA, ainda sem confirmação do usuário.

## Milão, quarta-feira 14/10/2026

- **Bosco Verticale**: [projeto do Boeri Studio](https://www.stefanoboeriarchitetti.net/project/bosco-verticale/), torres residenciais concluídas em 2014. Passeio apenas externo, sem ingresso e sem acesso aos edifícios privados.
- [Ficha exata Google Maps](https://www.google.com/maps/place/Bosco+Verticale/data=!4m6!3m5!1s0x4786c132b4a49b21:0x545068687f3a217b!8m2!3d45.4857042!4d9.1905385!16s%2Fm%2F0nb212f): Via Gaetano de Castillia 11; 4,7 / 3.703 avaliações. Coordenada da entidade `!3d/!4d`, 45.4857042, 9.1905385, identifica o conjunto; o passeio e a aproximação a pé são pela via pública, não pela entrada residencial. Não foi usado o centro de câmera `@`.
- **Pavé — Via Casati 27**: [unidades e horários oficiais](https://pavemilano.com/en/shops/): todos os dias 8h–19h.
- [Menu oficial, junho de 2026](https://pavemilano.com/wp-content/uploads/2026/06/menu-ita-giugno-2026.pdf): All Day Food disponível das 8h às 15h30, incluindo Eggs and Bacon Bomb (10,50), avocado toast (12,50), Pavé sandwich (8). Cappuccino regular 2,20; croissant recheado 3; serviço de mesa 1,50 por pessoa. Estimativa do brunch no roteiro: 20 por pessoa, com margem; valor apenas no indicador, sem duplicar na descrição.
- [Ficha exata Google Maps Pavé](https://www.google.com/maps/place/Pav%C3%A9/data=!4m6!3m5!1s0x4786c7f0f4b07247:0xfab702a3e4474630!8m2!3d45.479137!4d9.2025687!16s%2Fg%2F11j3wxv78j): 4,4 / 3.065 avaliações; faixa geral 10–20; pino da unidade 45.479137, 9.2025687, obtido da entidade `!3d/!4d`.
- Capas provenientes das fichas exatas Google Maps: fachada das torres e imagem identificada como “Croissants” na seção Cardápio e destaques do Pavé. URLs e créditos registrados no catálogo.
- Caminhadas são estimativas conservadoras: hotel → Bosco 30 min; Bosco → Pavé 25 min; Pavé → hotel 40 min. Saída 8h45, Bosco 9h15–9h40, brunch 10h05–10h50, hotel 11h30; margem de 30 min antes do checkout 12h. Malas permanecem no quarto durante a manhã; marca de malas começa no checkout. Trem reservado 13h10 preservado.
- Orçamento: brunch acrescenta 20 por pessoa ao dia; passeio externo não acrescenta ingresso.

## Stow Your Bags — Colosseo

- [Ficha exata Google Maps](https://www.google.com/maps/place/Stow+Your+Bags+-+Luggage+Storage+-+Colosseo/data=!4m6!3m5!1s0x132f61c16b9e698f:0xa12df36c399ac35b!8m2!3d41.8930372!4d12.4890596!16s%2Fg%2F11j31vdvq7): nome “Stow Your Bags - Luggage Storage - Colosseo”, Via del Colosseo 2, 00184 Roma; categoria Depósito de bagagem; 4,8 / 1.155 avaliações.
- Website vinculado na própria ficha: [unidade Colosseum / Roman Forum](https://www.stowyourbags.com/en/shop/rome/colosseum-roman-forum/). A [lista oficial de Roma](https://www.stowyourbags.com/en/shop/rome/) confirma a unidade e endereço.
- Pino ajustado aproximadamente 5 m para a entidade exata do Google: 41.8930372, 12.4890596 (`!3d/!4d`), em substituição ao objeto OSM anteriormente usado. Mesma unidade no mesmo endereço.
- Link principal passa a abrir Google Maps; capa capturada no botão “Foto de Stow Your Bags - Luggage Storage - Colosseo”, com crédito no catálogo.
- Subcategoria `luggage-storage`, ícone Material `luggage`: aplicada no mapa, timeline e ficha, com fallback preservado para estações de metrô. Não altera a marca “Com as malas”, que depende do checkout/depósito/retirada.

## Validação

- TypeScript, 595 testes e build de produção passaram; `graphify update .` concluído.
- App conferido em 1440×900: manhã com quatro paradas, comida 20 / ingressos 0, saídas estimadas 8h45 / 9h40 / 10h50, sem marca de malas durante o passeio.
- Capas dos três lugares carregadas no navegador (Pavé 224 px; Bosco e Stow 408 px). Ficha, busca e pino do Stow exibem bagagem; nota Google 4,8 no campo apropriado e link Google Maps da unidade.

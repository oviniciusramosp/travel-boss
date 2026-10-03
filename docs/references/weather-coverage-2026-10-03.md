# Cobertura do tempo — 3 de outubro de 2026

- [Previsão Open-Meteo](https://open-meteo.com/en/docs): até 16 dias, no fuso da cidade.
- [ECMWF EC46 via Open-Meteo](https://open-meteo.com/en/docs/seasonal-forecast-api): até 46 dias, conjunto de membros com resolução espacial de 36 km. O provedor orienta interpretar os dados como tendência regional, com limitações para condições locais.
- Consulta conferida em Lisboa: `models=ecmwf_ec46`, `hourly=temperature_2m,precipitation,cloud_cover`, `temporal_resolution=hourly`, `forecast_days=46`, `timezone=Europe/Lisbon` retorna horas de 03/10 a 17/11/2026, incluindo 19 e 20/10.
- O app preserva os dados de curto prazo e usa EC46 somente onde faltam horas. Os valores estendidos levam `~` e tooltip “Tendência de longo prazo · menor confiança”. Datas além da cobertura exibem a indisponibilidade; falha na fonte estendida mantém os dados de curto prazo.
- Dias sem paradas usam a cidade do cabeçalho do roteiro.
- Cada período usa a cidade real da primeira parada, incluindo bate-voltas como Veneza e Verona e a chegada a São Paulo. Todas as cidades referenciadas pelas paradas são consultadas, uma vez por cidade a cada atualização.

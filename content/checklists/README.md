# Checklists por viagem

`<id>.json` guarda os itens da aba Checklist da viagem `content/trips/<id>.md`.
Cada item tem `id`, `group` (`tasks` ou `packing`), `text` e `done`.
Tarefas aceitam `date` (`YYYY-MM-DD`) e `time` (`HH:mm`), opcionais e independentes. Campos vazios são omitidos; são datas e horários locais, sem conversão de fuso.
O servidor local salva uma alteração por item via `PATCH /api/checklists/<id>`, rejeitando edições desatualizadas.
As checklists não fazem parte do Markdown nem da exportação do itinerário.

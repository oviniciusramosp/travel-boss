# Atualização do site publicado — 15/10/2026

O deploy `38645538003` terminou com sucesso e a URL normal servia o bundle
`index-BixDjsN8.js`. Durante a investigação chegou a publicação `e52b62b`, com
workflow `38647435328` bem-sucedido, incluindo a saída única da hospedagem e o
card do Regionale 22904. A correção de cache parte dessa versão pública.

O botão existente “Atualizar roteiro” permaneceu em “Baixando a versão mais
recente do roteiro…” no navegador, mesmo após a instalação do worker.
`location.replace()` para a mesma URL contendo `#/trip/europa` faz navegação
dentro do documento: não recarrega o JavaScript nem o roteiro empacotado. Isso
afetava tanto o botão quanto a aplicação automática de um worker atualizado.

`reloadApp()` usa `location.reload()` quando a URL de destino já é a atual.
URLs diferentes continuam usando `replace()`, preservando o hash da viagem e
a recuperação de workers antigos por `%69ndex.html`. O botão passa a se chamar
“Forçar atualização”. A aplicação consulta o worker a cada minuto enquanto a
aba está visível e online, e ao voltar à aba ou recuperar a conexão.

TypeScript e 702 testes locais e públicos passaram, incluindo regressões para
recarregar a URL canônica, retornar da URL de recuperação e consultar novas
versões sem rede ou com a aba oculta. A cópia de publicação contém somente
código, testes e esta referência; reservas e histórico privado não são copiados.

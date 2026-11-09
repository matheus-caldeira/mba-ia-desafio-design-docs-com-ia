# Tracker de Rastreabilidade

Mapa de cada item identificável dos documentos (`docs/PRD.md`, `docs/RFC.md`,
`docs/FDD.md` e `docs/adrs/`) até a origem: a transcrição da reunião
(`TRANSCRICAO.md`) ou o código do repositório.

**Como ler**

- **ID** é o mesmo identificador usado dentro do documento (busque por ele no arquivo).
- **Fonte = `TRANSCRICAO`**: a Localização é `[hh:mm] Nome`, o primeiro trecho
  da reunião que sustenta o item. Itens com várias falas citam as demais no próprio documento.
- **Fonte = `CODIGO`**: a Localização é um arquivo que existe no repositório.
- **Tipo = Premissa (derivada)**: decisão de implementação que **não** foi fechada
  na reunião; a Localização aponta para a fala ou arquivo de onde ela foi derivada.
  Estão listadas em [FDD §15](FDD.md#15-premissas) e precisam de confirmação.

**Cobertura:** 261 itens · 230 com fonte `TRANSCRICAO` (88.1%) ·
31 com fonte `CODIGO` (11.9%) · 0 sem fonte.

Gerado por `processo/scripts/gerar-tracker.mjs` a partir dos IDs dos documentos e de
`processo/scripts/tracker-manual.json` (ADRs e contratos), e verificado por
`processo/scripts/verificar-entrega.mjs`.

| ID | Documento | Tipo | Conteúdo (resumo) | Fonte | Localização |
| --- | --- | --- | --- | --- | --- |
| PRD-AC-01 | `docs/PRD.md` | Critério de Aceitação | Um endpoint cadastrado para `SHIPPED` recebe o evento em menos de 10s quando um pedido do seu customer muda para `SHIPPED`. | TRANSCRICAO | [09:02] Marcos |
| PRD-AC-02 | `docs/PRD.md` | Critério de Aceitação | O mesmo endpoint não recebe nada quando o pedido muda para um status fora do seu filtro. | TRANSCRICAO | [09:33] Marcos |
| PRD-AC-03 | `docs/PRD.md` | Critério de Aceitação | Cadastro com URL `http://` é recusado com erro de validação. | TRANSCRICAO | [09:23] Sofia |
| PRD-AC-04 | `docs/PRD.md` | Critério de Aceitação | A secret aparece só no cadastro e na rotação; o cliente consegue validar a assinatura de cada envio com ela. | TRANSCRICAO | [09:31] Marcos |
| PRD-AC-05 | `docs/PRD.md` | Critério de Aceitação | Após rotação, envios das próximas 24h validam tanto com a secret nova quanto com a antiga; depois disso, só com a nova (mecanismo proposto no FDD, premissa P-08). | TRANSCRICAO | [09:21] Sofia |
| PRD-AC-06 | `docs/PRD.md` | Critério de Aceitação | Com o endpoint fora do ar, o evento é reenviado em 1m, 5m, 30m, 2h e 12h e, persistindo a falha, aparece na fila de falhas permanentes. | TRANSCRICAO | [09:17] Larissa |
| PRD-AC-07 | `docs/PRD.md` | Critério de Aceitação | Um ADMIN consegue reprocessar um evento da fila; um OPERATOR recebe acesso negado. | TRANSCRICAO | [09:36] Sofia |
| PRD-AC-08 | `docs/PRD.md` | Critério de Aceitação | O histórico de um endpoint mostra até 100 entregas com resultado, conteúdo, resposta e tempo. | TRANSCRICAO | [09:34] Marcos |
| PRD-AC-09 | `docs/PRD.md` | Critério de Aceitação | Uma mudança de status que falha não gera evento; uma que é concluída sempre gera evento para os endpoints interessados. | TRANSCRICAO | [09:06] Diego |
| PRD-AC-10 | `docs/PRD.md` | Critério de Aceitação | A documentação do portal explica assinatura, headers e deduplicação. | TRANSCRICAO | [09:26] Marcos |
| PRD-AC-11 | `docs/PRD.md` | Critério de Aceitação | A revisão de segurança foi concluída antes do deploy. | TRANSCRICAO | [09:46] Sofia |
| PRD-DEP-01 | `docs/PRD.md` | Dependência | Fluxo atual de mudança de status do OMS (`PATCH /orders/:id/status`), onde o evento nasce. | TRANSCRICAO | [09:40] Bruno |
| PRD-DEP-02 | `docs/PRD.md` | Dependência | Banco MySQL e stack Node/Prisma existentes, usados também pelo novo processo. | TRANSCRICAO | [09:11] Diego |
| PRD-DEP-03 | `docs/PRD.md` | Dependência | Autenticação JWT e papéis `ADMIN`/`OPERATOR` existentes. | TRANSCRICAO | [09:32] Marcos |
| PRD-DEP-04 | `docs/PRD.md` | Dependência | Revisão de segurança da Sofia antes do deploy. | TRANSCRICAO | [09:46] Sofia |
| PRD-DEP-05 | `docs/PRD.md` | Dependência | Portal do desenvolvedor atualizado pelo PM (integração, assinatura e deduplicação). | TRANSCRICAO | [09:26] Marcos |
| PRD-DEP-06 | `docs/PRD.md` | Dependência | Clientes com endpoint HTTPS que responda em até 10s e implemente a verificação. | TRANSCRICAO | [09:23] Sofia |
| PRD-FR-01 | `docs/PRD.md` | Requisito Funcional | O usuário autenticado deve cadastrar um endpoint informando o customer, a URL e a lista de status desejados; o customer é informado explicitamente na requisição, não… | TRANSCRICAO | [09:31] Marcos |
| PRD-FR-02 | `docs/PRD.md` | Requisito Funcional | A plataforma deve gerar a secret do endpoint e devolvê-la na resposta do cadastro. | TRANSCRICAO | [09:31] Marcos |
| PRD-FR-03 | `docs/PRD.md` | Requisito Funcional | O usuário deve listar os endpoints de um customer. | TRANSCRICAO | [09:33] Bruno |
| PRD-FR-04 | `docs/PRD.md` | Requisito Funcional | O usuário deve editar um endpoint (URL, status desejados, ativo/inativo). | TRANSCRICAO | [09:33] Bruno |
| PRD-FR-05 | `docs/PRD.md` | Requisito Funcional | O usuário deve remover um endpoint. | TRANSCRICAO | [09:33] Bruno |
| PRD-FR-06 | `docs/PRD.md` | Requisito Funcional | Cada endpoint deve receber apenas os status que escolheu; se nenhum endpoint do customer quer aquele status, nada é gerado. | TRANSCRICAO | [09:33] Marcos |
| PRD-FR-07 | `docs/PRD.md` | Requisito Funcional | A cada mudança de status de um pedido, o sistema deve enviar aos endpoints interessados um evento com identificador do evento, tipo, data/hora, pedido (id e número)… | TRANSCRICAO | [09:43] Diego |
| PRD-FR-08 | `docs/PRD.md` | Requisito Funcional | Cada envio deve ser assinado para que o cliente valide origem e integridade. | TRANSCRICAO | [09:19] Sofia |
| PRD-FR-09 | `docs/PRD.md` | Requisito Funcional | O cliente deve poder pedir uma nova secret pela API; a anterior continua válida por 24h. | TRANSCRICAO | [09:21] Sofia |
| PRD-FR-10 | `docs/PRD.md` | Requisito Funcional | Cada envio deve trazer um identificador único e estável do evento, para o cliente descartar duplicatas, e o identificador do endpoint, para clientes com vários cadastros. | TRANSCRICAO | [09:25] Diego |
| PRD-FR-11 | `docs/PRD.md` | Requisito Funcional | Envios que falharem devem ser repetidos automaticamente em 1 min, 5 min, 30 min, 2 h e 12 h; depois disso, o evento vai para a fila de falhas permanentes. | TRANSCRICAO | [09:17] Larissa |
| PRD-FR-12 | `docs/PRD.md` | Requisito Funcional | O usuário deve consultar o histórico das últimas 100 entregas de um endpoint, com sucesso/falha, conteúdo enviado, resposta e tempo de resposta. | TRANSCRICAO | [09:34] Marcos |
| PRD-FR-13 | `docs/PRD.md` | Requisito Funcional | Um ADMIN deve poder reprocessar um evento da fila de falhas permanentes; a ação é registrada com quem a executou. | TRANSCRICAO | [09:36] Sofia |
| PRD-NFR-01 | `docs/PRD.md` | Requisito Não Funcional | Latência: primeira tentativa em menos de 10s; os eventos novos são procurados a cada 2s (até 2s de espera aceitos). | TRANSCRICAO | [09:02] Marcos |
| PRD-NFR-02 | `docs/PRD.md` | Requisito Não Funcional | Isolamento: lentidão ou queda de cliente nunca bloqueia nem desfaz mudanças de status. | TRANSCRICAO | [09:04] Bruno |
| PRD-NFR-03 | `docs/PRD.md` | Requisito Não Funcional | Consistência: se o status mudou, o evento existe; se a mudança falhou, o evento não existe. | TRANSCRICAO | [09:06] Diego |
| PRD-NFR-04 | `docs/PRD.md` | Requisito Não Funcional | Garantia de entrega: pelo menos uma vez (duplicatas possíveis e identificáveis). | TRANSCRICAO | [09:24] Diego |
| PRD-NFR-05 | `docs/PRD.md` | Requisito Não Funcional | Ordem: eventos de um mesmo pedido saem na ordem em que ocorreram enquanto houver um único processador; não há ordem global. | TRANSCRICAO | [09:13] Larissa |
| PRD-NFR-06 | `docs/PRD.md` | Requisito Não Funcional | Segurança de transporte: só endereços `https`; `http` é recusado no cadastro. | TRANSCRICAO | [09:23] Sofia |
| PRD-NFR-07 | `docs/PRD.md` | Requisito Não Funcional | Segurança de assinatura: HMAC-SHA256, secret única por endpoint. | TRANSCRICAO | [09:22] Sofia |
| PRD-NFR-08 | `docs/PRD.md` | Requisito Não Funcional | Tamanho: eventos acima de 64KB não são enviados (erro, nunca truncamento). | TRANSCRICAO | [09:24] Larissa |
| PRD-NFR-09 | `docs/PRD.md` | Requisito Não Funcional | Timeout: cliente que não responde em 10s conta como falha e entra em reenvio. | TRANSCRICAO | [09:42] Diego |
| PRD-NFR-10 | `docs/PRD.md` | Requisito Não Funcional | Operação: o envio roda em processo separado da API, no mesmo banco e na mesma stack, sem infraestrutura nova. | TRANSCRICAO | [09:11] Diego |
| PRD-NFR-11 | `docs/PRD.md` | Requisito Não Funcional | Padrões: módulo no mesmo padrão dos existentes, com códigos de erro prefixados `WEBHOOK_`. | TRANSCRICAO | [09:30] Larissa |
| PRD-NFR-12 | `docs/PRD.md` | Requisito Não Funcional | Revisão de segurança: 2 dias úteis de revisão do código de HMAC e de geração de secret antes do deploy. | TRANSCRICAO | [09:46] Sofia |
| PRD-OBJ-01 | `docs/PRD.md` | Objetivo / Métrica | Notificar mudanças de status em "tempo real": p95 do tempo entre a mudança de status e a primeira tentativa de entrega — meta < 10 segundos | TRANSCRICAO | [09:02] Marcos |
| PRD-OBJ-02 | `docs/PRD.md` | Objetivo / Métrica | Reter os clientes que pediram a feature: Clientes solicitantes recebendo webhooks em produção — meta 3 de 3 (Atlas, MaxDistribuição, Nova Cargo) até o fim de novembro | TRANSCRICAO | [09:45] Marcos |
| PRD-OBJ-03 | `docs/PRD.md` | Objetivo / Métrica | Não perder nenhuma notificação: Mudanças de status (escutadas por algum endpoint) sem evento registrado — meta 0 (100% registradas) | TRANSCRICAO | [09:40] Bruno |
| PRD-OBJ-04 | `docs/PRD.md` | Objetivo / Métrica | Tolerar indisponibilidade do cliente: Maior janela de indisponibilidade coberta por reenvio automático — meta ≈ 14h36min (1m+5m+30m+2h+12h) | TRANSCRICAO | [09:17] Diego |
| PRD-OBJ-05 | `docs/PRD.md` | Objetivo / Métrica | Reduzir o polling dos clientes: Chamadas a `GET /orders` dos 3 clientes — meta Queda em relação à linha de base. A meta numérica não foi definida na reunião; medir a… | TRANSCRICAO | [09:00] Marcos |
| PRD-OBJ-06 | `docs/PRD.md` | Objetivo / Métrica | Entregar no prazo combinado: Sprints até a entrega, com revisão de segurança — meta 3 sprints | TRANSCRICAO | [09:47] Larissa |
| PRD-OOS-01 | `docs/PRD.md` | Fora de escopo | Email ao cliente quando o webhook falha repetidamente | TRANSCRICAO | [09:37] Larissa |
| PRD-OOS-02 | `docs/PRD.md` | Fora de escopo | Dashboard/painel visual para o cliente ver seus webhooks | TRANSCRICAO | [09:40] Larissa |
| PRD-OOS-03 | `docs/PRD.md` | Fora de escopo | Rate limiting de envio por cliente: Fora do escopo; observar e decidir depois | TRANSCRICAO | [09:39] Larissa |
| PRD-OOS-04 | `docs/PRD.md` | Fora de escopo | Webhooks de entrada (cliente enviando para o OMS) | TRANSCRICAO | [09:02] Marcos |
| PRD-OOS-05 | `docs/PRD.md` | Fora de escopo | Arquivamento de eventos já entregues (~30 dias) | TRANSCRICAO | [09:08] Diego |
| PRD-OOS-06 | `docs/PRD.md` | Fora de escopo | Garantia de ordem global entre pedidos e múltiplos workers | TRANSCRICAO | [09:13] Diego |
| PRD-OOS-07 | `docs/PRD.md` | Fora de escopo | Entrega exactly-once: Descartado pela complexidade | TRANSCRICAO | [09:25] Diego |
| PRD-OOS-08 | `docs/PRD.md` | Fora de escopo | Itens do pedido no evento: Descartado para manter o payload enxuto; detalhes via `GET /orders/:id` | TRANSCRICAO | [09:43] Diego |
| PRD-RISK-01 | `docs/PRD.md` | Risco | Atraso na entrega leva a Atlas a migrar para o concorrente (prob. Média, impacto Alto) | TRANSCRICAO | [09:00] Marcos |
| PRD-RISK-02 | `docs/PRD.md` | Risco | Clientes não tratam duplicatas e processam o mesmo evento duas vezes (prob. Média, impacto Médio) | TRANSCRICAO | [09:25] Sofia |
| PRD-RISK-03 | `docs/PRD.md` | Risco | Cliente vaza a secret em log (prob. Baixa, impacto Alto) | TRANSCRICAO | [09:22] Diego |
| PRD-RISK-04 | `docs/PRD.md` | Risco | Cliente fora do ar por mais de ~15h perde eventos para a fila de falhas (prob. Baixa, impacto Médio) | TRANSCRICAO | [09:17] Marcos |
| PRD-RISK-05 | `docs/PRD.md` | Risco | Rajadas de eventos sobrecarregam endpoints de clientes (sem rate limiting) (prob. Baixa, impacto Médio) | TRANSCRICAO | [09:38] Diego |
| PRD-RISK-06 | `docs/PRD.md` | Risco | Clientes lentos atrasam a entrega para os demais (um único processador) (prob. Média, impacto Alto) | TRANSCRICAO | [09:42] Diego |
| PRD-RISK-07 | `docs/PRD.md` | Risco | Revisão de segurança não reservada no cronograma (prob. Baixa, impacto Médio) | TRANSCRICAO | [09:49] Sofia |
| RFC-ALT-01 | `docs/RFC.md` | Alternativa descartada (Trade-off) | Disparo HTTP síncrono em `changeStatus` — Menor latência e nenhuma tabela nova, mas um cliente lento seguraria a transação e travaria mudanças de status de outros… | TRANSCRICAO | [09:04] Bruno |
| RFC-ALT-02 | `docs/RFC.md` | Alternativa descartada (Trade-off) | Redis Streams / broker dedicado — Modelo de fila nativo, mas exige subir e operar infraestrutura nova; Redis Cluster seria overengineering para um time pequeno, e o… | TRANSCRICAO | [09:07] Larissa |
| RFC-ALT-03 | `docs/RFC.md` | Alternativa descartada (Trade-off) | Trigger de banco para acordar o worker — Seria mais reativo, mas MySQL não tem LISTEN/NOTIFY; trigger não avisa processo externo e exigiria gambiarras. Polling de 2s já… | TRANSCRICAO | [09:09] Bruno |
| RFC-ALT-04 | `docs/RFC.md` | Alternativa descartada (Trade-off) | Worker dentro do processo da API — Um processo a menos, mas reinício/deploy da API derrubaria as entregas. | TRANSCRICAO | [09:11] Diego |
| RFC-ALT-05 | `docs/RFC.md` | Alternativa descartada (Trade-off) | Garantia exactly-once — Poupa o cliente de deduplicar, mas exige coordenação dos dois lados e muito mais complexidade; at-least-once com id resolve a grande maioria dos… | TRANSCRICAO | [09:25] Diego |
| RFC-ALT-06 | `docs/RFC.md` | Alternativa descartada (Trade-off) | Secret global da plataforma — Gestão trivial, mas um vazamento comprometeria todos os clientes. | TRANSCRICAO | [09:21] Sofia |
| RFC-OQ-01 | `docs/RFC.md` | Questão em aberto | Rate limiting de saída por cliente (ex.: 50 pedidos mudando em 1 min) | TRANSCRICAO | [09:39] Larissa |
| RFC-OQ-02 | `docs/RFC.md` | Questão em aberto | Aviso por email quando o webhook do cliente falha repetidamente | TRANSCRICAO | [09:37] Larissa |
| RFC-OQ-03 | `docs/RFC.md` | Questão em aberto | Escalar para múltiplos workers sem perder a ordem por pedido | TRANSCRICAO | [09:13] Diego |
| RFC-OQ-04 | `docs/RFC.md` | Questão em aberto | Arquivamento de eventos entregues (~30 dias) | TRANSCRICAO | [09:08] Diego |
| RFC-OQ-05 | `docs/RFC.md` | Questão em aberto | Ordem sob retry: um evento em backoff pode ser ultrapassado por um evento mais novo do mesmo pedido | TRANSCRICAO | [09:13] Larissa |
| RFC-OQ-06 | `docs/RFC.md` | Questão em aberto | `X-Timestamp` não é coberto pela assinatura (HMAC só do corpo), enfraquecendo a detecção de replay | TRANSCRICAO | [09:44] Diego |
| RFC-OQ-07 | `docs/RFC.md` | Questão em aberto | Proteção da secret em repouso (HMAC exige secret recuperável) | TRANSCRICAO | [09:46] Sofia |
| RFC-OQ-08 | `docs/RFC.md` | Questão em aberto | "5 tentativas": 5 envios no total ou 1 envio + 5 re-tentativas? | TRANSCRICAO | [09:17] Larissa |
| RFC-OQ-09 | `docs/RFC.md` | Questão em aberto | `customer_id` no body ou no path: "no body ou no path", não fechado | TRANSCRICAO | [09:32] Larissa |
| RFC-OQ-10 | `docs/RFC.md` | Questão em aberto | Endurecer permissões do CRUD de configuração | TRANSCRICAO | [09:37] Sofia |
| ADR-001 | `docs/adrs/ADR-001-outbox-transacional-no-mysql.md` | Decisão | Outbox transacional no MySQL: evento inserido na mesma transação da mudança de status; falha na outbox ⇒ rollback | TRANSCRICAO | [09:08] Larissa |
| ADR-001-ALT-01 | `docs/adrs/ADR-001-outbox-transacional-no-mysql.md` | Alternativa descartada (Trade-off) | Disparo HTTP síncrono em changeStatus: cliente lento travaria mudanças de status; rollback do status inaceitável | TRANSCRICAO | [09:04] Bruno |
| ADR-001-ALT-02 | `docs/adrs/ADR-001-outbox-transacional-no-mysql.md` | Alternativa descartada (Trade-off) | Redis Streams / Redis Cluster: infraestrutura nova, overengineering para time pequeno | TRANSCRICAO | [09:07] Larissa |
| ADR-001-CON-01 | `docs/adrs/ADR-001-outbox-transacional-no-mysql.md` | Trade-off | Tabela de outbox cresce; arquivamento de entregues (~30 dias) fora do escopo | TRANSCRICAO | [09:08] Diego |
| ADR-001-CTX-01 | `docs/adrs/ADR-001-outbox-transacional-no-mysql.md` | Contexto (código) | changeStatus executa em prisma.$transaction: update de orders, insert em order_status_history, débito/reposição de estoque | CODIGO | `src/modules/orders/order.service.ts` |
| ADR-002 | `docs/adrs/ADR-002-worker-separado-em-polling.md` | Decisão | Worker em processo separado (src/worker.ts, npm run worker), polling de 2s, instância única | TRANSCRICAO | [09:10] Larissa |
| ADR-002-ALT-01 | `docs/adrs/ADR-002-worker-separado-em-polling.md` | Alternativa descartada (Trade-off) | Trigger de banco para acordar o worker: MySQL não tem LISTEN/NOTIFY nem notifica processo externo | TRANSCRICAO | [09:09] Diego |
| ADR-002-ALT-02 | `docs/adrs/ADR-002-worker-separado-em-polling.md` | Alternativa descartada (Trade-off) | Worker dentro do processo da API: reinício da API derrubaria as entregas | TRANSCRICAO | [09:11] Diego |
| ADR-002-CTX-01 | `docs/adrs/ADR-002-worker-separado-em-polling.md` | Contexto (código) | Entry-point existente com bootstrap e shutdown por SIGINT/SIGTERM, modelo para src/worker.ts | CODIGO | `src/server.ts` |
| ADR-002-RES-01 | `docs/adrs/ADR-002-worker-separado-em-polling.md` | Restrição | Ordering só por order_id e enquanto single-worker; sem ordering global (limitação conhecida) | TRANSCRICAO | [09:13] Larissa |
| ADR-003 | `docs/adrs/ADR-003-retry-com-backoff-exponencial-e-dlq.md` | Decisão | Retry com backoff 1m/5m/30m/2h/12h; depois DLQ em tabela separada; replay manual por ADMIN | TRANSCRICAO | [09:17] Larissa |
| ADR-003-ALT-01 | `docs/adrs/ADR-003-retry-com-backoff-exponencial-e-dlq.md` | Alternativa descartada (Trade-off) | Retry indefinido: evento ficaria pendurado para sempre se o cliente sumiu | TRANSCRICAO | [09:15] Diego |
| ADR-003-ALT-02 | `docs/adrs/ADR-003-retry-com-backoff-exponencial-e-dlq.md` | Alternativa descartada (Trade-off) | 3 tentativas: cobriria ~30 min; cliente já teve 2h de manutenção | TRANSCRICAO | [09:16] Diego |
| ADR-003-ALT-03 | `docs/adrs/ADR-003-retry-com-backoff-exponencial-e-dlq.md` | Alternativa descartada (Trade-off) | Marcar falha só na própria outbox: leitura menos limpa e sem evidência estruturada | TRANSCRICAO | [09:17] Larissa |
| ADR-003-CON-01 | `docs/adrs/ADR-003-retry-com-backoff-exponencial-e-dlq.md` | Trade-off | Janela de ~15h aceita pelo produto; acima disso, intervenção manual | TRANSCRICAO | [09:17] Marcos |
| ADR-004 | `docs/adrs/ADR-004-assinatura-hmac-sha256-com-secret-por-endpoint.md` | Decisão | HMAC-SHA256 sobre o corpo, secret por endpoint, rotação com grace period de 24h, TLS obrigatório | TRANSCRICAO | [09:22] Sofia |
| ADR-004-ALT-01 | `docs/adrs/ADR-004-assinatura-hmac-sha256-com-secret-por-endpoint.md` | Alternativa descartada (Trade-off) | Secret global da plataforma: se vaza uma, vaza tudo | TRANSCRICAO | [09:21] Sofia |
| ADR-004-ALT-02 | `docs/adrs/ADR-004-assinatura-hmac-sha256-com-secret-por-endpoint.md` | Alternativa descartada (Trade-off) | Rotação imediata sem convivência: cliente sem tempo para migrar | TRANSCRICAO | [09:21] Sofia |
| ADR-004-CTX-01 | `docs/adrs/ADR-004-assinatura-hmac-sha256-com-secret-por-endpoint.md` | Contexto | Cliente já vazou secret em log de aplicação | TRANSCRICAO | [09:22] Diego |
| ADR-005 | `docs/adrs/ADR-005-entrega-at-least-once-com-x-event-id.md` | Decisão | Entrega at-least-once com X-Event-Id (UUID gerado na outbox) para deduplicação no cliente | TRANSCRICAO | [09:26] Larissa |
| ADR-005-ALT-01 | `docs/adrs/ADR-005-entrega-at-least-once-com-x-event-id.md` | Alternativa descartada (Trade-off) | Exactly-once: exige coordenação dos dois lados, muito mais complexo | TRANSCRICAO | [09:25] Diego |
| ADR-005-CON-01 | `docs/adrs/ADR-005-entrega-at-least-once-com-x-event-id.md` | Trade-off | Responsabilidade de deduplicar transferida ao cliente | TRANSCRICAO | [09:25] Sofia |
| ADR-006 | `docs/adrs/ADR-006-reuso-dos-padroes-existentes-do-projeto.md` | Decisão | Reuso máximo: AppError, Pino, error middleware, módulo em src/modules/webhooks, Zod, prefixo WEBHOOK_ | TRANSCRICAO | [09:30] Larissa |
| ADR-006-ALT-01 | `docs/adrs/ADR-006-reuso-dos-padroes-existentes-do-projeto.md` | Alternativa descartada (Trade-off) | Injetar repository de webhooks no OrderService: preferida função pura que recebe o tx | TRANSCRICAO | [09:41] Diego |
| ADR-006-COD-01 | `docs/adrs/ADR-006-reuso-dos-padroes-existentes-do-projeto.md` | Padrão do código | Erros de domínio estendendo AppError (InsufficientStockError, InvalidStatusTransitionError) | CODIGO | `src/shared/errors/http-errors.ts` |
| ADR-006-COD-02 | `docs/adrs/ADR-006-reuso-dos-padroes-existentes-do-projeto.md` | Padrão do código | Middleware de erro centralizado trata AppError, ZodError e Prisma | CODIGO | `src/middlewares/error.middleware.ts` |
| ADR-006-COD-03 | `docs/adrs/ADR-006-reuso-dos-padroes-existentes-do-projeto.md` | Padrão do código | requireRole reaproveitado para exigir ADMIN no replay | CODIGO | `src/middlewares/auth.middleware.ts` |
| ADR-006-COD-04 | `docs/adrs/ADR-006-reuso-dos-padroes-existentes-do-projeto.md` | Restrição (código) | validate.middleware sempre responde VALIDATION_ERROR; WEBHOOK_INVALID_URL aparece em details | CODIGO | `src/middlewares/validate.middleware.ts` |
| ADR-007 | `docs/adrs/ADR-007-evento-filtrado-e-renderizado-na-insercao.md` | Decisão | Filtro de status e renderização do payload (snapshot) no momento da inserção na outbox | TRANSCRICAO | [09:52] Bruno |
| ADR-007-ALT-01 | `docs/adrs/ADR-007-evento-filtrado-e-renderizado-na-insercao.md` | Alternativa descartada (Trade-off) | Filtrar no envio: grava linhas que nunca serão enviadas | TRANSCRICAO | [09:34] Bruno |
| ADR-007-ALT-02 | `docs/adrs/ADR-007-evento-filtrado-e-renderizado-na-insercao.md` | Alternativa descartada (Trade-off) | Guardar só order_id e renderizar no envio: evento refletiria estado posterior (caso esquisito) | TRANSCRICAO | [09:52] Larissa |
| FDD-AC-01 | `docs/FDD.md` | Critério de Aceite Técnico | Transição `PROCESSING → SHIPPED` de pedido cujo customer tem endpoint ativo escutando `SHIPPED` cria exatamente 1 linha `PENDING` na outbox, na mesma transação. | TRANSCRICAO | [09:06] Diego |
| FDD-AC-02 | `docs/FDD.md` | Critério de Aceite Técnico | Se a inserção na outbox lançar erro, o status do pedido, o histórico e o estoque permanecem inalterados (teste forçando a falha). | TRANSCRICAO | [09:40] Bruno |
| FDD-AC-03 | `docs/FDD.md` | Critério de Aceite Técnico | Transição para status que nenhum endpoint escuta não cria linha na outbox. | TRANSCRICAO | [09:34] Bruno |
| FDD-AC-04 | `docs/FDD.md` | Critério de Aceite Técnico | Endpoint `active=false` não recebe eventos novos. | TRANSCRICAO | [09:21] Bruno |
| FDD-AC-05 | `docs/FDD.md` | Critério de Aceite Técnico | O payload gravado contém exatamente os campos de §6.9 e não contém `items`. | TRANSCRICAO | [09:43] Diego |
| FDD-AC-06 | `docs/FDD.md` | Critério de Aceite Técnico | Com o worker rodando, um evento pendente é enviado em ≤ 2s + tempo do POST (teste com servidor HTTP local). | TRANSCRICAO | [09:09] Diego |
| FDD-AC-07 | `docs/FDD.md` | Critério de Aceite Técnico | A requisição de saída contém `Content-Type`, `X-Event-Id`, `X-Webhook-Id`, `X-Timestamp` e `X-Signature`, e a assinatura confere com `HMAC-SHA256(secret, corpo)`. | TRANSCRICAO | [09:44] Diego |
| FDD-AC-08 | `docs/FDD.md` | Critério de Aceite Técnico | Resposta 500 do cliente agenda o próximo envio em +1 min; o 6º envio com falha move o evento para `webhook_dead_letter` com `WEBHOOK_MAX_ATTEMPTS_EXCEEDED` (teste com… | TRANSCRICAO | [09:17] Larissa |
| FDD-AC-09 | `docs/FDD.md` | Critério de Aceite Técnico | Cliente que demora > 10s gera `WEBHOOK_DELIVERY_TIMEOUT` e retry. | TRANSCRICAO | [09:42] Diego |
| FDD-AC-10 | `docs/FDD.md` | Critério de Aceite Técnico | Corpo > 64KB vai para a DLQ com `WEBHOOK_PAYLOAD_TOO_LARGE` sem nenhuma chamada HTTP. | TRANSCRICAO | [09:24] Larissa |
| FDD-AC-11 | `docs/FDD.md` | Critério de Aceite Técnico | `POST /webhooks` com URL `http://` retorna 400 e não cria registro. | TRANSCRICAO | [09:23] Sofia |
| FDD-AC-12 | `docs/FDD.md` | Critério de Aceite Técnico | A secret é retornada apenas em `POST /webhooks` e no rotate; nunca na listagem nem nos logs. | TRANSCRICAO | [09:31] Marcos |
| FDD-AC-13 | `docs/FDD.md` | Critério de Aceite Técnico | Depois da rotação, por 24h, `X-Signature` traz assinaturas válidas para a secret nova e para a anterior; após 24h, só para a nova. | TRANSCRICAO | [09:21] Sofia |
| FDD-AC-14 | `docs/FDD.md` | Critério de Aceite Técnico | Replay por OPERATOR → 403; por ADMIN → 202, evento volta a `PENDING` com o mesmo `event_id` e log `webhook_dead_letter_replayed` com `userId`. | TRANSCRICAO | [09:36] Sofia |
| FDD-AC-15 | `docs/FDD.md` | Critério de Aceite Técnico | `GET /webhooks/:id/deliveries` retorna no máximo 100 registros, do mais recente para o mais antigo. | TRANSCRICAO | [09:34] Marcos |
| FDD-AC-16 | `docs/FDD.md` | Critério de Aceite Técnico | Matando o worker com evento em `PROCESSING`, o restart reenvia o evento (mesmo `event_id`). | TRANSCRICAO | [09:24] Diego |
| FDD-AC-17 | `docs/FDD.md` | Critério de Aceite Técnico | Dois eventos do mesmo pedido criados em sequência são entregues na ordem de criação quando ambos têm sucesso na primeira tentativa. | TRANSCRICAO | [09:12] Diego |
| FDD-AC-18 | `docs/FDD.md` | Critério de Aceite Técnico | `npm test`, `npm run lint` e `tsc` passam; nenhuma dependência nova no `package.json`. | TRANSCRICAO | [09:29] Bruno |
| FDD-CONTRATO-01 | `docs/FDD.md` | Contrato público | POST /api/v1/webhooks: cadastra endpoint (customerId, url https, events); 201 com secret | TRANSCRICAO | [09:31] Marcos |
| FDD-CONTRATO-02 | `docs/FDD.md` | Contrato público | GET /api/v1/webhooks?customerId=: lista endpoints do customer, paginado, sem secret | TRANSCRICAO | [09:33] Bruno |
| FDD-CONTRATO-03 | `docs/FDD.md` | Contrato público | PATCH /api/v1/webhooks/:id: edita url, events, active | TRANSCRICAO | [09:33] Bruno |
| FDD-CONTRATO-04 | `docs/FDD.md` | Contrato público | DELETE /api/v1/webhooks/:id: remove endpoint; 204 | TRANSCRICAO | [09:33] Bruno |
| FDD-CONTRATO-05 | `docs/FDD.md` | Contrato público | POST /api/v1/webhooks/:id/secret/rotate: nova secret; anterior válida por 24h | TRANSCRICAO | [09:21] Sofia |
| FDD-CONTRATO-06 | `docs/FDD.md` | Contrato público | GET /api/v1/webhooks/:id/deliveries: últimas 100 tentativas com status, resposta, tempo e payload | TRANSCRICAO | [09:34] Marcos |
| FDD-CONTRATO-07 | `docs/FDD.md` | Contrato público | POST /api/v1/admin/webhooks/dead-letter/:id/replay: ADMIN; 202; recoloca evento como pendente | TRANSCRICAO | [09:18] Diego |
| FDD-CONTRATO-08 | `docs/FDD.md` | Contrato público | Requisição de saída: JSON order.status_changed + X-Event-Id, X-Webhook-Id, X-Timestamp, X-Signature, Content-Type | TRANSCRICAO | [09:44] Diego |
| FDD-CONTRATO-09 | `docs/FDD.md` | Contrato público | Payload: event_id, event_type, timestamp ISO 8601, order_id, order_number, from/to_status, customer_id, total_cents; sem items | TRANSCRICAO | [09:43] Diego |
| FDD-CONTRATO-10 | `docs/FDD.md` | Contrato público | Formato de erro { error: { code, message, details } } herdado do errorMiddleware | CODIGO | `src/middlewares/error.middleware.ts` |
| FDD-DADOS-01 | `docs/FDD.md` | Modelo de dados | Configuração com url + secret + customer + estado ativo. | TRANSCRICAO | [09:21] Bruno |
| FDD-DADOS-02 | `docs/FDD.md` | Modelo de dados | Índices por status e `created_at` na outbox. | TRANSCRICAO | [09:08] Diego |
| FDD-DADOS-03 | `docs/FDD.md` | Modelo de dados | DLQ em tabela separada com payload, motivo e timestamp. | TRANSCRICAO | [09:18] Diego |
| FDD-DADOS-04 | `docs/FDD.md` | Modelo de dados | `id` da outbox = `event_id`, UUID gerado na inserção (pacote `uuid` já usado em `src/middlewares/request-logger.middleware.ts`). | TRANSCRICAO | [09:25] Diego |
| FDD-DADOS-05 | `docs/FDD.md` | Modelo de dados | `payload` como texto serializado, e não coluna `JSON`: o MySQL normaliza a ordem das chaves de colunas `JSON`; texto garante corpo idêntico em todas as tentativas.… | CODIGO | `prisma/schema.prisma` |
| FDD-DADOS-06 | `docs/FDD.md` | Modelo de dados | `orderId` sem FK: `OrderService.delete` permite apagar pedidos `CANCELLED`, e o evento de cancelamento ainda pendente precisa sobreviver. | CODIGO | `src/modules/orders/order.service.ts` |
| FDD-DEP-01 | `docs/FDD.md` | Dependência / Compatibilidade | Nenhuma dependência nova: `fetch`, `AbortSignal.timeout` e `crypto` são nativos do Node ≥ 20 (`engines`); `uuid`, `zod`, `pino` e `@prisma/client` já estão no… | TRANSCRICAO | [09:29] Bruno |
| FDD-DEP-02 | `docs/FDD.md` | Dependência / Compatibilidade | MySQL e Prisma existentes: Mesmo banco e mesma `DATABASE_URL` para API e worker. | TRANSCRICAO | [09:11] Diego |
| FDD-DEP-03 | `docs/FDD.md` | Dependência / Compatibilidade | Migração: Aditiva (tabelas novas e uma relação nova em `Customer`); sem alterar colunas existentes. | CODIGO | `prisma/schema.prisma` |
| FDD-DEP-04 | `docs/FDD.md` | Dependência / Compatibilidade | Ordem de deploy: 1) migração; 2) API; 3) worker. API sem worker é seguro: os eventos aguardam na outbox. | TRANSCRICAO | [09:06] Diego |
| FDD-DEP-05 | `docs/FDD.md` | Dependência / Compatibilidade | Compatibilidade de contrato: Endpoints existentes não mudam. Única mudança visível: `PATCH /orders/:id/status` pode responder `500 WEBHOOK_ENQUEUE_FAILED` se a outbox… | TRANSCRICAO | [09:40] Bruno |
| FDD-DEP-06 | `docs/FDD.md` | Dependência / Compatibilidade | Clientes: Precisam de endpoint `https` que responda 2xx em até 10s, validar `X-Signature` e deduplicar por `X-Event-Id`. | TRANSCRICAO | [09:23] Sofia |
| FDD-DEP-07 | `docs/FDD.md` | Dependência / Compatibilidade | Revisão de segurança: 2 dias úteis com a Sofia antes do deploy (HMAC e geração de secret). | TRANSCRICAO | [09:46] Sofia |
| FDD-ERR-01 | `docs/FDD.md` | Erro previsto | `WEBHOOK_INVALID_URL` — URL malformada ou com protocolo diferente de `https:` | TRANSCRICAO | [09:23] Sofia |
| FDD-ERR-02 | `docs/FDD.md` | Erro previsto | `WEBHOOK_INVALID_EVENTS` — `events` vazio, com repetição ou com status fora dos 5 permitidos | TRANSCRICAO | [09:33] Marcos |
| FDD-ERR-03 | `docs/FDD.md` | Erro previsto | `WEBHOOK_NOT_FOUND` — `:id` inexistente | TRANSCRICAO | [09:28] Bruno |
| FDD-ERR-04 | `docs/FDD.md` | Erro previsto | `WEBHOOK_CUSTOMER_NOT_FOUND` — `customerId` inexistente | TRANSCRICAO | [09:32] Larissa |
| FDD-ERR-05 | `docs/FDD.md` | Erro previsto | `WEBHOOK_DEAD_LETTER_NOT_FOUND` — `:id` de dead letter inexistente | TRANSCRICAO | [09:18] Diego |
| FDD-ERR-06 | `docs/FDD.md` | Erro previsto | `WEBHOOK_ALREADY_REPLAYED` — dead letter com `replayedAt` preenchido | TRANSCRICAO | [09:18] Diego |
| FDD-ERR-07 | `docs/FDD.md` | Erro previsto | `WEBHOOK_ENQUEUE_FAILED` — falha ao consultar endpoints ou inserir na outbox; a transação faz rollback | TRANSCRICAO | [09:40] Bruno |
| FDD-ERR-08 | `docs/FDD.md` | Erro previsto | `WEBHOOK_DELIVERY_TIMEOUT` — sem resposta em 10s | TRANSCRICAO | [09:42] Diego |
| FDD-ERR-09 | `docs/FDD.md` | Erro previsto | `WEBHOOK_DELIVERY_HTTP_ERROR` — resposta não-2xx (inclui 3xx) | TRANSCRICAO | [09:42] Diego |
| FDD-ERR-10 | `docs/FDD.md` | Erro previsto | `WEBHOOK_DELIVERY_NETWORK_ERROR` — DNS, conexão recusada, erro TLS | TRANSCRICAO | [09:14] Larissa |
| FDD-ERR-11 | `docs/FDD.md` | Erro previsto | `WEBHOOK_MAX_ATTEMPTS_EXCEEDED` — 6º envio falhou | TRANSCRICAO | [09:15] Diego |
| FDD-ERR-12 | `docs/FDD.md` | Erro previsto | `WEBHOOK_PAYLOAD_TOO_LARGE` — corpo > 64KB | TRANSCRICAO | [09:24] Larissa |
| FDD-ERR-13 | `docs/FDD.md` | Erro previsto | `WEBHOOK_DISABLED` — endpoint inativo no momento do envio | TRANSCRICAO | [09:21] Bruno |
| FDD-ERR-14 | `docs/FDD.md` | Erro previsto | `WEBHOOK_SECRET_REQUIRED` — endpoint sem secret (invariante violada) | TRANSCRICAO | [09:28] Bruno |
| FDD-EXC-01 | `docs/FDD.md` | Exclusão de escopo | Webhooks de entrada (clientes enviando para o OMS). | TRANSCRICAO | [09:02] Marcos |
| FDD-EXC-02 | `docs/FDD.md` | Exclusão de escopo | Email ao cliente em falhas repetidas. | TRANSCRICAO | [09:37] Larissa |
| FDD-EXC-03 | `docs/FDD.md` | Exclusão de escopo | Rate limiting de saída (somente medir). | TRANSCRICAO | [09:39] Larissa |
| FDD-EXC-04 | `docs/FDD.md` | Exclusão de escopo | Dashboard/painel visual. | TRANSCRICAO | [09:40] Larissa |
| FDD-EXC-05 | `docs/FDD.md` | Exclusão de escopo | Arquivamento de eventos entregues. | TRANSCRICAO | [09:08] Diego |
| FDD-EXC-06 | `docs/FDD.md` | Exclusão de escopo | Múltiplos workers / particionamento. | TRANSCRICAO | [09:13] Diego |
| FDD-EXC-07 | `docs/FDD.md` | Exclusão de escopo | Itens do pedido no payload. | TRANSCRICAO | [09:43] Diego |
| FDD-EXC-08 | `docs/FDD.md` | Exclusão de escopo | Evento de criação de pedido (o status inicial `PENDING` nasce em `create`, fora de `changeStatus`) — P-04. | CODIGO | `src/modules/orders/order.service.ts` |
| FDD-FLUXO-17 | `docs/FDD.md` | Fluxo | `RETRY_SCHEDULE_MS = [60_000, 300_000, 1_800_000, 7_200_000, 43_200_000]` é constante de código (decisão de arquitetura, não configuração). | TRANSCRICAO | [09:17] Larissa |
| FDD-FLUXO-18 | `docs/FDD.md` | Fluxo | Em falha com `attempts <= 5`: `status=PENDING`, `nextAttemptAt = now + RETRY_SCHEDULE_MS[attempts-1]`, `lastError` preenchido. | TRANSCRICAO | [09:15] Diego |
| FDD-FLUXO-19 | `docs/FDD.md` | Fluxo | O `event_id` e o corpo serializado não mudam entre tentativas. | TRANSCRICAO | [09:25] Diego |
| FDD-FLUXO-20 | `docs/FDD.md` | Fluxo | Limitação: um evento em backoff pode ser ultrapassado por um evento posterior do mesmo pedido (RFC-OQ-05). | TRANSCRICAO | [09:13] Larissa |
| FDD-FLUXO-21 | `docs/FDD.md` | Fluxo | Falha permanente: em uma transação, `webhook_outbox.status=FAILED` e insere `webhook_dead_letter` (`outboxId`, `webhookId`, `payload`, `errorCode`, `reason`, `failedAt`). | TRANSCRICAO | [09:18] Diego |
| FDD-FLUXO-22 | `docs/FDD.md` | Fluxo | Replay: `POST /api/v1/admin/webhooks/dead-letter/:id/replay`, só ADMIN (`requireRole('ADMIN')`). | TRANSCRICAO | [09:18] Diego |
| FDD-FLUXO-23 | `docs/FDD.md` | Fluxo | Em uma transação: devolve o evento original para `PENDING`, `attempts=0`, `nextAttemptAt=now()`, mantendo o `event_id`; marca a dead letter com `replayedAt` e… | TRANSCRICAO | [09:18] Diego |
| FDD-FLUXO-24 | `docs/FDD.md` | Fluxo | Loga `webhook_dead_letter_replayed` com `userId`, `requestId`, `deadLetterId`, `eventId`, para auditoria. | TRANSCRICAO | [09:36] Sofia |
| FDD-FLUXO-25 | `docs/FDD.md` | Fluxo | Dead letter já reprocessada → 409 `WEBHOOK_ALREADY_REPLAYED`. Se o evento reprocessado esgotar as tentativas de novo, o registro de dead letter do mesmo `outboxId`… | TRANSCRICAO | [09:18] Diego |
| FDD-FLUXO-26 | `docs/FDD.md` | Fluxo | `POST /api/v1/webhooks/:id/secret/rotate` gera nova secret, move a atual para `previousSecret` e define `previousSecretExpiresAt = now + 24h`. | TRANSCRICAO | [09:21] Sofia |
| FDD-FLUXO-27 | `docs/FDD.md` | Fluxo | Enquanto `previousSecretExpiresAt > now`, o worker envia `X-Signature` com duas assinaturas: a da secret nova e a da anterior (P-08). Depois disso, só a nova. | TRANSCRICAO | [09:21] Sofia |
| FDD-FLUXO-28 | `docs/FDD.md` | Fluxo | Uma nova rotação durante o grace period descarta a anterior imediatamente (só existem duas secrets por vez) (P-08). | TRANSCRICAO | [09:21] Sofia |
| FDD-INT-01 | `docs/FDD.md` | Integração com o código | `src/modules/orders/order.service.ts`: Em `changeStatus`, depois de `tx.orderStatusHistory.create(...)` e antes do `findUnique` final, adicionar `await… | CODIGO | `src/modules/orders/order.service.ts` |
| FDD-INT-02 | `docs/FDD.md` | Integração com o código | `src/modules/orders/order.status.ts`: Fonte dos status válidos para `events`: os destinos alcançáveis no mapa `transitions` (`PAID`, `PROCESSING`, `SHIPPED`… | CODIGO | `src/modules/orders/order.status.ts` |
| FDD-INT-03 | `docs/FDD.md` | Integração com o código | `src/shared/errors/app-error.ts` e `src/shared/errors/http-errors.ts`: Novas classes de §8 estendem `AppError` (ou `ConflictError`, que aceita código), no mesmo estilo… | CODIGO | `src/shared/errors/app-error.ts` |
| FDD-INT-04 | `docs/FDD.md` | Integração com o código | `src/middlewares/error.middleware.ts`: Sem alteração: já serializa `AppError` (`statusCode`, `errorCode`, `details`), `ZodError` e Prisma `P2002`/`P2025`. | CODIGO | `src/middlewares/error.middleware.ts` |
| FDD-INT-05 | `docs/FDD.md` | Integração com o código | `src/middlewares/auth.middleware.ts`: `authenticate` em todas as rotas novas; `requireRole('ADMIN')` no replay, como já é feito em `src/modules/users/user.routes.ts`. | CODIGO | `src/middlewares/auth.middleware.ts` |
| FDD-INT-06 | `docs/FDD.md` | Integração com o código | `src/middlewares/validate.middleware.ts`: `validate({ body, params, query })` com os schemas de `src/modules/webhooks/webhook.schemas.ts` *(novo)*. Limitação herdada… | CODIGO | `src/middlewares/validate.middleware.ts` |
| FDD-INT-07 | `docs/FDD.md` | Integração com o código | `src/shared/logger/index.ts`: O mesmo `logger` é usado na API e no worker; ampliar `redactPaths` com campos de secret. | CODIGO | `src/shared/logger/index.ts` |
| FDD-INT-08 | `docs/FDD.md` | Integração com o código | `src/config/env.ts`: Acrescentar as variáveis de §7 ao `envSchema` com defaults, mantendo o `process.exit(1)` em configuração inválida. | CODIGO | `src/config/env.ts` |
| FDD-INT-09 | `docs/FDD.md` | Integração com o código | `src/config/database.ts`: O worker importa `prisma` deste módulo; por ser outro processo Node, é uma instância nova de `PrismaClient`, com a mesma `DATABASE_URL`. | CODIGO | `src/config/database.ts` |
| FDD-INT-10 | `docs/FDD.md` | Integração com o código | `src/server.ts` → `src/worker.ts` *(novo)*: `src/worker.ts` replica a estrutura de `bootstrap()` + `shutdown(signal)` de `src/server.ts`, trocando `app.listen` por… | CODIGO | `src/server.ts` |
| FDD-INT-11 | `docs/FDD.md` | Integração com o código | `src/app.ts`: Em `buildControllers`, instanciar `WebhookRepository` → `WebhookService` → `WebhookController` e `WebhookAdminController`, e incluí-los no objeto retornado. | CODIGO | `src/app.ts` |
| FDD-INT-12 | `docs/FDD.md` | Integração com o código | `src/routes/index.ts`: Estender o tipo `Controllers` e montar `router.use('/webhooks', buildWebhookRouter(...))` e `router.use('/admin', buildAdminWebhookRouter(...))`. | CODIGO | `src/routes/index.ts` |
| FDD-INT-13 | `docs/FDD.md` | Integração com o código | `src/shared/http/response.ts`: `paginated()` na listagem de endpoints. | CODIGO | `src/shared/http/response.ts` |
| FDD-INT-14 | `docs/FDD.md` | Integração com o código | `prisma/schema.prisma`: Novos modelos de §4.2 e relação `webhooks Webhook[]` em `Customer`. Migração gerada com `npm run db:migrate`. | CODIGO | `prisma/schema.prisma` |
| FDD-INT-15 | `docs/FDD.md` | Integração com o código | `package.json`: Scripts `"worker": "tsx --env-file=.env src/worker.ts"` e `"start:worker": "node --env-file=.env dist/worker.js"`, no padrão de `dev`/`start`.… | CODIGO | `package.json` |
| FDD-INT-16 | `docs/FDD.md` | Integração com o código | `tests/setup.ts` e `tests/helpers/factories.ts`: O `beforeEach` precisa limpar `webhookDelivery`, `webhookDeadLetter`, `webhookOutbox` e `webhook` antes de `customer`… | CODIGO | `tests/setup.ts` |
| FDD-OBJ-01 | `docs/FDD.md` | Objetivo técnico | Toda mudança de status que algum endpoint ativo do customer escuta gera exatamente um evento por endpoint, atomicamente com a mudança. | TRANSCRICAO | [09:06] Diego |
| FDD-OBJ-02 | `docs/FDD.md` | Objetivo técnico | Primeira tentativa de entrega em < 10s após o commit (polling de 2s + envio). | TRANSCRICAO | [09:02] Marcos |
| FDD-OBJ-03 | `docs/FDD.md` | Objetivo técnico | Nenhuma latência ou indisponibilidade de cliente afeta `changeStatus`. | TRANSCRICAO | [09:04] Bruno |
| FDD-OBJ-04 | `docs/FDD.md` | Objetivo técnico | Indisponibilidades de cliente de até ~14,6h se recuperam sem intervenção. | TRANSCRICAO | [09:17] Diego |
| FDD-OBJ-05 | `docs/FDD.md` | Objetivo técnico | Toda requisição de saída é verificável pelo cliente (HMAC-SHA256) e deduplicável (`X-Event-Id`). | TRANSCRICAO | [09:22] Sofia |
| FDD-OBJ-06 | `docs/FDD.md` | Objetivo técnico | Zero dependências novas; módulo no padrão dos existentes. | TRANSCRICAO | [09:29] Bruno |
| FDD-OBS-01 | `docs/FDD.md` | Observabilidade | `webhook_worker_started` / `webhook_worker_stopped` — `pollIntervalMs`, `batchSize`, `signal` | TRANSCRICAO | [09:11] Diego |
| FDD-OBS-02 | `docs/FDD.md` | Observabilidade | `webhook_worker_recovered_events` — `count` (PROCESSING → PENDING) | TRANSCRICAO | [09:24] Diego |
| FDD-OBS-03 | `docs/FDD.md` | Observabilidade | `webhook_delivery_succeeded` — `eventId`, `webhookId`, `orderId`, `attempt`, `httpStatus`, `durationMs`, `lagMs` | TRANSCRICAO | [09:34] Marcos |
| FDD-OBS-04 | `docs/FDD.md` | Observabilidade | `webhook_delivery_failed` — os mesmos + `errorCode`, `nextAttemptAt` | TRANSCRICAO | [09:15] Diego |
| FDD-OBS-05 | `docs/FDD.md` | Observabilidade | `webhook_event_dead_lettered` — `eventId`, `webhookId`, `errorCode`, `attempts` | TRANSCRICAO | [09:18] Diego |
| FDD-OBS-06 | `docs/FDD.md` | Observabilidade | `webhook_worker_tick` — `fetched`, `durationMs`, `pendingCount`, `oldestPendingAgeMs` | TRANSCRICAO | [09:07] Bruno |
| FDD-OBS-07 | `docs/FDD.md` | Observabilidade | `webhook_dead_letter_replayed` — `deadLetterId`, `eventId`, `userId`, `requestId` | TRANSCRICAO | [09:36] Sofia |
| FDD-OBS-08 | `docs/FDD.md` | Observabilidade | `webhook_secret_rotated` — `webhookId`, `userId`, `requestId` (nunca a secret) | TRANSCRICAO | [09:22] Diego |
| FDD-OBS-09 | `docs/FDD.md` | Observabilidade | Latência até a 1ª tentativa (p95): `lagMs` = início do envio − `createdAt` do evento, com `attempt=1` | TRANSCRICAO | [09:02] Marcos |
| FDD-OBS-10 | `docs/FDD.md` | Observabilidade | Taxa de sucesso por endpoint: `succeeded / (succeeded + failed)` por `webhookId` | TRANSCRICAO | [09:34] Marcos |
| FDD-OBS-11 | `docs/FDD.md` | Observabilidade | Eventos em DLQ por dia: contagem de `webhook_event_dead_lettered` | TRANSCRICAO | [09:18] Diego |
| FDD-OBS-12 | `docs/FDD.md` | Observabilidade | Backlog: `pendingCount`, `oldestPendingAgeMs` | TRANSCRICAO | [09:07] Bruno |
| FDD-OBS-13 | `docs/FDD.md` | Observabilidade | Tempo de resposta dos clientes (p95): `durationMs` | TRANSCRICAO | [09:42] Diego |
| FDD-OBS-14 | `docs/FDD.md` | Observabilidade | Eventos/min por endpoint: contagem por `webhookId` | TRANSCRICAO | [09:39] Larissa |
| FDD-OBS-15 | `docs/FDD.md` | Observabilidade | `eventId` é a chave ponta a ponta: está na outbox, nas entregas, na DLQ, nos logs e no header `X-Event-Id` que o cliente recebe, então o suporte rastreia a partir do que… | TRANSCRICAO | [09:25] Diego |
| FDD-OBS-16 | `docs/FDD.md` | Observabilidade | `orderId` liga o evento a `order_status_history` (quem mudou o status e quando). | CODIGO | `prisma/schema.prisma` |
| FDD-OBS-17 | `docs/FDD.md` | Observabilidade | Requisições da API mantêm o `requestId`/`X-Request-Id` do `requestLogger`, incluído nos logs de replay e rotação. | CODIGO | `src/middlewares/request-logger.middleware.ts` |
| FDD-P-01 | `docs/FDD.md` | Premissa (derivada) | "5 tentativas" = 1 envio inicial + 5 re-tentativas (soma ~14,6h). | TRANSCRICAO | [09:17] Diego |
| FDD-P-02 | `docs/FDD.md` | Premissa (derivada) | Uma linha de outbox (e um `event_id`) por par mudança de status × endpoint. | TRANSCRICAO | [09:44] Sofia |
| FDD-P-03 | `docs/FDD.md` | Premissa (derivada) | `customerId` no body do cadastro e na query da listagem (padrão de `order.schemas.ts`). | TRANSCRICAO | [09:32] Larissa |
| FDD-P-04 | `docs/FDD.md` | Premissa (derivada) | Filtro aceita só os 5 status de destino de `changeStatus`; criação de pedido não gera evento. | CODIGO | `src/modules/orders/order.status.ts` |
| FDD-P-05 | `docs/FDD.md` | Premissa (derivada) | Sucesso só com 2xx; redirects não são seguidos; qualquer outra resposta gera retry. | TRANSCRICAO | [09:42] Diego |
| FDD-P-06 | `docs/FDD.md` | Premissa (derivada) | Limite de 64KB verificado no worker, para que um payload grande nunca desfaça uma mudança de status. | TRANSCRICAO | [09:24] Larissa |
| FDD-P-07 | `docs/FDD.md` | Premissa (derivada) | Recuperação de eventos `PROCESSING` no start do worker. | TRANSCRICAO | [09:24] Diego |
| FDD-P-08 | `docs/FDD.md` | Premissa (derivada) | Durante o grace period, `X-Signature` traz duas assinaturas separadas por vírgula; nova rotação descarta a anterior. | TRANSCRICAO | [09:21] Sofia |
| FDD-P-09 | `docs/FDD.md` | Premissa (derivada) | Formato `sha256=<hex>` em `X-Signature`. | TRANSCRICAO | [09:20] Sofia |
| FDD-P-10 | `docs/FDD.md` | Premissa (derivada) | Secret de 32 bytes aleatórios (`crypto.randomBytes`), em hex, exibida só na criação e na rotação. | TRANSCRICAO | [09:31] Marcos |
| FDD-P-11 | `docs/FDD.md` | Premissa (derivada) | Replay reaproveita a linha original da outbox (mesmo `event_id`) e registra quem/quando na dead letter; nova falha atualiza o registro de dead letter. | TRANSCRICAO | [09:18] Diego |
| FDD-P-12 | `docs/FDD.md` | Premissa (derivada) | Corpo da resposta do cliente armazenado truncado em 4 KB (valor a confirmar). | TRANSCRICAO | [09:34] Marcos |
| FDD-P-13 | `docs/FDD.md` | Premissa (derivada) | `DELETE` remove em cascata eventos, entregas e dead letters do endpoint; payload armazenado como texto `MEDIUMTEXT`. | TRANSCRICAO | [09:33] Bruno |
| FDD-P-14 | `docs/FDD.md` | Premissa (derivada) | Parâmetros operacionais (intervalo, timeout, lote, limite) configuráveis por env, com os valores da reunião como padrão; lote = 10. | TRANSCRICAO | [09:08] Diego |
| FDD-P-15 | `docs/FDD.md` | Premissa (derivada) | `timestamp` do payload = momento da mudança de status; `X-Timestamp` = momento do envio. | TRANSCRICAO | [09:43] Diego |
| FDD-P-16 | `docs/FDD.md` | Premissa (derivada) | Processamento sequencial dentro do lote. | TRANSCRICAO | [09:12] Diego |
| FDD-P-17 | `docs/FDD.md` | Premissa (derivada) | Endpoint desativado entre a inserção e o envio → evento vai para a DLQ (pode ser reprocessado após reativação). | TRANSCRICAO | [09:21] Bruno |
| FDD-P-18 | `docs/FDD.md` | Premissa (derivada) | Métricas derivadas de logs e tracing por IDs de correlação; o worker não encerra em erro transitório de banco. | TRANSCRICAO | [09:29] Bruno |
| FDD-P-19 | `docs/FDD.md` | Premissa (derivada) | `PATCH` edita `url`, `events` e `active`; não edita `customerId` nem `secret`. | TRANSCRICAO | [09:33] Bruno |
| FDD-P-20 | `docs/FDD.md` | Premissa (derivada) | Caminhos e status HTTP não ditos na reunião seguem as convenções do código: rotação em `POST /webhooks/:id/secret/rotate`, `202` no replay (a entrega é assíncrona)… | TRANSCRICAO | [09:21] Sofia |
| FDD-RES-01 | `docs/FDD.md` | Resiliência | Isolamento transacional: A única dependência da API é o MySQL; nenhuma chamada HTTP na transação de status. | TRANSCRICAO | [09:04] Bruno |
| FDD-RES-02 | `docs/FDD.md` | Resiliência | Timeout: 10s por envio via `AbortSignal.timeout`. Não há timeout de conexão separado. | TRANSCRICAO | [09:42] Diego |
| FDD-RES-03 | `docs/FDD.md` | Resiliência | Retry + backoff: 1m/5m/30m/2h/12h; sem jitter (instância única, sem efeito manada entre workers). | TRANSCRICAO | [09:17] Diego |
| FDD-RES-04 | `docs/FDD.md` | Resiliência | Teto e DLQ: Depois do 6º envio, DLQ; nenhum evento fica pendente para sempre. | TRANSCRICAO | [09:15] Diego |
| FDD-RES-05 | `docs/FDD.md` | Resiliência | Fallback para cliente indisponível: Não há canal alternativo nesta fase (email adiado); o fallback é DLQ + replay manual + histórico consultável. | TRANSCRICAO | [09:37] Larissa |
| FDD-RES-06 | `docs/FDD.md` | Resiliência | Queda do worker: Eventos acumulam com segurança na outbox; no restart, `PROCESSING` → `PENDING` (FDD-FLUXO-07). | TRANSCRICAO | [09:11] Diego |
| FDD-RES-07 | `docs/FDD.md` | Resiliência | Banco indisponível no worker: O erro do ciclo é logado (`webhook_worker_tick_failed`) e o loop tenta de novo no próximo intervalo, sem encerrar o processo (P-18). | TRANSCRICAO | [09:09] Diego |
| FDD-RES-08 | `docs/FDD.md` | Resiliência | Desligamento gracioso: Em `SIGINT`/`SIGTERM`, o worker termina o evento em andamento, não inicia novo ciclo e chama `prisma.$disconnect()`, como `src/server.ts`. | CODIGO | `src/server.ts` |
| FDD-RES-09 | `docs/FDD.md` | Resiliência | Idempotência no cliente: Reenvio sempre seguro graças ao `X-Event-Id` estável. | TRANSCRICAO | [09:25] Diego |
| FDD-RISK-01 | `docs/FDD.md` | Risco | Transação de status mais lenta pela consulta de endpoints + insert (prob. Média, impacto Médio) | TRANSCRICAO | [09:04] Bruno |
| FDD-RISK-02 | `docs/FDD.md` | Risco | Outbox cresce sem limite (arquivamento fora do escopo) (prob. Alta, impacto Baixo no curto prazo) | TRANSCRICAO | [09:08] Diego |
| FDD-RISK-03 | `docs/FDD.md` | Risco | Worker sequencial bloqueado por clientes lentos (cada um pode ocupar 10s), estourando a meta de 10s para os demais (prob. Média, impacto Alto) | TRANSCRICAO | [09:42] Diego |
| FDD-RISK-04 | `docs/FDD.md` | Risco | Duplicatas mal tratadas pelo cliente (prob. Média, impacto Médio) | TRANSCRICAO | [09:26] Marcos |
| FDD-RISK-05 | `docs/FDD.md` | Risco | Vazamento de secret (cliente ou banco) (prob. Baixa, impacto Alto) | TRANSCRICAO | [09:22] Diego |
| FDD-RISK-06 | `docs/FDD.md` | Risco | Ordem quebrada sob retry (prob. Média, impacto Baixo) | TRANSCRICAO | [09:13] Larissa |
| FDD-RISK-07 | `docs/FDD.md` | Risco | Rajada de eventos para um cliente sem rate limiting (prob. Baixa, impacto Médio) | TRANSCRICAO | [09:38] Diego |
| FDD-RISK-08 | `docs/FDD.md` | Risco | Worker parado sem ninguém perceber (prob. Baixa, impacto Alto) | TRANSCRICAO | [09:11] Diego |

# Inventário da transcrição (etapa 1 do processo)

Artefato intermediário gerado antes de qualquer documento final. Cada linha da
`TRANSCRICAO.md` com conteúdo técnico ou de produto foi classificada em uma de
sete categorias. Os documentos finais (`docs/`) só podem usar o que está aqui ou
o que existe no código; o que não tiver origem vira **premissa explícita**.

Legenda de categoria:

- **DEC** — decisão fechada na reunião
- **REQ** — requisito funcional explícito
- **RNF** — requisito não funcional / restrição
- **COD** — gancho com o código existente
- **DESC** — alternativa descartada (com o motivo)
- **ADI** — adiado / fora de escopo / observar depois
- **ABERTO** — ponto levantado e não decidido (ou decidido de forma ambígua)
- **CTX** — contexto de negócio

## 1. Contexto e motivação

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:00] | Marcos | CTX | Pedido formal de 3 clientes B2B (Atlas Comercial, MaxDistribuição, Nova Cargo) para serem notificados em tempo real quando o status dos pedidos muda. |
| [09:00] | Marcos | CTX | Hoje fazem polling em `GET /orders`; integração lenta e cara para eles. |
| [09:00] | Marcos | CTX | Atlas sinalizou possível migração para concorrente se não houver entrega até o fim do trimestre. |
| [09:02] | Marcos | RNF | "Tempo real" para os clientes = qualquer coisa abaixo de 10 segundos. |
| [09:02] | Marcos | DEC | Somente saída (nós → cliente). Clientes não enviam webhooks. |
| [09:03] | Sofia | DEC | É *outbound webhook*. |
| [09:45] | Marcos | CTX | Atlas quer a feature para o fim de novembro. |

## 2. Arquitetura de entrega

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:04] | Bruno | DESC | Disparo síncrono no service de orders: transação de status já é pesada (update `orders`, insert `order_status_history`, decremento de `stock_quantity`); cliente lento travaria mudanças de status de outros pedidos. |
| [09:04] | Bruno | DESC | Síncrono também força a pergunta "dar rollback no status se o cliente estiver fora?" — inaceitável. |
| [09:06] | Diego | DEC | Padrão outbox: inserir evento em `webhook_outbox` na mesma transação SQL de `orders`/`order_status_history`; worker separado lê e dispara HTTP. Commit ⇒ evento existe; rollback ⇒ evento some. |
| [09:07] | Larissa | DESC | Redis Streams (ou similar): exigiria subir mais infraestrutura. |
| [09:07] | Diego | DESC | Redis Cluster seria overengineering para um time pequeno; outbox no MySQL existente resolve. |
| [09:08] | Diego | RNF | Índices em `status` (pendente, processando, falhou, entregue) e `created_at`; worker lê pendentes em batch pequeno. |
| [09:08] | Diego | ADI | Arquivamento de linhas entregues (~30 dias) fora do escopo desta feature. |
| [09:08] | Larissa | DEC | Decidido: outbox em MySQL. |
| [09:09] | Diego | DEC | Worker em polling a cada 2 segundos, buscando os pendentes mais antigos. |
| [09:09] | Diego | DESC | Trigger de banco / LISTEN-NOTIFY: MySQL não tem listener nativo; trigger não notifica processo externo. |
| [09:10] | Larissa | DEC | Registrado como decisão: polling de 2s; até 2s de espera aceitos. |
| [09:11] | Diego | DEC | Worker roda como processo separado da API (reinício da API não pode derrubar o worker). |
| [09:11] | Larissa | COD | Nova entry-point `src/worker.ts` (análoga a `src/server.ts`) e script `npm run worker`. |
| [09:11] | Diego | DEC | Mesmo banco, mesma stack; só não o mesmo processo. |
| [09:12] | Diego | DEC | Single-worker processa em ordem de `created_at` ⇒ ordering implícito por `order_id`. |
| [09:13] | Diego | ADI | Escalar para múltiplos workers (particionar por `order_id` ou lock pessimista) é "problema do futuro". |
| [09:13] | Larissa | RNF | Limitação conhecida: sem ordering global; só por `order_id` e enquanto single-worker. |
| [09:14] | Marcos | CTX | Clientes nunca pediram ordering global. |

## 3. Retry e DLQ

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:15] | Diego | DEC | Backoff exponencial com teto de tentativas; depois falha permanente → DLQ. |
| [09:15] | Diego | DESC | Retry indefinido: evento ficaria pendurado para sempre se o cliente sumiu. |
| [09:16] | Diego | DESC | 3 tentativas (sugestão do Bruno): cobriria só ~30 min; já houve cliente com 2h de manutenção planejada. |
| [09:17] | Diego | DEC | Progressão 1m / 5m / 30m / 2h / 12h; "quase 15 horas entre primeira falha e última tentativa". |
| [09:17] | Larissa | DEC | Decidido: 5 tentativas, backoff 1m/5m/30m/2h/12h. |
| [09:17] | — | ABERTO | Ambiguidade: "5 tentativas" + 5 intervalos medidos a partir da primeira falha ⇒ 1 envio inicial + 5 re-tentativas (6 envios HTTP). Ver premissa P-01 no FDD. |
| [09:18] | Diego | DEC | DLQ em tabela separada `webhook_dead_letter` com payload, motivo da falha e timestamp. |
| [09:17] | Larissa | DESC | Alternativa: marcar "failed" na própria outbox (preterida por leitura mais limpa da outbox). |
| [09:18] | Diego | REQ | Replay manual via `POST /admin/webhooks/dead-letter/:id/replay`; recoloca na outbox como pendente. |
| [09:36] | Sofia | REQ | Replay exige role ADMIN e deve logar quem fez (auditoria). |
| [09:36] | Larissa | COD | Reaproveitar o `requireRole` existente. |

## 4. Segurança

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:19] | Sofia | RNF | Cliente precisa validar autenticidade e integridade do payload. |
| [09:20] | Sofia | DEC | HMAC com secret compartilhada; assinatura no header `X-Signature`. |
| [09:20] | Sofia | DEC | Algoritmo SHA-256. |
| [09:21] | Sofia | DEC | Secret única por endpoint (não global). |
| [09:21] | Bruno | REQ | Tabela de configuração: url + secret + customer_id + estado ativo. |
| [09:21] | Sofia | REQ | Secret rotacionável via API; a antiga continua válida por 24h em paralelo. |
| [09:22] | Diego | CTX | Já houve cliente que vazou secret em log. |
| [09:22] | Sofia | DEC | Decidido: HMAC-SHA256 sobre o corpo do request, secret por endpoint, rotação com grace period de 24h. |
| [09:23] | Sofia | RNF | TLS obrigatório: URL só `https`; `http` recusado com erro de validação no schema Zod. |
| [09:23] | Sofia | DESC | Truncar payload grande: preferido errar. |
| [09:24] | Diego | RNF | Limite de 64KB de payload. |
| [09:24] | Larissa | RNF | 64KB com erro se ultrapassar; requisito não funcional, não ADR. |
| [09:46] | Sofia | RNF | Reservar 2 dias úteis de revisão de segurança (HMAC e geração de secret) antes do deploy. |

## 5. Semântica de entrega

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:24] | Diego | DEC | Garantia at-least-once; cliente pode receber duplicado. |
| [09:25] | Diego | DEC | `X-Event-Id` com UUID gerado quando o evento entra na outbox; cliente deduplica. |
| [09:25] | Sofia | CTX | Trade-off: joga responsabilidade para o cliente. |
| [09:25] | Diego | DESC | Exactly-once: exigiria coordenação dos dois lados, muito mais complexo. Stripe/GitHub usam at-least-once. |
| [09:26] | Marcos | REQ | Documentar a deduplicação com destaque no portal do desenvolvedor. |
| [09:26] | Larissa | DEC | Decisão: at-least-once com `X-Event-Id`. |
| [09:42] | Diego | DEC | Timeout HTTP de 10s; sem resposta ⇒ falha ⇒ retry. |
| [09:43] | Diego | DEC | Payload JSON: `event_id`, `event_type` (`order.status_changed`), `timestamp` ISO 8601, `order_id`, `order_number`, `from_status`, `to_status`, `customer_id`, campos básicos (ex. `total_cents`); sem items. |
| [09:43] | Diego | CTX | Detalhes: cliente consulta `GET /orders/:id`. |
| [09:44] | Diego | DEC | Headers: `X-Event-Id`, `X-Signature`, `X-Timestamp` (momento do envio, para detecção de replay), `Content-Type: application/json`. |
| [09:44] | Sofia | DEC | Header `X-Webhook-Id` com o id do endpoint. |
| [09:51] | Larissa | DEC | IDs em UUID, padrão do projeto. |
| [09:52] | Larissa | DEC | Payload renderizado (snapshot) na inserção na outbox. |
| [09:51] | — | DESC | Alternativa: guardar só `order_id` e renderizar no envio (gera "caso esquisito" se o pedido mudar). |

## 6. Código e padrões

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:27] | Bruno | COD | Padrão de módulo em `src/modules` (controller, service, repository, routes, schemas) ⇒ `src/modules/webhooks`. |
| [09:28] | Bruno | COD | Lógica do worker em `src/modules/webhooks/webhook.worker.ts` ou `webhook.processor.ts`. |
| [09:28] | Bruno | COD | Reusar `AppError`; seguir `InsufficientStockError`/`InvalidStatusTransitionError`; códigos `WEBHOOK_NOT_FOUND`, `WEBHOOK_INVALID_URL`, `WEBHOOK_SECRET_REQUIRED`. |
| [09:29] | Larissa | DEC | Prefixo `WEBHOOK_` para todos os códigos do módulo. |
| [09:29] | Bruno | COD | Logger Pino; nada novo. Middleware de erro já trata AppError, Zod e Prisma. |
| [09:30] | Bruno | COD | Worker com `PrismaClient` próprio (outro processo), mesma `DATABASE_URL`. |
| [09:30] | Larissa | DEC | Reuso máximo: AppError, Pino, error middleware, padrão de módulos, schemas Zod, códigos de erro. |
| [09:40] | Bruno | COD | Alteração crítica em `changeStatus` (order service): inserir na outbox na mesma transação; falha na outbox ⇒ rollback. |
| [09:41] | Bruno | COD | Função `publishWebhookEvent(tx, order, fromStatus, toStatus)` recebendo o tx. |
| [09:41] | Diego | DEC | Função pura recebendo o tx; não injetar repository inteiro no `OrderService`. |

## 7. Requisitos funcionais (bloco do PM)

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:31] | Marcos | REQ | Cadastrar webhook via `POST`: `url`; secret gerada pela plataforma e devolvida na criação; lista de status desejados. |
| [09:32] | Larissa | DEC | Endpoint autenticado normal; `customer_id` no body ou no path, **não** do JWT (JWT é de usuário operador). |
| [09:32] | — | ABERTO | Body ou path não foi fechado. Ver premissa P-03 no FDD. |
| [09:33] | Bruno | REQ | `PATCH` para editar, `DELETE` para remover, `GET` para listar os webhooks de um customer. |
| [09:33] | Marcos | REQ | Filtro de eventos = lista de status por endpoint. |
| [09:34] | Bruno | DEC | Filtro aplicado na inserção da outbox; se nenhum webhook quer o status, nada é inserido. |
| [09:34] | Marcos | REQ | Histórico de entregas: últimos 100 envios com sucesso/falha, payload, response e tempo de resposta — `GET /webhooks/:id/deliveries`. |
| [09:37] | Sofia | DEC | CRUD de configuração: qualquer role autenticada, por enquanto. |
| [09:37] | Sofia | ADI | Endurecer as permissões do CRUD "mais pra frente". |

## 8. Fora de escopo / adiado / em aberto

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:37] | Larissa | ADI | Email ao cliente quando o webhook falha repetidamente: fora desta fase; talvez próxima. |
| [09:39] | Larissa | ADI | Rate limiting de envio: fora do escopo; "observar e decidir depois" (ponto em aberto). |
| [09:40] | Larissa | ADI | Dashboard visual para o cliente: fora; projeto separado do time de frontend. |
| [09:08] | Diego | ADI | Arquivamento das linhas entregues após ~30 dias. |
| [09:13] | Diego | ADI | Múltiplos workers / particionamento por `order_id`. |

## 9. Prazo

| Timestamp | Falante | Cat. | Conteúdo |
| --- | --- | --- | --- |
| [09:46] | Larissa | CTX | Estimativa: outbox+DLQ 1 sprint; worker+retry 1 sprint; CRUD+deliveries ½; integração no order.service + testes E2E ½; HMAC/schemas/validações "mais um pouco" ⇒ 3 sprints com revisão da Sofia. |
| [09:47] | Larissa | DEC | Três sprints, revisão de segurança incluída no fim. |

## 10. Achados da leitura cruzada transcrição × código

Pontos que só aparecem quando a transcrição é confrontada com o código. Viraram
premissas ou questões em aberto nos documentos.

1. `src/middlewares/validate.middleware.ts` converte qualquer `ZodError` em
   `ValidationError` com código `VALIDATION_ERROR`. Logo, a recusa de URL `http`
   "no schema Zod" ([09:23] Sofia) **não** sai com o código `WEBHOOK_INVALID_URL`
   ([09:28] Bruno) no topo da resposta, a menos que o middleware mude — o que vai
   contra o reuso sem alteração ([09:29] Bruno). Resolução no FDD §8.
2. `NotFoundError` em `src/shared/errors/http-errors.ts` fixa o código
   `NOT_FOUND` (não aceita código customizado). `WEBHOOK_NOT_FOUND` precisa de
   uma classe própria estendendo `AppError`.
3. `changeStatus` em `src/modules/orders/order.service.ts` nunca leva um pedido
   para `PENDING` (o `PENDING` nasce em `create()`), e `src/modules/orders/order.status.ts`
   só tem transições para `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`,
   `CANCELLED`. Filtro de eventos válido = esses 5 status.
4. Se o limite de 64KB fosse checado dentro da transação de `changeStatus`, um
   payload grande faria rollback da mudança de status — exatamente o acoplamento
   que a reunião quis evitar ([09:04] Bruno). Checagem movida para o worker.
5. Retry agendado × ordering: um evento em backoff pode ser ultrapassado por um
   evento mais novo do mesmo pedido. A garantia "ordering por `order_id`"
   ([09:13] Larissa) só vale sem falhas. Registrado como questão em aberto.
6. Worker único e sequencial com timeout de 10s: poucos clientes lentos podem
   atrasar todos os outros acima da meta de 10s. Registrado como risco.
7. HMAC "sobre o corpo" ([09:22] Sofia) não cobre `X-Timestamp`; a detecção de
   replay pelo cliente ([09:44] Diego) fica fraca. Registrado como questão em aberto.
8. O logger (`src/shared/logger/index.ts`) não redige campos `secret`. Como já
   houve vazamento de secret em log ([09:22] Diego), o FDD inclui a extensão do
   `redact`.

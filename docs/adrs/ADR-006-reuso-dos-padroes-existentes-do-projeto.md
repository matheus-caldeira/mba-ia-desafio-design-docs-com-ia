# ADR-006: Reuso dos padrões existentes do projeto no módulo de webhooks

## Status

**Aceito** — "Decisão: reuso máximo do que já existe. AppError, Pino, error middleware, padrão de módulos, padrão de schemas Zod, padrão de códigos de erro." ([09:30] Larissa)

- **Data de registro:** 2026-11-09
- **ADRs relacionados:** [ADR-002](ADR-002-worker-separado-em-polling.md) (entry-point do worker), [ADR-003](ADR-003-retry-com-backoff-exponencial-e-dlq.md) (`requireRole` no replay)

## Contexto e Problema

O OMS já tem convenções consolidadas: cada domínio é um módulo em `src/modules/<domínio>` com controller, service, repository, routes e schemas ([09:27] Bruno); erros de domínio estendem `AppError` com código em SCREAMING_SNAKE_CASE ([09:28] Bruno); o logger é Pino e o middleware de erro centralizado trata `AppError`, `ZodError` e erros conhecidos do Prisma ([09:29] Bruno). A feature de webhooks é a primeira com processo assíncrono e precisava decidir se seguiria essas convenções ou introduziria novas peças.

## Direcionadores da Decisão

- Consistência para quem já mantém o código.
- Nenhuma biblioteca nova ("Não vamos botar nada novo") ([09:29] Bruno).
- Erros de webhook tratados pelo middleware existente "sem precisar mudar nada" ([09:29] Bruno).
- Controle de acesso com o mecanismo já existente ([09:36] Larissa).

## Alternativas Consideradas

1. **Estrutura própria para o subsistema de webhooks** (pasta e convenções separadas, logger/erros próprios) — opção plausível não adotada; a reunião foi unânime pelo reuso ([09:27] Bruno, [09:28] Diego, [09:30] Larissa).
2. **Injetar um repository de webhooks no `OrderService`** para enfileirar eventos — preterida ([09:41] Diego).
3. **Reuso máximo dos padrões + função de enfileiramento que recebe o client da transação** — escolhida.

## Decisão

O módulo de webhooks segue exatamente o padrão dos módulos existentes:

| Padrão existente | Onde está hoje | Reuso no módulo de webhooks |
| --- | --- | --- |
| Módulo por domínio | `src/modules/orders/` (controller, service, repository, routes, schemas) | `src/modules/webhooks/` com a mesma estrutura ([09:27] Bruno) |
| Erros de domínio | `src/shared/errors/app-error.ts`, `src/shared/errors/http-errors.ts` (`InsufficientStockError`, `InvalidStatusTransitionError`) | Classes de erro de webhook estendendo `AppError`, todas com prefixo `WEBHOOK_` ([09:28] Bruno, [09:29] Larissa) |
| Tratamento centralizado | `src/middlewares/error.middleware.ts` | Sem alteração; já serializa `AppError` ([09:29] Bruno) |
| Logger | `src/shared/logger/index.ts` (Pino) | Mesmo logger na API e no worker ([09:29] Bruno) |
| Validação | `src/middlewares/validate.middleware.ts` + schemas Zod por módulo | `webhook.schemas.ts`, incluindo a regra de URL `https` ([09:23] Sofia) |
| Autorização | `requireRole` em `src/middlewares/auth.middleware.ts` | `requireRole('ADMIN')` no replay da DLQ ([09:36] Larissa) |
| Entry-point | `src/server.ts` | `src/worker.ts` no mesmo formato ([09:11] Larissa) |
| IDs | `@id @default(uuid())` em `prisma/schema.prisma` | Todas as tabelas novas com UUID ([09:51] Larissa) |

A integração com pedidos é feita por uma **função que recebe o client da transação corrente** (`publishWebhookEvent(tx, order, fromStatus, toStatus)`), chamada por `changeStatus`. O `OrderService` não recebe um repository de webhooks injetado ([09:41] Bruno, [09:41] Diego).

## Prós e Contras das Alternativas

### Estrutura própria

- Pró: liberdade para modelar o assíncrono do zero.
- Contra: duas convenções no mesmo código; curva de aprendizado e revisão mais cara.
- Contra: tenderia a trazer bibliotecas novas, contra o direcionador de [09:29] Bruno.

### Repository injetado no `OrderService`

- Pró: estilo de injeção já usado nos construtores dos services.
- Contra: acopla o serviço de pedidos ao módulo de webhooks inteiro; a operação precisa apenas de "enfileirar na transação" ([09:41] Diego).

### Reuso + função recebendo `tx` (escolhida)

- Pró: menor superfície de mudança em `order.service.ts`.
- Pró: erros, logs e validação de webhooks saem iguais aos do resto da API.
- Contra: limitações dos componentes reaproveitados vêm junto (ex.: o `validate.middleware.ts` sempre responde `VALIDATION_ERROR`, então `WEBHOOK_INVALID_URL` aparece em `details`, não no código do topo — ver FDD §8).

## Consequências

### Positivas

- Revisão e manutenção mais baratas: o módulo novo "parece" com os demais.
- Nenhuma dependência nova no `package.json`.
- O middleware de erro passa a responder erros de webhook sem alteração.

### Negativas

- `NotFoundError` fixa o código `NOT_FOUND`; para ter `WEBHOOK_NOT_FOUND` é preciso uma classe própria derivada de `AppError` (pequena duplicação).
- O worker herda a validação de ambiente de `src/config/env.ts` (inclusive `JWT_SECRET`, que ele não usa).

### Trade-off explícito

Abre-se mão de otimizar o módulo assíncrono com ferramentas específicas em troca de consistência e custo zero de novas dependências; as poucas limitações herdadas são documentadas em vez de contornadas com mudanças nos componentes compartilhados.

## Referências

- `TRANSCRICAO.md` — [09:27] a [09:30]; [09:36]; [09:41]; [09:51]
- `src/shared/errors/http-errors.ts`
- `src/middlewares/error.middleware.ts`
- `src/middlewares/auth.middleware.ts`
- `src/modules/orders/order.service.ts`

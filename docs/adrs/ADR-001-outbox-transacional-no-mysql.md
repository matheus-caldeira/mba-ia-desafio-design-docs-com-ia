# ADR-001: Outbox transacional no MySQL para eventos de webhook

## Status

**Aceito** — decidido na reunião técnica de quinta-feira ([09:08] Larissa: "Tá decidido então: outbox em MySQL").

- **Data de registro:** 2026-11-09 (a transcrição não traz a data do calendário da reunião)
- **ADRs relacionados:** [ADR-002](ADR-002-worker-separado-em-polling.md) (consumidor da outbox), [ADR-005](ADR-005-entrega-at-least-once-com-x-event-id.md) (semântica de entrega), [ADR-007](ADR-007-evento-filtrado-e-renderizado-na-insercao.md) (o que é gravado na outbox)

## Contexto e Problema

O OMS precisa notificar clientes B2B quando o status de um pedido muda, com latência percebida abaixo de 10 segundos ([09:02] Marcos). A mudança de status acontece em uma única transação Prisma em `OrderService.changeStatus` (`src/modules/orders/order.service.ts`), que já atualiza `orders`, insere em `order_status_history` e, conforme a transição, debita ou repõe `stock_quantity` dos produtos ([09:04] Bruno).

A pergunta da reunião foi: o envio acontece sincronamente dentro dessa transação ou passa por algum mecanismo intermediário ([09:03] Larissa)? Duas exigências fecham o problema: (1) um cliente lento ou fora do ar não pode travar nem desfazer mudanças de status ([09:04] Bruno); (2) não pode existir caso de status mudar e o evento não sair ([09:40] Bruno).

## Direcionadores da Decisão

- Atomicidade entre mudança de status e registro do evento: "não tem inconsistência possível" ([09:06] Diego).
- Isolar a transação de status da disponibilidade e latência dos clientes ([09:04] Bruno).
- Time pequeno: evitar nova infraestrutura para operar ([09:07] Diego).
- Latência abaixo de 10s é suficiente; não é preciso streaming de baixíssima latência ([09:02] Marcos).

## Alternativas Consideradas

1. **Disparo HTTP síncrono dentro de `changeStatus`** — descartado ([09:04] Bruno, [09:06] Diego).
2. **Redis Streams (ou fila/broker similar)** — descartado ([09:07] Larissa, [09:07] Diego).
3. **Outbox transacional em tabela do MySQL existente** — escolhida.

## Decisão

Adotar o padrão **Transactional Outbox** no MySQL já usado pela aplicação. Quando o status de um pedido muda, uma linha de evento é inserida em uma tabela de outbox **na mesma transação** que atualiza o pedido e o histórico. Se a transação comita, o evento existe; se faz rollback, o evento desaparece junto. Uma falha ao inserir na outbox provoca rollback da mudança de status ([09:40] Bruno). A entrega HTTP fica a cargo de um consumidor assíncrono (ver ADR-002).

A tabela é indexada por estado do evento (pendente, processando, falhou, entregue) e por data de criação, e o consumidor lê pendentes em lotes pequenos ([09:08] Diego).

## Prós e Contras das Alternativas

### Disparo síncrono

- Pró: menor latência teórica; nenhuma tabela nova.
- Contra: um cliente lento segura a transação e trava mudanças de status de outros pedidos ([09:04] Bruno).
- Contra: cliente fora do ar obrigaria a escolher entre rollback do status (inaceitável) e perda do evento ([09:04] Bruno).

### Redis Streams

- Pró: modelo de fila nativo, mais reativo que polling.
- Contra: exige subir e operar mais infraestrutura ([09:07] Larissa); Redis Cluster seria overengineering para o time ([09:07] Diego).
- Contra: sem atomicidade com a transação MySQL — seria preciso outro mecanismo para não perder eventos entre o commit e a publicação.

### Outbox no MySQL

- Pró: atomicidade garantida pelo próprio banco transacional.
- Pró: zero infraestrutura nova; reaproveita Prisma e o MySQL existentes.
- Contra: a tabela cresce e precisa de arquivamento (adiado, ver Consequências).
- Contra: o consumidor precisa fazer polling (latência mínima limitada pelo intervalo).

## Consequências

### Positivas

- Nenhum evento é perdido nem fantasma: o evento é parte da mesma unidade atômica que a mudança de status.
- A disponibilidade dos clientes deixa de afetar o fluxo de pedidos.
- Nenhuma tecnologia nova entra no stack.

### Negativas

- Escrita adicional na transação de status, que já é a mais pesada do sistema.
- Crescimento contínuo da tabela de outbox. O arquivamento de linhas entregues (~30 dias) foi explicitamente deixado **fora do escopo** desta feature ([09:08] Diego).
- A entrega passa a ser assíncrona e depende de um processo consumidor saudável.

### Trade-off explícito

Troca-se latência mínima e simplicidade de "uma chamada só" por consistência forte entre estado do pedido e evento emitido, sem custo de nova infraestrutura. O time aceita operar uma tabela que cresce em troca de não operar um broker.

## Referências

- `TRANSCRICAO.md` — [09:03] a [09:08]; [09:40] a [09:41]
- `src/modules/orders/order.service.ts` — método `changeStatus` (transação `prisma.$transaction`)
- `prisma/schema.prisma` — modelos `Order` e `OrderStatusHistory`
- [FDD §5.1 — criação do evento na outbox](../FDD.md#51-fluxo-1--criação-do-evento-na-outbox-api)

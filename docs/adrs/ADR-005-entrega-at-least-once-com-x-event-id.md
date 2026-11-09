# ADR-005: Garantia de entrega at-least-once com deduplicação por `X-Event-Id`

## Status

**Aceito** — "At-least-once com X-Event-Id pra dedup do lado do cliente. Decisão." ([09:26] Larissa)

- **Data de registro:** 2026-11-09
- **ADRs relacionados:** [ADR-001](ADR-001-outbox-transacional-no-mysql.md) (onde o id nasce), [ADR-003](ADR-003-retry-com-backoff-exponencial-e-dlq.md) (reentregas), [ADR-004](ADR-004-assinatura-hmac-sha256-com-secret-por-endpoint.md) (demais headers)

## Contexto e Problema

Com outbox, worker e retry, há janelas em que um envio pode ter chegado ao cliente sem que o OMS saiba: timeout depois de o cliente ter processado, queda do worker entre o envio e a marcação de entregue, replay manual de um evento da DLQ. A reunião precisou escolher a garantia de entrega e dizer como o cliente lida com duplicatas ([09:24] Diego, [09:25] Bruno).

## Direcionadores da Decisão

- Nunca perder evento é mais importante que nunca duplicar.
- Padrão de mercado reconhecido pelos clientes (Stripe e GitHub fazem assim) ([09:25] Diego).
- Evitar coordenação entre os dois lados, que exactly-once exigiria ([09:25] Diego).
- O cliente precisa de um identificador estável para deduplicar ([09:25] Diego).

## Alternativas Consideradas

1. **Exactly-once** — descartada ([09:25] Diego).
2. **At-most-once** (enviar uma vez, sem retry) — implicitamente descartada pela decisão de retry ([ADR-003](ADR-003-retry-com-backoff-exponencial-e-dlq.md)).
3. **At-least-once com identificador de evento para deduplicação** — escolhida.

## Decisão

A entrega é **at-least-once**: o mesmo evento pode chegar mais de uma vez e o cliente precisa estar preparado ([09:24] Diego). Cada evento leva o header **`X-Event-Id`** com um **UUID gerado quando o evento entra na outbox**, único por evento e estável entre re-tentativas; o cliente deduplica por ele ([09:25] Diego). O mesmo valor aparece no campo `event_id` do payload ([09:43] Diego).

O PM documenta com destaque essa responsabilidade no portal do desenvolvedor ([09:26] Marcos).

## Prós e Contras das Alternativas

### Exactly-once

- Pró: cliente não precisa deduplicar.
- Contra: exigiria coordenação dos dois lados (confirmação/commit distribuído), muito mais complexo ([09:25] Diego).

### At-most-once

- Pró: implementação trivial.
- Contra: qualquer falha transitória perde o evento, contrariando o retry decidido.

### At-least-once + `X-Event-Id` (escolhida)

- Pró: resolve "99% dos casos" com complexidade baixa ([09:25] Diego).
- Pró: permite recuperar com tranquilidade eventos em estado incerto (reenviar é sempre seguro).
- Contra: transfere a responsabilidade de deduplicar para o cliente ([09:25] Sofia).

## Consequências

### Positivas

- Recuperação simples: qualquer evento em estado incerto pode ser reenviado.
- Modelo conhecido pelo mercado; reduz dúvidas de integração.

### Negativas

- Clientes que ignorarem o `X-Event-Id` podem processar duplicatas.
- O id precisa ser preservado em re-tentativas e no replay manual; gerar um id novo no replay quebraria a deduplicação.

### Trade-off explícito

Troca-se a conveniência do cliente (não deduplicar) por simplicidade e robustez do lado do OMS. O risco residual é mitigado com documentação no portal e um id estável por evento.

## Referências

- `TRANSCRICAO.md` — [09:24] a [09:26]; [09:43] a [09:44]
- `src/middlewares/request-logger.middleware.ts` — uso existente de `uuid` v4 para ids de correlação
- `package.json` — dependência `uuid` já presente

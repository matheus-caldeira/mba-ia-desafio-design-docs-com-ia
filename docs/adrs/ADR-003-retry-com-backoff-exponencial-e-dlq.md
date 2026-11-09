# ADR-003: Retry com backoff exponencial (1m/5m/30m/2h/12h) e DLQ em tabela separada

## Status

**Aceito** — "Decidido: 5 tentativas, backoff 1m/5m/30m/2h/12h" ([09:17] Larissa); DLQ em tabela separada e replay manual via endpoint admin ([09:18] Diego, [09:19] Larissa).

- **Data de registro:** 2026-11-09
- **ADRs relacionados:** [ADR-002](ADR-002-worker-separado-em-polling.md) (executor do retry), [ADR-005](ADR-005-entrega-at-least-once-com-x-event-id.md) (reentregas são permitidas), [ADR-006](ADR-006-reuso-dos-padroes-existentes-do-projeto.md) (`requireRole` no replay)

## Contexto e Problema

Endpoints de clientes ficam fora do ar, lentos ou em manutenção. A reunião precisou definir quantas vezes reenviar, com que espaçamento, o que fazer quando desistir e como recuperar eventos que falharam de vez ([09:14] Larissa). Um caso real orientou a discussão: um cliente já ficou duas horas indisponível em manutenção planejada ([09:16] Diego).

## Direcionadores da Decisão

- Cobrir indisponibilidades de horas, não só de minutos ([09:16] Diego).
- Não deixar evento "pendurado pra sempre" quando o cliente sumiu ([09:15] Diego).
- Uma janela de ~15h foi considerada aceitável pelo produto ([09:17] Marcos).
- Manter a outbox enxuta para leitura e preservar evidência para debug e reprocessamento ([09:18] Diego).
- Reprocessamento é ação sensível, restrita e auditável ([09:36] Sofia).

## Alternativas Consideradas

1. **Retry indefinido com backoff** — descartada ([09:15] Diego).
2. **3 tentativas** — proposta de [09:16] Bruno, descartada ([09:16] Diego).
3. **Falha permanente marcada só na própria outbox** (sem tabela de DLQ) — colocada por [09:17] Larissa, preterida ([09:18] Diego).
4. **5 re-tentativas com backoff 1m/5m/30m/2h/12h + DLQ em tabela separada + replay manual** — escolhida.

## Decisão

- **Backoff exponencial** com os intervalos **1 min, 5 min, 30 min, 2 h e 12 h**, totalizando quase 15 horas entre a primeira falha e a última tentativa ([09:17] Diego).
- Esgotadas as tentativas, o evento é considerado **falha permanente** e vai para uma **tabela separada de dead letter** com payload, motivo da falha e timestamp ([09:18] Diego).
- O reprocessamento é **manual**, por um endpoint administrativo que recoloca o evento na outbox como pendente ([09:18] Diego), restrito à role **ADMIN** e com registro em log de quem fez o replay ([09:36] Sofia, [09:36] Larissa).

**Interpretação registrada (premissa P-01 do FDD):** a reunião diz "5 tentativas" e lista 5 intervalos contados "entre primeira falha e última tentativa". A leitura consistente com a soma de ~14,6h é: 1 envio inicial + 5 re-tentativas, cada uma após um dos intervalos. Essa leitura está marcada como questão em aberto no RFC para confirmação.

## Prós e Contras das Alternativas

### Retry indefinido

- Pró: nunca desiste de um cliente que volta.
- Contra: evento fica pendurado para sempre se o cliente sumiu ([09:15] Diego); a outbox acumula lixo.

### 3 tentativas

- Pró: libera recursos mais cedo.
- Contra: cobriria ~30 minutos; uma manutenção de 2h perderia eventos ([09:16] Diego).

### Falha marcada só na outbox

- Pró: uma tabela a menos.
- Contra: mistura eventos ativos e mortos na tabela consultada a cada 2s.
- Contra: perde o registro estruturado do motivo da falha para debug.

### 5 re-tentativas + DLQ separada (escolhida)

- Pró: cobre indisponibilidades de até ~15h.
- Pró: outbox limpa; DLQ como evidência e fonte de replay.
- Contra: eventos de um cliente fora do ar por > 15h exigem intervenção manual.

## Consequências

### Positivas

- Indisponibilidades comuns (incluindo manutenções de horas) se resolvem sozinhas.
- Falhas permanentes ficam visíveis, com motivo, e podem ser reprocessadas com controle.

### Negativas

- Um evento pode chegar até ~15h depois da mudança de status, possivelmente depois de eventos mais novos do mesmo pedido (ver questão em aberto RFC-OQ-05).
- Replay é manual: não há reprocessamento automático da DLQ.
- Notificar o cliente quando o webhook falha repetidamente (email) foi deixado para a próxima fase ([09:37] Larissa); até lá, o cliente só percebe via histórico de entregas.

### Trade-off explícito

Prioriza-se cobrir indisponibilidades reais de horas (cinco re-tentativas espaçadas) sobre liberar recursos rapidamente (três), e evita-se o custo de "eventos eternos" (retry indefinido) aceitando intervenção humana depois de ~15h.

## Referências

- `TRANSCRICAO.md` — [09:14] a [09:19]; [09:35] a [09:36]; [09:48]
- `src/middlewares/auth.middleware.ts` — `requireRole`
- [FDD §5.3 — retry](../FDD.md#53-fluxo-3--retry-com-backoff) e [§5.4 — DLQ e replay](../FDD.md#54-fluxo-4--dead-letter-e-replay-manual)

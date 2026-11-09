# ADR-002: Worker em processo separado, com polling de 2 segundos e instância única

## Status

**Aceito** — "Vamos registrar isso como uma decisão. Worker em polling, 2s." ([09:10] Larissa); processo separado confirmado em [09:11] Diego.

- **Data de registro:** 2026-11-09
- **ADRs relacionados:** [ADR-001](ADR-001-outbox-transacional-no-mysql.md) (fonte dos eventos), [ADR-003](ADR-003-retry-com-backoff-exponencial-e-dlq.md) (o que o worker faz em falha), [ADR-006](ADR-006-reuso-dos-padroes-existentes-do-projeto.md) (estrutura de código)

## Contexto e Problema

Com a outbox (ADR-001), alguém precisa ler os eventos pendentes e fazer as chamadas HTTP. Três perguntas surgiram: como o consumidor descobre que há eventos novos, onde ele roda, e o que acontece com a ordem dos eventos de um mesmo pedido ([09:08] Larissa, [09:12] Larissa).

O requisito de latência é "abaixo de 10 segundos" ([09:02] Marcos). A API hoje sobe por uma única entry-point (`src/server.ts`) e o time não quer que reinícios da API derrubem o envio de notificações ([09:11] Diego).

## Direcionadores da Decisão

- Atender a meta de < 10s com folga ([09:09] Diego).
- MySQL não oferece notificação nativa para processos externos ([09:09] Diego).
- Independência de ciclo de vida entre API e worker ([09:11] Diego).
- Mesma stack e mesmo banco, sem infraestrutura nova ([09:11] Diego, [09:30] Bruno).
- Ordem de entrega por pedido sem coordenação distribuída ([09:12] Diego).

## Alternativas Consideradas

1. **Trigger de banco para notificar o worker** — descartada ([09:09] Bruno propôs; [09:09] Diego descartou).
2. **Worker embutido no processo da API** — descartada ([09:11] Diego).
3. **Processo separado com polling a cada 2s, instância única** — escolhida.

## Decisão

O worker é um **processo Node separado**, com entry-point própria (`src/worker.ts`) e script `npm run worker` ([09:11] Larissa), usando o mesmo banco e a mesma `DATABASE_URL`, mas com seu próprio `PrismaClient`, já que o client é por processo ([09:30] Bruno).

O worker faz **polling em loop a cada 2 segundos**, buscando os eventos pendentes mais antigos em lote pequeno ([09:09] Diego). No pior caso, um evento espera até 2s antes da primeira tentativa, o que foi aceito ([09:10] Larissa, [09:10] Marcos).

Roda **uma única instância** (single-worker). Processando em ordem de criação, o cliente recebe os eventos de um mesmo pedido em ordem. Isso é **limitação conhecida**: não há ordering global, apenas por `order_id`, e só enquanto houver um único worker ([09:13] Larissa).

## Prós e Contras das Alternativas

### Trigger de banco

- Pró: reação imediata à inserção.
- Contra: MySQL não tem LISTEN/NOTIFY; trigger só executa SQL e não notifica processo externo ([09:09] Diego).
- Contra: exigiria improviso (escrever arquivo, chamar endpoint), frágil ([09:09] Diego).

### Worker no processo da API

- Pró: um processo a menos para operar.
- Contra: reinício ou deploy da API interrompe o envio ([09:11] Diego).
- Contra: carga de HTTP de saída competiria com requisições da API.

### Processo separado em polling

- Pró: simples, previsível e suficiente para a meta de 10s.
- Pró: ordem por pedido sem lock distribuído.
- Contra: carga constante de consultas no banco a cada 2s, mesmo sem eventos.
- Contra: vazão limitada a um processo.

## Consequências

### Positivas

- Latência típica bem abaixo de 10s (até 2s de espera do polling + tempo de envio).
- Deploys da API não afetam entregas em andamento.
- Nenhum broker ou mecanismo de notificação novo.

### Negativas

- Ponto único de processamento: se o worker parar, os eventos acumulam (sem perda, por causa da outbox) até ele voltar.
- Vazão limitada: um cliente lento ocupa o worker por até o timeout HTTP (ver risco FDD-RISK-03).
- Escalar horizontalmente quebra a garantia de ordem; particionar por `order_id` ou usar lock pessimista foi adiado como "problema do futuro" ([09:13] Diego).

### Trade-off explícito

Aceita-se até 2s de latência extra e um teto de vazão de um processo em troca de simplicidade operacional e ordem por pedido sem coordenação. Os clientes nunca pediram ordering global ([09:14] Marcos), então a limitação não afeta o valor entregue.

## Referências

- `TRANSCRICAO.md` — [09:09] a [09:14]; [09:28]; [09:29] a [09:30]
- `src/server.ts` — modelo de entry-point (bootstrap + shutdown por SIGINT/SIGTERM)
- `src/config/database.ts` — `createPrismaClient()`
- `package.json` — scripts `dev`/`start`, base para o novo script `worker`

# ADR-004: Assinatura HMAC-SHA256 com secret por endpoint e rotação com grace period de 24h

## Status

**Aceito** — "Decidido: HMAC-SHA256 sobre o corpo do request, secret por endpoint, suporte a rotação com grace period de 24h." ([09:22] Sofia)

- **Data de registro:** 2026-11-09
- **ADRs relacionados:** [ADR-005](ADR-005-entrega-at-least-once-com-x-event-id.md) (headers de entrega), [ADR-006](ADR-006-reuso-dos-padroes-existentes-do-projeto.md) (logger e schemas)

## Contexto e Problema

Os webhooks levam dados de pedidos para fora da infraestrutura da empresa. O cliente precisa conseguir verificar que a requisição veio de fato do OMS e que ninguém alterou o payload no caminho ([09:19] Sofia). Além disso, há histórico concreto de cliente que vazou secret em log de aplicação ([09:22] Diego), então o impacto de um vazamento precisa ser contido e recuperável.

## Direcionadores da Decisão

- Autenticidade e integridade verificáveis pelo cliente ([09:19] Sofia).
- Padrão de mercado, com biblioteca disponível em qualquer stack de cliente ([09:20] Sofia).
- Vazamento de uma secret não pode comprometer outros clientes ([09:21] Sofia).
- O cliente precisa trocar a secret sem janela de indisponibilidade ([09:21] Sofia).
- Transporte cifrado obrigatório ([09:23] Sofia).

## Alternativas Consideradas

1. **Secret global da plataforma** para todos os endpoints — descartada ([09:21] Sofia: "Senão se vaza uma, vaza tudo").
2. **Rotação com troca imediata** (sem período de convivência) — preterida em favor do grace period ([09:21] Sofia).
3. **HMAC-SHA256 com secret única por endpoint e rotação com grace period de 24h** — escolhida.

## Decisão

- Cada requisição é assinada com **HMAC-SHA256 sobre o corpo do request**, e a assinatura vai no header **`X-Signature`** ([09:20] Sofia, [09:22] Sofia).
- Cada endpoint de webhook cadastrado tem **sua própria secret**, gerada pela plataforma e devolvida ao cliente na criação ([09:21] Sofia, [09:31] Marcos). A configuração guarda url, secret, customer e estado ativo ([09:21] Bruno).
- A secret é **rotacionável via API**; após a rotação, a anterior continua válida **por 24 horas em paralelo** e depois deixa de valer ([09:21] Sofia).
- **TLS obrigatório**: só URLs `https` são aceitas no cadastro; `http` é recusado com erro de validação no schema ([09:23] Sofia).
- A implementação de HMAC e de geração de secret passa por **revisão de segurança de 2 dias úteis** antes do deploy ([09:46] Sofia).

## Prós e Contras das Alternativas

### Secret global

- Pró: gestão trivial (uma secret só).
- Contra: um vazamento compromete todos os clientes ([09:21] Sofia).
- Contra: rotação afeta todos ao mesmo tempo.

### Rotação imediata

- Pró: a secret vazada morre na hora.
- Contra: o cliente precisa trocar a verificação no exato momento da rotação, senão rejeita entregas legítimas.

### Secret por endpoint + grace period de 24h (escolhida)

- Pró: raio de impacto de um vazamento limitado a um endpoint.
- Pró: o cliente migra seus sistemas sem perder entregas ([09:21] Sofia).
- Contra: durante 24h, a secret antiga (possivelmente vazada) ainda é válida.
- Contra: a plataforma precisa guardar a secret de forma recuperável para assinar (HMAC não admite guardar só hash).

## Consequências

### Positivas

- Clientes validam origem e integridade com bibliotecas padrão.
- Vazamentos são isolados por endpoint e recuperáveis via rotação.

### Negativas

- A assinatura cobre apenas o corpo: `X-Timestamp` não é assinado, então a detecção de replay pelo cliente ([09:44] Diego) fica mais fraca (questão em aberto RFC-OQ-06).
- Secrets ficam armazenadas de forma recuperável no banco; cifragem em repouso não foi discutida (questão em aberto RFC-OQ-07, para a revisão de segurança).
- Mais estado por endpoint (secret atual, secret anterior e sua expiração).

### Trade-off explícito

Aceita-se uma janela de 24h em que uma secret antiga ainda vale, em troca de rotação sem downtime para o cliente. Aceita-se mais estado por endpoint em troca de isolar o raio de impacto de vazamentos.

## Referências

- `TRANSCRICAO.md` — [09:19] a [09:23]; [09:31]; [09:44]; [09:46]
- `src/shared/logger/index.ts` — lista `redact` do Pino (extensão para campos de secret no FDD)
- [FDD §6 — contratos](../FDD.md#6-contratos-públicos) e [§6.9 — requisição de saída](../FDD.md#69-requisição-de-saída-ao-cliente)

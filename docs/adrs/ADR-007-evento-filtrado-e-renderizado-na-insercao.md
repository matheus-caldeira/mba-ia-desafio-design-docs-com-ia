# ADR-007: Evento filtrado e renderizado (snapshot) no momento da inserção na outbox

## Status

**Aceito** — filtro na inserção ([09:34] Bruno, [09:34] Diego: "Concordo"); snapshot na inserção ([09:52] Larissa, [09:52] Diego, [09:52] Bruno: "Beleza, snapshot. Decidido.").

- **Data de registro:** 2026-11-09
- **ADRs relacionados:** [ADR-001](ADR-001-outbox-transacional-no-mysql.md) (amends: define o conteúdo da linha de outbox)

## Contexto e Problema

Cada endpoint escolhe quais status de pedido quer receber ([09:33] Marcos). Duas perguntas definem o que vai para a outbox:

1. **Onde aplicar o filtro?** Na inserção (só gravar eventos que algum endpoint quer) ou no envio (gravar sempre e descartar no worker) ([09:34] Diego).
2. **O que gravar?** O payload já renderizado ou apenas a referência ao pedido, renderizando no envio ([09:51] Bruno).

Como o envio pode ocorrer até ~15h depois da mudança de status (ADR-003), o pedido pode ter mudado de novo entre a inserção e o envio.

## Direcionadores da Decisão

- O evento deve refletir o estado do pedido no momento da mudança ([09:52] Larissa).
- Evitar linhas inúteis na outbox ([09:34] Bruno).
- Payload enxuto, sem itens do pedido ([09:43] Diego, [09:44] Bruno).

## Alternativas Consideradas

1. **Filtrar no envio** — descartada ([09:34] Bruno).
2. **Gravar só `order_id` e renderizar no envio** — descartada ([09:52] Larissa: "Senão tem caso esquisito").
3. **Filtrar e renderizar o snapshot na inserção** — escolhida.

## Decisão

Dentro da transação de mudança de status, a função de enfileiramento busca os endpoints **ativos** do customer do pedido cujo filtro inclui o status de destino. Se nenhum quer o evento, **nada é inserido** ([09:34] Bruno). Para cada endpoint interessado, grava um evento com o **payload JSON já renderizado** (snapshot), com os campos definidos na reunião: `event_id`, `event_type` (`order.status_changed`), `timestamp` ISO 8601, `order_id`, `order_number`, `from_status`, `to_status`, `customer_id` e campos básicos do pedido como `total_cents`, sem itens ([09:43] Diego).

## Prós e Contras das Alternativas

### Filtrar no envio

- Pró: mudanças no filtro valeriam para eventos já enfileirados.
- Contra: grava linhas que nunca serão enviadas; mais carga no polling.

### Renderizar no envio

- Pró: payload sempre com os dados mais recentes.
- Contra: um evento `PAID` enviado depois de o pedido virar `SHIPPED` sairia com dados inconsistentes ("caso esquisito", [09:52] Larissa).
- Contra: o worker precisaria consultar pedidos, mais acoplamento.

### Filtrar e renderizar na inserção (escolhida)

- Pró: o evento é um fato imutável do momento da mudança.
- Pró: o worker só lê a outbox e envia; não depende do modelo de pedidos.
- Contra: alterar o filtro de um endpoint não afeta eventos já enfileirados.
- Contra: payload duplicado por endpoint interessado (aceitável, payload enxuto).

## Consequências

### Positivas

- Fidelidade temporal: o cliente recebe exatamente o que mudou e quando.
- Outbox contém só trabalho real.
- Worker desacoplado do domínio de pedidos.

### Negativas

- A consulta de endpoints acontece dentro da transação de status (mais uma leitura nela).
- Desativar ou editar o filtro de um endpoint não retira eventos já enfileirados; o worker precisa checar o estado ativo no envio (FDD §5.2).

### Trade-off explícito

Prefere-se fidelidade e simplicidade do worker a refletir no envio mudanças de configuração ou de pedido ocorridas depois do fato.

## Referências

- `TRANSCRICAO.md` — [09:33] a [09:34]; [09:43] a [09:44]; [09:51] a [09:52]
- `src/modules/orders/order.status.ts` — mapa de transições (define os status que podem gerar evento)
- `src/modules/orders/order.service.ts` — `changeStatus`

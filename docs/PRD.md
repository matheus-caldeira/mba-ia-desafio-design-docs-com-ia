# PRD — Sistema de Webhooks de Notificação de Pedidos

| Campo | Valor |
| --- | --- |
| **Tipo** | PRD de feature |
| **Produto** | Order Management System (OMS) |
| **Responsável de produto** | Marcos (PM) |
| **Redação** | Matheus Caldeira |
| **Status** | Aprovado em reunião; documento em revisão |
| **Data** | 2026-11-09 |
| **Documentos relacionados** | [RFC](RFC.md) · [FDD](FDD.md) · [ADRs](adrs/README.md) · [Tracker](TRACKER.md) |

> Cada item tem um ID e a fonte entre colchetes (`[hh:mm] Nome` = `TRANSCRICAO.md`). O mapeamento completo está no [Tracker](TRACKER.md).

## 1. Resumo e contexto

O OMS vai **avisar automaticamente os clientes B2B quando o status de um pedido deles mudar**, enviando uma requisição HTTPS (webhook) para um endereço cadastrado pelo cliente. Hoje esses clientes descobrem mudanças consultando a API periodicamente. A feature tem origem em um pedido formal de três clientes (Atlas Comercial, MaxDistribuição e Nova Cargo) ([09:00] Marcos) e foi desenhada na reunião técnica entre tech lead, produto, engenharia e segurança.

O OMS já controla o ciclo de vida do pedido (`PENDING → PAID → PROCESSING → SHIPPED → DELIVERED`, com `CANCELLED` como saída), mas não tem nenhum mecanismo de notificação externa.

## 2. Problema e motivação

- **Integração lenta e cara para o cliente.** Os clientes fazem polling em `GET /orders` "de tempos em tempos" ([09:00] Marcos): descobrem mudanças com atraso e pagam por chamadas que, na maior parte das vezes, não trazem novidade.
- **Risco comercial concreto.** A Atlas sinalizou que pode migrar para um concorrente se a entrega não sair até o fim do trimestre ([09:00] Marcos); depois, pediu a feature para o fim de novembro ([09:45] Marcos).
- **Expectativa clara de latência.** Para os clientes, "tempo real" é qualquer coisa abaixo de 10 segundos; o importante é não precisar atualizar manualmente ([09:02] Marcos).

## 3. Público-alvo e cenários de uso

**Público**

| Perfil | Necessidade | Fonte |
| --- | --- | --- |
| Clientes B2B integrados por API (Atlas Comercial, MaxDistribuição, Nova Cargo) | Saber em < 10s que o status de um pedido mudou | [09:00] Marcos |
| Usuários do OMS que representam o cliente (operam com JWT da plataforma) | Cadastrar e manter os endpoints do cliente | [09:32] Marcos |
| Administradores do OMS (role ADMIN) | Reprocessar entregas que falharam de vez | [09:36] Sofia |

**Cenários**

1. **Cadastro.** Um usuário que representa a Atlas cadastra `https://…` para receber só `SHIPPED` e `DELIVERED`, guarda a secret devolvida e configura a verificação de assinatura do lado da Atlas ([09:31] Marcos; [09:33] Marcos).
2. **Notificação.** Um pedido da Atlas passa de `PROCESSING` para `SHIPPED`; em poucos segundos o sistema da Atlas recebe o evento, confere a assinatura e atualiza sua tela sem consultar o OMS ([09:02] Marcos).
3. **Cliente em manutenção.** O endpoint da MaxDistribuição fica 2 horas fora do ar; os eventos são reenviados automaticamente e chegam quando ele volta ([09:16] Diego).
4. **Duplicata.** Um reenvio chega duas vezes; o cliente reconhece pelo identificador do evento e descarta a cópia ([09:25] Diego).
5. **Secret vazada.** O cliente percebe que a secret apareceu em log, pede uma nova pela API e tem 24h para trocar a configuração sem perder entregas ([09:21] Sofia; [09:22] Diego).
6. **Falha permanente.** Um endpoint ficou fora mais de ~15h; o cliente vê as falhas no histórico de entregas, corrige o problema e um ADMIN reprocessa os eventos ([09:34] Marcos; [09:18] Diego).

## 4. Objetivos e métricas de sucesso

| ID | Objetivo | Métrica | Meta | Fonte |
| --- | --- | --- | --- | --- |
| PRD-OBJ-01 | Notificar mudanças de status em "tempo real" | p95 do tempo entre a mudança de status e a primeira tentativa de entrega | **< 10 segundos** | [09:02] Marcos |
| PRD-OBJ-02 | Reter os clientes que pediram a feature | Clientes solicitantes recebendo webhooks em produção | **3 de 3** (Atlas, MaxDistribuição, Nova Cargo) até o **fim de novembro** | [09:45] Marcos |
| PRD-OBJ-03 | Não perder nenhuma notificação | Mudanças de status (escutadas por algum endpoint) sem evento registrado | **0** (100% registradas) | [09:40] Bruno |
| PRD-OBJ-04 | Tolerar indisponibilidade do cliente | Maior janela de indisponibilidade coberta por reenvio automático | **≈ 14h36min** (1m+5m+30m+2h+12h) | [09:17] Diego |
| PRD-OBJ-05 | Reduzir o polling dos clientes | Chamadas a `GET /orders` dos 3 clientes | Queda em relação à linha de base. **A meta numérica não foi definida na reunião**; medir a linha de base antes do lançamento | [09:00] Marcos |
| PRD-OBJ-06 | Entregar no prazo combinado | Sprints até a entrega, com revisão de segurança | **3 sprints** | [09:47] Larissa |

## 5. Escopo

### 5.1 Incluso

- Cadastro, listagem, edição e remoção de endpoints de webhook por customer, via API ([09:31] Marcos; [09:33] Bruno).
- Filtro de quais status cada endpoint quer receber ([09:33] Marcos).
- Envio automático do evento `order.status_changed` a cada mudança de status filtrada ([09:43] Diego).
- Assinatura das requisições, secret por endpoint e rotação de secret ([09:22] Sofia).
- Reenvio automático com espaçamento crescente e fila de falhas permanentes ([09:17] Larissa; [09:18] Diego).
- Histórico das últimas 100 entregas por endpoint ([09:34] Marcos).
- Reprocessamento manual de falhas permanentes por ADMIN ([09:36] Sofia).
- Documentação de integração no portal do desenvolvedor, com destaque para deduplicação ([09:26] Marcos; [09:40] Marcos).

### 5.2 Fora de escopo

| ID | Item | Situação | Fonte |
| --- | --- | --- | --- |
| PRD-OOS-01 | **Email ao cliente quando o webhook falha repetidamente** | Adiado para a próxima fase, após medir impacto | [09:37] Larissa |
| PRD-OOS-02 | **Dashboard/painel visual** para o cliente ver seus webhooks | Descartado nesta feature; projeto separado do time de frontend | [09:40] Larissa |
| PRD-OOS-03 | **Rate limiting de envio** por cliente | Fora do escopo; observar e decidir depois | [09:39] Larissa |
| PRD-OOS-04 | Webhooks de entrada (cliente enviando para o OMS) | Descartado: clientes só querem receber | [09:02] Marcos |
| PRD-OOS-05 | Arquivamento de eventos já entregues (~30 dias) | Fora do escopo desta feature | [09:08] Diego |
| PRD-OOS-06 | Garantia de ordem global entre pedidos e múltiplos workers | Adiado ("problema do futuro"); clientes não pediram | [09:13] Diego |
| PRD-OOS-07 | Entrega exactly-once | Descartado pela complexidade | [09:25] Diego |
| PRD-OOS-08 | Itens do pedido no evento | Descartado para manter o payload enxuto; detalhes via `GET /orders/:id` | [09:43] Diego |

## 6. Requisitos funcionais

| ID | Requisito | Fonte |
| --- | --- | --- |
| PRD-FR-01 | O usuário autenticado deve cadastrar um endpoint informando o customer, a URL e a lista de status desejados; o customer é informado explicitamente na requisição, não deduzido do login. | [09:31] Marcos; [09:32] Larissa |
| PRD-FR-02 | A plataforma deve gerar a secret do endpoint e devolvê-la na resposta do cadastro. | [09:31] Marcos |
| PRD-FR-03 | O usuário deve listar os endpoints de um customer. | [09:33] Bruno |
| PRD-FR-04 | O usuário deve editar um endpoint (URL, status desejados, ativo/inativo). | [09:33] Bruno; [09:21] Bruno |
| PRD-FR-05 | O usuário deve remover um endpoint. | [09:33] Bruno |
| PRD-FR-06 | Cada endpoint deve receber apenas os status que escolheu; se nenhum endpoint do customer quer aquele status, nada é gerado. | [09:33] Marcos; [09:34] Bruno |
| PRD-FR-07 | A cada mudança de status de um pedido, o sistema deve enviar aos endpoints interessados um evento com identificador do evento, tipo, data/hora, pedido (id e número), customer, status anterior, status novo e valor total, sem itens. | [09:43] Diego |
| PRD-FR-08 | Cada envio deve ser assinado para que o cliente valide origem e integridade. | [09:19] Sofia; [09:20] Sofia |
| PRD-FR-09 | O cliente deve poder pedir uma nova secret pela API; a anterior continua válida por 24h. | [09:21] Sofia |
| PRD-FR-10 | Cada envio deve trazer um identificador único e estável do evento, para o cliente descartar duplicatas, e o identificador do endpoint, para clientes com vários cadastros. | [09:25] Diego; [09:44] Sofia |
| PRD-FR-11 | Envios que falharem devem ser repetidos automaticamente em 1 min, 5 min, 30 min, 2 h e 12 h; depois disso, o evento vai para a fila de falhas permanentes. | [09:17] Larissa; [09:18] Diego |
| PRD-FR-12 | O usuário deve consultar o histórico das últimas 100 entregas de um endpoint, com sucesso/falha, conteúdo enviado, resposta e tempo de resposta. | [09:34] Marcos |
| PRD-FR-13 | Um ADMIN deve poder reprocessar um evento da fila de falhas permanentes; a ação é registrada com quem a executou. | [09:36] Sofia |

## 7. Requisitos não funcionais

| ID | Requisito | Fonte |
| --- | --- | --- |
| PRD-NFR-01 | **Latência:** primeira tentativa em menos de 10s; os eventos novos são procurados a cada 2s (até 2s de espera aceitos). | [09:02] Marcos; [09:10] Larissa |
| PRD-NFR-02 | **Isolamento:** lentidão ou queda de cliente nunca bloqueia nem desfaz mudanças de status. | [09:04] Bruno |
| PRD-NFR-03 | **Consistência:** se o status mudou, o evento existe; se a mudança falhou, o evento não existe. | [09:06] Diego |
| PRD-NFR-04 | **Garantia de entrega:** pelo menos uma vez (duplicatas possíveis e identificáveis). | [09:24] Diego |
| PRD-NFR-05 | **Ordem:** eventos de um mesmo pedido saem na ordem em que ocorreram enquanto houver um único processador; não há ordem global. | [09:13] Larissa |
| PRD-NFR-06 | **Segurança de transporte:** só endereços `https`; `http` é recusado no cadastro. | [09:23] Sofia |
| PRD-NFR-07 | **Segurança de assinatura:** HMAC-SHA256, secret única por endpoint. | [09:22] Sofia |
| PRD-NFR-08 | **Tamanho:** eventos acima de 64KB não são enviados (erro, nunca truncamento). | [09:24] Larissa |
| PRD-NFR-09 | **Timeout:** cliente que não responde em 10s conta como falha e entra em reenvio. | [09:42] Diego |
| PRD-NFR-10 | **Operação:** o envio roda em processo separado da API, no mesmo banco e na mesma stack, sem infraestrutura nova. | [09:11] Diego; [09:07] Diego |
| PRD-NFR-11 | **Padrões:** módulo no mesmo padrão dos existentes, com códigos de erro prefixados `WEBHOOK_`. | [09:30] Larissa; [09:29] Larissa |
| PRD-NFR-12 | **Revisão de segurança:** 2 dias úteis de revisão do código de HMAC e de geração de secret antes do deploy. | [09:46] Sofia |

## 8. Decisões e trade-offs principais

| Decisão | Trade-off aceito | ADR |
| --- | --- | --- |
| Envio assíncrono via outbox no banco, e não na hora da mudança | Alguns segundos de atraso em troca de nunca travar ou desfazer mudanças de status | [ADR-001](adrs/ADR-001-outbox-transacional-no-mysql.md) |
| Processo separado lendo a cada 2s | Até 2s de espera; processamento limitado a uma instância | [ADR-002](adrs/ADR-002-worker-separado-em-polling.md) |
| 5 reenvios em ~15h e depois fila de falhas | Falhas acima de ~15h exigem ação manual | [ADR-003](adrs/ADR-003-retry-com-backoff-exponencial-e-dlq.md) |
| Secret por endpoint com 24h de convivência na rotação | Secret antiga ainda vale por 24h | [ADR-004](adrs/ADR-004-assinatura-hmac-sha256-com-secret-por-endpoint.md) |
| Pelo menos uma vez, com identificador do evento | O cliente precisa descartar duplicatas | [ADR-005](adrs/ADR-005-entrega-at-least-once-com-x-event-id.md) |
| Reuso dos padrões do código | Herdam-se limitações dos componentes existentes | [ADR-006](adrs/ADR-006-reuso-dos-padroes-existentes-do-projeto.md) |
| Evento "fotografado" no momento da mudança | Mudança de filtro não afeta eventos já gerados | [ADR-007](adrs/ADR-007-evento-filtrado-e-renderizado-na-insercao.md) |

## 9. Dependências

| ID | Dependência | Fonte |
| --- | --- | --- |
| PRD-DEP-01 | Fluxo atual de mudança de status do OMS (`PATCH /orders/:id/status`), onde o evento nasce. | [09:40] Bruno |
| PRD-DEP-02 | Banco MySQL e stack Node/Prisma existentes, usados também pelo novo processo. | [09:11] Diego |
| PRD-DEP-03 | Autenticação JWT e papéis `ADMIN`/`OPERATOR` existentes. | [09:32] Marcos; [09:36] Larissa |
| PRD-DEP-04 | Revisão de segurança da Sofia antes do deploy. | [09:46] Sofia |
| PRD-DEP-05 | Portal do desenvolvedor atualizado pelo PM (integração, assinatura e deduplicação). | [09:26] Marcos |
| PRD-DEP-06 | Clientes com endpoint HTTPS que responda em até 10s e implemente a verificação. | [09:23] Sofia; [09:42] Diego |

## 10. Riscos e mitigação

| ID | Risco | Probabilidade | Impacto | Mitigação | Fonte |
| --- | --- | --- | --- | --- | --- |
| PRD-RISK-01 | Atraso na entrega leva a Atlas a migrar para o concorrente | Média | Alto | Escopo enxuto (email, painel e rate limit fora); plano de 3 sprints; confirmação do prazo com a Atlas pelo PM | [09:00] Marcos; [09:47] Marcos |
| PRD-RISK-02 | Clientes não tratam duplicatas e processam o mesmo evento duas vezes | Média | Médio | Identificador estável por evento; seção destacada no portal | [09:25] Sofia; [09:26] Marcos |
| PRD-RISK-03 | Cliente vaza a secret em log | Baixa | Alto | Secret por endpoint limita o impacto; rotação self-service com 24h | [09:22] Diego |
| PRD-RISK-04 | Cliente fora do ar por mais de ~15h perde eventos para a fila de falhas | Baixa | Médio | Histórico de entregas visível ao cliente; reprocessamento por ADMIN; email na próxima fase | [09:17] Marcos; [09:37] Larissa |
| PRD-RISK-05 | Rajadas de eventos sobrecarregam endpoints de clientes (sem rate limiting) | Baixa | Médio | Medir volume por endpoint e decidir com dados | [09:38] Diego |
| PRD-RISK-06 | Clientes lentos atrasam a entrega para os demais (um único processador) | Média | Alto | Timeout de 10s; monitorar a latência p95 da meta PRD-OBJ-01 | [09:42] Diego |
| PRD-RISK-07 | Revisão de segurança não reservada no cronograma | Baixa | Médio | Reservar os 2 dias úteis dentro das 3 sprints | [09:49] Sofia |

## 11. Critérios de aceitação

| ID | Critério | Fonte |
| --- | --- | --- |
| PRD-AC-01 | Um endpoint cadastrado para `SHIPPED` recebe o evento em menos de 10s quando um pedido do seu customer muda para `SHIPPED`. | [09:02] Marcos |
| PRD-AC-02 | O mesmo endpoint não recebe nada quando o pedido muda para um status fora do seu filtro. | [09:33] Marcos |
| PRD-AC-03 | Cadastro com URL `http://` é recusado com erro de validação. | [09:23] Sofia |
| PRD-AC-04 | A secret aparece só no cadastro e na rotação; o cliente consegue validar a assinatura de cada envio com ela. | [09:31] Marcos; [09:22] Sofia |
| PRD-AC-05 | Após rotação, envios das próximas 24h validam tanto com a secret nova quanto com a antiga; depois disso, só com a nova (mecanismo proposto no FDD, premissa P-08). | [09:21] Sofia |
| PRD-AC-06 | Com o endpoint fora do ar, o evento é reenviado em 1m, 5m, 30m, 2h e 12h e, persistindo a falha, aparece na fila de falhas permanentes. | [09:17] Larissa |
| PRD-AC-07 | Um ADMIN consegue reprocessar um evento da fila; um OPERATOR recebe acesso negado. | [09:36] Sofia |
| PRD-AC-08 | O histórico de um endpoint mostra até 100 entregas com resultado, conteúdo, resposta e tempo. | [09:34] Marcos |
| PRD-AC-09 | Uma mudança de status que falha não gera evento; uma que é concluída sempre gera evento para os endpoints interessados. | [09:06] Diego |
| PRD-AC-10 | A documentação do portal explica assinatura, headers e deduplicação. | [09:26] Marcos |
| PRD-AC-11 | A revisão de segurança foi concluída antes do deploy. | [09:46] Sofia |

## 12. Estratégia de testes e validação

| Camada | O que validar | Como | Fonte |
| --- | --- | --- | --- |
| Testes de integração da API | CRUD, validação de `https`, filtro de status, permissões ADMIN, histórico | Vitest + supertest contra MySQL real, no padrão de `tests/orders.test.ts` | [09:46] Larissa |
| Atomicidade | Mudança de status e evento sempre juntos (inclusive com falha forçada na gravação do evento) | Teste de integração em `PATCH /orders/:id/status` | [09:40] Bruno |
| Worker | Envio, headers, assinatura, timeout de 10s, sequência de reenvio, fila de falhas, limite de 64KB | Servidor HTTP local simulando cliente (sucesso, erro, lentidão) e relógio controlado | [09:17] Larissa; [09:42] Diego |
| Ponta a ponta | Do `PATCH` de status até o recebimento assinado no endpoint simulado | Teste E2E com API e worker rodando, previsto na estimativa ("testes ponta a ponta") | [09:46] Larissa |
| Segurança | Geração de secret, HMAC, rotação, ausência de secret em logs | Revisão de código de 2 dias úteis pela Sofia | [09:46] Sofia |
| Métricas pós-lançamento | p95 < 10s, falhas e fila de falhas por cliente | Logs estruturados do worker (ver [FDD §10](FDD.md#10-observabilidade)) | [09:02] Marcos |
| Validação com clientes | Os 3 clientes integrados e recebendo eventos | Acompanhamento do PM com os clientes | [09:49] Marcos |

## 13. Cronograma de referência

Estimativa da tech lead, com revisão de segurança incluída no fim ([09:46] Larissa; [09:47] Larissa):

| Bloco | Esforço |
| --- | --- |
| Modelagem de outbox e DLQ | 1 sprint |
| Worker e retry | 1 sprint |
| CRUD de configuração e histórico de entregas | ½ sprint |
| Integração no serviço de pedidos e testes ponta a ponta | ½ sprint |
| HMAC, schemas, validações e revisão de segurança | restante, dentro das 3 sprints |

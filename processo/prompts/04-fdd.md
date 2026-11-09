# Prompt 04 — FDD (template como contrato de completude)

Técnica do curso (aula "Prompt para FDD"): usar o esqueleto de saída como contrato
e alimentar a IA com os artefatos já fixados (ADRs, RFC) + a codebase.

```text
Escreva docs/FDD.md para que um desenvolvedor comece a codar sem perguntar nada.
Insumos: ADRs, RFC, inventário e o CÓDIGO (leia order.service.ts, order.status.ts,
shared/errors/*, middlewares/*, config/*, server.ts, app.ts, routes/index.ts,
prisma/schema.prisma, package.json, tests/setup.ts).

Esqueleto obrigatório:
 1 Contexto e motivação técnica   2 Objetivos técnicos   3 Escopo e exclusões
 4 Desenho (componentes + modelo Prisma)
 5 Fluxos detalhados: outbox · worker · retry · DLQ/replay · rotação de secret
 6 Contratos públicos: cada endpoint com request, response de exemplo e status codes;
   + a requisição de saída (payload, headers, assinatura)
 7 Configuração   8 Matriz de erros (códigos WEBHOOK_*)   9 Resiliência
 10 Observabilidade (logs, métricas, tracing)   11 Integração com o sistema existente
 12 Dependências e compatibilidade   13 Critérios de aceite técnicos
 14 Riscos (prob./impacto/mitigação)   15 Premissas

Regras:
- Todo item verificável fica numa linha de tabela com ID (FDD-FLUXO-07,
  FDD-ERR-03...) e uma coluna Fonte: [hh:mm] Nome ou caminho de arquivo.
- Qualquer escolha que a reunião não fez vira premissa P-NN na §15, com a fala ou
  arquivo de onde foi derivada. Nunca apresente premissa como decisão.
- Reuse o que existe: antes de propor uma classe/middleware, verifique se o código
  já tem algo equivalente e se o comportamento real dele atende (ex.: que código de
  erro o validate.middleware devolve de fato?).
- §11 cita apenas arquivos que existem; arquivos novos são marcados "(novo)".
- Nenhuma dependência nova: confira o package.json antes de citar biblioteca.
- Itens descartados na reunião não podem aparecer como requisito.
```

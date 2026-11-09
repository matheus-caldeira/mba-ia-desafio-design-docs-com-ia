# Prompt 02 — ADRs (um por decisão)

**Base:** agente `adr-generator` do plugin `adrs-management` do professor
(github.com/devfullcycle/claude-mkt-place), adaptado: a entrada deixa de ser uma
"potential ADR" extraída do código e passa a ser o inventário da transcrição; o
marcador `[NEEDS INPUT]` vira "premissa / questão em aberto" com fonte.

```text
Gere um ADR em formato MADR (pt-BR) para a decisão: <NOME DA DECISÃO>.
Fontes permitidas: as linhas do inventário com categoria DEC/DESC/COD ligadas a
essa decisão, e os arquivos de código citados. Nada além disso.

Estrutura (nesta ordem, sem seções extras):
  # ADR-NNN: <título>
  ## Status            (Aceito + citação literal da fala que fechou a decisão)
  ## Contexto e Problema       (2-3 parágrafos; cite [hh:mm] Nome)
  ## Direcionadores da Decisão (4-6 bullets, cada um com fonte)
  ## Alternativas Consideradas (máx. 3, só as discutidas na reunião ou
                                claramente implícitas; diga quem propôs e quem descartou)
  ## Decisão
  ## Prós e Contras das Alternativas (3-4 bullets por opção)
  ## Consequências  ### Positivas  ### Negativas  ### Trade-off explícito
  ## Referências    (máx. 5: trechos da transcrição e caminhos de arquivo reais)

Regras:
- Fale em nível de decisão: sem blocos de código, sem nomes de colunas, sem endpoints
  (isso é FDD). Caminhos de arquivo só como referência.
- Se a reunião deixou algo ambíguo, NÃO escolha em silêncio: escreva
  "Interpretação registrada (premissa P-NN)" e aponte a questão em aberto do RFC.
- Consequências negativas são obrigatórias e precisam ser reais (ex.: o que foi
  explicitamente deixado fora do escopo e passa a ser um custo).
- Não invente data: a transcrição não tem data de calendário.
```

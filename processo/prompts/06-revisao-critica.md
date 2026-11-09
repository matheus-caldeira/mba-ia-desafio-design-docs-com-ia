# Prompt 06 — Revisão crítica ("advogado do diabo") e tracker

```text
Revise o pacote (PRD, RFC, FDD, ADRs) como revisor cético. Para cada documento:
1. Liste toda afirmação sem fonte ([hh:mm] Nome ou arquivo). Para cada uma:
   achar a fonte, rebaixar a premissa, ou remover.
2. Procure contradições: entre documentos (mesmo número dito de dois jeitos),
   com a transcrição (algo descartado aparecendo como requisito) e com o código
   (arquivo/método citado que não existe ou não se comporta como descrito).
3. Procure duplicação de altura: detalhe de implementação no RFC/PRD, ou decisão
   sem ADR.
4. Procure promessas falsas (ex.: "no máximo X" quando há backlog ou retry).
Depois gere o tracker com processo/scripts/gerar-tracker.mjs e rode
processo/scripts/verificar-entrega.mjs; trate cada FAIL como bug do documento,
não do script — salvo prova em contrário.
```

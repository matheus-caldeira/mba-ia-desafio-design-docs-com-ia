# Prompt 05 — PRD de feature (consolidação)

Base: prompt de entrevista para PRD do curso (aula "Prompt para geração de PRD"),
no modo "reaproveitar documentação existente": em vez de entrevistar, a IA
preenche o template com RFC/ADRs/FDD e só pergunta (ou marca) o que faltar.

```text
Gere docs/PRD.md (PRD de feature, pt-BR) consolidando RFC, ADRs e FDD em
linguagem de produto. Seções: Resumo e contexto · Problema e motivação ·
Público-alvo e cenários de uso · Objetivos e métricas de sucesso · Escopo
(incluso / fora de escopo) · Requisitos funcionais · Requisitos não funcionais ·
Decisões e trade-offs · Dependências · Riscos e mitigação · Critérios de aceitação ·
Estratégia de testes e validação.

Regras:
- PRD responde "por que e o quê". Não repita endpoints, tabelas, headers ou
  códigos de erro: aponte para o FDD.
- Requisitos funcionais numerados (PRD-FR-NN), cada um com [hh:mm] Nome.
- Métricas: só use metas numéricas que a reunião deu. Se a meta não foi dada,
  escreva que não foi definida e proponha medir a linha de base. NÃO invente
  "redução de 80%".
- Fora de escopo: liste tudo que foi descartado/adiado, com a fala de origem.
- Riscos com probabilidade, impacto e mitigação.
```

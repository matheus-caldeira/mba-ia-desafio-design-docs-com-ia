# Prompt 01 — Inventário dirigido da transcrição

**Objetivo:** separar o que entra do que não entra antes de escrever qualquer documento.
**Entrada:** `TRANSCRICAO.md` + leitura do código (`src/`, `prisma/schema.prisma`, `package.json`).
**Saída:** `processo/inventario-transcricao.md`.

```text
Você é um analista técnico. Leia TRANSCRICAO.md inteira e classifique CADA fala
com conteúdo técnico ou de produto em exatamente uma categoria:

  DEC    decisão fechada (alguém declara "decidido", "anotado", "concordo" e ninguém contesta)
  REQ    requisito funcional explícito
  RNF    requisito não funcional / restrição (números: latência, tamanho, timeout...)
  COD    menção a arquivo, classe, função ou padrão do código existente
  DESC   alternativa descartada — registre o MOTIVO do descarte
  ADI    adiado / fora de escopo / "observar depois"
  ABERTO levantado e não decidido, OU decidido de forma ambígua
  CTX    contexto de negócio

Regras:
1. Uma linha por fala: | Timestamp | Falante | Categoria | Conteúdo |. Use o
   timestamp e o nome EXATOS da transcrição ("[09:17] Diego").
2. Não resuma decisões com palavras suas que mudem o sentido. Números sempre literais.
3. Algo descartado ou adiado NUNCA pode virar REQ. Se houver dúvida entre ADI e REQ, é ADI.
4. Procure ambiguidades numéricas (ex.: contagens que não batem com as somas ditas)
   e marque como ABERTO, explicando a ambiguidade.
5. Depois, confronte cada COD com o código real: o arquivo/classe/função existe?
   O comportamento citado bate com o código? Liste os conflitos numa seção
   "Achados da leitura cruzada transcrição × código".
6. Não proponha soluções nesta etapa. Só classifique.
```

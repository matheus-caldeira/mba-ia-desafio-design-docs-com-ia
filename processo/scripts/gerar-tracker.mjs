#!/usr/bin/env node
// Gera docs/TRACKER.md a partir dos IDs declarados nos documentos.
//
// Regra: todo item rastreável nos documentos está numa linha de tabela que
// começa com um ID (PRD-FR-01, RFC-ALT-02, FDD-ERR-03, P-04...) e cita a fonte
// na própria linha: "[hh:mm] Nome" (transcrição) ou um caminho de arquivo
// (código). Itens fora de tabela (ADRs e contratos) estão listados em MANUAL.
//
// Uso: node processo/scripts/gerar-tracker.mjs   (a partir da raiz do repo)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const DOCS = [
  { file: 'docs/PRD.md', prefix: 'PRD-' },
  { file: 'docs/RFC.md', prefix: 'RFC-' },
  { file: 'docs/FDD.md', prefix: 'FDD-|P-' },
];

const TIPOS = [
  ['PRD-OBJ', 'Objetivo / Métrica'],
  ['PRD-OOS', 'Fora de escopo'],
  ['PRD-FR', 'Requisito Funcional'],
  ['PRD-NFR', 'Requisito Não Funcional'],
  ['PRD-DEP', 'Dependência'],
  ['PRD-RISK', 'Risco'],
  ['PRD-AC', 'Critério de Aceitação'],
  ['RFC-ALT', 'Alternativa descartada (Trade-off)'],
  ['RFC-OQ', 'Questão em aberto'],
  ['FDD-OBJ', 'Objetivo técnico'],
  ['FDD-EXC', 'Exclusão de escopo'],
  ['FDD-DADOS', 'Modelo de dados'],
  ['FDD-FLUXO', 'Fluxo'],
  ['FDD-CONTRATO', 'Contrato público'],
  ['FDD-ERR', 'Erro previsto'],
  ['FDD-RES', 'Resiliência'],
  ['FDD-OBS', 'Observabilidade'],
  ['FDD-INT', 'Integração com o código'],
  ['FDD-DEP', 'Dependência / Compatibilidade'],
  ['FDD-AC', 'Critério de Aceite Técnico'],
  ['FDD-RISK', 'Risco'],
  ['FDD-P', 'Premissa (derivada)'],
];

const TS = /\[(\d{2}:\d{2})\] ([A-ZÀ-Ú][a-zà-ú]+)/;
const CODE = /`((?:src|prisma|tests)\/[\w./-]+\.(?:ts|prisma)|package\.json|docker-compose\.yml|tsconfig\.build\.json)`/;

function clean(s) {
  return s
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function resumir(s, max = 170) {
  const t = clean(s);
  if (t.length <= max) return t;
  const cut = t.slice(0, max);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:(—-]+$/, '') + '…';
}

function tipoDe(id) {
  const found = TIPOS.find(([p]) => id.startsWith(p + '-'));
  return found ? found[1] : 'Outro';
}

function fonteDe(cells, { preferCode = false, fonteIdx = -1 } = {}) {
  const row = cells.join(' | ');
  // Usa a coluna "Fonte" do cabeçalho da tabela; na falta dela, a última coluna.
  const last = fonteIdx >= 0 && cells[fonteIdx] !== undefined ? cells[fonteIdx] : cells[cells.length - 1];
  const code = row.match(CODE);
  if (preferCode && code) return ['CODIGO', code[1]];
  const tsLast = last.match(TS);
  if (tsLast) return ['TRANSCRICAO', `[${tsLast[1]}] ${tsLast[2]}`];
  const codeLast = last.match(CODE);
  if (codeLast) return ['CODIGO', codeLast[1]];
  const ts = row.match(TS);
  if (ts) return ['TRANSCRICAO', `[${ts[1]}] ${ts[2]}`];
  if (code) return ['CODIGO', code[1]];
  return [null, null];
}

// Qual célula resume o item, por prefixo (índice após remover a coluna do ID).
function resumoDe(id, cells) {
  if (id.startsWith('FDD-ERR')) {
    // código | http? | ... | condição | ...
    const code = cells[0];
    const cond = cells.length >= 5 ? cells[3] : cells[1];
    return `${code} — ${cond}`;
  }
  if (id.startsWith('PRD-OBJ')) return `${cells[0]}: ${cells[1]} — meta ${cells[2]}`;
  if (id.startsWith('PRD-RISK') || id.startsWith('FDD-RISK'))
    return `${cells[0]} (prob. ${cells[1]}, impacto ${cells[2]})`;
  if (id.startsWith('FDD-INT')) return `${cells[0]}: ${cells[1]}`;
  if (id.startsWith('FDD-OBS') && cells.length >= 5) return `${cells[0]} — ${cells[2]}`;
  if (id.startsWith('RFC-ALT')) return `${cells[0]} — ${cells[1]}`;
  // Resumos muito curtos (ex.: "Timeout") ganham a célula seguinte como complemento.
  if (clean(cells[0]).length < 40 && cells[1] && !TS.test(cells[1])) return `${cells[0]}: ${cells[1]}`;
  return cells[0];
}

const rows = [];
const semFonte = [];

for (const { file, prefix } of DOCS) {
  const lines = readFileSync(file, 'utf8').split('\n');
  const re = new RegExp(`^\\|\\s*((?:${prefix})[A-Z]*-?\\d{2})\\s*\\|`);
  let fonteIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Cabeçalho de tabela = linha seguida da linha separadora "| --- |".
    if (line.startsWith('|') && /^\|\s*-{3}/.test(lines[i + 1] ?? '')) {
      const head = line.split('|').slice(2, -1).map((c) => c.trim());
      fonteIdx = head.findIndex((h) => h === 'Fonte' || h === 'Derivada de');
      continue;
    }
    const m = line.match(re);
    if (!m) continue;
    let id = m[1];
    if (id.startsWith('P-')) id = 'FDD-' + id;
    const cells = line.split('|').slice(2, -1).map((c) => c.trim());
    const preferCode = id.startsWith('FDD-INT') || id === 'FDD-P-04' || id === 'FDD-EXC-08' ||
      id === 'FDD-DADOS-05' || id === 'FDD-DADOS-06' || id === 'FDD-OBS-16' || id === 'FDD-OBS-17' ||
      id === 'FDD-RES-08';
    const [fonte, loc] = fonteDe(cells, { preferCode, fonteIdx });
    const item = { id, doc: file, tipo: tipoDe(id), resumo: resumir(resumoDe(id, cells)), fonte, loc };
    if (!fonte) semFonte.push(item);
    rows.push(item);
  }
}

// Itens fora de tabela.
const MANUAL = JSON.parse(readFileSync('processo/scripts/tracker-manual.json', 'utf8'));
for (const m of MANUAL) rows.push(m);

// Ordena por documento e ID.
const ordemDoc = (d) =>
  d.startsWith('docs/PRD') ? 0 : d.startsWith('docs/RFC') ? 1 : d.startsWith('docs/adrs') ? 2 : 3;
rows.sort((a, b) => ordemDoc(a.doc) - ordemDoc(b.doc) || a.id.localeCompare(b.id, 'pt-BR', { numeric: true }));

const ids = new Set();
for (const r of rows) {
  if (ids.has(r.id)) throw new Error(`ID duplicado: ${r.id}`);
  ids.add(r.id);
}

const total = rows.length;
const trans = rows.filter((r) => r.fonte === 'TRANSCRICAO').length;
const cod = rows.filter((r) => r.fonte === 'CODIGO').length;

for (const r of rows.filter((r) => r.fonte === 'CODIGO')) {
  if (!existsSync(r.loc)) throw new Error(`Caminho inexistente no tracker: ${r.loc} (${r.id})`);
}

const esc = (s) => String(s).replace(/\|/g, '\\|');
const tabela = rows
  .map((r) => `| ${r.id} | \`${r.doc}\` | ${r.tipo} | ${esc(r.resumo)} | ${r.fonte ?? '—'} | ${r.fonte === 'CODIGO' ? '`' + r.loc + '`' : r.loc ?? '—'} |`)
  .join('\n');

const out = `# Tracker de Rastreabilidade

Mapa de cada item identificável dos documentos (\`docs/PRD.md\`, \`docs/RFC.md\`,
\`docs/FDD.md\` e \`docs/adrs/\`) até a origem: a transcrição da reunião
(\`TRANSCRICAO.md\`) ou o código do repositório.

**Como ler**

- **ID** é o mesmo identificador usado dentro do documento (busque por ele no arquivo).
- **Fonte = \`TRANSCRICAO\`**: a Localização é \`[hh:mm] Nome\`, o primeiro trecho
  da reunião que sustenta o item. Itens com várias falas citam as demais no próprio documento.
- **Fonte = \`CODIGO\`**: a Localização é um arquivo que existe no repositório.
- **Tipo = Premissa (derivada)**: decisão de implementação que **não** foi fechada
  na reunião; a Localização aponta para a fala ou arquivo de onde ela foi derivada.
  Estão listadas em [FDD §15](FDD.md#15-premissas) e precisam de confirmação.

**Cobertura:** ${total} itens · ${trans} com fonte \`TRANSCRICAO\` (${((trans / total) * 100).toFixed(1)}%) ·
${cod} com fonte \`CODIGO\` (${((cod / total) * 100).toFixed(1)}%) · ${total - trans - cod} sem fonte.

Gerado por \`processo/scripts/gerar-tracker.mjs\` a partir dos IDs dos documentos e de
\`processo/scripts/tracker-manual.json\` (ADRs e contratos), e verificado por
\`processo/scripts/verificar-entrega.mjs\`.

| ID | Documento | Tipo | Conteúdo (resumo) | Fonte | Localização |
| --- | --- | --- | --- | --- | --- |
${tabela}
`;

writeFileSync('docs/TRACKER.md', out);
console.log(`TRACKER: ${total} linhas; TRANSCRICAO=${trans}; CODIGO=${cod}; sem fonte=${semFonte.length}`);
for (const s of semFonte) console.log(`  sem fonte: ${s.id} (${s.doc})`);

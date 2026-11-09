#!/usr/bin/env node
// Verifica a entrega contra os critérios de aceite do desafio e contra
// alucinações (timestamps/falantes inexistentes, arquivos de código inexistentes,
// links quebrados). Sem dependências; rode a partir da raiz do repositório:
//
//   node processo/scripts/verificar-entrega.mjs
//
// Sai com código 1 se algum critério falhar.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, normalize } from 'node:path';

let falhas = 0;
const ok = (cond, msg) => {
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${msg}`);
  if (!cond) falhas++;
};
const ler = (f) => readFileSync(f, 'utf8');
const temSecao = (md, nome) =>
  md.split('\n').some((l) => /^#{2,4} /.test(l) && l.toLowerCase().includes(nome.toLowerCase()));

// ---------- transcrição: índice de (minuto, falante) ----------
const transcricao = ler('TRANSCRICAO.md');
const falas = new Set();
for (const m of transcricao.matchAll(/^\[(\d{2}:\d{2})\] ([A-ZÀ-Ú][a-zà-ú]+):/gm)) falas.add(`${m[1]} ${m[2]}`);

// ---------- arquivos ----------
const ADR_DIR = 'docs/adrs';
const adrs = readdirSync(ADR_DIR).filter((f) => /^ADR-\d{3}-[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(f));
const docsMd = ['README.md', 'docs/PRD.md', 'docs/RFC.md', 'docs/FDD.md', 'docs/TRACKER.md', 'docs/adrs/README.md',
  ...adrs.map((a) => `${ADR_DIR}/${a}`)];

console.log('\n## Estrutura');
for (const f of ['README.md', 'TRANSCRICAO.md', 'docs/PRD.md', 'docs/RFC.md', 'docs/FDD.md', 'docs/TRACKER.md'])
  ok(existsSync(f), `${f} existe`);

// ---------- PRD ----------
console.log('\n## PRD');
const prd = ler('docs/PRD.md');
for (const s of ['Resumo e contexto', 'Problema e motivação', 'Público-alvo e cenários de uso',
  'Objetivos e métricas de sucesso', 'Escopo', 'Fora de escopo', 'Requisitos funcionais',
  'Requisitos não funcionais', 'Decisões e trade-offs', 'Dependências', 'Riscos e mitigação',
  'Critérios de aceitação', 'Estratégia de testes e validação'])
  ok(temSecao(prd, s), `seção "${s}"`);
const fr = new Set(prd.match(/^\| PRD-FR-\d{2}/gm) ?? []);
ok(fr.size >= 8, `>= 8 requisitos funcionais (${fr.size})`);
const oos = prd.match(/^\| PRD-OOS-\d{2}/gm) ?? [];
ok(oos.length >= 2, `>= 2 itens fora de escopo (${oos.length})`);
const objQuant = (prd.match(/^\| PRD-OBJ-\d{2} .*\*\*[<≈]?\s?\d/gm) ?? []).length;
ok(objQuant >= 1, `>= 1 objetivo com meta quantitativa (${objQuant})`);
const riscos = (prd.match(/^\| PRD-RISK-\d{2} \|[^|]+\| (Alta|Média|Baixa) \| (Alto|Médio|Baixo)[^|]*\|[^|]+\|/gm) ?? []).length;
ok(riscos >= 2, `>= 2 riscos com probabilidade, impacto e mitigação (${riscos})`);

// ---------- RFC ----------
console.log('\n## RFC');
const rfc = ler('docs/RFC.md');
for (const campo of ['**Autor**', '**Status**', '**Data**', '**Revisores**']) ok(rfc.includes(campo), `metadado ${campo}`);
for (const p of ['Larissa', 'Marcos', 'Bruno', 'Diego', 'Sofia']) ok(/\*\*Revisores\*\*.*/.exec(rfc)?.[0].includes(p), `revisor ${p}`);
for (const s of ['Resumo executivo', 'Contexto e problema', 'Proposta técnica', 'Alternativas consideradas',
  'Questões em aberto', 'Impacto e riscos', 'Decisões relacionadas'])
  ok(temSecao(rfc, s), `seção "${s}"`);
const alts = (rfc.match(/^\| RFC-ALT-\d{2} \|[^|]+\|[^|]{20,}\| \[\d{2}:\d{2}\]/gm) ?? []).length;
ok(alts >= 2, `>= 2 alternativas descartadas com trade-off e fonte (${alts})`);
const oqs = (rfc.match(/^\| RFC-OQ-\d{2} /gm) ?? []).length;
ok(oqs >= 2, `>= 2 questões em aberto (${oqs})`);
const adrLinks = new Set([...rfc.matchAll(/\]\((adrs\/ADR-\d{3}-[^)#]+\.md)\)/g)].map((m) => m[1]));
ok([...adrLinks].filter((l) => existsSync(join('docs', l))).length >= 2, `>= 2 links válidos para ADRs (${adrLinks.size})`);
const rfcLinhas = rfc.split('\n').length;
console.log(`     (tamanho do RFC: ${rfcLinhas} linhas, ~${Math.round(rfc.length / 3000)} páginas de 3.000 caracteres)`);

// ---------- FDD ----------
console.log('\n## FDD');
const fdd = ler('docs/FDD.md');
for (const s of ['Contexto e motivação técnica', 'Objetivos técnicos', 'Escopo e exclusões', 'Fluxos detalhados',
  'Contratos públicos', 'Matriz de erros', 'Estratégias de resiliência', 'Observabilidade',
  'Dependências e compatibilidade', 'Critérios de aceite técnicos', 'Riscos e mitigação',
  'Integração com o sistema existente'])
  ok(temSecao(fdd, s), `seção "${s}"`);
for (const f of ['outbox', 'worker', 'retry', 'dead letter']) ok(new RegExp(`^### .*${f}`, 'im').test(fdd), `fluxo cobrindo "${f}"`);
const contratos = fdd.split(/^### /m).filter((b) => /FDD-CONTRATO-0[1-7]/.test(b.split('\n')[0]));
const contratosCompletos = contratos.filter((b) => /`(GET|POST|PATCH|DELETE) \/api\/v1/.test(b) && /Response `?\d{3}|Response `\d{3}/.test(b) && /^Status:/m.test(b));
ok(contratosCompletos.length >= 4, `>= 4 endpoints com método, response e status codes (${contratosCompletos.length})`);
const comReqExemplo = contratos.filter((b) => /```(http|json)/.test(b)).length;
ok(comReqExemplo >= 4, `>= 4 endpoints com payload de exemplo (${comReqExemplo})`);
const codigosErro = new Set(fdd.match(/`WEBHOOK_[A-Z_]+`/g) ?? []);
ok(codigosErro.size >= 5, `matriz de erros com códigos WEBHOOK_ (${codigosErro.size} distintos)`);
const integ = fdd.split(/^## 11\. /m)[1]?.split(/^## 12\. /m)[0] ?? '';
const pathsInteg = new Set([...integ.matchAll(/`((?:src|prisma|tests)\/[\w./-]+\.(?:ts|prisma)|package\.json)`/g)].map((m) => m[1]).filter((p) => existsSync(p)));
ok(pathsInteg.size >= 4, `integração cita >= 4 arquivos reais (${pathsInteg.size})`);
const obs = fdd.split(/^## 10\. /m)[1]?.split(/^## 11\. /m)[0] ?? '';
for (const t of ['Logs', 'Métricas', 'Tracing']) ok(new RegExp(`^### .*${t}`, 'm').test(obs), `observabilidade cita ${t.toLowerCase()}`);

// ---------- ADRs ----------
console.log('\n## ADRs');
ok(adrs.length >= 5 && adrs.length <= 8, `entre 5 e 8 ADRs no formato ADR-NNN-kebab.md (${adrs.length})`);
const todos = readdirSync(ADR_DIR).filter((f) => f.startsWith('ADR'));
ok(todos.length === adrs.length, 'nenhum arquivo ADR fora do padrão de nome');
let algumCodigo = false;
for (const a of adrs) {
  const md = ler(`${ADR_DIR}/${a}`);
  const faltam = ['Status', 'Contexto', 'Decisão', 'Alternativas Consideradas', 'Consequências'].filter((s) => !temSecao(md, s));
  ok(faltam.length === 0, `${a}: seções obrigatórias${faltam.length ? ' (faltam: ' + faltam.join(', ') + ')' : ''}`);
  ok(/### Positivas/.test(md) && /### Negativas/.test(md) && /### Trade-off/.test(md), `${a}: consequências positivas, negativas e trade-off`);
  if (/`src\/[\w./-]+`/.test(md)) algumCodigo = true;
}
ok(algumCodigo, '>= 1 ADR referencia arquivos do código');
const conj = adrs.join(' ');
const cobertura = [/outbox/, /retry.*dlq/, /hmac/, /at-least-once/, /worker.*polling/, /reuso/].filter((r) => r.test(conj)).length;
ok(cobertura >= 5, `cobre >= 5 das 6 decisões principais (${cobertura}/6)`);

// ---------- Tracker ----------
console.log('\n## Tracker');
const tracker = ler('docs/TRACKER.md');
ok(tracker.includes('| ID | Documento | Tipo | Conteúdo (resumo) | Fonte | Localização |'), 'cabeçalho no formato obrigatório');
const linhas = tracker.split('\n').filter((l) => /^\| [A-Z]{3}-/.test(l)).map((l) => l.split(' | '));
const trans = linhas.filter((c) => c[4] === 'TRANSCRICAO');
const transValidas = trans.filter((c) => {
  const m = c[5].match(/^\[(\d{2}:\d{2})\] ([A-ZÀ-Ú][a-zà-ú]+) \|$/);
  return m && falas.has(`${m[1]} ${m[2]}`);
});
const cods = linhas.filter((c) => c[4] === 'CODIGO' && existsSync(c[5].replace(/[`|]/g, '').trim()));
ok(trans.length / linhas.length >= 0.7, `>= 70% das linhas com TRANSCRICAO (${((trans.length / linhas.length) * 100).toFixed(1)}%)`);
ok(transValidas.length === trans.length, `timestamps do tracker existem na transcrição com o falante (${transValidas.length}/${trans.length})`);
ok(cods.length >= 5, `>= 5 linhas CODIGO com caminho real (${cods.length})`);
const idsDocs = new Set();
for (const f of ['docs/PRD.md', 'docs/RFC.md', 'docs/FDD.md']) {
  for (const m of ler(f).matchAll(/^\| ((?:PRD|RFC|FDD)-[A-Z]+-\d{2}|P-\d{2}) \|/gm)) idsDocs.add(m[1].startsWith('P-') ? 'FDD-' + m[1] : m[1]);
  for (const m of ler(f).matchAll(/^### [\d.]+ (FDD-CONTRATO-\d{2})|^(FDD-CONTRATO-\d{2}) —/gm)) idsDocs.add(m[1] ?? m[2]);
}
const idsTracker = new Set(linhas.map((c) => c[0].replace('| ', '').trim()));
const cobertos = [...idsDocs].filter((i) => idsTracker.has(i)).length;
ok(cobertos / idsDocs.size >= 0.8, `>= 80% dos itens com ID nos documentos estão no tracker (${cobertos}/${idsDocs.size})`);

// ---------- README ----------
console.log('\n## README');
const readme = ler('README.md');
for (const s of ['Sobre o desafio', 'Ferramentas de IA utilizadas', 'Workflow adotado', 'Prompts customizados',
  'Iterações e ajustes', 'Como navegar a entrega'])
  ok(temSecao(readme, s), `seção "${s}"`);
const promptBlocks = readme.split(/^## /m).find((b) => b.startsWith('Prompts customizados'))?.match(/^```/gm)?.length ?? 0;
ok(promptBlocks / 2 >= 2, `>= 2 prompts em blocos de código (${promptBlocks / 2})`);
const iter = readme.split(/^## /m).find((b) => b.startsWith('Iterações e ajustes')) ?? '';
ok((iter.match(/^### /gm) ?? []).length >= 2, `>= 2 iterações concretas descritas (${(iter.match(/^### /gm) ?? []).length})`);

// ---------- Consistência: timestamps, caminhos e links ----------
console.log('\n## Consistência');
const NOVOS = [/^src\/modules\/webhooks\//, /^src\/worker\.ts$/, /^dist\//];
let tsRuins = [], pathsRuins = [], linksRuins = [];
const slug = (h) => h.trim().toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s/g, '-');
for (const f of docsMd) {
  const md = ler(f);
  for (const m of md.matchAll(/\[(\d{2}:\d{2})\] ([A-ZÀ-Ú][a-zà-ú]+)/g))
    if (!falas.has(`${m[1]} ${m[2]}`)) tsRuins.push(`${f}: [${m[1]}] ${m[2]}`);
  for (const m of md.matchAll(/`((?:src|prisma|tests)\/[\w./-]*[\w-]\.(?:ts|prisma|sql))`/g))
    if (!existsSync(m[1]) && !NOVOS.some((r) => r.test(m[1]))) pathsRuins.push(`${f}: ${m[1]}`);
  for (const m of md.matchAll(/\]\(([^)\s]+)\)/g)) {
    const [alvo, ancora] = m[1].split('#');
    if (/^https?:/.test(alvo)) continue;
    const arquivo = alvo ? normalize(join(dirname(f), alvo)) : f;
    if (!existsSync(arquivo)) { linksRuins.push(`${f}: ${m[1]}`); continue; }
    if (ancora && arquivo.endsWith('.md')) {
      const heads = ler(arquivo).split('\n').filter((l) => /^#{1,6} /.test(l)).map((l) => slug(l.replace(/^#+ /, '')));
      if (!heads.includes(decodeURIComponent(ancora))) linksRuins.push(`${f}: ${m[1]} (âncora)`);
    }
  }
}
ok(tsRuins.length === 0, `todo [hh:mm] Nome citado existe na transcrição${tsRuins.length ? ': ' + tsRuins.join('; ') : ''}`);
ok(pathsRuins.length === 0, `todo arquivo de código citado existe (ou é marcado como novo)${pathsRuins.length ? ': ' + pathsRuins.join('; ') : ''}`);
ok(linksRuins.length === 0, `links e âncoras internos resolvem${linksRuins.length ? ': ' + linksRuins.join('; ') : ''}`);

console.log(`\n${falhas === 0 ? 'TUDO OK' : falhas + ' FALHA(S)'}`);
process.exit(falhas === 0 ? 0 : 1);

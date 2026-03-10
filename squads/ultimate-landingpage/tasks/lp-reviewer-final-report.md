---
task: produceFinalReport()
responsavel: "Shield"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: copyScore
    tipo: object
    obrigatorio: true
    descricao: "Score numérico de qualidade do copy por dimensão (source: reviewCopyQuality())"
  - nome: designScore
    tipo: object
    obrigatorio: true
    descricao: "Score numérico de qualidade do design por dimensão (source: reviewDesignConsistency())"
  - nome: seoA11yScore
    tipo: object
    obrigatorio: true
    descricao: "Score numérico de SEO e acessibilidade por dimensão (source: reviewSeoAccessibility())"
  - nome: backendScore
    tipo: object
    obrigatorio: false
    descricao: "Score numérico de segurança do backend por dimensão (source: reviewBackendSecurity())"
  - nome: integrationScore
    tipo: object
    obrigatorio: false
    descricao: "Score numérico de qualidade das integrações por dimensão (source: reviewIntegrations())"

Saida:
  - nome: finalReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório consolidado com scores, sumário executivo e action items priorizados (destination: orchestrator + user)"
  - nome: verdict
    tipo: string
    obrigatorio: true
    descricao: "Veredicto final — PASS, CONCERNS, NEEDS_WORK ou FAIL (destination: orchestrator)"

Checklist:
  pre-conditions:
    - "[ ] Todas as dimensões de review aplicáveis foram concluídas"
    - "[ ] copyScore gerado por reviewCopyQuality()"
    - "[ ] designScore gerado por reviewDesignConsistency()"
    - "[ ] seoA11yScore gerado por reviewSeoAccessibility()"
    - "[ ] backendScore gerado por reviewBackendSecurity() (se backend=true)"
    - "[ ] integrationScore gerado por reviewIntegrations() (se integrações ativas)"
  post-conditions:
    - "[ ] Relatório consolidado com score por dimensão (0-10)"
    - "[ ] Score geral ponderado calculado"
    - "[ ] Veredicto emitido (PASS >=8.0, CONCERNS 6.0-7.9, NEEDS_WORK 4.0-5.9, FAIL <4.0)"
    - "[ ] Sumário executivo presente"
    - "[ ] Action items priorizados para issues encontrados"

Performance:
  duration_expected: "8 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Score obrigatório ausente (copyScore, designScore ou seoA11yScore)"
    estrategia: "abort + solicitar execução do review faltante"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Scores em escalas incompatíveis (não normalizados 0-10)"
    estrategia: "Normalizar automaticamente para escala 0-10"
    fallback: "Documentar normalização aplicada no relatório"
  - erro: "Cálculo de pesos dinâmicos resulta em total diferente de 100%"
    estrategia: "Recalcular redistribuindo proporcionalmente"
    fallback: "Usar pesos default (equal weight) e documentar"
  - erro: "BLOCKERs de reviews individuais não acessíveis"
    estrategia: "Listar BLOCKERs conhecidos do contexto da sessão"
    fallback: "Gerar relatório sem action items detalhados e recomendar re-review"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com relatório parcial"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# produceFinalReport()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  copyScore            │──────>│                      │──────>│  finalReport            │
│  (object, required)   │       │                      │       │  (file)                 │
├───────────────────────┤       │                      │       ├─────────────────────────┤
│  designScore          │──────>│  produceFinal        │──────>│  verdict                │
│  (object, required)   │       │  Report              │       │  (string)               │
├───────────────────────┤       │  @Shield             │       └─────────────────────────┘
│  seoA11yScore         │──────>│                      │               │
│  (object, required)   │       │                      │               ├──────────────────┐
├───────────────────────┤       │                      │               ▼                  ▼
│  backendScore         │──?──>│                      │       ┌──────────────┐   ┌──────────────┐
│  (object, optional)   │       │                      │       │ orchestrator │   │ user         │
├───────────────────────┤       └──────────────────────┘       └──────────────┘   └──────────────┘
│  integrationScore     │──?──>
│  (object, optional)   │
└───────────────────────┘

  ──?──>  = condicional (só se a dimensão for aplicável)

  Verdicts:
  ┌────────────────────────────────────────────┐
  │  >= 8.0  →  PASS                           │
  │  6.0-7.9 →  CONCERNS                       │
  │  4.0-5.9 →  NEEDS_WORK                     │
  │  < 4.0   →  FAIL                           │
  └────────────────────────────────────────────┘
```

## Descrição

A task `produceFinalReport()` é o **capstone do pipeline de review** — consolida os scores de todas as dimensões de qualidade em um relatório final unificado. O agente **Shield** agrega os resultados de copy, design, SEO/acessibilidade, segurança do backend (se aplicável) e integrações (se aplicáveis) para produzir um veredicto objetivo e um relatório acionável.

Esta task é um Organism porque combina múltiplos outputs de tasks anteriores (Analysis) em um artefato de nível superior. O relatório final serve tanto ao orchestrator (para decidir se o projeto está pronto para deploy) quanto ao usuário (para visibilidade do estado geral da qualidade).

O score geral é ponderado dinamicamente: quando dimensões opcionais (backend, integrações) não são aplicáveis, os pesos são redistribuídos entre as dimensões obrigatórias (copy, design, SEO/acessibilidade).

## Passos

1. **Carregar todos os scores** — Ler `copyScore`, `designScore`, `seoA11yScore` e, se disponíveis, `backendScore` e `integrationScore`.
2. **Determinar dimensões ativas** — Identificar quais dimensões de review foram executadas (obrigatórias: copy, design, SEO/a11y; condicionais: backend, integrações).
3. **Normalizar scores** — Garantir que todos os scores estão na mesma escala (0-10) e que as subdimensões de cada review estão corretamente agregadas.
4. **Calcular pesos dinâmicos** — Redistribuir pesos entre as dimensões ativas:
   - Se todas as 5 dimensões: copy 25%, design 25%, SEO/a11y 25%, backend 15%, integrações 10%
   - Se 3 dimensões (sem backend/integrações): copy 35%, design 35%, SEO/a11y 30%
   - Ajustes intermediários para 4 dimensões
5. **Calcular score geral ponderado** — Aplicar os pesos dinâmicos aos scores individuais para obter o score final.
6. **Determinar veredicto** — Aplicar as faixas de classificação:
   - **PASS** (>= 8.0): Projeto pronto para deploy
   - **CONCERNS** (6.0-7.9): Deploy possível com ressalvas documentadas
   - **NEEDS_WORK** (4.0-5.9): Correções necessárias antes do deploy
   - **FAIL** (< 4.0): Problemas críticos que impedem o deploy
7. **Coletar BLOCKERs de todas as dimensões** — Agregar todos os issues BLOCKER dos reviews individuais como action items prioritários.
8. **Redigir sumário executivo** — Criar um resumo de 3-5 parágrafos com: estado geral, destaques positivos, áreas de preocupação e recomendações principais.
9. **Priorizar action items** — Ordenar todos os issues encontrados por: (1) severidade (BLOCKER > WARNING > INFO), (2) impacto no score, (3) esforço estimado de correção.
10. **Compilar relatório final** — Montar o `finalReport` com: sumário executivo, tabela de scores por dimensão, veredicto, lista de action items priorizados e detalhamento por dimensão.
11. **Gerar outputs** — Disponibilizar `finalReport` para orchestrator e user, e `verdict` como string para decisão automática do orchestrator.

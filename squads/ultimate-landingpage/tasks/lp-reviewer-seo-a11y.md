---
task: reviewSeoAccessibility()
responsavel: "Shield"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: landingPage
    tipo: file
    obrigatorio: true
    descricao: "Landing page montada com todos os componentes (source: assemblePage())"
  - nome: seoReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de SEO gerado durante a montagem da página (source: assemblePage())"
  - nome: sectionA11yReports
    tipo: array<file>
    obrigatorio: true
    descricao: "Relatórios de acessibilidade individuais por seção (source: buildSection() iterações)"

Saida:
  - nome: seoA11yReview
    tipo: file
    obrigatorio: true
    descricao: "Relatório detalhado de revisão de SEO e acessibilidade com issues e sugestões (destination: lp-frontend-dev para correções)"
  - nome: seoA11yScore
    tipo: object
    obrigatorio: true
    descricao: "Score numérico de SEO e acessibilidade por dimensão (destination: produceFinalReport())"

Checklist:
  pre-conditions:
    - "[ ] Landing page montada por assemblePage()"
    - "[ ] Metadata SEO presente (title, description, OG tags)"
    - "[ ] Relatórios de acessibilidade por seção disponíveis"
  post-conditions:
    - "[ ] Meta tags verificadas (title, description, OG, Twitter, canonical)"
    - "[ ] Structured data válido (JSON-LD)"
    - "[ ] HTML semântico validado"
    - "[ ] Conformidade WCAG AAA verificada"
    - "[ ] Navegação por teclado testada"
    - "[ ] Skip-to-content verificado"
    - "[ ] Hierarquia de headings validada (h1 único)"
    - "[ ] Alt texts presentes em todas as imagens"
    - "[ ] Core Web Vitals estimados"
    - "[ ] Issues categorizados como BLOCKER/WARNING/INFO"

Performance:
  duration_expected: "15 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Landing page não compila para análise"
    estrategia: "retry (max 2) verificando build errors"
    fallback: "Analisar código-fonte sem build e documentar limitações"
  - erro: "seoReport ausente ou incompleto"
    estrategia: "Gerar verificação SEO diretamente do código-fonte"
    fallback: "Marcar SEO como PARTIALLY_VERIFIED no relatório"
  - erro: "sectionA11yReports faltantes para algumas seções"
    estrategia: "Gerar análise de a11y para seções sem relatório"
    fallback: "Marcar seções sem report como UNVERIFIED"
  - erro: "JSON-LD inválido ou mal formado"
    estrategia: "Documentar como BLOCKER com sugestão de correção"
    fallback: "Fornecer template JSON-LD corrigido no relatório"
  - erro: "Core Web Vitals não estimáveis sem execução"
    estrategia: "Estimar a partir de análise estática do código"
    fallback: "Marcar como ESTIMATED com nota sobre necessidade de teste real"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com review parcial"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# reviewSeoAccessibility()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  landingPage          │──────>│                      │──────>│  seoA11yReview          │
│  (file)               │       │                      │       │  (file)                 │
├───────────────────────┤       │  reviewSeo           │       ├─────────────────────────┤
│  seoReport            │──────>│  Accessibility       │──────>│  seoA11yScore           │
│  (file)               │       │  @Shield             │       │  (object)               │
├───────────────────────┤       │                      │       └─────────────────────────┘
│  sectionA11yReports   │──────>│                      │               │
│  (array<file>)        │       └──────────────────────┘               ├──────────────────┐
└───────────────────────┘                                              ▼                  ▼
                                                               ┌──────────────┐   ┌──────────────┐
                                                               │ lp-frontend  │   │ produceFinal │
                                                               │ -dev (fixes) │   │ Report()     │
                                                               └──────────────┘   └──────────────┘
```

## Descrição

A task `reviewSeoAccessibility()` realiza uma **auditoria abrangente de SEO e acessibilidade** da landing page montada. O agente **Shield** verifica a presença e correção de todos os elementos de SEO (meta tags, structured data, semântica HTML), conformidade WCAG AAA, navegabilidade por teclado, hierarquia de headings e estimativas de Core Web Vitals.

O review consolida os relatórios individuais de acessibilidade por seção com uma análise global da página montada, identificando problemas que só são visíveis no contexto da página completa (como h1 duplicados, falta de skip-to-content, ou structured data incompleto).

## Passos

1. **Carregar todos os inputs** — Ler `landingPage`, `seoReport` e todos os `sectionA11yReports` para contexto completo.
2. **Verificar meta tags essenciais** — Validar presença e qualidade de: `<title>` (50-60 caracteres), `<meta description>` (150-160 caracteres), canonical URL, e robots meta.
3. **Verificar Open Graph e Twitter Cards** — Validar `og:title`, `og:description`, `og:image`, `og:url`, `og:type` e equivalentes Twitter (`twitter:card`, `twitter:title`, etc.).
4. **Validar structured data (JSON-LD)** — Verificar presença de schema.org markup válido (Organization, WebPage, Product/Service conforme aplicável), sem erros de sintaxe.
5. **Auditar HTML semântico** — Verificar uso correto de `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>` e landmarks ARIA.
6. **Validar hierarquia de headings** — Confirmar que existe um único `<h1>`, que a hierarquia é sequencial (h1 → h2 → h3, sem pular níveis) e que os headings são descritivos.
7. **Verificar conformidade WCAG AAA** — Consolidar relatórios por seção e verificar critérios globais: foco visível, labels em formulários, ARIA attributes, live regions para conteúdo dinâmico.
8. **Testar navegação por teclado** — Verificar que todos os elementos interativos são acessíveis por Tab, que a ordem de foco é lógica e que existe skip-to-content link.
9. **Verificar alt texts** — Confirmar que todas as imagens possuem alt text descritivo (não genérico como "image" ou "foto"), e que imagens decorativas usam `alt=""`.
10. **Estimar Core Web Vitals** — Analisar o código para estimar LCP (Largest Contentful Paint), FID/INP (Interaction to Next Paint), e CLS (Cumulative Layout Shift) com base em: tamanho de imagens, lazy loading, font loading strategy e layout shifts potenciais.
11. **Categorizar issues** — Classificar cada problema como BLOCKER (impede indexação ou acessibilidade), WARNING (impacto negativo em ranking ou usabilidade) ou INFO (otimização recomendada).
12. **Calcular scores** — Computar score por dimensão (SEO técnico, structured data, semântica, acessibilidade, performance) e score geral ponderado.
13. **Gerar outputs** — Produzir `seoA11yReview` com detalhamento completo e `seoA11yScore` com os valores numéricos para o relatório final.

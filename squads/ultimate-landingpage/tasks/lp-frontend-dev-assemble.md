---
task: assemblePage()
responsavel: "Pixel"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: allSectionComponents
    tipo: array<file>
    obrigatorio: true
    descricao: "Todos os componentes de seção construídos e validados (source: buildSection() iterations)"
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing do produto para SEO metadata e structured data (source: discoverProduct())"

Saida:
  - nome: landingPage
    tipo: file
    obrigatorio: true
    descricao: "Landing page completa montada com todas as seções, SEO e acessibilidade (destination: lp-integrator + lp-reviewer)"
  - nome: seoReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de SEO — metadata, structured data, sitemap, robots (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] Todos os componentes de seção construídos e renderizando corretamente"
    - "[ ] productBrief disponível para extração de metadata SEO"
  post-conditions:
    - "[ ] Página montada com todas as seções na ordem correta"
    - "[ ] SEO metadata completo — title, description, OG tags, Twitter cards"
    - "[ ] URL canônica configurada"
    - "[ ] JSON-LD structured data para Organization/Product/FAQ"
    - "[ ] sitemap.xml gerado"
    - "[ ] robots.txt configurado"
    - "[ ] Link skip-to-content presente e funcional"
    - "[ ] Hierarquia de headings validada (único h1)"
    - "[ ] Página inteira navegável por teclado"

Performance:
  duration_expected: "15 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Componente de seção faltante no allSectionComponents"
    estrategia: "abort + solicitar execução de buildSection() para seção faltante"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Heading hierarchy inválida (h1 duplicado)"
    estrategia: "Corrigir headings das seções ajustando níveis (h2, h3)"
    fallback: "Documentar no seoReport para correção posterior"
  - erro: "Build Next.js falha na montagem final"
    estrategia: "Analisar erros de compilação e corrigir imports/tipos"
    fallback: "Isolar seção problemática e montar página sem ela"
  - erro: "JSON-LD structured data inválido"
    estrategia: "retry (max 2) validando schema contra schema.org"
    fallback: "Remover structured data e documentar para inclusão manual"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# assemblePage()

## Pipeline Diagram

```
┌───────────────────────┐
│ allSectionComponents  │───┐
│ (array<file>)         │   │     ┌──────────────────┐     ┌──────────────────┐
│                       │   ├────>│                  │────>│ landingPage      │
│ - HeroSection         │   │     │  assemblePage    │     │ (file)           │
│ - BenefitsSection     │   │     │  @Pixel          │     ├──────────────────┤
│ - SolutionSection     │   │     │                  │────>│ seoReport        │
│ - TestimonialsSection │   │     └──────────────────┘     │ (file)           │
│ - FAQSection          │   │                              └──────────────────┘
│ - CTASection          │   │                                     │
│ - FooterSection       │   │                                     ▼
└───────────────────────┘   │                           ┌──────────────────┐
                            │                           │ lp-integrator    │
┌───────────────────────┐   │                           │ lp-reviewer      │
│ productBrief          │───┘                           └──────────────────┘
│ (file)                │
└───────────────────────┘
```

## Descrição

A task `assemblePage()` é a etapa de montagem final da landing page no frontend. O agente **Pixel** recebe todos os componentes de seção já construídos e validados individualmente, e os compõe em uma página única e coesa, adicionando toda a camada de SEO, structured data e acessibilidade global.

Esta task não cria componentes novos — ela orquestra os existentes, define a ordem de apresentação, implementa a navegação entre seções, configura metadata para motores de busca e garante que a página como um todo funciona como uma unidade coerente e otimizada.

## Passos

1. **Inventariar seções** — Listar todos os componentes recebidos em allSectionComponents e definir a ordem de montagem na página (hero primeiro, CTA/footer por último).
2. **Criar página principal** — Implementar `app/page.tsx` (ou `app/(landing)/page.tsx`) importando e posicionando todos os componentes de seção na ordem definida.
3. **Implementar layout root** — Configurar `app/layout.tsx` com ThemeProvider, fontes, metadata base e skip-to-content link.
4. **Configurar SEO metadata** — Extrair do productBrief: title, description, keywords. Configurar `metadata` export do Next.js com OG tags, Twitter cards e URL canônica.
5. **Adicionar JSON-LD** — Criar structured data para Organization, Product e FAQ usando os dados do productBrief e do conteúdo das seções.
6. **Gerar sitemap.xml** — Configurar geração automática de sitemap via `app/sitemap.ts` ou plugin.
7. **Configurar robots.txt** — Criar `app/robots.ts` com regras adequadas (allow all, referência ao sitemap).
8. **Validar heading hierarchy** — Garantir que existe um único `<h1>` na página (no hero) e que os headings seguem uma hierarquia lógica (h1 > h2 > h3).
9. **Implementar skip-to-content** — Adicionar link de skip-to-content visível no focus para navegação por teclado.
10. **Testar página completa** — Verificar renderização de todas as seções, navegação por teclado end-to-end, dark mode consistente e performance de carregamento.
11. **Gerar seoReport** — Documentar todas as configurações de SEO, structured data implementados, scores de acessibilidade e heading hierarchy no relatório.

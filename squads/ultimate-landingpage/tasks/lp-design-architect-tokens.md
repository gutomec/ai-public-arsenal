---
task: defineDesignTokens()
responsavel: "Prism"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: dsSelection
    tipo: file
    obrigatorio: true
    descricao: "Documento de seleção do design system com escolha e configuração base (source: selectDesignSystem())"
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto com USP, mercado-alvo, tom/voz e identidade visual (source: discoverProduct())"
  - nome: userPreferences
    tipo: object
    obrigatorio: false
    descricao: "Preferências do usuário para cores, tipografia e estilo visual (source: elicitRequirements())"

Saida:
  - nome: designTokens
    tipo: file
    obrigatorio: true
    descricao: "Sistema completo de design tokens — cores, tipografia, espaçamento, sombras, breakpoints (destination: createAtomicComponents() + lp-frontend-dev + lp-image-creator)"
  - nome: contrastReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de verificação de contraste WCAG AAA para todos os pares foreground/background (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] dsSelection existe com design system base definido"
    - "[ ] productBrief existe com identidade visual e tom/voz"
  post-conditions:
    - "[ ] Color primitives definidas (paleta completa com shades 50-950)"
    - "[ ] Semantic tokens para light mode definidos (background, foreground, primary, secondary, accent, muted, destructive, border, ring)"
    - "[ ] Semantic tokens para dark mode definidos (todas as mesmas categorias)"
    - "[ ] Escala tipográfica definida (font-family, sizes, weights, line-heights, letter-spacing)"
    - "[ ] Sistema de espaçamento definido (grid de 4px: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24)"
    - "[ ] Border-radius tokens definidos (none, sm, md, lg, xl, 2xl, full)"
    - "[ ] Shadow tokens definidos (sm, md, lg, xl, 2xl, inner)"
    - "[ ] Breakpoints responsivos definidos (sm, md, lg, xl, 2xl)"
    - "[ ] Contraste WCAG AAA verificado — ratio 7:1 para texto normal, 4.5:1 para texto grande em TODOS os pares foreground/background"
    - "[ ] contrastReport gerado com status PASS/FAIL para cada par"

Performance:
  duration_expected: "10 minutes"
  cacheable: true
  parallelizable: false

Error_Handling:
  - erro: "Falha de contraste WCAG AAA em pares foreground/background"
    estrategia: "Ajustar shade da cor automaticamente (lighten/darken) e re-verificar"
    fallback: "Substituir cor problemática por alternativa acessível da paleta"
  - erro: "dsSelection ausente ou incompleta"
    estrategia: "abort + solicitar execução de selectDesignSystem()"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Paleta do usuário insuficiente para gerar shades 50-950"
    estrategia: "retry (max 2) usando algoritmo de interpolação de cores"
    fallback: "Gerar shades via HSL mantendo hue/saturation e variando lightness"
  - erro: "Conflito entre tokens light e dark mode"
    estrategia: "Priorizar legibilidade e contraste sobre fidelidade à paleta"
    fallback: "Documentar tokens ajustados e reportar desvio no contrastReport"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# defineDesignTokens()

## Pipeline Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  dsSelection     │──────>│                      │──────>│  designTokens       │
│  (file)          │       │                      │       │  (file)             │
├──────────────────┤       │  defineDesignTokens  │       │  ┌───────────────┐  │
│  productBrief    │──────>│  @Prism              │       │  │ colors        │  │
│  (file)          │       │                      │       │  │ typography    │  │
├──────────────────┤       │                      │       │  │ spacing       │  │
│  userPreferences │──────>│                      │       │  │ borders       │  │
│  (object)?       │       └──────────────────────┘       │  │ shadows       │  │
└──────────────────┘               │                      │  │ breakpoints   │  │
                                   │                      │  └───────────────┘  │
                                   │                      ├─────────────────────┤
                                   │                      │  contrastReport     │
                                   ▼                      │  (file)             │
                           ┌──────────────────┐           └─────────────────────┘
                           │  WCAG AAA        │                   │
                           │  Contrast Check  │                   ▼
                           │  7:1 / 4.5:1     │           ┌─────────────────────┐
                           └──────────────────┘           │  createAtomic...()  │
                                                          │  lp-frontend-dev    │
                                                          │  lp-image-creator   │
                                                          │  lp-reviewer        │
                                                          └─────────────────────┘
```

## Descrição

A task `defineDesignTokens()` é o **alicerce do sistema visual** da landing page. O agente **Prism** constrói um sistema completo de design tokens sobre o design system selecionado em `selectDesignSystem()`, definindo cada primitiva visual que será usada por componentes, layouts e assets gráficos.

Os design tokens são a "linguagem visual" compartilhada entre design e código. Eles garantem que cores, tipografia, espaçamento e outros atributos visuais sejam consistentes em toda a landing page, tanto no light mode quanto no dark mode. Cada token é nomeado semanticamente (ex: `--color-primary`, `--text-heading`, `--space-lg`) para que mudanças de tema possam ser feitas alterando apenas os valores dos tokens, sem tocar nos componentes.

Um requisito crítico desta task é a **verificação de contraste WCAG AAA**. Todos os pares foreground/background devem atingir ratio mínimo de 7:1 para texto normal e 4.5:1 para texto grande, garantindo acessibilidade máxima. O `contrastReport` documenta o resultado de cada verificação para auditoria pelo reviewer.

## Passos

1. **Carregar dsSelection** — Ler o design system selecionado e sua configuração base para entender as convenções de tokens do DS.
2. **Extrair identidade visual** — Do `productBrief` e `userPreferences`, extrair: cores da marca, tipografia desejada, estilo visual (minimalista, bold, etc.), preferências explícitas.
3. **Definir color primitives** — Criar a paleta completa com shades de 50 a 950 para cada cor base (primary, secondary, accent, neutral, success, warning, error).
4. **Criar semantic tokens — light mode** — Mapear os primitives para tokens semânticos: background, foreground, card, popover, primary, secondary, muted, accent, destructive, border, input, ring.
5. **Criar semantic tokens — dark mode** — Definir a versão dark de cada token semântico, garantindo que a identidade visual se mantenha com luminosidade invertida.
6. **Definir escala tipográfica** — Estabelecer font-family (heading + body), escala de tamanhos (xs a 6xl), pesos (light a black), line-heights e letter-spacing.
7. **Definir sistema de espaçamento** — Criar a escala baseada no grid de 4px com valores de 0 a 24 unidades (0px a 96px).
8. **Definir border-radius e shadows** — Criar tokens para arredondamento (none a full) e sombras (sm a 2xl + inner).
9. **Definir breakpoints** — Estabelecer os pontos de quebra responsivos: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px).
10. **Verificar contraste WCAG AAA** — Para cada par foreground/background nos tokens semânticos (light e dark), calcular o ratio de contraste e verificar: >=7:1 para texto normal, >=4.5:1 para texto grande.
11. **Gerar contrastReport** — Compilar o relatório de contraste com status PASS/FAIL, ratio calculado e recomendação de correção para pares que falham.
12. **Ajustar tokens com falha** — Se algum par não atingir o ratio mínimo, ajustar os valores dos tokens e re-verificar até todos passarem.
13. **Compilar designTokens** — Gerar o arquivo final com todos os tokens organizados por categoria, prontos para consumo pelos componentes e pelo frontend.

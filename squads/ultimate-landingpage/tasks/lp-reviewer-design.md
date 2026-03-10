---
task: reviewDesignConsistency()
responsavel: "Shield"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: designTokens
    tipo: file
    obrigatorio: true
    descricao: "Design tokens definidos — cores, tipografia, espaçamento, bordas (source: defineDesignTokens())"
  - nome: componentSpecs
    tipo: file
    obrigatorio: true
    descricao: "Especificações dos componentes atômicos — atoms, molecules, organisms (source: createAtomicComponents())"
  - nome: contrastReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de contraste de cores gerado na definição dos tokens (source: defineDesignTokens())"
  - nome: tokensCssFile
    tipo: file
    obrigatorio: true
    descricao: "Arquivo CSS com tokens implementados — variáveis CSS custom properties (source: implementDesignSystem())"

Saida:
  - nome: designReview
    tipo: file
    obrigatorio: true
    descricao: "Relatório detalhado de revisão de consistência visual com issues e sugestões (destination: lp-design-architect para correções)"
  - nome: designScore
    tipo: object
    obrigatorio: true
    descricao: "Score numérico de qualidade do design por dimensão (destination: produceFinalReport())"

Checklist:
  pre-conditions:
    - "[ ] Design system implementado com tokens CSS"
    - "[ ] Relatório de contraste existe e foi gerado por defineDesignTokens()"
    - "[ ] Especificações dos componentes atômicos disponíveis"
    - "[ ] Arquivo CSS de tokens implementado"
  post-conditions:
    - "[ ] Consistência do design system verificada"
    - "[ ] Contraste WCAG AAA verificado para TODOS os pares em ambos os modos light E dark"
    - "[ ] Hierarquia tipográfica consistente"
    - "[ ] Sistema de espaçamento seguido"
    - "[ ] Comportamento responsivo verificado"
    - "[ ] Issues categorizados como BLOCKER/WARNING/INFO"

Performance:
  duration_expected: "12 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "contrastReport ausente ou desatualizado"
    estrategia: "Recalcular contraste a partir dos tokens CSS implementados"
    fallback: "Marcar verificação de contraste como MANUAL NEEDED no relatório"
  - erro: "tokensCssFile diverge dos designTokens especificados"
    estrategia: "Documentar divergências como issues BLOCKER"
    fallback: "Reportar ao design architect para reconciliação"
  - erro: "componentSpecs ausentes para componentes implementados"
    estrategia: "Avaliar componentes implementados diretamente no código"
    fallback: "Documentar componentes sem spec como WARNING no relatório"
  - erro: "Análise de responsividade impossível sem browser/preview"
    estrategia: "Analisar código-fonte para breakpoints e media queries"
    fallback: "Marcar responsividade como UNVERIFIED e recomendar teste manual"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com review parcial"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# reviewDesignConsistency()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  designTokens         │──────>│                      │──────>│  designReview           │
│  (file)               │       │                      │       │  (file)                 │
├───────────────────────┤       │  reviewDesign        │       ├─────────────────────────┤
│  componentSpecs       │──────>│  Consistency         │──────>│  designScore            │
│  (file)               │       │  @Shield             │       │  (object)               │
├───────────────────────┤       │                      │       └─────────────────────────┘
│  contrastReport       │──────>│                      │               │
│  (file)               │       │                      │               ├───────────────────┐
├───────────────────────┤       └──────────────────────┘               ▼                   ▼
│  tokensCssFile        │──────>                               ┌──────────────────┐ ┌──────────────┐
│  (file)               │                                      │ lp-design-       │ │ produceFinal │
└───────────────────────┘                                      │ architect (fixes)│ │ Report()     │
                                                               └──────────────────┘ └──────────────┘
```

## Descrição

A task `reviewDesignConsistency()` realiza uma **auditoria completa de consistência visual** do design system e sua implementação. O agente **Shield** verifica se os tokens definidos foram corretamente implementados, se o contraste atende ao nível WCAG AAA em todos os modos (light e dark), se a hierarquia tipográfica é consistente e se o sistema de espaçamento está sendo seguido.

O review compara as especificações dos componentes atômicos contra os tokens CSS implementados, verifica todos os pares de cores de texto/fundo para conformidade de contraste, valida a escala tipográfica e o ritmo vertical, e analisa o comportamento responsivo dos componentes.

## Passos

1. **Carregar todos os inputs** — Ler `designTokens`, `componentSpecs`, `contrastReport` e `tokensCssFile` para contexto completo.
2. **Verificar implementação dos tokens** — Comparar os tokens definidos em `designTokens` com as variáveis CSS em `tokensCssFile`, identificando tokens não implementados ou com valores divergentes.
3. **Auditar contraste WCAG AAA (light mode)** — Verificar todos os pares de cores texto/fundo no modo light, exigindo ratio mínimo de 7:1 para texto normal e 4.5:1 para texto grande (WCAG AAA).
4. **Auditar contraste WCAG AAA (dark mode)** — Repetir a verificação de contraste para o modo dark, garantindo que todos os pares atendem AAA.
5. **Validar hierarquia tipográfica** — Verificar que os tamanhos de fonte seguem uma escala consistente (type scale), que o line-height é adequado para legibilidade e que os font-weight são usados de forma hierárquica.
6. **Verificar sistema de espaçamento** — Confirmar que padding, margin e gap utilizam exclusivamente os tokens de espaçamento definidos, sem valores arbitrários (magic numbers).
7. **Auditar consistência dos componentes** — Verificar que cada componente nas `componentSpecs` utiliza os tokens corretos e segue os padrões de design system.
8. **Verificar comportamento responsivo** — Analisar breakpoints, fluid typography e layout adaptations para mobile, tablet e desktop.
9. **Categorizar issues** — Classificar cada problema como BLOCKER (quebra acessibilidade ou consistência visual), WARNING (inconsistência menor) ou INFO (melhoria sugerida).
10. **Calcular scores** — Computar score por dimensão (tokens, contraste, tipografia, espaçamento, responsividade) e score geral ponderado.
11. **Gerar outputs** — Produzir `designReview` com detalhamento completo e `designScore` com os valores numéricos para o relatório final.

---
task: designSections()
responsavel: "Prism"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: componentHierarchy
    tipo: file
    obrigatorio: true
    descricao: "Hierarquia de composição dos componentes atômicos — Atoms, Molecules, Organisms (source: createAtomicComponents())"
  - nome: allSectionsCopy
    tipo: array<file>
    obrigatorio: true
    descricao: "Copies finais de todas as seções da landing page (source: writeSectionCopy() iterations)"
  - nome: designTokens
    tipo: file
    obrigatorio: true
    descricao: "Sistema completo de design tokens (source: defineDesignTokens())"

Saida:
  - nome: sectionLayouts
    tipo: file
    obrigatorio: true
    descricao: "Layouts detalhados de cada seção com wireframes desktop + mobile e mapeamento de componentes (destination: lp-frontend-dev + lp-image-creator)"
  - nome: responsiveSpecs
    tipo: file
    obrigatorio: true
    descricao: "Especificações de comportamento responsivo por seção e por breakpoint (destination: lp-frontend-dev)"

Checklist:
  pre-conditions:
    - "[ ] componentHierarchy existe com Atoms, Molecules e Organisms definidos"
    - "[ ] allSectionsCopy contém copy de todas as seções planejadas"
    - "[ ] designTokens existe com tokens de espaçamento, tipografia e breakpoints"
  post-conditions:
    - "[ ] Cada seção possui wireframe layout para desktop (>=1024px)"
    - "[ ] Cada seção possui wireframe layout para mobile (<768px)"
    - "[ ] Cada seção possui mapeamento de quais componentes (da componentHierarchy) são usados e onde"
    - "[ ] Notas de variante light/dark incluídas para cada seção"
    - "[ ] Comportamento responsivo definido por breakpoint (sm, md, lg, xl, 2xl) para cada seção"
    - "[ ] Espaçamento entre seções definido e consistente"
    - "[ ] Hierarquia visual (Z-pattern ou F-pattern) documentada"

Performance:
  duration_expected: "15 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Copy de seção ausente no allSectionsCopy"
    estrategia: "abort + solicitar execução de writeSectionCopy() para a seção faltante"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Componente necessário não existe na componentHierarchy"
    estrategia: "retry (max 2) mapeando componente alternativo da hierarquia"
    fallback: "Documentar gap e sugerir criação de componente ao design architect"
  - erro: "Layout não cabe no breakpoint mobile (overflow horizontal)"
    estrategia: "Reestruturar grid para single-column em mobile"
    fallback: "Ocultar elementos não-essenciais em mobile e documentar"
  - erro: "Conflito entre hierarquia visual Z-pattern e conteúdo da seção"
    estrategia: "Adaptar layout para F-pattern quando conteúdo é denso"
    fallback: "Documentar decisão de layout e justificar no responsiveSpecs"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# designSections()

## Pipeline Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  componentHier.  │──────>│                      │──────>│  sectionLayouts     │
│  (file)          │       │                      │       │  (file)             │
│  ┌────────────┐  │       │                      │       │  ┌───────────────┐  │
│  │ Atoms      │  │       │  designSections      │       │  │ Hero layout   │  │
│  │ Molecules  │  │       │  @Prism              │       │  │ Problem layout│  │
│  │ Organisms  │  │       │                      │       │  │ Benefits ...  │  │
│  └────────────┘  │       │                      │       │  │ [desktop+mob] │  │
├──────────────────┤       │                      │       │  └───────────────┘  │
│  allSectionsCopy │──────>│                      │       ├─────────────────────┤
│  (array<file>)   │       │                      │──────>│  responsiveSpecs    │
│  [hero, problem, │       └──────────────────────┘       │  (file)             │
│   benefits, ...] │                                      │  ┌───────────────┐  │
├──────────────────┤                                      │  │ sm  (640px)   │  │
│  designTokens    │──────>                               │  │ md  (768px)   │  │
│  (file)          │                                      │  │ lg  (1024px)  │  │
└──────────────────┘                                      │  │ xl  (1280px)  │  │
                                                          │  │ 2xl (1536px)  │  │
                                                          │  └───────────────┘  │
                                                          └─────────────────────┘
                                                                  │
                                                                  ▼
                                                          ┌─────────────────────┐
                                                          │  lp-frontend-dev    │
                                                          │  lp-image-creator   │
                                                          └─────────────────────┘
```

## Descrição

A task `designSections()` é a **montagem arquitetural** da landing page. O agente **Prism** combina os componentes atômicos definidos, o copy de cada seção e os design tokens para produzir layouts detalhados de cada seção, tanto para desktop quanto para mobile, junto com especificações completas de comportamento responsivo.

Esta task transforma o que até aqui eram peças isoladas (componentes, copy, tokens) em uma **composição visual integrada**. Cada seção da landing page recebe um wireframe que define: posicionamento dos componentes, grid utilizado, espaçamentos internos e externos, hierarquia visual (Z-pattern para hero, F-pattern para conteúdo denso), e como o copy se encaixa nos componentes.

As especificações responsivas definem como cada seção se adapta em cada breakpoint — quais componentes re-organizam, quais escondem/mostram, como a tipografia escala e como o grid se transforma. Estas specs são o insumo direto para o frontend developer implementar os layouts com precisão pixel-perfect.

## Passos

1. **Carregar inputs** — Ler `componentHierarchy`, `allSectionsCopy` e `designTokens` para ter a visão completa dos materiais disponíveis.
2. **Definir ordem das seções** — Estabelecer a sequência final das seções na landing page (hero -> problem-agitation -> benefits -> features -> social-proof -> CTA -> FAQ -> footer) e validar contra o copy disponível.
3. **Projetar layout do Hero** — Definir wireframe desktop e mobile do Hero: posição do headline, subheadline, CTA, imagem/ilustração hero, e background treatment. Aplicar Z-pattern para guiar o olhar.
4. **Projetar layout de Problem-Agitation** — Definir wireframe com ênfase nos pain points, usando componentes Card ou lista para estruturar os problemas. Considerar uso de ícones e espaço negativo para impacto emocional.
5. **Projetar layout de Benefits/Features** — Definir wireframe com grid de benefícios (BenefitsGrid), usando Cards com ícones, headlines curtas e descrições. Definir variação 2-col vs 3-col por breakpoint.
6. **Projetar layout de Social Proof** — Definir wireframe com TestimonialCarousel ou grid de TestimonialCards, posição de logos de clientes, métricas e badges de confiança.
7. **Projetar layout de CTA** — Definir wireframe do CTA section com urgência visual, formulário (se aplicável), botão principal e microcopy de suporte.
8. **Projetar layout de FAQ** — Definir wireframe com componente Accordion, espaçamento entre itens, e posição de CTA secundário ao final.
9. **Projetar layout do Footer** — Definir wireframe com links de navegação, informações legais, redes sociais e marca.
10. **Mapear componentes por seção** — Para cada seção, listar exatamente quais componentes da `componentHierarchy` são usados, com quais variantes e quais props.
11. **Definir notas light/dark** — Para cada seção, documentar como o layout se adapta entre light e dark mode (background colors, image treatments, shadow adjustments).
12. **Definir espaçamento inter-seções** — Estabelecer o ritmo vertical da página com espaçamento consistente entre seções (usando tokens de spacing).
13. **Especificar comportamento responsivo** — Para cada seção e cada breakpoint (sm, md, lg, xl, 2xl), documentar: mudanças de grid, reordenamento de elementos, ajustes tipográficos, elementos que escondem/mostram.
14. **Compilar sectionLayouts e responsiveSpecs** — Gerar os arquivos finais e validar contra as post-conditions.

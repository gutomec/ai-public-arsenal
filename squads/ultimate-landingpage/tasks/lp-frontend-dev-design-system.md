---
task: implementDesignSystem()
responsavel: "Pixel"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: designTokens
    tipo: file
    obrigatorio: true
    descricao: "Tokens de design — cores, tipografia, espaçamento, sombras, bordas (source: defineDesignTokens())"
  - nome: componentSpecs
    tipo: file
    obrigatorio: true
    descricao: "Especificações dos componentes atômicos — props, estados, variantes (source: createAtomicComponents())"
  - nome: frontendProject
    tipo: file
    obrigatorio: true
    descricao: "Projeto Next.js inicializado com infraestrutura base (source: setupFrontendProject())"

Saida:
  - nome: implementedDesignSystem
    tipo: file
    obrigatorio: true
    descricao: "Design system completo implementado com todos os componentes atômicos (destination: buildSection())"
  - nome: tokensCssFile
    tipo: file
    obrigatorio: true
    descricao: "Arquivo CSS com custom properties para todos os tokens em light/dark (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] frontendProject existe e roda sem erros"
    - "[ ] designTokens existe com paleta completa (light + dark)"
    - "[ ] componentSpecs existe com especificações de todos os átomos, moléculas e organismos"
  post-conditions:
    - "[ ] CSS custom properties criadas para todos os tokens (light e dark)"
    - "[ ] Todos os componentes atômicos implementados (atoms, molecules, organisms)"
    - "[ ] Tailwind theme estendido com tokens customizados"
    - "[ ] Dark mode toggle funcional e persistente"
    - "[ ] Contraste verificado no browser (ratio mínimo WCAG AA)"
    - "[ ] Componentes renderizam corretamente em ambos os temas"

Performance:
  duration_expected: "25 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Token CSS custom property não reconhecida pelo Tailwind"
    estrategia: "Verificar sintaxe e reconfigurar referência no tailwind.config.ts"
    fallback: "Usar classe Tailwind inline como workaround temporário"
  - erro: "Componente não renderiza corretamente em dark mode"
    estrategia: "retry (max 2) verificando seletores CSS e data-theme"
    fallback: "Forçar variáveis inline para dark mode e documentar"
  - erro: "Falha de contraste WCAG AA no browser"
    estrategia: "Ajustar tokens de cor conforme contrastReport"
    fallback: "Reportar ao design architect para revisão de tokens"
  - erro: "frontendProject não compila após implementação"
    estrategia: "Analisar TypeScript errors, corrigir tipos e rebuild"
    fallback: "Isolar componente problemático e implementar incrementalmente"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com componentes implementados até o momento"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# implementDesignSystem()

## Pipeline Diagram

```
┌──────────────────┐
│ designTokens     │───┐
│ (file)           │   │
└──────────────────┘   │     ┌─────────────────────────┐     ┌────────────────────────┐
                       ├────>│                         │────>│ implementedDesignSystem │
┌──────────────────┐   │     │  implementDesignSystem  │     │ (file)                 │
│ componentSpecs   │───┤     │  @Pixel                 │     ├────────────────────────┤
│ (file)           │   │     │                         │────>│ tokensCssFile          │
└──────────────────┘   │     └─────────────────────────┘     │ (file)                 │
                       │                                     └────────────────────────┘
┌──────────────────┐   │                                            │
│ frontendProject  │───┘                                            ▼
│ (file)           │                                     ┌────────────────────┐
└──────────────────┘                                     │ buildSection()     │
                                                         │ lp-reviewer        │
                                                         └────────────────────┘
```

## Descrição

A task `implementDesignSystem()` transforma os tokens de design abstratos e as especificações de componentes em código funcional dentro do projeto Next.js. O agente **Pixel** cria CSS custom properties para todos os tokens (com variantes light/dark), implementa cada componente atômico (átomos, moléculas e organismos) usando shadcn/ui como base, e estende o tema do Tailwind CSS.

Esta é a task que materializa o design system no código — o resultado é a fundação visual sobre a qual todas as seções da landing page serão construídas. A verificação de contraste e a funcionalidade do dark mode são validadas antes da entrega.

## Passos

1. **Mapear tokens para CSS custom properties** — Converter os designTokens em variáveis CSS (`--color-primary`, `--font-heading`, `--spacing-section`, etc.) para os temas light e dark.
2. **Criar arquivo de tokens CSS** — Gerar o arquivo `globals.css` (ou `tokens.css`) com `:root` e `[data-theme="dark"]` (ou `.dark`) contendo todas as variáveis.
3. **Estender Tailwind theme** — Configurar `tailwind.config.ts` para referenciar as CSS custom properties, criando classes utilitárias que respeitem os tokens.
4. **Implementar átomos** — Criar componentes base: Button, Input, Badge, Typography (H1-H6, P, Span), Icon, Link, Image.
5. **Implementar moléculas** — Criar componentes compostos: Card, FormField, NavItem, TestimonialCard, BenefitCard, CTABlock.
6. **Implementar organismos** — Criar componentes complexos: Header/Navbar, Footer, HeroSection shell, SectionWrapper, ContactForm.
7. **Configurar dark mode** — Garantir que next-themes está funcional, o toggle persiste a preferência, e todos os componentes alternam corretamente.
8. **Verificar contraste** — Testar combinações de cor primárias em ambos os temas usando ferramentas de browser para WCAG AA compliance (ratio >= 4.5:1 para texto, >= 3:1 para elementos grandes).
9. **Testar componentes** — Renderizar cada componente isoladamente verificando estados (default, hover, focus, disabled, active) em light e dark.
10. **Validar post-conditions** — Confirmar que todos os componentes estão implementados, o dark mode funciona e o contraste está adequado.

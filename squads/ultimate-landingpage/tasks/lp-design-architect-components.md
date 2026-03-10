---
task: createAtomicComponents()
responsavel: "Prism"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: designTokens
    tipo: file
    obrigatorio: true
    descricao: "Sistema completo de design tokens — cores, tipografia, espaçamento, sombras, breakpoints (source: defineDesignTokens())"
  - nome: dsSelection
    tipo: file
    obrigatorio: true
    descricao: "Documento de seleção do design system com escolha e configuração base (source: selectDesignSystem())"

Saida:
  - nome: componentSpecs
    tipo: file
    obrigatorio: true
    descricao: "Especificações completas de todos os componentes atômicos — props, variantes, estados e acessibilidade (destination: lp-frontend-dev)"
  - nome: componentHierarchy
    tipo: file
    obrigatorio: true
    descricao: "Hierarquia de composição dos componentes — quais Atoms compõem Molecules, quais Molecules compõem Organisms (destination: designSections())"

Checklist:
  pre-conditions:
    - "[ ] designTokens existe com todas as categorias de tokens definidas (cores, tipografia, espaçamento, borders, shadows, breakpoints)"
    - "[ ] dsSelection existe com design system base e configuração"
  post-conditions:
    - "[ ] Atoms especificados: Button, Input, Label, Icon, Badge, Avatar — cada um com props, variantes e estados"
    - "[ ] Molecules especificadas: FormField, SearchBar, Card, NavItem, TestimonialCard — cada uma com composição de Atoms"
    - "[ ] Organisms especificados: Header, HeroSection, BenefitsGrid, TestimonialCarousel, Footer — cada um com composição de Molecules"
    - "[ ] Cada componente tem props tipadas documentadas"
    - "[ ] Cada componente tem variantes listadas (size, color, variant)"
    - "[ ] Cada componente tem estados documentados (default, hover, focus, active, disabled, loading)"
    - "[ ] Requisitos de acessibilidade documentados por componente (ARIA roles, labels, keyboard navigation)"
    - "[ ] componentHierarchy mapeia a árvore de composição completa"

Performance:
  duration_expected: "12 minutes"
  cacheable: true
  parallelizable: false

Error_Handling:
  - erro: "designTokens ausente ou incompleto"
    estrategia: "abort + solicitar execução de defineDesignTokens()"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Token referenciado por componente não existe na paleta"
    estrategia: "Mapear para token semântico mais próximo disponível"
    fallback: "Documentar gap no token e usar valor default do design system"
  - erro: "Conflito de acessibilidade em estado de componente (ex: focus invisível)"
    estrategia: "retry (max 2) ajustando contraste e border do estado"
    fallback: "Usar estilo de focus default do browser e documentar limitação"
  - erro: "Hierarquia de composição circular (Atom referencia Organism)"
    estrategia: "Reestruturar componente quebrando dependência circular"
    fallback: "Documentar anomalia e isolar componente problemático"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# createAtomicComponents()

## Pipeline Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  designTokens    │──────>│                      │──────>│  componentSpecs     │
│  (file)          │       │  createAtomic        │       │  (file)             │
│  ┌────────────┐  │       │  Components          │       │  ┌───────────────┐  │
│  │ colors     │  │       │  @Prism              │       │  │ Atoms         │  │
│  │ typography │  │       │                      │       │  │ Molecules     │  │
│  │ spacing    │  │       │                      │       │  │ Organisms     │  │
│  └────────────┘  │       └──────────────────────┘       │  └───────────────┘  │
├──────────────────┤               │                      ├─────────────────────┤
│  dsSelection     │──────>        │                      │  componentHierarchy │
│  (file)          │               │                      │  (file)             │
└──────────────────┘               │                      └─────────────────────┘
                                   │                              │
                                   ▼                              ▼
                           ┌──────────────┐               ┌─────────────────────┐
                           │  Atomic      │               │  lp-frontend-dev    │
                           │  Design      │               │  designSections()   │
                           │  Methodology │               └─────────────────────┘
                           └──────────────┘
```

## Descrição

A task `createAtomicComponents()` aplica a **metodologia Atomic Design** para especificar todos os componentes visuais da landing page em três níveis hierárquicos: Atoms, Molecules e Organisms. O agente **Prism** usa os design tokens e o design system selecionado como base para definir cada componente com precisão suficiente para implementação direta pelo frontend.

**Atoms** são os blocos elementares (Button, Input, Label, Icon, Badge, Avatar) — componentes indivisíveis que não contêm outros componentes. **Molecules** são composições de Atoms que formam unidades funcionais (FormField = Label + Input, Card = imagem + texto + Badge, TestimonialCard = Avatar + texto + rating). **Organisms** são composições de Molecules que formam seções completas (Header = NavItem[] + Button, HeroSection = heading + subheading + CTA + imagem).

Cada componente é especificado com: props tipadas, variantes (size, color, style), estados interativos (default, hover, focus, active, disabled, loading) e requisitos de acessibilidade (ARIA roles, labels, keyboard navigation). Esta especificação serve como contrato entre design e desenvolvimento.

## Passos

1. **Carregar designTokens e dsSelection** — Entender os tokens disponíveis e as convenções do design system base para garantir que os componentes sejam nativamente compatíveis.
2. **Inventariar componentes necessários** — A partir das seções planejadas da landing page, listar todos os componentes UI necessários e classificá-los em Atoms, Molecules e Organisms.
3. **Especificar Atoms** — Para cada Atom (Button, Input, Label, Icon, Badge, Avatar):
   - Definir props tipadas (ex: Button: variant, size, disabled, loading, icon, children)
   - Listar variantes (ex: Button: default, secondary, outline, ghost, link, destructive)
   - Documentar estados (default, hover, focus, active, disabled, loading)
   - Mapear tokens utilizados (ex: Button default → bg: primary, text: primary-foreground)
   - Definir requisitos de acessibilidade (ex: Button → role="button", aria-disabled, keyboard: Enter/Space)
4. **Especificar Molecules** — Para cada Molecule (FormField, SearchBar, Card, NavItem, TestimonialCard):
   - Definir composição de Atoms (quais Atoms são usados e como)
   - Definir props próprias (que combinam ou estendem props dos Atoms)
   - Documentar variantes e estados compostos
   - Definir acessibilidade composta (ex: FormField → label associado via htmlFor/id)
5. **Especificar Organisms** — Para cada Organism (Header, HeroSection, BenefitsGrid, TestimonialCarousel, Footer):
   - Definir composição de Molecules e Atoms
   - Definir layout interno (flex, grid, posicionamento)
   - Documentar comportamento responsivo (como o Organism se adapta em mobile/tablet/desktop)
   - Definir acessibilidade estrutural (landmarks, headings, navigation)
6. **Construir componentHierarchy** — Mapear a árvore de composição completa mostrando as dependências entre todos os níveis (quais Atoms compõem quais Molecules, quais Molecules compõem quais Organisms).
7. **Validar cobertura** — Verificar que todos os componentes necessários para as seções da landing page estão especificados e que não há lacunas na hierarquia.
8. **Validar acessibilidade** — Revisar que cada componente tem requisitos de acessibilidade documentados e que a hierarquia de headings e landmarks faz sentido no contexto da página completa.
9. **Compilar componentSpecs** — Gerar o documento final com todas as especificações organizadas por nível atômico (Atoms -> Molecules -> Organisms).
10. **Validar contra post-conditions** — Verificar que todos os componentes listados nas post-conditions estão presentes com props, variantes, estados e acessibilidade documentados.

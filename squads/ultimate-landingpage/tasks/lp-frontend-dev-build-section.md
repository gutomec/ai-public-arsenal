---
task: buildSection()
responsavel: "Pixel"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: sectionName
    tipo: string
    obrigatorio: true
    descricao: "Nome da seção a ser construída — hero, benefits, testimonials, etc. (source: orchestrator)"
  - nome: sectionCopy
    tipo: file
    obrigatorio: true
    descricao: "Copy da seção com textos, headlines e CTAs (source: writeSectionCopy())"
  - nome: sectionLayouts
    tipo: file
    obrigatorio: true
    descricao: "Layout da seção com grid, espaçamento e hierarquia visual (source: designSections())"
  - nome: sectionImages
    tipo: array<file>
    obrigatorio: false
    descricao: "Imagens da seção se aplicável (source: generateSectionImages())"
  - nome: implementedDesignSystem
    tipo: file
    obrigatorio: true
    descricao: "Design system implementado com componentes atômicos disponíveis (source: implementDesignSystem())"

Saida:
  - nome: sectionComponent
    tipo: file
    obrigatorio: true
    descricao: "Componente React da seção completo e funcional (destination: assemblePage())"
  - nome: sectionA11yReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de acessibilidade da seção — ARIA, keyboard, semântica (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] implementedDesignSystem existe e componentes atômicos estão disponíveis"
    - "[ ] sectionCopy existe para a seção-alvo"
    - "[ ] sectionLayouts existe com layout definido para a seção-alvo"
  post-conditions:
    - "[ ] Seção renderiza corretamente em light e dark mode"
    - "[ ] HTML semântico utilizado (section, article, heading levels corretos)"
    - "[ ] ARIA labels presentes em elementos interativos"
    - "[ ] Seção navegável por teclado (Tab, Enter, Escape)"
    - "[ ] Responsivo de 320px (mobile) a 1440px+ (desktop)"
    - "[ ] Alt text em todas as imagens"
    - "[ ] Relatório de a11y gerado"

Performance:
  duration_expected: "15 minutes"
  cacheable: false
  parallelizable: true

Error_Handling:
  - erro: "Componente do design system não encontrado no implementedDesignSystem"
    estrategia: "retry (max 2) verificando imports e aliases de path"
    fallback: "Implementar componente inline na seção e documentar gap"
  - erro: "Violação de acessibilidade (ARIA label faltante, heading inválido)"
    estrategia: "Corrigir imediatamente e re-verificar"
    fallback: "Documentar no sectionA11yReport para correção posterior"
  - erro: "Layout quebra em mobile (overflow, sobreposição)"
    estrategia: "retry (max 2) ajustando grid e flexbox para breakpoint mobile"
    fallback: "Simplificar layout mobile (stack vertical) e documentar"
  - erro: "Imagem de seção ausente ou corrompida"
    estrategia: "Usar placeholder SVG com cores dos designTokens"
    fallback: "Construir seção sem imagem e sinalizar ao image creator"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com seção parcialmente construída"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# buildSection()

## Pipeline Diagram

```
┌───────────────────┐
│ sectionName       │───┐
│ (string)          │   │
├───────────────────┤   │
│ sectionCopy       │───┤
│ (file)            │   │     ┌──────────────────┐     ┌────────────────────┐
├───────────────────┤   ├────>│                  │────>│ sectionComponent   │
│ sectionLayouts    │───┤     │  buildSection    │     │ (file)             │
│ (file)            │   │     │  @Pixel          │     ├────────────────────┤
├───────────────────┤   │     │                  │────>│ sectionA11yReport  │
│ sectionImages?    │───┤     │  [ITERATIVA]     │     │ (file)             │
│ (array<file>)     │   │     └──────────────────┘     └────────────────────┘
├───────────────────┤   │                                      │
│ implemented       │───┘                                      ▼
│ DesignSystem      │                               ┌────────────────────┐
│ (file)            │                               │ assemblePage()     │
└───────────────────┘                               │ lp-reviewer        │
                                                    └────────────────────┘

Nota: Chamada uma vez POR SEÇÃO — hero, benefits, testimonials, etc.
```

## Descrição

A task `buildSection()` constrói um componente React individual para uma seção específica da landing page. O agente **Pixel** recebe o nome da seção, seu copy, layout, imagens (se aplicável) e o design system implementado, produzindo um componente completo, acessível e responsivo.

Esta é uma task **iterativa** — é chamada uma vez por seção (hero, benefits, solution-demo, testimonials, FAQ, CTA final, footer, etc.). Cada execução produz um componente independente pronto para ser montado na página final. A paralelização é possível: seções sem dependência entre si podem ser construídas simultaneamente.

## Passos

1. **Identificar seção-alvo** — Ler `sectionName` e localizar o layout e copy correspondentes nos inputs.
2. **Selecionar componentes do design system** — Mapear quais átomos, moléculas e organismos do implementedDesignSystem serão utilizados na seção.
3. **Criar estrutura do componente** — Definir o componente React com TypeScript, props tipadas e estrutura semântica (section, headings, article).
4. **Implementar layout** — Aplicar o grid, espaçamento e hierarquia visual definidos no sectionLayouts usando Tailwind CSS.
5. **Inserir copy** — Integrar headline, body text, CTAs e demais textos do sectionCopy nos elementos corretos.
6. **Integrar imagens** — Se sectionImages existirem, posicionar imagens com `next/image`, alt text descritivo e loading otimizado (lazy/eager conforme posição).
7. **Implementar responsividade** — Garantir comportamento correto em breakpoints: mobile (320px), tablet (768px), desktop (1024px), large (1440px+).
8. **Adicionar acessibilidade** — Inserir ARIA labels em interativos, garantir heading hierarchy, landmark roles, focus indicators visíveis.
9. **Testar light/dark** — Verificar renderização correta em ambos os temas, incluindo imagens e backgrounds.
10. **Gerar relatório a11y** — Documentar verificações realizadas (semântica, ARIA, keyboard, contraste) no sectionA11yReport.

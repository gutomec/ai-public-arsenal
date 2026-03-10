---
task: generateSectionImages()
responsavel: "Lens"
responsavel_type: Agente
atomic_layer: Atom

Entrada:
  - nome: designTokens
    tipo: file
    obrigatorio: true
    descricao: "Paleta de cores, tipografia e tokens visuais definidos (source: defineDesignTokens())"
  - nome: sectionLayouts
    tipo: file
    obrigatorio: true
    descricao: "Layouts das seções com indicação de quais precisam de imagens (source: designSections())"
  - nome: heroImageVariants
    tipo: array<file>
    obrigatorio: true
    descricao: "Variantes de imagem do hero para manter coerência visual (source: generateHeroImage())"

Saida:
  - nome: sectionImages
    tipo: array<file>
    obrigatorio: true
    descricao: "Imagens geradas para cada seção que necessita de visual — benefits, testimonials, solution-demo (destination: lp-frontend-dev)"
  - nome: imageGenerationLog
    tipo: file
    obrigatorio: true
    descricao: "Log dos prompts, ferramentas e decisões de geração por seção (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] heroImageVariants existem com variante recomendada identificada (para coerência de estilo)"
    - "[ ] sectionLayouts identificam quais seções precisam de imagens"
    - "[ ] designTokens existe com paleta completa"
  post-conditions:
    - "[ ] Imagens geradas para seções de benefits, testimonials e solution-demo"
    - "[ ] Coerência visual mantida com a variante hero selecionada"
    - "[ ] Prompts documentados no imageGenerationLog"
    - "[ ] Imagens dimensionadas corretamente para os layouts definidos"
    - "[ ] Estilo visual consistente entre todas as seções"

Performance:
  duration_expected: "20 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "MCP de geração de imagem falha para seção específica"
    estrategia: "retry (max 2) com ferramenta alternativa"
    fallback: "Usar placeholder estilizado com cores dos designTokens"
  - erro: "Prompt rejeitado por política de conteúdo"
    estrategia: "Reformular prompt removendo termos sensíveis"
    fallback: "Gerar imagem genérica abstrata alinhada com a paleta"
  - erro: "Coerência visual com hero não atingida"
    estrategia: "retry (max 2) usando hero como reference image no prompt"
    fallback: "Documentar divergência estilística e entregar com nota"
  - erro: "Dimensões incorretas para o layout definido"
    estrategia: "Redimensionar/recortar mantendo composição principal"
    fallback: "Gerar nova imagem com aspect ratio correto explícito no prompt"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com imagens geradas até o momento"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# generateSectionImages()

## Pipeline Diagram

```
┌──────────────────┐
│ designTokens     │───┐
│ (file)           │   │
└──────────────────┘   │     ┌─────────────────────────┐     ┌──────────────────┐
                       ├────>│                         │────>│ sectionImages    │
┌──────────────────┐   │     │  generateSectionImages  │     │ (array<file>)    │
│ sectionLayouts   │───┤     │  @Lens                  │     ├──────────────────┤
│ (file)           │   │     │                         │────>│ imageGeneration  │
└──────────────────┘   │     │  Tools:                 │     │ Log (file)       │
                       │     │  nano-banana-pro        │     └──────────────────┘
┌──────────────────┐   │     │  dalle3                 │            │
│ heroImageVariants│───┘     │  flux                   │            ▼
│ (array<file>)    │         │  fal-video              │     ┌──────────────────┐
└──────────────────┘         └─────────────────────────┘     │ lp-frontend-dev  │
       ▲                                                     │ lp-reviewer      │
       │ (coerência visual)                                  └──────────────────┘
```

## Descrição

A task `generateSectionImages()` cria os assets visuais para todas as seções da landing page que necessitam de imagens — tipicamente benefits, testimonials e solution-demo. O agente **Lens** utiliza a variante hero selecionada como referência de estilo para garantir coerência visual ao longo de toda a página.

Diferente da geração do hero (que produz variantes para escolha), esta task gera imagens definitivas para cada seção, respeitando os layouts definidos pelo designer e mantendo consistência de paleta, estilo e tom visual. O log documenta as decisões por seção para rastreabilidade.

## Passos

1. **Analisar hero selecionado** — Identificar a variante hero recomendada e extrair o estilo visual dominante (paleta, textura, composição, realismo vs. ilustração).
2. **Mapear seções que precisam de imagens** — Ler sectionLayouts para identificar quais seções requerem assets visuais e seus requisitos dimensionais.
3. **Definir estilo-guia** — Criar um prompt-base que capture o estilo visual do hero para garantir coerência em todas as imagens de seção.
4. **Gerar imagens de benefits** — Criar visuais para a seção de benefícios, tipicamente ícones estilizados ou ilustrações que comuniquem cada benefício.
5. **Gerar imagens de testimonials** — Criar visuais de apoio para a seção de depoimentos — avatars, backgrounds ou elementos decorativos.
6. **Gerar imagens de solution-demo** — Criar visuais demonstrativos do produto/solução em ação, como mockups, screenshots estilizados ou diagramas.
7. **Verificar coerência visual** — Comparar todas as imagens geradas com o hero e entre si, ajustando prompts e regenerando se necessário.
8. **Dimensionar para layouts** — Garantir que as imagens atendem às dimensões especificadas nos sectionLayouts.
9. **Documentar no log** — Registrar prompts, ferramentas utilizadas e decisões de estilo para cada seção no imageGenerationLog.
10. **Validar post-conditions** — Confirmar coerência, completude e documentação antes de entregar os artefatos.

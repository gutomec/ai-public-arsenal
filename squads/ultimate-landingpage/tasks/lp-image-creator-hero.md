---
task: generateHeroImage()
responsavel: "Lens"
responsavel_type: Agente
atomic_layer: Atom

Entrada:
  - nome: designTokens
    tipo: file
    obrigatorio: true
    descricao: "Paleta de cores, tipografia e tokens visuais definidos (source: defineDesignTokens())"
  - nome: sectionCopy
    tipo: file
    obrigatorio: true
    descricao: "Copy da seção hero para contexto visual — headline, subheadline, CTA (source: writeSectionCopy('hero'))"
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto com USP, mercado-alvo e posicionamento (source: discoverProduct())"

Saida:
  - nome: heroImageVariants
    tipo: array<file>
    obrigatorio: true
    descricao: "3-4 variantes de imagem hero geradas com diferentes ferramentas (destination: lp-frontend-dev)"
  - nome: imageGenerationLog
    tipo: file
    obrigatorio: true
    descricao: "Log detalhado dos prompts utilizados, ferramentas empregadas e racional de seleção (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] designTokens existe e contém paleta de cores completa"
    - "[ ] sectionCopy do hero existe com headline, subheadline e CTA"
    - "[ ] productBrief existe com USP e mercado-alvo definidos"
  post-conditions:
    - "[ ] 3-4 variantes de imagem hero geradas usando ferramentas diferentes (nano-banana-pro, dalle3, flux)"
    - "[ ] Todos os prompts documentados no imageGenerationLog"
    - "[ ] Variante recomendada identificada com racional de escolha"
    - "[ ] Imagens alinhadas com a paleta de cores dos designTokens"
    - "[ ] Imagens coerentes com o tom e posicionamento do productBrief"

Performance:
  duration_expected: "15 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "MCP de geração de imagem falha (nano-banana-pro, dalle3 ou flux)"
    estrategia: "retry (max 2) com ferramenta alternativa"
    fallback: "Usar ferramentas restantes para gerar variantes mínimas (2 em vez de 3-4)"
  - erro: "Prompt rejeitado por política de conteúdo"
    estrategia: "Reformular prompt removendo termos sensíveis"
    fallback: "Usar abordagem visual abstrata/minimalista sem elementos problemáticos"
  - erro: "Imagem gerada não alinha com designTokens (paleta incorreta)"
    estrategia: "retry (max 2) com prompt mais explícito sobre cores"
    fallback: "Aplicar correção de cor em pós-processamento via edit_image"
  - erro: "Todas as ferramentas de geração indisponíveis"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador e sugerir uso de placeholder gradient"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com variantes geradas até o momento"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# generateHeroImage()

## Pipeline Diagram

```
┌──────────────┐
│ designTokens │───┐
│ (file)       │   │
└──────────────┘   │     ┌────────────────────┐     ┌─────────────────────┐
                   ├────>│                    │────>│ heroImageVariants   │
┌──────────────┐   │     │  generateHeroImage │     │ (array<file>)       │
│ sectionCopy  │───┤     │  @Lens             │     ├─────────────────────┤
│ (file)       │   │     │                    │────>│ imageGenerationLog  │
└──────────────┘   │     │  Tools:            │     │ (file)              │
                   │     │  nano-banana-pro   │     └─────────────────────┘
┌──────────────┐   │     │  dalle3            │            │
│ productBrief │───┘     │  flux              │            ▼
│ (file)       │         │  fal-video         │     ┌─────────────────────┐
└──────────────┘         └────────────────────┘     │ lp-frontend-dev     │
                                                    │ lp-reviewer         │
                                                    └─────────────────────┘
```

## Descrição

A task `generateHeroImage()` é responsável por criar múltiplas variantes visuais para a seção hero da landing page. O agente **Lens** utiliza diversas ferramentas de geração de imagem (nano-banana-pro, dalle3, flux, fal-video) para produzir 3-4 opções distintas, cada uma explorando uma abordagem visual diferente enquanto mantém coerência com os tokens de design e o posicionamento do produto.

O objetivo é fornecer ao time opções reais de escolha — não variações mínimas, mas abordagens visuais genuinamente distintas que comuniquem a proposta de valor do hero. O log de geração documenta cada prompt e ferramenta utilizada, permitindo rastreabilidade e iteração futura.

## Passos

1. **Analisar inputs** — Ler os designTokens (paleta, tipografia), o sectionCopy do hero (headline, subheadline, CTA) e o productBrief (USP, tom, mercado-alvo) para extrair contexto visual.
2. **Definir direção visual** — Estabelecer 3-4 direções visuais distintas baseadas no posicionamento do produto (ex: minimalista, lifestyle, abstrato, product-shot).
3. **Construir prompts** — Para cada direção visual, elaborar um prompt detalhado incorporando paleta de cores, tom da marca e contexto do hero copy.
4. **Gerar com nano-banana-pro** — Criar a primeira variante usando Gemini via nano-banana-pro, priorizando aderência à paleta.
5. **Gerar com dalle3** — Criar a segunda variante usando DALL-E 3 via dalle3, explorando fotorrealismo ou estilo editorial.
6. **Gerar com flux** — Criar a terceira variante usando Flux, aproveitando sua aderência a prompt e tipografia.
7. **Gerar variante adicional (opcional)** — Se necessário, usar fal-video (imagen4, ideogram, recraft) para uma quarta variante com abordagem diferenciada.
8. **Avaliar e recomendar** — Comparar todas as variantes contra os designTokens e o tom do productBrief, identificar a variante recomendada com racional documentado.
9. **Documentar no log** — Registrar todos os prompts, ferramentas, parâmetros e o racional de recomendação no imageGenerationLog.
10. **Validar post-conditions** — Confirmar que todas as condições de saída foram atendidas antes de entregar os artefatos.

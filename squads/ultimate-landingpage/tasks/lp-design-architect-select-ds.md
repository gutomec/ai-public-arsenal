---
task: selectDesignSystem()
responsavel: "Prism"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto com USP, mercado-alvo, tom/voz e preferências visuais (source: discoverProduct())"
  - nome: userPreferences
    tipo: object
    obrigatorio: false
    descricao: "Preferências do usuário para stack visual — design system preferido, estilo, referências (source: elicitRequirements())"
  - nome: visualReferences
    tipo: array
    obrigatorio: false
    descricao: "Referências visuais de concorrentes e benchmarks coletadas na pesquisa (source: researchCompetitors())"

Saida:
  - nome: dsSelection
    tipo: file
    obrigatorio: true
    descricao: "Documento de seleção do design system com escolha, justificativa e configuração base (destination: defineDesignTokens())"
  - nome: dsRationale
    tipo: string
    obrigatorio: true
    descricao: "Resumo da justificativa de seleção para registro no documento de ideação (destination: IDEATION.md)"

Checklist:
  pre-conditions:
    - "[ ] productBrief existe com preferências de marca/visual definidas"
    - "[ ] productBrief contém tipo de produto e público-alvo"
  post-conditions:
    - "[ ] Design system base selecionado (shadcn/ui, Chakra, Material, Mantine ou Custom)"
    - "[ ] Rationale documenta por que o DS foi escolhido sobre as alternativas"
    - "[ ] Seleção considera tipo de produto e identidade de marca"
    - "[ ] Seleção considera requisitos de acessibilidade"
    - "[ ] Configuração base do DS documentada (tema, variantes, extensões necessárias)"
    - "[ ] dsRationale registrado em IDEATION.md"

Performance:
  duration_expected: "5 minutes"
  cacheable: true
  parallelizable: false

Error_Handling:
  - erro: "productBrief sem preferências visuais ou identidade de marca"
    estrategia: "Inferir estilo visual do tipo de produto e público-alvo"
    fallback: "Selecionar shadcn/ui como default seguro (maior customizabilidade)"
  - erro: "userPreferences conflitam com requisitos de acessibilidade"
    estrategia: "Priorizar acessibilidade e adaptar preferências do usuário"
    fallback: "Documentar conflito e justificar escolha no dsRationale"
  - erro: "Design system preferido pelo usuário indisponível ou incompatível"
    estrategia: "retry (max 2) avaliando alternativa mais próxima"
    fallback: "Selecionar substituto equivalente e documentar razão da troca"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# selectDesignSystem()

## Pipeline Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  productBrief    │──────>│                      │──────>│  dsSelection        │
│  (file)          │       │                      │       │  (file)             │
├──────────────────┤       │  selectDesignSystem  │       ├─────────────────────┤
│  userPreferences │──────>│  @Prism              │──────>│  dsRationale        │
│  (object)?       │       │                      │       │  (string)           │
├──────────────────┤       │                      │       └─────────────────────┘
│  visualReferences│──────>│                      │               │
│  (array)?        │       └──────────────────────┘               ▼
└──────────────────┘                                      ┌─────────────────────┐
                                                          │  defineDesignTokens │
                                                          │  IDEATION.md        │
                                                          └─────────────────────┘
```

## Descrição

A task `selectDesignSystem()` é a **decisão estratégica de fundação visual** da landing page. O agente **Prism** analisa o briefing do produto, as preferências do usuário e as referências visuais dos concorrentes para selecionar o design system mais adequado como base da implementação.

A seleção não é meramente técnica — ela considera o tipo de produto (SaaS, e-commerce, app, serviço), a identidade de marca desejada (minimalista, vibrante, corporativo, playful), os requisitos de acessibilidade (WCAG AA/AAA) e a capacidade de customização do DS escolhido.

As opções avaliadas são: **shadcn/ui** (alta customização, Tailwind-native), **Chakra UI** (developer-friendly, flexível), **Material UI** (enterprise, estabelecido), **Mantine** (moderno, feature-rich) ou **Custom** (quando nenhum DS existente atende aos requisitos visuais). O output alimenta diretamente `defineDesignTokens()`, que construirá o sistema de tokens sobre a base escolhida.

## Passos

1. **Analisar productBrief** — Extrair tipo de produto, identidade de marca, público-alvo e quaisquer preferências visuais declaradas.
2. **Processar userPreferences** — Se fornecidas, integrar as preferências explícitas do usuário (DS preferido, estilo, restrições técnicas).
3. **Avaliar visualReferences** — Analisar as referências visuais dos concorrentes para identificar padrões de design do setor e oportunidades de diferenciação.
4. **Mapear requisitos do DS** — Listar requisitos obrigatórios: acessibilidade, responsividade, dark mode, animações, componentes necessários, nível de customização.
5. **Avaliar candidatos** — Analisar cada DS candidato (shadcn/ui, Chakra, Material, Mantine, Custom) contra os requisitos mapeados, atribuindo scores.
6. **Selecionar DS base** — Escolher o DS com melhor fit geral, priorizando: adequação à identidade de marca > customizabilidade > ecosistema > performance.
7. **Documentar rationale** — Escrever justificativa clara explicando por que o DS selecionado é superior às alternativas para este caso específico.
8. **Definir configuração base** — Documentar o setup inicial do DS: tema base, variantes necessárias, extensões/plugins, integrações com Tailwind.
9. **Gerar dsSelection** — Compilar o documento de seleção completo com escolha, rationale, configuração e roadmap de customização.
10. **Registrar em IDEATION.md** — Gravar o `dsRationale` no documento de ideação para rastreabilidade da decisão.

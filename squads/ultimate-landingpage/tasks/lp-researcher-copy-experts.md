---
task: researchCopyExperts()
responsavel: "Scout"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto para contextualizar a pesquisa de especialistas (source: discoverProduct())"
  - nome: audienceProfile
    tipo: file
    obrigatorio: false
    descricao: "Perfil de audiência para refinar seleção de frameworks (source: identifyAudience())"

Saida:
  - nome: copyExpertsReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório com especialistas de copywriting e seus frameworks relevantes (destination: synthesizeResearch() + lp-copywriter)"
  - nome: recommendedFrameworks
    tipo: array
    obrigatorio: true
    descricao: "Frameworks de copy recomendados com mapeamento para seções da landing page (destination: lp-copywriter)"

Checklist:
  pre-conditions:
    - "[ ] productBrief existe"
  post-conditions:
    - "[ ] Mínimo 3 especialistas de copywriting world-class identificados"
    - "[ ] Frameworks relevantes de cada especialista documentados"
    - "[ ] Mapeamento framework-para-seção fornecido"
    - "[ ] Justificativa de relevância para o produto/nicho incluída"

Performance:
  duration_expected: "12 minutes"
  cacheable: true
  parallelizable: true

Tools:
  - WebSearch
  - WebFetch

Error_Handling:
  - erro: "WebSearch não retorna frameworks relevantes para o nicho"
    estrategia: "retry (max 2) com termos de busca mais genéricos"
    fallback: "Usar frameworks clássicos universais (PAS, AIDA, BAB) como base"
  - erro: "WebFetch falha ao acessar conteúdo de especialista"
    estrategia: "retry (max 2) com URL alternativa"
    fallback: "Usar conhecimento base sobre o especialista e documentar fonte indisponível"
  - erro: "Menos de 3 especialistas relevantes identificados"
    estrategia: "Expandir busca para especialistas modernos e de nicho adjacente"
    fallback: "Incluir especialistas clássicos universais (Ogilvy, Schwartz, Cialdini)"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com dados parciais coletados"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# researchCopyExperts()

## Pipeline Diagram

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  productBrief   │──────>│                      │──────>│  copyExpertsReport      │
│  (file)         │       │  researchCopyExperts │       │  (file)                 │
├─────────────────┤       │  @Scout              │       ├─────────────────────────┤
│  audienceProfile│──────>│                      │──────>│  recommendedFrameworks   │
│  ? (file)       │       │  [WebSearch,         │       │  (array)                │
│                 │       │   WebFetch]          │       └─────────────────────────┘
└─────────────────┘       └──────────────────────┘               │
                                                                 ▼
                                                     ┌───────────────────────┐
                                                     │  synthesizeResearch() │
                                                     │  lp-copywriter       │
                                                     └───────────────────────┘
```

## Descrição

A task `researchCopyExperts()` identifica os maiores especialistas mundiais em copywriting e seus frameworks mais relevantes para o produto/nicho do usuário. O agente **Scout** pesquisa referências como David Ogilvy, Eugene Schwartz, Gary Halbert, Joanna Wiebe, entre outros, e seleciona os frameworks mais adequados ao contexto.

O diferencial desta task é o **mapeamento framework-para-seção** — cada framework recomendado é associado a uma seção específica da landing page (ex: PAS para hero, AIDA para above-the-fold, Before-After-Bridge para testimonials). Isso dá ao copywriter uma base teórica sólida e testada para cada parte da página.

Esta é uma task Molecule — combina pesquisa externa com análise contextual, sem a complexidade multi-fase de um Organism.

## Passos

1. **Carregar productBrief** — Extrair tipo de produto, nicho, tom de voz e posicionamento para contextualizar a pesquisa.
2. **Carregar audienceProfile** (se disponível) — Usar dados de personas e pain points para refinar a seleção de frameworks.
3. **Identificar especialistas relevantes** — Usar `WebSearch` para encontrar os maiores copywriters e suas contribuições:
   - Copywriters clássicos (Ogilvy, Schwartz, Halbert, Caples, Hopkins)
   - Copywriters modernos (Wiebe, Klaff, Cialdini, Hormozi)
   - Especialistas de nicho relevantes ao produto
4. **Pesquisar frameworks de cada especialista** — Para cada especialista, documentar:
   - Frameworks principais (PAS, AIDA, BAB, 4Ps, StoryBrand, etc.)
   - Princípios-chave de conversão
   - Casos de uso onde o framework se destaca
5. **Avaliar relevância por contexto** — Filtrar frameworks pela adequação ao:
   - Tipo de produto (SaaS, e-commerce, serviço, info-produto)
   - Estágio de awareness do público (unaware → most aware)
   - Tom de voz definido no productBrief
6. **Mapear framework para seção** — Criar associação direta:
   - Hero section: qual framework usar para headline e sub-headline
   - Features/Benefits: qual framework para apresentação de benefícios
   - Social Proof: qual abordagem para prova social
   - CTA: qual técnica de persuasão para call-to-action
   - Objeções: qual framework para tratamento de dúvidas
7. **Compilar copyExpertsReport** — Gerar relatório com perfil de cada especialista, frameworks documentados e justificativa de relevância.
8. **Gerar recommendedFrameworks** — Exportar array estruturado com framework, seção-alvo, especialista de origem e prioridade.
9. **Validar post-conditions** — Confirmar mínimo de 3 especialistas, frameworks documentados e mapeamento completo.

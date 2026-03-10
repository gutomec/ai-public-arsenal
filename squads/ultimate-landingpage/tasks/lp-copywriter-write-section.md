---
task: writeSectionCopy()
responsavel: "Quill"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: sectionName
    tipo: string
    obrigatorio: true
    descricao: "Nome da seção a ser escrita — hero, problem-agitation, benefits, social-proof, cta, etc. (source: orchestrator)"
  - nome: researchSynthesis
    tipo: file
    obrigatorio: true
    descricao: "Síntese consolidada das pesquisas de mercado, concorrência e público-alvo (source: synthesizeResearch())"
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto com USP, mercado-alvo, tom/voz e posicionamento (source: discoverProduct())"
  - nome: recommendedFrameworks
    tipo: array
    obrigatorio: true
    descricao: "Frameworks de copywriting recomendados — AIDA, PAS, BAB, 4Ps, StoryBrand, etc. (source: researchCopyExperts())"

Saida:
  - nome: sectionCopy
    tipo: file
    obrigatorio: true
    descricao: "Copy completo da seção com headline, subheadline, body, CTA e microcopy (destination: lp-design-architect + lp-frontend-dev)"
  - nome: headlineVariants
    tipo: array
    obrigatorio: true
    descricao: "Mínimo 5 variantes de headline para testes A/B e revisão (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] researchSynthesis existe e foi gerado por synthesizeResearch()"
    - "[ ] sectionName é válido (hero, problem-agitation, benefits, social-proof, features, cta, faq, footer)"
    - "[ ] productBrief existe com USP e tom/voz definidos"
    - "[ ] recommendedFrameworks contém pelo menos 1 framework aplicável"
  post-conditions:
    - "[ ] Copy contém headline principal"
    - "[ ] Copy contém subheadline de suporte"
    - "[ ] Copy contém body text completo"
    - "[ ] Copy contém CTA (Call to Action) com texto do botão e microcopy"
    - "[ ] Framework de copywriting utilizado está documentado no output"
    - "[ ] Mínimo 5 variantes de headline geradas em headlineVariants"
    - "[ ] Tom/voz consistente com productBrief"

Performance:
  duration_expected: "8 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "researchSynthesis ausente ou incompleta"
    estrategia: "abort + solicitar execução de synthesizeResearch()"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Nenhum framework aplicável para a seção solicitada"
    estrategia: "retry (max 2) adaptando frameworks genéricos ao contexto"
    fallback: "Usar framework universal PAS ou AIDA como base"
  - erro: "Tom/voz do copy inconsistente com productBrief"
    estrategia: "Revisar e reescrever seção alinhando ao tom definido"
    fallback: "Documentar divergência e submeter para revisão manual"
  - erro: "Menos de 5 variantes de headline geradas"
    estrategia: "retry (max 2) explorando ângulos adicionais"
    fallback: "Entregar com variantes disponíveis e documentar limitação"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# writeSectionCopy()

## Pipeline Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  sectionName     │──────>│                      │──────>│  sectionCopy        │
│  (string)        │       │                      │       │  (file)             │
├──────────────────┤       │                      │       ├─────────────────────┤
│  researchSynth.  │──────>│  writeSectionCopy    │──────>│  headlineVariants   │
│  (file)          │       │  @Quill              │       │  (array)            │
├──────────────────┤       │                      │       └─────────────────────┘
│  productBrief    │──────>│                      │               │
│  (file)          │       │                      │               ▼
├──────────────────┤       └──────────────────────┘       ┌─────────────────────┐
│  recommended     │──────>                               │  lp-design-architect│
│  Frameworks      │                                      │  lp-frontend-dev    │
│  (array)         │                                      │  lp-reviewer        │
└──────────────────┘                                      └─────────────────────┘
```

## Descrição

A task `writeSectionCopy()` é responsável por produzir o copy completo de **uma seção** da landing page. O agente **Quill** recebe o nome da seção, a síntese de pesquisa, o briefing do produto e os frameworks de copywriting recomendados, e produz um copy estruturado com todos os elementos textuais necessários.

Esta task é **chamada uma vez por seção** (iterativa) — o orchestrator invoca `writeSectionCopy()` para cada seção da landing page (hero, problem-agitation, benefits, social-proof, features, CTA, FAQ, footer). Cada invocação produz o copy específico daquela seção, aplicando o framework de copywriting mais adequado ao objetivo da seção.

Além do copy principal, a task gera no mínimo 5 variantes de headline para possibilitar testes A/B e para que o reviewer possa selecionar a versão mais impactante.

## Passos

1. **Receber e validar inputs** — Verificar que `sectionName` é uma seção válida, que `researchSynthesis` e `productBrief` existem, e que `recommendedFrameworks` contém frameworks aplicáveis.
2. **Selecionar framework de copywriting** — Analisar os `recommendedFrameworks` e escolher o mais adequado para o tipo de seção (ex: PAS para problem-agitation, AIDA para hero, StoryBrand para narrativa).
3. **Extrair dados relevantes** — Filtrar da `researchSynthesis` e do `productBrief` os pontos mais relevantes para a seção específica (pain points para problem-agitation, benefícios para benefits, prova social para social-proof).
4. **Redigir headline principal** — Criar a headline principal da seção aplicando o framework selecionado e os dados extraídos.
5. **Gerar variantes de headline** — Produzir no mínimo 5 variantes alternativas da headline, explorando ângulos diferentes (emocional, racional, urgência, curiosidade, benefício direto).
6. **Redigir subheadline** — Complementar a headline com uma subheadline que expanda o argumento ou adicione contexto.
7. **Redigir body text** — Desenvolver o corpo do texto da seção, mantendo coerência com o tom/voz definido no `productBrief`.
8. **Definir CTA e microcopy** — Criar o texto do botão de CTA e o microcopy de suporte (ex: "Sem cartão de crédito", "Cancele quando quiser").
9. **Documentar framework utilizado** — Registrar no output qual framework foi aplicado e por que foi escolhido para esta seção.
10. **Validar contra post-conditions** — Verificar que todos os elementos obrigatórios estão presentes e que o tom/voz está consistente com o `productBrief`.

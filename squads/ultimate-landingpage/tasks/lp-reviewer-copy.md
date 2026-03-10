---
task: reviewCopyQuality()
responsavel: "Shield"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: allSectionsCopy
    tipo: array<file>
    obrigatorio: true
    descricao: "Copy de todas as seções da landing page (source: writeSectionCopy() iterações)"
  - nome: toneReviewReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de revisão de tom e voz (source: reviewCopyTone())"
  - nome: researchSynthesis
    tipo: file
    obrigatorio: true
    descricao: "Síntese consolidada das pesquisas de mercado, concorrência e público-alvo (source: synthesizeResearch())"

Saida:
  - nome: copyReview
    tipo: file
    obrigatorio: true
    descricao: "Relatório detalhado de revisão de qualidade do copy com issues e sugestões (destination: lp-copywriter para correções)"
  - nome: copyScore
    tipo: object
    obrigatorio: true
    descricao: "Score numérico de qualidade do copy por dimensão (destination: produceFinalReport())"

Checklist:
  pre-conditions:
    - "[ ] Todas as seções possuem copy gerado por writeSectionCopy()"
    - "[ ] Revisão de tom concluída por reviewCopyTone()"
    - "[ ] researchSynthesis disponível para validação de claims"
  post-conditions:
    - "[ ] Cada seção pontuada em: clareza (20%), persuasão (20%), eficácia do CTA (20%), consistência (15%), gramática (10%), uso de framework (15%)"
    - "[ ] Issues categorizados como BLOCKER/WARNING/INFO"
    - "[ ] Sugestões específicas de correção fornecidas para cada issue"

Performance:
  duration_expected: "10 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Artefatos de copy ausentes (seções faltantes)"
    estrategia: "abort + solicitar execução das tasks de copy pendentes"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "toneReviewReport não gerado ou incompleto"
    estrategia: "Prosseguir review sem dados de tom e documentar limitação"
    fallback: "Avaliar consistência de tom manualmente durante o review"
  - erro: "researchSynthesis indisponível para validação de claims"
    estrategia: "Marcar validação de claims como SKIPPED no relatório"
    fallback: "Documentar claims não validados e recomendar verificação"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com review parcial"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# reviewCopyQuality()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  allSectionsCopy      │──────>│                      │──────>│  copyReview             │
│  (array<file>)        │       │                      │       │  (file)                 │
├───────────────────────┤       │  reviewCopyQuality   │       ├─────────────────────────┤
│  toneReviewReport     │──────>│  @Shield             │──────>│  copyScore              │
│  (file)               │       │                      │       │  (object)               │
├───────────────────────┤       │                      │       └─────────────────────────┘
│  researchSynthesis    │──────>│                      │               │
│  (file)               │       └──────────────────────┘               ├──────────────────┐
└───────────────────────┘                                              ▼                  ▼
                                                               ┌──────────────┐   ┌──────────────┐
                                                               │ lp-copywriter│   │ produceFinal │
                                                               │ (para fixes) │   │ Report()     │
                                                               └──────────────┘   └──────────────┘
```

## Descrição

A task `reviewCopyQuality()` realiza uma **análise qualitativa e quantitativa** de todo o copy produzido para a landing page. O agente **Shield** avalia cada seção individualmente e o conjunto como um todo, aplicando critérios de qualidade ponderados para produzir um score objetivo.

O review analisa seis dimensões com pesos definidos: clareza (20%), persuasão (20%), eficácia do CTA (20%), consistência entre seções (15%), gramática e ortografia (10%) e uso correto do framework de copywriting (15%). Cada issue encontrado é categorizado por severidade (BLOCKER para problemas que impedem publicação, WARNING para melhorias recomendadas e INFO para sugestões opcionais) e acompanhado de uma sugestão específica de correção.

## Passos

1. **Carregar todos os inputs** — Ler `allSectionsCopy`, `toneReviewReport` e `researchSynthesis` para contexto completo.
2. **Analisar clareza (20%)** — Para cada seção, avaliar se a mensagem é compreensível em primeira leitura, sem ambiguidades ou jargão desnecessário.
3. **Analisar persuasão (20%)** — Verificar se o copy utiliza técnicas persuasivas adequadas ao público-alvo, se os argumentos são embasados na pesquisa e se a proposta de valor está clara.
4. **Analisar eficácia do CTA (20%)** — Avaliar se cada CTA é claro, urgente quando apropriado, e se o microcopy de suporte reduz objeções.
5. **Analisar consistência (15%)** — Verificar coerência de tom, voz, terminologia e nível de formalidade entre todas as seções, usando o `toneReviewReport` como referência.
6. **Analisar gramática e ortografia (10%)** — Verificar correção gramatical, pontuação, concordância e ortografia em todo o copy.
7. **Analisar uso de framework (15%)** — Verificar se os frameworks de copywriting foram aplicados corretamente em cada seção e se os elementos obrigatórios do framework estão presentes.
8. **Categorizar issues** — Classificar cada problema encontrado como BLOCKER (impede publicação), WARNING (recomendação forte) ou INFO (sugestão opcional).
9. **Gerar sugestões de correção** — Para cada issue BLOCKER e WARNING, fornecer uma sugestão específica de reescrita ou ajuste.
10. **Calcular scores** — Computar score por dimensão e score geral ponderado para cada seção e para o conjunto.
11. **Gerar outputs** — Produzir `copyReview` com detalhamento completo e `copyScore` com os valores numéricos para o relatório final.

---
task: reviewCopyTone()
responsavel: "Quill"
responsavel_type: Agente
atomic_layer: Atom

Entrada:
  - nome: allSectionsCopy
    tipo: array<file>
    obrigatorio: true
    descricao: "Todos os copies de seções gerados pelas iterações de writeSectionCopy() (source: writeSectionCopy() iterations)"
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto com USP, mercado-alvo, tom/voz e posicionamento (source: discoverProduct())"

Saida:
  - nome: toneReviewReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de revisão de tom/voz com inconsistências encontradas e correções aplicadas (destination: lp-reviewer)"
  - nome: correctedCopy
    tipo: array<file>
    obrigatorio: true
    descricao: "Copies de todas as seções com tom/voz harmonizado e correções aplicadas (destination: lp-frontend-dev)"

Checklist:
  pre-conditions:
    - "[ ] Todas as seções possuem copy escrito por writeSectionCopy()"
    - "[ ] productBrief existe com tom/voz e brand voice definidos"
  post-conditions:
    - "[ ] Tom/voz consistente em TODAS as seções"
    - "[ ] Nenhuma contradição de messaging entre seções"
    - "[ ] Brand voice mantida conforme productBrief"
    - "[ ] Transições entre seções fluem naturalmente"
    - "[ ] Terminologia técnica uniforme em toda a landing page"
    - "[ ] toneReviewReport documenta todas as alterações realizadas"

Performance:
  duration_expected: "6 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Seções de copy faltantes no allSectionsCopy"
    estrategia: "abort + solicitar execução das iterações pendentes de writeSectionCopy()"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Tom/voz do productBrief indefinido ou ambíguo"
    estrategia: "Inferir tom a partir da análise do copy do hero (seção principal)"
    fallback: "Documentar indefinição e usar tom neutro-profissional como referência"
  - erro: "Contradição de messaging entre seções não resolvível"
    estrategia: "Priorizar messaging do hero e CTA sobre seções intermediárias"
    fallback: "Documentar contradição e sinalizar para revisão manual"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com copies parcialmente revisados"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# reviewCopyTone()

## Pipeline Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  allSectionsCopy │──────>│                      │──────>│  toneReviewReport   │
│  (array<file>)   │       │  reviewCopyTone      │       │  (file)             │
│  [hero,          │       │  @Quill              │       ├─────────────────────┤
│   problem,       │       │                      │──────>│  correctedCopy      │
│   benefits,      │       │                      │       │  (array<file>)      │
│   social-proof,  │       └──────────────────────┘       └─────────────────────┘
│   cta, ...]      │               ▲                              │
├──────────────────┤               │                              ▼
│  productBrief    │───────────────┘                      ┌─────────────────────┐
│  (file)          │                                      │  lp-reviewer        │
└──────────────────┘                                      │  lp-frontend-dev    │
                                                          └─────────────────────┘
```

## Descrição

A task `reviewCopyTone()` é a etapa de **harmonização final** de todo o copy da landing page. Após todas as seções terem sido escritas individualmente por `writeSectionCopy()`, o agente **Quill** revisa o conjunto completo para garantir consistência de tom, voz, terminologia e messaging.

Como cada seção é escrita de forma iterativa e independente, podem surgir inconsistências sutis — variações no nível de formalidade, contradições entre promessas de diferentes seções, ou mudanças involuntárias no vocabulário técnico. Esta task funciona como um "quality pass" editorial que unifica a experiência de leitura de ponta a ponta.

O output inclui tanto um relatório detalhado das inconsistências encontradas e correções aplicadas (para o reviewer validar) quanto os copies corrigidos prontos para implementação pelo frontend.

## Passos

1. **Carregar todos os copies de seções** — Reunir todos os outputs de `writeSectionCopy()` na ordem de fluxo da landing page (hero -> problem-agitation -> benefits -> social-proof -> features -> CTA -> FAQ -> footer).
2. **Extrair referência de tom/voz** — Ler o `productBrief` e extrair as diretrizes de brand voice, tom, nível de formalidade e vocabulário preferido.
3. **Analisar consistência de tom** — Comparar o tom de cada seção contra a referência e entre si, identificando variações de formalidade, energia ou estilo.
4. **Detectar contradições de messaging** — Verificar se promessas, números, claims ou posicionamento se contradizem entre seções diferentes.
5. **Auditar terminologia** — Garantir que termos técnicos, nomes de features e vocabulário específico do produto são usados de forma uniforme em todas as seções.
6. **Avaliar transições** — Verificar se o fluxo narrativo entre seções é fluido e se cada seção conecta naturalmente com a seguinte.
7. **Aplicar correções** — Corrigir as inconsistências encontradas, mantendo a essência e o impacto de cada seção original.
8. **Gerar relatório de revisão** — Documentar cada inconsistência encontrada, a seção afetada, o tipo de problema e a correção aplicada no `toneReviewReport`.
9. **Produzir copies corrigidos** — Gerar o `correctedCopy` com todas as seções harmonizadas e prontas para implementação.
10. **Validar contra post-conditions** — Verificar que todas as condições de saída foram atendidas antes de entregar os outputs.

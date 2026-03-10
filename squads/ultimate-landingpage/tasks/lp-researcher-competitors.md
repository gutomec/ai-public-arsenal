---
task: researchCompetitors()
responsavel: "Scout"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto com mercado e indústria (source: discoverProduct())"
  - nome: knownCompetitors
    tipo: array
    obrigatorio: false
    descricao: "Lista de concorrentes já conhecidos pelo usuário (source: questionnaire)"

Saida:
  - nome: competitorAnalysis
    tipo: file
    obrigatorio: true
    descricao: "Análise detalhada de concorrentes com padrões de landing page, copy e design (destination: synthesizeResearch())"
  - nome: visualReferences
    tipo: array
    obrigatorio: true
    descricao: "Referências visuais coletadas das landing pages dos concorrentes (destination: lp-design-architect)"

Checklist:
  pre-conditions:
    - "[ ] productBrief existe com informações de mercado/indústria"
  post-conditions:
    - "[ ] Mínimo 5 concorrentes diretos analisados"
    - "[ ] Mínimo 3 concorrentes indiretos analisados"
    - "[ ] Padrões de estrutura de landing page capturados"
    - "[ ] Padrões de copy capturados"
    - "[ ] Padrões de design capturados"
    - "[ ] Referências visuais coletadas e catalogadas"

Performance:
  duration_expected: "20 minutes"
  cacheable: true
  parallelizable: true

Tools:
  - WebSearch
  - WebFetch

Error_Handling:
  - erro: "WebSearch retorna resultados insuficientes"
    estrategia: "retry (max 2) com queries alternativas e sinônimos"
    fallback: "Usar knownCompetitors como base e reduzir mínimo para 3 diretos"
  - erro: "WebFetch falha ao acessar landing page de concorrente"
    estrategia: "retry (max 2) com timeout estendido"
    fallback: "Pular concorrente inacessível e substituir por outro"
  - erro: "Dados insuficientes para análise de padrões"
    estrategia: "Expandir busca para concorrentes indiretos e adjacentes"
    fallback: "Gerar análise parcial com dados disponíveis e documentar gaps"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com dados parciais coletados"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# researchCompetitors()

## Pipeline Diagram

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  productBrief   │──────>│                      │──────>│  competitorAnalysis │
│  (file)         │       │  researchCompetitors │       │  (file)             │
├─────────────────┤       │  @Scout              │       ├─────────────────────┤
│  knownCompeti-  │──────>│                      │──────>│  visualReferences   │
│  tors? (array)  │       │  [WebSearch,         │       │  (array)            │
│                 │       │   WebFetch]          │       └─────────────────────┘
└─────────────────┘       └──────────────────────┘               │
                                                                 ▼
                                                     ┌───────────────────────┐
                                                     │  synthesizeResearch() │
                                                     │  lp-design-architect  │
                                                     └───────────────────────┘
```

## Descrição

A task `researchCompetitors()` conduz uma pesquisa aprofundada do cenário competitivo. O agente **Scout** utiliza ferramentas de busca web (`WebSearch`, `WebFetch`) para encontrar, acessar e analisar as landing pages dos concorrentes diretos e indiretos do produto.

A análise vai além de uma lista de concorrentes — o Scout examina a **estrutura** das landing pages (quais seções usam, em que ordem), os **padrões de copy** (headlines, CTAs, prova social), e os **padrões de design** (layout, cores, tipografia, imagens). O objetivo é extrair intelligence acionável que informe as decisões de copy e design da landing page do usuário.

Esta é uma task Organism — envolve múltiplas etapas de pesquisa externa, análise e síntese, com dependência de ferramentas externas.

## Passos

1. **Carregar productBrief** — Extrair mercado, indústria, nicho e keywords do produto para guiar a pesquisa.
2. **Identificar concorrentes diretos** — Usar `WebSearch` para encontrar empresas que oferecem produtos/serviços similares no mesmo mercado. Se `knownCompetitors` fornecidos, usá-los como ponto de partida.
3. **Identificar concorrentes indiretos** — Buscar soluções alternativas que o público-alvo pode considerar (substitutos, adjacentes).
4. **Acessar landing pages** — Usar `WebFetch` para capturar o conteúdo das landing pages de cada concorrente.
5. **Analisar estrutura** — Para cada landing page, mapear:
   - Seções presentes e sua ordem (hero, features, social proof, pricing, FAQ, CTA)
   - Padrões de navegação e fluxo de conversão
   - Elementos above-the-fold vs below-the-fold
6. **Analisar copy** — Examinar:
   - Headlines e sub-headlines
   - CTAs (texto, posição, frequência)
   - Prova social (tipo, quantidade, posição)
   - Tratamento de objeções
7. **Analisar design** — Capturar:
   - Layout patterns (grid, full-width, cards)
   - Paleta de cores dominante
   - Tipografia e hierarquia visual
   - Uso de imagens, ícones e vídeo
8. **Coletar referências visuais** — Catalogar screenshots e URLs das melhores referências visuais encontradas.
9. **Compilar competitorAnalysis** — Gerar documento estruturado com análise comparativa, padrões identificados e oportunidades de diferenciação.
10. **Validar post-conditions** — Confirmar mínimo de 5 diretos + 3 indiretos, com padrões de estrutura/copy/design documentados.

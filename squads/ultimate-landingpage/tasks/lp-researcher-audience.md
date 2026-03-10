---
task: identifyAudience()
responsavel: "Scout"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto com informações de mercado-alvo (source: discoverProduct())"
  - nome: competitorAnalysis
    tipo: file
    obrigatorio: false
    descricao: "Análise de concorrentes para enriquecer perfil de audiência (source: researchCompetitors())"

Saida:
  - nome: audienceProfile
    tipo: file
    obrigatorio: true
    descricao: "Perfil detalhado de personas primária e secundária com dados demográficos, psicográficos e comportamentais (destination: synthesizeResearch() + lp-copywriter)"
  - nome: painPoints
    tipo: array
    obrigatorio: true
    descricao: "Lista de dores e frustrações do público-alvo com evidências (destination: lp-copywriter)"

Checklist:
  pre-conditions:
    - "[ ] productBrief existe com informações de mercado-alvo"
  post-conditions:
    - "[ ] Persona primária definida com dados demográficos e psicográficos"
    - "[ ] Persona secundária definida"
    - "[ ] Mínimo 5 pain points mapeados com evidência"
    - "[ ] Buyer journey documentado (awareness → consideration → decision)"
    - "[ ] Linguagem e vocabulário do público capturados"

Performance:
  duration_expected: "15 minutes"
  cacheable: true
  parallelizable: true

Tools:
  - WebSearch
  - WebFetch

Error_Handling:
  - erro: "WebSearch retorna dados demográficos insuficientes"
    estrategia: "retry (max 2) com queries reformuladas por nicho/setor"
    fallback: "Derivar perfil demográfico do productBrief e competitorAnalysis"
  - erro: "Fóruns e comunidades de nicho não encontrados"
    estrategia: "Expandir busca para comunidades genéricas (Reddit, Quora)"
    fallback: "Usar dados de reviews de produtos similares como proxy"
  - erro: "Pain points insuficientes (menos de 5)"
    estrategia: "retry (max 2) com fontes alternativas (reviews, redes sociais)"
    fallback: "Completar com inferências do competitorAnalysis e documentar"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com perfil parcial coletado"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# identifyAudience()

## Pipeline Diagram

```
┌─────────────────┐       ┌────────────────────┐       ┌─────────────────────┐
│  productBrief   │──────>│                    │──────>│  audienceProfile    │
│  (file)         │       │  identifyAudience  │       │  (file)             │
├─────────────────┤       │  @Scout            │       ├─────────────────────┤
│  competitor     │──────>│                    │──────>│  painPoints         │
│  Analysis?      │       │  [WebSearch,       │       │  (array)            │
│  (file)         │       │   WebFetch]        │       └─────────────────────┘
└─────────────────┘       └────────────────────┘               │
                                                               ▼
                                                   ┌───────────────────────┐
                                                   │  synthesizeResearch() │
                                                   │  lp-copywriter       │
                                                   └───────────────────────┘
```

## Descrição

A task `identifyAudience()` constrói um perfil profundo do público-alvo da landing page. O agente **Scout** pesquisa fóruns, redes sociais, reviews e comunidades para entender quem é o potencial cliente, o que o motiva, quais são suas dores e como ele toma decisões de compra.

O resultado vai muito além de dados demográficos — o Scout captura a **linguagem real** que o público usa, os **pain points com evidência** (citações, posts, reviews), e o **buyer journey** completo. Esses insights são fundamentais para o copywriter produzir copy que ressoa emocionalmente com o público.

Se a `competitorAnalysis` estiver disponível, o Scout a utiliza para enriquecer o perfil com dados sobre como o público interage com soluções concorrentes.

## Passos

1. **Carregar productBrief** — Extrair informações iniciais de mercado-alvo, nicho e posicionamento.
2. **Carregar competitorAnalysis** (se disponível) — Usar dados de concorrentes para identificar padrões de público compartilhado.
3. **Pesquisar perfil demográfico** — Usar `WebSearch` para encontrar dados sobre idade, gênero, localização, renda e profissão do público-alvo típico do nicho.
4. **Pesquisar perfil psicográfico** — Investigar valores, crenças, aspirações, medos e motivações:
   - Fóruns (Reddit, Quora, comunidades de nicho)
   - Reviews de produtos similares
   - Grupos em redes sociais
   - Comentários em blogs e vídeos do nicho
5. **Mapear pain points** — Identificar as 5+ principais dores e frustrações, com evidência:
   - Citações diretas do público
   - Padrões recorrentes em reclamações
   - Gaps não atendidos por soluções existentes
6. **Documentar buyer journey** — Mapear o caminho de decisão:
   - **Awareness:** Como o público descobre o problema?
   - **Consideration:** Que soluções ele avalia? Que critérios usa?
   - **Decision:** O que faz ele escolher uma solução? Quais objeções precisa superar?
7. **Capturar vocabulário** — Coletar palavras, expressões e jargões que o público usa naturalmente para descrever o problema e a solução desejada.
8. **Construir personas** — Criar persona primária e secundária com:
   - Nome fictício, idade, profissão
   - Objetivos e motivações
   - Frustrações e medos
   - Comportamento de compra
   - Canais de informação preferidos
9. **Compilar audienceProfile** — Gerar documento completo com personas, pain points, buyer journey e vocabulário.
10. **Validar post-conditions** — Confirmar que ambas as personas estão definidas, 5+ pain points com evidência e buyer journey documentado.

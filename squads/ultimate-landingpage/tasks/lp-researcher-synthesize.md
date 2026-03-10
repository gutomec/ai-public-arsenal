---
task: synthesizeResearch()
responsavel: "Scout"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: competitorAnalysis
    tipo: file
    obrigatorio: true
    descricao: "Análise detalhada de concorrentes diretos e indiretos (source: researchCompetitors())"
  - nome: audienceProfile
    tipo: file
    obrigatorio: true
    descricao: "Perfil de personas com pain points e buyer journey (source: identifyAudience())"
  - nome: copyExpertsReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de especialistas de copy com frameworks recomendados (source: researchCopyExperts())"

Saida:
  - nome: researchSynthesis
    tipo: file
    obrigatorio: true
    descricao: "Briefing unificado com insights acionáveis priorizados por impacto de conversão (destination: lp-copywriter + lp-design-architect + all agents)"

Checklist:
  pre-conditions:
    - "[ ] competitorAnalysis existe e está completo"
    - "[ ] audienceProfile existe e está completo"
    - "[ ] copyExpertsReport existe e está completo"
  post-conditions:
    - "[ ] Briefing unificado gerado com dados dos 3 inputs"
    - "[ ] Insights priorizados por impacto de conversão"
    - "[ ] Contradições entre fontes identificadas e resolvidas"
    - "[ ] Recomendações acionáveis para copy, design e estrutura"

Performance:
  duration_expected: "8 minutes"
  cacheable: true
  parallelizable: false

Error_Handling:
  - erro: "Um dos 3 inputs obrigatórios está ausente"
    estrategia: "abort + solicitar execução da task geradora"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Contradições irreconciliáveis entre fontes de pesquisa"
    estrategia: "Priorizar audienceProfile (dados de público) sobre competitorAnalysis"
    fallback: "Documentar contradição com ambas as visões e recomendar validação"
  - erro: "Dados insuficientes para priorização de impacto de conversão"
    estrategia: "retry (max 2) cruzando dados com frameworks recomendados"
    fallback: "Usar priorização conservadora baseada em padrões de mercado"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com síntese parcial"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# synthesizeResearch()

## Pipeline Diagram

```
┌─────────────────────┐
│  competitorAnalysis  │───┐
│  (file)              │   │
└─────────────────────┘   │     ┌──────────────────────┐     ┌─────────────────────┐
                           ├───>│                      │────>│  researchSynthesis  │
┌─────────────────────┐   │     │  synthesizeResearch  │     │  (file)             │
│  audienceProfile     │───┤     │  @Scout              │     └─────────────────────┘
│  (file)              │   │     │                      │              │
└─────────────────────┘   │     └──────────────────────┘              ▼
                           │                                ┌─────────────────────┐
┌─────────────────────┐   │                                │  lp-copywriter      │
│  copyExpertsReport   │───┘                                │  lp-design-architect│
│  (file)              │                                    │  all agents         │
└─────────────────────┘                                    └─────────────────────┘
```

## Descrição

A task `synthesizeResearch()` é o ponto de convergência de toda a pesquisa conduzida pelo agente **Scout**. Ela recebe os três outputs de pesquisa — competitorAnalysis, audienceProfile e copyExpertsReport — e os funde em um **briefing unificado e acionável**.

O valor principal desta task é a **priorização por impacto de conversão**. Em vez de simplesmente concatenar relatórios, o Scout cruza os dados para identificar:
- Quais pain points do público são menos atendidos pelos concorrentes (oportunidade de diferenciação)
- Quais frameworks de copy são mais eficazes para o perfil de audiência identificado
- Quais padrões de design dos concorrentes demonstram melhores práticas vs oportunidades de melhoria
- Onde existem contradições entre as fontes e como resolvê-las

O `researchSynthesis` se torna o documento de referência principal para copywriter e design architect.

## Passos

1. **Carregar os 3 inputs** — Ler `competitorAnalysis`, `audienceProfile` e `copyExpertsReport` em sua totalidade.
2. **Cruzar pain points com gaps competitivos** — Identificar quais dores do público (do audienceProfile) são mal atendidas pelos concorrentes (do competitorAnalysis). Estas são as maiores oportunidades de conversão.
3. **Cruzar frameworks com perfil de audiência** — Avaliar quais frameworks recomendados (do copyExpertsReport) são mais eficazes para o estágio de awareness e perfil psicográfico das personas.
4. **Identificar padrões de design vencedores** — Extrair os padrões de design mais comuns entre concorrentes bem-sucedidos e marcar oportunidades de diferenciação visual.
5. **Detectar contradições** — Identificar dados conflitantes entre as fontes (ex: competitorAnalysis sugere tom formal, mas audienceProfile indica público que prefere casual). Resolver com justificativa.
6. **Priorizar insights** — Classificar cada insight por impacto estimado de conversão:
   - **Alto impacto:** Diretamente afeta decisão de compra
   - **Médio impacto:** Influencia percepção e confiança
   - **Baixo impacto:** Nice-to-have, diferenciação sutil
7. **Gerar recomendações acionáveis** — Para cada insight priorizado, traduzir em recomendação específica:
   - Para copy: qual mensagem, em qual seção, usando qual framework
   - Para design: qual padrão visual, em qual componente, por qual razão
   - Para estrutura: quais seções incluir, em qual ordem, com qual peso
8. **Compilar researchSynthesis** — Gerar briefing unificado com seções claras: Executive Summary, Oportunidades de Diferenciação, Recomendações de Copy, Recomendações de Design, Recomendações de Estrutura, Contradições Resolvidas.
9. **Validar post-conditions** — Confirmar que o briefing cobre dados dos 3 inputs, insights estão priorizados e recomendações são acionáveis.

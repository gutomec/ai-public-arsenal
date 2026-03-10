---
task: discoverProduct()
responsavel: "Strategos"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: userIdea
    tipo: string
    obrigatorio: true
    descricao: "Descrição do produto/serviço fornecida pelo usuário (source: user input)"
  - nome: existingBranding
    tipo: object
    obrigatorio: false
    descricao: "Assets de marca existentes — logo, paleta, guidelines (source: user assets)"

Saida:
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto com USP, mercado-alvo, tom/voz e posicionamento competitivo (destination: lp-researcher + all agents)"
  - nome: valueProposition
    tipo: string
    obrigatorio: true
    descricao: "Proposta de valor principal sintetizada em uma frase (destination: lp-copywriter)"

Checklist:
  pre-conditions:
    - "[ ] Usuário forneceu descrição do produto/serviço"
  post-conditions:
    - "[ ] Product brief contém USP (Unique Selling Proposition)"
    - "[ ] Product brief contém mercado-alvo definido"
    - "[ ] Product brief contém tom e voz da marca"
    - "[ ] Product brief contém posicionamento competitivo"

Performance:
  duration_expected: "10 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "userIdea vazia ou insuficiente"
    estrategia: "solicitar re-input ao usuário"
    fallback: "Usar template mínimo de briefing com campos obrigatórios"
  - erro: "existingBranding corrompido ou formato inválido"
    estrategia: "retry (max 2) com validação de formato"
    fallback: "Ignorar branding existente e gerar identidade do zero"
  - erro: "Ambiguidade no mercado-alvo ou USP"
    estrategia: "Gerar perguntas de clarificação ao usuário"
    fallback: "Documentar ambiguidade e prosseguir com melhor hipótese"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# discoverProduct()

## Pipeline Diagram

```
┌─────────────┐       ┌──────────────────┐       ┌─────────────────────┐
│  userIdea    │──────>│                  │──────>│  productBrief       │
│  (string)    │       │  discoverProduct │       │  (file)             │
├─────────────┤       │  @Strategos      │       ├─────────────────────┤
│  existing    │──────>│                  │──────>│  valueProposition   │
│  Branding?   │       └──────────────────┘       │  (string)           │
│  (object)    │                                  └─────────────────────┘
└─────────────┘                                          │
                                                         ▼
                                              ┌─────────────────────┐
                                              │  lp-researcher      │
                                              │  lp-copywriter      │
                                              │  all agents         │
                                              └─────────────────────┘
```

## Descrição

A task `discoverProduct()` é o ponto de partida de toda a pipeline da landing page. O agente **Strategos** analisa a ideia bruta do usuário e quaisquer assets de marca existentes para produzir um **Product Brief** estruturado e uma **Value Proposition** destilada.

O Product Brief serve como documento fundacional que alimenta todos os agentes subsequentes — pesquisadores, copywriters, designers e desenvolvedores. Ele estabelece o vocabulário compartilhado, o posicionamento estratégico e as diretrizes de comunicação que garantem coerência em toda a landing page.

## Passos

1. **Receber input do usuário** — Capturar a descrição do produto/serviço (`userIdea`) e verificar se existem assets de branding (`existingBranding`).
2. **Analisar o mercado implícito** — Identificar o setor, nicho e contexto competitivo a partir da descrição fornecida.
3. **Definir USP (Unique Selling Proposition)** — Extrair ou formular o diferencial principal do produto/serviço em relação aos concorrentes.
4. **Mapear mercado-alvo** — Definir o perfil inicial do público-alvo (demográfico, psicográfico, comportamental).
5. **Estabelecer tom e voz** — Determinar o estilo de comunicação adequado ao produto e ao público (formal, casual, técnico, inspiracional, etc.).
6. **Posicionar competitivamente** — Definir como o produto se diferencia no mercado e qual espaço ocupa na mente do consumidor.
7. **Sintetizar Value Proposition** — Condensar o posicionamento em uma frase de proposta de valor clara e memorável.
8. **Gerar Product Brief** — Compilar todos os elementos em um documento estruturado e validar contra as post-conditions.

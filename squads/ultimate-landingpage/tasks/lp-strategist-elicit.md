---
task: elicitRequirements()
responsavel: "Strategos"
responsavel_type: Agente
atomic_layer: Organism
elicit: true

Entrada:
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto gerado por discoverProduct() (source: discoverProduct())"

Saida:
  - nome: questionnaireAnswers
    tipo: file
    obrigatorio: true
    descricao: "Respostas completas do questionário com 10 perguntas obrigatórias e condicionais (destination: defineScope())"
  - nome: userPreferences
    tipo: object
    obrigatorio: true
    descricao: "Preferências visuais e funcionais do usuário extraídas das respostas (destination: lp-design-architect)"

Checklist:
  pre-conditions:
    - "[ ] productBrief existe e está completo"
  post-conditions:
    - "[ ] Todas as 10 perguntas obrigatórias foram respondidas"
    - "[ ] Flags condicionais (backend, whatsapp, email) definidos"
    - "[ ] Preferências do usuário extraídas e estruturadas"
    - "[ ] Nenhuma pergunta obrigatória ficou sem resposta"

Performance:
  duration_expected: "15 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "productBrief ausente ou incompleto"
    estrategia: "abort + solicitar execução de discoverProduct()"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Usuário não responde a pergunta obrigatória"
    estrategia: "retry (max 2) com reformulação da pergunta"
    fallback: "Usar default inteligente derivado do productBrief e documentar"
  - erro: "Respostas ambíguas ou contraditórias do usuário"
    estrategia: "Solicitar clarificação específica com exemplos"
    fallback: "Registrar ambiguidade e usar interpretação mais conservadora"
  - erro: "timeout_exceeded na interação com usuário"
    estrategia: "Salvar respostas parciais e pausar"
    fallback: "Reportar ao orquestrador com progresso parcial"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# elicitRequirements()

## Pipeline Diagram

```
┌─────────────────┐       ┌──────────────────────┐       ┌───────────────────────┐
│  productBrief   │──────>│                      │──────>│  questionnaireAnswers │
│  (file)         │       │  elicitRequirements  │       │  (file)               │
│                 │       │  @Strategos          │       ├───────────────────────┤
│                 │       │  [elicit: true]      │──────>│  userPreferences      │
│                 │       │                      │       │  (object)             │
│                 │       │    ┌──────────────┐  │       └───────────────────────┘
│                 │       │    │ USER INPUT   │  │               │
│                 │       │    │ (interactive)│  │               ▼
│                 │       │    └──────────────┘  │       ┌───────────────────────┐
│                 │       └──────────────────────┘       │  defineScope()        │
└─────────────────┘                                      │  lp-design-architect  │
                                                         └───────────────────────┘
```

## Descrição

A task `elicitRequirements()` é uma task **interativa** (`elicit: true`) que conduz o usuário através de um questionário estruturado para capturar requisitos específicos da landing page. O agente **Strategos** utiliza o Product Brief como contexto para formular perguntas inteligentes e relevantes.

O questionário contém 10 perguntas obrigatórias que cobrem objetivos de conversão, funcionalidades desejadas, integrações necessárias e preferências visuais. Perguntas condicionais são ativadas com base nas respostas (ex: se o usuário quer captura de leads, perguntas sobre backend e email são desbloqueadas).

Esta task é o principal ponto de interação humana no pipeline e determina o escopo real do projeto.

## Passos

1. **Carregar Product Brief** — Ler o productBrief gerado por `discoverProduct()` para contextualizar as perguntas.
2. **Preparar questionário base** — Montar as 10 perguntas obrigatórias com base no template e no contexto do produto.
3. **Apresentar perguntas ao usuário** — Exibir cada pergunta de forma clara, com exemplos e defaults inteligentes derivados do productBrief.
4. **Capturar respostas** — Registrar cada resposta, validando completude e coerência.
5. **Avaliar flags condicionais** — Com base nas respostas, determinar se backend, integração WhatsApp, captura de email e painel admin são necessários.
6. **Desbloquear perguntas condicionais** — Se flags ativados, apresentar perguntas adicionais específicas (ex: provedor de email, número WhatsApp, tipo de backend).
7. **Extrair preferências do usuário** — Compilar preferências visuais (cores, estilo, referências) e funcionais (seções desejadas, CTAs, formulários).
8. **Gerar questionnaireAnswers** — Salvar todas as respostas em arquivo estruturado.
9. **Gerar userPreferences** — Exportar preferências extraídas como objeto para o lp-design-architect.
10. **Validar post-conditions** — Confirmar que todas as perguntas obrigatórias foram respondidas e flags definidos.

---
task: defineScope()
responsavel: "Strategos"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: questionnaireAnswers
    tipo: file
    obrigatorio: true
    descricao: "Respostas completas do questionário de requisitos (source: elicitRequirements())"
  - nome: productBrief
    tipo: file
    obrigatorio: true
    descricao: "Briefing completo do produto (source: discoverProduct())"

Saida:
  - nome: scopeDefinition
    tipo: file
    obrigatorio: true
    descricao: "Definição de escopo com componentes ativados/desativados e regras de build (destination: all agents)"
  - nome: conditionalFlags
    tipo: object
    obrigatorio: true
    descricao: "Flags booleanos para módulos condicionais: backend, whatsapp, email, admin (destination: orchestrator)"

Checklist:
  pre-conditions:
    - "[ ] questionnaireAnswers completo e validado"
  post-conditions:
    - "[ ] scopeDefinition contém lista de componentes ativados/desativados"
    - "[ ] conditionalFlags contém booleans para backend, whatsapp, email e admin"
    - "[ ] Nenhum componente condicional ficou sem flag definido"
    - "[ ] Escopo é consistente com as respostas do questionário"

Performance:
  duration_expected: "5 minutes"
  cacheable: true
  parallelizable: false

Error_Handling:
  - erro: "questionnaireAnswers incompleto ou corrompido"
    estrategia: "abort + solicitar re-execução de elicitRequirements()"
    fallback: "Reportar dependência faltante ao orquestrador"
  - erro: "Conflito entre respostas do questionário e productBrief"
    estrategia: "Priorizar respostas do questionário (input mais recente)"
    fallback: "Documentar conflito e gerar scope conservador"
  - erro: "Flag condicional impossível de determinar"
    estrategia: "retry (max 2) analisando contexto das respostas"
    fallback: "Definir flag como false (conservador) e documentar incerteza"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# defineScope()

## Pipeline Diagram

```
┌───────────────────────┐       ┌────────────────┐       ┌─────────────────────┐
│  questionnaireAnswers │──────>│                │──────>│  scopeDefinition    │
│  (file)               │       │  defineScope   │       │  (file)             │
├───────────────────────┤       │  @Strategos    │       ├─────────────────────┤
│  productBrief         │──────>│                │──────>│  conditionalFlags   │
│  (file)               │       └────────────────┘       │  (object)           │
└───────────────────────┘                                └─────────────────────┘
                                                                  │
                                                                  ▼
                                                      ┌─────────────────────┐
                                                      │  all agents         │
                                                      │  orchestrator       │
                                                      └─────────────────────┘
```

## Descrição

A task `defineScope()` transforma as respostas do questionário e o product brief em uma **definição de escopo executável**. O agente **Strategos** analisa os requisitos capturados e determina quais componentes da landing page serão ativados ou desativados.

Esta task é uma Molecule — combina dados de duas fontes para produzir uma decisão estruturada. O `scopeDefinition` é o contrato que todos os agentes downstream respeitam: se um componente está desativado, nenhum agente gasta tempo nele. Os `conditionalFlags` orientam o orchestrator sobre quais pipelines paralelas precisam ser executadas.

## Passos

1. **Carregar inputs** — Ler `questionnaireAnswers` e `productBrief` para contexto completo.
2. **Mapear respostas para componentes** — Correlacionar cada resposta do questionário com os componentes disponíveis no template da landing page (hero, features, testimonials, pricing, FAQ, contact form, etc.).
3. **Avaliar componentes obrigatórios** — Marcar componentes que são sempre incluídos (hero, CTA primário, footer).
4. **Avaliar componentes opcionais** — Com base nas respostas, ativar ou desativar componentes como pricing table, testimonials, FAQ, blog preview, etc.
5. **Definir conditional flags** — Gerar os booleans:
   - `backend`: true se o usuário precisa de API, banco de dados ou autenticação
   - `whatsapp`: true se integração com WhatsApp foi solicitada
   - `email`: true se captura de leads por email foi requisitada
   - `admin`: true se painel administrativo é necessário
6. **Gerar scopeDefinition** — Compilar documento com lista completa de componentes (ativados/desativados), justificativa para cada decisão e regras de build.
7. **Validar consistência** — Verificar que o escopo é coerente com as respostas do questionário e que nenhum flag condicional ficou indefinido.
8. **Distribuir outputs** — Disponibilizar `scopeDefinition` para todos os agentes e `conditionalFlags` para o orchestrator.

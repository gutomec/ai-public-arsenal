---
task: specBackendInterface()
responsavel: "Prism"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: sectionLayouts
    tipo: file
    obrigatorio: true
    descricao: "Layouts detalhados de cada seção com wireframes e mapeamento de componentes (source: designSections())"
  - nome: scopeDefinition
    tipo: file
    obrigatorio: true
    descricao: "Definição de escopo do projeto com flag backend=true/false e requisitos funcionais (source: defineScope())"

Saida:
  - nome: backendSpec
    tipo: file
    obrigatorio: true
    descricao: "Especificação completa da interface backend — endpoints REST, payloads, validações e integrações (destination: lp-backend-dev)"
  - nome: dataModel
    tipo: file
    obrigatorio: true
    descricao: "Modelo de dados para leads, submissões de formulário e conteúdo dinâmico (destination: lp-backend-dev)"

Checklist:
  pre-conditions:
    - "[ ] sectionLayouts existe com layouts de todas as seções"
    - "[ ] scopeDefinition existe com backend=true"
    - "[ ] Seções com formulários identificadas nos layouts"
  post-conditions:
    - "[ ] Todos os campos de formulário especificados com tipos, validações e constraints"
    - "[ ] Endpoints REST definidos com method, path, payload e response schema"
    - "[ ] Modelo de dados de leads especificado (campos, tipos, required, unique)"
    - "[ ] Requisitos de admin panel documentados (CRUD de conteúdo, visualização de leads)"
    - "[ ] Validações server-side mapeadas para cada campo de formulário"
    - "[ ] Rate limiting e proteção anti-spam especificados"
    - "[ ] Integrações externas listadas (email service, CRM, analytics)"

Performance:
  duration_expected: "8 minutes"
  cacheable: true
  parallelizable: false

Error_Handling:
  - erro: "scopeDefinition com backend=false (task não deveria executar)"
    estrategia: "abort + skip task"
    fallback: "Reportar inconsistência de pipeline ao orquestrador"
  - erro: "sectionLayouts sem formulários identificados"
    estrategia: "retry (max 2) analisando CTAs e pontos de interação"
    fallback: "Gerar spec mínima com endpoint de lead capture genérico"
  - erro: "Modelo de dados conflita com validações de formulário"
    estrategia: "Priorizar validações client-side e ajustar modelo"
    fallback: "Documentar conflito e alinhar com lp-backend-dev"
  - erro: "Integração externa requerida não tem especificação suficiente"
    estrategia: "Documentar interface mínima com placeholders"
    fallback: "Marcar integração como pendente de definição"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# specBackendInterface()

## Pipeline Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌─────────────────────┐
│  sectionLayouts  │──────>│                      │──────>│  backendSpec        │
│  (file)          │       │                      │       │  (file)             │
│  ┌────────────┐  │       │  specBackend         │       │  ┌───────────────┐  │
│  │ forms      │  │       │  Interface           │       │  │ endpoints     │  │
│  │ CTAs       │  │       │  @Prism              │       │  │ validations   │  │
│  │ dynamic    │  │       │                      │       │  │ integrations  │  │
│  │ content    │  │       │                      │       │  │ rate limits   │  │
│  └────────────┘  │       └──────────────────────┘       │  └───────────────┘  │
├──────────────────┤               │                      ├─────────────────────┤
│  scopeDefinition │──────>        │                      │  dataModel          │
│  (file)          │               │                      │  (file)             │
│  ┌────────────┐  │               │                      │  ┌───────────────┐  │
│  │ backend=   │  │               │                      │  │ leads         │  │
│  │ true       │  │               │                      │  │ submissions   │  │
│  │ features[] │  │               │                      │  │ content       │  │
│  └────────────┘  │               │                      │  └───────────────┘  │
└──────────────────┘               │                      └─────────────────────┘
                                   │                              │
                           ┌───────▼───────┐                      ▼
                           │  CONDITIONAL  │              ┌─────────────────────┐
                           │  Only if      │              │  lp-backend-dev     │
                           │  backend=true │              └─────────────────────┘
                           └───────────────┘
```

## Descrição

A task `specBackendInterface()` é **condicional** — ela só é executada quando `backend=true` no `scopeDefinition`. Quando ativada, o agente **Prism** analisa os layouts das seções para identificar todos os pontos de interação que requerem backend (formulários, conteúdo dinâmico, integrações) e produz uma especificação técnica completa para o backend developer.

A task cobre quatro domínios principais:

1. **Formulários e Validações** — Cada campo de formulário presente nos layouts (contact forms, newsletter signup, lead capture) é especificado com tipo de dado, validações client-side e server-side, constraints de banco e mensagens de erro.

2. **Endpoints REST** — A API é definida com endpoints para submissão de formulários, consulta de leads (admin), gerenciamento de conteúdo dinâmico e health check. Cada endpoint inclui method, path, payload schema, response schema e códigos de status.

3. **Modelo de Dados** — O schema do banco é especificado para armazenar leads, submissões de formulário, conteúdo editável e logs de auditoria. Inclui campos, tipos, constraints (NOT NULL, UNIQUE, DEFAULT), índices e relações.

4. **Admin e Integrações** — Requisitos para painel administrativo (CRUD de conteúdo, listagem de leads, exportação) e integrações externas (envio de email, CRM, analytics, webhook).

## Passos

1. **Verificar condicional** — Confirmar que `scopeDefinition` contém `backend=true`. Se `backend=false`, esta task é SKIPPED e não produz outputs.
2. **Inventariar pontos de interação** — Analisar `sectionLayouts` para identificar todos os formulários, áreas de conteúdo dinâmico e pontos que requerem backend (newsletter signup, contact form, lead capture, FAQ dinâmico, testimonials dinâmicos).
3. **Especificar campos de formulário** — Para cada formulário identificado, listar todos os campos com: nome, tipo de dado (string, email, phone, textarea, select, checkbox), obrigatoriedade, validações (regex, min/max length, format), e mensagens de erro.
4. **Definir validações server-side** — Mapear validações que devem ocorrer no servidor além do client-side: sanitização de input, verificação de email, rate limiting por IP, honeypot anti-spam, CAPTCHA (se configurado).
5. **Projetar endpoints REST** — Definir cada endpoint:
   - `POST /api/leads` — Submissão de lead capture form
   - `POST /api/contact` — Submissão de contact form
   - `POST /api/newsletter` — Inscrição em newsletter
   - `GET /api/content/:section` — Conteúdo dinâmico por seção (admin)
   - `PUT /api/content/:section` — Atualização de conteúdo (admin)
   - `GET /api/leads` — Listagem de leads (admin, paginado)
   - `GET /api/health` — Health check
6. **Definir schemas de payload e response** — Para cada endpoint, especificar o JSON schema do body (request) e do response, incluindo códigos de status (200, 201, 400, 401, 429, 500).
7. **Modelar dados** — Definir as tabelas/collections:
   - `leads` — id, name, email, phone, source, created_at, metadata
   - `submissions` — id, form_type, data (JSONB), ip_address, user_agent, created_at
   - `content` — id, section, key, value, updated_at, updated_by
8. **Especificar rate limiting** — Definir limites por endpoint: submissões de formulário (ex: 5/minuto por IP), leitura de conteúdo (ex: 60/minuto), endpoints admin (ex: autenticação requerida).
9. **Documentar requisitos de admin** — Listar funcionalidades do painel administrativo: visualizar leads com filtros e busca, exportar leads (CSV), editar conteúdo das seções, visualizar métricas de conversão.
10. **Listar integrações externas** — Documentar integrações necessárias: serviço de email (Resend, SendGrid), CRM (se aplicável), analytics (eventos de conversão), webhooks (notificação de novo lead).
11. **Compilar backendSpec e dataModel** — Gerar os arquivos finais com todas as especificações organizadas e validar contra as post-conditions.
12. **Validar completude** — Verificar que nenhum ponto de interação dos layouts ficou sem especificação de backend correspondente.

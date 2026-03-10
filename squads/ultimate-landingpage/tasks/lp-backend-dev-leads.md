---
task: createLeadEndpoints()
responsavel: "Forge"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: backendProject
    tipo: file
    obrigatorio: true
    descricao: "Projeto FastAPI inicializado com infraestrutura base (source: setupBackendProject())"
  - nome: backendSpec
    tipo: file
    obrigatorio: true
    descricao: "Especificação dos endpoints de leads — schemas, validações, rate limits (source: specBackendInterface())"
  - nome: dataModel
    tipo: file
    obrigatorio: true
    descricao: "Modelo de dados para leads — campos, tipos, índices (source: specBackendInterface())"

Saida:
  - nome: leadsApi
    tipo: file
    obrigatorio: true
    descricao: "API de leads completa com CRUD, validação e rate limiting (destination: lp-integrator)"
  - nome: apiDocs
    tipo: file
    obrigatorio: true
    descricao: "Documentação da API — endpoints, schemas, exemplos de request/response (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] backendProject existe com database configurado e funcional"
    - "[ ] backendSpec existe com especificação dos endpoints"
    - "[ ] dataModel existe com schema de leads definido"
  post-conditions:
    - "[ ] POST /api/leads funcional (público, com rate limiting)"
    - "[ ] GET /api/admin/leads funcional (autenticado, paginado)"
    - "[ ] GET /api/admin/leads/export funcional (CSV com UTF-8 BOM)"
    - "[ ] DELETE /api/admin/leads/{id} funcional (autenticado)"
    - "[ ] Validação de input via Pydantic em todos os endpoints"
    - "[ ] CORS configurado para o domínio do frontend"
    - "[ ] OpenAPI docs auto-gerados e acessíveis em /docs"

Performance:
  duration_expected: "20 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Migration de tabela de leads falha"
    estrategia: "retry (max 2) verificando schema e conflitos de migração"
    fallback: "Criar tabela manualmente e sincronizar migration"
  - erro: "Validação Pydantic rejeita payload válido"
    estrategia: "Revisar schema Pydantic e ajustar validators"
    fallback: "Relaxar validação temporariamente e documentar para review"
  - erro: "Rate limiting bloqueia requests legítimos em teste"
    estrategia: "Ajustar limites (aumentar threshold) para ambiente de dev"
    fallback: "Desabilitar rate limiting em dev e manter apenas em prod"
  - erro: "CORS bloqueia requisições do frontend"
    estrategia: "Verificar allowed origins e headers no middleware CORS"
    fallback: "Adicionar origin do frontend explicitamente e reiniciar"
  - erro: "Exportação CSV gera arquivo corrompido"
    estrategia: "retry (max 2) verificando encoding UTF-8 BOM e escape de campos"
    fallback: "Exportar como JSON e documentar limitação do CSV"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# createLeadEndpoints()

## Pipeline Diagram

```
┌──────────────────┐
│ backendProject   │───┐
│ (file)           │   │
└──────────────────┘   │     ┌─────────────────────────┐     ┌──────────────────┐
                       ├────>│                         │────>│ leadsApi         │
┌──────────────────┐   │     │  createLeadEndpoints   │     │ (file)           │
│ backendSpec      │───┤     │  @Forge                 │     ├──────────────────┤
│ (file)           │   │     │                         │────>│ apiDocs          │
└──────────────────┘   │     │  CONDITIONAL:           │     │ (file)           │
                       │     │  backend=true           │     └──────────────────┘
┌──────────────────┐   │     └─────────────────────────┘            │
│ dataModel        │───┘                                            ▼
│ (file)           │                                     ┌────────────────────┐
└──────────────────┘                                     │ lp-integrator      │
                                                         │ lp-reviewer        │
                                                         └────────────────────┘

Endpoints gerados:
  POST   /api/leads              (público, rate limited)
  GET    /api/admin/leads        (autenticado, paginado)
  GET    /api/admin/leads/export (CSV, UTF-8 BOM)
  DELETE /api/admin/leads/{id}   (autenticado)

⚠ CONDITIONAL — Executada somente se backend=true
```

## Descrição

A task `createLeadEndpoints()` implementa a API completa de captação e gestão de leads da landing page. O agente **Forge** cria os endpoints públicos (para o formulário de contato) e administrativos (para gestão dos leads captados), com validação robusta, rate limiting, autenticação e exportação.

Esta é uma task **condicional** que depende do backend estar habilitado no escopo. Ela implementa o core business do backend — a captação de leads é a razão de existir do backend em uma landing page de captação.

## Passos

1. **Criar modelo SQLAlchemy** — Implementar `app/models/lead.py` com os campos definidos no dataModel (nome, email, telefone, empresa, mensagem, created_at, source, utm_params).
2. **Gerar migração** — Criar migração Alembic para a tabela de leads com índices em email e created_at.
3. **Criar schemas Pydantic** — Implementar `app/schemas/lead.py` com LeadCreate (input), LeadResponse (output), LeadListResponse (paginado), com validações de email, telefone e campos obrigatórios.
4. **Implementar POST /api/leads** — Endpoint público para captação: validar input, sanitizar dados, salvar no DB, retornar confirmação. Adicionar rate limiting (ex: 5 req/min por IP).
5. **Implementar GET /api/admin/leads** — Endpoint autenticado com paginação (page, per_page), filtros (date range, search by email/name) e ordenação (created_at desc).
6. **Implementar GET /api/admin/leads/export** — Endpoint autenticado que gera CSV com UTF-8 BOM para compatibilidade com Excel, incluindo todos os campos e filtros aplicados.
7. **Implementar DELETE /api/admin/leads/{id}** — Endpoint autenticado para exclusão individual de lead com soft-delete ou hard-delete conforme spec.
8. **Configurar CORS** — Atualizar middleware CORS para aceitar requisições do domínio do frontend (origin específico, não wildcard em produção).
9. **Implementar rate limiting** — Adicionar middleware ou dependência de rate limiting para o endpoint público de captação.
10. **Testar endpoints** — Verificar cada endpoint via `/docs` (Swagger UI): criar lead, listar, exportar, deletar. Validar erros de input e autenticação.
11. **Gerar apiDocs** — Documentar todos os endpoints com schemas, exemplos de request/response, códigos de erro e rate limits.

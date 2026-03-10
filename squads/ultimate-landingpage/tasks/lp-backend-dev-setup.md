---
task: setupBackendProject()
responsavel: "Forge"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: backendSpec
    tipo: file
    obrigatorio: true
    descricao: "Especificação da interface backend — endpoints, modelos, autenticação (source: specBackendInterface())"
  - nome: scopeDefinition
    tipo: file
    obrigatorio: true
    descricao: "Definição de escopo com flag backend=true habilitada (source: defineScope())"

Saida:
  - nome: backendProject
    tipo: file
    obrigatorio: true
    descricao: "Projeto Python/FastAPI inicializado com infraestrutura configurada (destination: createLeadEndpoints())"
  - nome: backendConfig
    tipo: object
    obrigatorio: true
    descricao: "Configurações do backend — porta, base URL, DB connection, scripts (destination: lp-integrator)"

Checklist:
  pre-conditions:
    - "[ ] backendSpec existe com endpoints e modelos definidos"
    - "[ ] scopeDefinition tem backend=true"
  post-conditions:
    - "[ ] Python 3.12+ projeto inicializado com pyproject.toml"
    - "[ ] FastAPI app criado com roteamento configurado"
    - "[ ] SQLAlchemy 2.0 configurado com async engine"
    - "[ ] Alembic configurado para migrações"
    - "[ ] Pydantic v2 Settings para configuração via env vars"
    - "[ ] Estrutura de diretórios criada (app/api, app/models, app/schemas, app/services)"
    - "[ ] Migração inicial criada e aplicada"
    - "[ ] Servidor inicia sem erros com uvicorn"

Performance:
  duration_expected: "10 minutes"
  cacheable: true
  parallelizable: false

Error_Handling:
  - erro: "Python/pip install falha (dependência não encontrada)"
    estrategia: "retry (max 2) com limpeza de cache pip e versões alternativas"
    fallback: "Instalar dependências mínimas e documentar falhas"
  - erro: "Conexão com banco de dados falha"
    estrategia: "Verificar DATABASE_URL, credenciais e acessibilidade do servidor DB"
    fallback: "Usar SQLite como banco local para desenvolvimento e documentar"
  - erro: "Alembic migration falha"
    estrategia: "retry (max 2) verificando target_metadata e env.py"
    fallback: "Criar tabelas manualmente via SQLAlchemy e documentar"
  - erro: "uvicorn não inicia (porta em uso ou erro de import)"
    estrategia: "Trocar porta e verificar imports no main.py"
    fallback: "Reportar erro específico ao orquestrador"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# setupBackendProject()

## Pipeline Diagram

```
┌──────────────────┐
│ backendSpec      │───┐
│ (file)           │   │     ┌───────────────────────┐     ┌─────────────────────┐
│                  │   ├────>│                       │────>│ backendProject      │
└──────────────────┘   │     │  setupBackendProject  │     │ (file)              │
                       │     │  @Forge               │     ├─────────────────────┤
┌──────────────────┐   │     │                       │────>│ backendConfig       │
│ scopeDefinition  │───┘     │  CONDITIONAL:         │     │ (object)            │
│ (file)           │         │  backend=true         │     └─────────────────────┘
└──────────────────┘         └───────────────────────┘            │
                                                                  ▼
                                                     ┌────────────────────────┐
                                                     │ createLeadEndpoints()  │
                                                     │ lp-integrator          │
                                                     └────────────────────────┘

⚠ CONDITIONAL — Executada somente se scopeDefinition.backend = true
```

## Descrição

A task `setupBackendProject()` estabelece a fundação técnica do backend da landing page. O agente **Forge** inicializa um projeto Python moderno com FastAPI, configura SQLAlchemy 2.0 com suporte async, Alembic para migrações de banco de dados e Pydantic v2 para validação e configuração.

Esta é uma task **condicional** — só é executada quando o escopo do projeto inclui backend (`backend=true`). Projetos puramente estáticos (sem captação de leads ou admin) não ativam esta task. O backendConfig exportado permite que o integrador conecte frontend e backend.

## Passos

1. **Verificar condicionalidade** — Confirmar que `scopeDefinition.backend = true`. Se false, skip a task inteira.
2. **Inicializar projeto Python** — Criar estrutura com `pyproject.toml`, configurar dependências (fastapi, uvicorn, sqlalchemy, alembic, pydantic, python-jose, passlib, python-multipart).
3. **Criar estrutura de diretórios** — Organizar em `app/api/` (routers), `app/models/` (SQLAlchemy), `app/schemas/` (Pydantic), `app/services/` (lógica de negócio), `app/core/` (config, security, database).
4. **Configurar FastAPI app** — Criar `app/main.py` com CORS middleware, router includes, lifespan events para conexão DB.
5. **Configurar SQLAlchemy 2.0** — Criar engine async, SessionLocal, Base declarativa em `app/core/database.py`.
6. **Configurar Alembic** — Inicializar Alembic com `alembic init`, configurar `env.py` para usar async e target_metadata do SQLAlchemy.
7. **Configurar Pydantic Settings** — Criar `app/core/config.py` com Settings class lendo de `.env` (DATABASE_URL, SECRET_KEY, CORS_ORIGINS, etc.).
8. **Criar migração inicial** — Gerar e aplicar a primeira migração com o schema base.
9. **Testar setup** — Executar `uvicorn app.main:app --reload` e verificar que a API inicia, `/docs` é acessível e a conexão com DB funciona.
10. **Exportar backendConfig** — Documentar porta, base URL, connection string (template), scripts e endpoints de health check.

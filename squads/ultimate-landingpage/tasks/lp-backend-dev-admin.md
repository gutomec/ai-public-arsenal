---
task: buildAdminPanel()
responsavel: "Forge"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: leadsApi
    tipo: file
    obrigatorio: true
    descricao: "API de leads completa e funcional com todos os endpoints (source: createLeadEndpoints())"
  - nome: scopeDefinition
    tipo: file
    obrigatorio: true
    descricao: "Definição de escopo com flags backend=true e admin_panel=true (source: defineScope())"

Saida:
  - nome: adminPanel
    tipo: file
    obrigatorio: true
    descricao: "Painel administrativo completo com autenticação, dashboard e gestão de leads (destination: lp-reviewer)"
  - nome: adminAuth
    tipo: file
    obrigatorio: true
    descricao: "Sistema de autenticação do admin — JWT, login, middleware (destination: lp-integrator)"

Checklist:
  pre-conditions:
    - "[ ] leadsApi existe com endpoints funcionais"
    - "[ ] scopeDefinition tem backend=true E admin_panel=true"
  post-conditions:
    - "[ ] Página de login com autenticação JWT funcional"
    - "[ ] Dashboard com contagem e estatísticas de leads"
    - "[ ] Tabela de leads com paginação, busca e filtro"
    - "[ ] Botão de exportação CSV funcional"
    - "[ ] Visualização individual de lead com todos os campos"
    - "[ ] Exclusão de lead com diálogo de confirmação"
    - "[ ] Senhas hasheadas com bcrypt"
    - "[ ] Tokens JWT com expiração configurada"

Performance:
  duration_expected: "25 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "JWT token generation falha (SECRET_KEY ausente)"
    estrategia: "Verificar variáveis de ambiente e gerar SECRET_KEY se ausente"
    fallback: "Gerar chave temporária para dev e documentar para configuração"
  - erro: "bcrypt hashing falha (dependência de sistema ausente)"
    estrategia: "retry (max 2) instalando dependência do sistema operacional"
    fallback: "Usar passlib com argon2 como algoritmo alternativo"
  - erro: "Rota admin acessível sem autenticação"
    estrategia: "Verificar middleware de auth e order dos routers"
    fallback: "Adicionar guard explícito em cada endpoint e documentar"
  - erro: "Dashboard não carrega estatísticas do banco"
    estrategia: "Verificar queries e conexão com banco"
    fallback: "Exibir contadores zerados com mensagem de erro amigável"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# buildAdminPanel()

## Pipeline Diagram

```
┌──────────────────┐
│ leadsApi         │───┐
│ (file)           │   │     ┌──────────────────────┐     ┌──────────────────┐
│                  │   ├────>│                      │────>│ adminPanel       │
└──────────────────┘   │     │  buildAdminPanel     │     │ (file)           │
                       │     │  @Forge              │     ├──────────────────┤
┌──────────────────┐   │     │                      │────>│ adminAuth        │
│ scopeDefinition  │───┘     │  CONDITIONAL:        │     │ (file)           │
│ (file)           │         │  backend=true AND    │     └──────────────────┘
└──────────────────┘         │  admin_panel=true    │            │
                             └──────────────────────┘            ▼
                                                      ┌──────────────────┐
                                                      │ lp-reviewer      │
                                                      │ lp-integrator    │
                                                      └──────────────────┘

Telas do Admin Panel:
  /admin/login      → Login com JWT
  /admin/dashboard  → Estatísticas de leads
  /admin/leads      → Tabela paginada com busca/filtro
  /admin/leads/:id  → Detalhe individual do lead
  [Export CSV]      → Download via API

⚠ CONDITIONAL — Executada somente se backend=true AND admin_panel=true
```

## Descrição

A task `buildAdminPanel()` cria o painel administrativo completo para gestão dos leads captados pela landing page. O agente **Forge** implementa autenticação JWT, dashboard com estatísticas, tabela de leads com funcionalidades de busca/filtro/paginação, exportação CSV e gestão individual de leads.

Esta é uma task **duplamente condicional** — requer tanto `backend=true` quanto `admin_panel=true` no escopo. É a última peça do backend, consumindo a API de leads já funcional para apresentar uma interface de gestão ao administrador do site.

## Passos

1. **Verificar condicionalidade** — Confirmar que `scopeDefinition.backend = true` E `scopeDefinition.admin_panel = true`. Se qualquer flag for false, skip a task.
2. **Implementar sistema de autenticação** — Criar modelo User com email e password hash (bcrypt), endpoint `POST /api/auth/login` retornando JWT, middleware de verificação de token.
3. **Configurar JWT** — Definir SECRET_KEY, algoritmo (HS256), expiração (configurable via env), refresh token strategy.
4. **Criar seed de admin** — Script para criar o primeiro usuário admin via CLI ou migration (`python -m app.cli create-admin`).
5. **Implementar página de login** — Formulário com email/senha, validação client-side, feedback de erro, redirect para dashboard após login.
6. **Implementar dashboard** — Página com cards de estatísticas: total de leads, leads hoje, leads esta semana, leads este mês. Gráfico simples de leads por dia (últimos 30 dias).
7. **Implementar tabela de leads** — Tabela com colunas: nome, email, empresa, data, status. Paginação server-side, busca por texto, filtro por data range.
8. **Implementar detalhe do lead** — Página com todos os campos do lead, incluindo UTM parameters, timestamp de criação, e IP de origem (se captado).
9. **Implementar exportação CSV** — Botão que dispara download via `GET /api/admin/leads/export` com os filtros ativos aplicados.
10. **Implementar exclusão de lead** — Botão de delete com diálogo de confirmação modal, chamada ao endpoint `DELETE /api/admin/leads/{id}`, feedback de sucesso/erro.
11. **Proteger rotas** — Middleware que redireciona para login se token ausente/expirado em todas as rotas `/admin/*` exceto `/admin/login`.
12. **Testar fluxo completo** — Login → dashboard → listar leads → buscar → filtrar → exportar CSV → ver detalhe → deletar lead → logout.

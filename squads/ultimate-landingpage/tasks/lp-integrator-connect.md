---
task: connectFrontendBackend()
responsavel: "Bridge"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: landingPage
    tipo: file
    obrigatorio: true
    descricao: "Landing page montada com todos os componentes (source: assemblePage())"
  - nome: leadsApi
    tipo: file
    obrigatorio: true
    descricao: "Endpoints de captura de leads implementados (source: createLeadEndpoints())"
  - nome: backendConfig
    tipo: object
    obrigatorio: true
    descricao: "Configuração do projeto backend — URL, porta, framework (source: setupBackendProject())"

Saida:
  - nome: apiClient
    tipo: file
    obrigatorio: true
    descricao: "Client TypeScript para comunicação com a API backend em src/lib/api.ts (destination: lp-reviewer)"
  - nome: envConfig
    tipo: file
    obrigatorio: true
    descricao: "Arquivos de configuração de variáveis de ambiente para frontend e backend (destination: lp-reviewer)"
  - nome: connectionTestReport
    tipo: file
    obrigatorio: true
    descricao: "Relatório de teste de conexão frontend↔backend (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] Projeto frontend existe e está em execução"
    - "[ ] Projeto backend existe e está em execução"
    - "[ ] leadsApi foi gerado por createLeadEndpoints()"
    - "[ ] backendConfig contém URL e porta do backend"
  post-conditions:
    - "[ ] API client TypeScript (fetch wrapper) criado em src/lib/api.ts"
    - "[ ] CORS configurado no backend para a URL do frontend"
    - "[ ] Variáveis de ambiente configuradas (.env.local para frontend com NEXT_PUBLIC_API_URL, .env para backend)"
    - "[ ] Submissão de formulário funcionando end-to-end"
    - "[ ] Tratamento de erros com mensagens amigáveis ao usuário"
    - "[ ] Backup em localStorage quando backend estiver offline"

Performance:
  duration_expected: "18 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "CORS bloqueia requisições do frontend para o backend"
    estrategia: "Verificar ALLOWED_ORIGINS e reconfiguar middleware CORS"
    fallback: "Adicionar origin do frontend explicitamente e reiniciar backend"
  - erro: "Backend offline durante teste de conexão"
    estrategia: "retry (max 2) verificando se uvicorn está rodando"
    fallback: "Ativar fallback localStorage no frontend e documentar"
  - erro: "API client TypeScript com tipos incorretos"
    estrategia: "Regenerar tipos a partir do OpenAPI schema do backend"
    fallback: "Usar tipos any temporariamente e documentar para correção"
  - erro: "Submissão de formulário retorna 500 (erro interno do backend)"
    estrategia: "Analisar logs do backend, corrigir e retry"
    fallback: "Ativar backup localStorage e reportar erro ao lp-backend-dev"
  - erro: "NEXT_PUBLIC_API_URL não configurada"
    estrategia: "Criar/atualizar .env.local com URL correta"
    fallback: "Usar localhost:8000 como default e documentar"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# connectFrontendBackend()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  landingPage          │──────>│                      │──────>│  apiClient              │
│  (file)               │       │                      │       │  (file)                 │
├───────────────────────┤       │  connectFrontend     │       ├─────────────────────────┤
│  leadsApi             │──────>│  Backend             │──────>│  envConfig              │
│  (file)               │       │  @Bridge             │       │  (file)                 │
├───────────────────────┤       │                      │       ├─────────────────────────┤
│  backendConfig        │──────>│                      │──────>│  connectionTestReport   │
│  (object)             │       └──────────────────────┘       │  (file)                 │
└───────────────────────┘                                      └─────────────────────────┘
                                                                        │
                                                                        ▼
                                                               ┌─────────────────────────┐
                                                               │  lp-reviewer            │
                                                               └─────────────────────────┘
```

## Descrição

A task `connectFrontendBackend()` é **CONDICIONAL** — só é executada quando `scopeDefinition` contém o flag `backend=true`. O agente **Bridge** cria a camada de comunicação entre o frontend (landing page Next.js) e o backend (API Python/FastAPI), garantindo que os formulários da landing page enviem dados corretamente para os endpoints de captura de leads.

A task produz um API client TypeScript tipado, configura CORS no backend, estabelece variáveis de ambiente em ambos os projetos e implementa mecanismos de resiliência como tratamento de erros amigável e backup em localStorage quando o backend estiver indisponível.

## Passos

1. **Verificar pré-condições** — Confirmar que ambos os projetos (frontend e backend) existem e estão em execução, e que `leadsApi` e `backendConfig` estão disponíveis.
2. **Configurar variáveis de ambiente do frontend** — Criar/atualizar `.env.local` com `NEXT_PUBLIC_API_URL` apontando para o backend.
3. **Configurar variáveis de ambiente do backend** — Criar/atualizar `.env` com as variáveis necessárias, incluindo `ALLOWED_ORIGINS` para CORS.
4. **Implementar CORS no backend** — Configurar middleware CORS no FastAPI para aceitar requisições da URL do frontend, com headers e métodos adequados.
5. **Criar API client TypeScript** — Implementar `src/lib/api.ts` com fetch wrapper tipado, incluindo:
   - Métodos para cada endpoint do `leadsApi`
   - Tipagem TypeScript para request/response
   - Interceptors para headers (Content-Type, Authorization se necessário)
   - Timeout configurável
6. **Implementar tratamento de erros** — Adicionar lógica de erro que traduz status HTTP em mensagens amigáveis para o usuário (ex: 422 → "Verifique os campos", 500 → "Tente novamente").
7. **Implementar fallback localStorage** — Criar mecanismo que detecta falha de conexão com o backend e salva os dados do formulário em localStorage, com retry automático quando a conexão for restaurada.
8. **Conectar formulários da landing page** — Integrar os formulários de captura de lead com o API client, substituindo qualquer lógica mock existente.
9. **Testar conexão end-to-end** — Executar teste completo: preencher formulário → enviar → verificar no backend → gerar `connectionTestReport`.
10. **Gerar outputs** — Disponibilizar `apiClient`, `envConfig` e `connectionTestReport` para o reviewer.

---
task: reviewBackendSecurity()
responsavel: "Shield"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: leadsApi
    tipo: file
    obrigatorio: true
    descricao: "Endpoints de captura de leads implementados (source: createLeadEndpoints())"
  - nome: adminPanel
    tipo: file
    obrigatorio: true
    descricao: "Painel administrativo para gestão de leads (source: buildAdminPanel())"
  - nome: adminAuth
    tipo: file
    obrigatorio: true
    descricao: "Sistema de autenticação e autorização do painel admin (source: buildAdminPanel())"

Saida:
  - nome: backendReview
    tipo: file
    obrigatorio: true
    descricao: "Relatório detalhado de revisão de segurança do backend com issues e sugestões (destination: lp-backend-dev para correções)"
  - nome: backendScore
    tipo: object
    obrigatorio: true
    descricao: "Score numérico de segurança do backend por dimensão (destination: produceFinalReport())"

Checklist:
  pre-conditions:
    - "[ ] Endpoints de backend existem e foram gerados por createLeadEndpoints()"
    - "[ ] Painel admin existe e foi gerado por buildAdminPanel()"
    - "[ ] Sistema de autenticação implementado"
  post-conditions:
    - "[ ] OWASP Top 10 verificado"
    - "[ ] Validação de input verificada (Pydantic)"
    - "[ ] Prevenção de SQL injection verificada (uso de ORM)"
    - "[ ] Autenticação testada (JWT)"
    - "[ ] Autorização testada (endpoints admin-only)"
    - "[ ] Rate limiting em endpoints públicos"
    - "[ ] CORS restritivo configurado"
    - "[ ] Nenhum segredo hardcoded no código"
    - "[ ] Respostas de erro não expõem informações internas"
    - "[ ] Issues categorizados como BLOCKER/WARNING/INFO"

Performance:
  duration_expected: "15 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Código backend inacessível ou não compila"
    estrategia: "retry (max 2) verificando dependências e imports"
    fallback: "Analisar código-fonte estático sem execução e documentar"
  - erro: "adminPanel ou adminAuth ausentes"
    estrategia: "Revisar apenas leadsApi e documentar escopo reduzido"
    fallback: "Marcar review de admin como SKIPPED no relatório"
  - erro: "Segredo hardcoded encontrado em código"
    estrategia: "Documentar como BLOCKER imediato com localização exata"
    fallback: "Sugerir migração para variável de ambiente no relatório"
  - erro: "Endpoint não responde durante teste de segurança"
    estrategia: "retry (max 2) verificando se backend está rodando"
    fallback: "Realizar análise estática do código sem testes de runtime"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com review parcial"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# reviewBackendSecurity()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  leadsApi             │──────>│                      │──────>│  backendReview          │
│  (file)               │       │                      │       │  (file)                 │
├───────────────────────┤       │  reviewBackend       │       ├─────────────────────────┤
│  adminPanel           │──────>│  Security            │──────>│  backendScore           │
│  (file)               │       │  @Shield             │       │  (object)               │
├───────────────────────┤       │                      │       └─────────────────────────┘
│  adminAuth            │──────>│                      │               │
│  (file)               │       └──────────────────────┘               ├──────────────────┐
└───────────────────────┘                                              ▼                  ▼
                                                               ┌──────────────┐   ┌──────────────┐
                                                               │ lp-backend   │   │ produceFinal │
                                                               │ -dev (fixes) │   │ Report()     │
                                                               └──────────────┘   └──────────────┘
```

## Descrição

A task `reviewBackendSecurity()` é **CONDICIONAL** — só é executada quando `scopeDefinition` contém o flag `backend=true`. O agente **Shield** realiza uma **auditoria de segurança abrangente** do backend, cobrindo o OWASP Top 10, validação de inputs, prevenção de injeção, autenticação, autorização, rate limiting e práticas de segurança em geral.

O review analisa os endpoints da API de leads, o painel administrativo e o sistema de autenticação, verificando que as melhores práticas de segurança foram seguidas e que não existem vulnerabilidades conhecidas no código.

## Passos

1. **Carregar todos os inputs** — Ler `leadsApi`, `adminPanel` e `adminAuth` para contexto completo.
2. **Verificar OWASP Top 10** — Analisar o código contra as 10 vulnerabilidades mais críticas (Injection, Broken Authentication, Sensitive Data Exposure, XXE, Broken Access Control, Security Misconfiguration, XSS, Insecure Deserialization, Using Components with Known Vulnerabilities, Insufficient Logging).
3. **Auditar validação de input** — Verificar que todos os endpoints utilizam Pydantic models para validação de entrada, com tipos corretos, limites de tamanho e sanitização de dados.
4. **Verificar prevenção de SQL injection** — Confirmar uso exclusivo de ORM (SQLAlchemy) para queries ao banco, sem queries SQL raw ou string concatenation.
5. **Testar autenticação JWT** — Verificar implementação do JWT: algoritmo seguro (RS256 ou HS256 com secret forte), expiração configurada, refresh token se aplicável, e armazenamento seguro de tokens.
6. **Testar autorização** — Verificar que endpoints admin-only possuem guards de autorização, que não existem endpoints administrativos acessíveis sem autenticação, e que o princípio de menor privilégio é seguido.
7. **Verificar rate limiting** — Confirmar que endpoints públicos (especialmente `/api/leads`) possuem rate limiting configurado para prevenir abuso e ataques de força bruta.
8. **Auditar CORS** — Verificar que a configuração CORS é restritiva (origins específicas, não wildcard `*`), com métodos e headers limitados ao necessário.
9. **Buscar segredos hardcoded** — Escanear o código em busca de chaves de API, senhas, tokens ou outros segredos que estejam hardcoded ao invés de usar variáveis de ambiente.
10. **Verificar respostas de erro** — Confirmar que mensagens de erro em produção não expõem stack traces, queries SQL, caminhos de arquivos ou outras informações internas.
11. **Categorizar issues** — Classificar cada problema como BLOCKER (vulnerabilidade explorável), WARNING (risco de segurança menor) ou INFO (melhoria de hardening).
12. **Calcular scores** — Computar score por dimensão (OWASP, validação, auth, autorização, configuração) e score geral ponderado.
13. **Gerar outputs** — Produzir `backendReview` com detalhamento completo e `backendScore` com os valores numéricos para o relatório final.

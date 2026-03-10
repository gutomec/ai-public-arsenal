---
task: integrateEmail()
responsavel: "Bridge"
responsavel_type: Agente
atomic_layer: Molecule

Entrada:
  - nome: leadsApi
    tipo: file
    obrigatorio: true
    descricao: "Endpoints de captura de leads implementados (source: createLeadEndpoints())"
  - nome: scopeDefinition
    tipo: file
    obrigatorio: true
    descricao: "Definição de escopo com flags condicionais (source: defineScope())"

Saida:
  - nome: emailIntegration
    tipo: file
    obrigatorio: true
    descricao: "Módulo de integração com serviço de email via SMTP (destination: lp-reviewer)"
  - nome: emailTemplates
    tipo: array<file>
    obrigatorio: true
    descricao: "Templates de email criados — admin-notification e lead-confirmation (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] leadsApi existe e foi gerado por createLeadEndpoints()"
    - "[ ] scopeDefinition contém email=true"
    - "[ ] SMTP ou email MCP disponível e configurado"
  post-conditions:
    - "[ ] Notificação por email ao admin ao receber novo lead"
    - "[ ] Email de confirmação enviado ao lead"
    - "[ ] Templates de email criados (admin-notification, lead-confirmation)"
    - "[ ] Variáveis de ambiente documentadas (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, FROM_EMAIL)"
    - "[ ] Fallback para log em banco de dados quando SMTP falhar"

Performance:
  duration_expected: "12 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Conexão SMTP falha (host inacessível ou credenciais inválidas)"
    estrategia: "retry (max 2) verificando SMTP_HOST, porta e credenciais"
    fallback: "Ativar fallback para log em banco de dados e notificar admin"
  - erro: "Email rejeitado pelo servidor (spam filter ou FROM_EMAIL inválido)"
    estrategia: "Verificar configuração SPF/DKIM e alterar remetente"
    fallback: "Registrar email pendente no banco para reenvio manual"
  - erro: "Template HTML de email renderiza incorretamente"
    estrategia: "retry (max 2) simplificando HTML (inline CSS, tabelas)"
    fallback: "Enviar versão plain text do email"
  - erro: "Variáveis de ambiente SMTP não configuradas"
    estrategia: "abort + solicitar configuração das variáveis"
    fallback: "Documentar variáveis necessárias e reportar ao orquestrador"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# integrateEmail()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  leadsApi             │──────>│                      │──────>│  emailIntegration       │
│  (file)               │       │                      │       │  (file)                 │
├───────────────────────┤       │  integrateEmail      │       ├─────────────────────────┤
│  scopeDefinition      │──────>│  @Bridge             │──────>│  emailTemplates         │
│  (file)               │       │                      │       │  (array<file>)          │
└───────────────────────┘       └──────────────────────┘       └─────────────────────────┘
                                                                        │
                                                                        ▼
                                                               ┌─────────────────────────┐
                                                               │  lp-reviewer            │
                                                               └─────────────────────────┘
```

## Descrição

A task `integrateEmail()` é **CONDICIONAL** — só é executada quando `scopeDefinition` contém o flag `email=true`. O agente **Bridge** conecta o sistema de captura de leads a um serviço de email via SMTP, permitindo notificações automáticas por email tanto para o administrador quanto para o lead.

A integração cria dois fluxos de email: uma notificação ao admin quando um novo lead é capturado (contendo os dados do lead), e um email de confirmação para o lead (agradecendo o contato e informando próximos passos). Templates HTML são criados para ambos os cenários, e um fallback para banco de dados garante que nenhuma notificação seja perdida em caso de falha do SMTP.

## Passos

1. **Verificar pré-condições** — Confirmar que `leadsApi` existe, que `scopeDefinition` tem `email=true` e que o serviço SMTP está acessível.
2. **Configurar variáveis de ambiente** — Documentar e validar as variáveis `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` e `FROM_EMAIL` no arquivo `.env`.
3. **Criar módulo de integração** — Implementar o client SMTP com métodos para envio de email, suporte a templates HTML e tratamento de erros de conexão.
4. **Criar template admin-notification** — Desenvolver template HTML para notificação ao admin contendo: dados do lead, timestamp, origem e link para painel admin (se disponível).
5. **Criar template lead-confirmation** — Desenvolver template HTML para confirmação ao lead contendo: agradecimento personalizado, resumo do que foi enviado e expectativa de retorno.
6. **Implementar fallback para banco de dados** — Adicionar lógica que detecta falha no envio SMTP e registra os emails pendentes no banco de dados para reenvio posterior.
7. **Conectar ao leadsApi** — Integrar o fluxo de captura de leads com o disparo automático dos dois emails (admin e lead).
8. **Testar integração end-to-end** — Validar o fluxo completo: lead capturado → emails enviados → fallback funcional quando SMTP indisponível.
9. **Gerar outputs** — Disponibilizar `emailIntegration` e `emailTemplates` para o reviewer.

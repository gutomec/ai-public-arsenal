---
task: reviewIntegrations()
responsavel: "Shield"
responsavel_type: Agente
atomic_layer: Organism

Entrada:
  - nome: whatsappIntegration
    tipo: file
    obrigatorio: false
    descricao: "Módulo de integração com WhatsApp (source: integrateWhatsApp())"
  - nome: emailIntegration
    tipo: file
    obrigatorio: false
    descricao: "Módulo de integração com email (source: integrateEmail())"
  - nome: connectionTestReport
    tipo: file
    obrigatorio: false
    descricao: "Relatório de teste de conexão frontend↔backend (source: connectFrontendBackend())"
  - nome: apiClient
    tipo: file
    obrigatorio: false
    descricao: "Client TypeScript para comunicação com a API (source: connectFrontendBackend())"

Saida:
  - nome: integrationReview
    tipo: file
    obrigatorio: true
    descricao: "Relatório detalhado de revisão das integrações com issues e sugestões (destination: lp-integrator para correções)"
  - nome: integrationScore
    tipo: object
    obrigatorio: true
    descricao: "Score numérico de qualidade das integrações por dimensão (destination: produceFinalReport())"

Checklist:
  pre-conditions:
    - "[ ] Pelo menos uma integração existe para revisão"
  post-conditions:
    - "[ ] Cada integração ativa testada end-to-end"
    - "[ ] Entrega de mensagem WhatsApp verificada (se ativo)"
    - "[ ] Entrega de email verificada (se ativo)"
    - "[ ] Submissão de formulário frontend→backend verificada (se ativo)"
    - "[ ] Fallbacks de erro testados"
    - "[ ] Variáveis de ambiente documentadas e não hardcoded"
    - "[ ] Issues categorizados como BLOCKER/WARNING/INFO"

Performance:
  duration_expected: "12 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Nenhuma integração disponível para revisão"
    estrategia: "abort + verificar scopeDefinition para integrações ativas"
    fallback: "Gerar relatório vazio com nota de escopo sem integrações"
  - erro: "Serviço externo indisponível durante teste (WhatsApp, SMTP)"
    estrategia: "retry (max 2) com intervalo de espera"
    fallback: "Verificar código de fallback e documentar teste como PARTIAL"
  - erro: "connectionTestReport ausente para conexão frontend-backend"
    estrategia: "Executar teste de conexão manualmente durante review"
    fallback: "Analisar código do apiClient e documentar sem teste end-to-end"
  - erro: "Variáveis de ambiente não documentadas em .env.example"
    estrategia: "Documentar como WARNING com lista de variáveis necessárias"
    fallback: "Gerar .env.example sugerido no relatório"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador com review parcial"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# reviewIntegrations()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  whatsappIntegration  │──?──>│                      │──────>│  integrationReview      │
│  (file, optional)     │       │                      │       │  (file)                 │
├───────────────────────┤       │  reviewIntegrations  │       ├─────────────────────────┤
│  emailIntegration     │──?──>│  @Shield             │──────>│  integrationScore       │
│  (file, optional)     │       │                      │       │  (object)               │
├───────────────────────┤       │                      │       └─────────────────────────┘
│  connectionTestReport │──?──>│                      │               │
│  (file, optional)     │       │                      │               ├──────────────────┐
├───────────────────────┤       └──────────────────────┘               ▼                  ▼
│  apiClient            │──?──>                                ┌──────────────┐   ┌──────────────┐
│  (file, optional)     │                                      │ lp-integrator│   │ produceFinal │
└───────────────────────┘                                      │ (para fixes) │   │ Report()     │
                                                               └──────────────┘   └──────────────┘

  ──?──>  = condicional (só se a integração estiver ativa)
```

## Descrição

A task `reviewIntegrations()` é **CONDICIONAL** — só é executada quando pelo menos uma integração está ativa (WhatsApp, email ou conexão frontend↔backend). O agente **Shield** realiza uma **auditoria de qualidade e confiabilidade** de todas as integrações ativas, testando cada uma end-to-end e verificando que os mecanismos de fallback funcionam corretamente.

O review é adaptativo: analisa apenas as integrações que foram efetivamente implementadas, sem penalizar o score por integrações que não fazem parte do escopo. Cada integração ativa é testada em seu fluxo completo, incluindo cenários de sucesso e de falha.

## Passos

1. **Detectar integrações ativas** — Verificar quais inputs foram fornecidos para determinar quais integrações existem: WhatsApp (`whatsappIntegration`), email (`emailIntegration`), frontend↔backend (`connectionTestReport` + `apiClient`).
2. **Revisar integração WhatsApp (se ativa)** — Verificar:
   - Webhook `POST /webhook/whatsapp` responde corretamente
   - Templates de mensagem (welcome, follow-up) estão configurados
   - Envio de mensagem funciona end-to-end
   - Fallback para banco de dados opera quando Evolution API indisponível
   - Variáveis de ambiente (`EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE_NAME`) documentadas e não hardcoded
3. **Revisar integração email (se ativa)** — Verificar:
   - Email de notificação ao admin é enviado ao capturar lead
   - Email de confirmação ao lead é enviado corretamente
   - Templates HTML renderizam adequadamente
   - Fallback para banco de dados opera quando SMTP falha
   - Variáveis de ambiente (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `FROM_EMAIL`) documentadas e não hardcoded
4. **Revisar conexão frontend↔backend (se ativa)** — Verificar:
   - API client TypeScript está tipado e funcional
   - CORS configurado restritivamente
   - Submissão de formulário funciona end-to-end
   - Tratamento de erros apresenta mensagens amigáveis
   - Fallback localStorage opera quando backend indisponível
   - Variáveis de ambiente (`NEXT_PUBLIC_API_URL`) configuradas
5. **Testar cenários de falha** — Para cada integração, simular indisponibilidade do serviço externo e verificar que o fallback opera conforme esperado.
6. **Verificar documentação de env vars** — Confirmar que todas as variáveis de ambiente estão documentadas em `.env.example` e que nenhuma está hardcoded no código.
7. **Categorizar issues** — Classificar cada problema como BLOCKER (integração quebrada ou insegura), WARNING (fallback incompleto ou documentação ausente) ou INFO (otimização sugerida).
8. **Calcular scores** — Computar score por integração ativa e score geral ponderado (apenas integrações ativas contam).
9. **Gerar outputs** — Produzir `integrationReview` com detalhamento completo e `integrationScore` com os valores numéricos para o relatório final.

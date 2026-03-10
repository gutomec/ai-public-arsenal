---
task: integrateWhatsApp()
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
  - nome: whatsappIntegration
    tipo: file
    obrigatorio: true
    descricao: "Módulo de integração com WhatsApp via Evolution API (destination: lp-reviewer)"
  - nome: webhookConfig
    tipo: object
    obrigatorio: true
    descricao: "Configuração do webhook para recebimento de mensagens WhatsApp (destination: lp-reviewer)"

Checklist:
  pre-conditions:
    - "[ ] leadsApi existe e foi gerado por createLeadEndpoints()"
    - "[ ] scopeDefinition contém whatsapp=true"
    - "[ ] Instância do Evolution API disponível e acessível"
  post-conditions:
    - "[ ] Webhook endpoint POST /webhook/whatsapp criado e funcional"
    - "[ ] Templates de mensagem configurados (welcome, follow-up)"
    - "[ ] Variáveis de ambiente documentadas (EVOLUTION_API_URL, EVOLUTION_API_KEY, EVOLUTION_INSTANCE_NAME)"
    - "[ ] Fallback para log em banco de dados quando Evolution API estiver offline"

Performance:
  duration_expected: "15 minutes"
  cacheable: false
  parallelizable: false

Error_Handling:
  - erro: "Evolution API inacessível ou URL inválida"
    estrategia: "retry (max 2) com verificação de conectividade"
    fallback: "Ativar fallback para log em banco de dados e notificar admin"
  - erro: "EVOLUTION_API_KEY inválida ou expirada"
    estrategia: "Verificar credenciais no .env e solicitar nova chave"
    fallback: "Desabilitar envio WhatsApp e ativar log para reenvio posterior"
  - erro: "Webhook WhatsApp não recebe eventos"
    estrategia: "Verificar URL do webhook, firewall e configuração da instância"
    fallback: "Documentar configuração necessária e registrar para setup manual"
  - erro: "Template de mensagem rejeitado pela API"
    estrategia: "retry (max 2) com template simplificado"
    fallback: "Enviar mensagem plain text sem template"
  - erro: "timeout_exceeded"
    estrategia: "abort + notify"
    fallback: "Reportar ao orquestrador"
  notificacao: "Erros blocking → orquestrador imediatamente. Warnings → log para revisão."
---

# integrateWhatsApp()

## Pipeline Diagram

```
┌───────────────────────┐       ┌──────────────────────┐       ┌─────────────────────────┐
│  leadsApi             │──────>│                      │──────>│  whatsappIntegration    │
│  (file)               │       │                      │       │  (file)                 │
├───────────────────────┤       │  integrateWhatsApp   │       ├─────────────────────────┤
│  scopeDefinition      │──────>│  @Bridge             │──────>│  webhookConfig          │
│  (file)               │       │                      │       │  (object)               │
└───────────────────────┘       └──────────────────────┘       └─────────────────────────┘
                                                                        │
                                                                        ▼
                                                               ┌─────────────────────────┐
                                                               │  lp-reviewer            │
                                                               └─────────────────────────┘
```

## Descrição

A task `integrateWhatsApp()` é **CONDICIONAL** — só é executada quando `scopeDefinition` contém o flag `whatsapp=true`. O agente **Bridge** conecta o sistema de captura de leads à API do WhatsApp via Evolution API, permitindo notificações automáticas e interação com leads pelo WhatsApp.

A integração cria um webhook para receber mensagens, configura templates de mensagem (boas-vindas e follow-up) e implementa um mecanismo de fallback que registra as mensagens no banco de dados quando a Evolution API estiver indisponível, garantindo que nenhum lead seja perdido.

## Passos

1. **Verificar pré-condições** — Confirmar que `leadsApi` existe, que `scopeDefinition` tem `whatsapp=true` e que a instância do Evolution API está acessível.
2. **Configurar variáveis de ambiente** — Documentar e validar as variáveis `EVOLUTION_API_URL`, `EVOLUTION_API_KEY` e `EVOLUTION_INSTANCE_NAME` no arquivo `.env`.
3. **Criar módulo de integração** — Implementar o client para comunicação com a Evolution API, incluindo métodos para envio de mensagens e gerenciamento de instância.
4. **Implementar webhook endpoint** — Criar endpoint `POST /webhook/whatsapp` para recebimento de mensagens e eventos do WhatsApp.
5. **Configurar templates de mensagem** — Criar templates de `welcome` (enviado ao primeiro contato do lead) e `follow-up` (enviado após período configurável sem resposta).
6. **Implementar fallback para banco de dados** — Adicionar lógica que detecta indisponibilidade da Evolution API e registra as mensagens pendentes no banco de dados para reenvio posterior.
7. **Conectar ao leadsApi** — Integrar o fluxo de captura de leads com o envio automático da mensagem de boas-vindas via WhatsApp.
8. **Testar integração end-to-end** — Validar o fluxo completo: lead capturado → mensagem enviada → webhook recebe resposta → fallback funcional.
9. **Gerar outputs** — Disponibilizar `whatsappIntegration` e `webhookConfig` para o reviewer.

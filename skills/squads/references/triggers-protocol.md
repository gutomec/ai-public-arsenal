# Triggers Protocol — Squad Lifecycle Events

## O que são Triggers

Triggers são notificações de lifecycle que o Squad Manager emite quando squads, agentes e tasks iniciam e terminam. São **opt-in** por squad via `squad.yaml` — squads sem a seção `triggers` ou com `triggers.enabled: false` não emitem nenhum trigger.

## Configuração no squad.yaml

```yaml
triggers:
  enabled: true                    # false ou ausente = desabilitado
  display: inline                  # inline | log | both
  metrics: context-delta           # context-delta | char-estimate | both
  events:
    squad: true                    # trigger no start/end do squad
    agent: true                    # trigger no start/end de cada agent
    task: true                     # trigger no start/end de cada task
  logPath: ".aios/squad-triggers/" # path para log file (se display=log|both)
```

### Valores de `display`

| Valor | Comportamento |
|-------|---------------|
| `inline` | Emite triggers diretamente no chat (default) |
| `log` | Grava triggers em arquivo JSONL no `logPath`, sem output no chat |
| `both` | Emite no chat E grava em arquivo |

### Valores de `metrics`

| Valor | Comportamento |
|-------|---------------|
| `context-delta` | Calcula % de contexto usado (start vs end) |
| `char-estimate` | Estima caracteres processados |
| `both` | Ambas as métricas |

### Valores de `events`

Cada tipo de evento pode ser habilitado/desabilitado individualmente:

- `squad`: Triggers quando o squad é ativado/desativado
- `agent`: Triggers quando um agent inicia/finaliza
- `task`: Triggers quando um `*command` é executado/completado

## Formato de Output

### Squad Start Trigger

```
🚀 [SQUAD:{prefix}] {squad-name} v{version} ativado
   Agent: {icon} {agent-name} ({agent-id})
   Missão: {agent-title}
   Início: {timestamp}
```

### Task Start Trigger

```
⚡ [TASK:{prefix}] *{command} iniciado
   Agent: {agent-id}
   Descrição: {command-description}
```

### Task End Trigger

```
✅ [TASK:{prefix}] {agent-name} completou *{command}
   Duração: {duration}
   Contexto usado: {delta}%
   Timestamp: {end-time}
```

### Squad End Trigger

```
🏁 [SQUAD:{prefix}] {squad-name} sessão encerrada
   Duração total: {total-duration}
   Tasks executadas: {count}
   Timestamp: {end-time}
```

## Como o Squad Manager Executa Triggers

Quando um usuário ativa um squad agent via `/SQUADS:{name}:{agent}`:

1. **Ler `squad.yaml`** do squad ativado
2. **Verificar `triggers.enabled === true`** — se `false` ou ausente, pular todos os triggers
3. **Verificar `events`** — emitir apenas os tipos habilitados
4. **No início da ativação:**
   - Registrar timestamp de início
   - Se `events.squad: true` → emitir Squad Start Trigger
   - Se `events.agent: true` → emitir Agent info no trigger
5. **No início de cada `*command`:**
   - Se `events.task: true` → emitir Task Start Trigger
   - Registrar timestamp de início da task
6. **Ao final de cada `*command`:**
   - Se `events.task: true` → emitir Task End Trigger com duração
   - Calcular métricas conforme `metrics` configurado
7. **Ao final da sessão:**
   - Se `events.squad: true` → emitir Squad End Trigger
8. **Se `display: log` ou `display: both`:**
   - Gravar cada trigger como linha JSONL no `logPath`

### Formato JSONL (para log)

```json
{"type":"squad-start","squad":"my-squad","prefix":"ms","version":"1.0.0","agent":"ms-leader","timestamp":"2026-03-08T10:00:00Z"}
{"type":"task-start","squad":"my-squad","prefix":"ms","agent":"ms-leader","command":"plan-work","timestamp":"2026-03-08T10:00:05Z"}
{"type":"task-end","squad":"my-squad","prefix":"ms","agent":"ms-leader","command":"plan-work","duration":"2m 15s","contextDelta":"12%","timestamp":"2026-03-08T10:02:20Z"}
{"type":"squad-end","squad":"my-squad","prefix":"ms","totalDuration":"5m 30s","tasksExecuted":3,"timestamp":"2026-03-08T10:05:30Z"}
```

### Campos de Flow nos Eventos JSONL

Quando `triggers.flow.enabled: true`, os eventos JSONL incluem campos adicionais de delegação:

```json
{"type":"agent-start","squad":"brandcraft","prefix":"bc","agent":"bc-inspector","from":"bc-extractor","to":"bc-templater","handoff":"brand-assets.json","progress":"2/6","timestamp":"2026-03-08T10:02:20Z"}
{"type":"agent-end","squad":"brandcraft","prefix":"bc","agent":"bc-inspector","from":"bc-extractor","to":"bc-templater","duration":"1m 30s","contextDelta":"8%","timestamp":"2026-03-08T10:03:50Z"}
```

| Campo Extra | Tipo | Descrição |
|-------------|------|-----------|
| `from` | string | Agent que delegou para este (agent anterior no fluxo) |
| `to` | string | Próximo agent que receberá o handoff |
| `handoff` | string | Nome do artefato transferido |
| `progress` | string | Progresso no formato `current/total` |

Esses campos são **opcionais** — só presentes quando flow tracking está habilitado. Eventos de squads sem `triggers.flow` permanecem inalterados.

## Flow Tracking

O Flow Tracker estende os triggers com rastreamento visual de delegação entre agents. Quando habilitado via `triggers.flow` no `squad.yaml`, o Squad Manager emite eventos NDJSON adicionais que alimentam dois renderers: terminal (ASCII) e browser (A2UI).

**Referência completa:** Ver `flow-tracker-protocol.md` para:
- Schema NDJSON dos eventos de flow (`flow-preview`, `flow-transition`, `flow-complete`, `flow-error`, `flow-loop`)
- Terminal renderer (preview, live, summary em ASCII)
- A2UI renderer (custom catalog, createSurface, updateComponents, updateDataModel)
- Algoritmo de construção do grafo a partir do workflow YAML
- Validação cruzada com `Receives From` / `Hands Off To` dos agents

## Métricas Disponíveis

| Métrica | Descrição | Como capturar |
|---------|-----------|---------------|
| Duração | Diff entre timestamp de início e fim | `Date.now()` no start/end |
| Context delta % | Estimativa de contexto consumido | Comparação de prompt size |
| Contagem de tools | Estimativa de tools usadas | Contagem via prompts intermediários |
| Tasks executadas | Número de `*commands` rodados | Incremento por task completada |

## Comandos de Gerenciamento

| Comando | Ação |
|---------|------|
| `*enable-triggers {name}` | Adiciona/habilita `triggers.enabled: true` no `squad.yaml` |
| `*disable-triggers {name}` | Define `triggers.enabled: false` no `squad.yaml` |
| `*show-triggers {name}` | Mostra configuração atual de triggers do squad |
| `*trigger-log {name}` | Mostra histórico de triggers do arquivo JSONL |

# Triggers Protocol — Squad Lifecycle Events (v2 Extended)

Resolve squad source paths by checking `./squads/{name}` first, then `~/squads/{name}`. If both exist, use the workspace-local squad.

## O que são Triggers

Triggers são notificações de lifecycle que o Squad Manager emite quando squads, agentes e tasks iniciam e terminam. São **ON por padrão** — squads sem a seção `triggers` emitem markers normalmente. Para desabilitar, defina `triggers.enabled: false` explicitamente.

## Configuração no squad.yaml

```yaml
triggers:
  enabled: true                    # default: true (omitir = habilitado, false = desabilita)
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
| `inline` | Emite triggers como text markers no output (default) |
| `log` | Grava triggers em arquivo JSONL no `logPath`, sem output no chat |
| `both` | Emite markers no output E grava em arquivo |

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

## Mecanismo de Emissão: Stream Markers

Triggers são emitidos como **HTML comments estruturados** no output de texto do Claude. Isso funciona em qualquer plataforma (terminal, squad-chat, Cursor, etc.) porque está no stdout normal.

### Formato do marker

```
<!-- squad:event {"type":"EVENT_TYPE","squad":"NAME",...} -->
```

**Regras:**
- Sempre uma única linha
- Sempre começa com `<!-- squad:event `
- Sempre termina com ` -->`
- O payload é JSON válido
- Frontends que entendem o formato podem parsear e renderizar UIs ricas
- Frontends que NÃO entendem simplesmente ignoram (é um HTML comment)

### Eventos

#### squad-start
```
<!-- squad:event {"type":"squad-start","squad":"brandcraft","prefix":"bc","version":"1.0.0","agents":["bc-extractor","bc-inspector"]} -->
```

#### agent-start
```
<!-- squad:event {"type":"agent-start","squad":"brandcraft","prefix":"bc","agent":"bc-extractor","icon":"🔍","progress":"1/6"} -->
```

#### agent-end
```
<!-- squad:event {"type":"agent-end","squad":"brandcraft","prefix":"bc","agent":"bc-extractor","duration":"2m 15s"} -->
```

#### task-start
```
<!-- squad:event {"type":"task-start","squad":"brandcraft","prefix":"bc","agent":"bc-extractor","command":"extract-brand"} -->
```

#### task-end
```
<!-- squad:event {"type":"task-end","squad":"brandcraft","prefix":"bc","agent":"bc-extractor","command":"extract-brand","duration":"1m 30s"} -->
```

#### flow-transition
```
<!-- squad:event {"type":"flow-transition","squad":"brandcraft","prefix":"bc","from":"bc-extractor","to":"bc-inspector","handoff":"brand-assets.json","progress":"2/6"} -->
```

#### flow-complete
```
<!-- squad:event {"type":"flow-complete","squad":"brandcraft","prefix":"bc","totalDuration":"13m 45s","agentsExecuted":6,"tasksExecuted":8} -->
```

#### flow-error
```
<!-- squad:event {"type":"flow-error","squad":"brandcraft","prefix":"bc","error":"Review failed","failedAgent":"bc-reviewer"} -->
```

#### squad-end
```
<!-- squad:event {"type":"squad-end","squad":"brandcraft","prefix":"bc","totalDuration":"15m 30s","tasksExecuted":8} -->
```

### v2 Events

#### validation-pass
```
<!-- squad:event {"type":"validation-pass","squad":"brandcraft","prefix":"bc","agent":"bc-extractor","step":0,"schema":"PASS","assertions_passed":2,"assertions_total":2} -->
```

#### validation-fail
```
<!-- squad:event {"type":"validation-fail","squad":"brandcraft","prefix":"bc","agent":"bc-extractor","step":0,"errors":["output.items is undefined"],"retry_count":1,"max_retries":3} -->
```

#### checkpoint-saved
```
<!-- squad:event {"type":"checkpoint-saved","squad":"brandcraft","prefix":"bc","agent":"bc-extractor","step":0,"checkpoint":"step-000-bc-extractor.json","run_id":"550e8400..."} -->
```

#### human-gate-start
```
<!-- squad:event {"type":"human-gate-start","squad":"brandcraft","prefix":"bc","gate_id":"client-review","questions":3} -->
```

#### human-gate-complete
```
<!-- squad:event {"type":"human-gate-complete","squad":"brandcraft","prefix":"bc","gate_id":"client-review","duration":"3m 15s"} -->
```

#### workflow-resumed
```
<!-- squad:event {"type":"workflow-resumed","squad":"brandcraft","prefix":"bc","run_id":"550e8400...","resume_step":3,"total_steps":5} -->
```

#### model-routed
```
<!-- squad:event {"type":"model-routed","squad":"brandcraft","prefix":"bc","agent":"bc-extractor","model":"gemini-3-flash","reason":"model_strategy.workers"} -->
```

### Campos de Flow

Quando `triggers.flow.enabled: true`, os eventos incluem campos adicionais de delegação:

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `from` | string | Agent que delegou para este |
| `to` | string | Próximo agent que receberá o handoff |
| `handoff` | string | Nome do artefato transferido |
| `progress` | string | Progresso no formato `current/total` |

## Fallback: JSONL em Disco

Para uso standalone (terminal sem frontend), o display `log` ou `both` TAMBÉM grava cada trigger como JSONL:

```bash
# Criar diretório e gravar (fallback apenas quando display=log|both)
mkdir -p .aios/squad-triggers/
echo '{"type":"squad-start","squad":"brandcraft","prefix":"bc","timestamp":"2026-03-19T20:00:00Z"}' >> .aios/squad-triggers/brandcraft.jsonl
```

**Stream markers são SEMPRE emitidos quando triggers estão habilitados.** O JSONL é adicional, apenas quando `display: log | both`.

## Como o Squad Manager Executa Triggers

1. **Ler `squad.yaml`** — verificar se `triggers.enabled` é explicitamente `false`. Se ausente ou `true` → emitir
2. **Verificar `events`** — se `events` ausente, emitir todos os tipos. Se presente, emitir apenas os habilitados
3. **No início da ativação:**
   - Registrar timestamp de início
   - Se `events.squad: true` → emitir marker `squad-start`
   - Se `events.agent: true` → emitir marker `agent-start`
4. **No início de cada `*command`:**
   - Se `events.task: true` → emitir marker `task-start`
5. **Ao final de cada `*command`:**
   - Se `events.task: true` → emitir marker `task-end` com duração
6. **Em transições agent→agent:**
   - Se `triggers.flow.enabled: true` → emitir marker `flow-transition`
7. **Ao final do workflow:**
   - Se `triggers.flow.enabled: true` → emitir marker `flow-complete`
8. **Ao final da sessão:**
   - Se `events.squad: true` → emitir marker `squad-end`

## Detecção por Frontends

Frontends como squad-chat podem detectar squad activity de **duas formas complementares**:

### 1. Stream markers (primário)
Parsear `<!-- squad:event {...} -->` do output de texto do Claude. Mais confiável — o Squad Manager emite explicitamente.

### 2. Tool call patterns (inferência)
Detectar padrões de tool calls no stream-json:
- `Read {resolved-squad-root}/X/squad.yaml` → squad ativado
- `Read {resolved-squad-root}/X/agents/*.md` → agent lido
- Sequência de `Read agents/A.md` → `Read agents/B.md` → transição A→B
- `subagent` / `squad_dispatch` → delegação explícita

A combinação das duas abordagens garante cobertura completa — markers dão dados ricos (nomes, versões, progresso), tool patterns dão cobertura mesmo quando markers não são emitidos.

## Métricas Disponíveis

| Métrica | Descrição | Como capturar |
|---------|-----------|---------------|
| Duração | Diff entre timestamp de início e fim | `Date.now()` no start/end |
| Context delta % | Estimativa de contexto consumido | Comparação de prompt size |
| Tasks executadas | Número de `*commands` rodados | Incremento por task completada |

## Comandos de Gerenciamento

| Comando | Ação |
|---------|------|
| `*enable-triggers {name}` | Adiciona/habilita `triggers.enabled: true` no `squad.yaml` |
| `*disable-triggers {name}` | Define `triggers.enabled: false` no `squad.yaml` |
| `*show-triggers {name}` | Mostra configuração atual de triggers do squad |
| `*trigger-log {name}` | Mostra histórico de triggers do arquivo JSONL |
